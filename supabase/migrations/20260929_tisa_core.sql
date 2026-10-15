-- TISA Global core business schema
create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');
create type public.request_status as enum ('requested', 'reviewing', 'need_documents', 'documents_received', 'quoted', 'quote_accepted', 'processing', 'confirmed', 'completed', 'cancelled', 'on_hold');
create type public.request_priority as enum ('normal', 'high', 'urgent');
create type public.service_status as enum ('pending', 'processing', 'completed', 'confirmed', 'cancelled');
create type public.document_status as enum ('required', 'uploaded', 'under_review', 'accepted', 'rejected', 'expired');
create type public.verification_status as enum ('unverified', 'under_review', 'verified', 'needs_reverification', 'expired');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  country text,
  city text,
  avatar_url text,
  role public.user_role not null default 'customer',
  organization text,
  profession text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  short_description text,
  icon text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid,
  destination_country text,
  destination_city text,
  travel_start_date date,
  travel_end_date date,
  traveler_count integer not null default 1 check (traveler_count > 0),
  description text not null,
  priority public.request_priority not null default 'normal',
  status public.request_status not null default 'requested',
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  first_response_at timestamptz,
  reviewed_at timestamptz,
  quoted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_travel_dates check (travel_end_date is null or travel_start_date is null or travel_end_date >= travel_start_date)
);

create table if not exists public.request_services (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  service_id uuid not null references public.service_catalog(id) on delete restrict,
  status public.service_status not null default 'pending',
  description text,
  quantity integer not null default 1 check (quantity > 0),
  estimated_amount numeric(12,2),
  final_amount numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(request_id, service_id)
);

create table if not exists public.request_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  file_name text not null,
  storage_path text not null,
  status public.document_status not null default 'uploaded',
  required boolean not null default false,
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.request_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  staff_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  quote_number text not null unique,
  status text not null default 'draft',
  subtotal numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  valid_until date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  service_id uuid references public.service_catalog(id) on delete set null,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  booking_reference text unique,
  status text not null default 'pending',
  total_amount numeric(12,2),
  currency text not null default 'USD',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_id uuid references public.service_catalog(id) on delete set null,
  provider_name text,
  provider_reference text,
  status text not null default 'pending',
  amount numeric(12,2),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  country text,
  city text,
  venue text,
  start_date date,
  end_date date,
  organizer_name text,
  organizer_website text,
  event_type text,
  category text,
  registration_status text,
  registration_url text,
  status text not null default 'draft',
  verification_status public.verification_status not null default 'unverified',
  last_verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  verification_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_requests drop constraint if exists service_requests_event_id_fkey;
alter table public.service_requests add constraint service_requests_event_id_fkey foreign key (event_id) references public.events(id) on delete set null;

create table if not exists public.event_sources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  source_name text not null,
  source_url text not null,
  source_type text not null,
  is_primary boolean not null default false,
  last_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.event_invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  availability text not null default 'unknown',
  invitation_type text,
  eligibility text,
  requirements text,
  request_method text,
  official_information_url text,
  last_verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  related_request_id uuid references public.service_requests(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.service_catalog (name, slug, category, short_description, sort_order)
values
  ('Conference Registration Assistance', 'conference-registration', 'conferences', 'Assistance with conference registration and participation requirements.', 10),
  ('Invitation Assistance', 'invitation-assistance', 'conferences', 'Guidance and assistance with official invitation processes.', 20),
  ('Visa Assistance', 'visa-assistance', 'visa', 'Visa document and application process assistance for international travel.', 30),
  ('Flight Ticket Assistance', 'flight-ticket', 'flights', 'Flight search, itinerary planning, and ticketing assistance.', 40),
  ('Hotel & Accommodation', 'hotel-accommodation', 'flights', 'Accommodation selection and booking assistance.', 50),
  ('Airport Transfer', 'airport-transfer', 'flights', 'Airport pickup and local transfer assistance.', 60),
  ('Medical Tourism Assistance', 'medical-tourism', 'medical', 'Hospital, appointment, medical travel, and related coordination.', 70),
  ('Student Travel Assistance', 'student-travel', 'education', 'Education travel, student visa, flight, accommodation, and arrival assistance.', 80),
  ('Custom / Immediate Assistance', 'custom-assistance', 'custom', 'Tell TISA what you need and our team will review the journey.', 90)
on conflict (slug) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.service_catalog enable row level security;
alter table public.service_requests enable row level security;
alter table public.request_services enable row level security;
alter table public.request_documents enable row level security;
alter table public.request_messages enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.events enable row level security;
alter table public.event_sources enable row level security;
alter table public.event_invitations enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

create policy "public can read active services" on public.service_catalog for select using (active = true);
create policy "users read own requests" on public.service_requests for select using (auth.uid() = user_id);
create policy "users create own requests" on public.service_requests for insert with check (auth.uid() = user_id);
create policy "users read own request services" on public.request_services for select using (exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "users create own request services" on public.request_services for insert with check (exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "users manage own documents" on public.request_documents for select using (auth.uid() = user_id);
create policy "users upload own documents" on public.request_documents for insert with check (auth.uid() = user_id);
create policy "users read own messages" on public.request_messages for select using (exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "users send own request messages" on public.request_messages for insert with check (auth.uid() = sender_id and exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "users read own quotes" on public.quotes for select using (exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "users read own quote items" on public.quote_items for select using (exists (select 1 from public.quotes q join public.service_requests r on r.id = q.request_id where q.id = quote_id and r.user_id = auth.uid()));
create policy "users read own bookings" on public.bookings for select using (exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "users read own booking items" on public.booking_items for select using (exists (select 1 from public.bookings b join public.service_requests r on r.id = b.request_id where b.id = booking_id and r.user_id = auth.uid()));
create policy "public can read verified events" on public.events for select using (verification_status = 'verified' and status <> 'cancelled');
create policy "public can read event sources" on public.event_sources for select using (exists (select 1 from public.events e where e.id = event_id and e.verification_status = 'verified'));
create policy "public can read event invitations" on public.event_invitations for select using (exists (select 1 from public.events e where e.id = event_id and e.verification_status = 'verified'));
create policy "users read own notifications" on public.notifications for select using (auth.uid() = user_id);
