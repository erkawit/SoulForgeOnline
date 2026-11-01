#!/usr/bin/env node
// Round 13: import Codex's layered chibi heroes into the game.
//   node scripts/import-codex-hero.mjs <frames.json> [more frames.json …]
// Each frames.json (format: output/berserker-chibi-codex/FRAMES_JSON_SPEC.md) describes one body sheet
// (public/art/anim/<key>.webp) plus its hair and weapon layer sheets. The importer validates every frame against the
// user's grip rules, then writes src/game/sprites/rigs/<key>.json and regenerates src/game/sprites/rigs/index.ts.
// Exit code 1 when a rule fails — fix the art (never the numbers) and run it again.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANIM = join(ROOT, 'public/art/anim'), RIGS = join(ROOT, 'src/game/sprites/rigs');
const DIRS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'], VIEWS = ['broad', 'edge', 'three_quarter'];
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);

/** width/height of a .webp without any image library (VP8 / VP8L / VP8X headers) */
function webpSize(file) {
  const b = readFileSync(file); if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (t === 'VP8L') { const v = b.readUInt32LE(21); return { w: 1 + (v & 0x3fff), h: 1 + ((v >> 14) & 0x3fff) }; }
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  return null;
}
const round = (v) => Math.round(v * 100) / 100;

