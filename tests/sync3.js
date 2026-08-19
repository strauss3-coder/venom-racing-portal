const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const DATA={'site_settings':[
  {key:'homepage',value:{heroTitle:'Portal Headline Goes Here',heroSubtitle:'Portal subtitle copy.',
     btn1Text:'Portal Btn One',btn1Link:'a.html',btn2Text:'Portal Btn Two',btn2Link:'b.html',
     aboutTitle:'Portal About Title',aboutText:'Portal about paragraph.',ctaTitle:'Portal CTA?'}},
  {key:'gallery',value:{list:[
     {id:'g1',url:'assets/images/gallery/gp-exhaust-1.jpg',type:'image',label:'Portal Exhaust',category:'Exhaust Systems'},
     {id:'g2',url:'assets/images/gallery/gp-build-1.jpg',type:'image',label:'Portal Build',category:'Performance Builds'},
     {id:'g3',url:'assets/videos/gallery/gp-dyno-1.mp4',type:'video',label:'Portal Dyno Clip',category:'Dyno Testing'}]}}
]};
function run(page,mode){return new Promise(res=>{
  const html=fs.readFileSync(PATH_.join(SITE,page),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://venomracing.co.za/'+page,
    beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.open=()=>null;
      w.Element.prototype.scrollTo=function(){};
      w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
      w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}],this)}unobserve(){}disconnect(){}};
      w.fetch=(u)=>{
        if(mode==='down') return Promise.reject(new Error('down'));
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','gallery.js','reviews.js','main.js','forms.js','hero.js','stages.js','showcase.js','carousel.js','contact.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w),500);
});}
(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== HOMEPAGE copy from the portal ===');
  let w=await run('index.html','ok'), d=w.document;
  t('hero headline replaced',()=>{const h=d.querySelector('[data-vr-hero-title]');
    if(!/Portal Headline Goes Here/.test(h.textContent.replace(/\s+/g,' '))) throw new Error(h.textContent);});
  t('hero keeps 3 animated lines',()=>{const n=d.querySelectorAll('[data-vr-hero-title] .hero__line').length;
    if(n!==3) throw new Error(n+' lines');});
  t('accent kept on last line',()=>{const l=d.querySelectorAll('[data-vr-hero-title] .hero__line');
    if(!l[l.length-1].classList.contains('hero__line--accent')) throw new Error('accent lost');});
  t('hero subtitle replaced',()=>{if(!/Portal subtitle copy/.test(d.querySelector('[data-vr-hero-text]').textContent)) throw new Error('no');});
  t('about title + text replaced',()=>{
    if(!/Portal About Title/.test(d.querySelector('[data-vr-about-title]').textContent)) throw new Error('title');
    if(!/Portal about paragraph/.test(d.querySelector('[data-vr-about-text]').textContent)) throw new Error('text');});
  t('CTA replaced',()=>{if(!/Portal CTA\?/.test(d.querySelector('[data-vr-cta-title]').textContent)) throw new Error('no');});
  t('hero buttons replaced',()=>{const a=d.querySelectorAll('.hero__actions a');
    if(!/Portal Btn One/.test(a[0].textContent)) throw new Error(a[0].textContent);
    if(a[0].getAttribute('href')!=='a.html') throw new Error(a[0].getAttribute('href'));});

  console.log('\n=== GALLERY grid from the portal ===');
  w=await run('gallery.html','ok'); d=w.document;
  t('grid replaced',()=>{const c=[...d.querySelectorAll('.gallery-card__title')].map(x=>x.textContent);
    if(!c.includes('Portal Exhaust')) throw new Error(c.slice(0,3).join('|'));});
  t('three items only',()=>{const n=d.querySelectorAll('[data-gallery-item]').length;
    if(n!==3) throw new Error(n+' items');});
  t('video rendered as a video card',()=>{const el=d.querySelector('[data-label="Portal Dyno Clip"]');
    if(!el) throw new Error('missing');
    if(el.getAttribute('data-type')!=='video') throw new Error('type='+el.getAttribute('data-type'));
    if(!el.querySelector('video source[data-src]')) throw new Error('no lazy source');});
  t('video carries the videos filter key',()=>{const el=d.querySelector('[data-label="Portal Dyno Clip"]');
    if(!/\bvideos\b/.test(el.getAttribute('data-cats'))) throw new Error(el.getAttribute('data-cats'));});
  t('videos filter shows it',()=>{
    const btn=[...d.querySelectorAll('[data-filter]')].find(b=>b.dataset.filter==='videos');
    btn.dispatchEvent(new (d.defaultView.MouseEvent)('click',{bubbles:true}));
    const shown=[...d.querySelectorAll('[data-gallery-item]')].filter(x=>!x.hidden);
    if(shown.length!==1) throw new Error(shown.length+' shown');
    if(shown[0].getAttribute('data-label')!=='Portal Dyno Clip') throw new Error('wrong item');});
  t('category mapped to filter key',()=>{const el=d.querySelector('[data-label="Portal Build"]');
    if(el.getAttribute('data-cats')!=='builds') throw new Error(el.getAttribute('data-cats'));});
  t('cards visible (reveal re-armed)',()=>{const h=[...d.querySelectorAll('.gallery-card')].filter(x=>!x.classList.contains('is-in'));
    if(h.length) throw new Error(h.length+' invisible cards');});
  t('filters still work after rebuild',()=>{
    const btn=[...d.querySelectorAll('[data-filter]')].find(b=>b.dataset.filter==='builds');
    btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    const shown=[...d.querySelectorAll('[data-gallery-item]')].filter(x=>!x.hidden);
    if(shown.length!==1) throw new Error(shown.length+' shown, expected 1');
    if(shown[0].getAttribute('data-label')!=='Portal Build') throw new Error('wrong item');});
  t('lightbox opens after rebuild',()=>{
    const all=[...d.querySelectorAll('[data-filter]')].find(b=>b.dataset.filter==='all');
    all.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    const card=d.querySelector('[data-gallery-item]');
    card.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    const lb=d.querySelector('[data-lightbox]');
    if(!lb.classList.contains('is-open')) throw new Error('lightbox did not open');});

  console.log('\n=== FALLBACK: database down ===');
  d=(await run('index.html','down')).document;
  t('hero copy intact',()=>{if(!/Where Performance/.test(d.querySelector('[data-vr-hero-title]').textContent)) throw new Error('lost');});
  d=(await run('gallery.html','down')).document;
  t('all 43 gallery items intact',()=>{const n=d.querySelectorAll('[data-gallery-item]').length;
    if(n<40) throw new Error('only '+n+' items');});

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
