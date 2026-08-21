-- ===============================================================
-- VENOM RACING PORTAL - finish setting up the owner's login
--
-- The account venom@venomracing.co.za already exists. Two things
-- still need doing, and neither can be done from the portal
-- itself, on purpose: both are protected so that nobody can grant
-- themselves access just by signing up.
--
-- Run this ONCE in the Supabase SQL Editor.
-- (Dashboard > SQL Editor > New query > paste > Run)
-- ===============================================================

-- 1. Mark the address as confirmed, so the account can sign in.
--    Signing up sends a confirmation email; this does the same job
--    from here, which is easier than waiting on the mailbox.
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) = lower('venom@venomracing.co.za');

-- 2. Put the account on the owner allowlist. Being signed in is not
--    enough to read enquiries or change content - every write policy
--    checks this table.
insert into public.portal_owners (user_id, email)
select id, email
from auth.users
where lower(email) = lower('venom@venomracing.co.za')
on conflict (user_id) do nothing;

-- 3. Say in words whether it worked.
select case
         when not exists (select 1 from auth.users
                          where lower(email) = lower('venom@venomracing.co.za'))
           then 'NO ACCOUNT - nothing exists with that address'
         when not exists (select 1 from auth.users
                          where lower(email) = lower('venom@venomracing.co.za')
                            and email_confirmed_at is not null)
           then 'NOT CONFIRMED - step 1 did not take effect'
         when not exists (select 1 from public.portal_owners o
                          join auth.users u on u.id = o.user_id
                          where lower(u.email) = lower('venom@venomracing.co.za'))
           then 'NOT AN OWNER - step 2 did not take effect'
         else 'DONE - venom@venomracing.co.za can sign in and edit'
       end as result;
