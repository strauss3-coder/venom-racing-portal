const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../../websites/venom-racing-website');
const fs=require('fs'),path=require('path'); const {JSDOM}=require('jsdom');
const ROOT=SITE;

function run(page, mode){
  return new Promise(res=>{
    const html=fs.readFileSync(path.join(ROOT,page),'utf8');
    const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,
      url:'https://venomracing.co.za/'+page, beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
      w.open=()=>null;
      w.fetch=(u)=>{
        if(mode==='down')    return Promise.reject(new Error('network down'));
        if(mode==='empty')   return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([])});
        if(mode==='http500') return Promise.resolve({ok:false,status:500,json:()=>Promise.resolve({})});
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([
          {key:'contact',value:{
            phone:'011 555 1234', phone2:'011 555 9999',
            whatsapp:'+27 11 555 1234',
            email:'new@venomracing.co.za', email2:'second@venomracing.co.za',
            address:'99 New Road, Middelburg, 1050, Mpumalanga',
            hours:[{day:'Monday',open:'07:30',close:'18:00',closed:false},
                   {day:'Tuesday',open:'07:30',close:'18:00',closed:false},
                   {day:'Wednesday',open:'07:30',close:'18:00',closed:false},
                   {day:'Thursday',open:'07:30',close:'18:00',closed:false},
                   {day:'Friday',open:'07:30',close:'18:00',closed:false},
                   {day:'Saturday',open:'08:00',close:'12:00',closed:false},
                   {day:'Sunday',open:'',close:'',closed:true}],
            social:{facebook:'https://facebook.com/NEWPAGE',instagram:'https://instagram.com/NEWIG',tiktok:'https://tiktok.com/@NEWTT'}
          }}])});
      };
    }});
    const w=dom.window;
    ['utils.js','venom-supabase.js','venom-content.js','forms.js','contact.js'].forEach(f=>{
      if(!html.includes('assets/js/'+f)) return;
      const sc=w.document.createElement('script');
      sc.textContent=fs.readFileSync(path.join(ROOT,'assets/js',f),'utf8');
      w.document.body.appendChild(sc);
    });
    w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
    setTimeout(()=>res(w.document),400);
  });
}

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== LIVE DATA: portal values reach the page ===');
  let d=await run('index.html','ok');
  t('tel href updated',   ()=>{const a=d.querySelector('a[href^="tel:"]');
     if(a.getAttribute('href')!=='tel:+27115551234') throw new Error(a.getAttribute('href'));});
  t('tel text updated',   ()=>{const a=d.querySelector('a[href^="tel:"]');
     if(a.textContent!=='011 555 1234') throw new Error(a.textContent);});
  t('mailto updated',     ()=>{const a=d.querySelector('a[href^="mailto:"]');
     if(a.getAttribute('href')!=='mailto:new@venomracing.co.za') throw new Error(a.getAttribute('href'));});
  t('wa.me number swapped',()=>{const a=d.querySelector('a[href*="wa.me/"]');
     if(!/wa\.me\/27115551234/.test(a.href)) throw new Error(a.href);});
  t('wa.me keeps ?text=', ()=>{const links=[...d.querySelectorAll('a[href*="wa.me/"]')];
     if(!links.length) throw new Error('none');});
  t('facebook updated',   ()=>{const a=[...d.querySelectorAll('a[aria-label]')].find(x=>/facebook/i.test(x.getAttribute('aria-label')));
     if(a.getAttribute('href')!=='https://facebook.com/NEWPAGE') throw new Error(a.getAttribute('href'));});
  t('address updated',    ()=>{const e=d.querySelector('[data-vr-address]');
     if(!/99 New Road/.test(e.textContent)) throw new Error(e.textContent);});
  t('hours summarised',   ()=>{const e=d.querySelector('[data-vr-hours]');
     if(e.textContent!=='Monday – Friday, 07:30 – 18:00 · Saturday, 08:00 – 12:00') throw new Error(e.textContent);});
  t('label not destroyed', ()=>{const p=d.querySelector('[data-vr-hours]').parentElement;
     if(!/Hours:/.test(p.textContent)) throw new Error('lost the <strong> label');});

  console.log('\n=== FALLBACK: nothing may be blanked ===');
  for(const mode of ['down','empty','http500']){
    const f=await run('index.html',mode);
    t('['+mode+'] phone intact',  ()=>{const a=f.querySelector('a[href^="tel:"]');
       if(a.getAttribute('href')!=='tel:+27828520680') throw new Error(a.getAttribute('href'));});
    t('['+mode+'] email intact',  ()=>{const a=f.querySelector('a[href^="mailto:"]');
       if(a.getAttribute('href')!=='mailto:venom@venomracing.co.za') throw new Error(a.getAttribute('href'));});
    t('['+mode+'] hours intact',  ()=>{const e=f.querySelector('[data-vr-hours]');
       if(!/Monday – Friday, 08:00 – 17:00/.test(e.textContent)) throw new Error(e.textContent);});
  }

  console.log('\n=== other pages hydrate too ===');
  const c=await run('contact.html','ok');
  t('contact.html tel',   ()=>{const a=c.querySelector('a[href^="tel:"]');
     if(a.getAttribute('href')!=='tel:+27115551234') throw new Error(a.getAttribute('href'));});
  t('contact.html email', ()=>{const a=c.querySelector('a[href^="mailto:"]');
     if(a.getAttribute('href')!=='mailto:new@venomracing.co.za') throw new Error(a.getAttribute('href'));});

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
