const PATH_=require('path'),fs=require('fs');
const SITE=process.env.SITE_DIR||PATH_.resolve(__dirname,'../../websites/venom-racing-website');
const css=fs.readFileSync(PATH_.join(SITE,'assets/css/variables.css'),'utf8');
const tok={}; [...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].forEach(m=>tok[m[1]]=m[2]);
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255)
  .map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
const bg=tok['color-carbon'];
// Normal-size text usages only; fills and glows are not text.
const pairs=[['color-off-white','body text'],['color-gray-400','secondary text'],
             ['color-gray-500','small muted text'],['color-red-bright','.eyebrow / .text-accent'],
             ['color-success','success'],['color-warning','warning'],['color-error','error']];
let bad=0;
console.log('  background '+bg);
pairs.forEach(([k,label])=>{
  if(!tok[k]) return;
  const r=ratio(tok[k],bg), ok=r>=4.5;
  if(!ok) bad++;
  console.log('  '+(ok?'PASS':'FAIL')+'  '+r.toFixed(2)+':1  '+tok[k]+'  '+label);
});
console.log('\nRESULT: '+(bad?'FAIL='+bad:'PASS'));
process.exit(bad?1:0);
