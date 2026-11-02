'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import GameHUD from './GameHUD';
import PlayOverlay from './PlayOverlay';
import AuthGate, { type BetaProfile } from './auth/AuthGate';
import { useCallback } from 'react';

import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { createSnapshot, useGameStore } from '@/store/useGameStore';
import { audio } from '@/game/audio/engine';
import { isClass } from '@/game/content';
import AutoPilot from './AutoPilot';
import UiScale from './UiScale';

const GameWorld = dynamic(() => import('./GameWorld'), { ssr: false,
  loading: () => <div className="world-loading">SUMMONING THE ECLIPSE...</div> });

export default function GameClient() {
  // title music on the login / creation screens; GameRoot switches to the field theme
  useEffect(() => { audio.init(); try { const a = JSON.parse(localStorage.getItem('sf-audio') ?? 'null'); if (a) audio.configure(a); } catch { /* */ } audio.playMusic('title'); }, []);
  const onProfile = useCallback((p: BetaProfile) => useGameStore.getState().applyProfile(p.display_name ?? 'Adventurer', isClass(p.class_id) ? p.class_id : 'Berserker', p.gender === 'f' ? 'f' : 'm'), []);
  return <AuthGate onProfile={onProfile}><GameRoot /></AuthGate>;
}

function GameRoot() {
  // dev only: the store on window for test scripts
  useEffect(() => { if (process.env.NODE_ENV !== 'production') (window as unknown as { __game?: typeof useGameStore }).__game = useGameStore; }, []);
  useEffect(() => { audio.playMusic('field'); const t = setTimeout(() => useGameStore.getState().tip('start'), 1500); return () => { clearTimeout(t); audio.playMusic('title'); }; }, []);
  useEffect(() => {
    try {
      const cache = window.localStorage.getItem('soulforge_guest_v1');
      if (cache) useGameStore.getState().hydrate(JSON.parse(cache));
    } catch { /* local storage unavailable */ }
    let dirty = false;
    const save = () => {
      if (!dirty || useMultiplayerStore.getState().online) return;
      try { window.localStorage.setItem('soulforge_guest_v1', JSON.stringify(createSnapshot())); dirty = false; }
      catch { /* storage unavailable or quota exceeded */ }
    };
    const unsubscribe = useGameStore.subscribe(() => { dirty = true; });
    const timer = setInterval(save, 900);
    window.addEventListener('pagehide', save);
    const worldTick = setInterval(() => useGameStore.getState().tick(), 250);
    return () => { save(); clearInterval(timer); unsubscribe(); clearInterval(worldTick); window.removeEventListener('pagehide', save); };
  }, []);
  return <main className="game-root"><div className="world-surface"><GameWorld /></div><GameHUD /><PlayOverlay /><AutoPilot /><UiScale /></main>;
}
