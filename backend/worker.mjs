import {guideHttp,D1GuideStore} from './guide.mjs';
import {assets} from './assets.generated.mjs';
export default {async fetch(request,env,context){
 const path=new URL(request.url).pathname;
 if(path==='/healthz')return Response.json({ok:true,version:'2.0',runtime_ai:!!env.ZHIHU_ACCESS_SECRET,storage:!!env.DB});
 if(path.startsWith('/api/guide'))return guideHttp(request,env,{store:env.DB?new D1GuideStore(env.DB):null,ip:request.headers.get('CF-Connecting-IP')||'unknown'});
 const item=assets[path==='/'?'/index.html':path];if(!item)return new Response('Not found',{status:404});
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 return new Response(request.method==='HEAD'?null:item.body,{headers:{'content-type':item.type,'cache-control':'no-cache','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','permissions-policy':'camera=(), microphone=(), geolocation=()'}});
}};
