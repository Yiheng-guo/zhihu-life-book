# 最小闭环本地运行

## 前端

```bash
python3 -m http.server 4173 --directory frontend
```

打开 `http://localhost:4173`。未配置后端时会使用明确标注的离线降级体验。

## 后端

```bash
node backend/server.mjs
```

前端若需调用后端，可在页面前设置 `window.__STORY_API_BASE__ = 'http://localhost:8787'`。生产环境必须把知乎/模型密钥放后端环境变量中。
