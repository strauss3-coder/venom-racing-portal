-- ===============================================================
-- VENOM RACING PORTAL - add yourself to the owner allowlist
--
-- Run this ONCE, in the Supabase SQL Editor, AFTER you have
-- created your account under Authentication > Users.
--
-- Being signed in is not enough to edit anything. Every write
-- policy also checks public.is_owner(), which reads this table.
-- Until your row exists here the portal signs you in and then
-- shows you nothing, on purpose.
--
-- Replace the address below with the one you signed up with, and
-- KEEP THE SINGLE QUOTES around it. Without them Postgres reads
-- the address as a column name and fails with:
--     ERROR: 42703: column "yourname" does not exist
--
--   right:  lower('someone@example.com')
--   wrong:  lower(someone@example.com)
--
-- Edit it inside the quotes rather than retyping the whole line -
-- that is how the quotes usually get lost.
-- ===============================================================

insert into public.portal_owners (user_id, email)
select id, email
from auth.users
where lower(email) = lower('paste-your-email-here@example.com')
on conflict (user_id) do nothing;

-- Confirm it worked. This must return exactly one row.
select u.email, o.added_at
from public.portal_owners o
join auth.users u on u.id = o.user_id;
