/* reviews.html: page copy from the portal, both CTA pairs driven by one
   setting each, and the Google reviews link taken from Contact Details
   rather than a constant baked into reviews.js. */
const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const GLINK='https://maps.app.goo.gl/PORTALLINK';
const DATA={'site_settings':[
  {key:'contact',value:{ googleRating:'4.9', social:{ google:GLINK } }},
  {key:'pages',value:{reviews:{
    searchText:'PORTAL Search Here',
    labels:{empty:'PORTAL Nothing Found'},
    buttons:{google:{text:'PORTAL Read Them'},leave:{text:'PORTAL Write One'}},
    sections:{hero:{eyebrow:'PORTAL Voices',title:'PORTAL Reviews Heading',intro:'Portal reviews intro.'}}
  }}}],
 'testimonials':[
  {id:'t1',name:'Portal Reviewer',review:'Portal review text.',date_text:'today',sort_order:0}]
};
function run(mode){return new Promise(res=>{
  const html=fs.readFileSync(PATH_.join(SITE,'reviews.html'),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://venomracing.co.za/reviews.html',
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
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','reviews.js','main.js','forms.js','navigation.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w.document),700);
});}

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== LIVE: page copy ===');
  const d=await run('ok');
  t('hero heading replaced',()=>{const b=d.querySelector('[data-vr-heading="hero"]');
    if(b.querySelector('h1').textContent!=='PORTAL Reviews Heading') throw new Error(b.querySelector('h1').textContent);});
  t('search placeholder replaced',()=>{const e=d.querySelector('[data-vr-search]');
    if(e.placeholder!=='PORTAL Search Here') throw new Error(e.placeholder);});
  t('empty message replaced',()=>{const e=d.querySelector('[data-vr-label="empty"]');
    if(e.textContent!=='PORTAL Nothing Found') throw new Error(e.textContent);});
  t('star rating replaced',()=>{const e=d.querySelector('[data-vr-rating]');
    if(e.textContent!=='4.9') throw new Error(e.textContent);});

  console.log('\n=== one setting drives both copies of each button ===');
  t('both Read buttons relabelled',()=>{
    const els=[...d.querySelectorAll('[data-vr-page-btn="google"]')];
    if(els.length!==2) throw new Error(els.length+' found, expected 2 (top and bottom)');
    els.forEach((e,i)=>{ if(e.textContent.trim()!=='PORTAL Read Them') throw new Error('copy '+i+': '+e.textContent.trim()); });});
  t('both Leave buttons relabelled',()=>{
    const els=[...d.querySelectorAll('[data-vr-page-btn="leave"]')];
    if(els.length!==2) throw new Error(els.length+' found');
    els.forEach((e,i)=>{ if(e.textContent.trim()!=='PORTAL Write One') throw new Error('copy '+i+': '+e.textContent.trim()); });});

  console.log('\n=== the Google link comes from the portal, not the script ===');
  t('all four CTAs point at the portal link',()=>{
    const els=[...d.querySelectorAll('[data-google-reviews]')];
    if(els.length!==4) throw new Error(els.length+' CTAs');
    els.forEach((a,i)=>{
      if(a.getAttribute('href')!==GLINK) throw new Error('CTA '+i+' -> '+a.getAttribute('href'));});});
  t('they still open in a new tab',()=>{
    const a=d.querySelector('[data-google-reviews]');
    if(a.getAttribute('target')!=='_blank'||!/noopener/.test(a.getAttribute('rel')||'')) throw new Error('lost target/rel');});

  console.log('\n=== FALLBACK ===');
  for(const mode of ['down','empty']){
    const f=await run(mode);
    t('['+mode+'] heading intact',()=>{const b=f.querySelector('[data-vr-heading="hero"]');
      if(!/Trusted by Performance Enthusiasts/.test(b.querySelector('h1').textContent)) throw new Error('lost');});
    t('['+mode+'] rating intact',()=>{
      if(f.querySelector('[data-vr-rating]').textContent!=='4.6') throw new Error('lost');});
    t('['+mode+'] buttons intact',()=>{
      const els=[...f.querySelectorAll('[data-vr-page-btn="google"]')];
      if(els.length!==2||!/Read All Google Reviews/.test(els[0].textContent)) throw new Error('lost');});
    t('['+mode+'] CTAs still have a link',()=>{
      const a=f.querySelector('[data-google-reviews]');
      if(!/maps\.app\.goo\.gl/.test(a.getAttribute('href')||'')) throw new Error(a.getAttribute('href'));});
  }

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
