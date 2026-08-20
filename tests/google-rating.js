/* Reads the Google rating for the workshop off its Business Profile.
 *
 * The portal carries this number in Contact Details, because it drifts as
 * new reviews come in and nothing else on the site knows it. Run this when
 * you want to check the stored value is still right, then update it in the
 * portal - this script only reads.
 *
 *   node google-rating.js
 *
 * Google renders Maps entirely in script and does not promise any of these
 * selectors, so treat a null result as "look it up by hand", not as "the
 * rating is gone".
 */
const { chromium } = require('playwright');

const QUERY = 'Venom Racing 58 Industrial Cres eMalahleni';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 1000 },
    locale: 'en-ZA',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
               '(KHTML, like Gecko) Chrome/126.0 Safari/537.36'
  });
  const page = await ctx.newPage();
  await page.goto('https://www.google.com/maps/search/' + encodeURIComponent(QUERY),
    { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Consent wall, when one appears.
  for (const sel of ['button:has-text("Accept all")', 'button:has-text("Reject all")']) {
    try {
      const el = page.locator(sel).first();
      if (await el.count()) { await el.click({ timeout: 3000 }); await page.waitForTimeout(4000); break; }
    } catch (e) { /* no wall */ }
  }

  // Open the first result so the detail panel renders.
  try {
    const first = page.locator('a[href*="/maps/place/"]').first();
    if (await first.count()) { await first.click({ timeout: 8000 }); await page.waitForTimeout(6000); }
  } catch (e) { /* already on a place page */ }

  const out = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    // The rating sits in an aria-label of the form "4.6 stars".
    const stars = [...document.querySelectorAll('[aria-label]')]
      .map(e => e.getAttribute('aria-label'))
      .filter(a => /^\s*[\d.,]+\s*stars?\s*$/i.test(a || ''));
    const m = stars.length ? String(stars[0]).match(/[\d.,]+/) : null;
    return {
      name: h1 ? h1.innerText.trim() : null,
      rating: m ? m[0].replace(',', '.') : null,
      reviews: (document.querySelector('div.F7nice') || {}).innerText || null,
      url: location.href
    };
  });

  console.log(JSON.stringify(out, null, 2));
  if (!out.rating) console.log('\nNo rating found. Check the listing by hand and update the portal.');
  else console.log('\nStored in the portal under Contact Details > Google rating.');

  await browser.close();
})();
