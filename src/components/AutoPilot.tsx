'use client';
// AUTO hunt driver (offline world). Every 200 ms builds an AutoView from the store, asks game/auto.ts what to do and
// runs the first action that works: potions → food → heals / buffs (support focus) → damage skills → basic attack → seek.
// Moving by hand pauses AUTO for 3 s and re-centres the hunt radius where you stopped.
import { useEffect } from 'react';
import { decideAuto, wantsLoot, type AutoAction, type AutoView } from '@/game/auto';
import { FOOD_ITEMS } from '@/game/items';
import { scaled } from '@/game/skills/engine';
import { evolvedSkill } from '@/game/skills/defaults';
import { skillLib } from '@/store/useConfigStore';
import { countOf, derivedOf, useGameStore } from '@/store/useGameStore';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';

let anchor: [number, number] = [0, 0];
export default function AutoPilot() {
  useEffect(() => {
    const manual = (e: KeyboardEvent) => { if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase()) && useGameStore.getState().auto.enabled) useGameStore.setState({ autoPauseUntil: Date.now() + 3000 }); };
    const toggle = (e: KeyboardEvent) => { if (e.target instanceof HTMLElement && e.target.closest('input,textarea,select')) return; if (e.key.toLowerCase() === 'z' && !e.repeat) { const s = useGameStore.getState(); anchor = [...s.player.position]; s.setAuto(!s.auto.enabled); } };
    window.addEventListener('keydown', manual); window.addEventListener('keydown', toggle);
    let lastOn = false;
    const t = setInterval(() => {
      const s = useGameStore.getState(), now = Date.now();
      // the hero always picks up what it walks over (AUTO on or off) — loot matching the filter in the AUTO settings
      if (s.auto.loot && !s.deadUntil) { const [qx, qz] = s.player.position; for (const x of s.drops) if (Math.hypot(x.x - qx, x.z - qz) < LOOT_REACH && wantsLoot(s.auto, x.item)) s.pickup(x.id); }
      if (!s.auto.enabled || s.deadUntil || s.journal) { lastOn = s.auto.enabled; return; }
      if (!lastOn) anchor = [...s.player.position]; lastOn = true;
      if (now < s.autoPauseUntil) { anchor = [...s.player.position]; return; }
      const [px, pz] = s.player.position, d = derivedOf(s, now);
      const alive = s.monsters.filter(m => m.hp > 0), sel = alive.find(m => m.id === s.selectedMonster);
      const lib = skillLib().defs, ids = [s.hotbar.skill, s.hotbar.buff, s.hotbar.special, ...s.extraHotbar];
      // round 13: a slot plays its Reaver evolution once learned; a skill is ready only with enough Rage and outside a channel
      const slots = ids.map((slotId, i) => { const id = evolvedSkill(skillLib(), slotId, s.skillLevels), def = lib.find(x => x.id === id) ?? null, lvl = id ? s.skillLevels[id] ?? 0 : 0;
        const channelling = !!s.channel && s.channel.until > now;
        return { slot: i + 1, def: def && lvl > 0 ? def : null, ready: !!def && (s.cooldowns[def.id] ?? 0) <= now && !s.pending && !channelling && s.rage >= (def.rageCost ?? 0), mpCost: def ? Math.round(scaled(def.mpCost, def.mpPerLevel, Math.max(1, lvl))) : 0 }; });
      const view: AutoView = {
        hpPct: s.player.hp / d.maxHp, mpPct: s.player.mp / d.maxMp, mp: s.player.mp, busy: !!s.pending || !!s.charge, inCombat: alive.some(m => Math.hypot(m.x - px, m.z - pz) < 6),
        hasTarget: !!sel, targetInRange: !!sel && Math.hypot(sel.x - px, sel.z - pz) < 3.5, enemyNear: alive.some(m => Math.hypot(m.x - px, m.z - pz) < 5), targetIsBoss: !!sel?.boss,
        enemiesNear: sel ? alive.filter(m => Math.hypot(m.x - sel.x, m.z - sel.z) < 4).length : 0,
        allies: [{ id: 'me', hpPct: s.player.hp / d.maxHp, dist: 0, alive: true, buffs: s.buffs.flatMap(b => [b.id, b.id.slice(0, b.id.lastIndexOf('-'))]), self: true }],
        slots, hpPotions: ['potion-hp-l', 'potion-hp-m', 'potion-hp-s'].reduce((a, id) => a + countOf(s.inventory, id), 0), mpPotions: ['potion-mp-m', 'potion-mp-s'].reduce((a, id) => a + countOf(s.inventory, id), 0),
        foodCount: FOOD_ITEMS.reduce((a, f) => a + countOf(s.inventory, f.id), 0), foodActive: s.buffs.some(b => b.id.startsWith('food-') && b.until > now), potionReady: true,
        lootNear: s.drops.some(x => Math.hypot(x.x - px, x.z - pz) < LOOT_WALK && wantsLoot(s.auto, x.item)), cls: 'Berserker',
      };
      for (const a of decideAuto(view, s.auto)) if (run(a)) break;
    }, 200);
    return () => { clearInterval(t); window.removeEventListener('keydown', manual); window.removeEventListener('keydown', toggle); };
  }, []);
  return null;
}
/** pickup reach (economy pickup allows 4 m) and how far auto walks for loot between fights */
const LOOT_REACH = 3.6, LOOT_WALK = 12;
function run(a: AutoAction): boolean {
  const s = useGameStore.getState(), [px, pz] = s.player.position;
  switch (a.type) {
    case 'potion': return s.usePotion(a.kind);
    case 'food': return s.eatFood();
    case 'skill': { const before = s.cooldowns; s.castSlot(a.slot); return useGameStore.getState().cooldowns !== before; }
    case 'loot': {
      // between fights: walk to the nearest loot within LOOT_WALK m (the click-to-move route), pick it up on arrival
      const near = s.drops.filter(x => wantsLoot(s.auto, x.item)).map(x => ({ x, d: Math.hypot(x.x - px, x.z - pz) })).filter(o => o.d < LOOT_WALK).sort((a, b) => a.d - b.d)[0];
      if (!near) return false;
      if (near.d < LOOT_REACH) { s.pickup(near.x.id); return true; }
      window.dispatchEvent(new CustomEvent('sf-map-route', { detail: { city: s.player.cityId ?? 'hollow', points: [[near.x.x, near.x.z]] } }));
      return true;
    }
    case 'attack': case 'seek': {
      const cur = s.monsters.find(m => m.id === s.selectedMonster && m.hp > 0); if (cur) return true;
      const r = s.auto.radius, pick = s.monsters.filter(m => m.hp > 0 && !m.boss && Math.hypot(m.x - anchor[0], m.z - anchor[1]) < r && Math.hypot(m.x, m.z) > 6)
        .sort((x, y) => Math.hypot(x.x - px, x.z - pz) - Math.hypot(y.x - px, y.z - pz))[0];
      if (pick) { s.selectMonster(pick.id); return true; } return false;
    }
    default: return false;
  }
}
