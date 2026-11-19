// Throws broken versions of every level's spells at the interpreter and reports any
// JavaScript crash (a crash would freeze the game instead of showing a Python error).
// node tools/fuzz.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} }; new Function('module', src)(m);
const { Py, Engine, WORLDS } = m.exports;
const R = Engine.makeR(7);
const seen = new Map();
let runs = 0;
const tryRun = (code, opts, where) => {
  runs++;
  try { Py.run(code, opts); }
  catch (e) {
    const key = e.message.split('\n')[0];
    if (!seen.has(key)) seen.set(key, { where, code, stack: e.stack.split('\n').slice(0, 4).join(' | ') });
  }
};
// typo-style damage a learner might do while typing
const damage = line => {
  const out = [];
  const cuts = ['(', ')', ':', '"', ',', '.', '[', ']', 'self.', 'self', '=', '*', 'return ', '()'];
  for (const c of cuts) { const i = line.indexOf(c); if (i >= 0) out.push(line.slice(0, i) + line.slice(i + c.length)); }
  out.push(line + '()', line + '.x', line.replace(/\w+/, 'zz'), '    ' + line, line.trim(), line + ' + 1', line.replace(/\(/, '(*'), line.replace(/\(/, '(**'));
  return out;
};
for (const w of WORLDS) for (const lv of w.levels) lv.steps.forEach((raw, k) => {
  if (!['predict', 'demo', 'fill', 'fix', 'write'].includes(raw.type) && !raw.oneOf) return;
  let st;
  try { st = Engine.instantiate(raw, { R, hero: 'Pip', foe: lv.foe && typeof lv.foe !== 'function' ? { ...lv.foe } : null }); } catch (e) { return; }
  const code = Engine.refProgram(st) || st.code;
  if (!code) return;
  const opts = Engine.runOpts(st), where = `${lv.id} step ${k}`;
  for (const mu of Engine.mutants(code)) tryRun(mu, opts, where);
  code.forEach((ln, i) => {
    for (const d of damage(ln)) tryRun(code.map((x, j) => (j === i ? d : x)), opts, where);
    tryRun(code.filter((_, j) => j !== i), opts, where);
    tryRun([...code.slice(0, i + 1), ln, ...code.slice(i + 1)], opts, where);
  });
});
console.log(`${runs} broken spells run, ${seen.size} different crashes`);
for (const [msg, v] of seen) console.log(`\n✗ ${msg}\n  at ${v.where}\n  ${v.stack}\n  code: ${v.code.join(' ⏎ ').slice(0, 300)}`);
