const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
// Simulate the REAL live condition: database reachable but every table empty.
function run(page){return new Promise(res=>{
  const html=fs.readFileSync(PATH_.join(SITE,page),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://venomracing.co.za/'+page,
    beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.open=()=>null;
      // jsdom implements neither; both are noise, not site defects.
      w.Element.prototype.scrollTo=function(){};
      w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
      w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}],this)}unobserve(){}disconnect(){}};
      w.fetch=()=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([]),text:()=>Promise.resolve('[]')});
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','reviews.js','main.js','forms.js','contact.js','gallery.js','stages.js','carousel.js','showcase.js','hero.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{ const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w.document),500);
});}
(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};
  console.log('=== LIVE CONDITION: database reachable, all tables empty ===');
  let d=await run('reviews.html');
  t('reviews page renders reviews',()=>{const g=d.querySelector('[data-reviews-grid]');
    const n=g?g.querySelectorAll('.rc-card').length:0;
    if(n<11) throw new Error('only '+n+' review cards rendered');});
  t('real reviewer names shown',()=>{const g=d.querySelector('[data-reviews-grid]');
    if(!/William Nalane/.test(g.textContent)) throw new Error('fallback reviews missing');});
  d=await run('index.html');
  t('homepage carousel renders',()=>{const v=d.querySelector('[data-rc-viewport]');
    const n=v?v.querySelectorAll('.rc-card').length:0;
    if(n<11) throw new Error('only '+n+' cards');});
  d=await run('performance.html');
  t('services still listed',()=>{const n=d.querySelectorAll('.service-card__title').length;
    if(n<12) throw new Error('only '+n+' service cards');});
  t('stages still listed',()=>{const g=d.querySelector('[data-vr-stages]');
    if(!/Software Only/.test(g.textContent)) throw new Error('stages missing');});
  t('no proven-results section',()=>{ if(d.querySelector('[data-vr-results]')) throw new Error('invented section still present'); });
  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
