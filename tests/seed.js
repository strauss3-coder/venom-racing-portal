const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const fs=require('fs'); const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');

function boot(handler){
  return new Promise(res=>{
    const calls=[];
    const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.io/p/',beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
      w.fetch=(u,o)=>{ calls.push({url:String(u),method:(o&&o.method)||'GET',body:o&&o.body});
        return handler(String(u),o||{}); };
    }});
    setTimeout(()=>res({w:dom.window,calls}),2500);
  });
}
// raw() reads res.text() then JSON.parse, so the mock must serialise.
const ok  = (body)=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(body),text:()=>Promise.resolve(JSON.stringify(body===undefined?null:body))});
const table=(u)=>String(u).split('/rest/v1/')[1].split('?')[0];

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== EMPTY DB + owner -> publishes local content ===');
  let r=await boot((u,o)=>{
    if(u.includes('rpc/is_owner')) return ok(true);
    if(u.includes('/rest/v1/')) return o.method==='POST'? ok([]) : ok([]);
    return ok({});
  });
  let {Cloud,Store}=r.w.VenomPortal;
  Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  let out=await Cloud.ensureSeeded();
  t('reports seeded',   ()=>{ if(!out.seeded) throw new Error(JSON.stringify(out)); });
  t('pushed every table',()=>{
    const posted=r.calls.filter(c=>c.method==='POST'&&/\/rest\/v1\//.test(c.url)).map(c=>table(c.url));
    ['services','stages','products','brands','faqs','testimonials','site_settings']
      .forEach(x=>{ if(!posted.includes(x)) throw new Error('never pushed '+x); });
  });
  t('row count matches seed',()=>{
    const n=['services','stages','products','brands','faqs','testimonials'].reduce((a,k)=>a+Store.list(k).length,0);
    if(n!==80) throw new Error('expected 80 local rows, got '+n);
  });

  console.log('\n=== DB ALREADY HAS CONTENT -> must NOT overwrite ===');
  r=await boot((u,o)=>{
    if(u.includes('rpc/is_owner')) return ok(true);
    if(u.includes('/rest/v1/services')) return ok([{id:'remote_1',title:'Owner edited this'}]);
    if(u.includes('/rest/v1/')) return ok([]);
    return ok({});
  });
  Cloud=r.w.VenomPortal.Cloud;
  Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  out=await Cloud.ensureSeeded();
  t('refuses to seed',  ()=>{ if(out.skipped!=='remote-has-content') throw new Error(JSON.stringify(out)); });
  t('wrote nothing',    ()=>{ const w=r.calls.filter(c=>c.method==='POST'&&/\/rest\/v1\/(services|stages|site_settings)/.test(c.url));
     if(w.length) throw new Error(w.length+' writes leaked'); });

  console.log('\n=== NOT AN OWNER -> must not write ===');
  r=await boot((u)=>{ if(u.includes('rpc/is_owner')) return ok(false); return ok([]); });
  Cloud=r.w.VenomPortal.Cloud;
  Cloud.setSession({access_token:'x',refresh_token:'y',email:'n@x.com',at:Date.now()});
  out=await Cloud.ensureSeeded();
  t('skips as not-owner',()=>{ if(out.skipped!=='not-owner') throw new Error(JSON.stringify(out)); });
  t('wrote nothing',     ()=>{ const w=r.calls.filter(c=>c.method==='POST'&&/\/rest\/v1\/(services|site_settings)/.test(c.url));
     if(w.length) throw new Error(w.length+' writes leaked'); });

  console.log('\n=== SIGNED OUT -> must not write ===');
  r=await boot(()=>ok([]));
  Cloud=r.w.VenomPortal.Cloud;
  out=await Cloud.ensureSeeded();
  t('skips as not-authed',()=>{ if(out.skipped!=='not-authed') throw new Error(JSON.stringify(out)); });

  console.log('\n=== IDEMPOTENT: second call after seeding does nothing ===');
  r=await boot((u,o)=>{
    if(u.includes('rpc/is_owner')) return ok(true);
    if(u.includes('/rest/v1/')) return ok([]);
    return ok({});
  });
  Cloud=r.w.VenomPortal.Cloud;
  Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  await Cloud.ensureSeeded();
  const first=r.calls.length;
  Cloud._seeding=true;                       // simulate an in-flight run
  const second=await Cloud.ensureSeeded();
  t('guards concurrent runs',()=>{ if(second.skipped!=='not-authed'&&!second.skipped) throw new Error(JSON.stringify(second)); });
  Cloud._seeding=false;
  t('no runaway growth',()=>{ if(r.calls.length>first+2) throw new Error('extra calls: '+(r.calls.length-first)); });

  /* The live database carried a gallery row holding an empty list, which
     hard-replaced the built-in library on every pull. The manager was then
     permanently empty however many photos and videos the website had. */
  console.log('\n=== EMPTY GALLERY ROW does not wipe the built-in library ===');
  const pullWith = (settings) => boot((u,o)=>{
    if(u.includes('rpc/is_owner')) return ok(true);
    if(u.includes('/rest/v1/site_settings')) return o.method==='POST'? ok([]) : ok(settings);
    if(u.includes('/rest/v1/services'))      return o.method==='POST'? ok([]) : ok([{id:'s_x'}]);
    if(u.includes('/rest/v1/')) return o.method==='POST'? ok([]) : ok([]);
    return ok({});
  });

  r=await pullWith([{key:'gallery',value:{list:[]}}]);
  ({Cloud,Store}=r.w.VenomPortal);
  Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  await Cloud.pullAll({force:true});
  t('empty row keeps the library',()=>{ const n=Store.list('gallery').length;
    if(n<40) throw new Error('only '+n+' items'); });
  t('videos survive too',()=>{ const v=Store.list('gallery').filter(g=>g.type==='video').length;
    if(!v) throw new Error('no videos'); });
  t('backfill is recorded',()=>{ if(!Store.data.meta.gallerySeeded) throw new Error('flag not set'); });

  console.log('\n=== a real list from the database still wins ===');
  r=await pullWith([{key:'gallery',value:{list:[{id:'g1',url:'a.jpg',type:'image',label:'Only One'}]}}]);
  ({Cloud,Store}=r.w.VenomPortal);
  Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  await Cloud.pullAll({force:true});
  t('stored list replaces the seed',()=>{ const g=Store.list('gallery');
    if(g.length!==1||g[0].label!=='Only One') throw new Error(g.length+' items'); });

  console.log('\n=== once recorded, an emptied gallery stays empty ===');
  r=await pullWith([{key:'gallery',value:{list:[]}},{key:'meta',value:{gallerySeeded:true}}]);
  ({Cloud,Store}=r.w.VenomPortal);
  Cloud.setSession({access_token:'x',refresh_token:'y',email:'o@x.com',at:Date.now()});
  await Cloud.pullAll({force:true});
  t('deliberate removal respected',()=>{ const n=Store.list('gallery').length;
    if(n!==0) throw new Error(n+' items came back'); });

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
