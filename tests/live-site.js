const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:1440,height:900} });
  const page = await ctx.newPage();
  const calls = [];
  page.on('response', r => { if (r.url().includes('/rest/v1/')) calls.push(r.url().split('/rest/v1/')[1].split('?')[0] + ' -> ' + r.status()); });
  let bad = 0;
  const t = (n,c,d)=>{ if(c) console.log('  ok   '+n); else { console.log('  FAIL '+n+(d?'  -> '+d:'')); bad++; } };

  console.log('=== performance.html on the LIVE site ===');
  await page.goto('https://venomracing.co.za/performance.html?cb='+Date.now(), {waitUntil:'networkidle'});
  await page.waitForTimeout(2500);
  const svc = await page.locator('.service-card__title').allTextContents();
  t('services rendered ('+svc.length+')', svc.length >= 12, svc.length+' cards');
  t('service copy is real', svc.some(s=>/ECU Calibration/.test(s)), svc.slice(0,2).join('|'));
  const brands = await page.locator('.brand-slide__name').allTextContents();
  t('brands rendered ('+brands.length+')', brands.length >= 22, brands.length);
  t('brand copy is real', brands.some(s=>/Dastek Unichip/.test(s)));
  const stages = await page.locator('[data-vr-stages] .service-card__title').allTextContents();
  t('stages rendered ('+stages.length+')', stages.length === 5, stages.length);
  const prods = await page.locator('.product-slide').count();
  t('products rendered ('+prods+' slides)', prods >= 26, prods);

  console.log('\n=== which endpoints did the page actually call? ===');
  [...new Set(calls)].forEach(c=>console.log('    '+c));
  t('page read website_services', calls.some(c=>c.startsWith('website_services')));
  t('page read website_sections', calls.some(c=>c.startsWith('website_sections')));
  t('page read website_seo',      calls.some(c=>c.startsWith('website_seo')));

  console.log('\n=== index.html: sections + SEO ===');
  await page.goto('https://venomracing.co.za/?cb='+Date.now(), {waitUntil:'networkidle'});
  await page.waitForTimeout(2500);
  const feats = await page.locator('.feature-card h4').allTextContents();
  t('feature cards rendered ('+feats.length+')', feats.length === 4, feats.join('|'));
  t('feature copy is real', feats.some(s=>/RMI Accredited/.test(s)));
  const steps = await page.locator('.process__step h4').allTextContents();
  t('process steps rendered ('+steps.length+')', steps.length === 5, steps.length);
  const trust = await page.locator('.trust-item').allTextContents();
  t('trust items rendered ('+trust.length+')', trust.length === 4, trust.length);
  const title = await page.title();
  t('SEO title applied', /Venom Racing/.test(title), title);
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  t('meta description present', !!desc && desc.length > 40, (desc||'').slice(0,50));
  const phone = await page.locator('a[href^="tel:"]').first().getAttribute('href');
  t('contact details applied', /2782852068/.test(phone||''), phone);
  const reviews = await page.locator('.rc-card').count();
  t('reviews rendered ('+reviews+')', reviews >= 11, reviews);

  console.log('\n=== faqs.html ===');
  await page.goto('https://venomracing.co.za/faqs.html?cb='+Date.now(), {waitUntil:'networkidle'});
  await page.waitForTimeout(2200);
  const qs = await page.locator('.accordion__trigger').count();
  t('FAQs rendered ('+qs+')', qs === 9, qs);
  await page.locator('.accordion__trigger').first().click();
  await page.waitForTimeout(200);
  t('accordion still opens', await page.locator('.accordion__item.is-open').count() === 1);

  await b.close();
  console.log('\nRESULT: ' + (bad ? 'FAIL='+bad : 'PASS'));
  process.exit(bad?1:0);
})();
