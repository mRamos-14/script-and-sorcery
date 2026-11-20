// Stress-tests the Training grounds generator: node tools/check-arena.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const m = { exports: {} };
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
// world files add their own question pools, so load them too
new Function('module', FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + ';module.exports={Py,Arena};')(m);
const { Py, Arena } = m.exports;
let bad = 0;
for (const [tag, gen] of Object.entries(Arena.GEN)) {
  const errs = {};
  let errorAnswers = 0;
  for (let i = 0; i < 3000; i++) {
    const q = gen(1 + (i % 12));
    const r = Py.run(q.code, { files: q.files, argv: q.argv, input: q.input, web: q.web, pytest: q.pytest });
    if (r.unordered) errs["set order"] = (errs["set order"] || 0) + 1;
    const truth = /Which error/.test(q.text) ? (r.error ? r.error.type : 'No error') : r.error ? 'Error' : r.output.join('\n');
    const problem =
      q.choices.length !== 3 ? 'not 3 choices' :
      new Set(q.choices).size !== 3 ? 'duplicate choices ' + JSON.stringify(q.choices) :
      q.choices[q.answer] !== truth ? `answer ${q.choices[q.answer]} != ${truth}` : null;
    if (truth === 'Error') errorAnswers++;
    if (problem) { errs[problem] = (errs[problem] || 0) + 1; if (Object.keys(errs).length < 3 && errs[problem] === 1) console.log(`  ${tag}: ${problem}  code=${JSON.stringify(q.code)}`); }
  }
  const n = Object.values(errs).reduce((a, b) => a + b, 0);
  bad += n;
  console.log(`${tag.padEnd(8)} ${n ? '✗ ' + n + ' bad' : 'ok'}  (${Math.round(errorAnswers / 30)}% have Error as the answer)`);
}
process.exit(bad ? 1 : 0);
