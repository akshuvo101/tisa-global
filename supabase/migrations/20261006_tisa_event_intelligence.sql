create table if not exists public.event_updates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  update_type text not null,
  old_value text,
  new_value text,
  source_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.event_updates enable row level security;

create policy "public can read verified event updates" on public.event_updates
for select using (exists (select 1 from public.events e where e.id = event_id and e.verification_status = 'verified'));

create policy "staff can manage event intelligence" on public.event_updates
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "staff can manage event sources" on public.event_sources
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "staff can manage event invitations" on public.event_invitations
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "staff can manage events" on public.events
for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create index if not exists events_start_date_idx on public.events(start_date);
create index if not exists events_country_idx on public.events(country);
create index if not exists events_category_idx on public.events(category);
create index if not exists events_verification_idx on public.events(verification_status);
create index if not exists event_updates_event_idx on public.event_updates(event_id, created_at desc);
