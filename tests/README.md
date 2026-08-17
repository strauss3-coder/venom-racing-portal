# Verification suites

Automated checks for the portal and the website. They drive the real files
in a DOM, so they fail when the code is wrong rather than when a comment
changes.

## Running

Requires Node and `jsdom`:

    npm install jsdom
    ./verify-all.sh

Both repos are located relative to this folder. Override with `PORTAL_DIR`
and `SITE_DIR` if your layout differs.

## What each suite covers

| Suite | Covers |
|---|---|
| `boot.js` | Portal boots, all modules register and render, MAP round-trips, no console errors |
| `crud.js` | Mounts, build lifecycle, filters, every editor modal, CSV and JSON exports |
| `url.js` | Supabase URL normalisation, brand marks from config |
| `firstrun.js` | Unconfigured portal shows the connect step and never fires a relative request |
| `preconf.js` | A fresh device auto-connects but still demands a sign-in |
| `a11y.js` | Accessible names across the rendered output of every module |
| `web.js` | Both website forms map every field and preserve the WhatsApp hand-off |
| `sync.js` | Contact details hydrate; nothing blanks when the database is unavailable |
| `sync2.js` | Services, brands, products, FAQs, reviews, stages and results hydrate, stay visible, and fall back |
| `genseed.js` | Regenerates `supabase-seed-content.sql` from the portal's own seed |

`verify-all.sh` runs all of them, probes the live database for RLS leaks,
and checks both deployments respond.

## Regenerating the content seed

    node genseed.js

Rewrites `supabase-seed-content.sql` from `SEED()`, so the file and the
portal can never drift apart.
