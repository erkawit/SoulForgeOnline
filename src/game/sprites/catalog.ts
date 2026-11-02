// Sprite actor definitions: which painted frame is the base pose, which key-pose frames each clip walks through,
// and the rig regions the vertex shader bends (weapon arm, cloth, hair). Clip names match the old GLB clips so all
// game code (combo / cast / charge / guard) drives sprites unchanged.
import { SPRITE_FRAMES } from './frames';
import { lookFrame } from './looks';
import './codexAnims'; // registers Codex's 8-way sheets before any lookup

export type SpriteKey = { t: number; f?: string; arm?: number; lean?: number; sq?: number; dx?: number; dy?: number; rot?: number; glow?: number; shake?: number };
export type SpriteClip = { dur: number; loop?: boolean; keys: SpriteKey[] };
export type SpriteKind = 'hero' | 'biped' | 'beast' | 'flyer' | 'npc';
export type ActorDef = {
  id: string; base: string; run?: string; kind: SpriteKind; scale?: number; glow?: string; walks?: boolean; facesLeft?: boolean;
  breath?: number; cloth?: number; hair?: number; bob?: number; headRatio?: number; shadowW?: number;
  /** soft rectangle (u0,v0,u1,v1 in frame uv) rotated about pivot (u,v) — the weapon / casting arm on the base frame */
  arm?: { rect: [number, number, number, number]; pivot: [number, number]; dir?: number };
  clips: Partial<Record<string, SpriteClip>>;
};
export type Gender = 'm' | 'f';
export const CLASS_GLOW: Record<string, string> = { Paladin: '#ffe08a', Hawkeye: '#8bdb9a', RuneMaster: '#62dfdf', Elementalist: '#b685ff', Assassin: '#c97bff', HighPriest: '#ffdb86', Inquisitor: '#ffb35c', Berserker: '#ff4a3a', Reaver: '#c03cff', Warrior: '#ff8a5c', Mage: '#b685ff', Priest: '#ffdb86', Archer: '#8bdb9a', Enchanter: '#62dfdf' };
const ARMS: Record<string, ActorDef['arm']> = {
  Warrior: { rect: [0, .05, .42, .62], pivot: [.36, .62] }, Mage: { rect: [0, .08, .48, 1], pivot: [.42, .58] },
  Priest: { rect: [0, .04, .4, .58], pivot: [.36, .56] }, Archer: { rect: [.55, .2, 1, 1], pivot: [.6, .62], dir: -1 },
  Enchanter: { rect: [.55, .42, 1, 1], pivot: [.62, .6], dir: -1 },
};

