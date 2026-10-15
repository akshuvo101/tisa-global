-- TISA Global Step 11: operational customer trip workspace and travel readiness.

alter table public.profiles
  add column if not exists nationality text,
  add column if not exists passport_expiry date,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists preferred_contact_channel text not null default 'email';

alter table public.profiles drop constraint if exists profiles_preferred_contact_channel_check;
alter table public.profiles add constraint profiles_preferred_contact_channel_check
  check (preferred_contact_channel in ('email','phone','whatsapp'));

create table if not exists public.travel_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  title text not null,
  status text not null default 'planning',
  readiness_status text not null default 'not_ready',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint travel_trips_status_check check (status in ('planning','processing','confirmed','travel_ready','completed','cancelled','on_hold')),
  constraint travel_trips_readiness_check check (readiness_status in ('not_ready','needs_attention','almost_ready','travel_ready'))
);

alter table public.travel_trips enable row level security;

create policy "users read own travel trips" on public.travel_trips
for select using (auth.uid() = user_id);

create policy "users create own travel trips" on public.travel_trips
for insert with check (auth.uid() = user_id and exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));

create policy "users update own travel trips" on public.travel_trips
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "staff manage travel trips" on public.travel_trips
for all using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create index if not exists travel_trips_user_id_idx on public.travel_trips(user_id);
create index if not exists travel_trips_request_id_idx on public.travel_trips(request_id);
