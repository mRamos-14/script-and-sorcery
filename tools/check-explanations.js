// Puts every predict/fix explanation next to what the code really does, and flags likely mistakes:
//  E  errtype question whose explanation names a different error than the one raised
//  N  a number in the explanation that appears nowhere in the code or the output
//  Q  quoted text in the explanation that appears nowhere in the code or the output
// Most N flags are harmless working (like "3 x 4 = 12" before doubling): read them, do not just count them.
//   node tools/check-explanations.js report.txt
const fs = require('fs'), path = require('path');
const root = process.cwd();
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} }; new Function('module', src)(m);
const { Py, Engine, WORLDS } = m.exports;
const ERRS = /\b([A-Z][a-zA-Z]*(?:Error|Exception)|StopIteration|KeyboardInterrupt|FrozenInstanceError)\b/g;
const out = [];
let total = 0;
for (const w of WORLDS) for (const lv of w.levels) {
  for (let seed = 1; seed <= 3; seed++) {
    const R = Engine.makeR(seed * 7919 + lv.id.length);
    let foe = null;
    try { foe = lv.foe ? (typeof lv.foe === 'function' ? lv.foe(R) : { ...lv.foe }) : null; } catch (e) { /* */ }
    lv.steps.forEach((raw, k) => {
      if (!raw.explain || (raw.type !== 'predict' && raw.type !== 'fix')) return;
      if (seed > 1 && !raw.vars) return;
      let st;
      try { st = Engine.instantiate(raw, { R, hero: 'Marco', foe: foe ? { ...foe } : null }); } catch (e) { return; }
      total++;
      let code = st.code;
      if (st.type === 'fix') { code = st.code.slice(); code[st.bad] = st.options[st.answer]; }
      const r = Py.run(code, Engine.runOpts(st));
      const outText = (r.output || []).join('\n');
      const casts = (r.trace || []).filter(t => t.kind === 'cast').map(t => t.power).join(' ');
      const hay = code.join('\n') + '\n' + outText + '\n' + casts + '\n' + (r.error ? r.error.type + ' ' + r.error.msg : '') + '\n' + raw.text;
      const ex = st.explain || raw.explain;
      const flags = [];
      if (st.measure === 'errtype' || raw.measure === 'errtype') {
        const named = [...new Set(ex.match(ERRS) || [])];
        const actual = r.error ? r.error.type : 'no error';
        if (!named.includes(actual)) flags.push(`E(actual ${actual}; explanation names ${named.join('/') || 'nothing'})`);
      }
      for (const n of ex.match(/-?\d+(?:\.\d+)?/g) || []) {
        if (Math.abs(parseFloat(n)) <= 2) continue;
        if (!hay.includes(n.replace(/^-/, ''))) flags.push('N ' + n);
      }
      for (const q of ex.match(/"[^"]{2,40}"|'[^']{2,40}'/g) || []) {
        const inner = q.slice(1, -1);
        if (!hay.includes(inner)) flags.push('Q ' + q);
      }
      if (flags.length) out.push({ id: `${lv.id} step ${k} seed ${seed}`, flags: flags.join(' | '), explain: ex, output: r.error ? `${outText}\n!! ${r.error.type}: ${r.error.msg}` : outText, casts, code: code.join('\n') });
    });
  }
}
fs.writeFileSync(process.argv[2], out.map(o => `### ${o.id}\nFLAGS: ${o.flags}\nEXPLAIN: ${o.explain}\nOUTPUT: ${o.output}${o.casts ? '\nCASTS: ' + o.casts : ''}\nCODE:\n${o.code}\n`).join('\n'));
const errs = out.filter(o => o.flags.includes('E(')).length;
console.log(`${total} explanations checked, ${out.length} flagged (${errs} with an error-name mismatch)`);
