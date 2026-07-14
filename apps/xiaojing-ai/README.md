# 小镜 AI

面向加密交易用户的情绪陪伴与交易冲动复盘工具。本目录保存 DegenDNA 同域版本的可维护源码，生产构建输出到 `../../public/xiaojing`。

## 当前能力

- 情绪快照、冲动刹车、交易复盘、人格解读和本机私密记录。
- 自伤、自杀、伤害他人或即时危险表达的本地优先安全拦截。
- BYOK 多模型接入：OpenAI、Anthropic、Gemini、DeepSeek、通义千问、Kimi，以及自定义兼容接口。
- API Key 默认仅保存在本次浏览器会话；用户可主动选择记住在当前设备。
- 未配置模型或模型暂时不可用时，自动使用本地陪伴流程，不中断核心功能。

## 本地运行

```powershell
npm install
npm run dev
```

开发地址：`http://127.0.0.1:8790/`

生成 DegenDNA 内嵌版本：

```powershell
npm run build
```

随后由 DegenDNA 主服务通过 `/xiaojing/` 提供页面，并通过 `/xiaojing/api/chat` 转发模型请求。

## 安全边界

小镜 AI 不是医生，不做心理疾病诊断，不替代心理咨询或精神科服务；不提供投资建议，不预测行情，也不鼓励加仓、梭哈、借贷或报复性交易。

心理健康信息、危机信息和私密复盘不进入排行榜、不生成 NFT、不默认分享，也不与钱包地址绑定。

## DegenDNA 接入方向

参见 [docs/INTEGRATION.md](docs/INTEGRATION.md)。
