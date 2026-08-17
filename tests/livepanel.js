const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const ok=(b)=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(b),text:()=>Promise.resolve(JSON.stringify(b))});

function boot(handler){return new Promise(res=>{
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.io/p/',beforeParse(w){
    w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
    w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
    w.fetch=(u,o)=>handler(String(u),o||{});
  }});
  setTimeout(()=>res(dom.window),2500);
});}

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};
  const render=async(w)=>{
    const {Portal,Modules}=w.VenomPortal;
    const view=w.document.getElementById('view');
    const mod=Portal.byId.dashboard;
    view.innerHTML=mod.render.call(mod,{});
    await Modules.paintLivePanel();
    return w.document.getElementById('livePanel');
  };

  console.log('=== SIGNED OUT ===');
  let w=await boot(()=>ok([]));
  let p=await render(w);
  t('asks you to sign in',()=>{ if(!/Sign in to see/.test(p.textContent)) throw new Error(p.textContent.slice(0,60)); });

  console.log('\n=== DATABASE UNREACHABLE ===');
  w=await boot(()=>Promise.reject(new Error('down')));
  w.VenomPortal.Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  p=await render(w);
  t('warns, and says the site is still up',()=>{
    if(!/Cannot reach your database/.test(p.textContent)) throw new Error('no warning');
    if(!/website is still up/.test(p.textContent)) throw new Error('does not reassure about the site');});

  console.log('\n=== NOTHING PUBLISHED (the current real state) ===');
  w=await boot((u)=>ok([]));
  w.VenomPortal.Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  p=await render(w);
  t('flags sections not published',()=>{ if(!/not published yet/.test(p.textContent)) throw new Error(p.textContent.slice(0,90)); });
  t('shows 0 live of 20 for services',()=>{ if(!/0 live of 20/.test(p.textContent)) throw new Error('no counts'); });
  t('offers the fix',()=>{ if(!/Publish changes/.test(w.document.getElementById('view').textContent)) throw new Error('no publish button'); });

  console.log('\n=== FULLY PUBLISHED ===');
  const full={website_services:20,website_stages:5,website_products:13,website_brands:22,website_faqs:9,website_builds:0,testimonials:11};
  w=await boot((u)=>{
    const tb=String(u).split('/rest/v1/')[1];
    if(!tb) return ok({});
    const name=tb.split('?')[0];
    if(name in full) return ok(Array.from({length:full[name]},(_,i)=>({id:'r'+i})));
    return ok([]);
  });
  w.VenomPortal.Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  p=await render(w);
  t('reports up to date',()=>{ if(!/up to date/.test(p.textContent)) throw new Error(p.textContent.slice(0,120)); });
  t('counts the live records',()=>{ if(!/80 records are live/.test(p.textContent)) throw new Error(p.textContent.slice(0,140)); });
  t('names the live domain',()=>{ if(!/venomracing\.co\.za/.test(p.textContent)) throw new Error('domain missing'); });
  t('links to the live site',()=>{ const a=w.document.querySelector('#view a[href^="https://venomracing"]');
    if(!a) throw new Error('no link to the site'); });
  t('builds row shows nothing yet',()=>{ if(!/Nothing added yet/.test(p.textContent)) throw new Error('builds row wrong'); });

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
