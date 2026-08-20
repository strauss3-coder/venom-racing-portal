/* about.html: the page's own copy comes from the portal's pages.about,
   and nothing is blanked when the database is unreachable. */
const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const DATA={'site_settings':[
  {key:'pages',value:{about:{
     eyebrow:'PORTAL Eyebrow',
     title:'PORTAL Title Line One\nPORTAL Line Two',
     text:'Portal first paragraph.',
     text2:'Portal second paragraph.',
     badgeTitle:'PORTAL Badge', badgeText:'Portal badge line.',
     techLabel:'PORTAL Technology',
     buttons:{main:{text:'PORTAL Button',link:'zz.html'}},
     showcase:[{id:'s1',url:'assets/images/about/results.jpg',label:'PORTAL Slide'}],
     sections:{specialise:{eyebrow:'PORTAL Label',title:'PORTAL Specialise',intro:'Portal specialise intro.'}}
  }}}
]};
function run(page,mode){return new Promise(res=>{
  const html=fs.readFileSync(PATH_.join(SITE,page),'utf8');
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://venomracing.co.za/'+page,
    beforeParse(w){
      w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
      w.scrollTo=()=>{}; w.open=()=>null; w.Element.prototype.scrollTo=function(){};
      w.HTMLMediaElement.prototype.play=function(){return Promise.resolve();};
      w.IntersectionObserver=class{constructor(cb){this.cb=cb}observe(el){this.cb([{isIntersecting:true,target:el}],this)}unobserve(){}disconnect(){}};
      w.fetch=(u)=>{
        if(mode==='down') return Promise.reject(new Error('down'));
        if(mode==='empty') return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([])});
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','main.js','forms.js','showcase.js','navigation.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w.document),500);
});}

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== LIVE: portal copy reaches about.html ===');
  let d=await run('about.html','ok');
  t('eyebrow replaced',()=>{const e=d.querySelector('[data-vr-page-eyebrow]');
    if(e.textContent!=='PORTAL Eyebrow') throw new Error(e.textContent);});
  t('title replaced',()=>{const e=d.querySelector('[data-vr-page-title]');
    if(!/PORTAL Title Line One/.test(e.textContent)) throw new Error(e.textContent);});
  t('title keeps its line break',()=>{const e=d.querySelector('[data-vr-page-title]');
    if(!e.querySelector('br')) throw new Error('newline lost: '+e.innerHTML);
    if(/&lt;|&gt;/.test(e.innerHTML)===false && /<br>/.test(e.innerHTML)===false) throw new Error(e.innerHTML);});
  t('title is escaped, not injected',()=>{const e=d.querySelector('[data-vr-page-title]');
    if(e.querySelector('script')) throw new Error('markup injected');});
  t('both paragraphs replaced',()=>{
    if(!/Portal first paragraph/.test(d.querySelector('[data-vr-page-text]').textContent)) throw new Error('p1');
    if(!/Portal second paragraph/.test(d.querySelector('[data-vr-page-text2]').textContent)) throw new Error('p2');});
  t('badge replaced',()=>{
    if(!/PORTAL Badge/.test(d.querySelector('[data-vr-badge-title]').textContent)) throw new Error('title');
    if(!/Portal badge line/.test(d.querySelector('[data-vr-badge-text]').textContent)) throw new Error('text');});
  t('technology label replaced',()=>{const e=d.querySelector('[data-vr-tech-label]');
    if(e.textContent!=='PORTAL Technology') throw new Error(e.textContent);});
  t('carousel rebuilt',()=>{const f=d.querySelectorAll('[data-vr-showcase] .showcase__slide');
    if(f.length!==1) throw new Error(f.length+' slides');
    if(!/PORTAL Slide/.test(f[0].textContent)) throw new Error(f[0].textContent);});
  t('specialise heading replaced',()=>{const b=d.querySelector('[data-vr-heading="specialise"]');
    if(!/PORTAL Specialise/.test(b.querySelector('h2').textContent)) throw new Error('title');
    if(!/PORTAL Label/.test(b.querySelector('.eyebrow').textContent)) throw new Error('eyebrow not created');
    if(!/Portal specialise intro/.test(b.querySelector('p').textContent)) throw new Error('intro not created');});
  t('closing button replaced',()=>{const a=d.querySelector('[data-vr-page-btn="main"]');
    if(!/PORTAL Button/.test(a.textContent)) throw new Error(a.textContent);
    if(a.getAttribute('href')!=='zz.html') throw new Error(a.getAttribute('href'));});

  console.log('\n=== FALLBACK: database down, page keeps its own words ===');
  for(const mode of ['down','empty']){
    const f=await run('about.html',mode);
    t('['+mode+'] title intact',()=>{const e=f.querySelector('[data-vr-page-title]');
      if(!/Precision Tuning/.test(e.textContent)) throw new Error(e.textContent);});
    t('['+mode+'] paragraphs intact',()=>{const e=f.querySelector('[data-vr-page-text]');
      if(!/performance workshop based in eMalahleni/.test(e.textContent)) throw new Error('lost');});
    t('['+mode+'] carousel intact',()=>{const n=f.querySelectorAll('[data-vr-showcase] .showcase__slide').length;
      if(n!==2) throw new Error(n+' slides');});
    t('['+mode+'] tech chips intact',()=>{const n=f.querySelectorAll('.tech-chip').length;
      if(n!==8) throw new Error(n+' chips');});
  }

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
