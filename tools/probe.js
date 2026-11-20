// Runs Python snippets through the game's interpreter and real CPython and shows where they differ.
//   node tools/probe.js snippets.py        (snippets separated by lines that start with "# ---")
// A snippet can start with "# files: {json}" or "# input: [json]" lines for its setup.
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const src = ['py.js'].map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n') + '\n;module.exports={Py};';
const m = { exports: {} };
new Function('module', 'require', src)(m, require);
const { Py } = m.exports;
const text = fs.readFileSync(process.argv[2], 'utf8').replace(/\r/g, '');
const progs = text.split(/^# ---.*$/m).map(s => s.replace(/^\n+|\n+$/g, '')).filter(Boolean).map(s => {
  const lines = s.split('\n'); const p = { code: [], files: {}, input: [], seed: 2026 };
  for (const l of lines) {
    const mm = /^# (files|input|argv): (.*)$/.exec(l);
    if (mm) p[mm[1]] = JSON.parse(mm[2]); else p.code.push(l);
  }
  return p;
});
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'probe-'));
const inF = path.join(tmp, 'in.json'), outF = path.join(tmp, 'out.json');
fs.writeFileSync(inF, JSON.stringify(progs));
execFileSync('python', [path.join(__dirname, 'diff_harness.py'), inF, outF], { stdio: 'inherit', maxBuffer: 1 << 28 });
const py = JSON.parse(fs.readFileSync(outF, 'utf8'));
let bad = 0;
progs.forEach((p, i) => {
  let ours;
  try { ours = Py.run(p.code, { files: p.files, input: p.input, argv: p.argv, seed: p.seed }); } catch (e) { ours = { output: [], error: { type: 'CRASH', msg: e.message } }; }
  const real = py[i];
  const oe = ours.error ? ours.error.type : null;
  const same = oe === real.error && JSON.stringify(ours.output) === JSON.stringify(real.output);
  if (same) return;
  bad++;
  console.log(`\n✗ #${i}: ${p.code[0].slice(0, 70)}`);
  if (oe !== real.error) console.log(`  error:  ours ${oe}${ours.error ? ' (' + ours.error.msg + ')' : ''}  python ${real.error}`);
  if (JSON.stringify(ours.output) !== JSON.stringify(real.output)) console.log(`  ours:   ${JSON.stringify(ours.output).slice(0, 300)}\n  python: ${JSON.stringify(real.output).slice(0, 300)}`);
});
console.log(`\n${progs.length} snippets, ${bad} differ.`);
