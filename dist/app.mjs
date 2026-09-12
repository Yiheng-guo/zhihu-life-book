import { openCover, setupCover } from './cover.mjs';
import {createState,transition,view,STAGES,VERSION} from './story.mjs';
const $=id=>document.getElementById(id);
const config=window.LIFE_BOOK_CONFIG||{mode:'local',apiBase:''};
let state, current, sessionId, busy=false;
const element=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function sourceLink(source){const a=element('a','知乎原文 ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',`打开原文：${source.title}（新窗口）`);return a;}
function showError(error){$('error').textContent=error.message||'这次操作没有完成，请重试。';$('error').hidden=false;}
function clearError(){$('error').hidden=true;}
async function api(path,body){
 const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),10000);
 try{const r=await fetch(config.apiBase+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});const data=await r.json();if(!r.ok)throw new Error(data.message||'服务暂时不可用');return data;}finally{clearTimeout(timer);}
}
function lock(value){busy=value;document.querySelectorAll('#reader button,#reader input,#startBtn,#againBtn').forEach(e=>e.disabled=value);if(!value&&current)$('nextBtn').disabled=!current.source_id;}
async function start(){if(busy)return;lock(true);clearError();try{
 if(config.mode==='api'){const d=await api('/api/story/start',{});sessionId=d.session_id;current=d.view;}
 else{state=createState();current=view(state);}
 await openCover();
 render(true);
 }catch(e){showError(e);}finally{lock(false);}}
async function send(type,fields={}){if(busy||!current)return;lock(true);clearError();try{
 const event={type,revision:current.revision,node_id:current.node_id,...fields};
 if(config.mode==='api'){const d=await api('/api/story/event',{session_id:sessionId,event});current=d.view;}
 else{state=transition(state,event);current=view(state);}
 render(type!=='select');
 }catch(e){showError(e);}finally{lock(false);}}
function render(focus){const v=current;
 $('intro').hidden=true;$('reader').hidden=v.phase==='ending';$('ending').hidden=v.phase!=='ending';
 if(v.phase==='ending'){renderEnding(v);if(focus)$('endingTitle').focus();return;}
 $('steps').replaceChildren(...STAGES.map((id,i)=>{const li=element('li',undefined,i<v.index?'done':i===v.index?'current':'');if(i===v.index)li.setAttribute('aria-current','step');li.append(element('span',i<v.index?'✓':String(i+1).padStart(2,'0'),'step-number'),element('span',['入学','探索','大三准备','毕业'][i]));return li;}));
 $('chapter').textContent=v.node.label;$('heading').textContent=v.phase==='story'?v.node.title:v.echo.title;
 $('decision').hidden=v.phase!=='story';$('evidence').hidden=v.phase!=='sources';$('backBtn').hidden=v.phase!=='sources';$('nextBtn').hidden=v.phase!=='sources';
 $('pageHint').textContent=`${v.index+1} / 4 · ${v.phase==='story'?'写下你的选择':v.source_id?'已选中，可继续':'请先选中一条内容'}`;
 if(v.phase==='story'){
 $('narration').textContent=v.node.narration;$('choicePrompt').textContent=v.index===3?'你想继续读哪一种可能？':'这一刻，你想先怎么做？';
 $('carry').hidden=!v.carry;if(v.carry){$('carryQuestion').textContent=v.carry.question;$('carryAuthor').textContent=`上页选择：${v.carry.choice} · 参考《${v.carry.source.title}》`;}
 $('choices').replaceChildren(...v.node.choices.map((c,i)=>{const b=element('button',undefined,'choice');b.type='button';b.dataset.choice=c.id;const body=element('span');body.append(element('strong',c.label),element('small',c.hint));b.append(element('span',String.fromCharCode(65+i),'choice-number'),body);b.onclick=()=>send('choose',{choice_id:c.id});return b;}));
 }else{
 $('echo').textContent=v.echo.text;
 $('sourceCount').textContent=`${v.references.length} 条内容`;
 // Reuse radio controls during selection to preserve keyboard focus and native arrow navigation.
 if(focus||!$('sourceList').querySelector('input')){
 $('sourceList').replaceChildren(element('legend','选择参考的知乎内容','sr-only'),...v.references.map(r=>{const card=element('div',undefined,'source-card');const label=element('label');const head=element('span',undefined,'source-head');const input=element('input');input.type='radio';input.name='source';input.value=r.id;input.setAttribute('aria-label',`选择：${r.title}`);input.onchange=()=>send('select',{source_id:r.id});head.append(input,element('span',r.type),element('span','','chosen'));label.append(head,element('strong',r.title),element('span',r.summary,'source-summary'));const bottom=element('div',undefined,'source-bottom');bottom.append(element('span',r.author),sourceLink(r));card.append(label,bottom);return card;}));
 }
 for(const input of $('sourceList').querySelectorAll('input')){input.checked=input.value===v.source_id;input.parentElement.querySelector('.chosen').textContent=input.checked?'已选中':'';}
 const selected=v.references.find(r=>r.id===v.source_id);$('selectedReflection').hidden=!selected;if(selected)$('selectedQuestion').textContent=selected.question;
 $('nextBtn').textContent=v.index===3?'合上这一章，回到今天 →':'带着这段内容，继续 →';$('nextBtn').disabled=!selected;
 }
 if(focus){$('heading').focus();window.scrollTo({top:0,behavior:'instant'});}
}
function renderEnding(v){
 $('endingTitle').textContent=v.ending.title;$('endingText').textContent=v.ending.text;$('todayQuestion').textContent=v.ending.question;$('todayAction').value=v.ending.action;$('saveStatus').textContent='';
 $('history').replaceChildren(...v.history.map(h=>{const li=element('li');const a=sourceLink(h.source);a.textContent=`参考：${h.source.title} ↗`;li.append(element('small',h.stage),element('strong',h.choiceLabel),a);return li;}));window.scrollTo({top:0,behavior:'instant'});
}
$('startBtn').onclick=start;$('againBtn').onclick=start;$('backBtn').onclick=()=>send('back');$('nextBtn').onclick=()=>send('advance');
$('saveBtn').onclick=()=>{const action=$('todayAction').value.trim();if(!action){$('saveStatus').textContent='先写下一件愿意尝试的事';$('todayAction').focus();return;}
 const lines=[`人生之书 · 大学篇 ${VERSION}`,current.ending.title,'',current.ending.question,'今天的一步：'+action,'',...current.history.map(h=>`${h.stage}｜${h.choiceLabel}\n参考：${h.source.title}\n${h.source.url}`),'','情境为产品编排；参考内容为知乎作者经历或建议。'];
 const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=element('a');a.href=url;a.download='人生之书-今天的书签.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('saveStatus').textContent='已生成书签文件';
};

setupCover();
