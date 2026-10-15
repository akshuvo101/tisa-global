-- TISA Global request-system corrections and customer dashboard support.
-- Run this AFTER 20260929_tisa_core.sql. For a fresh database, use the combined
-- corrected migration generated with this release instead.

-- Profiles must be readable by their owner; staff/admin policies come later.
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Customer request detail access.
create policy "users read own request documents" on public.request_documents
  for select using (
    auth.uid() = user_id
    and exists (
      select 1 from public.service_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

-- Avoid duplicate policies if this migration is re-run.
