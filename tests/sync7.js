/* services.html: six heading blocks and three named buttons come from the
   portal's pages.services, and nothing is blanked without it. */
const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const KEYS=['hero','categories','workshop','why','process','cta'];
const sections={};
KEYS.forEach(k=>{ sections[k]={eyebrow:'PORTAL '+k+' label',title:'PORTAL '+k+' heading',intro:'Portal '+k+' intro.'}; });
const DATA={'site_settings':[
  {key:'pages',value:{services:{ sections, buttons:{
     hero:{text:'PORTAL Hero Btn',link:'h.html'},
     cta1:{text:'PORTAL Cta One',link:'c1.html'},
     cta2:{text:'PORTAL Cta Two',link:'c2.html'} }}}}
]};
function run(page,mode){return new Promise(res=>{
  const html=fs.readFileSync(PATH_.join(SITE,page),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://venomracing.co.za/'+page,
    beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.open=()=>null; w.Element.prototype.scrollTo=function(){};
      w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
      w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}],this)}unobserve(){}disconnect(){}};
      w.fetch=(u)=>{
        if(mode==='down')  return Promise.reject(new Error('down'));
        if(mode==='empty') return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([])});
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','gallery.js','main.js','forms.js','navigation.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w.document),600);
});}

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== LIVE: portal copy reaches services.html ===');
  const d=await run('services.html','ok');

  t('all six blocks are present',()=>{
    const found=[...d.querySelectorAll('[data-vr-heading]')].map(b=>b.getAttribute('data-vr-heading'));
    const missing=KEYS.filter(k=>found.indexOf(k)<0);
    if(missing.length) throw new Error('missing '+missing.join(', '));});

  KEYS.forEach(k=>{
    t(k+': heading, label and intro replaced',()=>{
      const b=d.querySelector('[data-vr-heading="'+k+'"]');
      const h=b.querySelector('h1, h2, h3');
      if(h.textContent!=='PORTAL '+k+' heading') throw new Error('heading: '+h.textContent);
      const e=b.querySelector('.eyebrow');
      if(!e) throw new Error('eyebrow not created');
      if(e.textContent!=='PORTAL '+k+' label') throw new Error('label: '+e.textContent);
      const p=b.querySelector('p');
      if(!p||!/Portal /.test(p.textContent)) throw new Error('intro not applied');});
  });

  /* Three buttons across two blocks. Matching by name rather than by
     position is the whole point, so check each lands on its own. */
  t('each named button lands on its own element',()=>{
    const want={hero:['PORTAL Hero Btn','h.html'],cta1:['PORTAL Cta One','c1.html'],cta2:['PORTAL Cta Two','c2.html']};
    Object.keys(want).forEach(n=>{
      const a=d.querySelector('[data-vr-page-btn="'+n+'"]');
      if(!a) throw new Error('no button named '+n);
      if(a.textContent.trim()!==want[n][0]) throw new Error(n+' text: '+a.textContent.trim());
      if(a.getAttribute('href')!==want[n][1]) throw new Error(n+' href: '+a.getAttribute('href'));});});
  t('the two CTA buttons did not collide',()=>{
    const a=d.querySelector('[data-vr-page-btn="cta1"]').textContent.trim();
    const b=d.querySelector('[data-vr-page-btn="cta2"]').textContent.trim();
    if(a===b) throw new Error('both read "'+a+'"');});
  t('the hero intro sits above its button, not below',()=>{
    const box=d.querySelector('[data-vr-heading="hero"]');
    const kids=[...box.children];
    const p=box.querySelector('p'), btn=box.querySelector('[data-vr-page-btn="hero"]');
    if(kids.indexOf(p) > kids.indexOf(btn.closest('div'))) throw new Error('intro appended after the button');});

  console.log('\n=== FALLBACK: the page keeps its own words ===');
  for(const mode of ['down','empty']){
    const f=await run('services.html',mode);
    t('['+mode+'] hero intact',()=>{const b=f.querySelector('[data-vr-heading="hero"]');
      if(b.querySelector('h1').textContent!=='Services & Repairs') throw new Error(b.querySelector('h1').textContent);});
    t('['+mode+'] cta has no invented eyebrow',()=>{const b=f.querySelector('[data-vr-heading="cta"]');
      if(b.querySelector('.eyebrow')) throw new Error('created an empty eyebrow');});
    t('['+mode+'] all three buttons intact',()=>{
      const n=f.querySelectorAll('[data-vr-page-btn]').length;
      if(n!==3) throw new Error(n+' buttons');
      if(!/Contact Venom Racing/.test(f.querySelector('[data-vr-page-btn="cta2"]').textContent)) throw new Error('lost');});
    t('['+mode+'] service cards intact',()=>{const n=f.querySelectorAll('.service-card').length;
      if(n<8) throw new Error(n+' cards');});
  }

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
