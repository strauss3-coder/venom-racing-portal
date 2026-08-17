const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255)
  .map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
const BG='#0a0a0b';
const hex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const rgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));

function solve(start,target){
  const [r0,g0,b0]=rgb(start);
  // Scale toward white in small steps: preserves hue, minimum visual shift.
  for(let t=0;t<=1;t+=0.005){
    const c=hex(r0+(255-r0)*t, g0+(255-g0)*t, b0+(255-b0)*t);
    if(ratio(c,BG)>=target) return {c,ratio:ratio(c,BG),t:(t*100).toFixed(1)};
  }
  return null;
}
[['--text-3','#767680'],['--accent-2','#e01e2e']].forEach(([name,cur])=>{
  const r=solve(cur,4.5);
  console.log(name.padEnd(12)+cur+'  '+ratio(cur,BG).toFixed(2)+':1  ->  '+r.c+'  '+r.ratio.toFixed(2)+':1   (lightened '+r.t+'% toward white)');
});
