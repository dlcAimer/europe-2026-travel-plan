import {esc,activeItems,sourceLinks} from '../core.js';
import {STATUS} from '../state/storage.js';

export function packingHTML(plan,store,category='全部',unfinished=false){
  const all=activeItems(plan),eligible=all.filter(p=>p.applicable&&store.data.items[p.id]!=='不适用');
  const packed=eligible.filter(p=>store.data.items[p.id]==='已装包').length;
  const categories=[...new Set(all.map(p=>p.category))];
  const visible=all.filter(p=>(category==='全部'||p.category===category)&&(!unfinished||!['已装包','不适用'].includes(store.data.items[p.id])));
  return `<div class="section-heading inline-heading"><div><span class="eyeline">PACK LIGHT, TRAVEL WELL</span><h2>行李里的安心感</h2></div><div class="progress-number">${packed}<small> / ${eligible.length} 已装包</small></div></div><progress max="${eligible.length||1}" value="${packed}" aria-label="装包进度"></progress><div class="pack-filters"><label>分类 <select id="pack-category">${['全部',...categories].map(c=>`<option ${c===category?'selected':''}>${esc(c)}</option>`).join('')}</select></label><label><input type="checkbox" id="pack-unfinished" ${unfinished?'checked':''}> 只看未完成</label><details class="packing-tools"><summary>保存 / 打印</summary><div><button data-export-state>导出准备状态</button><label class="file-button">导入状态<input type="file" data-import-state accept="application/json"></label><button data-print>精简打印</button></div></details></div><div class="packing-list">${categories.filter(c=>visible.some(p=>p.category===c)).map((c,i)=>{
    const items=visible.filter(p=>p.category===c),categoryEligible=eligible.filter(p=>p.category===c),n=categoryEligible.filter(p=>store.data.items[p.id]==='已装包').length;
    return `<details class="pack-group" data-category="${esc(c)}" ${(category!=='全部'||i===0)?'open':''}><summary><span>${esc(c)}</span><small>${n} / ${categoryEligible.length} 已装包</small></summary>${items.map(p=>`<article class="pack-item"><div><div class="pack-name"><h3>${esc(p.name)}</h3><span class="tag">${esc(p.need)}</span></div><p class="pack-quantity">${esc(p.quantity)}</p><details class="pack-reason"><summary>为什么带 / 怎么带</summary><p>${esc(p.reason)}</p><p class="fine">${esc(p.carry)}</p>${p.activityIds?.length?`<p class="fine">关联：${p.activityIds.map(id=>esc(plan.days.flatMap(d=>d.timeline).find(e=>e.id===id)?.what||'已删除活动')).join('、')}</p>`:''}${p.sourceIds?.length?`<div class="source-note">${sourceLinks(plan,p.sourceIds)}</div>`:''}</details>${!p.applicable?'<p class="notice">关联活动已删减，原状态保留，请重新判断；本项不计进度。</p>':''}</div><label class="pack-status"><span class="sr-only">${esc(p.name)} 准备状态</span><select data-item="${esc(p.id)}">${STATUS.map(s=>`<option ${s===(store.data.items[p.id]||'待准备')?'selected':''}>${s}</option>`).join('')}</select></label></article>`).join('')}</details>`;
  }).join('')||'<p class="empty-state">当前筛选下没有待准备物品。</p>'}</div><details class="packing-assumptions"><summary>数量和行李安排依据</summary><p>${esc(plan.packingNote)}</p></details>`;
}

export function checklistHTML(plan,store,day,ids){
  const tasks=plan.checklist.filter(t=>(!day||t.relevantDates?.includes(day.date)||t.date===day.date)&&(!ids||ids.includes(t.id)));
  return `<div class="checklist">${tasks.map(t=>`<article class="task" data-task-row="${esc(t.id)}"><label><input type="checkbox" data-task="${esc(t.id)}" ${store.data.tasks[t.id]?'checked':''}><span><strong>${esc(t.item)}</strong><small>${esc(t.date)} ${esc(t.time||'')} · ${t.deadlineType==='actual'?'实际期限':'建议处理'}</small></span></label><details class="task-note"><summary>办理要点</summary><p>${esc(t.note)}</p>${t.tz?`<small>${esc(t.tz)}</small>`:''}${t.link?`<a href="${esc(t.link)}" target="_blank" rel="noreferrer">办理 / 查询入口 ↗</a>`:''}</details></article>`).join('')||'<p class="empty-state">当天没有新增必须办理事项，按时间安排出发即可。</p>'}</div>`;
}

export function preparationHTML(plan,store,category,unfinished){
  const priority=plan.meta.priorityTaskIds,rest=plan.checklist.filter(t=>!priority.includes(t.id)).map(t=>t.id);
  return `<header class="page-heading"><p class="eyeline">BEFORE DEPARTURE</p><h1>准备妥当，走得轻一点。</h1><p>先落实接驳和入住，再把行李分组装好。</p></header><section class="prep-tasks"><div class="section-heading inline-heading"><h2>优先处理</h2><span id="task-progress">${plan.checklist.filter(t=>store.data.tasks[t.id]).length} / ${plan.checklist.length} 已处理</span></div>${checklistHTML(plan,store,null,priority)}<details class="more-tasks"><summary>其余 ${rest.length} 项准备 · 预约、票种与复查</summary>${checklistHTML(plan,store,null,rest)}</details></section><section id="packing-view">${packingHTML(plan,store,category,unfinished)}</section>`;
}
