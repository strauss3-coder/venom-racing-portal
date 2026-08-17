const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const fs=require('fs'); const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.github.io/p/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.resolve({ok:true,status:200,json:()=>Promise.resolve({})});
}});
setTimeout(()=>{
  const w=dom.window,D=w.document,{Portal}=w.VenomPortal;
  const view=D.getElementById('view');
  const findings={};
  const add=(k,m,d)=>{ (findings[k]=findings[k]||[]).push(m+'  '+d); };
  Portal.modules.forEach(mod=>{
    view.innerHTML = mod.render.call(mod,{});
    // inputs must have a label, aria-label, or placeholder
    view.querySelectorAll('input,select,textarea').forEach(el=>{
      if(el.type==='hidden') return;
      const id=el.id, lab=id && view.querySelector('label[for="'+id.replace(/"/g,"")+'"]');
      const wrapped = el.closest('label');
      if(!lab && !wrapped && !el.getAttribute('aria-label') && !el.placeholder)
        add('form control with no accessible name',mod.id,el.outerHTML.slice(0,70));
    });
    // icon-only buttons must have a name
    view.querySelectorAll('button').forEach(el=>{
      const txt=(el.textContent||'').trim();
      if(!txt && !el.getAttribute('aria-label') && !el.getAttribute('title'))
        add('icon button with no accessible name',mod.id,el.outerHTML.slice(0,70));
    });
    // images need alt
    view.querySelectorAll('img').forEach(el=>{
      if(el.getAttribute('alt')===null) add('img without alt',mod.id,el.outerHTML.slice(0,70));
    });
    // tables need headers
    view.querySelectorAll('table').forEach(t=>{
      if(!t.querySelector('th')) add('table without th',mod.id,'');
    });
  });
  const keys=Object.keys(findings);
  console.log('=== RENDERED-MARKUP ACCESSIBILITY ===');
  if(!keys.length) console.log('  no issues across all '+Portal.modules.length+' modules');
  keys.forEach(k=>{
    console.log('  '+k+': '+findings[k].length);
    findings[k].slice(0,6).forEach(x=>console.log('     '+x));
  });
  process.exit(0);
},2500);
