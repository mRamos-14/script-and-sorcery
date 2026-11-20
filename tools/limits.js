// Lists lesson programs that hit the game limits (timeouts, recursion depth).
//   node tools/limits.js 19-
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, "..");
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} }; new Function('module', 'require', src)(m, require);
const { Py, Engine, WORLDS } = m.exports;
const pre = process.argv[2];
for (const w of WORLDS) for (const lv of w.levels) {
  if (!lv.id.startsWith(pre)) continue;
  for (let seed = 1; seed <= 5; seed++) {
    const R = Engine.makeR(seed * 7919);
    const foe = lv.foe ? (typeof lv.foe === 'function' ? lv.foe(R) : { ...lv.foe }) : null;
    lv.steps.forEach((raw, k) => {
      let st; try { st = Engine.instantiate(raw, { R, hero: 'X', foe }); } catch (e) { return; }
      const codes = [];
      if (st.code) codes.push(st.code);
      if (st.type === 'write') codes.push([...st.starter, ...st.solution]);
      if (st.type === 'fill') codes.push(Engine.fillProgram(st.lines, st.answer[0]));
      for (const c of codes) { const r = Py.run(c, Engine.runOpts(st)); if (r.error && ['SpellTimeout', 'RecursionError'].includes(r.error.type)) console.log(lv.id, 'step', k, r.error.type, '|', c[0]); }
    });
  }
}
