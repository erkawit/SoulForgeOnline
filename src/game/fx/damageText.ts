// Floating combat text in SoulForge's gothic style: carved bone-white hits, gold criticals that slam in and shake,
// class-coloured skill hits, green heals, crimson damage taken, ghostly EVADE. Pooled sprites, no per-frame allocation.
import { CanvasTexture, LinearFilter, Sprite, SpriteMaterial, Vector3, type Object3D } from 'three';

export type DamageKind = 'hit' | 'crit' | 'skill' | 'heal' | 'taken' | 'evade' | 'buff' | 'mana';
const STYLE: Record<DamageKind, { fill: [string, string]; stroke: string; glow: string; size: number; rise: number; life: number }> = {
  hit:   { fill: ['#fff4e2', '#cdbfa8'], stroke: '#1a0f0c', glow: 'rgba(0,0,0,0)', size: 0.6, rise: 1.1, life: 0.85 },
  crit:  { fill: ['#fff3b0', '#e3a23a'], stroke: '#2a1204', glow: 'rgba(255,170,60,0.85)', size: 1.15, rise: 1.4, life: 1.15 },
  skill: { fill: ['#ffffff', '#62d7cb'], stroke: '#06191a', glow: 'rgba(98,215,203,0.7)', size: 0.72, rise: 1.25, life: 0.95 },
  heal:  { fill: ['#e9ffe9', '#5fd07a'], stroke: '#06200e', glow: 'rgba(95,208,122,0.6)', size: 0.55, rise: 1.3, life: 1.1 },
  taken: { fill: ['#ffd2c8', '#e0453a'], stroke: '#2a0606', glow: 'rgba(224,69,58,0.55)', size: 0.5, rise: 0.9, life: 0.9 },
  evade: { fill: ['#e8e6ff', '#9a98c8'], stroke: '#120f22', glow: 'rgba(154,152,200,0.5)', size: 0.42, rise: 0.8, life: 0.8 },
  buff:  { fill: ['#fff8dc', '#e3c27e'], stroke: '#1d1406', glow: 'rgba(227,194,126,0.6)', size: 0.44, rise: 1.0, life: 1.4 },
  mana:  { fill: ['#e6f0ff', '#6aa8ff'], stroke: '#060f22', glow: 'rgba(106,168,255,0.6)', size: 0.44, rise: 1.0, life: 1.0 },
};
const FONT = `"Cinzel", "Trajan Pro", Georgia, serif`;
// round 12: painted criticals (all-elements UI sheet): the gold CRITICAL burst and gold numerals; text until they load
let ART = '/art/ui/combat/'; const art: { banner?: HTMLImageElement; digits: HTMLImageElement[] } = { digits: [] }; let artTried = false;
export function setCombatArtBase(base: string) { ART = base; artTried = false; art.digits = []; art.banner = undefined; }
function loadArt() {
  if (artTried || typeof Image === 'undefined') return; artTried = true;
  const im = (f: string) => { const i = new Image(); i.decoding = 'async'; i.src = ART + f; return i; };
  art.banner = im('crit-gold.webp'); art.digits = Array.from({ length: 10 }, (_, d) => im(`d${d}.webp`));
}
const artReady = () => !!art.banner?.complete && art.banner.naturalWidth > 0 && art.digits.length === 10 && art.digits.every(d => d.complete && d.naturalWidth > 0);
/** gold numerals under the CRITICAL burst; null if the art is not loaded or the text is not a number */
function paintedCrit(text: string) {
  text = text.replace(/[,\s]/g, ''); // the painted numerals are digits only — 1,288 is drawn as 1288
  if (!/^\d+$/.test(text) || !artReady()) return null;
  const dh = 92, ds = text.split('').map(ch => art.digits[+ch]), dw = ds.map(d => d.naturalWidth * dh / d.naturalHeight), sp = -6;
  const numW = dw.reduce((a, b) => a + b + sp, -sp), b = art.banner!, bh = 82, bw = b.naturalWidth * bh / b.naturalHeight;
  const c = document.createElement('canvas'), g = c.getContext('2d')!; c.width = Math.ceil(Math.max(numW, bw)) + 24; c.height = bh + dh - 10;
  g.drawImage(b, (c.width - bw) / 2, 0, bw, bh);
  g.shadowColor = 'rgba(255,170,60,0.9)'; g.shadowBlur = 18; let x = (c.width - numW) / 2;
  ds.forEach((d, i) => { g.drawImage(d, x, bh - 14, dw[i], dh); x += dw[i] + sp; });
  return c;
}
const cache = new Map<string, { tex: CanvasTexture; aspect: number }>();

