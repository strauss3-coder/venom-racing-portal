const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const fs=require('fs'); const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.reject(new Error('offline'));
}});
setTimeout(()=>{
  const {Cloud,BUSINESS}=dom.window.VenomPortal;
  const want='https://znuozxezktzoeozffddk.supabase.co';
  const cases=[
    'https://znuozxezktzoeozffddk.supabase.co/rest/v1/',
    'https://znuozxezktzoeozffddk.supabase.co/rest/v1',
    'https://znuozxezktzoeozffddk.supabase.co/auth/v1',
    'https://znuozxezktzoeozffddk.supabase.co/storage/v1/',
    'https://znuozxezktzoeozffddk.supabase.co/',
    'https://znuozxezktzoeozffddk.supabase.co',
    '  https://znuozxezktzoeozffddk.supabase.co/rest/v1/  ',
  ];
  let bad=0;
  cases.forEach(c=>{
    const got=Cloud.normaliseUrl(c);
    const ok=got===want;
    if(!ok) bad++;
    console.log((ok?'  ok   ':'  FAIL ')+JSON.stringify(c)+' -> '+got);
  });
  // the shell must now show the configured initial, not a stray letter
  const marks=['#bootMark','#loginMark','#sbMark'].map(s=>{
    const el=dom.window.document.querySelector(s); return el?el.textContent:'(missing)';
  });
  console.log('\nmarks: '+marks.join(', ')+'  (expected '+BUSINESS.initial+' x3)');
  if(marks.some(m=>m!==BUSINESS.initial)) bad++;
  console.log('\nRESULT: '+(bad?'FAIL':'PASS'));
  process.exit(bad?1:0);
},2500);
