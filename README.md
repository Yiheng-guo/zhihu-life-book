# 人生之书 · 知乎黑客松

以知乎真实问题、扎实回答和持续启发为内容基础的互动人生叙事项目。

## 当前版本

`1.0`

版本规则见 [版本管理规则](docs/VERSIONING.md)，变更记录见 [CHANGELOG.md](CHANGELOG.md)。

## 当前目标

完成“人生之书·大学篇”的公网可体验最小闭环：进入故事、完成一次选择、看到下一段剧情和有来源的知乎真实经历，并能继续进入下一节点。

## 目录

- `frontend/`：前端体验与交互
- `backend/`：剧情状态、知乎内容与 AI 编排 API
- `docs/`：产品简报、比赛规则、API、团队流程、路线图与验收清单

## 重要文档

- [产品简报](docs/PRODUCT_BRIEF.md)
- [现场 Demo 脚本](docs/DEMO_SCRIPT.md)
- [P0 验收清单](docs/ACCEPTANCE.md)
- [比赛规则与策略](docs/COMPETITION.md)
- [团队分工与协作流程](docs/TEAM.md)
- [接口约定](docs/API.md)

## 开发原则

- 第一阶段聚焦“大学篇”最小可玩闭环。
- Access Secret、模型密钥等敏感信息只放在本地环境变量，不提交到仓库。
- 前端通过后端 API 获取剧情和知乎内容，浏览器端不直接持有密钥。
