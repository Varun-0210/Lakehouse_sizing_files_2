/*UI*/
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const E=makeEngine(),STORE='lakehouse-sizing-v1';
let OV={},scope={env:'all',svc:1},client='',page='inputs';
const PAGES=['inputs','assumptions','storage','compute','review','bom'];
const fmt=(x,n)=>typeof x!=='number'?x:n==='p'?(x*100).toFixed(1)+'%':x.toLocaleString('en-US',{maximumFractionDigits:{i:0,d1:1,d2:2,d3:3}[n]??1,minimumFractionDigits:{d1:1,d2:2,d3:3}[n]||0});
const g=(id,k)=>E.get(id,k);
function apply(){OV.SP=scope.env==='all'||scope.env==='P'?1:0;OV.SU=scope.env==='all'||scope.env==='U'?1:0;OV.SD=scope.env==='all'||scope.env==='D'?1:0;OV.SVC=scope.svc;E.set(OV)}
function save(){try{localStorage.setItem(STORE,JSON.stringify({OV,scope,client,page}))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(STORE)||'null');if(s){OV=s.OV||{};scope=s.scope||scope;client=s.client||'';page=s.page||page}}catch(e){}}
const LIM={I01:[1,1e6],I02:[.01,5e3],I03:[0,2],HOR:[1,10],I09:[1,1e7],DUS:[1,1e6],I11:[0,1e6],OSV:[0,5e3],OHP:[0,5e3],OHR:[0,5e3],OHU:[0,5e3],OHD:[0,5e3],A20:[0,.9]};
const ZERO=['A55','A51','A51b'];
function limit(r){if(LIM[r.id])return LIM[r.id];if(r.n==='p')return[0,1];return[ZERO.includes(r.id)?0:1e-9,1e9]}
const SCOPEIDS=['SP','SU','SD','SVC'],OVRIDS=['OSV','OHP','OHR','OHU','OHD'];
const tip=t=>`<span class="i" tabindex="0" role="img" aria-label="${esc(t)}" data-tip="${esc(t)}">i</span>`;
function field(r){const val=r.id in OV?OV[r.id]:r.val,flag=/^1 =/.test(r.unit),id='p_'+r.id;
  const ctl=flag?`<select id="${id}" data-id="${r.id}"><option value="1"${val==1?' selected':''}>Yes</option><option value="0"${val==0?' selected':''}>No</option></select>`
   :`<input id="${id}" type="number" step="any" inputmode="decimal" data-id="${r.id}" data-p="${r.n==='p'?1:0}" value="${r.n==='p'?+(val*100).toFixed(6):val}">`;
  return `<div class="f"><div class="top"><label class="lb" for="${id}">${esc(r.label)}</label>${r.kind==='as'?`<span class="code">${r.id}</span>`:''}${tip(r.info||r.note||r.label)}</div><span class="ctl">${ctl}<em>${r.n==='p'?'%':flag?'':esc(r.unit)}</em></span><small class="err" hidden></small></div>`}
function buildForms(){
  const GR=[['Your data','How much data you have and how long the platform must last.',['I01','I02','I03','HOR']],['Your users and reports','Who uses the platform and how many reports run.',['I09','DUS','I11']],['Live data and protection','Whether data arrives live and whether a disaster recovery site is needed.',['STR','DR']]];
  $('#inputs').innerHTML=GR.map(x=>`<div class="grp"><h3>${x[0]}</h3><p class="note">${x[1]}</p><div class="grid">${x[2].map(i=>field(ROWS[i])).join('')}</div></div>`).join('');
  $('#ovr').innerHTML=OVRIDS.map(i=>field(ROWS[i])).join('');
  let h='',open=false;rows.filter(r=>r.sheet==='Assumptions').forEach(r=>{
    if(r.sec){if(open)h+='</div></section>';open=r.cols.length===1;if(open)h+=`<section class="panel"><h2>${esc(r.title)}</h2><div class="grid3">`}
    else if(r.kind==='as'&&open)h+=field(r)});
  $('#assume').innerHTML=h+(open?'</div></section>':'')}