// ---------------------------------------------------------------- heroes with painted key poses
function warrior(g: Gender): ActorDef['clips'] {
  const p = g === 'm' ? 'm-Warrior' : 'f-Warrior', A = `${p}-anticipate`, I = `${p}-impact`, S = `${p}-settle`;
  const a = (n: number) => g === 'm' ? `m-Warrior-a${n}` : [A, A, I, S][n - 1];
  return {
    Attack: { dur: .62, keys: [{ t: 0, f: a(1), lean: -.04, sq: -.03 }, { t: .22, f: a(2), dx: .06 }, { t: .36, f: a(3), dx: .16, sq: -.04, shake: .5, glow: .2 }, { t: .62, f: a(4), dx: .08 }, { t: .9, f: p }, { t: 1 }] },
    Attack2: { dur: .58, keys: [{ t: 0, f: A, lean: -.05 }, { t: .35, f: I, dx: .18, sq: -.05, shake: .6, glow: .25 }, { t: .66, f: S, dx: .1 }, { t: .92, f: p }, { t: 1 }] },
    Skill: { dur: .9, keys: [{ t: 0, f: a(1), lean: -.08, glow: .3 }, { t: .25, f: a(2), dy: .1, glow: .5 }, { t: .42, f: a(3), dx: .35, glow: .9, shake: 1 }, { t: .6, f: I, dx: .3, glow: .6 }, { t: .78, f: a(4), dx: .12 }, { t: .95, f: p }, { t: 1 }] },
    Special: { dur: 1.2, keys: [{ t: 0, f: A, glow: .4, sq: -.06 }, { t: .3, f: a(2), dy: .25, glow: .7 }, { t: .5, f: a(3), dx: .3, sq: -.08, shake: 1.2, glow: 1.1 }, { t: .75, f: S, dx: .15, glow: .4 }, { t: .95, f: p }, { t: 1 }] },
    Guard: { dur: .4, keys: [{ t: 0, f: S, lean: -.04, glow: .15 }, { t: 1, f: S, lean: -.05, glow: .3, sq: -.03 }] },
    Buff: { dur: 1.1, keys: [{ t: 0, f: p }, { t: .25, sq: -.05, arm: .35 }, { t: .4, dy: .1, sq: .05, glow: 1, arm: -.4 }, { t: .7, glow: .6, arm: -.2 }, { t: 1 }] },
    Channel: { dur: 1, loop: true, keys: [{ t: 0, f: S, glow: .25 }, { t: .5, f: S, glow: .4, sq: -.02 }, { t: 1, f: S, glow: .25 }] },
  };
}
const M = (n: string) => `m-${n}`;
const HERO_CLIPS: Record<string, ActorDef['clips']> = {
  Mage: {
    Attack: { dur: .62, keys: [{ t: 0, f: M('Mage-turn'), glow: .2 }, { t: .35, f: M('Mage-stop'), dx: .05, glow: .7, sq: -.02 }, { t: .9, f: M('Mage') }, { t: 1 }] },
    Attack2: { dur: .5, keys: [{ t: 0, f: M('Mage-stop'), glow: .5, lean: -.03 }, { t: .3, dx: .06, glow: .8 }, { t: .82, f: M('Mage') }, { t: 1 }] },
    Channel: { dur: 1.2, loop: true, keys: [{ t: 0, f: M('Mage-turn'), glow: .35 }, { t: .5, f: M('Mage-turn'), glow: .6, dy: .03 }, { t: 1, f: M('Mage-turn'), glow: .35 }] },
    Skill: { dur: .9, keys: [{ t: 0, f: M('Mage-turn'), glow: .5 }, { t: .4, f: M('Mage-stop'), glow: 1.1, dx: .06, shake: .4 }, { t: .9, f: M('Mage') }, { t: 1 }] },
    Buff: { dur: 1.1, keys: [{ t: 0, f: M('Mage-turn'), glow: .5 }, { t: .4, dy: .06, glow: 1 }, { t: .8, f: M('Mage') }, { t: 1 }] },
    Special: { dur: 1.2, keys: [{ t: 0, f: M('Mage-turn'), glow: .6, sq: -.04 }, { t: .45, f: M('Mage-stop'), glow: 1.3, shake: 1, dx: .05 }, { t: .9, f: M('Mage') }, { t: 1 }] },
  },
  Priest: {
    Attack: { dur: .66, keys: [{ t: 0, f: M('Priest-a1'), lean: -.04 }, { t: .4, f: M('Priest-a3'), dx: .14, shake: .5, glow: .3 }, { t: .7, f: M('Priest-a4') }, { t: .95, f: M('Priest') }, { t: 1 }] },
    Attack2: { dur: .5, keys: [{ t: 0, f: M('Priest-a3'), dx: .1, glow: .3 }, { t: .6, f: M('Priest-a4') }, { t: .92, f: M('Priest') }, { t: 1 }] },
    Channel: { dur: 1.2, loop: true, keys: [{ t: 0, f: M('Priest-a2'), glow: .45 }, { t: .5, f: M('Priest-a2'), glow: .75, dy: .03 }, { t: 1, f: M('Priest-a2'), glow: .45 }] },
    Buff: { dur: 1.1, keys: [{ t: 0, f: M('Priest-a2'), glow: .6 }, { t: .35, f: M('Priest-a3'), glow: 1.1 }, { t: .75, f: M('Priest-a4'), glow: .3 }, { t: .95, f: M('Priest') }, { t: 1 }] },
    Skill: { dur: .9, keys: [{ t: 0, f: M('Priest-a1') }, { t: .25, f: M('Priest-a2'), glow: .8 }, { t: .5, f: M('Priest-a3'), glow: 1.1, dx: .05 }, { t: .8, f: M('Priest-a4') }, { t: 1, f: M('Priest') }] },
    Special: { dur: 1.2, keys: [{ t: 0, f: M('Priest-a2'), glow: .6, dy: .05 }, { t: .5, f: M('Priest-a3'), glow: 1.3, shake: .6 }, { t: .8, f: M('Priest-a4') }, { t: 1, f: M('Priest') }] },
  },
  Archer: {
    Attack: { dur: .6, keys: [{ t: 0, f: M('Archer-a1'), lean: -.03 }, { t: .5, f: M('Archer-a2'), dx: -.04, glow: .3 }, { t: .78, f: M('Archer-a4') }, { t: .96, f: M('Archer') }, { t: 1 }] },
    Attack2: { dur: .45, keys: [{ t: 0, f: M('Archer-a2'), dx: -.03, glow: .2 }, { t: .5, f: M('Archer-a4') }, { t: .9, f: M('Archer') }, { t: 1 }] },
    Channel: { dur: .8, loop: true, keys: [{ t: 0, f: M('Archer-a1'), lean: -.04, shake: .15, glow: .15 }, { t: .5, f: M('Archer-a1'), lean: -.05, shake: .25, glow: .35 }, { t: 1, f: M('Archer-a1'), lean: -.04, shake: .15, glow: .15 }] },
    Skill: { dur: .9, keys: [{ t: 0, f: M('Archer-a3'), dx: -.25 }, { t: .35, f: M('Archer-a1'), dx: -.2 }, { t: .6, f: M('Archer-a2'), glow: .9, dx: -.22 }, { t: .85, f: M('Archer-a4'), dx: -.1 }, { t: 1, f: M('Archer') }] },
    Special: { dur: 1.2, keys: [{ t: 0, f: M('Archer-a1'), glow: .6, lean: -.05 }, { t: .55, f: M('Archer-a2'), glow: 1.3, shake: .6, dx: -.06 }, { t: .82, f: M('Archer-a4') }, { t: 1, f: M('Archer') }] },
    Buff: { dur: 1, keys: [{ t: 0, f: M('Archer') }, { t: .35, dy: .08, glow: .9, sq: .04 }, { t: 1 }] },
  },
  Enchanter: {
    Attack: { dur: .6, keys: [{ t: 0, f: M('Enchanter-a1'), glow: .2 }, { t: .35, f: M('Enchanter-a2'), glow: .7, dx: .04 }, { t: .62, f: M('Enchanter-a3') }, { t: .92, f: M('Enchanter') }, { t: 1 }] },
    Attack2: { dur: .5, keys: [{ t: 0, f: M('Enchanter-a2'), glow: .5 }, { t: .45, f: M('Enchanter-a3') }, { t: .85, f: M('Enchanter') }, { t: 1 }] },
    Channel: { dur: 1.2, loop: true, keys: [{ t: 0, f: M('Enchanter-a1'), glow: .4 }, { t: .5, f: M('Enchanter-a1'), glow: .7, dy: .03 }, { t: 1, f: M('Enchanter-a1'), glow: .4 }] },
    Buff: { dur: 1.1, keys: [{ t: 0, f: M('Enchanter-a1'), glow: .5 }, { t: .4, f: M('Enchanter-a2'), glow: 1.1 }, { t: .75, f: M('Enchanter-a4'), glow: .3 }, { t: .95, f: M('Enchanter') }, { t: 1 }] },
    Skill: { dur: .9, keys: [{ t: 0, f: M('Enchanter-a1'), glow: .4 }, { t: .35, f: M('Enchanter-a2'), glow: 1.1 }, { t: .6, f: M('Enchanter-a3') }, { t: .85, f: M('Enchanter-a4') }, { t: 1, f: M('Enchanter') }] },
    Special: { dur: 1.2, keys: [{ t: 0, f: M('Enchanter-a1'), glow: .7, dy: .05 }, { t: .45, f: M('Enchanter-a2'), glow: 1.4, shake: .8 }, { t: .65, f: M('Enchanter-a3') }, { t: .85, f: M('Enchanter-a4') }, { t: 1, f: M('Enchanter') }] },
  },
};
/** the female sheet has only the base pose (and Warrior swings): every other clip is built from the arm rig */
function proceduralHero(cls: string): ActorDef['clips'] {
  const ranged = cls !== 'Warrior' && cls !== 'Priest' && cls !== 'Berserker' && cls !== 'Reaver';
  return {
    Attack: { dur: .6, keys: [{ t: 0 }, { t: .3, arm: -.35, lean: -.06, sq: .02 }, { t: .5, arm: .5, dx: ranged ? .02 : .14, lean: .1, glow: .5, sq: -.04, shake: .4 }, { t: 1 }] },
    Attack2: { dur: .5, keys: [{ t: 0 }, { t: .2, arm: .3, lean: -.04 }, { t: .45, arm: -.45, dx: ranged ? .02 : .12, glow: .4, shake: .3 }, { t: 1 }] },
    Channel: { dur: 1.2, loop: true, keys: [{ t: 0, arm: -.25, glow: .35 }, { t: .5, arm: -.32, glow: .6, dy: .03 }, { t: 1, arm: -.25, glow: .35 }] },
    Skill: { dur: .9, keys: [{ t: 0 }, { t: .3, arm: -.5, glow: .6, lean: -.06 }, { t: .5, arm: .6, glow: 1.1, dx: .1, shake: .6 }, { t: 1 }] },
    Buff: { dur: 1.1, keys: [{ t: 0 }, { t: .3, arm: -.55, dy: .06, glow: .9 }, { t: .7, arm: -.3, glow: .5 }, { t: 1 }] },
    Special: { dur: 1.2, keys: [{ t: 0, sq: -.05 }, { t: .35, arm: -.6, dy: .12, glow: .8 }, { t: .55, arm: .7, glow: 1.3, dx: .12, shake: 1 }, { t: 1 }] },
    Guard: { dur: .4, keys: [{ t: 0, lean: -.04, arm: -.2, glow: .2 }, { t: 1, lean: -.05, arm: -.3, glow: .35, sq: -.03 }] },
  };
}
/** `costume` = an equipped fashion outfit (currently 'thai': reference/thai-fashion-and-grip) */
/** round 12: `promotion` = the class-advancement look (Reaver, Archmage …) when that look has art; a costume still wins */
/** round 20: classes whose own 8-direction sheets have not shipped yet wear the Berserker frames */
export const ART_CLASS = (cls: string) => (['Paladin', 'Hawkeye', 'RuneMaster', 'Elementalist', 'Assassin', 'HighPriest', 'Inquisitor'].includes(cls) ? 'Berserker' : cls);
export function heroId(cls: string, g: Gender = 'm', costume?: string | null, promotion?: string | null) {
  cls = ART_CLASS(cls);
  if (costume) return `hero:${g}:${cls}:${costume}`;
  // round 13: the Berserker (no promotion yet) wears its own painted look until the Codex 8-way frames ship
  const look = promotion ?? (cls === 'Berserker' ? 'Berserker' : null);
  return look && lookFrame(g, look) ? `hero:${g}:${cls}::${look}` : `hero:${g}:${cls}`;
}

