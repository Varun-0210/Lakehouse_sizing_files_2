const {JSDOM}=require('jsdom'),fs=require('fs');
let html=fs.readFileSync(__dirname+'/../../index.html','utf8');const script=html.match(/<script>([\s\S]*)<\/script>/)[1];html=html.replace(/<script[\s\S]*<\/script>/,'');
const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.com/'});const w=dom.window;w.ExcelJS=require('exceljs');let err=null;w.addEventListener('error',e=>{err=e.error||e.message});w.eval(script);
const d=w.document,t=s=>d.querySelector(s).textContent.replace(/\s+/g,' ');
console.log('err',err,'| visible:',[...d.querySelectorAll('.pg')].filter(x=>!x.hidden).map(x=>x.id));
for(const p of ['assumptions','storage','compute','review','bom']){d.querySelector(`[data-page=${p}]`).click();console.log(p,'visible:',[...d.querySelectorAll('.pg')].filter(x=>!x.hidden).map(x=>x.id).join(),'| selected tab:',d.querySelector('[aria-selected=true]').dataset.page)}
d.querySelector('[data-page=storage]').click();console.log('storage tables',d.querySelectorAll('#storageBody table').length,'|',t('#storageBody').slice(0,300));
d.querySelector('[data-page=compute]').click();console.log('compute tables',d.querySelectorAll('#computeBody table').length);
d.querySelector('[data-page=bom]').click();console.log('bom tables',d.querySelectorAll('#bomBody table').length,'|',t('#bomBody').slice(0,420));
console.log('assumption sections',d.querySelectorAll('#assume section').length,'fields',d.querySelectorAll('#assume .f').length);
d.querySelector('[data-kind=env][data-scope=U]').click();d.querySelector('[data-kind=svc][data-scope="0"]').click();
console.log('UAT base BoM:',t('#bomBody').slice(0,500));
d.querySelector('[data-go=review]').click();console.log('after go:',[...d.querySelectorAll('.pg')].filter(x=>!x.hidden).map(x=>x.id).join(),'|',t('#rec'),'err',err);
