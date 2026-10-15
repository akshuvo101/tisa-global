-- TISA Global Step 5: Customer workspace support

create policy "users update own notifications" on public.notifications
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Keep notification state customer-controlled only; notification content remains server/staff controlled.
