/* performance.html: eleven heading blocks and the closing button come from
   the portal's pages.performance, and nothing is blanked without it. */
const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const KEYS=['hero','ecu','unichip','suppliers','dyno','exhaust','additives','turbo','stages','process','tuningportal'];
const sections={};
KEYS.forEach(k=>{ sections[k]={eyebrow:'PORTAL '+k+' label',title:'PORTAL '+k+' heading',intro:'Portal '+k+' intro.'}; });
const DATA={'site_settings':[
  {key:'pages',value:{performance:{ btnText:'PORTAL Quote', btnLink:'zz.html', sections }}}
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
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','main.js','forms.js','showcase.js','carousel.js','stages.js','navigation.js']
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

  console.log('=== LIVE: every block takes its words from the portal ===');
  const d=await run('performance.html','ok');

  t('all eleven blocks are present',()=>{
    const found=[...d.querySelectorAll('[data-vr-heading]')].map(b=>b.getAttribute('data-vr-heading'));
    const missing=KEYS.filter(k=>found.indexOf(k)<0);
    if(missing.length) throw new Error('missing '+missing.join(', '));});

  KEYS.forEach(k=>{
    t(k+': heading and intro replaced',()=>{
      const b=d.querySelector('[data-vr-heading="'+k+'"]');
      if(!b) throw new Error('block missing');
      const h=b.querySelector('h1, h2, h3');
      if(!h) throw new Error('no heading element');
      if(h.textContent!=='PORTAL '+k+' heading') throw new Error('heading is: '+h.textContent);
      const e=b.querySelector('.eyebrow');
      if(!e) throw new Error('eyebrow not created');
      if(e.textContent!=='PORTAL '+k+' label') throw new Error('label is: '+e.textContent);
      const p=b.querySelector('p');
      if(!p||!/Portal /.test(p.textContent)) throw new Error('intro not applied');});
  });

  t('the Unichip block keeps its own sub-heading',()=>{
    const b=d.querySelector('[data-vr-heading="unichip"]');
    const h3=[...b.querySelectorAll('h3')].map(x=>x.textContent);
    if(!h3.some(x=>/5-Map Switch Architecture/.test(x)))
      throw new Error('h3 overwritten: '+h3.join('|'));});
  t('closing button replaced',()=>{const a=d.querySelector('[data-vr-page-btn]');
    if(!/PORTAL Quote/.test(a.textContent)) throw new Error(a.textContent);
    if(a.getAttribute('href')!=='zz.html') throw new Error(a.getAttribute('href'));});

  console.log('\n=== FALLBACK: the page keeps its own words ===');
  for(const mode of ['down','empty']){
    const f=await run('performance.html',mode);
    t('['+mode+'] hero intact',()=>{const b=f.querySelector('[data-vr-heading="hero"]');
      if(b.querySelector('h1').textContent!=='Performance') throw new Error('lost');});
    t('['+mode+'] dyno copy intact',()=>{const b=f.querySelector('[data-vr-heading="dyno"]');
      if(!/Measured, Not Guessed/.test(b.querySelector('.eyebrow').textContent)) throw new Error('lost');});
    t('['+mode+'] suppliers h3 intact',()=>{const b=f.querySelector('[data-vr-heading="suppliers"]');
      if(!/Preferred Performance Brands/.test(b.querySelector('h3').textContent)) throw new Error('lost');});
    t('['+mode+'] ecu has no invented eyebrow',()=>{const b=f.querySelector('[data-vr-heading="ecu"]');
      if(b.querySelector('.eyebrow')) throw new Error('created an empty eyebrow');});
    t('['+mode+'] button intact',()=>{const a=f.querySelector('[data-vr-page-btn]');
      if(!/Request a Quote/.test(a.textContent)) throw new Error(a.textContent);});
  }

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
