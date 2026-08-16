create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.builds (
  id             text primary key,
  title          text not null default '',
  make           text default '',
  model          text default '',
  year           int,
  engine         text default '',
  fuel           text default '',
  transmission   text default '',
  stage          text default '',
  tuning_type    text default '',
  validation     text default '',
  power_before   numeric default 0,
  power_after    numeric default 0,
  torque_before  numeric default 0,
  torque_after   numeric default 0,
  work_done      jsonb not null default '[]'::jsonb,
  description    text default '',
  images         jsonb not null default '[]'::jsonb,
  customer_ref   text default '',
  status         text default 'draft',
  featured       boolean not null default false,
  published      boolean not null default false,
  archived       boolean not null default false,
  views          int not null default 0,
  completed_at   timestamptz,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.services (
  id           text primary key,
  title        text not null default '',
  division     text default 'Performance',
  icon         text default 'wrench',
  description  text default '',
  image        text default '',
  anchor       text default '',
  active       boolean not null default true,
  featured     boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.stages (
  id            text primary key,
  label         text default '',
  name          text not null default '',
  tagline       text default '',
  description   text default '',
  requirements  jsonb not null default '[]'::jsonb,
  benefits      jsonb not null default '[]'::jsonb,
  note          text default '',
  icon          text default 'stage',
  active        boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.products (
  id           text primary key,
  name         text not null default '',
  range        text default '',
  type         text default '',
  description  text default '',
  size         text default '',
  price        numeric default 0,
  image        text default '',
  in_stock     boolean not null default true,
  active       boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.brands (
  id          text primary key,
  name        text not null default '',
  logo        text default '',
  url         text default '',
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.faqs (
  id          text primary key,
  question    text not null default '',
  answer      text default '',
  category    text default 'General',
  featured    boolean not null default false,
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.testimonials (
  id          text primary key,
  name        text not null default '',
  subject     text default '',
  rating      int not null default 5 check (rating between 1 and 5),
  review      text default '',
  photo       text default '',
  featured    boolean not null default false,
  source      text default 'Google',
  date_text   text default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.offers (
  id           text primary key,
  title        text not null default '',
  description  text default '',
  btn_text     text default '',
  btn_link     text default '',
  colour       text default '#b3121f',
  image        text default '',
  active       boolean not null default false,
  expiry       timestamptz,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.enquiries (
  id            text primary key,
  name          text not null default '',
  phone         text default '',
  email         text default '',
  make          text default '',
  model         text default '',
  registration  text default '',
  service       text default '',
  vehicle       text default '',
  notes         text default '',
  source        text default 'Website form',
  status        text not null default 'unread',
  message       text default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.enquiries add column if not exists make          text default '';
alter table public.enquiries add column if not exists model         text default '';
alter table public.enquiries add column if not exists registration  text default '';
alter table public.enquiries add column if not exists service       text default '';
alter table public.enquiries add column if not exists notes         text default '';

create table if not exists public.activity_log (
  id      text primary key,
  title   text default '',
  detail  text default '',
  icon    text default 'activity',
  tone    text default '',
  at      timestamptz not null default now()
);

create index if not exists builds_public_idx
  on public.builds (archived, published, featured, sort_order);
create index if not exists builds_created_idx
  on public.builds (created_at desc);
create index if not exists services_division_idx
  on public.services (division, active, sort_order);
create index if not exists faqs_category_idx
  on public.faqs (category, active, sort_order);
create index if not exists products_active_idx
  on public.products (active, sort_order);
create index if not exists enquiries_status_idx
  on public.enquiries (status, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['site_settings','builds','services','stages','products','brands','faqs','testimonials','offers','enquiries']
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

create table if not exists public.portal_owners (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text,
  added_at  timestamptz not null default now()
);

alter table public.portal_owners enable row level security;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.portal_owners where user_id = auth.uid()
  );
$$;

revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

alter table public.site_settings enable row level security;
alter table public.builds        enable row level security;
alter table public.services      enable row level security;
alter table public.stages        enable row level security;
alter table public.products      enable row level security;
alter table public.brands        enable row level security;
alter table public.faqs          enable row level security;
alter table public.testimonials  enable row level security;
alter table public.offers        enable row level security;
alter table public.enquiries     enable row level security;
alter table public.activity_log  enable row level security;

do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('site_settings','builds','services','stages','products','brands','faqs','testimonials','offers','enquiries','activity_log','portal_owners')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create policy "owner reads own membership" on public.portal_owners
  for select to authenticated using (user_id = auth.uid());

create policy "public reads settings"     on public.site_settings for select to anon using (true);
create policy "public reads builds"       on public.builds        for select to anon using (archived = false and published = true);
create policy "public reads services"     on public.services      for select to anon using (active = true);
create policy "public reads stages"       on public.stages        for select to anon using (active = true);
create policy "public reads products"     on public.products      for select to anon using (active = true);
create policy "public reads brands"       on public.brands        for select to anon using (active = true);
create policy "public reads faqs"         on public.faqs          for select to anon using (active = true);
create policy "public reads testimonials" on public.testimonials  for select to anon using (true);
create policy "public reads live offers"  on public.offers        for select to anon
  using (active = true and (expiry is null or expiry > now()));

create policy "public submits enquiry" on public.enquiries for insert to anon with check (true);

create policy "owner manages settings"     on public.site_settings for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages builds"       on public.builds        for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages services"     on public.services      for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages stages"       on public.stages        for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages products"     on public.products      for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages brands"       on public.brands        for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages faqs"         on public.faqs          for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages testimonials" on public.testimonials  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages offers"       on public.offers        for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages enquiries"    on public.enquiries     for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner manages activity"     on public.activity_log  for all to authenticated using (public.is_owner()) with check (public.is_owner());

insert into storage.buckets (id, name, public)
values ('build-images','build-images',true),
       ('gallery','gallery',true),
       ('branding','branding',true)
on conflict (id) do update set public = true;

do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'venom %'
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "venom public read" on storage.objects for select to anon, authenticated
  using (bucket_id in ('build-images','gallery','branding'));
create policy "venom owner insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('build-images','gallery','branding') and public.is_owner());
create policy "venom owner update" on storage.objects for update to authenticated
  using (bucket_id in ('build-images','gallery','branding') and public.is_owner());
create policy "venom owner delete" on storage.objects for delete to authenticated
  using (bucket_id in ('build-images','gallery','branding') and public.is_owner());

create or replace view public.website_builds
  with (security_invoker = true) as
  select id, title, make, model, year, engine, fuel, transmission, stage,
         tuning_type, validation, power_before, power_after,
         torque_before, torque_after, work_done, description, images,
         featured, views, completed_at, sort_order, created_at
  from public.builds
  where archived = false and published = true
  order by featured desc, sort_order asc, created_at desc;

create or replace view public.website_services
  with (security_invoker = true) as
  select id, title, division, icon, description, image, anchor, featured, sort_order
  from public.services
  where active = true
  order by sort_order asc, created_at asc;

create or replace view public.website_stages
  with (security_invoker = true) as
  select id, label, name, tagline, description, requirements, benefits, note, icon, sort_order
  from public.stages
  where active = true
  order by sort_order asc, created_at asc;

create or replace view public.website_products
  with (security_invoker = true) as
  select id, name, range, type, description, size, price, image, in_stock, sort_order
  from public.products
  where active = true
  order by sort_order asc, created_at asc;

create or replace view public.website_brands
  with (security_invoker = true) as
  select id, name, logo, url, sort_order
  from public.brands
  where active = true
  order by sort_order asc, created_at asc;

create or replace view public.website_faqs
  with (security_invoker = true) as
  select id, question, answer, category, featured, sort_order
  from public.faqs
  where active = true
  order by sort_order asc, created_at asc;

grant usage on schema public to anon, authenticated;

grant select on public.site_settings, public.builds, public.services,
                public.stages, public.products, public.brands, public.faqs,
                public.testimonials, public.offers,
                public.website_builds, public.website_services,
                public.website_stages, public.website_products,
                public.website_brands, public.website_faqs to anon;
grant insert on public.enquiries to anon;

grant select, insert, update, delete
  on public.site_settings, public.builds, public.services, public.stages,
     public.products, public.brands, public.faqs, public.testimonials,
     public.offers, public.enquiries, public.activity_log to authenticated;
grant select on public.website_builds, public.website_services,
                public.website_stages, public.website_products,
                public.website_brands, public.website_faqs,
                public.portal_owners to authenticated;
