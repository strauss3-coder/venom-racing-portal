/* faqs.html: page copy from the portal, and every FAQ category gets a group
   on the page - including ones added after the markup was written. */
const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const mk=cats=>({'site_settings':[{key:'pages',value:{faqs:{
     labels:{closing:'PORTAL Closing Line'},
     buttons:{contact:{text:'PORTAL Contact',link:'zz.html'}},
     sections:{hero:{eyebrow:'PORTAL Q',title:'PORTAL FAQ Heading',intro:'Portal faq intro.'}}}}}],
   'website_faqs':cats.map((c,i)=>({id:'f'+i,question:'Q_'+i+'?',answer:'Answer '+i+'.',category:c}))});
function run(mode,cats){return new Promise(res=>{
  const DATA=mk(cats||['General','ECU Tuning & Unichip','Fabrication & Conversions','Booking & Process']);
  const html=fs.readFileSync(PATH_.join(SITE,'faqs.html'),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://venomracing.co.za/faqs.html',
    beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.open=()=>null; w.Element.prototype.scrollTo=function(){};
      w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}],this)}unobserve(){}disconnect(){}};
      w.fetch=(u)=>{
        if(mode==='down')  return Promise.reject(new Error('down'));
        if(mode==='empty') return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([])});
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','main.js','forms.js','navigation.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w.document),700);
});}
const groupHeads=d=>[...d.querySelectorAll('h3')].map(h=>h.textContent.trim())
  .filter(x=>x&&!['Venom Racing','Quick Links','Company','Legal'].includes(x));

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== LIVE: page copy ===');
  let d=await run('ok');
  t('hero heading replaced',()=>{const b=d.querySelector('[data-vr-heading="hero"]');
    if(b.querySelector('h1').textContent!=='PORTAL FAQ Heading') throw new Error(b.querySelector('h1').textContent);
    if(!/Portal faq intro/.test(b.querySelector('p').textContent)) throw new Error('intro not created');});
  t('closing line replaced',()=>{
    if(d.querySelector('[data-vr-label="closing"]').textContent!=='PORTAL Closing Line') throw new Error('not set');});
  t('closing button replaced',()=>{const a=d.querySelector('[data-vr-page-btn="contact"]');
    if(!/PORTAL Contact/.test(a.textContent)) throw new Error(a.textContent);
    if(a.getAttribute('href')!=='zz.html') throw new Error(a.getAttribute('href'));});

  /* The page ships with four groups. A fifth category used to be dropped
     entirely - heading, block and every question in it. */
  console.log('\n=== CATEGORIES BEYOND THE FOUR THE PAGE SHIPS WITH ===');
  d=await run('ok',['General','ECU','Fab','Booking','Warranty','Shipping']);
  t('a group is created for each extra category',()=>{
    const h=groupHeads(d);
    if(h.length!==6) throw new Error(h.length+' groups: '+h.join('|'));
    if(h.indexOf('Warranty')<0||h.indexOf('Shipping')<0) throw new Error(h.join('|'));});
  t('their questions actually appear',()=>{
    const txt=d.body.textContent;
    if(!/Q_4\?/.test(txt)||!/Q_5\?/.test(txt)) throw new Error('questions missing');});
  t('no group is created twice',()=>{
    const h=groupHeads(d);
    const dupes=h.filter((x,i)=>h.indexOf(x)!==i);
    if(dupes.length) throw new Error('duplicated: '+dupes.join(','));});
  t('created groups are real accordions',()=>{
    const n=d.querySelectorAll('.accordion').length;
    if(n!==6) throw new Error(n+' accordions');});

  console.log('\n=== FEWER CATEGORIES THAN THE PAGE SHIPS WITH ===');
  d=await run('ok',['General','ECU']);
  t('surplus groups are emptied, not left stale',()=>{
    const h=groupHeads(d);
    if(h.length!==2) throw new Error(h.length+' headings: '+h.join('|'));});

  console.log('\n=== FALLBACK ===');
  for(const mode of ['down','empty']){
    const f=await run(mode);
    t('['+mode+'] heading intact',()=>{const b=f.querySelector('[data-vr-heading="hero"]');
      if(b.querySelector('h1').textContent!=='Frequently Asked Questions') throw new Error('lost');});
    t('['+mode+'] four groups intact',()=>{const h=groupHeads(f);
      if(h.length!==4) throw new Error(h.length+' groups');});
    t('['+mode+'] questions intact',()=>{const n=f.querySelectorAll('.accordion__item').length;
      if(n!==9) throw new Error(n+' questions');});
  }

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
