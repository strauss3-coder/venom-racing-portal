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
  const w=dom.window,D=w.document,{Router,UI}=w.VenomPortal;
  const settle=ms=>new Promise(r=>setTimeout(r,ms));
  const scrims=()=>D.querySelectorAll('#modalRoot .modal-scrim').length;

  // Count listeners actually attached to the #view element.
  let viewAdds=0;
  const view0=D.getElementById('view');
  const orig=view0.addEventListener.bind(view0);
  D.getElementById('view').addEventListener=(t,f,o)=>{ viewAdds++; return orig(t,f,o); };

  console.log('REPRODUCTION: does #view accumulate delegated listeners?');
  Router.go('services'); await settle(60);
  const after1=viewAdds;
  for(let i=0;i<5;i++){ Router.go('dashboard'); await settle(30); Router.go('services'); await settle(30); }
  const after6=viewAdds;
  console.log('  listeners added on 1st visit  : '+after1);
  console.log('  listeners added after 6 visits: '+after6);
  console.log('  ' + (after6>after1 ? 'ACCUMULATING (bug present)' : 'stable'));

  console.log('\nCONSEQUENCE: one click on "Add service" opens how many modals?');
  await settle(60);
  const btn=D.querySelector('#view [data-act="add"]');
  if(!btn){ console.log('  (no add button found)'); process.exit(0); }
  const before=scrims();
  btn.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  await settle(60);
  const opened=scrims()-before;
  console.log('  modals opened by ONE click: '+opened);
  console.log('  ' + (opened>1 ? 'THIS IS THE BUG: '+opened+' stacked dialogs, each needing its own close'
                                : 'correct - exactly one'));
  process.exit(0);
},2500);
