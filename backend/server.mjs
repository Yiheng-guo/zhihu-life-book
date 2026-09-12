import http from 'node:http';
import {guideHttp} from './guide.mjs';
import {localStore} from './local-store.mjs';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createState,transition,view} from '../frontend/story.mjs';
const frontend=new URL('../frontend/',import.meta.url);
const files=new Set(['index.html','styles.css','app.mjs','content.mjs','story.mjs','config.js','cover.mjs','branches.mjs','experience.mjs','source-utils.mjs','game.mjs','play-state.mjs','voices.mjs','audio.mjs']);
const MIME={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',js:'text/javascript; charset=utf-8',jpg:'image/jpeg'};
const json=(res,status,body)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(body));};
async function body(req){let raw='';for await(const c of req){raw+=c;if(Buffer.byteLength(raw)>16384)throw Object.assign(new Error('请求过长'),{status:413});}try{return JSON.parse(raw||'{}');}catch{throw Object.assign(new Error('请求不是有效 JSON'),{status:400});}}
export function createServer(){
 const guideStore=localStore();const sessions=new Map();const ttl=2*60*60*1000;
 return http.createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(req.method==='GET'&&path==='/healthz')return json(res,200,{ok:true,version:'2.1',mode:'curated',runtime_ai:!!process.env.ZHIHU_ACCESS_SECRET});
 if(req.method==='POST'&&path.startsWith('/api/guide')){
 const data=await body(req);const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort();});const request=new Request('http://'+req.headers.host+path,{method:'POST',headers: {...req.headers,'content-type':'application/json'},body:JSON.stringify(data),signal:controller.signal});const response=await guideHttp(request,process.env,{store:guideStore});res.writeHead(response.status,Object.fromEntries(response.headers));if(response.body){for await(const chunk of response.body)res.write(chunk);}return res.end();
 }
 if(req.method==='POST'&&path.startsWith('/api/')){
  // Local same-origin service; deployment with remote browsers needs an explicit origin/auth policy.
  if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{code:'ORIGIN_DENIED',message:'请求来源不受支持'});
  const data=await body(req), now=Date.now();for(const [id,s]of sessions)if(now-s.touched>ttl)sessions.delete(id);
  if(path==='/api/story/start'){
   if(sessions.size>=1000)return json(res,503,{code:'BUSY',message:'服务繁忙，请稍后再试'});
   const id=randomUUID(), state=createState();sessions.set(id,{state,touched:now});return json(res,200,{session_id:id,view:view(state)});
  }
  if(path==='/api/story/event'){
   const session=sessions.get(data.session_id);if(!session)return json(res,404,{code:'SESSION_NOT_FOUND',message:'本次阅读已过期，请重新开始'});
   try{session.state=transition(session.state,data.event);session.touched=now;return json(res,200,{session_id:data.session_id,view:view(session.state)});}
   catch(e){return json(res,e.code==='STALE_STATE'?409:400,{code:e.code||'INVALID_EVENT',message:e.message});}
  }
  return json(res,404,{code:'NOT_FOUND',message:'没有这个接口'});
 }
 if(req.method==='GET'){
  const name=path==='/'?'index.html':path.slice(1);
  if(name==='assets/campus.jpg') { const data=await readFile(new URL('../frontend/campus.jpg',frontend)); res.writeHead(200,{'content-type':'image/jpeg','cache-control':'public,max-age=86400'}); return res.end(data); }
  if(!files.has(name))return json(res,404,{code:'NOT_FOUND',message:'没有这个页面'});
  const data=name==='config.js'?"window.LIFE_BOOK_CONFIG = {mode:'local',apiBase:'',guideEndpoint:'/api/guide'};":await readFile(new URL(name,frontend));
  res.writeHead(200,{'content-type':MIME[name.split('.').at(-1)],'cache-control':'no-cache'});return res.end(data);
 }
 json(res,405,{code:'METHOD_NOT_ALLOWED',message:'不支持的请求方式'});
 }catch(e){json(res,e.status||500,{code:'REQUEST_FAILED',message:e.status?e.message:'服务暂时不可用'});}});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);createServer().listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
}
