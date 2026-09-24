import {esc,localTime,navigateLink,mapLink} from '../core.js';
import {addressHTML,hotelHTML,timelineHTML} from './day.js';
import {focusEvents,focusHTML,tipsHTML,diningHTML} from './editorial.js';
import {routeMap} from './map.js';
import {checklistHTML} from './preparation.js';

function dateStrip(plan,selected){
  return `<div class="day-switcher"><div class="date-controls"><label class="sr-only" for="date-select">选择日期</label><select id="date-select">${plan.days.map(d=>`<option value="${d.date}" ${d.date===selected?'selected':''}>${d.date.slice(5)} ${esc(d.city)}</option>`).join('')}</select><button data-action="now">返回今日</button><button data-action="tomorrow" ${selected===plan.days.at(-1).date?'disabled':''}>下一天 →</button></div><div class="date-strip" aria-label="每日行程">${plan.days.map((d,i)=>`<button data-day="${d.date}" aria-pressed="${d.date===selected}"><small>${d.date.slice(5).replace('-','/')}</small><strong>DAY ${String(i+1).padStart(2,'0')}</strong></button>`).join('')}</div></div>`;
}

export function todayHTML(plan,store,day,context,selectedPlace){
  const focus=focusEvents(day),e=context.live?context.next:(focus.find(e=>e.fixed)||focus[0]);
  const h=plan.hotels.find(h=>h.id===day.hotelId),hp=plan.places.find(p=>p.id===h?.placeId);
  const tasks=plan.checklist.filter(t=>t.relevantDates?.includes(day.date)||t.date===day.date);
  const pending=tasks.filter(t=>!store.data.tasks[t.id]);
  const dayNumber=String(plan.days.indexOf(day)+1).padStart(2,'0');
  return `${dateStrip(plan,day.date)}<header class="day-heading"><div><p class="eyeline">DAY ${dayNumber} <span class="eyeline-divider">/</span> ${esc(day.city)}</p><h1>${esc(day.editorial?.headline||day.label)}</h1><p class="day-deck">${esc(day.editorial?.summary||day.ribbon)}</p></div><div class="day-status"><span id="local-clock">${context.live?`${esc(context.tz)} ${localTime(new Date(),context.tz)}`:context.phase==='before'?'行前预览':'手动预览'}</span><small>当地时间 · ${esc(day.date)}<br>计划不代表实际进度</small></div></header>
  <div class="action-strip"><div class="action-depart"><span>${context.live?'按计划的下一步':'今天的关键安排'}</span><h2>${esc(e?.displayTitle||e?.what||'今天已无后续安排')}</h2><strong>${esc(e?.t||'自由休息')}</strong>${e?`<button class="text-button" data-event="${esc(e.id)}">地址与细节 ↗</button>`:''}</div><div class="action-leave"><span>建议出门</span><p>${esc(day.leaveBy)}</p>${e&&navigateLink(plan,e)?`<a href="${esc(navigateLink(plan,e))}" target="_blank" rel="noreferrer">打开导航 ↗</a>`:''}</div><div class="action-stay"><span>今晚落脚</span><p>${esc(h?.name||day.overnight||'按交通安排')}</p>${h?`<button class="text-button" data-hotel="${esc(h.id)}">入住 / 地址 ↗</button>`:''}</div></div>
  <div class="day-utility"><button data-side-jump="map">⌖ 路线与地图</button><button data-side-jump="tasks">${pending.length} 项当天待办 ↗</button></div>
  <div class="day-workspace"><div class="day-main"><section><div class="section-heading inline-heading"><div><span class="eyeline">TODAY'S PICKS</span><h2>只记住这 ${focus.length} 件事</h2></div><span class="walking-meta">步行约 ${esc(day.walking_km?.total??'—')} km</span></div>${focusHTML(plan,day)}<details class="timeline-disclosure" id="full-timeline"><summary><span>完整时间轴</span><small>${day.timeline.filter(e=>e.enabled!==false).length} 项 · 餐食、接驳与休息</small></summary>${timelineHTML(plan,day)}</details></section>${tipsHTML(plan,day)}${diningHTML(plan,day)}<section class="plan-b"><div class="section-heading"><span class="eyeline">ROOM TO CHANGE</span><h2>计划赶不上时</h2></div><div class="plan-b-options"><details open><summary>晚出门 / 体力不足</summary><p>${esc(day.late_cut)}</p></details><details><summary>下雨 / 预约失败</summary><p>${esc(day.rain_alt)}</p></details></div></section></div>
  <aside class="day-sidebar"><section class="side-card"><div class="section-heading inline-heading"><h2>当天路线</h2><button class="text-button" data-map-toggle aria-expanded="false">展开地图</button></div><div id="day-map" class="map-container">${routeMap(plan,day,selectedPlace)}</div><p class="side-note">${esc(day.ribbon)}</p></section><section class="side-card side-tasks"><div class="section-heading"><span class="eyeline">DON'T FORGET</span><h2>${pending.length?`${pending.length} 项待处理`:'当天事项已就绪'}</h2></div><details ${pending.length?'open':''}><summary>${tasks.length?'当天必须处理':'查看准备提示'}</summary>${checklistHTML(plan,store,day)}</details></section><section class="side-card weather-note"><span class="eyeline">WEATHER NOTE</span><p>${esc(day.weather?.summary||'出发前复查天气')}</p><small>根据天气与体力删减可选段落。</small></section></aside></div>`;
}

export function eventDetailHTML(plan,id){
  const day=plan.days.find(d=>d.timeline.some(e=>e.id===id));
  if(!day)return '';
  const e=day.timeline.find(e=>e.id===id);
  return `<p class="eyeline">${esc(day.date)} · 当地时间</p><h2 id="detail-title">${esc(e.displayTitle||e.what)}</h2>${timelineHTML(plan,{...day,timeline:[e]})}`;
}
