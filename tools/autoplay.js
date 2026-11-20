// Local test helpers: play with the correct answers.
// Load in the browser on http://localhost:5252/?debug, then:
//   await playLevel('4-3')            one level
//   await playTower(true, 20)         the Daily Tower (false = Endless), up to n floors
const sleep = ms => new Promise(r => setTimeout(r, ms));
const main = () => document.querySelector('#btn-main');
const DONE_LABELS = ['Continue', 'Next floor', 'Claim the top'];
const waitCont = async () => { for (let t = 0; t < 900; t++) { if (DONE_LABELS.includes(main().textContent)) return true; await sleep(100); } return false; };
const outs = () => [...document.querySelectorAll('#console .out')].map(e => e.textContent).join('|').slice(0, 70);
const talkText = () => document.querySelector('#talk-text').textContent.slice(0, 90);

// answers the current question; returns a log line, or null when it failed
async function answerStep(st, k) {
  if (st.type === 'predict') {
    if (st.typed) { document.querySelector('#typed-answer').value = st.choices[st.answer]; main().click(); }
    else document.querySelectorAll('.choice')[st.answer].click();
    const ok = await waitCont();
    return { ok, line: `${k} predict${st.format ? '[' + st.format + ']' : ''}${st.typed ? '[typed]' : ''} ${document.querySelector('#talk').dataset.tone} [${st.choices.join(' | ').slice(0, 90)}]${st.reward ? ' hp=' + document.querySelector('#foe-hp').textContent : ''}` };
  }
  if (st.type === 'fill') {
    for (const v of st.answer[0]) {
      const c = [...document.querySelectorAll('.chip')].find(x => x.dataset.c === v);
      if (!c) return { ok: false, line: `${k} MISSING CHIP ${v}` };
      c.click();
    }
    main().click();
    const ok = await waitCont();
    return { ok, line: `${k} fill ok=${ok}${ok ? '' : ' ' + talkText()}` };
  }
  if (st.type === 'fix') {
    main().click();
    for (let t = 0; t < 600 && main().textContent !== 'Tap a line'; t++) await sleep(100);
    document.querySelectorAll('#code .ln')[st.bad].click();
    await sleep(50);
    if (st.typedFix) { document.querySelector('#fix-line').value = st.options[st.answer]; main().click(); }
    else document.querySelectorAll('.choice')[st.answer].click();
    const ok = await waitCont();
    return { ok, line: `${k} fix${st.typedFix ? '[typed]' : ''} ok=${ok}${ok ? '' : ' ' + talkText()}` };
  }
  if (st.type === 'write') {
    document.querySelector('#ta').value = st.solution.join('\n');
    main().click();
    const ok = await waitCont();
    return { ok, line: `${k} write${st.format ? '[' + st.format + ']' : ''} ok=${ok}${ok ? '' : ' ' + talkText()}` };
  }
  if (st.type === 'order') {
    for (const line of st.code) {
      const b = [...document.querySelectorAll('.order-piece')].find(x => x.getAttribute('aria-label') === 'Add line: ' + line);
      if (!b) return { ok: false, line: k + ' MISSING PIECE ' + line };
      b.click(); await sleep(10);
    }
    main().click();
    const ok = await waitCont();
    return { ok, line: `${k} order ok=${ok}${ok ? '' : ' ' + talkText()}` };
  }
  return { ok: false, line: 'unknown step ' + st.type };
}

window.playLevel = async function (id) {
  const G = window.__game;
  let wi = -1, li = -1;
  WORLDS.forEach((w, a) => w.levels.forEach((l, b) => { if (l.id === id) { wi = a; li = b; } }));
  if (wi < 0) return ['no level ' + id];
  G.startLevel(wi, li, window.__hard ? { hard: true } : {});
  await sleep(50);
  const log = [];
  for (let guard = 0; guard < 40; guard++) {
    const L = G.L();
    if (!L || !document.querySelector('#result').hidden) break;
    const st = L.st, k = L.idx;
    if (st.type === 'talk') { main().click(); await sleep(20); continue; }
    if (st.type === 'demo') { main().click(); await waitCont(); log.push(`${k} demo: ${outs()}`); main().click(); continue; }
    const r = await answerStep(st, k);
    log.push(r.line);
    if (!r.ok) return log;
    main().click();
  }
  await sleep(300);
  log.push(`RESULT ${id}: ${document.querySelector('#res-title').textContent} ${document.querySelector('#res-stars').getAttribute('aria-label') || ''}`);
  return log;
};

window.playTower = async function (daily = true, floors = 20) {
  const G = window.__game;
  G.startTower();
  await sleep(50);
  G.beginClimb(daily);
  await sleep(50);
  const log = [];
  for (let n = 0; n < floors; n++) {
    const L = G.L();
    if (!L || !document.querySelector('#result').hidden) break;
    const r = await answerStep(L.st, `F${L.floor} ${L.def.tags.join(',')} ${L.cur ? G.tierOf(L.cur.t) : ''}`);
    log.push(r.line);
    if (!r.ok) return log;
    await sleep(100);
    if (n < floors - 1 || main().textContent === 'Claim the top') main().click();
    await sleep(100);
  }
  await sleep(300);
  if (!document.querySelector('#result').hidden) log.push(`RESULT: ${document.querySelector('#res-title').textContent} · ${document.querySelector('#res-note').textContent}`);
  return log;
};
