const PATH_=require('path');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const fs=require('fs'),glob=fs.readdirSync(SITE).filter(f=>f.endsWith('.html'));
const {JSDOM}=require('jsdom');
let bad=0; const add=(p,k,d)=>{ console.log('  '+p.padEnd(18)+k+'  '+d); bad++; };

glob.forEach(page=>{
  const dom=new JSDOM(fs.readFileSync(PATH_.join(SITE,page),'utf8'));
  const d=dom.window.document;

  if(!d.documentElement.getAttribute('lang')) add(page,'no lang attribute','');
  if(!d.querySelector('meta[name="viewport"]')) add(page,'no viewport meta','');
  if(!d.querySelector('h1')) add(page,'no h1','');
  if(d.querySelectorAll('h1').length>1) add(page,'multiple h1',d.querySelectorAll('h1').length);
  if(!d.querySelector('main')) add(page,'no <main> landmark','');

  d.querySelectorAll('img').forEach(el=>{
    if(el.getAttribute('alt')===null) add(page,'img without alt',(el.getAttribute('src')||'').slice(0,50));
  });
  d.querySelectorAll('button').forEach(el=>{
    const txt=(el.textContent||'').trim();
    if(!txt && !el.getAttribute('aria-label') && !el.getAttribute('title'))
      add(page,'button no name',el.outerHTML.slice(0,60));
  });
  d.querySelectorAll('a[href]').forEach(el=>{
    const txt=(el.textContent||'').trim();
    if(!txt && !el.getAttribute('aria-label') && !el.querySelector('img[alt]:not([alt=""])'))
      add(page,'link no name',el.getAttribute('href'));
  });
  d.querySelectorAll('input,select,textarea').forEach(el=>{
    if(el.type==='hidden') return;
    const id=el.getAttribute('id');
    const lab=id && d.querySelector('label[for="'+id.replace(/"/g,'')+'"]');
    if(!lab && !el.closest('label') && !el.getAttribute('aria-label') && !el.getAttribute('placeholder'))
      add(page,'control no label',el.outerHTML.slice(0,60));
  });
  d.querySelectorAll('iframe').forEach(el=>{
    if(!el.getAttribute('title')) add(page,'iframe no title',(el.getAttribute('src')||'').slice(0,40));
  });
  // video with sound must not autoplay; muted autoplay is fine
  d.querySelectorAll('video[autoplay]').forEach(el=>{
    if(!el.hasAttribute('muted')) add(page,'autoplay video unmuted','');
  });
  // skip link
  if(!d.querySelector('a[href="#main-content"]')) add(page,'no skip link','');
});
console.log('\n'+(bad?'ISSUES: '+bad:'no accessibility issues across '+glob.length+' pages'));
console.log('RESULT: '+(bad?'FAIL':'PASS'));
process.exit(bad?1:0);
