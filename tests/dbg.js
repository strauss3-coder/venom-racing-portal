const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch(); const c=await b.newContext();
  await c.addInitScript(()=>{ localStorage.setItem('venom_racing_session',
    JSON.stringify({access_token:'test',refresh_token:'test',email:'qa@test.local',at:Date.now()})); });
  const p=await c.newPage();
  p.on('pageerror',e=>console.log('PAGEERROR:',e.message));
  await p.goto('http://127.0.0.1:8100/index.html',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3000);
  console.log(await p.evaluate(()=>{
    const P=window.VenomPortal;
    return {
      hasPortal: !!P,
      authed: P && P.Cloud.authed,
      cloudOn: P && P.Cloud.on,
      sessionInLS: !!localStorage.getItem('venom_racing_session'),
      keys: Object.keys(localStorage),
      appClass: document.getElementById('app').className,
      loginHidden: document.getElementById('login').classList.contains('hide'),
      bootDone: document.getElementById('boot')?document.getElementById('boot').className:'(none)'
    };
  }));
  await b.close();
})();
