// Checks that code shown in hints matches the step's tested solution: every code-looking piece of
// a hint (pieces split on " / ") must appear in the solution (write), the filled-in lines (fill)
// or the fixed code (fix). Prose hints (ending in . ? !) are skipped.
//   node tools/check-hints.js [seeds]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} }; new Function('module', src)(m);
const { Engine, WORLDS } = m.exports;
const SEEDS = +process.argv[2] || 3;
const norm = s => s.replace(/\s+/g, '').replace(/'/g, '"');
const seen = new Set();
let checked = 0, flagged = 0;
for (const w of WORLDS) for (const lv of w.levels) {
  const all = [];
  lv.steps.forEach((s, k) => { all.push([s, String(k)]); if (s.type === 'review' && s.pool) s.pool.forEach((p, j) => all.push([p, k + '.' + j])); });
  for (const [raw, k] of all) {
    if (!raw.hints || !['write', 'fill', 'fix'].includes(raw.type)) continue;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const R = Engine.makeR(seed * 7919 + k.length * 13 + lv.id.length);
      let foe = null; try { foe = lv.foe ? (typeof lv.foe === 'function' ? lv.foe(R) : { ...lv.foe }) : null; } catch (e) { /* */ }
      let st; try { st = Engine.instantiate(raw, { R, hero: 'Marco', foe }); } catch (e) { continue; }
      let target;
      if (st.type === 'write') target = [...(st.starter || []), ...st.solution];
      else if (st.type === 'fill') {
        const ans = (st.answer && st.answer[0]) || []; let i = 0;
        target = st.lines.map(l => l.replace(/\[\]/g, () => ans[i++] ?? '[]'));
      } else {
        target = st.code.slice(); if (st.options && st.bad != null && st.answer != null) target[st.bad] = st.options[st.answer];
      }
      const T = norm(target.join('\n'));
      for (const h of st.hints || []) for (let piece of String(h).split(/ \/ |,? then |,? and finally |,? and (?=[\w.]+ ?[(=+\-[.])|\s{2,}then\s{2,}/)) {
        piece = piece.trim().replace(/^(Then|then|Try|Use|Write|Add|Finally|an indented|Start with)\s+/, '')
          .replace(/^[A-Z][\w ]*?: (?=\S)/, '').replace(/ (twice|three times)$/, '').replace(/ \([^)]*\)$/, '');
        if (!piece || /[.?!]$/.test(piece) || !/[()=\[\]:"]/.test(piece)) continue;
        checked++;
        if (!T.includes(norm(piece).replace(/\.\.\./g, ''))) {
          const key = lv.id + ' ' + k + ' ' + raw.hints.join('|');
          if (seen.has(key)) continue; seen.add(key); flagged++;
          console.log(`${lv.id} step ${k} (${st.type}) hint piece: ${piece}\n    code: ${target.join(' ⏎ ')}`);
        }
      }
    }
  }
}
console.log(`${checked} hint pieces checked, ${flagged} steps flagged`);
