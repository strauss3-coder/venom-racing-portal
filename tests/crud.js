const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const fs=require('fs'); const {JSDOM}=require('jsdom');
const html=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const errors=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',beforeParse(w){
  w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  w.scrollTo=()=>{}; w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},fillRect(){}});
  w.fetch=()=>Promise.reject(new Error('offline in test'));
  w.URL.createObjectURL=()=>'blob:x';
  w.addEventListener('error',e=>errors.push('ERR '+(e.error&&e.error.stack||e.message)));
  w.addEventListener('unhandledrejection',e=>errors.push('REJ '+(e.reason&&e.reason.message||e.reason)));
}});
const w=dom.window;
setTimeout(()=>{
  const P=w.VenomPortal, {Store,Portal,Modules,U}=P;
  let fails=0;
  const check=(name,fn)=>{ try{ fn(); console.log('  ok   '+name); }catch(e){ console.log('  FAIL '+name+' -> '+e.message); fails++; } };
  const view=w.document.getElementById('view');

  console.log('=== MOUNT every module ===');
  Portal.modules.forEach(m=>{
    check('mount '+m.id, ()=>{
      view.innerHTML = m.render.call(m,{});
      if(m.mount) m.mount.call(m,view,{});
    });
  });

  console.log('\n=== SERVICE lifecycle ===');
  const before = Store.list('services').length;
  check('insert service',()=>{
    Store.insert('services',{id:U.id('s'),title:'Test Service',division:'Performance',icon:'wrench',
      description:'A test service.',image:'',anchor:'',active:true,featured:false});
    if(Store.list('services').length!==before+1) throw new Error('not inserted');
  });
  const ns = Store.list('services').find(x=>x.title==='Test Service');
  check('update service',()=>{ Store.update('services',ns.id,{title:'Renamed Service'});
    if(Store.find('services',ns.id).title!=='Renamed Service') throw new Error('not updated'); });
  check('stats reflect it',()=>{ const st=Store.stats();
    if(st.services!==before+1) throw new Error('services='+st.services); });
  check('remove service',()=>{ Store.remove('services',ns.id);
    if(Store.list('services').length!==before) throw new Error('not removed'); });
  check('no builds module',()=>{ if(Portal.byId.builds) throw new Error('builds module still registered'); });
  check('no offers module',()=>{ if(Portal.byId.offers) throw new Error('offers module still registered'); });
  check('no analytics module',()=>{ if(Portal.byId.analytics) throw new Error('analytics module still registered'); });

  console.log('\n=== FORMS open without error ===');
  ['serviceForm','stageForm','productForm','brandForm','faqForm','enquiryForm','testimonialForm'].forEach(f=>{
    check(f+'(new)',()=>{ Modules[f](null); const mr=w.document.getElementById('modalRoot');
      if(!mr.innerHTML.trim()) throw new Error('modal did not open'); mr.innerHTML=''; });
  });
  console.log('\n=== CSV exports ===');
  // Seed one of each so the exports have real rows to serialise.
  Store.insert('enquiries',{id:U.id('e'),name:'CSV Test',phone:'082 000 0000',email:'csv@example.com',
    make:'Audi',model:'RS3',registration:'ABC123',service:'Dyno Tuning',vehicle:'Audi RS3',
    notes:'n',source:'Website form',status:'unread',message:'m'});
  const saved=[]; const origSave=U.save; U.save=(n,c)=>saved.push([n,c]);
  ['exportEnquiries','exportTestimonials'].forEach(f=>check(f,()=>{
    Modules[f](); const last=saved[saved.length-1];
    if(!last||!last[1]||last[1].split('\n').length<2) throw new Error('empty csv');
    if(/undefined/.test(last[1])) throw new Error('undefined in csv');
  }));
  check('backup json',()=>{ Modules.exportAll(); const last=saved[saved.length-1];
    const j=JSON.parse(last[1]); if(!j.services||!j.stages) throw new Error('missing collections'); });
  console.log('  files: '+saved.map(s=>s[0]).join(', '));
  U.save=origSave;

  console.log('\n=== ERRORS ==='); const real=errors.filter(e=>!/offline in test/.test(e));
  console.log(real.length?real.join('\n'):'none');
  console.log('\nRESULT: '+(fails===0&&real.length===0?'PASS':'FAILURES='+fails));
  process.exit(fails===0&&real.length===0?0:1);
},2500);
