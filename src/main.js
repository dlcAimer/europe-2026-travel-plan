import {localDate,localTime,tripZone,todayContext} from './core.js';
import {createStore} from './state/storage.js';
import {hotelHTML} from './views/day.js';
import {routeMap} from './views/map.js';
import {packingHTML,checklistHTML,preparationHTML} from './views/preparation.js';
import {budgetHTML} from './views/budget.js';
import {overviewHTML,cityChapter} from './views/overview.js';
import {todayHTML,eventDetailHTML} from './views/today.js';
import {sourcesHTML} from './views/reference.js';

const content=document.querySelector('#content');
const tabs=['overview','today','prep','budget','sources'];
let plan,store,tab='overview',selected,manual=false,selectedPlace=null;
let packCategory='全部',unfinished=false,scene=null,chapter='ams',sceneGeneration=0,renderedNextId;
const toast=text=>{
  const t=document.querySelector('#toast');t.textContent=text;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
};

function render(){
  sceneGeneration++;scene?.dispose();scene=null;
  document.querySelectorAll('.main-nav [data-tab]').forEach(b=>b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false'));
  const day=plan.days.find(d=>d.date===selected);
  if(tab==='overview'){content.innerHTML=overviewHTML(plan,store,chapter);loadScene(sceneGeneration);}
  if(tab==='today'){
    const context=todayContext(plan,selected,manual);renderedNextId=context.next?.id;
    content.innerHTML=todayHTML(plan,store,day,context,selectedPlace);
  }
  if(tab==='prep')content.innerHTML=preparationHTML(plan,store,packCategory,unfinished);
  if(tab==='budget')content.innerHTML=budgetHTML(plan);
  if(tab==='sources')content.innerHTML=sourcesHTML(plan);
  document.querySelector('.date-strip [aria-pressed=true]')?.scrollIntoView({block:'nearest',inline:'center'});
}

async function loadScene(generation){
  const host=document.querySelector('#scene-host');
  try{
    const {createScene}=await import('./scenes/scene.js');
    if(!host.isConnected||generation!==sceneGeneration)return;
    const created=await createScene(host,chooseCity,true);
    if(!host.isConnected||generation!==sceneGeneration){created.dispose();return;}
    scene=created;let active=false;
    document.querySelector('#scene-activate').onclick=()=>{
      active=!active;scene.activate(active);
      document.querySelector('#scene-activate').textContent=active?'结束旋转':'旋转建筑';
      document.querySelector('#scene-activate').setAttribute('aria-pressed',active);
    };
    document.querySelector('#scene-minus').onclick=()=>scene.zoom(-.2);
    document.querySelector('#scene-plus').onclick=()=>scene.zoom(.2);
    document.querySelector('#scene-reset').onclick=()=>scene.reset();
    window.travelScene=scene;
  }catch(error){
    if(host.isConnected)host.innerHTML='<img src="./assets/previews/cover.png" alt="建筑静态预览"><p class="fine">3D暂不可用，行程与导航仍可使用。</p>';
    console.warn(error);
  }
}

function chooseTab(next){tab=next;location.hash=tab;render();window.scrollTo(0,0);}
function chooseDay(date,preview=true){
  if(!plan.days.some(d=>d.date===date))return;
  selected=date;manual=preview;selectedPlace=null;store.remember(date);chooseTab('today');
}
function chooseCity(id){
  const day=plan.days.find(d=>d.chapterId===id)||plan.days.find(d=>d.hotelId==='hotel-'+id);
  if(day)chooseDay(day.date);
}
function showDetail(html,opener){
  const dialog=document.querySelector('#detail-dialog');
  dialog.innerHTML=`<button class="dialog-close" data-close-dialog aria-label="关闭详情">×</button><div class="dialog-content">${html}</div>`;
  dialog.querySelectorAll('.event details').forEach(d=>d.open=true);
  dialog.showModal();dialog.addEventListener('close',()=>opener?.focus(),{once:true});
}
function focusPlace(id,fromMap){
  selectedPlace=id;
  const map=document.querySelector('#day-map');if(!map)return;
  map.innerHTML=routeMap(plan,plan.days.find(d=>d.date===selected),id);
  document.querySelectorAll('.event,.focus-card').forEach(e=>e.classList.toggle('is-focused',e.dataset.place===id));
  if(fromMap){
    const focus=[...document.querySelectorAll('.focus-card')].find(e=>e.dataset.place===id);
    const event=[...document.querySelectorAll('#full-timeline .event')].find(e=>e.dataset.place===id);
    if(!focus&&event)document.querySelector('#full-timeline').open=true;
    (focus||event||map).scrollIntoView({behavior:'instant',block:'center'});
  }else{
    map.classList.add('is-open');
    const toggle=document.querySelector('[data-map-toggle]');
    if(toggle){toggle.setAttribute('aria-expanded','true');toggle.textContent='收起地图';}
    map.scrollIntoView({behavior:'instant',block:'center'});
  }
}
function download(name,text){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function refreshPacking(){
  const view=document.querySelector('#packing-view');
  const opened=[...view.querySelectorAll('.pack-group[open]')].map(d=>d.dataset.category);
  const focused=document.activeElement?.dataset.item;
  view.innerHTML=packingHTML(plan,store,packCategory,unfinished);
  view.querySelectorAll('.pack-group').forEach(d=>d.open=opened.includes(d.dataset.category));
  if(focused)[...view.querySelectorAll('[data-item]')].find(x=>x.dataset.item===focused)?.focus();
}

document.addEventListener('click',async ev=>{
  const el=ev.target.closest('button,a');if(!el)return;
  if(el.dataset.tab)chooseTab(el.dataset.tab);
  if(el.dataset.day)chooseDay(el.dataset.day);
  if(el.dataset.city){ev.preventDefault();chooseCity(el.dataset.city);}
  if(el.dataset.chapter){
    chapter=el.dataset.chapter;
    document.querySelectorAll('[data-chapter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.chapter===chapter));
    document.querySelector('#city-chapter').innerHTML=cityChapter(plan,chapter);
  }
  if(el.dataset.action==='tomorrow'){
    const i=plan.days.findIndex(d=>d.date===selected);chooseDay(plan.days[Math.min(i+1,plan.days.length-1)].date);
  }
  if(el.dataset.action==='now'){
    const d=localDate(new Date(),tripZone(plan));chooseDay(plan.days.some(x=>x.date===d)?d:plan.days[0].date,false);
  }
  if(el.dataset.copy!==undefined){
    try{await navigator.clipboard.writeText(el.dataset.copy);toast('地址已复制');}
    catch{toast('复制不可用，请长按选择地址文字');}
  }
  if(el.dataset.event)showDetail(eventDetailHTML(plan,el.dataset.event),el);
  if(el.dataset.hotel)showDetail(`<h2 id="detail-title">今晚住宿</h2>${hotelHTML(plan,{hotelId:el.dataset.hotel})}`,el);
  if(el.hasAttribute('data-close-dialog'))document.querySelector('#detail-dialog').close();
  if(el.hasAttribute('data-map-toggle')){
    const open=document.querySelector('#day-map').classList.toggle('is-open');
    el.setAttribute('aria-expanded',open);el.textContent=open?'收起地图':'展开地图';
  }
  if(el.dataset.sideJump){
    const target=el.dataset.sideJump==='map'?document.querySelector('#day-map'):document.querySelector('.side-tasks');
    if(el.dataset.sideJump==='map'){
      target.classList.add('is-open');
      const toggle=document.querySelector('[data-map-toggle]');toggle.setAttribute('aria-expanded','true');toggle.textContent='收起地图';
    }else{target.querySelector('details').open=true;}
    target.scrollIntoView({block:'start'});
  }
  if(el.dataset.placeFocus){ev.preventDefault();document.querySelector('#detail-dialog').close();focusPlace(el.dataset.placeFocus,!!el.closest('#day-map'));}
  if(el.dataset.taskJump){
    chooseTab('prep');const row=[...document.querySelectorAll('[data-task-row]')].find(x=>x.dataset.taskRow===el.dataset.taskJump);
    if(row){const details=row.closest('details');if(details)details.open=true;row.scrollIntoView({block:'center'});row.querySelector('input')?.focus();}
  }
  if(el.hasAttribute('data-export-state'))download('europe-2026-progress.json',store.export());
  if(el.hasAttribute('data-print'))window.open('./exports/offline.html#print-packing','_blank');
});
document.addEventListener('change',async ev=>{
  const t=ev.target;
  if(t.id==='date-select')chooseDay(t.value);
  if(t.dataset.item){store.set(t.dataset.item,t.value);refreshPacking();}
  if(t.dataset.task){
    store.set(t.dataset.task,t.checked,'tasks');
    document.querySelectorAll(`[data-task="${t.dataset.task}"]`).forEach(x=>x.checked=t.checked);
    const count=document.querySelector('#task-progress');
    if(count)count.textContent=`${plan.checklist.filter(x=>store.data.tasks[x.id]).length} / ${plan.checklist.length} 已处理`;
    const side=document.querySelector('.side-tasks h2');
    if(side){const day=plan.days.find(d=>d.date===selected);const n=plan.checklist.filter(x=>(x.relevantDates?.includes(day.date)||x.date===day.date)&&!store.data.tasks[x.id]).length;side.textContent=n?`${n} 项待处理`:'当天事项已就绪';}
  }
  if(t.id==='pack-category'||t.id==='pack-unfinished'){
    packCategory=document.querySelector('#pack-category').value;unfinished=document.querySelector('#pack-unfinished').checked;
    document.querySelector('#packing-view').innerHTML=packingHTML(plan,store,packCategory,unfinished);
  }
  if(t.hasAttribute('data-import-state')&&t.files[0]){
    try{store.import(await t.files[0].text());render();toast('准备状态已导入');}catch(error){toast(error.message);}
  }
});
document.addEventListener('input',ev=>{
  if(ev.target.id!=='source-search')return;
  const query=ev.target.value.trim().toLowerCase();let count=0;
  document.querySelectorAll('[data-source-title]').forEach(el=>{el.hidden=!el.dataset.sourceTitle.includes(query);if(!el.hidden)count++;});
  document.querySelector('#source-empty').hidden=count>0;
});
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(tabs.includes(h)&&h!==tab){tab=h;render();}});

try{
  plan=await(await fetch('./data/plan.geo.json')).json();
  store=createStore(plan.id,()=>document.querySelector('#storage-warning').hidden=false);
  const now=localDate(new Date(),tripZone(plan));
  selected=plan.days.some(d=>d.date===now)?now:plan.days.some(d=>d.date===store.data.lastDate)?store.data.lastDate:plan.days[0].date;
  tab=tabs.includes(location.hash.slice(1))?location.hash.slice(1):'overview';
  document.querySelector('.trip-period').textContent=plan.meta.dates;render();
  setInterval(()=>{
    if(tab!=='today'||manual||document.querySelector('#detail-dialog').open)return;
    const context=todayContext(plan,selected,manual);if(!context.live)return;
    document.querySelector('#local-clock').textContent=`${context.tz} ${localTime(new Date(),context.tz)}`;
    if(context.next?.id!==renderedNextId){
      const scroll=window.scrollY,opened=[...content.querySelectorAll('details[open]')].map(x=>x.querySelector('summary')?.textContent);
      render();content.querySelectorAll('details').forEach(x=>x.open=opened.includes(x.querySelector('summary')?.textContent));window.scrollTo(0,scroll);
    }
  },60000);
  window.travelApp={plan,store,select:chooseDay};
}catch(error){
  content.innerHTML='<p>行程文件未能加载。请通过 npm start 启动，或直接打开 exports/offline.html。</p>';console.error(error);
}
