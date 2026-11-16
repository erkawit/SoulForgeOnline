// Minimal resolve/load hooks so plain `node --experimental-transform-types` can import the game's TS registries
// (extensionless + "@/" imports, JSON). Packages that are not installed (three, react…) resolve to inert stubs —
// the registries only need data, never a renderer.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'src');
const req = createRequire(path.join(ROOT, 'package.json'));
const installed = (p) => { try { req.resolve(p); return true; } catch { return false; } };
let names = null;
function stubNames() {
  if (names) return names; names = new Set();
  const walk = (d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.tsx?$/.test(f)) {
    for (const m of readFileSync(p, 'utf8').matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]([^'".][^'"]*)['"]/g))
      for (const n of m[1].split(',')) { const k = n.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]; if (/^[A-Za-z_$][\w$]*$/.test(k)) names.add(k); } } } };
  walk(SRC); return names;
}
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('@/')) spec = pathToFileURL(path.join(SRC, spec.slice(2))).href;
  if ((spec.startsWith('.') || spec.startsWith('file:')) && !/\.(m?js|tsx?|json)$/.test(spec)) {
    const base = spec.startsWith('file:') ? fileURLToPath(spec) : path.resolve(path.dirname(fileURLToPath(ctx.parentURL)), spec);
    for (const c of [base + '.ts', base + '.tsx', path.join(base, 'index.ts')]) if (existsSync(c)) return next(pathToFileURL(c).href, ctx);
  }
  if (!spec.startsWith('.') && !spec.startsWith('file:') && !spec.startsWith('node:') && !spec.startsWith('data:') && !installed(spec))
    return { url: 'stub:' + spec, shortCircuit: true };
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  if (url.startsWith('stub:')) {
    const body = [...stubNames()].map(n => `export const ${n} = S;`).join('\n');
    return { format: 'module', shortCircuit: true, source: `const S = new Proxy(function(){}, { get:(t,k)=>k===Symbol.toPrimitive?()=>0:S, apply:()=>S, construct:()=>S });\nexport default S;\n${body}` };
  }
  if (url.endsWith('.json')) return next(url, { ...ctx, importAttributes: { type: 'json' } });
  return next(url, ctx);
}
