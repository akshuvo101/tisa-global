-- TISA Global admin operations and role protection

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

create or replace function public.prevent_customer_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and new.role is distinct from old.role then
    raise exception 'Role changes must be performed by an authorized administrator.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row execute function public.prevent_customer_role_change();

-- Admin/staff read access for operational records.
create policy "staff and admins read service requests" on public.service_requests
for select using (public.current_user_role() = 'admin');

create policy "staff and admins update service requests" on public.service_requests
for update using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "staff and admins read request services" on public.request_services
for select using (public.current_user_role() = 'admin');

create policy "staff and admins update request services" on public.request_services
for update using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "staff and admins read request documents" on public.request_documents
for select using (public.current_user_role() = 'admin');

create policy "staff and admins update request documents" on public.request_documents
for update using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "staff and admins read request messages" on public.request_messages
for select using (public.current_user_role() = 'admin');

create policy "staff and admins send request messages" on public.request_messages
for insert with check (public.current_user_role() = 'admin' and auth.uid() = sender_id);

create policy "staff and admins read request notes" on public.request_notes
for select using (public.current_user_role() = 'admin');

create policy "staff and admins create request notes" on public.request_notes
for insert with check (public.current_user_role() = 'admin' and auth.uid() = staff_id);

create policy "staff and admins read quotes" on public.quotes
for select using (public.current_user_role() = 'admin');

create policy "staff and admins create quotes" on public.quotes
for insert with check (public.current_user_role() = 'admin' and auth.uid() = created_by);

create policy "staff and admins update quotes" on public.quotes
for update using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "staff and admins read quote items" on public.quote_items
for select using (public.current_user_role() = 'admin');

create policy "staff and admins manage quote items" on public.quote_items
for all using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "staff and admins read profiles" on public.profiles
for select using (public.current_user_role() = 'admin' or auth.uid() = id);

create policy "admins manage service catalog" on public.service_catalog
for all using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "admins manage events" on public.events
for all using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy "staff and admins create notifications" on public.notifications
for insert with check (public.current_user_role() = 'admin');

create policy "staff and admins create activity logs" on public.activity_logs
for insert with check (public.current_user_role() = 'admin' and auth.uid() = actor_id);

create policy "staff and admins read activity logs" on public.activity_logs
for select using (public.current_user_role() = 'admin');
