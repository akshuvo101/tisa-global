-- RLS controls which notification rows customers can access; table grants
-- separately allow authenticated customers to run those RLS-checked queries.
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

grant select, insert, update on public.notification_preferences to authenticated;
