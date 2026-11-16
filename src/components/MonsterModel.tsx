'use client';
// 2.5D monsters: every species uses its painted compact-cast-v2 sprite (game/sprites). Walk bob/stride follows real
// ground speed, Attack on lastAttack, Skill (painted slam / vortex / breath pose for bosses) on telegraph, Hit on damage.
import { useAttached } from './useAttached';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { spawnSkillFx, type FxHandle } from '@/game/fx/skillFx';
import { sideYaw } from '@/game/sprites/facing';
import { Group, MathUtils, Vector3 } from 'three';
import type { Monster } from '@/lib/types';
import { SpriteActor, spriteView } from '@/game/sprites/spriteActor';
import { monsterSpriteId } from '@/game/sprites/catalog';
import { useGameStore } from '@/store/useGameStore';

const _at = new Vector3();
function SpriteMonster({ mob }: { mob: Monster }) {
  const id = monsterSpriteId(mob.name);
  const actor = useMemo(() => new SpriteActor(id, { scale: mob.elite && !mob.boss ? 1.3 : 1, tint: mob.elite && !mob.boss ? '#fff1d6' : undefined }), [id, mob.elite, mob.boss]);
  useEffect(() => () => actor.dispose(), [actor]);
  // Nov 2026: every blow shows a slash arc on the side the monster faces (same side rule as its mirrored body)
  const scene = useThree(s => s.scene), slashes = useRef<FxHandle[]>([]), swings = useRef(0);
  useEffect(() => () => { for (const f of slashes.current) f.dispose(); slashes.current = []; }, []);
  const holder = useAttached(actor.root), root = useRef<Group>(null), prev = useRef<[number, number] | null>(null), speed = useRef(0), clip = useRef(''), hp = useRef(mob.hp), deadAt = useRef(0);
  useFrame(({ camera }, dt) => {
    spriteView.camera = camera; if (!root.current) return;
    // Nov 2026: speed and heading come from where the body is drawn (GameWorld glides it between world ticks), so the
    // walk is timed to a steady pace instead of the 4 Hz hops of the raw position
    root.current.getWorldPosition(_at); const x = _at.x, z = _at.z;
    const d = Math.min(dt, .1), dx = prev.current ? x - prev.current[0] : 0, dz = prev.current ? z - prev.current[1] : 0, dist = Math.hypot(dx, dz); prev.current = [x, z];
    const step = dist < 2 && d > 0 ? dist / d : 0; speed.current += (step - speed.current) * (1 - Math.exp(-8 * d));
    const now = Date.now();
    // face where it walks; while winding up or striking, face the telegraph target / the player — at once, so the body
    // (left / right only, sprites/facing.ts) is on the side its blow lands from the first frame
    const pp = useGameStore.getState().player.position, aim = mob.telegraph?.target ?? (now - mob.lastAttack < 700 ? pp : null);
    const target = aim && Math.hypot(aim[0] - x, aim[1] - z) > .05 ? Math.atan2(aim[0] - x, aim[1] - z) : dist > .001 && dist < 2 ? Math.atan2(dx, dz) : null;
    if (target !== null) {
      if (aim) root.current.rotation.y = target;
      else root.current.rotation.y += (MathUtils.euclideanModulo(target - root.current.rotation.y + Math.PI, Math.PI * 2) - Math.PI) * (1 - Math.exp(-10 * d));
    }
    if (mob.hp < hp.current && mob.hp > 0) actor.flash('#ffffff', 1); hp.current = mob.hp;
    const next = mob.hp <= 0 ? 'Death' : mob.telegraph ? 'Skill' : now - mob.lastAttack < 700 ? 'Attack' : speed.current > .15 ? 'Walk' : 'Idle';
    if (next !== clip.current) {
      if (next === 'Attack' && aim) {
        const fx = spawnSkillFx(scene, { cls: 'Warrior', kind: 'attack', origin: new Vector3(x, 0, z), yaw: sideYaw(Math.atan2(aim[0] - x, aim[1] - z)),
          target: new Vector3(aim[0], 0, aim[1]), color: mob.boss ? '#ff5a3c' : mob.elite ? '#ffc35a' : '#ff8d6b', combo: swings.current++ });
        slashes.current.push(fx);
      }
      if (next === 'Death') { actor.die(); deadAt.current = now; } else { if (actor.dead) { actor.revive(); } if (next === 'Walk' || next === 'Idle') { actor.setLoco(next); actor.endShot(); } else actor.play(next); }
      clip.current = next;
    }
    actor.locoSpeed = Math.min(2.2, Math.max(.6, speed.current / 1.8)); actor.groundSpeed = speed.current;
    actor.setOpacity(mob.hp <= 0 ? Math.max(0, 1 - (now - deadAt.current - 900) / 700) : 1);
    actor.update(dt);
    slashes.current = slashes.current.filter(f => { if (f.update(d)) return true; f.dispose(); return false; });
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
