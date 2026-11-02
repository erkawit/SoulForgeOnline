-- Round 20 (2026-11-02): eight playable classes. Existing Berserkers stay Berserkers; new characters may pick any class.
-- Gear is still the shared (Berserker-family) catalogue until each class gets its own weapons, so class_lock is unchanged.
alter table public.player_profiles drop constraint if exists player_profiles_class_id_check;
alter table public.player_profiles add constraint player_profiles_class_id_check
  check (class_id in ('Paladin','Berserker','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor'));

create or replace function public.create_character(p_name text, p_class text, p_gender text default 'm') returns void
language plpgsql security definer set search_path='' as $$
declare me uuid := auth.uid(); p public.player_profiles%rowtype;
begin
  if me is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into p from public.player_profiles where user_id = me for update;
  if not found then raise exception 'INVITE_REQUIRED'; end if;
  if p.banned then raise exception 'BANNED'; end if;
  if p.class_id is not null then raise exception 'CHARACTER_EXISTS'; end if;
  if p_class not in ('Paladin','Berserker','Hawkeye','RuneMaster','Elementalist','Assassin','HighPriest','Inquisitor') then raise exception 'CLASS_INVALID'; end if;
  if coalesce(p_gender,'m') not in ('m','f') then raise exception 'GENDER_INVALID'; end if;
  if p_name !~ '^[A-Za-z0-9_฀-๿]{3,16}$' or lower(p_name) in ('admin','gm','soulforge','system') then raise exception 'NAME_INVALID'; end if;
  if exists(select 1 from public.player_profiles where lower(display_name) = lower(p_name)) then raise exception 'NAME_TAKEN'; end if;
  update public.player_profiles set display_name = p_name, class_id = p_class, gender = coalesce(p_gender,'m'), character_created_at = now() where user_id = me;
end $$;