// ---------------------------------------------------------------- monsters / NPCs
const FLYERS = new Set(['moon-moth', 'frost-wraith', 'astral-wraith', 'prism-sentinel', 'halo-seraph', 'tide-wraith', 'void-reaper', 'drowned-hierophant']);
const BIPEDS = new Set(['ancient-treant', 'crystal-golem', 'anvil-guard', 'furnace-golem', 'crown-colossus', 'grave-marshal', 'abyssal-forge-titan', 'bark-guardian']);
const BOSS_POSES: Record<string, string[]> = {
  'grave-marshal': ['grave-marshal-slam'], 'drowned-hierophant': ['drowned-hierophant-vortex'], 'worldroot-devourer': ['worldroot-devourer-breath'],
  'abyssal-forge-titan': ['abyssal-forge-titan-slam', 'abyssal-forge-titan-recover'],
};
function monsterDef(id: string): ActorDef {
  const kind: SpriteKind = FLYERS.has(id) ? 'flyer' : BIPEDS.has(id) ? 'biped' : 'beast'; const poses = BOSS_POSES[id];
  const big = SPRITE_FRAMES[id]?.h > 2.5;
  const clips: ActorDef['clips'] = {
    Attack: { dur: big ? .9 : .7, keys: [{ t: 0 }, { t: .38, lean: -.12, sq: .05, dx: -.04 }, { t: .52, lean: .18, dx: big ? .45 : .28, sq: -.08, shake: .5 }, { t: .75, lean: .05, dx: .1 }, { t: 1 }] },
  };
  if (poses) {
    const [p, r] = poses;
    clips.Skill = { dur: 1.3, keys: [{ t: 0 }, { t: .3, lean: -.12, sq: .06, glow: .4 }, { t: .45, f: p, dx: .2, glow: .8, shake: 1.2 }, { t: .8, f: r ?? p, glow: .3 }, { t: .95, f: id }, { t: 1 }] };
    clips.Special = clips.Skill;
  } else clips.Skill = { dur: 1, keys: [{ t: 0 }, { t: .4, lean: -.16, sq: .07, glow: .5 }, { t: .58, lean: .22, dx: .4, sq: -.1, glow: 1, shake: 1 }, { t: 1 }] };
  return { id, base: id, kind, walks: true, breath: kind === 'beast' ? .022 : .016, cloth: kind === 'flyer' ? 1.6 : .6, hair: kind === 'beast' ? .6 : 1, bob: kind === 'biped' ? .7 : 1,
    glow: /void|eclipse|astral|devourer/.test(id) ? '#b26bff' : /ember|furnace|titan|cinder|slag/.test(id) ? '#ff7a3a' : /prism|tide|hierophant|venom|spore/.test(id) ? '#4bffb0' : '#ffd26a', clips };
}
function npcDef(id: string): ActorDef {
  const mira = id === 'npc-mira-ashvale';
  return { id, base: id, kind: 'npc', breath: .014, cloth: .8, clips: {
    Talk: mira ? { dur: 2.4, keys: [{ t: 0, f: 'npc-Mira-idle' }, { t: .12, f: 'npc-Mira-greet', dy: .03 }, { t: .45, f: 'npc-Mira-offer' }, { t: .8, f: 'npc-Mira-return' }, { t: .97, f: id }, { t: 1 }] }
      : { dur: 1.4, keys: [{ t: 0 }, { t: .25, lean: .06, sq: -.03 }, { t: .5, lean: -.02, sq: .02 }, { t: .75, lean: .04 }, { t: 1 }] },
  } };
}

