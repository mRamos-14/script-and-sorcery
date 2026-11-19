// Differential test: runs level programs, Training-grounds questions and the feature
// corpus through both the game's interpreter and real CPython, and reports differences.
//   node tools/diff-python.js [seeds] [filter]
// filter: only levels whose id starts with it (e.g. 10), or "corpus" for the corpus alone.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS,Arena};';
const m = { exports: {} };
new Function('module', src)(m);
const { Py, Engine, WORLDS, Arena } = m.exports;
const CORPUS = require('./corpus.js');

const CRLF = String.fromCharCode(13, 10), CRCRLF = String.fromCharCode(13, 13, 10);
const SEEDS = +process.argv[2] || 3;
const FILTER = process.argv[3] || '';
const progs = [];
const seen = new Set();
const add = (code, opts, where) => {
  if (!code || !code.length) return;
  if (opts.pytest || opts.web) return;
  const key = JSON.stringify([code, opts.files, opts.input, opts.argv, opts.seed]);
  if (seen.has(key)) return;
  seen.add(key);
  progs.push({ code, files: opts.files || {}, input: opts.input || [], argv: opts.argv, seed: opts.seed == null ? 2026 : opts.seed, where });
};
const optsOf = st => (Engine.runOpts ? Engine.runOpts(st) : { files: st.files });

if (FILTER !== 'corpus') {
  for (const w of WORLDS) for (const lv of w.levels) {
    if (FILTER && !lv.id.startsWith(FILTER)) continue;
    for (let seed = 1; seed <= SEEDS; seed++) {
      const R = Engine.makeR(seed * 104729 + lv.id.length);
      const foe = lv.foe ? (typeof lv.foe === 'function' ? lv.foe(R) : { ...lv.foe }) : null;
      lv.steps.forEach((raw, k) => {
        let st;
        try { st = Engine.instantiate(raw, { R, hero: 'Marco', foe: foe ? { ...foe } : null }); } catch (e) { return; }
        const o = optsOf(st), where = `${lv.id} step ${k}`;
        if (st.type === 'demo' || st.type === 'predict') add(st.code, o, where);
        if (st.type === 'predict' && seed === 1) Engine.mutants(st.code).slice(0, 6).forEach((mu, j) => add(mu, o, `${where} mutant ${j}`));
        if (st.type === 'fill') add(Engine.fillProgram(st.lines, st.answer[0]), o, where);
        if (st.type === 'fix') { add(st.code, o, where + ' (buggy)'); const c = st.code.slice(); c[st.bad] = st.options[st.answer]; add(c, o, where + ' (fixed)'); }
        if (st.type === 'write') add([...st.starter, ...st.solution], o, where);
      });
    }
  }
  Arena.useRandom(Engine.makeR(99).rand);
  for (const tag of Object.keys(Arena.GEN)) {
    if (FILTER && !(Arena.TAG_WORLD && String(Arena.TAG_WORLD[tag] || '').startsWith(FILTER))) { if (FILTER) continue; }
    for (let i = 0; i < 8; i++) { try { const q = Arena.GEN[tag](5); add(q.code, q, `arena ${tag}`); } catch (e) { console.log('arena gen threw', tag, e.message); } }
  }
  Arena.useRandom(null);
}
CORPUS.forEach((c, i) => add(c.code, c, `corpus ${i}: ${c.code[0].slice(0, 40)}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'spelldiff-'));
const inF = path.join(tmp, 'in.json'), outF = path.join(tmp, 'out.json');
fs.writeFileSync(inF, JSON.stringify(progs));
execFileSync('python', [path.join(__dirname, 'diff_harness.py'), inF, outF], { stdio: 'inherit', maxBuffer: 1 << 28 });
const py = JSON.parse(fs.readFileSync(outF, 'utf8'));

let bad = 0, skipped = 0;
progs.forEach((p, i) => {
  const ours = Py.run(p.code, { files: p.files, input: p.input, argv: p.argv, seed: p.seed });
  const real = py[i];
  const ourErr = ours.error ? ours.error.type : null;
  // differences that are on purpose: game-only rules and limits
  if (ourErr && (/spell word|later world|this spellbook/.test(ours.error.msg) || ['SpellTimeout', 'RecursionError'].includes(ourErr))) { skipped++; return; }
  if (ours.unordered) { skipped++; return; }
  if (real.error && real.error.startsWith('HarnessError')) { console.log('harness:', p.where, real.error); return; }
  const sameErr = ourErr === real.error || (ourErr === 'PatternError' && real.error === 'error');
  const norm = o => JSON.stringify(o).replace(/0x[0-9a-fA-F]+/g, '0xADDR');
  const sameOut = norm(ours.output) === norm(real.output);
  const ourFiles = Object.fromEntries(Object.entries(ours.files).filter(([n]) => !n.endsWith('.py')));
  const realFiles = Object.fromEntries(Object.entries(real.files).filter(([n]) => !n.endsWith('.py')).map(([n, t]) => [n, t.split(CRCRLF).join(CRLF)]));
  const noCR = o => JSON.stringify(o).split("\\r").join("");
  const sameFiles = noCR(Object.keys(ourFiles).sort().map(k => [k, ourFiles[k]])) === noCR(Object.keys(realFiles).sort().map(k => [k, realFiles[k]]));
  if (sameErr && sameOut && sameFiles) return;
  bad++;
  if (bad <= 60) {
    console.log(`\n✗ ${p.where}`);
    console.log('  code:   ' + p.code.join('\n          '));
    if (!sameErr) console.log(`  error:  ours ${ourErr}${ours.error ? ' (' + ours.error.msg + ')' : ''}  python ${real.error}`);
    if (!sameOut) console.log(`  output: ours ${JSON.stringify(ours.output)}\n          python ${JSON.stringify(real.output)}`);
    if (!sameFiles) console.log(`  files:  ours ${JSON.stringify(ourFiles)}\n          python ${JSON.stringify(realFiles)}`);
  }
});
console.log(`\n${progs.length} programs, ${bad} differ, ${skipped} skipped (game rules or unordered sets).`);
process.exit(bad ? 1 : 0);
