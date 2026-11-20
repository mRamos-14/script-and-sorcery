/* Script & Sorcery: a Python subset interpreter for learners.
   Statements: assignment (incl. tuple unpacking, index targets, chains),
   += -= *= /= %=, if/elif/else, for, while, break, continue, pass, def,
   return, try/except/else/finally, raise, del.
   Values: int, float, bool, None, str, list, tuple, dict, range, function.
   Like real Python, the whole program is checked for syntax and indentation
   errors before anything runs. Errors use real Python wording. */
const Py = (() => {
  'use strict';

  class PyError extends Error {
    constructor(type, msg, line) { super(msg); this.pyType = type; this.line = line; }
  }
  class Signal { constructor(kind, value) { this.kind = kind; this.value = value; } }

  const V = {
    // whole numbers past 2**53 cannot be exact here (real Python's are unlimited), so say so instead of being wrong
    int: n => { if (!Number.isSafeInteger(n) && Number.isFinite(n) && Number.isInteger(n)) throw new PyError('OverflowError', 'numbers this big are beyond this spellbook (past 9007199254740991)'); return { t: 'int', v: n }; },
    float: n => ({ t: 'float', v: n }),
    str: s => ({ t: 'str', v: s }),
    bool: b => ({ t: 'bool', v: !!b }),
    list: a => ({ t: 'list', v: a }),
    tuple: a => ({ t: 'tuple', v: a }),
    none: { t: 'NoneType', v: null },
  };
  const dict = () => ({ t: 'dict', v: new Map() });

  const SPELLS = ['fireball', 'spark', 'icebolt'];
  const BUILTINS = ['format', 'bin', 'hex', 'oct', 'print', 'len', 'cast', 'range', 'sum', 'max', 'min', 'sorted', 'abs', 'round', 'enumerate', 'open', 'input', 'isinstance', 'issubclass', 'hasattr', 'getattr', 'setattr', 'iter', 'next', 'zip', 'map', 'filter', 'any', 'all', 'reversed', 'chr', 'ord', 'divmod', 'pow', 'super', 'property', 'classmethod', 'staticmethod', 'callable', 'repr', 'vars'];
  // names that are classes in Python: calling them converts, type() returns them
  const TYPES = ['int', 'str', 'float', 'bool', 'list', 'tuple', 'dict', 'set', 'frozenset', 'type', 'object'];
  const EXC = ['BaseException', 'Exception', 'ValueError', 'TypeError', 'NameError', 'IndexError', 'KeyError', 'ZeroDivisionError', 'AttributeError', 'RecursionError', 'ArithmeticError', 'LookupError', 'RuntimeError', 'UnboundLocalError', 'OSError', 'FileNotFoundError', 'UnsupportedOperation', 'AssertionError', 'StopIteration', 'ImportError', 'ModuleNotFoundError', 'SystemExit', 'EOFError', 'NotImplementedError', 'PatternError', 'JSONDecodeError', 'OverflowError', 'StatisticsError', 'Failed', 'ConnectionError'];
  const EXC_PARENT = { Exception: 'BaseException', SystemExit: 'BaseException', ZeroDivisionError: 'ArithmeticError', OverflowError: 'ArithmeticError', IndexError: 'LookupError', KeyError: 'LookupError', RecursionError: 'RuntimeError', NotImplementedError: 'RuntimeError', UnboundLocalError: 'NameError', FileNotFoundError: 'OSError', UnsupportedOperation: 'OSError', ModuleNotFoundError: 'ImportError', JSONDecodeError: 'ValueError', StatisticsError: 'ValueError', Failed: 'BaseException', ConnectionError: 'OSError' };
  const excParent = c => (c === 'BaseException' ? null : EXC_PARENT[c] || 'Exception');
  const KEYWORDS = ['if', 'elif', 'else', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None', 'for', 'while', 'def', 'return', 'class', 'import', 'from', 'pass', 'break', 'continue', 'lambda', 'with', 'try', 'except', 'finally', 'raise', 'del', 'as', 'global', 'nonlocal', 'yield', 'assert'];
  const LATER = [];
  const STR_METHODS = ['encode', 'upper', 'lower', 'title', 'capitalize', 'strip', 'lstrip', 'rstrip', 'replace', 'count', 'find', 'rfind', 'index', 'rindex', 'startswith', 'endswith', 'isdigit', 'isalpha', 'isalnum', 'isupper', 'islower', 'isspace', 'isnumeric', 'split', 'rsplit', 'join', 'splitlines', 'center', 'ljust', 'rjust', 'zfill', 'removeprefix', 'removesuffix', 'partition', 'swapcase', 'casefold', 'format'];
  const FILE_METHODS = ['read', 'readline', 'readlines', 'write', 'writelines', 'close', 'flush'];
  const LIST_METHODS = ['append', 'extend', 'insert', 'pop', 'remove', 'index', 'count', 'sort', 'reverse', 'clear', 'copy'];
  const DICT_METHODS = ['get', 'keys', 'values', 'items', 'pop', 'update', 'clear', 'copy', 'setdefault', 'popitem'];
  const SET_METHODS = ['add', 'remove', 'discard', 'pop', 'clear', 'copy', 'union', 'intersection', 'difference', 'symmetric_difference', 'issubset', 'issuperset', 'isdisjoint', 'update'];
  const ADDR = ' at 0x7f3a2c1b4e70';
  const MAX_STEPS = 3000, MAX_DEPTH = 60;

  /* ---------- text forms ---------- */
  function strRepr(s) {
    const q = s.includes("'") && !s.includes('"') ? '"' : "'";
    let body = s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    if (q === "'") body = body.replace(/'/g, "\\'");
    return q + body + q;
  }
  function fmtFloat(v) {
    if (!isFinite(v)) return v > 0 ? 'inf' : v < 0 ? '-inf' : 'nan';
    if (v === 0) return Object.is(v, -0) ? '-0.0' : '0.0';
    const [mant, e] = v.toExponential().split('e');
    const exp = +e;
    // like Python: scientific form below 1e-4 and from 1e16 up
    if (exp < -4 || exp >= 16) return mant + 'e' + (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(2, '0');
    if (Number.isInteger(v)) return v.toFixed(1);
    return String(v);
  }
  // the program being run, so printing an object can call its __str__
  let CUR = null, SAFE = 0;
  const userCall = (fn, args) => callValue(fn, args, {}, CUR);
  function strOf(x, kind) {
    const m = classAttr(x.cls, kind);
    if (!m) return null;
    if (SAFE) return null;
    const r = userCall(m, [x]);
    if (r.t !== 'str') throw new PyError('TypeError', `${kind} returned non-string (type ${typeName(r)})`);
    return r.v;
  }
  const objName = x => `<__main__.${x.cls.name} object${ADDR}>`;
  function instRepr(x) {
    const r = strOf(x, '__repr__');
    if (r != null) return r;
    if (x.cls.exc) return `${x.cls.name}(${x.args.map(repr).join(', ')})`;
    if (SAFE) { const a = [...x.attrs].filter(([k]) => !k.startsWith('_')).slice(0, 3).map(([k, v]) => `${k}=${repr(v)}`); return `${x.cls.name}(${a.join(', ')})`; }
    return objName(x);
  }
  function setRepr(x) {
    if (!x.v.size) return x.frozen ? 'frozenset()' : 'set()';
    const body = '{' + setOrder(x, true).map(repr).join(', ') + '}';
    return x.frozen ? `frozenset(${body})` : body;
  }
  function repr(x) {
    switch (x.t) {
      case 'str': return strRepr(x.v);
      case 'list': return '[' + x.v.map(repr).join(', ') + ']';
      case 'tuple': return '(' + x.v.map(repr).join(', ') + (x.v.length === 1 ? ',' : '') + ')';
      case 'dict': return '{' + [...x.v.values()].map(([k, v]) => repr(k) + ': ' + repr(v)).join(', ') + '}';
      case 'set': return setRepr(x);
      case 'dict_keys': case 'dict_values': case 'dict_items': return `${x.t}([${x.v.map(repr).join(', ')}])`;
      case 'exception': return `${x.cls}(${x.args ? x.args.map(repr).join(', ') : x.msg === '' ? '' : strRepr(x.msg)})`;
      case 'file': return `<_io.TextIOWrapper name=${strRepr(x.name)} mode=${strRepr(x.mode)} encoding='UTF-8'>`;
      case 'instance': return instRepr(x);
      case 'match': return `<re.Match object; span=(${x.start}, ${x.end}), match=${strRepr(x.m[0])}>`;
      default: return fmt(x);
    }
  }
  function fmt(x) {
    switch (x.t) {
      case 'str': return x.v;
      case 'int': return String(x.v);
      case 'float': return fmtFloat(x.v);
      case 'bool': return x.v ? 'True' : 'False';
      case 'NoneType': return 'None';
      case 'spell': return `<spell ${x.v}>`;
      case 'builtin': return `<built-in function ${x.v}>`;
      case 'native': return `<built-in function ${x.name}>`;
      case 'method': return `<built-in method ${x.v} of ${x.on} object${ADDR}>`;
      case 'function': return `<function ${x.qualname || x.name}${ADDR}>`;
      case 'boundmethod': return `<bound method ${x.fn.qualname || x.fn.name} of ${SAFE ? x.self.cls ? x.self.cls.name : typeName(x.self) : repr(x.self)}>`;
      case 'range': return `range(${x.start}, ${x.stop}${x.step !== 1 ? ', ' + x.step : ''})`;
      case 'type': return `<class '${x.v}'>`;
      case 'exctype': return `<class '${x.v}'>`;
      case 'class': return `<class '__main__.${x.name}'>`;
      case 'module': return `<module '${x.name}'${x.builtin ? ' (built-in)' : ''}>`;
      case 'generator': return `<generator object ${x.name}${ADDR}>`;
      case 'iterator': return `<${x.kind} object${ADDR}>`;
      case 'property': return `<property object${ADDR}>`;
      case 'exception': return x.msg;
      case 'instance': {
        const s = strOf(x, '__str__');
        if (s != null) return s;
        if (x.cls.exc) return x.args.length === 1 ? fmt(x.args[0]) : x.args.length ? repr(V.tuple(x.args)) : '';
        return instRepr(x);
      }
      case 'pattern': return `re.compile(${strRepr(x.py)})`;
      case 'NotImplementedType': return 'NotImplemented';
      case 'super': return `<super: <class '${x.cls.name}'>, <${typeName(x.self)} object>>`;
      case 'classmethod': case 'staticmethod': return `<${x.t} object${ADDR}>`;
      case 'object': return x.repr ? x.repr() : `<${x.kind} object${ADDR}>`;
      default:
        if (['list', 'tuple', 'dict', 'set', 'dict_keys', 'dict_values', 'dict_items', 'file', 'match'].includes(x.t)) return repr(x);
        return `<${typeName(x)} object${ADDR}>`;
    }
  }
  function show(x) { return x.t === 'str' ? `"${x.v}"` : repr(x); }
  const typeName = x => (x.t === 'set' && x.frozen ? 'frozenset' : x.t === 'exctype' || x.t === 'class' ? 'type' : x.t === 'exception' ? x.cls : x.t === 'file' ? '_io.TextIOWrapper' : x.t === 'instance' ? x.cls.name : x.t === 'builtin' || x.t === 'native' ? 'builtin_function_or_method' : x.t === 'boundmethod' ? 'method' : x.t === 'match' ? 're.Match' : x.t === 'iterator' ? x.kind : x.t);

  /* ---------- tokens ---------- */
  const OPS3 = ['**=', '//=', '...'];
  const OPS2 = ['==', '!=', '<=', '>=', '//', '+=', '-=', '*=', '/=', '%=', '**', '->', ':=', '|=', '&='];
  function tokenize(src, lineNo) {
    const toks = [];
    let i = 0;
    const err = msg => new PyError('SyntaxError', msg, lineNo - 1);
    while (i < src.length) {
      const c = src[i];
      if (c === ' ') { i++; continue; }
      if (c === '#') break;
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        let j = i;
        while (j < src.length && /[0-9_]/.test(src[j])) j++;
        if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) { j++; while (j < src.length && /[0-9]/.test(src[j])) j++; }
        else if (src[j] === '.' && !/[A-Za-z_]/.test(src[j + 1] || '')) j++;
        if (/[eE]/.test(src[j] || '') && /[-+0-9]/.test(src[j + 1] || '')) { j += 2; while (j < src.length && /[0-9]/.test(src[j])) j++; }
        if (/[A-Za-z_]/.test(src[j] || '')) throw err('invalid decimal literal');
        toks.push({ k: 'num', v: src.slice(i, j).replace(/_/g, '') });
        i = j; continue;
      }
      // string prefixes: f (formatted), r (raw, backslashes stay), rf / fr
      const pm = /^([rRfFbB]{1,2})["']/.exec(src.slice(i, i + 3));
      const pre = pm && !/^(rr|ff|bb|fb|bf)$/i.test(pm[1]) ? pm[1].toLowerCase() : '';
      if (c === '"' || c === "'" || pre) {
        const isF = pre.includes('f'), raw = pre.includes('r');
        let j = i + pre.length;
        const q = src[j];
        const triple = src.slice(j, j + 3) === q.repeat(3);
        const close = triple ? q.repeat(3) : q;
        j += close.length;
        let val = '';
        while (j < src.length && src.slice(j, j + close.length) !== close) {
          if (src[j] === '\\' && j + 1 < src.length) {
            const e = src[j + 1];
            if (raw) val += '\\' + e;
            else if (e === 'u' && /^[0-9a-fA-F]{4}$/.test(src.slice(j + 2, j + 6))) { val += String.fromCharCode(parseInt(src.slice(j + 2, j + 6), 16)); j += 6; continue; }
            else if (e === 'x' && /^[0-9a-fA-F]{2}$/.test(src.slice(j + 2, j + 4))) { val += String.fromCharCode(parseInt(src.slice(j + 2, j + 4), 16)); j += 4; continue; }
            else if (e === '0') val += String.fromCharCode(0);
            else val += e === 'n' ? '\n' : e === 't' ? '\t' : e === 'r' ? '\r' : e === '\\' ? '\\' : e === "'" ? "'" : e === '"' ? '"' : '\\' + e;
            j += 2; continue;
          }
          val += src[j]; j++;
        }
        if (j >= src.length) throw err(triple ? `unterminated triple-quoted string literal (detected at line ${lineNo})` : `unterminated ${isF ? 'f-' : ''}string literal (detected at line ${lineNo})`);
        toks.push({ k: isF ? 'fstr' : pre.includes('b') ? 'bytes' : 'str', v: val, raw });
        i = j + close.length; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
        const w = src.slice(i, j);
        toks.push({ k: KEYWORDS.includes(w) ? 'kw' : 'name', v: w });
        i = j; continue;
      }
      const three = src.slice(i, i + 3);
      if (OPS3.includes(three)) { toks.push({ k: 'op', v: three }); i += 3; continue; }
      const two = src.slice(i, i + 2);
      if (OPS2.includes(two)) { toks.push({ k: 'op', v: two }); i += 2; continue; }
      if ('+-*/%=<>(),.[]:{};|&^@~'.includes(c)) { toks.push({ k: 'op', v: c }); i++; continue; }
      throw err(`invalid character '${c}'`);
    }
    return toks;
  }

  /* ---------- parser ---------- */
  function makeParser(toks, lineNo) {
    let p = 0;
    const line = lineNo - 1;
    const at = () => toks[p];
    const isOp = v => toks[p] && toks[p].k === 'op' && toks[p].v === v;
    const isKw = v => toks[p] && toks[p].k === 'kw' && toks[p].v === v;
    const fail = (msg = 'invalid syntax') => { throw new PyError('SyntaxError', msg, line); };
    const close = (v, open) => {
      if (isOp(v)) { p++; return; }
      if (p < toks.length) fail();
      throw new PyError('SyntaxError', `'${open}' was never closed`, line);
    };
    const endOfExpr = () => p >= toks.length || isOp(')') || isOp(']') || isOp('}') || isOp(':') || isOp(',') || isOp('=');
    const later = w => { throw new PyError('SyntaxError', `'${w}' is real Python, but this spellbook learns it in a later world`, line); };

    // f(a, *rest, key=value, **opts)  and  f(x for x in xs)
    function callArgs() {
      const args = [], kw = {}, kwstar = [];
      while (!isOp(')')) {
        if (p >= toks.length) close(')', '(');
        if (isOp('*')) { p++; args.push({ n: 'star', e: expr() }); }
        else if (isOp('**')) { p++; kwstar.push(expr()); }
        else if (at().k === 'name' && toks[p + 1] && toks[p + 1].k === 'op' && toks[p + 1].v === '=') {
          const k = at().v; p += 2;
          if (k in kw) fail(`keyword argument repeated: ${k}`);
          kw[k] = expr();
        } else {
          if (Object.keys(kw).length || kwstar.length) fail('positional argument follows keyword argument');
          const e = expr();
          if (isKw('for')) { args.push(comprehension('gen', e)); if (!isOp(')')) fail('Generator expression must be parenthesized'); break; }
          args.push(e);
        }
        if (!isOp(',')) break;
        p++;
      }
      close(')', '(');
      return { args, kw, kwstar };
    }
    // for x in xs if cond for y in ys ...
    function comprehension(kind, elt, key) {
      const gens = [];
      while (isKw('for')) {
        p++;
        const target = targetList(() => isKw('in'));
        if (!isKw('in')) fail("expected 'in'");
        p++;
        const iter = orExpr();
        const conds = [];
        while (isKw('if')) { p++; conds.push(orNoCond()); }
        gens.push({ target, iter, conds });
      }
      return { n: 'comp', kind, elt, key, gens };
    }
    // an if inside a comprehension must not swallow a following "else"
    function orNoCond() { return orExpr(); }
    function starOr() { if (isOp('*')) { p++; return { n: 'star', e: orExpr() }; } return expr(); }
    function atom() {
      const t = toks[p++];
      if (!t) fail();
      if (t.k === 'num') return /[.eE]/.test(t.v) ? { n: 'lit', val: V.float(parseFloat(t.v)) } : { n: 'lit', val: V.int(parseInt(t.v, 10)) };
      if (t.k === 'str') {
        let s = t.v;
        while (at() && at().k === 'str') s += toks[p++].v; // implicit concatenation
        return { n: 'lit', val: V.str(s) };
      }
      if (t.k === 'bytes') { let s = t.v; while (at() && at().k === 'bytes') s += toks[p++].v; return { n: 'lit', val: makeBytes(s) }; }
      if (t.k === 'fstr') return { n: 'fstr', parts: parseF(t.v, lineNo) };
      if (t.k === 'kw') {
        if (t.v === 'True' || t.v === 'False') return { n: 'lit', val: V.bool(t.v === 'True') };
        if (t.v === 'None') return { n: 'lit', val: V.none };
        if (t.v === 'lambda') { p--; return lambdaExpr(); }
        if (t.v === 'yield') fail("yield is only used as its own line in this spellbook, like: yield value");
        if (LATER.includes(t.v)) later(t.v);
        p--; fail();
      }
      if (t.k === 'name') {
        if (isOp('(')) { p++; const a = callArgs(); return { n: 'call', name: t.v, args: a.args, kw: a.kw, kwstar: a.kwstar }; }
        return { n: 'name', name: t.v };
      }
      if (t.k === 'op' && t.v === '(') {
        if (isOp(')')) { p++; return { n: 'tuple', items: [] }; }
        const first = starOr();
        if (isKw('for')) { const g = comprehension('gen', first); close(')', '('); return g; }
        if (isOp(',')) {
          const items = [first];
          while (isOp(',')) { p++; if (isOp(')')) break; items.push(starOr()); }
          close(')', '(');
          return { n: 'tuple', items };
        }
        close(')', '(');
        if (first.n === 'star') fail('cannot use starred expression here');
        return first.n === 'walrus' ? { ...first, paren: true } : first;
      }
      if (t.k === 'op' && t.v === '[') {
        const items = [];
        if (isOp(']')) { p++; return { n: 'list', items }; }
        const first = starOr();
        if (isKw('for')) { const c = comprehension('list', first); close(']', '['); return c; }
        items.push(first);
        while (isOp(',')) { p++; if (isOp(']')) break; items.push(starOr()); }
        close(']', '[');
        return { n: 'list', items };
      }
      if (t.k === 'op' && t.v === '{') {
        if (isOp('}')) { p++; return { n: 'dict', pairs: [] }; }
        // set or dict? look at the first item
        if (isOp('**')) return dictRest(null);
        const first = starOr();
        if (isOp(':')) {
          p++;
          const v = expr();
          if (isKw('for')) { const c = comprehension('dict', v, first); close('}', '{'); return c; }
          return dictRest([first, v]);
        }
        if (isKw('for')) { const c = comprehension('set', first); close('}', '{'); return c; }
        const items = [first];
        while (isOp(',')) { p++; if (isOp('}')) break; items.push(starOr()); }
        close('}', '{');
        return { n: 'setlit', items };
      }
      if (t.k === 'op' && t.v === '...') return { n: 'lit', val: V.none };
      p--;
      fail();
    }
    function dictRest(firstPair) {
      const pairs = firstPair ? [firstPair] : [];
      if (firstPair) { if (!isOp(',')) { close('}', '{'); return { n: 'dict', pairs }; } p++; }
      while (!isOp('}')) {
        if (p >= toks.length) close('}', '{');
        if (isOp('**')) { p++; pairs.push([null, orExpr()]); }
        else {
          const k = expr();
          if (!isOp(':')) fail("':' expected after dictionary key");
          p++;
          pairs.push([k, expr()]);
        }
        if (!isOp(',')) break;
        p++;
      }
      close('}', '{');
      return { n: 'dict', pairs };
    }
    function postfix(node) {
      for (;;) {
        if (isOp('.')) {
          p++;
          const t = toks[p++];
          if (!t || t.k !== 'name') fail();
          if (isOp('(')) { p++; const a = callArgs(); node = { n: 'method', obj: node, name: t.v, args: a.args, kw: a.kw, kwstar: a.kwstar }; }
          else node = { n: 'attr', obj: node, name: t.v };
          continue;
        }
        if (isOp('[')) {
          p++;
          const parts = [null, null, null];
          let k = 0, slice = false;
          while (!isOp(']')) {
            if (p >= toks.length) close(']', '[');
            if (isOp(':')) { slice = true; k++; p++; if (k > 2) fail(); continue; }
            if (parts[k]) fail();
            parts[k] = exprList();
          }
          if (!slice && parts[0] === null) fail();
          close(']', '[');
          node = slice ? { n: 'slice', obj: node, a: parts[0], b: parts[1], c: parts[2] } : { n: 'index', obj: node, i: parts[0] };
          continue;
        }
        if (isOp('(')) { p++; const a = callArgs(); node = { n: 'callx', fn: node, args: a.args, kw: a.kw, kwstar: a.kwstar }; continue; }
        return node;
      }
    }
    function power() {
      const base = postfix(atom());
      if (isOp('**')) { p++; return { n: 'bin', op: '**', l: base, r: unary() }; }
      return base;
    }
    function unary() {
      if (isOp('-')) { p++; return { n: 'neg', e: unary() }; }
      if (isOp('+')) { p++; return { n: 'pos', e: unary() }; }
      if (isOp('~')) { p++; return { n: 'inv', e: unary() }; }
      return power();
    }
    function term() {
      let l = unary();
      while (isOp('*') || isOp('/') || isOp('//') || isOp('%') || isOp('@')) { const op = toks[p++].v; l = { n: 'bin', op, l, r: unary() }; }
      return l;
    }
    function arith() {
      let l = term();
      while (isOp('+') || isOp('-')) { const op = toks[p++].v; l = { n: 'bin', op, l, r: term() }; }
      return l;
    }
    function bitand() { let l = arith(); while (isOp('&')) { p++; l = { n: 'bin', op: '&', l, r: arith() }; } return l; }
    function bitxor() { let l = bitand(); while (isOp('^')) { p++; l = { n: 'bin', op: '^', l, r: bitand() }; } return l; }
    function bitor() { let l = bitxor(); while (isOp('|')) { p++; l = { n: 'bin', op: '|', l, r: bitxor() }; } return l; }
    const CMP = ['==', '!=', '<', '>', '<=', '>='];
    function comparison() {
      const first = bitor();
      const rest = [];
      for (;;) {
        if (at() && at().k === 'op' && CMP.includes(at().v)) { const op = toks[p++].v; rest.push([op, bitor()]); continue; }
        if (isKw('in')) { p++; rest.push(['in', bitor()]); continue; }
        if (isKw('not') && toks[p + 1] && toks[p + 1].k === 'kw' && toks[p + 1].v === 'in') { p += 2; rest.push(['not in', bitor()]); continue; }
        if (isKw('is')) {
          p++;
          if (isKw('not')) { p++; rest.push(['is not', bitor()]); } else rest.push(['is', bitor()]);
          continue;
        }
        break;
      }
      return rest.length ? { n: 'cmp', first, rest } : first;
    }
    function notExpr() {
      if (isKw('not')) { p++; return { n: 'not', e: notExpr() }; }
      return comparison();
    }
    function andExpr() {
      let l = notExpr();
      while (isKw('and')) { p++; l = { n: 'and', l, r: notExpr() }; }
      return l;
    }
    function orExpr() {
      let l = andExpr();
      while (isKw('or')) { p++; l = { n: 'or', l, r: andExpr() }; }
      return l;
    }
    function params(stop) {
      const out = [];
      let seenStar = false;
      while (!stop()) {
        if (isOp('**')) {
          p++;
          const t = toks[p++];
          if (!t || t.k !== 'name') fail();
          if (isOp(':') && !stop()) { p++; expr(); }
          out.push({ name: t.v, kind: 'kwargs' });
          if (isOp(',')) p++;
          if (!stop()) fail('arguments cannot follow var-keyword argument');
          break;
        }
        if (isOp('*')) {
          p++;
          if (seenStar) fail('* argument may appear only once');
          seenStar = true;
          if (isOp(',')) { out.push({ name: null, kind: 'star' }); p++; continue; }
          const t = toks[p++];
          if (!t || t.k !== 'name') fail('named arguments must follow bare *');
          if (isOp(':') && toks !== null && !stop()) { p++; expr(); }
          out.push({ name: t.v, kind: 'varargs' });
        } else {
          const t = toks[p++];
          if (!t || t.k !== 'name') fail();
          // type hints are allowed and ignored, like Python does at runtime
          if (isOp(':') && !stop()) { p++; expr(); }
          let def = null;
          if (isOp('=')) { p++; def = expr(); }
          else if (!seenStar && out.some(q => q.def && q.kind === 'pos')) fail('parameter without a default follows parameter with a default');
          if (out.some(q => q.name === t.v)) fail(`duplicate argument '${t.v}' in function definition`);
          out.push({ name: t.v, def, kind: seenStar ? 'kwonly' : 'pos' });
        }
        if (!isOp(',')) break;
        p++;
      }
      return out;
    }
    function lambdaExpr() {
      p++; // lambda
      const ps = params(() => isOp(':'));
      if (!isOp(':')) fail("expected ':'");
      p++;
      return { n: 'lambda', params: ps, body: expr(), line };
    }
    function expr() {
      if (isKw('lambda')) return lambdaExpr();
      if (at() && at().k === 'name' && toks[p + 1] && toks[p + 1].k === 'op' && toks[p + 1].v === ':=') {
        const name = at().v; p += 2;
        return { n: 'walrus', name, e: expr() };
      }
      const e = orExpr();
      if (isKw('if')) {
        p++;
        const cond = orExpr();
        if (!isKw('else')) fail("expected 'else' after 'if' expression");
        p++;
        return { n: 'ifexp', cond, a: e, b: expr() };
      }
      return e;
    }
    function exprList() {
      const first = starOr();
      if (!isOp(',')) { if (first.n === 'star') fail('can\'t use starred expression here'); return first; }
      const items = [first];
      while (isOp(',')) { p++; if (endOfExpr()) break; items.push(starOr()); }
      return { n: 'tuple', items };
    }
    function asTarget(node) {
      if (node.n === 'name' || node.n === 'index' || node.n === 'attr') return node;
      if (node.n === 'star') return { n: 'star', e: asTarget(node.e) };
      if (node.n === 'tuple' || node.n === 'list') {
        const items = node.items.map(asTarget);
        if (items.filter(x => x.n === 'star').length > 1) fail('multiple starred expressions in assignment');
        return { n: 'tuple', items };
      }
      if (node.n === 'call' || node.n === 'method' || node.n === 'callx') fail("cannot assign to function call here. Maybe you meant '==' instead of '='?");
      if (node.n === 'lit') fail("cannot assign to literal here. Maybe you meant '==' instead of '='?");
      if (node.n === 'slice') fail('slice assignment is not supported in this spellbook');
      fail("cannot assign to expression here. Maybe you meant '==' instead of '='?");
    }
    function targetList(stop) {
      const items = [];
      for (;;) {
        if (isOp('*')) { p++; items.push({ n: 'star', e: asTarget(postfix(atom())) }); }
        else items.push(asTarget(postfix(atom())));
        if (!isOp(',')) break;
        p++;
        if (stop()) break;
      }
      return items.length === 1 && items[0].n !== 'star' ? items[0] : { n: 'tuple', items };
    }
    function dotted() {
      const t = toks[p++];
      if (!t || t.k !== 'name') fail();
      let name = t.v;
      while (isOp('.')) { p++; const u = toks[p++]; if (!u || u.k !== 'name') fail(); name += '.' + u.v; }
      return name;
    }
    function asName() {
      if (!isKw('as')) return null;
      p++;
      const a = toks[p++];
      if (!a || a.k !== 'name') fail();
      return a.v;
    }

    function simple() {
      const t0 = at();
      if (!t0) fail();
      if (t0.k === 'kw') {
        switch (t0.v) {
          case 'pass': p++; if (p < toks.length) fail(); return { n: 'pass' };
          case 'break': p++; if (p < toks.length) fail(); return { n: 'break' };
          case 'continue': p++; if (p < toks.length) fail(); return { n: 'continue' };
          case 'return': { p++; const e = p < toks.length ? exprList() : null; if (p < toks.length) fail(); return { n: 'return', e }; }
          case 'raise': {
            p++;
            const e = p < toks.length ? expr() : null;
            let cause = null;
            if (isKw('from')) { p++; cause = expr(); }
            if (p < toks.length) fail();
            return { n: 'raise', e, cause };
          }
          case 'del': {
            p++;
            const targets = [];
            for (;;) { targets.push(asTarget(postfix(atom()))); if (!isOp(',')) break; p++; }
            if (p < toks.length) fail();
            return { n: 'del', target: targets[0], targets };
          }
          case 'assert': {
            p++;
            const cond = expr();
            let msg = null;
            if (isOp(',')) { p++; msg = expr(); }
            if (p < toks.length) fail();
            return { n: 'assert', cond, msg };
          }
          case 'yield': {
            p++;
            if (isKw('from')) { p++; const e = expr(); if (p < toks.length) fail(); return { n: 'yield', from: true, e }; }
            const e = p < toks.length ? exprList() : null;
            if (p < toks.length) fail();
            return { n: 'yield', e };
          }
          case 'import': {
            p++;
            const names = [];
            for (;;) { const mod = dotted(); names.push({ mod, as: asName() }); if (!isOp(',')) break; p++; }
            if (p < toks.length) fail();
            return { n: 'import', names };
          }
          case 'from': {
            p++;
            const mod = dotted();
            if (!isKw('import')) fail("expected 'import'");
            p++;
            if (isOp('*')) { p++; if (p < toks.length) fail(); return { n: 'fromimport', mod, star: true, names: [] }; }
            const paren = isOp('(');
            if (paren) p++;
            const names = [];
            for (;;) {
              const t = toks[p++];
              if (!t || t.k !== 'name') fail();
              names.push({ name: t.v, as: asName() });
              if (!isOp(',')) break;
              p++;
              if (paren && isOp(')')) break;
            }
            if (paren) close(')', '(');
            if (p < toks.length) fail();
            return { n: 'fromimport', mod, names };
          }
          default:
            if (t0.v === 'global' || t0.v === 'nonlocal') {
              p++;
              const names = [];
              for (;;) { const t = toks[p++]; if (!t || t.k !== 'name') fail(); names.push(t.v); if (!isOp(',')) break; p++; }
              if (p < toks.length) fail();
              return { n: t0.v, names };
            }
            if (LATER.includes(t0.v)) later(t0.v);
        }
      }
      // x: int = 5  (a type hint, ignored when running)
      if (t0.k === 'name' && toks[1] && toks[1].k === 'op' && toks[1].v === ':') {
        p = 2;
        expr();
        if (p >= toks.length) return { n: 'pass', hint: true };
        if (!isOp('=')) fail();
        p++;
        const e = exprList();
        if (p < toks.length) fail();
        return { n: 'assign', targets: [{ n: 'name', name: t0.v }], e };
      }
      // find top-level = or augmented assignment
      let depth = 0;
      const eqs = [];
      let aug = -1, lam = false;
      toks.forEach((t, i) => {
        if (t.k === 'kw' && t.v === 'lambda' && depth === 0) lam = true;
        if (t.k !== 'op' || lam) return;
        if ('([{'.includes(t.v)) depth++;
        else if (')]}'.includes(t.v)) depth--;
        else if (depth === 0 && t.v === '=') eqs.push(i);
        else if (depth === 0 && ['+=', '-=', '*=', '/=', '%=', '**=', '//=', '|=', '&='].includes(t.v) && aug < 0) aug = i;
      });
      if (aug >= 0 && (!eqs.length || aug < eqs[0])) {
        const lhs = makeParser(toks.slice(0, aug), lineNo);
        const target = lhs.targetOnly();
        if (target.n === 'tuple') fail("'tuple' is an illegal expression for augmented assignment");
        p = aug + 1;
        if (p >= toks.length) fail();
        const e = exprList();
        if (p < toks.length) fail();
        return { n: 'aug', target, op: toks[aug].v.slice(0, -1), e };
      }
      if (eqs.length) {
        const targets = [];
        let start = 0;
        for (const ix of eqs) {
          if (ix === start) fail();
          targets.push(makeParser(toks.slice(start, ix), lineNo).targetOnly());
          start = ix + 1;
        }
        p = start;
        if (p >= toks.length) fail();
        const e = exprList();
        if (p < toks.length) fail();
        return { n: 'assign', targets, e };
      }
      const e = exprList();
      if (p < toks.length) {
        if (isOp(':')) fail("invalid syntax");
        fail();
      }
      if (e.n === 'walrus' && !e.paren) fail('invalid syntax');
      return { n: 'expr', e };
    }
    function targetOnly() {
      const node = exprList();
      if (p < toks.length) fail();
      return asTarget(node);
    }
    function colonEnd(kind) {
      if (isOp('=')) fail("invalid syntax. Maybe you meant '==' or ':=' instead of '='?");
      if (!isOp(':')) fail("expected ':'");
      p++;
      return p < toks.length ? toks.slice(p) : null;
    }
    function header() {
      const t0 = toks[0];
      const kind = t0.v;
      p = 1;
      switch (kind) {
        case 'if': case 'elif': case 'while': {
          if (p >= toks.length || isOp(':')) fail();
          const cond = expr();
          return { n: kind, cond, inline: colonEnd() };
        }
        case 'else': case 'try': case 'finally':
          return { n: kind, inline: colonEnd() };
        case 'for': {
          const target = targetList(() => isKw('in'));
          if (!isKw('in')) fail("expected 'in'");
          p++;
          const iter = exprList();
          return { n: 'for', target, iter, inline: colonEnd() };
        }
        case 'def': {
          const nm = toks[p++];
          if (!nm || nm.k !== 'name') fail();
          if (!isOp('(')) fail("expected '('");
          p++;
          const ps = params(() => isOp(')'));
          close(')', '(');
          if (isOp('->')) { p++; expr(); }
          return { n: 'def', name: nm.v, params: ps, inline: colonEnd() };
        }
        case 'class': {
          const nm = toks[p++];
          if (!nm || nm.k !== 'name') fail();
          let bases = [];
          if (isOp('(')) { p++; const a = callArgs(); bases = a.args; }
          return { n: 'class', name: nm.v, bases, inline: colonEnd() };
        }
        case 'except': {
          let types = null, as = null;
          if (!isOp(':')) {
            const e = orExpr();
            types = e.n === 'tuple' ? e.items : [e];
            if (types.some(x => x.n !== 'name' && x.n !== 'attr')) fail();
            as = asName();
          }
          return { n: 'except', types, type: types ? types.map(x => x.name || x.n).join(',') : null, as, inline: colonEnd() };
        }
        case 'with': {
          if (p >= toks.length || isOp(':')) fail();
          const items = [];
          for (;;) { const e = expr(); items.push({ e, as: asName() }); if (!isOp(',')) break; p++; }
          return { n: 'with', items, e: items[0].e, as: items[0].as, inline: colonEnd() };
        }
      }
    }
    // case patterns: literals, _, names that capture, a | b, [a, *rest], dotted constants, "as"
    function pattern() {
      const alts = [closedPattern()];
      while (isOp('|')) { p++; alts.push(closedPattern()); }
      let pat = alts.length === 1 ? alts[0] : { k: 'or', alts };
      if (isKw('as')) { p++; const t = toks[p++]; if (!t || t.k !== 'name') fail(); pat = { k: 'as', pat, name: t.v }; }
      return pat;
    }
    function closedPattern() {
      const t = at();
      if (!t) fail();
      if (t.k === 'num' || t.k === 'str' || (t.k === 'op' && t.v === '-')) { const e = unary(); return { k: 'lit', e }; }
      if (t.k === 'kw' && ['None', 'True', 'False'].includes(t.v)) { p++; return { k: 'lit', e: { n: 'lit', val: t.v === 'None' ? V.none : V.bool(t.v === 'True') } }; }
      if (t.k === 'name') {
        p++;
        if (isOp('.')) { let e = { n: 'name', name: t.v }; while (isOp('.')) { p++; const u = toks[p++]; if (!u || u.k !== 'name') fail(); e = { n: 'attr', obj: e, name: u.v }; } return { k: 'value', e }; }
        if (isOp('(')) throw new PyError('SyntaxError', 'class patterns like Point(x=1) are real Python, but this spellbook does not know them yet', line);
        return t.v === '_' ? { k: 'wild' } : { k: 'capture', name: t.v };
      }
      if (t.k === 'op' && (t.v === '[' || t.v === '(')) {
        p++;
        const close = t.v === '[' ? ']' : ')';
        const items = [];
        while (!isOp(close)) {
          if (isOp('*')) { p++; const u = toks[p++]; if (!u || u.k !== 'name') fail(); items.push({ k: 'star', name: u.v === '_' ? null : u.v }); }
          else items.push(pattern());
          if (!isOp(',')) break;
          p++;
        }
        if (!isOp(close)) fail();
        p++;
        return { k: 'seq', items };
      }
      if (t.k === 'op' && t.v === '{') throw new PyError('SyntaxError', 'mapping patterns are real Python, but this spellbook does not know them yet', line);
      fail();
    }
    function statement() {
      const t0 = toks[0];
      const last = toks[toks.length - 1];
      const softHeader = last && last.k === 'op' && last.v === ':' && toks.length > 2 && !(toks[1].k === 'op' && ['=', '.', '(', '[', ',', ':='].includes(toks[1].v) && !(toks[1].v === '(' || toks[1].v === '['));
      if (t0 && t0.k === 'name' && t0.v === 'match' && softHeader && !toks.some((t, i) => i > 0 && t.k === 'op' && t.v === '=')) {
        p = 1;
        const e = exprList();
        if (!isOp(':') || p !== toks.length - 1) fail();
        return { n: 'match', e };
      }
      if (t0 && t0.k === 'name' && t0.v === 'case' && softHeader) {
        p = 1;
        const pat = pattern();
        let guard = null;
        if (isKw('if')) { p++; guard = expr(); }
        if (!isOp(':')) fail("expected ':'");
        p++;
        return { n: 'case', pat, guard, inline: p < toks.length ? toks.slice(p) : null };
      }
      if (t0 && t0.k === 'op' && t0.v === '@') { p = 1; const e = expr(); if (p < toks.length) fail(); return { n: 'decorator', e }; }
      if (t0 && t0.k === 'kw' && ['if', 'elif', 'else', 'while', 'for', 'def', 'class', 'try', 'except', 'finally', 'with'].includes(t0.v)) return header();
      return simple();
    }
    return { statement, simple, targetOnly, expr: () => { const e = expr(); if (p < toks.length) fail(); return e; } };
  }

  function parseF(raw, lineNo) {
    const parts = [];
    let i = 0, buf = '';
    const err = msg => new PyError('SyntaxError', msg, lineNo - 1);
    while (i < raw.length) {
      const c = raw[i];
      if (c === '{' && raw[i + 1] === '{') { buf += '{'; i += 2; continue; }
      if (c === '}' && raw[i + 1] === '}') { buf += '}'; i += 2; continue; }
      if (c === '{') {
        let j = i + 1, depth = 0, q = null;
        while (j < raw.length && !(raw[j] === '}' && depth === 0 && !q)) {
          if (q) { if (raw[j] === q) q = null; }
          else if (raw[j] === '"' || raw[j] === "'") q = raw[j];
          else if ('([{'.includes(raw[j])) depth++;
          else if (')]}'.includes(raw[j])) depth--;
          j++;
        }
        if (j >= raw.length) throw err("f-string: expecting '}'");
        let inner = raw.slice(i + 1, j), spec = null, conv = null, debug = null;
        let d = 0; q = null;
        for (let k = 0; k < inner.length; k++) {
          const ch = inner[k];
          if (q) { if (ch === q) q = null; continue; }
          if (ch === '"' || ch === "'") q = ch;
          else if ('([{'.includes(ch)) d++;
          else if (')]}'.includes(ch)) d--;
          else if (d === 0 && ch === '!' && /^[rsa](:|$)/.test(inner.slice(k + 1))) { conv = inner[k + 1]; spec = inner.length > k + 2 ? inner.slice(k + 3) : null; inner = inner.slice(0, k); break; }
          else if (d === 0 && ch === ':' && inner[k + 1] !== '=') { spec = inner.slice(k + 1); inner = inner.slice(0, k); break; }
        }
        // {name=} prints "name=" and then the value
        const dm = /^(.*[^=!<>])=(\s*)$/.exec(inner);
        if (dm && !/[=!<>]$/.test(dm[1].trim())) { debug = inner; inner = dm[1]; }
        if (!inner.trim()) throw err("f-string: valid expression required before '}'");
        if (buf) parts.push(buf);
        buf = '';
        let specParts = null;
        if (spec != null && spec.includes('{')) {
          specParts = [];
          let last = 0;
          spec.replace(/\{([^{}]*)\}/g, (all, ex, at) => {
            if (at > last) specParts.push(spec.slice(last, at));
            specParts.push(makeParser(tokenize(ex.trim(), lineNo), lineNo).expr());
            last = at + all.length;
            return all;
          });
          if (last < spec.length) specParts.push(spec.slice(last));
        }
        parts.push({ e: makeParser(tokenize(inner.trim(), lineNo), lineNo).expr(), spec, specParts, conv, debug });
        i = j + 1; continue;
      }
      if (c === '}') throw err("f-string: single '}' is not allowed");
      buf += c; i++;
    }
    if (buf) parts.push(buf);
    return parts;
  }
  // decimal rounding the way Python does it: exact value, ties to even
  function fixedHalfEven(a, p) {
    const full = a.toFixed(Math.min(100, p + 60));
    const [ip, fp = ''] = full.split('.');
    let digits = ip + fp.slice(0, p);
    const rest = fp.slice(p);
    const first = rest[0] || '0';
    const up = first > '5' || (first === '5' && (/[1-9]/.test(rest.slice(1)) || +digits[digits.length - 1] % 2 === 1));
    if (up) {
      const arr = digits.split('');
      let k = arr.length - 1;
      while (k >= 0) { if (arr[k] === '9') { arr[k] = '0'; k--; } else { arr[k] = String(+arr[k] + 1); break; } }
      if (k < 0) arr.unshift('1');
      digits = arr.join('');
    }
    if (!p) return digits.replace(/^0+(?=\d)/, '');
    const cut = digits.length - p;
    return (digits.slice(0, cut) || '0').replace(/^0+(?=\d)/, '') + '.' + digits.slice(cut);
  }
  function expForm(a, p, upper) {
    let s = a.toExponential(p);
    s = s.replace(/e([+-])(\d)$/, 'e$10$2');
    return upper ? s.toUpperCase() : s;
  }
  function generalForm(a, p, alt, upper, reprLike) {
    if (p === 0) p = 1;
    if (a === 0) return reprLike ? '0.0' : alt ? '0.' + '0'.repeat(p - 1) : '0';
    const exp = +a.toExponential(p - 1).split('e')[1];
    let s;
    if (exp >= -4 && exp < p) {
      s = fixedHalfEven(a, p - 1 - exp);
      if (!alt && s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
      if (reprLike && !s.includes('.')) s += '.0';
    } else {
      s = expForm(a, p - 1, upper);
      if (!alt) s = s.replace(/\.?0+e/, 'e').replace(/\.?0+E/, 'E');
    }
    return s;
  }
  function formatSpec(x, spec) {
    if (x.t === 'instance' && classAttr(x.cls, '__format__')) { const r = userCall(classAttr(x.cls, '__format__'), [x, V.str(spec)]); return fmt(r); }
    const m = /^(?:(.)?([<>^=]))?([+\- ])?(#)?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/s.exec(spec);
    const bad = () => new PyError('ValueError', `Invalid format specifier '${spec}' for object of type '${typeName(x)}'`);
    if (!m) throw bad();
    let [, fill, align, sign, alt, zero, width, group, prec, type] = m;
    const code = c => new PyError('ValueError', `Unknown format code '${c}' for object of type '${typeName(x)}'`);
    if (zero && !align) { fill = '0'; align = '='; }
    fill = fill || ' ';
    const numeric = isNum(x) && !(x.t === 'bool' && !type);
    let body, neg = false, prefix = '';
    if (!numeric) {
      if (type && type !== 's') throw code(type);
      if (sign) throw new PyError('ValueError', 'Sign not allowed in string format specifier');
      body = fmt(x);
      if (prec != null) body = body.slice(0, +prec);
    } else {
      const n = num(x), isInt = x.t === 'int' || x.t === 'bool';
      neg = n < 0 || Object.is(n, -0);
      const a = Math.abs(n);
      let t = type || (isInt ? 'd' : '');
      if (isInt && 'eEfFgG%'.includes(t) === false && !'dbcoxXn'.includes(t)) throw code(t);
      if (!isInt && 'dbcoxX'.includes(t) && t !== '') throw code(t);
      if (!isFinite(a)) body = isNaN(a) ? 'nan' : 'inf';
      else switch (t) {
        case 'd': case 'n': body = String(a); break;
        case 'b': body = a.toString(2); if (alt) prefix = '0b'; break;
        case 'o': body = a.toString(8); if (alt) prefix = '0o'; break;
        case 'x': body = a.toString(16); if (alt) prefix = '0x'; break;
        case 'X': body = a.toString(16).toUpperCase(); if (alt) prefix = '0X'; break;
        case 'c': body = String.fromCodePoint(a); break;
        case 'f': case 'F': body = fixedHalfEven(a, prec != null ? +prec : 6); if (alt && !body.includes('.')) body += '.'; break;
        case 'e': case 'E': body = expForm(a, prec != null ? +prec : 6, t === 'E'); break;
        case 'g': case 'G': body = generalForm(a, prec != null ? +prec : 6, alt, t === 'G', false); break;
        case '%': body = fixedHalfEven(a * 100, prec != null ? +prec : 6) + '%'; break;
        case '': body = prec != null ? generalForm(a, +prec, alt, false, true) : fmtFloat(a); break;
      }
      if (group) {
        const [ip, ...restParts] = body.split('.');
        body = ip.replace(/\B(?=(\d{3})+(?!\d))/g, group) + (restParts.length ? '.' + restParts.join('.') : '');
      }
    }
    const signStr = numeric ? (neg ? '-' : sign === '+' ? '+' : sign === ' ' ? ' ' : '') : '';
    const w = +width || 0;
    const content = signStr + prefix + body;
    if (content.length >= w) return content;
    const pad = w - content.length;
    const al = align || (numeric ? '>' : '<');
    if (al === '=') return signStr + prefix + fill.repeat(pad) + body;
    if (al === '>') return fill.repeat(pad) + content;
    if (al === '^') return fill.repeat(Math.floor(pad / 2)) + content + fill.repeat(Math.ceil(pad / 2));
    return content + fill.repeat(pad);
  }

  /* ---------- program structure ---------- */
  // Python 3.13+ strips the common indentation from docstring lines after the first
  function cleanDoc(d) {
    const lines = d.split('\n');
    const rest = lines.slice(1);
    const ind = Math.min(...rest.filter(l => l.trim()).map(l => l.match(/^[ \t]*/)[0].length), Infinity);
    return [lines[0].replace(/^[ \t]+/, ''), ...rest.map(l => (l.trim() ? l.slice(ind === Infinity ? 0 : ind) : ''))].join('\n');
  }
  // at the end of a line: how many brackets are open, and is a triple-quoted string still open?
  function scanLine(src) {
    let q = null, tq = null, depth = 0;
    for (let k = 0; k < src.length; k++) {
      const c = src[k];
      if (tq) { if (src.startsWith(tq, k)) { k += 2; tq = null; } else if (c === '\\') k++; continue; }
      if (q) { if (c === '\\') k++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") { if (src.startsWith(c.repeat(3), k)) { tq = c.repeat(3); k += 2; } else q = c; }
      else if (c === '#') break;
      else if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) depth--;
    }
    return { depth, tq };
  }
  function openDepth(src) {
    let q = null, depth = 0;
    for (let k = 0; k < src.length; k++) {
      const c = src[k];
      if (q) { if (c === '\\') k++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '#') break;
      else if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) depth--;
    }
    return depth;
  }
  // split a line at top-level semicolons (outside strings and brackets)
  function splitSemis(src) {
    if (!src.includes(';')) return [src];
    const parts = [];
    let q = null, depth = 0, start = 0;
    for (let k = 0; k < src.length; k++) {
      const c = src[k];
      if (q) { if (c === '\\') k++; else if (c === q) q = null; continue; }
      if (c === '"' || c === "'") q = c;
      else if (c === '#') break;
      else if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) depth--;
      else if (c === ';' && depth === 0) { parts.push(src.slice(start, k)); start = k + 1; }
    }
    if (!parts.length) return [src];
    parts.push(src.slice(start));
    const ind = src.match(/^ */)[0];
    // compound headers like "if x: a; b" keep their inline body whole
    if (/^\s*(if|elif|else|for|while|def|class|with|try|except|finally|match|case)\b/.test(parts[0])) return [src];
    return parts.map((p, n) => (n ? ind + p.trim() : p.replace(/\s+$/, ''))).filter(p => p.trim());
  }
  function compile(lines) {
    const items = [];
    for (let i = 0; i < lines.length; i++) {
      let src = lines[i];
      if (!src.trim() || /^\s*#/.test(src)) continue;
      // inside open brackets (or after a backslash) the statement goes on to the next line
      const start = i;
      // inside a triple-quoted string the next line belongs to it, newline and spaces included
      let st = scanLine(src);
      while (i + 1 < lines.length && (st.tq || st.depth > 0 || /\\\s*$/.test(src))) {
        if (st.tq) src = src + '\n' + lines[++i];
        else src = src.replace(/\\\s*$/, '') + ' ' + lines[++i].trim();
        st = scanLine(src);
      }
      for (const part of splitSemis(src)) items.push({ i: start, indent: part.match(/^ */)[0].length, src: part });
    }
    let pos = 0;
    const parse = it => makeParser(tokenize(it.src, it.i + 1), it.i + 1).statement();
    const synErr = (msg, ln) => new PyError('SyntaxError', msg, ln);

    function bodyOf(st, it, ctx) {
      if (st.inline) {
        const s = makeParser(st.inline, it.i + 1).simple();
        check(s, it.i, ctx);
        return [{ ...s, line: it.i }];
      }
      const nx = items[pos];
      if (!nx || nx.indent <= it.indent) {
        const what = st.n === 'def' ? `function definition on line ${it.i + 1}` : st.n === 'class' ? `class definition on line ${it.i + 1}` : `'${st.n}' statement on line ${it.i + 1}`;
        throw new PyError('IndentationError', `expected an indented block after ${what}`, nx ? nx.i : it.i);
      }
      return block(nx.indent, ctx);
    }
    function check(s, ln, ctx) {
      if ((s.n === 'break' || s.n === 'continue') && !ctx.loop) throw synErr(`'${s.n}' ${s.n === 'continue' ? 'not properly in loop' : 'outside loop'}`, ln);
      if (s.n === 'return' && !ctx.fn) throw synErr("'return' outside function", ln);
      if (s.n === 'yield') { if (!ctx.fn) throw synErr("'yield' outside function", ln); ctx.gen.yes = true; }
      if (s.n === 'nonlocal' && !ctx.fn) throw synErr('nonlocal declaration not allowed at module level', ln);
    }
    function block(indent, ctx) {
      const out = [];
      let decos = [];
      while (pos < items.length) {
        const it = items[pos];
        if (it.indent < indent) break;
        if (it.indent > indent) {
          const prev = items[pos - 1];
          if (prev && prev.indent > it.indent) throw new PyError('IndentationError', 'unindent does not match any outer indentation level', it.i);
          throw new PyError('IndentationError', 'unexpected indent', it.i);
        }
        const st = parse(it);
        pos++;
        if (st.n === 'decorator') { decos.push({ e: st.e, line: it.i }); continue; }
        if (decos.length && st.n !== 'def' && st.n !== 'class') throw synErr('invalid syntax', it.i);
        const nextSame = () => (pos < items.length && items[pos].indent === indent ? parse(items[pos]) : null);
        if (st.n === 'if') {
          const node = { n: 'if', line: it.i, branches: [{ cond: st.cond, line: it.i, body: bodyOf(st, it, ctx) }], orelse: null, elseLine: null };
          for (let nx = nextSame(); nx; nx = nextSame()) {
            const nit = items[pos];
            if (nx.n === 'elif') { pos++; node.branches.push({ cond: nx.cond, line: nit.i, body: bodyOf(nx, nit, ctx) }); }
            else if (nx.n === 'else') { pos++; node.elseLine = nit.i; node.orelse = bodyOf(nx, nit, ctx); break; }
            else break;
          }
          out.push(node);
        } else if (st.n === 'for' || st.n === 'while') {
          const body = bodyOf(st, it, { ...ctx, loop: true });
          const node = { ...st, inline: undefined, line: it.i, body, orelse: null };
          const nx = nextSame();
          if (nx && nx.n === 'else') { const nit = items[pos]; pos++; node.elseLine = nit.i; node.orelse = bodyOf(nx, nit, ctx); }
          out.push(node);
        } else if (st.n === 'with') {
          const body = bodyOf(st, it, ctx);
          out.push({ n: 'with', items: st.items, e: st.e, as: st.as, line: it.i, body });
        } else if (st.n === 'match') {
          const nx0 = items[pos];
          if (!nx0 || nx0.indent <= it.indent) throw new PyError('IndentationError', `expected an indented block after 'match' statement on line ${it.i + 1}`, nx0 ? nx0.i : it.i);
          const cind = nx0.indent, cases = [];
          while (pos < items.length && items[pos].indent === cind) {
            const cit = items[pos], cst = parse(cit);
            if (cst.n !== 'case') throw synErr('invalid syntax', cit.i);
            pos++;
            cases.push({ pat: cst.pat, guard: cst.guard, line: cit.i, body: bodyOf(cst, cit, ctx) });
          }
          if (pos < items.length && items[pos].indent > it.indent && items[pos].indent !== cind) throw new PyError('IndentationError', 'unindent does not match any outer indentation level', items[pos].i);
          out.push({ n: 'match', e: st.e, cases, line: it.i });
        } else if (st.n === 'case') {
          throw synErr('invalid syntax', it.i);
        } else if (st.n === 'def') {
          const gen = { yes: false };
          const body = bodyOf(st, it, { loop: false, fn: true, gen });
          const locals = new Set(st.params.filter(q => q.name).map(q => q.name));
          collectAssigned(body, locals);
          const globalNames = new Set(), nonlocalNames = new Set();
          collectDeclared(body, globalNames, nonlocalNames);
          for (const n of [...globalNames, ...nonlocalNames]) locals.delete(n);
          out.push({ n: 'def', name: st.name, params: st.params, body, locals, globalNames, nonlocalNames, isGen: gen.yes, decos, line: it.i });
          decos = [];
        } else if (st.n === 'class') {
          const body = bodyOf(st, it, { loop: false, fn: false, gen: { yes: false }, cls: true });
          out.push({ n: 'class', name: st.name, bases: st.bases, body, decos, line: it.i });
          decos = [];
        } else if (st.n === 'try') {
          const node = { n: 'try', line: it.i, body: bodyOf(st, it, ctx), handlers: [], orelse: null, fin: null };
          for (let nx = nextSame(); nx; nx = nextSame()) {
            const nit = items[pos];
            if (nx.n === 'except') { pos++; node.handlers.push({ types: nx.types, type: nx.type, as: nx.as, line: nit.i, body: bodyOf(nx, nit, ctx) }); }
            else if (nx.n === 'else' && node.handlers.length && !node.orelse) { pos++; node.orelse = bodyOf(nx, nit, ctx); node.elseLine = nit.i; }
            else if (nx.n === 'finally') { pos++; node.fin = bodyOf(nx, nit, ctx); node.finLine = nit.i; break; }
            else break;
          }
          if (!node.handlers.length && !node.fin) throw synErr("expected 'except' or 'finally' block", items[pos] ? items[pos].i : it.i);
          out.push(node);
        } else if (['elif', 'else', 'except', 'finally'].includes(st.n)) {
          throw synErr('invalid syntax', it.i);
        } else {
          check(st, it.i, ctx);
          out.push({ ...st, line: it.i });
        }
      }
      if (decos.length) throw synErr('invalid syntax', decos[decos.length - 1].line);
      return out;
    }
    function patNames(pt, set) {
      if (!pt) return;
      if (pt.k === 'capture') set.add(pt.name);
      else if (pt.k === 'as') { set.add(pt.name); patNames(pt.pat, set); }
      else if (pt.k === 'or') pt.alts.forEach(a => patNames(a, set));
      else if (pt.k === 'seq') pt.items.forEach(a => (a.k === 'star' ? a.name && set.add(a.name) : patNames(a, set)));
    }
    function collectDeclared(stmts, g, nl) {
      for (const s of stmts) {
        if (s.n === 'global') s.names.forEach(n => g.add(n));
        else if (s.n === 'nonlocal') s.names.forEach(n => nl.add(n));
        else if (s.n === 'def' || s.n === 'class') continue;
        for (const b of [s.body, s.orelse, s.fin, ...(s.branches || []).map(x => x.body), ...(s.handlers || []).map(x => x.body), ...(s.cases || []).map(x => x.body)]) if (b) collectDeclared(b, g, nl);
      }
    }
    function collectAssigned(stmts, set) {
      const addT = t => { if (t.n === 'name') set.add(t.name); else if (t.n === 'tuple') t.items.forEach(addT); else if (t.n === 'star') addT(t.e); };
      for (const s of stmts) {
        if (s.n === 'assign') s.targets.forEach(addT);
        else if (s.n === 'aug') addT(s.target);
        else if (s.n === 'for') { addT(s.target); collectAssigned(s.body, set); if (s.orelse) collectAssigned(s.orelse, set); }
        else if (s.n === 'def' || s.n === 'class') set.add(s.name);
        else if (s.n === 'match') for (const c of s.cases) { patNames(c.pat, set); collectAssigned(c.body, set); }
        else if (s.n === 'import') s.names.forEach(x => set.add(x.as || x.mod.split('.')[0]));
        else if (s.n === 'fromimport') s.names.forEach(x => set.add(x.as || x.name));
        else if (s.n === 'if') { s.branches.forEach(b => collectAssigned(b.body, set)); if (s.orelse) collectAssigned(s.orelse, set); }
        else if (s.n === 'while') { collectAssigned(s.body, set); if (s.orelse) collectAssigned(s.orelse, set); }
        else if (s.n === 'with') { s.items.forEach(x => { if (x.as) set.add(x.as); }); collectAssigned(s.body, set); }
        else if (s.n === 'try') { collectAssigned(s.body, set); s.handlers.forEach(h => { if (h.as) set.add(h.as); collectAssigned(h.body, set); }); if (s.orelse) collectAssigned(s.orelse, set); if (s.fin) collectAssigned(s.fin, set); }
      }
    }
    if (items.length && items[0].indent > 0) throw new PyError('IndentationError', 'unexpected indent', items[0].i);
    const prog = block(0, { loop: false, fn: false, gen: { yes: false } });
    if (pos < items.length) throw new PyError('IndentationError', 'unindent does not match any outer indentation level', items[pos].i);
    return prog;
  }

  /* ---------- values ---------- */
  const isNum = x => x.t === 'int' || x.t === 'float' || x.t === 'bool';
  const num = x => (x.t === 'bool' ? (x.v ? 1 : 0) : x.v);
  const mkNum = (n, f) => (f ? V.float(n) : V.int(n));
  const isSeq = x => x.t === 'list' || x.t === 'tuple';
  const DONE = Symbol('done');
  const NOTIMPL = { t: 'NotImplementedType' };
  let OBJID = 0;
  const oid = x => x.id || (x.id = ++OBJID);
  function truthy(x) {
    switch (x.t) {
      case 'bool': return x.v;
      case 'int': case 'float': return x.v !== 0;
      case 'str': return x.v.length > 0;
      case 'list': case 'tuple': case 'dict_keys': case 'dict_values': case 'dict_items': return x.v.length > 0;
      case 'dict': case 'set': return x.v.size > 0;
      case 'range': return rangeLen(x) > 0;
      case 'NoneType': return false;
      case 'instance': {
        const b = classAttr(x.cls, '__bool__');
        if (b) { const r = userCall(b, [x]); if (r.t !== 'bool') throw new PyError('TypeError', `__bool__ should return bool, returned ${typeName(r)}`); return r.v; }
        if (classAttr(x.cls, '__len__')) return lenOf(x) > 0;
        return true;
      }
      default: return true;
    }
  }
  function keyOf(x) {
    switch (x.t) {
      case 'str': return 's:' + x.v;
      case 'int': case 'float': case 'bool': return 'n:' + num(x);
      case 'NoneType': return 'None';
      case 'tuple': return 't:(' + x.v.map(keyOf).join(',') + ')';
      case 'type': return 'y:' + x.v;
      case 'exctype': return 'e:' + x.v;
      case 'instance': {
        const h = classAttr(x.cls, '__hash__');
        if (h && h.t !== 'NoneType') { const r = userCall(h, [x]); return 'h:' + num(r); }
        if (h && h.t === 'NoneType') throw new PyError('TypeError', `unhashable type: '${x.cls.name}'`);
        if (classAttr(x.cls, '__eq__')) throw new PyError('TypeError', `unhashable type: '${x.cls.name}'`);
        return 'o:' + oid(x);
      }
      case 'class': case 'function': case 'builtin': case 'native': case 'module': case 'boundmethod': return 'o:' + oid(x);
      case 'set': if (x.frozen) return 'f:{' + [...x.v.keys()].sort().join(',') + '}'; throw new PyError('TypeError', "unhashable type: 'set'");
      default: throw new PyError('TypeError', `unhashable type: '${typeName(x)}'`);
    }
  }
  const rangeLen = r => Math.max(0, Math.ceil((r.stop - r.start) / r.step));
  // set printing order. CPython orders small non-negative ints by value; anything
  // else (strings especially) comes out in an order that changes from run to run.
  function setOrder(x, note) {
    const vals = [...x.v.values()];
    if (vals.length > 1) {
      if (vals.every(v => (v.t === 'int' || v.t === 'bool') && num(v) >= 0 && num(v) < 8)) return vals.slice().sort((a, b) => num(a) - num(b));
      if (note && CUR && !SAFE) CUR.unordered = true;
    }
    return vals;
  }
  const mkSet = vals => { const s = { t: 'set', v: new Map() }; for (const v of vals) s.v.set(keyOf(v), v); return s; };

  const NL = String.fromCharCode(10);
  // Python's strip(chars): remove any of the given characters (or whitespace) from the ends
  function stripChars(s, chars, left, right) {
    const drop = c => (chars == null ? /\s/.test(c) : chars.includes(c));
    let a = 0, b = s.length;
    if (left) while (a < b && drop(s[a])) a++;
    if (right) while (b > a && drop(s[b - 1])) b--;
    return s.slice(a, b);
  }

  /* ---------- the virtual bookshelf (files) ---------- */
  // text mode reads \r\n and \r as \n (Python's universal newlines), unless newline="" was given
  const fileText = f => { const t = f.fs.get(f.name) || ''; return f.universal ? t.replace(/\r\n?/g, '\n') : t; };
  function needOpen(f) { if (f.closed) throw new PyError('ValueError', 'I/O operation on closed file.'); }
  function needRead(f) { needOpen(f); if (f.mode !== 'r') throw new PyError('UnsupportedOperation', 'not readable'); }
  function needWrite(f) { needOpen(f); if (f.mode === 'r') throw new PyError('UnsupportedOperation', 'not writable'); }
  function readRest(f) { const all = fileText(f), rest = all.slice(f.pos); f.pos = all.length; return rest; }
  function readLine(f) { const all = fileText(f), nl = all.indexOf('\n', f.pos), end = nl < 0 ? all.length : nl + 1; const s = all.slice(f.pos, end); f.pos = end; return s; }
  const splitKeepEnds = text => text.match(/[^\n]*\n|[^\n]+$/g) || [];
  function openFile(args, kw, ctx) {
    const name = args[0], mode = args[1] || kw.mode || V.str('r');
    if (!name) throw new PyError('TypeError', "open() missing required argument 'file' (pos 1)");
    if (name.t !== 'str' && !(name.t === 'instance' && name.attrs.has('_path'))) throw new PyError('TypeError', `expected str, bytes or os.PathLike object, not ${typeName(name)}`);
    const shown = name.t === 'str' ? name.v : name.attrs.get('_path').v;
    const key = normPath(shown);
    if (mode.t !== 'str') throw new PyError('TypeError', `open() argument 'mode' must be str, not ${typeName(mode)}`);
    const m = mode.v.replace('t', '');
    if (!['r', 'w', 'a'].includes(m)) throw new PyError('ValueError', `invalid mode: ${strRepr(mode.v)}`);
    if (m === 'r' && !ctx.fs.has(key)) throw new PyError(ctx.dirs && ctx.dirs.has(key) ? 'IsADirectoryError' : 'FileNotFoundError', `[Errno ${ctx.dirs && ctx.dirs.has(key) ? 21 : 2}] ${ctx.dirs && ctx.dirs.has(key) ? 'Is a directory' : 'No such file or directory'}: ${strRepr(shown)}`);
    if (m !== 'r' && !isDirPath(ctx, parentPath(key))) throw new PyError('FileNotFoundError', `[Errno 2] No such file or directory: ${strRepr(shown)}`);
    if (m === 'w') { ctx.fs.set(key, ''); ctx.emit({ kind: 'file', name: key, text: '' }); }
    if (m === 'a' && !ctx.fs.has(key)) { ctx.fs.set(key, ''); ctx.emit({ kind: 'file', name: key, text: '' }); }
    const universal = !(kw.newline && kw.newline.t === 'str' && kw.newline.v === '');
    return { t: 'file', name: key, mode: m, pos: 0, closed: false, fs: ctx.fs, universal };
  }
  // like Python, writes wait in a buffer until the file is flushed or closed
  function writeFile(f, text, ctx) {
    needWrite(f);
    f.pending = (f.pending || '') + text;
    (ctx.openFiles || (ctx.openFiles = new Set())).add(f);
    if (f.pending.length >= 8192) flushFile(f, ctx);
  }
  function flushFile(f, ctx) {
    if (!f.pending) return;
    const all = (f.fs.get(f.name) || '') + f.pending;
    f.pending = '';
    f.fs.set(f.name, all);
    ctx.emit({ kind: 'file', name: f.name, text: all });
  }
  function fileMethod(f, name, args, ctx) {
    switch (name) {
      case 'read': {
        argCount(name, args, 0, 1); needRead(f);
        if (args.length && args[0].t === 'int' && args[0].v >= 0) { const all = fileText(f), s = all.slice(f.pos, f.pos + args[0].v); f.pos += s.length; return V.str(s); }
        return V.str(readRest(f));
      }
      case 'readline': argCount(name, args, 0); needRead(f); return V.str(readLine(f));
      case 'readlines': argCount(name, args, 0); needRead(f); return V.list(splitKeepEnds(readRest(f)).map(V.str));
      case 'write': {
        argCount(name, args, 1); needWrite(f);
        if (args[0].t !== 'str') throw new PyError('TypeError', `write() argument must be str, not ${typeName(args[0])}`);
        writeFile(f, args[0].v, ctx);
        return V.int(args[0].v.length);
      }
      case 'close': argCount(name, args, 0); flushFile(f, ctx); f.closed = true; return V.none;
      case 'flush': argCount(name, args, 0); flushFile(f, ctx); return V.none;
      case 'writelines': argCount(name, args, 1); needWrite(f); for (const x of iterate(args[0])) { if (x.t !== 'str') throw new PyError('TypeError', 'write() argument must be str, not ' + typeName(x)); writeFile(f, x.v, ctx); } return V.none;
    }
  }

  /* ---------- iteration: everything is pulled one item at a time ---------- */
  const ITER_KIND = { list: 'list_iterator', tuple: 'tuple_iterator', str: 'str_ascii_iterator', dict: 'dict_keyiterator', set: 'set_iterator', range: 'range_iterator', dict_keys: 'dict_keyiterator', dict_values: 'dict_valueiterator', dict_items: 'dict_itemiterator' };
  function iterOf(x) {
    switch (x.t) {
      case 'list': case 'tuple': case 'dict_keys': case 'dict_values': case 'dict_items': { let i = 0; return { next: () => (i < x.v.length ? x.v[i++] : DONE) }; }
      case 'str': { const cs = [...x.v]; let i = 0; return { next: () => (i < cs.length ? V.str(cs[i++]) : DONE) }; }
      case 'dict': { const ks = [...x.v.values()].map(e => e[0]); let i = 0; return { next: () => (i < ks.length ? ks[i++] : DONE) }; }
      case 'set': { const vs = setOrder(x); let i = 0; return { next: () => (i < vs.length ? vs[i++] : DONE) }; }
      case 'range': { let i = 0; const n = rangeLen(x); return { next: () => (i < n ? V.int(x.start + (i++) * x.step) : DONE) }; }
      case 'file': needRead(x); return { next: () => { needRead(x); const s = readLine(x); return s ? V.str(s) : DONE; } };
      case 'generator': case 'iterator': return x;
      case 'instance': {
        const it = classAttr(x.cls, '__iter__');
        if (it) {
          const r = userCall(it, [x]);
          if (r.t === 'instance') {
            const nx = classAttr(r.cls, '__next__');
            if (!nx) throw new PyError('TypeError', `iter() returned non-iterator of type '${r.cls.name}'`);
            return { next: () => { try { return userCall(nx, [r]); } catch (e) { if (e instanceof PyError && e.pyType === 'StopIteration') return DONE; throw e; } } };
          }
          if (r.t === 'generator' || r.t === 'iterator') return r;
          throw new PyError('TypeError', `iter() returned non-iterator of type '${typeName(r)}'`);
        }
        const gi = classAttr(x.cls, '__getitem__');
        if (gi) { let i = 0; return { next: () => { try { return userCall(gi, [x, V.int(i++)]); } catch (e) { if (e instanceof PyError && (e.pyType === 'IndexError' || e.pyType === 'StopIteration')) return DONE; throw e; } } }; }
        break;
      }
    }
    throw new PyError('TypeError', `'${typeName(x)}' object is not iterable`);
  }
  // pull everything (bounded, so an endless generator becomes a SpellTimeout)
  function iterate(x) {
    if (x.t === 'list' || x.t === 'tuple' || x.t === 'dict_keys' || x.t === 'dict_values' || x.t === 'dict_items') return x.v;
    const it = iterOf(x), out = [];
    for (;;) {
      const v = it.next();
      if (v === DONE) return out;
      out.push(v);
      if (out.length > MAX_STEPS) tick({ steps: MAX_STEPS });
    }
  }
  const mkIter = (kind, nx) => ({ t: 'iterator', kind, next: nx });
  // list(), join() and friends on an unordered set
  const noteOrder = x => { if (x.t === 'set') setOrder(x, true); };

  /* ---------- comparing ---------- */
  const CMP_DUNDER = { '<': '__lt__', '>': '__gt__', '<=': '__le__', '>=': '__ge__', '==': '__eq__', '!=': '__ne__' };
  const CMP_REFLECT = { '<': '__gt__', '>': '__lt__', '<=': '__ge__', '>=': '__le__', '==': '__eq__', '!=': '__ne__' };
  // a user class answers the comparison; null means "no answer"
  function richCmp(op, a, b) {
    if (a.t === 'instance') { const m = classAttr(a.cls, CMP_DUNDER[op]); if (m) { const r = userCall(m, [a, b]); if (r !== NOTIMPL) return truthy(r); } }
    if (b.t === 'instance') { const m = classAttr(b.cls, CMP_REFLECT[op]); if (m) { const r = userCall(m, [b, a]); if (r !== NOTIMPL) return truthy(r); } }
    if (op === '!=') { const r = richCmp('==', a, b); if (r !== null) return !r; }
    return null;
  }
  const PRIM = ['int', 'float', 'bool', 'str', 'NoneType'];
  function identical(a, b) {
    if (a === b) return true;
    if (PRIM.includes(a.t) && a.t === b.t) return a.v === b.v;
    if (a.t === 'type' && b.t === 'type') return a.v === b.v;
    if (a.t === 'exctype' && b.t === 'exctype') return a.v === b.v;
    if (a.t === 'spell' && b.t === 'spell') return a.v === b.v;
    if (a.t === 'builtin' && b.t === 'builtin') return a.v === b.v;
    return false;
  }
  function equal(a, b) {
    if (a.t === 'instance' || b.t === 'instance') { const r = richCmp('==', a, b); return r === null ? a === b : r; }
    if (isNum(a) && isNum(b)) return num(a) === num(b);
    if (a.t !== b.t) return false;
    if (isSeq(a) || a.t === 'dict_keys' || a.t === 'dict_values' || a.t === 'dict_items') return a.v.length === b.v.length && a.v.every((x, i) => equal(x, b.v[i]));
    if (a.t === 'dict') {
      if (a.v.size !== b.v.size) return false;
      for (const [k, [, va]] of a.v) { const e = b.v.get(k); if (!e || !equal(va, e[1])) return false; }
      return true;
    }
    if (a.t === 'set') return a.v.size === b.v.size && [...a.v.keys()].every(k => b.v.has(k));
    if (a.t === 'range') return rangeLen(a) === rangeLen(b) && (rangeLen(a) === 0 || (a.start === b.start && (rangeLen(a) === 1 || a.step === b.step)));
    if (a.t === 'exception') return a === b;
    return identical(a, b);
  }
  function less(a, b, op) {
    if (a.t === 'instance' || b.t === 'instance') {
      const r = richCmp('<', a, b);
      if (r !== null) return r;
      throw new PyError('TypeError', `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`);
    }
    if (isNum(a) && isNum(b)) return num(a) < num(b);
    if (a.t === 'str' && b.t === 'str') return a.v < b.v;
    if (isSeq(a) && a.t === b.t) {
      for (let i = 0; i < Math.min(a.v.length, b.v.length); i++) {
        if (!equal(a.v[i], b.v[i])) return less(a.v[i], b.v[i], op);
      }
      return a.v.length < b.v.length;
    }
    throw new PyError('TypeError', `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`);
  }
  function contains(b, a) {
    if (b.t === 'str') {
      if (a.t !== 'str') throw new PyError('TypeError', `'in <string>' requires string as left operand, not ${typeName(a)}`);
      return b.v.includes(a.v);
    }
    if (b.t === 'dict' || b.t === 'set') return b.v.has(keyOf(a));
    if (b.t === 'range') return (a.t === 'int' || a.t === 'bool') && iterate(b).some(x => x.v === num(a));
    if (['list', 'tuple', 'dict_keys', 'dict_values', 'dict_items'].includes(b.t)) return b.v.some(x => identical(x, a) || equal(x, a));
    if (b.t === 'instance') {
      const c = classAttr(b.cls, '__contains__');
      if (c) return truthy(userCall(c, [b, a]));
    }
    if (['instance', 'generator', 'iterator'].includes(b.t)) {
      const it = iterOf(b);
      for (;;) { const v = it.next(); if (v === DONE) return false; if (equal(v, a)) return true; }
    }
    throw new PyError('TypeError', `argument of type '${typeName(b)}' is not iterable`);
  }
  const isSubset = (a, b) => [...a.v.keys()].every(k => b.v.has(k));
  function compare(op, a, b) {
    if (op === 'is') return identical(a, b);
    if (op === 'is not') return !identical(a, b);
    if (op === 'in') return contains(b, a);
    if (op === 'not in') return !contains(b, a);
    if (a.t === 'instance' || b.t === 'instance') {
      const r = richCmp(op, a, b);
      if (r !== null) return r;
      if (op === '==') return a === b;
      if (op === '!=') return a !== b;
      throw new PyError('TypeError', `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`);
    }
    if (a.t === 'set' && b.t === 'set' && !['==', '!='].includes(op)) {
      if (op === '<=') return isSubset(a, b);
      if (op === '>=') return isSubset(b, a);
      if (op === '<') return a.v.size < b.v.size && isSubset(a, b);
      if (op === '>') return b.v.size < a.v.size && isSubset(b, a);
    }
    switch (op) {
      case '==': return equal(a, b);
      case '!=': return !equal(a, b);
      case '<': return less(a, b, op);
      case '>': return less(b, a, op);
      case '<=': return less(a, b, op) || equal(a, b);
      case '>=': return less(b, a, op) || equal(a, b);
    }
  }

  /* ---------- arithmetic ---------- */
  // "%s has %5.2f gold" % (name, gold): the old printf-style formatting
  function pyPercent(f, args) {
    let i = 0, mapping = null;
    if (!Array.isArray(args)) { mapping = args; args = []; }
    const out = f.replace(/%(?:\((\w+)\))?([-+ #0]*)(\d+)?(?:\.(\d+))?([sdirfFeEgGxXoc%]|.)?/g, (all, key, flags, width, prec, type) => {
      if (type === '%') return '%';
      if (!type || !'sdirfFeEgGxXoc'.includes(type)) throw new PyError('ValueError', `unsupported format character '${type || ''}' (0x${(type || ' ').charCodeAt(0).toString(16)})`);
      let v;
      if (key != null) {
        if (!mapping || mapping.t !== 'dict') throw new PyError('TypeError', 'format requires a mapping');
        const e = mapping.v.get(keyOf(V.str(key)));
        if (!e) throw new PyError('KeyError', strRepr(key));
        v = e[1];
      } else {
        if (i >= args.length) throw new PyError('TypeError', 'not enough arguments for format string');
        v = args[i++];
      }
      const left = flags.includes('-');
      if (type === 's' || type === 'r') {
        let body = type === 's' ? fmt(v) : repr(v);
        if (prec != null) body = body.slice(0, +prec);
        const w = width ? +width : 0;
        return left ? body.padEnd(w) : body.padStart(w);
      }
      if (type === 'c') { const body = v.t === 'str' ? v.v : String.fromCodePoint(num(v)); const w = width ? +width : 0; return left ? body.padEnd(w) : body.padStart(w); }
      if (!isNum(v)) throw new PyError('TypeError', `%${type} format: a real number is required, not ${typeName(v)}`);
      const t = type === 'i' ? 'd' : type;
      const val = 'dxXo'.includes(t) ? V.int(Math.trunc(num(v))) : V.float(num(v));
      const spec = (left ? '<' : '') + (flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : '') + (flags.includes('#') ? '#' : '') + (flags.includes('0') && !left ? '0' : '') + (width || '') + (prec != null && !'dxXo'.includes(t) ? '.' + prec : '') + t;
      return formatSpec(val, spec);
    });
    if (!mapping && i < args.length) throw new PyError('TypeError', 'not all arguments converted during string formatting');
    return out;
  }
  const BIN_DUNDER = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'truediv', '//': 'floordiv', '%': 'mod', '**': 'pow', '@': 'matmul', '&': 'and', '|': 'or', '^': 'xor' };
  function binop(op, a, b, inplace) {
    if (a.t === 'instance' || b.t === 'instance') {
      const nm = BIN_DUNDER[op];
      if (inplace && a.t === 'instance') { const m = classAttr(a.cls, `__i${nm}__`); if (m) { const r = userCall(m, [a, b]); if (r !== NOTIMPL) return r; } }
      if (a.t === 'instance') { const m = classAttr(a.cls, `__${nm}__`); if (m) { const r = userCall(m, [a, b]); if (r !== NOTIMPL) return r; } }
      if (b.t === 'instance') { const m = classAttr(b.cls, `__r${nm}__`); if (m) { const r = userCall(m, [b, a]); if (r !== NOTIMPL) return r; } }
      throw new PyError('TypeError', `unsupported operand type(s) for ${op}${inplace ? '=' : ''}: '${typeName(a)}' and '${typeName(b)}'`);
    }
    const anyFloat = a.t === 'float' || b.t === 'float';
    const unsupported = () => new PyError('TypeError', `unsupported operand type(s) for ${op}: '${typeName(a)}' and '${typeName(b)}'`);
    if (op === '+') {
      if (isNum(a) && isNum(b)) return mkNum(num(a) + num(b), anyFloat);
      if (a.t === 'str' && b.t === 'str') return V.str(a.v + b.v);
      if (a.t === 'list' && b.t === 'list') return V.list([...a.v, ...b.v]);
      if (a.t === 'tuple' && b.t === 'tuple') return V.tuple([...a.v, ...b.v]);
      if (a.t === 'str' || a.t === 'list' || a.t === 'tuple') throw new PyError('TypeError', `can only concatenate ${a.t} (not "${typeName(b)}") to ${a.t}`);
      throw unsupported();
    }
    if (op === '-') {
      if (isNum(a) && isNum(b)) return mkNum(num(a) - num(b), anyFloat);
      if (a.t === 'set' && b.t === 'set') return mkSet([...a.v].filter(([k]) => !b.v.has(k)).map(e => e[1]));
      throw unsupported();
    }
    if (op === '*') {
      if (isNum(a) && isNum(b)) return mkNum(num(a) * num(b), anyFloat);
      const rep = (s, n) => {
        if (s.t === 'str') return V.str(s.v.repeat(Math.max(0, n)));
        const out = []; for (let i = 0; i < n; i++) out.push(...s.v);
        return s.t === 'list' ? V.list(out) : V.tuple(out);
      };
      if (['str', 'list', 'tuple'].includes(a.t) && (b.t === 'int' || b.t === 'bool')) return rep(a, num(b));
      if (['str', 'list', 'tuple'].includes(b.t) && (a.t === 'int' || a.t === 'bool')) return rep(b, num(a));
      if (['str', 'list', 'tuple'].includes(a.t) || ['str', 'list', 'tuple'].includes(b.t)) {
        const other = ['str', 'list', 'tuple'].includes(a.t) ? b : a;
        throw new PyError('TypeError', `can't multiply sequence by non-int of type '${typeName(other)}'`);
      }
      throw unsupported();
    }
    if (op === '/') {
      if (isNum(a) && isNum(b)) { if (num(b) === 0) throw new PyError('ZeroDivisionError', 'division by zero'); return V.float(num(a) / num(b)); }
      throw unsupported();
    }
    if (op === '//') {
      if (isNum(a) && isNum(b)) {
        if (num(b) === 0) throw new PyError('ZeroDivisionError', anyFloat ? 'float floor division by zero' : 'integer division or modulo by zero');
        return mkNum(Math.floor(num(a) / num(b)), anyFloat);
      }
      throw unsupported();
    }
    if (op === '%') {
      if (isNum(a) && isNum(b)) {
        if (num(b) === 0) throw new PyError('ZeroDivisionError', anyFloat ? 'float modulo' : 'integer modulo by zero');
        return mkNum(num(a) - num(b) * Math.floor(num(a) / num(b)), anyFloat);
      }
      if (a.t === 'str') return V.str(pyPercent(a.v, b.t === 'tuple' ? b.v : b.t === 'dict' ? b : [b]));
      throw unsupported();
    }
    if (op === '**') {
      if (isNum(a) && isNum(b)) {
        if (num(a) === 0 && num(b) < 0) throw new PyError('ZeroDivisionError', 'zero to a negative power');
        return mkNum(Math.pow(num(a), num(b)), anyFloat || num(b) < 0);
      }
      throw new PyError('TypeError', `unsupported operand type(s) for ** or pow(): '${typeName(a)}' and '${typeName(b)}'`);
    }
    if (op === '|' || op === '&' || op === '^') {
      if ((a.t === 'int' || a.t === 'bool') && (b.t === 'int' || b.t === 'bool')) {
        const r = op === '|' ? num(a) | num(b) : op === '&' ? num(a) & num(b) : num(a) ^ num(b);
        return a.t === 'bool' && b.t === 'bool' ? V.bool(r) : V.int(r);
      }
      if (a.t === 'set' && b.t === 'set') {
        if (op === '|') return mkSet([...a.v.values(), ...b.v.values()]);
        if (op === '&') return mkSet([...a.v].filter(([k]) => b.v.has(k)).map(e => e[1]));
        return mkSet([...[...a.v].filter(([k]) => !b.v.has(k)), ...[...b.v].filter(([k]) => !a.v.has(k))].map(e => e[1]));
      }
      if (op === '|' && a.t === 'dict' && b.t === 'dict') { const d = dict(); for (const [k, e] of a.v) d.v.set(k, [e[0], e[1]]); for (const [k, e] of b.v) d.v.set(k, [e[0], e[1]]); return d; }
      throw unsupported();
    }
    throw unsupported();
  }

  /* ---------- classes and objects ---------- */
  function classAttr(cls, name) {
    if (!cls || !cls.mro) return null;
    for (const c of cls.mro) if (c.dict.has(name)) return c.dict.get(name);
    return null;
  }
  // C3 linearization, so multiple inheritance orders like Python
  function linearize(cls) {
    const seqs = cls.bases.filter(b => b.t === 'class').map(b => b.mro.slice());
    seqs.push(cls.bases.filter(b => b.t === 'class'));
    const out = [cls];
    for (;;) {
      const live = seqs.filter(s => s.length);
      if (!live.length) return out;
      let head = null;
      for (const s of live) { const h = s[0]; if (!live.some(t => t.indexOf(h) > 0)) { head = h; break; } }
      if (!head) throw new PyError('TypeError', 'Cannot create a consistent method resolution order (MRO)');
      out.push(head);
      for (const s of live) if (s[0] === head) s.shift();
    }
  }
  function makeClass(name, bases, vars) {
    for (const b of bases) if (!(b.t === 'class' || b.t === 'exctype' || (b.t === 'type' && b.v === 'object'))) throw new PyError('TypeError', `bases must be types, not '${typeName(b)}'`);
    const cls = { t: 'class', name, bases: bases.filter(b => b.t !== 'type'), dict: new Map(Object.entries(vars)) };
    cls.mro = linearize(cls);
    // the nearest built-in exception this class grows from, if any
    for (const c of cls.mro) {
      const eb = c.bases.find(b => b.t === 'exctype');
      if (eb) { cls.excBase = eb.v; break; }
    }
    cls.exc = !!cls.excBase;
    for (const v of cls.dict.values()) {
      const f = v.t === 'function' ? v : v.t === 'classmethod' || v.t === 'staticmethod' ? v.fn : null;
      if (f && f.t === 'function') f.ownerClass = cls;
      if (v.t === 'property') for (const g of [v.fget, v.fset]) if (g && g.t === 'function') g.ownerClass = cls;
    }
    return cls;
  }
  const isSubclass = (c, of) => (of.t === 'class' ? c.mro.includes(of) : of.t === 'exctype' ? excChain(c.excBase).includes(of.v) : of.t === 'type' && of.v === 'object');
  function excChain(name) { const out = []; for (let c = name; c; c = excParent(c)) out.push(c); return out; }
  function excAncestry(err) {
    const o = err.obj;
    if (o && o.t === 'instance') return [...o.cls.mro.map(c => c.name), ...excChain(o.cls.excBase)];
    return excChain(err.pyType);
  }
  function makeInstance(cls, args, kw, ctx) {
    const inst = { t: 'instance', cls, attrs: new Map() };
    if (cls.exc) inst.args = args.slice();
    const init = classAttr(cls, '__init__');
    if (init) {
      const r = callValue(init, [inst, ...args], kw, ctx);
      if (r.t !== 'NoneType') throw new PyError('TypeError', `__init__() should return None, not '${typeName(r)}'`);
    } else if (!cls.exc && (args.length || Object.keys(kw).length)) throw new PyError('TypeError', `${cls.name}() takes no arguments`);
    return inst;
  }
  const bind = (fn, self) => ({ t: 'boundmethod', fn, self });
  function fromClass(v, obj, cls) {
    if (v.t === 'function' || v.t === 'native') return obj ? bind(v, obj) : v;
    if (v.t === 'classmethod') return bind(v.fn, cls);
    if (v.t === 'staticmethod') return v.fn;
    if (v.t === 'property' && obj) return userCall(v.fget, [obj]);
    return v;
  }
  const nat = (name, fn) => ({ t: 'native', name, fn });
  // methods of built-in types, used through the type itself: str.upper, list.append
  const TYPE_METHODS = { str: STR_METHODS, list: LIST_METHODS, dict: DICT_METHODS, set: SET_METHODS };
  function getAttr(obj, name, ctx) {
    const none = () => new PyError('AttributeError', `'${typeName(obj)}' object has no attribute '${name}'`);
    switch (obj.t) {
      case 'instance': {
        if (name === '__class__') return obj.cls;
        if (name === '__dict__') { const d = dict(); for (const [k, v] of obj.attrs) d.v.set(keyOf(V.str(k)), [V.str(k), v]); return d; }
        const ca = classAttr(obj.cls, name);
        if (ca && ca.t === 'property') {
          if (!ca.fget) throw new PyError('AttributeError', `property '${name}' of '${obj.cls.name}' object has no getter`);
          return userCall(ca.fget, [obj]);
        }
        if (obj.attrs.has(name)) return obj.attrs.get(name);
        if (ca) return fromClass(ca, obj, obj.cls);
        if (obj.cls.exc && name === 'args') return V.tuple(obj.args);
        if (obj.cls.exc && name === '__cause__') return obj.cause || V.none;
        const ga = classAttr(obj.cls, '__getattr__');
        if (ga) return userCall(ga, [obj, V.str(name)]);
        throw new PyError('AttributeError', `'${obj.cls.name}' object has no attribute '${name}'`);
      }
      case 'class': {
        if (name === '__name__' || name === '__qualname__') return V.str(obj.name);
        if (name === '__mro__') return V.tuple([...obj.mro, { t: 'type', v: 'object' }]);
        if (name === '__bases__') return V.tuple(obj.bases);
        const ca = classAttr(obj, name);
        if (ca) return ca.t === 'property' ? ca : fromClass(ca, null, obj);
        throw new PyError('AttributeError', `type object '${obj.name}' has no attribute '${name}'`);
      }
      case 'super': {
        const mro = obj.self.t === 'class' ? obj.self.mro : obj.self.cls.mro;
        const start = mro.indexOf(obj.cls) + 1;
        for (const c of mro.slice(start)) if (c.dict.has(name)) { const v = c.dict.get(name); return fromClass(v, obj.self.t === 'class' ? null : obj.self, obj.self.t === 'class' ? obj.self : obj.self.cls); }
        // what object and the built-in exceptions provide
        if (name === '__init__') return nat('__init__', args => { if (obj.self.cls && obj.self.cls.exc) obj.self.args = args; return V.none; });
        if (name === '__str__') return nat('__str__', () => V.str(obj.self.cls.exc ? (obj.self.args.length === 1 ? fmt(obj.self.args[0]) : '') : objName(obj.self)));
        if (name === '__repr__') return nat('__repr__', () => V.str(objName(obj.self)));
        throw new PyError('AttributeError', `'super' object has no attribute '${name}'`);
      }
      case 'module': {
        if (name === '__name__') return V.str(obj.name);
        if (obj.members.has(name)) return obj.members.get(name);
        throw new PyError('AttributeError', `module '${obj.name}' has no attribute '${name}'`);
      }
      case 'property':
        if (name === 'setter') return nat('setter', ([f]) => ({ t: 'property', fget: obj.fget, fset: f }));
        if (name === 'getter') return nat('getter', ([f]) => ({ t: 'property', fget: f, fset: obj.fset }));
        if (name === 'fget') return obj.fget || V.none;
        throw none();
      case 'function':
        if (name === '__name__') return V.str(obj.name);
        if (name === '__qualname__') return V.str(obj.qualname || obj.name);
        if (name === '__doc__') return obj.doc ? V.str(obj.doc) : V.none;
        if (obj.attrs && obj.attrs.has(name)) return obj.attrs.get(name);
        throw none();
      case 'boundmethod':
        if (name === '__self__') return obj.self;
        if (name === '__func__') return obj.fn;
        if (name === '__name__') return V.str(obj.fn.name);
        throw none();
      case 'file':
        if (name === 'name') return V.str(obj.name);
        if (name === 'mode') return V.str(obj.mode);
        if (name === 'closed') return V.bool(obj.closed);
        break;
      case 'exception':
        if (name === 'args') return V.tuple(obj.args || (obj.msg === '' ? [] : [V.str(obj.msg)]));
        if (name === '__cause__') return obj.cause || V.none;
        break;
      case 'type':
        if (name === '__name__') return V.str(obj.v);
        if (TYPE_METHODS[obj.v] && TYPE_METHODS[obj.v].includes(name)) return nat(name, (args, kw) => { if (!args.length) throw new PyError('TypeError', `unbound method ${obj.v}.${name}() needs an argument`); return callMethod(args[0], name, args.slice(1), kw, CUR); });
        if (obj.v === 'dict' && name === 'fromkeys') return nat(name, ([ks, v]) => { const d = dict(); for (const k of iterate(ks)) d.v.set(keyOf(k), [k, v || V.none]); return d; });
        break;
      case 'exctype':
        if (name === '__name__') return V.str(obj.v);
        break;
      case 'object': case 'iterator':
        if (obj.attrs && obj.attrs.has(name)) { const v = obj.attrs.get(name); return typeof v === 'function' ? v() : v; }
        break;
      case 'match': case 'pattern':
        if (obj.attrs.has(name)) return obj.attrs.get(name);
        break;
    }
    const table = { str: STR_METHODS, list: LIST_METHODS, tuple: ['count', 'index'], dict: DICT_METHODS, file: FILE_METHODS, set: SET_METHODS }[obj.t];
    if (table && table.includes(name)) return { t: 'method', v: name, on: obj.t, obj };
    throw none();
  }
  function setAttr(obj, name, val) {
    if (obj.t === 'instance') {
      const ca = classAttr(obj.cls, name);
      if (ca && ca.t === 'property') {
        if (!ca.fset) throw new PyError('AttributeError', `property '${name}' of '${obj.cls.name}' object has no setter`);
        userCall(ca.fset, [obj, val]);
        return;
      }
      obj.attrs.set(name, val);
      return;
    }
    if (obj.t === 'class') { obj.dict.set(name, val); return; }
    if (obj.t === 'function') { (obj.attrs = obj.attrs || new Map()).set(name, val); return; }
    if (obj.t === 'module') { obj.members.set(name, val); return; }
    throw new PyError('AttributeError', `'${typeName(obj)}' object has no attribute '${name}' and no __dict__ for setting new attributes`);
  }
  function delAttr(obj, name) {
    if (obj.t === 'instance' && obj.attrs.has(name)) { obj.attrs.delete(name); return; }
    if (obj.t === 'class' && obj.dict.has(name)) { obj.dict.delete(name); return; }
    throw new PyError('AttributeError', obj.t === 'instance' ? `'${obj.cls.name}' object has no attribute '${name}'` : `'${typeName(obj)}' object has no attribute '${name}'`);
  }
  function isInstance(x, C) {
    if (C.t === 'tuple') return C.v.some(c => isInstance(x, c));
    if (C.t === 'class') return x.t === 'instance' && x.cls.mro.includes(C);
    if (C.t === 'exctype') {
      if (x.t === 'exception') return excChain(x.cls).includes(C.v);
      return x.t === 'instance' && x.cls.exc && excChain(x.cls.excBase).includes(C.v);
    }
    if (C.t === 'type') {
      if (C.v === 'object') return true;
      if (C.v === 'int') return x.t === 'int' || x.t === 'bool';
      if (C.v === 'type') return ['class', 'type', 'exctype'].includes(x.t);
      return x.t === C.v;
    }
    throw new PyError('TypeError', 'isinstance() arg 2 must be a type, a tuple of types, or a union');
  }
  function typeOf(x) {
    if (x.t === 'instance') return x.cls;
    if (x.t === 'exception') return { t: 'exctype', v: x.cls };
    if (x.t === 'class' || x.t === 'exctype') return { t: 'type', v: 'type' };
    return { t: 'type', v: typeName(x) };
  }
  function lenOf(a) {
    if (a.t === 'str') return [...a.v].length;
    if (a.t === 'dict' || a.t === 'set') return a.v.size;
    if (a.t === 'range') return rangeLen(a);
    if (Array.isArray(a.v)) return a.v.length;
    if (a.t === 'instance') {
      const m = classAttr(a.cls, '__len__');
      if (m) { const r = userCall(m, [a]); if (r.t !== 'int') throw new PyError('TypeError', `'${typeName(r)}' object cannot be interpreted as an integer`); if (r.v < 0) throw new PyError('ValueError', '__len__() should return >= 0'); return r.v; }
    }
    throw new PyError('TypeError', `object of type '${typeName(a)}' has no len()`);
  }

  /* ---------- runtime ---------- */
  function newCtx() { return { trace: [], steps: 0, depth: 0, hits: {}, modules: {}, excStack: [] }; }
  const HIDDEN = ['function', 'class', 'module', 'builtin', 'native', 'type', 'exctype', 'boundmethod', 'classmethod', 'staticmethod', 'property'];
  function snapshot(scope) {
    const out = {};
    SAFE++;
    try {
      for (const k of Object.keys(scope.vars)) {
        const x = scope.vars[k];
        if (HIDDEN.includes(x.t) || k.startsWith('__')) continue;
        out[k] = { t: x.t, text: x.t === 'file' ? `<file ${x.name}, ${x.closed ? 'closed' : 'open'}>` : x.t === 'generator' ? `<generator ${x.name}>` : show(x) };
      }
    } finally { SAFE--; }
    return out;
  }
  const safeShow = x => { SAFE++; try { return show(x); } finally { SAFE--; } };
  function lookup(name, scope) {
    if (scope.globalNames && scope.globalNames.has(name)) return lookup(name, globalOf(scope));
    if (scope.nonlocalNames && scope.nonlocalNames.has(name)) return lookup(name, scope.parent);
    if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope.vars[name];
    if (scope.fn && scope.locals.has(name)) throw new PyError('UnboundLocalError', `cannot access local variable '${name}' where it is not associated with a value`);
    if (scope.parent) return lookup(name, scope.parent);
    if (SPELLS.includes(name)) return { t: 'spell', v: name };
    if (BUILTINS.includes(name)) return { t: 'builtin', v: name };
    if (TYPES.includes(name)) return { t: 'type', v: name };
    if (EXC.includes(name)) return { t: 'exctype', v: name };
    if (name === 'NotImplemented') return NOTIMPL;
    throw new PyError('NameError', `name '${name}' is not defined`);
  }
  function argCount(name, args, lo, hi = lo) {
    if (args.length < lo || args.length > hi) {
      const want = lo === hi ? (lo === 0 ? 'no arguments' : lo === 1 ? 'exactly one argument' : `exactly ${lo} arguments`) : `at most ${hi} arguments`;
      throw new PyError('TypeError', `${name}() takes ${want} (${args.length} given)`);
    }
  }
  function needStr(meth, x) { if (x.t !== 'str') throw new PyError('TypeError', `${meth}() argument must be str, not ${typeName(x)}`); }
  function needInt(x) { if (x.t !== 'int' && x.t !== 'bool') throw new PyError('TypeError', `'${typeName(x)}' object cannot be interpreted as an integer`); return num(x); }
  function noKw(name, kw) { if (Object.keys(kw || {}).length) throw new PyError('TypeError', `${name}() takes no keyword arguments`); }
  function sortList(arr, reverse, key) {
    const keyed = arr.map(x => ({ x, k: key && key.t !== 'NoneType' ? callValue(key, [x], {}, CUR) : x }));
    const cmp = (a, b) => (less(a.k, b.k, '<') ? -1 : less(b.k, a.k, '<') ? 1 : 0);
    // Python's reverse keeps equal items in their original order
    if (reverse) keyed.sort((a, b) => cmp(b, a)); else keyed.sort(cmp);
    return keyed.map(e => e.x);
  }
  function roundHalfEven(x) {
    const f = Math.floor(x), d = x - f;
    if (Math.abs(d - 0.5) < 1e-12) return f % 2 === 0 ? f : f + 1;
    return Math.round(x);
  }
  // "{} has {:.1f}".format(a, b)
  function strFormat(s, args, kw) {
    let auto = 0;
    return s.replace(/\{\{|\}\}|\{([^{}!:]*)(?:!([rs]))?(?::([^{}]*))?\}/g, (m, field, conv, spec) => {
      if (m === '{{') return '{';
      if (m === '}}') return '}';
      let v;
      if (field === '') { v = args[auto++]; if (!v) throw new PyError('IndexError', `Replacement index ${auto - 1} out of range for positional args tuple`); }
      else if (/^\d+$/.test(field)) { v = args[+field]; if (!v) throw new PyError('IndexError', `Replacement index ${field} out of range for positional args tuple`); }
      else { v = kw[field]; if (!v) throw new PyError('KeyError', strRepr(field)); }
      if (conv === 'r') v = V.str(repr(v));
      return spec ? formatSpec(v, spec) : fmt(v);
    });
  }

  function callMethod(obj, name, args, kw, ctx) {
    if (obj.t === 'tuple' && (name === 'count' || name === 'index')) {
      noKw(name, kw); argCount(name, args, 1);
      if (name === 'count') return V.int(obj.v.filter(x => equal(x, args[0])).length);
      const i = obj.v.findIndex(x => equal(x, args[0]));
      if (i < 0) throw new PyError('ValueError', 'tuple.index(x): x not in tuple');
      return V.int(i);
    }
    if (!['str', 'list', 'dict', 'file', 'set'].includes(obj.t)) return callValue(getAttr(obj, name, ctx), args, kw, ctx);
    if (obj.t === 'file') {
      if (!FILE_METHODS.includes(name)) throw new PyError('AttributeError', `'_io.TextIOWrapper' object has no attribute '${name}'`);
      noKw(name, kw);
      return fileMethod(obj, name, args, ctx);
    }
    const fail = () => new PyError('AttributeError', `'${typeName(obj)}' object has no attribute '${name}'`);
    if (obj.t === 'str') {
      if (!STR_METHODS.includes(name)) throw fail();
      if (name === 'format') return V.str(strFormat(obj.v, args, kw));
      if (name === 'encode') return makeBytes(obj.v);
      if (name !== 'split' && name !== 'rsplit') noKw(name, kw);
      const s = obj.v;
      switch (name) {
        case 'upper': argCount(name, args, 0); return V.str(s.toUpperCase());
        case 'lower': case 'casefold': argCount(name, args, 0); return V.str(s.toLowerCase());
        case 'swapcase': argCount(name, args, 0); return V.str([...s].map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(''));
        case 'title': argCount(name, args, 0); return V.str(s.toLowerCase().replace(/(^|[^A-Za-z])([a-z])/g, (m, a, b) => a + b.toUpperCase()));
        case 'capitalize': argCount(name, args, 0); return V.str(s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
        case 'strip': case 'lstrip': case 'rstrip': {
          argCount(name, args, 0, 1);
          const chars = args.length && args[0].t === 'str' ? args[0].v : null;
          return V.str(stripChars(s, chars, name !== 'rstrip', name !== 'lstrip'));
        }
        case 'splitlines': {
          argCount(name, args, 0);
          const parts = s.split(/\r\n|\n|\r/);
          if (parts[parts.length - 1] === '') parts.pop();
          return V.list(parts.map(V.str));
        }
        case 'isdigit': case 'isnumeric': argCount(name, args, 0); return V.bool(s.length > 0 && /^\d+$/.test(s));
        case 'isalpha': argCount(name, args, 0); return V.bool(s.length > 0 && /^[A-Za-z]+$/.test(s));
        case 'isalnum': argCount(name, args, 0); return V.bool(s.length > 0 && /^[A-Za-z0-9]+$/.test(s));
        case 'isspace': argCount(name, args, 0); return V.bool(s.length > 0 && /^\s+$/.test(s));
        case 'isupper': argCount(name, args, 0); return V.bool(/[A-Z]/.test(s) && s === s.toUpperCase());
        case 'islower': argCount(name, args, 0); return V.bool(/[a-z]/.test(s) && s === s.toLowerCase());
        case 'replace': {
          if (args.length < 2 || args.length > 3) throw new PyError('TypeError', `replace expected 2 arguments, got ${args.length}`);
          needStr('replace', args[0]); needStr('replace', args[1]);
          const n = args[2] ? needInt(args[2]) : -1;
          if (args[0].v === '') return V.str(s);
          const parts = s.split(args[0].v);
          if (n < 0 || n >= parts.length - 1) return V.str(parts.join(args[1].v));
          return V.str(parts.slice(0, n + 1).join(args[1].v) + args[0].v + parts.slice(n + 1).join(args[0].v));
        }
        case 'count': case 'find': case 'rfind': case 'index': case 'rindex': {
          argCount(name, args, 1, 3); needStr(name, args[0]);
          const L = s.length, opt = k => (args[k] && args[k].t !== 'NoneType' ? needInt(args[k]) : null);
          let a = opt(1), b = opt(2);
          a = a == null ? 0 : a < 0 ? Math.max(0, a + L) : a;
          b = b == null ? L : b < 0 ? Math.max(0, b + L) : Math.min(b, L);
          const sub = args[0].v;
          if (name === 'count') { if (a > L || a > b) return V.int(0); const part = s.slice(a, b); return V.int(sub === '' ? part.length + 1 : part.split(sub).length - 1); }
          let i = -1;
          if (a <= L && a <= b) { const part = s.slice(a, b); const j = name[0] === 'r' ? part.lastIndexOf(sub) : part.indexOf(sub); i = j < 0 ? -1 : j + a; }
          if (i < 0 && name.endsWith('index')) throw new PyError('ValueError', 'substring not found');
          return V.int(i);
        }
        case 'startswith': case 'endswith': {
          argCount(name, args, 1);
          const opts = args[0].t === 'tuple' ? args[0].v : [args[0]];
          opts.forEach(o => needStr(name, o));
          return V.bool(opts.some(o => (name === 'startswith' ? s.startsWith(o.v) : s.endsWith(o.v))));
        }
        case 'removeprefix': argCount(name, args, 1); needStr(name, args[0]); return V.str(args[0].v && s.startsWith(args[0].v) ? s.slice(args[0].v.length) : s);
        case 'removesuffix': argCount(name, args, 1); needStr(name, args[0]); return V.str(args[0].v && s.endsWith(args[0].v) ? s.slice(0, -args[0].v.length) : s);
        case 'partition': { argCount(name, args, 1); needStr(name, args[0]); const i = s.indexOf(args[0].v); return V.tuple(i < 0 ? [V.str(s), V.str(''), V.str('')] : [V.str(s.slice(0, i)), V.str(args[0].v), V.str(s.slice(i + args[0].v.length))]); }
        case 'center': case 'ljust': case 'rjust': {
          argCount(name, args, 1, 2);
          const w = needInt(args[0]), ch = args[1] ? args[1].v : ' ';
          const pad = Math.max(0, w - s.length);
          if (name === 'ljust') return V.str(s + ch.repeat(pad));
          if (name === 'rjust') return V.str(ch.repeat(pad) + s);
          const left = Math.floor(pad / 2) + (pad % 2 && w % 2 ? 1 : 0);
          return V.str(ch.repeat(left) + s + ch.repeat(pad - left));
        }
        case 'zfill': { argCount(name, args, 1); const w = needInt(args[0]); const sign = /^[+-]/.test(s) ? s[0] : ''; const body = sign ? s.slice(1) : s; return V.str(sign + body.padStart(w - sign.length, '0')); }
        case 'split': case 'rsplit': {
          argCount(name, args, 0, 2);
          for (const k of Object.keys(kw)) if (k !== 'sep' && k !== 'maxsplit') throw new PyError('TypeError', `'${k}' is an invalid keyword argument for ${name}()`);
          const sep = args[0] || kw.sep, max = args[1] || kw.maxsplit ? needInt(args[1] || kw.maxsplit) : -1;
          let parts;
          if (!sep || sep.t === 'NoneType') parts = s.trim() ? s.trim().split(/\s+/) : [];
          else {
            needStr(name, sep);
            if (sep.v === '') throw new PyError('ValueError', 'empty separator');
            parts = s.split(sep.v);
          }
          if (max >= 0 && parts.length > max + 1) {
            const glue = sep && sep.t === 'str' ? sep.v : ' ';
            parts = name === 'split' ? [...parts.slice(0, max), parts.slice(max).join(glue)] : [parts.slice(0, parts.length - max).join(glue), ...parts.slice(parts.length - max)];
          }
          return V.list(parts.map(V.str));
        }
        case 'join': {
          argCount(name, args, 1);
          noteOrder(args[0]);
          const parts = iterate(args[0]);
          parts.forEach((x, i) => { if (x.t !== 'str') throw new PyError('TypeError', `sequence item ${i}: expected str instance, ${typeName(x)} found`); });
          return V.str(parts.map(x => x.v).join(s));
        }
      }
    }
    if (obj.t === 'list') {
      if (!LIST_METHODS.includes(name)) throw fail();
      const a = obj.v;
      if (name !== 'sort') noKw(name, kw);
      switch (name) {
        case 'append': argCount(name, args, 1); a.push(args[0]); return V.none;
        case 'extend': argCount(name, args, 1); a.push(...iterate(args[0])); return V.none;
        case 'insert': {
          argCount(name, args, 2);
          let i = needInt(args[0]);
          if (i < 0) i = Math.max(0, a.length + i);
          a.splice(Math.min(i, a.length), 0, args[1]); return V.none;
        }
        case 'pop': {
          argCount(name, args, 0, 1);
          if (!a.length) throw new PyError('IndexError', 'pop from empty list');
          let i = args.length ? needInt(args[0]) : a.length - 1;
          if (i < 0) i += a.length;
          if (i < 0 || i >= a.length) throw new PyError('IndexError', 'pop index out of range');
          return a.splice(i, 1)[0];
        }
        case 'remove': {
          argCount(name, args, 1);
          const i = a.findIndex(x => equal(x, args[0]));
          if (i < 0) throw new PyError('ValueError', 'list.remove(x): x not in list');
          a.splice(i, 1); return V.none;
        }
        case 'index': {
          argCount(name, args, 1);
          const i = a.findIndex(x => equal(x, args[0]));
          if (i < 0) throw new PyError('ValueError', `${repr(args[0])} is not in list`);
          return V.int(i);
        }
        case 'count': argCount(name, args, 1); return V.int(a.filter(x => equal(x, args[0])).length);
        case 'sort': {
          if (args.length) throw new PyError('TypeError', 'sort() takes no positional arguments');
          for (const k of Object.keys(kw || {})) if (k !== 'reverse' && k !== 'key') throw new PyError('TypeError', `'${k}' is an invalid keyword argument for sort()`);
          const sorted = sortList(a, kw.reverse && truthy(kw.reverse), kw.key);
          a.splice(0, a.length, ...sorted); return V.none;
        }
        case 'reverse': argCount(name, args, 0); a.reverse(); return V.none;
        case 'clear': argCount(name, args, 0); a.length = 0; return V.none;
        case 'copy': argCount(name, args, 0); return V.list(a.slice());
      }
    }
    if (obj.t === 'dict') {
      if (!DICT_METHODS.includes(name)) throw fail();
      if (name !== 'update') noKw(name, kw);
      const m = obj.v;
      switch (name) {
        case 'get': { argCount(name, args, 1, 2); const e = m.get(keyOf(args[0])); return e ? e[1] : (args[1] || V.none); }
        case 'keys': argCount(name, args, 0); return { t: 'dict_keys', v: [...m.values()].map(e => e[0]) };
        case 'values': argCount(name, args, 0); return { t: 'dict_values', v: [...m.values()].map(e => e[1]) };
        case 'items': argCount(name, args, 0); return { t: 'dict_items', v: [...m.values()].map(e => V.tuple([e[0], e[1]])) };
        case 'pop': {
          argCount(name, args, 1, 2);
          const k = keyOf(args[0]), e = m.get(k);
          if (e) { m.delete(k); return e[1]; }
          if (args[1]) return args[1];
          throw keyErr(args[0]);
        }
        case 'popitem': {
          argCount(name, args, 0);
          if (!m.size) throw new PyError('KeyError', "'popitem(): dictionary is empty'");
          const last = [...m.keys()].pop(), e = m.get(last);
          m.delete(last);
          return V.tuple([e[0], e[1]]);
        }
        case 'setdefault': {
          argCount(name, args, 1, 2);
          const k = keyOf(args[0]), e = m.get(k);
          if (e) return e[1];
          const v = args[1] || V.none;
          m.set(k, [args[0], v]);
          return v;
        }
        case 'update': {
          argCount(name, args, 0, 1);
          if (args.length) {
            if (args[0].t === 'dict') for (const [k, e] of args[0].v) m.set(k, [e[0], e[1]]);
            else for (const pair of iterate(args[0])) { const kv = iterate(pair); if (kv.length !== 2) throw new PyError('ValueError', 'dictionary update sequence element has wrong length'); m.set(keyOf(kv[0]), [kv[0], kv[1]]); }
          }
          for (const k in kw) m.set(keyOf(V.str(k)), [V.str(k), kw[k]]);
          return V.none;
        }
        case 'clear': argCount(name, args, 0); m.clear(); return V.none;
        case 'copy': { argCount(name, args, 0); const d = dict(); for (const [k, e] of m) d.v.set(k, [e[0], e[1]]); return d; }
      }
    }
    if (obj.t === 'set') {
      if (obj.frozen && ['add', 'remove', 'discard', 'pop', 'clear', 'update'].includes(name)) throw new PyError('AttributeError', `'frozenset' object has no attribute '${name}'`);
      if (!SET_METHODS.includes(name)) throw fail();
      noKw(name, kw);
      const m = obj.v;
      const other = () => (args[0].t === 'set' ? args[0] : mkSet(iterate(args[0])));
      switch (name) {
        case 'add': argCount(name, args, 1); m.set(keyOf(args[0]), args[0]); return V.none;
        case 'remove': argCount(name, args, 1); if (!m.delete(keyOf(args[0]))) throw keyErr(args[0]); return V.none;
        case 'discard': argCount(name, args, 1); m.delete(keyOf(args[0])); return V.none;
        case 'pop': { argCount(name, args, 0); if (!m.size) throw new PyError('KeyError', "'pop from an empty set'"); const v = setOrder(obj)[0]; m.delete(keyOf(v)); return v; }
        case 'clear': argCount(name, args, 0); m.clear(); return V.none;
        case 'copy': argCount(name, args, 0); return mkSet([...m.values()]);
        case 'update': for (const a of args) for (const v of iterate(a)) m.set(keyOf(v), v); return V.none;
        case 'union': return args.reduce((acc, a) => binop('|', acc, a.t === 'set' ? a : mkSet(iterate(a))), mkSet([...m.values()]));
        case 'intersection': return args.reduce((acc, a) => binop('&', acc, a.t === 'set' ? a : mkSet(iterate(a))), mkSet([...m.values()]));
        case 'difference': return args.reduce((acc, a) => binop('-', acc, a.t === 'set' ? a : mkSet(iterate(a))), mkSet([...m.values()]));
        case 'symmetric_difference': argCount(name, args, 1); return binop('^', obj, other());
        case 'issubset': argCount(name, args, 1); return V.bool(isSubset(obj, other()));
        case 'issuperset': argCount(name, args, 1); return V.bool(isSubset(other(), obj));
        case 'isdisjoint': argCount(name, args, 1); { const o = other(); return V.bool([...m.keys()].every(k => !o.v.has(k))); }
      }
    }
    throw fail();
  }

  // int(), str(), list()... are classes in Python; calling one converts
  function callType(name, args, kw, ctx) {
    if (name !== 'dict') noKw(name, kw);
    switch (name) {
      case 'str': argCount(name, args, 0, 1); return V.str(args.length ? fmt(args[0]) : '');
      case 'bool': argCount(name, args, 0, 1); return V.bool(args.length ? truthy(args[0]) : false);
      case 'int': {
        argCount(name, args, 0, 2);
        if (!args.length) return V.int(0);
        const a = args[0];
        if (args.length === 2) {
          if (a.t !== 'str') throw new PyError('TypeError', "int() can't convert non-string with explicit base");
          const base = needInt(args[1]), t = a.v.trim().toLowerCase().replace(/^0[xbo]/, '');
          const n = parseInt(t, base);
          if (isNaN(n) || !/^[-+]?[0-9a-z]+$/.test(t) || [...t.replace(/^[-+]/, '')].some(c => parseInt(c, 36) >= base)) throw new PyError('ValueError', `invalid literal for int() with base ${base}: ${strRepr(a.v)}`);
          return V.int(n);
        }
        if (a.t === 'int') return a;
        if (a.t === 'bool') return V.int(a.v ? 1 : 0);
        if (a.t === 'float') { if (!isFinite(a.v)) throw new PyError(isNaN(a.v) ? 'ValueError' : 'OverflowError', isNaN(a.v) ? 'cannot convert float NaN to integer' : 'cannot convert float infinity to integer'); return V.int(Math.trunc(a.v)); }
        if (a.t === 'str' && /^\s*[-+]?\d+(_\d+)*\s*$/.test(a.v)) return V.int(parseInt(a.v.replace(/_/g, ''), 10));
        if (a.t === 'str') throw new PyError('ValueError', `invalid literal for int() with base 10: ${strRepr(a.v)}`);
        if (a.t === 'instance' && classAttr(a.cls, '__int__')) return userCall(classAttr(a.cls, '__int__'), [a]);
        throw new PyError('TypeError', `int() argument must be a string, a bytes-like object or a real number, not '${typeName(a)}'`);
      }
      case 'float': {
        argCount(name, args, 0, 1);
        if (!args.length) return V.float(0);
        const a = args[0];
        if (isNum(a)) return V.float(num(a));
        if (a.t === 'str') {
          const t = a.v.trim().toLowerCase();
          if (/^[-+]?(\d+\.?\d*(e[-+]?\d+)?|\.\d+(e[-+]?\d+)?)$/.test(t)) return V.float(parseFloat(t));
          if (/^[-+]?(inf|infinity)$/.test(t)) return V.float(t.startsWith('-') ? -Infinity : Infinity);
          if (/^[-+]?nan$/.test(t)) return V.float(NaN);
          throw new PyError('ValueError', `could not convert string to float: ${strRepr(a.v)}`);
        }
        throw new PyError('TypeError', `float() argument must be a string or a real number, not '${typeName(a)}'`);
      }
      case 'list': argCount(name, args, 0, 1); if (args.length) noteOrder(args[0]); return V.list(args.length ? iterate(args[0]).slice() : []);
      case 'tuple': argCount(name, args, 0, 1); if (args.length) noteOrder(args[0]); return V.tuple(args.length ? iterate(args[0]).slice() : []);
      case 'set': argCount(name, args, 0, 1); return mkSet(args.length ? iterate(args[0]) : []);
      case 'frozenset': { argCount(name, args, 0, 1); const r = mkSet(args.length ? iterate(args[0]) : []); r.frozen = true; return r; }
      case 'dict': {
        argCount(name, args, 0, 1);
        const d = dict();
        if (args.length) callMethod(d, 'update', [args[0]], {}, ctx);
        for (const k in kw) d.v.set(keyOf(V.str(k)), [V.str(k), kw[k]]);
        return d;
      }
      case 'type': {
        argCount(name, args, 1);
        return typeOf(args[0]);
      }
      case 'object': argCount(name, args, 0); return { t: 'instance', cls: OBJECT_CLS, attrs: new Map() };
    }
  }
  const OBJECT_CLS = { t: 'class', name: 'object', bases: [], dict: new Map() };
  OBJECT_CLS.mro = [OBJECT_CLS];

  function readInput(prompt, ctx) {
    const p = prompt ? fmt(prompt) : '';
    if (!ctx.input || !ctx.input.length) {
      if (p) ctx.emit({ kind: 'print', text: p, raw: p + '\n' });
      throw new PyError('EOFError', 'EOF when reading a line');
    }
    const v = String(ctx.input.shift());
    // like a terminal: the prompt, then what was typed
    ctx.emit({ kind: 'print', text: p + v, raw: p + v + '\n', typed: v });
    return V.str(v);
  }

  function callBuiltin(name, args, kw, ctx) {
    const kws = Object.keys(kw || {});
    if (!['print', 'sorted', 'open', 'max', 'min', 'enumerate', 'zip', 'property', 'next', 'iter', 'round'].includes(name) && kws.length) throw new PyError('TypeError', `${name}() takes no keyword arguments`);
    switch (name) {
      case 'print': {
        for (const k of kws) if (k !== 'sep' && k !== 'end' && k !== 'flush' && k !== 'file') throw new PyError('TypeError', `'${k}' is an invalid keyword argument for print()`);
        const sep = kw.sep || V.str(' '), end = kw.end || V.str('\n');
        if (sep.t !== 'str' && sep.t !== 'NoneType') throw new PyError('TypeError', `sep must be None or a string, not ${typeName(sep)}`);
        if (end.t !== 'str' && end.t !== 'NoneType') throw new PyError('TypeError', `end must be None or a string, not ${typeName(end)}`);
        const text = args.map(fmt).join(sep.t === 'str' ? sep.v : ' ');
        ctx.emit({ kind: 'print', text, raw: text + (end.t === 'str' ? end.v : '\n') });
        return V.none;
      }
      case 'input': argCount(name, args, 0, 1); return readInput(args[0], ctx);
      case 'open': {
        for (const k of kws) if (k !== 'mode' && k !== 'encoding' && k !== 'newline') throw new PyError('TypeError', `'${k}' is an invalid keyword argument for open()`);
        argCount(name, args, 1, 2);
        return openFile(args, kw, ctx);
      }
      case 'len': argCount(name, args, 1); return V.int(lenOf(args[0]));
      case 'repr': argCount(name, args, 1); return V.str(repr(args[0]));
      case 'abs': {
        argCount(name, args, 1);
        if (args[0].t === 'instance' && classAttr(args[0].cls, '__abs__')) return userCall(classAttr(args[0].cls, '__abs__'), [args[0]]);
        if (!isNum(args[0])) throw new PyError('TypeError', `bad operand type for abs(): '${typeName(args[0])}'`);
        return mkNum(Math.abs(num(args[0])), args[0].t === 'float');
      }
      case 'round': {
        argCount(name, args, 1, 2);
        const nd = args[1] || kw.ndigits;
        if (!isNum(args[0])) throw new PyError('TypeError', `type ${typeName(args[0])} doesn't define __round__ method`);
        if (!nd || nd.t === 'NoneType') return V.int(roundHalfEven(num(args[0])));
        const n = needInt(nd);
        if (args[0].t !== 'float') return args[0].t === 'bool' ? V.int(num(args[0])) : n >= 0 ? args[0] : V.int(roundHalfEven(num(args[0]) / 10 ** -n) * 10 ** -n);
        const v = num(args[0]);
        if (!isFinite(v)) return args[0];
        if (n < 0) return V.float(roundHalfEven(v / 10 ** -n) * 10 ** -n);
        const r = Number(fixedHalfEven(Math.abs(v), Math.min(n, 40)));
        return V.float(v < 0 ? -r : r);
      }
      case 'range': {
        argCount(name, args, 1, 3);
        const ns = args.map(needInt);
        const [start, stop, step] = ns.length === 1 ? [0, ns[0], 1] : [ns[0], ns[1], ns[2] == null ? 1 : ns[2]];
        if (step === 0) throw new PyError('ValueError', 'range() arg 3 must not be zero');
        return { t: 'range', start, stop, step };
      }
      case 'sum': {
        argCount(name, args, 1, 2);
        let total = args[1] || V.int(0);
        if (total.t === 'str') throw new PyError('TypeError', "sum() can't sum strings [use ''.join(seq) instead]");
        for (const x of iterate(args[0])) total = binop('+', total, x);
        return total;
      }
      case 'max': case 'min': {
        for (const k of kws) if (k !== 'key' && k !== 'default') throw new PyError('TypeError', `'${k}' is an invalid keyword argument for ${name}()`);
        if (!args.length) throw new PyError('TypeError', `${name} expected at least 1 argument, got 0`);
        const items = args.length === 1 ? iterate(args[0]) : args;
        if (!items.length) { if (kw.default) return kw.default; throw new PyError('ValueError', `${name}() iterable argument is empty`); }
        const key = kw.key && kw.key.t !== 'NoneType' ? x => callValue(kw.key, [x], {}, ctx) : x => x;
        let best = items[0], bk = key(best);
        for (const x of items.slice(1)) { const k = key(x); if (name === 'max' ? less(bk, k, '>') : less(k, bk, '<')) { best = x; bk = k; } }
        return best;
      }
      case 'sorted': {
        argCount(name, args, 1);
        for (const k of kws) if (k !== 'reverse' && k !== 'key') throw new PyError('TypeError', `'${k}' is an invalid keyword argument for sort()`);
        return V.list(sortList(iterate(args[0]), kw.reverse && truthy(kw.reverse), kw.key));
      }
      case 'enumerate': {
        argCount(name, args, 1, 2);
        const start = args[1] || kw.start ? needInt(args[1] || kw.start) : 0;
        noteOrder(args[0]);
        const it = iterOf(args[0]);
        let i = start;
        return mkIter('enumerate', () => { const v = it.next(); return v === DONE ? DONE : V.tuple([V.int(i++), v]); });
      }
      case 'zip': {
        const its = args.map(a => { noteOrder(a); return iterOf(a); });
        const strict = kw.strict && truthy(kw.strict);
        return mkIter('zip', () => {
          if (!its.length) return DONE;
          const vals = [];
          for (const it of its) { const v = it.next(); if (v === DONE) { if (strict && vals.length) throw new PyError('ValueError', `zip() argument ${vals.length + 1} is shorter than argument 1`); return DONE; } vals.push(v); }
          return V.tuple(vals);
        });
      }
      case 'map': {
        if (args.length < 2) throw new PyError('TypeError', 'map() must have at least two arguments.');
        const fn = args[0], its = args.slice(1).map(iterOf);
        return mkIter('map', () => { const vals = []; for (const it of its) { const v = it.next(); if (v === DONE) return DONE; vals.push(v); } return callValue(fn, vals, {}, ctx); });
      }
      case 'filter': {
        argCount(name, args, 2);
        const fn = args[0], it = iterOf(args[1]);
        return mkIter('filter', () => { for (;;) { const v = it.next(); if (v === DONE) return DONE; if (truthy(fn.t === 'NoneType' ? v : callValue(fn, [v], {}, ctx))) return v; } });
      }
      case 'reversed': {
        argCount(name, args, 1);
        const a = args[0];
        if (a.t === 'instance' && classAttr(a.cls, '__reversed__')) return userCall(classAttr(a.cls, '__reversed__'), [a]);
        if (!['list', 'tuple', 'str', 'range', 'dict', 'dict_keys', 'dict_values', 'dict_items'].includes(a.t)) throw new PyError('TypeError', `'${typeName(a)}' object is not reversible`);
        const items = iterate(a).slice().reverse();
        let i = 0;
        return mkIter(a.t === 'list' ? 'list_reverseiterator' : a.t === 'range' ? 'range_iterator' : a.t === 'dict' ? 'dict_reversekeyiterator' : 'reversed', () => (i < items.length ? items[i++] : DONE));
      }
      case 'any': argCount(name, args, 1); { const it = iterOf(args[0]); for (;;) { const v = it.next(); if (v === DONE) return V.bool(false); if (truthy(v)) return V.bool(true); } }
      case 'all': argCount(name, args, 1); { const it = iterOf(args[0]); for (;;) { const v = it.next(); if (v === DONE) return V.bool(true); if (!truthy(v)) return V.bool(false); } }
      case 'iter': {
        argCount(name, args, 1);
        const a = args[0];
        if (a.t === 'generator' || a.t === 'iterator') return a;
        const it = iterOf(a);
        if (it.t) return it;
        noteOrder(a);
        return mkIter(ITER_KIND[a.t] || 'iterator', it.next);
      }
      case 'next': {
        argCount(name, args, 1, 2);
        const a = args[0];
        if (a.t === 'instance' && classAttr(a.cls, '__next__')) {
          try { return userCall(classAttr(a.cls, '__next__'), [a]); }
          catch (e) { if (args[1] && e instanceof PyError && e.pyType === 'StopIteration') return args[1]; throw e; }
        }
        if (a.t !== 'generator' && a.t !== 'iterator') throw new PyError('TypeError', `'${typeName(a)}' object is not an iterator`);
        const v = a.next();
        if (v === DONE) { if (args[1]) return args[1]; throw new PyError('StopIteration', ''); }
        return v;
      }
      case 'isinstance': argCount(name, args, 2); return V.bool(isInstance(args[0], args[1]));
      case 'issubclass': {
        argCount(name, args, 2);
        const [a, b] = args;
        const one = c => (a.t === 'class' ? isSubclass(a, c) : a.t === 'exctype' ? (c.t === 'exctype' && excChain(a.v).includes(c.v)) || (c.t === 'type' && c.v === 'object') : a.t === 'type' && c.t === 'type' && (c.v === a.v || c.v === 'object' || (a.v === 'bool' && c.v === 'int')));
        if (!['class', 'exctype', 'type'].includes(a.t)) throw new PyError('TypeError', 'issubclass() arg 1 must be a class');
        return V.bool(b.t === 'tuple' ? b.v.some(one) : one(b));
      }
      case 'hasattr': argCount(name, args, 2); needStr('hasattr', args[1]); try { getAttr(args[0], args[1].v, ctx); return V.bool(true); } catch (e) { if (e instanceof PyError && e.pyType === 'AttributeError') return V.bool(false); throw e; }
      case 'getattr': {
        argCount(name, args, 2, 3); needStr('getattr', args[1]);
        try { return getAttr(args[0], args[1].v, ctx); } catch (e) { if (args[2] && e instanceof PyError && e.pyType === 'AttributeError') return args[2]; throw e; }
      }
      case 'setattr': argCount(name, args, 3); needStr('setattr', args[1]); setAttr(args[0], args[1].v, args[2]); return V.none;
      case 'vars': argCount(name, args, 1); return getAttr(args[0], '__dict__', ctx);
      case 'callable': argCount(name, args, 1); return V.bool(['builtin', 'native', 'function', 'boundmethod', 'class', 'type', 'exctype', 'method'].includes(args[0].t) || (args[0].t === 'instance' && !!classAttr(args[0].cls, '__call__')));
      case 'chr': argCount(name, args, 1); return V.str(String.fromCodePoint(needInt(args[0])));
      case 'ord': argCount(name, args, 1); if (args[0].t !== 'str' || [...args[0].v].length !== 1) throw new PyError('TypeError', `ord() expected a character, but string of length ${args[0].t === 'str' ? args[0].v.length : 0} found`); return V.int(args[0].v.codePointAt(0));
      case 'format': argCount(name, args, 1, 2); if (args[1] && args[1].t !== 'str') throw new PyError('TypeError', 'format() argument 2 must be str'); return V.str(formatSpec(args[0], args[1] ? args[1].v : ''));
      case 'bin': case 'hex': case 'oct': {
        argCount(name, args, 1);
        const n = needInt(args[0]), base = { bin: 2, hex: 16, oct: 8 }[name], pre = { bin: '0b', hex: '0x', oct: '0o' }[name];
        return V.str((n < 0 ? '-' : '') + pre + Math.abs(n).toString(base));
      }
      case 'divmod': argCount(name, args, 2); return V.tuple([binop('//', args[0], args[1]), binop('%', args[0], args[1])]);
      case 'pow': {
        argCount(name, args, 2, 3);
        if (args.length === 3) { let r = 1, b = needInt(args[0]) % needInt(args[2]), e = needInt(args[1]); const m = needInt(args[2]); while (e > 0) { if (e & 1) r = Number((BigInt(r) * BigInt(b)) % BigInt(m)); b = Number((BigInt(b) * BigInt(b)) % BigInt(m)); e >>= 1; } return V.int(r); }
        return binop('**', args[0], args[1]);
      }
      case 'property': return { t: 'property', fget: args[0] || kw.fget || null, fset: args[1] || kw.fset || null };
      case 'classmethod': argCount(name, args, 1); return { t: 'classmethod', fn: args[0] };
      case 'staticmethod': argCount(name, args, 1); return { t: 'staticmethod', fn: args[0] };
      case 'super': throw new PyError('RuntimeError', 'super(): no arguments');
      case 'cast': {
        if (args.length !== 2) throw new PyError('TypeError', `cast() takes 2 arguments (spell, power) but ${args.length} were given`);
        const [spell, power] = args;
        if (spell.t !== 'spell') throw new PyError('TypeError', `cast() needs a spell like fireball, not '${typeName(spell)}'`);
        if (!isNum(power) || power.t === 'bool') throw new PyError('TypeError', `cast() power must be a number, not '${typeName(power)}'`);
        ctx.emit({ kind: 'cast', spell: spell.v, power: Math.max(0, Math.floor(power.v)) });
        return V.none;
      }
    }
  }

  function makeException(cls, args) {
    return { t: 'exception', cls, msg: args.length === 1 ? (cls === 'KeyError' ? repr(args[0]) : fmt(args[0])) : args.length ? repr(V.tuple(args)) : '', args };
  }
  function keyErr(k) { const e = new PyError('KeyError', repr(k)); e.obj = makeException('KeyError', [k]); return e; }
  function callValue(fn, args, kw, ctx) {
    kw = kw || {};
    switch (fn.t) {
      case 'builtin': return callBuiltin(fn.v, args, kw, ctx);
      case 'type': return callType(fn.v, args, kw, ctx);
      case 'function': return callFunction(fn, args, kw, ctx);
      case 'boundmethod': return callValue(fn.fn, [fn.self, ...args], kw, ctx);
      case 'class': return makeInstance(fn, args, kw, ctx);
      case 'native':
        try { return fn.fn(args, kw, ctx); }
        catch (e) {
          if (e instanceof PyError || e instanceof Signal || e instanceof RangeError) throw e;
          throw new PyError('TypeError', `${fn.name}() got arguments it cannot use (${args.length} given${Object.keys(kw).length ? ', plus ' + Object.keys(kw).join(', ') : ''})`);
        }
      case 'method': return callMethod(fn.obj, fn.v, args, kw, ctx);
      case 'exctype': noKw(fn.v, kw); return makeException(fn.v, args);
      case 'instance': { const c = classAttr(fn.cls, '__call__'); if (c) return callValue(c, [fn, ...args], kw, ctx); break; }
    }
    throw new PyError('TypeError', `'${typeName(fn)}' object is not callable`);
  }

  function callFunction(fn, args, kw, ctx) {
    const scope = { vars: {}, parent: fn.closure, fn: true, locals: fn.locals, fnObj: fn, globalNames: fn.globalNames, nonlocalNames: fn.nonlocalNames };
    const ps = fn.params;
    const pos = ps.filter(q => q.kind === 'pos');
    const va = ps.find(q => q.kind === 'varargs'), kwa = ps.find(q => q.kind === 'kwargs');
    const nm = fn.qualname || fn.name;
    if (args.length > pos.length && !va) {
      const nd = pos.filter(q => !q.hasDef).length;
      const takes = nd === pos.length ? `${pos.length}` : `from ${nd} to ${pos.length}`;
      throw new PyError('TypeError', `${nm}() takes ${takes} positional argument${pos.length === 1 && nd === pos.length ? '' : 's'} but ${args.length} ${args.length === 1 ? 'was' : 'were'} given`);
    }
    pos.forEach((q, i) => { if (i < args.length) scope.vars[q.name] = args[i]; });
    if (va) scope.vars[va.name] = V.tuple(args.slice(pos.length));
    const extra = dict();
    for (const k of Object.keys(kw)) {
      const q = ps.find(x => x.name === k && (x.kind === 'pos' || x.kind === 'kwonly'));
      if (!q) {
        if (kwa) { extra.v.set(keyOf(V.str(k)), [V.str(k), kw[k]]); continue; }
        throw new PyError('TypeError', `${nm}() got an unexpected keyword argument '${k}'`);
      }
      if (k in scope.vars) throw new PyError('TypeError', `${nm}() got multiple values for argument '${k}'`);
      scope.vars[k] = kw[k];
    }
    const list = ms => (ms.length === 1 ? ms[0] : ms.slice(0, -1).join(', ') + ' and ' + ms[ms.length - 1]);
    const missing = pos.filter(q => !(q.name in scope.vars) && !q.hasDef).map(q => `'${q.name}'`);
    if (missing.length) throw new PyError('TypeError', `${nm}() missing ${missing.length} required positional argument${missing.length === 1 ? '' : 's'}: ${list(missing)}`);
    const missKw = ps.filter(q => q.kind === 'kwonly' && !(q.name in scope.vars) && !q.hasDef).map(q => `'${q.name}'`);
    if (missKw.length) throw new PyError('TypeError', `${nm}() missing ${missKw.length} required keyword-only argument${missKw.length === 1 ? '' : 's'}: ${list(missKw)}`);
    ps.forEach(q => { if (q.name && !(q.name in scope.vars) && q.hasDef) scope.vars[q.name] = q.defVal; });
    if (kwa) scope.vars[kwa.name] = extra;
    if (fn.isGen) return makeGenerator(fn, scope, ctx);
    ctx.depth++;
    if (ctx.depth > MAX_DEPTH) { ctx.depth--; throw new PyError('RecursionError', 'maximum recursion depth exceeded'); }
    const savedEmit = ctx.emit;
    try {
      if (fn.lambda) { tick(ctx); return evalE(fn.body, scope, ctx); }
      ctx.trace.push({ kind: 'call', line: fn.line, name: fn.name, env: snapshot(scope) });
      execBlock(fn.body, scope, ctx);
      return V.none;
    } catch (s) {
      if (s instanceof Signal && s.kind === 'return') return s.value;
      throw s;
    } finally {
      ctx.depth--;
      ctx.emit = savedEmit;
    }
  }

  /* ---------- generators: a paused function, resumed by next() ---------- */
  function hasYield(s) {
    if (s._y !== undefined) return s._y;
    let y = s.n === 'yield';
    if (!y && s.n !== 'def' && s.n !== 'class') {
      const kids = [s.body, s.orelse, s.fin, ...(s.branches || []).map(b => b.body), ...(s.handlers || []).map(h => h.body), ...(s.cases || []).map(c => c.body)].filter(Boolean);
      y = kids.some(b => b.some(hasYield));
    }
    s._y = y;
    return y;
  }
  function makeGenerator(fn, scope, ctx) {
    const g = { t: 'generator', name: fn.name, done: false, running: false };
    let it = null;
    g.next = () => {
      if (g.done) return DONE;
      if (g.running) throw new PyError('ValueError', 'generator already executing');
      if (!it) it = genBody(fn, scope, ctx);
      const savedEmit = ctx.emit;
      g.running = true;
      ctx.depth++;
      try {
        if (ctx.depth > MAX_DEPTH) throw new PyError('RecursionError', 'maximum recursion depth exceeded');
        const r = it.next();
        if (r.done) { g.done = true; return DONE; }
        return r.value;
      } catch (e) {
        g.done = true;
        if (e instanceof Signal && e.kind === 'return') return DONE;
        if (e instanceof PyError && e.pyType === 'StopIteration') throw new PyError('RuntimeError', 'generator raised StopIteration');
        throw e;
      } finally { g.running = false; ctx.depth--; ctx.emit = savedEmit; }
    };
    return g;
  }
  function* genBody(fn, scope, ctx) {
    ctx.trace.push({ kind: 'call', line: fn.line, name: fn.name, env: snapshot(scope) });
    yield* gexec(fn.body, scope, ctx);
  }
  const lineErr = (err, line) => { if (err instanceof PyError && err.line == null) err.line = line; return err; };
  function* gexec(stmts, scope, ctx) {
    for (const s of stmts) {
      tick(ctx);
      ctx.hits[s.line] = (ctx.hits[s.line] || 0) + 1;
      const emit = ev => ctx.trace.push({ ...ev, line: s.line });
      ctx.emit = emit;
      if (!hasYield(s)) { try { execStmt(s, scope, ctx); } catch (err) { throw lineErr(err, s.line); } continue; }
      try {
        switch (s.n) {
          case 'yield': {
            if (s.from) {
              const src = iterOf(evalE(s.e, scope, ctx));
              for (;;) { const v = src.next(); if (v === DONE) break; ctx.trace.push({ kind: 'ret', line: s.line, label: `yields ${safeShow(v)}` }); yield v; ctx.emit = emit; }
            } else {
              const v = s.e ? evalE(s.e, scope, ctx) : V.none;
              ctx.trace.push({ kind: 'ret', line: s.line, label: `yields ${safeShow(v)}` });
              yield v;
              ctx.emit = emit;
            }
            break;
          }
          case 'if': {
            let done = false;
            for (const br of s.branches) {
              ctx.emit = ev => ctx.trace.push({ ...ev, line: br.line });
              let v;
              try { v = truthy(evalE(br.cond, scope, ctx)); } catch (err) { throw lineErr(err, br.line); }
              ctx.trace.push({ kind: 'cond', line: br.line, value: v });
              if (v) { yield* gexec(br.body, scope, ctx); done = true; break; }
            }
            if (!done && s.orelse) { ctx.trace.push({ kind: 'cond', line: s.elseLine, value: true, label: 'runs' }); yield* gexec(s.orelse, scope, ctx); }
            break;
          }
          case 'while': {
            let rounds = 0, broke = false;
            for (;;) {
              tick(ctx);
              ctx.emit = emit;
              const t = truthy(evalE(s.cond, scope, ctx));
              ctx.trace.push({ kind: 'cond', line: s.line, value: t, label: t ? `True · round ${rounds + 1}` : 'False · done' });
              if (!t) break;
              rounds++;
              try { yield* gexec(s.body, scope, ctx); }
              catch (sig) {
                if (sig instanceof Signal && sig.kind === 'break') { ctx.trace.push({ kind: 'cond', line: s.line, value: false, label: 'break' }); broke = true; break; }
                if (sig instanceof Signal && sig.kind === 'continue') continue;
                throw sig;
              }
            }
            if (!broke && s.orelse) yield* gexec(s.orelse, scope, ctx);
            break;
          }
          case 'for': {
            const src = evalE(s.iter, scope, ctx);
            noteOrder(src);
            const it = iterOf(src);
            let broke = false;
            for (;;) {
              tick(ctx);
              ctx.emit = emit;
              const item = it.next();
              if (item === DONE) break;
              bindTarget(s.target, item, scope, ctx);
              ctx.trace.push({ kind: 'iter', line: s.line, label: targetLabel(s.target, item), env: snapshot(scope), name: s.target.n === 'name' ? s.target.name : null });
              try { yield* gexec(s.body, scope, ctx); }
              catch (sig) {
                if (sig instanceof Signal && sig.kind === 'break') { ctx.trace.push({ kind: 'cond', line: s.line, value: false, label: 'break' }); broke = true; break; }
                if (sig instanceof Signal && sig.kind === 'continue') continue;
                throw sig;
              }
            }
            if (!broke) { ctx.trace.push({ kind: 'cond', line: s.line, value: false, label: 'done' }); if (s.orelse) yield* gexec(s.orelse, scope, ctx); }
            break;
          }
          case 'try': {
            let failed = null;
            try {
              try { yield* gexec(s.body, scope, ctx); }
              catch (err) {
                const h = handlerFor(s, err, scope, ctx);
                if (!h) throw err;
                failed = err;
                enterHandler(h, err, scope, ctx);
                ctx.excStack.push(err);
                try { yield* gexec(h.body, scope, ctx); } finally { ctx.excStack.pop(); }
              }
              if (!failed && s.orelse) { ctx.trace.push({ kind: 'cond', line: s.elseLine, value: true, label: 'no error' }); yield* gexec(s.orelse, scope, ctx); }
            } finally {
              if (s.fin) { ctx.trace.push({ kind: 'cond', line: s.finLine, value: true, label: 'always runs' }); yield* gexec(s.fin, scope, ctx); }
            }
            break;
          }
          case 'with': {
            const mgr = enterWith(s, scope, ctx);
            let err = null;
            try { yield* gexec(s.body, scope, ctx); }
            catch (e) { err = e; }
            exitWith(mgr, err, s, ctx);
            break;
          }
          default: execStmt(s, scope, ctx);
        }
      } catch (err) { throw lineErr(err, s.line); }
    }
  }

  // positional args with *spread, keyword args with **spread
  function evalArgs(e, scope, ctx) {
    const args = [];
    for (const a of e.args) {
      if (a.n === 'star') { const v = evalE(a.e, scope, ctx); noteOrder(v); args.push(...iterate(v)); }
      else args.push(evalE(a, scope, ctx));
    }
    const kw = {};
    for (const k in e.kw) kw[k] = evalE(e.kw[k], scope, ctx);
    for (const ks of e.kwstar || []) {
      const d = evalE(ks, scope, ctx);
      if (d.t !== 'dict') throw new PyError('TypeError', `argument after ** must be a mapping, not ${typeName(d)}`);
      for (const [, [k, v]] of d.v) {
        if (k.t !== 'str') throw new PyError('TypeError', 'keywords must be strings');
        if (k.v in kw) throw new PyError('TypeError', `got multiple values for keyword argument '${k.v}'`);
        kw[k.v] = v;
      }
    }
    return { args, kw };
  }
  function findSuper(scope) {
    for (let s = scope; s; s = s.parent) {
      if (s.fnObj && s.fnObj.ownerClass) {
        const first = s.fnObj.params[0];
        const self = first && first.kind === 'pos' && s.vars[first.name];
        if (!self || !(self.t === 'instance' || self.t === 'class')) break;
        return { t: 'super', cls: s.fnObj.ownerClass, self };
      }
    }
    throw new PyError('RuntimeError', 'super(): no arguments');
  }
  function makeFunction(name, params, body, scope, ctx, extra) {
    let c = scope;
    while (c.isClass || c.comp) c = c.parent;
    const qual = scope.isClass ? `${scope.clsName}.${name}` : c.fnObj ? `${c.fnObj.qualname || c.fnObj.name}.<locals>.${name}` : name;
    const ps = params.map(q => ({ name: q.name, kind: q.kind, hasDef: !!q.def, defVal: q.def ? evalE(q.def, scope, ctx) : null }));
    // a function made inside a comprehension keeps that comprehension's loop names (late binding, like Python)
    let home = scope;
    while (home.isClass) home = home.parent;
    return { t: 'function', name, qualname: qual, params: ps, body, closure: home, ...extra };
  }
  // the loops of a comprehension, as a lazy stream of values
  function* compStream(e, scope, ctx, first) {
    const inner = { vars: Object.create(null), parent: scope, fn: false, locals: new Set(), comp: true };
    function* level(i, it) {
      for (;;) {
        const item = it.next();
        if (item === DONE) return;
        tick(ctx);
        bindTarget(e.gens[i].target, item, inner, ctx);
        if (!e.gens[i].conds.every(c => truthy(evalE(c, inner, ctx)))) continue;
        if (i + 1 < e.gens.length) {
          const src = evalE(e.gens[i + 1].iter, inner, ctx);
          noteOrder(src);
          yield* level(i + 1, iterOf(src));
        } else yield e.kind === 'dict' ? [evalE(e.key, inner, ctx), evalE(e.elt, inner, ctx)] : evalE(e.elt, inner, ctx);
      }
    }
    yield* level(0, first);
  }
  function evalE(e, scope, ctx) {
    switch (e.n) {
      case 'lit': return e.val;
      case 'name': return lookup(e.name, scope);
      case 'neg': case 'pos': {
        const v = evalE(e.e, scope, ctx);
        const dn = e.n === 'neg' ? '__neg__' : '__pos__';
        if (v.t === 'instance' && classAttr(v.cls, dn)) return userCall(classAttr(v.cls, dn), [v]);
        if (!isNum(v)) throw new PyError('TypeError', `bad operand type for unary ${e.n === 'neg' ? '-' : '+'}: '${typeName(v)}'`);
        return e.n === 'neg' ? mkNum(-num(v), v.t === 'float') : mkNum(num(v), v.t === 'float');
      }
      case 'inv': { const v = evalE(e.e, scope, ctx); if (v.t !== 'int' && v.t !== 'bool') throw new PyError('TypeError', `bad operand type for unary ~: '${typeName(v)}'`); return V.int(~num(v)); }
      case 'not': return V.bool(!truthy(evalE(e.e, scope, ctx)));
      case 'and': { const l = evalE(e.l, scope, ctx); return truthy(l) ? evalE(e.r, scope, ctx) : l; }
      case 'or': { const l = evalE(e.l, scope, ctx); return truthy(l) ? l : evalE(e.r, scope, ctx); }
      case 'ifexp': return truthy(evalE(e.cond, scope, ctx)) ? evalE(e.a, scope, ctx) : evalE(e.b, scope, ctx);
      case 'cmp': {
        let left = evalE(e.first, scope, ctx);
        for (const [op, node] of e.rest) {
          const right = evalE(node, scope, ctx);
          if (!compare(op, left, right)) return V.bool(false);
          left = right;
        }
        return V.bool(true);
      }
      case 'bin': return binop(e.op, evalE(e.l, scope, ctx), evalE(e.r, scope, ctx));
      case 'list': case 'tuple': case 'setlit': {
        const out = [];
        for (const x of e.items) {
          if (x.n === 'star') { const v = evalE(x.e, scope, ctx); noteOrder(v); out.push(...iterate(v)); }
          else out.push(evalE(x, scope, ctx));
        }
        return e.n === 'list' ? V.list(out) : e.n === 'tuple' ? V.tuple(out) : mkSet(out);
      }
      case 'dict': {
        const d = dict();
        for (const [k, v] of e.pairs) {
          if (k === null) {
            const src = evalE(v, scope, ctx);
            if (src.t !== 'dict') throw new PyError('TypeError', `'${typeName(src)}' object is not a mapping`);
            for (const [kk, ent] of src.v) d.v.set(kk, [ent[0], ent[1]]);
            continue;
          }
          const kv = evalE(k, scope, ctx);
          d.v.set(keyOf(kv), [kv, evalE(v, scope, ctx)]);
        }
        return d;
      }
      case 'comp': {
        // like Python, the first iterable is evaluated right away
        const src = evalE(e.gens[0].iter, scope, ctx);
        if (e.kind !== 'gen' || src.t === 'set') noteOrder(src);
        const stream = compStream(e, scope, ctx, iterOf(src));
        if (e.kind === 'gen') {
          const g = { t: 'generator', name: '<genexpr>', done: false };
          g.next = () => {
            if (g.done) return DONE;
            const saved = ctx.emit;
            try { const r = stream.next(); if (r.done) { g.done = true; return DONE; } return r.value; }
            catch (err) { g.done = true; throw err; }
            finally { ctx.emit = saved; }
          };
          return g;
        }
        const vals = [];
        for (const v of stream) { vals.push(v); if (vals.length > MAX_STEPS) tick({ steps: MAX_STEPS }); }
        if (e.kind === 'list') return V.list(vals);
        if (e.kind === 'set') return mkSet(vals);
        const d = dict();
        for (const [k, v] of vals) d.v.set(keyOf(k), [k, v]);
        return d;
      }
      case 'call': {
        if (e.name === 'super' && !e.args.length && !(e.name in scope.vars)) {
          try { const f = lookup('super', scope); if (f.t !== 'builtin') return callValue(f, [], {}, ctx); } catch (err) { /* builtin */ }
          return findSuper(scope);
        }
        const fn = lookup(e.name, scope);
        const { args, kw } = evalArgs(e, scope, ctx);
        if (fn.t === 'builtin' && fn.v === 'super') {
          if (args.length !== 2) throw new PyError('TypeError', 'super() takes 0 or 2 arguments');
          return { t: 'super', cls: args[0], self: args[1] };
        }
        return callValue(fn, args, kw, ctx);
      }
      case 'callx': {
        const fn = evalE(e.fn, scope, ctx);
        const { args, kw } = evalArgs(e, scope, ctx);
        return callValue(fn, args, kw, ctx);
      }
      case 'lambda': {
        const f = makeFunction('<lambda>', e.params, e.body, scope, ctx, { lambda: true, line: e.line });
        f.locals = new Set(e.params.filter(q => q.name).map(q => q.name));
        return f;
      }
      case 'walrus': {
        const v = evalE(e.e, scope, ctx);
        let s = scope;
        while (s.comp) s = s.parent;
        if (RESERVED.includes(e.name) || SPELLS.includes(e.name)) throw new PyError('SyntaxError', `"${e.name}" is a spell word in this game, pick another name`);
        s.vars[e.name] = v;
        return v;
      }
      case 'fstr': return V.str(e.parts.map(pt => {
        if (typeof pt === 'string') return pt;
        let v = evalE(pt.e, scope, ctx);
        let pre = '';
        if (pt.debug) pre = pt.debug;
        if (pt.conv === 'r') v = V.str(repr(v));
        else if (pt.conv === 's') v = V.str(fmt(v));
        else if (pt.debug && pt.spec == null) v = V.str(repr(v));
        const spec = pt.specParts ? pt.specParts.map(p => (typeof p === 'string' ? p : fmt(evalE(p, scope, ctx)))).join('') : pt.spec;
        return pre + (spec != null ? formatSpec(v, spec) : fmt(v));
      }).join(''));
      case 'method': {
        const obj = evalE(e.obj, scope, ctx);
        const { args, kw } = evalArgs(e, scope, ctx);
        return callMethod(obj, e.name, args, kw, ctx);
      }
      case 'attr': return getAttr(evalE(e.obj, scope, ctx), e.name, ctx);
      case 'index': return getItem(evalE(e.obj, scope, ctx), evalE(e.i, scope, ctx));
      case 'slice': {
        const obj = evalE(e.obj, scope, ctx);
        const seq = obj.t === 'str' ? [...obj.v] : isSeq(obj) ? obj.v : null;
        if (!seq) throw new PyError('TypeError', `'${typeName(obj)}' object is not subscriptable`);
        const n = seq.length;
        const val = node => {
          if (!node) return null;
          const x = evalE(node, scope, ctx);
          if (x.t === 'NoneType') return null;
          if (x.t !== 'int' && x.t !== 'bool') throw new PyError('TypeError', 'slice indices must be integers or None or have an __index__ method');
          return num(x);
        };
        const a0 = val(e.a), b0 = val(e.b), c0 = val(e.c);
        const step = c0 == null ? 1 : c0;
        if (step === 0) throw new PyError('ValueError', 'slice step cannot be zero');
        const norm = (x, dflt, lo, hi) => (x == null ? dflt : x < 0 ? Math.max(lo, n + x) : Math.min(x, hi));
        const out = [];
        if (step > 0) { const a = norm(a0, 0, 0, n), b = norm(b0, n, 0, n); for (let i = a; i < b; i += step) out.push(seq[i]); }
        else { const a = norm(a0, n - 1, -1, n - 1), b = norm(b0, -1, -1, n - 1); for (let i = a; i > b; i += step) out.push(seq[i]); }
        return obj.t === 'str' ? V.str(out.join('')) : obj.t === 'list' ? V.list(out) : V.tuple(out);
      }
      case 'star': throw new PyError('SyntaxError', "can't use starred expression here");
    }
    throw new PyError('SyntaxError', 'invalid syntax');
  }
  function getItem(obj, i) {
    if (obj.t === 'dict') {
      const e = obj.v.get(keyOf(i));
      if (!e) throw keyErr(i);
      return e[1];
    }
    if (obj.t === 'instance') {
      const m = classAttr(obj.cls, '__getitem__');
      if (m) return userCall(m, [obj, i]);
      throw new PyError('TypeError', `'${obj.cls.name}' object is not subscriptable`);
    }
    if (obj.t === 'match') return callValue(obj.attrs.get('group'), [i], {}, CUR);
    if (obj.t === 'range') {
      const n = rangeLen(obj), k0 = needInt(i), k = k0 < 0 ? n + k0 : k0;
      if (k < 0 || k >= n) throw new PyError('IndexError', 'range object index out of range');
      return V.int(obj.start + k * obj.step);
    }
    if (obj.t === 'class' && classAttr(obj, '__class_getitem__')) return obj;
    if (obj.t === 'type') return obj; // list[int] in a type hint
    const seq = obj.t === 'str' ? [...obj.v] : isSeq(obj) ? obj.v : null;
    if (!seq) throw new PyError('TypeError', `'${typeName(obj)}' object is not subscriptable`);
    if (i.t !== 'int' && i.t !== 'bool') throw new PyError('TypeError', `${obj.t === 'str' ? 'string' : obj.t} indices must be integers${obj.t === 'str' ? '' : ' or slices'}, not '${typeName(i)}'`);
    const k = num(i) < 0 ? seq.length + num(i) : num(i);
    if (k < 0 || k >= seq.length) throw new PyError('IndexError', `${obj.t === 'str' ? 'string' : obj.t} index out of range`);
    return obj.t === 'str' ? V.str(seq[k]) : seq[k];
  }

  // names that are spell words in this game: assigning to them is blocked
  const RESERVED = ['print', 'cast'];
  // where an assignment to this name goes: the function, the whole spell (global), or an outer function (nonlocal)
  function homeOf(name, scope) {
    if (scope.globalNames && scope.globalNames.has(name)) return globalOf(scope);
    if (scope.nonlocalNames && scope.nonlocalNames.has(name)) {
      for (let s = scope.parent; s && s.fn; s = s.parent) if (Object.prototype.hasOwnProperty.call(s.vars, name) || (s.locals && s.locals.has(name))) return s;
      throw new PyError('SyntaxError', `no binding for nonlocal '${name}' found`);
    }
    return scope;
  }
  function bindTarget(t, val, scope, ctx) {
    if (t.n === 'name') {
      if (RESERVED.includes(t.name) || SPELLS.includes(t.name)) throw new PyError('SyntaxError', `"${t.name}" is a spell word in this game, pick another name`);
      if (val && val.t === 'file') val.held = true;
      homeOf(t.name, scope).vars[t.name] = val;
      return t.name;
    }
    if (t.n === 'tuple') {
      noteOrder(val);
      const items = iterate(val);
      const si = t.items.findIndex(x => x.n === 'star');
      if (si >= 0) {
        const need = t.items.length - 1;
        if (items.length < need) throw new PyError('ValueError', `not enough values to unpack (expected at least ${need}, got ${items.length})`);
        const after = t.items.length - si - 1;
        t.items.slice(0, si).forEach((sub, i) => bindTarget(sub, items[i], scope, ctx));
        bindTarget(t.items[si].e, V.list(items.slice(si, items.length - after)), scope, ctx);
        t.items.slice(si + 1).forEach((sub, i) => bindTarget(sub, items[items.length - after + i], scope, ctx));
        return null;
      }
      if (items.length < t.items.length) throw new PyError('ValueError', `not enough values to unpack (expected ${t.items.length}, got ${items.length})`);
      if (items.length > t.items.length) throw new PyError('ValueError', `too many values to unpack (expected ${t.items.length})`);
      t.items.forEach((sub, i) => bindTarget(sub, items[i], scope, ctx));
      return null;
    }
    if (t.n === 'attr') {
      setAttr(evalE(t.obj, scope, ctx), t.name, val);
      return rootName(t);
    }
    if (t.n === 'star') throw new PyError('SyntaxError', 'starred assignment target must be in a list or tuple');
    if (t.n === 'index') {
      const obj = evalE(t.obj, scope, ctx), i = evalE(t.i, scope, ctx);
      return setItem(obj, i, val, t);
    }
  }
  function setItem(obj, i, val, t) {
    if (obj.t === 'dict') { obj.v.set(keyOf(i), [i, val]); return rootName(t); }
    if (obj.t === 'list') {
      if (i.t !== 'int' && i.t !== 'bool') throw new PyError('TypeError', `list indices must be integers or slices, not ${typeName(i)}`);
      const k = num(i) < 0 ? obj.v.length + num(i) : num(i);
      if (k < 0 || k >= obj.v.length) throw new PyError('IndexError', 'list assignment index out of range');
      obj.v[k] = val; return rootName(t);
    }
    if (obj.t === 'instance' && classAttr(obj.cls, '__setitem__')) { userCall(classAttr(obj.cls, '__setitem__'), [obj, i, val]); return rootName(t); }
    throw new PyError('TypeError', `'${typeName(obj)}' object does not support item assignment`);
  }
  const rootName = t => (t.n === 'name' ? t.name : t.obj ? rootName(t.obj) : null);
  function tick(ctx) {
    if (++ctx.steps > MAX_STEPS) throw new PyError('SpellTimeout', `this spell ran over ${MAX_STEPS.toLocaleString('en')} steps. Is there a loop that never ends?`);
  }
  // which except block catches this error?
  function handlerFor(s, err, scope, ctx) {
    if (!(err instanceof PyError) || err.pyType === 'SpellTimeout' || err.pyType === 'SyntaxError') return null;
    const anc = excAncestry(err);
    for (const h of s.handlers) {
      if (!h.types) { return h; }
      for (const tnode of h.types) {
        const T = evalE(tnode, scope, ctx);
        if (T.t === 'exctype' ? anc.includes(T.v) : T.t === 'class' ? !!(err.obj && err.obj.t === 'instance' && err.obj.cls.mro.includes(T)) : false) return h;
        if (T.t !== 'exctype' && T.t !== 'class') throw new PyError('TypeError', 'catching classes that do not inherit from BaseException is not allowed');
      }
    }
    return null;
  }
  const errValue = err => err.obj || (err.obj = { t: 'exception', cls: err.pyType, msg: err.message, args: err.message === '' ? [] : [V.str(err.message)] });
  function enterHandler(h, err, scope, ctx) {
    ctx.trace.push({ kind: 'error-caught', line: err.line, type: err.pyType, msg: err.message });
    ctx.trace.push({ kind: 'cond', line: h.line, value: true, label: `caught ${err.pyType}` });
    if (h.as) scope.vars[h.as] = errValue(err);
  }
  function raiseValue(x) {
    if (x.t === 'exctype') return raiseValue(makeException(x.v, []));
    if (x.t === 'class') {
      if (!x.exc) throw new PyError('TypeError', 'exceptions must derive from BaseException');
      return raiseValue(makeInstance(x, [], {}, CUR));
    }
    if (x.t === 'exception') { const e = new PyError(x.cls, x.msg); e.obj = x; return e; }
    if (x.t === 'instance' && x.cls.exc) { const e = new PyError(x.cls.name, fmt(x)); e.obj = x; return e; }
    throw new PyError('TypeError', 'exceptions must derive from BaseException');
  }

  // with blocks: files, objects with __enter__/__exit__, and pytest.raises
  function enterWith(s, scope, ctx) {
    const mgrs = [];
    for (const item of s.items) {
      ctx.emit = ev => ctx.trace.push({ ...ev, line: s.line });
      const v = evalE(item.e, scope, ctx);
      let entered = v;
      if (v.t === 'file') { v.held = true; ctx.trace.push({ kind: 'cond', line: s.line, value: true, label: `opened ${v.name}` }); }
      else if (v.t === 'instance' && classAttr(v.cls, '__enter__') && classAttr(v.cls, '__exit__')) entered = userCall(classAttr(v.cls, '__enter__'), [v]);
      else if (v.t === 'object' && v.kind === 'raises') entered = v;
      else throw new PyError('TypeError', `'${typeName(v)}' object does not support the context manager protocol`);
      if (item.as) bindTarget({ n: 'name', name: item.as }, entered, scope, ctx);
      mgrs.push(v);
    }
    if (s.items.some(i => i.as)) ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) });
    return mgrs;
  }
  function exitWith(mgrs, err, s, ctx) {
    for (const v of mgrs.slice().reverse()) {
      if (v.t === 'file') {
        if (!v.closed) { flushFile(v, ctx); v.closed = true; ctx.trace.push({ kind: 'cond', line: s.line, value: true, label: `closed ${v.name}` }); }
      } else if (v.t === 'instance') {
        const ex = classAttr(v.cls, '__exit__');
        const e = err instanceof PyError ? errValue(err) : null;
        const r = userCall(ex, [v, e ? typeOf(e) : V.none, e || V.none, V.none]);
        if (err instanceof PyError && truthy(r)) err = null;
      } else if (v.kind === 'raises') {
        if (err instanceof PyError && err.pyType !== 'SpellTimeout') {
          const anc = excAncestry(err), T = v.attrs.get("exc");
          const ok = T.t === 'exctype' ? anc.includes(T.v) : T.t === 'class' ? !!(err.obj && err.obj.cls && err.obj.cls.mro.includes(T)) : false;
          if (ok) { ctx.trace.push({ kind: 'error-caught', line: err.line, type: err.pyType, msg: err.message }); ctx.trace.push({ kind: 'cond', line: s.line, value: true, label: `raised ${err.pyType} ✓` }); v.attrs.set('value', errValue(err)); err = null; }
        } else if (!err) {
          const f = new PyError('Failed', `DID NOT RAISE ${fmt(v.attrs.get("exc"))}`);
          f.line = s.line;
          throw f;
        }
      }
    }
    if (err) throw err;
  }

  function execBlock(stmts, scope, ctx) {
    for (const s of stmts) {
      tick(ctx);
      ctx.hits[s.line] = (ctx.hits[s.line] || 0) + 1;
      ctx.emit = ev => ctx.trace.push({ ...ev, line: s.line });
      try {
        execStmt(s, scope, ctx);
        if (ctx.openFiles) for (const fl of ctx.openFiles) if (!fl.held && fl.pending) flushFile(fl, ctx);
      } catch (err) {
        throw lineErr(err, s.line);
      }
    }
  }
  function loopBody(s, scope, ctx) {
    try { execBlock(s.body, scope, ctx); return null; }
    catch (sig) {
      if (sig instanceof Signal && sig.kind === 'break') { ctx.trace.push({ kind: 'cond', line: s.line, value: false, label: 'break' }); return 'break'; }
      if (sig instanceof Signal && sig.kind === 'continue') return null;
      throw sig;
    }
  }

  function execStmt(s, scope, ctx) {
    const emitAt = line => ev => ctx.trace.push({ ...ev, line });
    switch (s.n) {
      case 'expr': evalE(s.e, scope, ctx); ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) }); return;
      case 'pass': ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) }); return;
      case 'assign': {
        const val = evalE(s.e, scope, ctx);
        let name = null;
        for (const t of s.targets) name = bindTarget(t, val, scope, ctx) || name;
        ctx.trace.push({ kind: 'assign', line: s.line, name, env: snapshot(scope) });
        return;
      }
      case 'aug': {
        const t = s.target;
        let cur, obj, idx;
        if (t.n === 'name') cur = lookup(t.name, scope);
        else if (t.n === 'attr') { obj = evalE(t.obj, scope, ctx); cur = getAttr(obj, t.name, ctx); }
        else { obj = evalE(t.obj, scope, ctx); idx = evalE(t.i, scope, ctx); cur = getItem(obj, idx); }
        const rhs = evalE(s.e, scope, ctx);
        let val;
        if (s.op === '+' && cur.t === 'list') { cur.v.push(...iterate(rhs)); val = cur; }
        else if (s.op === '|' && cur.t === 'set' && rhs.t === 'set') { for (const [k, v] of rhs.v) cur.v.set(k, v); val = cur; }
        else val = binop(s.op, cur, rhs, true);
        let name;
        if (t.n === 'name') name = bindTarget(t, val, scope, ctx);
        else if (t.n === 'attr') { setAttr(obj, t.name, val); name = rootName(t); }
        else name = setItem(obj, idx, val, t);
        ctx.trace.push({ kind: 'assign', line: s.line, name, env: snapshot(scope) });
        return;
      }
      case 'del': {
        for (const t of s.targets || [s.target]) {
          if (t.n === 'name') { lookup(t.name, scope); delete scope.vars[t.name]; }
          else if (t.n === 'attr') delAttr(evalE(t.obj, scope, ctx), t.name);
          else if (t.n === 'index') {
            const obj = evalE(t.obj, scope, ctx), i = evalE(t.i, scope, ctx);
            if (obj.t === 'dict') { if (!obj.v.delete(keyOf(i))) throw keyErr(i); }
            else if (obj.t === 'list') {
              const k = num(i) < 0 ? obj.v.length + num(i) : num(i);
              if (i.t !== 'int' || k < 0 || k >= obj.v.length) throw new PyError('IndexError', 'list assignment index out of range');
              obj.v.splice(k, 1);
            } else throw new PyError('TypeError', `'${typeName(obj)}' object doesn't support item deletion`);
          } else throw new PyError('SyntaxError', 'cannot delete this');
          ctx.trace.push({ kind: 'assign', line: s.line, name: rootName(t), env: snapshot(scope) });
        }
        return;
      }
      case 'if': {
        for (const br of s.branches) {
          ctx.emit = emitAt(br.line);
          let v;
          try { v = evalE(br.cond, scope, ctx); }
          catch (err) { throw lineErr(err, br.line); }
          const t = truthy(v);
          ctx.trace.push({ kind: 'cond', line: br.line, value: t });
          if (t) { execBlock(br.body, scope, ctx); return; }
        }
        if (s.orelse) { ctx.trace.push({ kind: 'cond', line: s.elseLine, value: true, label: 'runs' }); execBlock(s.orelse, scope, ctx); }
        return;
      }
      case 'while': {
        let rounds = 0;
        for (;;) {
          tick(ctx);
          ctx.emit = emitAt(s.line);
          const t = truthy(evalE(s.cond, scope, ctx));
          ctx.trace.push({ kind: 'cond', line: s.line, value: t, label: t ? `True · round ${rounds + 1}` : 'False · done' });
          if (!t) break;
          rounds++;
          if (loopBody(s, scope, ctx) === 'break') return;
        }
        if (s.orelse) { ctx.trace.push({ kind: 'cond', line: s.elseLine, value: true, label: 'no break' }); execBlock(s.orelse, scope, ctx); }
        return;
      }
      case 'for': {
        ctx.emit = emitAt(s.line);
        const src = evalE(s.iter, scope, ctx);
        noteOrder(src);
        const it = iterOf(src);
        for (;;) {
          tick(ctx);
          ctx.emit = emitAt(s.line);
          const item = it.next();
          if (item === DONE) break;
          bindTarget(s.target, item, scope, ctx);
          ctx.trace.push({ kind: 'iter', line: s.line, label: targetLabel(s.target, item), env: snapshot(scope), name: s.target.n === 'name' ? s.target.name : null });
          if (loopBody(s, scope, ctx) === 'break') return;
        }
        ctx.trace.push({ kind: 'cond', line: s.line, value: false, label: 'done' });
        if (s.orelse) { ctx.trace.push({ kind: 'cond', line: s.elseLine, value: true, label: 'no break' }); execBlock(s.orelse, scope, ctx); }
        return;
      }
      case 'break': throw new Signal('break');
      case 'continue': throw new Signal('continue');
      case 'def': {
        const rawDoc = s.body[0] && s.body[0].n === 'expr' && s.body[0].e.n === 'lit' && s.body[0].e.val.t === 'str' ? s.body[0].e.val.v : null;
        const doc = rawDoc == null ? null : cleanDoc(rawDoc);
        let f = makeFunction(s.name, s.params, s.body, scope, ctx, { globalNames: s.globalNames, nonlocalNames: s.nonlocalNames, locals: s.locals, isGen: s.isGen, line: s.line, doc });
        for (const d of s.decos.slice().reverse()) { ctx.emit = emitAt(d.line); f = callValue(evalE(d.e, scope, ctx), [f], {}, ctx); }
        bindName(scope, s.name, f);
        ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) });
        return;
      }
      case 'class': {
        const bases = s.bases.map(b => evalE(b, scope, ctx));
        const cscope = { vars: {}, parent: scope, fn: false, locals: new Set(), isClass: true, clsName: s.name };
        execBlock(s.body, cscope, ctx);
        let cls = makeClass(s.name, bases, cscope.vars);
        for (const d of s.decos.slice().reverse()) cls = callValue(evalE(d.e, scope, ctx), [cls], {}, ctx);
        bindName(scope, s.name, cls);
        ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) });
        return;
      }
      case 'return': {
        const val = s.e ? evalE(s.e, scope, ctx) : V.none;
        ctx.trace.push({ kind: 'ret', line: s.line, label: `returns ${safeShow(val)}` });
        throw new Signal('return', val);
      }
      case 'yield': throw new PyError('SyntaxError', "'yield' outside function");
      case 'global': case 'nonlocal': ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) }); return;
      case 'match': {
        ctx.emit = emitAt(s.line);
        const subj = evalE(s.e, scope, ctx);
        for (const c of s.cases) {
          ctx.emit = emitAt(c.line);
          const binds = {};
          let ok = matchPattern(c.pat, subj, binds, scope, ctx);
          if (ok) {
            for (const k in binds) bindTarget({ n: 'name', name: k }, binds[k], scope, ctx);
            if (c.guard) ok = truthy(evalE(c.guard, scope, ctx));
          }
          ctx.trace.push({ kind: 'cond', line: c.line, value: ok, label: ok ? 'matches' : 'no match' });
          if (ok) { execBlock(c.body, scope, ctx); return; }
        }
        return;
      }
      case 'with': {
        const mgrs = enterWith(s, scope, ctx);
        let err = null;
        try { execBlock(s.body, scope, ctx); }
        catch (e) { err = e; }
        exitWith(mgrs, err, s, ctx);
        return;
      }
      case 'raise': {
        if (!s.e) {
          const cur = ctx.excStack[ctx.excStack.length - 1];
          if (!cur) throw new PyError('RuntimeError', 'No active exception to reraise');
          throw cur;
        }
        const x = evalE(s.e, scope, ctx);
        const err = raiseValue(x);
        if (s.cause) {
          let c = evalE(s.cause, scope, ctx);
          if (c.t === 'exctype') c = makeException(c.v, []);
          if (c.t === 'class' && c.exc) c = makeInstance(c, [], {}, ctx);
          if (err.obj) err.obj.cause = c;
        }
        throw err;
      }
      case 'assert': {
        const ok = truthy(evalE(s.cond, scope, ctx));
        ctx.trace.push({ kind: 'cond', line: s.line, value: ok, label: ok ? 'assert passed' : 'assert failed' });
        if (ok) return;
        const err = new PyError('AssertionError', s.msg ? fmt(evalE(s.msg, scope, ctx)) : '');
        // pytest shows the values that were compared
        if (!s.msg && s.cond.n === 'cmp' && s.cond.rest.length === 1) {
          SAFE++;
          try { err.detail = `assert ${repr(evalE(s.cond.first, scope, ctx))} ${s.cond.rest[0][0]} ${repr(evalE(s.cond.rest[0][1], scope, ctx))}`; } catch (e) { /* only for display */ } finally { SAFE--; }
        }
        if (s.msg) err.obj = { t: 'exception', cls: 'AssertionError', msg: err.message, args: [V.str(err.message)] };
        throw err;
      }
      case 'import': {
        for (const im of s.names) {
          const mod = loadModule(im.mod, ctx);
          if (im.as || !im.mod.includes('.')) { bindName(scope, im.as || im.mod, mod); continue; }
          const parts = im.mod.split('.');
          const pkg = name => ctx.modules[name] || (MODULES[name] ? loadModule(name, ctx) : (ctx.modules[name] = mkModule(name, {})));
          const top = pkg(parts[0]);
          let cur = top;
          for (let k = 1; k < parts.length; k++) {
            const sub = k === parts.length - 1 ? mod : pkg(parts.slice(0, k + 1).join('.'));
            cur.members.set(parts[k], sub);
            cur = sub;
          }
          bindName(scope, parts[0], top);
        }
        ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) });
        return;
      }
      case 'fromimport': {
        const mod = loadModule(s.mod, ctx);
        if (s.star) { for (const [k, v] of mod.members) if (!k.startsWith('_')) bindName(scope, k, v); }
        for (const x of s.names) {
          if (!mod.members.has(x.name)) throw new PyError('ImportError', `cannot import name '${x.name}' from '${s.mod}'`);
          bindName(scope, x.as || x.name, mod.members.get(x.name));
        }
        ctx.trace.push({ kind: 'step', line: s.line, env: snapshot(scope) });
        return;
      }
      case 'try': {
        let failed = null;
        try {
          try { execBlock(s.body, scope, ctx); }
          catch (err) {
            const h = handlerFor(s, err, scope, ctx);
            if (!h) throw err;
            failed = err;
            enterHandler(h, err, scope, ctx);
            ctx.excStack.push(err);
            try { execBlock(h.body, scope, ctx); } finally { ctx.excStack.pop(); }
          }
          if (!failed && s.orelse) { ctx.trace.push({ kind: 'cond', line: s.elseLine, value: true, label: 'no error' }); execBlock(s.orelse, scope, ctx); }
        } finally {
          if (s.fin) { ctx.trace.push({ kind: 'cond', line: s.finLine, value: true, label: 'always runs' }); execBlock(s.fin, scope, ctx); }
        }
        return;
      }
    }
  }
  function matchPattern(pt, v, binds, scope, ctx) {
    switch (pt.k) {
      case 'wild': return true;
      case 'capture': binds[pt.name] = v; return true;
      case 'lit': { const want = evalE(pt.e, scope, ctx); return (want.t === 'NoneType' || want.t === 'bool') ? identical(v, want) : equal(v, want); }
      case 'value': return equal(v, evalE(pt.e, scope, ctx));
      case 'as': if (!matchPattern(pt.pat, v, binds, scope, ctx)) return false; binds[pt.name] = v; return true;
      case 'or': for (const a of pt.alts) { const b = {}; if (matchPattern(a, v, b, scope, ctx)) { Object.assign(binds, b); return true; } } return false;
      case 'seq': {
        if (!(v.t === 'list' || v.t === 'tuple')) return false;
        const items = v.v, si = pt.items.findIndex(x => x.k === 'star');
        if (si < 0) { if (items.length !== pt.items.length) return false; return pt.items.every((p2, i) => matchPattern(p2, items[i], binds, scope, ctx)); }
        const after = pt.items.length - si - 1;
        if (items.length < pt.items.length - 1) return false;
        for (let i = 0; i < si; i++) if (!matchPattern(pt.items[i], items[i], binds, scope, ctx)) return false;
        for (let i = 0; i < after; i++) if (!matchPattern(pt.items[si + 1 + i], items[items.length - after + i], binds, scope, ctx)) return false;
        if (pt.items[si].name) binds[pt.items[si].name] = V.list(items.slice(si, items.length - after));
        return true;
      }
    }
    return false;
  }
  function bindName(scope, name, v) {
    if (RESERVED.includes(name) || SPELLS.includes(name)) throw new PyError('SyntaxError', `"${name}" is a spell word in this game, pick another name`);
    scope.vars[name] = v;
  }
  const globalOf = scope => { let s = scope; while (s.parent) s = s.parent; return s; };
  function targetLabel(t, item) {
    if (t.n === 'name') return `${t.name} = ${safeShow(item)}`;
    return safeShow(item);
  }

  /* ---------- the standard library (the parts this game teaches) ---------- */
  const mkObj = (kind, attrs) => ({ t: 'object', kind, attrs: new Map(Object.entries(attrs)) });
  const mkModule = (name, members) => ({ t: 'module', name, builtin: true, members: new Map(Object.entries(members)) });
  const fl = n => V.float(n);
  const needNum = (name, x) => { if (!isNum(x)) throw new PyError('TypeError', `must be real number, not ${typeName(x)}`); return num(x); };

  // CPython's Mersenne Twister, so seeded random numbers match real Python
  function makeMT(seed) {
    const mt = new Uint32Array(624);
    let mti = 625;
    function initGenrand(s) {
      mt[0] = s >>> 0;
      for (mti = 1; mti < 624; mti++) { const prev = mt[mti - 1] ^ (mt[mti - 1] >>> 30); mt[mti] = (Math.imul(1812433253, prev) + mti) >>> 0; }
    }
    function initByArray(key) {
      initGenrand(19650218);
      let i = 1, j = 0;
      for (let k = Math.max(624, key.length); k; k--) {
        const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = ((mt[i] ^ Math.imul(prev, 1664525)) + key[j] + j) >>> 0;
        i++; j++;
        if (i >= 624) { mt[0] = mt[623]; i = 1; }
        if (j >= key.length) j = 0;
      }
      for (let k = 623; k; k--) {
        const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
        mt[i] = ((mt[i] ^ Math.imul(prev, 1566083941)) - i) >>> 0;
        i++;
        if (i >= 624) { mt[0] = mt[623]; i = 1; }
      }
      mt[0] = 0x80000000;
    }
    function genrand() {
      let y;
      if (mti >= 624) {
        let kk;
        for (kk = 0; kk < 227; kk++) { y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff); mt[kk] = mt[kk + 397] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0); }
        for (; kk < 623; kk++) { y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff); mt[kk] = mt[kk - 227] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0); }
        y = (mt[623] & 0x80000000) | (mt[0] & 0x7fffffff); mt[623] = mt[396] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
        mti = 0;
      }
      y = mt[mti++];
      y ^= y >>> 11; y ^= (y << 7) & 0x9d2c5680; y ^= (y << 15) & 0xefc60000; y ^= y >>> 18;
      return y >>> 0;
    }
    function seedWith(n) {
      let v = Math.abs(Math.trunc(n));
      const key = [];
      do { key.push(v % 4294967296); v = Math.floor(v / 4294967296); } while (v > 0);
      initByArray(key);
    }
    seedWith(seed);
    const random = () => { const a = genrand() >>> 5, b = genrand() >>> 6; return (a * 67108864 + b) / 9007199254740992; };
    const bits = k => (k <= 0 ? 0 : k <= 32 ? genrand() >>> (32 - k) : (() => { let r = 0, mul = 1; while (k > 0) { const w = genrand(); const take = Math.min(32, k); r += (k < 32 ? w >>> (32 - k) : w) * mul; mul *= 4294967296; k -= take; } return r; })());
    const below = n => { const k = Math.floor(Math.log2(n)) + 1; let r = bits(k); while (r >= n) r = bits(k); return r; };
    return { random, below, seedWith };
  }
  function makeRandom(ctx) {
    const R = makeMT(ctx.seed);
    const seq = x => { if (!['list', 'tuple', 'str', 'range'].includes(x.t)) throw new PyError('TypeError', `Population must be a sequence.  For dicts or sets, use sorted(d).`); return x.t === 'str' ? [...x.v].map(V.str) : iterate(x); };
    const randrange = (args) => {
      const [a, b, c] = args.map(needInt);
      if (args.length === 1) { if (a > 0) return R.below(a); throw new PyError('ValueError', 'empty range for randrange()'); }
      const step = args.length === 3 ? c : 1, width = b - a;
      if (step === 1) { if (width > 0) return a + R.below(width); throw new PyError('ValueError', `empty range in randrange(${a}, ${b})`); }
      if (step === 0) throw new PyError('ValueError', 'zero step for randrange()');
      const n = step > 0 ? Math.floor((width + step - 1) / step) : Math.floor((width + step + 1) / step);
      if (n <= 0) throw new PyError('ValueError', `empty range in randrange(${a}, ${b}, ${step})`);
      return a + step * R.below(n);
    };
    return mkModule('random', {
      seed: nat('seed', ([s]) => { R.seedWith(s && s.t !== 'NoneType' ? (s.t === 'str' ? [...s.v].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 4294967296, 7) : num(s)) : Date.now()); return V.none; }),
      random: nat('random', () => fl(R.random())),
      randint: nat('randint', args => { argCount('randint', args, 2); return V.int(randrange([args[0], V.int(needInt(args[1]) + 1)])); }),
      randrange: nat('randrange', args => { argCount('randrange', args, 1, 3); return V.int(randrange(args)); }),
      choice: nat('choice', args => { argCount('choice', args, 1); const s = seq(args[0]); if (!s.length) throw new PyError('IndexError', 'Cannot choose from an empty sequence'); return s[R.below(s.length)]; }),
      shuffle: nat('shuffle', args => {
        argCount('shuffle', args, 1);
        const x = args[0];
        if (x.t !== 'list') throw new PyError('TypeError', `'${typeName(x)}' object does not support item assignment`);
        for (let i = x.v.length - 1; i > 0; i--) { const j = R.below(i + 1); [x.v[i], x.v[j]] = [x.v[j], x.v[i]]; }
        return V.none;
      }),
      sample: nat('sample', (args, kw) => {
        const pop = seq(args[0]), k = needInt(args[1] || kw.k), n = pop.length;
        if (k < 0 || k > n) throw new PyError('ValueError', 'Sample larger than population or is negative');
        const result = [];
        let setsize = 21;
        if (k > 5) setsize += 4 ** Math.ceil(Math.log(k * 3) / Math.log(4));
        if (n <= setsize) {
          const pool = pop.slice();
          for (let i = 0; i < k; i++) { const j = R.below(n - i); result.push(pool[j]); pool[j] = pool[n - i - 1]; }
        } else {
          const sel = new Set();
          for (let i = 0; i < k; i++) { let j = R.below(n); while (sel.has(j)) j = R.below(n); sel.add(j); result.push(pop[j]); }
        }
        return V.list(result);
      }),
      uniform: nat('uniform', ([a, b]) => fl(needNum('uniform', a) + (needNum('uniform', b) - num(a)) * R.random())),
      choices: nat('choices', (args, kw) => {
        const pop = seq(args[0]), n = pop.length, k = kw.k ? needInt(kw.k) : 1;
        const w = args[1] || kw.weights;
        if (!w || w.t === 'NoneType') return V.list(Array.from({ length: k }, () => pop[Math.floor(R.random() * n)]));
        const cum = []; let acc = 0;
        for (const x of iterate(w)) { acc += needNum('choices', x); cum.push(acc); }
        if (cum.length !== n) throw new PyError('ValueError', 'The number of weights does not match the population');
        const total = cum[cum.length - 1];
        return V.list(Array.from({ length: k }, () => {
          const r = R.random() * total;
          let lo = 0, hi = n - 1;
          while (lo < hi) { const mid = (lo + hi) >> 1; if (r < cum[mid]) hi = mid; else lo = mid + 1; }
          return pop[lo];
        }));
      }),
    });
  }
  function factorial(n) { if (n < 0) throw new PyError('ValueError', 'factorial() not defined for negative values'); let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
  function makeMath() {
    const f1 = (name, op, dom) => nat(name, args => { argCount(name, args, 1); const x = needNum(name, args[0]); if (dom && !dom(x)) throw new PyError('ValueError', 'math domain error'); return fl(op(x)); });
    const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
    return mkModule('math', {
      pi: fl(Math.PI), e: fl(Math.E), tau: fl(2 * Math.PI), inf: fl(Infinity), nan: fl(NaN),
      sqrt: f1('sqrt', Math.sqrt, x => x >= 0), exp: f1('exp', Math.exp), sin: f1('sin', Math.sin), cos: f1('cos', Math.cos), tan: f1('tan', Math.tan),
      log10: f1('log10', Math.log10, x => x > 0), log2: f1('log2', Math.log2, x => x > 0), fabs: f1('fabs', Math.abs),
      radians: f1('radians', x => x * Math.PI / 180), degrees: f1('degrees', x => x * 180 / Math.PI),
      log: nat('log', args => { argCount('log', args, 1, 2); const x = needNum('log', args[0]); if (x <= 0) throw new PyError('ValueError', 'math domain error'); return fl(args[1] ? Math.log(x) / Math.log(needNum('log', args[1])) : Math.log(x)); }),
      floor: nat('floor', ([x]) => { if (x.t === 'int') return x; return V.int(Math.floor(needNum('floor', x))); }),
      ceil: nat('ceil', ([x]) => { if (x.t === 'int') return x; return V.int(Math.ceil(needNum('ceil', x))); }),
      trunc: nat('trunc', ([x]) => V.int(Math.trunc(needNum('trunc', x)))),
      pow: nat('pow', ([a, b]) => fl(Math.pow(needNum('pow', a), needNum('pow', b)))),
      factorial: nat('factorial', ([x]) => V.int(factorial(needInt(x)))),
      gcd: nat('gcd', args => V.int(args.map(needInt).reduce(gcd, 0))),
      lcm: nat('lcm', args => V.int(args.map(needInt).reduce((a, b) => (a && b ? Math.abs(a * b) / gcd(a, b) : 0), 1))),
      isqrt: nat('isqrt', ([x]) => { const n = needInt(x); if (n < 0) throw new PyError('ValueError', 'isqrt() argument must be nonnegative'); return V.int(Math.floor(Math.sqrt(n))); }),
      hypot: nat('hypot', args => fl(Math.hypot(...args.map(a => needNum('hypot', a))))),
      prod: nat('prod', ([xs]) => iterate(xs).reduce((a, b) => binop('*', a, b), V.int(1))),
      comb: nat('comb', ([n, k]) => { const N = needInt(n), K = needInt(k); if (K > N) return V.int(0); return V.int(Math.round(factorial(N) / (factorial(K) * factorial(N - K)))); }),
      isclose: nat('isclose', ([a, b]) => { const x = needNum('isclose', a), y = needNum('isclose', b); return V.bool(x === y || Math.abs(x - y) <= 1e-9 * Math.max(Math.abs(x), Math.abs(y))); }),
    });
  }
  function makeStatistics() {
    const data = (name, xs) => { const d = iterate(xs); if (!d.length) throw new PyError('StatisticsError', `${name} requires at least one data point`); return d; };
    return mkModule('statistics', {
      mean: nat('mean', ([xs]) => {
        const d = data('mean', xs);
        if (d.every(x => x.t === 'int' || x.t === 'bool')) { const s = d.reduce((a, x) => a + num(x), 0); return s % d.length === 0 ? V.int(s / d.length) : fl(s / d.length); }
        return fl(d.reduce((a, x) => a + needNum('mean', x), 0) / d.length);
      }),
      fmean: nat('fmean', ([xs]) => { const d = data('fmean', xs); return fl(d.reduce((a, x) => a + needNum('fmean', x), 0) / d.length); }),
      median: nat('median', ([xs]) => {
        const d = sortList(data('median', xs), false), n = d.length;
        if (n % 2) return d[(n - 1) / 2];
        return binop('/', binop('+', d[n / 2 - 1], d[n / 2]), V.int(2));
      }),
      mode: nat('mode', ([xs]) => {
        const d = data('mode', xs), counts = new Map();
        let best = null, bc = 0;
        for (const x of d) { const k = keyOf(x); const c = (counts.get(k) || 0) + 1; counts.set(k, c); if (c > bc) { bc = c; best = x; } }
        // the first value to reach the top count wins, like Python 3.8+
        for (const x of d) if (counts.get(keyOf(x)) === bc) return x;
        return best;
      }),
    });
  }
  /* json */
  function jsonStr(s) {
    let out = '"';
    for (const ch of s) {
      const c = ch.codePointAt(0);
      if (ch === '"') out += '\\"';
      else if (ch === '\\') out += '\\\\';
      else if (ch === '\n') out += '\\n';
      else if (ch === '\r') out += '\\r';
      else if (ch === '\t') out += '\\t';
      else if (c < 0x20 || c > 0x7e) {
        if (c > 0xffff) { const h = Math.floor((c - 0x10000) / 0x400) + 0xd800, l = ((c - 0x10000) % 0x400) + 0xdc00; out += '\\u' + h.toString(16).padStart(4, '0') + '\\u' + l.toString(16).padStart(4, '0'); }
        else out += '\\u' + c.toString(16).padStart(4, '0');
      } else out += ch;
    }
    return out + '"';
  }
  function jsonDump(x, indent, sortKeys, level) {
    const nl = indent == null ? '' : '\n' + ' '.repeat(indent * (level + 1));
    const end = indent == null ? '' : '\n' + ' '.repeat(indent * level);
    const sep = indent == null ? ', ' : ',';
    switch (x.t) {
      case 'NoneType': return 'null';
      case 'bool': return x.v ? 'true' : 'false';
      case 'int': return String(x.v);
      case 'float': return isNaN(x.v) ? 'NaN' : !isFinite(x.v) ? (x.v > 0 ? 'Infinity' : '-Infinity') : fmtFloat(x.v);
      case 'str': return jsonStr(x.v);
      case 'list': case 'tuple': return x.v.length ? '[' + x.v.map(v => nl + jsonDump(v, indent, sortKeys, level + 1)).join(sep) + end + ']' : '[]';
      case 'dict': {
        let entries = [...x.v.values()].map(([k, v]) => {
          let ks;
          if (k.t === 'str') ks = k.v; else if (k.t === 'int' || k.t === 'float') ks = fmt(k); else if (k.t === 'bool') ks = k.v ? 'true' : 'false'; else if (k.t === 'NoneType') ks = 'null';
          else throw new PyError('TypeError', `keys must be str, int, float, bool or None, not ${typeName(k)}`);
          return [ks, v];
        });
        if (sortKeys) entries = entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
        return entries.length ? '{' + entries.map(([k, v]) => nl + jsonStr(k) + ': ' + jsonDump(v, indent, sortKeys, level + 1)).join(sep) + end + '}' : '{}';
      }
    }
    throw new PyError('TypeError', `Object of type ${typeName(x)} is not JSON serializable`);
  }
  function jsonParse(src) {
    let i = 0;
    const bad = what => { const line = src.slice(0, i).split('\n').length, col = i - src.lastIndexOf('\n', i - 1); throw new PyError('JSONDecodeError', `${what}: line ${line} column ${col} (char ${i})`); };
    const ws = () => { while (i < src.length && ' \t\n\r'.includes(src[i])) i++; };
    function value() {
      ws();
      const c = src[i];
      if (c === '{') {
        i++; const d = dict(); ws();
        if (src[i] === '}') { i++; return d; }
        for (;;) {
          ws();
          if (src[i] !== '"') bad('Expecting property name enclosed in double quotes');
          const k = str(); ws();
          if (src[i] !== ':') bad("Expecting ':' delimiter");
          i++;
          const v = value();
          d.v.set(keyOf(k), [k, v]);
          ws();
          if (src[i] === ',') { i++; continue; }
          if (src[i] === '}') { i++; return d; }
          bad("Expecting ',' delimiter");
        }
      }
      if (c === '[') {
        i++; const a = []; ws();
        if (src[i] === ']') { i++; return V.list(a); }
        for (;;) {
          a.push(value()); ws();
          if (src[i] === ',') { i++; continue; }
          if (src[i] === ']') { i++; return V.list(a); }
          bad("Expecting ',' delimiter");
        }
      }
      if (c === '"') return str();
      const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?/.exec(src.slice(i));
      if (m && m[0]) { i += m[0].length; return m[2] || m[3] ? fl(parseFloat(m[0])) : V.int(parseInt(m[0], 10)); }
      for (const [w, v] of [['true', V.bool(true)], ['false', V.bool(false)], ['null', V.none], ['NaN', fl(NaN)], ['Infinity', fl(Infinity)]]) if (src.startsWith(w, i)) { i += w.length; return v; }
      bad('Expecting value');
    }
    function str() {
      i++;
      let s = '';
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '\\') {
          const e = src[i + 1];
          if (e === 'u') { s += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16)); i += 6; continue; }
          s += { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '/': '/', '\\': '\\', '"': '"' }[e] ?? e;
          i += 2; continue;
        }
        s += src[i++];
      }
      if (i >= src.length) bad('Unterminated string starting at');
      i++;
      return V.str(s);
    }
    const v = value();
    ws();
    if (i < src.length) bad('Extra data');
    return v;
  }
  function makeJson() {
    const opts = kw => [kw.indent && kw.indent.t !== 'NoneType' ? needInt(kw.indent) : null, kw.sort_keys && truthy(kw.sort_keys)];
    return mkModule('json', {
      dumps: nat('dumps', ([x], kw) => V.str(jsonDump(x, ...opts(kw), 0))),
      loads: nat('loads', ([s]) => { if (isBytes(s)) s = V.str(s.attrs.get('_text').v); if (s.t !== 'str') throw new PyError('TypeError', `the JSON object must be str, bytes or bytearray, not ${typeName(s)}`); return jsonParse(s.v); }),
      dump: nat('dump', ([x, f], kw, ctx) => { writeFile(f, jsonDump(x, ...opts(kw), 0), ctx); return V.none; }),
      load: nat('load', ([f]) => { needRead(f); return jsonParse(readRest(f)); }),
      JSONDecodeError: { t: 'exctype', v: 'JSONDecodeError' },
    });
  }
  /* csv */
  function csvParse(line, delim = ',') {
    const out = [];
    let cur = '', q = false, i = 0;
    const s = line.replace(/\r?\n$/, '');
    for (; i < s.length; i++) {
      const c = s[i];
      if (q) { if (c === '"' && s[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"' && cur === '') q = true;
      else if (c === delim) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return line.replace(/\r?\n$/, '') === '' ? [] : out;
  }
  const csvField = (v, delim = ',') => { const s = v.t === 'NoneType' ? '' : fmt(v); return /["\r\n]/.test(s) || s.includes(delim) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function makeCsv() {
    const lines = (src, delim) => { const it = iterOf(src); return () => { for (;;) { const v = it.next(); if (v === DONE) return DONE; const row = csvParse(v.v, delim); if (row.length || v.v.trim()) return row; } }; };
    const delimOf = kw => (kw.delimiter ? fmt(kw.delimiter) : ',');
    return mkModule('csv', {
      reader: nat('reader', ([src], kw) => { const nx = lines(src, delimOf(kw)); return mkIter('_csv.reader', () => { const r = nx(); return r === DONE ? DONE : V.list(r.map(V.str)); }); }),
      DictReader: nat('DictReader', ([src], kw) => {
        const nx = lines(src, delimOf(kw));
        let names = kw.fieldnames ? iterate(kw.fieldnames).map(x => x.v) : null;
        const it = mkIter('DictReader', () => {
          if (!names) { const h = nx(); if (h === DONE) return DONE; names = h; }
          const r = nx();
          if (r === DONE) return DONE;
          const d = dict();
          names.forEach((n, i) => d.v.set(keyOf(V.str(n)), [V.str(n), r[i] == null ? V.none : V.str(r[i])]));
          return d;
        });
        it.attrs = new Map([['fieldnames', () => { if (!names) { const h = nx(); names = h === DONE ? [] : h; } return V.list(names.map(V.str)); }]]);
        return it;
      }),
      writer: nat('writer', ([f], kw, ctx) => { const dl = delimOf(kw); return mkObj('_csv.writer', {
        writerow: nat('writerow', ([row]) => { writeFile(f, iterate(row).map(v => csvField(v, dl)).join(dl) + '\r\n', ctx); return V.none; }),
        writerows: nat('writerows', ([rows]) => { for (const row of iterate(rows)) writeFile(f, iterate(row).map(v => csvField(v, dl)).join(dl) + '\r\n', ctx); return V.none; }),
      }); }),
      DictWriter: nat('DictWriter', ([f, fn], kw, ctx) => {
        const names = iterate(fn || kw.fieldnames).map(x => x.v);
        return mkObj('csv.DictWriter', {
          writeheader: nat('writeheader', () => { writeFile(f, names.map(n => csvField(V.str(n))).join(',') + '\r\n', ctx); return V.none; }),
          writerow: nat('writerow', ([d]) => {
            for (const [, [k]] of d.v) if (!names.includes(fmt(k))) throw new PyError('ValueError', `dict contains fields not in fieldnames: ${repr(k)}`);
            writeFile(f, names.map(n => { const e = d.v.get(keyOf(V.str(n))); return e ? csvField(e[1]) : ''; }).join(',') + '\r\n', ctx);
            return V.none;
          }),
        });
      }),
    });
  }
  function makeSys(ctx) {
    return mkModule('sys', {
      argv: V.list((ctx.argv || ['spell.py']).map(a => V.str(String(a)))),
      exit: nat('exit', args => { const e = new PyError('SystemExit', args[0] && args[0].t === 'str' ? args[0].v : ''); e.exitArg = args[0] || V.none; e.obj = { t: 'exception', cls: 'SystemExit', msg: e.message, args: args.slice(0, 1) }; throw e; }),
      version: V.str('3.12.0 (Script & Sorcery)'),
      maxsize: V.int(9007199254740991),
    });
  }
  /* re: Python patterns run on JavaScript's regex engine */
  const RE_FLAGS = { IGNORECASE: 2, I: 2, MULTILINE: 8, M: 8, DOTALL: 16, S: 16, VERBOSE: 64, X: 64, ASCII: 256, A: 256 };
  function compileRe(pat, flags) {
    if (pat.t === 'pattern') return pat;
    if (pat.t !== 'str') throw new PyError('TypeError', 'first argument must be string or compiled pattern');
    let src = pat.v, fl2 = flags ? needInt(flags) : 0;
    const inline = /^\(\?([aiLmsux]+)\)/.exec(src);
    if (inline) { src = src.slice(inline[0].length); for (const c of inline[1]) fl2 |= { i: 2, m: 8, s: 16, x: 64 }[c] || 0; }
    if (fl2 & 64) src = src.replace(/\\#/g, '\u0000').replace(/#.*$/gm, '').replace(/\s+/g, '').replace(/\u0000/g, '\\#');
    let js = src.replace(/\(\?P<(\w+)>/g, '(?<$1>').replace(/\(\?P=(\w+)\)/g, '\\k<$1>').replace(/\\A/g, '^').replace(/\\Z/g, '$(?![\\s\\S])');
    let jsFlags = (fl2 & 2 ? 'i' : '') + (fl2 & 8 ? 'm' : '') + (fl2 & 16 ? 's' : '');
    let re;
    try { re = new RegExp(js, jsFlags + 'g'); } catch (e) { throw new PyError('PatternError', e.message.replace(/^Invalid regular expression: /, '')); }
    const groups = (new RegExp(js + '|', jsFlags).exec('') || []).length - 1;
    return { t: 'pattern', pattern: src, py: pat.v, flags: fl2, js, jsFlags, groups, attrs: new Map() };
  }
  function matchObj(m, p, s) {
    const names = m.groups ? Object.keys(m.groups) : [];
    const g = i => {
      if (i.t === 'str') { if (!names.includes(i.v)) throw new PyError('IndexError', 'no such group'); const v = m.groups[i.v]; return v == null ? V.none : V.str(v); }
      const k = needInt(i);
      if (k < 0 || k > p.groups) throw new PyError('IndexError', 'no such group');
      return m[k] == null ? V.none : V.str(m[k]);
    };
    const start = m.index, end = m.index + m[0].length;
    const mo = { t: 'match', m, start, end, attrs: new Map() };
    mo.attrs.set('group', nat('group', args => (args.length <= 1 ? g(args[0] || V.int(0)) : V.tuple(args.map(g)))));
    mo.attrs.set('groups', nat('groups', ([d]) => V.tuple(Array.from({ length: p.groups }, (_, i) => (m[i + 1] == null ? d || V.none : V.str(m[i + 1]))))));
    mo.attrs.set('groupdict', nat('groupdict', () => { const d = dict(); for (const n of names) d.v.set(keyOf(V.str(n)), [V.str(n), m.groups[n] == null ? V.none : V.str(m.groups[n])]); return d; }));
    mo.attrs.set('start', nat('start', () => V.int(start)));
    mo.attrs.set('end', nat('end', () => V.int(end)));
    mo.attrs.set('span', nat('span', () => V.tuple([V.int(start), V.int(end)])));
    mo.attrs.set('string', V.str(s));
    return mo;
  }
  function reExec(p, s, mode) {
    if (s.t !== 'str') throw new PyError('TypeError', `expected string or bytes-like object, got '${typeName(s)}'`);
    let re;
    if (mode === 'search') re = new RegExp(p.js, p.jsFlags);
    else if (mode === 'match') re = new RegExp(p.js, p.jsFlags + 'y');
    else re = new RegExp('(?:' + p.js + ')$(?![\\s\\S])', p.jsFlags + 'y');
    re.lastIndex = 0;
    const m = re.exec(s.v);
    return m ? matchObj(m, p, s.v) : V.none;
  }
  function reAll(p, s) {
    if (s.t !== 'str') throw new PyError('TypeError', `expected string or bytes-like object, got '${typeName(s)}'`);
    const re = new RegExp(p.js, p.jsFlags + 'g'), out = [];
    let m;
    while ((m = re.exec(s.v))) { out.push(m); if (m[0] === '') re.lastIndex++; if (out.length > MAX_STEPS) break; }
    return out;
  }
  function reSub(p, repl, s, count, ctx) {
    let n = 0;
    const max = count ? needInt(count) : 0;
    const re = new RegExp(p.js, p.jsFlags + 'g');
    return s.v.replace(re, (...a) => {
      if (max && n >= max) return a[0];
      n++;
      const hasNamed = typeof a[a.length - 1] === 'object';
      const m = a.slice(0, hasNamed ? -3 : -2);
      m.index = a[hasNamed ? a.length - 3 : a.length - 2];
      if (hasNamed) m.groups = a[a.length - 1];
      if (repl.t !== 'str') { const r = callValue(repl, [matchObj(m, p, s.v)], {}, ctx); if (r.t !== 'str') throw new PyError('TypeError', `expected str instance, ${typeName(r)} found`); return r.v; }
      return repl.v.replace(/\\(\d{1,2})|\\g<(\w+)>|\\n|\\t|\\\\/g, (t, d, gname) => {
        if (t === '\\n') return '\n'; if (t === '\\t') return '\t'; if (t === '\\\\') return '\\';
        if (d != null) { if (+d > p.groups) throw new PyError('PatternError', `invalid group reference ${d}`); return m[+d] ?? ''; }
        if (/^\d+$/.test(gname)) return m[+gname] ?? '';
        if (!m.groups || !(gname in m.groups)) throw new PyError('IndexError', `unknown group name '${gname}'`);
        return m.groups[gname] ?? '';
      });
    });
  }
  function reMethods(ctx) {
    const str = s => { if (!s || s.t !== 'str') throw new PyError('TypeError', `expected string or bytes-like object, got '${s ? typeName(s) : 'NoneType'}'`); return s; };
    return {
      search: (p, [s]) => reExec(p, str(s), 'search'),
      match: (p, [s]) => reExec(p, str(s), 'match'),
      fullmatch: (p, [s]) => reExec(p, str(s), 'full'),
      findall: (p, [s]) => V.list(reAll(p, str(s)).map(m => (p.groups === 0 ? V.str(m[0]) : p.groups === 1 ? V.str(m[1] ?? '') : V.tuple(m.slice(1).map(x => V.str(x ?? '')))))),
      finditer: (p, [s]) => { const ms = reAll(p, str(s)); let i = 0; return mkIter('callable_iterator', () => (i < ms.length ? matchObj(ms[i++], p, s.v) : DONE)); },
      sub: (p, [repl, s, count], kw) => V.str(reSub(p, repl, str(s), count || kw.count, ctx)),
      split: (p, [s, maxs], kw) => {
        str(s);
        const max = maxs || kw.maxsplit ? needInt(maxs || kw.maxsplit) : 0;
        const out = []; let last = 0, n = 0;
        for (const m of reAll(p, s)) {
          if (max && n >= max) break;
          if (m[0] === '' && m.index === 0) continue;
          out.push(V.str(s.v.slice(last, m.index)), ...m.slice(1).map(x => (x == null ? V.none : V.str(x))));
          last = m.index + m[0].length; n++;
        }
        out.push(V.str(s.v.slice(last)));
        return V.list(out);
      },
    };
  }
  function makeRe(ctx) {
    const fns = reMethods(ctx);
    const mod = {};
    // module-level functions take the pattern first, and flags last
    const FLAGS_AT = { search: 2, match: 2, fullmatch: 2, findall: 2, finditer: 2, sub: 4, split: 3 };
    for (const name in FLAGS_AT) {
      mod[name] = nat(name, (args, kw) => {
        if (!args.length) throw new PyError('TypeError', `${name}() missing required argument 'pattern' (pos 1)`);
        return fns[name](compileRe(args[0], args[FLAGS_AT[name]] || kw.flags), args.slice(1, FLAGS_AT[name]), kw);
      });
    }
    mod.compile = nat('compile', (args, kw) => {
      const p = compileRe(args[0], args[1] || kw.flags);
      for (const k in fns) p.attrs.set(k, nat(k, (a, kw2) => fns[k](p, a, kw2)));
      p.attrs.set('pattern', V.str(p.py));
      p.attrs.set('groups', V.int(p.groups));
      return p;
    });
    mod.escape = nat('escape', ([s]) => V.str(s.v.replace(/[.*+?^${}()|[\]\\\-#&~\s]/g, c => '\\' + c)));
    for (const k in RE_FLAGS) mod[k] = V.int(RE_FLAGS[k]);
    mod.error = { t: 'exctype', v: 'PatternError' };
    mod.PatternError = mod.error;
    return mkModule('re', mod);
  }
  function makePytest() {
    return mkModule('pytest', {
      raises: nat('raises', ([T]) => mkObj('raises', { value: V.none, exc: T })),
      approx: nat('approx', ([x]) => x),
    });
  }
  // a pretend internet: steps list the pages a spell may fetch
  function makeRequests(ctx) {
    const resp = (url, data) => mkObj('requests.Response', {
      status_code: V.int(data == null ? 404 : 200),
      ok: V.bool(data != null),
      url: V.str(url),
      text: V.str(data == null ? 'Not Found' : typeof data === 'string' ? data : JSON.stringify(data)),
      json: nat('json', () => { if (data == null) throw new PyError('JSONDecodeError', 'Expecting value: line 1 column 1 (char 0)'); return jsonParse(typeof data === 'string' ? data : JSON.stringify(data)); }),
      raise_for_status: nat('raise_for_status', () => { if (data == null) throw new PyError('HTTPError', `404 Client Error: Not Found for url: ${url}`); return V.none; }),
      content: makeBytes(data == null ? 'Not Found' : typeof data === 'string' ? data : JSON.stringify(data)),
    });
    const exc = n => ({ t: 'exctype', v: n });
    return mkModule('requests', {
      HTTPError: exc('HTTPError'), ConnectionError: exc('ConnectionError'), RequestException: exc('OSError'),
      exceptions: mkModule('requests.exceptions', { HTTPError: exc('HTTPError'), ConnectionError: exc('ConnectionError'), RequestException: exc('OSError') }),
      get: nat('get', ([u0], kw) => {
        if (!u0 || u0.t !== 'str') throw new PyError('TypeError', 'get() missing 1 required positional argument: \'url\'');
        let u = u0;
        if (kw.params && kw.params.t === 'dict') {
          const q = [...kw.params.v.values()].map(([k, v]) => encodeURIComponent(fmt(k)).replace(/%20/g, '+') + '=' + encodeURIComponent(fmt(v)).replace(/%20/g, '+')).join('&');
          u = V.str(u0.v + (u0.v.includes('?') ? '&' : '?') + q);
        }
        const site = (ctx.web || {});
        const key = Object.keys(site).find(k => k === u.v || k === u.v.replace(/\?.*$/, ''));
        if (!key && !Object.keys(site).some(k => u.v.startsWith(k.split('/').slice(0, 3).join('/')))) throw new PyError('ConnectionError', `Failed to resolve ${u.v.split('/')[2] || u.v}`);
        return resp(u.v, key ? site[key] : null);
      }),
    });
  }
  const STRING_MOD = () => mkModule('string', { ascii_letters: V.str('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), ascii_lowercase: V.str('abcdefghijklmnopqrstuvwxyz'), ascii_uppercase: V.str('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), digits: V.str('0123456789'), punctuation: V.str('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~') });
  // argparse: named options from the command line (the words in sys.argv)
  function makeArgparse(ctx) {
    const exit = (ctx2, text, code) => { const e = new PyError('SystemExit', text); e.exitArg = text ? V.str(text) : V.int(code); e.obj = { t: 'exception', cls: 'SystemExit', msg: text, args: [] }; throw e; };
    const Parser = nat('ArgumentParser', (args, kw) => {
      const prog = kw.prog ? fmt(kw.prog) : (ctx.argv && ctx.argv[0] ? String(ctx.argv[0]).split(/[\\/]/).pop() : 'spell.py');
      const desc = kw.description && kw.description.t === 'str' ? kw.description.v : '';
      const opts = [], pos = [];
      const usage = () => `usage: ${prog} [-h]` + opts.map(o => (o.flag ? ` [${o.names[0]}]` : ` [${o.names[0]} ${o.dest.toUpperCase()}]`)).join('') + pos.map(o => ' ' + o.dest).join('');
      const fail = msg => exit(ctx, `${usage()}\n${prog}: error: ${msg}`, 2);
      const convert = (o, text) => {
        if (!o.type) return V.str(text);
        try { return callValue(o.type, [V.str(text)], {}, ctx); }
        catch (e) { if (e instanceof PyError) fail(`argument ${o.names.join('/')}: invalid ${o.type.v || 'value'} value: '${text}'`); throw e; }
      };
      const parser = mkObj('ArgumentParser', {});
      parser.attrs.set('add_argument', nat('add_argument', (names, kw2) => {
        const ns = names.map(n => fmt(n));
        if (!ns.length) throw new PyError('TypeError', 'add_argument() needs a name, like "-n" or "name"');
        const optional = ns[0].startsWith('-');
        const long = ns.find(n => n.startsWith('--'));
        const dest = kw2.dest ? fmt(kw2.dest) : (optional ? (long || ns[0]).replace(/^-+/, '') : ns[0]).replace(/-/g, '_');
        const o = { names: ns, dest, type: kw2.type, def: kw2.default || (kw2.action && fmt(kw2.action) === 'store_true' ? V.bool(false) : V.none), help: kw2.help ? fmt(kw2.help) : '', flag: kw2.action && fmt(kw2.action) === 'store_true', required: kw2.required && truthy(kw2.required), choices: kw2.choices ? iterate(kw2.choices) : null };
        (optional ? opts : pos).push(o);
        return V.none;
      }));
      parser.attrs.set('parse_args', nat('parse_args', ([given]) => {
        const words = given && given.t !== 'NoneType' ? iterate(given).map(fmt) : (ctx.argv || ['spell.py']).slice(1).map(String);
        const vals = new Map();
        for (const o of opts) vals.set(o.dest, o.def);
        const left = [];
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          if (w === '-h' || w === '--help') {
            const lines = [usage(), ''];
            if (desc) lines.push(desc, '');
            if (pos.length) { lines.push('positional arguments:'); for (const o of pos) lines.push(`  ${o.dest.padEnd(12)}${o.help}`.trimEnd()); lines.push(''); }
            lines.push('options:', '  -h, --help  show this help message and exit');
            for (const o of opts) lines.push(`  ${(o.flag ? o.names.join(', ') : o.names.map(n => `${n} ${o.dest.toUpperCase()}`).join(', ')).padEnd(12)}${o.help}`.trimEnd());
            for (const l of lines) ctx.emit({ kind: 'print', text: l, raw: l + '\n' });
            exit(ctx, '', 0);
          }
          if (w.startsWith('-') && !/^-\d/.test(w)) {
            const o = opts.find(x => x.names.includes(w));
            if (!o) fail(`unrecognized arguments: ${w}`);
            if (o.flag) { vals.set(o.dest, V.bool(true)); continue; }
            if (i + 1 >= words.length) fail(`argument ${o.names.join('/')}: expected one argument`);
            const v = convert(o, words[++i]);
            if (o.choices && !o.choices.some(c => equal(c, v))) fail(`argument ${o.names.join('/')}: invalid choice: ${repr(v)}`);
            vals.set(o.dest, v);
          } else left.push(w);
        }
        const missing = pos.slice(left.length).map(o => o.dest);
        if (missing.length) fail(`the following arguments are required: ${missing.join(', ')}`);
        if (left.length > pos.length) fail(`unrecognized arguments: ${left.slice(pos.length).join(' ')}`);
        pos.forEach((o, i) => vals.set(o.dest, convert(o, left[i])));
        for (const o of opts) if (o.required && !words.some(w => o.names.includes(w))) fail(`the following arguments are required: ${o.names.join('/')}`);
        const ns = mkObj('Namespace', {});
        for (const [k, v] of vals) ns.attrs.set(k, v);
        ns.repr = () => `Namespace(${[...ns.attrs].map(([k, v]) => `${k}=${repr(v)}`).join(', ')})`;
        return ns;
      }));
      return parser;
    });
    return mkModule('argparse', { ArgumentParser: Parser });
  }
  function makeCopy() {
    const shallow = x => {
      switch (x.t) {
        case 'list': return V.list(x.v.slice());
        case 'dict': { const d = dict(); for (const [k, e] of x.v) d.v.set(k, [e[0], e[1]]); return d; }
        case 'set': { const r = mkSet([...x.v.values()]); r.frozen = x.frozen; return r; }
        case 'instance': return { t: 'instance', cls: x.cls, attrs: new Map(x.attrs) };
        default: return x;
      }
    };
    const deep = (x, memo) => {
      if (memo.has(x)) return memo.get(x);
      switch (x.t) {
        case 'list': { const r = V.list([]); memo.set(x, r); for (const v of x.v) r.v.push(deep(v, memo)); return r; }
        case 'tuple': return V.tuple(x.v.map(v => deep(v, memo)));
        case 'dict': { const d = dict(); memo.set(x, d); for (const [k, e] of x.v) d.v.set(k, [deep(e[0], memo), deep(e[1], memo)]); return d; }
        case 'set': { const r = mkSet([...x.v.values()].map(v => deep(v, memo))); r.frozen = x.frozen; return r; }
        case 'instance': { const o = { t: 'instance', cls: x.cls, attrs: new Map() }; memo.set(x, o); for (const [k, v] of x.attrs) o.attrs.set(k, deep(v, memo)); return o; }
        default: return x;
      }
    };
    return mkModule('copy', { copy: nat('copy', ([x]) => shallow(x)), deepcopy: nat('deepcopy', ([x]) => deep(x, new Map())) });
  }
  /* ---------- datetime: date, datetime and timedelta ----------
     Calendar maths follows CPython's own datetime.py (proleptic Gregorian ordinals). */
  const DT_DIM = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const DT_DBM = (() => { const a = [0, 0]; let t = 0; for (let m = 1; m < 12; m++) { t += DT_DIM[m]; a.push(t); } return a; })();
  const isLeapYear = y => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const daysIn = (y, m) => (m === 2 && isLeapYear(y) ? 29 : DT_DIM[m]);
  const daysBeforeYear = y => { y -= 1; return y * 365 + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400); };
  const ymd2ord = (y, m, d) => daysBeforeYear(y) + DT_DBM[m] + (m > 2 && isLeapYear(y) ? 1 : 0) + d;
  function ord2ymd(n) {
    n -= 1;
    const n400 = Math.floor(n / 146097); n %= 146097;
    let year = n400 * 400 + 1;
    const n100 = Math.floor(n / 36524); n %= 36524;
    const n4 = Math.floor(n / 1461); n %= 1461;
    const n1 = Math.floor(n / 365); n %= 365;
    year += n100 * 100 + n4 * 4 + n1;
    if (n1 === 4 || n100 === 4) return [year - 1, 12, 31];
    const leap = n1 === 3 && (n4 !== 24 || n100 === 3);
    let month = (n + 50) >> 5;
    let preceding = DT_DBM[month] + (month > 2 && leap ? 1 : 0);
    if (preceding > n) { month -= 1; preceding -= DT_DIM[month] + (month === 2 && leap ? 1 : 0); }
    return [year, month, n - preceding + 1];
  }
  const DT_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const pad0 = (n, w) => (n < 0 ? '-' + String(-n).padStart(w, '0') : String(n).padStart(w, '0'));
  function dtStrftime(p, fmtStr) {
    const ord = ymd2ord(p.y, p.m, p.d), wd = (ord + 6) % 7;
    return fmtStr.replace(/%(.)/g, (all, c) => {
      switch (c) {
        case 'Y': return pad0(p.y, 4);
        case 'y': return pad0(p.y % 100, 2);
        case 'm': return pad0(p.m, 2);
        case 'd': return pad0(p.d, 2);
        case 'H': return pad0(p.H, 2);
        case 'I': return pad0(p.H % 12 || 12, 2);
        case 'M': return pad0(p.Mi, 2);
        case 'S': return pad0(p.S, 2);
        case 'f': return pad0(p.us, 6);
        case 'p': return p.H < 12 ? 'AM' : 'PM';
        case 'A': return DT_DAYS[wd];
        case 'a': return DT_DAYS[wd].slice(0, 3);
        case 'B': return DT_MONTHS[p.m - 1];
        case 'b': case 'h': return DT_MONTHS[p.m - 1].slice(0, 3);
        case 'j': return pad0(ord - ymd2ord(p.y, 1, 1) + 1, 3);
        case 'w': return String((wd + 1) % 7);
        case 'u': return String(wd + 1);
        case 'x': return pad0(p.m, 2) + '/' + pad0(p.d, 2) + '/' + pad0(p.y % 100, 2);
        case 'X': return pad0(p.H, 2) + ':' + pad0(p.Mi, 2) + ':' + pad0(p.S, 2);
        case 'c': return DT_DAYS[wd].slice(0, 3) + ' ' + DT_MONTHS[p.m - 1].slice(0, 3) + ' ' + String(p.d).padStart(2, ' ') + ' ' + pad0(p.H, 2) + ':' + pad0(p.Mi, 2) + ':' + pad0(p.S, 2) + ' ' + pad0(p.y, 4);
        case 'Z': case 'z': return '';
        case '%': return '%';
        default: return all;
      }
    });
  }
  function dtStrptime(text, fmtStr) {
    const spec = { Y: '(\\d{4})', y: '(\\d{2})', m: '(\\d{1,2})', d: '(\\d{1,2})', H: '(\\d{1,2})', I: '(\\d{1,2})', M: '(\\d{1,2})', S: '(\\d{1,2})', f: '(\\d{1,6})', p: '(AM|PM)', j: '(\\d{1,3})',
      B: '(' + DT_MONTHS.join('|') + ')', b: '(' + DT_MONTHS.map(x => x.slice(0, 3)).join('|') + ')', A: '(' + DT_DAYS.join('|') + ')', a: '(' + DT_DAYS.map(x => x.slice(0, 3)).join('|') + ')' };
    const order = [];
    let re = '';
    for (let i = 0; i < fmtStr.length; i++) {
      const c = fmtStr[i];
      if (c === '%' && i + 1 < fmtStr.length) {
        const k = fmtStr[++i];
        if (k === '%') re += '%';
        else if (spec[k]) { re += spec[k]; order.push(k); }
        else throw new PyError('ValueError', "'" + k + "' is a bad directive in format '" + fmtStr + "'");
      } else if (/\s/.test(c)) re += '\\s+';
      else re += c.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');
    }
    const m = new RegExp('^' + re + '$', 'i').exec(text);
    if (!m) throw new PyError('ValueError', 'time data ' + strRepr(text) + ' does not match format ' + strRepr(fmtStr));
    const p = { y: 1900, m: 1, d: 1, H: 0, Mi: 0, S: 0, us: 0 };
    let pm = null;
    order.forEach((k, i) => {
      const v = m[i + 1];
      if (k === 'Y') p.y = +v;
      else if (k === 'y') p.y = +v < 69 ? 2000 + +v : 1900 + +v;
      else if (k === 'm') p.m = +v;
      else if (k === 'd') p.d = +v;
      else if (k === 'H') p.H = +v;
      else if (k === 'I') p.H = +v % 12;
      else if (k === 'M') p.Mi = +v;
      else if (k === 'S') p.S = +v;
      else if (k === 'f') p.us = +v.padEnd(6, '0');
      else if (k === 'p') pm = v.toUpperCase() === 'PM';
      else if (k === 'B') p.m = DT_MONTHS.findIndex(x => x.toLowerCase() === v.toLowerCase()) + 1;
      else if (k === 'b') p.m = DT_MONTHS.findIndex(x => x.slice(0, 3).toLowerCase() === v.toLowerCase()) + 1;
    });
    if (pm != null) p.H += pm ? 12 : 0;
    if (p.m < 1 || p.m > 12 || p.d < 1 || p.d > daysIn(p.y, p.m) || p.H > 23 || p.Mi > 59 || p.S > 61) throw new PyError('ValueError', 'unconverted data remains or value out of range: ' + strRepr(text));
    return p;
  }
  function makeDatetime(ctx) {
    const mk = (cls, fields) => { const o = { t: 'instance', cls, attrs: new Map() }; for (const k in fields) o.attrs.set(k, typeof fields[k] === 'number' ? V.int(fields[k]) : fields[k]); return o; };
    const iv = (o, k) => num(o.attrs.get(k));
    const isA = (x, cls) => x && x.t === 'instance' && x.cls.mro.includes(cls);
    const intArg = (v, what) => { if (!v || (v.t !== 'int' && v.t !== 'bool')) throw new PyError('TypeError', "'" + typeName(v || V.none) + "' object cannot be interpreted as an integer (" + what + ')'); return num(v); };
    const opt = (args, kw, i, name, def) => (args[i] !== undefined ? args[i] : kw[name] !== undefined ? kw[name] : def);
    const native = (name, fn) => nat(name, fn);
    const cm = fn => ({ t: 'classmethod', fn });
    const cmp = (key) => ({
      __eq__: native('__eq__', ([a, b]) => (b && b.t === 'instance' && b.cls === a.cls ? V.bool(key(a) === key(b)) : NOTIMPL)),
      __ne__: native('__ne__', ([a, b]) => (b && b.t === 'instance' && b.cls === a.cls ? V.bool(key(a) !== key(b)) : NOTIMPL)),
      __lt__: native('__lt__', ([a, b]) => (b && b.t === 'instance' && b.cls === a.cls ? V.bool(key(a) < key(b)) : NOTIMPL)),
      __le__: native('__le__', ([a, b]) => (b && b.t === 'instance' && b.cls === a.cls ? V.bool(key(a) <= key(b)) : NOTIMPL)),
      __gt__: native('__gt__', ([a, b]) => (b && b.t === 'instance' && b.cls === a.cls ? V.bool(key(a) > key(b)) : NOTIMPL)),
      __ge__: native('__ge__', ([a, b]) => (b && b.t === 'instance' && b.cls === a.cls ? V.bool(key(a) >= key(b)) : NOTIMPL)),
      __hash__: native('__hash__', ([a]) => V.int(key(a) % 2147483647)),
    });
    /* timedelta: stored as days, seconds (0..86399) and microseconds (0..999999) */
    const TD = makeClass('datetime.timedelta', [], {});
    const tdUs = td => iv(td, 'days') * 86400e6 + iv(td, 'seconds') * 1e6 + iv(td, 'microseconds');
    const tdFrom = us => {
      us = Math.round(us);
      const days = Math.floor(us / 86400e6);
      const rem = us - days * 86400e6;
      const secs = Math.floor(rem / 1e6);
      if (Math.abs(days) > 999999999) throw new PyError('OverflowError', 'days=' + days + '; must have magnitude <= 999999999');
      return mk(TD, { days, seconds: secs, microseconds: Math.round(rem - secs * 1e6) });
    };
    const tdStr = td => {
      const d = iv(td, 'days'), sec = iv(td, 'seconds'), us = iv(td, 'microseconds');
      let out = Math.floor(sec / 3600) + ':' + pad0(Math.floor(sec % 3600 / 60), 2) + ':' + pad0(sec % 60, 2);
      if (us) out += '.' + pad0(us, 6);
      if (d) out = d + ' day' + (Math.abs(d) !== 1 ? 's' : '') + ', ' + out;
      return out;
    };
    Object.assign(TD.dict, new Map());
    const tdDict = {
      __init__: native('__init__', ([self, ...args], kw) => {
        const names = ['days', 'seconds', 'microseconds', 'milliseconds', 'minutes', 'hours', 'weeks'];
        for (const k of Object.keys(kw)) if (!names.includes(k)) throw new PyError('TypeError', "'" + k + "' is an invalid keyword argument for __new__()");
        const g = (i, n) => { const v = opt(args, kw, i, n, V.int(0)); if (!isNum(v)) throw new PyError('TypeError', 'unsupported type for timedelta ' + n + ' component: ' + typeName(v)); return num(v); };
        const us = ((g(0, 'days') + g(6, 'weeks') * 7) * 86400 + g(1, 'seconds') + g(4, 'minutes') * 60 + g(5, 'hours') * 3600) * 1e6 + g(2, 'microseconds') + g(3, 'milliseconds') * 1000;
        const t = tdFrom(us);
        for (const [k, v] of t.attrs) self.attrs.set(k, v);
        return V.none;
      }),
      __str__: native('__str__', ([a]) => V.str(tdStr(a))),
      __repr__: native('__repr__', ([a]) => {
        const parts = [['days', iv(a, 'days')], ['seconds', iv(a, 'seconds')], ['microseconds', iv(a, 'microseconds')]].filter(p => p[1]).map(p => p[0] + '=' + p[1]);
        return V.str('datetime.timedelta(' + (parts.length ? parts.join(', ') : '0') + ')');
      }),
      total_seconds: native('total_seconds', ([a]) => V.float(tdUs(a) / 1e6)),
      __add__: native('__add__', ([a, b]) => (isA(b, TD) ? tdFrom(tdUs(a) + tdUs(b)) : NOTIMPL)),
      __radd__: native('__radd__', ([a, b]) => (isA(b, TD) ? tdFrom(tdUs(a) + tdUs(b)) : NOTIMPL)),
      __sub__: native('__sub__', ([a, b]) => (isA(b, TD) ? tdFrom(tdUs(a) - tdUs(b)) : NOTIMPL)),
      __neg__: native('__neg__', ([a]) => tdFrom(-tdUs(a))),
      __pos__: native('__pos__', ([a]) => a),
      __abs__: native('__abs__', ([a]) => tdFrom(Math.abs(tdUs(a)))),
      __mul__: native('__mul__', ([a, b]) => (isNum(b) ? tdFrom(tdUs(a) * num(b)) : NOTIMPL)),
      __rmul__: native('__rmul__', ([a, b]) => (isNum(b) ? tdFrom(tdUs(a) * num(b)) : NOTIMPL)),
      __truediv__: native('__truediv__', ([a, b]) => {
        if (isA(b, TD)) { if (!tdUs(b)) throw new PyError('ZeroDivisionError', 'division by zero'); return V.float(tdUs(a) / tdUs(b)); }
        if (isNum(b)) { if (!num(b)) throw new PyError('ZeroDivisionError', 'division by zero'); return tdFrom(tdUs(a) / num(b)); }
        return NOTIMPL;
      }),
      __floordiv__: native('__floordiv__', ([a, b]) => {
        if (isA(b, TD)) { if (!tdUs(b)) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero'); return V.int(Math.floor(tdUs(a) / tdUs(b))); }
        if (b.t === 'int') { if (!num(b)) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero'); return tdFrom(Math.floor(tdUs(a) / num(b))); }
        return NOTIMPL;
      }),
      __bool__: native('__bool__', ([a]) => V.bool(tdUs(a) !== 0)),
      ...cmp(tdUs),
    };
    for (const k in tdDict) TD.dict.set(k, tdDict[k]);
    /* date */
    const DATE = makeClass('datetime.date', [], {});
    const checkYMD = (y, m, d) => {
      if (y < 1 || y > 9999) throw new PyError('ValueError', 'year ' + y + ' is out of range');
      if (m < 1 || m > 12) throw new PyError('ValueError', 'month must be in 1..12');
      if (d < 1 || d > daysIn(y, m)) throw new PyError('ValueError', 'day is out of range for month');
    };
    const ymdOf = o => [iv(o, 'year'), iv(o, 'month'), iv(o, 'day')];
    const dateOrd = o => ymd2ord(...ymdOf(o));
    const dateFromOrd = n => { if (n < 1 || n > 3652059) throw new PyError('OverflowError', 'date value out of range'); const [y, m, d] = ord2ymd(n); return mk(DATE, { year: y, month: m, day: d }); };
    const isoDate = o => { const [y, m, d] = ymdOf(o); return pad0(y, 4) + '-' + pad0(m, 2) + '-' + pad0(d, 2); };
    const parts = o => ({ y: iv(o, 'year'), m: iv(o, 'month'), d: iv(o, 'day'), H: o.attrs.has('hour') ? iv(o, 'hour') : 0, Mi: o.attrs.has('minute') ? iv(o, 'minute') : 0, S: o.attrs.has('second') ? iv(o, 'second') : 0, us: o.attrs.has('microsecond') ? iv(o, 'microsecond') : 0 });
    const today = () => { const n = new Date(); return [n.getFullYear(), n.getMonth() + 1, n.getDate(), n.getHours(), n.getMinutes(), n.getSeconds(), n.getMilliseconds() * 1000]; };
    const dateDict = {
      __init__: native('__init__', ([self, ...args], kw) => {
        const y = intArg(opt(args, kw, 0, 'year'), 'year'), m = intArg(opt(args, kw, 1, 'month'), 'month'), d = intArg(opt(args, kw, 2, 'day'), 'day');
        checkYMD(y, m, d);
        self.attrs.set('year', V.int(y)); self.attrs.set('month', V.int(m)); self.attrs.set('day', V.int(d));
        return V.none;
      }),
      __str__: native('__str__', ([a]) => V.str(isoDate(a))),
      __repr__: native('__repr__', ([a]) => V.str('datetime.date(' + ymdOf(a).join(', ') + ')')),
      __format__: native('__format__', ([a, spec]) => V.str(spec.v ? dtStrftime(parts(a), spec.v) : fmt(a))),
      isoformat: native('isoformat', ([a]) => V.str(isoDate(a))),
      weekday: native('weekday', ([a]) => V.int((dateOrd(a) + 6) % 7)),
      isoweekday: native('isoweekday', ([a]) => V.int((dateOrd(a) + 6) % 7 + 1)),
      toordinal: native('toordinal', ([a]) => V.int(dateOrd(a))),
      strftime: native('strftime', ([a, f]) => { if (!f || f.t !== 'str') throw new PyError('TypeError', 'strftime() argument 1 must be str'); return V.str(dtStrftime(parts(a), f.v)); }),
      replace: native('replace', ([a], kw) => {
        const [y, m, d] = ymdOf(a);
        const ny = kw.year ? num(kw.year) : y, nm = kw.month ? num(kw.month) : m, nd = kw.day ? num(kw.day) : d;
        checkYMD(ny, nm, nd);
        return mk(DATE, { year: ny, month: nm, day: nd });
      }),
      __add__: native('__add__', ([a, b]) => (isA(b, TD) ? dateFromOrd(dateOrd(a) + iv(b, 'days')) : NOTIMPL)),
      __radd__: native('__radd__', ([a, b]) => (isA(b, TD) ? dateFromOrd(dateOrd(a) + iv(b, 'days')) : NOTIMPL)),
      __sub__: native('__sub__', ([a, b]) => {
        if (isA(b, TD)) return dateFromOrd(dateOrd(a) - iv(b, 'days'));
        if (b && b.t === 'instance' && b.cls === DATE) return tdFrom((dateOrd(a) - dateOrd(b)) * 86400e6);
        return NOTIMPL;
      }),
      today: cm(native('today', () => { const [y, m, d] = today(); return mk(DATE, { year: y, month: m, day: d }); })),
      fromordinal: cm(native('fromordinal', ([c, n]) => dateFromOrd(intArg(n, 'ordinal')))),
      fromisoformat: cm(native('fromisoformat', ([c, t]) => {
        const m = t && t.t === 'str' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(t.v) : null;
        if (!m) throw new PyError('ValueError', 'Invalid isoformat string: ' + (t ? repr(t) : "''"));
        checkYMD(+m[1], +m[2], +m[3]);
        return mk(DATE, { year: +m[1], month: +m[2], day: +m[3] });
      })),
      ...cmp(dateOrd),
    };
    for (const k in dateDict) DATE.dict.set(k, dateDict[k]);
    /* datetime: a date plus a time of day */
    const DT = makeClass('datetime.datetime', [DATE], {});
    const dtUs = o => dateOrd(o) * 86400e6 + iv(o, 'hour') * 3600e6 + iv(o, 'minute') * 60e6 + iv(o, 'second') * 1e6 + iv(o, 'microsecond');
    const dtFromUs = us => {
      const ord = Math.floor(us / 86400e6);
      let rem = us - ord * 86400e6;
      const [y, m, d] = ord2ymd(ord);
      const H = Math.floor(rem / 3600e6); rem -= H * 3600e6;
      const Mi = Math.floor(rem / 60e6); rem -= Mi * 60e6;
      const S = Math.floor(rem / 1e6);
      return mk(DT, { year: y, month: m, day: d, hour: H, minute: Mi, second: S, microsecond: Math.round(rem - S * 1e6) });
    };
    const isoTime = o => pad0(iv(o, 'hour'), 2) + ':' + pad0(iv(o, 'minute'), 2) + ':' + pad0(iv(o, 'second'), 2) + (iv(o, 'microsecond') ? '.' + pad0(iv(o, 'microsecond'), 6) : '');
    const fromParts = p => { checkYMD(p.y, p.m, p.d); return mk(DT, { year: p.y, month: p.m, day: p.d, hour: p.H, minute: p.Mi, second: p.S, microsecond: p.us }); };
    const dtDict = {
      __init__: native('__init__', ([self, ...args], kw) => {
        const y = intArg(opt(args, kw, 0, 'year'), 'year'), m = intArg(opt(args, kw, 1, 'month'), 'month'), d = intArg(opt(args, kw, 2, 'day'), 'day');
        checkYMD(y, m, d);
        const H = num(opt(args, kw, 3, 'hour', V.int(0))), Mi = num(opt(args, kw, 4, 'minute', V.int(0))), S = num(opt(args, kw, 5, 'second', V.int(0))), us = num(opt(args, kw, 6, 'microsecond', V.int(0)));
        if (H < 0 || H > 23) throw new PyError('ValueError', 'hour must be in 0..23');
        if (Mi < 0 || Mi > 59) throw new PyError('ValueError', 'minute must be in 0..59');
        if (S < 0 || S > 59) throw new PyError('ValueError', 'second must be in 0..59');
        for (const [k, v] of [['year', y], ['month', m], ['day', d], ['hour', H], ['minute', Mi], ['second', S], ['microsecond', us]]) self.attrs.set(k, V.int(v));
        return V.none;
      }),
      __str__: native('__str__', ([a]) => V.str(isoDate(a) + ' ' + isoTime(a))),
      __repr__: native('__repr__', ([a]) => {
        const xs = [iv(a, 'year'), iv(a, 'month'), iv(a, 'day'), iv(a, 'hour'), iv(a, 'minute')];
        if (iv(a, 'second') || iv(a, 'microsecond')) xs.push(iv(a, 'second'));
        if (iv(a, 'microsecond')) xs.push(iv(a, 'microsecond'));
        return V.str('datetime.datetime(' + xs.join(', ') + ')');
      }),
      isoformat: native('isoformat', ([a, sep], kw) => V.str(isoDate(a) + (sep ? sep.v : kw.sep ? kw.sep.v : 'T') + isoTime(a))),
      date: native('date', ([a]) => mk(DATE, { year: iv(a, 'year'), month: iv(a, 'month'), day: iv(a, 'day') })),
      replace: native('replace', ([a], kw) => {
        const p = parts(a);
        const g = (k, cur) => (kw[k] ? num(kw[k]) : cur);
        return fromParts({ y: g('year', p.y), m: g('month', p.m), d: g('day', p.d), H: g('hour', p.H), Mi: g('minute', p.Mi), S: g('second', p.S), us: g('microsecond', p.us) });
      }),
      __add__: native('__add__', ([a, b]) => (isA(b, TD) ? dtFromUs(dtUs(a) + tdUs(b)) : NOTIMPL)),
      __radd__: native('__radd__', ([a, b]) => (isA(b, TD) ? dtFromUs(dtUs(a) + tdUs(b)) : NOTIMPL)),
      __sub__: native('__sub__', ([a, b]) => {
        if (isA(b, TD)) return dtFromUs(dtUs(a) - tdUs(b));
        if (b && b.t === 'instance' && b.cls === DT) return tdFrom(dtUs(a) - dtUs(b));
        return NOTIMPL;
      }),
      now: cm(native('now', () => { const [y, m, d, H, Mi, S, us] = today(); return fromParts({ y, m, d, H, Mi, S, us }); })),
      today: cm(native('today', () => { const [y, m, d, H, Mi, S, us] = today(); return fromParts({ y, m, d, H, Mi, S, us }); })),
      strptime: cm(native('strptime', ([c, t, f]) => {
        if (!t || t.t !== 'str' || !f || f.t !== 'str') throw new PyError('TypeError', 'strptime() argument 1 must be str');
        return fromParts(dtStrptime(t.v, f.v));
      })),
      fromisoformat: cm(native('fromisoformat', ([c, t]) => {
        const m = t && t.t === 'str' ? /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(t.v) : null;
        if (!m) throw new PyError('ValueError', 'Invalid isoformat string: ' + (t ? repr(t) : "''"));
        return fromParts({ y: +m[1], m: +m[2], d: +m[3], H: +(m[4] || 0), Mi: +(m[5] || 0), S: +(m[6] || 0), us: 0 });
      })),
      ...cmp(dtUs),
    };
    for (const k in dtDict) DT.dict.set(k, dtDict[k]);
    return mkModule('datetime', { date: DATE, datetime: DT, timedelta: TD, MINYEAR: V.int(1), MAXYEAR: V.int(9999) });
  }
  /* ---------- the virtual disk: folders, os, os.path, shutil and pathlib ----------
     Paths use "/" like Linux and macOS. Folders live in ctx.dirs; files in ctx.fs. */
  function normPath(p) {
    const parts = [];
    for (const seg of String(p).replace(/\\/g, '/').split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') { if (parts.length && parts[parts.length - 1] !== '..') parts.pop(); else parts.push('..'); continue; }
      parts.push(seg);
    }
    return parts.length ? parts.join('/') : '.';
  }
  const parentPath = p => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '.');
  const baseName = p => (p === '.' ? '' : p.slice(p.lastIndexOf('/') + 1));
  const isDirPath = (ctx, p) => p === '.' || (ctx.dirs && ctx.dirs.has(p));
  function childrenOf(ctx, d) {
    const out = new Set();
    const pre = d === '.' ? '' : d + '/';
    for (const k of [...ctx.fs.keys(), ...ctx.dirs]) if (k !== d && k.startsWith(pre)) { const rest = k.slice(pre.length); if (rest && !rest.includes('/')) out.add(rest); }
    return [...out].sort();
  }
  const joinUnder = (d, name) => (d === '.' ? name : d + '/' + name);
  function fsPathOf(v) {
    if (v && v.t === 'str') return v.v;
    if (v && v.t === 'instance' && v.attrs.has('_path')) return v.attrs.get('_path').v;
    throw new PyError('TypeError', `expected str, bytes or os.PathLike object, not ${typeName(v || V.none)}`);
  }
  const noFile = (shown, code = 2, what = 'No such file or directory') => new PyError(code === 2 ? 'FileNotFoundError' : code === 17 ? 'FileExistsError' : code === 20 ? 'NotADirectoryError' : code === 21 ? 'IsADirectoryError' : 'OSError', `[Errno ${code}] ${what}: ${strRepr(shown)}`);
  function fsMkdir(ctx, shown, parents, existOk) {
    const p = normPath(shown);
    if (isDirPath(ctx, p) || ctx.fs.has(p)) { if (existOk && isDirPath(ctx, p)) return; throw noFile(shown, 17, 'File exists'); }
    if (!isDirPath(ctx, parentPath(p))) {
      if (!parents) throw noFile(shown);
      fsMkdir(ctx, parentPath(p), true, true);
    }
    ctx.dirs.add(p);
  }
  function fsRemoveFile(ctx, shown) {
    const p = normPath(shown);
    if (!ctx.fs.has(p)) throw isDirPath(ctx, p) ? noFile(shown, 21, 'Is a directory') : noFile(shown);
    ctx.fs.delete(p);
    ctx.emit({ kind: 'file', name: p, text: null });
  }
  function fsMove(ctx, from, to) {
    const a = normPath(from), b = normPath(to);
    if (ctx.fs.has(a)) {
      if (!isDirPath(ctx, parentPath(b))) throw noFile(to);
      const text = ctx.fs.get(a);
      ctx.fs.delete(a); ctx.emit({ kind: 'file', name: a, text: null });
      ctx.fs.set(b, text); ctx.emit({ kind: 'file', name: b, text });
      return;
    }
    if (!isDirPath(ctx, a) || a === '.') throw noFile(from);
    for (const d of [...ctx.dirs]) if (d === a || d.startsWith(a + '/')) { ctx.dirs.delete(d); ctx.dirs.add(b + d.slice(a.length)); }
    for (const [k, v] of [...ctx.fs]) if (k.startsWith(a + '/')) { ctx.fs.delete(k); ctx.emit({ kind: 'file', name: k, text: null }); const nk = b + k.slice(a.length); ctx.fs.set(nk, v); ctx.emit({ kind: 'file', name: nk, text: v }); }
  }
  function osPathJoin(parts) {
    let out = '';
    for (const p of parts) {
      if (p.startsWith('/')) out = p;
      else if (!out || out.endsWith('/')) out += p;
      else out += '/' + p;
    }
    return out;
  }
  function splitExt(p) {
    const base = p.slice(p.lastIndexOf('/') + 1);
    const dot = base.lastIndexOf('.');
    if (dot <= 0 || /^\.+$/.test(base.slice(0, dot + 1))) return [p, ''];
    return [p.slice(0, p.length - base.length + dot), base.slice(dot)];
  }
  function makeOs(ctx) {
    const str = (args, i, name) => { if (!args[i]) throw new PyError('TypeError', `${name}() missing required argument`); return fsPathOf(args[i]); };
    const pathMod = mkModule('posixpath', {
      join: nat('join', args => { if (!args.length) throw new PyError('TypeError', 'join() missing 1 required positional argument'); return V.str(osPathJoin(args.map(fsPathOf))); }),
      exists: nat('exists', ([p]) => { const k = normPath(fsPathOf(p)); return V.bool(ctx.fs.has(k) || isDirPath(ctx, k)); }),
      isfile: nat('isfile', ([p]) => V.bool(ctx.fs.has(normPath(fsPathOf(p))))),
      isdir: nat('isdir', ([p]) => V.bool(isDirPath(ctx, normPath(fsPathOf(p))))),
      basename: nat('basename', ([p]) => { const t = fsPathOf(p); return V.str(t.slice(t.lastIndexOf('/') + 1)); }),
      dirname: nat('dirname', ([p]) => { const t = fsPathOf(p); const i = t.lastIndexOf('/'); return V.str(i < 0 ? '' : i === 0 ? '/' : t.slice(0, i).replace(/\/+$/, '') || '/'); }),
      split: nat('split', ([p]) => { const t = fsPathOf(p); const i = t.lastIndexOf('/'); return V.tuple([V.str(i < 0 ? '' : t.slice(0, i) || '/'), V.str(t.slice(i + 1))]); }),
      splitext: nat('splitext', ([p]) => V.tuple(splitExt(fsPathOf(p)).map(V.str))),
      getsize: nat('getsize', ([p]) => { const t = fsPathOf(p), k = normPath(t); if (!ctx.fs.has(k)) throw noFile(t); return V.int(new TextEncoder().encode(ctx.fs.get(k)).length); }),
      normpath: nat('normpath', ([p]) => V.str(normPath(fsPathOf(p)))),
      sep: V.str('/'),
    });
    return mkModule('os', {
      path: pathMod,
      sep: V.str('/'),
      getcwd: nat('getcwd', () => V.str('/home/mage/spells')),
      listdir: nat('listdir', args => {
        const t = args[0] ? fsPathOf(args[0]) : '.', p = normPath(t);
        if (ctx.fs.has(p)) throw noFile(t, 20, 'Not a directory');
        if (!isDirPath(ctx, p)) throw noFile(t);
        return V.list(childrenOf(ctx, p).map(V.str));
      }),
      mkdir: nat('mkdir', args => { fsMkdir(ctx, str(args, 0, 'mkdir'), false, false); return V.none; }),
      makedirs: nat('makedirs', (args, kw) => { const ok = (args[2] || kw.exist_ok) && truthy(args[2] || kw.exist_ok); fsMkdir(ctx, str(args, 0, 'makedirs'), true, ok); return V.none; }),
      remove: nat('remove', args => { fsRemoveFile(ctx, str(args, 0, 'remove')); return V.none; }),
      unlink: nat('unlink', args => { fsRemoveFile(ctx, str(args, 0, 'unlink')); return V.none; }),
      rmdir: nat('rmdir', args => {
        const t = str(args, 0, 'rmdir'), p = normPath(t);
        if (!isDirPath(ctx, p) || p === '.') throw noFile(t);
        if (childrenOf(ctx, p).length) throw noFile(t, 39, 'Directory not empty');
        ctx.dirs.delete(p);
        return V.none;
      }),
      rename: nat('rename', args => { fsMove(ctx, str(args, 0, 'rename'), str(args, 1, 'rename')); return V.none; }),
      walk: nat('walk', args => {
        const top = args[0] ? fsPathOf(args[0]) : '.';
        const out = [];
        const visit = shownDir => {
          const p = normPath(shownDir);
          if (!isDirPath(ctx, p)) return;
          const kids = childrenOf(ctx, p);
          const dirs = kids.filter(k => isDirPath(ctx, joinUnder(p, k))), files = kids.filter(k => ctx.fs.has(joinUnder(p, k)));
          out.push(V.tuple([V.str(shownDir), V.list(dirs.map(V.str)), V.list(files.map(V.str))]));
          for (const d of dirs) visit(osPathJoin([shownDir, d]));
        };
        visit(top);
        let i = 0;
        return mkIter('generator', () => (i < out.length ? out[i++] : DONE));
      }),
    });
  }
  function makeShutil(ctx) {
    const copyFile = (src, dst) => {
      const a = normPath(src);
      if (!ctx.fs.has(a)) throw noFile(src);
      let target = dst, b = normPath(dst);
      if (isDirPath(ctx, b)) { target = osPathJoin([dst, baseName(a)]); b = normPath(target); }
      if (!isDirPath(ctx, parentPath(b))) throw noFile(dst);
      const text = ctx.fs.get(a);
      ctx.fs.set(b, text);
      ctx.emit({ kind: 'file', name: b, text });
      return V.str(target);
    };
    return mkModule('shutil', {
      copy: nat('copy', ([a, b]) => copyFile(fsPathOf(a), fsPathOf(b))),
      copyfile: nat('copyfile', ([a, b]) => { if (isDirPath(ctx, normPath(fsPathOf(b)))) throw noFile(fsPathOf(b), 21, 'Is a directory'); return copyFile(fsPathOf(a), fsPathOf(b)); }),
      move: nat('move', ([a, b]) => {
        const src = fsPathOf(a), dst = fsPathOf(b);
        let target = dst;
        if (isDirPath(ctx, normPath(dst))) target = osPathJoin([dst, baseName(normPath(src))]);
        fsMove(ctx, src, target);
        return V.str(target);
      }),
      rmtree: nat('rmtree', ([a]) => {
        const t = fsPathOf(a), p = normPath(t);
        if (!isDirPath(ctx, p) || p === '.') throw noFile(t);
        for (const d of [...ctx.dirs]) if (d === p || d.startsWith(p + '/')) ctx.dirs.delete(d);
        for (const k of [...ctx.fs.keys()]) if (k.startsWith(p + '/')) { ctx.fs.delete(k); ctx.emit({ kind: 'file', name: k, text: null }); }
        return V.none;
      }),
      copytree: nat('copytree', ([a, b]) => {
        const src = normPath(fsPathOf(a)), dst = normPath(fsPathOf(b));
        if (!isDirPath(ctx, src)) throw noFile(fsPathOf(a));
        if (isDirPath(ctx, dst) || ctx.fs.has(dst)) throw noFile(fsPathOf(b), 17, 'File exists');
        fsMkdir(ctx, dst, true, false);
        for (const d of [...ctx.dirs]) if (d.startsWith(src + '/')) ctx.dirs.add(dst + d.slice(src.length));
        for (const [k, v] of [...ctx.fs]) if (k.startsWith(src + '/')) { const nk = dst + k.slice(src.length); ctx.fs.set(nk, v); ctx.emit({ kind: 'file', name: nk, text: v }); }
        return V.str(fsPathOf(b));
      }),
    });
  }
  function makePathlib(ctx) {
    const P = makeClass('PosixPath', [], {});
    const mkP = p => ({ t: 'instance', cls: P, attrs: new Map([['_path', V.str(p)]]) });
    const pv = o => o.attrs.get('_path').v;
    const prop = fn => ({ t: 'property', fget: nat('get', ([o]) => fn(o)), fset: null });
    const isP = x => x && x.t === 'instance' && x.cls === P;
    const joinP = (a, b) => (b.startsWith('/') ? normPath(b) : a === '.' ? normPath(b) : normPath(a + '/' + b));
    const globRe = pat => new RegExp('^' + pat.split('/').map(seg => (seg === '**' ? '\u0000' : seg.replace(/[.+^$(){}|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]'))).join('/').replace(/\u0000\//g, '(?:.*/)?').replace(/\u0000/g, '.*') + '$');
    const allUnder = d => { const pre = d === '.' ? '' : d + '/'; return [...ctx.fs.keys(), ...ctx.dirs].filter(k => k !== d && k.startsWith(pre)).map(k => k.slice(pre.length)); };
    const dict = {
      __init__: nat('__init__', ([self, ...parts]) => {
        let p = '.';
        for (const part of parts) p = joinP(p, fsPathOf(part));
        self.attrs.set('_path', V.str(p));
        return V.none;
      }),
      __str__: nat('__str__', ([o]) => V.str(pv(o))),
      __fspath__: nat('__fspath__', ([o]) => V.str(pv(o))),
      __repr__: nat('__repr__', ([o]) => V.str(`PosixPath(${strRepr(pv(o))})`)),
      __truediv__: nat('__truediv__', ([o, b]) => (b.t === 'str' || isP(b) ? mkP(joinP(pv(o), fsPathOf(b))) : NOTIMPL)),
      __rtruediv__: nat('__rtruediv__', ([o, b]) => (b.t === 'str' ? mkP(joinP(normPath(b.v), pv(o))) : NOTIMPL)),
      __eq__: nat('__eq__', ([o, b]) => (isP(b) ? V.bool(pv(o) === pv(b)) : NOTIMPL)),
      __lt__: nat('__lt__', ([o, b]) => (isP(b) ? V.bool(pv(o) < pv(b)) : NOTIMPL)),
      __hash__: nat('__hash__', ([o]) => V.int([...pv(o)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7))),
      name: prop(o => V.str(baseName(pv(o)))),
      suffix: prop(o => V.str(splitExt(baseName(pv(o)))[1])),
      stem: prop(o => V.str(splitExt(baseName(pv(o)))[0])),
      parent: prop(o => mkP(parentPath(pv(o)))),
      parts: prop(o => V.tuple(pv(o) === '.' ? [] : pv(o).split('/').map(V.str))),
      exists: nat('exists', ([o]) => V.bool(ctx.fs.has(pv(o)) || isDirPath(ctx, pv(o)))),
      is_file: nat('is_file', ([o]) => V.bool(ctx.fs.has(pv(o)))),
      is_dir: nat('is_dir', ([o]) => V.bool(isDirPath(ctx, pv(o)))),
      read_text: nat('read_text', ([o]) => { if (!ctx.fs.has(pv(o))) throw isDirPath(ctx, pv(o)) ? noFile(pv(o), 21, 'Is a directory') : noFile(pv(o)); return V.str(ctx.fs.get(pv(o))); }),
      write_text: nat('write_text', ([o, data]) => {
        if (!data || data.t !== 'str') throw new PyError('TypeError', `data must be str, not ${typeName(data || V.none)}`);
        if (!isDirPath(ctx, parentPath(pv(o)))) throw noFile(pv(o));
        ctx.fs.set(pv(o), data.v);
        ctx.emit({ kind: 'file', name: pv(o), text: data.v });
        return V.int(data.v.length);
      }),
      touch: nat('touch', ([o]) => { if (!ctx.fs.has(pv(o))) { if (!isDirPath(ctx, parentPath(pv(o)))) throw noFile(pv(o)); ctx.fs.set(pv(o), ''); ctx.emit({ kind: 'file', name: pv(o), text: '' }); } return V.none; }),
      mkdir: nat('mkdir', ([o, ...args], kw) => { const flag = (i, n) => { const v = args[i] || kw[n]; return !!v && truthy(v); }; fsMkdir(ctx, pv(o), flag(1, 'parents'), flag(2, 'exist_ok')); return V.none; }),
      unlink: nat('unlink', ([o], kw) => { if (!ctx.fs.has(pv(o)) && kw.missing_ok && truthy(kw.missing_ok)) return V.none; fsRemoveFile(ctx, pv(o)); return V.none; }),
      rmdir: nat('rmdir', ([o]) => { if (!isDirPath(ctx, pv(o))) throw noFile(pv(o)); if (childrenOf(ctx, pv(o)).length) throw noFile(pv(o), 39, 'Directory not empty'); ctx.dirs.delete(pv(o)); return V.none; }),
      rename: nat('rename', ([o, t]) => { const to = normPath(fsPathOf(t)); fsMove(ctx, pv(o), to); return mkP(to); }),
      iterdir: nat('iterdir', ([o]) => {
        if (!isDirPath(ctx, pv(o))) throw noFile(pv(o));
        const kids = childrenOf(ctx, pv(o)).map(k => mkP(joinUnder(pv(o), k)));
        let i = 0;
        return mkIter('generator', () => (i < kids.length ? kids[i++] : DONE));
      }),
      glob: nat('glob', ([o, pat]) => {
        const re = globRe(fsPathOf(pat));
        const hits = allUnder(pv(o)).filter(r => re.test(r)).sort().map(r => mkP(joinUnder(pv(o), r)));
        let i = 0;
        return mkIter('generator', () => (i < hits.length ? hits[i++] : DONE));
      }),
      rglob: nat('rglob', ([o, pat]) => {
        const re = globRe('**/' + fsPathOf(pat));
        const hits = allUnder(pv(o)).filter(r => re.test(r)).sort().map(r => mkP(joinUnder(pv(o), r)));
        let i = 0;
        return mkIter('generator', () => (i < hits.length ? hits[i++] : DONE));
      }),
      with_suffix: nat('with_suffix', ([o, suf]) => { const [stem] = splitExt(pv(o)); return mkP(stem + fsPathOf(suf)); }),
      with_name: nat('with_name', ([o, n]) => mkP(joinUnder(parentPath(pv(o)), fsPathOf(n)))),
      with_stem: nat('with_stem', ([o, n]) => mkP(joinUnder(parentPath(pv(o)), fsPathOf(n) + splitExt(baseName(pv(o)))[1]))),
      joinpath: nat('joinpath', ([o, ...ps]) => { let p = pv(o); for (const x of ps) p = joinP(p, fsPathOf(x)); return mkP(p); }),
      open: nat('open', ([o, ...args], kw) => openFile([V.str(pv(o)), ...args], kw, ctx)),
      cwd: { t: 'classmethod', fn: nat('cwd', () => mkP('.')) },
    };
    for (const k in dict) P.dict.set(k, dict[k]);
    return mkModule('pathlib', { Path: P, PosixPath: P, PurePath: P });
  }
  /* ---------- logging ---------- */
  function makeLogging(ctx) {
    const LEVELS = { DEBUG: 10, INFO: 20, WARNING: 30, ERROR: 40, CRITICAL: 50 };
    const NAMES = { 10: 'DEBUG', 20: 'INFO', 30: 'WARNING', 40: 'ERROR', 50: 'CRITICAL' };
    const state = { configured: false, level: 30, format: '%(levelname)s:%(name)s:%(message)s', file: null, disabled: 0 };
    const loggers = new Map();
    const render = (format, rec) => format.replace(/%\((\w+)\)([-#0 +]?\d*(?:\.\d+)?[sdif])/g, (all, key, spec) => {
      const v = rec[key];
      if (v === undefined) throw new PyError('KeyError', strRepr(key));
      return pyPercent('%' + spec, [typeof v === 'number' ? V.int(v) : V.str(String(v))]);
    });
    const emitRecord = (logger, levelno, msgV, args, auto) => {
      if (levelno <= state.disabled) return;
      if (!state.configured && auto) state.configured = true;
      const lastResort = !state.configured;
      const eff = logger.level || (lastResort ? 30 : state.level);
      if (levelno < eff) return;
      let message = fmt(msgV);
      if (args.length) message = pyPercent(message, args.length === 1 && args[0].t === 'tuple' ? args[0].v : args);
      const line = lastResort ? message : render(state.format, { levelname: NAMES[levelno] || 'Level ' + levelno, levelno, name: logger.name, message, asctime: '2026-01-01 12:00:00,000', module: 'spell', funcName: '<module>' });
      if (state.file) {
        const prev = ctx.fs.get(state.file) || '';
        ctx.fs.set(state.file, prev + line + '\n');
        ctx.emit({ kind: 'file', name: state.file, text: prev + line + '\n' });
      } else ctx.emit({ kind: 'print', text: line, raw: line + '\n', log: true });
    };
    const methods = (logger, auto) => {
      const out = {};
      for (const [k, lv] of [['debug', 10], ['info', 20], ['warning', 30], ['warn', 30], ['error', 40], ['critical', 50], ['exception', 40]]) out[k] = nat(k, ([msg, ...args]) => { if (!msg) throw new PyError('TypeError', k + '() missing 1 required positional argument: \'msg\''); emitRecord(logger, lv, msg, args, auto); return V.none; });
      out.log = nat('log', ([lv, msg, ...args]) => { emitRecord(logger, num(lv), msg, args); return V.none; });
      out.setLevel = nat('setLevel', ([lv]) => { logger.level = lv.t === 'str' ? LEVELS[lv.v] : num(lv); return V.none; });
      return out;
    };
    const root = { name: 'root', level: 0 };
    const getLogger = nat('getLogger', ([n]) => {
      const name = !n || n.t === 'NoneType' ? 'root' : fmt(n);
      if (name === 'root') return mkObj('Logger', { name: V.str('root'), ...methods(root) });
      if (!loggers.has(name)) { const lg = { name, level: 0 }; loggers.set(name, mkObj('Logger', { name: V.str(name), ...methods(lg) })); }
      return loggers.get(name);
    });
    return mkModule('logging', {
      ...Object.fromEntries(Object.entries(LEVELS).map(([k, v]) => [k, V.int(v)])),
      WARN: V.int(30), NOTSET: V.int(0),
      basicConfig: nat('basicConfig', (args, kw) => {
        if (state.configured && !(kw.force && truthy(kw.force))) return V.none;
        state.configured = true;
        if (kw.level) state.level = kw.level.t === 'str' ? LEVELS[kw.level.v] : num(kw.level);
        if (kw.format) state.format = fmt(kw.format);
        if (kw.filename) {
          state.file = normPath(fsPathOf(kw.filename));
          const mode = kw.filemode ? fmt(kw.filemode) : 'a';
          if (mode === 'w' || !ctx.fs.has(state.file)) { ctx.fs.set(state.file, ''); ctx.emit({ kind: 'file', name: state.file, text: '' }); }
        }
        return V.none;
      }),
      disable: nat('disable', ([lv]) => { state.disabled = lv ? num(lv) : 50; return V.none; }),
      getLogger,
      getLevelName: nat('getLevelName', ([lv]) => (lv.t === 'str' ? (LEVELS[lv.v] ? V.int(LEVELS[lv.v]) : V.str('Level ' + lv.v)) : V.str(NAMES[num(lv)] || 'Level ' + num(lv)))),
      ...methods(root, true),
    });
  }
  /* ---------- markup: an XML parser (also used for HTML) and xml.etree.ElementTree ---------- */
  const ENT = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ', copy: '©' };
  const unEntity = s => s.replace(/&(#x[0-9a-fA-F]+|#\d+|\w+);/g, (all, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e] != null ? ENT[e] : all));
  const HTML_VOID = ['br', 'img', 'input', 'meta', 'link', 'hr', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  // nodes: { tag, attrs: [[k, v]], kids: [], text: string|null, tail: string|null, parent }
  function parseMarkup(src, html) {
    const root = { tag: '#document', attrs: [], kids: [], text: null, tail: null, parent: null };
    let cur = root, i = 0, line = 1;
    const addText = t => {
      if (!t) return;
      if (cur.kids.length) { const last = cur.kids[cur.kids.length - 1]; last.tail = (last.tail || '') + t; }
      else cur.text = (cur.text || '') + t;
    };
    const fail = msg => new PyError('ParseError', `${msg}: line ${line}, column ${i}`);
    while (i < src.length) {
      const lt = src.indexOf('<', i);
      const chunk = lt < 0 ? src.slice(i) : src.slice(i, lt);
      if (chunk) { if (cur !== root || chunk.trim() || html) addText(unEntity(chunk)); else if (!html && chunk.trim()) throw fail('syntax error'); }
      line += (chunk.match(/\n/g) || []).length;
      if (lt < 0) break;
      i = lt;
      if (src.startsWith('<!--', i)) { const e = src.indexOf('-->', i); i = e < 0 ? src.length : e + 3; continue; }
      if (src.startsWith('<![CDATA[', i)) { const e = src.indexOf(']]>', i); addText(src.slice(i + 9, e < 0 ? src.length : e)); i = e < 0 ? src.length : e + 3; continue; }
      if (src.startsWith('<?', i) || src.startsWith('<!', i)) { const e = src.indexOf('>', i); i = e < 0 ? src.length : e + 1; continue; }
      const close = /^<\/\s*([\w:.-]+)\s*>/.exec(src.slice(i));
      if (close) {
        const name = html ? close[1].toLowerCase() : close[1];
        if (html) {
          let n = cur;
          while (n && n !== root && n.tag !== name) n = n.parent;
          if (n && n !== root) cur = n.parent;
        } else {
          if (cur === root || cur.tag !== name) throw fail('mismatched tag');
          cur = cur.parent;
        }
        i += close[0].length;
        continue;
      }
      const open = /^<([\w:.-]+)((?:\s+[\w:.-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>\/=`]+))?)*)\s*(\/?)>/.exec(src.slice(i));
      if (!open) { if (html) { addText('<'); i++; continue; } throw fail('not well-formed (invalid token)'); }
      const name = html ? open[1].toLowerCase() : open[1];
      const attrs = [];
      const are = /([\w:.-]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>\/=`]+))?/g;
      let am;
      while ((am = are.exec(open[2]))) attrs.push([html ? am[1].toLowerCase() : am[1], am[2] == null ? '' : unEntity(am[2].replace(/^["']|["']$/g, ''))]);
      const node = { tag: name, attrs, kids: [], text: null, tail: null, parent: cur };
      if (!html && cur === root && root.kids.length) throw fail('junk after document element');
      cur.kids.push(node);
      i += open[0].length;
      const selfClose = open[3] === '/' || (html && HTML_VOID.includes(name));
      if (!selfClose) {
        if (html && (name === 'script' || name === 'style')) {
          const e = src.toLowerCase().indexOf('</' + name, i);
          node.text = src.slice(i, e < 0 ? src.length : e);
          i = e < 0 ? src.length : src.indexOf('>', e) + 1;
          continue;
        }
        cur = node;
      }
    }
    if (!html && cur !== root) throw fail('no element found');
    if (!html && !root.kids.length) throw fail('no element found');
    return root;
  }
  const allBelow = n => { const out = []; const walk = x => { for (const k of x.kids) { out.push(k); walk(k); } }; walk(n); return out; };
  // ElementPath: tag, *, ., .//tag, a/b, [@attr], [@attr='v'], [tag], [n]
  function etSelect(start, path) {
    let p = path.trim();
    if (p.startsWith('/')) throw new PyError('SyntaxError', 'cannot use absolute path on element');
    if (p.startsWith('./')) p = p.slice(2);
    let cur = [start], desc = false;
    for (const step of p.split('/')) {
      if (step === '') { desc = true; continue; }
      if (step === '.') { continue; }
      const m = /^([^[]+)((?:\[[^\]]*\])*)$/.exec(step);
      if (!m) throw new PyError('SyntaxError', 'invalid path');
      const name = m[1], preds = m[2].match(/\[[^\]]*\]/g) || [];
      let groups = [];
      for (const el of cur) {
        const pool = desc ? allBelow(el) : el.kids;
        groups.push(pool.filter(k => name === '*' || k.tag === name));
      }
      for (const pr of preds) {
        const body = pr.slice(1, -1).trim();
        let test;
        const at = /^@([\w:.-]+)(?:\s*=\s*(["'])(.*)\2)?$/.exec(body);
        if (at) test = k => k.attrs.some(([a, v]) => a === at[1] && (at[3] == null || v === at[3]));
        else if (/^\d+$/.test(body)) { const n = +body; groups = groups.map(g => (g[n - 1] ? [g[n - 1]] : [])); continue; }
        else if (/^[\w:.-]+$/.test(body)) test = k => k.kids.some(c => c.tag === body);
        else throw new PyError('SyntaxError', 'invalid predicate');
        groups = groups.map(g => g.filter(test));
      }
      const seen = new Set();
      cur = groups.flat().filter(x => (seen.has(x) ? false : (seen.add(x), true)));
      desc = false;
    }
    return cur;
  }
  function serializeNode(n) {
    const esc = (t, attr) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, attr ? '&quot;' : '"');
    const a = n.attrs.map(([k, v]) => ` ${k}="${esc(v, true)}"`).join('');
    const inner = (n.text ? esc(n.text) : '') + n.kids.map(serializeNode).join('');
    return (inner || n.text === '' ? `<${n.tag}${a}>${inner}</${n.tag}>` : `<${n.tag}${a} />`) + (n.tail ? esc(n.tail) : '');
  }
  function makeEtree(ctx) {
    const EL = makeClass('Element', [], {});
    const wrap = node => {
      if (node.obj) return node.obj;
      const o = { t: 'instance', cls: EL, attrs: new Map(), node };
      node.obj = o;
      return o;
    };
    const nodeOf = o => { if (!o || o.t !== 'instance' || !o.node) throw new PyError('TypeError', 'expected an Element'); return o.node; };
    const prop = (get, set) => ({ t: 'property', fget: nat('get', ([o]) => get(nodeOf(o))), fset: set ? nat('set', ([o, v]) => { set(nodeOf(o), v); return V.none; }) : null });
    const strOrNone = s => (s == null ? V.none : V.str(s));
    const attribDict = n => { const d = dict(); for (const [k, v] of n.attrs) d.v.set(keyOf(V.str(k)), [V.str(k), V.str(v)]); return d; };
    const dictEntries = d => (d && d.t === 'dict' ? [...d.v.values()].map(([k, v]) => [fmt(k), fmt(v)]) : []);
    const dict2 = {
      tag: prop(n => V.str(n.tag), (n, v) => { n.tag = fmt(v); }),
      text: prop(n => strOrNone(n.text), (n, v) => { n.text = v.t === 'NoneType' ? null : fmt(v); }),
      tail: prop(n => strOrNone(n.tail), (n, v) => { n.tail = v.t === 'NoneType' ? null : fmt(v); }),
      attrib: prop(n => attribDict(n)),
      get: nat('get', ([o, k, d]) => { const hit = nodeOf(o).attrs.find(([a]) => a === fmt(k)); return hit ? V.str(hit[1]) : d || V.none; }),
      set: nat('set', ([o, k, v]) => { const n = nodeOf(o), key = fmt(k); const hit = n.attrs.find(([a]) => a === key); if (hit) hit[1] = fmt(v); else n.attrs.push([key, fmt(v)]); return V.none; }),
      keys: nat('keys', ([o]) => V.list(nodeOf(o).attrs.map(([k]) => V.str(k)))),
      items: nat('items', ([o]) => V.list(nodeOf(o).attrs.map(([k, v]) => V.tuple([V.str(k), V.str(v)])))),
      find: nat('find', ([o, p]) => { const r = etSelect(nodeOf(o), fmt(p)); return r.length ? wrap(r[0]) : V.none; }),
      findall: nat('findall', ([o, p]) => V.list(etSelect(nodeOf(o), fmt(p)).map(wrap))),
      findtext: nat('findtext', ([o, p, d], kw) => { const r = etSelect(nodeOf(o), fmt(p)); const def = d || kw.default || V.none; return r.length ? V.str(r[0].text || '') : def; }),
      iter: nat('iter', ([o, t]) => { const n = nodeOf(o), want = t && t.t !== 'NoneType' ? fmt(t) : null; const all = [n, ...allBelow(n)].filter(x => !want || want === '*' || x.tag === want).map(wrap); let i = 0; return mkIter('generator', () => (i < all.length ? all[i++] : DONE)); }),
      itertext: nat('itertext', ([o]) => { const out = []; const walk = n => { if (n.text) out.push(n.text); for (const k of n.kids) { walk(k); if (k.tail) out.push(k.tail); } }; walk(nodeOf(o)); let i = 0; return mkIter('generator', () => (i < out.length ? V.str(out[i++]) : DONE)); }),
      append: nat('append', ([o, c]) => { const n = nodeOf(o), k = nodeOf(c); k.parent = n; n.kids.push(k); return V.none; }),
      __iter__: nat('__iter__', ([o]) => { const kids = nodeOf(o).kids.slice(); let i = 0; return mkIter('iterator', () => (i < kids.length ? wrap(kids[i++]) : DONE)); }),
      __len__: nat('__len__', ([o]) => V.int(nodeOf(o).kids.length)),
      __getitem__: nat('__getitem__', ([o, i]) => { const kids = nodeOf(o).kids; let k = needInt(i); if (k < 0) k += kids.length; if (k < 0 || k >= kids.length) throw new PyError('IndexError', 'child index out of range'); return wrap(kids[k]); }),
      __repr__: nat('__repr__', ([o]) => V.str(`<Element ${strRepr(nodeOf(o).tag)}>`)),
    };
    for (const k in dict2) EL.dict.set(k, dict2[k]);
    const newEl = (tag, attrib, parent) => { const node = { tag: fmt(tag), attrs: dictEntries(attrib), kids: [], text: null, tail: null, parent: parent || null }; if (parent) parent.kids.push(node); return wrap(node); };
    const TREE = makeClass('ElementTree', [], {});
    TREE.dict.set('getroot', nat('getroot', ([t]) => t.attrs.get('_root')));
    TREE.dict.set('find', nat('find', ([t, p]) => callValue(getAttr(t.attrs.get('_root'), 'find', ctx), [p], {}, ctx)));
    TREE.dict.set('findall', nat('findall', ([t, p]) => callValue(getAttr(t.attrs.get('_root'), 'findall', ctx), [p], {}, ctx)));
    TREE.dict.set('write', nat('write', ([t, path], kw) => { const name = normPath(fsPathOf(path)); const text = serializeNode(t.attrs.get('_root').node); ctx.fs.set(name, text); ctx.emit({ kind: 'file', name, text }); return V.none; }));
    const treeOf = rootEl => ({ t: 'instance', cls: TREE, attrs: new Map([['_root', rootEl]]) });
    const fromText = text => { const doc = parseMarkup(text, false); return wrap(doc.kids[0]); };
    return mkModule('xml.etree.ElementTree', {
      Element: nat('Element', ([tag, attrib], kw) => newEl(tag, attrib)),
      SubElement: nat('SubElement', ([parent, tag, attrib]) => newEl(tag, attrib, nodeOf(parent))),
      fromstring: nat('fromstring', ([t]) => { if (!t || t.t !== 'str') throw new PyError('TypeError', 'fromstring() needs a string'); return fromText(t.v); }),
      XML: nat('XML', ([t]) => fromText(fmt(t))),
      parse: nat('parse', ([p]) => { const name = normPath(fsPathOf(p)); if (!ctx.fs.has(name)) throw noFile(fsPathOf(p)); return treeOf(fromText(ctx.fs.get(name))); }),
      tostring: nat('tostring', ([e], kw) => V.str(serializeNode(nodeOf(e)).replace(/(\S)$/, '$1'))),
      ElementTree: nat('ElementTree', ([e], kw) => treeOf(e || kw.element)),
    });
  }
  /* ---------- sqlite3: a small SQL engine ----------
     Supports CREATE/DROP TABLE, INSERT [OR IGNORE|REPLACE], SELECT with joins, WHERE,
     GROUP BY/HAVING, aggregates, ORDER BY, LIMIT/OFFSET, UPDATE, DELETE, ? and :name
     parameters, SQLite type affinity, PRIMARY KEY/UNIQUE/NOT NULL constraints. */
  const SQL_KW = new Set(['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'INSERT', 'INTO', 'VALUES', 'CREATE', 'TABLE', 'DROP', 'IF', 'EXISTS', 'UPDATE', 'SET', 'DELETE', 'ORDER', 'BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'GROUP', 'HAVING', 'JOIN', 'INNER', 'LEFT', 'OUTER', 'CROSS', 'ON', 'AS', 'NULL', 'IS', 'LIKE', 'IN', 'BETWEEN', 'DISTINCT', 'PRIMARY', 'KEY', 'UNIQUE', 'AUTOINCREMENT', 'DEFAULT', 'IGNORE', 'REPLACE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'INDEX', 'BEGIN', 'COMMIT', 'TRANSACTION', 'ROLLBACK', 'ALL', 'REFERENCES', 'FOREIGN', 'CONSTRAINT', 'CHECK', 'TRUE', 'FALSE', 'GLOB', 'COLLATE', 'NOCASE']);
  function sqlTokens(sql) {
    const toks = [];
    let i = 0;
    while (i < sql.length) {
      const c = sql[i];
      if (/\s/.test(c)) { i++; continue; }
      if (sql.startsWith('--', i)) { const e = sql.indexOf('\n', i); i = e < 0 ? sql.length : e; continue; }
      if (sql.startsWith('/*', i)) { const e = sql.indexOf('*/', i); i = e < 0 ? sql.length : e + 2; continue; }
      const start = i;
      if (c === "'") { let v = ''; i++; for (;;) { if (i >= sql.length) throw sqlSyntax('unrecognized token: "' + sql.slice(start) + '"'); if (sql[i] === "'") { if (sql[i + 1] === "'") { v += "'"; i += 2; continue; } i++; break; } v += sql[i++]; } toks.push({ k: 'str', v, s: start, e: i }); continue; }
      if (c === '"' || c === '`' || c === '[') { const close = c === '[' ? ']' : c; const e = sql.indexOf(close, i + 1); if (e < 0) throw sqlSyntax('unrecognized token: "' + sql.slice(start) + '"'); toks.push({ k: 'id', v: sql.slice(i + 1, e), s: start, e: e + 1, quoted: true }); i = e + 1; continue; }
      const num = /^(\d+\.\d*|\.\d+|\d+)([eE][-+]?\d+)?/.exec(sql.slice(i));
      if (num) { toks.push({ k: 'num', v: num[0], s: start, e: i + num[0].length }); i += num[0].length; continue; }
      const id = /^[A-Za-z_][\w$]*/.exec(sql.slice(i));
      if (id) { const up = id[0].toUpperCase(); toks.push(SQL_KW.has(up) ? { k: 'kw', v: up, s: start, e: i + id[0].length } : { k: 'id', v: id[0], s: start, e: i + id[0].length }); i += id[0].length; continue; }
      if (c === '?') { toks.push({ k: 'param', s: start, e: i + 1 }); i++; continue; }
      if (c === ':' && /[A-Za-z_]/.test(sql[i + 1] || '')) { const m = /^:([A-Za-z_]\w*)/.exec(sql.slice(i)); toks.push({ k: 'named', v: m[1], s: start, e: i + m[0].length }); i += m[0].length; continue; }
      const op = ['<=', '>=', '!=', '<>', '==', '||'].find(o => sql.startsWith(o, i)) || (/[=<>+\-*/%(),.;]/.test(c) ? c : null);
      if (!op) throw sqlSyntax('unrecognized token: "' + c + '"');
      toks.push({ k: 'op', v: op, s: start, e: i + op.length });
      i += op.length;
    }
    return toks;
  }
  let SQL_ERR = null; // the module's exception classes, set by makeSqlite
  const sqlSyntax = msg => sqlErr('OperationalError', msg);
  function sqlErr(kind, msg) {
    if (!SQL_ERR) return new PyError(kind, msg);
    const inst = makeInstance(SQL_ERR[kind], [V.str(msg)], {}, CUR);
    const e = new PyError(kind, msg);
    e.obj = inst;
    return e;
  }
  /* parsing */
  function sqlParse(sql, toks) {
    let p = 0;
    const peek = (o = 0) => toks[p + o];
    const isKw = (v, o = 0) => peek(o) && peek(o).k === 'kw' && peek(o).v === v;
    const isOp = (v, o = 0) => peek(o) && peek(o).k === 'op' && peek(o).v === v;
    const near = () => (peek() ? 'near "' + sql.slice(peek().s, peek().e) + '": syntax error' : 'incomplete input');
    const want = (k, v) => { const t = peek(); if (!t || t.k !== k || (v && t.v !== v)) throw sqlSyntax(near()); p++; return t; };
    const kw = v => want('kw', v);
    const op = v => want('op', v);
    const ident = () => { const t = peek(); if (t && (t.k === 'id' || (t.k === 'kw' && !['FROM', 'WHERE', 'ON', 'JOIN', 'ORDER', 'GROUP', 'LIMIT', 'SET', 'VALUES', 'SELECT', 'AND', 'OR'].includes(t.v)))) { p++; return t.v; } throw sqlSyntax(near()); };
    let params = 0;
    function primary() {
      const t = peek();
      if (!t) throw sqlSyntax('incomplete input');
      if (t.k === 'num') { p++; return { n: 'lit', v: /[.eE]/.test(t.v) ? V.float(parseFloat(t.v)) : V.int(parseInt(t.v, 10)) }; }
      if (t.k === 'str') { p++; return { n: 'lit', v: V.str(t.v) }; }
      if (t.k === 'param') { p++; return { n: 'param', i: params++ }; }
      if (t.k === 'named') { p++; return { n: 'named', name: t.v }; }
      if (isKw('NULL')) { p++; return { n: 'lit', v: V.none }; }
      if (isKw('TRUE') || isKw('FALSE')) { p++; return { n: 'lit', v: V.int(t.v === 'TRUE' ? 1 : 0) }; }
      if (isOp('(') && isKw('SELECT', 1)) { p++; const q = select(); op(')'); return { n: 'subq', q }; }
      if (isKw('EXISTS') && isOp('(', 1)) { p += 2; const q = select(); op(')'); return { n: 'exists', q }; }
      if (isOp('(')) { p++; const e = expr(); op(')'); return e; }
      if (isKw('CASE')) {
        p++;
        const subject = isKw('WHEN') ? null : expr();
        const whens = [];
        while (isKw('WHEN')) { p++; const c = expr(); kw('THEN'); whens.push([c, expr()]); }
        let other = null;
        if (isKw('ELSE')) { p++; other = expr(); }
        kw('END');
        return { n: 'case', subject, whens, other };
      }
      if (t.k === 'id' || (t.k === 'kw' && ['REPLACE', 'LIKE', 'KEY'].includes(t.v) && isOp('(', 1))) {
        p++;
        if (isOp('(')) {
          p++;
          const fn = t.v.toUpperCase();
          let star = false, distinct = false;
          const args = [];
          if (isOp('*')) { p++; star = true; }
          else if (!isOp(')')) { if (isKw('DISTINCT')) { p++; distinct = true; } args.push(expr()); while (isOp(',')) { p++; args.push(expr()); } }
          op(')');
          return { n: 'fn', fn, args, star, distinct };
        }
        if (isOp('.')) {
          p++;
          if (isOp('*')) { p++; return { n: 'star', table: t.v }; }
          return { n: 'col', table: t.v, name: ident() };
        }
        return { n: 'col', table: null, name: t.v };
      }
      throw sqlSyntax(near());
    }
    function unary() {
      if (isOp('-')) { p++; return { n: 'neg', e: unary() }; }
      if (isOp('+')) { p++; return unary(); }
      return primary();
    }
    function mul() { let l = unary(); while (isOp('*') || isOp('/') || isOp('%')) { const o = toks[p++].v; l = { n: 'bin', op: o, l, r: unary() }; } return l; }
    function add() { let l = mul(); while (isOp('+') || isOp('-')) { const o = toks[p++].v; l = { n: 'bin', op: o, l, r: mul() }; } return l; }
    function concat() { let l = add(); while (isOp('||')) { p++; l = { n: 'bin', op: '||', l, r: add() }; } return l; }
    function cmp() {
      let l = concat();
      for (;;) {
        if (['<', '>', '<=', '>=', '=', '==', '!=', '<>'].some(o => isOp(o))) { const o = toks[p++].v; l = { n: 'cmp', op: o === '==' ? '=' : o === '<>' ? '!=' : o, l, r: concat() }; continue; }
        if (isKw('IS')) { p++; let neg = false; if (isKw('NOT')) { p++; neg = true; } l = { n: 'is', l, r: concat(), neg }; continue; }
        let neg = false;
        if (isKw('NOT') && (isKw('LIKE', 1) || isKw('IN', 1) || isKw('BETWEEN', 1) || isKw('GLOB', 1))) { p++; neg = true; }
        if (isKw('LIKE') || isKw('GLOB')) { const g = toks[p++].v === 'GLOB'; l = { n: 'like', l, r: concat(), neg, glob: g }; continue; }
        if (isKw('IN')) {
          p++; op('(');
          if (isKw('SELECT')) { const q = select(); op(')'); l = { n: 'insel', l, q, neg }; continue; }
          const items = [];
          if (!isOp(')')) { items.push(expr()); while (isOp(',')) { p++; items.push(expr()); } }
          op(')');
          l = { n: 'in', l, items, neg };
          continue;
        }
        if (isKw('BETWEEN')) { p++; const lo = concat(); kw('AND'); const hi = concat(); l = { n: 'between', l, lo, hi, neg }; continue; }
        if (neg) throw sqlSyntax(near());
        return l;
      }
    }
    function not() { if (isKw('NOT')) { p++; return { n: 'not', e: not() }; } return cmp(); }
    function and() { let l = not(); while (isKw('AND')) { p++; l = { n: 'and', l, r: not() }; } return l; }
    function expr() { let l = and(); while (isKw('OR')) { p++; l = { n: 'or', l, r: and() }; } return l; }
    function tableRef() {
      const name = ident();
      let alias = null;
      if (isKw('AS')) { p++; alias = ident(); } else if (peek() && peek().k === 'id') alias = ident();
      return { name, alias: alias || name };
    }
    function select() {
      kw('SELECT');
      let distinct = false;
      if (isKw('DISTINCT')) { p++; distinct = true; } else if (isKw('ALL')) p++;
      const cols = [];
      for (;;) {
        const startTok = peek();
        if (isOp('*')) { p++; cols.push({ e: { n: 'star', table: null } }); }
        else {
          const e = expr();
          const endTok = toks[p - 1];
          let alias = null;
          if (isKw('AS')) { p++; alias = ident(); } else if (peek() && peek().k === 'id') alias = ident();
          cols.push({ e, alias, text: sql.slice(startTok.s, endTok.e) });
        }
        if (!isOp(',')) break;
        p++;
      }
      const from = [];
      if (isKw('FROM')) {
        p++;
        from.push({ ...tableRef(), join: 'first' });
        for (;;) {
          if (isOp(',')) { p++; from.push({ ...tableRef(), join: 'cross' }); continue; }
          let kind = null;
          if (isKw('JOIN')) kind = 'inner';
          else if (isKw('INNER') && isKw('JOIN', 1)) { p++; kind = 'inner'; }
          else if (isKw('CROSS') && isKw('JOIN', 1)) { p++; kind = 'cross'; }
          else if (isKw('LEFT')) { p++; if (isKw('OUTER')) p++; kind = 'left'; }
          if (!kind) break;
          kw('JOIN');
          const ref = tableRef();
          let on = null;
          if (isKw('ON')) { p++; on = expr(); }
          from.push({ ...ref, join: kind, on });
        }
      }
      let where = null, group = null, having = null, order = null, limit = null, offset = null;
      if (isKw('WHERE')) { p++; where = expr(); }
      if (isKw('GROUP')) { p++; kw('BY'); group = [expr()]; while (isOp(',')) { p++; group.push(expr()); } if (isKw('HAVING')) { p++; having = expr(); } }
      if (isKw('ORDER')) {
        p++; kw('BY'); order = [];
        for (;;) { const e = expr(); let desc = false; if (isKw('ASC')) p++; else if (isKw('DESC')) { p++; desc = true; } order.push({ e, desc }); if (!isOp(',')) break; p++; }
      }
      if (isKw('LIMIT')) { p++; limit = expr(); if (isKw('OFFSET')) { p++; offset = expr(); } else if (isOp(',')) { p++; offset = limit; limit = expr(); } }
      return { n: 'select', distinct, cols, from, where, group, having, order, limit, offset };
    }
    function statement() {
      const t = peek();
      if (!t) return null;
      if (isKw('SELECT')) return select();
      if (isKw('CREATE')) {
        p++;
        if (isKw('UNIQUE')) p++;
        if (isKw('INDEX')) { while (p < toks.length && !isOp(';')) p++; return { n: 'noop' }; }
        kw('TABLE');
        let ifNot = false;
        if (isKw('IF')) { p++; kw('NOT'); kw('EXISTS'); ifNot = true; }
        const name = ident();
        op('(');
        const cols = [], uniques = [];
        let pk = null;
        for (;;) {
          if (isKw('PRIMARY') || isKw('UNIQUE') || isKw('FOREIGN') || isKw('CONSTRAINT') || isKw('CHECK')) {
            if (isKw('CONSTRAINT')) { p++; ident(); }
            const which = toks[p++].v;
            if (which === 'PRIMARY') kw('KEY');
            if (which === 'FOREIGN') kw('KEY');
            if (which === 'CHECK') { op('('); let d = 1; while (d && p < toks.length) { if (isOp('(')) d++; else if (isOp(')')) d--; p++; } }
            else {
              op('(');
              const names = [ident()];
              while (isOp(',')) { p++; names.push(ident()); }
              op(')');
              if (which === 'PRIMARY') pk = names; else if (which === 'UNIQUE') uniques.push(names);
              if (which === 'FOREIGN') { kw('REFERENCES'); ident(); if (isOp('(')) { p++; ident(); while (isOp(',')) { p++; ident(); } op(')'); } }
            }
          } else {
            const col = { name: ident(), type: '', pk: false, auto: false, unique: false, notnull: false, def: null };
            const typeWords = [];
            while (peek() && (peek().k === 'id' || (peek().k === 'op' && peek().v === '(' && typeWords.length))) {
              if (isOp('(')) { while (!isOp(')')) p++; p++; continue; }
              typeWords.push(toks[p++].v);
            }
            col.type = typeWords.join(' ').toUpperCase();
            for (;;) {
              if (isKw('PRIMARY')) { p++; kw('KEY'); col.pk = true; if (isKw('ASC') || isKw('DESC')) p++; continue; }
              if (isKw('AUTOINCREMENT')) { p++; col.auto = true; continue; }
              if (isKw('UNIQUE')) { p++; col.unique = true; continue; }
              if (isKw('NOT')) { p++; kw('NULL'); col.notnull = true; continue; }
              if (isKw('NULL')) { p++; continue; }
              if (isKw('DEFAULT')) { p++; col.def = isOp('(') ? (p++, (() => { const e = expr(); op(')'); return e; })()) : unary(); continue; }
              if (isKw('REFERENCES')) { p++; ident(); if (isOp('(')) { p++; ident(); op(')'); } continue; }
              if (isKw('COLLATE')) { p++; ident(); continue; }
              break;
            }
            cols.push(col);
          }
          if (!isOp(',')) break;
          p++;
        }
        op(')');
        return { n: 'create', name, ifNot, cols, pk, uniques };
      }
      if (isKw('DROP')) {
        p++; kw('TABLE');
        let ifExists = false;
        if (isKw('IF')) { p++; kw('EXISTS'); ifExists = true; }
        return { n: 'drop', name: ident(), ifExists };
      }
      if (isKw('INSERT') || isKw('REPLACE')) {
        let conflict = null;
        if (isKw('REPLACE')) { p++; conflict = 'REPLACE'; }
        else { p++; if (isKw('OR')) { p++; conflict = toks[p++].v; } }
        kw('INTO');
        const table = ident();
        let cols = null;
        if (isOp('(')) { p++; cols = [ident()]; while (isOp(',')) { p++; cols.push(ident()); } op(')'); }
        if (isKw('SELECT')) return { n: 'insert', table, cols, conflict, query: select() };
        if (isKw('DEFAULT')) { p++; kw('VALUES'); return { n: 'insert', table, cols: [], conflict, rows: [[]] }; }
        kw('VALUES');
        const rows = [];
        for (;;) {
          op('(');
          const r = [expr()];
          while (isOp(',')) { p++; r.push(expr()); }
          op(')');
          rows.push(r);
          if (!isOp(',')) break;
          p++;
        }
        return { n: 'insert', table, cols, conflict, rows };
      }
      if (isKw('UPDATE')) {
        p++;
        const table = ident();
        kw('SET');
        const sets = [];
        for (;;) { const c = ident(); op('='); sets.push([c, expr()]); if (!isOp(',')) break; p++; }
        let where = null;
        if (isKw('WHERE')) { p++; where = expr(); }
        return { n: 'update', table, sets, where };
      }
      if (isKw('DELETE')) {
        p++; kw('FROM');
        const table = ident();
        let where = null;
        if (isKw('WHERE')) { p++; where = expr(); }
        return { n: 'delete', table, where };
      }
      if (isKw('BEGIN') || isKw('COMMIT') || isKw('ROLLBACK')) { p++; if (isKw('TRANSACTION')) p++; return { n: 'noop' }; }
      throw sqlSyntax(near());
    }
    const out = [];
    for (;;) {
      while (isOp(';')) p++;
      if (p >= toks.length) break;
      const st = statement();
      st.params = params;
      out.push(st);
      params = 0;
      if (p < toks.length && !isOp(';')) throw sqlSyntax(near());
    }
    return out;
  }
  /* values and comparisons follow SQLite's rules */
  const sqlNull = v => v.t === 'NoneType';
  const sqlRank = v => (sqlNull(v) ? 0 : v.t === 'int' || v.t === 'float' || v.t === 'bool' ? 1 : v.t === 'str' ? 2 : 3);
  function sqlCompare(a, b) {
    const ra = sqlRank(a), rb = sqlRank(b);
    if (ra !== rb) return ra - rb;
    if (ra === 1) return num(a) - num(b);
    if (ra === 2) return a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
    return 0;
  }
  const numericText = s => /^\s*[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?\s*$/.test(s);
  function affinityOf(type) {
    const t = (type || '').toUpperCase();
    if (t.includes('INT')) return 'INTEGER';
    if (/CHAR|CLOB|TEXT/.test(t)) return 'TEXT';
    if (t.includes('BLOB') || !t) return 'BLOB';
    if (/REAL|FLOA|DOUB/.test(t)) return 'REAL';
    return 'NUMERIC';
  }
  function applyAffinity(v, aff) {
    if (sqlNull(v)) return v;
    if (v.t === 'bool') v = V.int(v.v ? 1 : 0);
    if (aff === 'TEXT') return v.t === 'str' ? v : V.str(v.t === 'float' ? fmt(v) : String(num(v)));
    if (aff === 'BLOB') return v;
    if (v.t === 'str' && numericText(v.v)) { const n = Number(v.v); v = Number.isInteger(n) && !/[.eE]/.test(v.v) ? V.int(n) : V.float(n); }
    if (aff === 'REAL' && v.t === 'int') return V.float(v.v);
    if ((aff === 'INTEGER' || aff === 'NUMERIC') && v.t === 'float' && Number.isInteger(v.v) && Math.abs(v.v) < 9e15) return V.int(v.v);
    return v;
  }
  function sqlArith(o, a, b) {
    if (o === '||') return sqlNull(a) || sqlNull(b) ? V.none : V.str(sqlText(a) + sqlText(b));
    if (sqlNull(a) || sqlNull(b)) return V.none;
    const toNum = x => (x.t === 'str' ? (numericText(x.v) ? (/[.eE]/.test(x.v) ? V.float(Number(x.v)) : V.int(Number(x.v))) : V.int(0)) : x.t === 'bool' ? V.int(x.v ? 1 : 0) : x);
    a = toNum(a); b = toNum(b);
    const ints = a.t === 'int' && b.t === 'int';
    const x = num(a), y = num(b);
    switch (o) {
      case '+': return ints ? V.int(x + y) : V.float(x + y);
      case '-': return ints ? V.int(x - y) : V.float(x - y);
      case '*': return ints ? V.int(x * y) : V.float(x * y);
      case '/': if (y === 0) return V.none; return ints ? V.int(Math.trunc(x / y)) : V.float(x / y);
      case '%': if (y === 0) return V.none; return ints ? V.int(x % y) : V.float(Math.trunc(x) % Math.trunc(y));
    }
    return V.none;
  }
  const sqlText = v => (sqlNull(v) ? '' : v.t === 'str' ? v.v : fmt(v));
  const sqlTruth = v => (sqlNull(v) ? false : v.t === 'str' ? (numericText(v.v) ? Number(v.v) !== 0 : false) : num(v) !== 0);
  const tri = b => (b == null ? V.none : V.int(b ? 1 : 0));
  const AGG = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'TOTAL', 'GROUP_CONCAT'];
  const hasAgg = e => !!e && typeof e === 'object' && (e.n === 'fn' && AGG.includes(e.fn) && !(['MIN', 'MAX'].includes(e.fn) && e.args.length > 1) ? true : Object.values(e).some(v => (Array.isArray(v) ? v.some(x => (Array.isArray(x) ? x.some(hasAgg) : hasAgg(x))) : v && typeof v === 'object' && v.n ? hasAgg(v) : false)));
  function makeSqlite(ctx) {
    const base = makeClass('Error', [{ t: 'exctype', v: 'Exception' }], {});
    const dbErr = makeClass('DatabaseError', [base], {});
    SQL_ERR = {
      Error: base, DatabaseError: dbErr,
      OperationalError: makeClass('OperationalError', [dbErr], {}),
      IntegrityError: makeClass('IntegrityError', [dbErr], {}),
      ProgrammingError: makeClass('ProgrammingError', [dbErr], {}),
      InterfaceError: makeClass('InterfaceError', [base], {}),
    };
    const ERR = SQL_ERR;
    ctx.dbs = ctx.dbs || new Map();
    /* running statements against a database */
    function evalSql(e, row, args) {
      switch (e.n) {
        case 'lit': return e.v;
        case 'param': return args.pos[e.i];
        case 'named': { if (!args.named || !args.named.has(e.name)) throw sqlErr('ProgrammingError', `You did not supply a value for binding parameter :${e.name}.`); return args.named.get(e.name); }
        case 'col': return row.get(e.table, e.name);
        case 'neg': { const v = evalSql(e.e, row, args); return sqlNull(v) ? v : sqlArith('-', V.int(0), v); }
        case 'bin': return sqlArith(e.op, evalSql(e.l, row, args), evalSql(e.r, row, args));
        case 'cmp': {
          let a = evalSql(e.l, row, args), b = evalSql(e.r, row, args);
          if (sqlNull(a) || sqlNull(b)) return V.none;
          const affL = e.l.n === 'col' ? row.aff(e.l.table, e.l.name) : null, affR = e.r.n === 'col' ? row.aff(e.r.table, e.r.name) : null;
          if (affL && affL !== 'TEXT' && affL !== 'BLOB' && !affR) b = applyAffinity(b, 'NUMERIC');
          if (affR && affR !== 'TEXT' && affR !== 'BLOB' && !affL) a = applyAffinity(a, 'NUMERIC');
          if (affL === 'TEXT' && !affR && b.t !== 'str') b = applyAffinity(b, 'TEXT');
          if (affR === 'TEXT' && !affL && a.t !== 'str') a = applyAffinity(a, 'TEXT');
          const c = sqlCompare(a, b);
          return tri({ '=': c === 0, '!=': c !== 0, '<': c < 0, '>': c > 0, '<=': c <= 0, '>=': c >= 0 }[e.op]);
        }
        case 'is': { const a = evalSql(e.l, row, args), b = evalSql(e.r, row, args); const same = sqlNull(a) || sqlNull(b) ? sqlNull(a) && sqlNull(b) : sqlCompare(a, b) === 0; return V.int(same !== e.neg ? 1 : 0); }
        case 'like': {
          const a = evalSql(e.l, row, args), pat = evalSql(e.r, row, args);
          if (sqlNull(a) || sqlNull(pat)) return V.none;
          const re = e.glob
            ? new RegExp('^' + sqlText(pat).replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 's')
            : new RegExp('^' + sqlText(pat).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$', 'is');
          return V.int(re.test(sqlText(a)) !== e.neg ? 1 : 0);
        }
        case 'in': case 'insel': {
          const a = evalSql(e.l, row, args);
          if (sqlNull(a)) return V.none;
          const vals = e.n === 'in' ? e.items.map(x => evalSql(x, row, args)) : runSelect(e.q, args, row).rows.map(r => r[0]);
          const hit = vals.some(v => !sqlNull(v) && sqlCompare(a, v) === 0);
          if (!hit && vals.some(sqlNull)) return V.none;
          return V.int(hit !== e.neg ? 1 : 0);
        }
        case 'between': {
          const a = evalSql(e.l, row, args), lo = evalSql(e.lo, row, args), hi = evalSql(e.hi, row, args);
          if ([a, lo, hi].some(sqlNull)) return V.none;
          return V.int((sqlCompare(a, lo) >= 0 && sqlCompare(a, hi) <= 0) !== e.neg ? 1 : 0);
        }
        case 'not': { const v = evalSql(e.e, row, args); return sqlNull(v) ? V.none : V.int(sqlTruth(v) ? 0 : 1); }
        case 'and': { const a = evalSql(e.l, row, args); if (!sqlNull(a) && !sqlTruth(a)) return V.int(0); const b = evalSql(e.r, row, args); if (!sqlNull(b) && !sqlTruth(b)) return V.int(0); return sqlNull(a) || sqlNull(b) ? V.none : V.int(1); }
        case 'or': { const a = evalSql(e.l, row, args); if (!sqlNull(a) && sqlTruth(a)) return V.int(1); const b = evalSql(e.r, row, args); if (!sqlNull(b) && sqlTruth(b)) return V.int(1); return sqlNull(a) || sqlNull(b) ? V.none : V.int(0); }
        case 'case': {
          if (e.subject) { const s = evalSql(e.subject, row, args); for (const [w, t] of e.whens) { const v = evalSql(w, row, args); if (!sqlNull(s) && !sqlNull(v) && sqlCompare(s, v) === 0) return evalSql(t, row, args); } }
          else for (const [w, t] of e.whens) if (sqlTruth(evalSql(w, row, args))) return evalSql(t, row, args);
          return e.other ? evalSql(e.other, row, args) : V.none;
        }
        case 'fn': return sqlFunc(e, row, args);
        case 'subq': { const r = runSelect(e.q, args, row).rows; return r.length ? r[0][0] : V.none; }
        case 'exists': return V.int(runSelect(e.q, args, row).rows.length ? 1 : 0);
        case 'star': throw sqlSyntax('near "*": syntax error');
      }
      throw sqlSyntax('unsupported expression');
    }
    function sqlFunc(e, row, args) {
      if (AGG.includes(e.fn) && !(['MIN', 'MAX'].includes(e.fn) && e.args.length > 1)) {
        if (!row.group) throw sqlErr('OperationalError', `misuse of aggregate function ${e.fn}()`);
        let vals = e.star ? row.group.map(() => V.int(1)) : row.group.map(r => evalSql(e.args[0], r, args)).filter(v => !sqlNull(v));
        if (e.distinct) { const seen = []; vals = vals.filter(v => (seen.some(s => sqlCompare(s, v) === 0) ? false : (seen.push(v), true))); }
        switch (e.fn) {
          case 'COUNT': return V.int(vals.length);
          case 'SUM': if (!vals.length) return V.none; return vals.every(v => v.t === 'int' || (v.t === 'str' && /^\s*[-+]?\d+\s*$/.test(v.v))) ? V.int(vals.reduce((t, v) => t + (v.t === 'str' ? Number(v.v) : num(v)), 0)) : V.float(vals.reduce((t, v) => t + (v.t === 'str' ? (numericText(v.v) ? Number(v.v) : 0) : num(v)), 0));
          case 'TOTAL': return V.float(vals.reduce((t, v) => t + (v.t === 'str' ? (numericText(v.v) ? Number(v.v) : 0) : num(v)), 0));
          case 'AVG': if (!vals.length) return V.none; return V.float(vals.reduce((t, v) => t + (v.t === 'str' ? (numericText(v.v) ? Number(v.v) : 0) : num(v)), 0) / vals.length);
          case 'MIN': return vals.length ? vals.reduce((a, b) => (sqlCompare(b, a) < 0 ? b : a)) : V.none;
          case 'MAX': return vals.length ? vals.reduce((a, b) => (sqlCompare(b, a) > 0 ? b : a)) : V.none;
          case 'GROUP_CONCAT': { const sep = e.args[1] ? sqlText(evalSql(e.args[1], row.group[0] || row, args)) : ','; return vals.length ? V.str(vals.map(sqlText).join(sep)) : V.none; }
        }
      }
      const a = e.args.map(x => evalSql(x, row, args));
      const need = n => { if (a.length !== n) throw sqlErr('OperationalError', `wrong number of arguments to function ${e.fn.toLowerCase()}()`); };
      switch (e.fn) {
        case 'LOWER': need(1); return sqlNull(a[0]) ? V.none : V.str(sqlText(a[0]).toLowerCase());
        case 'UPPER': need(1); return sqlNull(a[0]) ? V.none : V.str(sqlText(a[0]).toUpperCase());
        case 'LENGTH': need(1); return sqlNull(a[0]) ? V.none : V.int([...sqlText(a[0])].length);
        case 'ABS': need(1); return sqlNull(a[0]) ? V.none : a[0].t === 'int' ? V.int(Math.abs(a[0].v)) : V.float(Math.abs(num(sqlArith('+', a[0], V.int(0)))));
        case 'ROUND': { if (sqlNull(a[0])) return V.none; const d = a[1] ? num(a[1]) : 0; const x = num(sqlArith('+', a[0], V.float(0))); const f = 10 ** d; return V.float(Math.sign(x) * Math.round(Math.abs(x) * f) / f); }
        case 'COALESCE': case 'IFNULL': return a.find(v => !sqlNull(v)) || V.none;
        case 'NULLIF': need(2); return !sqlNull(a[0]) && !sqlNull(a[1]) && sqlCompare(a[0], a[1]) === 0 ? V.none : a[0];
        case 'SUBSTR': case 'SUBSTRING': { if (sqlNull(a[0])) return V.none; const s = [...sqlText(a[0])]; let st = num(a[1]); const len = a[2] ? num(a[2]) : s.length; st = st > 0 ? st - 1 : st < 0 ? s.length + st : 0; return V.str(s.slice(Math.max(0, st), Math.max(0, st) + len).join('')); }
        case 'TRIM': return sqlNull(a[0]) ? V.none : V.str(sqlText(a[0]).trim());
        case 'REPLACE': need(3); return sqlNull(a[0]) ? V.none : V.str(sqlText(a[0]).split(sqlText(a[1])).join(sqlText(a[2])));
        case 'INSTR': need(2); return V.int(sqlText(a[0]).indexOf(sqlText(a[1])) + 1);
        case 'TYPEOF': need(1); return V.str(sqlNull(a[0]) ? 'null' : a[0].t === 'int' ? 'integer' : a[0].t === 'float' ? 'real' : 'text');
        case 'MIN': return a.some(sqlNull) ? V.none : a.reduce((x, y) => (sqlCompare(y, x) < 0 ? y : x));
        case 'MAX': return a.some(sqlNull) ? V.none : a.reduce((x, y) => (sqlCompare(y, x) > 0 ? y : x));
      }
      throw sqlErr('OperationalError', `no such function: ${e.fn}`);
    }
    let curDb = null;
    const tableOf = name => { const t = curDb.tables.get(name.toLowerCase()); if (!t) throw sqlErr('OperationalError', `no such table: ${name}`); return t; };
    // a row context: values of every table in the FROM clause, plus the group for aggregates
    function rowCtx(parts, outer) {
      return {
        parts, group: null,
        find(table, name) {
          const lname = name.toLowerCase();
          const hits = [];
          for (const pt of parts) {
            if (table && pt.alias.toLowerCase() !== table.toLowerCase()) continue;
            if (lname === 'rowid' || lname === 'oid' || lname === '_rowid_') { hits.push({ pt, idx: -1 }); continue; }
            const idx = pt.table.cols.findIndex(c => c.name.toLowerCase() === lname);
            if (idx >= 0) hits.push({ pt, idx });
          }
          return hits;
        },
        get(table, name) {
          const hits = this.find(table, name);
          if (!hits.length) {
            if (this.aliases && !table && this.aliases.has(name.toLowerCase())) return this.aliases.get(name.toLowerCase());
            if (outer) return outer.get(table, name);
            throw sqlErr('OperationalError', `no such column: ${table ? table + '.' : ''}${name}`);
          }
          if (hits.length > 1 && !table) throw sqlErr('OperationalError', `ambiguous column name: ${name}`);
          const { pt, idx } = hits[0];
          if (!pt.row) return V.none;
          return idx < 0 ? V.int(pt.row.rowid) : pt.row.vals[idx];
        },
        aff(table, name) { const hits = this.find(table, name); if (hits.length !== 1) return null; const { pt, idx } = hits[0]; return idx < 0 ? 'INTEGER' : affinityOf(pt.table.cols[idx].type); },
      };
    }
    function checkColumns(q, outer) {
      const refs = q.from.map(ref => ({ alias: ref.alias, table: tableOf(ref.name) }));
      const aliases = new Set(q.cols.filter(c => c.alias).map(c => c.alias.toLowerCase()));
      const known = (t, name) => {
        const lname = name.toLowerCase();
        if (['rowid', 'oid', '_rowid_'].includes(lname)) return true;
        return refs.some(r => (!t || r.alias.toLowerCase() === t.toLowerCase()) && r.table.cols.some(c => c.name.toLowerCase() === lname));
      };
      const walk = (e, allowAlias) => {
        if (!e || typeof e !== 'object') return;
        if (e.n === 'col') { if (!known(e.table, e.name) && !(allowAlias && !e.table && aliases.has(e.name.toLowerCase())) && !outer) throw sqlErr('OperationalError', `no such column: ${e.table ? e.table + '.' : ''}${e.name}`); return; }
        if (e.n === 'insel' || e.n === 'subq' || e.n === 'exists') { if (e.l) walk(e.l, allowAlias); return; }
        for (const v of Object.values(e)) { if (Array.isArray(v)) v.forEach(x => (Array.isArray(x) ? x.forEach(y => walk(y, allowAlias)) : walk(x, allowAlias))); else if (v && typeof v === 'object' && v.n) walk(v, allowAlias); }
      };
      for (const c of q.cols) if (c.e.n !== 'star') walk(c.e, false);
      for (const ref of q.from) walk(ref.on, false);
      walk(q.where, false);
      (q.group || []).forEach(g => walk(g, true));
      walk(q.having, true);
      (q.order || []).forEach(o => walk(o.e, true));
    }
    function runSelect(q, args, outer) {
      checkColumns(q, outer);
      // FROM and JOINs build every combination of rows that survives the ON conditions
      let combos = [[]];
      for (const ref of q.from) {
        const table = tableOf(ref.name);
        const next = [];
        for (const combo of combos) {
          let matched = false;
          for (const r of table.rows) {
            const parts = [...combo, { alias: ref.alias, table, row: r }];
            if (ref.on && !sqlTruth(evalSql(ref.on, rowCtx(parts, outer), args))) continue;
            next.push(parts);
            matched = true;
          }
          if (ref.join === 'left' && !matched) next.push([...combo, { alias: ref.alias, table, row: null }]);
        }
        combos = next;
      }
      if (!q.from.length) combos = [[]];
      let rows = combos.map(parts => rowCtx(parts, outer));
      if (q.where) rows = rows.filter(r => sqlTruth(evalSql(q.where, r, args)));
      // the output columns
      const expand = [];
      for (const c of q.cols) {
        if (c.e.n === 'star') {
          const parts = q.from.length ? (combos[0] || q.from.map(ref => ({ alias: ref.alias, table: tableOf(ref.name), row: null }))) : [];
          const use = c.e.table ? parts.filter(pt => pt.alias.toLowerCase() === c.e.table.toLowerCase()) : parts;
          if (c.e.table && !use.length) throw sqlErr('OperationalError', `no such table: ${c.e.table}`);
          for (const pt of use) pt.table.cols.forEach(col => expand.push({ e: { n: 'col', table: pt.alias, name: col.name }, name: col.name }));
        } else expand.push({ e: c.e, name: c.alias || (c.e.n === 'col' ? c.e.name : c.text) });
      }
      const grouped = q.group || expand.some(c => hasAgg(c.e)) || (q.having && hasAgg(q.having)) || (q.order || []).some(o => hasAgg(o.e));
      let out;
      if (grouped) {
        const groups = new Map();
        if (q.group) {
          for (const r of rows) {
            const key = JSON.stringify(q.group.map(g => { const v = evalSql(g, r, args); return [sqlRank(v), sqlNull(v) ? null : v.t === 'str' ? v.v : num(v)]; }));
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(r);
          }
        } else groups.set('all', rows);
        out = [];
        for (const g of groups.values()) {
          const rep = g[0] || rowCtx(q.from.map(ref => ({ alias: ref.alias, table: tableOf(ref.name), row: null })), outer);
          const gr = Object.assign(Object.create(rep), { group: g });
          const vals = expand.map(c => evalSql(c.e, gr, args));
          if (q.having) {
            const aliases = new Map();
            expand.forEach((c, i) => { if (c.name) aliases.set(c.name.toLowerCase(), vals[i]); });
            if (!sqlTruth(evalSql(q.having, Object.assign(Object.create(gr), { aliases }), args))) continue;
          }
          out.push({ ctx: gr, vals });
        }
      } else out = rows.map(r => ({ ctx: r, vals: expand.map(c => evalSql(c.e, r, args)) }));
      if (q.distinct) { const seen = new Set(); out = out.filter(o => { const k = JSON.stringify(o.vals.map(v => [sqlRank(v), sqlNull(v) ? null : v.t === 'str' ? v.v : num(v)])); if (seen.has(k)) return false; seen.add(k); return true; }); }
      if (q.order) {
        const aliasMap = o => { const m = new Map(); expand.forEach((c, i) => { if (c.name) m.set(c.name.toLowerCase(), o.vals[i]); }); return m; };
        const keyOfRow = o => q.order.map(ob => {
          if (ob.e.n === 'lit' && ob.e.v.t === 'int') { const k = ob.e.v.v - 1; if (k < 0 || k >= expand.length) throw sqlErr('OperationalError', `${ob.e.v.v}st ORDER BY term out of range - should be between 1 and ${expand.length}`); return o.vals[k]; }
          const c = Object.assign(Object.create(o.ctx), { aliases: aliasMap(o) });
          if (ob.e.n === 'col' && !ob.e.table) { const hit = expand.findIndex(x => x.name && x.name.toLowerCase() === ob.e.name.toLowerCase() && !(x.e.n === 'col')); if (hit >= 0) return o.vals[hit]; }
          return evalSql(ob.e, c, args);
        });
        const keyed = out.map((o, i) => ({ o, k: keyOfRow(o), i }));
        keyed.sort((a, b) => { for (let j = 0; j < q.order.length; j++) { const c = sqlCompare(a.k[j], b.k[j]); if (c) return q.order[j].desc ? -c : c; } return a.i - b.i; });
        out = keyed.map(x => x.o);
      }
      if (q.limit) {
        const lim = num(evalSql(q.limit, rowCtx([]), args)), off = q.offset ? num(evalSql(q.offset, rowCtx([]), args)) : 0;
        out = out.slice(off, lim < 0 ? undefined : off + lim);
      }
      return { names: expand.map(c => c.name), rows: out.map(o => o.vals) };
    }
    function insertRow(table, cols, vals, conflict, cur) {
      const row = { rowid: 0, vals: table.cols.map(c => (c.def ? evalSql(c.def, rowCtx([]), { pos: [] }) : V.none)) };
      let rowidGiven = null;
      cols.forEach((name, i) => {
        const lname = name.toLowerCase();
        if (lname === 'rowid' || lname === 'oid' || lname === '_rowid_') { rowidGiven = vals[i]; return; }
        const idx = table.cols.findIndex(c => c.name.toLowerCase() === lname);
        if (idx < 0) throw sqlErr('OperationalError', `table ${table.name} has no column named ${name}`);
        row.vals[idx] = applyAffinity(vals[i], affinityOf(table.cols[idx].type));
      });
      const ipk = table.cols.findIndex(c => c.pk && c.type === 'INTEGER');
      if (ipk >= 0 && !sqlNull(row.vals[ipk])) rowidGiven = row.vals[ipk];
      if (rowidGiven && !sqlNull(rowidGiven)) {
        if (rowidGiven.t !== 'int') throw sqlErr('IntegrityError', 'datatype mismatch');
        row.rowid = rowidGiven.v;
      } else {
        row.rowid = Math.max(table.maxRowid, ...table.rows.map(r => r.rowid), 0) + 1;
        if (table.cols.some(c => c.auto)) table.maxRowid = row.rowid;
      }
      if (ipk >= 0) row.vals[ipk] = V.int(row.rowid);
      for (const [i, c] of table.cols.entries()) if (c.notnull && sqlNull(row.vals[i]) && i !== ipk) {
        if (conflict === 'IGNORE') return false;
        throw sqlErr('IntegrityError', `NOT NULL constraint failed: ${table.name}.${c.name}`);
      }
      // unique keys: the rowid, single UNIQUE/PRIMARY KEY columns, and composite keys
      const keys = [];
      table.cols.forEach((c, i) => { if ((c.unique || c.pk) && i !== ipk) keys.push([i]); });
      if (table.pk && !(table.pk.length === 1 && ipk >= 0 && table.cols[ipk].name.toLowerCase() === table.pk[0].toLowerCase())) keys.push(table.pk.map(n => table.cols.findIndex(c => c.name.toLowerCase() === n.toLowerCase())));
      for (const u of table.uniques) keys.push(u.map(n => table.cols.findIndex(c => c.name.toLowerCase() === n.toLowerCase())));
      const clash = table.rows.find(r => r.rowid === row.rowid);
      const keyClash = keys.map(k => [k, table.rows.find(r => k.every(i => !sqlNull(row.vals[i]) && !sqlNull(r.vals[i]) && sqlCompare(r.vals[i], row.vals[i]) === 0))]).find(([, r]) => r);
      if (clash || keyClash) {
        if (conflict === 'IGNORE') return false;
        if (conflict === 'REPLACE') { table.rows = table.rows.filter(r => r !== clash && (!keyClash || r !== keyClash[1])); }
        else if (clash) throw sqlErr('IntegrityError', `UNIQUE constraint failed: ${table.name}.${ipk >= 0 ? table.cols[ipk].name : 'rowid'}`);
        else throw sqlErr('IntegrityError', `UNIQUE constraint failed: ${keyClash[0].map(i => table.name + '.' + table.cols[i].name).join(', ')}`);
      }
      table.rows.push(row);
      table.maxRowid = Math.max(table.maxRowid, row.rowid);
      cur.lastrowid = row.rowid;
      return true;
    }
    function execOne(st, args, cur) {
      cur.rows = []; cur.pos = 0; cur.description = V.none; cur.rowcount = -1;
      switch (st.n) {
        case 'noop': return;
        case 'create': {
          const key = st.name.toLowerCase();
          if (curDb.tables.has(key)) { if (st.ifNot) return; throw sqlErr('OperationalError', `table ${st.name} already exists`); }
          curDb.tables.set(key, { name: st.name, cols: st.cols, pk: st.pk, uniques: st.uniques, rows: [], maxRowid: 0 });
          return;
        }
        case 'drop': {
          const key = st.name.toLowerCase();
          if (!curDb.tables.has(key)) { if (st.ifExists) return; throw sqlErr('OperationalError', `no such table: ${st.name}`); }
          curDb.tables.delete(key);
          return;
        }
        case 'insert': {
          const table = tableOf(st.table);
          const cols = st.cols || table.cols.map(c => c.name);
          const rowsVals = st.query ? runSelect(st.query, args).rows : st.rows.map(r => r.map(e => evalSql(e, rowCtx([]), args)));
          let n = 0;
          for (const vals of rowsVals) {
            if (vals.length !== cols.length) throw sqlErr('OperationalError', `table ${table.name} has ${table.cols.length} columns but ${vals.length} values were supplied`);
            if (insertRow(table, cols, vals, st.conflict, cur)) n++;
          }
          cur.rowcount = n;
          return;
        }
        case 'update': {
          const table = tableOf(st.table);
          let n = 0;
          for (const r of table.rows) {
            const rc = rowCtx([{ alias: table.name, table, row: r }]);
            if (st.where && !sqlTruth(evalSql(st.where, rc, args))) continue;
            const newVals = st.sets.map(([c, e]) => [c, evalSql(e, rc, args)]);
            for (const [c, v] of newVals) {
              const idx = table.cols.findIndex(col => col.name.toLowerCase() === c.toLowerCase());
              if (idx < 0) throw sqlErr('OperationalError', `no such column: ${c}`);
              r.vals[idx] = applyAffinity(v, affinityOf(table.cols[idx].type));
            }
            n++;
          }
          cur.rowcount = n;
          return;
        }
        case 'delete': {
          const table = tableOf(st.table);
          const before = table.rows.length;
          table.rows = table.rows.filter(r => st.where && !sqlTruth(evalSql(st.where, rowCtx([{ alias: table.name, table, row: r }]), args)));
          cur.rowcount = before - table.rows.length;
          return;
        }
        case 'select': {
          const res = runSelect(st, args);
          cur.rows = res.rows.map(r => V.tuple(r));
          cur.description = V.tuple(res.names.map(n => V.tuple([V.str(n), V.none, V.none, V.none, V.none, V.none, V.none])));
          return;
        }
      }
    }
    function bindArgs(st, params) {
      if (!params || params.t === 'NoneType') params = V.tuple([]);
      if (params.t === 'dict') {
        const named = new Map();
        for (const [k, v] of params.v.values()) named.set(fmt(k), v);
        return { pos: [], named };
      }
      let pos;
      // a plain string is a sequence of letters, the famous "use (name,)" mistake
      if (params.t === 'str') pos = [...params.v].map(V.str);
      else if (params.t === 'tuple' || params.t === 'list') pos = params.v.map(v => (v.t === 'bool' ? V.int(v.v ? 1 : 0) : v));
      else throw sqlErr('ProgrammingError', 'parameters are of unsupported type');
      for (const v of pos) if (!['int', 'float', 'str', 'NoneType'].includes(v.t)) throw sqlErr('ProgrammingError', `Error binding parameter 1: type '${typeName(v)}' is not supported`);
      if (pos.length !== st.params) throw sqlErr('ProgrammingError', `Incorrect number of bindings supplied. The current statement uses ${st.params}, and there are ${pos.length} supplied.`);
      return { pos };
    }
    const CONN = makeClass('Connection', [], {});
    const CUR_ = makeClass('Cursor', [], {});
    const newCursor = conn => { const c = { t: 'instance', cls: CUR_, attrs: new Map(), conn, rows: [], pos: 0, rowcount: -1, lastrowid: null, description: V.none, closed: false }; return c; };
    const checkOpen = c => { if (c.conn.closed) throw sqlErr('ProgrammingError', 'Cannot operate on a closed database.'); if (c.closed) throw sqlErr('ProgrammingError', 'Cannot operate on a closed cursor.'); };
    const execute = (c, sqlV, params) => {
      checkOpen(c);
      if (!sqlV || sqlV.t !== 'str') throw new PyError('TypeError', 'execute() argument 1 must be str');
      curDb = c.conn.db;
      const stmts = sqlParse(sqlV.v, sqlTokens(sqlV.v));
      if (stmts.length > 1) throw sqlErr('ProgrammingError', 'You can only execute one statement at a time.');
      if (!stmts.length) return c;
      execOne(stmts[0], bindArgs(stmts[0], params), c);
      return c;
    };
    const curDict = {
      execute: nat('execute', ([c, sqlV, params]) => execute(c, sqlV, params)),
      executemany: nat('executemany', ([c, sqlV, seq]) => {
        checkOpen(c);
        curDb = c.conn.db;
        const stmts = sqlParse(sqlV.v, sqlTokens(sqlV.v));
        let total = 0;
        for (const params of iterate(seq)) { execOne(stmts[0], bindArgs(stmts[0], params), c); total += Math.max(0, c.rowcount); }
        c.rowcount = total;
        return c;
      }),
      executescript: nat('executescript', ([c, sqlV]) => { checkOpen(c); curDb = c.conn.db; for (const st of sqlParse(sqlV.v, sqlTokens(sqlV.v))) execOne(st, { pos: [] }, c); return c; }),
      fetchone: nat('fetchone', ([c]) => (c.pos < c.rows.length ? c.rows[c.pos++] : V.none)),
      fetchall: nat('fetchall', ([c]) => { const r = c.rows.slice(c.pos); c.pos = c.rows.length; return V.list(r); }),
      fetchmany: nat('fetchmany', ([c, n]) => { const k = n ? num(n) : 1; const r = c.rows.slice(c.pos, c.pos + k); c.pos += r.length; return V.list(r); }),
      close: nat('close', ([c]) => { c.closed = true; return V.none; }),
      __iter__: nat('__iter__', ([c]) => mkIter('sqlite3.Cursor', () => (c.pos < c.rows.length ? c.rows[c.pos++] : DONE))),
      lastrowid: { t: 'property', fget: nat('get', ([c]) => (c.lastrowid == null ? V.none : V.int(c.lastrowid))), fset: null },
      rowcount: { t: 'property', fget: nat('get', ([c]) => V.int(c.rowcount)), fset: null },
      description: { t: 'property', fget: nat('get', ([c]) => c.description), fset: null },
    };
    for (const k in curDict) CUR_.dict.set(k, curDict[k]);
    const connDict = {
      cursor: nat('cursor', ([conn]) => { if (conn.closed) throw sqlErr('ProgrammingError', 'Cannot operate on a closed database.'); return newCursor(conn); }),
      execute: nat('execute', ([conn, sqlV, params]) => execute(newCursor(conn), sqlV, params)),
      executemany: nat('executemany', ([conn, sqlV, seq]) => callValue(CUR_.dict.get('executemany'), [newCursor(conn), sqlV, seq], {}, ctx)),
      executescript: nat('executescript', ([conn, sqlV]) => callValue(CUR_.dict.get('executescript'), [newCursor(conn), sqlV], {}, ctx)),
      commit: nat('commit', ([conn]) => { if (conn.closed) throw sqlErr('ProgrammingError', 'Cannot operate on a closed database.'); return V.none; }),
      rollback: nat('rollback', () => V.none),
      close: nat('close', ([conn]) => { conn.closed = true; return V.none; }),
      __enter__: nat('__enter__', ([conn]) => conn),
      __exit__: nat('__exit__', () => V.bool(false)),
    };
    for (const k in connDict) CONN.dict.set(k, connDict[k]);
    return mkModule('sqlite3', {
      connect: nat('connect', ([name]) => {
        const key = name ? fmt(name) : ':memory:';
        let db;
        if (key === ':memory:') db = { tables: new Map() };
        else { if (!ctx.dbs.has(key)) ctx.dbs.set(key, { tables: new Map() }); db = ctx.dbs.get(key); }
        return { t: 'instance', cls: CONN, attrs: new Map(), db, closed: false };
      }),
      ...Object.fromEntries(Object.entries(ERR).map(([k, v]) => [k, v])),
      sqlite_version: V.str('3.45.0'),
    });
  }
  /* ---------- bytes (just enough for the web), urllib and bs4 ---------- */
  let BYTES_CLS = null;
  const utf8 = t => new TextEncoder().encode(t);
  function makeBytes(text) {
    if (!BYTES_CLS) {
      BYTES_CLS = makeClass('bytes', [], {});
      const tx = o => o.attrs.get('_text').v;
      const d = {
        decode: nat('decode', ([o]) => V.str(tx(o))),
        __len__: nat('__len__', ([o]) => V.int(utf8(tx(o)).length)),
        __repr__: nat('__repr__', ([o]) => {
          let out = '';
          for (const b of utf8(tx(o))) out += b === 92 ? '\\\\' : b === 39 ? "\\'" : b === 10 ? '\\n' : b === 13 ? '\\r' : b === 9 ? '\\t' : b >= 32 && b < 127 ? String.fromCharCode(b) : '\\x' + b.toString(16).padStart(2, '0');
          return V.str("b'" + out + "'");
        }),
        __eq__: nat('__eq__', ([a, b]) => (b && b.cls === BYTES_CLS ? V.bool(tx(a) === tx(b)) : V.bool(false))),
        __hash__: nat('__hash__', ([o]) => V.int([...tx(o)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 11))),
        __iter__: nat('__iter__', ([o]) => { const bs = [...utf8(tx(o))]; let i = 0; return mkIter('bytes_iterator', () => (i < bs.length ? V.int(bs[i++]) : DONE)); }),
        strip: nat('strip', ([o]) => makeBytes(tx(o).trim())),
        split: nat('split', ([o]) => V.list(tx(o).trim().split(/\s+/).filter(Boolean).map(makeBytes))),
        startswith: nat('startswith', ([o, p]) => V.bool(tx(o).startsWith(p.cls === BYTES_CLS ? tx(p) : fmt(p)))),
      };
      for (const k in d) BYTES_CLS.dict.set(k, d[k]);
    }
    return { t: 'instance', cls: BYTES_CLS, attrs: new Map([['_text', V.str(text)]]) };
  }
  const isBytes = v => v && v.t === 'instance' && v.cls === BYTES_CLS;
  // the pretend internet: steps list the pages a spell may open (opts.web)
  function webFetch(ctx, url) {
    const site = ctx.web || {};
    const key = Object.keys(site).find(k => k === url || k === url.replace(/\?.*$/, '') || k === url.replace(/\/$/, ''));
    const host = (url.split('/')[2] || url);
    const known = key || Object.keys(site).some(k => (k.split('/')[2] || k) === host);
    if (!known) return { error: 'host', host };
    if (!key) return { error: 404 };
    const data = site[key];
    return { text: typeof data === 'string' ? data : JSON.stringify(data) };
  }
  function makeUrllibRequest(ctx) {
    const errMod = makeUrllibError(ctx);
    const RESP = makeClass('http.client.HTTPResponse', [], {});
    const rd = {
      read: nat('read', ([r]) => { const t = r.rest; r.rest = ''; return makeBytes(t); }),
      readline: nat('readline', ([r]) => { const i = r.rest.indexOf('\n'); const line = i < 0 ? r.rest : r.rest.slice(0, i + 1); r.rest = r.rest.slice(line.length); return makeBytes(line); }),
      getcode: nat('getcode', () => V.int(200)),
      close: nat('close', () => V.none),
      __iter__: nat('__iter__', ([r]) => mkIter('iterator', () => { if (!r.rest) return DONE; const i = r.rest.indexOf('\n'); const line = i < 0 ? r.rest : r.rest.slice(0, i + 1); r.rest = r.rest.slice(line.length); return makeBytes(line); })),
      __enter__: nat('__enter__', ([r]) => r),
      __exit__: nat('__exit__', () => V.bool(false)),
      status: { t: 'property', fget: nat('get', () => V.int(200)), fset: null },
      url: { t: 'property', fget: nat('get', ([r]) => V.str(r.url)), fset: null },
    };
    for (const k in rd) RESP.dict.set(k, rd[k]);
    return mkModule('urllib.request', {
      urlopen: nat('urlopen', ([u]) => {
        const url = fmt(u);
        const res = webFetch(ctx, url);
        if (res.error === 'host') throw errMod.raise('URLError', `<urlopen error [Errno 11001] getaddrinfo failed>`, url);
        if (res.error === 404) throw errMod.raise('HTTPError', 'HTTP Error 404: Not Found', url);
        return { t: 'instance', cls: RESP, attrs: new Map(), rest: res.text, url };
      }),
    });
  }
  function makeUrllibError(ctx) {
    if (ctx.urlErr) return ctx.urlErr;
    const URLError = makeClass('URLError', [{ t: 'exctype', v: 'OSError' }], {});
    const HTTPError = makeClass('HTTPError', [URLError], {});
    const mod = mkModule('urllib.error', { URLError, HTTPError });
    mod.raise = (kind, msg) => { const inst = makeInstance(kind === 'HTTPError' ? HTTPError : URLError, [V.str(msg)], {}, ctx); const e = new PyError(kind, msg); e.obj = inst; return e; };
    ctx.urlErr = mod;
    ctx.modules['urllib.error'] = mod;
    return mod;
  }
  function makeUrllibParse() {
    const quote = (s, safe) => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()).replace(/%2F/g, safe.includes('/') ? '/' : '%2F').replace(/%7E/gi, '~');
    const quotePlus = s => quote(s, '').replace(/%20/g, '+');
    return mkModule('urllib.parse', {
      quote: nat('quote', ([s, safe]) => V.str(quote(fmt(s), safe ? fmt(safe) : '/'))),
      quote_plus: nat('quote_plus', ([s]) => V.str(quotePlus(fmt(s)))),
      unquote: nat('unquote', ([s]) => V.str(decodeURIComponent(fmt(s)))),
      urlencode: nat('urlencode', ([q]) => {
        const pairs = q.t === 'dict' ? [...q.v.values()] : iterate(q).map(p => iterate(p));
        return V.str(pairs.map(([k, v]) => quotePlus(fmt(k)) + '=' + quotePlus(fmt(v))).join('&'));
      }),
      urljoin: nat('urljoin', ([b, r]) => { try { return V.str(new URL(fmt(r), fmt(b)).href); } catch (e) { return r; } }),
      urlparse: nat('urlparse', ([u]) => {
        const m = /^(?:([a-zA-Z][\w+.-]*):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/.exec(fmt(u));
        const parts = { scheme: m[1] || '', netloc: m[2] || '', path: m[3] || '', params: '', query: m[4] || '', fragment: m[5] || '' };
        const o = mkObj('ParseResult', Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, V.str(v)])));
        o.repr = () => `ParseResult(${Object.entries(parts).map(([k, v]) => `${k}=${strRepr(v)}`).join(', ')})`;
        return o;
      }),
    });
  }
  /* bs4: BeautifulSoup over the forgiving HTML parser */
  function makeBs4(ctx) {
    const TAG = makeClass('Tag', [], {});
    // a bs4 node: { kind: 'tag', name, attrs: [[k, v]], kids: [...], parent } or { kind: 'text', text, parent }
    const fromMarkup = node => {
      const t = { kind: 'tag', name: node.tag === '#document' ? '[document]' : node.tag, attrs: node.attrs, kids: [], parent: null };
      const addText = s => { if (s) t.kids.push({ kind: 'text', text: s, parent: t }); };
      addText(node.text);
      for (const k of node.kids) { const c = fromMarkup(k); c.parent = t; t.kids.push(c); addText(k.tail); }
      return t;
    };
    const wrap = n => { if (n.obj) return n.obj; const o = { t: 'instance', cls: TAG, attrs: new Map(), bs: n }; n.obj = o; return o; };
    const nodeOf = o => { if (!o || !o.bs) throw new PyError('TypeError', 'expected a Tag'); return o.bs; };
    const MULTI = ['class', 'rel', 'rev', 'headers', 'accesskey', 'accept-charset'];
    const attrVal = (k, v) => (MULTI.includes(k) ? V.list(v.split(/\s+/).filter(Boolean).map(V.str)) : V.str(v));
    const textOf = n => (n.kind === 'text' ? n.text : n.kids.map(textOf).join(''));
    const descendants = n => { const out = []; const walk = x => { for (const k of x.kids) if (k.kind === 'tag') { out.push(k); walk(k); } }; walk(n); return out; };
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const VOID = ['br', 'img', 'input', 'meta', 'link', 'hr', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
    const serialize = n => {
      if (n.kind === 'text') return esc(n.text);
      const inner = n.kids.map(serialize).join('');
      if (n.name === '[document]') return inner;
      const a = n.attrs.map(([k, v]) => ` ${k}="${v.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`).join('');
      return VOID.includes(n.name) ? `<${n.name}${a}/>` : `<${n.name}${a}>${inner}</${n.name}>`;
    };
    // does a tag match find/find_all filters?
    const matcher = (nameArg, attrsArg, kw) => {
      const names = !nameArg || nameArg.t === 'NoneType' ? null : nameArg.t === 'bool' ? (nameArg.v ? null : []) : nameArg.t === 'list' ? nameArg.v.map(fmt) : [fmt(nameArg)];
      const conds = [];
      if (attrsArg && attrsArg.t === 'dict') for (const [k, v] of attrsArg.v.values()) conds.push([fmt(k), v]);
      for (const [k, v] of Object.entries(kw)) if (!['limit', 'recursive', 'string', 'text'].includes(k)) conds.push([k === 'class_' ? 'class' : k.replace(/_/g, '-'), v]);
      const stringWant = kw.string || kw.text;
      return n => {
        if (names && !names.includes(n.name)) return false;
        for (const [k, want] of conds) {
          const hit = n.attrs.find(([a]) => a === k);
          if (want.t === 'bool') { if (!!hit !== want.v) return false; continue; }
          if (!hit) return false;
          const vals = MULTI.includes(k) ? hit[1].split(/\s+/) : [hit[1]];
          const wants = want.t === 'list' ? want.v.map(fmt) : [fmt(want)];
          if (!vals.some(v => wants.includes(v)) && !(MULTI.includes(k) && wants.includes(hit[1]))) return false;
        }
        if (stringWant && textOf(n) !== fmt(stringWant)) return false;
        return true;
      };
    };
    const findAll = (o, args, kw) => {
      const n = nodeOf(o);
      const test = matcher(args[0], args[1] && args[1].t === 'dict' ? args[1] : null, kw);
      const pool = kw.recursive && !truthy(kw.recursive) ? n.kids.filter(k => k.kind === 'tag') : descendants(n);
      let hits = pool.filter(test);
      const limit = kw.limit ? num(kw.limit) : args[1] && args[1].t === 'int' ? num(args[1]) : 0;
      if (limit) hits = hits.slice(0, limit);
      return hits;
    };
    // CSS selectors: tag, .class, #id, [attr], [attr=value], combined, with descendant ( ) and child (>) steps
    const cssMatch = (n, simple) => {
      const m = /^([\w-]*|\*)((?:[.#][\w-]+|\[[^\]]+\])*)$/.exec(simple);
      if (!m) throw new PyError('ValueError', `Unsupported or invalid CSS selector: "${simple}"`);
      if (m[1] && m[1] !== '*' && n.name !== m[1].toLowerCase()) return false;
      for (const part of m[2].match(/[.#][\w-]+|\[[^\]]+\]/g) || []) {
        if (part[0] === '.') { const c = n.attrs.find(([a]) => a === 'class'); if (!c || !c[1].split(/\s+/).includes(part.slice(1))) return false; }
        else if (part[0] === '#') { const c = n.attrs.find(([a]) => a === 'id'); if (!c || c[1] !== part.slice(1)) return false; }
        else { const am = /^\[([\w-]+)(?:\s*([~^$*]?=)\s*["']?([^"'\]]*)["']?)?\]$/.exec(part); const c = n.attrs.find(([a]) => a === am[1]); if (!c) return false; if (am[2]) { const v = c[1], w = am[3]; const ok = am[2] === '=' ? v === w : am[2] === '^=' ? v.startsWith(w) : am[2] === '$=' ? v.endsWith(w) : am[2] === '*=' ? v.includes(w) : v.split(/\s+/).includes(w); if (!ok) return false; } }
      }
      return true;
    };
    const select = (root, sel) => {
      const results = new Set();
      for (const group of sel.split(',')) {
        const tokens = group.trim().replace(/\s*>\s*/g, ' > ').split(/\s+/);
        let cur = [root];
        let child = false;
        for (const tok of tokens) {
          if (tok === '>') { child = true; continue; }
          const next = [];
          for (const c of cur) for (const d of child ? c.kids.filter(k => k.kind === 'tag') : descendants(c)) if (cssMatch(d, tok) && !next.includes(d)) next.push(d);
          cur = next;
          child = false;
        }
        cur.forEach(x => results.add(x));
      }
      const order = descendants(root);
      return order.filter(x => results.has(x));
    };
    const d = {
      name: { t: 'property', fget: nat('get', ([o]) => V.str(nodeOf(o).name)), fset: null },
      attrs: { t: 'property', fget: nat('get', ([o]) => { const dd = dict(); for (const [k, v] of nodeOf(o).attrs) dd.v.set(keyOf(V.str(k)), [V.str(k), attrVal(k, v)]); return dd; }), fset: null },
      text: { t: 'property', fget: nat('get', ([o]) => V.str(textOf(nodeOf(o)))), fset: null },
      string: { t: 'property', fget: nat('get', ([o]) => { let n = nodeOf(o); while (n.kind === 'tag' && n.kids.length === 1 && n.kids[0].kind === 'tag') n = n.kids[0]; return n.kind === 'tag' && n.kids.length === 1 && n.kids[0].kind === 'text' ? V.str(n.kids[0].text) : V.none; }), fset: null },
      contents: { t: 'property', fget: nat('get', ([o]) => V.list(nodeOf(o).kids.map(k => (k.kind === 'text' ? V.str(k.text) : wrap(k))))), fset: null },
      children: { t: 'property', fget: nat('get', ([o]) => { const ks = nodeOf(o).kids.map(k => (k.kind === 'text' ? V.str(k.text) : wrap(k))); let i = 0; return mkIter('list_iterator', () => (i < ks.length ? ks[i++] : DONE)); }), fset: null },
      parent: { t: 'property', fget: nat('get', ([o]) => (nodeOf(o).parent ? wrap(nodeOf(o).parent) : V.none)), fset: null },
      get: nat('get', ([o, k, def]) => { const hit = nodeOf(o).attrs.find(([a]) => a === fmt(k)); return hit ? attrVal(hit[0], hit[1]) : def || V.none; }),
      get_text: nat('get_text', ([o, sep], kw) => {
        const s = sep ? fmt(sep) : kw.separator ? fmt(kw.separator) : '';
        const strip = kw.strip && truthy(kw.strip);
        const bits = [];
        const walk = n => { for (const k of n.kids) { if (k.kind === 'text') bits.push(strip ? k.text.trim() : k.text); else walk(k); } };
        walk(nodeOf(o));
        return V.str((strip ? bits.filter(Boolean) : bits).join(s));
      }),
      find: nat('find', ([o, ...args], kw) => { const r = findAll(o, args, { ...kw, limit: V.int(1) }); return r.length ? wrap(r[0]) : V.none; }),
      find_all: nat('find_all', ([o, ...args], kw) => V.list(findAll(o, args, kw).map(wrap))),
      select: nat('select', ([o, sel]) => V.list(select(nodeOf(o), fmt(sel)).map(wrap))),
      select_one: nat('select_one', ([o, sel]) => { const r = select(nodeOf(o), fmt(sel)); return r.length ? wrap(r[0]) : V.none; }),
      __call__: nat('__call__', ([o, ...args], kw) => V.list(findAll(o, args, kw).map(wrap))),
      __getitem__: nat('__getitem__', ([o, k]) => { const hit = nodeOf(o).attrs.find(([a]) => a === fmt(k)); if (!hit) throw new PyError('KeyError', strRepr(fmt(k))); return attrVal(hit[0], hit[1]); }),
      __getattr__: nat('__getattr__', ([o, nm]) => { const r = descendants(nodeOf(o)).find(n => n.name === nm.v); return r ? wrap(r) : V.none; }),
      __str__: nat('__str__', ([o]) => V.str(serialize(nodeOf(o)))),
      __repr__: nat('__repr__', ([o]) => V.str(serialize(nodeOf(o)))),
      __len__: nat('__len__', ([o]) => V.int(nodeOf(o).kids.length)),
      __iter__: nat('__iter__', ([o]) => { const ks = nodeOf(o).kids.map(k => (k.kind === 'text' ? V.str(k.text) : wrap(k))); let i = 0; return mkIter('list_iterator', () => (i < ks.length ? ks[i++] : DONE)); }),
    };
    d.getText = d.get_text;
    d.findAll = d.find_all;
    for (const k in d) TAG.dict.set(k, d[k]);
    const Soup = nat('BeautifulSoup', ([markup, parser]) => {
      if (!markup) throw new PyError('TypeError', "BeautifulSoup() missing markup");
      const text = isBytes(markup) ? markup.attrs.get('_text').v : markup.t === 'file' ? readRest(markup) : fmt(markup);
      return wrap(fromMarkup(parseMarkup(text, true)));
    });
    return mkModule('bs4', { BeautifulSoup: Soup, Tag: TAG });
  }
  const MODULES = { 'urllib.request': makeUrllibRequest, 'urllib.parse': makeUrllibParse, 'urllib.error': makeUrllibError, bs4: makeBs4, copy: makeCopy, sqlite3: makeSqlite, 'xml.etree.ElementTree': makeEtree, datetime: makeDatetime, logging: makeLogging, pathlib: makePathlib, os: makeOs, 'os.path': ctx => makeOs(ctx).members.get('path'), shutil: makeShutil, argparse: makeArgparse, random: makeRandom, math: makeMath, statistics: makeStatistics, json: makeJson, csv: makeCsv, sys: makeSys, re: makeRe, pytest: makePytest, requests: makeRequests, string: STRING_MOD };
  function loadModule(name, ctx) {
    if (ctx.modules[name]) return ctx.modules[name];
    if (ctx.userModules && ctx.userModules[name]) return (ctx.modules[name] = runUserModule(name, ctx));
    if (!MODULES[name]) throw new PyError('ModuleNotFoundError', `No module named '${name}'`);
    return (ctx.modules[name] = MODULES[name](ctx));
  }
  // a spell file on the shelf (like calculator.py) can be imported
  function runUserModule(name, ctx) {
    const prog = compile(ctx.userModules[name].split('\n').map(normalize));
    const g = { vars: { __name__: V.str(name) }, parent: null, fn: false, locals: new Set() };
    const mod = { t: 'module', name, members: new Map() };
    ctx.modules[name] = mod;
    execBlock(prog, g, ctx);
    for (const k in g.vars) mod.members.set(k, g.vars[k]);
    return mod;
  }

  /* ---------- running ---------- */
  const normalize = s => s.replace(/[“”„‟″]/g, '"').replace(/[‘’‚‛′]/g, "'").replace(/ /g, ' ').replace(/\t/g, '    ');

  // opts: files (the shelf), seed (random), argv (sys.argv), input (typed lines),
  // web (pages requests.get can fetch), pytest (run the test_ functions afterwards)
  function run(rawLines, opts = {}) {
    const lines = rawLines.map(normalize);
    const ctx = newCtx();
    ctx.fs = new Map(Object.entries(opts.files || {}).map(([k, v]) => [normPath(k), v]));
    ctx.dirs = new Set();
    for (const k of ctx.fs.keys()) for (let p = parentPath(k); p !== '.'; p = parentPath(p)) ctx.dirs.add(p);
    ctx.seed = opts.seed == null ? 2026 : opts.seed;
    ctx.argv = opts.argv;
    ctx.input = (opts.input || []).slice();
    ctx.web = opts.web;
    ctx.pytest = !!opts.pytest;
    ctx.userModules = {};
    for (const [n, t] of ctx.fs) if (n.endsWith('.py')) ctx.userModules[n.slice(0, -3)] = t;
    ctx.emit = () => {};
    const files = () => Object.fromEntries(ctx.fs);
    const globals = { vars: { __name__: V.str('__main__') }, parent: null, fn: false, locals: new Set() };
    const prevCur = CUR, prevSafe = SAFE;
    CUR = ctx; SAFE = 0; OBJID = 0;
    // the spell ending closes every file, so buffered writes reach the disk
    const done = (error, extra) => { for (const f of ctx.openFiles || []) flushFile(f, ctx); return doneRaw(error, extra); };
    const doneRaw = (error, extra) => ({ trace: ctx.trace, error, output: error && error.compile ? [] : outputOf(ctx.trace), files: files(), hits: ctx.hits, unordered: !!ctx.unordered, finalEnv: snapshot(globals), ...extra });
    try {
      let prog;
      try { prog = compile(lines); }
      catch (err) {
        // never let a confusing line freeze the game: report it like Python would
        if (!(err instanceof PyError)) err = new PyError('SyntaxError', 'invalid syntax', 0);
        const error = { type: err.pyType, msg: err.message, line: err.line ?? 0, compile: true };
        ctx.trace.push({ kind: 'error', ...error });
        return done(error);
      }
      try {
        execBlock(prog, globals, ctx);
        if (ctx.pytest) return done(null, { tests: runTests(globals, ctx) });
      } catch (err) {
        if (err instanceof RangeError) err = new PyError('RecursionError', 'maximum recursion depth exceeded');
        if (err instanceof Signal) err = new PyError('SyntaxError', `'${err.kind}' outside ${err.kind === 'return' ? 'function' : 'loop'}`);
        if (!(err instanceof PyError)) { const e2 = new PyError('SpellError', 'the spellbook could not work out this spell'); e2.line = err.line; err = e2; }
        // sys.exit("message") ends the spell and shows the message
        if (err.pyType === 'SystemExit') {
          const a = err.exitArg;
          if (a && a.t !== 'NoneType' && a.t !== 'int') { const text = fmt(a); ctx.trace.push({ kind: 'print', line: err.line ?? 0, text, raw: text + '\n', stderr: true }); }
          ctx.trace.push({ kind: 'cond', line: err.line ?? 0, value: false, label: 'exit' });
          return done(null, { exited: true });
        }
        const error = { type: err.pyType, msg: err.message, line: err.line ?? 0 };
        ctx.trace.push({ kind: 'error', ...error });
        return done(error);
      }
      return done(null);
    } finally { CUR = prevCur; SAFE = prevSafe; }
  }
  // like running pytest on the file: every test_ function, in order
  function runTests(globals, ctx) {
    const names = Object.keys(globals.vars).filter(k => k.startsWith('test_') && globals.vars[k].t === 'function');
    const results = [];
    for (const name of names) {
      const fn = globals.vars[name];
      ctx.emit = ev => ctx.trace.push({ ...ev, line: fn.line });
      try {
        callFunction(fn, [], {}, ctx);
        results.push({ name, ok: true });
        ctx.trace.push({ kind: 'print', line: fn.line, text: `${name} PASSED`, raw: `${name} PASSED\n`, test: 'pass' });
      } catch (err) {
        if (err instanceof Signal) continue;
        if (!(err instanceof PyError) || err.pyType === 'SpellTimeout' || err.pyType === 'SyntaxError') throw err;
        const why = err.pyType === 'AssertionError' ? (err.message ? `AssertionError: ${err.message}` : err.detail || 'assert failed') : `${err.pyType}: ${err.message}`;
        results.push({ name, ok: false, why });
        ctx.trace.push({ kind: 'error-caught', line: err.line ?? fn.line, type: err.pyType, msg: why });
        ctx.trace.push({ kind: 'print', line: fn.line, text: `${name} FAILED - ${why}`, raw: `${name} FAILED - ${why}\n`, test: 'fail' });
      }
    }
    const f = results.filter(r => !r.ok).length, p = results.length - f;
    const sum = !results.length ? 'no tests ran' : [f && `${f} failed`, p && `${p} passed`].filter(Boolean).join(', ');
    ctx.trace.push({ kind: 'print', line: 0, text: `== ${sum} ==`, raw: `== ${sum} ==\n`, test: 'summary' });
    return results;
  }

  function outputOf(trace) {
    const all = trace.filter(e => e.kind === 'print').map(e => e.raw).join('');
    if (!all) return [];
    const parts = all.split('\n');
    if (parts[parts.length - 1] === '') parts.pop();
    return parts;
  }

  // Beginner-friendly translation shown under the real error.
  function explain(err) {
    const m = /name '(.+)' is not defined/.exec(err.msg);
    const M = err.msg;
    switch (err.type) {
      case 'NameError':
        return `Python looked for a jar named ${m ? m[1] : 'that'} and found nothing. Words without quotes are names. Did you forget quotes, misspell it, or use it before creating it?`;
      case 'UnboundLocalError': return 'Inside a function, this name is assigned somewhere, so Python treats it as the function\'s own jar. You read it before giving it a value. Pass it in as a parameter instead.';
      case 'TypeError':
        if (/concatenate str/.test(M)) return 'You tried to glue a string and a number with +. Turn the number into a string with str() first, or use an f-string.';
        if (/concatenate list/.test(M)) return 'A list can only be joined with another list. To add one item, use append().';
        if (/invalid keyword argument/.test(M)) return 'A single = inside brackets is not a comparison. Use == to compare two values.';
        if (/not supported between/.test(M)) return 'Python cannot order these two kinds of values. Compare numbers with numbers, and text with text.';
        if (/NoneType/.test(M)) return 'Something gave back None. If it came from your function, did you forget to return a value?';
        if (/missing \d+ required positional/.test(M)) return 'The function needs more values in its brackets. Count the parameters in its def line.';
        if (/positional arguments? but/.test(M)) return 'You gave the function more values than its def line asks for.';
        if (/unsupported operand/.test(M)) return 'Those two kinds of values cannot be combined with that sign.';
        if (/cast\(\) power/.test(M)) return 'Spell power has to be a real number, not text in quotes.';
        if (/multiply sequence/.test(M)) return 'You can repeat a string or list by a whole number, but not by anything else.';
        if (/indices must be integers/.test(M)) return 'The position inside [ ] must be a whole number. For dictionaries, use the key itself.';
        if (/has no len/.test(M)) return 'len() counts items in strings, lists and dictionaries. Numbers have no length.';
        if (/not subscriptable/.test(M)) return 'Square brackets pick items out of strings, lists and dictionaries. This value is none of those.';
        if (/not iterable/.test(M)) return 'for loops and in need something with items inside, like a string, list, range or dictionary.';
        if (/unhashable/.test(M)) return 'Dictionary keys must be fixed values like strings or numbers. A list can change, so it cannot be a key.';
        if (/does not support item assignment/.test(M)) return 'Strings and tuples cannot be changed in place. Build a new one instead.';
        if (/cannot be interpreted as an integer/.test(M)) return 'range() and positions need whole numbers, not text or decimals.';
        if (/not callable/.test(M)) return 'You put brackets after something that is not a function. Did a jar take a function\'s name?';
        if (/takes|expected|given/.test(M)) return 'This function or method got the wrong number of values inside its brackets.';
        return 'A value of the wrong type was used here.';
      case 'AttributeError': return 'That method does not exist for this kind of value. Check the spelling, and which type you have: string, list or dictionary.';
      case 'IndexError': return 'That position is past the end. The last position is the length minus 1, or use -1.';
      case 'KeyError': return 'That key is not in the dictionary. Check the spelling, or use .get() to supply a fallback.';
      case 'ValueError':
        if (/unpack/.test(M)) return 'The number of names on the left must match the number of values on the right.';
        if (/not in list/.test(M)) return 'That value is not in the list. Check with in before removing or searching.';
        if (/invalid literal|could not convert/.test(M)) return 'That text does not look like a number, so it cannot be converted.';
        if (/empty/.test(M)) return 'There is nothing in it to choose from.';
        return 'The type was right, but the value itself was not acceptable.';
      case 'RecursionError': return 'A function kept calling itself and never stopped. Every recursive function needs a case that does not call itself.';
      case 'SpellTimeout': return 'Real Python would just keep running forever. Check that your while condition can become False.';
      case 'IndentationError':
        if (/expected an indented block/.test(M)) return 'The lines under if, for, while, def, try and else must be pushed right by 4 spaces.';
        if (/unindent does not match/.test(M)) return 'This line is indented by a different amount than the lines around it. Inside a block, use exactly 4 spaces per level.';
        return 'This line starts with spaces, but nothing above it opens a block.';
      case 'SyntaxError':
        if (/expected ':'/.test(M)) return 'Lines that open a block (if, for, while, def, try, else) must end with a colon.';
        if (/meant '=='/.test(M)) return 'One = stores a value. Two == ask whether two values are equal.';
        if (/outside loop/.test(M)) return 'break and continue only work inside a for or while loop.';
        if (/outside function/.test(M)) return 'return only works inside a function made with def.';
        if (/f-string/.test(M)) return 'Inside an f-string, every { needs a matching } with a name or expression between them.';
        if (/invalid character/.test(M)) return 'That symbol is not part of Python here. Check for stray punctuation.';
        if (/later world|uses == for now/.test(M)) return 'Good instinct! That is real Python you will meet later.';
        if (/except' or 'finally/.test(M)) return 'A try block must be followed by at least one except or finally.';
        return 'Python could not read this line. Check quotes, brackets, colons and commas.';
      case 'ZeroDivisionError': return 'Even magic cannot divide by zero.';
      case 'RuntimeError':
        if (/super/.test(M)) return 'super() works inside a method of a class that inherits from another class.';
        if (/StopIteration/.test(M)) return 'A generator ran out of values. Use a for loop, or give next() a default.';
        return 'Something went wrong while the spell was running.';
      case 'AssertionError': return 'An assert checked something that turned out False. Asserts are how tests say "this must be true".';
      case 'StopIteration': return 'The iterator has no more values. A for loop stops quietly here; next() raises this instead.';
      case 'ModuleNotFoundError': return 'There is no library by that name. Check the spelling: random, math, statistics, json, csv, sys, re.';
      case 'ImportError': return 'The library exists, but it has nothing by that name. Check the spelling after import.';
      case 'EOFError': return 'input() wanted another typed line, but there was nothing left to read.';
      case 'PatternError': return 'The regular expression itself is broken. Check brackets, and escape special characters with a backslash.';
      case 'JSONDecodeError': return 'That text is not valid JSON. JSON needs double quotes around keys and strings.';
      case 'StatisticsError': return 'There is no data to work with. The list was empty.';
      case 'Failed': return 'pytest.raises expected an error, but the code inside ran without one.';
      case 'NotImplementedError': return 'A method meant to be filled in by a child class was called on the parent.';
      case 'ConnectionError': return 'That web address is not one this spell can reach.';
      case 'SpellError': return 'This is a gap in the game, not your fault. Real Python would give a clearer error. Try writing the spell a different way.';
      default: return /Error$/.test(err.type) && !EXC.includes(err.type) ? `${err.type} is an exception your own code defined and raised.` : '';
    }
  }

  // For syntax colouring in the spellbook.
  function highlight(src) {
    const re = /([rRfF]{0,2}"(?:[^"\\]|\\.)*"?|[rRfF]{0,2}'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|\b(print|str|int|float|bool|len|cast|range|sum|max|min|sorted|abs|round|list|tuple|dict|set|type|enumerate|input|isinstance|zip|map|filter|any|all|iter|next|reversed|super|property|classmethod|staticmethod|hasattr|getattr|setattr|open)\b|\b(fireball|spark|icebolt)\b|\.([A-Za-z_]\w*)|\b(True|False|None|self|cls)\b|\b(if|elif|else|and|or|not|in|is|for|while|break|continue|pass|def|return|try|except|finally|raise|del|as|class|import|from|lambda|yield|assert|with)\b|\b([A-Z]\w*Error|Exception|StopIteration)\b|(==|!=|<=|>=|:=|->|\/\/|\*\*|[+\-*/=%<>@|&^])/g;
    const escH = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += escH(src.slice(last, m.index));
      if (m[5]) out += `.<span class="t-fn">${escH(m[5])}</span>`;
      else {
        const cls = m[1] ? 't-str' : m[2] ? 't-num' : m[3] ? 't-fn' : m[4] ? 't-spell' : m[6] ? 't-num' : m[7] ? 't-kw' : m[8] ? 't-spell' : 't-op';
        out += `<span class="${cls}">${escH(m[0])}</span>`;
      }
      last = re.lastIndex;
    }
    return out + escH(src.slice(last));
  }

  return { run, fmt, show, repr, explain, highlight, truthy, compile: lines => compile(lines.map(normalize)) };
})();
