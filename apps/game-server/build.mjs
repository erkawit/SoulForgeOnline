// Bundles the realm with the shared game code (../../src, imported as "@/…") into dist/index.js.
// Shared modules that import npm packages (three for the Sorrowlands ruin colliders) resolve from this package's
// node_modules through nodePaths, so the realm image only needs `npm install` here.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
await build({
  entryPoints: [join(here, 'src/index.ts')], outfile: join(here, 'dist/index.js'), bundle: true, platform: 'node', format: 'esm', target: 'node20',
  alias: { '@': join(here, '../../src') }, nodePaths: [join(here, 'node_modules')],
  external: ['ws', '@supabase/supabase-js', 'dotenv', 'zod'], sourcemap: true, logLevel: 'warning',
});
console.log('realm bundle → dist/index.js');
