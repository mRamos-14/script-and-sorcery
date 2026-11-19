// Verifies every level with the real interpreter, across many random variants.
// Run from the project folder:  node tools/check-levels.js [seeds]
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const FILES = ['py.js', 'arena.js', 'engine.js', 'levels.js', ...fs.readdirSync(root).filter(f => /^world\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))];
const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8').replace("if (typeof module !== 'undefined') module.exports = Engine;", '')).join('\n') + '\n;module.exports={Py,Engine,WORLDS};';
const m = { exports: {} };
new Function('module', src)(m);
const { Py, Engine, WORLDS } = m.exports;

const NLC = String.fromCharCode(10);
const SEEDS = +process.argv[2] || 40;
const ONLY = process.argv[3] || '';
const HERO = 'Marco';
let problems = 0, checked = 0;
const seen = new Set();
const bad = (lv, k, msg) => {
  const key = `${lv.id}:${k}:${msg.slice(0, 60)}`;
  if (seen.has(key)) return;
  seen.add(key); problems++;
  console.log(`  ✗ ${lv.id} step ${k}: ${msg}`);
};
const dmg = (e, foe) => Engine.dmg(e, foe);
function applyCasts(res, foe) {
  if (!foe) return;
  for (const e of res.trace) if (e.kind === 'cast') foe.hp = Math.max(0, foe.hp - dmg(e, foe));
}
function goalOk(goal, res, foe) {
  if (goal.error) return !!res.error && res.error.type === goal.error;
  if (res.error) return false;
  if (goal.output && Array.isArray(goal.output)) {
    if (res.output.length !== goal.output.length || res.output.some((o, i) => o !== goal.output[i])) return false;
  }
  if (goal.foeDown && !(foe && foe.hp <= 0)) return false;
  if (goal.files) for (const n in goal.files) if (res.files[n] !== goal.files[n]) return false;
  if (goal.foeAtMost != null && !(foe && foe.hp <= goal.foeAtMost)) return false;
  return true;
}
const leftover = s => typeof s === 'string' && /\$\(|\$[A-Za-z_]\w*|\{NAME/.test(s);
function scanLeftovers(st, lv, k) {
  const walk = (v, where) => {
    if (typeof v === 'string') { if (leftover(v)) bad(lv, k, `unfilled template in ${where}: ${v.slice(0, 70)}`); }
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`));
    else if (v && typeof v === 'object') for (const key in v) { if (key !== 'vars') { if (leftover(key)) bad(lv, k, `unfilled template in key ${key}`); walk(v[key], key); } }
  };
  walk(st, 'step');
}

function checkFormats(raw, lv, k, seed, foe) {
  for (const fmt of Engine.FORMATS) {
    const R = Engine.makeR(seed * 7907 + k * 31 + fmt.length);
    let st;
    try { st = Engine.instantiate(raw, { R, hero: HERO, foe: foe ? { ...foe } : null, format: fmt }); }
    catch (e) { bad(lv, k, `format ${fmt} threw: ${e.stack.split(String.fromCharCode(10)).slice(0, 3).join(" ")}`); continue; }
    if (st.format !== fmt) continue;
    const o = Engine.runOpts(st);
    const tag = `[${fmt}] `;
    if (st.type === 'predict') {
      if (st.choices.length !== 3 || new Set(st.choices).size !== 3) bad(lv, k, tag + 'needs 3 different choices ' + JSON.stringify(st.choices));
      const right = st.choices[st.answer];
      if (fmt === 'trace') { const r = Py.run(st.code, o); if (!r.finalEnv[st.traceVar] || r.finalEnv[st.traceVar].text !== right) bad(lv, k, tag + 'wrong answer ' + right); }
      if (fmt === 'count') { const r = Py.run(st.code, o); if (String(r.hits[st.mark] || 0) !== right) bad(lv, k, tag + 'wrong count ' + right); }
      if (fmt === 'whichcode') st.codeChoices.forEach((p, j) => { const r = Py.run(p, o); const ok = !r.error && r.output.join(NLC) === st.want.join(NLC); if (ok !== (j === st.answer)) bad(lv, k, tag + 'choice ' + j + ' ' + (ok ? 'also prints it' : 'does not print it')); });
    } else if (st.type === 'order') {
      if ([...st.pieces].sort().join(NLC) !== [...st.code].sort().join(NLC)) bad(lv, k, tag + 'pieces are not the code');
      const r = Py.run(st.code, o);
      if (!goalOk(st.goal, r, null)) bad(lv, k, tag + 'the real order fails');
    } else if (st.type === 'fix') {
      const b = Py.run(st.code, o);
      if (goalOk(st.goal, b, null)) bad(lv, k, tag + 'buggy code already works');
      st.options.forEach((opt, j) => { const c = st.code.slice(); c[st.bad] = opt; const r = Py.run(c, o); if (goalOk(st.goal, r, null) !== (j === st.answer)) bad(lv, k, tag + 'option ' + j + ' wrong: ' + opt); });
    }
  }
}
function checkHard(raw, lv, k, seed, foe) {
  const R = Engine.makeR(seed * 7919 + k * 13);
  let st;
  try { st = Engine.instantiate(raw, { R, hero: HERO, foe: foe ? { ...foe } : null, hard: true }); }
  catch (e) { bad(lv, k, 'hard mode threw: ' + e.message); return; }
  if (st.type !== 'write') return;
  const f = foe ? { ...foe } : null;
  const r = Py.run([...st.starter, ...st.solution], Engine.runOpts(st));
  applyCasts(r, f);
  if (!goalOk(st.goal, r, f)) bad(lv, k, `[hard] typed answer fails: ${r.error ? r.error.msg : r.output.join(' / ')}`);
}
for (const w of WORLDS) {
  console.log(`World ${w.id}: ${w.name}`);
  for (const lv of w.levels) {
    if (ONLY && !lv.id.startsWith(ONLY)) continue;
    let endHp = [];
    for (let seed = 1; seed <= SEEDS; seed++) {
      const R = Engine.makeR(seed * 7919 + lv.id.length);
      let foe = lv.foe ? (typeof lv.foe === 'function' ? lv.foe(R) : { ...lv.foe }) : null;
      lv.steps.forEach((raw, k) => {
        checked++;
        let st;
        try { st = Engine.instantiate(raw, { R, hero: HERO, foe: foe ? { ...foe } : null }); }
        catch (e) { bad(lv, k, 'instantiate threw: ' + e.message); return; }
        scanLeftovers(st, lv, k);
        for (const fld of ['code', 'lines', 'starter', 'solution']) {
          if (Array.isArray(st[fld]) && st[fld].some(x => typeof x === 'string' && x.includes(String.fromCharCode(10)))) bad(lv, k, `a ${fld} line contains a newline; split it into separate lines`);
        }
        if (st.spawn) foe = { ...st.spawn };
        const start = foe ? foe.hp : 0;
        const fresh = () => (foe ? { ...foe, hp: start } : null);
        const req = (input) => st.require ? st.require(input, st.vars) : null;
        if (st.type === 'demo') {
          const r = Py.run(st.code, Engine.runOpts(st)); applyCasts(r, foe);
          if (r.error && !/red error|read the red/i.test(st.text)) bad(lv, k, 'demo errors: ' + r.error.msg);
        } else if (st.type === 'predict') {
          const r = Py.run(st.code, Engine.runOpts(st));
          if (r.unordered && !st.measure) bad(lv, k, 'the answer depends on the printing order of a set (real Python varies). Use sorted().');
          if (!st.reward && seed <= 6) checkFormats(raw, lv, k, seed, foe);
          const truth = st.measure === 'errtype' ? (r.error ? r.error.type : 'No error') : r.error ? 'Error' : st.measure === 'damage' ? String(Engine.damageOf(r, foe)) : r.output.join(' / ');
          applyCasts(r, foe);
          if (st.reward && foe) foe.hp = Math.max(0, foe.hp - dmg(st.reward, foe));
          if (st.choices.length !== 3) bad(lv, k, `has ${st.choices.length} choices`);
          if (new Set(st.choices).size !== st.choices.length) bad(lv, k, 'duplicate choices ' + JSON.stringify(st.choices));
          if (st.choices[st.answer] !== truth && st.choices[st.answer] !== 'Something strange') bad(lv, k, `answer "${st.choices[st.answer]}" but code gives "${truth}" (seed ${seed})`);
          if (r.error && r.error.type === 'SpellTimeout') bad(lv, k, 'predict code times out');
        } else if (st.type === 'fill') {
          if (seed <= 4) checkHard(raw, lv, k, seed, foe);
          for (const ans of st.answer) {
            const lines = Engine.fillProgram(st.lines, ans);
            const f = fresh();
            const r = Py.run(lines, Engine.runOpts(st)); applyCasts(r, f);
            if (!goalOk(st.goal, r, f)) bad(lv, k, `fill answer ${JSON.stringify(ans)} fails: ${r.error ? r.error.msg : r.output.join(' / ')} foe=${f && f.hp} (seed ${seed})`);
            if (req(ans)) bad(lv, k, 'require rejects the answer: ' + req(ans));
            if (ans.some(a => !st.chips.includes(a))) bad(lv, k, 'answer uses a chip that is not offered: ' + JSON.stringify(ans) + ' chips ' + JSON.stringify(st.chips));
            if (foe) foe.hp = f.hp;
            break;
          }
          if (new Set(st.chips).size !== st.chips.length) bad(lv, k, 'duplicate chips ' + JSON.stringify(st.chips));
        } else if (st.type === 'fix') {
          const fb = fresh();
          const buggy = Py.run(st.code, Engine.runOpts(st)); applyCasts(buggy, fb);
          if (goalOk(st.goal, buggy, fb)) bad(lv, k, 'buggy code already meets the goal');
          const lines = st.code.slice(); lines[st.bad] = st.options[st.answer];
          const f = fresh();
          const r = Py.run(lines, Engine.runOpts(st)); applyCasts(r, f);
          if (!goalOk(st.goal, r, f)) bad(lv, k, `fix answer fails: ${r.error ? r.error.msg : r.output.join(' / ')} foe=${f && f.hp} (seed ${seed})`);
          st.options.forEach((o, j) => {
            if (j === st.answer) return;
            const l2 = st.code.slice(); l2[st.bad] = o;
            const f2 = fresh();
            const r2 = Py.run(l2, Engine.runOpts(st)); applyCasts(r2, f2);
            if (goalOk(st.goal, r2, f2)) bad(lv, k, `wrong option "${o}" also meets the goal`);
          });
          if (new Set(st.options).size !== st.options.length) bad(lv, k, 'duplicate fix options');
          if (foe) foe.hp = f.hp;
        } else if (st.type === 'write') {
          const f = fresh();
          const r = Py.run([...st.starter, ...st.solution], Engine.runOpts(st)); applyCasts(r, f);
          if (!goalOk(st.goal, r, f)) bad(lv, k, `write solution fails: ${r.error ? r.error.type + ': ' + r.error.msg : r.output.join(' / ')} foe=${f && f.hp} (seed ${seed})`);
          if (req(st.solution)) bad(lv, k, 'require rejects the solution: ' + req(st.solution));
          if (foe) foe.hp = f.hp;
        }
      });
      if (foe) endHp.push(foe.hp);
      if (foe && foe.hp > 0) bad(lv, 'end', `foe still has ${foe.hp} HP after the level (seed ${seed})`);
    }
    console.log(`  ${lv.id} ${lv.title}${endHp.length ? ` (foe ends at ${Math.max(...endHp)} HP worst case)` : ''}`);
  }
}
console.log(problems ? `\n${problems} problem(s) in ${checked} step variants` : `\nAll ${checked} step variants check out (${SEEDS} seeds per level).`);
process.exit(problems ? 1 : 0);
