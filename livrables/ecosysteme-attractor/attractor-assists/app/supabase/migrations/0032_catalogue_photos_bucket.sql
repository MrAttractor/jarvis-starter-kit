-- 0032_catalogue_photos_bucket.sql — Bucket photos catalogue produits
insert into storage.buckets (id, name, public)
values ('catalogue-photos', 'catalogue-photos', true)
on conflict (id) do nothing;

create policy "catalogue photos insert" on storage.objects
  for insert with check (bucket_id = 'catalogue-photos' and auth.uid() is not null);

create policy "catalogue photos public read" on storage.objects
  for select using (bucket_id = 'catalogue-photos');

create policy "catalogue photos delete own" on storage.objects
  for delete using (bucket_id = 'catalogue-photos' and auth.uid()::text = (storage.foldername(name))[1]);
