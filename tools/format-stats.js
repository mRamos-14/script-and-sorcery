// How often each remix format can be built for the predict steps (sanity check).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} }; new Function('module', src)(m);
const { Engine, WORLDS } = m.exports;
const stats = {}; let total = 0;
for (const w of WORLDS) for (const lv of w.levels) lv.steps.forEach((raw, k) => {
  if (raw.type !== 'predict') return;
  total++;
  for (const f of Engine.FORMATS) {
    const st = Engine.instantiate(raw, { R: Engine.makeR(k + 1), hero: 'Pip', foe: lv.foe && typeof lv.foe !== 'function' ? { ...lv.foe } : null, format: f });
    if (st.format === f) stats[f] = (stats[f] || 0) + 1;
  }
});
console.log(total, 'predict steps;', stats);
