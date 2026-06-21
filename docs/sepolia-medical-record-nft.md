# Sepolia NFT Medical Record

This is the confirmation draft for the degendna.fun testnet NFT feature.

## Product Positioning

Name:
- 中文：链上精神科测试网病历
- English: Degen DNA Testnet Medical Record

Purpose:
- A free Sepolia commemorative NFT generated from a Degen DNA report.
- Users do not connect wallets, sign messages, or approve anything.
- Users only enter a Sepolia/EVM receiving address.
- The platform mints and sends the NFT from a dedicated Sepolia minter wallet.

Tone:
- Entertainment-first.
- Cyber clinic / onchain psychiatry style.
- Explicitly not medical, psychological, investment, or financial advice.

## Contract Draft

Contract: `DegenDnaMedicalRecord`

Network:
- Ethereum Sepolia

Standard:
- ERC-721 via OpenZeppelin
- AccessControl for admin/minter roles
- ERC721URIStorage for per-token metadata URI

Hard limits:
- Max supply: `9999`
- No public mint function
- No daily mint cap in the contract
- One report hash can mint only once
- One receiving wallet can receive only one NFT forever
- Only backend minter wallet can mint
- Rarity supply caps are hard-coded onchain
- Admin can pause if something breaks

Suggested symbol:
- `DDNA-MED`

## Claim Flow

1. User generates a Degen DNA report.
2. User opens "领取测试网 NFT 病历".
3. User enters receiving address.
4. Server checks:
   - address format
   - report exists
   - daily quota remains
   - this report hash has not been minted
   - this address has not abused rate limits
5. Server checks anti-abuse rules:
   - one claim per report hash
   - one NFT per source wallet address forever
   - one NFT per receiving wallet address forever
   - one NFT per X username forever
   - sample wallets can generate unlimited reports but cannot claim NFTs
   - one active mint job per report hash
   - IP / receiver / source wallet rate limits
   - optional Turnstile challenge if traffic spikes
6. Server generates metadata and image.
7. Server mints on Sepolia with the minter wallet.
8. User sees:
   - token ID
   - tx hash
   - Sepolia Etherscan link
   - NFT image preview

## NFT Visual Style

Base card:
- Aspect ratio: 1:1
- Size: 1600 x 1600
- Theme: luxury cyber medical record + onchain case file
- Top text: `链上精神科测试网病历`
- English subtitle: `Degen DNA Medical Record`
- Patient: X display name / @handle if available
- Wallet: short address
- Diagnosis: wallet personality
- Rarity: rarity tier + combo occurrence rate
- Symptoms: 3 badges
- Attending: `链上主治医生：石头`
- Footer: `degendna.fun`

Approved art direction:
- Black hard-shell case-file frame.
- Purple/cyan neon edge lighting.
- Premium sci-fi bevels and glass panels.
- Brain scan / diagnostic screen as the main medical visual.
- Gold rarity medallion for Epic and above.
- Symptom tags as pill chips.
- Record ID visible and tied to the website numbering system.
- Attending doctor text should only show `石头`, without `@Stone141319`.
- The top-right icon must be the same across all rarities: a plain blue-gray circular medical pulse / ECG waveform icon.
- The top-right icon must not look like a lighthouse, starburst, compass, brand logo, token logo, or social logo.
- The image should feel like a premium collectible medical certificate, not a generic dashboard screenshot.

Brand exclusion:
- Do not include Lighthouse logos, Lighthouse marks, or Lighthouse invitation copy in the NFT image or metadata.
- The NFT belongs to the Degen DNA / 链上精神科 / Stone attending-doctor narrative only.
- If an AI image model tries to create a decorative mark in the top-right corner, replace it with the shared blue-gray pulse icon.

## Numbering

Token display number should echo the website and the clinic flow:

```text
DDNA-CLINIC-S0-0001
```

Format:
- `DDNA`: Degen DNA
- `CLINIC`: onchain clinic / medical-record line
- `S0`: Season 0, Genesis Clinic
- `0001`: token ID padded to 4 digits

Examples:
- `DDNA-CLINIC-S0-0001`
- `DDNA-CLINIC-S0-0420`
- `DDNA-CLINIC-S0-9999`

## Rarity Tiers

Rarity is behavior-based, not wealth-based. The goal is to make ordinary users share, not only whales.

| Tier ID | English | Chinese | Supply | Share | Visual Direction |
|---:|---|---|---:|---:|---|
| 0 | Common | 普通韭菜 | 4500 | 45.00% | dark clinical paper, blue-gray pulse icon |
| 1 | Uncommon | 小有抽象 | 2500 | 25.00% | teal medical glow, blue-gray pulse icon |
| 2 | Rare | 链上异类 | 1500 | 15.00% | blue CT scan, sharper border, blue-gray pulse icon |
| 3 | Epic | 重度 Degen | 800 | 8.00% | purple psychiatric file, holographic edge, gold medallion |
| 4 | Legendary | 币圈怪物 | 400 | 4.00% | black-gold case seal, premium certificate feel |
| 5 | Mythic | 精神状态存疑 | 249 | 2.49% | red-gold warning label, intense diagnostic stamp |
| 6 | One of One | 链上异常体 | 50 | 0.50% | anomaly case file, cyan/white glitch aura |

