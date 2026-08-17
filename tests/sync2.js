const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../../websites/venom-racing-website');
const fs=require('fs'),path=require('path'); const {JSDOM}=require('jsdom');
const ROOT=SITE;
const DATA={
  'site_settings':[{key:'contact',value:{phone:'011 555 1234',email:'new@venomracing.co.za',
    whatsapp:'+27 11 555 1234',address:'99 New Road',social:{facebook:'https://facebook.com/NEW'},
    hours:[{day:'Monday',open:'07:00',close:'19:00',closed:false}]}}],
  'website_services':[
    {id:'a',title:'PORTAL ECU Service',division:'Performance',description:'From the portal.',featured:true,sort_order:0},
    {id:'b',title:'PORTAL Turbo Service',division:'Performance',description:'Also portal.',featured:false,sort_order:1},
    {id:'c',title:'PORTAL Minor Service',division:'Services & Repairs',description:'Repairs side.',featured:true,sort_order:2}],
  'website_brands':[{id:'b1',name:'PORTAL Brand One',logo:''},{id:'b2',name:'PORTAL Brand Two',logo:''}],
  'website_products':[{id:'p1',name:'PORTAL Product',image:''}],
  'website_faqs':[
    {id:'f1',question:'PORTAL question one?',answer:'Portal answer one.',category:'General',featured:true},
    {id:'f2',question:'PORTAL question two?',answer:'Portal answer two.',category:'Booking',featured:false}],
  'testimonials':[{id:'t1',name:'PORTAL Reviewer',review:'Portal review text.',date_text:'today',sort_order:0}],
  'website_stages':[{id:'s1',name:'Stage 9',tagline:'PORTAL Stage Tagline',description:'Portal stage copy.',
     requirements:['Portal req one','Portal req two'],benefits:[],note:'Portal note.',sort_order:0}],
  'website_builds':[
    {id:'b1',title:'PORTAL Golf Build',make:'VW',model:'Golf R',year:2021,engine:'2.0 TSI',stage:'Stage 2',
     power_before:213,power_after:280,torque_before:380,torque_after:480,validation:'Dyno',featured:true,sort_order:0},
    {id:'b2',title:'Incomplete Build',make:'BMW',model:'M2',year:2020,engine:'S55',stage:'Stage 1',
     power_before:0,power_after:0,torque_before:0,torque_after:0,validation:'',featured:false,sort_order:1}]
};
function run(page,mode){
  return new Promise(res=>{
    const html=fs.readFileSync(path.join(ROOT,page),'utf8');
    const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
      url:'https://venomracing.co.za/'+page, beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.open=()=>null;
      w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}],this)}unobserve(){}disconnect(){}};
      w.fetch=(u)=>{
        if(mode==='down')  return Promise.reject(new Error('down'));
        if(mode==='empty') return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([])});
        if(mode==='500')   return Promise.resolve({ok:false,status:500,json:()=>Promise.resolve({})});
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
    const w=dom.window;
    ['utils.js','venom-supabase.js','animations.js','venom-content.js','reviews.js','main.js','forms.js','contact.js']
      .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
        const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(path.join(ROOT,'assets/js',f),'utf8');
        w.document.body.appendChild(sc); });
    w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
    setTimeout(()=>res(w),500);
  });
}
(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== PERFORMANCE PAGE hydrates from portal ===');
  let w=await run('performance.html','ok'), d=w.document;
  t('services replaced',   ()=>{const c=[...d.querySelectorAll('.service-card__title')].map(x=>x.textContent);
     if(!c.every(x=>x.startsWith('PORTAL'))) throw new Error(c.slice(0,3).join(' | '));});
  t('only Performance div',()=>{const c=[...d.querySelectorAll('.service-card__title')].map(x=>x.textContent);
     if(c.some(x=>/Minor Service/.test(x))) throw new Error('repairs leaked in');});
  t('icons preserved',     ()=>{const i=d.querySelector('.service-card__icon');
     if(!i||!i.querySelector('svg')) throw new Error('icon lost');});
  t('cards VISIBLE',       ()=>{const c=[...d.querySelectorAll('.service-card.slide-up')];
     const hidden=c.filter(x=>!x.classList.contains('is-visible'));
     if(hidden.length) throw new Error(hidden.length+' cards would be invisible');});
  t('brands replaced',     ()=>{const n=[...d.querySelectorAll('.brand-slide__name')].map(x=>x.textContent);
     if(!n.length||!n[0].startsWith('PORTAL')) throw new Error(n.slice(0,2).join('|'));});
  t('brand marquee duped', ()=>{const n=d.querySelectorAll('.brand-slide').length;
     if(n!==4) throw new Error('expected 4 (2 x2), got '+n);});
  t('products replaced',   ()=>{const n=d.querySelectorAll('.product-slide').length;
     if(n!==2) throw new Error('expected 2 (1 x2), got '+n);});

  console.log('\n=== FLAGSHIP: stages + proven results ===');
  t('stages replaced',     ()=>{const g=d.querySelector('[data-vr-stages]');
     if(!/PORTAL Stage Tagline/.test(g.textContent)) throw new Error(g.textContent.slice(0,80));});
  t('stage reqs rendered', ()=>{const g=d.querySelector('[data-vr-stages]');
     if(!/Portal req one/.test(g.textContent)) throw new Error('requirements missing');});
  t('stages VISIBLE',      ()=>{const c=[...d.querySelectorAll('[data-vr-stages] .slide-up')];
     if(c.some(x=>!x.classList.contains('is-visible'))) throw new Error('invisible cards');});
  t('results section shown',()=>{const s2=d.querySelector('[data-vr-results]');
     if(s2.hasAttribute('hidden')) throw new Error('still hidden');});
  t('only proven builds',  ()=>{const g=d.querySelector('[data-vr-results-grid]');
     if(/Incomplete Build/.test(g.textContent)) throw new Error('unproven build shown');
     if(!/PORTAL Golf Build/.test(g.textContent)) throw new Error('proven build missing');});
  t('gain computed',       ()=>{const g=d.querySelector('[data-vr-results-grid]');
     if(!/\+67 kW/.test(g.textContent)) throw new Error(g.textContent.slice(0,140));
     if(!/\+100 Nm/.test(g.textContent)) throw new Error('torque gain missing');});
  t('process section present',()=>{ if(!d.querySelector('#process')) throw new Error('missing'); });

  console.log('\n=== SERVICES PAGE shows the repairs division ===');
  d=(await run('services.html','ok')).document;
  t('repairs only',        ()=>{const c=[...d.querySelectorAll('.service-card__title')].map(x=>x.textContent);
     if(!c.length||c.some(x=>/ECU|Turbo/.test(x))) throw new Error(c.join('|'));});

  console.log('\n=== FAQS page + accordion still works after rebuild ===');
  w=await run('faqs.html','ok'); d=w.document;
  t('questions replaced',  ()=>{const q=[...d.querySelectorAll('.accordion__trigger')].map(x=>x.textContent.trim());
     if(!q.length||!q[0].startsWith('PORTAL')) throw new Error(q.slice(0,2).join('|'));});
  t('accordion opens',     ()=>{const tr=d.querySelector('.accordion__trigger');
     tr.dispatchEvent(new w.Event('click',{bubbles:true}));
     if(!tr.closest('.accordion__item').classList.contains('is-open')) throw new Error('did not open');
     if(tr.getAttribute('aria-expanded')!=='true') throw new Error('aria not updated');});
  t('accordion closes',    ()=>{const tr=d.querySelector('.accordion__trigger');
     tr.dispatchEvent(new w.Event('click',{bubbles:true}));
     if(tr.closest('.accordion__item').classList.contains('is-open')) throw new Error('did not close');});

  console.log('\n=== REVIEWS come from the portal ===');
  d=(await run('reviews.html','ok')).document;
  t('review text replaced',()=>{const g=d.querySelector('[data-reviews-grid]');
     if(!/PORTAL Reviewer/.test(g.textContent)) throw new Error(g.textContent.slice(0,80));});

  console.log('\n=== FALLBACK: original content must survive ===');
  for(const mode of ['down','empty','500']){
    const f=(await run('performance.html',mode)).document;
    t('['+mode+'] services intact',()=>{const c=[...f.querySelectorAll('.service-card__title')].map(x=>x.textContent);
       if(!c.some(x=>/ECU Calibration/.test(x))) throw new Error(c.slice(0,2).join('|'));});
    t('['+mode+'] brands intact', ()=>{const n=[...f.querySelectorAll('.brand-slide__name')].map(x=>x.textContent);
       if(!n.some(x=>/Dastek/.test(x))) throw new Error('brands lost');});
    t('['+mode+'] stages intact', ()=>{const g=f.querySelector('[data-vr-stages]');
       if(!/Software Only/.test(g.textContent)) throw new Error('stage fallback lost');});
    t('['+mode+'] results hidden',()=>{const s2=f.querySelector('[data-vr-results]');
       if(!s2.hasAttribute('hidden')) throw new Error('empty results section exposed');});
    const r=(await run('reviews.html',mode)).document;
    t('['+mode+'] reviews intact',()=>{const g=r.querySelector('[data-reviews-grid]');
       if(!/William Nalane/.test(g.textContent)) throw new Error('reviews lost');});
  }
  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
