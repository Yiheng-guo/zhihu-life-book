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
