# 链上照妖镜 / Onchain Mirror

输入一个 EVM 钱包地址，生成一份能晒、能比、能自嘲的链上人格报告。

第一版直接读取公开链上数据，不连接钱包、不签名、不碰私钥。服务端会聚合 Ethereum、Base、Arbitrum、Optimism、Polygon 的 Blockscout v2 数据；BNB Chain 默认使用公开 RPC 获取基础余额和 nonce，如配置 `BSCSCAN_API_KEY` 或 `ETHERSCAN_API_KEY` 会增强交易历史。

## Run

```bash
cd onchain-mirror
npm run dev
```

Open:

```text
http://127.0.0.1:8787
```

## API

```text
GET /api/analyze?address=0x...
GET /api/compare?addressA=0x...&addressB=0x...
GET /api/health
```

## Deploy Notes

- This is a zero-dependency Node app, so it can run on a VPS, Render, Railway, Fly.io, or any Node-capable container host.
- Recommended MVP host: Railway, because this repo is a normal Node HTTP server and includes `railway.json`.
- Railway settings:
  - Root directory: repository root
  - Build command: `npm install`
  - Start command: `npm start`
  - Environment variables:
    - `NODE_ENV=production`
    - `PUBLIC_SITE_URL=https://degendna.fun`
    - `PUBLIC_SITE_HOST=degendna.fun`
- DNS:
  - Add `degendna.fun` as a custom domain in Railway service settings.
  - Then set the `CNAME` and `TXT` records exactly as Railway shows in its domain screen.
  - Remove any old `A` record that points `degendna.fun` to unrelated IPs.
- For Vercel/Next.js, move `analyzeWallet` logic from `server.mjs` into a serverless route first. Deploying this exact Node server directly to Vercel is not the best first path.
- Point your domain to the deployment and set:
  - `PUBLIC_SITE_URL=https://degendna.fun`
  - `PUBLIC_SITE_HOST=degendna.fun`
- Add `ETHERSCAN_API_KEY` or `BSCSCAN_API_KEY` to improve BNB Chain coverage.

## Data Sources

- Blockscout v2 REST API for EVM chains with public Blockscout instances.
- Public BNB Chain RPC for native balance and nonce when no BscScan/Etherscan key is configured.

The report text is rule-generated from real sampled data. It is designed for social sharing and behavior hints, not financial advice.
