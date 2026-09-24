// This bootstrap is bundled with shared render functions by scripts/export.mjs.
const offlinePlan=JSON.parse(document.querySelector('#plan-data').textContent);
const offlineStore=createStore(offlinePlan.id,()=>{document.querySelector('#offline-warning').hidden=false});
let offlineCategory='全部',offlineUnfinished=false;
function refreshPacking(){const view=document.querySelector('#offline-packing'),groups=[...view.querySelectorAll('.pack-group')],opened=groups.filter(x=>x.open).map(x=>x.dataset.category);view.innerHTML=packingHTML(offlinePlan,offlineStore,offlineCategory,offlineUnfinished);if(groups.length&&offlineCategory==='全部')view.querySelectorAll('.pack-group').forEach(x=>x.open=opened.includes(x.dataset.category));}
refreshPacking();document.querySelector('#offline-tasks').innerHTML=checklistHTML(offlinePlan,offlineStore);
document.addEventListener('change',async e=>{const t=e.target;if(t.dataset.item){offlineStore.set(t.dataset.item,t.value);refreshPacking();}if(t.dataset.task)offlineStore.set(t.dataset.task,t.checked,'tasks');if(t.id==='pack-category'||t.id==='pack-unfinished'){offlineCategory=document.querySelector('#pack-category').value;offlineUnfinished=document.querySelector('#pack-unfinished').checked;refreshPacking();}if(t.hasAttribute('data-import-state')&&t.files[0]){try{offlineStore.import(await t.files[0].text());refreshPacking();document.querySelector('#offline-tasks').innerHTML=checklistHTML(offlinePlan,offlineStore);alert('状态已导入');}catch(err){alert(err.message);}}});
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t)return;if(t.hasAttribute('data-export-state')){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([offlineStore.export()],{type:'application/json'}));a.download='europe-2026-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}if(t.hasAttribute('data-print')){document.body.classList.add('packing-print');window.print();}if(t.hasAttribute('data-print-trip')){document.body.classList.remove('packing-print');window.print();}if(t.dataset.copy){try{await navigator.clipboard.writeText(t.dataset.copy);t.textContent='已复制';}catch{alert('请长按选择地址文字复制');}}});
let printGroups=[];
function preparePrint(){printGroups=[...document.querySelectorAll('.pack-group')].map(x=>[x,x.open]);printGroups.forEach(([x])=>x.open=true);}
window.addEventListener('beforeprint',preparePrint);
window.addEventListener('afterprint',()=>{document.body.classList.remove('packing-print');printGroups.forEach(([x,open])=>x.open=open);});
if(location.hash==='#print-packing'){document.body.classList.add('packing-print');setTimeout(()=>print(),500);}
if(location.hash==='#print')setTimeout(()=>print(),500);
if(new URLSearchParams(location.search).has('print-preview')){document.querySelector('style[media=print]').media='all';if(location.hash==='#packing-preview'){document.body.classList.add('packing-print');preparePrint();}}