function texture(text: string, kind: DamageKind, accent?: string) {
  if (kind === 'crit') { loadArt(); const k2 = `crit-art|${text}`, h2 = cache.get(k2); if (h2) return h2; const pc = paintedCrit(text);
    if (pc) { const tex = new CanvasTexture(pc); tex.minFilter = LinearFilter; tex.generateMipmaps = false; const out = { tex, aspect: pc.width / pc.height }; cache.set(k2, out); return out; } }
  const k = `${kind}|${accent ?? ''}|${text}`, hit = cache.get(k); if (hit) return hit;
  const st = STYLE[kind], px = 96, c = document.createElement('canvas'), g = c.getContext('2d')!;
  const big = kind === 'crit';
  g.font = `900 ${px}px ${FONT}`; const w = Math.ceil(g.measureText(text).width) + 60, sub = big ? 34 : 0;
  c.width = w; c.height = px + 44 + sub;
  g.font = `900 ${px}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const cx = w / 2, cy = (px + 44) / 2 + sub;
  if (big) { g.font = `700 30px ${FONT}`; g.fillStyle = '#ffd36e'; g.shadowColor = st.glow; g.shadowBlur = 14; g.fillText('CRITICAL', cx, 20); g.font = `900 ${px}px ${FONT}`; }
  g.shadowColor = st.glow; g.shadowBlur = big ? 26 : 16;
  g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = st.stroke; g.strokeText(text, cx, cy);
  const grad = g.createLinearGradient(0, cy - px / 2, 0, cy + px / 2);
  grad.addColorStop(0, st.fill[0]); grad.addColorStop(1, kind === 'skill' && accent ? accent : st.fill[1]);
  g.shadowBlur = 0; g.fillStyle = grad; g.fillText(text, cx, cy);
  g.globalAlpha = 0.35; g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.strokeText(text, cx, cy - 2); // carved highlight
  const tex = new CanvasTexture(c); tex.minFilter = LinearFilter; tex.generateMipmaps = false;
  const out = { tex, aspect: c.width / c.height };
  if (cache.size > 400) { const first = cache.keys().next().value as string; cache.get(first)!.tex.dispose(); cache.delete(first); }
  cache.set(k, out); return out;
}

type Live = { sprite: Sprite; t: number; life: number; vel: Vector3; base: number; kind: DamageKind; jitter: number };
export type DamageText = { spawn: (at: Vector3 | { x: number; y: number; z: number }, value: number | string, kind?: DamageKind, accent?: string) => void; update: (dt: number) => void; dispose: () => void; enabled: boolean };

export function createDamageText(parent: Object3D, max = 64): DamageText {
  loadArt(); // round 16: load the painted CRITICAL burst + gold numerals up front, so the very first crit is the painted one too
  const pool: Sprite[] = [], live: Live[] = [];
  for (let i = 0; i < max; i++) { const s = new Sprite(new SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false })); s.visible = false; s.renderOrder = 999; parent.add(s); pool.push(s); }
  let stack = 0;
  const api: DamageText = {
    enabled: true,
    spawn: (at, value, kind = 'hit', accent) => {
      if (!api.enabled) return;
      const s = pool.find(p => !p.visible) ?? live.shift()!.sprite; const st = STYLE[kind];
      const text = typeof value === 'number' ? (kind === 'heal' ? `+${Math.round(value).toLocaleString()}` : Math.round(value).toLocaleString()) : value;
      const { tex, aspect } = texture(text, kind, accent); const m = s.material as SpriteMaterial; m.map = tex; m.needsUpdate = true; m.opacity = 1;
      // numbers landing on the same target in quick succession climb above each other instead of overlapping
      stack = (stack + 1) % 2; let lift = 0;
      for (const l of live) if (l.t < 0.45 && Math.abs(l.sprite.position.x - at.x) < 0.9 && Math.abs(l.sprite.position.z - at.z) < 0.9) lift = Math.max(lift, l.sprite.position.y - at.y + l.base * 0.85);
      s.position.set(at.x + (stack ? 0.22 : -0.22) + (Math.random() - 0.5) * 0.12, at.y + lift, at.z + (Math.random() - 0.5) * 0.12); s.visible = true;
      const h = st.size; s.scale.set(h * aspect, h, 1);
      live.push({ sprite: s, t: 0, life: st.life, vel: new Vector3((Math.random() - 0.5) * 0.6, st.rise, 0), base: h, kind, jitter: kind === 'crit' ? 0.06 : 0 });
    },
    update: dt => {
      for (let i = live.length - 1; i >= 0; i--) {
        const l = live[i]; l.t += dt; const u = l.t / l.life, m = l.sprite.material as SpriteMaterial;
        if (u >= 1) { l.sprite.visible = false; live.splice(i, 1); continue; }
        // pop: overshoot then settle; crits slam in from big, then shake
        const pop = l.kind === 'crit' ? 1 + 0.9 * Math.exp(-l.t * 14) : 1 + 0.35 * Math.sin(Math.min(1, l.t * 9) * Math.PI);
        const aspect = l.sprite.scale.x / l.sprite.scale.y; l.sprite.scale.set(l.base * pop * aspect, l.base * pop, 1);
        l.sprite.position.addScaledVector(l.vel, dt); l.vel.y *= 1 - 2.4 * dt;
        if (l.jitter && l.t < 0.35) { l.sprite.position.x += (Math.random() - 0.5) * l.jitter; }
        m.opacity = u < 0.65 ? 1 : 1 - (u - 0.65) / 0.35;
      }
    },
    dispose: () => { for (const s of pool) { s.removeFromParent(); (s.material as SpriteMaterial).dispose(); } },
  };
  return api;
}
