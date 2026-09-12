# 故事接口约定（1.3）

前端与后端共享 `frontend/story.mjs` 状态机。公网静态版直接运行同一状态机；本地 API 版由 `backend/server.mjs` 提供同源接口。知乎或模型密钥不进入浏览器。

## 启动故事

`POST /api/story/start` → `{session_id, view}`。`view` 包含 `revision`、当前节点、选择、来源和阶段。

## 提交事件

`POST /api/story/event`

```json
{"session_id":"demo-001","event":{"type":"choose","revision":0,"node_id":"freshman_start","choice_id":"ask"}}
```

事件类型：`choose`（做剧情选择）、`select`（选来源）、`advance`（带来源进入下一页）、`back`（返回重选剧情）。每次事件必须携带服务端返回的 `revision`；过期事件返回 `409 STALE_STATE`。没有选来源时 `advance` 返回 `SOURCE_REQUIRED`。

## 健康检查

`GET /healthz` 返回 `{ok, version, mode, runtime_ai}`。未知路径和无效请求统一返回 JSON `{code, message}`。本地会话只保存在内存并自动过期，公网静态体验不上传个人输入。

1.3 的 view 增加 branch_id、来源的 short_summary、source_preview 和条件选项。客户端必须使用当次返回的 choices，不能硬编码某个阶段可选的 ID；同名 follow_source 行动的文字和 focus 由会话里上页来源决定。history 保存实际选项标签与来源。

## 2.0 公网经历向导

`POST /api/guide/session`：返回 2 小时有效的签名 token。

`POST /api/guide`：`{token,history:[{choice_id,source_id}],choice_id,source_id,question,followup?:boolean}`。history 仅传已完成阶段，最多3条；question 1–160字。服务端重放验证，不能从另一分支伪造行动。followup 为 true 时加入同一节点/来源最近一轮已验证对话。

返回 `{mode:live|cached|curated,reflection,next_step,question,citations:[{id,title,url,author}],tools,reason?}`。前端不得把 curated 标为实时 AI；只用 textContent 渲染。更换来源或翻页后丢弃旧请求。

公网故事仍在浏览器即时推进；本地 `/api/story/*` 保留给团队联调，公网只提供 guide 与 healthz。

## 2.1 动态来源与流式向导

本地页面与公网页面都使用浏览器状态机即时推进；`/api/story/*` 仍供旧规则联调，不承载动态快照挂载。动态来源由下面的服务端流程验证。

`POST /api/guide/sources`：`{token,history:[{choice_id,source_id,source_snapshot,effort}],choice_id,effort,concern:'direction'|'time'|'budget',angle:0|1|2,seen?:string[]}`。

返回 `{mode:'live'|'cached'|'curated',references,snapshot_id?,query?,total?,reason?}`。动态 references 含 `id,title,url,summary,short_summary,author,type,lens,question,action,retrieved_at`。`summary` 仅为知乎检索摘要；`lens` 是受内容启发的产品行动模板。成功时客户端用共享 `attachSources` 装入当前来源页。失败保留原卡片，并显示原因。客户端不得将未验证正文作为请求中的服务端来源。

`POST /api/guide` 增加 `source_snapshot,effort`，历史中的每一条也带这两个字段；动态历史必须携带原快照。快照在服务端绑定会话、路径、行动与投入；不可跨用户、跨节点或跨行动重用。

设置 `stream:true` 返回 `application/x-ndjson`：`{type:'preview'}` 仅表示已收到生成内容，不能表示答案已核验；`{type:'done',answer}` 含最终结果；`{type:'error',message}` 是失败。前端在 done 前不显示正文/采纳按钮；取消、返回或换卡应 abort，忽略旧请求。
