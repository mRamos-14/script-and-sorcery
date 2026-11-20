/* Script & Sorcery: screens, sprites, scene, level runner, arena and shop. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- save ---------------- */
  const SAVE_KEY = 'script-sorcery-v1';
  const DEFAULT_HERO = { name: 'Pip', hair: 1, skin: 1, robe: 0, hat: 1, gem: 0, hatStyle: 'wizard', pet: 'none' };
  const DEFAULT_SETTINGS = { mute: false, music: true, sfx: true, musicVol: 0.6, sfxVol: 0.8, vibrate: true };
  function freshSave() { return { hero: null, done: {}, xp: 0, gold: 0, streak: 0, lastDay: null, settings: { ...DEFAULT_SETTINGS }, world: 0, arenaBest: 0, towerBest: 0, weak: {}, hard: {}, mode: 'normal', owned: { hats: ['wizard', 'none'], pets: ['none'] } }; }
  function loadSave() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { /* storage blocked */ }
    if (!s || typeof s !== 'object') return freshSave();
    const base = freshSave();
    for (const k in base) if (s[k] === undefined) s[k] = base[k];
    if (!s.owned.hats) s.owned.hats = ['wizard', 'none'];
    if (!s.owned.pets) s.owned.pets = ['none'];
    if (s.hero) s.hero = { ...DEFAULT_HERO, ...s.hero };
    s.settings = { ...DEFAULT_SETTINGS, ...(s.settings || {}) };
    if (s.muted) { s.settings.mute = true; delete s.muted; }
    return s;
  }
  let save = loadSave();
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage blocked */ } }

  /* ---------------- palettes ---------------- */
  const HAIR = [['ink', '#2b2433'], ['chestnut', '#7a4424'], ['gold', '#e2b34a'], ['ember', '#c8452f'], ['frost', '#e6e1d6'], ['moss', '#5d8a3f']];
  const SKIN = [['light', '#fbd9b8'], ['fair', '#ecb98d'], ['medium', '#c98d5f'], ['brown', '#91603e'], ['deep', '#5e3a26']];
  const CLOTH = [['blue', '#3f6fd8'], ['purple', '#7d4fc9'], ['red', '#c23b2e'], ['green', '#2f8f5b'], ['white', '#d9d4c6'], ['black', '#34303f']];
  const GEM = [['sky', '#5fd3ff'], ['ruby', '#ff5f6d'], ['jade', '#6dff9a'], ['sun', '#ffd75f'], ['amethyst', '#c78bff']];

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
    return '#' + [ch(16), ch(8), ch(0)].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  /* ---------------- sprites ---------------- */
  const HERO_MAP = [
    '........OO........',
    '.......OTTO.......',
    '......OTTTTO......',
    '.....OTTTTTTO.....',
    '....OTTTTTTTTO....',
    '...OTTTTTTTTTTO...',
    '..OttttttttttttO..',
    'OTTTTTTTTTTTTTTTTO',
    '.OOHHHHHHHHHHHHOO.',
    '..OHSSSSSSSSSSHO..',
    '..OHSKKSSSSKKSHO..',
    '..OHSSSSSSSSSSHO..',
    '..OHHSSSMMSSSHHO..',
    '...OOSSSSSSSSOO...',
    '..ORRRRRRRRRRRRO..',
    '.ORRRRDRRRRDRRRRO.',
    'OSRRRRDRRRRDRRRRSO',
    'OSRLLLLLLLLLLLLRSO',
    '.ORRRRDRRRRDRRRRO.',
    '.ORRRRDRRRRDRRRRO.',
    '.ORRRRDRRRRDRRRRO.',
    'ODDDDDDDDDDDDDDDDO',
    '..OBBBBO..OBBBBO..',
    '..OBBBBO..OBBBBO..',
    '..OOOOOO..OOOOOO..',
  ];
  const E18 = '..................';
  const HAT_TOPS = {
    wizard: null,
    none: [E18, E18, E18, E18, E18, '.....OOOOOOOO.....', '...OOHHHHHHHHOO...', '..OHHHHHHHHHHHHO..'],
    cap: [E18, E18, E18, E18, E18, '.....OOOOOOOO.....', '...OOTTTTTTTTOO...', '..OTTTTTTTTTTTTTTO'],
    crown: [E18, E18, E18, E18, '...OYO.OYYO.OYO...', '...OYYOYYYYOYYO...', '...OYYYYJJYYYYO...', '..OOOOOOOOOOOOOO..'],
    hood: [E18, E18, E18, '......OOOOOO......', '....OOTTTTTTOO....', '...OTTTTTTTTTTO...', '..OTTTTTTTTTTTTO..', '..OTTTTTTTTTTTTO..', '..OTTHHHHHHHHTTO..'],
  };
  const heroMapCache = {};
  function heroMap(style) {
    if (heroMapCache[style]) return heroMapCache[style];
    const top = HAT_TOPS[style];
    let m = HERO_MAP.slice();
    if (top) {
      m = top.concat(HERO_MAP.slice(top.length));
      if (style === 'hood') for (let r = 9; r <= 12; r++) m[r] = m[r].slice(0, 3) + 'T' + m[r].slice(4, 14) + 'T' + m[r].slice(15);
    }
    return (heroMapCache[style] = m);
  }

  const SLIME_MAP = ['.....OOOO.....', '...OOGGGGOO...', '..OGLLGGGGGO..', '.OGLGGGGGGGGO.', '.OGGWKGGGWKGO.', 'OGGGGGGGGGGGGO', 'OGGGGGMMMGGGGO', 'OGGGGGGGGGGGGO', '.ODDDDDDDDDDO.', '..OOOOOOOOOO..'];
  const BAT_MAP = ['O..............O', 'OO.....OO.....OO', 'OPO...OPPO...OPO', 'OPPO.OPPPPO.OPPO', 'OPPPOPWKKWPOPPPO', 'OPPPPPPPPPPPPPPO', '.OPPOPPMMPPOPPO.', '..OO.OPPPPO.OO..', '......OOOO......'];
  const KING_MAP = ['......OOOOOOOO......', '....OORRRRRRRROO....', '...ORRRWWRRRRRRRO...', '..ORRWWWWRRRRWWRRO..', '.ORRRWWRRRRRRWWWRRO.', '.ORRRRRRRWWRRRRRRRO.', 'ORRWWRRRWWWWRRRRWWRO', 'ODDDDDDDDDDDDDDDDDDO', '.OOOOOOOOOOOOOOOOOO.', '....OCCCCCCCCCCO....', '....OCWKCCCCWKCO....', '....OCCCCCCCCCCO....', '....OCCCMMMMCCCO....', '...OCCCCCCCCCCCCO...', '...OCCCCCCCCCCCCO...', '....OCCCCCCCCCCO....', '....OEEEEOOEEEEO....', '....OOOOO..OOOOO....'];
  const BOOK_MAP = ['.OOOOOOOO..OOOOOOOO.', 'OPPPPPPPPOOPPPPPPPPO', 'OPWWWWWWPOOPWWWWWWPO', 'OPWKKWWWPOOPWWWKKWPO', 'OPWKRWWWPOOPWWWKRWPO', 'OPWWWWWWPOOPWWWWWWPO', 'OPWMMMMMMOOMMMMMMWPO', 'OPWWWWWWPOOPWWWWWWPO', 'OPWWWWWWPOOPWWWWWWPO', 'OCCCCCCCCOOCCCCCCCCO', '.OOOOOOOOOOOOOOOOOO.'];
  const WISP_MAP = ['....O.......', '...OFO..O...', '...OFFO.OFO.', '..OFFFFOFFO.', '..OFFLLFFFO.', '.OFFLLLLFFO.', '.OFLWKLWKFO.', '.OFLLLLLLFO.', '.OFFLLLLFFO.', '..OFFFFFFO..', '...OOFFOO...', '.....OO.....'];
  const TREANT_MAP = [
    '......OOOOOOOOOO......',
    '....OOGGGGGGGGGGOO....',
    '...OGGGLGGGGGLGGGGO...',
    '..OGGLGGGGGGGGGGLGGO..',
    '.OGGGGGGLGGGGLGGGGGGO.',
    '.OGGGGGGGGGGGGGGGGGGO.',
    '..OOGGGOOBBBBOOGGGOO..',
    '....OOO.OBBBBO.OOO....',
    '.......OBBBBBBBO......',
    '.......OBYKBYKBO......',
    '.......OBBBBBBBO......',
    '.......OBMMMMMBO......',
    '......OBBBBBBBBBO.....',
    '.....OBBDBBBBBDBBO....',
    '....OBBBDBBBBBDBBBO...',
    '...OBBBBBBBBBBBBBBBO..',
    '..OROOBBBBBBBBBBBOORO.',
    '.ORRRROOOOOOOOOOORRRRO',
  ];
  const CROWN_MAP = ['..Y..Y..Y..', '..YY.YY.YY.', '..YYYYYYYY.', '..YRYYGYYRY'];
  const SAGE_MAP = ['......OOOO......', '....OOVVVVOO....', '...OVVVVVVVVO...', '..OVVVVVVVVVVO..', '..OVSSSSSSSSVO..', '..OVSKSSSSKSVO..', '..OVSSSSSSSSVO..', '..OVEEEEEEEEVO..', '..OVEEEEEEEEVO..', '.OVVVEEEEEEVVVO.', '.OVVVVEEEEVVVVO.', 'OSVVVVVEEVVVVVSO', '.OVVVVVVVVVVVVO.', '.OVVVVVVVVVVVVO.', '.OVVVVVVVVVVVVO.', '.OUUUUUUUUUUUUO.', '..OOOOOOOOOOOO..'];
  const PET_MAPS = {
    slimey: { map: ['..OOOO..', '.OGGGGO.', 'OGWKGWKO', 'OGGGGGGO', 'OGGGGGGO', '.OOOOOO.'], pal: { O: '#1a1426', G: '#6dd6a0', W: '#ffffff', K: '#1b1830' } },
    owl: { map: ['O......O', 'OBOOOOBO', 'OBBBBBBO', 'OWKBBKWO', 'OBBYYBBO', 'OBLLLLBO', '.OLLLLO.', '..OYYO..'], pal: { O: '#1a1426', B: '#8a5a2b', W: '#ffffff', K: '#1b1830', Y: '#f0b545', L: '#e8cfa0' } },
    drake: { map: ['......OO..', '.....ORRO.', 'O...ORWKRO', 'RO.ORRRRRO', 'RRORRRRRYO', 'ORRRRRRRO.', '.ORROORRO.', '..OO..OO..'], pal: { O: '#1a1426', R: '#d0443a', W: '#ffffff', K: '#1b1830', Y: '#f0c53a' } },
  };

  const OUT = '#1a1426';
  const sagePal = (V, E, S) => ({ O: OUT, V, U: shade(V, 0.72), S, K: '#1b1830', E });
  const NPCS = {
    elder: { name: 'Elder Rowan', map: SAGE_MAP, pal: sagePal('#6a5a9c', '#ece6da', '#ecc6a0') },
    merchant: { name: 'Mira', map: SAGE_MAP, pal: sagePal('#3f8f6a', '#8a4b23', '#c98d5f') },
    healer: { name: 'Hazel', map: SAGE_MAP, pal: sagePal('#d06c9a', '#f3e9c6', '#fbd9b8') },
    librarian: { name: 'Archivist Quill', map: SAGE_MAP, pal: sagePal('#2f4f8f', '#a9a7b8', '#e8c09a') },
    scribe: { name: 'Wren', map: SAGE_MAP, pal: sagePal('#b07a2a', '#3a2a24', '#91603e') },
    coach: { name: 'Captain Brin', map: SAGE_MAP, pal: sagePal('#c2552e', '#c8452f', '#ecb98d') },
    ranger: { name: 'Ranger Ash', map: SAGE_MAP, pal: sagePal('#4d7a2e', '#5a3a22', '#c98d5f') },
    oracle: { name: 'Oracle Vey', map: SAGE_MAP, pal: sagePal('#2e8a8a', '#e6e1d6', '#91603e') },
    miner: { name: 'Dusty', map: SAGE_MAP, pal: sagePal('#8a6a3a', '#9a958a', '#ecb98d') },
    bard: { name: 'Lyra', map: SAGE_MAP, pal: sagePal('#3f8f8f', '#7a4424', '#fbd9b8') },
    trader: { name: 'Trader Bo', map: SAGE_MAP, pal: sagePal('#c8742a', '#2b2433', '#91603e') },
    tailor: { name: 'Fen', map: SAGE_MAP, pal: sagePal('#b04f8f', '#e2b34a', '#ecb98d') },
    captain: { name: 'Captain Marlo', map: SAGE_MAP, pal: sagePal('#2f4f8f', '#c8452f', '#c98d5f') },
    clerk: { name: 'Ines', map: SAGE_MAP, pal: sagePal('#6a8a9a', '#5a3a24', '#fbd9b8') },
    archmage: { name: 'Archmage Solen', map: SAGE_MAP, pal: sagePal('#4a2f8f', '#f3efe6', '#ecc6a0') },
    apprentice: { name: 'Kip', map: SAGE_MAP, pal: sagePal('#5a9a4a', '#ecb98d', '#ecb98d') },
    warden: { name: 'Warden Gray', map: SAGE_MAP, pal: sagePal('#4a4a5a', '#8a8a96', '#c98d5f') },
    prisoner: { name: 'Old Tobin', map: SAGE_MAP, pal: sagePal('#7a6a5a', '#f3efe6', '#91603e') },
    keeper: { name: 'Keeper Odo', map: SAGE_MAP, pal: sagePal('#7a5a3a', '#d8d0c0', '#c98d5f') },
    scholar: { name: 'Scholar Ima', map: SAGE_MAP, pal: sagePal('#3f6a8f', '#2b2433', '#fbd9b8') },
    forgemaster: { name: 'Forgemaster Brann', map: SAGE_MAP, pal: sagePal('#8a3a1a', '#c8452f', '#c98d5f') },
    tinker: { name: 'Tinker Lio', map: SAGE_MAP, pal: sagePal('#b08a3a', '#2b2433', '#fbd9b8') },
    seren: { name: 'Lady Seren', map: SAGE_MAP, pal: sagePal('#7a2a4a', '#e2b34a', '#fbd9b8') },
    squire: { name: 'Squire Tam', map: SAGE_MAP, pal: sagePal('#5a6a8a', '#7a4424', '#ecb98d') },
    artificer: { name: 'Artificer Quinn', map: SAGE_MAP, pal: sagePal('#2e8a7a', '#e6e1d6', '#c98d5f') },
    warden2: { name: 'Warden Pell', map: SAGE_MAP, pal: sagePal('#6a5a3a', '#34303f', '#91603e') },
    vendor: { name: 'Vendor Oro', map: SAGE_MAP, pal: sagePal('#c8742a', '#e2b34a', '#91603e') },
    courier: { name: 'Courier Pim', map: SAGE_MAP, pal: sagePal('#2f8f5b', '#c8452f', '#ecb98d') },
    hermit: { name: 'Hermit Rue', map: SAGE_MAP, pal: sagePal('#4d6a3a', '#a9a7b8', '#c98d5f') },
    tracker: { name: 'Tracker Sil', map: SAGE_MAP, pal: sagePal('#3a5a4a', '#2b2433', '#91603e') },
    inspector: { name: 'Inspector Vale', map: SAGE_MAP, pal: sagePal('#34303f', '#d9d4c6', '#fbd9b8') },
    gardener: { name: 'Gardener Moss', map: SAGE_MAP, pal: sagePal('#5a9a4a', '#7a4424', '#c98d5f') },
    seer: { name: 'Seer Lin', map: SAGE_MAP, pal: sagePal('#b04f8f', '#f3efe6', '#ecb98d') },
    caravan: { name: 'Caravan-master Zafi', map: SAGE_MAP, pal: sagePal('#c8a03a', '#2b2433', '#91603e') },
    nomad: { name: 'Nomad Kesh', map: SAGE_MAP, pal: sagePal('#a85a3a', '#5e3a26', '#5e3a26') },
    ferryman: { name: 'Ferryman Oak', map: SAGE_MAP, pal: sagePal('#3f6fd8', '#e6e1d6', '#c98d5f') },
    clockmaker: { name: 'Clockmaker Iva', map: SAGE_MAP, pal: sagePal('#7d4fc9', '#e2b34a', '#fbd9b8') },
  };
  const mirror = m => m.map(r => r.split('').reverse().join(''));
  const WISP_PAL = {
    fire: { O: OUT, F: '#ff7a2b', L: '#ffd75f', W: '#ffffff', K: '#1b1830' },
    ice: { O: OUT, F: '#5fb8ff', L: '#d8f4ff', W: '#ffffff', K: '#1b1830' },
    water: { O: OUT, F: '#2f5fc8', L: '#7fdcff', W: '#ffffff', K: '#1b1830' },
  };
  const FOES = {
    slime: { name: 'Slime', map: SLIME_MAP, s: 3, pal: { O: OUT, G: '#5dca5d', L: '#c4f5a8', D: '#2f8a3a', W: '#ffffff', K: '#1b1830', M: '#1b1830' } },
    inkling: { name: 'Inkling', map: SLIME_MAP, s: 3, pal: { O: OUT, G: '#3b3570', L: '#8a80d6', D: '#211c45', W: '#ffffff', K: '#ff5f6d', M: '#0c0a12' } },
    bat: { name: 'Giant bat', map: BAT_MAP, s: 3, fly: true, pal: { O: OUT, P: '#7a4fb0', W: '#ffd75f', K: '#1b1830', M: '#f3e9c6' } },
    paperbat: { name: 'Paper bat', map: BAT_MAP, s: 3, fly: true, pal: { O: '#3a2a14', P: '#efe2bf', W: '#ffffff', K: '#1b1830', M: '#c4473d' } },
    king: { name: 'Mushroom King', map: KING_MAP, s: 3, crown: true, pal: { O: OUT, R: '#d0443a', W: '#f6ead2', D: '#8f2a24', C: '#f1dfbf', K: '#1b1830', M: '#5a2a24', E: '#7a5233' } },
    fireslime: { name: 'Fire slime', map: SLIME_MAP, s: 3, pal: { O: OUT, G: '#e8642c', L: '#ffd75f', D: '#a8361a', W: '#ffffff', K: '#1b1830', M: '#5a1a0c' } },
    iceslime: { name: 'Ice slime', map: SLIME_MAP, s: 3, pal: { O: OUT, G: '#7fc8f0', L: '#eafaff', D: '#3f7fb0', W: '#ffffff', K: '#1b1830', M: '#1b3a5a' } },
    wisp: { name: 'Wisp', map: WISP_MAP, s: 3, fly: true, pal: WISP_PAL.fire },
    treant: { name: 'Hollow Treant', map: TREANT_MAP, s: 4, pal: { O: OUT, G: '#3f8f3a', L: '#7fd16a', B: '#7a5233', D: '#5a3a22', Y: '#ffd75f', K: '#1b1830', M: '#2a1a10', R: '#5a3a22' } },
    sphinx: { name: 'The Examiner', map: SPRITES.sphinx, s: 3, crown: false, pal: { O: OUT, Y: '#f0c53a', B: '#3f6fd8', S: '#e8b878', K: '#1b1830', M: '#7a3a1a', T: '#d8a850' } },
    echobat: { name: 'Echo bat', map: BAT_MAP, s: 3, fly: true, pal: { O: OUT, P: '#2e8a8a', W: '#7fdcff', K: '#1b1830', M: '#f3e9c6' } },
    crystalslime: { name: 'Crystal slime', map: SLIME_MAP, s: 3, pal: { O: OUT, G: '#9a7fd6', L: '#e0d4ff', D: '#5a3f9a', W: '#ffffff', K: '#1b1830', M: '#2a1a4a' } },
    wyrm: { name: 'Crystal Wyrm', map: SPRITES.wyrm, s: 3, pal: { O: OUT, C: '#7f5fd6', L: '#c79bff', W: '#ffffff', K: '#1b1830', M: '#3a1a5a' } },
    mimic: { name: 'Mimic', map: SPRITES.mimic, s: 3, pal: { O: OUT, B: '#8a5a2b', Y: '#f0c53a', R: '#ff5f6d', K: '#1b1830', W: '#f6ead2', M: '#d0443a' } },
    goblin: { name: 'Goblin thief', map: SPRITES.goblin, s: 3, pal: { O: OUT, G: '#6bb85a', W: '#ffd75f', K: '#1b1830', M: '#3a2a14', B: '#8a5a2b', Y: '#f0c53a' } },
    goblinking: { name: 'Goblin King', map: SPRITES.goblin, s: 4, crown: true, pal: { O: OUT, G: '#4f9a3f', W: '#ff5f6d', K: '#1b1830', M: '#3a2a14', B: '#7d4fc9', Y: '#f0c53a' } },
    crab: { name: 'Storm crab', map: SPRITES.crab, s: 3, pal: { O: OUT, R: '#e0603a', M: '#7a2a1a', W: '#ffffff', K: '#1b1830' } },
    seaslime: { name: 'Sea slime', map: SLIME_MAP, s: 3, pal: { O: OUT, G: '#3f9ac8', L: '#b0ecff', D: '#1f5a8a', W: '#ffffff', K: '#1b1830', M: '#0c2a4a' } },
    kraken: { name: 'The Kraken', map: SPRITES.kraken, s: 4, pal: { O: OUT, P: '#9a4fb0', W: '#ffd75f', K: '#1b1830', M: '#3a1a40' } },
    dragon: { name: 'Elder Dragon', map: SPRITES.dragon, s: 4, pal: { O: OUT, G: '#3f8f6a', W: '#6a5a9c', Y: '#f0c53a', K: '#1b1830', M: '#7a1a1a', L: '#c8e0a0' } },
    golem: { name: 'Clockwork golem', map: SPRITES.golem, s: 3, pal: { O: OUT, S: '#b08a3a', G: '#5fd3ff', Y: '#ffd75f', M: '#3a2a14', K: '#1b1830' } },
    shadowmage: { name: 'Shadow Mage', map: mirror(HERO_MAP), s: 3, pal: { O: '#0c0a12', T: '#1a1426', t: '#7d4fc9', H: '#4a3e6e', S: '#8b7fb0', K: '#ff3fd0', M: '#ff3fd0', R: '#2a2238', D: '#1a1426', L: '#7d4fc9', B: '#1a1426' } },
    skeleton: { name: 'Skeleton', map: SPRITES.skeleton, s: 3, pal: { O: OUT, W: '#e8e2d0', K: '#1b1830', M: '#1b1830' } },
    ghost: { name: 'Ghost', map: WISP_MAP, s: 3, fly: true, pal: { O: '#4a3e6e', F: '#d8d4f0', L: '#ffffff', W: '#ffffff', K: '#1b1830' } },
    lich: { name: 'Bug Lich', map: SPRITES.skeleton, s: 4, crown: true, pal: { O: '#1a1426', W: '#d8c8ff', K: '#ff3fd0', M: '#5fd3ff' } },
    bookworm: { name: 'Bookworm', map: SPRITES.bookworm, s: 3, pal: { O: OUT, G: '#c8a060', L: '#e8d4a0', W: '#ffffff', K: '#1b1830', M: '#7a3a1a' } },
    archivist: { name: 'Stone Archivist', map: SPRITES.golem, s: 4, pal: { O: OUT, S: '#8a8578', G: '#ffd75f', Y: '#5fd3ff', M: '#2a2622', K: '#1b1830' } },
    source: { name: 'The Source', map: SPRITES.source, s: 4, fly: true, pal: { O: '#2a1a4a', C: '#7f5fd6', L: '#e0d4ff', W: '#ffffff', K: '#1b1830', Y: '#ffd75f' } },
    sparkbot: { name: 'Sparkbot', map: SPRITES.bot, s: 3, pal: { O: OUT, S: '#c88a3a', Y: '#ffe65f', K: '#1b1830', M: '#3a2a14', G: '#5fd3ff' } },
    gearbot: { name: 'Guard bot', map: SPRITES.bot, s: 3, pal: { O: OUT, S: '#3f8f8a', Y: '#ff5f6d', K: '#1b1830', M: '#1a3a3a', G: '#f0c53a' } },
    construct: { name: 'Rogue construct', map: SPRITES.golem, s: 3, pal: { O: OUT, S: '#b06a3a', G: '#ff7a2b', Y: '#ffd75f', M: '#3a2a14', K: '#1b1830' } },
    colossus: { name: 'Iron Colossus', map: SPRITES.golem, s: 4, pal: { O: OUT, S: '#6a6a7a', G: '#ff5f2b', Y: '#ffd75f', M: '#2a2622', K: '#1b1830' } },
    knight: { name: 'Haunted armor', map: SPRITES.knight, s: 3, pal: { O: OUT, S: '#a9a7b8', K: '#5fd3ff', R: '#7a2a4a' } },
    usurper: { name: 'The Usurper', map: mirror(HERO_MAP), s: 3, crown: true, pal: { O: '#0c0a12', T: '#3a1a2a', t: '#c23b2e', H: '#2b2433', S: '#c9a07a', K: '#ff3f3f', M: '#7a1a1a', R: '#4a1a3a', D: '#2a0a1a', L: '#c23b2e', B: '#1a1426', Y: '#f0c53a', J: '#ff3f3f' } },
    clockking: { name: 'Clockwork King', map: SPRITES.golem, s: 4, crown: true, pal: { O: OUT, S: '#c8a03a', G: '#7fdcff', Y: '#ffffff', M: '#3a2a14', K: '#1b1830' } },
    automaton: { name: 'Grand Automaton', map: SPRITES.golem, s: 4, pal: { O: OUT, S: '#e2c26a', G: '#5fd3ff', Y: '#ff5f6d', M: '#5a3a14', K: '#1b1830' } },
    bandit: { name: 'Desert bandit', map: SPRITES.goblin, s: 3, pal: { O: OUT, G: '#c98d5f', W: '#ffd75f', K: '#1b1830', M: '#3a2a14', B: '#c23b2e', Y: '#f0c53a' } },
    prince: { name: 'Merchant Prince', map: mirror(HERO_MAP), s: 3, crown: true, pal: { O: OUT, T: '#f0c53a', t: '#7d4fc9', H: '#2b2433', S: '#91603e', K: '#1b1830', M: '#7a3a1a', R: '#7d4fc9', D: '#4a2f8f', L: '#f0c53a', B: '#3a2a14', Y: '#f0c53a', J: '#6dff9a' } },
    serpent: { name: 'Marsh serpent', map: SPRITES.wyrm, s: 3, pal: { O: OUT, C: '#3f9a5a', L: '#c4f5a8', W: '#ffd75f', K: '#1b1830', M: '#1a3a1a' } },
    hydra: { name: 'Hydra of Patterns', map: SPRITES.wyrm, s: 4, crown: true, pal: { O: OUT, C: '#2e8a8a', L: '#7fdcff', W: '#ff5f6d', K: '#1b1830', M: '#0c2a2a' } },
    bugswarm: { name: 'Bug swarm', map: BAT_MAP, s: 3, fly: true, pal: { O: OUT, P: '#4f9a3f', W: '#ff5f6d', K: '#1b1830', M: '#c4f5a8' } },
    inspectorboss: { name: 'Grand Inspector', map: SPRITES.sphinx, s: 3, pal: { O: OUT, Y: '#a9a7b8', B: '#34303f', S: '#d9d4c6', K: '#ff3f3f', M: '#3a2a14', T: '#8a8578' } },
    tribunal: { name: 'The Tribunal', map: SPRITES.sphinx, s: 4, crown: true, pal: { O: OUT, Y: '#f0c53a', B: '#7d4fc9', S: '#f3efe6', K: '#1b1830', M: '#7a1a1a', T: '#c8a03a' } },
    sprite: { name: 'Thorn sprite', map: WISP_MAP, s: 3, fly: true, pal: { O: OUT, F: '#5dca5d', L: '#ff9ac0', W: '#ffffff', K: '#1b1830' } },
    thornqueen: { name: 'Thorn Queen', map: TREANT_MAP, s: 4, crown: true, pal: { O: OUT, G: '#b04f8f', L: '#ff9ac0', B: '#5a3a22', D: '#3a2a14', Y: '#6dff9a', K: '#1b1830', M: '#2a1a10', R: '#5a3a22' } },
    wurm: { name: 'Sand wurm', map: SPRITES.wyrm, s: 3, pal: { O: OUT, C: '#c8a060', L: '#f0dca0', W: '#ff7a2b', K: '#1b1830', M: '#5a3a14' } },
    sandtitan: { name: 'Sand Titan', map: SPRITES.golem, s: 4, pal: { O: OUT, S: '#d8b070', G: '#ff7a2b', Y: '#fff1a8', M: '#7a5a2a', K: '#1b1830' } },
    riverspirit: { name: 'River spirit', map: WISP_MAP, s: 3, fly: true, pal: { O: '#1a3a6a', F: '#5fb8ff', L: '#d8f4ff', W: '#ffffff', K: '#1b1830' } },
    leviathan: { name: 'Leviathan of Time', map: SPRITES.kraken, s: 4, pal: { O: OUT, P: '#2e8a8a', W: '#ffd75f', K: '#1b1830', M: '#0c2a2a' } },
    gatekeeper: { name: 'The Gatekeeper', map: SPRITES.source, s: 4, fly: true, pal: { O: '#3a2a04', C: '#f0c53a', L: '#fff1a8', W: '#ffffff', K: '#1b1830', Y: '#7d4fc9' } },
    grimoire: { name: 'The Grimoire', map: BOOK_MAP, s: 4, fly: true, pal: { O: OUT, P: '#d9c79a', W: '#f6ead2', K: '#1b1830', R: '#ff5f6d', M: '#3a2a14', C: '#7d4fc9' } },
  };
  const SPELL_COL = { fireball: ['#ff7a2b', '#ffd75f'], spark: ['#ffe65f', '#ffffff'], icebolt: ['#7fdcff', '#e8fbff'] };

  function heroPal(h) {
    const robe = CLOTH[h.robe][1], hat = CLOTH[h.hat][1];
    return { O: OUT, T: hat, t: '#e2b34a', H: HAIR[h.hair][1], S: SKIN[h.skin][1], K: '#1b1830', M: '#a8513a', R: robe, D: shade(robe, 0.7), L: '#6b4426', B: '#4a2f1d', Y: '#f0c53a', J: GEM[h.gem][1] };
  }
  function drawMap(ctx, map, pal, x, y, s, white) {
    for (let j = 0; j < map.length; j++) {
      const row = map[j];
      for (let i = 0; i < row.length; i++) {
        const c = pal[row[i]];
        if (!c) continue;
        ctx.fillStyle = white && row[i] !== 'O' ? '#ffffff' : c;
        ctx.fillRect(x + i * s, y + j * s, s, s);
      }
    }
  }
  function drawHero(ctx, h, x, y, s, opts = {}) {
    drawMap(ctx, heroMap(h.hatStyle || 'wizard'), heroPal(h), x, y, s, opts.white);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x + 18 * s, y + 8 * s, s, 17 * s);
    ctx.fillStyle = OUT; ctx.fillRect(x + 19 * s, y + 8 * s, s, 17 * s);
    const gem = GEM[h.gem][1];
    ctx.fillStyle = OUT; ctx.fillRect(x + 17 * s, y + 4 * s, 3 * s, 4 * s);
    ctx.fillStyle = opts.glow ? '#ffffff' : gem; ctx.fillRect(x + 17 * s, y + 5 * s, 3 * s, 2 * s);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 17 * s, y + 5 * s, s, s);
  }
  function drawPet(ctx, id, x, groundY, s, t) {
    const p = PET_MAPS[id];
    if (!p) return;
    const bob = reduceMotion ? 0 : Math.round(Math.sin((t || 0) / 12) * (id === 'owl' || id === 'drake' ? 3 : 1));
    const lift = id === 'owl' || id === 'drake' ? 14 * s / 2 : 0;
    drawMap(ctx, p.map, p.pal, x, groundY - p.map.length * s - lift + bob, s);
  }
  function portrait(canvas, who) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width;
    if (who === 'hero') { drawHero(ctx, save.hero || DEFAULT_HERO, -Math.round(W * 0.02), Math.round(W * 0.02), Math.round(W / 20)); return; }
    if (NPCS[who]) { const n = NPCS[who]; drawMap(ctx, n.map, n.pal, Math.round(W * 0.05), Math.round(W * 0.06), Math.round(W / 18)); return; }
    if (FOES[who]) { const f = FOES[who]; const s = Math.max(1, Math.floor(W / f.map[0].length)); drawMap(ctx, f.map, f.pal, Math.round((W - f.map[0].length * s) / 2), Math.round((W - f.map.length * s) / 2), s); return; }
    const s = Math.round(W / 16);
    const BOOK = ['................', '.OOOOOO..OOOOOO.', 'OPPPPPPOOPPPPPPO', 'OPWWWWPOOPWWWWPO', 'OPPPPPPOOPPPPPPO', 'OPWWWPPOOPWWWPPO', 'OPPPPPPOOPPPPPPO', 'OPWWWWPOOPWWWWPO', 'OPPPPPPOOPPPPPPO', 'OBBBBBBBBBBBBBBO', '.OOOOOOOOOOOOOO.'];
    drawMap(ctx, BOOK, { O: OUT, P: '#efe2bf', W: '#b49a6a', B: '#7d4fc9' }, 0, s * 3, s);
  }
  const WHO_NAME = who => (who === 'hero' ? save.hero.name : who === 'narrator' ? 'Quest' : NPCS[who] ? NPCS[who].name : FOES[who] ? FOES[who].name : who);

  /* ---------------- sound ---------------- */
  const sfx = kind => Sound.sfx(kind);
  Sound.configure(save.settings);
  // browsers start sound only after the first touch
  const unlockSound = () => Sound.unlock();
  document.addEventListener('pointerdown', unlockSound, true);
  document.addEventListener('keydown', unlockSound, true);
  document.addEventListener('visibilitychange', () => Sound.pause(document.hidden));

  /* ---------------- images ---------------- */
  const IMG = {};
  // load the current scene first, the rest lazily
  function bgImage(k) { if (!IMG[k]) { IMG[k] = new Image(); IMG[k].src = `assets/bg-${k}.jpg`; } return IMG[k]; }

  /* ---------------- screens ---------------- */
  const screens = ['title', 'creator', 'map', 'level', 'book', 'shop', 'settings'];
  let currentScreen = 'title', settingsReturn = 'title', shopReturn = 'map';
  // the music follows where you are: menu, world map, lesson, battle, boss, Tower, Training
  function updateMusic() {
    const scr = currentScreen === 'settings' ? settingsReturn : currentScreen;
    if (scr === 'title' || !save.hero) { Sound.music('menu'); return; }
    if (scr === 'level' && L) {
      const wid = L.w != null && WORLDS[L.w] ? WORLDS[L.w].id : 0;
      if (L.tower) Sound.music('tower');
      else if (L.arena) Sound.music('train');
      else if (scene.right && scene.right.type === 'foe') Sound.music(L.def.boss ? 'boss' : 'battle', wid);
      else Sound.music('level', wid);
      return;
    }
    Sound.music('map', WORLDS[save.world] ? WORLDS[save.world].id : 1);
  }
  // Android's back button moves back inside the game instead of closing it
  let backGuard = false;
  function armBack() { if (!backGuard) { try { history.pushState({ sorcery: 1 }, ''); backGuard = true; } catch (e) { /* not allowed here */ } } }
  window.addEventListener('popstate', () => {
    backGuard = false;
    if (currentScreen === 'title') return;
    if (!$('#faint').hidden) { /* wait for the player to choose */ }
    else if (!$('#result').hidden) $('#res-map').click();
    else if (currentScreen === 'settings') $('#settings-back').click();
    else if (currentScreen === 'level') { if (!(L && L.busy)) $('#lv-exit').click(); }
    else if (currentScreen === 'map') show('title');
    else if (currentScreen === 'shop') $('#shop-back').click();
    else if (currentScreen === 'book') $('#book-back').click();
    else if (currentScreen === 'creator') $('#btn-creator-back').click();
    if (currentScreen !== 'title') armBack();
  });
  function show(name) {
    currentScreen = name;
    if (name !== 'title') armBack();
    for (const s of screens) $('#scr-' + s).hidden = s !== name;
    scene.active = name === 'level';
    if (name === 'map') renderMap();
    if (name === 'book') renderBook();
    if (name === 'title') renderTitle();
    if (name === 'shop') renderShop();
    if (name === 'settings') renderSettings();
    updateMusic();
    document.querySelectorAll('.nav .btn').forEach(b => b.classList.toggle('ghost', b.dataset.nav !== name));
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('[data-nav]').forEach(b => {
    b.onclick = () => {
      sfx('tap');
      const n = b.dataset.nav;
      if (n === 'hero') openCreator(true);
      else if (n === 'arena') startArena();
      else if (n === 'tower') startTower();
      else show(n);
    };
  });

  /* ---------------- title ---------------- */
  function renderTitle() {
    const has = !!save.hero;
    $('#menu-hero').hidden = !has;
    if (has) {
      const info = levelInfo();
      portrait($('#menu-portrait'), 'hero');
      $('#menu-name').textContent = save.hero.name;
      $('#menu-lv').textContent = 'Lv ' + info.level;
      $('#menu-rank').textContent = `${rankOf(info.level)} · ${Object.keys(save.done).length} levels cleared · ${save.gold} gold`;
      $('#menu-xp').style.width = Math.round(100 * info.into / info.need) + '%';
      $('#menu-xp-wrap').setAttribute('aria-label', `${info.into} of ${info.need} XP to level ${info.level + 1}`);
    }
    $('#btn-play').textContent = has ? 'Continue' : 'New game';
    $('#btn-new').hidden = !has;
    $('#new-confirm').hidden = true;
    $('#btn-menu-shop').hidden = !has;
  }
  $('#btn-play').onclick = () => { sfx('tap'); if (save.hero) show('map'); else openCreator(false); };
  $('#btn-new').onclick = () => { sfx('tap'); $('#new-confirm').hidden = false; };
  $('#btn-new-no').onclick = () => { sfx('tap'); $('#new-confirm').hidden = true; };
  $('#btn-new-yes').onclick = () => { const keep = save.settings; save = freshSave(); save.settings = keep; persist(); openCreator(false); };
  $('#btn-menu-shop').onclick = () => { sfx('tap'); shopReturn = 'title'; show('shop'); };
  $('#btn-menu-settings').onclick = () => { sfx('tap'); openSettings(); };

  /* ---------------- settings ---------------- */
  function openSettings() { if (currentScreen !== 'settings') settingsReturn = currentScreen; show('settings'); }
  function renderSettings() {
    const st = save.settings;
    const sw = (id, on) => $(id).setAttribute('aria-checked', on ? 'true' : 'false');
    sw('#set-mute', st.mute); sw('#set-music', st.music); sw('#set-sfx', st.sfx); sw('#set-vibrate', st.vibrate);
    $('#set-music-vol').value = Math.round(st.musicVol * 100);
    $('#set-sfx-vol').value = Math.round(st.sfxVol * 100);
    $('#set-music-vol').closest('.set-slider').classList.toggle('off', st.mute || !st.music);
    $('#set-sfx-vol').closest('.set-slider').classList.toggle('off', st.mute || !st.sfx);
    $('#save-box').hidden = true;
    $('#set-version').textContent = `Script & Sorcery · ${WORLDS.length} worlds · ${WORLDS.reduce((n, w) => n + w.levels.length, 0)} levels`;
  }
  const changeSetting = (k, v) => { save.settings[k] = v; persist(); Sound.configure(save.settings); renderSettings(); };
  $('#set-mute').onclick = () => { changeSetting('mute', !save.settings.mute); sfx('tap'); };
  $('#set-music').onclick = () => { changeSetting('music', !save.settings.music); sfx('tap'); };
  $('#set-sfx').onclick = () => { changeSetting('sfx', !save.settings.sfx); sfx('tap'); };
  $('#set-vibrate').onclick = () => { changeSetting('vibrate', !save.settings.vibrate); Sound.vibrate(60); sfx('tap'); };
  $('#set-music-vol').oninput = e => { save.settings.musicVol = e.target.value / 100; Sound.configure(save.settings); };
  $('#set-music-vol').onchange = () => persist();
  $('#set-sfx-vol').oninput = e => { save.settings.sfxVol = e.target.value / 100; Sound.configure(save.settings); };
  $('#set-sfx-vol').onchange = () => { persist(); sfx('coin'); };
  $('#settings-back').onclick = () => { sfx('tap'); show(settingsReturn === 'settings' ? 'title' : settingsReturn); };

  /* save backup: a text code you can carry to another browser or a new version */
  const SAVE_PREFIX = 'SS1:';
  const encodeSave = () => SAVE_PREFIX + btoa(unescape(encodeURIComponent(JSON.stringify(save))));
  function decodeSave(code) {
    const t = code.trim().replace(/\s+/g, '');
    if (!t.startsWith(SAVE_PREFIX)) throw new Error('prefix');
    const s = JSON.parse(decodeURIComponent(escape(atob(t.slice(SAVE_PREFIX.length)))));
    if (!s || typeof s !== 'object' || typeof s.done !== 'object') throw new Error('shape');
    return s;
  }
  function openSaveBox(mode) {
    $('#save-box').hidden = false;
    const ta = $('#save-code');
    $('#save-copy').hidden = mode !== 'backup';
    $('#save-load').hidden = mode !== 'restore';
    if (mode === 'backup') {
      ta.value = encodeSave();
      ta.readOnly = true;
      $('#save-msg').textContent = save.hero ? `Your save code (${Object.keys(save.done).length} levels cleared). Keep it somewhere safe, like a note on your phone.` : 'There is no hero yet, so this code is an empty save.';
    } else {
      ta.value = '';
      ta.readOnly = false;
      $('#save-msg').textContent = 'Paste a save code. It replaces the progress in this browser.';
      ta.focus();
    }
  }
  $('#btn-backup').onclick = () => { sfx('tap'); openSaveBox('backup'); };
  $('#btn-restore').onclick = () => { sfx('tap'); openSaveBox('restore'); };
  $('#save-close').onclick = () => { $('#save-box').hidden = true; };
  $('#save-copy').onclick = async () => {
    const ta = $('#save-code');
    try { await navigator.clipboard.writeText(ta.value); toast('Save code copied.'); }
    catch (e) { ta.select(); toast('Select the code and copy it.'); }
  };
  $('#save-load').onclick = () => {
    let s;
    try { s = decodeSave($('#save-code').value); }
    catch (e) { sfx('bad'); $('#save-msg').textContent = 'That code did not work. Copy the whole code, starting with SS1:'; return; }
    const base = freshSave();
    for (const k in base) if (s[k] === undefined) s[k] = base[k];
    if (s.hero) s.hero = { ...DEFAULT_HERO, ...s.hero };
    save = s;
    persist();
    sfx('win');
    $('#save-box').hidden = true;
    toast(`Save restored: ${Object.keys(save.done).length} levels cleared.`);
    renderTitle();
  };

  /* ---------------- creator ---------------- */
  let draft = null;
  const PARTS = [['hair', 'Hair', HAIR], ['skin', 'Skin', SKIN], ['robe', 'Robe', CLOTH], ['hat', 'Hat color', CLOTH], ['gem', 'Staff gem', GEM]];
  // name, price, hero level needed
  const HATS = { wizard: ['Wizard hat', 0, 1], none: ['No hat', 0, 1], cap: ['Ranger cap', 40, 3], hood: ['Shadow hood', 60, 7], crown: ['Gold crown', 150, 15] };
  const PETS = { none: ['No pet', 0, 1], slimey: ['Slimey', 50, 2], owl: ['Hoot the owl', 80, 5], drake: ['Ember drake', 200, 11] };
  function openCreator(isEdit) {
    draft = { ...DEFAULT_HERO, ...(save.hero || {}) };
    $('#hero-name').value = draft.name;
    $('#btn-begin').textContent = isEdit ? 'Save hero' : 'Begin quest';
    $('#btn-creator-back').hidden = !isEdit && !save.hero;
    renderHeroStats();
    $('#hero-stats').hidden = !isEdit;
    $('#scr-creator h2').textContent = isEdit ? 'Your hero' : 'Create your hero';
    const rows = $('#parts');
    rows.innerHTML = '';
    for (const [key, label, list] of PARTS) {
      const row = document.createElement('div');
      row.className = 'part';
      row.innerHTML = `<span class="part-label">${label}</span><div class="swatches" role="radiogroup" aria-label="${label}"></div>`;
      const sw = row.querySelector('.swatches');
      list.forEach(([nm, col], i) => {
        const b = document.createElement('button');
        b.className = 'swatch';
        b.style.setProperty('--c', col);
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-label', `${label} ${nm}`);
        b.dataset.key = key; b.dataset.v = i;
        b.onclick = () => { draft[key] = i; sfx('tap'); updateCreator(); };
        sw.appendChild(b);
      });
      rows.appendChild(row);
    }
    for (const [key, label, table, owned] of [['hatStyle', 'Hat style', HATS, save.owned.hats], ['pet', 'Pet', PETS, save.owned.pets]]) {
      const row = document.createElement('div');
      row.className = 'part';
      row.innerHTML = `<span class="part-label">${label}</span><div class="swatches" role="radiogroup" aria-label="${label}"></div>`;
      const sw = row.querySelector('.swatches');
      for (const id of Object.keys(table)) {
        if (!owned.includes(id)) continue;
        const b = document.createElement('button');
        b.className = 'opt';
        b.textContent = table[id][0];
        b.setAttribute('role', 'radio');
        b.dataset.key = key; b.dataset.v = id;
        b.onclick = () => { draft[key] = id; sfx('tap'); updateCreator(); };
        sw.appendChild(b);
      }
      const more = Object.keys(table).length - owned.length;
      if (more > 0) { const p = document.createElement('span'); p.className = 'opt-more'; p.textContent = `${more} more in the shop`; sw.appendChild(p); }
      rows.appendChild(row);
    }
    updateCreator();
    show('creator');
  }
  function cleanName(v) { return v.replace(/["'\\{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12); }
  function updateCreator() {
    document.querySelectorAll('#parts [data-key]').forEach(b => b.setAttribute('aria-checked', String(String(draft[b.dataset.key]) === b.dataset.v)));
    const cv = $('#creator-cv'), ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#3a3150'; ctx.fillRect(10, 196, 152, 12);
    ctx.fillStyle = '#4c4168'; ctx.fillRect(18, 190, 136, 8);
    drawHero(ctx, draft, 34, 15, 6);
    if (draft.pet !== 'none') drawPet(ctx, draft.pet, 2, 190, 4, 0);
    const nm = cleanName($('#hero-name').value) || 'Pip';
    const code = [
      `hero.name = "${nm}"`,
      `hero.hair = "${HAIR[draft.hair][0]}"`,
      `hero.robe = "${CLOTH[draft.robe][0]}"`,
      `hero.hat = "${draft.hatStyle}"`,
      `hero.gem = "${GEM[draft.gem][0]}"`,
      `hero.pet = "${draft.pet}"`,
    ];
    $('#creator-code').innerHTML = code.map(l => `<div>${Py.highlight(l)}</div>`).join('');
  }
  $('#hero-name').addEventListener('input', updateCreator);
  $('#btn-begin').onclick = () => {
    const nm = cleanName($('#hero-name').value);
    if (!nm) { $('#name-err').hidden = false; $('#hero-name').focus(); return; }
    $('#name-err').hidden = true;
    draft.name = nm;
    save.hero = { ...draft };
    persist();
    sfx('ok');
    show('map');
  };
  $('#btn-creator-back').onclick = () => show(save.hero ? 'map' : 'title');

  /* ---------------- map ---------------- */
  // Hard worlds open once every world is beaten; they keep their own stars
  const allBeaten = () => WORLDS.every(w => w.levels.every(l => l.late || save.done[l.id]));
  const inHard = () => save.mode === 'hard' && allBeaten();
  const prog = () => (inHard() ? save.hard || (save.hard = {}) : save.done);
  // levels added in later updates (late: true) never lock a world you already cleared
  const worldUnlocked = w => w === 0 || WORLDS[w - 1].levels.every(l => l.late || prog()[l.id]);
  const levelUnlocked = (w, i) => !!prog()[WORLDS[w].levels[i].id] || (i === 0 ? worldUnlocked(w) : !!prog()[WORLDS[w].levels[i - 1].id]);
  /* ---------------- hero growth ----------------
     Each level needs a bit more XP than the last, so levels keep coming all game.
     Levels bring ranks, extra hearts, a mana ward, a stronger glow, more gold,
     stronger Training spells and shop unlocks. They never change what a spell
     does in a lesson, so every question still has exactly one right answer. */
  const needFor = n => 80 + 20 * n;
  function levelInfo(xp = save.xp) { let lv = 1, rest = xp; while (rest >= needFor(lv)) { rest -= needFor(lv); lv++; } return { level: lv, into: rest, need: needFor(lv) }; }
  const heroLevel = () => levelInfo().level;
  const RANKS = [[1, 'Apprentice'], [4, 'Spell-scribe'], [8, 'Adept'], [12, 'Mage'], [17, 'Sorcerer'], [23, 'Archmage'], [30, 'Grand Archmage'], [40, 'Legend of the Source']];
  const rankOf = lv => RANKS.filter(r => lv >= r[0]).pop()[1];
  const AURAS = [[8, 'blue', '#5fd3ff'], [17, 'violet', '#c79bff'], [23, 'gold', '#ffd75f'], [30, 'white', '#ffffff']];
  const auraOf = lv => { const a = AURAS.filter(x => lv >= x[0]).pop(); return a ? a[2] : null; };
  const heartBonus = lv => (lv >= 6) + (lv >= 14) + (lv >= 25);
  const goldBonus = lv => Math.min(0.6, 0.02 * (lv - 1));
  const trainPower = lv => 10 + Math.floor((lv - 1) / 2);
  const hasWard = lv => lv >= 10;
  function perksAt(lv) {
    const out = [];
    const r = RANKS.find(x => x[0] === lv);
    if (r) out.push(`New rank: ${r[1]}`);
    if ([6, 14, 25].includes(lv)) out.push('+1 heart in every battle');
    if (lv === 10) out.push('Mana ward: the first hit in each battle is blocked');
    const au = AURAS.find(x => x[0] === lv);
    if (au) out.push(`Your aura now glows ${au[1]}`);
    for (const [, v] of [...Object.entries(HATS), ...Object.entries(PETS)]) if (v[2] === lv) out.push(`Shop unlock: ${v[0]}`);
    if (lv % 2 === 1) out.push('Training spells hit harder');
    out.push('+2% gold from every win');
    return out;
  }
  function nextPerk(lv) { for (let n = lv + 1; n < lv + 40; n++) { const p = perksAt(n).filter(x => !/^\+2% gold|Training spells/.test(x)); if (p.length) return [n, p[0]]; } return null; }
  // add XP and gold (gold grows with level); returns the levels gained
  function grant(xp, gold) {
    const before = heroLevel();
    const g = Math.round(gold * (1 + goldBonus(before)));
    save.xp += xp; save.gold += g;
    const after = heroLevel();
    const ups = [];
    for (let l = before + 1; l <= after; l++) ups.push(l);
    return { gold: g, ups };
  }
  function showLevelUp(ups) {
    const box = $('#res-levelup');
    if (!ups.length) { box.hidden = true; return; }
    const lv = ups[ups.length - 1];
    const perks = [...new Set(ups.flatMap(perksAt))];
    box.innerHTML = `<b>Level up! Lv ${lv}, ${esc(rankOf(lv))}</b>` + perks.map(p => `<span>${esc(p)}</span>`).join('');
    box.hidden = false;
    setTimeout(() => { sfx('level'); Sound.vibrate([60, 40, 90]); }, 450);
  }
  function renderHeroStats() {
    const box = $('#hero-stats');
    if (!save.hero) { box.hidden = true; return; }
    const info = levelInfo(), lv = info.level, np = nextPerk(lv);
    box.hidden = false;
    box.innerHTML = `<div class="hs-head"><b>Lv ${lv} ${esc(rankOf(lv))}</b><span class="small">${save.xp} XP total</span></div>
      <div class="xpbar hs-xp" role="img" aria-label="${info.into} of ${info.need} XP to level ${lv + 1}"><i style="width:${Math.round(100 * info.into / info.need)}%"></i></div>
      <div class="hs"><strong>${3 + heartBonus(lv)}</strong>hearts in battle</div>
      <div class="hs"><strong>${hasWard(lv) ? 'Yes' : 'Lv 10'}</strong>mana ward</div>
      <div class="hs"><strong>+${Math.round(goldBonus(lv) * 100)}%</strong>gold found</div>
      <div class="hs"><strong>${trainPower(lv)}</strong>Training spell power</div>
      ${np ? `<div class="hs-next">Next at Lv ${np[0]}: ${esc(np[1])}</div>` : ''}`;
  }
  function renderHud() {
    portrait($('#hud-portrait'), 'hero');
    $('#hud-name').textContent = save.hero.name;
    const info = levelInfo();
    $('#hud-lv').textContent = 'Lv ' + info.level;
    $('#hud-xp').style.width = Math.round(100 * info.into / info.need) + '%';
    $('#hud-xp-wrap').setAttribute('aria-label', `${info.into} of ${info.need} XP to level ${info.level + 1}`);
    $('#hud-gold').textContent = save.gold;
    $('#hud-streak').textContent = save.streak || 0;
  }
  function renderMap() {
    renderHud();
    if (!worldUnlocked(save.world)) save.world = 0;
    const W = WORLDS[save.world];
    // world switcher: one world at a time, arrows to move
    const wi = save.world, last = WORLDS.length - 1;
    const nextOpen = wi < last && worldUnlocked(wi + 1);
    $('#w-num').textContent = W.id;
    $('#w-of').textContent = `of ${WORLDS.length}`;
    $('#w-cur').setAttribute('aria-label', `World ${W.id} of ${WORLDS.length}: ${W.name}`);
    const prev = $('#w-prev'), nxt = $('#w-next');
    prev.disabled = wi === 0;
    prev.innerHTML = ARROW_L;
    nxt.disabled = wi === last;
    nxt.classList.toggle('locked', wi < last && !nextOpen);
    nxt.innerHTML = wi < last && !nextOpen ? lockSvg() : ARROW_R;
    nxt.setAttribute('aria-label', wi < last && !nextOpen ? `World ${W.id + 1}, locked` : 'Next world');
    prev.onclick = () => { if (wi > 0) { sfx('tap'); save.world = wi - 1; persist(); renderMap(); } };
    nxt.onclick = () => {
      if (wi === last) return;
      if (!nextOpen) { sfx('bad'); toast(`Beat the World ${W.id} boss to open World ${W.id + 1}.`); return; }
      sfx('tap'); save.world = wi + 1; persist(); renderMap();
    };
    $('#map-sub').textContent = `${W.name} · ${W.topic}`;
    if (currentScreen === 'map') updateMusic();
    $('#map-wrap').style.backgroundImage = `url(assets/${W.map})`;
    const box = $('#map-nodes');
    box.innerHTML = '';
    const pts = W.nodes.map(([x, y]) => `${x},${y}`).join(' ');
    $('#map-path').setAttribute('points', pts);
    $('#map-path-under').setAttribute('points', pts);
    const P = prog(), hardMap = inHard();
    $('#map-wrap').classList.toggle('hard', hardMap);
    $('#map-sub').textContent = `${hardMap ? 'HARD · ' : ''}${W.name} · ${W.topic}`;
    let current = W.levels.findIndex((l, i) => levelUnlocked(save.world, i) && !P[l.id]);
    W.levels.forEach((lv, i) => {
      const [x, y] = W.nodes[i];
      const b = document.createElement('button');
      const done = P[lv.id], open = levelUnlocked(save.world, i);
      b.className = 'node' + (done ? ' done' : '') + (i === current ? ' current' : '') + (!open ? ' locked' : '') + (lv.boss ? ' boss' : '');
      b.style.left = x + '%'; b.style.top = y + '%';
      b.setAttribute('aria-label', `Level ${i + 1}: ${lv.title}${done ? `, ${done} stars` : open ? '' : ', locked'}`);
      b.innerHTML = `<span class="node-n">${open ? (lv.review ? 'R' : lv.boss ? 'B' : i + 1) : lockSvg()}</span>` +
        (done ? `<span class="node-stars">${starRow(done, 3, 9)}</span>` : '') + (!hardMap && (save.hard || {})[lv.id] ? '<span class="node-crown" aria-hidden="true">H</span>' : '') + (lv.late && !done ? '<span class="node-new" aria-hidden="true">NEW</span>' : '') +
        `<span class="node-tip">${esc(lv.title)}</span>`;
      b.onclick = open ? () => { sfx('tap'); startLevel(save.world, i); } : () => toast('Finish the level before this one to unlock it.');
      box.appendChild(b);
    });
    if (current === -1) current = W.levels.length - 1;
    const mh = $('#map-hero');
    mh.style.left = W.nodes[current][0] + '%';
    mh.style.top = W.nodes[current][1] + '%';
    mh.classList.toggle('below', W.nodes[current][1] < 15);
    const ctx = mh.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, mh.width, mh.height);
    drawHero(ctx, save.hero, 0, 0, 2);
    const allDone = W.levels.every(l => l.late || P[l.id]);
    // Normal / Hard switch, once every world is beaten
    const hb = $('#btn-hard');
    hb.hidden = !allBeaten();
    hb.textContent = hardMap ? 'Worlds: Hard' : 'Worlds: Normal';
    hb.classList.toggle('ghost', !hardMap);
    hb.classList.toggle('hard-on', hardMap);
    hb.onclick = () => {
      sfx('tap');
      save.mode = hardMap ? 'normal' : 'hard';
      if (save.mode === 'hard' && !worldUnlocked(save.world)) save.world = 0;
      persist();
      toast(save.mode === 'hard' ? 'Hard worlds: type every answer and every fix yourself, fewer hearts, hints only after two misses, 1.5x XP and gold. Worlds unlock one by one again.' : 'Back to the normal worlds.');
      renderMap();
    };
    const nextW = WORLDS[save.world + 1];
    $('#map-banner').hidden = !allDone;
    if (hardMap) $('#map-banner').textContent = nextW ? `Hard World ${W.id} cleared! Hard World ${nextW.id} is open.` : 'Every Hard world is cleared. You have mastered Script & Sorcery.';
    else $('#map-banner').textContent = nextW ? `World ${W.id} cleared! World ${nextW.id}, ${/^the /i.test(nextW.name) ? nextW.name : 'the ' + nextW.name}, is open. Switch worlds above.` : `World ${W.id} cleared! More worlds are coming. Keep sharp in the Training grounds.`;
    if (!hardMap && !nextW && allBeaten()) $('#map-banner').textContent = 'Every world is beaten! Hard worlds are open: tap "Worlds: Normal" above the map to switch.';
  }
  const ARROW_L = '<svg viewBox="0 0 6 8" width="12" height="16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M4 0h1v8H4V7H3V6H2V5H1V3h1V2h1V1h1z"/></svg>';
  const ARROW_R = '<svg viewBox="0 0 6 8" width="12" height="16" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M1 0h1v1h1v1h1v1h1v2H4v1H3v1H2v1H1z"/></svg>';
  function lockSvg() {
    return '<svg viewBox="0 0 8 9" width="12" height="14" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M2 0h4v1h1v3h1v5H0V4h1V1h1zm0 1v3h4V1z"/></svg>';
  }
  function starRow(n, of, size) {
    let s = '';
    for (let i = 0; i < of; i++) s += `<svg viewBox="0 0 7 7" width="${size}" height="${size}" class="star${i < n ? ' on' : ''}" aria-hidden="true" shape-rendering="crispEdges"><path d="M3 0h1v2h3v1H6v1h1v3H6V6H4V5H3v1H1v1H0V4h1V3H0V2h3z"/></svg>`;
    return s;
  }
  $('#book-back').onclick = () => show('map');
  $('#shop-back').onclick = () => { show(shopReturn); shopReturn = 'map'; };
  const GEAR = '<svg viewBox="0 0 9 9" width="18" height="18" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M3 0h3v1h1v1h1v1h1v3H8v1H7v1H6v1H3V8H2V7H1V6H0V3h1V2h1V1h1zm0 3v3h3V3z"/></svg>';
  const HOME = '<svg viewBox="0 0 9 9" width="18" height="18" aria-hidden="true" shape-rendering="crispEdges"><path fill="currentColor" d="M4 0h1v1h1v1h1v1h1v1h1v1H8v4H5V6H4v3H1V5H0V4h1V3h1V2h1V1h1z"/></svg>';
  $('#btn-map-settings').innerHTML = GEAR;
  $('#btn-title').innerHTML = HOME;
  $('#lv-settings').innerHTML = GEAR;
  $('#btn-map-settings').onclick = () => { sfx('tap'); openSettings(); };
  $('#lv-settings').onclick = () => { if (L && L.busy) return; sfx('tap'); openSettings(); };
  $('#btn-title').onclick = () => { sfx('tap'); show('title'); };

  /* ---------------- spellbook (glossary) ---------------- */
  function renderBook() {
    let html = '', count = 0, total = 0;
    WORLDS.forEach(w => {
      let part = '';
      w.levels.forEach((lv, i) => {
        total += lv.learn.length;
        if (!save.done[lv.id]) return;
        for (const e of lv.learn) {
          count++;
          part += `<article class="entry px"><div class="entry-head"><h3>${esc(e.title)}</h3><span class="entry-lv">Level ${w.id}-${i + 1}</span></div><code class="entry-code">${Py.highlight(e.code)}</code><p>${esc(e.text)}</p></article>`;
        }
      });
      if (part) html += `<h3 class="book-world">World ${w.id} · ${esc(w.name)}</h3>${part}`;
    });
    const weak = Object.entries(save.weak || {}).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (weak.length) {
      const where = t => { for (const w of WORLDS) for (const lv of w.levels) if (lv.tags.includes(t)) return `${lv.id} ${lv.title}`; return t; };
      html = `<div class="focus px"><h3>Practice these</h3><p>You missed these most. Review bosses, the Tower and Training ask about them more often until you get them right.</p><ul>${weak.map(([t]) => `<li>${esc(where(t))}</li>`).join('')}</ul></div>` + html;
    }
    $('#book-count').textContent = `${count} of ${total} pages`;
    $('#book-list').innerHTML = html || '<p class="book-empty">Your spellbook is empty. Finish a level and its lesson appears here, ready to look back on.</p>';
  }

  /* ---------------- shop ---------------- */
  function renderShop() {
    $('#shop-gold').textContent = save.gold;
    const lvNow = heroLevel();
    const card = (kind, id, [label, price, need]) => {
      const owned = (kind === 'hat' ? save.owned.hats : save.owned.pets).includes(id);
      if (!owned && need > lvNow) return `<div class="shop-item px locked-item" data-kind="${kind}" data-id="${id}"><canvas width="88" height="88" aria-hidden="true"></canvas><div class="shop-name">${esc(label)}</div><button class="btn ghost" disabled>Reach Lv ${need}</button></div>`;
      const equipped = save.hero && (kind === 'hat' ? save.hero.hatStyle : save.hero.pet) === id;
      const btn = equipped ? '<button class="btn ghost" disabled>Equipped</button>' : owned ? `<button class="btn ghost" data-act="equip">Equip</button>` : `<button class="btn" data-act="buy">${price} gold</button>`;
      return `<div class="shop-item px" data-kind="${kind}" data-id="${id}"><canvas width="88" height="88" aria-hidden="true"></canvas><div class="shop-name">${esc(label)}</div>${btn}</div>`;
    };
    $('#shop-hats').innerHTML = Object.entries(HATS).filter(([id]) => id !== 'none').map(([id, v]) => card('hat', id, v)).join('');
    $('#shop-pets').innerHTML = Object.entries(PETS).filter(([id]) => id !== 'none').map(([id, v]) => card('pet', id, v)).join('');
    document.querySelectorAll('.shop-item').forEach(el => {
      const { kind, id } = el.dataset;
      const ctx = el.querySelector('canvas').getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const h = { ...save.hero };
      if (kind === 'hat') { h.hatStyle = id; drawHero(ctx, h, 14, 12, 3); }
      else { const p = PET_MAPS[id]; const s = Math.floor(70 / Math.max(p.map[0].length, p.map.length)); drawMap(ctx, p.map, p.pal, Math.round((88 - p.map[0].length * s) / 2), Math.round((88 - p.map.length * s) / 2), s); }
      const b = el.querySelector('[data-act]');
      if (!b) return;
      b.onclick = () => {
        const table = kind === 'hat' ? HATS : PETS, list = kind === 'hat' ? save.owned.hats : save.owned.pets;
        if (b.dataset.act === 'buy') {
          const price = table[id][1];
          if (save.gold < price) { toast(`You need ${price - save.gold} more gold. Win levels or train to earn it.`); sfx('bad'); return; }
          save.gold -= price; list.push(id); sfx('coin');
          toast(`${table[id][0]} bought and equipped.`);
        } else sfx('tap');
        if (kind === 'hat') save.hero.hatStyle = id; else save.hero.pet = id;
        persist(); renderShop();
      };
    });
  }

  /* ---------------- toast ---------------- */
  let toastT = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* ================= scene ================= */
  const cv = $('#scene-cv');
  const sctx = cv.getContext('2d');
  const scene = { active: false, bg: 'village', right: null, fx: [], t: 0, shake: 0, heroFlash: 0, heroGlow: 0 };
  const HERO_X = 40, GROUND = 166, RIGHT_X = 236;

  function setRight(spec) {
    if (!spec) scene.right = null;
    else if (spec.npc) scene.right = { type: 'npc', id: spec.npc, alpha: 1 };
    else {
      const f = FOES[spec.kind];
      scene.right = { type: 'foe', id: spec.kind, hp: spec.hp, max: spec.hp, flash: 0, lunge: 0, alpha: 1, dying: false, tint: spec.tint || '', s: f.s + (spec.tint === 'big' ? 1 : 0), weak: spec.weak || null, resist: spec.resist || null, spec: { ...spec } };
    }
    updateFoeBar();
    if (currentScreen === 'level') updateMusic();
  }
  // what the variation engine sees of the current foe: its spawn data plus live hp
  const foeCtx = () => (scene.right && scene.right.type === 'foe' ? { ...scene.right.spec, hp: scene.right.hp, weak: scene.right.weak, resist: scene.right.resist } : null);
  function foePal(r) {
    const f = FOES[r.id];
    if (r.id === 'wisp' && WISP_PAL[r.tint]) return WISP_PAL[r.tint];
    if (r.id === 'golem' && r.tint === 'ice') return { ...f.pal, S: '#7fb8d8', G: '#ffffff' };
    if (r.tint === 'queen') return { ...f.pal, P: '#b0306a' };
    if (r.tint === 'big' && r.id === 'slime') return { ...f.pal, G: '#3fae6a', D: '#1f6a3a' };
    return f.pal;
  }
  function foeName(r) {
    if (r.id === 'wisp' && WISP_PAL[r.tint]) return r.tint[0].toUpperCase() + r.tint.slice(1) + ' wisp';
    return (r.tint === 'queen' ? 'Bat queen' : r.tint === 'big' ? 'Big ' + FOES[r.id].name.toLowerCase() : FOES[r.id].name);
  }
  function rightBox() {
    const r = scene.right;
    if (!r) return null;
    if (r.type === 'npc') { const n = NPCS[r.id]; const w = n.map[0].length * 3, h = n.map.length * 3; return { x: RIGHT_X - w / 2, y: GROUND - h, w, h }; }
    const f = FOES[r.id];
    const w = f.map[0].length * r.s, h = f.map.length * r.s;
    const y = f.fly ? 64 + Math.round(Math.sin(scene.t / 14) * 5) : GROUND - h;
    return { x: Math.min(RIGHT_X - w / 2, 316 - w), y, w, h };
  }
  function updateFoeBar() {
    const r = scene.right, bar = $('#foe-bar');
    if (!r || r.type !== 'foe') { bar.hidden = true; return; }
    bar.hidden = false;
    $('#foe-name').textContent = foeName(r);
    $('#foe-hp').textContent = `${r.hp} / ${r.max} HP`;
    $('#foe-fill').style.width = (100 * r.hp / r.max) + '%';
    const tags = [];
    if (r.weak) tags.push(`<span class="tag weak">weak: ${r.weak}</span>`);
    if (r.resist) tags.push(`<span class="tag resist">resists: ${r.resist}</span>`);
    $('#foe-tags').innerHTML = tags.join('');
    $('#foe-tags').hidden = !tags.length;
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!scene.active) return;
    scene.t++;
    const c = sctx;
    c.save();
    if (scene.shake > 0) { c.translate(Math.round(Math.random() * 4 - 2), Math.round(Math.random() * 2 - 1)); scene.shake--; }
    const img = bgImage(scene.bg);
    c.imageSmoothingEnabled = true;
    if (img && img.complete && img.naturalWidth) c.drawImage(img, 0, 0, 320, 180);
    else { c.fillStyle = '#2e5a3a'; c.fillRect(0, 0, 320, 180); }
    c.imageSmoothingEnabled = false;

    c.fillStyle = 'rgba(10,8,20,.35)';
    c.fillRect(HERO_X + 4, GROUND - 2, 32, 4);
    const hero = save.hero || DEFAULT_HERO;
    if (hero.pet && hero.pet !== 'none') drawPet(c, hero.pet, HERO_X - 26, GROUND, 2, scene.t);
    const bob = reduceMotion ? 0 : Math.round(Math.sin(scene.t / 18));
    const aura = save.hero ? auraOf(heroLevel()) : null;
    if (aura) {
      // a glowing magic circle under the hero, brighter at higher ranks
      const pulse = reduceMotion ? 1 : 0.8 + 0.2 * Math.sin(scene.t / 14);
      const cx = HERO_X + 18, cy = GROUND - 1;
      const g = c.createRadialGradient(cx, cy, 1, cx, cy, 34);
      g.addColorStop(0, aura + 'cc'); g.addColorStop(0.6, aura + '55'); g.addColorStop(1, aura + '00');
      c.globalAlpha = pulse; c.fillStyle = g;
      c.beginPath(); c.ellipse(cx, cy, 34, 9, 0, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      if (!reduceMotion && scene.t % 5 === 0) scene.fx.push({ type: 'p', x: HERO_X + 2 + Math.random() * 32, y: GROUND - 2 - Math.random() * 10, vx: (Math.random() - 0.5) * 0.3, vy: -0.7 - Math.random() * 0.5, life: 26, col: aura });
    }
    drawHero(c, hero, HERO_X, GROUND - 50 + bob, 2, { white: scene.heroFlash > 0 && scene.heroFlash % 4 < 2, glow: scene.heroGlow > 0 });
    if (scene.heroFlash > 0) scene.heroFlash--;
    if (scene.heroGlow > 0) scene.heroGlow--;

    const r = scene.right;
    if (r) {
      const bx = rightBox();
      c.globalAlpha = r.alpha;
      if (r.type === 'npc') {
        c.fillStyle = 'rgba(10,8,20,.35)'; c.fillRect(bx.x + 4, GROUND - 2, bx.w - 8, 4);
        const n = NPCS[r.id];
        drawMap(c, n.map, n.pal, Math.round(bx.x), bx.y + (reduceMotion ? 0 : Math.round(Math.sin(scene.t / 22 + 1))), 3);
      } else {
        const f = FOES[r.id];
        let ox = 0, oy = 0;
        if (r.lunge > 0) { const p = Math.sin((r.lunge / 24) * Math.PI); ox = -Math.round(p * 120); r.lunge--; }
        if (r.dying) { r.alpha = Math.max(0, r.alpha - 0.03); oy = Math.round((1 - r.alpha) * 10); }
        if (!f.fly) { c.fillStyle = 'rgba(10,8,20,.35)'; c.fillRect(bx.x + 6 + ox, GROUND - 2, bx.w - 12, 4); }
        const squish = (r.id === 'slime' || r.id === 'inkling') && !reduceMotion ? Math.round(Math.sin(scene.t / 10)) : 0;
        if (f.crown || r.tint === 'queen') drawMap(c, CROWN_MAP, { Y: '#f0c53a', R: '#d0443a', G: '#5fd3ff' }, Math.round(bx.x + bx.w / 2) - 18 + ox, bx.y - 12 + oy, 3, r.flash > 0);
        drawMap(c, f.map, foePal(r), Math.round(bx.x) + ox, bx.y + oy + squish, r.s, r.flash > 0 && r.flash % 4 < 2);
        if (r.flash > 0) r.flash--;
      }
      c.globalAlpha = 1;
    }

    scene.fx = scene.fx.filter(f => f.alive !== false);
    for (const f of scene.fx) {
      if (f.type === 'bolt') {
        const p = Math.min(1, (performance.now() - f.t0) / f.dur);
        if (p >= 1) { f.alive = false; continue; }
        const x = f.x + (f.tx - f.x) * p, y = f.y + (f.ty - f.y) * p - Math.sin(p * Math.PI) * 18;
        const [c1, c2] = SPELL_COL[f.spell];
        c.fillStyle = c1; c.fillRect(Math.round(x) - 5, Math.round(y) - 5, 10, 10);
        c.fillStyle = c2; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
        if (scene.t % 2 === 0) scene.fx.push({ type: 'p', x, y, vx: -1 - Math.random(), vy: Math.random() * 2 - 1, life: 14, col: c1 });
      } else if (f.type === 'p') {
        f.x += f.vx; f.y += f.vy; f.life--;
        c.fillStyle = f.col;
        const s = f.life > 7 ? 3 : 2;
        c.fillRect(Math.round(f.x), Math.round(f.y), s, s);
        if (f.life <= 0) f.alive = false;
      }
    }
    c.restore();
  }
  requestAnimationFrame(frame);

  function burst(x, y, col, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2.5;
      scene.fx.push({ type: 'p', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 12 + Math.random() * 10, col });
    }
  }
  function floatText(text, x, y, cls) {
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.textContent = text;
    el.style.left = (x / 320 * 100) + '%';
    el.style.top = (y / 180 * 100) + '%';
    $('#scene-ov').appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
  function bubble(text) {
    const b = $('#bubble');
    b.textContent = text.length > 40 ? text.slice(0, 38) + '…' : text;
    b.hidden = false;
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    clearTimeout(bubble.t);
    bubble.t = setTimeout(() => { b.hidden = true; }, 1800);
  }
  function castFx(spell, power, label) {
    return new Promise(resolve => {
      sfx('cast');
      scene.heroGlow = 12;
      const r = scene.right;
      const hit = r && r.type === 'foe' && r.hp > 0;
      const bx = hit ? rightBox() : null;
      const tx = hit ? bx.x + bx.w / 2 : 340, ty = hit ? bx.y + bx.h / 2 : 100;
      const dur = 440;
      scene.fx.push({ type: 'bolt', spell, x: HERO_X + 38, y: GROUND - 42, tx, ty, t0: performance.now(), dur });
      setTimeout(() => {
        if (hit) {
          if (r.weak === spell) { power *= 2; label = 'Weak!'; }
          else if (r.resist === spell) { power = Math.floor(power / 2); label = 'Resist'; }
          r.hp = Math.max(0, r.hp - power);
          r.flash = 14; scene.shake = r.weak === spell ? 14 : 8;
          burst(tx, ty, SPELL_COL[spell][0], r.weak === spell ? 26 : 14);
          floatText((label ? label + ' ' : '') + '-' + power, tx, bx.y - 4, r.resist === spell ? 'heal' : 'dmg');
          sfx('hit');
          updateFoeBar();
          if (r.hp <= 0) { r.dying = true; setTimeout(() => floatText('Defeated!', tx, bx.y - 4, 'win'), 450); }
        }
        setTimeout(resolve, hit ? 450 : 150);
      }, dur);
    });
  }
  async function counterattack(healTo, warded) {
    const r = scene.right;
    if (!r || r.type !== 'foe') return;
    r.dying = false; r.alpha = 1;
    r.lunge = 24;
    await wait(200);
    if (warded) { burst(HERO_X + 18, GROUND - 30, '#7fdcff', 22); sfx('ok'); floatText('Ward!', HERO_X + 20, GROUND - 60, 'heal'); }
    else { scene.heroFlash = 16; scene.shake = 6; sfx('bad'); Sound.vibrate(120); floatText('-1 heart', HERO_X + 20, GROUND - 60, 'dmg'); }
    await wait(300);
    if (healTo != null && r.hp < healTo) {
      floatText('+' + (healTo - r.hp), RIGHT_X, rightBox().y - 4, 'heal');
      r.hp = healTo; updateFoeBar();
    }
  }
  function fizzle() { burst(HERO_X + 38, GROUND - 42, '#8b8199', 10); scene.heroFlash = 10; }

  /* ---------------- hearts ---------------- */
  const HEART = on => `<svg viewBox="0 0 7 6" width="18" height="16" aria-hidden="true" shape-rendering="crispEdges"><path fill="${on ? '#ff5f6d' : '#3a3150'}" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/></svg>`;
  function renderHearts() {
    const el = $('#hearts');
    const inBattle = L && (L.arena || (scene.right && scene.right.type === 'foe'));
    el.hidden = !inBattle;
    if (!inBattle) return;
    const max = L.maxHearts || 3;
    el.innerHTML = Array.from({ length: max }, (_, i) => HEART(i < L.hearts)).join('');
    el.setAttribute('aria-label', `${L.hearts} of ${max} hearts`);
  }

  /* ================= level runner ================= */
  let L = null;
  const R = Engine.makeR();
  function chipKind(c) {
    const s = c.trim();
    if (/^[fF]?["']/.test(s)) return 'str';
    if (/^-?\d/.test(s)) return 'num';
    if (/^(==|!=|<=|>=|<|>|%|\/\/|[+\-*/=:]|\+=|-=|\*=)$/.test(s)) return 'op';
    if (/^(if|elif|else|else:|and|or|not|in|True|False|None)$/.test(s)) return 'kw';
    return 'name';
  }
  const KIND_LABEL = { str: 'Strings', num: 'Numbers', op: 'Signs', kw: 'Keywords', name: 'Names' };

  function startLevel(w, i, opts = {}) {
    const def = WORLDS[w].levels[i];
    const hard = opts.hard != null ? opts.hard : inHard();
    const hp0 = (hard ? 2 : 3) + heartBonus(heroLevel());
    L = { w, i, def, idx: -1, fails: 0, busy: false, hearts: hp0, maxHearts: hp0, hard, ward: hasWard(heroLevel()) };
    scene.bg = def.bg;
    scene.fx = [];
    scene.heroFlash = 0; scene.heroGlow = 0; scene.shake = 0;
    setRight(def.npc ? { npc: def.npc } : def.foe ? (typeof def.foe === 'function' ? def.foe(R) : { ...def.foe }) : null);
    $('#lv-title').textContent = `${def.id}. ${def.title}${hard ? ' · Hard' : ''}`;
    $('#result').hidden = true;
    $('#faint').hidden = true;
    $('#bubble').hidden = true;
    show('level');
    renderHearts();
    next();
  }
  $('#lv-exit').onclick = () => { if (L && L.busy) return; if (L && L.tower && L.floor > 1) { towerOver(); return; } L = null; show('map'); };

  function renderDots() {
    if (L.tower) { $('#lv-dots').innerHTML = `<span class="arena-hud">Floor ${L.floor} · best ${save.towerBest || 0}</span>`; return; }
    const n = L.def.steps.length;
    let h = '';
    for (let k = 0; k < n; k++) h += `<span class="dot${k < L.idx ? ' done' : k === L.idx ? ' on' : ''}"></span>`;
    $('#lv-dots').innerHTML = h;
    $('#lv-dots').setAttribute('aria-label', `Step ${L.idx + 1} of ${n}`);
  }
  function say(who, text, tone) {
    portrait($('#talk-portrait'), who);
    $('#talk-name').textContent = WHO_NAME(who);
    $('#talk-text').textContent = text;
    $('#talk').dataset.tone = tone || '';
  }
  function mentorSay(text, tone) { say(L.def.mentor, text, tone); }
  function setMain(label, fn) {
    const b = $('#btn-main');
    b.textContent = label;
    b.onclick = () => { if (!L || L.busy) return; fn(); };
  }
  function setHint(hints) {
    const b = $('#btn-hint');
    // Hard worlds: hints appear only after two misses on this step
    if (L && L.hard && hints && hints.length && (L.stepFails || 0) < 2) { L.pendingHints = hints; hints = null; }
    if (!hints || !hints.length) { b.hidden = true; return; }
    b.hidden = false;
    L.hintIdx = 0;
    b.onclick = () => {
      if (L.busy) return;
      const k = Math.min(L.hintIdx, hints.length - 1);
      mentorSay(`Hint ${k + 1} of ${hints.length}: ${hints[k]}`, 'hint');
      L.hintIdx++;
      sfx('tap');
    };
  }

  function next() {
    if (L.tower) { towerNext(); return; }
    L.idx++;
    if (L.idx >= L.def.steps.length) { finishLevel(); return; }
    runStep();
  }
  // reuse: retry the same variant after fainting; otherwise build a fresh one
  function runStep(reuse) {
    const raw = L.def.steps[L.idx];
    // a fresh variant every time: new values, new wrong choices, new order
    const replay = !!save.done[L.def.id];
    const st = reuse || Engine.instantiate(raw, { R, hero: save.hero.name, foe: foeCtx(), weak: save.weak, hard: L.hard, remix: L.tower ? 0.6 : L.hard ? 0.75 : replay ? 0.55 : 0.25 });
    L.st = st;
    L.stepFails = 0;
    if (st.spawn) setRight({ ...st.spawn });
    L.startHp = scene.right && scene.right.type === 'foe' ? scene.right.hp : 0;
    renderDots();
    renderHearts();
    $('#ctrl').innerHTML = '';
    $('#console').innerHTML = '';
    $('#jars').innerHTML = '';
    $('#editor').hidden = true;
    $('#code').hidden = false;
    renderShelf(st.files);
    setHint(null);
    $('#book').hidden = st.type === 'talk';
    ({ talk: stepTalk, demo: stepDemo, predict: stepPredict, fill: stepFill, fix: stepFix, write: stepWrite, order: stepOrder })[st.type](st);
  }

  function stepTalk(st) {
    say(st.who, st.text);
    setMain('Continue', () => { sfx('tap'); next(); });
  }

  /* ---- code panel ---- */
  function renderCode(lines, opts = {}) {
    const box = $('#code');
    box.innerHTML = '';
    lines.forEach((src, i) => {
      const ln = document.createElement(opts.tappable ? 'button' : 'div');
      ln.className = 'ln' + (opts.tappable ? ' tap' : '');
      ln.dataset.i = i;
      ln.innerHTML = `<span class="gut">${i + 1}</span><span class="src">${Py.highlight(src)}</span>`;
      if (opts.tappable) { ln.setAttribute('aria-label', `Line ${i + 1}: ${src}`); ln.onclick = () => opts.onTap(i); }
      box.appendChild(ln);
    });
  }
  function hlLine(i, cls = 'on') { document.querySelectorAll('#code .ln').forEach(el => el.classList.toggle(cls, +el.dataset.i === i)); }
  function clearMarks() { document.querySelectorAll('#code .ln').forEach(el => el.classList.remove('on', 'err')); }
  function renderJars(env, changed) {
    const keys = Object.keys(env);
    $('#jars').innerHTML = keys.map(k => `<span class="jar${k === changed ? ' bump' : ''}"><span class="jar-k">${esc(k)}</span><span class="jar-v t-${env[k].t === 'str' ? 'str' : 'num'}">${esc(env[k].text)}</span></span>`).join('');
  }
  function consoleNote(text, cls) {
    const d = document.createElement('div');
    d.className = 'out ' + cls;
    d.textContent = text;
    $('#console').appendChild(d);
  }
  function consoleLine(text) {
    const d = document.createElement('div');
    d.className = 'out' + (/ PASSED$/.test(text) ? ' pass' : / FAILED - /.test(text) ? ' fail' : /^== .* ==$/.test(text) ? ' sum' : '');
    d.textContent = text === '' ? ' ' : text;
    $('#console').appendChild(d);
  }
  function consoleError(err) {
    const d = document.createElement('div');
    d.className = 'out err';
    d.innerHTML = `<div><b>Line ${err.line + 1} · ${esc(err.type)}:</b> ${esc(err.msg)}</div><div class="why">${esc(Py.explain(err))}</div>`;
    $('#console').appendChild(d);
  }
  function condBadge(line, value, label, cls) {
    const ln = document.querySelector(`#code .ln[data-i="${line}"]`);
    if (!ln) return;
    const old = ln.querySelector('.badge');
    if (old) old.remove();
    const b = document.createElement('span');
    b.className = 'badge ' + (cls || (value ? 'yes' : 'no'));
    b.textContent = label || (value ? 'True' : 'False');
    ln.appendChild(b);
  }
  // Animate a run. Long traces (big loops, runaway recursion) play their first
  // steps, then fast-forward so the player is never stuck watching.
  const ANIMATE_LIMIT = 70;
  // the scroll shelf: files a spell can open, shown above the code
  function renderShelf(files, changed) {
    const box = $('#shelf');
    const names = Object.keys(files || {});
    box.hidden = !names.length;
    box.innerHTML = names.map(n => {
      const text = files[n].replace(/\r/g, '');
      // show every line break as ↵ so "write needs \n" is visible
      const NL = String.fromCharCode(10);
      const lines = text.split(NL);
      if (lines[lines.length - 1] === '') lines.pop();
      const body = text === '' ? '<span class="scroll-empty">(empty)</span>'
        : lines.map((ln, i) => esc(ln) + (i < lines.length - 1 || text.endsWith(NL) ? '<span class="nl">↵</span>' : '')).join(NL);
      return `<div class="scroll${n === changed ? ' bump' : ''}"><div class="scroll-name">${esc(n)}</div><pre class="scroll-body">${body}</pre></div>`;
    }).join('');
  }
  async function playback(lines, speed = 1) {
    const opts = L && L.st ? Engine.runOpts(L.st) : {};
    const startFiles = opts.files;
    const res = Py.run(lines, opts);
    const shelf = { ...(startFiles || {}) };
    if (startFiles) renderShelf(shelf);
    $('#console').innerHTML = '';
    $('#jars').innerHTML = '';
    clearMarks();
    document.querySelectorAll('#code .badge').forEach(b => b.remove());
    const cmd = opts.pytest ? `$ pytest ${opts.pytest === true ? 'test_spell.py' : opts.pytest}` : opts.argv ? `$ python ${opts.argv.join(' ')}` : null;
    const cmdNote = () => { if (cmd) consoleNote(cmd, 'cmd'); };
    cmdNote();
    let cur = -1, stream = '', n = 0, skipped = false;
    const busy = res.trace.length > 30 ? 0.55 : 1;
    const t = ms => (skipped ? Promise.resolve() : wait(reduceMotion ? Math.min(ms, 120) : ms * speed * busy));
    if (res.error && res.error.compile) {
      // like Python, a syntax or indentation error stops the spell before anything runs
      cur = res.error.line; hlLine(cur, 'err'); await t(300);
    }
    for (const ev of res.trace) {
      n++;
      if (!skipped && n > ANIMATE_LIMIT && ev.kind !== 'cast') {
        skipped = true;
        consoleNote(`… fast-forwarding ${res.trace.length - n} more steps`, 'skip');
      }
      if (ev.line !== cur && !skipped) { cur = ev.line; hlLine(cur); await t(300); }
      if (ev.kind === 'print') {
        stream += ev.raw;
        if (!skipped) {
          const shown = stream.endsWith('\n') ? stream.slice(0, -1) : stream;
          $('#console').innerHTML = '';
          cmdNote();
          shown.split('\n').forEach(consoleLine);
          bubble(ev.text); sfx(ev.test === 'fail' ? 'bad' : 'tap'); await t(380);
        }
      }
      else if (ev.kind === 'cond') { if (!skipped) { condBadge(ev.line, ev.value, ev.label, /^(done|break)/.test(ev.label || '') ? 'loop' : null); sfx(ev.value ? 'ok' : 'tap'); await t(340); } }
      else if (ev.kind === 'iter') { if (!skipped) { condBadge(ev.line, true, ev.label, 'loop'); renderJars(ev.env, ev.name); sfx('tap'); await t(300); } }
      else if (ev.kind === 'call') { if (!skipped) { cur = ev.line; hlLine(cur); condBadge(ev.line, true, `called`, 'loop'); renderJars(ev.env); await t(320); } }
      else if (ev.kind === 'ret') { if (!skipped) { condBadge(ev.line, true, ev.label, 'yes'); await t(320); } }
      else if (ev.kind === 'error-caught') { if (!skipped) { hlLine(ev.line, 'err'); consoleNote(`Caught ${ev.type}: ${ev.msg}`, 'caught'); sfx('bad'); await t(420); } }
      else if (ev.kind === 'cast') { await castFx(ev.spell, ev.power); }
      else if (ev.kind === 'file') { shelf[ev.name] = ev.text; if (!skipped) { renderShelf(shelf, ev.name); sfx('tap'); await t(260); } }
      else if (ev.kind === 'assign') { if (!skipped) { renderJars(ev.env, ev.name); await t(220); } }
      else if (ev.kind === 'step') { if (!skipped) renderJars(ev.env); }
      else if (ev.kind === 'error') {
        if (skipped) { const shown = stream.endsWith('\n') ? stream.slice(0, -1) : stream; const keep = $('#console').lastChild; $('#console').innerHTML = ''; if (shown) shown.split('\n').slice(-12).forEach(consoleLine); if (keep) $('#console').appendChild(keep); }
        consoleError(ev); hlLine(ev.line, 'err'); fizzle(); sfx('err'); await wait(300);
      }
    }
    if (skipped && !res.error) {
      const shown = stream.endsWith('\n') ? stream.slice(0, -1) : stream;
      const note = $('#console').querySelector('.skip');
      $('#console').innerHTML = '';
      cmdNote();
      if (shown) shown.split('\n').forEach(consoleLine);
      if (note) $('#console').appendChild(note);
      const lastEnv = [...res.trace].reverse().find(e => e.env);
      if (lastEnv) renderJars(lastEnv.env);
    }
    if (Object.keys(res.files || {}).length) renderShelf(res.files);
    if (!res.error) hlLine(-1);
    return res;
  }

  const foeHp = () => (scene.right && scene.right.type === 'foe' ? scene.right.hp : null);
  function goalMet(st, res) {
    const g = st.goal || {};
    if (g.error) return !!res.error && res.error.type === g.error;
    if (res.error) return false;
    if (g.output && (res.output.length !== g.output.length || res.output.some((o, k) => o !== g.output[k]))) return false;
    if (g.foeDown && !(foeHp() !== null && foeHp() <= 0)) return false;
    if (g.files) for (const n in g.files) if ((res.files || {})[n] !== g.files[n]) return false;
    if (g.foeAtMost != null && !(foeHp() !== null && foeHp() <= g.foeAtMost)) return false;
    return true;
  }
  function failMsg(st, res) {
    if (st.goal && st.goal.error) return res.error ? `That raised a ${res.error.type}, not a ${st.goal.error}. Try again.` : `That ran without any error. Make it raise a ${st.goal.error}.`;
    if (res.error) return `Your spell crashed with a ${res.error.type}. Read the red message in the spellbook.`;
    const out = res.output.join(' / ');
    if (st.wrong && st.wrong[out]) return st.wrong[out];
    const g = st.goal || {};
    if (g.output && (res.output.length !== g.output.length || res.output.some((o, k) => o !== g.output[k]))) return `The spellbook said ${out || 'nothing'}, but the quest needs ${g.output.join(' / ')}.`;
    if (g.files) for (const n in g.files) if ((res.files || {})[n] !== g.files[n]) return (res.files || {})[n] == null ? `The quest needs a scroll named ${n}, but your spell never made it.` : `${n} does not hold what the quest needs yet. Compare the shelf with the task, line breaks included.`;
    if ((g.foeDown || g.foeAtMost != null) && scene.right) return `The ${foeName(scene.right).toLowerCase()} still has ${scene.right.hp} HP. Not enough power! It shakes off the hit and heals up.`;
    return 'Not quite. Try again.';
  }
  // returns true when the hero fainted (the step restarts by itself)
  function markWeak(delta) {
    if (!L || !L.def) return;
    const tags = [...(L.def.tags || []), ...(L.st && L.st.tag ? [L.st.tag] : [])];
    save.weak = save.weak || {};
    for (const t of tags) { const v = Math.max(0, Math.min(9, (save.weak[t] || 0) + delta)); if (v) save.weak[t] = v; else delete save.weak[t]; }
  }
  async function onFail(msg, heal = true) {
    L.fails++; L.stepFails++;
    if (L.hard && L.pendingHints && L.stepFails >= 2) { const h = L.pendingHints; L.pendingHints = null; setHint(h); toast('A hint is ready.'); }
    markWeak(1);
    sfx('bad');
    mentorSay(msg, 'bad');
    const battle = scene.right && scene.right.type === 'foe';
    if (!battle) return false;
    if (L.ward) {
      L.ward = false;
      await counterattack(heal ? L.startHp : null, true);
      mentorSay(msg + ' Your mana ward blocked the hit!', 'bad');
      return false;
    }
    L.hearts--;
    renderHearts();
    await counterattack(heal ? L.startHp : null);
    if (L.hearts <= 0) { faint(); return true; }
    return false;
  }
  function faint() {
    sfx('err');
    Sound.vibrate([120, 60, 220]);
    $('#faint-text').textContent = `The ${foeName(scene.right).toLowerCase()} knocked you out. Your hearts are back. Read the hints and try that spell again.`;
    if (L.tower) $("#faint-text").textContent = `The ${foeName(scene.right).toLowerCase()} knocked you out on floor ${L.floor}. Your climb ends here, but the gold you won is yours.`;
    $("#faint-retry").textContent = L.tower ? "See results" : "Try again";
    $('#faint').hidden = false;
    $('#faint-retry').focus();
    $('#faint-retry').onclick = () => {
      sfx('tap');
      $('#faint').hidden = true;
      L.hearts = L.maxHearts || 3;
      if (scene.right && scene.right.type === 'foe') { scene.right.hp = L.startHp; scene.right.dying = false; scene.right.alpha = 1; updateFoeBar(); }
      L.busy = false;
      if (L.arena) { arenaRestart(); return; }
      if (L.tower) { towerOver(); return; }
      const fails = L.stepFails, typedSoFar = $('#ta').value;
      runStep(L.st);
      L.stepFails = fails;
      if (L.st.type === 'write') $('#ta').value = typedSoFar;
    };
  }
  function onSuccess(text) {
    if (!L.stepFails) markWeak(-0.25);
    if (L.tower) { towerWin(text); return; }
    sfx('ok');
    mentorSay(text, 'good');
    setHint(null);
    setMain('Continue', () => { sfx('tap'); next(); });
  }
  const PRAISE = ['Well cast!', 'Perfect spell!', 'Nicely done!', 'The spellbook glows!', 'Brilliant!', 'Sharp thinking!'];
  const praise = () => pick(PRAISE);
  const runLabel = () => (scene.right && scene.right.type === 'foe' ? 'Cast' : 'Run');

  function stepDemo(st) {
    mentorSay(st.text);
    renderCode(st.code);
    setMain(runLabel(), async () => {
      L.busy = true;
      await playback(st.code);
      L.busy = false;
      setMain('Continue', () => { sfx('tap'); next(); });
    });
  }

  function wantBox(lines) {
    const d = document.createElement('div');
    d.className = 'want';
    d.innerHTML = '<div class="ctrl-label">The spellbook must say</div>' + lines.map(l => `<div class="want-line">${esc(l === '' ? ' ' : l)}</div>`).join('');
    return d;
  }
  function stepPredict(st) {
    if (st.typed) { stepTypedAnswer(st); return; }
    mentorSay(st.text);
    const which = st.format === 'whichcode';
    if (which) { $('#code').innerHTML = ''; $('#code').appendChild(wantBox(st.want)); }
    else renderCode(st.code);
    if (st.format === 'count' && st.mark != null) hlLine(st.mark, 'mark');
    const ctrl = $('#ctrl');
    ctrl.innerHTML = `<div class="ctrl-label">${which ? 'Pick the spell' : 'Pick your answer'}</div><div class="choices"></div>`;
    const box = ctrl.querySelector('.choices');
    setMain('Pick an answer', () => toast('Tap one of the answers first.'));
    st.choices.forEach((c, k) => {
      const b = document.createElement('button');
      b.className = 'choice' + (which ? ' code-choice' : '');
      b.innerHTML = which
        ? `<span class="choice-k">${'ABC'[k]}</span><span class="mini-code">${st.codeChoices[k].map(l => `<span class="mini-ln">${Py.highlight(l) || ' '}</span>`).join('')}</span>`
        : `<span class="choice-k">${'ABC'[k]}</span><code>${esc(c)}</code>`;
      b.onclick = async () => {
        if (L.busy || box.dataset.locked) return;
        box.dataset.locked = '1';
        b.classList.add('picked');
        sfx('tap');
        L.busy = true;
        const prog = which ? st.codeChoices[k] : st.code;
        if (which) renderCode(prog);
        if (!st.shell) await playback(prog);
        const right = k === st.answer;
        box.children[st.answer].classList.add('right');
        if (!right) {
          b.classList.add('wrong');
          const fainted = await onFail(`Not quite. ${st.explain}`, false);
          L.busy = false;
          if (fainted) return;
          setMain('Continue', () => { sfx('tap'); next(); });
        } else {
          // review bosses: a right answer is a spell
          if (st.reward && scene.right && scene.right.type === 'foe') await castFx(st.reward.spell, st.reward.power);
          L.busy = false;
          onSuccess(`${praise()} ${st.explain}`);
        }
      };
      box.appendChild(b);
    });
  }

  // Hard worlds: no choices, type exactly what the spellbook will say
  function stepTypedAnswer(st) {
    const errQ = st.measure === 'errtype';
    mentorSay(`${st.text} ${errQ ? 'Type the error name, or No error.' : 'Type exactly what it will say, one line per printed line.'}`);
    renderCode(st.code);
    const ctrl = $('#ctrl');
    ctrl.innerHTML = '<div class="ctrl-label">Your answer</div><textarea id="typed-answer" class="typed-answer" rows="2" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="Your answer"></textarea>';
    const ta = $('#typed-answer');
    ta.rows = Math.min(6, Math.max(2, (st.choices[st.answer] || '').split(' / ').length + 1));
    setMain('Check', async () => {
      const val = ta.value;
      if (!val.trim()) { toast('Type your answer first.'); ta.focus(); return; }
      L.busy = true;
      ta.blur(); ta.readOnly = true;
      await playback(st.code);
      if (Engine.answerOk(st, val)) {
        if (st.reward && scene.right && scene.right.type === 'foe') await castFx(st.reward.spell, st.reward.power);
        L.busy = false;
        onSuccess(`${praise()} ${st.explain}`);
        return;
      }
      const fainted = await onFail(`Not quite. The answer was: ${st.choices[st.answer]}. ${st.explain}`, false);
      L.busy = false;
      if (fainted) return;
      setMain('Continue', () => { sfx('tap'); next(); });
    });
    setTimeout(() => ta.focus(), 50);
  }

  /* ---- order: put the shuffled lines back ---- */
  function stepOrder(st) {
    mentorSay(st.text);
    L.O = { placed: [], pool: st.pieces.map((p, i) => i) };
    renderOrder(st);
    setMain(runLabel(), () => runOrder(st));
  }
  function renderOrder(st) {
    const O = L.O;
    const box = $('#code');
    box.innerHTML = '';
    if (!O.placed.length) { const e = document.createElement('div'); e.className = 'order-empty'; e.textContent = 'Tap lines below to build the spell, top to bottom.'; box.appendChild(e); }
    O.placed.forEach((pi, i) => {
      const ln = document.createElement('button');
      ln.className = 'ln tap';
      ln.dataset.i = i;
      ln.setAttribute('aria-label', `Line ${i + 1}: ${st.pieces[pi]}. Tap to remove`);
      ln.innerHTML = `<span class="gut">${i + 1}</span><span class="src">${Py.highlight(st.pieces[pi])}</span>`;
      ln.onclick = () => { if (L.busy) return; sfx('tap'); O.placed.splice(i, 1); O.pool.push(pi); O.pool.sort((x, y) => x - y); renderOrder(st); };
      box.appendChild(ln);
    });
    const ctrl = $('#ctrl');
    ctrl.innerHTML = O.pool.length ? '<div class="ctrl-label">Shuffled lines</div><div class="order-pool"></div>' : '<div class="ctrl-label">All lines placed. Tap one to take it back, or cast the spell.</div>';
    const pool = ctrl.querySelector('.order-pool');
    if (pool) O.pool.forEach(pi => {
      const b = document.createElement('button');
      b.className = 'order-piece';
      b.innerHTML = `<span class="src">${Py.highlight(st.pieces[pi])}</span>`;
      b.setAttribute('aria-label', 'Add line: ' + st.pieces[pi]);
      b.onclick = () => { if (L.busy) return; sfx('tap'); O.placed.push(pi); O.pool = O.pool.filter(x => x !== pi); renderOrder(st); };
      pool.appendChild(b);
    });
  }
  async function runOrder(st) {
    const O = L.O;
    if (O.pool.length) { toast('Place every line first.'); return; }
    L.busy = true;
    const prog = O.placed.map(pi => st.pieces[pi]);
    renderCode(prog);
    const res = await playback(prog);
    if (goalMet(st, res)) { L.busy = false; onSuccess(`${praise()} ${st.explain}`); return; }
    if (await onFail(res.error ? `That order crashes with ${res.error.type}. Think about what has to exist before it is used.` : `That order says ${res.output.join(' / ') || 'nothing'}. Try again.`)) return;
    L.busy = false;
    if (L.stepFails >= 3) { const used = new Set(); O.placed = st.code.map(l => { const i = st.pieces.findIndex((p, j) => p === l && !used.has(j)); used.add(i); return i; }); O.pool = []; toast('The right order is filled in. Read it, then cast it.'); }
    renderOrder(st);
  }

  /* ---- fill ---- */
  function stepFill(st) {
    mentorSay(st.text);
    setHint(st.hints);
    const parts = st.lines.map(l => l.split('[]'));
    const nSlots = parts.reduce((a, p) => a + p.length - 1, 0);
    L.F = { parts, slots: Array(nSlots).fill(null), sel: 0, removed: new Set(), solved: false };
    renderFill(st);
    setMain(runLabel(), () => runFill(st));
  }
  function assembled(F) {
    let k = 0;
    return F.parts.map(p => p.map((seg, j) => (j < p.length - 1 ? seg + (F.slots[k++] ?? '') : seg)).join(''));
  }
  function renderFill(st) {
    const F = L.F;
    const box = $('#code');
    box.innerHTML = '';
    let k = 0;
    F.parts.forEach((p, i) => {
      const ln = document.createElement('div');
      ln.className = 'ln';
      ln.dataset.i = i;
      let html = `<span class="gut">${i + 1}</span><span class="src">`;
      p.forEach((seg, j) => {
        html += Py.highlight(seg);
        if (j < p.length - 1) {
          const v = F.slots[k];
          const cls = 'slot' + (v != null ? ' filled k-' + chipKind(v) : '') + (k === F.sel && !F.solved ? ' sel' : '');
          html += `<button class="${cls}" data-k="${k}" aria-label="${v != null ? 'Slot holding ' + esc(v) + ', tap to clear' : 'Empty slot'}">${v != null ? esc(v) : ''}</button>`;
          k++;
        }
      });
      ln.innerHTML = html + '</span>';
      box.appendChild(ln);
    });
    box.querySelectorAll('.slot').forEach(b => {
      b.onclick = () => {
        if (L.busy || F.solved) return;
        const kk = +b.dataset.k;
        if (F.slots[kk] != null) F.slots[kk] = null;
        F.sel = kk;
        sfx('tap');
        renderFill(st);
      };
    });
    const ctrl = $('#ctrl');
    const groups = {};
    st.chips.forEach(c => { if (!F.removed.has(c)) (groups[chipKind(c)] = groups[chipKind(c)] || []).push(c); });
    ctrl.innerHTML = Object.keys(groups).map(g => `<div class="chip-row"><span class="ctrl-label">${KIND_LABEL[g]}</span><div class="chips">${groups[g].map(c => `<button class="chip k-${g}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>`).join('');
    ctrl.querySelectorAll('.chip').forEach(b => {
      b.onclick = () => {
        if (L.busy || F.solved) return;
        let target = F.sel;
        if (target == null || target >= F.slots.length) target = F.slots.findIndex(s => s == null);
        if (target === -1) target = F.slots.length - 1;
        F.slots[target] = b.dataset.c;
        const nextEmpty = F.slots.findIndex((s, j) => s == null && j > target);
        F.sel = nextEmpty !== -1 ? nextEmpty : F.slots.findIndex(s => s == null);
        if (F.sel === -1) F.sel = null;
        sfx('tap');
        renderFill(st);
      };
    });
  }
  async function runFill(st) {
    const F = L.F;
    if (F.slots.some(s => s == null)) { toast('Fill every empty slot first.'); return; }
    L.busy = true;
    const lines = assembled(F);
    F.sel = null; renderFill(st);
    const res = await playback(lines);
    let ok = goalMet(st, res);
    let msg = ok ? null : failMsg(st, res);
    if (ok && st.require) { const r = st.require(F.slots); if (r) { ok = false; msg = r; } }
    if (ok) { F.solved = true; renderFill(st); L.busy = false; onSuccess(praise()); return; }
    if (await onFail(msg)) return;
    if (L.stepFails >= 2) {
      const used = new Set((st.answer || []).flat());
      const decoy = st.chips.find(c => !used.has(c) && !F.removed.has(c));
      if (decoy) {
        F.removed.add(decoy);
        F.slots = F.slots.map(s => (s === decoy ? null : s));
        toast(`Made it easier: removed the ${decoy} block.`);
      }
    }
    F.sel = F.slots.findIndex(s => s == null);
    if (F.sel === -1) F.sel = 0;
    renderFill(st);
    if (res.error) hlLine(res.error.line, 'err');
    L.busy = false;
  }

  /* ---- fix ---- */
  function stepFix(st) {
    mentorSay(st.text);
    renderCode(st.code);
    L.X = { phase: 'run' };
    setMain(runLabel(), async () => {
      L.busy = true;
      await playback(st.code);
      if (scene.right && scene.right.type === 'foe' && scene.right.hp !== L.startHp) { scene.right.hp = L.startHp; scene.right.dying = false; scene.right.alpha = 1; updateFoeBar(); }
      L.busy = false;
      L.X.phase = 'find';
      mentorSay('Now tap the line you think is broken.');
      setMain('Tap a line', () => toast('Tap the line in the spellbook that you think is broken.'));
      renderCode(st.code, { tappable: true, onTap: i => pickLine(st, i) });
    });
  }
  function pickLine(st, i) {
    if (L.busy || L.X.phase === 'done' || L.X.phase === 'typing') return;
    sfx('tap');
    if (i !== st.bad) {
      L.fails++;
      mentorSay(`Line ${i + 1} looks fine. Start at the line where things go wrong, then check the lines above it.`, 'bad');
      return;
    }
    hlLine(i, 'on');
    if (st.typedFix) { typedFixBox(st); return; }
    mentorSay(`Yes, line ${i + 1} is the problem. Which fix is right?`);
    const ctrl = $('#ctrl');
    ctrl.innerHTML = '<div class="ctrl-label">Replace the line with</div><div class="choices"></div>';
    const box = ctrl.querySelector('.choices');
    st.options.forEach((o, k) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = `<span class="choice-k">${'ABC'[k]}</span><code>${Py.highlight(o)}</code>`;
      b.onclick = () => tryFix(st, k, b);
      box.appendChild(b);
    });
  }
  function typedFixBox(st, prefill) {
    L.X.phase = 'typing';
    mentorSay(`Yes, line ${st.bad + 1} is the problem. Rewrite it so the spell works.`);
    const ctrl = $('#ctrl');
    ctrl.innerHTML = `<div class="ctrl-label">Rewrite line ${st.bad + 1}</div><input id="fix-line" class="fix-line" type="text" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" aria-label="Line ${st.bad + 1}">`;
    const inp = $('#fix-line');
    inp.value = prefill != null ? prefill : st.code[st.bad];
    setMain(runLabel(), () => tryTypedFix(st));
    inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); tryTypedFix(st); } };
    setTimeout(() => inp.focus(), 50);
  }
  async function tryTypedFix(st) {
    if (L.busy || L.X.phase === 'done') return;
    const inp = $('#fix-line');
    let line = inp.value.replace(/\s+$/, '');
    if (!line.trim()) { toast('Type the fixed line first.'); return; }
    // keep the line's indentation if it was left out
    const indent = st.code[st.bad].match(/^ */)[0];
    if (!/^ /.test(line)) line = indent + line;
    L.busy = true;
    sfx('tap');
    const lines = st.code.slice();
    lines[st.bad] = line;
    renderCode(lines);
    const res = await playback(lines);
    if (goalMet(st, res)) {
      L.X.phase = 'done';
      L.busy = false;
      onSuccess(`${praise()} ${st.explain}`);
      return;
    }
    if (await onFail(res.error ? `That line crashed: ${res.error.type}. Try again.` : `That runs, but it gives ${res.output.join(' / ') || 'nothing'}. Try again.`)) return;
    renderCode(st.code);
    hlLine(st.bad, 'on');
    L.busy = false;
    const reveal = L.stepFails >= 3;
    if (reveal) toast('The fixed line is filled in. Read it, then cast it.');
    typedFixBox(st, reveal ? st.options[st.answer] : line);
  }
  async function tryFix(st, k, btn) {
    if (L.busy || L.X.phase === 'done') return;
    L.busy = true;
    sfx('tap');
    const lines = st.code.slice();
    lines[st.bad] = st.options[k];
    renderCode(lines);
    const res = await playback(lines);
    if (k === st.answer && goalMet(st, res)) {
      L.X.phase = 'done';
      btn.classList.add('right');
      L.busy = false;
      onSuccess(`${praise()} ${st.explain}`);
      return;
    }
    btn.classList.add('wrong');
    if (await onFail(res.error ? `That fix crashed too: ${res.error.type}. Try another one.` : `That runs, but it gives ${res.output.join(' / ') || 'nothing'}. Try another fix.`)) return;
    renderCode(st.code, { tappable: true, onTap: i => pickLine(st, i) });
    hlLine(st.bad, 'on');
    L.busy = false;
  }

  /* ---- write (typing) ---- */
  function stepWrite(st) {
    mentorSay(st.text);
    setHint(st.hints);
    renderCode(st.starter);
    $('#code').hidden = !st.starter.length;
    const ed = $('#editor'), ta = $('#ta');
    ed.hidden = false;
    ta.value = '';
    ta.rows = Math.max(2, st.solution.length + 1);
    $('#ta-label').textContent = st.starter.length ? `Your spell continues at line ${st.starter.length + 1}` : 'Type your spell';
    const kbar = $('#kbar');
    const blocks = st.keys.some(k => /^(if|elif|else|else:)$/.test(k.trim()));
    const extra = [['\n', '⏎', 'New line']].concat(blocks ? [['\t', '⇥', 'Indent 4 spaces'], ['\b', '⇤', 'Remove indent']] : []);
    kbar.innerHTML = st.keys.map(k => `<button class="key k-${chipKind(k)}" data-k="${esc(k)}">${esc(k.trim())}</button>`).join('') +
      extra.map(([k, label, aria]) => `<button class="key k-op" data-k="${esc(k)}" aria-label="${aria}">${label}</button>`).join('');
    kbar.querySelectorAll('.key').forEach(b => {
      b.addEventListener('pointerdown', e => e.preventDefault());
      b.onclick = () => { if (L.busy) return; insertKey(ta, b.dataset.k); ta.focus(); sfx('tap'); };
    });
    setMain(runLabel(), () => runWrite(st));
  }
  const SPACED = ['+', '-', '*', '/', '=', '*=', '+=', '-=', '==', '!=', '<', '>', '<=', '>=', '%', '//', 'and', 'or', 'in'];
  function lineStart(ta, s) { return ta.value.lastIndexOf('\n', s - 1) + 1; }
  function newline(ta) {
    const s = ta.selectionStart, ls = lineStart(ta, s);
    const cur = ta.value.slice(ls, s);
    let indent = cur.match(/^ */)[0];
    if (/:\s*$/.test(cur)) indent += '    ';
    ta.setRangeText('\n' + indent, s, ta.selectionEnd, 'end');
  }
  function insertKey(ta, k) {
    const s = ta.selectionStart, e = ta.selectionEnd;
    const ls = lineStart(ta, s);
    if (k === '\n') { newline(ta); return; }
    if (k === '\t') { ta.setRangeText('    ', s, e, 'end'); return; }
    if (k === '\b') {
      const pad = ta.value.slice(ls).match(/^ */)[0].length;
      const cut = Math.min(4, pad);
      if (cut) { ta.setRangeText('', ls, ls + cut, 'preserve'); ta.selectionStart = ta.selectionEnd = Math.max(ls, s - cut); }
      return;
    }
    let ins = k;
    const word = k.trim();
    let before = ta.value.slice(0, s);
    const onlySpaces = /^ *$/.test(ta.value.slice(ls, s));
    // else and elif line up with their if: step back out of the block
    if (/^(else|elif)/.test(word) && onlySpaces && s - ls >= 4) {
      ta.setRangeText('', s - 4, s, 'end');
      return insertKey(ta, k);
    }
    if (/^(if|elif)$/.test(word)) ins = word + ' ';
    else if (SPACED.includes(word)) ins = (/[\s(]$/.test(before) || !before || onlySpaces ? '' : ' ') + word + ' ';
    else if (word === ',') ins = ', ';
    else if (word === 'not') ins = (/[\s(]$/.test(before) || onlySpaces ? '' : ' ') + 'not ';
    else if (/^[A-Za-z_"]/.test(word) && /[A-Za-z0-9_)"']$/.test(before) && !onlySpaces) ins = ' ' + word;
    else ins = word;
    ta.setRangeText(ins, s, e, 'end');
  }
  // phone keyboards: keep the indent when pressing return
  $('#ta').addEventListener('beforeinput', ev => {
    if (ev.inputType === 'insertLineBreak' || ev.inputType === 'insertParagraph') { ev.preventDefault(); newline(ev.target); }
  });
  $('#ta').addEventListener('keydown', ev => {
    if (ev.key === 'Tab') { ev.preventDefault(); insertKey(ev.target, ev.shiftKey ? '\b' : '\t'); }
  });
  async function runWrite(st) {
    const ta = $('#ta');
    const user = ta.value.replace(/\s+$/, '').split('\n');
    if (!ta.value.trim()) { toast('Type your spell first.'); ta.focus(); return; }
    L.busy = true;
    ta.blur();
    const program = [...st.starter, ...user];
    $('#editor').hidden = true;
    $('#code').hidden = false;
    renderCode(program);
    const res = await playback(program);
    let ok = goalMet(st, res);
    let msg = ok ? null : failMsg(st, res);
    if (ok && st.require) { const r = st.require(user); if (r) { ok = false; msg = r; } }
    if (ok) { L.busy = false; onSuccess(praise()); return; }
    if (await onFail(msg)) return;
    renderCode(st.starter);
    $('#code').hidden = !st.starter.length;
    $('#editor').hidden = false;
    if (L.stepFails >= 3) { ta.value = st.solution.join('\n'); toast('The answer is filled in. Read it, then cast it.'); }
    L.busy = false;
  }

  /* ---- finish ---- */
  function today(off = 0) { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
  function bumpStreak() {
    const t = today();
    if (save.lastDay === t) return;
    save.streak = save.lastDay === today(-1) ? (save.streak || 0) + 1 : 1;
    save.lastDay = t;
  }
  function finishLevel() {
    const def = L.def;
    const stars = L.fails === 0 ? 3 : L.fails <= 2 ? 2 : 1;
    const first = !save.done[def.id];
    const xp = Math.round((20 + stars * 10 + (def.boss ? 50 : 0)) * (L.hard ? 1.5 : 1));
    const gold = Math.round((stars * 5 + (def.boss ? 50 : 0)) * (L.hard ? 1.5 : 1));
    save.done[def.id] = Math.max(save.done[def.id] || 0, stars);
    if (L.hard) { save.hard = save.hard || {}; save.hard[def.id] = Math.max(save.hard[def.id] || 0, stars); }
    const gain = grant(xp, gold);
    bumpStreak();
    persist();
    sfx('win');
    Sound.music(null);
    const W = WORLDS[L.w], nextW = WORLDS[L.w + 1];
    $('#res-title').textContent = (L.hard ? 'Hard: ' : '') + (L.i === W.levels.length - 1 ? `World ${W.id} cleared!` : def.boss ? 'Boss defeated!' : 'Level complete');
    $('#res-stars').hidden = false;
    $('#res-stars').innerHTML = starRow(stars, 3, 34);
    $('#res-stars').setAttribute('aria-label', `${stars} of 3 stars`);
    $('#res-note').textContent = stars === 3 ? 'Flawless. No mistakes at all.' : `${L.fails} mistake${L.fails === 1 ? '' : 's'}. Replay any time for 3 stars.`;
    $('#res-xp').textContent = '+' + xp;
    $('#res-gold').textContent = '+' + gain.gold;
    showLevelUp(gain.ups);
    $('#res-learn').hidden = false;
    $('#res-learn').innerHTML = `<div class="ctrl-label">${first ? 'New spellbook pages' : 'Spellbook pages'}</div>` +
      def.learn.map(e => `<div class="res-entry"><code>${Py.highlight(e.code)}</code><span>${esc(e.title)}</span></div>`).join('');
    const hasNext = L.i + 1 < W.levels.length;
    $('#res-soon').hidden = hasNext || !!nextW;
    $('#res-soon').textContent = 'More worlds are coming. Keep your skills sharp in the Training grounds.';
    const nb = $('#res-next');
    nb.hidden = !hasNext && !nextW;
    nb.textContent = hasNext ? 'Next level' : `Go to World ${nextW ? nextW.id : ''}`;
    nb.onclick = () => {
      sfx('tap');
      if (hasNext) startLevel(L.w, L.i + 1, { hard: L.hard });
      else { save.world = L.w + 1; persist(); L = null; show('map'); }
    };
    $('#res-map').onclick = () => { sfx('tap'); L = null; show('map'); };
    $('#result').hidden = false;
    (nb.hidden ? $('#res-map') : nb).focus();
  }

  /* ================= training grounds ================= */
  const GEN = Arena.GEN;
  function unlockedTags() {
    const tags = [];
    WORLDS.forEach(w => w.levels.forEach(l => { if (save.done[l.id]) tags.push(...l.tags); }));
    return [...new Set(tags)].filter(t => GEN[t]);
  }
  const ARENA_FOES = ['slime', 'bat', 'inkling', 'paperbat', 'fireslime', 'iceslime', 'wisp', 'echobat', 'crystalslime', 'mimic', 'goblin', 'crab', 'seaslime', 'golem', 'skeleton', 'ghost', 'bookworm', 'sparkbot', 'knight', 'gearbot', 'bandit', 'serpent', 'bugswarm', 'sprite', 'wurm', 'riverspirit'];
  function startArena() {
    const tags = unlockedTags();
    if (!save.hero) return;
    if (!tags.length) { toast('Finish level 1-1 to open the Training grounds.'); return; }
    const hp0 = 3 + heartBonus(heroLevel());
    L = { arena: true, def: { mentor: 'coach', steps: [] }, tags, wave: 1, score: 0, combo: 0, hearts: hp0, maxHearts: hp0, fails: 0, busy: false };
    scene.bg = 'arena';
    scene.fx = [];
    scene.heroFlash = 0; scene.heroGlow = 0; scene.shake = 0;
    $('#lv-title').textContent = 'Training grounds';
    $('#result').hidden = true;
    $('#faint').hidden = true;
    $('#bubble').hidden = true;
    show('level');
    arenaSpawn();
    say('coach', `Captain Brin here! Answer fast and true. Every right answer hits the dummy monster. Three wrong answers and you are out. Best so far: ${save.arenaBest}.`);
    $('#book').hidden = true;
    $('#ctrl').innerHTML = '';
    $('#editor').hidden = true;
    renderShelf(null);
    setHint(null);
    arenaHud();
    setMain('Start training', () => { sfx('tap'); arenaQuestion(); });
  }
  function arenaRestart() { arenaOver(); }
  function arenaSpawn() {
    const hp = 30 + 10 * Math.floor((L.wave - 1) / 3);
    const kind = ARENA_FOES[(L.wave - 1) % ARENA_FOES.length];
    setRight({ kind, hp, tint: kind === 'wisp' ? pick(['fire', 'ice', 'water']) : '' });
    renderHearts();
  }
  function arenaHud() {
    $('#lv-dots').innerHTML = `<span class="arena-hud">Wave ${L.wave} · ${L.score} defeated${L.combo >= 2 ? ` · combo x${L.combo}` : ''}</span>`;
  }
  function arenaQuestion() {
    const q = GEN[Engine.weightedTag(L.tags, { rand: Math.random }, save.weak)](L.wave);
    L.q = q;
    L.st = q;
    renderShelf(q.files);
    say('coach', q.text);
    $('#book').hidden = false;
    $('#editor').hidden = true;
    $('#code').hidden = false;
    renderCode(q.code);
    $('#console').innerHTML = '';
    $('#jars').innerHTML = '';
    arenaHud();
    const ctrl = $('#ctrl');
    ctrl.innerHTML = '<div class="ctrl-label">Pick your answer</div><div class="choices"></div>';
    const box = ctrl.querySelector('.choices');
    setMain('Pick an answer', () => toast('Tap one of the answers first.'));
    q.choices.forEach((c, k) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = `<span class="choice-k">${'ABC'[k]}</span><code>${esc(c)}</code>`;
      b.onclick = async () => {
        if (L.busy || box.dataset.locked) return;
        box.dataset.locked = '1';
        b.classList.add('picked');
        L.busy = true;
        await playback(q.code, 0.6);
        box.children[q.answer].classList.add('right');
        if (k === q.answer) {
          L.combo++;
          const crit = L.combo >= 3;
          const tp = trainPower(heroLevel());
          await castFx(pick(['fireball', 'spark', 'icebolt']), crit ? Math.round(tp * 1.5) : tp, crit ? 'Crit!' : '');
          sfx('ok');
          say('coach', `${praise()} ${q.explain}`, 'good');
          if (scene.right.hp <= 0) {
            L.score++; L.wave++;
            sfx('coin');
            await wait(700);
            arenaSpawn();
          }
        } else {
          b.classList.add('wrong');
          L.combo = 0; L.fails++;
          L.hearts--;
          renderHearts();
          say('coach', `Not quite. ${q.explain}`, 'bad');
          await counterattack(null);
          if (L.hearts <= 0) { L.busy = false; arenaOver(); return; }
        }
        arenaHud();
        L.busy = false;
        setMain('Next question', () => { sfx('tap'); arenaQuestion(); });
      };
      box.appendChild(b);
    });
  }
  function arenaOver() {
    const best = Math.max(save.arenaBest || 0, L.score);
    const isBest = L.score > (save.arenaBest || 0);
    const gold = L.score * 4, xp = L.score * 6;
    save.arenaBest = best;
    const gain = grant(xp, gold);
    if (L.score > 0) bumpStreak();
    persist();
    sfx(isBest && L.score > 0 ? 'win' : 'bad');
    Sound.music(null);
    $('#res-title').textContent = 'Training over';
    $('#res-stars').hidden = true;
    $('#res-note').textContent = `You beat ${L.score} monster${L.score === 1 ? '' : 's'}. ${isBest && L.score > 0 ? 'New best!' : `Best: ${best}.`}`;
    $('#res-xp').textContent = '+' + xp;
    $('#res-gold').textContent = '+' + gain.gold;
    showLevelUp(gain.ups);
    $('#res-learn').hidden = true;
    $('#res-soon').hidden = true;
    const nb = $('#res-next');
    nb.hidden = false;
    nb.textContent = 'Train again';
    nb.onclick = () => { sfx('tap'); startArena(); };
    $('#res-map').onclick = () => { sfx('tap'); L = null; show('map'); };
    $('#result').hidden = false;
    nb.focus();
  }

  /* ================= the endless tower =================
     Every floor is a monster and one question, drawn from the levels you have beaten.
     The higher you climb, the later the worlds it draws from. Weak spots come up more. */
  const TOWER_FOES = ['slime', 'bat', 'inkling', 'fireslime', 'iceslime', 'wisp', 'echobat', 'crystalslime', 'mimic', 'goblin', 'crab', 'seaslime', 'golem', 'skeleton', 'ghost', 'bookworm', 'paperbat', 'sparkbot', 'knight', 'gearbot', 'bandit', 'serpent', 'bugswarm', 'sprite', 'wurm', 'riverspirit'];
  const TOWER_GUARDS = ['treant', 'goblinking', 'kraken', 'colossus', 'lich', 'archivist', 'wyrm', 'dragon', 'hydra', 'clockking', 'sandtitan', 'leviathan'];
  function towerPool() {
    const pool = [];
    WORLDS.forEach((w, wi) => w.levels.forEach(lv => {
      if (!save.done[lv.id]) return;
      lv.steps.forEach(raw => {
        if (!['predict', 'fill', 'fix', 'write', 'review'].includes(raw.type)) return;
        if (raw.measure === 'damage' || raw.spawn || (raw.goal && (raw.goal.foeDown || raw.goal.foeAtMost != null))) return;
        if (raw.vars && raw.vars.length >= 2) return;
        if (/\$HP|\{HP\}/.test(JSON.stringify(raw.text || ''))) return;
        pool.push({ raw, wi, tags: lv.tags, review: raw.type === 'review' });
      });
    }));
    return pool;
  }
  function startTower() {
    if (!save.hero) return;
    const pool = towerPool();
    if (pool.length < 5) { toast('Beat a few more levels to open the Tower.'); return; }
    const hp0 = 3 + heartBonus(heroLevel());
    L = { tower: true, def: { id: 'tower', mentor: 'oracle', tags: [], steps: [], learn: [] }, pool, floor: 1, idx: -1, fails: 0, busy: false, hearts: hp0, maxHearts: hp0, gold: 0, ward: hasWard(heroLevel()) };
    scene.bg = 'stairs';
    scene.fx = [];
    scene.heroFlash = 0; scene.heroGlow = 0; scene.shake = 0;
    $('#lv-title').textContent = 'The Endless Tower';
    $('#result').hidden = true;
    $('#faint').hidden = true;
    $('#bubble').hidden = true;
    show('level');
    towerSpawn();
    renderHearts();
    renderDots();
    say('oracle', `Oracle Vey here. Every floor of this tower holds one monster and one question from the worlds you have walked. Answer true and climb. Three wrong answers and you are out. Your best: floor ${save.towerBest || 0}.`);
    $('#book').hidden = true;
    $('#ctrl').innerHTML = '';
    $('#editor').hidden = true;
    renderShelf(null);
    setHint(null);
    setMain('Climb', () => { sfx('tap'); towerNext(); });
  }
  function towerSpawn() {
    const guard = L.floor % 5 === 0;
    const kind = guard ? TOWER_GUARDS[(L.floor / 5 - 1) % TOWER_GUARDS.length] : TOWER_FOES[(L.floor - 1) % TOWER_FOES.length];
    setRight({ kind, hp: 10 + L.floor * 3 + (guard ? 20 : 0), tint: kind === 'wisp' ? pick(['fire', 'ice', 'water']) : '' });
    L.guard = guard;
  }
  function towerNext() {
    if (!scene.right || scene.right.type !== 'foe' || scene.right.hp <= 0) { if (L.idx >= 0) { L.floor++; } towerSpawn(); }
    // deeper floors reach later worlds
    const maxW = Math.max(...L.pool.map(p => p.wi));
    const reach = Math.min(maxW, Math.floor(maxW * Math.min(1, (L.floor + 3) / 24)));
    let cands = L.pool.filter(p => p.wi <= reach && p.wi >= Math.max(0, reach - 4));
    if (L.guard) { const hardOnes = cands.filter(p => p.raw.type === 'write' || p.raw.type === 'fill'); if (hardOnes.length) cands = hardOnes; }
    if (!cands.length) cands = L.pool;
    const weight = p => 1 + p.tags.reduce((a, t) => a + Math.min(4, (save.weak || {})[t] || 0), 0) + (L.recent && L.recent.includes(p.raw) ? -0.9 : 0);
    let r = Math.random() * cands.reduce((a, p) => a + weight(p), 0), chosen = cands[0];
    for (const p of cands) { r -= weight(p); if (r < 0) { chosen = p; break; } }
    L.recent = [...(L.recent || []).slice(-12), chosen.raw];
    L.def.steps.push(chosen.raw);
    L.def.tags = chosen.tags;
    L.idx = L.def.steps.length - 1;
    L.hintIdx = 0;
    runStep();
    renderDots();
  }
  async function towerWin(text) {
    L.busy = true;
    sfx('ok');
    if (scene.right && scene.right.type === 'foe' && scene.right.hp > 0) await castFx(pick(['fireball', 'spark', 'icebolt']), scene.right.hp, L.guard ? 'Guardian down!' : '');
    const gain = L.guard ? 15 : 4;
    L.gold += gain;
    save.towerBest = Math.max(save.towerBest || 0, L.floor);
    persist();
    mentorSay(`${text} Floor ${L.floor} cleared. +${gain} gold.`, 'good');
    setHint(null);
    L.busy = false;
    renderDots();
    setMain('Next floor', () => { sfx('tap'); towerNext(); });
  }
  function towerOver() {
    const reached = L.floor - (scene.right && scene.right.hp > 0 ? 1 : 0);
    const best = Math.max(save.towerBest || 0, reached);
    const isBest = reached > (save.towerBest || 0);
    save.towerBest = best;
    const xp = reached * 8;
    const gain = grant(xp, L.gold);
    if (reached > 0) bumpStreak();
    persist();
    sfx(isBest && reached > 0 ? 'win' : 'bad');
    $('#faint').hidden = true;
    $('#res-title').textContent = 'The climb is over';
    $('#res-stars').hidden = true;
    $('#res-note').textContent = `You cleared ${reached} floor${reached === 1 ? '' : 's'}. ${isBest && reached > 0 ? 'New best!' : `Best: floor ${best}.`}`;
    $('#res-xp').textContent = '+' + xp;
    Sound.music(null);
    $('#res-gold').textContent = '+' + gain.gold;
    showLevelUp(gain.ups);
    $('#res-learn').hidden = true;
    $('#res-soon').hidden = true;
    const nb = $('#res-next');
    nb.hidden = false;
    nb.textContent = 'Climb again';
    nb.onclick = () => { sfx('tap'); startTower(); };
    $('#res-map').onclick = () => { sfx('tap'); L = null; show('map'); };
    $('#result').hidden = false;
    nb.focus();
  }

  /* ---------------- installable app (only on the hosted build) ---------------- */
  const hosted = !!document.querySelector('meta[name="sorcery-pwa"]');
  if (hosted && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* plays fine online without it */ }); });
  }
  // Install button: uses Chrome's own install box when it is offered, and explains
  // what to do when it is not (inside another app's browser, iPhone, already installed).
  if (hosted) {
    const ib = $('#btn-install'), hint = $('#install-hint');
    const ua = navigator.userAgent;
    const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const inApp = /; wv\)|FBAN|FBAV|Instagram|Line\/|GSA\//.test(ua);
    const ios = /iPhone|iPad|iPod/.test(ua);
    let promptEvent = null;
    const say = text => { hint.textContent = text; hint.hidden = false; };
    if (!installed) {
      ib.hidden = false;
      window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptEvent = e; hint.hidden = true; });
      window.addEventListener('appinstalled', () => { ib.hidden = true; say('Installed! Open Script & Sorcery from your home screen.'); });
      ib.onclick = async () => {
        sfx('tap');
        if (promptEvent) {
          promptEvent.prompt();
          const r = await promptEvent.userChoice.catch(() => null);
          if (r && r.outcome === 'accepted') ib.hidden = true;
          promptEvent = null;
          return;
        }
        if (inApp) say('You are inside another app\'s browser, which cannot install apps. Tap its ⋮ or share menu and choose "Open in Chrome", then tap Install app again.');
        else if (ios) say('On iPhone: tap the Share button in Safari, then "Add to Home Screen".');
        else say('In Chrome: tap ⋮ at the top right, then "Add to Home screen" and choose Install. If you only see "Create shortcut", wait a few seconds for the page to finish loading and try again.');
      };
    }
  }

  /* ---------------- never freeze ---------------- */
  // If something unexpected breaks mid-step, unlock the buttons and let the player move on.
  function recover(e) {
    if (!L || !L.busy) return;
    if (L.arena) { { L.busy = false; setMain('Next question', () => { sfx('tap'); arenaQuestion(); }); } return; }
    L.busy = false;
    mentorSay('Something glitched in the spellbook. That one is on me, not you. Tap Continue to move on.', 'bad');
    setMain('Continue', () => { sfx('tap'); next(); });
    try { console.error('recovered from', e && (e.reason || e.error || e.message)); } catch (x) { /* ignore */ }
  }
  window.addEventListener('unhandledrejection', recover);
  window.addEventListener('error', recover);

  /* ---------------- boot ---------------- */
  $('#talk').onclick = () => { if (L && !L.arena && L.st && L.st.type === 'talk' && !L.busy) { sfx('tap'); next(); } };
  // test hook for the local auto-player: http://localhost:5252/?debug
  if (/[?&]debug/.test(location.search)) window.__game = { L: () => L, startLevel, startTower, save: () => save, persist };
  show('title');
})();
