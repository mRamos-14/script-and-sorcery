// Local test helper: plays the current level with the correct answers.
// Load in the browser on http://localhost:5252/?debug, then: await playLevel('4-3')
window.playLevel = async function (id) {
  const G = window.__game;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const main = () => document.querySelector('#btn-main');
  const waitCont = async () => { for (let t = 0; t < 900; t++) { if (main().textContent === 'Continue') return true; await sleep(100); } return false; };
  const outs = () => [...document.querySelectorAll('#console .out')].map(e => e.textContent).join('|').slice(0, 70);
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
    if (st.type === 'predict') {
      if (st.typed) { document.querySelector('#typed-answer').value = st.choices[st.answer]; main().click(); }
      else document.querySelectorAll('.choice')[st.answer].click();
      await waitCont();
      log.push(`${k} predict${st.format ? "[" + st.format + "]" : ""} ${document.querySelector('#talk').dataset.tone} [${st.choices.join(' | ').slice(0, 90)}]${st.reward ? ' hp=' + document.querySelector('#foe-hp').textContent : ''}`);
      main().click(); continue;
    }
    if (st.type === 'fill') {
      for (const v of st.answer[0]) {
        const c = [...document.querySelectorAll('.chip')].find(x => x.dataset.c === v);
        if (!c) { log.push(`${k} MISSING CHIP ${v}`); return log; }
        c.click();
      }
      main().click();
      const ok = await waitCont();
      log.push(`${k} fill ok=${ok}${ok ? '' : ' ' + document.querySelector('#talk-text').textContent.slice(0, 90)}`);
      if (!ok) return log;
      main().click(); continue;
    }
    if (st.type === 'fix') {
      main().click();
      for (let t = 0; t < 600 && main().textContent !== 'Tap a line'; t++) await sleep(100);
      document.querySelectorAll('#code .ln')[st.bad].click();
      await sleep(50);
      if (st.typedFix) { document.querySelector('#fix-line').value = st.options[st.answer]; main().click(); }
      else document.querySelectorAll('.choice')[st.answer].click();
      const ok = await waitCont();
      log.push(`${k} fix ok=${ok}${ok ? '' : ' ' + document.querySelector('#talk-text').textContent.slice(0, 90)}`);
      if (!ok) return log;
      main().click(); continue;
    }
    if (st.type === 'write') {
      document.querySelector('#ta').value = st.solution.join('\n');
      main().click();
      const ok = await waitCont();
      log.push(`${k} write ok=${ok}${ok ? '' : ' ' + document.querySelector('#talk-text').textContent.slice(0, 90)}`);
      if (!ok) return log;
      main().click(); continue;
    }
    if (st.type === 'order') {
      for (const line of st.code) { const b = [...document.querySelectorAll('.order-piece')].find(x => x.getAttribute('aria-label') === 'Add line: ' + line); if (!b) { log.push(k + ' MISSING PIECE ' + line); return log; } b.click(); await sleep(10); }
      main().click();
      const ok = await waitCont();
      log.push(`${k} order ok=${ok}${ok ? '' : ' ' + document.querySelector('#talk-text').textContent.slice(0, 90)}`);
      if (!ok) return log;
      main().click(); continue;
    }
    log.push('unknown step ' + st.type); break;
  }
  await sleep(300);
  log.push(`RESULT ${id}: ${document.querySelector('#res-title').textContent} ${document.querySelector('#res-stars').getAttribute('aria-label') || ''}`);
  return log;
};
