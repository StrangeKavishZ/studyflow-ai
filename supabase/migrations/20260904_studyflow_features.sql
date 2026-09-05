-- StudyFlow feature upgrade: profile avatars, community reactions/replies/images

-- 1. Profile avatar customisation
alter table public.profiles add column if not exists avatar_emoji text default '🎓';
alter table public.profiles add column if not exists avatar_color text default '#3D7A5C';

-- 2. Community message replies
alter table public.community_messages add column if not exists reply_to_id uuid;
alter table public.community_messages drop constraint if exists community_messages_reply_to_id_fkey;
alter table public.community_messages add constraint community_messages_reply_to_id_fkey
  foreign key (reply_to_id) references public.community_messages(id) on delete set null;

-- 3. Community message images
alter table public.community_messages add column if not exists image_url text;

-- 4. Reactions
create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.community_messages(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  emoji text not null check (char_length(emoji) <= 8),
  created_at timestamptz default now(),
  unique(message_id, user_id, emoji)
);
alter table public.community_reactions enable row level security;

drop policy if exists "members read reactions" on public.community_reactions;
create policy "members read reactions" on public.community_reactions for select to authenticated
  using (exists(
    select 1 from public.community_messages msg
    join public.community_members m on m.community_id = msg.community_id
    where msg.id = community_reactions.message_id and m.user_id = auth.uid() and m.status = 'active'
  ));

drop policy if exists "members add own reactions" on public.community_reactions;
create policy "members add own reactions" on public.community_reactions for insert to authenticated
  with check (user_id = auth.uid() and exists(
    select 1 from public.community_messages msg
    join public.community_members m on m.community_id = msg.community_id
    where msg.id = community_reactions.message_id and m.user_id = auth.uid() and m.status = 'active'
  ));

drop policy if exists "members remove own reactions" on public.community_reactions;
create policy "members remove own reactions" on public.community_reactions for delete to authenticated
  using (user_id = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_reactions'
  ) then
    alter publication supabase_realtime add table community_reactions;
  end if;
end $$;

-- 5. Storage bucket for community images (run bucket creation once; ignore if it already exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-images', 'community-images', true, 2097152, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set file_size_limit = 2097152, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "community images public read" on storage.objects;
create policy "community images public read" on storage.objects for select
  using (bucket_id = 'community-images');

drop policy if exists "authenticated users upload community images" on storage.objects;
create policy "authenticated users upload community images" on storage.objects for insert to authenticated
  with check (bucket_id = 'community-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "users delete own community images" on storage.objects;
create policy "users delete own community images" on storage.objects for delete to authenticated
  using (bucket_id = 'community-images' and (storage.foldername(name))[1] = auth.uid()::text);
