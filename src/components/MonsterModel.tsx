'use client';
// 2.5D monsters: every species uses its painted compact-cast-v2 sprite (game/sprites). Walk bob/stride follows real
// ground speed, Attack on lastAttack, Skill (painted slam / vortex / breath pose for bosses) on telegraph, Hit on damage.
import { useAttached } from './useAttached';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import type { Monster } from '@/lib/types';
import { SpriteActor, spriteView } from '@/game/sprites/spriteActor';
import { monsterSpriteId } from '@/game/sprites/catalog';
import { useGameStore } from '@/store/useGameStore';

function SpriteMonster({ mob }: { mob: Monster }) {
  const id = monsterSpriteId(mob.name);
  const actor = useMemo(() => new SpriteActor(id, { scale: mob.elite && !mob.boss ? 1.3 : 1, tint: mob.elite && !mob.boss ? '#fff1d6' : undefined }), [id, mob.elite, mob.boss]);
  useEffect(() => () => actor.dispose(), [actor]);
  const holder = useAttached(actor.root), root = useRef<Group>(null), prev = useRef<[number, number]>([mob.x, mob.z]), speed = useRef(0), clip = useRef(''), hp = useRef(mob.hp), deadAt = useRef(0);
  useFrame(({ camera }, dt) => {
    spriteView.camera = camera; if (!root.current) return;
    const d = Math.min(dt, .1), dx = mob.x - prev.current[0], dz = mob.z - prev.current[1], dist = Math.hypot(dx, dz); prev.current = [mob.x, mob.z];
    const step = dist < 2 && d > 0 ? dist / d : 0; speed.current += (step - speed.current) * (1 - Math.exp(-8 * d));
    const now = Date.now();
    // face where it walks; while winding up or striking, face the telegraph target / the player (8-way sheets show it)
    const pp = useGameStore.getState().player.position, aim = mob.telegraph?.target ?? (now - mob.lastAttack < 700 ? pp : null);
    const target = aim && Math.hypot(aim[0] - mob.x, aim[1] - mob.z) > .05 ? Math.atan2(aim[0] - mob.x, aim[1] - mob.z) : dist > .001 && dist < 2 ? Math.atan2(dx, dz) : null;
    if (target !== null) root.current.rotation.y += (MathUtils.euclideanModulo(target - root.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI) * (1 - Math.exp(-(aim ? 14 : 10) * d));
    if (mob.hp < hp.current && mob.hp > 0) actor.flash('#ffffff', 1); hp.current = mob.hp;
    const next = mob.hp <= 0 ? 'Death' : mob.telegraph ? 'Skill' : now - mob.lastAttack < 700 ? 'Attack' : speed.current > .15 ? 'Walk' : 'Idle';
    if (next !== clip.current) {
      if (next === 'Death') { actor.die(); deadAt.current = now; } else { if (actor.dead) { actor.revive(); } if (next === 'Walk' || next === 'Idle') { actor.setLoco(next); actor.endShot(); } else actor.play(next); }
      clip.current = next;
    }
    actor.locoSpeed = Math.min(2.2, Math.max(.6, speed.current / 1.8));
    actor.setOpacity(mob.hp <= 0 ? Math.max(0, 1 - (now - deadAt.current - 900) / 700) : 1);
    actor.update(dt);
  });
  return <group ref={root} position={[0, -.17, 0]}><group ref={holder} /></group>;
}

export default function MonsterModel({ mob }: { mob: Monster }) { return <SpriteMonster mob={mob} />; }
/** Keep a dead monster on screen long enough for its topple + fade, then hide it until respawn. */
export function useDeathLinger(mob: Monster, ms = 1700) {
  const [visible, setVisible] = useState(mob.hp > 0);
  useEffect(() => { if (mob.hp > 0) { setVisible(true); return; } const t = setTimeout(() => setVisible(false), ms); return () => clearTimeout(t); }, [mob.hp, ms]);
  return visible;
}
export const hasMonsterModel = (_name: string) => true;
