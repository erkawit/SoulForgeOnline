#!/usr/bin/env node
// Round 13: import Codex's painted skill effects.   node scripts/import-codex-fx.mjs <fx.manifest.json>
// manifest (output/skill-fx-codex/CODEX_PROMPT.md §Delivery):
//   { "effects": [ { "id": "b-bloodquake", "skills": ["b-bloodquake"], "hitAt": 0.42, "duration": 1.1,
//       "layers": [ { "sheet": "b-bloodquake-ground", "mode": "ground", "cw": 512, "ch": 512, "cols": 8, "frames": 16, "fps": 20, "size": 7 },
//                   { "sheet": "b-bloodquake-spikes", "mode": "billboard", "cw": 512, "ch": 512, "cols": 8, "frames": 16, "fps": 20, "size": 6, "start": 0.3 } ] } ] }
// Sheets: public/art/fx/<sheet>.webp, frames left-to-right then top-to-bottom; a dir8 layer holds 8 runs (S…SE) of `frames`.
// Skill ids must exist in src/game/skills/defaults.ts (or be basic-0 / basic-1 / basic-2 for the combo swings).
// Merges into src/game/fx/fx8.json; writes nothing when a check fails.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), OUT = join(ROOT, 'src/game/fx/fx8.json');
function webpSize(file) {
  const b = readFileSync(file); if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (t === 'VP8L') { const v = b.readUInt32LE(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  return null;
}
const path = process.argv[2]; if (!path) { console.error('usage: node scripts/import-codex-fx.mjs <manifest.json>'); process.exit(2); }
const skillIds = new Set([...readFileSync(join(ROOT, 'src/game/skills/defaults.ts'), 'utf8').matchAll(/\b([br]-[a-z-]+)\b/g)].map(m => m[1]).concat(['basic-0', 'basic-1', 'basic-2']));
const man = JSON.parse(readFileSync(path, 'utf8')), out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}, errors = [];
for (const e of man.effects ?? []) {
  const at = e.id ?? '?';
  if (!/^[a-z0-9-]+$/.test(e.id ?? '')) errors.push(`${at}: id must be a lower-case slug`);
  if (!e.skills?.length) errors.push(`${at}: skills empty`); for (const s of e.skills ?? []) if (!skillIds.has(s)) errors.push(`${at}: unknown skill "${s}"`);
  if (!(e.duration > 0) || !(e.hitAt >= 0) || e.hitAt > e.duration) errors.push(`${at}: needs duration > 0 and 0 ≤ hitAt ≤ duration`);
  if (!e.layers?.length) errors.push(`${at}: no layers`);
  for (const l of e.layers ?? []) {
    const id = `${at}/${l.sheet}`;
    if (!['ground', 'billboard', 'dir8'].includes(l.mode)) errors.push(`${id}: mode ground|billboard|dir8`);
    for (const f of ['cw', 'ch', 'cols', 'frames', 'fps', 'size']) if (!(l[f] > 0)) errors.push(`${id}: ${f} missing`);
    const n = l.mode === 'dir8' ? l.frames * 8 : l.frames, rows = Math.ceil(n / l.cols), file = join(ROOT, 'public/art/fx', `${l.sheet}.webp`);
    if (!existsSync(file)) errors.push(`${id}: ${file} missing`);
    else { const z = webpSize(file); if (z && (z.w !== l.cols * l.cw || z.h !== rows * l.ch)) errors.push(`${id}: sheet is ${z.w}×${z.h}, expected ${l.cols * l.cw}×${rows * l.ch} (${n} frames)`); }
  }
  for (const s of e.skills ?? []) for (const [k, o] of Object.entries(out)) if (k !== e.id && o.skills.includes(s)) errors.push(`${at}: skill ${s} already has effect ${k}`);
  out[e.id] = e;
}
if (errors.length) { for (const e of errors) console.error('FAIL ', e); console.error(`\n${errors.length} problem(s) — nothing written.`); process.exit(1); }
writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`imported ${(man.effects ?? []).map(e => e.id).join(', ')} · ${Object.keys(out).length} painted effect(s) registered`);