function importOne(path) {
  const j = JSON.parse(readFileSync(path, 'utf8')); const k = j.key, at = `${k ?? path}`;
  // a class look (berserker / reaver) or a fashion outfit body (round 13: hero-<g>-<costume sprite>, e.g. hero-m-thai)
  if (!/^hero-[mf]-[a-z0-9-]+$/.test(k ?? '')) err(`${at}: key must be hero-<m|f>-<berserker|reaver|outfit>`);
  const g = j.gender, form = j.form; if (!['m', 'f'].includes(g)) err(`${at}: gender m|f`); if (!['Berserker', 'Reaver', 'outfit'].includes(form)) err(`${at}: form Berserker|Reaver|outfit`);
  if (form === 'outfit' && !/^[a-z0-9-]+$/.test(j.costume ?? '')) err(`${at}: an outfit needs "costume" = the fashion sprite key (e.g. thai)`);
  if (form !== 'outfit' && !/^hero-[mf]-(berserker|reaver)$/.test(k ?? '')) err(`${at}: class looks are hero-<m|f>-berserker / -reaver`);
  const c = j.cell ?? {}; for (const f of ['cw', 'ch', 'cols', 'fx', 'fy', 'bodyPx']) if (typeof c[f] !== 'number') err(`${at}: cell.${f} missing`);
  const s = j.coordScale ?? 1, P = (p) => ({ x: round(p.x * s), y: round(p.y * s) });
  // ---- frames: every clip has the same frame count in all 8 directions, numbered 0..n-1
  const byClip = {};
  for (const f of j.frames ?? []) {
    const d = DIRS.indexOf(f.dir); if (d < 0) { err(`${at}: frame ${f.clip}/${f.dir}/${f.frame} bad dir`); continue; }
    ((byClip[f.clip] ??= DIRS.map(() => []))[d])[f.frame] = f;
  }
  const order = j.clips ?? Object.keys(byClip); const clips = {}; const frames = {}; let first = 0;
  for (const name of order) {
    const runs = byClip[name]; if (!runs) { err(`${at}: clip ${name} listed but has no frames`); continue; }
    const n = runs[0].length;
    runs.forEach((run, d) => {
      if (run.length !== n) err(`${at}: ${name} ${DIRS[d]} has ${run.length} frames, S has ${n} — every direction needs the same count and timing`);
      for (let i = 0; i < run.length; i++) if (!run[i]) err(`${at}: ${name} ${DIRS[d]} frame ${i} missing`);
    });
    const hits = runs.map(r => r.findIndex(f => f?.event === 'hit'));
    if (['attack', 'skill'].includes(name)) { if (hits[0] < 0) err(`${at}: ${name} needs an event:"hit" frame`); if (new Set(hits).size > 1) err(`${at}: ${name} hit frame differs between directions (${hits.join(',')})`); }
    clips[name] = [first, n]; first += n * 8;
    frames[name] = runs.map(run => run.map(f => f && ({
      clip: name, dir: f.dir, frame: f.frame, ...(f.durationMs ? { durationMs: f.durationMs } : {}),
      head: { ...P(f.head ?? { x: 0, y: 0 }), ...(f.head?.rot ? { rot: f.head.rot } : {}) },
      gripL: P(f.gripL ?? { x: 0, y: 0 }), gripR: P(f.gripR ?? { x: 0, y: 0 }),
      weapon: f.weapon ? { view: f.weapon.view, ...(f.weapon.angle !== undefined ? { angle: f.weapon.angle } : {}), ...(f.weapon.flipX ? { flipX: true } : {}), z: f.weapon.z } : null,
      ...(f.event ? { event: f.event } : {}),
      ...(f.hands ? { hands: true } : {}),
    })));
  }
  const total = first;
  // ---- layers
  const hair = j.hair, weapon = j.weapon;
  if (!hair?.styles?.length) err(`${at}: hair.styles empty`);
  if (!weapon?.views) err(`${at}: weapon.views missing`); else for (const v of VIEWS) if (!weapon.views[v]?.gripL || !weapon.views[v]?.gripR) err(`${at}: weapon.views.${v} needs gripL and gripR`);
  if (!weapon?.sheets?.length) err(`${at}: weapon.sheets empty`);
  // ---- the user's grip rules, frame by frame
  for (const [name, runs] of Object.entries(frames)) runs.forEach((run, d) => run.forEach((f, i) => {
    if (!f) return; const id = `${at}: ${name} ${DIRS[d]} f${i}`;
    if (f.head.x < 0 || f.head.x > c.cw || f.head.y < 0 || f.head.y > c.ch) err(`${id} head anchor outside the cell`);
    if (!f.weapon) { if (!['hurt', 'death'].includes(name) && !j.weapon3d) warn(`${id} has no weapon`); return; }
    if (!VIEWS.includes(f.weapon.view)) err(`${id} weapon.view must be broad|edge|three_quarter`);
    if (!['front', 'back'].includes(f.weapon.z)) err(`${id} weapon.z must be front|back`);
    const v = weapon?.views?.[f.weapon.view]; if (!v) return;
    const hand = Math.hypot(f.gripR.x - f.gripL.x, f.gripR.y - f.gripL.y), pic = Math.hypot(v.gripR[0] - v.gripL[0], v.gripR[1] - v.gripL[1]);
    const k = hand / (pic || 1);
    // the shaft is rigid: the hands must sit where the picture's grip marks are (±12 %), the game never scales it
    if (k < 0.88 || k > 1.12) err(`${id} hands ${hand.toFixed(1)} px apart but the ${f.weapon.view} picture's grips are ${pic.toFixed(1)} px — the weapon would slide off a hand (rigid, never stretched)`);
    if (f.weapon.angle !== undefined) {
      const a = (Math.atan2(-(f.gripR.y - f.gripL.y), f.gripR.x - f.gripL.x) * 180) / Math.PI, pa = (Math.atan2(-(v.gripR[1] - v.gripL[1]), (v.gripR[0] - v.gripL[0]) * (f.weapon.flipX ? -1 : 1)) * 180) / Math.PI;
      const want = ((a - pa) % 360 + 360) % 360, got = ((f.weapon.angle % 360) + 360) % 360, diff = Math.min(Math.abs(want - got), 360 - Math.abs(want - got));
      if (diff > 8) warn(`${id} weapon.angle ${f.weapon.angle}° but the hands imply ${want.toFixed(0)}° — the game follows the hands`);
    }
  }));
  // ---- files
  const sheet = join(ANIM, `${k}.webp`), rows = Math.ceil(total / (c.cols || 1));
  if (!existsSync(sheet)) err(`${at}: ${sheet} missing`); else { const z = webpSize(sheet); if (z && (z.w !== c.cols * c.cw || z.h !== rows * c.ch)) err(`${at}: sheet is ${z.w}×${z.h}, expected ${c.cols * c.cw}×${rows * c.ch} (${total} frames, ${c.cols} per row)`); }
  for (const h of hair?.styles ?? []) { const p = join(ANIM, 'hair', `${h}.webp`); if (!existsSync(p)) err(`${at}: hair ${p} missing`); else { const z = webpSize(p); if (z && (z.w !== hair.cw * 8 || z.h !== hair.ch)) err(`${at}: hair ${h} is ${z?.w}×${z?.h}, expected ${hair.cw * 8}×${hair.ch} (8 cells S…SE)`); } }
  for (const w of weapon?.sheets ?? []) { const p = join(ANIM, 'weapon', `${w}.webp`); if (!existsSync(p)) err(`${at}: weapon ${p} missing`); else { const z = webpSize(p); if (z && (z.w !== weapon.cw * 3 || z.h !== weapon.ch)) err(`${at}: weapon ${w} is ${z?.w}×${z?.h}, expected ${weapon.cw * 3}×${weapon.ch} (broad, edge, three_quarter)`); } }
  const handsSheet = join(ANIM, `${k}-hands.webp`), hasHands = (j.frames ?? []).some(f => f.hands);
  if (hasHands) { if (!existsSync(handsSheet)) err(`${at}: frames use a hands layer but ${handsSheet} is missing`); else { const z = webpSize(handsSheet); if (z && (z.w !== c.cols * c.cw || z.h !== rows * c.ch)) err(`${at}: hands sheet is ${z.w}×${z.h}, expected the body sheet's ${c.cols * c.cw}×${rows * c.ch}`); } }
  const w3 = j.weapon3d && typeof j.weapon3d.tiers === 'number' ? { kind: String(j.weapon3d.kind ?? 'greatsword'), tiers: j.weapon3d.tiers, skins: Array.isArray(j.weapon3d.skins) ? j.weapon3d.skins : [] } : null;
  if (w3) for (const t of [...Array.from({ length: w3.tiers }, (_, i) => `t${i + 1}`), ...w3.skins]) { const p = join(ANIM, `${k}-gs-${t}.webp`); if (!existsSync(p)) err(`${at}: 3D weapon sheet ${p} missing`); else { const z = webpSize(p); if (z && (z.w !== c.cols * c.cw || z.h !== rows * c.ch)) err(`${at}: 3D weapon tier ${t} is ${z.w}×${z.h}, expected the body sheet's ${c.cols * c.cw}×${rows * c.ch}`); } }
  const hair3d = Array.isArray(j.hair3d) ? j.hair3d : [];
  for (const h of hair3d) { const p = join(ANIM, `${k}-hair-${h}.webp`); if (!existsSync(p)) err(`${at}: 3D hair sheet ${p} missing`); else { const z = webpSize(p); if (z && (z.w !== c.cols * c.cw || z.h !== rows * c.ch)) err(`${at}: 3D hair ${h} is ${z.w}×${z.h}, expected the body sheet's ${c.cols * c.cw}×${rows * c.ch}`); } }
  const ids = form === 'outfit' ? [`hero:${g}:Berserker:${j.costume}`] : form === 'Reaver' ? [`hero:${g}:Berserker::Reaver`] : [`hero:${g}:Berserker::Berserker`, `hero:${g}:Berserker`];
  const rig = {
    key: k, anim: { cw: c.cw, ch: c.ch, cols: c.cols, n: total, fx: c.fx, fy: c.fy, bodyPx: c.bodyPx, dirs: 8, clips },
    hair: { cw: hair?.cw, ch: hair?.ch, anchor: hair?.anchor, styles: hair?.styles ?? [] },
    weapon: { cw: weapon?.cw, ch: weapon?.ch, views: weapon?.views, sheets: weapon?.sheets ?? [] },
    frames, ids, ...(hasHands ? { hands: true } : {}), ...(hair3d.length ? { hair3d } : {}), ...(w3 ? { weapon3d: w3 } : {}),
  };
  return { k, rig, ids };
}

