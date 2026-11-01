'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Sparkles } from '@react-three/drei';
import {
  AnimationMixer,
  AnimationAction,
  LoopOnce,
  LoopRepeat,
  Group,
  Mesh,
  MeshStandardMaterial,
  Color,
} from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { ClassId } from '@/game/content';
import { CLASSES } from '@/game/content';
import {
  characterModelUrl,
  locomotionTimeScale,
  type CharacterClip,
} from '@/game/characterModels';

export type RiggedHeroProps = {
  job: ClassId;
  clip?: CharacterClip;
  replay?: number;
  duration?: number;
  glow?: string;
  speedRef?: { current: number };
  gender?: 'm' | 'f';
  scale?: number;
};

export default function RiggedHero({
  job,
  clip = 'Idle',
  replay = 0,
  duration,
  glow,
  speedRef,
  scale = 1.05,
}: RiggedHeroProps) {
  const modelUrl = characterModelUrl(job);
  const { scene, animations } = useGLTF(modelUrl);

  // Clone unique skeleton & hierarchy per instance
  const clonedScene = useMemo(() => {
    const copy = clone(scene);
    copy.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        const mesh = obj as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Enhance materials for rich Dark Fantasy look
        if (mesh.material) {
          const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial;
          if (mat) {
            mat.roughness = Math.min(mat.roughness, 0.7);
            // Detect and enhance soul energy / gems
            if (mat.name.toLowerCase().includes('glow') || mat.name.toLowerCase().includes('gem') || mesh.name.toLowerCase().includes('gem')) {
              const soulColor = glow ?? CLASSES[job].glow;
              mat.color = new Color(soulColor);
              mat.emissive = new Color(soulColor);
              mat.emissiveIntensity = 1.6;
            } else if (mat.name.toLowerCase().includes('steel') || mat.name.toLowerCase().includes('blade') || mat.name.toLowerCase().includes('metal')) {
              mat.metalness = 0.85;
              mat.roughness = 0.3;
            } else if (mat.name.toLowerCase().includes('gold')) {
              mat.metalness = 0.8;
              mat.roughness = 0.35;
            }
          }
        }
      }
    });
    return copy;
  }, [scene, job, glow]);

  // Set up AnimationMixer
  const mixer = useMemo(() => new AnimationMixer(clonedScene), [clonedScene]);
  const actions = useMemo(() => {
    const map = new Map<string, AnimationAction>();
    for (const anim of animations) {
      map.set(anim.name, mixer.clipAction(anim));
    }
    return map;
  }, [animations, mixer]);

  const activeAction = useRef<AnimationAction | null>(null);
  const currentClip = useRef<string>('');

  // Handle clip switching with smooth cross-fading
  useEffect(() => {
    const targetClip = actions.has(clip) ? clip : 'Idle';
    const nextAction = actions.get(targetClip);
    if (!nextAction) return;

    const prevAction = activeAction.current;
    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(0.12);
    }

    nextAction.reset();

    if (targetClip === 'Death') {
      nextAction.setLoop(LoopOnce, 1);
      nextAction.clampWhenFinished = true;
      nextAction.timeScale = 1;
    } else if (
      targetClip === 'Attack' ||
      targetClip === 'Attack2' ||
      targetClip === 'Skill' ||
      targetClip === 'Buff' ||
      targetClip === 'Special' ||
      targetClip === 'Hit'
    ) {
      nextAction.setLoop(LoopOnce, 1);
      nextAction.clampWhenFinished = true;
      if (duration && duration > 0) {
        const animDuration = nextAction.getClip().duration;
        nextAction.timeScale = Math.max(0.6, Math.min(2.5, animDuration / duration));
      } else {
        nextAction.timeScale = 1.2;
      }
    } else if (targetClip === 'Channel' || targetClip === 'Guard') {
      nextAction.setLoop(LoopRepeat, Infinity);
      nextAction.timeScale = 1;
    } else {
      // Walk or Run
      nextAction.setLoop(LoopRepeat, Infinity);
      const speed = speedRef?.current ?? (targetClip === 'Run' ? 3.0 : 1.5);
      nextAction.timeScale = locomotionTimeScale(targetClip as CharacterClip, speed);
    }

    try {
      nextAction.fadeIn(0.12).play();
    } catch {
      nextAction.play();
    }
    activeAction.current = nextAction;
    currentClip.current = targetClip;
  }, [actions, clip, replay, duration, speedRef]);

  // Frame update
  useFrame((_, dt) => {
    const delta = Math.min(dt, 0.05);

    // Sync locomotion playback with live ground speed
    if (currentClip.current === 'Walk' || currentClip.current === 'Run') {
      const cur = activeAction.current;
      if (cur && speedRef) {
        const spd = speedRef.current;
        cur.timeScale = locomotionTimeScale(currentClip.current as CharacterClip, spd);
      }
    }

    mixer.update(delta);
  });

  // Cleanup mixer on unmount
  useEffect(() => {
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [mixer, clonedScene]);

  const soulColor = glow ?? CLASSES[job].glow;

  return (
    <group scale={scale}>
      <primitive object={clonedScene} />
      {/* Soul Aura Sparkles on the character */}
      <Sparkles
        count={8}
        position={[0, 1.1, 0]}
        scale={[0.8, 1.4, 0.8]}
        color={soulColor}
        size={1.6}
        speed={0.4}
      />
    </group>
  );
}

useGLTF.preload = (url: string) => {
  // Preload helper
  return url;
};
