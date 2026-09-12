import { openCover, setupCover } from './cover.mjs';
import {arrive,sound,setupExperience} from './experience.mjs';
import {createState,transition,view,STAGES,VERSION} from './story.mjs';
const $=id=>document.getElementById(id);
const config=window.LIFE_BOOK_CONFIG||{mode:'local',apiBase:''};
let state, current, sessionId, busy=false, guideRevision=-1, guideController, guideToken=null, guideNote=null, guideHasAnswer=false;
const element=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function sourceLink(source){const a=element('a','知乎原文 ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',`打开原文：${source.title}（新窗口）`);return a;}
function showError(error){$('error').textContent=error.message||'这次操作没有完成，请重试。';$('error').hidden=false;}
function clearError(){$('error').hidden=true;}
function choiceButton(c,i){
 const b=element('button',undefined,'choice');b.type='button';b.dataset.choice=c.id;
 const body=element('span');body.append(element('strong',shortChoice(c)));b.setAttribute('aria-label',c.label);
 if(c.sourceId)body.append(element('small','受上一页的知乎经历启发'));
 const trade=element('span',undefined,'choice-trade');
 const gain=element('span',c.gain,'gain'),cost=element('span',c.cost,'cost');gain.setAttribute('aria-label',`${c.situation?'可以争取':'可能得到'}：${c.gain}`);cost.setAttribute('aria-label',`${c.situation?'需要面对':'可能付出'}：${c.cost}`);trade.append(gain,cost);
 body.append(trade);b.append(element('span',`${String(i+1).padStart(2,'0')} / ${c.situation?'一种可能':c.sourceId?'来自经历':'你的选择'}`,'choice-number'),body);
 b.onclick=()=>send('choose',{choice_id:c.id});return b;
}
function sourceCard(r){
 const card=element('div',undefined,'source-card'),label=element('label'),head=element('span',undefined,'source-head');
 const input=element('input');input.type='radio';input.name='source';input.value=r.id;input.setAttribute('aria-label',`选择：${r.title}`);
 input.onchange=()=>{send('select',{source_id:r.id});if(innerWidth<760)card.scrollIntoView({block:'nearest',inline:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
 head.append(input,element('span',r.type),element('span','','chosen'));
 label.append(head,element('strong',r.short_summary));
 const details=element('details',undefined,'source-details');details.append(element('summary','展开原文摘要'),element('p',r.title),element('p',r.summary));
 const bottom=element('div',undefined,'source-bottom');bottom.append(element('span',r.author),sourceLink(r));
 card.append(label,bottom,details);return card;
}
async function api(path,body){
 const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),10000);
 try{const r=await fetch(config.apiBase+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});const data=await r.json();if(!r.ok)throw new Error(data.message||'服务暂时不可用');return data;}finally{clearTimeout(timer);}
}
function lock(value){busy=value;document.querySelectorAll('#choices button,#extraChoices button,#sourceList input,#nextBtn,#backBtn,#startBtn,#againBtn').forEach(e=>e.disabled=value);if(!value&&current)$('nextBtn').disabled=!current.source_id;}
async function start(){if(busy)return;invalidateGuide();guideNote=null;lock(true);clearError();try{
 if(config.mode==='api'){const d=await api('/api/story/start',{});sessionId=d.session_id;current=d.view;}
 else{state=createState();current=view(state);}
 await openCover();
 render(true);arrive(0);
 }catch(e){showError(e);}finally{lock(false);}}
async function send(type,fields={}){if(busy||!current)return;invalidateGuide();lock(true);clearError();try{
 const event={type,revision:current.revision,node_id:current.node_id,...fields};
 if(config.mode==='api'){const d=await api('/api/story/event',{session_id:sessionId,event});current=d.view;}
 else{state=transition(state,event);current=view(state);}
 render(type!=='select');if(type==='select')sound('source');else arrive(current.index,current.phase==='ending'?'ending':type==='choose'?'choose':'page');
 }catch(e){showError(e);}finally{lock(false);}}
