-- Upload/suppression sur le bucket als-medias : reserve a l'admin Mission.
-- (La lecture est publique car le bucket est public.)
drop policy if exists als_medias_admin_write on storage.objects;
create policy als_medias_admin_write on storage.objects for all to authenticated
using (bucket_id = 'als-medias' and auth.uid() = 'e9b37342-9fbd-4af3-80cc-e27ee767b221'::uuid)
with check (bucket_id = 'als-medias' and auth.uid() = 'e9b37342-9fbd-4af3-80cc-e27ee767b221'::uuid);
