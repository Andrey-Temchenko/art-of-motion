insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketing-media',
  'marketing-media',
  true,
  104857600,
  array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
);

create policy "Marketing media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'marketing-media');