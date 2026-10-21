'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import GameHUD from './GameHUD';
import FieldJournal from './FieldJournal';

import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { createSnapshot, useGameStore } from '@/store/useGameStore';

const GameWorld = dynamic(() => import('./GameWorld'), { ssr: false,
  loading: () => <div className="world-loading">SUMMONING THE ECLIPSE...</div> });

export default function GameClient() {
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
    const worldTick = setInterval(() => (!useMultiplayerStore.getState().connected && useGameStore.getState().tick()), 250);
    return () => { save(); clearInterval(timer); unsubscribe(); clearInterval(worldTick); window.removeEventListener('pagehide', save); };
  }, []);
  return <main className="game-root"><div className="world-surface"><GameWorld /></div><GameHUD /><FieldJournal /></main>;
}
