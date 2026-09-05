-- StudyFlow AI database schema
-- Run this after creating the base StudyFlow tables in Supabase.
-- This file contains the schema upgrades currently used by the app.

-- Profile fields
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists avatar_emoji text default '';
alter table public.profiles add column if not exists avatar_color text default '#3D7A5C';
create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null and username <> '';

-- Community channels, threads, replies, and images
alter table public.community_messages add column if not exists channel text not null default 'Foyer';
alter table public.community_messages add column if not exists thread_id uuid;
alter table public.community_messages add column if not exists reply_to_id uuid;
alter table public.community_messages add column if not exists image_url text;

create table if not exists public.community_threads (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.communities(id) on delete cascade not null,
  channel text not null default 'Foyer',
  title text not null check (char_length(title) between 2 and 180),
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table public.community_messages drop constraint if exists community_messages_thread_id_fkey;
alter table public.community_messages add constraint community_messages_thread_id_fkey
  foreign key (thread_id) references public.community_threads(id) on delete set null;

alter table public.community_messages drop constraint if exists community_messages_reply_to_id_fkey;
alter table public.community_messages add constraint community_messages_reply_to_id_fkey
  foreign key (reply_to_id) references public.community_messages(id) on delete set null;

-- Reactions
create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.community_messages(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  emoji text not null check (char_length(emoji) <= 8),
  created_at timestamptz default now(),
  unique(message_id, user_id, emoji)
);

-- Row-level security
alter table public.community_threads enable row level security;
alter table public.community_reactions enable row level security;

drop policy if exists "members read community threads" on public.community_threads;
create policy "members read community threads" on public.community_threads
  for select to authenticated
  using (exists (
    select 1 from public.community_members m
    where m.community_id = community_threads.community_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  ));

drop policy if exists "members create community threads" on public.community_threads;
create policy "members create community threads" on public.community_threads
  for insert to authenticated
  with check (
    created_by = auth.uid() and exists (
      select 1 from public.community_members m
      where m.community_id = community_threads.community_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

drop policy if exists "members read reactions" on public.community_reactions;
create policy "members read reactions" on public.community_reactions
  for select to authenticated
  using (exists (
    select 1
    from public.community_messages msg
    join public.community_members m on m.community_id = msg.community_id
    where msg.id = community_reactions.message_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  ));

drop policy if exists "members add own reactions" on public.community_reactions;
create policy "members add own reactions" on public.community_reactions
  for insert to authenticated
  with check (
    user_id = auth.uid() and exists (
      select 1
      from public.community_messages msg
      join public.community_members m on m.community_id = msg.community_id
      where msg.id = community_reactions.message_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

drop policy if exists "members remove own reactions" on public.community_reactions;
create policy "members remove own reactions" on public.community_reactions
  for delete to authenticated
  using (user_id = auth.uid());

-- Realtime reactions
 do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_reactions'
  ) then
    alter publication supabase_realtime add table public.community_reactions;
  end if;
end $$;

-- Community image storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-images',
  'community-images',
  true,
  2097152,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "community images public read" on storage.objects;
create policy "community images public read" on storage.objects
  for select using (bucket_id = 'community-images');

drop policy if exists "authenticated users upload community images" on storage.objects;
create policy "authenticated users upload community images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own community images" on storage.objects;
create policy "users delete own community images" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Optional productivity features
alter table public.profiles add column if not exists leaderboard_opt_in boolean not null default false;
create table if not exists public.task_templates (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, subject text, minutes integer not null default 25, created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null,
  message text not null, read boolean not null default false, created_at timestamptz not null default now()
);
alter table public.task_templates enable row level security;
alter table public.notifications enable row level security;
drop policy if exists "users manage own task templates" on public.task_templates;
create policy "users manage own task templates" on public.task_templates for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
