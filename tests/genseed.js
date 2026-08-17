const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const fs=require('fs'); const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.io/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.reject(new Error('offline'));
}});
setTimeout(()=>{
  const {Store,MAP,Cloud}=dom.window.VenomPortal;
  const q = v => v===null||v===undefined ? 'null' : "'"+String(v).replace(/'/g,"''")+"'";
  const val = v => {
    if(v===null||v===undefined) return 'null';
    if(typeof v==='boolean') return v?'true':'false';
    if(typeof v==='number')  return Number.isFinite(v)?String(v):'null';
    if(Array.isArray(v)||typeof v==='object') return q(JSON.stringify(v))+'::jsonb';
    return q(v);
  };
  const out=[];
  const COLS=['services','stages','products','brands','faqs','testimonials'];
  let total=0;
  COLS.forEach(key=>{
    const m=MAP[key], rows=Store.list(key).filter(r=>!r.demo);
    if(!rows.length){ out.push('/* '+key+': nothing to seed */'); return; }
    const mapped=rows.map((r,i)=>m.to(r,i));
    const cols=Object.keys(mapped[0]);
    out.push('insert into public.'+m.table+' ('+cols.join(', ')+') values');
    out.push(mapped.map(r=>'  ('+cols.map(c=>val(r[c])).join(', ')+')').join(',\n')+'');
    out.push('on conflict (id) do update set');
    out.push('  '+cols.filter(c=>c!=='id'&&c!=='created_at').map(c=>c+' = excluded.'+c).join(',\n  ')+';');
    out.push('');
    total+=rows.length;
  });
  // settings documents
  const settings=['homepage','contact','appearance','gallery','meta'];
  out.push('insert into public.site_settings (key, value) values');
  out.push(settings.map(k=>'  ('+q(k)+', '+q(JSON.stringify(Cloud.settingsValue(k)))+'::jsonb)').join(',\n')+'');
  out.push('on conflict (key) do update set value = excluded.value, updated_at = now();');
  out.push('');
  const sql=out.join('\n');
  if(sql.includes('--')) { console.error('REFUSED: output contains a double dash'); process.exit(1); }
  fs.writeFileSync(PATH_.join(PORTAL,'supabase-seed-content.sql'), sql);
  console.log('content rows generated:',total,'+ 6 settings docs');
  COLS.forEach(k=>console.log('   ',k.padEnd(14), Store.list(k).filter(r=>!r.demo).length));
  process.exit(0);
},2500);
