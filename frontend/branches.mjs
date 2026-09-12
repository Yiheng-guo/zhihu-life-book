// 2.2 narrative branches: a fixed fictional story with real Zhihu voices at the edges.
const option=(id,label,gain,cost,text,focus,refs,sourceRole='experience_echo')=>({id,label,gain,cost,text,focus,refs,sourceRole});
export const OPTIONS={
 study_plan:option('study_plan','把课余时间排满，先准备考研','获得确定感与一条看似稳妥的路线','少一晚和林知夏做项目，压力提前上升','你把日历填满了。每一格都有用途，但林知夏的消息被你放到了很后面。','academic',['major_first','graduate_work','college_planning'],'inciting_question'),
 project:option('project','跟林知夏做一周的小项目','留下第一次真实的成果和反馈','项目可能失败，也会占用复习时间','你答应了林知夏。周末被项目切成几段，你第一次发现自己愿意为一个陌生问题熬夜。','practice',['intern_review','major_first','college_planning'],'inciting_question'),
 rules:option('rules','先查清转专业与课程规则','知道真实的申请窗口和代价','这一晚没有产出，时间也不会回来','你打开教务网，把绩点、名额和截止日期抄进了备忘录。想离开之前，至少知道要付出什么。','clarity',['major_transfer','major_first','college_planning'],'inciting_question'),
 ask_source:option('ask_source','把失败写成一个具体问题，找一条真实经历','获得一个可核实的下一步','别人的经验只能作参照，不能替你决定','你没有再问“我是不是不行”，而是写下了一个可以请教的问题。','clarity',['major_transfer','major_first','college_planning'],'experience_echo'),
 carry_alone:option('carry_alone','先独自补到满意，再告诉别人','短期保住体面与控制感','压力上升，林知夏不知道你在想什么','你把失败藏进了待办清单。问题看起来变小了，夜却变得更长。','academic',['graduate_work','college_planning','jobless'],'counterpoint'),
 talk_roommate:option('talk_roommate','把边界告诉林知夏，一起复盘','修复关系，得到一个同行的人','让出一晚自己的时间，也要承认害怕','你告诉她自己可能想转专业。她没有替你决定，只问：那我们先把问题问清楚？','support',['intern_review','major_first','college_planning'],'experience_echo'),
 intern:option('intern','签下那份实习，先看看真实岗位','获得工作日常和能力缺口的反馈','少一部分备考时间，压力会上升','你把实习 offer 放在桌上。它不是终点，但终于有一件事不再只存在于想象中。','practice',['intern_review','graduate_work','graduate_three'],'counterpoint'),
 exam_full:option('exam_full','拒绝实习，把时间押在考研上','获得一段稳定的准备节奏','实践变少，结果仍然没有保证','你回复了拒绝。日历干净了许多，也安静了许多。','academic',['graduate_work','graduate_three','jobless'],'counterpoint'),
 balance:option('balance','谈一份能持续的折中安排','保住关系，也保留两条路','短期内两边都不够彻底','你和林知夏、妈妈各谈了一次。没有人完全满意，但你终于不用把生活押在一个答案上。','support',['intern_review','graduate_work','college_planning'],'counterpoint'),
 reply:option('reply','给那个大一新生写一封回信','把四年的经历变成一个具体问题','回信不能替对方选择，也不能抹去自己的代价','你重新看了一遍那个问题：我是不是已经被定型？这一次，你准备先回答他愿意承担什么。','clarity',['graduate_three','jobless','intern_review'],'ending_reference')
};
export const SOURCE_LENSES={
 major_transfer:{label:'核对本校现行转专业条件',gain:'知道可选范围',cost:'经验不能替代校规',focus:'clarity',text:'你把学校当前的条件和日期记下来，先把想象变成可以核实的问题。'},
 major_first:{label:'问一位转过专业的人一个具体问题',gain:'得到真实过程参照',cost:'对方的经历不等于你的结果',focus:'clarity',text:'你问到了一步具体做法，但仍需要结合自己的学校和资源判断。'},
 college_planning:{label:'安排一次两周后的回看',gain:'用小投入获得反馈',cost:'需要真的留出时间',focus:'clarity',text:'你把尝试写进日历，先看反馈，再决定是否加码。'},
 intern_review:{label:'问清一个岗位的日常任务',gain:'看到工作而非职位名称',cost:'联系和等待都需要时间',focus:'practice',text:'你把岗位拆成每天要做的事，开始判断自己想不想过这样的生活。'},
 graduate_work:{label:'给备考之外留一次职业探索',gain:'多一个现实参照',cost:'准备时间会被切开',focus:'academic',text:'你没有立刻改变目标，只给未来留了一条能验证的旁路。'},
 graduate_three:{label:'记下失败后仍能进入的一扇门',gain:'把结果拆成下一步',cost:'要接受路径暂时改变',focus:'practice',text:'你没有把一次失败解释成全部人生，先找到了一个可以进入的具体机会。'},
 jobless:{label:'先算清一个月的必要支出',gain:'让生活有可执行边界',cost:'必须面对现实压力',focus:'support',text:'你把收入、住处和可求助的人写在一起，先让下一步站得住。'}
};
export const SHORT_SOURCES={major_transfer:'建议先查本校转专业条件、期限与准备要求。',major_first:'作者自述凭大一成绩申请转专业获通过。',college_planning:'建议分阶段探索与实践，再权衡就业或深造。',intern_review:'作者自述比较岗位日常，逐渐找到兴趣方向。',graduate_work:'作者自述考研失利、错过实习与高强度工作。',graduate_three:'作者自述多次考研失利后进入跨专业岗位。',jobless:'作者自述边代课边备考，仍在寻找正式工作。'};
export function branchFor(s){
 const p=s.history.at(-1)?.choiceId;
 if(s.index===0)return {id:'opening',title:'第十八页还没写完',narration:'周野把录取通知书压在键盘旁。妈妈发来语音：普通一本没关系，考研翻盘。林知夏紧接着问：今晚要不要一起做个小项目？同一个晚上，两条路同时找上门。',options:[OPTIONS.study_plan,OPTIONS.project,OPTIONS.rules]};
 if(s.index===1){let event=p==='study_plan'?'模考分数比预期低，妈妈说再坚持一下。':p==='project'?'项目演示失败，林知夏问要不要把失败发出去请别人看？':'你发现转专业窗口已过，旁听和补基础仍然来得及。';return {id:'first_failure',title:'第一次失败以后',narration:event,options:[OPTIONS.ask_source,OPTIONS.carry_alone,OPTIONS.talk_roommate]};}
 if(s.index===2)return {id:'deadline',title:'截止日只剩今晚',narration:'一个实习机会今晚截止，妈妈还在说考研才是翻盘，林知夏却已经拿到 offer。周野必须决定：把时间押在哪里，又要对谁说实话？',options:[OPTIONS.intern,OPTIONS.exam_full,OPTIONS.balance]};
 return {id:'letter',title:'四年后，回信写给谁？',narration:'四年后，周野重新打开那个文件夹。录取通知书、没发出去的消息、项目文件和几篇知乎回答都在。大一新生问：我是不是已经被定型？周野要用自己走过的这一页回答。',options:[OPTIONS.reply]};
}
