-- Admin-managed gallery image uploads and descriptions.

alter table gallery_images
  add column if not exists description text not null default '';

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'gallery-images',
  'gallery-images',
  true,
  4194304,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can upload gallery images" on storage.objects;
create policy "Admins can upload gallery images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gallery-images'
  and (select role from public.accounts where id = auth.uid()) = 'admin'
);

drop policy if exists "Admins can update gallery images" on storage.objects;
create policy "Admins can update gallery images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'gallery-images'
  and (select role from public.accounts where id = auth.uid()) = 'admin'
)
with check (
  bucket_id = 'gallery-images'
  and (select role from public.accounts where id = auth.uid()) = 'admin'
);

drop policy if exists "Admins can delete gallery images" on storage.objects;
create policy "Admins can delete gallery images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gallery-images'
  and (select role from public.accounts where id = auth.uid()) = 'admin'
);

drop policy if exists "Anyone can view gallery images" on storage.objects;
create policy "Anyone can view gallery images"
on storage.objects for select
to public
using (bucket_id = 'gallery-images');

-- Keep the existing RPC shape available to callers that do not set descriptions.
create or replace function admin_upsert_gallery_image(
  p_id          int,
  p_image_url   text,
  p_alt_text    text,
  p_category    text,
  p_caption     text,
  p_sort_order  int,
  p_visibility  text,
  p_description text
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_id int;
begin
  perform assert_is_admin();

  if p_visibility is null
     or p_visibility not in ('draft', 'published', 'archived')
  then
    raise exception 'Invalid visibility: %', p_visibility;
  end if;

  if p_category is not null
     and p_category not in ('on_course', 'coaching', 'tournaments', 'academy_life')
  then
    raise exception 'Invalid category: %', p_category;
  end if;

  if p_id is null then
    if p_image_url is null or p_category is null then
      raise exception 'image_url and category are required';
    end if;

    insert into gallery_images (
      image_url, alt_text, category, caption, description,
      sort_order, visibility, published_at
    )
    values (
      p_image_url, coalesce(p_alt_text, ''), p_category, p_caption,
      coalesce(p_description, ''), p_sort_order, p_visibility,
      case when p_visibility = 'published' then now() else null end
    )
    returning id into v_id;
  else
    update gallery_images set
      image_url    = coalesce(p_image_url, image_url),
      alt_text     = coalesce(p_alt_text, alt_text),
      category     = coalesce(p_category, category),
      caption      = coalesce(p_caption, caption),
      description  = coalesce(p_description, description),
      sort_order   = coalesce(p_sort_order, sort_order),
      visibility   = p_visibility,
      published_at = case
        when p_visibility = 'published' and published_at is null then now()
        when p_visibility = 'published' then published_at
        else null
      end
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Gallery image not found: %', p_id;
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function admin_upsert_gallery_image(
  int, text, text, text, text, int, text, text
) to authenticated;

drop function get_published_gallery(text);
create function get_published_gallery(p_category text default null)
returns table (
  id            int,
  image_url     text,
  alt_text      text,
  category      text,
  caption       text,
  description   text,
  sort_order    int
)
language sql
security definer set search_path = public
stable
as $$
  select
    gi.id,
    gi.image_url,
    gi.alt_text,
    gi.category,
    gi.caption,
    gi.description,
    gi.sort_order
  from gallery_images gi
  where gi.visibility = 'published'
    and (p_category is null or gi.category = p_category)
  order by gi.sort_order asc;
$$;

grant execute on function get_published_gallery(text) to anon, authenticated;
