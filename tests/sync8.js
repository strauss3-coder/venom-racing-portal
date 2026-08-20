/* contact.html: headings, block labels and buttons come from the portal,
   and the map, directions, tuning portal link and enquiry form's service
   list all follow the portal's own data rather than their own copies. */
const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../venom-racing-website');
const {JSDOM}=require('jsdom');
const ADDR='7 New Workshop Road, Middelburg, 1050';
const DATA={
  'site_settings':[
    {key:'contact',value:{ phone:'011 555 1234', email:'new@venomracing.co.za',
      address:ADDR, tuningPortal:'https://newportal.example.com/' }},
    {key:'pages',value:{contact:{
      portalText:'Portal tuning card copy.',
      labels:{phone:'PORTAL Phone',phone1:'PORTAL First',phone2:'PORTAL Second',
              email:'PORTAL Email',email1:'PORTAL Gen',email2:'PORTAL Dyno',
              social:'PORTAL Social',portal:'PORTAL Tuning'},
      buttons:{portal:{text:'PORTAL Open It'},directions:{text:'PORTAL Take Me'},submit:{text:'PORTAL Send It'}},
      sections:{hero:{eyebrow:'PORTAL Hi',title:'PORTAL Contact Us',intro:'Portal hero intro.'},
                map:{eyebrow:'',title:'PORTAL Visit Us',intro:'Portal map line.'}}
    }}}
  ],
  'website_services':[
    {id:'a',title:'Portal Service One',division:'Performance',sort_order:0},
    {id:'b',title:'Portal Service Two',division:'Performance',sort_order:1},
    {id:'c',title:'Portal Service Three',division:'Services & Repairs',sort_order:2}]
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
        if(mode==='down')  return Promise.reject(new Error('down'));
        if(mode==='empty') return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve([])});
        const t=String(u).split('/rest/v1/')[1].split('?')[0];
        return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(DATA[t]||[])});
      };
    }});
  const w=dom.window;
  ['utils.js','venom-supabase.js','animations.js','venom-content.js','main.js','forms.js','contact.js','navigation.js']
    .forEach(f=>{ if(!html.includes('assets/js/'+f)) return;
      try{const sc=w.document.createElement('script');
        sc.textContent=fs.readFileSync(PATH_.join(SITE,'assets/js',f),'utf8');
        w.document.body.appendChild(sc);}catch(e){} });
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  setTimeout(()=>res(w.document),600);
});}

(async()=>{
  let bad=0;
  const t=(n,f)=>{try{f();console.log('  ok   '+n)}catch(e){console.log('  FAIL '+n+' -> '+e.message);bad++}};

  console.log('=== LIVE: page copy ===');
  const d=await run('contact.html','ok');
  t('hero heading replaced',()=>{const b=d.querySelector('[data-vr-heading="hero"]');
    if(b.querySelector('h1').textContent!=='PORTAL Contact Us') throw new Error(b.querySelector('h1').textContent);});
  t('map heading replaced',()=>{const b=d.querySelector('[data-vr-heading="map"]');
    if(b.querySelector('h2').textContent!=='PORTAL Visit Us') throw new Error('h2');
    if(!/Portal map line/.test(b.querySelector('p').textContent)) throw new Error('intro');});
  t('all eight block labels replaced',()=>{
    ['phone','phone1','phone2','email','email1','email2','social','portal'].forEach(k=>{
      const e=d.querySelector('[data-vr-label="'+k+'"]');
      if(!/^PORTAL /.test(e.textContent)) throw new Error(k+' is: '+e.textContent);});});
  t('tuning card copy replaced',()=>{
    if(!/Portal tuning card copy/.test(d.querySelector('[data-vr-portal-text]').textContent)) throw new Error('not set');});

  console.log('\n=== LIVE: the page stops carrying its own copies ===');
  t('map iframe follows the portal address',()=>{const f=d.querySelector('[data-vr-map]');
    const src=f.getAttribute('src');
    if(!src.includes(encodeURIComponent(ADDR))) throw new Error(src);
    if(/Industrial/.test(src)) throw new Error('still the old address');});
  t('directions link follows the portal address',()=>{const a=d.querySelector('[data-vr-directions]');
    if(!a.getAttribute('href').includes(encodeURIComponent(ADDR))) throw new Error(a.getAttribute('href'));});
  t('tuning portal link follows Contact Details',()=>{const a=d.querySelector('[data-vr-tuning-portal]');
    if(a.getAttribute('href')!=='https://newportal.example.com/') throw new Error(a.getAttribute('href'));});
  t('service list is built from the portal services',()=>{const s=d.querySelector('[data-vr-services]');
    const opts=[...s.options].map(o=>o.textContent.trim()).filter(x=>x&&!/Select a service/.test(x));
    if(opts.length!==3) throw new Error(opts.length+' options: '+opts.join('|'));
    if(!opts.includes('Portal Service Two')) throw new Error(opts.join('|'));});
  t('the placeholder option survives',()=>{const s=d.querySelector('[data-vr-services]');
    if(!s.querySelector('option[value=""]')) throw new Error('lost "Select a service"');});

  console.log('\n=== LIVE: buttons keep their icons ===');
  t('each button label replaced',()=>{
    const want={portal:'PORTAL Open It',directions:'PORTAL Take Me',submit:'PORTAL Send It'};
    Object.keys(want).forEach(n=>{
      const e=d.querySelector('[data-vr-page-btn="'+n+'"]');
      if(!e.textContent.includes(want[n])) throw new Error(n+': '+e.textContent.trim());});});
  t('the icons inside them survived',()=>{
    ['portal','directions'].forEach(n=>{
      const e=d.querySelector('[data-vr-page-btn="'+n+'"]');
      if(!e.querySelector('svg')) throw new Error(n+' lost its icon');});});

  console.log('\n=== FALLBACK: the page keeps its own ===');
  for(const mode of ['down','empty']){
    const f=await run('contact.html',mode);
    t('['+mode+'] hero intact',()=>{const b=f.querySelector('[data-vr-heading="hero"]');
      if(b.querySelector('h1').textContent!=='Contact Venom Racing') throw new Error('lost');});
    t('['+mode+'] labels intact',()=>{
      if(f.querySelector('[data-vr-label="phone1"]').textContent!=='Primary Contact') throw new Error('lost');});
    t('['+mode+'] map still points somewhere',()=>{const src=f.querySelector('[data-vr-map]').getAttribute('src');
      if(!/Industrial\+Crescent/.test(src)) throw new Error(src);});
    t('['+mode+'] service options intact',()=>{const n=f.querySelectorAll('[data-vr-services] option').length;
      if(n!==9) throw new Error(n+' options');});
    t('['+mode+'] buttons intact',()=>{
      if(!/Open Tuning Portal/.test(f.querySelector('[data-vr-page-btn="portal"]').textContent)) throw new Error('lost');});
  }

  console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
  process.exit(bad?1:0);
})();
