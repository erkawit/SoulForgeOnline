'use client';
// Live balance + skill library. Starts from the shipped defaults, then overlays what admins saved in Supabase `game_config`.
import { create } from 'zustand';
import { DEFAULT_CONFIG, mergeConfig, type GameConfig } from '@/game/balance/config';
import { DEFAULT_SKILLS } from '@/game/skills/defaults';
import { mergeLibrary, type SkillLibrary } from '@/game/skills/engine';
import { getSupabaseBrowser } from '@/lib/supabase';

type ConfigState = { config: GameConfig; skills: SkillLibrary; loadedAt: number; source: 'defaults' | 'server'; error: string | null; load: () => Promise<void>; apply: (balance: unknown, skills: unknown) => void };

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, loadedAt: 0, source: 'defaults', error: null,
  apply: (balance, skills) => set({ config: mergeConfig(DEFAULT_CONFIG, balance), skills: mergeLibrary(DEFAULT_SKILLS, (skills ?? null) as Partial<SkillLibrary> | null) }),
  load: async () => {
    const supabase = getSupabaseBrowser(); if (!supabase) return;
    const { data, error } = await supabase.from('game_config').select('key,value').in('key', ['balance', 'skills']);
    if (error) { set({ error: error.message }); return; }
    const by = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
    get().apply(by.balance, by.skills); set({ loadedAt: Date.now(), source: 'server', error: null });
  },
}));
/** Non-React access for the game loop and store actions. */
export const cfg = () => useConfigStore.getState().config;
export const skillLib = () => useConfigStore.getState().skills;
