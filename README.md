# 链上照妖镜 / Onchain Mirror

当前首页提供 **DegenDNA Play / Mental Lab / Reset** 三条产品入口。Mental Lab 共 18 套成人原创自查、353 道观察题；新增 FOMO、亏损反应、看盘边界、决策执行四套交易专题。Play 为独立的 8 题娱乐小游戏，Reset 提供 7 个本机记录工具及最近 7 天回看。

自查默认不保存，草稿与报告需要主动保存。隐私中心可下载 AES-GCM 加密备份、校验恢复和清除四类本机私密数据。娱乐分享卡与心理自查隔离，不自动向 AI 提交答案。

这不是诊断工具，原创题库与类型尚未经临床或信效度验证。专业审阅、用户访谈和试测状态见 [实施与验收](docs/product-lines/IMPLEMENTATION.md)，完整产品约定见 [产品规范](docs/product-lines/PRODUCT.md)，新增原题见 [内容审阅](docs/product-lines/QUESTION_BANK.md)。历史题库审阅仍保留在 `docs/scene-question-bank-20260926.md`。

运行：`npm run dev`，访问 `http://127.0.0.1:8787/`。Node 20+，核心自查无需额外依赖。

验证：`npm test`、`npm run audit:product`；构建小镜：`npm run build:xiaojing`。浏览器验收步骤见 `docs/product-lines/AUDIT.md`。源码级审计不等于真人体验研究或渗透测试。

以下是保留的链上报告与服务端功能说明。

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

小镜 AI 已作为同域应用接入 `/xiaojing/`。可维护源码位于 `apps/xiaojing-ai`；更新其静态构建时运行：

```bash
npm install --prefix apps/xiaojing-ai
npm run build:xiaojing
```

## API

```text
GET /api/analyze?address=0x...
GET /api/compare?addressA=0x...&addressB=0x...
GET /api/leaderboard
POST /api/leaderboard
GET /api/x-profile?username=@Stone141319
GET /api/health
GET /xiaojing/api/health
POST /xiaojing/api/chat
```

## Supabase Leaderboard

The app can run without Supabase. In that mode the public leaderboard is stored in a temporary server file and may reset after deploys.

To make the leaderboard persistent:

1. Open Supabase SQL Editor.
2. Run [supabase/leaderboard.sql](./supabase/leaderboard.sql).
3. In Railway service variables, add:

```text
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_LEADERBOARD_TABLE=onchain_leaderboard
```

Use the `service_role` key only in Railway server variables. Do not expose it in browser code.

## Sepolia Medical Record NFT

The NFT flow is platform-minted for user safety:

- Users do not connect wallets.
- Users do not sign messages.
- Users do not approve tokens.
- Users only enter a receiving EVM address.
- The backend minter wallet pays Sepolia gas and calls the contract.

Contract rules are intentionally strict:

- Max supply is hard-coded at `9999`.
- No public mint function exists.
- Only `MINTER_ROLE` can mint.
- One report hash can mint once.
- One receiving wallet can receive only one NFT.
- Rarity supply caps are hard-coded: `4500 / 2500 / 1500 / 800 / 400 / 249 / 50`.

Current Sepolia deployment:

```text
DegenDnaMedicalRecord=0xC1170814C0e8826B947F263eFFCaD2668fAF969e
```

Before enabling claims:

1. Run [supabase/nft_claims.sql](./supabase/nft_claims.sql) in Supabase SQL Editor.
2. Send Sepolia ETH to the local deployer/minter address.
3. Compile and deploy:

```bash
npm run compile:contracts
npm run deploy:sepolia
```

4. Add the deployed contract address and minter private key to Railway variables:

```text
SUPABASE_NFT_CLAIMS_TABLE=nft_claims
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SEPOLIA_MINTER_PRIVATE_KEY=...
SEPOLIA_NFT_CONTRACT_ADDRESS=...
NFT_CLAIM_ENABLED=true
```

Keep `NFT_CLAIM_ENABLED=false` until the contract is deployed and the Supabase table exists.

NFT artwork uses seven rarity-specific cyber clinic templates in `public/nft-templates/`. The server overlays dynamic report text onto those templates for metadata images, while the browser reuses the same templates for share-card screenshots.

## Mental Health Self-Check

The `/` app includes a separate "心理健康自测中心" view. It is intentionally not connected to wallet reports, rankings, NFT claims, or social sharing. Answers are scored in the browser; optional saved records stay in local browser storage only.

## Deploy Notes

- This is a zero-dependency Node app, so it can run on a VPS, Render, Railway, Fly.io, or any Node-capable container host.
- Production host: Fly.io app `degendna-fun-web`, configured by `Dockerfile`, `.dockerignore`, and `fly.toml` in this repository.
- Deploy from the repository root with `flyctl deploy --remote-only --ha=false`.
- The Fly configuration sets `NODE_ENV=production`, `PORT=8080`, `PUBLIC_SITE_URL=https://degendna.fun`, and `PUBLIC_SITE_HOST=degendna.fun`.
- The Machine uses a shared CPU, 256 MB RAM, and suspend-on-idle with automatic wake-up to keep low-traffic hosting costs down.
- Health checks use `GET /api/health`.
- Apex DNS for the current Fly app:
  - `A degendna.fun 66.241.124.201`
  - `AAAA degendna.fun 2a09:8280:1::184:faa7:0`
- Add the same A/AAAA targets for `www.degendna.fun` if the `www` hostname should be supported.
- Optional integrations remain server-side secrets and must never be committed:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_LEADERBOARD_TABLE=onchain_leaderboard`
  - `X_BEARER_TOKEN`
  - `SEPOLIA_MINTER_PRIVATE_KEY`
  - `SEPOLIA_NFT_CONTRACT_ADDRESS`
  - `NFT_CLAIM_ENABLED=true`
- `railway.json` and `render.yaml` are retained only as legacy/fallback deployment manifests.
- For Vercel/Next.js, move `analyzeWallet` logic from `server.mjs` into a serverless route first. Deploying this exact Node server directly to Vercel is not the best first path.
- Point your domain to the deployment and set:
  - `PUBLIC_SITE_URL=https://degendna.fun`
  - `PUBLIC_SITE_HOST=degendna.fun`
- Add `ETHERSCAN_API_KEY` or `BSCSCAN_API_KEY` to improve BNB Chain coverage.
- Add `X_BEARER_TOKEN` to resolve real X display names and profile images for cards and leaderboards. Aliases `X_API_BEARER_TOKEN` and `TWITTER_BEARER_TOKEN` are also supported. Without a token, the app falls back to the entered `@username` and public avatar lookup.

## Data Sources

- Blockscout v2 REST API for EVM chains with public Blockscout instances.
- Public BNB Chain RPC for native balance and nonce when no BscScan/Etherscan key is configured.
- Optional X API v2 user lookup when `X_BEARER_TOKEN` or its aliases are configured.

The report text is rule-generated from real sampled data. It is designed for social sharing and behavior hints, not financial advice.
