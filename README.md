# SOULFORGE: Eclipse Frontier

Browser-based 2.5D Isometric Action-Farming RPG starter based on **Next.js 16 (App Router)**, **React Three Fiber/Three.js**, **Zustand**, **Tailwind 4**, and **Supabase** optional cloud persistence.

> **Scope**: An *interactive, single-player demo / scalable MMO architecture seed*. It is **not yet a secure multiplayer MMO**. No real shared world, server-authoritative combat, online vault, world-boss scheduling or player-vs-player competition is implemented. Character and monster meshes are **procedural stand-ins**, not production GLB assets. The sample save route accepts client stats and is suitable only for a noncompetitive prototype.

## Quick start

Requires Node.js >= 20.9.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. **No Supabase keys needed for guest demo.** Save data also persists automatically in your browser's `localStorage`.

### Controls

- `WASD` / arrow keys: camera-relative movement
- Left-click monster: chase and auto-attack
- `Space`: burst AoE-look skill **targeting nearest enemy** within 4 world units, costs 20 MP
- Mouse drag: rotate camera 360°
- Mouse wheel / touch pinch: zoom
- Touch drag: orbit camera
- Left-click on loot crystal within 4 units: collect; bottom `LOOT` picks up close drops
- Double-click inventory item: equip; click equipped item: unequip; drag tiles to swap
- Soul Forge: equip weapon and spend 3 shards to cycle Ember/Frost/Void, changing aura and granting +6 ATK

## Run without any 3D assets

Game scene uses procedural Three.js geometry and lights; GLB files are not required for the MVP. To replace them with real models:

1. Put licensed files in `public/models/hero.glb` and `public/models/wraith.glb`.
2. Import `GLBActor` from `src/components/GLBActor.tsx` into `GameWorld.tsx` and replace the procedural actor model with `<GLBActor url="/models/hero.glb" scale={1} />` once that file actually exists.
3. Apply consistent scaling, GLB animation mixers (`useAnimations`), skinned clone if needed, shader effects, and optimized asset compression.

Do not invoke `useGLTF` conditionally after a model fails to load. Keep a separate asset component and only render it when the file is present.

## Optional Supabase cloud persistence

1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor**, run `supabase/migrations/202610190001_initial.sql`.
3. In Project Settings/Connect, copy the **Project URL** and **Publishable key** into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

4. Under **Authentication → Providers**, enable Email. Choose whether to require email verification (recommended for production). For local tests, use a real email address if confirmations are on.
5. Restart `npm run dev` after editing `.env.local`.
6. Open the **Cloud Save** panel, create/sign into a user, then **Save to cloud**. Load on another browser once logged in. The API verifies JWT using `auth.getUser(token)` and Postgres RLS scopes each snapshot to its owner.
7. **Note**: this only guarantees account ownership, **not legitimacy of game state**. An authenticated client can forge stats/inventory and upload them. Before a shared economy, remove client snapshot writes and implement item and reward transactions on trusted server logic.

## Deploy to Vercel (free tier subject to usage limits)

```bash
npm run build
npm install -g vercel
vercel
```

Or push the directory to your own GitHub repository, click **Add New Project → Import** in Vercel, select **Next.js** auto-detected build, then Deploy. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in **Project → Settings → Environment Variables** for Production (and Preview, if desired). Redeploy after modifying environment variables. If using sign-in links with redirects, configure your published Vercel domain in Supabase **Authentication → URL Configuration**.

**No custom `vercel.json` or external Node WebSocket server needed for this demo.** Vercel Functions do not provide a persistent authoritative multiplayer process: for many-player worlds, use dedicated game-room servers (e.g. Colyseus on a separate service) or authoritative tick workers, and use Supabase for durable profile/inventory and low-frequency event streams.

## Project architecture

```
Browser (React HUD / Zustand UI)
    │  client-side game simulation (demo only)
    ▼
React Three Fiber Canvas
    ├─ Camera (Orthographic + OrbitControls)
    ├─ Player/Monster procedural 3D meshes
    ├─ Terrain, Lighting, Particles, Item drops
    └─ WASD/click chase/skill/damage state
    │
    ├─ LocalStorage (Guest autosave)
    └─ /api/character (GET/POST + bearer token)
           │
           ▼
       Supabase Auth → PostgreSQL + RLS
```

For the **real MMO** split into: browser renderer/prediction; server-authoritative combat/world instances/anti-cheat; Postgres transactional inventory/economy; Realtime/room stream for player positions/combat updates; scheduled boss and Offline Vault workers.

## Files

```
src/
  app/
    page.tsx                 server component
    layout.tsx               root document
    globals.css              dark fantasy responsive HUD
    api/character/route.ts   authenticated Supabase REST handler
  components/
    GameClient.tsx           client-only dynamic 3D entry; guest save; game ticking
    GameWorld.tsx            terrain, camera, lighting, combat actors, loot
    GLBActor.tsx             optional glTF loader bridge
    GameHUD.tsx              HUD, inventory/equipment grid, stat sheet, forge
    CloudSave.tsx            optional Supabase Auth + save/load
  lib/
    types.ts                 item and player types
    seed.ts                  starter player/monsters/gear
    combat.ts                derived stats, damage, rarity and loot roll
    supabase.ts              browser client factory
  store/
    useGameStore.ts          gameplay state and actions
supabase/migrations/202610190001_initial.sql
```

## Production engineering checklist

- Replace damage/loot/EXP/drop generation in Zustand with server-authoritative actions, using idempotent request IDs and server time/cooldowns.
- Own player movement with tick-based server validation and interpolation; divide maps into bounded rooms/chunks. R3F can predict only visual movement.
- Normalize inventory item instances in a database, build atomic item transfers and equipment transactions; add an audit/event log. Prevent client arbitrary writes to rewards.
- Make Boss loot eligibility and loot claims server-side and transactional with deterministic ownership rules to avoid duplicate pickups.
- Schedule offline jobs in server-controlled tables: burn a farm card, cap elapsed time, compute rewards through secure transactions, disallow infinite farming.
- Add GLB animation, VFX pooling, interest management, batching/instancing, LOD and postprocessing budgets.
- Monitor Supabase Realtime concurrent connections, messages, database traffic, Vercel bandwidth and build limits for the free tiers.

