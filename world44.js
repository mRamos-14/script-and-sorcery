/* World 44: The Sealed Chambers. Context managers: why `with` exists (cleanup that always
   happens), writing __enter__ and __exit__, what __exit__ learns about errors and how it can
   swallow them, @contextmanager generators, the contextlib shelf (suppress, several managers
   at once) and practical uses: restoring state and all-or-nothing changes.
   Source: our own (PEP 343, the contextlib docs). */
Object.assign(EXTRA.npcs, {
  keld: { name: 'Warden Keld', colors: ['#4a5a6a', '#d9d4c6', '#c98d5f'] },
});
Object.assign(EXTRA.foes, {
  sealghost: { base: 'ghost', name: 'Seal ghost', pal: { F: '#a8c8e0' } },
  lockgolem: { base: 'golem', name: 'Lock golem', pal: { S: '#6a7a8a', G: '#ffd75f' } },
  vaultwarden: { base: 'knight', name: 'The Vault Warden', pal: {} },
});

const DOOR = ['class Door:', '    def __init__(self, name):', '        self.name = name', '    def __enter__(self):', '        print("open", self.name)', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        print("close", self.name)', '        return False'];

const WORLD44 = {
  id: 44, name: 'The Sealed Chambers', topic: 'context managers',
  nodes: [[50, 92], [28, 82], [66, 72], [38, 62], [68, 52], [32, 42], [60, 32], [38, 21], [52, 8]],
  levels: [
    {
      id: '44-1', title: 'Doors that always close', bg: 'dungeon', npc: 'keld', mentor: 'keld', tags: ['withwhy'],
      steps: [
        { type: 'talk', who: 'keld', text: 'Halt, {NAME}. Every chamber here must be sealed after use, even if the visitor is struck down inside. Code has the same duty: close files, release locks, restore settings, whether the work succeeds or crashes.' },
        { type: 'talk', who: 'keld', text: 'try/finally guarantees cleanup, but it is wordy and easy to forget. The with statement packs it up: with open(...) as f: opens, gives you f, and closes it when the block ends, by any route.' },
        { type: 'demo', files: {}, text: 'Closed no matter what. Run it.', code: ['with open("log.txt", "w") as f:', '    f.write("sealed")', 'print(f.closed)', 'try:', '    with open("log.txt") as g:', '        print(g.read())', '        raise ValueError("struck down")', 'except ValueError:', '    print("after the error, closed:", g.closed)'] },
        {
          type: 'predict', files: {}, text: 'The long way round. What will it say?', code: ['f = open("notes.txt", "w")', 'try:', '    f.write("hi")', '    print("written")', 'finally:', '    f.close()', '    print("closed:", f.closed)'],
          explain: 'finally runs after the try block, so the file is closed.',
        },
        {
          type: 'predict', files: {}, text: 'Inside and outside the block. What will it say?', code: ['with open("a.txt", "w") as f:', '    print(f.closed)', 'print(f.closed)'],
          explain: 'Open inside the block, closed as soon as the block ends. The name f still exists.',
        },
        {
          type: 'predict', measure: 'errtype', files: {}, text: 'Using the file after the chamber is sealed. Which error?', code: ['with open("a.txt", "w") as f:', '    f.write("one")', 'f.write("two")'],
          explain: 'Writing to a closed file: ValueError (I/O operation on closed file).',
        },
        {
          type: 'predict', files: {}, text: 'Even a return inside the block closes it. What will it say?', code: ['def first_line(name):', '    with open(name) as f:', '        return f.readline().strip(), f', 'open("map.txt", "w").write("north\\nsouth\\n")', 'line, f = first_line("map.txt")', 'print(line, f.closed)'],
          explain: 'Leaving the block by return still runs the cleanup.',
        },
        {
          type: 'fill', files: {}, text: 'Open the file in a with block.',
          lines: ['[] open("vault.txt", "w") as f:', '    f.write("gold")', 'print(f.closed, open("vault.txt").read())'], chips: ['with', 'try', 'for'], answer: [['with']],
          hints: ['The statement that guarantees cleanup.', 'with open(...) as f:'],
        },
        {
          type: 'write', files: {}, text: 'Using with, write "torch" to a file called room.txt. Then, after the block, print whether the file is closed and what room.txt contains.',
          starter: [], keys: ['with', 'open', '(', ')', '"room.txt"', '"w"', ',', 'as', 'f', ':', 'f.write', '"torch"', 'print', 'f.closed', 'open("room.txt").read()'],
          require: l => (has(l, /^with open/m) ? null : 'Use a with block.'),
          hints: ['with open("room.txt", "w") as f:\n    f.write("torch")', 'print(f.closed, open("room.txt").read())'],
          solution: ['with open("room.txt", "w") as f:', '    f.write("torch")', 'print(f.closed, open("room.txt").read())'],
        },
      ],
      learn: [{ title: 'Why with', code: 'with open(name) as f:\n    ...\n# f is closed here, even after an error', text: 'with guarantees cleanup, like try/finally, in one line.' }],
    },
    {
      id: '44-2', title: 'Building a chamber', bg: 'dungeon', npc: 'keld', mentor: 'keld', tags: ['enterexit'],
      steps: [
        { type: 'talk', who: 'keld', text: 'Any object can guard a with block. It needs two methods. __enter__(self) runs as the block starts; whatever it RETURNS is what as receives. __exit__(self, exc_type, exc, tb) runs as the block ends, always.' },
        { type: 'demo', text: 'A door of our own. Run it.', code: [...DOOR, 'with Door("crypt") as d:', '    print("inside", d.name)', 'print("outside")'] },
        {
          type: 'predict', vars: R => ({ n: R.pick(['armory', 'cellar', 'tower']) }), text: 'What will it say?', code: [...DOOR, 'print("before")', 'with Door("$n"):', '    print("looting")', 'print("after")'],
          explain: '__enter__ prints first, then the block, then __exit__.',
        },
        {
          type: 'predict', text: 'as receives whatever __enter__ returns. What will it say?', code: ['class Lamp:', '    def __enter__(self):', '        return "bright light"', '    def __exit__(self, *exc):', '        print("lamp off")', 'with Lamp() as light:', '    print(light)'],
          explain: '__enter__ returned a string, not the Lamp, so light is that string.',
        },
        {
          type: 'predict', text: 'Two doors in one with. What will it say?', code: [...DOOR, 'with Door("outer") as a, Door("inner") as b:', '    print("between", a.name, b.name)'],
          explain: 'They open left to right and close in reverse: the last opened is the first closed.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'An object with no __enter__. Which error?', code: ['class Box:', '    pass', 'with Box() as b:', '    print("inside")'],
          explain: 'Box does not support the context manager protocol: TypeError.',
        },
        {
          type: 'fill', text: 'What should __enter__ hand to as?',
          lines: ['class Torch:', '    def __init__(self):', '        self.lit = False', '    def __enter__(self):', '        self.lit = True', '        return []', '    def __exit__(self, *exc):', '        self.lit = False', 'with Torch() as t:', '    print("lit:", t.lit)', 'print("lit:", t.lit)'], chips: ['self', 'True', 'Torch'], answer: [['self']],
          hints: ['as should get the torch object itself.', 'return self'],
        },
        {
          type: 'write', text: 'Write a class Chamber with __enter__ printing "enter" and returning self, and __exit__(self, *exc) printing "exit". Use it in a with block that prints "inside".',
          starter: [], keys: ['class', 'Chamber', ':', 'def', '__enter__', '__exit__', '(', ')', 'self', '*exc', ',', 'print', '"enter"', '"exit"', 'return', 'with', 'Chamber()', 'as', 'c', '"inside"'],
          require: l => (has(l, /def __enter__/) && has(l, /def __exit__/) && has(l, /^with /m) ? null : 'Write __enter__ and __exit__, then use a with block.'),
          hints: ['class Chamber:\n    def __enter__(self):\n        print("enter")\n        return self\n    def __exit__(self, *exc):\n        print("exit")', 'with Chamber() as c:\n    print("inside")'],
          solution: ['class Chamber:', '    def __enter__(self):', '        print("enter")', '        return self', '    def __exit__(self, *exc):', '        print("exit")', 'with Chamber() as c:', '    print("inside")'],
        },
      ],
      learn: [{ title: '__enter__ and __exit__', code: 'class Door:\n    def __enter__(self):\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        ...', text: '__enter__\'s return value goes to as. __exit__ always runs at the end.' }],
    },
    {
      id: '44-3', title: 'When things go wrong inside', bg: 'vault', npc: 'keld', mentor: 'keld', tags: ['exitexc'],
      steps: [
        { type: 'talk', who: 'keld', text: 'If the block raises, __exit__ still runs, and it is told what happened: exc_type is the error\'s class, exc the error itself, tb its traceback. When the block ends normally, all three are None.' },
        { type: 'talk', who: 'keld', text: 'Then __exit__ decides: return a true value to SWALLOW the error (the program carries on after the with), or return False/None to let it continue upward. Swallow only errors you truly expect.' },
        { type: 'demo', text: 'What __exit__ sees. Run it.', code: ['class Watch:', '    def __enter__(self):', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        print("exit saw:", exc_type, exc)', '        return False', 'with Watch():', '    print("calm")', 'try:', '    with Watch():', '        raise KeyError("lost key")', 'except KeyError:', '    print("the error went on")'] },
        {
          type: 'predict', text: 'A swallowing door. What will it say?', code: ['class Quiet:', '    def __enter__(self):', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        print("hushed", exc_type.__name__)', '        return True', 'with Quiet():', '    print("start")', '    1 / 0', '    print("never")', 'print("carry on")'],
          explain: 'The block stops at the error, __exit__ swallows it, and the program continues after the with.',
        },
        {
          type: 'predict', vars: R => ({ e: R.pick(['ValueError', 'KeyError']) }), text: 'Swallow only one kind. What will it say?', code: ['class OnlyValue:', '    def __enter__(self):', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        return exc_type is ValueError', 'try:', '    with OnlyValue():', '        raise $e("x")', '    print("swallowed")', 'except Exception as e:', '    print("escaped", type(e).__name__)'],
          explain: '__exit__ returns True only for ValueError.',
        },
        {
          type: 'predict', text: 'Cleanup runs, and the error still travels. What will it say?', code: [...DOOR, 'def explore():', '    with Door("pit"):', '        raise RuntimeError("trap")', 'try:', '    explore()', 'except RuntimeError as e:', '    print("caught", e)'],
          explain: 'The door closes first, then the error reaches the except.',
        },
        {
          type: 'predict', text: 'exc is the error object itself. What will it say?', code: ['class Report:', '    def __enter__(self):', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        if exc is not None:', '            print("report:", exc.args[0])', '        return True', 'with Report():', '    raise ValueError("cracked seal")', 'with Report():', '    pass', 'print("done")'],
          explain: 'The first block reports the error and swallows it; the second has none to report.',
        },
        {
          type: 'fill', text: 'Swallow the ZeroDivisionError, and only that one.',
          lines: ['class SafeMath:', '    def __enter__(self):', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        return exc_type is []', 'with SafeMath():', '    print(10 / 0)', 'print("still standing")'], chips: ['ZeroDivisionError', 'None', 'ValueError'], answer: [['ZeroDivisionError']],
          hints: ['Compare the error class.', 'exc_type is ZeroDivisionError'],
        },
        {
          type: 'write', text: 'Write a class Shield whose __exit__ prints "blocked" plus the error\'s message (exc) and returns True when there is an error. Use it in a with block that raises ValueError("arrow"), then print "safe" after the block.',
          starter: [], keys: ['class', 'Shield', ':', 'def', '__enter__', '__exit__', '(', ')', 'self', 'exc_type', 'exc', 'tb', ',', 'return', 'if', 'is not', 'None', 'print', '"blocked"', 'True', 'with', 'Shield()', 'raise', 'ValueError', '"arrow"', '"safe"'],
          require: l => (has(l, /return True/) && has(l, /raise ValueError/) ? null : 'Return True from __exit__, and raise ValueError("arrow") inside the with.'),
          hints: ['class Shield:\n    def __enter__(self):\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        if exc is not None:\n            print("blocked", exc)\n            return True', 'with Shield():\n    raise ValueError("arrow")\nprint("safe")'],
          solution: ['class Shield:', '    def __enter__(self):', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        if exc is not None:', '            print("blocked", exc)', '            return True', 'with Shield():', '    raise ValueError("arrow")', 'print("safe")'],
        },
      ],
      learn: [{ title: '__exit__ and errors', code: 'def __exit__(self, exc_type, exc, tb):\n    # all None if no error\n    return True   # swallow it\n    return False  # let it travel', text: '__exit__ always runs, sees the error, and decides whether it continues.' }],
    },
    {
      id: '44-4', title: 'Seal ghosts', bg: 'cave', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'sealghost', hp: d0 + 14, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Seal ghosts drift through the walls! $HP HP. A warded chamber strikes when it opens and when it closes.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. The seal must strike on the way out as well.',
          lines: ['class Ward:', '    def __enter__(self):', '        cast(fireball, 6)', '        return self', '    def [](self, *exc):', '        cast(fireball, 8)', 'with Ward():', '    pass'], chips: ['__exit__', '__close__', '__end__'], answer: [['__exit__']],
          goal: { foeDown: true },
          hints: ['The method that runs at the end of the block.', '__exit__'],
        },
        { type: 'talk', who: 'narrator', text: 'The ghost lord wails and the lights go out!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'sealghost', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Write a class Frost whose __enter__ AND __exit__ both cast icebolt with $n. Use it in a with block whose body is pass.',
          starter: [], keys: ['class', 'Frost', ':', 'def', '__enter__', '__exit__', '(', ')', 'self', '*exc', ',', 'cast', 'icebolt', '$n', 'return', 'with', 'Frost()', 'pass'],
          goal: { foeDown: true },
          require: l => (has(l, /^with Frost/m) ? null : 'Use with Frost():'),
          hints: ['class Frost:\n    def __enter__(self):\n        cast(icebolt, $n)\n        return self\n    def __exit__(self, *exc):\n        cast(icebolt, $n)', 'with Frost():\n    pass'],
          solution: ['class Frost:', '    def __enter__(self):', '        cast(icebolt, $n)', '        return self', '    def __exit__(self, *exc):', '        cast(icebolt, $n)', 'with Frost():', '    pass'],
        },
      ],
      learn: [{ title: 'Chambers in battle', code: 'with Ward():\n    pass', text: 'Enter strikes, exit strikes.' }],
    },
    {
      id: '44-5', title: 'Chambers from generators', bg: 'scriptorium', npc: 'keld', mentor: 'keld', tags: ['ctxmgr'],
      steps: [
        { type: 'talk', who: 'keld', text: 'A whole class for two methods is heavy. contextlib.contextmanager turns a GENERATOR into a context manager: the code before yield is the entering, the yielded value goes to as, and the code after yield is the exit.' },
        { type: 'talk', who: 'keld', text: 'One catch: if the block raises, the error appears AT the yield. Wrap the yield in try/finally so the cleanup still happens.' },
        { type: 'demo', text: 'A chamber in one function. Run it.', code: ['from contextlib import contextmanager', '@contextmanager', 'def chamber(name):', '    print("unseal", name)', '    yield name.upper()', '    print("reseal", name)', 'with chamber("crypt") as c:', '    print("inside", c)'] },
        {
          type: 'predict', vars: R => ({ t: R.pick(['b', 'i', 'em']) }), text: 'What will it say?', code: ['from contextlib import contextmanager', '@contextmanager', 'def tag(name):', '    print("<" + name + ">")', '    yield', '    print("</" + name + ">")', 'with tag("$t"):', '    print("text")'],
          explain: 'Before yield, the block, then after yield.',
        },
        {
          type: 'predict', text: 'An error without try/finally. What will it say?', code: ['from contextlib import contextmanager', '@contextmanager', 'def chamber():', '    print("unseal")', '    yield', '    print("reseal")', 'try:', '    with chamber():', '        raise ValueError("trap")', 'except ValueError:', '    print("caught")'],
          explain: 'The error is thrown in at the yield and flies straight out, so "reseal" never runs!',
        },
        {
          type: 'predict', text: 'With try/finally. What will it say?', code: ['from contextlib import contextmanager', '@contextmanager', 'def chamber():', '    print("unseal")', '    try:', '        yield', '    finally:', '        print("reseal")', 'try:', '    with chamber():', '        raise ValueError("trap")', 'except ValueError:', '    print("caught")'],
          explain: 'finally runs as the error passes through the yield.',
        },
        {
          type: 'predict', text: 'Catching at the yield swallows the error. What will it say?', code: ['from contextlib import contextmanager', '@contextmanager', 'def guard():', '    try:', '        yield', '    except ZeroDivisionError:', '        print("handled")', 'with guard():', '    print(1 / 0)', 'print("after")'],
          explain: 'The generator catches it and ends normally, so the with swallows the error.',
        },
        {
          type: 'fill', text: 'Hand the torch to as.',
          lines: ['from contextlib import contextmanager', '@contextmanager', 'def torch():', '    print("lit")', '    try:', '        [] "flame"', '    finally:', '        print("out")', 'with torch() as t:', '    print(t)'], chips: ['yield', 'return', 'print'], answer: [['yield']],
          hints: ['The generator pauses here and hands over a value.', 'yield "flame"'],
        },
        {
          type: 'write', text: 'With @contextmanager, write seal(name): it prints "open " + name, yields, and prints "shut " + name in a finally. Use it: with seal("vault"): print("inside").',
          starter: ['from contextlib import contextmanager'], keys: ['@contextmanager', 'def', 'seal', '(', ')', ':', 'name', 'print', '"open "', '"shut "', '+', 'try', 'yield', 'finally', 'with', '"vault"', '"inside"'],
          require: l => (has(l, /@contextmanager/) && has(l, /finally/) ? null : 'Use @contextmanager with try/finally around the yield.'),
          hints: ['@contextmanager\ndef seal(name):\n    print("open " + name)\n    try:\n        yield\n    finally:\n        print("shut " + name)', 'with seal("vault"):\n    print("inside")'],
          solution: ['@contextmanager', 'def seal(name):', '    print("open " + name)', '    try:', '        yield', '    finally:', '        print("shut " + name)', 'with seal("vault"):', '    print("inside")'],
        },
      ],
      learn: [{ title: '@contextmanager', code: '@contextmanager\ndef chamber():\n    # enter\n    try:\n        yield value\n    finally:\n        # exit', text: 'Before yield enters, after yield exits. Use try/finally so errors still clean up.' }],
    },
    {
      id: '44-6', title: 'The contextlib shelf', bg: 'library', npc: 'keld', mentor: 'keld', tags: ['contextlibq'],
      steps: [
        { type: 'talk', who: 'keld', text: 'contextlib holds ready-made chambers. suppress(Error1, Error2) swallows just those errors: a tidy replacement for try/except/pass. And when several managers nest, they close in reverse order, last in, first out.' },
        { type: 'demo', text: 'suppress. Run it.', code: ['from contextlib import suppress', 'stock = {"rope": 2}', 'with suppress(KeyError):', '    print(stock["lamp"])', 'print("moved on")'] },
        {
          type: 'predict', vars: R => ({ i: R.pick([1, 5]) }), text: 'What will it say?', code: ['from contextlib import suppress', 'items = ["key", "map"]', 'with suppress(IndexError):', '    print(items[$i])', '    print("found it")', 'print("end")'],
          explain: 'If items[$i] fails, the rest of the block is skipped and the error is swallowed.',
        },
        {
          type: 'predict', measure: 'errtype', text: 'suppress lets other errors through. Which error?', code: ['from contextlib import suppress', 'with suppress(KeyError):', '    print(int("seven"))'],
          explain: 'Only KeyError is suppressed; int("seven") raises ValueError.',
        },
        {
          type: 'predict', text: 'Nested chambers. What will it say?', code: ['from contextlib import contextmanager', '@contextmanager', 'def room(n):', '    print("in", n)', '    try:', '        yield', '    finally:', '        print("out", n)', 'with room(1):', '    with room(2):', '        with room(3):', '            print("deep")'],
          explain: 'Last in, first out: 3 closes first, then 2, then 1.',
        },
        {
          type: 'predict', text: 'Same thing on one line. What will it say?', code: ['from contextlib import contextmanager', '@contextmanager', 'def room(n):', '    print("in", n)', '    yield n * 10', '    print("out", n)', 'with room(1) as a, room(2) as b:', '    print(a + b)'],
          explain: 'One with, two managers: entered left to right, exited right to left.',
        },
        {
          type: 'fill', text: 'Skip missing rooms quietly.',
          lines: ['from contextlib import suppress', 'rooms = {"hall": 3}', 'for name in ["hall", "pit", "hall"]:', '    with suppress([]):', '        print(name, rooms[name])'], chips: ['KeyError', 'IndexError', 'ValueError'], answer: [['KeyError']],
          hints: ['A missing dict key raises...', 'suppress(KeyError)'],
        },
        {
          type: 'write', text: 'Using suppress, try to convert each of ["3", "x", "4"] with int() and add it to a total, skipping the ones that fail. Print the total.',
          starter: ['from contextlib import suppress', 'total = 0'], keys: ['for', 's', 'in', '["3", "x", "4"]', ':', 'with', 'suppress', '(', ')', 'ValueError', 'total', '+=', 'int', 'print'],
          require: l => (has(l, /suppress\(ValueError\)/) ? null : 'Use with suppress(ValueError):'),
          hints: ['for s in ["3", "x", "4"]:\n    with suppress(ValueError):\n        total += int(s)', 'print(total)'],
          solution: ['for s in ["3", "x", "4"]:', '    with suppress(ValueError):', '        total += int(s)', 'print(total)'],
        },
      ],
      learn: [{ title: 'contextlib', code: 'with suppress(KeyError):\n    ...\nwith a() as x, b() as y:\n    ...', text: 'suppress swallows named errors. Several managers exit in reverse order.' }],
    },
    {
      id: '44-7', title: 'Chambers in practice', bg: 'vault', npc: 'keld', mentor: 'keld', tags: ['ctxuse'],
      steps: [
        { type: 'talk', who: 'keld', text: 'Context managers shine whenever something must be UNDONE: change a setting and restore it, take a lock and release it, start a transaction and either commit it or roll it back. The with block marks exactly where the temporary state lives.' },
        { type: 'demo', text: 'Temporarily change a setting. Run it.', code: ['from contextlib import contextmanager', 'settings = {"volume": 5}', '@contextmanager', 'def temp(key, value):', '    old = settings[key]', '    settings[key] = value', '    try:', '        yield', '    finally:', '        settings[key] = old', 'with temp("volume", 0):', '    print("in the library:", settings["volume"])', 'print("back outside:", settings["volume"])'] },
        {
          type: 'predict', text: 'All or nothing. What will it say?', code: ['class Transaction:', '    def __init__(self, ledger):', '        self.ledger = ledger', '    def __enter__(self):', '        self.saved = list(self.ledger)', '        return self.ledger', '    def __exit__(self, exc_type, exc, tb):', '        if exc_type is not None:', '            self.ledger.clear()', '            self.ledger.extend(self.saved)', '            print("rolled back")', '        return True', 'gold = [10]', 'with Transaction(gold) as g:', '    g.append(5)', 'with Transaction(gold) as g:', '    g.append(99)', '    raise ValueError("forged coin")', 'print(gold)'],
          explain: 'The first change is kept. The second one fails, so the ledger is restored.',
        },
        {
          type: 'predict', text: 'Indenting a report. What will it say?', code: ['from contextlib import contextmanager', 'level = 0', '@contextmanager', 'def indent():', '    global level', '    level += 1', '    try:', '        yield', '    finally:', '        level -= 1', 'def say(text):', '    print("  " * level + text)', 'say("vault")', 'with indent():', '    say("shelf")', '    with indent():', '        say("coin")', '    say("scroll")', 'say("exit")'],
          explain: 'Each with indents one level; leaving it un-indents.',
        },
        {
          type: 'predict', vars: R => ({ k: R.int(2, 4) }), text: 'Counting time spent in a chamber (in ticks). What will it say?', code: ['class Timer:', '    ticks = 0', '    def __enter__(self):', '        self.start = Timer.ticks', '        return self', '    def __exit__(self, *exc):', '        self.spent = Timer.ticks - self.start', 'with Timer() as t:', '    for i in range($k):', '        Timer.ticks += 3', 'print(t.spent)'],
          explain: 'The timer notes the start in __enter__ and the difference in __exit__.',
        },
        {
          type: 'fill', text: 'Put the old value back, whatever happens.',
          lines: ['from contextlib import contextmanager', 'state = {"door": "shut"}', '@contextmanager', 'def opened():', '    old = state["door"]', '    state["door"] = "open"', '    try:', '        yield', '    []:', '        state["door"] = old', 'with opened():', '    print(state["door"])', 'print(state["door"])'], chips: ['finally', 'except', 'else'], answer: [['finally']],
          hints: ['Runs whether or not there was an error.', 'finally:'],
        },
        {
          type: 'write', text: 'Write a @contextmanager borrow(shelf, book) that removes book from the list shelf, yields it, and in a finally appends it back. Borrow "atlas" from shelf = ["atlas", "map"], print the shelf inside the block, then print it after.',
          starter: ['from contextlib import contextmanager', 'shelf = ["atlas", "map"]'], keys: ['@contextmanager', 'def', 'borrow', '(', ')', ':', 'shelf', 'book', ',', '.remove', '.append', 'try', 'yield', 'finally', 'with', '"atlas"', 'as', 'b', 'print'],
          require: l => (has(l, /finally/) && has(l, /\.append/) ? null : 'Put the book back with append in a finally.'),
          hints: ['@contextmanager\ndef borrow(shelf, book):\n    shelf.remove(book)\n    try:\n        yield book\n    finally:\n        shelf.append(book)', 'with borrow(shelf, "atlas") as b:\n    print(shelf)\nprint(shelf)'],
          solution: ['@contextmanager', 'def borrow(shelf, book):', '    shelf.remove(book)', '    try:', '        yield book', '    finally:', '        shelf.append(book)', 'with borrow(shelf, "atlas") as b:', '    print(shelf)', 'print(shelf)'],
        },
      ],
      learn: [{ title: 'Using context managers', code: 'restore settings   locks   transactions   timers   indentation', text: 'Whenever something must be undone, wrap it in a with.' }],
    },
    {
      id: '44-8', title: 'Lock golems', bg: 'vault', mentor: 'narrator', tags: [],
      foe: R => { const d0 = R.int(4, 8); return { kind: 'lockgolem', hp: d0 + 20, d0 }; },
      steps: [
        { type: 'talk', who: 'narrator', text: 'Lock golems grind out of the walls! $HP HP. A generator chamber strikes on entry and on exit, even when the block fails.' },
        { type: 'demo', vars: (R, c) => ({ d0: c.foe.d0 }), text: 'A spark.', code: ['cast(spark, $d0)'] },
        {
          type: 'fill', text: 'It has $HP HP left. The block will crash: make sure the exit strike still lands.',
          lines: ['from contextlib import contextmanager', '@contextmanager', 'def quake():', '    cast(fireball, 10)', '    try:', '        yield', '    []:', '        cast(fireball, 10)', 'try:', '    with quake():', '        raise ValueError("rubble")', 'except ValueError:', '    pass'], chips: ['finally', 'else', 'except KeyError'], answer: [['finally']],
          goal: { foeDown: true },
          hints: ['Runs even when an error passes through.', 'finally:'],
        },
        { type: 'talk', who: 'narrator', text: 'The golem warden lifts its fists!' },
        {
          type: 'write', vars: R => ({ n: R.int(5, 9) }),
          spawn: v => ({ kind: 'lockgolem', hp: v.n * 2, tint: 'big' }),
          text: 'It has $n × 2 HP. Write a @contextmanager frost() that casts icebolt with $n, yields, then casts icebolt with $n again. Use it in a with block whose body is pass.',
          starter: ['from contextlib import contextmanager'], keys: ['@contextmanager', 'def', 'frost', '(', ')', ':', 'cast', 'icebolt', ',', '$n', 'yield', 'with', 'frost()', 'pass'],
          goal: { foeDown: true },
          require: l => (has(l, /@contextmanager/) && has(l, /^with frost/m) ? null : 'Use @contextmanager and with frost():'),
          hints: ['@contextmanager\ndef frost():\n    cast(icebolt, $n)\n    yield\n    cast(icebolt, $n)', 'with frost():\n    pass'],
          solution: ['@contextmanager', 'def frost():', '    cast(icebolt, $n)', '    yield', '    cast(icebolt, $n)', 'with frost():', '    pass'],
        },
      ],
      learn: [{ title: 'Generators in battle', code: 'try:\n    yield\nfinally:\n    cast(...)', text: 'finally keeps the exit strike even when the block crashes.' }],
    },
    {
      id: '44-9', title: 'The Vault Warden', bg: 'citadel', foe: { kind: 'vaultwarden', hp: 200, weak: 'spark', resist: 'icebolt' }, mentor: 'narrator', boss: true, tags: [],
      steps: [
        { type: 'talk', who: 'vaultwarden', text: 'NO DOOR OPENS WITHOUT CLOSING. NO ERROR LEAVES THESE HALLS.' },
        { type: 'talk', who: 'narrator', text: 'The Vault Warden has 200 HP. Spark jams its locks: double damage. Icebolt: half.' },
        {
          type: 'predict', measure: 'damage', text: 'How much damage? Spark is doubled.', code: ['class Hit:', '    def __enter__(self):', '        return 7', '    def __exit__(self, *exc):', '        pass', 'with Hit() as power:', '    cast(spark, power * 2)'],
          explain: 'as received 7 from __enter__: 7 × 2 = 14, doubled.',
        },
        {
          type: 'fix', text: 'The warden\'s seal lets the error escape and the spark never lands. Run it, then tap the broken line.',
          code: ['class Seal:', '    def __enter__(self):', '        return self', '    def __exit__(self, exc_type, exc, tb):', '        return False', 'with Seal():', '    raise KeyError("lock")', 'cast(spark, 12)'], bad: 4,
          options: ['        return True', '        return exc_type is ValueError', '        return None'], answer: 0,
          explain: 'Returning True swallows the error, so the program reaches the spark.',
        },
        { type: 'talk', who: 'vaultwarden', text: 'THEN FACE THE INNERMOST VAULT!' },
        {
          type: 'fill', text: 'Hand the power to as from the generator.',
          lines: ['from contextlib import contextmanager', '@contextmanager', 'def vault():', '    [] 9', 'with vault() as power:', '    cast(spark, power)'], chips: ['yield', 'return', 'print'], answer: [['yield']],
          hints: ['The generator gives its value at the pause.', 'yield 9'],
        },
        {
          type: 'write',
          text: 'Final blow! It has $HP HP and spark is doubled. Write a class Breach whose __exit__ casts spark with $HP // 2 + 1 (and __enter__ returns self). Use it in a with block whose body is pass.',
          starter: [], keys: ['class', 'Breach', ':', 'def', '__enter__', '__exit__', '(', ')', 'self', '*exc', ',', 'return', 'cast', 'spark', '$HP', '//', '2', '+', '1', 'with', 'Breach()', 'pass'],
          goal: { foeDown: true },
          require: l => (has(l, /def __exit__/) && has(l, /^with Breach/m) ? null : 'Strike from __exit__, inside with Breach():'),
          hints: ['class Breach:\n    def __enter__(self):\n        return self\n    def __exit__(self, *exc):\n        cast(spark, $HP // 2 + 1)', 'with Breach():\n    pass'],
          solution: ['class Breach:', '    def __enter__(self):', '        return self', '    def __exit__(self, *exc):', '        cast(spark, $HP // 2 + 1)', 'with Breach():', '    pass'],
        },
        { type: 'talk', who: 'vaultwarden', text: '...every... door... closed... well done...' },
      ],
      learn: [{ title: 'Context manager toolkit', code: 'with   __enter__   __exit__   return True   @contextmanager   suppress', text: 'Everything from the Sealed Chambers.' }],
    },
  ],
};
WORLDS.push(WORLD44);

(() => {
  const { makeQ, pick, rnd } = Arena;
  const CM = ['class C:', '    def __enter__(self):', '        print("in")', '        return 5', '    def __exit__(self, *exc):', '        print("out")'];
  Object.assign(Arena.GEN, {
    withwhy: () => makeQ(['with open("t.txt", "w") as f:', '    pass', 'print(f.closed)'], ['False', 'None', 'NameError'], null, { files: {} }),
    enterexit: () => makeQ([...CM, 'with C() as x:', '    print(x)'], ['in\nout\n5', 'in\n5', '5\nin\nout']),
    exitexc: () => { const swallow = pick([true, false]); return makeQ(['class C:', '    def __enter__(self):', '        return self', '    def __exit__(self, t, e, tb):', `        return ${swallow ? 'True' : 'False'}`, 'try:', '    with C():', '        1 / 0', '    print("swallowed")', 'except ZeroDivisionError:', '    print("escaped")'], [swallow ? 'escaped' : 'swallowed', 'ZeroDivisionError', 'None']); },
    ctxmgr: () => makeQ(['from contextlib import contextmanager', '@contextmanager', 'def c():', '    print("a")', '    yield "b"', '    print("c")', 'with c() as v:', '    print(v)'], ['a\nc\nb', 'b\na\nc', 'a\nb']),
    contextlibq: () => { const i = pick([0, 3]); return makeQ(['from contextlib import suppress', 'with suppress(IndexError):', `    print([7, 8][${i}])`, 'print("end")'], i === 0 ? ['end', '8\nend', 'IndexError'] : ['7\nend', 'IndexError', 'None\nend']); },
    ctxuse: () => { const v = rnd(2, 9); return makeQ(['from contextlib import contextmanager', 's = {"v": 1}', '@contextmanager', 'def temp(x):', '    old = s["v"]', '    s["v"] = x', '    try:', '        yield', '    finally:', '        s["v"] = old', `with temp(${v}):`, '    a = s["v"]', 'print(a, s["v"])'], [`${v} ${v}`, '1 1', `1 ${v}`]); },
  });
})();