The actual tier comes from existing report fields:
- personality rarity
- badge rarity
- combo rarity
- wallet age
- activity diversity
- Degen score
- diamond hand score
- airdrop radar score

Mystic layer:
- The rarity visual should also include a light "玄学" layer.
- This layer is deterministic from the report hash, not random at mint time.
- Suggested metadata traits:
  - `Chain Moon Phase`
  - `Onchain Pulse`
  - `Candle Omen`
  - `Clinic Room`
  - `Fate Vector`

Example values:
- Chain Moon Phase: `New Moon`, `Half Moon`, `Full Moon`, `Blood Moon`, `Void Moon`
- Onchain Pulse: `Calm`, `Overclocked`, `Irregular`, `FOMO Spike`, `Diamond Slowbeat`
- Candle Omen: `Green Mirage`, `Red Fog`, `Sideways Sutra`, `Breakout Fever`
- Clinic Room: `Room 404`, `Room 777`, `Room 1314`, `Room 8888`
- Fate Vector: `Mean Reversion`, `Narrative Drift`, `Cycle Echo`, `Liquidity Shadow`

## Metadata Schema

```json
{
  "name": "Degen DNA Medical Record DDNA-CLINIC-S0-0001",
  "description": "A Sepolia testnet commemorative medical-record NFT generated from a degendna.fun onchain personality report. Entertainment only. Not medical, psychological, investment, or financial advice.",
  "image": "https://degendna.fun/api/nft/image/1.png",
  "external_url": "https://degendna.fun",
  "attributes": [
    { "trait_type": "Diagnosis", "value": "高位接盘艺术家" },
    { "trait_type": "Rarity", "value": "Epic" },
    { "trait_type": "Rarity CN", "value": "重度 Degen" },
    { "trait_type": "Degen Index", "value": 87, "max_value": 100 },
    { "trait_type": "Diamond Hand Index", "value": 21, "max_value": 100 },
    { "trait_type": "Airdrop Radar", "value": 64, "max_value": 100 },
    { "trait_type": "Badge 1", "value": "手速比脑子快" },
    { "trait_type": "Badge 2", "value": "止损按钮失踪" },
    { "trait_type": "Badge 3", "value": "阳线过敏" },
    { "trait_type": "Chain Moon Phase", "value": "Void Moon" },
    { "trait_type": "Onchain Pulse", "value": "FOMO Spike" },
    { "trait_type": "Candle Omen", "value": "Green Mirage" },
    { "trait_type": "Clinic Room", "value": "Room 1314" },
    { "trait_type": "Fate Vector", "value": "Narrative Drift" },
    { "trait_type": "Season", "value": "Season 0: Genesis Clinic" },
    { "trait_type": "Network", "value": "Ethereum Sepolia" }
  ]
}
```

## Season System

Season 0:
- Name: `Genesis Clinic`
- Badge: `第一批照妖者`
- Claim supply: 9999
- Daily discharge cap: none at contract level
- Abuse control: backend claim tickets and rate limits

Suggested copy:

中文:
> 你已完成链上精神科初诊。本病历已发送至 Sepolia 测试网，仅供收藏、自嘲与复诊使用。

English:
> Your wallet has completed its first onchain clinic visit. This medical record was issued on Sepolia testnet for collection, self-roast, and future checkups.

## Anti-Abuse Rules

NFT claim rules:
- One source wallet can create only one NFT claim forever.
- One receiving wallet can receive only one NFT forever.
- One X username can be attached to only one NFT claim forever.
- One report hash can mint only once.
- Sample wallets are blocked from NFT claiming.
- Users can generate sample reports freely, but sample reports have `nftEligible=false`.
- The contract itself has no public mint function, so attackers cannot bypass the website and mint directly.
- The backend must check Supabase before minting and insert/update claim state around the mint transaction.

Report / leaderboard rules:
- Sample wallets can generate unlimited reports.
- A real wallet + X username pair should not create duplicate leaderboard rows.
- A wallet address should not create multiple NFT claims even if the X username or receiver changes.

## Backend Environment Variables

These should be added only after confirmation and deployment-wallet funding:

```text
SEPOLIA_RPC_URL=
SEPOLIA_MINTER_PRIVATE_KEY=
SEPOLIA_NFT_CONTRACT_ADDRESS=
NFT_CLAIM_ENABLED=true
NFT_MAX_SUPPLY=9999
```

Never expose the private key in browser code, GitHub, or screenshots.

## Supabase Table Draft

See `supabase/nft_claims.sql`.

The backend should store claim state before/after minting so a retry cannot mint duplicates.

## Confirmation Needed

Please confirm:

1. Contract name: `DegenDnaMedicalRecord`
2. NFT name: `Degen DNA Medical Record`
3. Symbol: `DDNA-MED`
4. Max supply: `9999`
5. No daily mint cap
6. Rarity caps: `4500 / 2500 / 1500 / 800 / 400 / 249 / 50`
7. Tier names, mystic traits, and visual directions above

After confirmation:

1. Add Hardhat + OpenZeppelin + ethers.
2. Compile contract.
3. Generate a Sepolia-only deployer/minter wallet.
4. Share only the public address for Sepolia gas.
5. Deploy contract after gas arrives.
6. Add claim API and frontend claim panel.
