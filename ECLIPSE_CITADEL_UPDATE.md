# SOULFORGE: ECLIPSE FRONTIER — Eclipse Citadel visual update

This update extends the existing Phase 2 project found in `Downloads/SoulForge Online/soulforge-eclipse-mmorpg`. All added geometry and visual styling are original procedural work; no MU Online assets, models, textures, names, or branding are included.

## Changes

- Gothic perimeter towers, pointed gateway, battlements, banners, braziers and instanced stone paving.
- Faceted plate armor, helmet, pauldrons, soul gem, horned creatures and armored world boss.
- Taller rarity-colored loot beams in local and online worlds.
- Aged brass and obsidian HUD, live HP/MP orbs, live minimap, inventory and forge panels, authoritative boss health banner.
- Online room and offline vault controls now live in the Online Realm panel, avoiding overlap with the minimap.
- I opens inventory, F opens forge, Escape closes panels. Existing movement, attack, equipment, forge, cloud and multiplayer functionality retained.
- Hotbar attack, burst and loot buttons now route to the server when connected.
- Online HP/MP orbs consume server snapshot values; the server now includes MP and its current fixed maximum of 100.
- Camera follows by translating camera and target together, preserving the orbit angle. Fixed oversized orthographic actor labels and HUD stacking.
- Fixed existing server RawData TypeScript error and local autosave debounce starvation during continuous world updates.
- Dependency lockfiles included for reproducible installs.

## Running

Frontend: `npm ci`, then `npm run dev`. For a production preview: `npm run build`, then `npm start`.

Game server: `cd apps/game-server`, `npm ci`, then `npm run dev`.

Use the existing `.env.example` files. Deploy the frontend to Vercel and run the persistent WebSocket game server separately. Deploy the updated game server too to expose live mana to the new HUD. Existing Supabase routes, migrations, authentication and environment variable names are retained. No database migration is needed for this visual update.

## Verification

- Next.js optimized production build and TypeScript: passed.
- Game server TypeScript build: passed.
- Game server tests: 2 passed, covering authoritative HUD snapshot values and boss phase/death/drop/expiry behavior. Run with `npm test` in `apps/game-server`.
- Production browser smoke checks: scene rendering, inventory shortcut, double-click equip, forge panel, online controls, auto-chase/attack, monster defeat, loot pickup into inventory, and equipped weapon persistence after reload.
- Browser console: no errors observed. Three.js reports existing Clock and PCFSoftShadowMap deprecation warnings.
- Development Turbopack file watching failed with an FSEvent error in this sandbox; production build and production server were used for browser checks.

## Limits

Supabase login, cloud persistence, vault rewards and multi-client online play were not tested against a live backend because no credentials were supplied. This remains the original Phase 2 prototype: procedural low-poly visuals, decorative architecture without collision, fixed online starting stats and the existing server economy limitations. No claim of production MMORPG readiness or measured 60 FPS performance is made. Current controls are intended for keyboard and mouse.
