import { content } from './content.mjs';
import { branchFor, SOURCE_LENSES, SHORT_SOURCES } from './branches.mjs';
export const VERSION = '2.0';
export const STAGES = ['freshman_start','explore','junior','graduation'];
export const SOURCES = content.refs;
export const QUESTIONS = content.sourceQuestion;
// Each choice exposes a possible gain and cost. These are editorial possibilities, never guarantees.
export const TRADEOFFS = {
  ask:{gain:'看清校内规则与可选机会',cost:'甄别建议，投入请教时间'}, try:{gain:'获得一次真实的兴趣反馈',cost:'挤出时间，接受尝试落空'},
  course:{gain:'看见专业与想象的差别',cost:'占用课余，仍需亲自实践'}, practice:{gain:'留下作品与能力反馈',cost:'投入两周，也可能半途受阻'},
  prepare:{gain:'积累知识，形成复习节奏',cost:'压缩探索时间，承受结果不定'}, intern:{gain:'看清岗位日常与能力要求',cost:'花时间联系，也可能碰壁'},
  admitted:{gain:'更深的学习与研究机会',cost:'学业投入与延后就业'}, exam:{gain:'系统学习与争取深造的机会',cost:'备考时间、费用与结果不定'},
  civil:{gain:'接近公共服务工作的机会',cost:'备考投入与岗位地域限制'}, work:{gain:'收入、经验与真实反馈',cost:'时间约束与职场适应压力'},
  gap:{gain:'恢复节奏，尝试不同方向',cost:'生活开支与履历空档'}, lost:{gain:'从小尝试中逐步厘清方向',cost:'持续不确定带来的心理压力'},
  jobless:{gain:'借求职反馈调整方向',cost:'收入空档与反复受挫'}, delay:{gain:'补足学业，争取完成这一章',cost:'额外时间、费用与同伴落差'}
};
export const ACTIONS = {
  major_transfer: '用 20 分钟找出本校最新转专业通知，记下条件、截止日和一个咨询渠道。',
  major_first: '找一门感兴趣的公开课，试做一次练习，记录自己是否愿意继续。',
  college_planning: '在日历里留出两周后的一次回顾，先为一个兴趣安排 30 分钟实践。',
  intern_review: '挑两个感兴趣的岗位，分别记下一项日常任务和一个需要向从业者核实的问题。',
  graduate_work: '把准备考试之外能留给职业探索的时间写下来，安排一次了解岗位日常的交流。',
  graduate_three: '写下现在最需要解决的一件事：收入、经验、作息或方向，再找一个能接触到的机会。',
  jobless: '写下未来一个月的必要支出与可投入时间，为学习或求职安排一个能持续的小步。'
};
export class StoryError extends Error { constructor(code,message){super(message);this.code=code;} }
const fail=(code,message)=>{throw new StoryError(code,message)};
export function createState(){return {version:VERSION,revision:0,index:0,phase:'story',choiceId:null,sourceId:null,history:[]};}
const reference=(id)=>({id,...SOURCES[id],short_summary:SHORT_SOURCES[id],question:QUESTIONS[id],action:ACTIONS[id]});
const ENDING_REFS={
 admitted:['college_planning','major_first','graduate_three'],exam:['graduate_work','graduate_three','jobless'],
 civil:['jobless','graduate_work','college_planning'],work:['intern_review','graduate_work','graduate_three'],
 gap:['college_planning','graduate_three','jobless'],lost:['graduate_three','jobless','college_planning'],
 jobless:['jobless','graduate_work','graduate_three'],delay:['college_planning','major_first','jobless']
};
const ENDING_STEPS={
 admitted:'记下一项想在研究生阶段尝试的课题，并查清一门相关课程。',
 exam:'写下未来两周的复习时间与生活支出，留一个回顾和调整的日期。',
 civil:'查一项感兴趣岗位的最新官方报考条件，再了解它的日常工作。',
 work:'向一位从业者准备一个关于日常任务、工时或成长的问题。',
 gap:'给这段空白写下预算、期限和一次复盘日期，再决定第一项探索。',
 lost:'写出最困扰自己的一个具体问题，找到一位愿意交流的人。',
 jobless:'列出必要支出与可求助的渠道，再安排一次简历修改或岗位了解。',
 delay:'找到本校最新毕业要求，向导师或辅导员问清尚缺事项与安排。'
};
function choicesFor(s,b){
 if(s.index!==3)return b.options.map(c=>({...c,hint:c.sourceId?'受上页知乎内容启发':''}));
 const all=content.nodes.graduation.choices;
 return [...b.primary,...all.map(c=>c[0]).filter(id=>!b.primary.includes(id))].map(id=>{
  const [,label,hint]=all.find(c=>c[0]===id);
  return {id,label,hint,...TRADEOFFS[id],primary:b.primary.includes(id),situation:true};
 });
}
function snapshot(s){
 const branch=branchFor(s),choices=choicesFor(s,branch),selected=choices.find(c=>c.id===s.choiceId);
 const refs=s.index===3?(ENDING_REFS[s.choiceId]||content.nodeRefs.graduation):(selected?.refs||branch.options[0].refs);
 return {branch,choices,selected,refs};
}
export function view(s){
 const id=STAGES[s.index], {branch,choices,selected,refs}=snapshot(s), previous=s.history[s.index-1];
 const sourceNext=s.sourceId&&SOURCE_LENSES[s.sourceId];
 const echo=selected?(s.index===3?{title:content.endings[s.choiceId][0],text:content.endings[s.choiceId][1]}:{title:selected.label,text:selected.text}):null;
 return {version:VERSION,revision:s.revision,phase:s.phase,index:s.index,node_id:id,branch_id:branch.id,
  node:{label:content.nodes[id].label,title:branch.title,narration:branch.narration,choices},
  choice_id:s.choiceId,source_id:s.sourceId,echo,
  references:refs.map(reference),
  source_preview:sourceNext?{label:s.index===3?'带回今天的问题':s.index===2?'带到毕业页的问题':'下一页多一个可选行动',text:s.index>=2?QUESTIONS[s.sourceId]:sourceNext.label}:null,
  carry:previous?{source:SOURCES[previous.sourceId],question:QUESTIONS[previous.sourceId],choice:previous.choiceLabel,action:ACTIONS[previous.sourceId]}:null,
  history:s.history.map(h=>({...h,stage:content.nodes[h.nodeId].label,source:SOURCES[h.sourceId],question:QUESTIONS[h.sourceId]})),
  ending:s.phase==='ending'?{title:content.endings[s.choiceId][0],text:content.endings[s.choiceId][1],question:QUESTIONS[s.sourceId],action:ENDING_STEPS[s.choiceId],tradeoff:TRADEOFFS[s.choiceId]}:null};
}
export function transition(original,event){
 if(!event||event.revision!==original.revision)fail('STALE_STATE','页面状态已变化，请重新加载这一步。');
 const s=structuredClone(original), id=STAGES[s.index];
 if(event.node_id!==id)fail('INVALID_NODE','当前章节与请求不一致。');
 const {branch,choices,selected,refs}=snapshot(s);
 if(event.type==='choose'){
  if(s.phase!=='story')fail('INVALID_PHASE','请先回到当前选择。');
  if(!choices.some(c=>c.id===event.choice_id))fail('INVALID_CHOICE','这个选择不属于当前处境。');
  s.choiceId=event.choice_id;s.sourceId=null;s.phase='sources';
 }else if(event.type==='select'){
  if(s.phase!=='sources')fail('INVALID_PHASE','现在无法选择来源。');
  if(!refs.includes(event.source_id))fail('INVALID_SOURCE','请选择这一页提供的来源。');
  s.sourceId=event.source_id;
 }else if(event.type==='advance'){
  if(s.phase!=='sources'||!s.sourceId)fail('SOURCE_REQUIRED','请先选择一段经历或建议。');
  s.history.push({nodeId:id,branchId:branch.id,choiceId:s.choiceId,choiceLabel:selected.label,sourceId:s.sourceId,focus:selected.focus||null,gain:selected.gain,cost:selected.cost,inspiredBy:selected.sourceId||null});
  if(s.index===3)s.phase='ending';else{s.index++;s.phase='story';s.choiceId=null;s.sourceId=null;}
 }else if(event.type==='back'){
  if(s.phase!=='sources')fail('INVALID_PHASE','当前不能返回选择。');
  s.phase='story';s.choiceId=null;s.sourceId=null;
 }else fail('INVALID_EVENT','无法识别这次操作。');
 s.revision++;return s;
}
