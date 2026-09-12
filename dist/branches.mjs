// Editorial situations inspired by source topics, not reconstructions of authors' lives.
const option=(id,label,gain,cost,text,focus,refs)=>({id,label,gain,cost,text,focus,refs});
export const OPTIONS={
 ask:option('ask','先去了解别人怎么走过这段路','看清规则和可选机会','花时间请教、甄别建议','你查清了条件与咨询渠道。问题没有消失，但知道了下一步向谁问。','academic',['major_transfer','major_first','college_planning']),
 try:option('try','先做一件今天能完成的小事','获得一次兴趣反馈','挤出时间，接受尝试落空','一节公开课让你遇到吃力，也有一刻忘了时间。你决定记下这份感受。','practice',['college_planning','intern_review','major_first']),
 transfer_prepare:option('transfer_prepare','查清条件，准备转专业申请','保留重新选择专业的机会','准备材料，承担申请未过','你记下了本校当年的条件和截止日。准备申请占用课余，但是否通过还未确定。','academic',['major_transfer','major_first','college_planning']),
 course:option('course','先旁听一门目标专业的课','比较想象与实际课程','占用课余，仍需进一步实践','旁听后，你发现喜欢的内容，也遇到基础上的空缺。学习计划需要更具体。','academic',['major_first','major_transfer','college_planning']),
 practice:option('practice','用两周做一个小项目','留下作品和能力反馈','投入时间，可能返工','两周后项目只完成一半。你找到想继续的任务，也看见需要补的能力。','practice',['intern_review','college_planning','graduate_work']),
 rethink:option('rethink','缩小尝试，先安排好课程','找到可持续的节奏','探索速度可能放慢','你将探索缩到每周一个小时。进展变慢了，但开始能同时照顾课程和生活。','sustainable',['college_planning','graduate_work','jobless']),
 prepare:option('prepare','留出稳定的复习时间','积累知识与复习节奏','减少实践时间，结果未定','复习有了节奏，一次练习却暴露出差距。你需要重新考虑目标和可用时间。','academic',['graduate_work','college_planning','graduate_three']),
 intern:option('intern','先问清实习岗位的日常','了解工作与所需能力','花时间联系，可能碰壁','从业者谈到了重复任务与协作压力。你开始用每天要做的事来理解一个岗位。','practice',['intern_review','graduate_work','college_planning']),
 portfolio_intern:option('portfolio_intern','带着作品，尝试投递实习','获得具体的求职反馈','准备投递，也可能没有回复','你将作品整理成投递材料。有的岗位没有回复，也有反馈指出了能力缺口。','practice',['intern_review','graduate_work','graduate_three']),
 study_gap:option('study_gap','先补作品中暴露的基础','把知识空缺补得更扎实','暂时减少投递时间','你决定先补一门基础课。投递暂缓了，下一次实践需要验证学习有没有用。','academic',['college_planning','intern_review','graduate_work']),
 budget_plan:option('budget_plan','算清时间和支出，再排准备','让计划符合眼前资源','可能需要调整原定目标','你把一个月的支出与可用时间写下。原计划需要缩减，也变得更容易持续。','sustainable',['jobless','graduate_work','college_planning']),
 small_practice:option('small_practice','只安排一次能完成的小实践','获得反馈，再决定投入','一次尝试的信息仍然有限','你给实践限定了一周。它没有决定方向，但帮你分清想继续和暂时放下的部分。','practice',['college_planning','intern_review','graduate_three'])
};
// The selected source offers a distinct, optional next action. It never auto-selects for the reader.
export const SOURCE_LENSES={
 major_transfer:{label:'先核对本校申请窗口',gain:'弄清可选择的范围',cost:'查资料、核实过期信息',focus:'academic',text:'你把通知里的条件和日期记下来。还不确定能不能申请，但不再只凭印象判断。'},
 major_first:{label:'找目标专业同学问一次',gain:'获得具体的课程体验参照',cost:'安排交流，经验也有局限',focus:'academic',text:'你问到了一门课的具体任务。对方的经验是参照，你仍需要亲自试一试。'},
 college_planning:{label:'试两周，再决定要不要继续',gain:'用小投入换来真实反馈',cost:'安排实践与回顾的时间',focus:'sustainable',text:'你给下一次尝试安排了两周后的回顾。先看反馈，再决定是否投入更多。'},
 intern_review:{label:'把两个岗位的日常放在一起看',gain:'分清喜欢的任务与岗位名称',cost:'花时间查证个人描述',focus:'practice',text:'你比较了两类岗位每天要做的事。相同的职位名称背后，生活也可能很不同。'},
 graduate_work:{label:'备考之外，留一次职业探索',gain:'为下一步多留一个参照',cost:'需要分配有限的准备时间',focus:'sustainable',text:'你给备考之外留了一次了解岗位的时间。两边都需要投入，计划要有所取舍。'},
 graduate_three:{label:'先找一个现实可进入的机会',gain:'恢复实践与生活的联系',cost:'初始岗位未必符合期待',focus:'sustainable',text:'你列出眼下能接触到的一项机会，也问清它的时间成本。是否适合，还需要反馈。'},
 jobless:{label:'先算一个月的支出与可用时间',gain:'找到能持续的准备方式',cost:'可能需要调整备考或求职计划',focus:'sustainable',text:'你先把生活成本和可用时间写在一起。方向还不清楚，但下一步开始有了边界。'}
};
const finals={
 academic:{title:'准备之外，还有哪些可能？',text:'准备占据了一段时间，结果仍不确定。你想读一读哪一种毕业处境？',primary:['admitted','exam','jobless']},
 practice:{title:'走近工作以后，下一步呢？',text:'你已经看过一些岗位和能力要求。求职有反馈，也有空白，你想继续看哪种可能？',primary:['work','jobless','exam']},
 sustainable:{title:'按自己的节奏，翻到毕业',text:'你开始同时考虑目标和眼前资源。毕业没有统一进度，你想读哪种可能？',primary:['work','lost','gap']}
};
export function branchFor(s){
 const previous=s.history[s.index-1];
 if(s.index===0)return {id:'enrollment',title:'大学的第一页',narration:'录取结果已经确定。接下来的时间，你想从哪里开始？',options:[OPTIONS.ask,OPTIONS.try]};
 let b;
 if(s.index===1){b=previous.choiceId==='ask'
  ?{id:'explore_rules',title:'规则查清后，先走哪一步？',narration:'你找到一些校内机会，但查到信息与适合自己，是两件事。',options:[OPTIONS.transfer_prepare,OPTIONS.course]}
  :{id:'explore_trial',title:'试过一次，还想继续吗？',narration:'第一次尝试留下了兴趣，也占用了时间。你愿意再投入多少？',options:[OPTIONS.practice,OPTIONS.rethink]};
 }else if(s.index===2){b=previous.focus==='academic'
  ?{id:'junior_academic',title:'学习更深，还是先看看工作？',narration:'你沿着课程与专业探索了一段。大三临近，学习和实践开始争用时间。',options:[OPTIONS.prepare,OPTIONS.intern]}
  :previous.focus==='practice'&&previous.choiceId==='follow_source'
   ?{id:'junior_workday',title:'岗位看过了，先验证哪一件事？',narration:'你比较过岗位日常，还没有亲手做过。可以先问一次实习，也可以试一个小项目。',options:[OPTIONS.intern,OPTIONS.practice]}
   :previous.focus==='practice'
   ?{id:'junior_portfolio',title:'作品有了，缺口也看见了',narration:'小项目留下了成果，也暴露了不足。接下来是先获取外部反馈，还是补基础？',options:[OPTIONS.portfolio_intern,OPTIONS.study_gap]}
   :{id:'junior_sustainable',title:'先让计划，装得进生活',narration:'你开始重视能持续的尝试。大三的准备，要一起考虑时间、支出和状态。',options:[OPTIONS.budget_plan,OPTIONS.small_practice]};
 }else{const f=finals[previous.focus]||finals.sustainable;return {id:'graduation_'+(previous.focus||'sustainable'),title:f.title,narration:f.text,primary:f.primary};}
 const lens=SOURCE_LENSES[previous.sourceId];
 return {...b,options:[...b.options,{id:'follow_source',...lens,sourceId:previous.sourceId,refs:[previous.sourceId,...b.options[0].refs.filter(id=>id!==previous.sourceId)].slice(0,3)}]};
}
export const SHORT_SOURCES={
 major_transfer:'建议先查本校转专业条件、期限与准备要求。',major_first:'作者自述凭大一成绩申请转专业获通过。',
 college_planning:'建议分阶段探索与实践，再权衡就业或深造。',intern_review:'作者自述比较岗位日常，逐渐找到兴趣方向。',
 graduate_work:'作者自述考研失利、错过实习与高强度工作。',graduate_three:'作者自述多次考研失利后，进入跨专业岗位。',
 jobless:'作者自述边代课边备考，2020 年发文时暂无正式工作。'
};
