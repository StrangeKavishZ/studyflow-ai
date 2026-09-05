-- Comprehensive pre-launch RLS audit.
-- The app filters every query by user_id in application code, but that is
-- NOT a security boundary — without RLS enabled and a matching policy on
-- each table, any authenticated user can query these tables directly
-- (bypassing the app entirely) and read or modify any other user's data.
-- This migration closes every gap found across all tables the app uses.

-- ---------- Personal academic data: strictly owner-only ----------

alter table public.exams enable row level security;
drop policy if exists "users manage own exams" on public.exams;
create policy "users manage own exams" on public.exams
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.marks enable row level security;
drop policy if exists "users manage own marks" on public.marks;
create policy "users manage own marks" on public.marks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.tasks enable row level security;
drop policy if exists "users manage own tasks" on public.tasks;
create policy "users manage own tasks" on public.tasks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.subjects enable row level security;
drop policy if exists "users manage own subjects" on public.subjects;
create policy "users manage own subjects" on public.subjects
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.topics enable row level security;
drop policy if exists "users manage own topics" on public.topics;
create policy "users manage own topics" on public.topics
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.study_sessions enable row level security;
drop policy if exists "users manage own study sessions" on public.study_sessions;
create policy "users manage own study sessions" on public.study_sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- study_sessions has one legitimate exception: the Leaderboard needs to
-- read minutes for OTHER users who opted in, to compute weekly totals.
drop policy if exists "leaderboard opt-in sessions are readable" on public.study_sessions;
create policy "leaderboard opt-in sessions are readable" on public.study_sessions
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = study_sessions.user_id
        and p.leaderboard_opt_in = true
    )
  );

-- ---------- Communities: membership-gated ----------

alter table public.communities enable row level security;
drop policy if exists "communities are readable by authenticated users" on public.communities;
create policy "communities are readable by authenticated users" on public.communities
  for select to authenticated
  using (true);

alter table public.community_members enable row level security;
drop policy if exists "users manage own membership" on public.community_members;
create policy "users manage own membership" on public.community_members
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
drop policy if exists "members can see other members in shared community" on public.community_members;
create policy "members can see other members in shared community" on public.community_members
  for select to authenticated
  using (
    exists (
      select 1 from public.community_members me
      where me.community_id = community_members.community_id
        and me.user_id = auth.uid()
        and me.status = 'active'
    )
  );

alter table public.community_messages enable row level security;
drop policy if exists "members read channel messages" on public.community_messages;
create policy "members read channel messages" on public.community_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.community_members m
      where m.community_id = community_messages.community_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );
drop policy if exists "members post own messages" on public.community_messages;
create policy "members post own messages" on public.community_messages
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.community_members m
      where m.community_id = community_messages.community_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );
drop policy if exists "users delete own messages" on public.community_messages;
create policy "users delete own messages" on public.community_messages
  for delete to authenticated
  using (user_id = auth.uid());

-- ---------- Study groups: owner + member visibility ----------

alter table public.study_groups enable row level security;
drop policy if exists "groups are readable by authenticated users" on public.study_groups;
create policy "groups are readable by authenticated users" on public.study_groups
  for select to authenticated
  using (privacy = 'public' or owner_id = auth.uid()
    or exists (
      select 1 from public.study_group_members gm
      where gm.group_id = study_groups.id and gm.user_id = auth.uid() and gm.status = 'active'
    ));
drop policy if exists "owners manage their groups" on public.study_groups;
create policy "owners manage their groups" on public.study_groups
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
drop policy if exists "authenticated users create groups" on public.study_groups;
create policy "authenticated users create groups" on public.study_groups
  for insert to authenticated
  with check (owner_id = auth.uid());

alter table public.study_group_members enable row level security;
drop policy if exists "users manage own group membership" on public.study_group_members;
create policy "users manage own group membership" on public.study_group_members
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
drop policy if exists "group members see each other" on public.study_group_members;
create policy "group members see each other" on public.study_group_members
  for select to authenticated
  using (
    exists (
      select 1 from public.study_group_members me
      where me.group_id = study_group_members.group_id
        and me.user_id = auth.uid()
        and me.status = 'active'
    )
  );