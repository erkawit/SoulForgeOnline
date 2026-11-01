// Round 9: the realm owns every character's progress. A character is loaded when its player logs in, kept in memory
// while they play, changed only through the shared economy reducers (src/game/economy/core.ts, see acts.ts) and
// written back to Supabase `characters` a couple of seconds after each change (and at once on logout / shutdown).
// Writes carry a revision number: a save that does not match the stored revision is refused, so two realm processes
// can never overwrite each other's copy of the same character.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CharState } from '@/game/economy/core';

export type Stored = { state: CharState; rev: number };
export interface CharacterRepo {
  load(user: string): Promise<Stored | null>;
  /** save at revision `rev`; resolves to the new revision, rejects on a revision mismatch */
  save(user: string, state: CharState, rev: number): Promise<number>;
  /** the round-8 cloud save (player_snapshots), imported once when a character first comes online */
  legacySnapshot(user: string): Promise<unknown | null>;
}

export class RevisionConflict extends Error { constructor(user: string) { super(`character ${user}: revision conflict`); } }

/** in-memory store for tests and local runs without Supabase */
export class MemoryRepo implements CharacterRepo {
  rows = new Map<string, Stored>(); legacy = new Map<string, unknown>(); saves = 0;
  async load(user: string) { const r = this.rows.get(user); return r ? { state: structuredClone(r.state), rev: r.rev } : null; }
  async save(user: string, state: CharState, rev: number) {
    const cur = this.rows.get(user); if ((cur?.rev ?? 0) !== rev) throw new RevisionConflict(user);
    this.rows.set(user, { state: structuredClone(state), rev: rev + 1 }); this.saves++; return rev + 1;
  }
  async legacySnapshot(user: string) { return this.legacy.get(user) ?? null; }
}

export class SupabaseRepo implements CharacterRepo {
  constructor(private db: SupabaseClient) {}
  async load(user: string) {
    const { data, error } = await this.db.from('characters').select('state,rev').eq('user_id', user).maybeSingle();
    if (error) throw new Error(`load character: ${error.message}`);
    return data ? { state: data.state as CharState, rev: Number(data.rev) } : null;
  }
  async save(user: string, state: CharState, rev: number) {
    if (rev === 0) {
      const { error } = await this.db.from('characters').insert({ user_id: user, state, rev: 1 });
      if (error) { if (error.code === '23505') throw new RevisionConflict(user); throw new Error(`create character: ${error.message}`); }
      return 1;
    }
    const { data, error } = await this.db.from('characters').update({ state, rev: rev + 1, updated_at: new Date().toISOString() }).eq('user_id', user).eq('rev', rev).select('rev');
    if (error) throw new Error(`save character: ${error.message}`);
    if (!data?.length) throw new RevisionConflict(user);
    return rev + 1;
  }
  async legacySnapshot(user: string) {
    const { data } = await this.db.from('player_snapshots').select('snapshot').eq('user_id', user).maybeSingle();
    return data?.snapshot ?? null;
  }
}
