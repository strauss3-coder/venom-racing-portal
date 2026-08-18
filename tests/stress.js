const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
let winListeners=0, docListeners=0;
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.io/p/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.reject(new Error('offline'));
  const wa=w.addEventListener.bind(w), wr=w.removeEventListener.bind(w);
  w.addEventListener=(t,f,o)=>{ winListeners++; return wa(t,f,o); };
  w.removeEventListener=(t,f,o)=>{ winListeners--; return wr(t,f,o); };
}});
setTimeout(async()=>{
  const w=dom.window,D=w.document,{Router,Portal,UI,Store,Modules,U}=w.VenomPortal;
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};
  const settle=ms=>new Promise(r=>setTimeout(r,ms));
  const ids=Portal.modules.map(m=>m.id);

  console.log('=== navigate every page 10x (=%d navigations) ===', ids.length*10);
  // warm up so one-off listeners are already counted
  Router.go('dashboard'); await settle(40);
  Router.go('services');  await settle(40);
  const baseWin = winListeners;
  const baseNodes = D.querySelectorAll('*').length;

  for(let round=0;round<10;round++){
    for(const id of ids){ Router.go(id); await settle(12); }
  }
  await settle(200);
  t('no window listeners accumulated',()=>{
    const grew = winListeners - baseWin;
    if(grew>2) throw new Error(grew+' window listeners leaked over '+(ids.length*10)+' navigations');
  });
  t('no modal scrims left behind',()=>{
    const n=D.querySelectorAll('#modalRoot .modal-scrim').length;
    if(n) throw new Error(n+' scrims');
  });
  t('DOM did not grow unbounded',()=>{
    const grew=D.querySelectorAll('*').length - baseNodes;
    if(grew>4000) throw new Error('node count grew by '+grew);
  });
  t('body not left scroll-locked',()=>{
    if(D.body.classList.contains('modal-open')) throw new Error('locked');
  });

  console.log('\n=== 100 create/edit/delete cycles on services ===');
  const start=Store.list('services').length;
  for(let i=0;i<100;i++){
    Store.insert('services',{id:U.id('s'),title:'T'+i,division:'Performance',icon:'wrench',
      description:'d',image:'',anchor:'',active:true,featured:false});
    const r=Store.list('services').find(x=>x.title==='T'+i);
    Store.update('services',r.id,{title:'T'+i+'-edited'});
    Store.remove('services',r.id);
  }
  t('collection returned to its original size',()=>{
    const now=Store.list('services').length;
    if(now!==start) throw new Error('drifted from '+start+' to '+now);
  });

  console.log('\n=== 100 form open/close cycles ===');
  const forms=['serviceForm','stageForm','productForm','brandForm','faqForm','testimonialForm','enquiryForm'];
  for(let i=0;i<100;i++){
    const f=forms[i%forms.length];
    Modules[f](null);
    const s=[...D.querySelectorAll('#modalRoot .modal-scrim')].pop();
    if(s){ const b=s.querySelector('[data-close]'); if(b) b.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); }
  }
  await settle(400);
  t('no scrims accumulated over 100 forms',()=>{
    const n=D.querySelectorAll('#modalRoot .modal-scrim').length;
    if(n) throw new Error(n+' scrims left');
  });
  t('modal stack empty',()=>{ if(UI._stack.length) throw new Error('stack='+UI._stack.length); });
  t('body unlocked',()=>{ if(D.body.classList.contains('modal-open')) throw new Error('locked'); });

  console.log('\n=== repeated search + filter on services ===');
  Router.go('services'); await settle(60);
  const mod=Portal.byId.services;
  for(let i=0;i<50;i++){
    mod.state.division = i%2 ? 'Performance' : 'Services & Repairs';
    const view=D.getElementById('view');
    view.innerHTML=mod.render({}); mod.mount(view,{});
  }
  t('filtering 50x leaves one grid',()=>{
    const n=D.querySelectorAll('#view [data-srt]').length;
    if(n>1) throw new Error(n+' sortable containers');
  });

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
},2500);
