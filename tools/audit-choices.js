// Flags predict steps whose wrong choices are too easy (generic fallbacks).
// node tools/audit-choices.js [levelPrefix]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} }; new Function('module', src)(m);
const { Py, Engine, WORLDS } = m.exports;
const ONLY = process.argv[2] || '';
let flagged = 0;
for (const w of WORLDS) for (const lv of w.levels) {
  if (ONLY && !lv.id.startsWith(ONLY)) continue;
  lv.steps.forEach((raw, k) => {
    const pools = raw.oneOf ? raw.oneOf.map(o => ({ ...raw, ...o, oneOf: undefined })) : [raw];
    pools.forEach((r, pi) => {
      if (r.type !== 'predict' || r.measure === 'errtype' || r.answer != null) return;
      let weak = 0;
      for (let seed = 1; seed <= 6; seed++) {
        const foe = lv.foe ? (typeof lv.foe === 'function' ? lv.foe(Engine.makeR(seed)) : { ...lv.foe }) : null;
        const st = Engine.instantiate(r, { R: Engine.makeR(seed * 31 + k), hero: 'Pip', foe });
        const right = st.choices[st.answer];
        const wrongs = st.choices.filter((_, i) => i !== st.answer);
        const generic = wrongs.filter(x => x === 'Error' || x === 'Nothing' || x === 'None' || x === `"${right}"`).length;
        if (generic >= 2 || (generic === 1 && right !== 'Error' && wrongs.some(x => x === `"${right}"`))) weak++;
      }
      if (weak >= 3) { flagged++; console.log(`${lv.id} step ${k}${raw.oneOf ? ' pool ' + pi : ''}: weak choices in ${weak}/6 (${r.text.slice(0, 50)})`); }
    });
  });
}
console.log(flagged + ' steps flagged');
