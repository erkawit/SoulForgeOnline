// SoulForge audio engine (WebAudio). Music crossfades and loops; SFX are pooled, pitch-jittered and attenuated by
// distance; class voice lines play a recorded file when one exists (public/audio/voice/{m|f}-{class}.mp3) and otherwise
// speak the line with the device's Thai voice, pitched per class and gender. Browsers start audio only after a user
// gesture, so the engine unlocks itself on the first pointer / key event.
export type MusicId = 'title' | 'field';
export const VOICE_LINES: Record<string, string> = {
  Berserker: 'ยิ่งเลือดเดือด ขวานของข้ายิ่งหนักขึ้น',
  Reaver: 'ทุกชีวิตที่ขวางทาง คือผลผลิตที่รอเก็บเกี่ยว',
};
/** speech pitch / rate for the TTS fallback (round 13: Berserker, and the Reaver a little deeper) */
const VOICE_TONE: Record<string, Record<'m' | 'f', { pitch: number; rate: number }>> = {
  Berserker: { m: { pitch: 0.55, rate: 0.9 }, f: { pitch: 1.0, rate: 0.94 } },
  Reaver: { m: { pitch: 0.45, rate: 0.85 }, f: { pitch: 0.9, rate: 0.9 } },
};
export type AudioSettings = { master: number; music: number; sfx: number; voice: number; muted: boolean };
export const DEFAULT_AUDIO: AudioSettings = { master: 0.8, music: 0.55, sfx: 0.8, voice: 1, muted: false };

