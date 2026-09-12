export const shortLabels={study_plan:'翻盘计划',project:'跟室友做一周项目',rules:'查转专业规则',ask_source:'把失败写成问题',carry_alone:'独自补到满意',talk_roommate:'和室友复盘',intern:'签下实习',exam_full:'全力备考',balance:'谈一份折中',reply:'写一封回信'};
export function setupGame({preview,confirm}){
 const el=id=>document.getElementById(id);let choice=null,effort=2;
 const update=()=>{if(!choice)return;el('decisionPreview').hidden=false;el('previewTitle').textContent=shortLabels[choice.id]||choice.label;el('previewGain').textContent=choice.gain;el('previewCost').textContent=choice.cost;el('effortValue').textContent=effort;el('effortRemainder').textContent=3-effort;el('effortHint').textContent=effort===1?'先浅尝一次，留两个时段给其他安排。':effort===2?'持续试试，仍留一个时段给其他安排。':'全部投入，这一幕不再留其他课余时段。';el('timeBudget').hidden=!!choice.situation;el('commitChoice').textContent=choice.situation?'翻开这种可能 →':'投入这些时间，行动 →';for(const chip of document.querySelectorAll('[data-time]')){chip.classList.toggle('invested',Number(chip.dataset.time)<=effort);chip.setAttribute('aria-pressed',String(Number(chip.dataset.time)===effort));}preview(choice,effort);};
 el('effortRange').oninput=e=>{effort=Number(e.target.value);update();};
 el('commitChoice').onclick=()=>{if(choice)confirm(choice,effort);};
 for(const chip of document.querySelectorAll('[data-time]'))chip.onclick=()=>{effort=Number(chip.dataset.time);el('effortRange').value=effort;update();};
 return {pick(c){choice=c;effort=2;el('effortRange').value=2;update();},reset(){choice=null;el('decisionPreview').hidden=true;}};
}
