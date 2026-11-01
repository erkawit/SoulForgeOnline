// The item picked in the inventory, shared with the status panel's before/after comparison.
import { useSyncExternalStore } from 'react';
let current: string | null = null; const subs = new Set<() => void>();
export const setSelectedItem = (id: string | null) => { if (id === current) return; current = id; subs.forEach(f => f()); };
export const useSelectedItem = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => current, () => null);
