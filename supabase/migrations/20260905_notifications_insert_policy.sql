-- Allow a user to insert a notification for someone else only if both are
-- active members of the same community (mirrors the reactions policy check).
-- Read/update remain restricted to the notification's own owner.

drop policy if exists "authenticated users create notifications" on public.notifications;
create policy "community members notify each other" on public.notifications
  for insert to authenticated
  with check (
    user_id = auth.uid()
    or exists (
      select 1
      from public.community_members me
      join public.community_members them
        on them.community_id = me.community_id
        and them.user_id = notifications.user_id
        and them.status = 'active'
      where me.user_id = auth.uid()
        and me.status = 'active'
    )
  );