class Engine {
  ctx: AudioContext | null = null; private base = '/audio/'; private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private master!: GainNode; private musicBus!: GainNode; private sfxBus!: GainNode; private voiceBus!: GainNode;
  private music: { id: MusicId; src: AudioBufferSourceNode; gain: GainNode } | null = null; private wantMusic: MusicId | null = null;
  settings: AudioSettings = { ...DEFAULT_AUDIO }; private lastPlay = new Map<string, number>(); private voiceFiles = new Map<string, boolean>();
  listener = { x: 0, z: 0 }; private unlocked = false;
  setBase(url: string) { this.base = url.endsWith('/') ? url : url + '/'; }
  /** call once at startup: arms the unlock on the first gesture */
  init() {
    if (typeof window === 'undefined' || this.ctx) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); const c = this.ctx;
    this.master = c.createGain(); this.master.connect(c.destination);
    // gentle limiter so stacked hits never clip
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.15; comp.connect(this.master);
    this.musicBus = c.createGain(); this.sfxBus = c.createGain(); this.voiceBus = c.createGain();
    this.musicBus.connect(this.master); this.sfxBus.connect(comp); this.voiceBus.connect(this.master); this.apply();
    const unlock = () => { if (this.unlocked) return; this.unlocked = true; void c.resume(); if (this.wantMusic) this.playMusic(this.wantMusic); for (const e of ['pointerdown', 'keydown', 'touchstart']) window.removeEventListener(e, unlock); };
    for (const e of ['pointerdown', 'keydown', 'touchstart']) window.addEventListener(e, unlock, { passive: true });
    if (c.state === 'running') this.unlocked = true;
    // the volume / mute set in one tab reaches every other open game tab (each tab has its own audio engine)
    window.addEventListener('storage', e => { if (e.key !== 'sf-audio' || !e.newValue) return; try { this.configure(JSON.parse(e.newValue)); } catch { /* */ } });
    // a game tab in the background is silent (and its audio thread idle) until it is shown again
    document.addEventListener('visibilitychange', () => { if (document.hidden) void c.suspend(); else if (this.unlocked) void c.resume(); });
  }
  configure(s: Partial<AudioSettings>) { this.settings = { ...this.settings, ...s }; this.apply(); }
  private apply() { if (!this.ctx) return; const s = this.settings, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted ? 0 : s.master, t, 0.05); this.musicBus.gain.setTargetAtTime(s.music, t, 0.1); this.sfxBus.gain.setTargetAtTime(s.sfx, t, 0.05); this.voiceBus.gain.setTargetAtTime(s.voice, t, 0.05); }
  private load(path: string) {
    let p = this.buffers.get(path);
    if (!p) { p = fetch(this.base + path).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)).then(b => this.ctx!.decodeAudioData(b)).catch(() => null); this.buffers.set(path, p); }
    return p;
  }
  preload(names: string[]) { if (!this.ctx) return; for (const n of names) void this.load(`sfx/${n}.mp3`); }
  /** loop a music track with a 2.5 s crossfade */
  playMusic(id: MusicId | null) {
    this.wantMusic = id; if (!this.ctx || !this.unlocked) return;
    if (this.music?.id === id) return;
    const c = this.ctx, old = this.music;
    if (old) { old.gain.gain.setTargetAtTime(0, c.currentTime, 0.8); const s = old.src; setTimeout(() => { try { s.stop(); } catch { /* already stopped */ } }, 4000); this.music = null; }
    if (!id) return;
    void this.load(`music/${id}.mp3`).then(buf => {
      if (!buf || this.wantMusic !== id || this.music?.id === id) return;
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = 0.05; src.loopEnd = buf.duration - 0.03;
      const g = c.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(1, c.currentTime, 0.9); src.connect(g); g.connect(this.musicBus); src.start(c.currentTime + 0.05, 0.05);
      this.music = { id, src, gain: g };
    });
  }
  /** one-shot sound effect. `at` = world position for distance falloff; throttled per name so swarms don't machine-gun */
  play(name: string, o: { vol?: number; rate?: number; at?: { x: number; z: number }; jitter?: number; minGap?: number } = {}) {
    if (!this.ctx || !this.unlocked || this.settings.muted) return;
    const now = performance.now(), gap = o.minGap ?? 45; if (now - (this.lastPlay.get(name) ?? -1e9) < gap) return; this.lastPlay.set(name, now);
    let vol = o.vol ?? 1;
    if (o.at) { const d = Math.hypot(o.at.x - this.listener.x, o.at.z - this.listener.z); if (d > 32) return; vol *= Math.max(0.08, 1 - d / 32) ** 1.4; }
    const c = this.ctx;
    void this.load(`sfx/${name}.mp3`).then(buf => {
      if (!buf) return; const src = c.createBufferSource(); src.buffer = buf;
      src.playbackRate.value = (o.rate ?? 1) * (1 + ((Math.random() - 0.5) * (o.jitter ?? 0.08)));
      const g = c.createGain(); g.gain.value = vol; let tail: AudioNode = g;
      if (o.at) { const p = c.createStereoPanner(); p.pan.value = Math.max(-0.8, Math.min(0.8, (o.at.x - this.listener.x) / 18)); g.connect(p); tail = p; }
      src.connect(g); tail.connect(this.sfxBus); src.start();
    });
  }
  /** a looping one (cast channel); returns a stop function */
  loop(name: string, vol = 0.6): () => void {
    if (!this.ctx || !this.unlocked || this.settings.muted) return () => {};
    const c = this.ctx; let src: AudioBufferSourceNode | null = null; let stopped = false; const g = c.createGain(); g.gain.value = 0; g.connect(this.sfxBus);
    void this.load(`sfx/${name}.mp3`).then(buf => { if (!buf || stopped) return; src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(g); src.start(); g.gain.setTargetAtTime(vol, c.currentTime, 0.08); });
    return () => { stopped = true; g.gain.setTargetAtTime(0, c.currentTime, 0.08); const s = src; setTimeout(() => { try { s?.stop(); } catch { /* */ } }, 400); };
  }
  /** class voice line on the character screen (recorded file first, then Thai TTS) */
  async voice(cls: string, gender: 'm' | 'f') {
    const line = VOICE_LINES[cls]; if (!line) return;
    const key = `${gender}-${cls.toLowerCase()}`;
    if (this.ctx && this.unlocked && this.voiceFiles.get(key) !== false) {
      const buf = await this.load(`voice/${key}.mp3`);
      this.voiceFiles.set(key, !!buf);
      if (buf) { this.stopVoice(); const src = this.ctx.createBufferSource(); src.buffer = buf; src.connect(this.voiceBus); src.start(); this.voiceSrc = src; return; }
    }
    this.speak(line, VOICE_TONE[cls]?.[gender] ?? { pitch: 1, rate: 1 });
  }
  private voiceSrc: AudioBufferSourceNode | null = null;
  stopVoice() { try { this.voiceSrc?.stop(); } catch { /* */ } this.voiceSrc = null; if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); }
  private speak(text: string, tone: { pitch: number; rate: number }) {
    if (typeof speechSynthesis === 'undefined' || this.settings.muted) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'th-TH'; u.pitch = tone.pitch; u.rate = tone.rate; u.volume = Math.min(1, this.settings.voice * this.settings.master * 1.2);
    const v = speechSynthesis.getVoices().filter(x => x.lang.toLowerCase().startsWith('th'));
    if (v.length) u.voice = v[tone.pitch < 0.9 && v.length > 1 ? 1 : 0];
    speechSynthesis.speak(u);
  }
}
export const audio = new Engine();
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') (window as unknown as { __audio?: Engine }).__audio = audio;

