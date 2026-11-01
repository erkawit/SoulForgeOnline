'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  AnimationMixer,
  AnimationAction,
  LoopOnce,
  LoopRepeat,
  Mesh,
  MeshStandardMaterial,
  Color,
} from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Monster } from '@/lib/types';
import { monsterModel, monsterModelUrl } from '@/game/characterModels';

export default function RiggedMonster({
  mob,
  spec,
}: {
  mob: Monster;
  spec: NonNullable<ReturnType<typeof monsterModel>>;
}) {
  const modelUrl = monsterModelUrl(spec.id);
  const { scene, animations } = useGLTF(modelUrl);

  const clonedScene = useMemo(() => {
    const copy = clone(scene);
    copy.traverse((obj) => {
      if ((obj as Mesh).isMesh) {
        const mesh = obj as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mob.boss) {
          // Boss highlights
          if (mesh.material) {
            const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial;
            if (mat && mat.color) {
              mat.roughness = 0.6;
            }
          }
        }
      }
    });
    return copy;
  }, [scene, mob.boss]);

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
  const prevHp = useRef(mob.hp);

  useFrame((_, dt) => {
    const delta = Math.min(dt, 0.05);
    const now = Date.now();

    // Determine target clip
    let next = 'Idle';
    if (mob.hp <= 0) {
      next = 'Death';
    } else if (mob.telegraph && actions.has('Skill')) {
      next = 'Skill';
    } else if (now - mob.lastAttack < 600 && actions.has('Attack')) {
      next = 'Attack';
    } else if (mob.hp < prevHp.current && actions.has('Hit')) {
      next = 'Hit';
    } else {
      next = actions.has('Walk') ? 'Walk' : 'Idle';
    }
    prevHp.current = mob.hp;

    if (next !== currentClip.current) {
      const nextAction = actions.get(next);
      if (nextAction) {
        if (activeAction.current && activeAction.current !== nextAction) {
          activeAction.current.fadeOut(0.1);
        }
        nextAction.reset();
        if (next === 'Death' || next === 'Attack' || next === 'Skill' || next === 'Hit') {
          nextAction.setLoop(LoopOnce, 1);
          nextAction.clampWhenFinished = true;
        } else {
          nextAction.setLoop(LoopRepeat, Infinity);
        }
        nextAction.fadeIn(0.1).play();
        activeAction.current = nextAction;
        currentClip.current = next;
      }
    }

    mixer.update(delta);
  });

  useEffect(() => {
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [mixer, clonedScene]);

  const s = spec.scale * (mob.elite && !mob.boss ? 1.25 : 1);

  return <primitive object={clonedScene} scale={s} />;
}
