const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const DATA={
 'website_sections':[
   {id:'a',page:'index',section:'feature',title:'PORTAL Feature One',body:'Portal feature body.',sort_order:0},
   {id:'b',page:'index',section:'feature',title:'PORTAL Feature Two',body:'Second feature.',sort_order:1},
   {id:'c',page:'index',section:'process',title:'PORTAL Step One',body:'Portal step body.',sort_order:0},
   {id:'d',page:'index',section:'trust',title:'PORTAL Trust Item',body:'',sort_order:0}],
 'website_seo':[
   {id:'s',page:'index',title:'PORTAL Page Title',description:'Portal meta description.',
    og_title:'PORTAL OG Title',og_description:'Portal OG description.',og_image:'https://x/og.jpg'}]
};
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
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','gallery.js','reviews.js','main.js','forms.js','hero.js','stages.js','showcase.js','carousel.js','contact.js']
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

  console.log('=== PAGE SECTIONS from the portal ===');
  let d=await run('index.html','ok');
  t('feature cards replaced',()=>{const c=[...d.querySelectorAll('.feature-card h4')].map(x=>x.textContent);
    if(!c.includes('PORTAL Feature One')) throw new Error(c.slice(0,3).join('|'));});
  t('exactly two feature cards',()=>{const n=d.querySelectorAll('.feature-card').length;
    if(n!==2) throw new Error(n);});
  t('feature body replaced',()=>{const p=d.querySelector('.feature-card p');
    if(!/Portal feature body/.test(p.textContent)) throw new Error(p.textContent);});
  t('card keeps its icon',()=>{if(!d.querySelector('.feature-card svg')) throw new Error('icon lost');});
  t('process step replaced',()=>{const c=[...d.querySelectorAll('.process__step h4')].map(x=>x.textContent);
    if(!c.includes('PORTAL Step One')) throw new Error(c.join('|'));});
  t('trust item replaced',()=>{const c=[...d.querySelectorAll('.trust-item')].map(x=>x.textContent.trim());
    if(!c.some(x=>/PORTAL Trust Item/.test(x))) throw new Error(c.join('|'));});
  t('trust item keeps its icon',()=>{if(!d.querySelector('.trust-item svg')) throw new Error('icon lost');});
  t('cards visible (reveal re-armed)',()=>{const h=[...d.querySelectorAll('.feature-card.slide-up')].filter(x=>!x.classList.contains('is-visible'));
    if(h.length) throw new Error(h.length+' invisible');});

  console.log('\n=== SEO from the portal ===');
  t('document title replaced',()=>{if(d.title!=='PORTAL Page Title') throw new Error(d.title);});
  t('meta description replaced',()=>{const m=d.head.querySelector('meta[name="description"]');
    if(m.getAttribute('content')!=='Portal meta description.') throw new Error(m.getAttribute('content'));});
  t('og:title replaced',()=>{const m=d.head.querySelector('meta[property="og:title"]');
    if(m.getAttribute('content')!=='PORTAL OG Title') throw new Error(m.getAttribute('content'));});
  t('og:image replaced',()=>{const m=d.head.querySelector('meta[property="og:image"]');
    if(m.getAttribute('content')!=='https://x/og.jpg') throw new Error(m.getAttribute('content'));});
  t('twitter tags replaced',()=>{const m=d.head.querySelector('meta[name="twitter:description"]');
    if(m.getAttribute('content')!=='Portal OG description.') throw new Error(m.getAttribute('content'));});

  console.log('\n=== FALLBACK: database down ===');
  d=await run('index.html','down');
  t('original feature cards intact',()=>{const c=[...d.querySelectorAll('.feature-card h4')].map(x=>x.textContent);
    if(!c.includes('RMI Accredited')) throw new Error(c.slice(0,3).join('|'));});
  t('all 4 homepage features intact',()=>{const n=d.querySelectorAll('.feature-card').length;
    if(n!==4) throw new Error(n+' cards');});
  t('original title intact',()=>{if(!/Venom Racing/.test(d.title)) throw new Error(d.title);});
  t('original trust items intact',()=>{const c=[...d.querySelectorAll('.trust-item')].map(x=>x.textContent);
    if(!c.some(x=>/RMI Accredited Dealer/.test(x))) throw new Error('lost');});

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
