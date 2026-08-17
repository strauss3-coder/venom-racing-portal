# Venom Racing Portal

The admin portal for **venomracing.co.za**. It is where you change what the
website says — your builds, services, stages, products, reviews, FAQs,
contact details and opening hours — without touching any code.

It is one file. `index.html` opens by double-clicking it. There is nothing to
install, no build step, and it keeps working when the internet drops.

---

## What is in this folder

| File | What it is |
|---|---|
| `index.html` | The portal itself. This is the whole application. |
| `supabase-schema-plain.sql` | **Run this one.** Creates your database. |
| `supabase-schema.sql` | The same SQL with explanations, for reading only. |
| `add-me-as-owner.sql` | Gives your account permission to edit. Run once. |
| `supabase-seed-content.sql` | Loads your services, stages, products, brands, FAQs and reviews into the database. Run once. |
| `tests/` | Automated verification suites. See `tests/README.md`. |
| `robots.txt` | Keeps the portal out of Google. |
| `README.md` | This file. |

---

> **Already set up.** This portal ships connected to its Supabase
> project, so any device that opens the link goes straight to the
> sign-in screen. The steps below are the record of how it was set up,
> and what to repeat if you ever move to a new Supabase project.

> **The portal is the source of truth.** Services, performance stages,
> products, brands, FAQs, reviews and all contact details are read from
> the database by the live website. Edit them here and the site follows.
> If the database is ever unreachable the site keeps showing its own
> built-in copy, so a visitor never sees a blank section.

## Setting it up — five steps, about fifteen minutes

You only do this once.

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), sign up, and create a new project.
Choose a region close to South Africa. Wait for it to finish building.

When it is ready, open **Project Settings → API** and copy two things:

- the **Project URL** (looks like `https://abcdefgh.supabase.co`)
- the **publishable / anon key** (a long string starting `sb_publishable_` or `eyJ`)

> Copy the **publishable** key, never the **service_role** key. The publishable
> key is designed to sit in public website code. The service_role key bypasses
> every security rule and must never leave the Supabase dashboard.

### 2. Create the database

In Supabase, open **SQL Editor → New query**. Open
`supabase-schema-plain.sql` in a plain text editor, copy all of it, paste it
in, and click **Run**.

It should say *Success*. If it does not, see Troubleshooting below.

> Use `supabase-schema-plain.sql`, not `supabase-schema.sql`. Some editors —
> Notes, Word, Pages — silently turn a double dash into a long dash, which
> breaks the commented version. The plain file has no comments for exactly
> this reason. It is safe to run more than once.

### 3. Create your login

In Supabase, open **Authentication → Users → Add user**.

Enter your email address and a password. Tick **Auto Confirm User** so you do
not have to click a confirmation email.

### 4. Give yourself permission

This is the step people forget, and the portal will look empty until you do it.

Open `add-me-as-owner.sql`, replace `YOUR-EMAIL-HERE` with the email you just
used, then run it in the SQL Editor.

The check at the bottom must return exactly one row with your email. If it
returns nothing, the email did not match — check for a typo.

> **Why this exists.** Signing in is not enough to change anything. The
> publishable key is public, so "are you signed in?" is a weak test. Every
> write also checks that your account is on this allowlist, which can only be
> edited here in the SQL Editor. Nobody can add themselves through the website.

### 5. Load your content

Open `supabase-seed-content.sql`, copy all of it, and run it in the SQL
Editor. This loads your 20 services, 5 performance stages, 13 products, 22
brands, 9 FAQs and 11 reviews.

Without this the database is empty, and the website falls back to its own
built-in HTML rather than reading from the portal.

> Safe to run more than once — every row is an upsert keyed on a stable id.
> Regenerate it from the portal's own data any time with
> `cd tests && node genseed.js`.

### 6. Connect the portal

Double-click `index.html`. Go to **Database** in the left sidebar, paste in
your Project URL and publishable key, and click **Test connection**, then
**Save**.

Sign in with the email and password from step 3.

That is it. You are running.

---

## Using it day to day

**Sign in.** Open `index.html` and sign in. It remembers you, so a refresh
lands you back where you were.

**Everything saves as you type.** There is no Save button on the editors. Type
in a box, wait half a second, and it is saved.

**Where things live:**

