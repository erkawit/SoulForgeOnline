'use client';

import { useEffect, useState } from 'react';
import { CloudUpload, CloudDownload, LogOut, ShieldCheck } from 'lucide-react';
import { createSnapshot, useGameStore } from '@/store/useGameStore';
import { getSupabaseBrowser } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Snapshot } from '@/lib/types';

export default function CloudSave() {
  const supabase = getSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_evt, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) return <div className="info-note">Guest mode active. Game progress is saved in this browser. Configure Supabase environment variables to enable account login and cloud saves.</div>;

  async function login(mode: 'login' | 'signup') {
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      setMessage(mode === 'signup' && !result.data.session ? 'Please confirm your email before signing in.' : 'Account connected.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Login failed.'); }
    finally { setBusy(false); }
  }

  async function sync(mode: 'save' | 'load') {
    if (!supabase) return;
    setBusy(true); setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in first.');
      const response = await fetch('/api/character', {
        method: mode === 'save' ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        ...(mode === 'save' ? { body: JSON.stringify(createSnapshot()) } : {})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      if (mode === 'load') {
        if (!data.snapshot) throw new Error('No cloud save exists for this account.');
        useGameStore.getState().hydrate(data.snapshot as Snapshot);
      }
      setMessage(mode === 'save' ? 'Cloud save completed.' : 'Cloud progress loaded.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Cloud sync failed.'); }
    finally { setBusy(false); }
  }

  return <div className="cloud-panel">
    <div className="label-quiet flex items-center gap-2"><ShieldCheck size={13} /> SUPABASE ACCOUNT</div>
    {!user ? <>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="text-field" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="text-field" />
      <div className="flex gap-2"><button className="action-button grow" disabled={busy} onClick={() => void login('login')}>Sign in</button>
        <button className="action-button ghost grow" disabled={busy} onClick={() => void login('signup')}>Create account</button></div>
    </> : <>
      <div className="info-note">Signed in as <b>{user.email}</b></div>
      <button className="action-button w-full" disabled={busy} onClick={() => void sync('save')}><CloudUpload size={15} /> Save to cloud</button>
      <button className="action-button ghost w-full" disabled={busy} onClick={() => void sync('load')}><CloudDownload size={15} /> Load cloud save</button>
      <button className="text-link" onClick={() => void supabase.auth.signOut()}><LogOut size={12} /> Sign out</button>
    </>}
    {message && <div className="info-note">{message}</div>}
    <div className="info-note">Prototype-only save format. Cloud saves are not cheat-proof; do not enable competitive economy or trading without server-authoritative combat and inventory.</div>
  </div>;
}
