# Phase 2 Multiplayer + World Boss + Loot + Offline Vault

## Import Supabase
เปิด `supabase/supabase-import-all.sql` ใน Supabase Dashboard > SQL Editor แล้ว Run **ครั้งเดียวบนโปรเจกต์ใหม่** หรือรันไฟล์ migrations 001 ตามด้วย 002 (ไม่รันทั้งสองวิธีซ้ำ). อ่าน `supabase/README_IMPORT_TH.md`.

## Frontend (Vercel)
`npm install && npm run dev` ใช้ `.env.local` ตั้ง `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_GAME_SERVER_URL` และ `SUPABASE_SECRET_KEY` (server-side เท่านั้น). เกม Guest Demo ยังคงเล่นได้. Login ที่ Online Panel เพื่อเข้า Realtime.

## Node Game Server (must remain running)
`cd apps/game-server && npm install && cp .env.example .env && npm run dev` แก้ค่า Supabase ให้ตรงกัน. ต้อง Deploy บนบริการ Node ที่รันต่อเนื่อง ไม่ใช่ใช้ Vercel functions เป็นโลกเกมถาวร. Production browser ควรใช้ `wss://`.

## Verified mechanics and limitations
* JWT handshake, one-session-per-user, 20 Hz room snapshots, server-controlled speed and attack cooldowns, boss respawn timer, server-generated loot and atomic SQL pickup. MVP รองรับ **หนึ่ง Room ต่อหนึ่ง process**; restart resets active boss/room/memory loot. Boss loot writes to SQL best effort, not durable boss-event transaction yet.
* Offline Vault: Server-side route verifies Supabase JWT; SQL functions atomically consume Farm Card and atomically credit gold/EXP once, after completion. Admin creates test cards in SQL Editor. Current wallet ledger is separate from Phase 1 guest HUD; server-authoritative item ledger likewise separate.
* Demo local monsters and inventory continue in Guest; when Online, **only boss combat and public boss loot** use authoritative WebSocket. Local monsters continue as visual demo and DO NOT reward backend economy. Full online movement camera and own avatar are not yet position reconciled: server positions are authoritative but own visual representation is still local. Other players show server positions.
* Anti-cheat is a foundational layer, **not** production complete: missing server navigation mesh, persisted loadouts, combat locks, NPC AI, crash recovery, delta snapshots and cross-process ownership.
* WebSocket AUTH message avoids putting JWT in URL. Use Origin allowlist plus strict auth and rate limiting; no secrets in NEXT_PUBLIC vars.

## Testing
1. Create 2 Supabase accounts (Auth > Users or sign up); log in from two browsers.
2. Both enter Online Room; player count should show 2. Click boss once it spawns (~30 seconds).
3. Move near boss using WASD and click Attack Boss; after defeat a loot cluster appears. Approach and click to claim. Only 1 player can claim each piece.
4. Seed Bronze Card using SQL shown in import README; press Use Bronze Card. Claim after one hour.
5. Run `npm run typecheck` frontend and `npm run build` within apps/game-server.
