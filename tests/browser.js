const { chromium } = require('playwright');
const BASE = process.env.PORTAL_URL || 'http://127.0.0.1:8100/index.html';
const MODULES = ['dashboard','services','stages','products','faqs','homepage','gallery',
                 'testimonials','contact','enquiries','appearance','settings','database'];
let bad = 0, consoleErrors = [], pageErrors = [];
const t = (n, cond, detail) => {
  if (cond) console.log('    ok   ' + n);
  else { console.log('    FAIL ' + n + (detail ? '  -> ' + detail : '')); bad++; }
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // Open the app UI without a real password: a stored session is all the
  // shell checks. Network calls still fail, which is the offline path.
  await ctx.addInitScript(() => {
    localStorage.setItem('venom_racing_session', JSON.stringify({
      access_token: 'test', refresh_token: 'test', email: 'qa@test.local', at: Date.now()
    }));
  });
  // Block Supabase entirely: a fake token would otherwise get a real 401,
  // trigger the refresh path and clear the session. Offline is also the
  // harsher UI case, since every module renders from local state.
  await ctx.route('**://*.supabase.co/**', r => r.abort());
  const page = await ctx.newPage();
  await page.route('**/index.html*', async r => {
    const h = { ...r.request().headers(), 'cache-control': 'no-cache', pragma: 'no-cache' };
    await r.continue({ headers: h });
  });
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2600);

  const appOpen = await page.locator('#app').evaluate(el => el.classList.contains('on')).catch(() => false);
  t('portal opened past the login gate', appOpen);
  if (!appOpen) { console.log('cannot continue'); await browser.close(); process.exit(1); }

  const scrimCount = () => page.locator('#modalRoot .modal-scrim').count();
  const openCount  = () => page.locator('#modalRoot .modal-scrim.on').count();

  console.log('\n=== PART 1: 20 navigation rounds across all 13 modules ===');
  for (let r = 0; r < 20; r++) {
    for (const id of MODULES) {
      await page.evaluate(i => { location.hash = '#/' + i; }, id);
      await page.waitForTimeout(18);
    }
  }
  await page.waitForTimeout(400);
  t('no overlay left after 260 navigations', (await scrimCount()) === 0, (await scrimCount()) + ' scrims');
  t('body not scroll-locked', !(await page.locator('body').evaluate(b => b.classList.contains('modal-open'))));

  console.log('\n=== one click opens one modal, one click closes it (per module) ===');
  for (const id of MODULES) {
    await page.evaluate(i => { location.hash = '#/' + i; }, id);
    await page.waitForTimeout(260);
    const add = page.locator('#view [data-act="add"]').first();
    if (await add.count() === 0) continue;
    const before = await scrimCount();
    await add.click();
    await page.waitForTimeout(220);
    const opened = (await scrimCount()) - before;
    t(id + ': ONE click opens ONE dialog', opened === 1, opened + ' dialogs');
    if (opened >= 1) {
      await page.locator('#modalRoot .modal-scrim').last().locator('.modal-h [data-close]').click();
      await page.waitForTimeout(60);
      t(id + ': ONE click closes it', (await openCount()) === 0, (await openCount()) + ' still open');
      await page.waitForTimeout(400);
      t(id + ': no residue', (await scrimCount()) === 0);
    }
  }

  console.log('\n=== enquiry: open -> delete -> confirm -> closed ===');
  await page.evaluate(() => {
    const P = window.VenomPortal;
    P.Store.insert('enquiries', { id: P.U.id('e'), name: 'Browser QA', phone: '0820000000',
      email: 'qa@x.com', make: 'VW', model: 'Golf', registration: '', service: 'Dyno Tuning',
      vehicle: 'VW Golf', notes: '', source: 'Website form', status: 'unread', message: 'test' });
    location.hash = '#/enquiries';
  });
  await page.waitForTimeout(320);
  await page.locator('#view [data-eact="view"]').first().click();
  await page.waitForTimeout(220);
  t('enquiry dialog opened', (await openCount()) === 1);
  await page.locator('#modalRoot [data-del]').click();
  await page.waitForTimeout(220);
  t('confirm stacked on top', (await openCount()) === 2, (await openCount()) + ' open');
  await page.locator('#modalRoot [data-yes]').click();
  await page.waitForTimeout(500);
  t('BOTH dialogs gone after confirming', (await scrimCount()) === 0, (await scrimCount()) + ' left');
  t('page interactive again', !(await page.locator('body').evaluate(b => b.classList.contains('modal-open'))));
  const gone = await page.evaluate(() => !window.VenomPortal.Store.list('enquiries').some(e => e.name === 'Browser QA'));
  t('record actually deleted', gone);

  console.log('\n=== PART 2: spam clicking and races ===');
  await page.evaluate(() => { location.hash = '#/services'; });
  await page.waitForTimeout(300);
  // Count every scrim ever created, not just those still present: clicks
  // after the first land on the overlay and legitimately close it.
  await page.evaluate(() => {
    window.__made = 0;
    const mr = document.getElementById('modalRoot');
    new MutationObserver(ms => ms.forEach(m => { window.__made += m.addedNodes.length; }))
      .observe(mr, { childList: true });
  });
  const addBtn = page.locator('#view [data-act="add"]').first();
  for (let i = 0; i < 8; i++) await addBtn.click({ force: true, delay: 5 }).catch(() => {});
  await page.waitForTimeout(400);
  const made = await page.evaluate(() => window.__made);
  const spam = await scrimCount();
  t('8 rapid clicks created at most one dialog (created ' + made + ')', made <= 1, made + ' created');
  t('never left with a pile of dialogs', spam <= 1, spam + ' present');
  for (let i = 0; i < spam + 2; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(70); }
  await page.waitForTimeout(450);
  t('Escape cleared every dialog', (await scrimCount()) === 0, (await scrimCount()) + ' left');
  t('body unlocked after spam', !(await page.locator('body').evaluate(b => b.classList.contains('modal-open'))));

  console.log('\n=== navigate while a modal is open ===');
  await page.locator('#view [data-act="add"]').first().click();
  await page.waitForTimeout(200);
  await page.evaluate(() => { location.hash = '#/faqs'; });
  await page.waitForTimeout(500);
  t('no overlay survives navigation', (await scrimCount()) === 0, (await scrimCount()) + ' left');
  t('destination is clickable', await page.locator('#view [data-act="add"]').first().isEnabled());

  console.log('\n=== double-click a row action ===');
  await page.evaluate(() => { location.hash = '#/services'; });
  await page.waitForTimeout(300);
  const edit = page.locator('#view [data-sact="edit"]').first();
  await edit.dblclick();
  await page.waitForTimeout(350);
  const dbl = await scrimCount();
  t('double-click does not open two editors', dbl === 1, dbl + ' dialogs');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);

  console.log('\n=== click outside to close ===');
  await page.locator('#view [data-act="add"]').first().click();
  await page.waitForTimeout(220);
  await page.mouse.click(8, 8);
  await page.waitForTimeout(80);
  t('outside click closes first time', (await openCount()) === 0);
  await page.waitForTimeout(400);

  console.log('\n=== browser Back after navigating ===');
  await page.evaluate(() => { location.hash = '#/products'; });
  await page.waitForTimeout(260);
  await page.goBack();
  await page.waitForTimeout(320);
  t('Back leaves a working page', (await page.locator('#view').innerHTML()).length > 60);
  t('no overlay after Back', (await scrimCount()) === 0);

  console.log('\n=== reload mid-session ===');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2600);
  t('reload lands back in the app', await page.locator('#app').evaluate(el => el.classList.contains('on')));
  t('no overlay after reload', (await scrimCount()) === 0);

  console.log('\n=== responsive: modal usable at 375px ===');
  await page.setViewportSize({ width: 375, height: 780 });
  await page.evaluate(() => { location.hash = '#/services'; });
  await page.waitForTimeout(320);
  await page.locator('#view [data-act="add"]').first().click();
  await page.waitForTimeout(280);
  const fits = await page.locator('#modalRoot .modal').first()
    .evaluate(el => el.getBoundingClientRect().width <= window.innerWidth + 1).catch(() => false);
  t('modal fits the 375px viewport', fits);
  const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  t('no horizontal overflow at 375px', noHScroll);
  await page.locator('#modalRoot .modal-h [data-close]').click();
  await page.waitForTimeout(450);
  t('closes on mobile first tap', (await scrimCount()) === 0);

  console.log('\n=== console hygiene ===');
  const realErrors = consoleErrors.filter(e => !/Failed to load resource|net::ERR|401|Unauthorized|offline/i.test(e));
  t('no unexpected console errors', realErrors.length === 0, realErrors.slice(0, 3).join(' | '));
  t('no uncaught page exceptions', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

  await browser.close();
  console.log('\nRESULT: ' + (bad ? 'FAIL=' + bad : 'PASS'));
  process.exit(bad ? 1 : 0);
})();
