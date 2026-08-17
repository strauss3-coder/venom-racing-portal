const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');

/* "Performance Builds" on venomracing.co.za is a gallery filter, not a
   content type. Nothing in the portal may model it as one. Prose that
   happens to contain the word is fine; code and schema are not. */
const CODE = /\b(builds|website_builds|buildForm|buildCard|buildAction|buildMenu|filterBuilds|repaintBuilds|exportBuilds|build-images|powerAfter|powerBefore|gainAvg|bestGain)\b/;
// Allowed: English prose, and the gallery's own "builds" filter category,
// which is what the real website actually has.
const PROSE_OK = /performance builds|engine builds|tailored builds|builds on the previous|builds a formatted|builds the markup|no builds or offers|data-cats="[^"]*builds|data-filter="builds"|Performance Builds'/i;

let bad=0;
const fail=(f,line,txt)=>{ console.log('  FAIL '+f+':'+line+'  '+txt.trim().slice(0,90)); bad++; };

function scan(file){
  const txt=fs.readFileSync(file,'utf8');
  txt.split('\n').forEach((l,i)=>{
    if(!CODE.test(l)) return;
    if(PROSE_OK.test(l)) return;
    fail(PATH_.relative(PATH_.dirname(PORTAL),file), i+1, l);
  });
}
[PATH_.join(PORTAL,'index.html'),
 PATH_.join(PORTAL,'supabase-schema-plain.sql'),
 PATH_.join(PORTAL,'supabase-schema.sql'),
 PATH_.join(PORTAL,'supabase-seed-content.sql')].forEach(scan);
fs.readdirSync(SITE).filter(f=>f.endsWith('.html')).forEach(f=>scan(PATH_.join(SITE,f)));
fs.readdirSync(PATH_.join(SITE,'assets/js')).forEach(f=>scan(PATH_.join(SITE,'assets/js',f)));

// The module registry must not carry builds, offers or analytics.
const dom=new JSDOM(fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8'),
  {runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.io/p/',beforeParse(w){
    w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
    w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
    w.fetch=()=>Promise.reject(new Error('offline'));
  }});
setTimeout(()=>{
  const {Portal,Store,MAP}=dom.window.VenomPortal;
  ['builds','offers','analytics'].forEach(id=>{
    if(Portal.byId[id]) fail('module registry',0,id+' is still registered');
    if(MAP[id])         fail('MAP',0,id+' still mapped to a table');
    if(Array.isArray(Store.data[id])) fail('Store',0,id+' collection still seeded');
  });
  const ids=Portal.modules.map(m=>m.id);
  console.log('  modules: '+ids.join(', '));
  console.log('\n'+(bad?'RESULT: FAIL='+bad:'RESULT: PASS'));
  process.exit(bad?1:0);
},2500);
