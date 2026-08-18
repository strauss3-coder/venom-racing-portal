const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.io/p/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.reject(new Error('offline'));
  w.addEventListener('unhandledrejection',e=>{ w.__rejections=(w.__rejections||0)+1; });
}});
setTimeout(async()=>{
  const w=dom.window,D=w.document,{Router,Portal,UI,Store}=w.VenomPortal;
  let bad=0;
  const t=(n,f)=>{try{f();console.log('    ok   '+n)}catch(e){console.log('    FAIL '+n+' -> '+e.message);bad++}};
  const settle=ms=>new Promise(r=>setTimeout(r,ms));
  const scrims=()=>[...D.querySelectorAll('#modalRoot .modal-scrim')];
  const open=()=>scrims().filter(s=>s.classList.contains('on'));
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const esc=()=>D.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));

  const ids=Portal.modules.map(m=>m.id);
  console.log('=== EVERY MODULE, VISITED 5x FIRST (the condition that broke it) ===\n');

  for(const id of ids){
    console.log('  ['+id+']');
    // revisit so any accumulation would have happened
    for(let i=0;i<5;i++){ Router.go(id); await settle(20); }
    Router.go(id); await settle(220);

    t('renders content', ()=>{ const v=D.getElementById('view');
      if(!v || v.innerHTML.trim().length<40) throw new Error('view empty'); });

    // every primary action button must open exactly one dialog
    const actions=[...D.querySelectorAll('#view [data-act="add"]')].slice(0,1);
    for(const btn of actions){
      const before=scrims().length;
      click(btn); await settle(60);
      const opened=scrims().length-before;
      t('Add opens exactly one dialog (got '+opened+')', ()=>{
        if(opened!==1) throw new Error(opened+' dialogs from one click'); });
      if(opened>0){
        const top=scrims()[scrims().length-1];
        const x=top.querySelector('.modal-h [data-close]');
        t('X closes on the FIRST click', ()=>{
          click(x);
          if(top.classList.contains('on')) throw new Error('still open after one click'); });
        await settle(360);
        t('no dialog residue', ()=>{ if(scrims().length) throw new Error(scrims().length+' left'); });
      }
    }

    // row-level edit buttons, where the module has them
    const edit=D.querySelector('#view [data-sact="edit"],#view [data-stact="edit"],#view [data-pact="edit"],#view [data-bract="edit"],#view [data-fact="edit"],#view [data-tact="edit"]');
    if(edit){
      const before=scrims().length;
      click(edit); await settle(60);
      t('Edit opens exactly one dialog', ()=>{
        const n=scrims().length-before;
        if(n!==1) throw new Error(n+' dialogs'); });
      const top=scrims()[scrims().length-1];
      if(top){
        t('Escape closes it first time', ()=>{ esc();
          if(top.classList.contains('on')) throw new Error('still open'); });
        await settle(360);
      }
    }

    t('no scrim left before leaving', ()=>{ if(scrims().length) throw new Error(scrims().length+' scrims'); });
    t('body not scroll-locked', ()=>{ if(D.body.classList.contains('modal-open')) throw new Error('locked'); });
  }

  console.log('\n=== NAVIGATE IMMEDIATELY AFTER CLOSING A MODAL ===');
  Router.go('services'); await settle(220);
  const add=D.querySelector('#view [data-act="add"]');
  if(add){
    click(add); await settle(60);
    const m=scrims()[scrims().length-1];
    click(m.querySelector('[data-close]'));
    Router.go('faqs');                      // navigate mid fade-out
    await settle(400);
    t('no overlay survives the navigation',()=>{ if(scrims().length) throw new Error(scrims().length+' scrims'); });
    t('destination is interactive',()=>{ if(D.body.classList.contains('modal-open')) throw new Error('page still locked'); });
  }

  console.log('\n=== RAPID DOUBLE NAVIGATION (render race) ===');
  Router.go('services'); Router.go('products'); await settle(300);
  t('only the last module is mounted',()=>{
    const h=D.getElementById('tbTitle').textContent;
    if(!/Products/.test(h)) throw new Error('topbar says: '+h); });
  t('view rendered once',()=>{
    const v=D.getElementById('view');
    if(v.querySelectorAll('[data-ptab]').length>2) throw new Error('duplicate render'); });

  console.log('\n=== ASYNC HYGIENE ===');
  t('no unhandled promise rejections',()=>{
    if(w.__rejections) throw new Error(w.__rejections+' rejections'); });

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
},2500);
