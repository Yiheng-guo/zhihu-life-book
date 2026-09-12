export const shortLabels={ask:'先问一问',try:'先试一试',transfer_prepare:'准备转专业',course:'旁听一门课',practice:'做个小项目',rethink:'调整节奏',prepare:'留时间复习',intern:'了解岗位',portfolio_intern:'投递实习',study_gap:'补基础',budget_plan:'规划生活',small_practice:'做次小实践',admitted:'如愿读研',exam:'继续考研',civil:'尝试考公',work:'开始工作',gap:'Gap Year',lost:'仍在寻找',jobless:'暂未就业',delay:'延期毕业'};
export function setupGame({preview,confirm}){
 const el=id=>document.getElementById(id);let choice=null,effort=2;
 const update=()=>{if(!choice)return;el('decisionPreview').hidden=false;el('previewTitle').textContent=shortLabels[choice.id]||choice.label;el('previewGain').textContent=choice.gain;el('previewCost').textContent=choice.cost;el('effortValue').textContent=effort;el('effortRemainder').textContent=3-effort;el('effortHint').textContent=effort===1?'先浅尝一次，留两个时段给其他安排。':effort===2?'持续试试，仍留一个时段给其他安排。':'全部投入，这一幕不再留其他课余时段。';el('timeBudget').hidden=!!choice.situation;el('commitChoice').textContent=choice.situation?'翻开这种可能 →':'投入这些时间，行动 →';for(const chip of document.querySelectorAll('[data-time]')){chip.classList.toggle('invested',Number(chip.dataset.time)<=effort);chip.setAttribute('aria-pressed',String(Number(chip.dataset.time)===effort));}preview(choice,effort);};
 el('effortRange').oninput=e=>{effort=Number(e.target.value);update();};
 el('commitChoice').onclick=()=>{if(choice)confirm(choice,effort);};
 for(const chip of document.querySelectorAll('[data-time]'))chip.onclick=()=>{effort=Number(chip.dataset.time);el('effortRange').value=effort;update();};
 return {pick(c){choice=c;effort=2;el('effortRange').value=2;update();},reset(){choice=null;el('decisionPreview').hidden=true;}};
}
