const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.io/p/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.reject(new Error('offline'));
}});
setTimeout(async()=>{
  const w=dom.window,D=w.document,{UI,Store,U,Portal,Modules}=w.VenomPortal;
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};
  const ta=async(n,f)=>{try{await f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};
  const root=D.getElementById('modalRoot');
  const scrims=()=>root.querySelectorAll('.modal-scrim');
  const clickable=()=>[...scrims()].filter(s=>s.classList.contains('on'));
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const esc=()=>D.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  const settle=ms=>new Promise(r=>setTimeout(r,ms));

  console.log('=== THE ORIGINAL BUG: closing scrim must stop intercepting at once ===');
  let m=UI.modal({title:'A',body:'x'});
  await settle(30);
  t('scrim is interactive while open',()=>{ if(!m.el.classList.contains('on')) throw new Error('never opened'); });
  m.close();
  t('scrim drops pointer-events immediately',()=>{
    if(m.el.classList.contains('on')) throw new Error('still .on right after close - it would keep swallowing clicks');
  });
  t('still in DOM during fade (expected)',()=>{ if(!root.contains(m.el)) throw new Error('removed too early'); });
  await settle(360);
  t('removed after the fade',()=>{ if(root.contains(m.el)) throw new Error('scrim leaked'); });

  console.log('\n=== close() is idempotent ===');
  let n=0;
  m=UI.modal({title:'B',body:'x',onClose:()=>n++});
  await settle(30);
  m.close(); m.close(); m.close();
  t('onClose fired exactly once',()=>{ if(n!==1) throw new Error('fired '+n+' times'); });
  await settle(360);

  console.log('\n=== every close affordance works first time ===');
  for(const [label,act] of [
    ['X button',      s=>click(s.querySelector('[data-close]'))],
    ['scrim click',   s=>click(s)],
    ['Escape',        ()=>esc()],
  ]){
    m=UI.modal({title:label,body:'<button data-close>Cancel</button>'});
    await settle(30);
    act(m.el);
    await settle(5);
    t(label+' closes on the first attempt',()=>{
      if(m.el.classList.contains('on')) throw new Error('still open');
    });
    await settle(360);
  }
  m=UI.modal({title:'cancel',body:'<button id="cx" data-close>Cancel</button>'});
  await settle(30); click(D.getElementById('cx')); await settle(5);
  t('Cancel in body closes',()=>{ if(m.el.classList.contains('on')) throw new Error('still open'); });
  await settle(360);

  console.log('\n=== data-close added AFTER mount still closes (was inert) ===');
  m=UI.modal({title:'late',body:'<div id="slot"></div>'});
  await settle(30);
  D.getElementById('slot').innerHTML='<button id="late" data-close>Cancel</button>';
  click(D.getElementById('late'));
  await settle(5);
  t('late Cancel closes',()=>{ if(m.el.classList.contains('on')) throw new Error('inert - listener was bound at creation only'); });
  await settle(360);

  console.log('\n=== stacked modals: Escape closes only the top one ===');
  const outer=UI.modal({title:'outer',body:'x'});
  await settle(30);
  const inner=UI.modal({title:'inner',body:'y'});
  await settle(30);
  t('two open',()=>{ if(UI._stack.length!==2) throw new Error('stack='+UI._stack.length); });
  esc(); await settle(5);
  t('inner closed',()=>{ if(inner.el.classList.contains('on')) throw new Error('inner still open'); });
  t('outer SURVIVED',()=>{ if(!outer.el.classList.contains('on')) throw new Error('Escape closed both'); });
  t('outer is clickable',()=>{ if(clickable().length!==1) throw new Error(clickable().length+' interactive scrims'); });
  esc(); await settle(400);
  t('both gone',()=>{ if(scrims().length) throw new Error(scrims().length+' scrims left'); });

  console.log('\n=== body scroll lock ===');
  m=UI.modal({title:'lock',body:'x'}); await settle(30);
  t('locked while open',()=>{ if(!D.body.classList.contains('modal-open')) throw new Error('not locked'); });
  const a2=UI.modal({title:'lock2',body:'y'}); await settle(30);
  a2.close(); await settle(5);
  t('still locked with one left',()=>{ if(!D.body.classList.contains('modal-open')) throw new Error('unlocked too early'); });
  m.close(); await settle(5);
  t('unlocked when last closes',()=>{ if(D.body.classList.contains('modal-open')) throw new Error('stayed locked'); });
  await settle(360);

  console.log('\n=== confirm() resolves once and cleans up ===');
  let p=UI.confirm({title:'Delete?',message:'m',confirmText:'Delete'});
  await settle(30);
  click(D.querySelector('[data-yes]'));
  await ta('confirm resolves true',async()=>{ if(await p!==true) throw new Error('did not resolve true'); });
  await settle(360);
  p=UI.confirm({title:'Delete?',message:'m'});
  await settle(30); esc();
  await ta('cancel resolves false',async()=>{ if(await p!==false) throw new Error('did not resolve false'); });
  await settle(360);
  t('no scrims left after confirms',()=>{ if(scrims().length) throw new Error(scrims().length+' left'); });

  console.log('\n=== 200 open/close cycles: no leak, no degradation ===');
  const before=UI._stack.length;
  for(let i=0;i<200;i++){ const x=UI.modal({title:'n'+i,body:'<button data-close>c</button>'}); x.close(); }
  await settle(400);
  t('stack empty',()=>{ if(UI._stack.length!==before) throw new Error('stack grew to '+UI._stack.length); });
  t('no scrims left',()=>{ if(scrims().length) throw new Error(scrims().length+' scrims accumulated'); });
  t('body unlocked',()=>{ if(D.body.classList.contains('modal-open')) throw new Error('still locked'); });

  console.log('\n=== the real reported flow: delete an enquiry ===');
  Store.insert('enquiries',{id:U.id('e'),name:'Del Me',phone:'0820000000',email:'d@x.com',
    make:'VW',model:'Golf',registration:'',service:'Dyno Tuning',vehicle:'VW Golf',notes:'',
    source:'Website form',status:'unread',message:'m'});
  const en=Store.list('enquiries')[0];
  Modules.enquiryView(en.id);
  await settle(40);
  click(D.querySelector('[data-del]'));
  await settle(40);
  t('confirm opened on top',()=>{ if(UI._stack.length!==2) throw new Error('stack='+UI._stack.length); });
  click(D.querySelector('[data-yes]'));
  await settle(60);
  t('record deleted',()=>{ if(Store.find('enquiries',en.id)) throw new Error('not deleted'); });
  await settle(400);
  t('NO scrim left blocking the page',()=>{ if(scrims().length) throw new Error(scrims().length+' scrims still mounted'); });
  t('body scroll restored',()=>{ if(D.body.classList.contains('modal-open')) throw new Error('page left unscrollable'); });

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
},2500);
