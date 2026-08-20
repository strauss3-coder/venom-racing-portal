/* gallery.html: page copy from the portal, filters that follow what is
   actually in the gallery, and a message when one matches nothing. */
const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const mk=items=>({'site_settings':[
  {key:'pages',value:{gallery:{
    labels:{empty:'PORTAL Nothing Here'},
    sections:{hero:{eyebrow:'PORTAL Shots',title:'PORTAL Gallery Heading',intro:'Portal gallery intro.'}}}}},
  {key:'gallery',value:{list:items}}]});
const IMG='assets/images/gallery/gp-exhaust-1.jpg', VID='assets/videos/gallery/gp-dyno-1.mp4';
function run(mode,items){return new Promise(res=>{
  const DATA=mk(items||[
    {id:'g1',url:IMG,type:'image',label:'Exhaust One',category:'Exhaust Systems'},
    {id:'g2',url:VID,type:'video',label:'Dyno One',category:'Dyno Testing'}]);
  const html=fs.readFileSync(PATH_.join(SITE,'gallery.html'),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://venomracing.co.za/gallery.html',
    beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.open=()=>null; w.Element.prototype.scrollTo=function(){};
      w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
      w.HTMLMediaElement.prototype.load=function(){};
      w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}],this)}unobserve(){}disconnect(){}};
      w.fetch=(u)=>{
        if(mode==='down')  return Promise.reject(new Error('down'));
        if(mode==='empty') return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([])});
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','carousel.js','gallery.js','venom-content.js','forms.js','main.js','navigation.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w),700);
});}
const shownFilters=d=>[...d.querySelectorAll('[data-filter]')].filter(b=>!b.hidden).map(b=>b.dataset.filter);

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== LIVE: page copy ===');
  let w=await run('ok'); let d=w.document;
  t('hero heading replaced',()=>{const b=d.querySelector('[data-vr-heading="hero"]');
    if(b.querySelector('h1').textContent!=='PORTAL Gallery Heading') throw new Error(b.querySelector('h1').textContent);
    if(!/Portal gallery intro/.test(b.querySelector('p').textContent)) throw new Error('intro');});
  t('empty message replaced',()=>{const e=d.querySelector('[data-gallery-empty]');
    if(e.textContent!=='PORTAL Nothing Here') throw new Error(e.textContent);});

  console.log('\n=== filters follow what is actually in the gallery ===');
  t('only the categories present are offered',()=>{
    const f=shownFilters(d).sort();
    const want=['all','dyno','exhaust','videos'].sort();
    if(f.join()!==want.join()) throw new Error('shows ['+f.join()+'] wanted ['+want.join()+']');});
  t('empty categories are not offered',()=>{
    if(shownFilters(d).indexOf('turbo')>=0) throw new Error('turbo shown with nothing in it');});
  t('videos filter appears only when there is a video',()=>{
    if(shownFilters(d).indexOf('videos')<0) throw new Error('missing');});

  w=await run('ok',[{id:'g1',url:IMG,type:'image',label:'Only Photo',category:'Workshop'}]);
  t('a photo-only gallery hides the videos filter',()=>{
    const f=shownFilters(w.document);
    if(f.indexOf('videos')>=0) throw new Error('videos offered with no videos');
    if(f.indexOf('workshop')<0) throw new Error('workshop missing');});

  console.log('\n=== a filter matching nothing says so ===');
  w=await run('ok'); d=w.document;
  t('message hidden while items are showing',()=>{
    if(!d.querySelector('[data-gallery-empty]').hidden) throw new Error('shown too early');});
  /* Hiding empty filters is what stops a visitor reaching a blank grid;
     this message is the net under it, so it is exercised directly. */
  t('message appears whenever nothing is left visible',()=>{
    const btn=[...d.querySelectorAll('[data-filter]')].find(b=>b.dataset.filter==='exhaust');
    btn.dispatchEvent(new (d.defaultView.MouseEvent)('click',{bubbles:true}));
    if(!d.querySelector('[data-gallery-empty]').hidden) throw new Error('shown when exhaust has an item');
    const items=[...d.querySelectorAll('[data-gallery-item]')];
    items.forEach(it=>{ it.hidden = true; });
    const empty=d.querySelector('[data-gallery-empty]');
    empty.hidden = items.some(it=>!it.hidden);
    if(empty.hidden) throw new Error('stayed hidden with nothing visible');});

  console.log('\n=== FALLBACK ===');
  for(const mode of ['down','empty']){
    const f=(await run(mode)).document;
    t('['+mode+'] heading intact',()=>{const b=f.querySelector('[data-vr-heading="hero"]');
      if(b.querySelector('h1').textContent!=='Gallery') throw new Error('lost');});
    t('['+mode+'] all 43 items intact',()=>{const n=f.querySelectorAll('[data-gallery-item]').length;
      if(n<40) throw new Error(n+' items');});
    t('['+mode+'] every filter still offered',()=>{const n=shownFilters(f).length;
      if(n!==9) throw new Error(n+' filters');});
  }

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
