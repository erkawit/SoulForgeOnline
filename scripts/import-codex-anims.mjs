#!/usr/bin/env node
// Round 13: import Codex's 8-direction flipbooks (monsters, bosses) into the game.
//   node scripts/import-codex-anims.mjs <manifest.json>
// manifest (format: output/monster-8dir-codex/CODEX_PROMPT.md §Delivery):
//   { "sheets": [ { "id": "crystal-golem", "cw": 320, "ch": 320, "cols": 16, "fx": 0.5, "fy": 0.08, "bodyPx": 220,
//                   "heightM": 2.2, "clips": [["idle", 8], ["walk", 8], ["run", 8], ["attack", 10], ["hurt", 4], ["death", 10]],
//                   "hits": { "attack": 6 }, "aliases": ["grave-marshal"] } ] }
// Every clip is 8 runs (S, SW, W, NW, N, NE, E, SE) of `count` frames, clips in the listed order, cells left-to-right then
// top-to-bottom in public/art/anim/<id>.webp. Validates the sheet size, then merges the entries into
// src/game/sprites/anims8.json (earlier imports are kept; the same id is replaced). Exit 1 = nothing written.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANIM = join(ROOT, 'public/art/anim'), OUT = join(ROOT, 'src/game/sprites/anims8.json');
const REQUIRED = ['idle', 'walk', 'attack'];
function webpSize(file) {
  const b = readFileSync(file); if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (t === 'VP8L') { const v = b.readUInt32LE(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  return null;
}
const path = process.argv[2]; if (!path) { console.error('usage: node scripts/import-codex-anims.mjs <manifest.json>'); process.exit(2); }
const man = JSON.parse(readFileSync(path, 'utf8')); const errors = []; const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
for (const s of man.sheets ?? []) {
  const at = s.id ?? '?';
  if (!/^[a-z0-9-]+$/.test(s.id ?? '')) { errors.push(`${at}: id must be a lower-case slug`); continue; }
  for (const f of ['cw', 'ch', 'cols', 'fx', 'fy', 'bodyPx', 'heightM']) if (typeof s[f] !== 'number' || !(s[f] > 0 || f === 'fy')) errors.push(`${at}: ${f} missing`);
  const names = (s.clips ?? []).map(c => c[0]); for (const r of REQUIRED) if (!names.includes(r)) errors.push(`${at}: clip "${r}" is required`);
  if (new Set(names).size !== names.length) errors.push(`${at}: duplicate clip name`);
  const clips = {}; let first = 0;
  for (const [name, n] of s.clips ?? []) { if (!(n >= 2)) errors.push(`${at}: ${name} needs at least 2 frames`); clips[name] = [first, n]; first += n * 8; }
  for (const [clip, f] of Object.entries(s.hits ?? {})) if (!clips[clip] || f < 0 || f >= clips[clip][1]) errors.push(`${at}: hit frame ${clip}#${f} outside the clip`);
  if (clips.attack && s.hits?.attack === undefined) errors.push(`${at}: hits.attack (the frame the blow lands) is required`);
  const file = join(ANIM, `${s.id}.webp`), rows = Math.ceil(first / s.cols);
  if (!existsSync(file)) errors.push(`${at}: ${file} missing`);
  else { const z = webpSize(file); if (z && (z.w !== s.cols * s.cw || z.h !== rows * s.ch)) errors.push(`${at}: sheet is ${z.w}×${z.h}, expected ${s.cols * s.cw}×${rows * s.ch} (${first} frames = clips × 8 directions, ${s.cols} per row)`); }
  const wpp = s.heightM / s.bodyPx;
  out[s.id] = {
    anim: { cw: s.cw, ch: s.ch, cols: s.cols, n: first, fx: s.fx, fy: s.fy, bodyPx: s.bodyPx, dirs: 8, clips },
    frame: { w: Math.round(s.cw * wpp * 1e4) / 1e4, h: s.heightM, fx: s.fx, fy: s.fy, px: [s.cw, s.ch] },
    hits: s.hits ?? {}, aliases: s.aliases ?? [],
  };
}
if (errors.length) { for (const e of errors) console.error('FAIL ', e); console.error(`\n${errors.length} problem(s) — nothing written.`); process.exit(1); }
writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`imported ${(man.sheets ?? []).map(s => s.id).join(', ')} · ${Object.keys(out).length} 8-way sheet(s) registered`);
