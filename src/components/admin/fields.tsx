'use client';
// Small path-based editors for the balance config draft.
import type { ReactNode } from 'react';

export type Draft = Record<string, unknown>;
export function getPath(o: unknown, path: (string | number)[]): unknown { return path.reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined), o); }
export function setPath<T>(o: T, path: (string | number)[], value: unknown): T {
  if (!path.length) return value as T;
  const [k, ...rest] = path; const src = (o ?? {}) as Record<string | number, unknown>;
  const copy: Record<string | number, unknown> | unknown[] = Array.isArray(src) ? [...src] : { ...src };
  (copy as Record<string | number, unknown>)[k] = setPath(src[k], rest, value); return copy as T;
}

export function Num({ draft, path, onChange, step = 1, min, max, pct, label, suffix, width }: { draft: Draft; path: (string | number)[]; onChange: (d: Draft) => void; step?: number; min?: number; max?: number; pct?: boolean; label?: ReactNode; suffix?: string; width?: number }) {
  const raw = Number(getPath(draft, path) ?? 0), shown = pct ? Math.round(raw * 10000) / 100 : raw;
  const id = 'f-' + path.join('-');
  return <label className="ad-num" style={width ? { width } : undefined} htmlFor={id}>
    {label && <span>{label}</span>}
    <span className="ad-num-input"><input id={id} type="number" step={pct ? step : step} min={min} max={max} value={Number.isFinite(shown) ? shown : 0}
      onChange={e => { const v = Number(e.target.value); if (Number.isFinite(v)) onChange(setPath(draft, path, pct ? v / 100 : v)); }} />{(suffix || pct) && <em>{pct ? '%' : suffix}</em>}</span>
  </label>;
}
export function Toggle({ draft, path, onChange, label }: { draft: Draft; path: (string | number)[]; onChange: (d: Draft) => void; label: ReactNode }) {
  const id = 'f-' + path.join('-');
  return <label className="ad-toggle" htmlFor={id}><input id={id} type="checkbox" checked={Boolean(getPath(draft, path))} onChange={e => onChange(setPath(draft, path, e.target.checked))} /><span>{label}</span></label>;
}
export function Section({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return <section className="ad-section"><header><h3>{title}</h3>{hint && <p>{hint}</p>}</header>{children}</section>;
}
