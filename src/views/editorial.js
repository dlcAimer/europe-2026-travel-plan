import {esc,sourceLinks,mapLink,navigateLink} from '../core.js';

export function focusEvents(day){
  const active=day.timeline.filter(e=>e.enabled!==false);
  const ids=day.editorial?.focusEventIds||[];
  return ids.map(id=>active.find(e=>e.id===id)).filter(Boolean);
}

export function focusHTML(plan,day){
  return `<div class="focus-list">${focusEvents(day).map((e,i)=>{
    const p=plan.places.find(p=>p.id===e.placeId),link=navigateLink(plan,e);
    return `<article class="focus-card" data-place="${esc(e.placeId)}"><div class="focus-ordinal">${String(i+1).padStart(2,'0')}</div><div class="focus-body"><div class="focus-top"><time>${esc(e.t)}</time><span class="status-dot ${e.fixed?'confirmed':''}">${e.fixed?'已确认':e.tag==='skippable'?'可删减':'建议安排'}</span></div><h3>${esc(e.displayTitle||e.what)}</h3><p>${esc(e.takeaway||e.note)}</p><div class="focus-actions"><button class="text-button" data-event="${esc(e.id)}">查看细节 <span>↗</span></button>${link?`<a href="${esc(link)}" target="_blank" rel="noreferrer">${e.kind==='hop'?'这段导航':'地点导航'} ↗</a>`:''}${p?`<button class="map-pin-button" data-place-focus="${esc(p.id)}" aria-label="在图中查看${esc(p.name)}">⌖</button>`:''}</div></div></article>`;
  }).join('')}</div>`;
}

const tip=(plan,t)=>`<article class="field-tip"><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p><details class="evidence"><summary>依据</summary>${sourceLinks(plan,t.sourceIds)}</details></article>`;
export function tipsHTML(plan,day){
  const tips=day.editorial?.tips||[];
  if(!tips.length)return '';
  return `<section class="field-notes"><div class="section-heading"><span class="eyeline">FIELD NOTES</span><h2>到了以后，怎么逛</h2></div><div class="tip-grid">${tips.slice(0,2).map(t=>tip(plan,t)).join('')}</div>${tips.length>2?`<details class="more-notes"><summary>再看 ${tips.length-2} 条路线与现场提示</summary><div class="tip-grid">${tips.slice(2).map(t=>tip(plan,t)).join('')}</div></details>`:''}</section>`;
}

function restaurant(plan,r,backup=false){
  if(!r)return '';
  const fields=x=>Array.isArray(x)?x.join('；'):x||'';
  return `<article class="restaurant ${backup?'backup':''}"><span class="eyeline">${backup?'就近备选':'顺路吃这一家'}</span><h3>${esc(r.name)}</h3><p class="dining-order">${esc(r.whatToOrder)}</p><p>${esc(r.fit)}</p><div class="restaurant-actions"><a href="${esc(mapLink({localName:r.name,address:r.address}))}" target="_blank" rel="noreferrer">${esc(r.address)} ↗</a></div><details><summary>营业依据与待核字段</summary><p>${esc(fields(r.verifiedFields))}</p><p class="fine">出发前再查：${esc(fields(r.uncertainFields))}</p><p class="source-note">${sourceLinks(plan,r.sourceIds)}</p>${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noreferrer">餐厅官网 / 菜单 ↗</a>`:''}</details></article>`;
}
export function diningHTML(plan,day){
  if(!day.dining?.primary)return '';
  const eventId=day.dining.primary.eventId;
  if(eventId&&!day.timeline.some(e=>e.id===eventId&&e.enabled!==false))return '';
  return `<section class="dining-section"><div class="section-heading"><span class="eyeline">AT THE TABLE</span><h2>吃什么，已经顺好路</h2></div>${restaurant(plan,day.dining.primary)}${day.dining.backup?`<details class="dining-backup"><summary>满座或不想等 · ${esc(day.dining.backup.name)}</summary>${restaurant(plan,day.dining.backup,true)}</details>`:''}<p class="fine">主选与备选二选一；费用使用当天餐饮预留，不另加一顿。</p></section>`;
}
