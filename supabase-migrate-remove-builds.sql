create or replace view public.website_services
  with (security_invoker = true) as
  select id, title, division, icon, description, image, anchor, featured, sort_order
  from public.services
  where active = true
  order by sort_order asc, created_at asc;

drop view if exists public.website_builds;

drop table if exists public.builds cascade;
drop table if exists public.offers cascade;

do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public' and tablename in ('builds','offers')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

delete from public.site_settings where key = 'analytics';

select 'builds' as removed_table, to_regclass('public.builds') as still_exists
union all
select 'offers', to_regclass('public.offers')
union all
select 'website_builds', to_regclass('public.website_builds');
