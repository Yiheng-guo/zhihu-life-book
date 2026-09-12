import { content } from './content.mjs';
export const VERSION = '1.2';
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
const echoes = {
  ask:['先把问题说出来','你去了学院的咨询台。一个高年级同学没有替你选择，只是提醒你：先查清规则，才知道哪些门还开着。你把“学校决定一生”的担心，改写成了三个具体问题。'],
  try:['第一次尝试，比想象小一些','你挑了一节公开课。练习比想象中费力，也有一小段让你忘了时间。还谈不上热爱，但你终于有了可以回顾的真实感受。'],
  course:['兴趣，需要亲自靠近','你旁听了一次课，也问了一个在读的人。你喜欢的部分与不喜欢的部分一起变得清晰。换方向之前，你决定再看一次它平常的样子。'],
  practice:['做完之后，答案才具体','两周后，小项目只完成了原计划的一半。你记住的却不是完成度，而是自己最愿意投入的那项任务。下一次，可以从这里开始。'],
  prepare:['给准备，也给生活留位置','你给复习安排了固定时间。一次模拟练习让你看到了距离，也发现计划需要调整。备选方向没有因此消失，它可以和准备一起被照顾。'],
  intern:['岗位名称背后，是每一天','一次交流里，你听到了招聘介绍没有写出的日常：重复的任务、协作的摩擦，也有值得期待的成长。你开始分清自己想要的工作与想象中的工作。']
};
export class StoryError extends Error { constructor(code,message){super(message);this.code=code;} }
const fail=(code,message)=>{throw new StoryError(code,message)};
export function createState(){return {version:VERSION,revision:0,index:0,phase:'story',choiceId:null,sourceId:null,history:[]};}
export function view(s){
  const id=STAGES[s.index];const node=content.nodes[id];
  const echo=s.choiceId?(s.index===3?content.endings[s.choiceId]:echoes[s.choiceId]):null;
  const previous=s.history.at(-1);
  return {version:VERSION,revision:s.revision,phase:s.phase,index:s.index,node_id:id,
    node:{...node,choices:node.choices.map(([id,label,hint])=>({id,label,hint,...(TRADEOFFS[id]||{})}))},
    choice_id:s.choiceId,source_id:s.sourceId,echo:echo?{title:echo[0],text:echo[1]}:null,
    references:content.nodeRefs[id].map(id=>({id,...SOURCES[id],question:QUESTIONS[id],action:ACTIONS[id]})),
    carry:previous?{source:SOURCES[previous.sourceId],question:QUESTIONS[previous.sourceId],choice:previous.choiceLabel}:null,
    history:s.history.map(h=>({...h,stage:content.nodes[h.nodeId].label,source:SOURCES[h.sourceId],question:QUESTIONS[h.sourceId]})),
    ending:s.phase==='ending'?{title:content.endings[s.choiceId][0],text:content.endings[s.choiceId][1],question:QUESTIONS[s.sourceId],action:ACTIONS[s.sourceId],tradeoff:TRADEOFFS[s.choiceId]}:null};
}
export function transition(original,event){
  if(!event||event.revision!==original.revision)fail('STALE_STATE','页面状态已变化，请重新加载这一步。');
  const s=structuredClone(original), id=STAGES[s.index];
  if(event.node_id!==id)fail('INVALID_NODE','当前章节与请求不一致。');
  if(event.type==='choose'){
    if(s.phase!=='story')fail('INVALID_PHASE','请先回到当前选择。');
    if(!content.nodes[id].choices.some(c=>c[0]===event.choice_id))fail('INVALID_CHOICE','这个选择不属于当前节点。');
    s.choiceId=event.choice_id;s.sourceId=null;s.phase='sources';
  } else if(event.type==='select'){
    if(s.phase!=='sources')fail('INVALID_PHASE','现在无法选择来源。');
    if(!content.nodeRefs[id].includes(event.source_id))fail('INVALID_SOURCE','请选择这一页提供的来源。');
    s.sourceId=event.source_id;
  } else if(event.type==='advance'){
    if(s.phase!=='sources'||!s.sourceId)fail('SOURCE_REQUIRED','请先选择一段经历或建议。');
    s.history.push({nodeId:id,choiceId:s.choiceId,choiceLabel:content.nodes[id].choices.find(c=>c[0]===s.choiceId)[1],sourceId:s.sourceId});
    if(s.index===3)s.phase='ending';
    else{s.index++;s.phase='story';s.choiceId=null;s.sourceId=null;}
  } else if(event.type==='back'){
    if(s.phase!=='sources')fail('INVALID_PHASE','当前不能返回选择。');
    s.phase='story';s.choiceId=null;s.sourceId=null;
  } else fail('INVALID_EVENT','无法识别这次操作。');
  s.revision++;return s;
}