function render(focus){const v=current;
 $('intro').hidden=true;$('reader').hidden=v.phase==='ending';$('ending').hidden=v.phase!=='ending';
 if(v.phase==='ending'){renderEnding(v);if(focus)$('endingTitle').focus();return;}
 $('steps').replaceChildren(...STAGES.map((id,i)=>{const li=element('li',undefined,i<v.index?'done':i===v.index?'current':'');if(i===v.index)li.setAttribute('aria-current','step');li.append(element('span',i<v.index?'✓':String(i+1).padStart(2,'0'),'step-number'),element('span',['入学','探索','大三准备','毕业'][i]));return li;}));
 $('sceneIndex').textContent=String(v.index+1).padStart(2,'0');$('chapter').textContent=v.node.label+' / '+(v.phase==='story'?'由你选择':'一次选择之后');$('heading').textContent=v.phase==='story'?v.node.title:(v.index===3?v.echo.title:shortChoice(v.node.choices.find(c=>c.id===v.choice_id))+'，然后呢？');
 $('decision').hidden=v.phase!=='story';$('evidence').hidden=v.phase!=='sources';$('backBtn').hidden=v.phase!=='sources';$('nextBtn').hidden=v.phase!=='sources';
 $('pageHint').textContent=`${v.index+1} / 4 · ${v.phase==='story'?'写下你的选择':v.source_id?'已选中，可继续':'请先选中一条内容'}`;
 if(v.phase==='story'){
 $('narration').textContent=v.node.narration;$('choicePrompt').textContent=v.index===3?'没有标准结局。你想走进哪一种可能？':'每一种选择，都有得到和付出。';
 $('carry').hidden=!v.carry;if(v.carry){$('carryQuestion').textContent=v.carry.question;$('carryShort').textContent=v.carry.choice;$('carryAuthor').textContent=`上页选择：${v.carry.choice} · 参考《${v.carry.source.title}》`;}
 const main=v.node.choices.filter(c=>c.primary!==false),extra=v.node.choices.filter(c=>c.primary===false);
 $('choices').replaceChildren(...main.map(choiceButton));renderFork(main);
 $('extraChoices').replaceChildren(...extra.map((c,i)=>choiceButton(c,main.length+i)));
 $('otherEndings').hidden=!extra.length;$('otherEndings').open=false;

 }else{
 $('echo').textContent=v.echo.text;
 $('sourceCount').textContent=`${v.references.length} 条内容`;
 // Reuse radio controls during selection to preserve keyboard focus and native arrow navigation.
 if(focus||!$('sourceList').querySelector('input')){
 $('sourceList').replaceChildren(element('legend','选择参考的知乎内容','sr-only'),...v.references.map(sourceCard));
 }
 for(const input of $('sourceList').querySelectorAll('input')){input.checked=input.value===v.source_id;input.parentElement.querySelector('.chosen').textContent=input.checked?'已选中':'';}
 const selected=v.references.find(r=>r.id===v.source_id);$('selectedReflection').hidden=!selected;$('guide').hidden=!selected;$('sourceEmpty').hidden=!!selected;if(selected){$('selectedQuestion').textContent=selected.question;$('sourcePreview').textContent=v.source_preview.label+'：'+v.source_preview.text;$('guideQuestion').placeholder='比如：'+selected.question;$('guideSuggest').textContent='帮我拆一个小步';}
 $('nextBtn').textContent=v.index===3?'合上这一章，回到今天 →':'带着这段内容，继续 →';$('nextBtn').disabled=!selected;
 }
 if(focus){$('heading').focus();window.scrollTo({top:0,behavior:'instant'});}
}
function renderEnding(v){
 $('endingTitle').textContent=v.ending.title;$('endingText').textContent=v.ending.text;$('todayQuestion').textContent=v.ending.question;$('todayAction').value=guideNote?.next_step||v.ending.action;$('saveStatus').textContent='';
 $('history').replaceChildren(...v.history.map(h=>{const li=element('li'),details=element('details');const a=sourceLink(h.source);a.textContent=`${h.source.title} ↗`;details.append(element('summary','看看当时的取舍与来源'),element('p',`得到：${h.gain}；付出：${h.cost}`),a);li.append(element('small',h.stage),element('strong',h.choiceLabel),details);return li;}));window.scrollTo({top:0,behavior:'instant'});
}
const LABELS={ask:'先问一问',try:'先试一试',transfer_prepare:'准备转专业',course:'旁听一门课',practice:'做一个小项目',rethink:'先调整节奏',prepare:'给复习留时间',intern:'走近真实岗位',portfolio_intern:'带着作品投实习',study_gap:'把基础补扎实',budget_plan:'让计划装进生活',small_practice:'做一次小实践',admitted:'如愿，去读研',exam:'再准备一次考研',civil:'尝试考公',work:'去工作',gap:'留一段 Gap Year',lost:'我还在寻找',jobless:'暂时没找到工作',delay:'晚一点毕业'};
function renderFork(choices){const svg=$('decisionFork');svg.replaceChildren();const ns='http://www.w3.org/2000/svg';choices.forEach((c,i)=>{const x=(i+.5)*1000/choices.length,p=document.createElementNS(ns,'path');p.setAttribute('d',`M500 0 C500 35 ${x} 35 ${x} 80`);p.dataset.route=c.id;svg.append(p);const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',x);circle.setAttribute('cy','78');circle.setAttribute('r','3');svg.append(circle);});for(const button of $('choices').querySelectorAll('button')){const set=()=>{for(const p of svg.querySelectorAll('path'))p.classList.toggle('lit',p.dataset.route===button.dataset.choice);};button.onpointerenter=set;button.onfocus=set;button.onpointerleave=()=>svg.querySelectorAll('path').forEach(p=>p.classList.remove('lit'));button.onblur=button.onpointerleave;}}
function shortChoice(c){return LABELS[c.id]||c.label;}
function invalidateGuide(){guideRevision++;guideHasAnswer=false;guideController?.abort();guideController=null;$('guideStatus').textContent='';$('guideStatus').dataset.loading='false';$('guideResult').hidden=true;$('guideResult').replaceChildren();$('guideQuestion').value='';$('guideAsk').disabled=false;$('guideSuggest').disabled=false;$('guideMore').disabled=false;$('guideSuggest').hidden=false;}
function guidePayload(question){return {history:current.history.map(h=>({choice_id:h.choiceId,source_id:h.sourceId})),choice_id:current.choice_id,source_id:current.source_id,question,token:guideToken,followup:guideHasAnswer};}
function guideResult(answer){
 const root=$('guideResult');root.replaceChildren();root.append(element('span',answer.mode==='live'?'知乎 AI · 本次生成':answer.mode==='cached'?'知乎 AI · 已有回答':'预整理提示','answer-tag'),element('p',answer.reflection),element('h4','先试这一小步'),element('p',answer.next_step),element('h4','再问自己一句'),element('p',answer.question));
 const citations=element('div',undefined,'citation-list');for(const ref of answer.citations||[]){try{const u=new URL(ref.url);if(u.protocol!=='https:'||!['www.zhihu.com','zhihu.com','zhuanlan.zhihu.com'].includes(u.hostname))continue;const a=sourceLink(ref);a.textContent=ref.author+' · 原文 ↗';a.title=ref.title;citations.append(a);}catch{}}
 root.append(citations);if(answer.mode==='live'||answer.mode==='cached'){const adopt=element('button','把这一步带回今天 ↗','text-btn');adopt.type='button';adopt.onclick=()=>{guideNote={next_step:answer.next_step,citations:answer.citations};adopt.textContent='已放进今天的书签 ✓';adopt.disabled=true;sound('source');};root.append(adopt);}root.hidden=false;
}
async function askGuide(question){
 if(!current?.source_id||!question.trim()||guideController)return;const revision=guideRevision;const controller=new AbortController();guideController=controller;$('guideAsk').disabled=true;$('guideSuggest').disabled=true;$('guideMore').disabled=true;$('guideStatus').dataset.loading='true';$('guideStatus').textContent='正在连接这段经历。你也可以继续往下走。';$('guideResult').hidden=true;
 const timer=setTimeout(()=>controller.abort(),15000);const endpoint=config.guideEndpoint||'/api/guide';
 const post=async(path,body)=>{const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});const data=await r.json();if(!r.ok){if(r.status===401)guideToken=null;throw new Error(data.message||'向导暂时不可用');}return data;};
 try{if(!guideToken){const s=await post(endpoint+'/session',{});guideToken=s.token;}const answer=await post(endpoint,guidePayload(question));if(revision!==guideRevision)return;guideResult(answer);guideHasAnswer=answer.mode==='live'||answer.mode==='cached';$('guideQuestion').value='';$('guideQuestion').placeholder=guideHasAnswer?'可以接着回答：'+answer.question:'换一个更具体的问题';$('guideSuggest').hidden=guideHasAnswer;$('guideStatus').textContent=answer.reason||('参考 '+answer.citations.length+' 条知乎内容'+(answer.tools?.length?' · '+answer.tools.join(' + '):''));sound('source');}
 catch(e){if(revision!==guideRevision)return;const source=current.references.find(r=>r.id===current.source_id);guideResult({mode:'curated',reflection:source.short_summary,next_step:source.action,question:source.question,citations:[source]});$('guideStatus').textContent=controller.signal.aborted?'回应有点慢，先带着预整理提示继续。':e.message;}
 finally{clearTimeout(timer);if(revision===guideRevision){guideController=null;$('guideStatus').dataset.loading='false';$('guideAsk').disabled=false;$('guideSuggest').disabled=false;$('guideMore').disabled=false;}}
}
$('guideForm').onsubmit=e=>{e.preventDefault();askGuide($('guideQuestion').value);};
$('guideMore').onclick=()=>{const q='还有其他人的相似真实经历吗？请结合我当前的选择，找一条值得参考的经历。';$('guideQuestion').value=q;askGuide(q);};
$('guideSuggest').onclick=()=>{const q='结合我刚才的选择，帮我拆一个成本低、今天能做的小步。';$('guideQuestion').value=q;askGuide(q);};
$('startBtn').onclick=start;$('againBtn').onclick=start;$('backBtn').onclick=()=>send('back');$('nextBtn').onclick=()=>send('advance');
$('saveBtn').onclick=()=>{const action=$('todayAction').value.trim();if(!action){$('saveStatus').textContent='先写下一件愿意尝试的事';$('todayAction').focus();return;}
 const lines=[`人生之书 · 大学篇 ${VERSION}`,current.ending.title,'',current.ending.question,'今天的一步：'+action,...(guideNote?['参考了知乎 AI 的建议：',...guideNote.citations.map(s=>s.title+' '+s.url)]:[]),'',...current.history.map(h=>`${h.stage}｜${h.choiceLabel}\n参考：${h.source.title}\n${h.source.url}`),'','情境为产品编排；参考内容为知乎作者经历或建议。'];
 const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));const a=element('a');a.href=url;a.download='人生之书-今天的书签.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('saveStatus').textContent='已生成书签文件';
};

setupCover();setupExperience();
