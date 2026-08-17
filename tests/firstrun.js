const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../../websites/venom-racing-website');
const fs=require('fs'); const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
let fetchCalls=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://strauss3-coder.github.io/venom-racing-portal/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=(u,o)=>{ fetchCalls.push(String(u));
    if(String(u).includes('/auth/v1/health')) return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({})});
    return Promise.resolve({ok:false,status:400,json:()=>Promise.resolve({error_description:'Invalid login credentials'})});
  };
}});
const w=dom.window, D=w.document;
setTimeout(async()=>{
  const P=w.VenomPortal, {Cloud,Shell}=P;
  /* The portal now ships pre-configured, so simulate a build that is not. */
  Cloud.cfg=null; try{ w.localStorage.removeItem(Cloud.CFG); }catch(e){}
  let bad=0;
  const t=(n,f)=>{ try{ f(); console.log('  ok   '+n);}catch(e){console.log('  FAIL '+n+' -> '+e.message); bad++;} };
  const vis = id => !D.getElementById(id).classList.contains('hide');

  console.log('=== FIRST RUN (no project configured) ===');
  t('Cloud.on is false', ()=>{ if(Cloud.on) throw new Error('unexpectedly configured'); });
  Shell.lock();
  t('connect form is shown',   ()=>{ if(!vis('setupForm')) throw new Error('setupForm hidden'); });
  t('sign-in form is hidden',  ()=>{ if(vis('loginForm')) throw new Error('loginForm visible'); });
  t('forgot link is hidden',   ()=>{ if(vis('loginForgot')) throw new Error('visible'); });
  t('subtitle explains setup', ()=>{ const s=D.getElementById('loginSub').textContent;
     if(!/connect this portal/i.test(s)) throw new Error('got: '+s); });

  console.log('\n=== the old 405: signing in unconfigured ===');
  fetchCalls=[];
  D.getElementById('loginEmail').value='straussaldo3@gmail.com';
  D.getElementById('loginPass').value='whatever';
  D.getElementById('loginForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
  await new Promise(r=>setTimeout(r,300));
  t('no relative-URL request fired', ()=>{
     const rel=fetchCalls.filter(u=>!/^https:\/\/[a-z0-9]+\.supabase\.co/.test(u));
     if(rel.length) throw new Error('would have hit: '+rel.join(', ')); });
  t('error explains it is unconfigured', ()=>{
     const e=D.getElementById('loginErr').textContent;
     if(!/not connected to a Supabase project/i.test(e)) throw new Error('got: "'+e+'"'); });

  console.log('\n=== connecting with the real project URL ===');
  D.getElementById('setupUrl').value='https://znuozxezktzoeozffddk.supabase.co/rest/v1/';  // deliberately the wrong form
  D.getElementById('setupKey').value='sb_publishable_testkey_1234567890';
  D.getElementById('setupForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
  await new Promise(r=>setTimeout(r,400));
  t('URL normalised to bare origin', ()=>{
     if(Cloud.cfg.url!=='https://znuozxezktzoeozffddk.supabase.co') throw new Error('got '+Cloud.cfg.url); });
  t('health check hit the right path', ()=>{
     if(!fetchCalls.some(u=>u==='https://znuozxezktzoeozffddk.supabase.co/auth/v1/health'))
       throw new Error('calls: '+fetchCalls.join(', ')); });
  t('Cloud.on is now true', ()=>{ if(!Cloud.on) throw new Error('still not configured'); });
  t('sign-in form now shown',   ()=>{ if(!vis('loginForm')) throw new Error('still hidden'); });
  t('connect form now hidden',  ()=>{ if(vis('setupForm')) throw new Error('still visible'); });

  console.log('\n=== signing in with a bad password (should be a real auth error) ===');
  fetchCalls=[];
  D.getElementById('loginPass').value='wrongpass';
  D.getElementById('loginForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
  await new Promise(r=>setTimeout(r,300));
  t('request went to the real project', ()=>{
     if(!fetchCalls.some(u=>u.startsWith('https://znuozxezktzoeozffddk.supabase.co/auth/v1/token')))
       throw new Error('calls: '+fetchCalls.join(', ')); });
  t('shows a credentials error, not 405', ()=>{
     const e=D.getElementById('loginErr').textContent;
     if(/405/.test(e)) throw new Error('still 405');
     if(!/do not match an account/i.test(e)) throw new Error('got: "'+e+'"'); });

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
},2500);
