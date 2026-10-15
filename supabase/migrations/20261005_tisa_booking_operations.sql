-- TISA Global Step 6: Booking Operations & Travel Fulfillment

alter table public.bookings
  add column if not exists booking_type text not null default 'travel_service',
  add column if not exists confirmation_status text not null default 'pending',
  add column if not exists notes text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists confirmed_by uuid references public.profiles(id) on delete set null;

alter table public.booking_items
  add column if not exists item_type text not null default 'service',
  add column if not exists scheduled_at timestamptz,
  add column if not exists notes text;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check check (status in ('pending','processing','confirmed','travel_ready','completed','cancelled','on_hold'));

alter table public.booking_items drop constraint if exists booking_items_status_check;
alter table public.booking_items add constraint booking_items_status_check check (status in ('pending','processing','confirmed','completed','cancelled','on_hold'));

create index if not exists bookings_request_id_idx on public.bookings(request_id);
create index if not exists booking_items_booking_id_idx on public.booking_items(booking_id);

drop policy if exists "staff manage bookings" on public.bookings;
create policy "staff manage bookings" on public.bookings
for all using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "staff manage booking items" on public.booking_items;
create policy "staff manage booking items" on public.booking_items
for all using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "users read own booking details" on public.bookings;
create policy "users read own booking details" on public.bookings
for select using (exists (select 1 from public.service_requests r where r.id = request_id and r.user_id = auth.uid()));

drop policy if exists "users read own booking item details" on public.booking_items;
create policy "users read own booking item details" on public.booking_items
for select using (exists (select 1 from public.bookings b join public.service_requests r on r.id = b.request_id where b.id = booking_id and r.user_id = auth.uid()));
