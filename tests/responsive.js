const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../../websites/venom-racing-website');
const NARROWEST=320;
let bad=0;
const flag=(w,m)=>{ console.log('  ['+w+'] '+m); bad++; };

function cssOf(dir){
  if(dir===PORTAL){ const s=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
    return s.slice(s.indexOf('<style>'), s.indexOf('</style>')); }
  return fs.readdirSync(PATH_.join(SITE,'assets/css')).filter(f=>f.endsWith('.css'))
    .map(f=>fs.readFileSync(PATH_.join(SITE,'assets/css',f),'utf8')).join('\n');
}
[['portal',PORTAL],['website',SITE]].forEach(([name,dir])=>{
  const css=cssOf(dir);
  // fixed widths wider than the narrowest device, outside a media query
  const stripped=css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g,'');
  const widths=[...stripped.matchAll(/(?<!max-|min-)\bwidth:\s*(\d{3,})px/g)].map(m=>+m[1]);
  widths.filter(w=>w>NARROWEST).forEach(w=>flag(name,'fixed width '+w+'px outside a media query'));
  // min-width on containers can force overflow
  [...stripped.matchAll(/min-width:\s*(\d{3,})px/g)].map(m=>+m[1])
    .filter(w=>w>NARROWEST).forEach(w=>{
      if(!/min-width:\s*0/.test(stripped)) flag(name,'min-width '+w+'px could overflow at 320px');
    });
  // horizontal overflow guard on body
  if(!/overflow-x:\s*hidden/.test(css)) flag(name,'no overflow-x guard on body');
  // tables need a scroll wrapper
  const hasWrap=/overflow-x:\s*auto/.test(css);
  if(/table/.test(css) && !hasWrap) flag(name,'tables present with no overflow-x:auto wrapper');
  // breakpoint coverage
  const bps=[...new Set([...css.matchAll(/max-width:\s*(\d+)px/g)].map(m=>+m[1]))].sort((a,b)=>a-b);
  console.log('  '+name+' breakpoints: '+(bps.join(', ')||'none'));
  if(!bps.some(b=>b<=640)) flag(name,'no breakpoint at or below 640px');
});
// min-width:0 on grid/flex children prevents the classic blowout
const pcss=cssOf(PORTAL);
if(!/minmax\(0,\s*1fr\)/.test(pcss)) flag('portal','grids not using minmax(0,1fr) - children can blow out');
console.log('\nRESULT: '+(bad?'RISKS='+bad:'PASS'));
process.exit(0);
