// Finds questions whose random variants behave differently from each other, the sign of an
// explanation that is only true for some values (like an assert that passes when n is 2):
//  - a "Which error?" question where some variants raise a different error, or none
//  - an ordinary question where some variants crash and others do not
//   node tools/check-variants.js [seeds]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} }; new Function('module', src)(m);
const { Py, Engine, WORLDS } = m.exports;
const SEEDS = +process.argv[2] || 40;
let problems = 0, checked = 0;
for (const w of WORLDS) for (const lv of w.levels) {
  lv.steps.forEach((raw, k) => {
    if (raw.type !== 'predict' || !raw.vars) return;
    const kinds = new Map();
    for (let seed = 1; seed <= SEEDS; seed++) {
      const R = Engine.makeR(seed * 104729 + k * 31 + lv.id.length);
      let foe = null;
      try { foe = lv.foe ? (typeof lv.foe === 'function' ? lv.foe(R) : { ...lv.foe }) : null; } catch (e) { /* */ }
      let st;
      try { st = Engine.instantiate(raw, { R, hero: 'Marco', foe }); } catch (e) { continue; }
      const r = Py.run(st.code, Engine.runOpts(st));
      const kind = r.error ? r.error.type : 'no error';
      if (!kinds.has(kind)) kinds.set(kind, JSON.stringify(st.vars || {}));
      checked++;
    }
    const errtype = raw.measure === 'errtype';
    const bad = errtype ? kinds.size > 1 || kinds.has('no error') : kinds.size > 1;
    if (bad) {
      problems++;
      console.log(`${lv.id} step ${k} (${errtype ? 'which-error' : 'predict'}): ${[...kinds].map(([kd, v]) => `${kd} e.g. ${v}`).join('  |  ')}`);
    }
  });
}
console.log(`${checked} variants checked, ${problems} questions behave inconsistently`);