// ---------------------------------------------------------------- what plays when
const ELEMENT_SFX: Record<string, string> = { fire: 'fireball', frost: 'frost', storm: 'lightning', holy: 'holy', shadow: 'elite_cast', arcane: 'magic_bolt', nature: 'rune', physical: 'swing_heavy' };
export const sfxForElement = (el: string | undefined) => ELEMENT_SFX[el ?? 'physical'] ?? 'magic_bolt';
export const BASIC_SFX: Record<string, { swing: string; hit: string }> = {
  Berserker: { swing: 'swing_heavy', hit: 'hit_slash' }, Reaver: { swing: 'swing_heavy', hit: 'hit_blunt' },
};
export type MonsterTier = 'normal' | 'elite' | 'boss';
export const MONSTER_SFX: Record<MonsterTier, { aggro: string; attack: string; hurt: string; die: string; cast: string }> = {
  normal: { aggro: 'mon_growl', attack: 'mon_attack', hurt: 'mon_hurt', die: 'mon_die', cast: 'mon_attack' },
  elite: { aggro: 'elite_roar', attack: 'elite_attack', hurt: 'mon_hurt', die: 'elite_die', cast: 'elite_cast' },
  boss: { aggro: 'boss_roar', attack: 'boss_attack', hurt: 'mon_hurt', die: 'boss_die', cast: 'boss_cast' },
};
export const tierOf = (m: { boss?: boolean; elite?: boolean }): MonsterTier => m.boss ? 'boss' : m.elite ? 'elite' : 'normal';
/** pitch per species family (small critters squeak higher, golems rumble lower) */
export function monsterPitch(name: string) { return /spider|moth|crab|beetle|otter/i.test(name) ? 1.35 : /golem|colossus|titan|treant|rhino|aurochs/i.test(name) ? 0.7 : /hound|wolf|crawler/i.test(name) ? 1.08 : 1; }
export const ALL_SFX = ['swing', 'swing_heavy', 'hit_slash', 'hit_blunt', 'hit_metal', 'crit', 'arrow_release', 'arrow_hit', 'bow_draw', 'bow_full', 'magic_bolt', 'cast_loop', 'fireball', 'frost', 'lightning', 'holy', 'heal', 'buff', 'rune', 'shield',
  'level_up', 'loot', 'coin', 'ui_click', 'ui_open', 'ui_close', 'craft_hammer', 'craft_success', 'craft_fail', 'crystal', 'quest_accept', 'quest_done', 'potion', 'eat', 'step', 'death',
  'mon_growl', 'mon_attack', 'mon_hurt', 'mon_die', 'elite_roar', 'elite_attack', 'elite_cast', 'elite_die', 'boss_roar', 'boss_cast', 'boss_slam', 'boss_attack', 'boss_phase', 'boss_die', 'boss_win'];
