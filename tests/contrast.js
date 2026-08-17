const PATH_=require('path'),fs=require('fs');
const PORTAL=process.env.PORTAL_DIR||PATH_.resolve(__dirname,'..');
const s=fs.readFileSync(PATH_.join(PORTAL,'index.html'),'utf8');
const css=s.slice(s.indexOf(':root{'), s.indexOf('*,*::before'));
const tok={}; [...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].forEach(m=>tok[m[1]]=m[2]);
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255)
  .map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05));};
const bg=tok['bg'];
const pairs=[['text','body text',4.5],['text-2','secondary text',4.5],['text-3','muted text',4.5],
             ['accent-2','links / accents',4.5],['success','success text',4.5],
             ['warning','warning text',4.5],['danger','danger text',4.5]];
let bad=0;
console.log('  background '+bg);
pairs.forEach(([k,label,min])=>{
  if(!tok[k]) return;
  const r=ratio(tok[k],bg);
  const ok=r>=min;
  if(!ok) bad++;
  console.log('  '+(ok?'PASS':'FAIL')+'  '+r.toFixed(2)+':1  '+tok[k]+'  '+label+' (needs '+min+')');
});
console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
process.exit(0);
