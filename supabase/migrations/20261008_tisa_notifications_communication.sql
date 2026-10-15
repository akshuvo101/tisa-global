-- Step 10: notification delivery, preferences and communication infrastructure.

alter table public.notifications add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  channel text not null check (channel in ('in_app','email','whatsapp')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, notification_type, channel)
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  channel text not null check (channel in ('in_app','email','whatsapp')),
  status text not null check (status in ('queued','processing','sent','delivered','failed','not_configured')),
  attempts integer not null default 1,
  provider_message_id text,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.communication_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  channel text not null check (channel in ('email','whatsapp','in_app')),
  subject text,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.communication_templates enable row level security;

create policy "users manage own notification preferences" on public.notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own notification deliveries" on public.notification_deliveries for select using (exists (select 1 from public.notifications n where n.id = notification_id and n.user_id = auth.uid()));
create policy "staff manage notification deliveries" on public.notification_deliveries for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "staff manage communication templates" on public.communication_templates for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create index if not exists notification_deliveries_created_idx on public.notification_deliveries(created_at desc);
create index if not exists notification_preferences_user_idx on public.notification_preferences(user_id);

insert into public.communication_templates(template_key, channel, subject, body) values
('request_created','email','TISA request received','TISA has received your travel assistance request.'),
('quote_ready','email','Your TISA quote is ready','Your TISA quote is ready to review.'),
('booking_created','email','Your TISA booking is processing','Your TISA booking has been created and is being processed.'),
('travel_ready','email','Your TISA travel is ready','Your travel arrangements are ready.'),
('request_message','email','New message from TISA','You have a new message from the TISA team.')
on conflict (template_key) do nothing;
