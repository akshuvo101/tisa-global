-- Step 9: external integration registry, sync tracking and webhook intake.

alter table public.events add column if not exists external_source_key text;
create unique index if not exists events_external_source_key_uidx on public.events(external_source_key) where external_source_key is not null;

create table if not exists public.integration_sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  kind text not null,
  status text not null check (status in ('running','completed','failed','not_configured')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  records_found integer not null default 0,
  records_created integer not null default 0,
  records_updated integer not null default 0,
  records_skipped integer not null default 0,
  error_message text
);

create table if not exists public.integration_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received','processed','failed')),
  error_message text
);

alter table public.integration_sync_runs enable row level security;
alter table public.integration_webhook_events enable row level security;
create policy "staff can manage integration sync runs" on public.integration_sync_runs for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin can manage webhook events" on public.integration_webhook_events for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create index if not exists integration_sync_runs_started_idx on public.integration_sync_runs(started_at desc);
create index if not exists integration_webhook_events_received_idx on public.integration_webhook_events(received_at desc);
create unique index if not exists event_sources_event_url_uidx on public.event_sources(event_id, source_url);
create unique index if not exists event_invitations_event_uidx on public.event_invitations(event_id);
