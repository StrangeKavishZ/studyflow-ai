-- Ensure profiles has RLS enabled with correct policies.
-- This table was created outside this repo's schema.sql, so no policies
-- were ever guaranteed here. Without a correct UPDATE policy (specifically
-- one with a matching WITH CHECK clause), an update can silently succeed
-- but return no row, which is why avatar/profile changes can save to the
-- database yet never show up back in the app.

alter table public.profiles enable row level security;

-- Only the owner can read their own full profile row (name, school, aim,
-- hours, etc) directly.
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "public profiles are readable" on public.profiles;
create policy "users read own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- Safe, minimal public view: name, username, avatar and leaderboard opt-in
-- only. No school name, academic aim, or study-hour targets. This view
-- intentionally runs with definer rights (not security_invoker) so it can
-- read every row, while only ever exposing the five safe columns below.
-- Application code for Community/Leaderboard/share features should query
-- this view, not the profiles table directly, to avoid exposing private
-- fields such as school name or academic targets.
create or replace view public.public_profiles as
  select id, name, username, avatar_emoji, avatar_color, leaderboard_opt_in
  from public.profiles;

grant select on public.public_profiles to authenticated;

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());