const files = process.argv.slice(2); if (!files.length) { console.error('usage: node scripts/import-codex-hero.mjs <frames.json> …'); process.exit(2); }
const out = files.map(importOne);
for (const w of warnings) console.warn('warn ', w);
if (errors.length) { for (const e of errors) console.error('FAIL ', e); console.error(`\n${errors.length} problem(s) — nothing written. Fix the art and re-run.`); process.exit(1); }
for (const { k, rig } of out) writeFileSync(join(RIGS, `${k}.json`), JSON.stringify(rig));
// index.ts lists every rig json in the folder (earlier imports stay registered)
const all = readdirSync(RIGS).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
const idsOf = (k) => JSON.parse(readFileSync(join(RIGS, `${k}.json`), 'utf8')).ids ?? [];
const v = (k) => k.replace(/-/g, '_');
writeFileSync(join(RIGS, 'index.ts'), `// GENERATED by scripts/import-codex-hero.mjs from Codex's frames.json — re-run the importer instead of editing by hand.
import type { LayeredRig } from '../layered';
${all.map(k => `import ${v(k)} from './${k}.json';`).join('\n')}
/** rig key → rig, plus the hero actor ids (catalog heroId) that play it */
export const HERO_RIGS: Record<string, { rig: LayeredRig; ids: string[] }> = {
${all.map(k => `  '${k}': { rig: ${v(k)} as unknown as LayeredRig, ids: ${JSON.stringify(idsOf(k))} },`).join('\n')}
};
`);
console.log(`imported ${out.map(o => o.k).join(', ')} · registered ${all.length} rig(s) · ${warnings.length} warning(s)`);
