create extension if not exists pgcrypto;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id),
  nav_pillar text check (nav_pillar in ('bathroom', 'doors-hardware', 'kitchen-laundry')),
  icon_key text,
  mega_menu_image text,
  mega_menu_order integer default 0,
  show_in_mega_menu boolean default true,
  meta_title text,
  meta_description text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price integer not null,
  category_id uuid references categories(id),
  sku text unique not null,
  gtin text,
  brand text,
  attributes jsonb default '{}'::jsonb,
  meta_title text,
  meta_description text,
  og_image_url text,
  stock_quantity integer default 0,
  in_stock boolean default true,
  active boolean default true,
  featured boolean default false,
  badge text check (badge in ('best_seller', 'new', 'sale')),
  collection_slugs text[] default '{}',
  rating numeric(2,1) default 0,
  review_count integer default 0,
  search_vector tsvector,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_slug_idx on products(slug);
create index if not exists products_category_active_idx on products(category_id, active);
create index if not exists products_active_updated_idx on products(active, updated_at desc);
create index if not exists products_search_idx on products using gin(search_vector);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  url text not null,
  alt_text text not null,
  sort_order integer default 0
);

create table if not exists homepage_heroes (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  subheadline text,
  cta_text text,
  cta_href text,
  image_url text not null,
  sort_order integer default 0,
  active boolean default true
);

create table if not exists homepage_promos (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  headline text not null,
  subtext text,
  cta_text text,
  cta_href text,
  image_url text,
  active boolean default true
);

create table if not exists homepage_collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text not null,
  cta_text text default 'SHOP COLLECTION →',
  sort_order integer default 0
);

create table if not exists inspiration_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null,
  sort_order integer default 0,
  active boolean default true
);

create table if not exists footer_links (
  id uuid primary key default gen_random_uuid(),
  column_name text not null,
  label text not null,
  href text not null,
  sort_order integer default 0
);

create table if not exists site_config (
  id integer primary key default 1 check (id = 1),
  promo_text text default 'FREE SHIPPING AUSTRALIA WIDE*',
  phone text,
  email text,
  address text,
  trading_hours text,
  social_links jsonb default '{}'::jsonb
);

create table if not exists url_redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text unique not null,
  to_path text not null,
  status_code integer default 301,
  created_at timestamptz default now()
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null,
  name text not null,
  rate_limit integer default 100,
  active boolean default true,
  created_at timestamptz default now()
);

create or replace function products_search_vector_update()
returns trigger as $$
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
$$ language plpgsql;

drop trigger if exists products_search_vector_trigger on products;

create trigger products_search_vector_trigger
before insert or update on products
for each row execute function products_search_vector_update();

alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table homepage_heroes enable row level security;
alter table homepage_promos enable row level security;
alter table homepage_collections enable row level security;
alter table inspiration_images enable row level security;
alter table footer_links enable row level security;
alter table site_config enable row level security;

drop policy if exists "Public read categories" on categories;
create policy "Public read categories" on categories
for select using (true);

drop policy if exists "Public read products" on products;
create policy "Public read products" on products
for select using (active = true);

drop policy if exists "Public read product_images" on product_images;
create policy "Public read product_images" on product_images
for select using (true);

drop policy if exists "Public read homepage_heroes" on homepage_heroes;
create policy "Public read homepage_heroes" on homepage_heroes
for select using (active = true);

drop policy if exists "Public read homepage_promos" on homepage_promos;
create policy "Public read homepage_promos" on homepage_promos
for select using (active = true);

drop policy if exists "Public read homepage_collections" on homepage_collections;
create policy "Public read homepage_collections" on homepage_collections
for select using (true);

drop policy if exists "Public read inspiration_images" on inspiration_images;
create policy "Public read inspiration_images" on inspiration_images
for select using (active = true);

drop policy if exists "Public read footer_links" on footer_links;
create policy "Public read footer_links" on footer_links
for select using (true);

drop policy if exists "Public read site_config" on site_config;
create policy "Public read site_config" on site_config
for select using (true);
