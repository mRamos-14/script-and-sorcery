# Runs spell programs in real CPython so tools/diff-python.js can compare them
# with the game's interpreter. Reads JSON from argv[1], writes JSON to argv[2].
import io, json, os, random, sys, tempfile, contextlib, shutil

def run_one(p):
    tmp = tempfile.mkdtemp(prefix='spell_')
    old = os.getcwd()
    out = io.StringIO()
    feed = list(p.get('input') or [])
    def fake_input(prompt=''):
        if not feed:
            if prompt:
                out.write(str(prompt) + '\n')
            raise EOFError('EOF when reading a line')
        v = str(feed.pop(0))
        out.write(str(prompt) + v + '\n')
        return v
    def cast(spell, power):
        if not isinstance(power, (int, float)) or isinstance(power, bool):
            raise TypeError("cast() power must be a number")
    err = None
    try:
        for name, text in (p.get('files') or {}).items():
            with open(os.path.join(tmp, name), 'w', newline='') as f:
                f.write(text)
        os.chdir(tmp)
        sys.path.insert(0, tmp)
        for m in [k for k in list(sys.modules) if k in [n[:-3] for n in (p.get('files') or {}) if n.endswith('.py')]]:
            del sys.modules[m]
        sys.argv = list(p.get('argv') or ['spell.py'])
        random.seed(p.get('seed', 2026))
        g = {'__name__': '__main__', 'cast': cast, 'fireball': 'fireball', 'spark': 'spark', 'icebolt': 'icebolt', 'input': fake_input}
        steps = [0]
        def tracer(frame, event, arg):
            if event == 'line' and (frame.f_code.co_filename == 'spell.py' or frame.f_code.co_filename.startswith(tmp)):
                steps[0] += 1
                if steps[0] > 20000:
                    raise TimeoutError('spell ran too long')
            return tracer
        with contextlib.redirect_stdout(out):
            sys.settrace(tracer)
            try:
                code = compile('\n'.join(p['code']) + '\n', 'spell.py', 'exec')
                exec(code, g)
            except SystemExit as e:
                if e.code is not None and not isinstance(e.code, int):
                    print(e.code)
            except BaseException as e:
                err = 'HarnessTimeout' if isinstance(e, TimeoutError) and str(e) == 'spell ran too long' else type(e).__name__
            finally:
                sys.settrace(None)
    finally:
        os.chdir(old)
        if sys.path and sys.path[0] == tmp:
            sys.path.pop(0)
    files = {}
    for name in os.listdir(tmp):
        fp = os.path.join(tmp, name)
        if os.path.isfile(fp) and not name.endswith('.pyc'):
            with open(fp, newline='') as f:
                files[name] = f.read()
    shutil.rmtree(tmp, ignore_errors=True)
    text = out.getvalue()
    lines = text.split('\n')
    if lines and lines[-1] == '':
        lines.pop()
    return {'output': lines if text else [], 'error': err, 'files': files}

def main():
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, encoding='utf8') as f:
        progs = json.load(f)
    res = []
    for p in progs:
        try:
            res.append(run_one(p))
        except Exception as e:
            res.append({'output': [], 'error': 'HarnessError:' + repr(e), 'files': {}})
    with open(dst, 'w', encoding='utf8') as f:
        json.dump(res, f)

if __name__ == '__main__':
    sys.setrecursionlimit(200)
    main()
