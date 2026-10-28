const fs=require('fs'),ExcelJS=require('exceljs');
eval(fs.readFileSync(__dirname+'/../model.js','utf8')+fs.readFileSync(__dirname+'/../engine.js','utf8')+fs.readFileSync(__dirname+'/../export.js','utf8')+';global.E=makeEngine();global.rows=rows;global.layoutRows=layoutRows;');
(async()=>{
 const scen={base:{},uat_base:{SP:0,SD:0,SVC:0},dev_svc:{SP:0,SU:0,SVC:1},batch_all:{STR:0,I01:400,I02:12,I09:9000,HOR:5,DR:0},fixed:{OSV:6,OHP:4,OHU:2,OHR:1},big:{I01:900,I02:30,I03:0.4,I11:8000}};
 for(const [n,o] of Object.entries(scen)){E.set(o);const wb=await buildWorkbook(ExcelJS,E,{client:'Test',date:'2026-10-22'});
  await wb.xlsx.writeFile(`/tmp/t_${n}.xlsx`);
  // save expected values
  const exp={};rows.forEach(r=>{if(r.sec)return;r.keys.forEach(k=>{exp[r.sheet+'|'+r._row+'|'+k]=E.get(r.id,k)})});
  fs.writeFileSync(`/tmp/t_${n}.json`,JSON.stringify({exp,keys:Object.fromEntries(rows.filter(r=>!r.sec).map(r=>[r.sheet+'|'+r._row,r.keys]))}));}
 console.log('written');
})();
