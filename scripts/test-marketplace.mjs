// Run with PGLITE_MODULE=/absolute/path/to/@electric-sql/pglite/dist/index.js node scripts/test-marketplace.mjs
// Local PostgreSQL WASM test; auth.uid() stub only exists in this disposable database.
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const {PGlite}=await import(process.env.PGLITE_MODULE??'@electric-sql/pglite');
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
for(const f of ['202610190001_initial.sql','202610190002_multiplayer.sql','202610220003_marketplace.sql','202610220004_catalog.sql'])await db.exec(readFileSync(`supabase/migrations/${f}`,'utf8').replace('create extension if not exists pgcrypto;',''));
const seller='00000000-0000-0000-0000-000000000001',buyer='00000000-0000-0000-0000-000000000002',other='00000000-0000-0000-0000-000000000003',item='10000000-0000-0000-0000-000000000001';
await db.exec(`insert into auth.users values('${seller}'),('${buyer}'),('${other}');insert into public.player_wallets(player_id,gold) values('${seller}',0),('${buyer}',1000),('${other}',0);insert into public.inventory_items(id,owner_id,item_definition_id,rarity,quantity) values('${item}','${seller}','material-3','Epic',3);`);
async function as(id){await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`);}
async function fail(sql,pattern){await assert.rejects(()=>db.query(sql),pattern);}
await as(other);await fail(`select public.market_list('${item}',100)`,/Item unavailable/);
await as(seller);await fail(`update public.player_wallets set gold=9999`,/permission denied/);await fail(`select public.market_list('${item}',0)`,/Invalid request/);
const listing=(await db.query(`select public.market_list('${item}',600) id`)).rows[0].id;
await fail(`select public.market_list('${item}',200)`,/Item unavailable/);await fail(`select public.npc_sell('${item}',true,3)`,/unavailable/);await fail(`select public.market_buy('${listing}')`,/Invalid listing/);
await as(other);await fail(`select public.market_cancel('${listing}')`,/unavailable/);await fail(`select public.market_buy('${listing}')`,/Insufficient/);
await as(buyer);await db.query(`select public.market_buy('${listing}')`);await fail(`select public.market_buy('${listing}')`,/closed/);
assert.equal((await db.query('select gold from public.player_wallets')).rows[0].gold,400);
assert.equal((await db.query('select quantity from public.inventory_items')).rows[0].quantity,3);
await fail(`select public.npc_sell('${item}',false,3)`,/confirmation/);await fail(`select public.npc_sell('${item}',true,999)`,/Price changed/);
await db.query(`select public.npc_sell('${item}',true,3)`);await fail(`select public.npc_sell('${item}',true,3)`,/unavailable/);
assert.equal((await db.query('select gold from public.player_wallets')).rows[0].gold,403);
await as(seller);assert.equal((await db.query('select gold from public.player_wallets')).rows[0].gold,600);assert.equal((await db.query('select * from public.inventory_items')).rows.length,0);
await db.exec(`reset role;insert into public.inventory_items(id,owner_id,item_definition_id,rarity) values('${item}','${seller}','unknown-legacy-item','common');`);
await as(seller);const second=(await db.query(`select public.market_list('${item}',1) id`)).rows[0].id;await db.query(`select public.market_cancel('${second}')`);await db.query(`select public.npc_sell('${item}',true,1)`);
assert.equal((await db.query('select gold from public.player_wallets')).rows[0].gold,601);
await db.exec('reset role;set role anon;');await fail('select public.market_buy(gen_random_uuid())',/permission denied/);
console.log('PASS: all four migrations execute; RLS, authorization, listing reservation, transfer, balances, cancellation, NPC confirmation, stale price, duplicate prevention, and unknown-item fallback verified.');
await db.close();
