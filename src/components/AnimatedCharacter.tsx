'use client';
// 2.5D hero: the painted compact-cast-v2 character as a living sprite (see game/sprites/spriteActor.ts).
// Same props as the old GLB version, so ClassActor / CharacterCreate / CharacterStudio drive it unchanged.
import { useAttached } from './useAttached';
import type { FashionItem } from '@/game/fashion';
import { weaponKindOf } from '@/game/items';
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ClassId } from '@/game/content';
import type { CharacterClip } from '@/game/characterModels';
import { SpriteActor, spriteView } from '@/game/sprites/spriteActor';
import { heroId, type Gender } from '@/game/sprites/catalog';
import { liteAnim } from '@/game/sprites/anims';
import { useGameStore } from '@/store/useGameStore';

export function applyClip(actor: SpriteActor, clip: string, duration?: number) {
  if (clip !== 'Death' && actor.dead) actor.revive();
  if (clip === 'Idle' || clip === 'Run' || clip === 'Walk') { actor.setLoco(clip); actor.endShot(); }
  else if (clip === 'Death') actor.die();
  else if (clip === 'Channel') actor.play('Channel', { loop: true });
  else if (clip === 'Guard') actor.play('Guard', { hold: true });
  else actor.playFor(clip, duration);
}

export default function AnimatedCharacter({ job, clip = 'Idle', replay = 0, duration, glow, speedRef, gender, scale, costume, lite, promotion, weapon, hair, hairColor, fashion, weaponSkin, xray }: {
  /** the local player: silhouette through walls and props */ xray?: boolean;
  job: ClassId; clip?: CharacterClip; replay?: number; duration?: number; glow?: string; speedRef?: { current: number }; gender?: Gender; scale?: number;
  /** costume sprite set (e.g. 'thai'): same clips, different painted outfit */ costume?: string | null;
  /** login / class select: idle + one cast flipbook only, played slower */ lite?: boolean;
  /** class advancement look (round 12): Reaver, Archmage … — the painted look of that promotion */ promotion?: string | null;
  /** layered heroes (round 13): the equipped weapon (default: the form's starting kit) and the hair style */ weapon?: { definitionId?: string; tier?: number } | null; hair?: string;
  /** worn fashion overlays (wings, head, aura …) and the weapon-skin sheet (round 13) */ fashion?: FashionItem[]; weaponSkin?: string | null;
  /** layered heroes: hair colour (multiplies the neutral-grey hair sheets), e.g. '#e8e2d6' silver or '#5a3420' brown */ hairColor?: string;
}) {
  const own = useGameStore(s => s.player.gender);
  const g: Gender = gender ?? (own === 'f' ? 'f' : 'm');
  const actor = useMemo(() => new SpriteActor(heroId(job, g, costume, promotion), { scale, ...(lite && g === 'm' && !costume ? { anim: liteAnim(job) ?? undefined, pace: 0.7 } : {}) }), [job, g, scale, costume, lite, promotion]);
  useEffect(() => () => actor.dispose(), [actor]);
  const holder = useAttached(actor.root);
  useEffect(() => { if (glow) actor.setGlow(glow); }, [actor, glow]);
  useEffect(() => { actor.setXray(!!xray); }, [actor, xray]);
  const wKind = weaponKindOf(weapon) ?? (promotion === 'Reaver' ? 'greataxe' : 'greatsword'), wTier = weapon?.tier ?? 0;
  useEffect(() => { actor.setWeapon(wKind, wTier, weaponSkin); }, [actor, wKind, wTier, weaponSkin]);
  useEffect(() => { actor.setOverlays((fashion ?? []).map(f => ({ ...f, art: typeof f.art === 'string' ? f.art : f.art?.[g] }))); }, [actor, fashion, g]);
  useEffect(() => { if (hair) actor.setHair(hair); }, [actor, hair]);
  useEffect(() => { if (hairColor) actor.setHairColor(hairColor); }, [actor, hairColor, hair]);
  useEffect(() => { applyClip(actor, clip, duration); }, [actor, clip, replay, duration]);
  useFrame(({ camera }, dt) => {
    spriteView.camera = camera;
    if (speedRef) actor.locoSpeed = Math.max(0.7, Math.min(2.4, speedRef.current / 3));
    actor.update(dt);
  });
  return <group ref={holder} />;
}
