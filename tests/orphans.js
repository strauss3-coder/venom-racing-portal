const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const portal=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const schema=fs.readFileSync(PATH_.join(PORTAL,'supabase-schema-plain.sql'),'utf8');
const siteJs=fs.readdirSync(PATH_.join(SITE,'assets/js'))
  .map(f=>fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8')).join('\n');
let bad=0;
const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

console.log('=== SETTINGS DOCUMENTS: consumed or declared portal-only ===');
const keys=(portal.match(/const SETTINGS_KEYS = \[([^\]]+)\]/)||[])[1]
  .split(',').map(s=>s.trim().replace(/'/g,''));
// meta is portal bookkeeping; appearance themes the portal only.
const PORTAL_ONLY={meta:'portal bookkeeping (version, lastSaved, siteLive)',
                   appearance:'themes the portal itself - labelled Portal Appearance'};
keys.forEach(k=>{
  const consumed=new RegExp('settings\\.'+k+'\\b').test(siteJs);
  if(consumed){ console.log('  ok   '+k.padEnd(12)+'consumed by the website'); return; }
  if(PORTAL_ONLY[k]){ console.log('  ok   '+k.padEnd(12)+'portal-only: '+PORTAL_ONLY[k]); return; }
  console.log('  FAIL '+k.padEnd(12)+'written but nothing reads it'); bad++;
});

console.log('\n=== DATABASE TABLES: each must back something ===');
const tables=[...schema.matchAll(/create table if not exists public\.(\w+)/g)].map(m=>m[1]);
const INFRA={site_settings:'settings documents',activity_log:'portal activity feed',
             page_sections:'repeated card lists, read via website_sections',
             seo:'per-page meta, read via website_seo',
             portal_owners:'owner allowlist',enquiries:'website enquiry inbox'};
tables.forEach(tb=>{
  if(INFRA[tb]){ console.log('  ok   '+tb.padEnd(14)+INFRA[tb]); return; }
  const inPortal=new RegExp("table:'"+tb+"'").test(portal);
  const view='website_'+tb;
  const viaView=siteJs.includes(view);
  const viaTable=siteJs.includes("'"+tb+"?select");
  if(inPortal&&(viaView||viaTable)){
    console.log('  ok   '+tb.padEnd(14)+'portal writes it, website reads '+(viaView?view:tb+' directly')); return; }
  console.log('  FAIL '+tb.padEnd(14)+'portal='+inPortal+' siteReads='+readBySite); bad++;
});

console.log('\n=== VIEWS: each must be read by the website ===');
[...schema.matchAll(/create or replace view public\.(\w+)/g)].map(m=>m[1]).forEach(v=>{
  if(siteJs.includes(v)) console.log('  ok   '+v);
  else { console.log('  FAIL '+v+' is never read'); bad++; }
});

console.log('\n=== STORAGE BUCKETS: each must be used ===');
const buckets=[...(schema.match(/values \(([^;]+)on conflict/s)||[''])[0]
  .matchAll(/'([a-z-]+)','[a-z-]+',true/g)].map(m=>m[1]);
buckets.forEach(b=>{
  const used=new RegExp("buckets\\.(gallery|branding)|'"+b+"'").test(portal);
  if(used) console.log('  ok   '+b);
  else { console.log('  FAIL bucket '+b+' unused'); bad++; }
});
t('no bucket for a deleted module',()=>{ if(buckets.includes('build-images')) throw new Error('build-images survives'); });

console.log('\n=== LEFTOVERS FROM DELETED MODULES ===');
[['builds','table'],['offers','table'],['website_builds','view'],['build-images','bucket']].forEach(([n,kind])=>{
  t('no '+kind+' '+n+' in schema',()=>{ if(new RegExp('\\b'+n+'\\b').test(schema)) throw new Error('present'); });
});
t('no analytics settings doc',()=>{ if(keys.includes('analytics')) throw new Error('still a settings key'); });

console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
process.exit(bad?1:0);
