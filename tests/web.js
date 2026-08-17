const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const fs=require('fs'),path=require('path'); const {JSDOM}=require('jsdom');
const ROOT=SITE;

function load(page, fill, submitSel){
  return new Promise(res=>{
    const html=fs.readFileSync(path.join(ROOT,page),'utf8');
    let sent=null, opened=null;
    const dom=new JSDOM(html,{runScripts:'dangerously',resources:undefined,pretendToBeVisual:true,
      url:'https://venomracing.co.za/'+page, beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
      w.open=(u)=>{opened=u; return null;};
      w.fetch=(u,o)=>{ sent={url:String(u),body:JSON.parse(o.body),headers:o.headers};
        return Promise.resolve({ok:true,status:201,text:()=>Promise.resolve('')}); };
    }});
    const w=dom.window;
    // inline the local scripts jsdom won't fetch
    ['utils.js','venom-supabase.js','forms.js','contact.js'].forEach(f=>{
      const p=path.join(ROOT,'assets/js',f);
      if(!fs.existsSync(p)) return;
      if(!html.includes('assets/js/'+f)) return;
      const s=w.document.createElement('script'); s.textContent=fs.readFileSync(p,'utf8');
      w.document.body.appendChild(s);
    });
    w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
    setTimeout(()=>{
      fill(w.document);
      const form=w.document.querySelector(submitSel);
      form.dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
      setTimeout(()=>res({sent,opened}),300);
    },200);
  });
}

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== contact.html (WhatsApp hand-off + capture) ===');
  const c=await load('contact.html',d=>{
    d.getElementById('cf-name').value='Test Customer';
    d.getElementById('cf-phone').value='082 111 2222';
    d.getElementById('cf-email').value='test@example.com';
    d.getElementById('cf-make').value='Volkswagen';
    d.getElementById('cf-model').value='Golf 7 GTI';
    d.getElementById('cf-reg').value='ABC123MP';
    d.getElementById('cf-service').value='ECU Calibration';
    d.getElementById('cf-message').value='Interested in a Stage 2 build.';
  },'[data-wa-form]');
  t('WhatsApp still opens',   ()=>{ if(!/^https:\/\/wa\.me\/27828520680/.test(c.opened||'')) throw new Error('opened: '+c.opened); });
  t('enquiry also captured',  ()=>{ if(!c.sent) throw new Error('nothing sent to Supabase'); });
  t('hits the right project', ()=>{ if(c.sent.url!=='https://znuozxezktzoeozffddk.supabase.co/rest/v1/enquiries') throw new Error(c.sent.url); });
  t('every field mapped',     ()=>{ const b=c.sent.body;
    const want={name:'Test Customer',phone:'082 111 2222',email:'test@example.com',make:'Volkswagen',
      model:'Golf 7 GTI',registration:'ABC123MP',service:'ECU Calibration',vehicle:'Volkswagen Golf 7 GTI',
      message:'Interested in a Stage 2 build.',source:'Website form',status:'unread'};
    for(const k in want) if(b[k]!==want[k]) throw new Error(k+': got '+JSON.stringify(b[k])+' want '+JSON.stringify(want[k]));
    if(!/^e_/.test(b.id)) throw new Error('bad id '+b.id); });
  console.log('     payload: '+JSON.stringify(c.sent.body));

  console.log('\n=== index.html (homepage quote form) ===');
  const h=await load('index.html',d=>{
    d.getElementById('hp-name').value='Homepage Lead';
    d.getElementById('hp-email').value='hp@example.com';
    d.getElementById('hp-phone').value='083 444 5555';
    d.getElementById('hp-message').value='Please quote a full exhaust.';
  },'[data-form]');
  t('enquiry captured',    ()=>{ if(!h.sent) throw new Error('nothing sent'); });
  t('fields mapped',       ()=>{ const b=h.sent.body;
    if(b.name!=='Homepage Lead') throw new Error('name '+b.name);
    if(b.email!=='hp@example.com') throw new Error('email');
    if(b.message!=='Please quote a full exhaust.') throw new Error('message');
    if(b.status!=='unread') throw new Error('status'); });
  console.log('     payload: '+JSON.stringify(h.sent.body));

  fs.writeFileSync('payload.json',JSON.stringify(c.sent.body));
  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
