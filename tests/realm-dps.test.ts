// Calibration (round 9): the real client combat (the store), played as hard as the rules allow — every skill at max level,
// a 12-monster pack always in reach, dead monsters back at once — must stay under the realm's kill ceiling (legitDps), so
// an honest player is never refused. Re-run after any skill rework: the ceiling is computed from the skill library.
import test from 'node:test';
import assert from 'node:assert/strict';
let T = 1_800_000_000_000; Date.now = () => T;
import { useGameStore, cityMonsters } from '../src/store/useGameStore';
import { legitDps, DEFAULT_LIMITS } from '../apps/game-server/src/session';
import { DEFAULT_CONFIG } from '../src/game/balance/config';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';
import { makeGear, pickGearId } from '../src/game/items';
import { monsterStats } from '../src/game/balance/stats';
const S = () => useGameStore.getState();
const live = { config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, limits: DEFAULT_LIMITS };
/** round 13: one class — the Berserker before and after the Reaver advancement */
const CLASSES = ['Berserker', 'Reaver'] as const;
const RAR = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'God', 'Pre-arch', 'Arch'] as const;
for (const [level, rar, enh] of [[1, 0, 0], [30, 3, 6], [60, 5, 10], [100, 7, 15]] as const) test(`legit play at Lv ${level} stays under the realm ceiling`, () => {
  for (const form of CLASSES) {
    const cls = 'Berserker' as const, promotionId = form === 'Reaver' ? 'Reaver' as const : undefined;
    S().chooseClass(cls); useGameStore.setState({ lockedClass: null });
    const equipment: any = { weapon: null, armor: null, helmet: null, gloves: null, boots: null, ring: null, costume: null };
    for (const slot of ['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring']) { let g: any = null; for (let i = 0; i < 40 && (!g || g.slot !== slot); i++) g = makeGear(pickGearId(RAR[rar], cls), cls); if (g?.slot === slot) equipment[slot] = { ...g, classLock: cls, enhance: enh }; }
    const skillLevels = Object.fromEntries(DEFAULT_SKILLS.defs.filter(d => promotionId || !d.promotion).map(d => [d.id, d.maxLevel]));
    useGameStore.setState(s => ({ journal: false, equipment, skillLevels, deadUntil: 0, pending: null, cooldowns: {}, buffs: [], player: { ...s.player, level, promotionId, cityId: 'wild0', position: [0, -20], hp: 1e9, mp: 1e9 } }));
    const mHp = monsterStats(level, {}, DEFAULT_CONFIG).maxHp;
    const pack = () => cityMonsters('wild0').slice(0, 12).map((m, i) => ({ ...m, level, x: Math.cos(i) * 1.2, z: -20 + Math.sin(i) * 1.2, home: [Math.cos(i) * 1.2, -20 + Math.sin(i) * 1.2] as [number, number], hp: mHp, maxHp: mHp }));
    useGameStore.setState({ monsters: pack() });
    let killedHp = 0; const t0 = T, seconds = 60;
    while (T - t0 < seconds * 1000) {
      T += 50; const before = S().monsters;
      useGameStore.setState(s => ({ player: { ...s.player, hp: 1e9, mp: 1e9, position: [0, -20] } }));
      for (let k = 1; k <= 6; k++) S().castSlot(k);
      const t = S().monsters.find(m => m.hp > 0); if (t) { useGameStore.setState({ selectedMonster: t.id }); S().attack(t.id); }
      S().tick();
      for (const m of S().monsters) { const b = before.find(x => x.id === m.id); if (b && b.hp > 0 && m.hp <= 0) killedHp += b.maxHp; }
      // keep the pack full and close: dead ones come back at once (no 8 s wait), worst case for the check
      useGameStore.setState(s => ({ monsters: s.monsters.map((m, i) => m.hp <= 0 ? { ...pack()[i], id: m.id } : { ...m, x: Math.cos(i) * 1.2, z: -20 + Math.sin(i) * 1.2 }) }));
    }
    const real = killedHp / seconds, ceiling = legitDps({ ...S(), drops: [] } as any, live, T) * DEFAULT_LIMITS.killDpsSlack;
    console.log(`Lv${level} ${form.padEnd(9)} kills ${(killedHp / mHp).toFixed(0).padStart(4)} · real ${real.toFixed(0).padStart(7)} HP/s · ceiling ${ceiling.toFixed(0).padStart(8)} · ratio ${(real / ceiling).toFixed(2)}`);
    assert.ok(real < ceiling, `${form} Lv${level}: real ${real.toFixed(0)} must stay under ${ceiling.toFixed(0)}`);
  }
});
