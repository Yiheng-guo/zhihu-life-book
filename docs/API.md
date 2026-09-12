# 最小接口约定（第一版）

后端服务统一以 `/api` 开头。前端只调用后端，不在浏览器中保存知乎或模型密钥。

## 启动故事

`POST /api/story/start`

响应至少包含：`session_id`、`node_id`、`title`、`narration`、`choices`。

## 提交选择

`POST /api/story/choose`

请求：

```json
{"session_id":"demo-001","node_id":"freshman_start","choice_id":"plan"}
```

响应至少包含：

```json
{
  "session_id":"demo-001",
  "node_id":"freshman_plan",
  "narration":"下一段剧情文本",
  "choices":[{"id":"continue","label":"继续"}],
  "references":[{"title":"知乎真实经历标题","summary":"摘要","url":"https://www.zhihu.com/..."}]
}
```

## 健康检查

`GET /healthz` 返回服务是否可用。错误响应统一包含 `code` 和 `message`。
