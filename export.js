/*EXPORT*/
const NF={i:'#,##0',d1:'#,##0.0',d2:'#,##0.00',d3:'0.000',p:'0.0%'};
const col=i=>String.fromCharCode(67+i);
function layoutRows(){const addr={},cnt={};
  rows.forEach(r=>{const s=r.sheet;cnt[s]=(cnt[s]||3)+(r.sec&&cnt[s]>3?2:1);r._row=cnt[s];
    if(!r.sec)addr[r.id]={sheet:s,row:r._row,cols:Object.fromEntries(r.keys.map((k,i)=>[k,col(i)]))}});
  return addr}
function xlFormula(f,from,key,addr){
  return expand(f).replace(tok,(m,id,s)=>{const a=addr[id],k=keyOf(id,s,key);
    return (a.sheet===from?'':a.sheet+'!')+'$'+a.cols[k]+'$'+a.row})}
async function buildWorkbook(ExcelJS,E,meta){
  const addr=layoutRows(),wb=new ExcelJS.Workbook();wb.calcProperties={fullCalcOnLoad:true};
  const order=['Summary','Inputs','Assumptions','Storage','Compute','BoM'],ws={};
  const titles={Summary:'Recommended sizing',Inputs:'Client inputs and scope',Assumptions:'Engineering assumptions',Storage:'Storage sizing (decimal TB)',Compute:'Compute, streaming, serving and network (Production)',BoM:'Bill of materials by environment'};
  const F='Arial',purple='FF3D145F';
  order.forEach(n=>{const w=wb.addWorksheet(n);ws[n]=w;
    [8,58,14,14,14,14,16,80].forEach((x,i)=>w.getColumn(i+1).width=x);
    w.getCell('A1').value=(n==='Summary'?(meta.client||'Client')+' | ':'')+titles[n];w.getCell('A1').font={name:F,size:14,bold:true,color:{argb:purple}};
    w.getCell('A2').value=n==='Summary'?'Prepared by Translab Technologies | '+meta.date+' | Planning figures from the Tantor lakehouse sizing model; confirm with a proof of concept':'Blue = client input. Blue on yellow = Translab assumption (edit it and the workbook recalculates). Black = formula. Green = link to another sheet.';
    w.getCell('A2').font={name:F,size:9,italic:true,color:{argb:'FF595959'}}});
  const gs=wb.addWorksheet('Glossary');gs.getColumn(1).width=32;gs.getColumn(2).width=110;
  gs.getCell('A1').value='Glossary';gs.getCell('A1').font={name:F,size:14,bold:true,color:{argb:purple}};
  GLOSSARY.forEach((x,i)=>{gs.getCell(3+i,1).value=x[0];gs.getCell(3+i,1).font={name:F,size:10,bold:true};gs.getCell(3+i,2).value=x[1];gs.getCell(3+i,2).font={name:F,size:10}});
  rows.forEach(r=>{const w=ws[r.sheet],R=r._row;
    if(r.sec){for(let c=1;c<=8;c++){const x=w.getCell(R,c);x.fill={type:'pattern',pattern:'solid',fgColor:{argb:purple}};x.font={name:F,size:10,bold:true,color:{argb:'FFFFFFFF'}}}
      w.getCell(R,1).value=r.title;r.cols.forEach((c,i)=>{if(c[1])w.getCell(R,3+i).value=c[1]});w.getCell(R,7).value='Unit';w.getCell(R,8).value='Basis';return}
    w.getCell(R,1).value=r.id;w.getCell(R,2).value=r.label;w.getCell(R,7).value=r.unit;w.getCell(R,8).value=r.note||'';
    [1,2,7,8].forEach(c=>w.getCell(R,c).font={name:F,size:10,color:{argb:c===1?'FF595959':'FF000000'}});
    r.keys.forEach((k,i)=>{const x=w.getCell(R,3+i),val=E.get(r.id,k);x.numFmt=NF[r.n]||'General';x.alignment={horizontal:'right'};
      if(r.kind==='calc'){const f=xlFormula(Array.isArray(r.f)?r.f[i]:r.f,r.sheet,k,addr);
        x.value={formula:f,result:val};
        x.font={name:F,size:10,color:{argb:/^(\w+!)?\$[A-Z]+\$\d+$/.test(f)&&f.includes('!')?'FF008000':'FF000000'}}}
      else{x.value=val;x.font={name:F,size:10,color:{argb:'FF0000FF'}};
        if(r.kind==='as')x.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFF00'}}}
      if(typeof val==='string')x.alignment={horizontal:'left'}})});
  return wb}
