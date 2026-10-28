/*ENGINE*/
const FN={ROUNDUP:x=>Math.ceil(+(+x).toFixed(9)),MAX:Math.max,MIN:Math.min,POWER:Math.pow,IF:(c,a,b)=>c?a:b,CONCATENATE:(...a)=>a.join('')};
const FNK=Object.keys(FN);
const expand=f=>f.replace(/\{(\w+)#\}/g,(m,id)=>'('+ENV.map(e=>`{${id}:${e[0]}}*{ENVF:${e[0]}}`).join('+')+')');
const keyOf=(id,s,k)=>s==='@'?k:s?s.slice(1):ROWS[id].keys[0];
const tok=/\{(\w+)(@|:\w+)?\}/g;
function makeEngine(){
  const cells={};
  rows.forEach(r=>{if(r.sec)return;r.keys.forEach((k,i)=>{
    if(r.kind==='calc'){const f=Array.isArray(r.f)?r.f[i]:r.f;
      const js=expand(f).replace(/(?<![<>])=/g,'===').replace(/<===/g,'<=').replace(/>===/g,'>=').replace(tok,(m,id,s)=>`v('${id}','${keyOf(id,s,k)}')`);
      cells[r.id+'|'+k]=new Function('v',...FNK,'return '+js);}
  })});
  let memo={},OV={};
  const v=(id,k)=>{const key=id+'|'+k;if(key in memo)return memo[key];
    const c=cells[key];let x;
    if(c)x=c(v,...FNK.map(n=>FN[n]));else{x=id in OV?OV[id]:ROWS[id].val}
    return memo[key]=x};
  return {get:(id,k)=>v(id,k||ROWS[id].keys[0]),set:o=>{OV=o;memo={}},ov:()=>OV};
}