const flagged=()=>ENV.map(e=>e[0]).filter(k=>g('ENVF',k)===1);
function table(head,body){return `<div class="sc"><table><thead><tr><th></th>${head.map(h=>`<th class="n">${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`}
function line(label,vals,tot,n,cls){return `<tr class="${cls||''}"><td>${label}</td>${vals.map(v=>`<td class="n">${fmt(v,n)}</td>`).join('')}${tot===null?'':`<td class="n tot">${fmt(tot,n)}</td>`}</tr>`}
const ADD=['TB','drives','VMs','vCPU','GB','hosts'];
function sheetHTML(name){
  const ks=flagged();let out='',cur=null;const flush=()=>{if(cur)out+=cur.h+'</tbody></table></div></section>'};
  rows.filter(r=>r.sheet===name).forEach(r=>{
    if(r.sec){flush();const env=r.cols.length===4,ck=env?r.cols.filter(c=>ks.includes(c[0])):r.cols,multi=env&&ck.length>1;
      cur={ck,multi,h:`<section class="panel"><h2>${esc(r.title)}</h2><div class="sc"><table><thead><tr><th>Item</th>${ck.map(c=>`<th class="n">${c[1]||'Value'}</th>`).join('')}${multi?'<th class="n">Total</th>':''}<th>Unit</th><th>How it is worked out</th></tr></thead><tbody>`};return}
    const vals=cur.ck.map(c=>g(r.id,c[0])),tot=cur.multi&&ADD.includes(r.unit)?fmt(vals.reduce((a,b)=>a+b,0),r.n):'';
    cur.h+=`<tr><td>${esc(r.label.trim())}</td>${vals.map(v=>`<td class="n">${fmt(v,r.n)}</td>`).join('')}${cur.multi?`<td class="n tot">${tot}</td>`:''}<td class="mut">${esc(r.unit)}</td><td class="basis">${esc(r.note||'')}</td></tr>`});
  flush();return out}
function show(p,noScroll){if(!PAGES.includes(p))p='inputs';page=p;
  PAGES.forEach(x=>{$('#pg-'+x).hidden=x!==p;$('[data-page='+x+']').setAttribute('aria-selected',String(x===p))});
  try{history.replaceState(null,'','#'+p)}catch(e){}if(!noScroll)window.scrollTo(0,0);save()}
function render(){
  const ks=flagged(),names=ks.map(k=>ENV.find(e=>e[0]===k)[1]),multi=ks.length>1,head=multi?[...names,'Total']:names;
  const row=(id,n,cls,skip0)=>{const v=ks.map(k=>g(id,k));if(skip0&&v.every(x=>!x))return'';return line(ROWS[id].label.trim(),v,multi?v.reduce((a,b)=>a+b,0):null,n||ROWS[id].n,cls)};
  const cards=[['Processing power',g('TVCPU'),'i','vCPU (virtual processors)','Total virtual CPUs for all virtual machines in the selected scope.'],['Memory',g('TMEM'),'i','GB','Total memory for all virtual machines in the selected scope.'],['Physical servers',g('THOST'),'i','including spare servers','Servers needed to run the virtual machines, plus a spare so one can fail without an outage.'],['Usable storage',g('TUSE'),'d1','TB at year '+g('HOR'),'Object storage the data occupies at the end of the planning horizon.'],['Raw storage',g('TRAW'),'d1','TB installed','Disk capacity to buy after data protection and free-space reserve.']];
  $('#rec').textContent='For '+(client||'your organisation')+', we recommend '+fmt(g('THOST'),'i')+' physical server'+(g('THOST')===1?'':'s')+' ('+fmt(g('TVCPU'),'i')+' vCPU and '+fmt(g('TMEM')/1024,'d1')+' TB of memory) with '+fmt(g('TUSE'),'d1')+' TB of usable storage ('+fmt(g('TRAW'),'d1')+' TB raw), sized for year '+g('HOR')+'.';
  $('#cards').innerHTML=cards.map(c=>`<div class="card"><div class="top"><span>${c[0]}</span>${tip(c[4])}</div><b>${fmt(c[1],c[2])}</b><small>${c[3]}</small></div>`).join('');
  $('#scopeLine').textContent=g('CLUS')+' · '+g('SCOPE').trim();
  $('#compute').innerHTML=table(head,row('VMS')+row('VMK',0,'',1)+row('VMV',0,'',1)+row('VMP',0,'',1)+row('VMM',0,'',1)+row('VMT',0,'sub')+row('VCPU',0,'sub')+row('MEM',0,'sub')+row('HOST',0,'sub')+(OVRIDS.slice(1).some(i=>OV[i]>0)?row('HOSTR'):''));
  $('#ovnote').textContent=OV.OSV>0?'Spark pool fixed at '+OV.OSV+' VMs in Production (calculated need: '+g('POOLR')+'). UAT, Dev and DR follow the fixed value.':'';
  $('#storage').innerHTML=table(head,row('EUSE')+row('ENVM')+row('ENLS')+row('RAWT',0,'sub')+row('DRVN')+row('DRVL')+row('KAFS',0,'',1)+(scope.svc?row('PGS'):''));
  const sp=[['Production usable storage, go-live to year '+g('HOR'),fmt(g('PROD','Y0'),'d1')+' TB to '+fmt(g('PROD','YN'),'d1')+' TB'],['Physical server specification',g('HSPEC')],['DR replication link',ks.includes('R')?g('DRTXT')+' ('+fmt(g('DRLINK'),'d1')+' Gbps design)':'Not in scope'],['Storage front-end',g('FETXT')],['Overnight processing time, normal night / month-end',fmt(g('BT'),'d1')+' h / '+fmt(g('BTM'),'d1')+' h'],['Live-feed (Kafka) servers per site',g('BROK')+(g('BROK')?'':' (batch only)')]];
  $('#spec').innerHTML=sp.map(s=>`<div><span>${s[0]}</span><b>${esc(s[1])}</b></div>`).join('');
  $('#checks').innerHTML=['CK2','CK3','CK4','CK5','CK6'].map(i=>{const ok=g(i)==='OK';return `<li class="${ok?'ok':'warn'}"><i>${ok?'✓':'!'}</i>${esc(ROWS[i].label)}${ok?'':': <b>'+esc(g(i))+'</b>'}</li>`}).join('');
  document.querySelectorAll('[data-scope]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scope===(b.dataset.kind==='env'?scope.env:String(scope.svc)))));
  $('#svcNote').textContent=scope.svc?'Adds the platform services pool (governance, Airflow, Kyuubi, Superset, BIRT, APIs, identity, observability, catalogue, Kafka Connect) and both PostgreSQL HA pairs.':'Object storage, Spark pool and Kafka brokers only. No platform services or PostgreSQL VMs.';
  document.querySelectorAll('.f').forEach(l=>{const i=l.querySelector('[data-id]'),id=i.dataset.id;l.classList.toggle('chg',id in OV&&OV[id]!==ROWS[id].val)});
  $('#storageBody').innerHTML=sheetHTML('Storage');$('#computeBody').innerHTML=sheetHTML('Compute');$('#bomBody').innerHTML=sheetHTML('BoM');$('#ovnote2').textContent=$('#ovnote').textContent;
  save()}
async function download(){
  const btn=$('#dl'),msg=$('#msg');btn.disabled=true;msg.textContent='Building workbook…';
  try{const d=new Date(),meta={client:client||'Client',date:d.toISOString().slice(0,10)};
    const wb=await buildWorkbook(ExcelJS,E,meta),buf=await wb.xlsx.writeBuffer(),
      blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
      name='Lakehouse_Sizing_'+(client||'Client').replace(/[^\w-]+/g,'_')+'_'+meta.date+'.xlsx';
    const dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;
    if(dl){await dl.save({filename:name,data:blob});msg.textContent='Saved '+name}
    else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();msg.textContent='Downloaded '+name}
  }catch(e){msg.textContent=e&&e.code==='declined'?'Download cancelled.':'Could not create the workbook'+(e&&e.message?': '+e.message:'.')}
  btn.disabled=false}
function init(){
  load();apply();buildForms();render();$('#gloss').innerHTML=GLOSSARY.map(x=>`<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('');
  $('#client').value=client;$('#client').addEventListener('input',e=>{client=e.target.value;render()});
  document.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.kind==='env')scope.env=b.dataset.scope;else scope.svc=+b.dataset.scope;apply();render()}));
  document.addEventListener('change',e=>{const t=e.target,id=t.dataset&&t.dataset.id;if(!id)return;let x=parseFloat(t.value);if(isNaN(x))return;if(t.dataset.p==='1')x=x/100;const r=ROWS[id],L=limit(r),er=t.closest('.f').querySelector('.err');if(x<L[0]-1e-12||x>L[1]+1e-12){er.hidden=false;er.textContent='Please enter a value between '+(r.n==='p'?L[0]*100+'% and '+L[1]*100+'%':L[0]<1&&L[0]>0?'0.01 and '+L[1]:Math.ceil(L[0])+' and '+L[1].toLocaleString('en-US'));t.setAttribute('aria-invalid','true');return}er.hidden=true;t.removeAttribute('aria-invalid');OV[id]=x;apply();render()});
  $('#reset').addEventListener('click',()=>{OV={};buildForms();apply();render()});
  $('#dl').addEventListener('click',download);$('#dl2').addEventListener('click',download);
  document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.page)));
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.go)));
  show((location.hash||'').slice(1)||page,true)}
