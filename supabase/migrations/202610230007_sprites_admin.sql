-- SoulForge 0007: 2.5D sprite appearance + invite pre-check + admin bootstrap helper.
-- Run AFTER 0001 … 0006. Idempotent.
begin;

-- ------------------------------------------------------------------ appearance (compact-cast male / female sheet)
alter table public.player_profiles add column if not exists gender text not null default 'm';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'player_profiles_gender_check') then
    alter table public.player_profiles add constraint player_profiles_gender_check check (gender in ('m','f'));
  end if;
end $$;

-- create_character gains the appearance; the old 2-argument form keeps working (defaults to male)
drop function if exists public.create_character(text, text);
create or replace function public.create_character(p_name text, p_class text, p_gender text default 'm') returns void
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); p public.player_profiles%rowtype;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into p from public.player_profiles where user_id = me for update;
  if not found then raise exception 'INVITE_REQUIRED'; end if;
  if p.banned then raise exception 'BANNED'; end if;
  if p.class_id is not null then raise exception 'CHARACTER_EXISTS'; end if;
  if p_class not in ('Warrior','Mage','Priest','Archer','Enchanter') then raise exception 'CLASS_INVALID'; end if;
  if coalesce(p_gender,'m') not in ('m','f') then raise exception 'GENDER_INVALID'; end if;
  if p_name !~ '^[A-Za-z0-9_฀-๿]{3,16}$' or lower(p_name) in ('admin','gm','soulforge','system') then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name)) then raise exception 'NAME_TAKEN'; end if;
  update public.player_profiles set display_name = p_name, class_id = p_class, gender = coalesce(p_gender,'m'), character_created_at = now() where user_id = me;
end $$;
revoke all on function public.create_character(text, text, text) from public, anon;
grant execute on function public.create_character(text, text, text) to authenticated;

-- ------------------------------------------------------------------ invite pre-check (sign-up form appears only after this says OK)
-- Read-only: does NOT consume the code. Called by /api/auth/check-invite with the service role (rate-limited there).
create or replace function public.peek_invite(p_code text) returns text
language plpgsql stable security definer set search_path='' as $$
declare c public.invite_codes%rowtype; cap int := public.cfg_num('{beta,maxPlayers}', 500)::int;
begin
  select * into c from public.invite_codes where code = upper(trim(p_code));
  if not found or c.revoked_at is not null then return 'INVITE_INVALID'; end if;
  if c.expires_at is not null and c.expires_at <= now() then return 'INVITE_EXPIRED'; end if;
  if c.used_count >= c.max_uses then return 'INVITE_USED'; end if;
  if (select count(*) from public.player_profiles) >= cap then return 'BETA_FULL'; end if;
  return 'OK';
end $$;
revoke all on function public.peek_invite(text) from public, anon, authenticated;

-- ------------------------------------------------------------------ admin bootstrap
-- scripts/create-admin.mjs creates the auth user (email + password) with the service key, then calls this.
-- Admins sign in on the normal login form (username "admin" = admin@soulforge.local) and open /admin.
create or replace function public.bootstrap_admin(p_user uuid, p_role text default 'owner') returns void
language plpgsql security definer set search_path='' as $$
begin
  if p_role not in ('owner','gm') then raise exception 'ROLE_INVALID'; end if;
  insert into public.admin_users(user_id, role) values (p_user, p_role)
    on conflict (user_id) do update set role = excluded.role;
  insert into public.admin_audit_log(admin_id, action, detail) values (p_user, 'bootstrap_admin', jsonb_build_object('role', p_role));
end $$;
revoke all on function public.bootstrap_admin(uuid, text) from public, anon, authenticated;

commit;
