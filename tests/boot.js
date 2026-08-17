const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');

const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/',
  beforeParse(w){
    w.matchMedia = () => ({ matches:false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} });
    w.scrollTo = () => {};
    w.HTMLCanvasElement.prototype.getContext = () => ({ drawImage(){}, fillRect(){} });
    w.fetch = () => Promise.reject(new Error('offline in test'));
    w.addEventListener('error', e => errors.push('window.error: ' + (e.error && e.error.stack || e.message)));
    w.addEventListener('unhandledrejection', e => errors.push('unhandledrejection: ' + (e.reason && e.reason.message || e.reason)));
  }
});
const w = dom.window;

setTimeout(() => {
  const P = w.VenomPortal;
  if(!P){ console.log('FAIL: window.VenomPortal missing'); console.log(errors.join('\n')); process.exit(1); }

  console.log('=== BOOT ===');
  console.log('business    :', P.BUSINESS.name, '/', P.BUSINESS.slug);
  console.log('storage key :', P.DB.KEY);
  console.log('modules     :', P.Portal.modules.length, '->', P.Portal.modules.map(m=>m.id).join(', '));

  console.log('\n=== SEED ===');
  const d = P.Store.data;
  ['builds','services','stages','products','brands','faqs','testimonials','offers','enquiries','gallery'].forEach(k=>{
    console.log((k+'            ').slice(0,13), Array.isArray(d[k]) ? d[k].length : '(doc)');
  });

  console.log('\n=== STATS ===');
  const st = P.Store.stats();
  console.log(JSON.stringify(st));

  console.log('\n=== RENDER EVERY MODULE ===');
  let bad = 0;
  P.Portal.modules.forEach(m=>{
    try{
      const out = m.render.call(m, {});
      if(typeof out !== 'string' || !out.length) throw new Error('render returned '+typeof out);
      if(/undefined|NaN|\[object Object\]/.test(out)){
        const hit = out.match(/.{0,60}(undefined|NaN|\[object Object\]).{0,60}/);
        console.log('  WARN ' + m.id + ' -> suspicious output: ...' + hit[0].replace(/\n/g,' ') + '...');
        bad++;
      } else {
        console.log('  ok   ' + m.id + ' (' + out.length + ' chars)');
      }
    }catch(e){ console.log('  FAIL ' + m.id + ' -> ' + e.message); bad++; }
  });

  console.log('\n=== MAP round-trip ===');
  Object.keys(P.MAP).forEach(k=>{
    const rec = (P.Store.data[k]||[])[0];
    if(!rec) { console.log('  -- ' + k + ' (no record to test)'); return; }
    try{
      const row = P.MAP[k].to(rec,0);
      const back = P.MAP[k].from(row);
      if(back.id !== rec.id) throw new Error('id lost');
      console.log('  ok   ' + k + ' -> table ' + P.MAP[k].table + ', ' + Object.keys(row).length + ' cols');
    }catch(e){ console.log('  FAIL ' + k + ' -> ' + e.message); bad++; }
  });

  console.log('\n=== ERRORS ===');
  const real = errors.filter(e=>!/offline in test/.test(e));
  console.log(real.length ? real.join('\n') : 'none');
  console.log('\nRESULT: ' + (bad===0 && real.length===0 ? 'PASS' : 'ISSUES=' + bad));
  process.exit(bad===0 && real.length===0 ? 0 : 1);
}, 2500);
