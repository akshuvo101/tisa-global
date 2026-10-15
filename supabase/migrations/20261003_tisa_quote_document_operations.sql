-- TISA Global Step 4: Quote & Document Operations

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'quotes_status_check') then
    alter table public.quotes add constraint quotes_status_check check (status in ('draft','sent','accepted','changes_requested','expired','cancelled'));
  end if;
end $$;

alter table public.request_documents alter column file_name drop not null, alter column storage_path drop not null;
alter table public.request_documents add column if not exists requested_by uuid references public.profiles(id) on delete set null;
alter table public.request_documents add column if not exists due_date date;
alter table public.request_documents add column if not exists notes text;

create policy "customers update own request documents" on public.request_documents
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "customers update own quote status" on public.quotes
for update using (exists (select 1 from public.service_requests sr where sr.id = quotes.request_id and sr.user_id = auth.uid()))
with check (status = 'changes_requested' and exists (select 1 from public.service_requests sr where sr.id = quotes.request_id and sr.user_id = auth.uid()));

-- Private customer-document bucket. Files are never publicly readable.
insert into storage.buckets (id, name, public)
values ('tisa-documents', 'tisa-documents', false)
on conflict (id) do update set public = false;

create policy "tisa customers upload own documents" on storage.objects
for insert to authenticated
with check (bucket_id = 'tisa-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "tisa customers read own documents" on storage.objects
for select to authenticated
using (bucket_id = 'tisa-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "tisa customers delete own documents" on storage.objects
for delete to authenticated
using (bucket_id = 'tisa-documents' and (storage.foldername(name))[1] = auth.uid()::text);


create policy "tisa staff read operational documents" on storage.objects
for select to authenticated
using (bucket_id = 'tisa-documents' and public.current_user_role() = 'admin');
