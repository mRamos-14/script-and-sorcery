/* Script & Sorcery: sound. Original chiptune music composed by code (no recordings),
   sound effects, and vibration, all controlled by the player's settings.
   Each track is built from a key, a mode, a chord progression and a seed: the seed
   writes the melody, so every world gets its own theme that is the same every visit. */
const Sound = (() => {
  'use strict';
  let ctx = null, master = null, musicBus = null, sfxBus = null;
  let settings = { mute: false, music: true, sfx: true, musicVol: 0.6, sfxVol: 0.8, vibrate: true };
  let current = null, wanted = null, timer = null;

  const MODES = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11], harmonic: [0, 2, 3, 5, 7, 8, 11], mixo: [0, 2, 4, 5, 7, 9, 10],
  };
  // bpm, lowest note (MIDI), mode, chords as scale degrees, drum style, lead loudness
  const STYLES = {
    menu: { bpm: 92, root: 57, mode: 'major', prog: [0, 5, 3, 4], drums: 'soft', lead: 0.55, seed: 11 },
    map: { bpm: 108, root: 55, mode: 'mixo', prog: [0, 3, 6, 4], drums: 'march', lead: 0.6, seed: 23 },
    level: { bpm: 82, root: 60, mode: 'lydian', prog: [0, 3, 5, 4], drums: 'none', lead: 0.45, seed: 37 },
    battle: { bpm: 138, root: 57, mode: 'minor', prog: [0, 5, 6, 4], drums: 'drive', lead: 0.6, seed: 41 },
    boss: { bpm: 150, root: 52, mode: 'harmonic', prog: [0, 0, 5, 4], drums: 'heavy', lead: 0.7, seed: 53 },
    tower: { bpm: 100, root: 62, mode: 'dorian', prog: [0, 3, 0, 6], drums: 'soft', lead: 0.5, seed: 67 },
    train: { bpm: 126, root: 59, mode: 'major', prog: [0, 4, 5, 3], drums: 'drive', lead: 0.55, seed: 71 },
  };
  const rng = seed => () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  // write a 8-bar loop: melody, bass, arpeggio and drums, 16 steps per bar
  function compose(style, variant) {
    const st = STYLES[style];
    const R = rng(st.seed * 97 + variant * 131 + 7);
    const scale = MODES[st.mode];
    const root = st.root + (variant % 5) - 2;
    const note = (deg, oct = 0) => root + scale[((deg % 7) + 7) % 7] + 12 * (Math.floor(deg / 7) + oct);
    const steps = 128;
    const mel = Array(steps).fill(null), bass = Array(steps).fill(null), arp = Array(steps).fill(null), drum = Array(steps).fill(null);
    // one 4-bar phrase, played twice; the second time ends on the home note
    const phrase = [];
    let deg = 7 + Math.floor(R() * 3);
    for (let s = 0; s < 64; s++) {
      const bar = Math.floor(s / 16), chord = st.prog[bar % st.prog.length];
      if (s % 2) { phrase.push(null); continue; }
      const strong = s % 8 === 0;
      if (!strong && R() < 0.28) { phrase.push(null); continue; }
      if (strong) {
        const tones = [chord, chord + 2, chord + 4].map(t => t + 7);
        deg = tones.reduce((best, t) => (Math.abs(t - deg) < Math.abs(best - deg) ? t : best), tones[0]);
      } else deg += R() < 0.5 ? (R() < 0.5 ? 1 : -1) : R() < 0.5 ? 2 : -2;
      deg = Math.max(4, Math.min(13, deg));
      phrase.push({ m: note(deg), len: strong && R() < 0.5 ? 4 : 2 });
    }
    for (let s = 0; s < 64; s++) { mel[s] = phrase[s]; mel[s + 64] = phrase[s]; }
    for (let s = 120; s < 128; s++) mel[s] = null;
    mel[120] = { m: note(7), len: 8 };
    for (let s = 0; s < steps; s++) {
      const bar = Math.floor(s / 16), chord = st.prog[bar % st.prog.length], beat = s % 16;
      const triad = [chord, chord + 2, chord + 4];
      if (st.drums === 'drive' || st.drums === 'heavy') { if (s % 2 === 0) bass[s] = { m: note(beat % 8 === 6 ? chord + 4 : chord, -1), len: 2 }; }
      else if (beat === 0 || beat === 8) bass[s] = { m: note(beat === 8 && st.drums === 'march' ? chord + 4 : chord, -1), len: 6 };
      if (s % 2 === 0) arp[s] = { m: note(triad[(s / 2) % 3], 1), len: 1 };
      const d = { none: [], soft: [[0, 'k'], [8, 'h'], [12, 'h']], march: [[0, 'k'], [4, 's'], [8, 'k'], [12, 's'], [2, 'h'], [6, 'h'], [10, 'h'], [14, 'h']], drive: [[0, 'k'], [4, 's'], [8, 'k'], [10, 'k'], [12, 's'], [2, 'h'], [6, 'h'], [10, 'h'], [14, 'h']], heavy: [[0, 'k'], [3, 'k'], [4, 's'], [8, 'k'], [11, 'k'], [12, 's'], [14, 's'], [2, 'h'], [6, 'h'], [10, 'h']] }[st.drums];
      for (const [b, kind] of d) if (beat === b) drum[s] = drum[s] ? drum[s] + kind : kind;
    }
    return { st, mel, bass, arp, drum, stepDur: 60 / st.bpm / 4 };
  }

  function voice(type, freq, t, dur, vol, bus, slide) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(t, dur, vol, freq, bus) {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus);
    s.start(t); s.stop(t + dur + 0.02);
  }
  function playStep(song, s, t) {
    const { mel, bass, arp, drum, stepDur, st } = song;
    const bus = song.bus;
    if (mel[s]) voice('square', hz(mel[s].m), t, mel[s].len * stepDur * 0.95, 0.07 * st.lead, bus);
    if (bass[s]) voice('triangle', hz(bass[s].m), t, bass[s].len * stepDur * 0.9, 0.16, bus);
    if (arp[s]) voice('square', hz(arp[s].m), t, stepDur * 0.6, 0.018, bus);
    const d = drum[s];
    if (d) {
      if (d.includes('k')) voice('sine', 140, t, 0.16, 0.22, bus, 45);
      if (d.includes('s')) noise(t, 0.12, 0.08, 1800, bus);
      if (d.includes('h')) noise(t, 0.04, 0.03, 7000, bus);
    }
  }
  function startSong(key) {
    const [style, variant] = key.split(':');
    const song = compose(style, +variant || 0);
    song.key = key;
    song.bus = ctx.createGain();
    song.bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    song.bus.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);
    song.bus.connect(musicBus);
    song.step = 0;
    song.next = ctx.currentTime + 0.1;
    return song;
  }
  function stopSong(song) {
    if (!song) return;
    const g = song.bus.gain, now = ctx.currentTime;
    g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(0.0001, now + 0.5);
    setTimeout(() => { try { song.bus.disconnect(); } catch (e) { /* already gone */ } }, 700);
  }
  function tick() {
    if (!ctx || !current) return;
    while (current.next < ctx.currentTime + 0.15) {
      playStep(current, current.step % 128, current.next);
      current.next += current.stepDur;
      current.step++;
    }
  }
  const musicOn = () => !settings.mute && settings.music;
  function applyVolumes() {
    if (!ctx) return;
    const now = ctx.currentTime;
    master.gain.setTargetAtTime(settings.mute ? 0 : 1, now, 0.05);
    musicBus.gain.setTargetAtTime(settings.music ? 0.55 * settings.musicVol : 0, now, 0.05);
    sfxBus.gain.setTargetAtTime(settings.sfx ? settings.sfxVol : 0, now, 0.05);
  }
  function sync() {
    if (!ctx) return;
    if (!musicOn() || !wanted || document.hidden) { if (current) { stopSong(current); current = null; } return; }
    if (current && current.key === wanted) return;
    stopSong(current);
    current = startSong(wanted);
  }

  return {
    // browsers only allow sound after the player touches the screen
    unlock() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.connect(ctx.destination);
        musicBus = ctx.createGain(); musicBus.connect(master);
        sfxBus = ctx.createGain(); sfxBus.connect(master);
        applyVolumes();
        timer = setInterval(tick, 40);
        sync();
      } catch (e) { ctx = null; }
    },
    configure(s) { settings = { ...settings, ...s }; applyVolumes(); sync(); },
    // style: menu, map, level, battle, boss, tower, train. variant: e.g. the world number
    music(style, variant = 0) { wanted = style ? `${style}:${variant}` : null; sync(); },
    sfx(kind) {
      if (!ctx || settings.mute || !settings.sfx) return;
      const P = { tap: [660, 0.05, 'square'], cast: [300, 0.2, 'sawtooth', 900], hit: [160, 0.15, 'square', 60], ok: [523, 0.15, 'square', 1046], bad: [240, 0.22, 'triangle', 120], err: [190, 0.28, 'sawtooth', 80], win: [523, 0.5, 'square', 1568], coin: [988, 0.12, 'square', 1319], level: [392, 0.7, 'square', 1568] }[kind];
      if (!P) return;
      try { voice(P[2], P[0], ctx.currentTime, P[1], 0.09, sfxBus, P[3]); if (kind === 'level') voice('square', 784, ctx.currentTime + 0.18, 0.5, 0.06, sfxBus, 2093); } catch (e) { /* ignore */ }
    },
    vibrate(pattern) { if (settings.vibrate && !settings.mute && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) { /* unsupported */ } } },
    pause(hidden) { if (!ctx) return; if (hidden) { stopSong(current); current = null; ctx.suspend && ctx.suspend(); } else { ctx.resume && ctx.resume(); sync(); } },
    get playing() { return current ? current.key : null; },
  };
})();
if (typeof module !== 'undefined') module.exports = Sound;
