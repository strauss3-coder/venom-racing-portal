const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../../websites/venom-racing-website');
const fs=require('fs'); const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
  url:'https://strauss3-coder.github.io/venom-racing-portal/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({})});
}});
setTimeout(()=>{
  const w=dom.window, D=w.document, {Cloud,Shell}=w.VenomPortal;
  let bad=0; const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};
  const vis=id=>!D.getElementById(id).classList.contains('hide');
  console.log('=== FRESH DEVICE (empty localStorage) ===');
  t('auto-connected',        ()=>{ if(!Cloud.on) throw new Error('not configured'); });
  t('url correct',           ()=>{ if(Cloud.cfg.url!=='https://znuozxezktzoeozffddk.supabase.co') throw new Error(Cloud.cfg.url); });
  t('key present',           ()=>{ if(!/^sb_publishable_/.test(Cloud.cfg.key)) throw new Error('missing'); });
  Shell.lock();
  t('goes straight to sign-in', ()=>{ if(!vis('loginForm')) throw new Error('sign-in hidden'); });
  t('connect step hidden',      ()=>{ if(vis('setupForm')) throw new Error('setup still shown'); });
  t('still requires a password',()=>{ if(Cloud.authed) throw new Error('opened without auth!'); });
  console.log('\nRESULT: '+(bad?'FAIL':'PASS')); process.exit(bad?1:0);
},2500);
