# 人生之书 · 大学篇 2.0

走进知乎的真实经历，探索人生的不同可能，再把一个小步带回今天。

体验：https://renshuzhi-shu.guo131378.chatgpt.site/

四个阶段、条件分叉、八种毕业情境；知乎原文独立溯源。经历向导调用知乎直答，按需检索更多经历，支持追问与采纳到今日书签。粒子与音效围绕选择反馈，默认静音，支持手机和减少动态效果。

## 开发

Node.js 24。`npm install`、`npm run dev` 启动本地同源页面与 API；`npm test` 验证故事和向导；`npm run build` 构建 Worker 和公开文件。

本地 AI 通过环境变量 `ZHIHU_ACCESS_SECRET` 配置，未配置仍可体验故事。生产凭证使用 Sites secrets，不能放在前端或提交到仓库。

## 交付与接手

- [2.0 产品、技术与三分钟路演](docs/RELEASE_2.0.md)
- [API 约定](docs/API.md)
- [比赛规则](docs/COMPETITION.md)
- [版本记录](CHANGELOG.md)

版本号使用两段：1.0、1.1、2.0；每次可交付版本保留 Git 标签。
