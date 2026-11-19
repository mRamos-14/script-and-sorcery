/* Script & Sorcery: the variation engine.
   Every time a step is played it is rebuilt from its template:
   - vars(R, ctx) rolls fresh numbers, words and names. Strings use $name or $(expression).
   - Correct answers and goals are computed by running the code, never typed by hand.
   - Wrong choices come from a misconception simulator: it makes the classic
     beginner mistakes to the spell (flip a comparison, swap + and *, off-by-one,
     forget the f, move a line out of a block...) and runs each mutant.
   - Choices, chips and fix options are shuffled. */
const Engine = (() => {
  'use strict';

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const WORDS = ['dragon', 'potion', 'wizard', 'castle', 'goblin', 'scroll', 'ember', 'frost', 'rune', 'tower', 'lantern', 'crystal', 'shield', 'raven', 'meadow', 'comet'];
  const NAMES = ['Ada', 'Wren', 'Mira', 'Quill', 'Brin', 'Hazel', 'Rowan', 'Ash', 'Vey', 'Juno', 'Pip', 'Oren'];
  const ITEMS = ['potion', 'map', 'key', 'torch', 'rope', 'gem', 'scroll', 'herb', 'shield', 'lamp'];
  const SPELLS = ['fireball', 'icebolt', 'spark'];

  function makeR(seed) {
    const rand = seed == null ? Math.random : mulberry32(seed);
    const R = {
      rand,
      int: (a, b) => a + Math.floor(rand() * (b - a + 1)),
      pick: a => a[Math.floor(rand() * a.length)],
      chance: p => rand() < p,
      shuffle: a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; },
      sample: (a, n) => R.shuffle(a).slice(0, n),
      word: () => R.pick(WORDS),
      words: n => R.sample(WORDS, n),
      name: () => R.pick(NAMES),
      item: () => R.pick(ITEMS),
      items: n => R.sample(ITEMS, n),
      spell: () => R.pick(SPELLS),
    };
    return R;
  }

  /* ---------- templates ---------- */
  function evalExpr(ex, vars) {
    try { return new Function(...Object.keys(vars), `return (${ex});`)(...Object.values(vars)); }
    catch (e) { return `$(${ex})`; }
  }
  const TPL = /\$\(((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)|\$([A-Za-z_]\w*)/g;
  function tpl(s, vars) {
    return s.replace(TPL, (m, ex, nm) => {
      if (nm) return Object.prototype.hasOwnProperty.call(vars, nm) ? String(vars[nm]) : m;
      return String(evalExpr(ex, vars));
    });
  }
  function deep(v, vars) {
    if (typeof v === 'string') return tpl(v, vars);
    if (Array.isArray(v)) return v.map(x => deep(x, vars));
    if (v && typeof v === 'object') { const o = {}; for (const k in v) o[tpl(k, vars)] = deep(v[k], vars); return o; }
    return v;
  }

  /* ---------- the misconception simulator ---------- */
  const STR_RE = /([fF]?"(?:[^"\\]|\\.)*"|[fF]?'(?:[^'\\]|\\.)*')/;
  const CODE_MUTS = [
    [/==|!=|<=|>=|<|>/g, { '==': ['!='], '!=': ['=='], '<=': ['<', '>'], '>=': ['>', '<'], '<': ['<=', '>'], '>': ['>=', '<'] }],
    [/\+=|-=|\*=|\*\*|\/\/|[+\-*/%]/g, { '+=': ['-=', '*='], '-=': ['+='], '*=': ['+='], '**': ['*'], '//': ['/', '%'], '/': ['//'], '+': ['*', '-'], '-': ['+'], '*': ['+', '**'], '%': ['//'] }],
    [/\b(and|or)\b/g, { and: 'or', or: 'and' }],
    [/\bnot\s+/g, () => ''],
    [/\b(break|continue)\b/g, { break: 'continue', continue: 'break' }],
    [/\.(upper|lower|title)\(\)/g, { '.upper()': '.lower()', '.lower()': '.upper()', '.title()': '.upper()' }],
    [/\.pop\(\)/g, () => '.pop(0)'],
    [/\b\d+\b/g, m => String(+m + 1)],
    [/\b[1-9]\d*\b/g, m => String(+m - 1)],
  ];
  function mutateLine(line) {
    const out = [];
    // "I thought the question meant the opposite"
    const hm = /^(\s*)(if|elif|while)\s+(.*):\s*$/.exec(line);
    if (hm) out.push(`${hm[1]}${hm[2]} not (${hm[3]}):`);
    const segs = line.split(STR_RE);
    segs.forEach((seg, si) => {
      const isStr = si % 2 === 1;
      if (isStr) {
        if (/^[fF]/.test(seg)) out.push(segs.map((s, j) => (j === si ? s.slice(1) : s)).join(''));
        return;
      }
      for (const [re, rep] of CODE_MUTS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(seg))) {
          let r = typeof rep === 'function' ? rep(m[0]) : rep[m[0]];
          if (r == null) continue;
          for (const one of [].concat(r)) {
            if (one === m[0]) continue;
            const ns = seg.slice(0, m.index) + one + seg.slice(m.index + m[0].length);
            out.push(segs.map((s, j) => (j === si ? ns : s)).join(''));
          }
          if (out.length > 60) return;
        }
      }
    });
    return out;
  }
  function mutants(lines) {
    const all = [];
    lines.forEach((ln, i) => {
      for (const m of mutateLine(ln)) all.push(lines.map((x, j) => (j === i ? m : x)));
      // a line that should be inside a block, written outside it (or the reverse)
      const ind = ln.match(/^ */)[0].length;
      const next = lines[i + 1];
      const nextInd = next == null ? -1 : next.match(/^ */)[0].length;
      if (ind >= 4 && nextInd < ind) all.push(lines.map((x, j) => (j === i ? x.slice(4) : x)));
      if (ind === 0 && i > 0 && /:\s*$/.test(lines[i - 1]) === false && (lines[i - 1] || '').match(/^ */)[0].length >= 4 && !/^(elif|else|except|finally)\b/.test(ln.trim()))
        all.push(lines.map((x, j) => (j === i ? '    ' + x : x)));
    });
    return all;
  }
  const ERR_TYPES = ['NameError', 'TypeError', 'ValueError', 'IndexError', 'KeyError', 'ZeroDivisionError', 'AttributeError', 'No error'];
  const outText = (res, measure, foe) => {
    if (measure === 'errtype') return res.error ? res.error.type : 'No error';
    if (res.error) return 'Error';
    if (measure === 'damage') return String(damageOf(res, foe));
    return res.output.join(' / ');
  };
  function damageOf(res, foe) {
    let d = 0;
    for (const e of res.trace) if (e.kind === 'cast') d += dmg(e, foe);
    return d;
  }
  const dmg = (e, foe) => (foe && foe.weak === e.spell ? e.power * 2 : foe && foe.resist === e.spell ? Math.floor(e.power / 2) : e.power);

  // the world a spell runs in: scrolls, random seed, typed input, command-line words
  const runOpts = st => ({ files: st.files, seed: st.seed, argv: st.argv, input: st.input, web: st.web, pytest: st.pytest });

  function distractors(code, correct, wrong, R, measure, foe, opts) {
    const pool = [];
    const add = s => { s = String(s); if (s && s !== correct && !pool.includes(s) && s.length <= 70) pool.push(s); };
    const explicit = [];
    (wrong || []).forEach(w => { w = String(w); if (w !== correct && !explicit.includes(w)) explicit.push(w); });
    for (const m of mutants(code)) {
      const r = Py.run(m, opts);
      if (r.error && r.error.type === 'SpellTimeout') continue;
      add(outText(r, measure, foe));
    }
    const fallbacks = [];
    if (measure === 'errtype') {
      const picked = [];
      for (const w of R.shuffle(explicit.concat(ERR_TYPES))) { if (picked.length >= 2) break; if (w !== correct && !picked.includes(w)) picked.push(w); }
      return picked;
    }
    if (correct !== 'Error') fallbacks.push('Error');
    if (correct !== 'Error' && !/^-?\d+(\.\d+)?$/.test(correct) && !/^(True|False|None)$/.test(correct) && !correct.includes(' / ')) fallbacks.push(`"${correct}"`);
    if (correct === 'True') fallbacks.push('False');
    if (correct === 'False') fallbacks.push('True');
    if (/^-?\d+$/.test(correct)) { fallbacks.push(String(+correct + 1)); fallbacks.push(String(+correct - 1)); }
    fallbacks.push('Nothing', 'None');
    const picked = [];
    for (const w of R.shuffle(explicit)) { if (picked.length < 1 && !picked.includes(w)) picked.push(w); }
    for (const w of R.shuffle(pool.filter(x => x !== 'Error'))) { if (picked.length >= 2) break; if (!picked.includes(w)) picked.push(w); }
    for (const w of R.shuffle(explicit)) { if (picked.length >= 2) break; if (!picked.includes(w)) picked.push(w); }
    for (const w of fallbacks) { if (picked.length >= 2) break; if (w !== correct && !picked.includes(w)) picked.push(w); }
    return picked;
  }

  /* ---------- steps ---------- */
  function fillProgram(lines, slots) {
    let k = 0;
    return lines.map(l => l.split('[]').map((seg, j, arr) => (j < arr.length - 1 ? seg + (slots[k++] ?? '') : seg)).join(''));
  }
  function refProgram(st) {
    if (st.type === 'fill') return fillProgram(st.lines, st.answer[0]);
    if (st.type === 'fix') { const c = st.code.slice(); c[st.bad] = st.options[st.answer]; return c; }
    if (st.type === 'write') return [...st.starter, ...st.solution];
    if (st.type === 'order') return st.code;
    return st.code;
  }

  // A review step asks a fresh Training-grounds question; a right answer casts its reward spell.
  // Tags the player keeps missing come up more often.
  function weightedTag(tags, R, weak) {
    const w = tags.map(t => 1 + Math.min(6, (weak && weak[t]) || 0));
    let r = R.rand() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < tags.length; i++) { r -= w[i]; if (r < 0) return tags[i]; }
    return tags[tags.length - 1];
  }
  function reviewStep(raw, R, ctx) {
    Arena.useRandom(R.rand);
    let q, tag;
    try { tag = weightedTag(raw.tags, R, ctx.weak); q = Arena.GEN[tag](8); } finally { Arena.useRandom(null); }
    const choices = q.choices.map(c => c.replace(/\n/g, ' / '));
    const right = choices[q.answer];
    const shuffled = R.shuffle(choices);
    const errQ = /Which error/.test(q.text);
    return { type: 'predict', text: errQ ? q.text : raw.text || q.text, code: q.code, choices: shuffled, answer: shuffled.indexOf(right), explain: q.explain.replace(/\n/g, ' then '), reward: raw.reward, measure: errQ ? 'errtype' : undefined, files: q.files, input: q.input, argv: q.argv, web: q.web, pytest: q.pytest, tag, vars: {} };
  }

  /* ---------- remixing: one lesson, many kinds of question ----------
     A predict step can come back as: which jar holds what at the end (trace),
     how many times a line runs (count), which of three spells prints this (whichcode),
     put the shuffled lines back in order (order), or find the miscopied line (spot). */
  const FORMATS = ['trace', 'count', 'whichcode', 'order', 'spot'];
  const JAR_TYPES = ['int', 'float', 'str', 'bool', 'list', 'tuple', 'NoneType'];
  function remixTrace(st, res, R) {
    const fin = res.finalEnv || {};
    const assigned = {};
    for (const e of res.trace) if (e.kind === 'assign' && e.name && e.env && e.env[e.name]) (assigned[e.name] = assigned[e.name] || []).push(e.env[e.name].text);
    for (const e of res.trace) if (e.kind === 'iter' && e.name && e.env && e.env[e.name]) (assigned[e.name] = assigned[e.name] || []).push(e.env[e.name].text);
    const names = Object.keys(fin).filter(k => JAR_TYPES.includes(fin[k].t) && fin[k].text.length <= 34 && (assigned[k] || []).length >= 1);
    // prefer jars that changed while the spell ran
    const changing = names.filter(k => new Set(assigned[k]).size >= 2);
    const pickFrom = changing.length ? changing : names;
    for (const name of R.shuffle(pickFrom)) {
      const right = fin[name].text;
      const wrong = new Set();
      for (const t of assigned[name] || []) if (t !== right) wrong.add(t);
      for (const m of R.shuffle(mutants(st.code)).slice(0, 30)) {
        const r = Py.run(m, runOpts(st));
        if (r.error || !r.finalEnv || !r.finalEnv[name]) continue;
        if (r.finalEnv[name].text !== right && r.finalEnv[name].text.length <= 34) wrong.add(r.finalEnv[name].text);
      }
      if (/^-?\d+$/.test(right)) { wrong.add(String(+right + 1)); wrong.add(String(+right - 1)); }
      const ws = R.shuffle([...wrong]).slice(0, 2);
      if (ws.length < 2) continue;
      const choices = R.shuffle([right, ...ws]);
      return { ...st, format: 'trace', traceVar: name, text: `Trace it in your head. When the spell ends, what is in the jar ${name}?`, choices, answer: choices.indexOf(right), explain: `When the spell ends, ${name} holds ${right}.`, wrong: undefined };
    }
    return null;
  }
  function remixCount(st, res, R) {
    const hits = res.hits || {};
    const lines = st.code.map((l, i) => i).filter(i => (hits[i] || 0) >= 2 && /^\s{4,}\S/.test(st.code[i]) && !/^\s*(else|elif|except|finally)\b/.test(st.code[i].trim()));
    if (!lines.length) return null;
    const line = R.pick(lines), n = hits[line];
    const wrong = new Set([n + 1, n - 1, n * 2, ...Object.values(hits)].filter(x => x !== n && x >= 0));
    const ws = R.shuffle([...wrong]).slice(0, 2).map(String);
    if (ws.length < 2) return null;
    const choices = R.shuffle([String(n), ...ws]);
    return { ...st, format: 'count', text: `Count the rounds. How many times does line ${line + 1} run?`, mark: line, choices, answer: choices.indexOf(String(n)), explain: `Line ${line + 1} runs ${n} time${n === 1 ? '' : 's'}.`, wrong: undefined };
  }
  function remixWhich(st, res, R) {
    if (st.code.length > 6 || !res.output.length) return null;
    const want = res.output.join(' / ');
    if (want.length > 60) return null;
    const outs = new Set([want]);
    const picks = [];
    for (const m of R.shuffle(mutants(st.code))) {
      const r = Py.run(m, runOpts(st));
      if (r.error) continue;
      const o = r.output.join(' / ');
      if (!o || outs.has(o)) continue;
      outs.add(o);
      picks.push(m);
      if (picks.length === 2) break;
    }
    if (picks.length < 2) return null;
    const progs = R.shuffle([st.code, ...picks]);
    return { ...st, format: 'whichcode', text: 'Which spell makes the spellbook say this?', want: res.output, codeChoices: progs, choices: progs.map(p => p.join('\n')), answer: progs.indexOf(st.code), explain: `Only that spell says ${want}.`, wrong: undefined };
  }
  function remixOrder(st, res, R) {
    const n = st.code.length;
    if (n < 3 || n > 8 || !res.output.length) return null;
    let order = null;
    for (let tries = 0; tries < 8; tries++) {
      const o = R.shuffle(st.code.map((_, i) => i));
      const prog = o.map(i => st.code[i]);
      const r = Py.run(prog, runOpts(st));
      // the jumbled spell must not already work
      if (r.error || r.output.join('\n') !== res.output.join('\n')) { order = o; break; }
    }
    if (!order) return null;
    return { ...st, type: 'order', format: 'order', text: 'The spell pages got shuffled! Tap the lines in the right order.', pieces: order.map(i => st.code[i]), goal: { output: res.output }, explain: `In order, it says ${res.output.join(' / ')}.` };
  }
  function remixSpot(st, res, R) {
    if (!res.output.length) return null;
    const want = res.output.join('\n');
    const lines = R.shuffle(st.code.map((_, i) => i));
    for (const i of lines) {
      const muts = R.shuffle([...new Set(mutateLine(st.code[i]))].filter(m => m !== st.code[i]));
      const differs = m => { const c = st.code.slice(); c[i] = m; const r = Py.run(c, runOpts(st)); return !(r.error && r.error.type === 'SpellTimeout') && (r.error || r.output.join('\n') !== want); };
      const bad = muts.filter(differs);
      if (bad.length < 3) continue;
      const code = st.code.slice();
      code[i] = bad[0];
      const options = R.shuffle([st.code[i], bad[1], bad[2]]);
      return { type: 'fix', format: 'spot', files: st.files, seed: st.seed, input: st.input, argv: st.argv, web: st.web, pytest: st.pytest, vars: st.vars, text: `This spell should make the spellbook say ${res.output.join(' / ')}. One line was miscopied. Run it, then tap the broken line.`, code, bad: i, options, answer: options.indexOf(st.code[i]), goal: { output: res.output }, explain: `Line ${i + 1} should be: ${st.code[i].trim()}` };
    }
    return null;
  }
  const REMIX = { trace: remixTrace, count: remixCount, whichcode: remixWhich, order: remixOrder, spot: remixSpot };
  function remix(st, R, ctx) {
    if (st.type !== 'predict' || st.noRemix || st.measure || st.reward || st.given) return st;
    const forced = ctx.format;
    if (!forced && !(R.rand() < (ctx.remix || 0))) return st;
    const res = Py.run(st.code, runOpts(st));
    if (res.error || res.unordered) return st;
    for (const f of forced ? [forced] : R.shuffle(FORMATS)) {
      if (forced === 'classic') return st;
      const out = REMIX[f](st, res, R);
      if (out) return out;
    }
    return st;
  }

  /* ---------- hard mode: chips become typing ---------- */
  function hardFill(st) {
    const filled = fillProgram(st.lines, st.answer[0]);
    const first = st.lines.findIndex(l => l.includes('[]'));
    const starter = filled.slice(0, first), solution = filled.slice(first);
    const template = st.lines.slice(first).map(l => l.replace(/\[\]/g, '___'));
    const toks = new Set(st.chips);
    for (const l of solution) for (const t of l.trim().match(/[A-Za-z_]\w*|"[^"]*"|'[^']*'|\d+(?:\.\d+)?|==|!=|<=|>=|\+=|-=|\*\*|\/\/|[()[\]{}:,.+\-*/%=<>]/g) || []) toks.add(t);
    const keys = [...toks].slice(0, 22);
    return { ...st, type: 'write', format: 'hard', text: `${st.text} Hard mode: type ${solution.length === 1 ? 'the line' : 'these lines'} yourself.`, starter, solution, keys, hints: [template.join(' / '), ...(st.hints || [])], require: undefined };
  }

  function instantiate(raw, ctx) {
    const R = ctx.R || makeR();
    // scenario pools: a step can be one of several different situations
    if (raw.oneOf) { const { oneOf, ...rest } = raw; raw = { ...rest, ...R.pick(oneOf) }; }
    if (raw.type === 'review') return reviewStep(raw, R, ctx);
    const hero = ctx.hero || 'Pip';
    const foe = ctx.foe || null;
    const base = { NAME: hero, NAME_UP: hero.toUpperCase(), HP: foe ? foe.hp : 0 };
    const vars = Object.assign(base, raw.vars ? raw.vars(R, { ...ctx, foe }) : {});
    const plain = {};
    for (const k in raw) if (k !== 'vars') plain[k] = raw[k];
    // fill $vars, then the older {NAME} tokens; functions pass through untouched
    let st = deep2(deep(plain, vars), s => s.replace(/\{NAME_UP\}/g, hero.toUpperCase()).replace(/\{NAME\}/g, hero));
    st.vars = vars;
    if (st.seed == null) st.seed = R.int(1, 999983);
    if (typeof st.spawn === 'function') st.spawn = st.spawn(vars, R);
    const curFoe = st.spawn ? { ...st.spawn } : foe;

    if (st.type === 'predict') {
      if (st.answer == null) {
        const res = Py.run(st.code, runOpts(st));
        const correct = outText(res, st.measure, curFoe);
        const wrongs = distractors(st.code, correct, st.wrong, R, st.measure, curFoe, runOpts(st));
        st.choices = R.shuffle([correct, ...wrongs]);
        st.answer = st.choices.indexOf(correct);
        if (!st.explain) st.explain = res.error ? `It crashes with ${res.error.type}: ${res.error.msg}` : `The spellbook says ${correct}.`;
      } else {
        st.given = true;
        const right = st.choices[st.answer];
        st.choices = R.shuffle(st.choices);
        st.answer = st.choices.indexOf(right);
      }
      st = remix(st, R, ctx);
    }
    if (st.type === 'fill') {
      st.chips = R.shuffle(st.chips);
      if (ctx.hard && !st.noHard) st = hardFill(st);
    }
    if (st.type === 'fix' && st.format !== 'spot') {
      const right = st.options[st.answer];
      st.options = R.shuffle(st.options);
      st.answer = st.options.indexOf(right);
    }
    if (['fill', 'fix', 'write'].includes(st.type)) {
      const g = { ...(st.goal || {}) };
      const needAuto = g.output === 'auto' || (!st.goal);
      const wantFiles = Array.isArray(g.files);
      if (needAuto || wantFiles) {
        const res = Py.run(refProgram(st), runOpts(st));
        if (needAuto) g.output = res.output;
        // file goals: the named scrolls must end up exactly as the reference spell leaves them
        if (wantFiles) { const exp = {}; for (const n of g.files) exp[n] = res.files[n]; g.files = exp; }
      }
      st.goal = g;
    }
    return st;
  }
  function deep2(v, f) {
    if (typeof v === 'string') return f(v);
    if (Array.isArray(v)) return v.map(x => deep2(x, f));
    if (v && typeof v === 'object') { const o = {}; for (const k in v) o[f(k)] = deep2(v[k], f); return o; }
    return v;
  }

  return { makeR, instantiate, refProgram, fillProgram, mutants, dmg, damageOf, tpl, runOpts, FORMATS, weightedTag, WORDS, NAMES, ITEMS };
})();
if (typeof module !== 'undefined') module.exports = Engine;
