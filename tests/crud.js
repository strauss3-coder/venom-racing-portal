const PATH_=require('path');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../../websites/venom-racing-website');
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

  console.log('\n=== BUILD lifecycle ===');
  const before = Store.list('builds').length;
  check('insert build',()=>{
    Store.insert('builds',{id:U.id('b'),title:'Test GTI Stage 2',make:'Volkswagen',model:'Golf 7 GTI',
      year:2019,engine:'2.0 TSI',fuel:'Petrol',transmission:'DSG',stage:'Stage 2',tuningType:'ECU + TCU',
      validation:'Dyno',powerBefore:169,powerAfter:224,torqueBefore:350,torqueAfter:450,
      workDone:['Downpipe','Intake'],description:'x',images:[],customerRef:'',status:'published',
      featured:true,published:true,archived:false,views:12,completedAt:Date.now()});
    if(Store.list('builds').length!==before+1) throw new Error('not inserted');
  });
  check('stats reflect gain',()=>{
    const st=Store.stats();
    if(st.published!==1) throw new Error('published='+st.published);
    if(st.gainAvg!==55) throw new Error('gainAvg='+st.gainAvg+' expected 55');
    if(st.bestGain!==55) throw new Error('bestGain='+st.bestGain);
  });
  const nb = Store.list('builds').find(b=>b.title==='Test GTI Stage 2');
  check('filter: search',()=>{
    const r=Modules.filterBuilds(Store.list('builds'),{q:'gti',tab:'all',make:'',sort:'newest'});
    if(r.length!==1) throw new Error('got '+r.length);
  });
  check('filter: published tab',()=>{
    const r=Modules.filterBuilds(Store.list('builds'),{q:'',tab:'published',make:'',sort:'gain-hi'});
    if(r.length!==1) throw new Error('got '+r.length);
  });
  check('filter: stage sort',()=>{
    Modules.filterBuilds(Store.list('builds'),{q:'',tab:'all',make:'',sort:'stage'});
  });
  check('buildCard renders',()=>{
    const h=Modules.buildCard(nb);
    if(!/\+55 kW/.test(h)) throw new Error('gain missing');
    if(!/Stage 2/.test(h)) throw new Error('stage ribbon missing');
    if(/undefined|NaN/.test(h)) throw new Error('bad token in card');
  });
  check('duplicate',()=>{ Modules.buildAction('dup',nb.id); if(Store.list('builds').length!==before+2) throw new Error('no copy'); });
  check('archive',()=>{ Modules.buildAction('archive',nb.id); if(!Store.find('builds',nb.id).archived) throw new Error('not archived'); });
  check('unarchive',()=>{ Modules.buildAction('unarchive',nb.id); if(Store.find('builds',nb.id).archived) throw new Error('still archived'); });

  console.log('\n=== FORMS open without error ===');
  ['buildForm','serviceForm','stageForm','productForm','brandForm','faqForm','enquiryForm','testimonialForm','offerForm'].forEach(f=>{
    check(f+'(new)',()=>{ Modules[f](null); const mr=w.document.getElementById('modalRoot');
      if(!mr.innerHTML.trim()) throw new Error('modal did not open'); mr.innerHTML=''; });
  });
  check('buildForm(edit)',()=>{ Modules.buildForm(nb.id);
    const mr=w.document.getElementById('modalRoot');
    if(!/Edit build/.test(mr.innerHTML)) throw new Error('not edit mode');
    if(/undefined|NaN/.test(mr.innerHTML)) throw new Error('bad token in form');
    mr.innerHTML=''; });

  console.log('\n=== CSV exports ===');
  // Seed one of each so the exports have real rows to serialise.
  Store.insert('enquiries',{id:U.id('e'),name:'CSV Test',phone:'082 000 0000',email:'csv@example.com',
    make:'Audi',model:'RS3',registration:'ABC123',service:'Dyno Tuning',vehicle:'Audi RS3',
    notes:'n',source:'Website form',status:'unread',message:'m'});
  const saved=[]; const origSave=U.save; U.save=(n,c)=>saved.push([n,c]);
  ['exportBuilds','exportEnquiries','exportTestimonials'].forEach(f=>check(f,()=>{
    Modules[f](); const last=saved[saved.length-1];
    if(!last||!last[1]||last[1].split('\n').length<2) throw new Error('empty csv');
    if(/undefined/.test(last[1])) throw new Error('undefined in csv');
  }));
  check('backup json',()=>{ Modules.exportAll(); const last=saved[saved.length-1];
    const j=JSON.parse(last[1]); if(!j.builds||!j.services) throw new Error('missing collections'); });
  console.log('  files: '+saved.map(s=>s[0]).join(', '));
  U.save=origSave;

  console.log('\n=== ERRORS ==='); const real=errors.filter(e=>!/offline in test/.test(e));
  console.log(real.length?real.join('\n'):'none');
  console.log('\nRESULT: '+(fails===0&&real.length===0?'PASS':'FAILURES='+fails));
  process.exit(fails===0&&real.length===0?0:1);
},2500);
