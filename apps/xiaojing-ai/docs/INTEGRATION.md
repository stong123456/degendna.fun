# DegenDNA 接入契约草案

## 原则

1. 小镜 AI 保持独立域和独立数据边界，接入阶段优先采用深链与短期签名令牌。
2. 心理自测原始答案、敏感分数、危机信息不离开用户设备，不绑定钱包地址。
3. 交易人格结果只能在用户主动确认后传递；默认仅传类型、代码、六维结果和生成时间，不传 48 题原始答案。
4. 钱包公开链上数据属于另一条授权链路，不能因为用户导入交易人格结果而自动关联。

## 建议深链

```text
https://companion.degendna.fun/?source=degendna&entry=persona
https://companion.degendna.fun/?source=degendna&entry=mental-checkin
```

## 交易人格导入数据

```json
{
  "schema": "degendna.persona.v1",
  "type": "FOMO 短跑手",
  "code": "SNEAQF",
  "dimensions": {
    "机会敏感度": 72,
    "决策果断性": 58,
    "资金管理力": -18,
    "风险承受力": 64,
    "耐心与纪律": 31,
    "情绪稳定性": 76
  },
  "generatedAt": "2026-07-14T00:00:00.000Z"
}
```

## 心理自测联动

心理自测中心只返回用户主动选择的非敏感摘要，例如：

```json
{
  "schema": "degendna.mental-summary.v1",
  "userConsent": true,
  "focus": ["睡眠", "交易冲动"],
  "preferredAction": "今晚减少看盘",
  "expiresAt": "2026-07-15T00:00:00.000Z"
}
```

禁止传递：原始题目答案、自伤题答案、危机状态、可识别身份、钱包地址和可反推量表分数的数据。

## 后续接口

- `POST /api/integrations/degendna/persona-token`：DegenDNA 创建一次性短期令牌。
- `POST /api/integrations/degendna/import`：小镜 AI 消费令牌并导入最小化结果。
- `POST /api/integrations/degendna/revoke`：用户主动撤销已导入上下文。
- 令牌有效期建议不超过 10 分钟，单次使用，服务端只保存散列和过期时间。

