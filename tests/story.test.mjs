import test from 'node:test';import assert from 'node:assert/strict';
import {createState,transition,view,SOURCES} from '../frontend/story.mjs';
import {createServer} from '../backend/server.mjs';
const step=(s,type,rest={})=>transition(s,{type,revision:s.revision,node_id:view(s).node_id,...rest});
test('source is required, can be replaced, and carries through the next node',()=>{
 let s=step(createState(),'choose',{choice_id:'ask'});
 assert.throws(()=>step(s,'advance'),{code:'SOURCE_REQUIRED'});
 assert.throws(()=>step(s,'select',{source_id:'jobless'}),{code:'INVALID_SOURCE'});
 s=step(s,'select',{source_id:'major_transfer'});const a=view(s).references.find(r=>r.id==='major_transfer').question;
 s=step(s,'select',{source_id:'major_first'});s=step(s,'advance');
 assert.equal(view(s).index,1);assert.equal(s.history[0].sourceId,'major_first');assert.notEqual(view(s).carry.question,a);
 assert.equal(s.history[0].choiceLabel,'先去了解别人怎么走过这段路');
});
test('all eight endings complete four stages, with no repeated graduation loop',()=>{
 let s=createState();for(const choice of ['ask','practice','intern']){s=step(s,'choose',{choice_id:choice});s=step(s,'select',{source_id:view(s).references[0].id});s=step(s,'advance');}
 const endings=view(s).node.choices;assert.equal(endings.length,8);
 for(const {id} of endings){let e=step(s,'choose',{choice_id:id});e=step(e,'select',{source_id:'graduate_three'});e=step(e,'advance');assert.equal(e.phase,'ending');assert.equal(e.history.length,4);assert.ok(view(e).ending.question);assert.throws(()=>step(e,'advance'),{code:'SOURCE_REQUIRED'});}
 assert.notEqual(endings.find(e=>e.id==='delay').label,endings.find(e=>e.id==='jobless').label);
});
test('invalid choices, stale operations and back cannot corrupt the path',()=>{
 let s=createState();assert.throws(()=>step(s,'choose',{choice_id:'work'}),{code:'INVALID_CHOICE'});
 s=step(s,'choose',{choice_id:'try'});assert.throws(()=>transition(s,{type:'advance',revision:0,node_id:'freshman_start'}),{code:'STALE_STATE'});
 s=step(s,'select',{source_id:'college_planning'});s=step(s,'back');assert.equal(s.history.length,0);assert.equal(s.sourceId,null);assert.equal(s.phase,'story');assert.deepEqual(createState(),createState());
});
test('published source destinations are HTTPS Zhihu originals and unknown author stays unknown',()=>{
 assert.equal(Object.keys(SOURCES).length,7);for(const r of Object.values(SOURCES)){const u=new URL(r.url);assert.equal(u.protocol,'https:');assert.ok(['www.zhihu.com','zhuanlan.zhihu.com'].includes(u.hostname));assert.ok(r.summary);}
 assert.equal(SOURCES.graduate_work.author,'作者署名待核实');assert.ok(SOURCES.jobless.summary.includes('2020'));
});
test('same-origin API keeps sessions isolated, rejects stale updates and completes the chapter',async(t)=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 const post=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};
 const first=await post('/api/story/start',{}),other=await post('/api/story/start',{});let v=first.data.view;const session_id=first.data.session_id;assert.notEqual(session_id,other.data.session_id);
 for(let i=0;i<4;i++){
 const event={type:'choose',revision:v.revision,node_id:v.node_id,choice_id:v.node.choices[0].id};let r=await post('/api/story/event',{session_id,event});assert.equal(r.status,200);v=r.data.view;
 assert.equal((await post('/api/story/event',{session_id,event})).status,409);
 r=await post('/api/story/event',{session_id,event:{type:'select',revision:v.revision,node_id:v.node_id,source_id:v.references[0].id}});assert.equal(r.status,200);v=r.data.view;
 r=await post('/api/story/event',{session_id,event:{type:'advance',revision:v.revision,node_id:v.node_id}});assert.equal(r.status,200);v=r.data.view;
 }
 assert.equal(v.phase,'ending');assert.equal(v.history.length,4);
 assert.equal((await post('/api/story/event',{session_id:'missing',event:{}})).status,404);
 assert.equal((await fetch(base+'/config.js')).status,200);
 assert.equal((await post('/api/story/event',{session_id:other.data.session_id,event:{type:'choose',revision:0,node_id:'freshman_start',choice_id:'try'}})).status,200);
});