| Page | What it controls |
|---|---|
| Dashboard | Overview, quick actions, recent activity |
| Performance Builds | Completed jobs with dyno figures and photos |
| Services | The service cards on Performance and Services & Repairs |
| Performance Stages | Stage 1 through Stage 3 |
| Products & Brands | NF Additives range, preferred brands marquee |
| Homepage Editor | Hero, about section, statistics, call to action |
| Gallery Manager | The photos on your gallery page |
| Testimonials | Your Google reviews |
| FAQs | Questions on your FAQs page |
| Special Offers | Promotional banners |
| Contact Details | Numbers, email, address, hours, social links |
| Enquiries | Every lead, with WhatsApp and email replies |
| Website Appearance | Colours, fonts, logo |
| Analytics | Traffic and enquiry figures |
| Settings | Backups, password, danger zone |
| Database | Connection, sync, website code snippets |

### Adding a build

**Performance Builds → Add build.** Five tabs:

1. **Vehicle** — make, model, year, engine
2. **Tune & results** — stage, tuning type, and the before/after power figures
3. **Photos** — up to six; the first is the main image; drag to reorder
4. **Write-up** — what you did, and the work-done tick list
5. **Status** — publish it, feature it on the homepage, or archive it

A build stays a **draft** until you publish it. Drafts are never visible on the
website, and the database enforces that, not just the portal.

> Only publish power figures you can back with a dyno sheet or a V-Box run.
> These are the numbers customers will quote back to you.

### Handling an enquiry

Enquiries arrive in the **Enquiries** inbox from the website contact forms.

Each one carries the customer's name, phone, email, vehicle make and model,
registration and the service they asked for — the same fields the website form
collects.

Open one and you can reply on WhatsApp or by email with the message already
written, move it through **Unread → Contacted → Quoted → Booked → Completed**,
and add internal notes. Notes are only ever visible in this portal.

---

## No sample data

There is none. Every record in this portal is real content taken from your
existing website: 20 services, 5 performance stages, 13 NF Additives
products, 22 brands, 9 FAQs and your 11 Google reviews.

Builds and enquiries start empty. You log real jobs; the website posts real
leads. Nothing is invented anywhere.

---

## Backups

**Settings → Download backup** saves everything to a `.json` file. Do this
before any big change. **Restore** puts it back.

You can also export builds, enquiries and reviews as CSV for a spreadsheet.

---

## What is still to do on the website

Connecting this portal does not change venomracing.co.za on its own.

**Already done:** the contact forms on the website now post straight into this
portal. Any enquiry from `index.html` or `contact.html` appears in your inbox.

**Also done:** services, performance stages, products, brands, FAQs, reviews
and every contact detail now read from the database. Edit them in the portal
and the live site follows on the next page load.

**Not yet done:** the homepage's tabbed stage timeline and the gallery still
render their own HTML. Both are driven by page scripts that hold their own tab
and filter state, so they need a proper rebuild rather than in-place
hydration. The Performance page carries the portal-driven stage cards.

---

## Before launch — needs a person, not code

**Have the legal pages reviewed.** `privacy.html` and `terms.html` carry
working copy that describes what the site actually does, but neither has been
reviewed by a qualified attorney. South African POPIA obligations apply to
the enquiry data you now collect, and enquiries are processed by Supabase as
a third party — the privacy policy should say so. Both pages are linked from
the footer of all ten pages, so this is customer-facing.

This is flagged here rather than as a comment in the code because it is a
business decision, not a coding task.

## Troubleshooting

**"I signed in but everything is empty."**
You are not on the owner allowlist. Go back to step 4. The portal detects this
case specifically and shows you the exact SQL to run, with your email already
filled in.

**`ERROR: 42703: column "..." does not exist` when adding yourself as owner.**
The single quotes around your email address were removed along with the
placeholder. A bare word in SQL is a column name, not text. It must read
`lower('you@example.com')` — quotes included.

**The SQL failed with a syntax error near a dash.**
You ran the commented version through an editor that autocorrected the dashes.
Use `supabase-schema-plain.sql`.

**The SQL failed on the storage section.**
Some projects will not allow policies on `storage.objects`. Everything above
that point still ran. Create three buckets by hand in **Storage** —
`build-images`, `gallery` and `branding` — and mark each one public.

**The status pill says Offline and is orange.**
Your changes are saved locally and queued. They upload by themselves when the
connection comes back. Nothing is lost — you can close the laptop.

**"Invalid login credentials."**
Wrong password, or the account was never confirmed. Re-add the user in
Supabase with **Auto Confirm User** ticked.

**A photo will not upload.**
The storage buckets are missing or not public. Check **Storage** in Supabase.

---

## A note on the design

The portal deliberately uses the same carbon black, graphite and racing red as
the website, from the same token names in `assets/css/variables.css`. One
difference: the website loads Inter, Barlow Condensed and Bebas Neue from
Google Fonts, and the portal cannot, because it must keep working offline as a
single file. It asks for those faces and falls back to the system font when
they are not installed locally. Nothing breaks either way.
