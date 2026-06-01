-- 0007_admin_policies.sql — Accès admin en lecture sur les tables clés

create policy "profiles admin read"    on public.profiles    for select using (public.is_admin());
create policy "usage_daily admin read" on public.usage_daily for select using (public.is_admin());
create policy "feedback admin update"  on public.feedback    for update using (public.is_admin());