const cache = new Map<string, ActorDef>();
/** `hero:m:Warrior`, `hero:f:Mage`, a monster slug (`grave-crawler`) or an NPC slug (`npc-elder-corvin`) */
export function actorDef(id: string): ActorDef {
  const c = cache.get(id); if (c) return c; let d: ActorDef;
  if (id.startsWith('hero:')) {
    const [, g, cls, costume, promotion] = id.split(':') as [string, Gender, string, string | undefined, string | undefined];
    const look = !costume ? lookFrame(g, promotion) : null;
    if (look) {
      // promotion look: one painted pose with its own weapon, all motion from the rig (no arm region on these sheets)
      const clips = proceduralHero(cls);
      for (const c of Object.values(clips)) for (const k of c!.keys) if (k.arm) { k.lean = (k.lean ?? 0) + k.arm * 0.12; delete k.arm; }
      d = { id, base: look, kind: 'hero', glow: CLASS_GLOW[cls], cloth: 1.3, hair: 1.4, clips, headRatio: 0.95 };
      cache.set(id, d); return d;
    }
    if (costume) {
      // fashion outfit: one painted pose, all motion from the rig (no weapon drawn, so no arm swing — the body sells it)
      const base = `costume-${costume}-${g}`; const clips = proceduralHero(cls);
      for (const c of Object.values(clips)) for (const k of c!.keys) if (k.arm) { k.lean = (k.lean ?? 0) + k.arm * 0.12; delete k.arm; }
      d = { id, base: SPRITE_FRAMES[base] ? base : lookFrame(g, 'Berserker') ?? `${g}-${cls}`, kind: 'hero', glow: CLASS_GLOW[cls], cloth: 1.6, hair: 1.5, clips, headRatio: 0.95 };
      cache.set(id, d); return d;
    }
    const base = `${g}-${cls}`;
    const clips = cls === 'Warrior' ? warrior(g) : g === 'm' ? HERO_CLIPS[cls] : proceduralHero(cls);
    d = { id, base, run: g === 'm' && cls === 'Mage' ? 'm-Mage-run' : undefined, kind: 'hero', glow: CLASS_GLOW[cls], arm: ARMS[cls], cloth: cls === 'Mage' || cls === 'Enchanter' ? 1.4 : cls === 'Warrior' ? .8 : 1.1, hair: cls === 'Archer' || g === 'f' ? 1.5 : 1,
      clips: { ...proceduralHero(cls), ...clips }, headRatio: cls === 'Mage' ? .86 : .96 };
  } else if (id.startsWith('npc-')) d = npcDef(id); else d = monsterDef(SPRITE_FRAMES[id] ? id : 'grave-crawler');
  cache.set(id, d); return d;
}
export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** monster display name → sprite id (falls back to the closest family so every species gets art) */
export function monsterSpriteId(name: string) {
  const s = slug(name.replace(/\s*[—-]\s*elite$/i, '')); if (SPRITE_FRAMES[s]) return s;
  if (/crawler/.test(s)) return 'grave-crawler'; if (/hound|wolf/.test(s)) return 'ash-hound'; if (/spider/.test(s)) return 'thorn-spider';
  if (/golem|guard|sentinel/.test(s)) return 'crystal-golem'; if (/wraith|spirit|ghost/.test(s)) return 'frost-wraith'; if (/drake|dragon|serpent/.test(s)) return 'ember-drake';
  return 'grave-crawler';
}
export function npcSpriteId(name: string) { const s = 'npc-' + slug(name); return SPRITE_FRAMES[s] ? s : null; }
