-- Enable RLS on Phase 3-ready tables (no public policies; service role only until admin routes exist)
alter table url_redirects enable row level security;
alter table api_keys enable row level security;

-- Harden search trigger function against search_path injection
create or replace function public.products_search_vector_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.search_vector :=
    to_tsvector(
      'english',
      coalesce(new.name, '') || ' ' ||
      coalesce(new.description, '') || ' ' ||
      coalesce(new.brand, '')
    );
  new.updated_at := now();
  return new;
end;
$$;
