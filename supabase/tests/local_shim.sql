-- Local check only (NOT for Supabase): a bare Postgres 16 with the bits of Supabase the migrations use.
-- psql -f supabase/tests/local_shim.sql ; then every migration in order with -d sf ; then realm_market_check.sql
drop database if exists sf; create database sf;
\c sf
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;
create schema auth;
create table auth.users(id uuid primary key, email text);
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true),'')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create schema if not exists extensions; create extension if not exists pgcrypto with schema extensions; grant usage on schema extensions to anon, authenticated, service_role;
