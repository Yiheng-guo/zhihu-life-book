// Authored fictional game rules. Source material is kept in a separate evidence trail.
export const GAME_VERSION='3.0';
export const CHAPTERS=['录取通知书','周五的三小时','第一次失败','熄灯以后','23:50','第十八页'];
export const ROUTES={project:'和知夏做原型',study_plan:'开始备考',rules:'争取转专业'};
export const ACTIVITIES={prepare:{name:'专注准备',icon:'⌘',cost:'精力 −1 · 准备 +1'},connect:{name:'和知夏聊聊',icon:'↗',cost:'关系 +1'},rest:{name:'去操场走走',icon:'☾',cost:'精力 +2'},research:{name:'查清一个问题',icon:'⌕',cost:'信息 +1'}};
export const ITEMS={letter:{title:'录取通知书',sub:'差一点，也是真的起点',icon:'▤'},promise:{title:'妈妈的语音',sub:'“考研，还来得及。”',icon:'◉'},invite:{title:'知夏的邀请',sub:'“今晚缺一个人，你来吗？”',icon:'↗'},plan:{title:'三小时的安排',sub:'原来一个晚上装不下所有愿望',icon:'▦'},demo:{title:'第一次演示',sub:'不完美，但有人用过',icon:'⌘'},failure:{title:'一张失败截图',sub:'这一次，我没删掉它',icon:'!'},door:{title:'熄灯后的对话',sub:'有人知道了我的害怕',icon:'…'},alone:{title:'深夜的草稿',sub:'这一晚，我选择自己扛',icon:'✎'},offer:{title:'实习确认函',sub:'另一扇门，也有它的代价',icon:'↗'},exam:{title:'备考日历',sub:'押上时间，不等于保证结果',icon:'▦'},pause:{title:'一段留白',sub:'生活得先接得住自己',icon:'☾'},voice:{title:'一个过来人的办法',sub:'别人的经历，让我多看见一步',icon:'知'}};
export function newGame(){return {version:GAME_VERSION,scene:0,started:false,route:null,inspected:[],motherReply:null,energy:3,support:1,pressure:0,prepared:0,information:0,academic:0,practice:0,plan:[],attempts:0,demo:null,feedbackRead:false,night:[],tactics:[],items:[],log:[],week:Array(6).fill(null),hr:false,destination:null,memories:[],today:'',checkpoint:null};}
const clamp=n=>Math.max(0,Math.min(5,n));
function item(s,id){if(!s.items.includes(id))s.items.push(id);}
function require(ok,message){if(!ok)throw Error(message);}
export function perk(s){return s.tactics.length>0;}
export function weekCounts(s){return s.week.reduce((a,v)=>{if(v)a[v]++;return a;},{work:0,study:0,rest:0});}
export function ending(s){
 const company=s.support>=3?'知夏把你们最早的失败截图发了回来：“这张别删。”':'你和知夏的聊天停在了很久以前。那次没说出口的话，还在那里。';
 let e;
 if(s.destination==='trial')e={id:'trial',title:'两条路之间，\n留了一盏灯。',line:'你争取到了一段每周三天的试行实习。考研被放慢，收入也更少，但两周后你会有一次真正的反馈。',cost:'你放弃了全职收入，也接受了更慢的备考。',mom:'妈妈：我还是担心。到时候，记得跟我说一声。'};
 else if(s.destination==='work')e={id:'work',title:s.demo==='success'?'第一次，\n有人等你上线。':'从一份普通工作，\n重新认识自己。',line:s.demo==='success'?'你带着那个被真实使用过的小原型开始实习。第一次有人问的，是“这个你能做吗”，而不是高考多少分。':'你拿着不漂亮的作品去面试，得到一个需要从头学习的机会。未来还不确定，生活先开始了。',cost:'全职实习占掉了备考时间。这一轮考试，你没有报名。',mom:'妈妈：路是你选的。饭还是要好好吃。'};
 else if(s.destination==='exam'&&s.academic+s.prepared>=3&&s.pressure<4)e={id:'admitted',title:'录取之后，\n问题换了。',line:'这条故事里，你等到了录取通知。高兴是真的；走进新的实验室，仍然不知道该研究什么，也是真的。',cost:'你放弃了这份实习。录取没有替你回答以后想过怎样的生活。',mom:'妈妈：我就知道你可以。周野，你怎么不说话？'};
 else if(s.destination==='exam')e={id:'exam',title:'分数出来了。\n生活没有结束。',line:'这条故事里，你没有等到理想的结果。关掉查分页面后，你第一次开始问：除了再考一次，我还能先做什么？',cost:'这一年的准备没有换来录取，实习窗口也已经关闭。',mom:'妈妈：要不再试一年？你这次没有立刻回答。'};
 else e={id:'pause',title:'这一页空着。\n你还在这里。',line:'毕业时，你还没确定下一站。你开始算生活费、恢复作息，也试着告诉别人：我需要一点帮助。',cost:'收入和方向还没有着落。停下来，需要现实的支持。',mom:'妈妈：这周回来吃顿饭吧。'};
 return {...e,company};
}
export function reduceGame(original,event){
 const s=structuredClone(original);const inScene=i=>require(s.scene===i,'这一幕已经过去了。');
 switch(event.type){
 case 'start':s.started=true;break;
 case 'inspect':inScene(0);require(['letter','promise','invite'].includes(event.id),'没有这件物品');if(!s.inspected.includes(event.id)){s.inspected.push(event.id);item(s,event.id);}break;
 case 'mother':inScene(0);require(!s.motherReply,'这句话已经发出去了');require(['promise','honest'].includes(event.value),'请选择要说的话');s.motherReply=event.value;if(event.value==='promise')s.pressure++;else s.information++;break;
 case 'route':inScene(0);require(s.inspected.length>=2,'先看看桌面上至少两件东西。');require(ROUTES[event.value],'请选择今晚的约定');s.route=event.value;s.scene=1;s.log.push({title:'入学第一晚',text:'你决定'+ROUTES[event.value]+'。'});break;
 case 'slot':inScene(1);require(Number.isInteger(event.index)&&event.index>=0&&event.index<3,'时段无效');require(event.value===null||ACTIVITIES[event.value],'安排无效');s.plan[event.index]=event.value;break;
 case 'plan':inScene(1);require([0,1,2].every(i=>ACTIVITIES[s.plan[i]]),'还有时段没安排好');for(const a of s.plan){if(a==='prepare'){s.prepared++;s.energy--;if(s.route==='study_plan')s.academic++;if(s.route==='project')s.practice++;}if(a==='connect')s.support++;if(a==='rest')s.energy+=2;if(a==='research')s.information++;}s.energy=clamp(s.energy);s.support=clamp(s.support);if(s.energy===0)s.pressure++;item(s,'plan');s.log.push({title:'周五的三小时',text:s.plan.map(a=>ACTIVITIES[a].name).join(' / ')});s.scene=2;break;
 case 'feedback':inScene(2);s.feedbackRead=true;break;
 case 'attempt':inScene(2);require(!s.demo,'这一场已经结束');require(s.attempts<2,'演示机会已经用完');require(['core','everything','trial'].includes(event.scope),'请决定展示范围');require(['need','impress'].includes(event.target),'先决定回应谁');require(event.scope!=='trial'||perk(s),'先借鉴一段过来人的经历');s.attempts++;const cost=event.scope==='everything'?2:event.scope==='trial'?0:1;const enough=s.energy>=cost;
 s.energy=clamp(s.energy-cost);const focused=event.target==='need'&&s.feedbackRead;const prepared=s.prepared>=1||(s.information>=1&&event.scope==='trial');const success=enough&&focused&&prepared&&(event.scope!=='everything'||s.prepared>=2);
 if(success){s.demo='success';s.practice+=s.route==='project'?1:0;item(s,'demo');s.log.push({title:'第一次尝试',text:event.scope==='trial'?'你借用一段经历的方法，先请对方试了一小步。':'你回应了具体反馈，让第一次尝试真正有了结果。'});}else{ s.pressure++;if(s.attempts>=2||s.energy===0&&!perk(s)){s.demo='failed';item(s,'failure');s.log.push({title:'第一次失败',text:'努力没有让这次尝试成功。截图留了下来。'});}}
 break;
 case 'leaveDemo':inScene(2);if(!s.demo){s.demo='failed';item(s,'failure');s.log.push({title:'第一次失败',text:'你停止硬撑，把问题留到了明天。'});}s.scene=3;break;
 case 'night':inScene(3);require(['knock','work','rest'].includes(event.value),'行动无效');require(s.night.length<2&&!s.night.includes(event.value),'今晚不能重复这件事');s.night.push(event.value);if(event.value==='knock'){s.support=clamp(s.support+2);s.pressure=Math.max(0,s.pressure-1);item(s,'door');}if(event.value==='work'){s.prepared++;s.academic++;s.energy=clamp(s.energy-1);s.pressure++;item(s,'alone');}if(event.value==='rest'){s.energy=clamp(s.energy+2);s.pressure=Math.max(0,s.pressure-1);}break;
 case 'morning':inScene(3);require(s.night.length===2,'还剩一次夜晚行动');s.log.push({title:'熄灯以后',text:s.night.includes('knock')?'你敲了知夏的门，让一个人知道自己的害怕。':'这一次，你没有敲门。那句话还留在草稿里。'});s.scene=4;s.checkpoint=structuredClone({...s,checkpoint:null});break;
 case 'tactic':require(s.started,'先进入故事');require(event.source&&event.source.title&&event.source.url,'这条经历还没有加载好');require(/^https:\/\/(www\.)?zhihu\.com\//.test(event.source.url)||/^https:\/\/zhuanlan\.zhihu\.com\//.test(event.source.url),'来源必须可在知乎溯源');if(!s.tactics.some(t=>t.url===event.source.url)){s.tactics.push({...event.source,scene:s.scene});item(s,'voice');}break;
 case 'hr':inScene(4);require(perk(s),'先从知乎经历里找到一个值得问的问题');s.hr=true;break;
 case 'week':inScene(4);require(Number.isInteger(event.index)&&event.index>=0&&event.index<6,'日期无效');require(['work','study','rest',null].includes(event.value),'安排无效');s.week[event.index]=event.value;break;
 case 'send':inScene(4);const c=weekCounts(s);require(s.week.every(Boolean),'先把六个白天安排好');
 if(c.work>=4){s.destination='work';item(s,'offer');}
 else if(c.work===3&&c.study===2&&c.rest===1&&s.hr){s.destination='trial';item(s,'offer');item(s,'exam');}
 else if(c.study>=4){s.destination='exam';s.academic++;item(s,'exam');}
 else if(c.rest>=3){s.destination='pause';item(s,'pause');}
 else throw Error(s.hr?'这份安排还没满足任何约定。试行需要 3 天实习、2 天备考、1 天休息。':'实习至少 4 天，备考至少 4 天。想协商不同安排，先问清岗位日常。');
 s.log.push({title:'23:50 的决定',text:s.destination==='work'?'你发送了实习确认函，放下了这一轮考试。':s.destination==='exam'?'你婉拒了实习，把时间留给备考。':s.destination==='trial'?'你问到了试行的可能，签下了有期限的新约定。':'你暂缓了两份约定，先处理眼前的生活。'});s.scene=5;break;
 case 'memory':inScene(5);require(s.items.includes(event.id),'这件物品不在你的经历里');if(s.memories.includes(event.id))s.memories=s.memories.filter(i=>i!==event.id);else{require(s.memories.length<3,'文件夹只能放三件，先取出一件。');s.memories.push(event.id);}break;
 case 'today':s.today=String(event.value).slice(0,240);break;
 case 'rewind':require(s.checkpoint,'还没有走到截止日');return structuredClone({...s.checkpoint,tactics:s.tactics,checkpoint:s.checkpoint});
 default:throw Error('无法识别这次操作');
 }return s;
}
