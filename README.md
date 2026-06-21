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
GET /api/leaderboard
POST /api/leaderboard
GET /api/x-profile?username=@Stone141319
GET /api/health
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
- Recommended MVP host: Railway, because this repo is a normal Node HTTP server and includes `railway.json`.
- Railway settings:
  - Root directory: repository root
  - Build command: `npm install`
  - Start command: `npm start`
  - Environment variables:
    - `NODE_ENV=production`
    - `PUBLIC_SITE_URL=https://degendna.fun`
    - `PUBLIC_SITE_HOST=degendna.fun`
    - Optional persistent leaderboard:
      - `SUPABASE_URL`
      - `SUPABASE_SERVICE_ROLE_KEY`
      - `SUPABASE_LEADERBOARD_TABLE=onchain_leaderboard`
- DNS:
  - Add `degendna.fun` as a custom domain in Railway service settings.
  - Then set the `CNAME` and `TXT` records exactly as Railway shows in its domain screen.
  - Remove any old `A` record that points `degendna.fun` to unrelated IPs.
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
