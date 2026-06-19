import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(__dirname, "public");
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

const SITE_URL = process.env.PUBLIC_SITE_URL || "https://degendna.fun";
const SITE_HOST = process.env.PUBLIC_SITE_HOST || "degendna.fun";

const CACHE_TTL_MS = 3 * 60 * 1000;
const cache = new Map();

const BLOCKSCOUT_CHAINS = [
  {
    id: "ethereum",
    name: "Ethereum",
    nativeSymbol: "ETH",
    explorer: "https://eth.blockscout.com",
    color: "#ff5b35"
  },
  {
    id: "base",
    name: "Base",
    nativeSymbol: "ETH",
    explorer: "https://base.blockscout.com",
    color: "#2f7cff"
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    nativeSymbol: "ETH",
    explorer: "https://arbitrum.blockscout.com",
    color: "#38a0ff"
  },
  {
    id: "optimism",
    name: "Optimism",
    nativeSymbol: "ETH",
    explorer: "https://explorer.optimism.io",
    color: "#ff2f42"
  },
  {
    id: "polygon",
    name: "Polygon",
    nativeSymbol: "POL",
    explorer: "https://polygon.blockscout.com",
    color: "#8c62ff"
  }
];

const BNB_CHAIN = {
  id: "bnb",
  name: "BNB Chain",
  nativeSymbol: "BNB",
  chainId: "56",
  rpc: "https://bsc-dataseed.binance.org",
  color: "#f0b90b"
};

const STABLES = new Set([
  "USDT",
  "USDC",
  "DAI",
  "FRAX",
  "FDUSD",
  "TUSD",
  "USDE",
  "SUSDE",
  "SUSDS",
  "USDS",
  "PYUSD",
  "USDGLO",
  "LUSD",
  "GUSD",
  "BUSD"
]);

const BLUECHIPS = new Set([
  "ETH",
  "WETH",
  "WBTC",
  "CBBTC",
  "KBTC",
  "RETH",
  "STETH",
  "WSTETH",
  "LINK",
  "AAVE",
  "UNI",
  "MKR",
  "SKY",
  "ENS",
  "ARB",
  "OP",
  "BNB",
  "MATIC",
  "POL"
]);

const MEME_HINTS = [
  "PEPE",
  "DOGE",
  "SHIB",
  "BONK",
  "WIF",
  "FLOKI",
  "MOG",
  "BRETT",
  "MOODENG",
  "DOG",
  "CAT",
  "FROG",
  "GOAT",
  "TURBO",
  "SPX",
  "PENGU",
  "WOJAK",
  "ELON",
  "CHAD",
  "INU",
  "BABY",
  "HOPPY"
];

const METHOD_GROUPS = {
  swap: ["swap", "exactinput", "exactoutput", "multicall", "execute"],
  bridge: ["bridge", "xcall", "sendmessage", "relay", "deposittransaction"],
  defi: ["deposit", "withdraw", "stake", "unstake", "supply", "borrow", "repay", "liquidity", "mint", "redeem"],
  claim: ["claim", "airdrop"],
  nft: ["safetransferfrom", "mint", "setapprovalforall"]
};

const SUPPORTED_LANGS = new Set(["zh", "en"]);

const PERSONALITIES = {
  civilServant: "civilServant",
  coldWalletMonk: "coldWalletMonk",
  conservative: "conservative",
  riskCommittee: "riskCommittee",
  normal: "normal",
  groupChatIndicator: "groupChatIndicator",
  halfThesisBeliever: "halfThesisBeliever",
  memeSoldier: "memeSoldier",
  dogcoinSurgeon: "dogcoinSurgeon",
  liquidityDiver: "liquidityDiver",
  topBuyer: "topBuyer",
  greenCandleRomantic: "greenCandleRomantic",
  exitLiquidityPoet: "exitLiquidityPoet",
  diamond: "diamond",
  timeCapsuleHolder: "timeCapsuleHolder",
  bagMonk: "bagMonk",
  airdrop: "airdrop",
  bridgeNomad: "bridgeNomad",
  questNPC: "questNPC",
  nftGhost: "nftGhost",
  jpgArchaeologist: "jpgArchaeologist",
  pressure: "pressure",
  gasArsonist: "gasArsonist",
  contractButtonMasher: "contractButtonMasher",
  stable: "stable",
  stablecoinMonk: "stablecoinMonk",
  collector: "collector",
  dustMuseum: "dustMuseum",
  bluechipTourist: "bluechipTourist",
  whaleCosplay: "whaleCosplay",
  yieldFarmGhost: "yieldFarmGhost"
};

const PERSONALITY_TEXT = {
  [PERSONALITIES.civilServant]: {
    zh: "链上公务员",
    en: "Onchain Civil Servant",
    verdict: {
      zh: "你的钱包纪律性很强，强到牛市路过都怕打扰你。",
      en: "Your wallet is so disciplined that even a bull market would knock before entering."
    }
  },
  [PERSONALITIES.coldWalletMonk]: {
    zh: "冷钱包修行僧",
    en: "Cold Wallet Monk",
    verdict: {
      zh: "你不是不动，你是在用沉默对抗全网喊单。",
      en: "You are not inactive. You are using silence as a risk-management strategy."
    }
  },
  [PERSONALITIES.conservative]: {
    zh: "保守型玩家",
    en: "Risk Committee Intern",
    verdict: {
      zh: "你不是不敢冲，你只是每次冲之前先把自己劝退了。",
      en: "You do not avoid risk. You simply hold a board meeting before every click."
    }
  },
  [PERSONALITIES.riskCommittee]: {
    zh: "风险委员会主任",
    en: "Personal Risk Committee",
    verdict: {
      zh: "你买币前像审批预算，卖飞后像写复盘报告。",
      en: "You buy like a budget approval process and regret like a quarterly report."
    }
  },
  [PERSONALITIES.normal]: {
    zh: "正常韭菜观察样本",
    en: "Standard Retail Specimen",
    verdict: {
      zh: "你很像一个标准币圈玩家：懂一点，冲一点，嘴硬很多点。",
      en: "You are a classic crypto user: some research, some impulse, industrial-grade denial."
    }
  },
  [PERSONALITIES.groupChatIndicator]: {
    zh: "群友反向指标",
    en: "Group Chat Contra-Signal",
    verdict: {
      zh: "你的交易节奏很像群聊情绪温度计，越热越容易伸手。",
      en: "Your wallet behaves like a group chat thermometer: the hotter it gets, the faster you click."
    }
  },
  [PERSONALITIES.halfThesisBeliever]: {
    zh: "半信半疑叙事党",
    en: "Half-Conviction Narrative Trader",
    verdict: {
      zh: "你不是没有逻辑，你只是经常把逻辑补在买入之后。",
      en: "You have a thesis. It just tends to arrive shortly after the entry."
    }
  },
  [PERSONALITIES.memeSoldier]: {
    zh: "Meme 冲锋队",
    en: "Meme Frontline Trooper",
    verdict: {
      zh: "你这个钱包不像资产组合，更像热点雷达的急诊室。",
      en: "This wallet is less a portfolio and more an emergency room for trending tickers."
    }
  },
  [PERSONALITIES.dogcoinSurgeon]: {
    zh: "土狗急诊科主任",
    en: "Dogcoin ER Director",
    verdict: {
      zh: "你不是在买 Meme，你是在给每个新叙事做心肺复苏。",
      en: "You are not buying memes. You are performing CPR on every new narrative."
    }
  },
  [PERSONALITIES.liquidityDiver]: {
    zh: "低流动性潜水员",
    en: "Low-Liquidity Diver",
    verdict: {
      zh: "别人看深度，你看名字；别人查池子，你先冲刺。",
      en: "Others check depth. You check the ticker and dive headfirst."
    }
  },
  [PERSONALITIES.topBuyer]: {
    zh: "高位接盘艺术家",
    en: "Top Buyer in Residence",
    verdict: {
      zh: "你不是没有判断力，你只是太容易相信下一根阳线。",
      en: "You do have judgment. It simply melts whenever the next candle turns green."
    }
  },
  [PERSONALITIES.greenCandleRomantic]: {
    zh: "阳线恋爱脑",
    en: "Green Candle Romantic",
    verdict: {
      zh: "你对阳线的信任，像刚认识三天就想长期持有。",
      en: "Your trust in green candles looks like proposing after a three-day relationship."
    }
  },
  [PERSONALITIES.exitLiquidityPoet]: {
    zh: "退出流动性诗人",
    en: "Exit Liquidity Poet",
    verdict: {
      zh: "你总能在别人准备下车时，优雅地走上车门。",
      en: "You have a gift for entering exactly when other people are looking for the exit."
    }
  },
  [PERSONALITIES.diamond]: {
    zh: "钻石手老登",
    en: "Ancient Diamond Hands",
    verdict: {
      zh: "你有几个币拿了很久，可能是信仰，也可能是忘记卖了。",
      en: "You held some assets for ages. It may be conviction. It may also be forgotten tabs."
    }
  },
  [PERSONALITIES.timeCapsuleHolder]: {
    zh: "时间胶囊持仓员",
    en: "Time Capsule Holder",
    verdict: {
      zh: "你的钱包里有些资产像考古层，打开就是上一轮牛市的空气。",
      en: "Parts of your wallet feel like an archaeological layer from the previous cycle."
    }
  },
  [PERSONALITIES.bagMonk]: {
    zh: "套牢修禅大师",
    en: "Bagholder Zen Master",
    verdict: {
      zh: "你把亏损拿成了修行，把不卖解释成了格局。",
      en: "You turned drawdown into meditation and called not selling a strategy."
    }
  },
  [PERSONALITIES.airdrop]: {
    zh: "空投游牧民",
    en: "Airdrop Nomad",
    verdict: {
      zh: "你像是在链上迁徙，哪里有任务，哪里就有你的 gas 费。",
      en: "You migrate across chains like quests are weather patterns and gas is rent."
    }
  },
  [PERSONALITIES.bridgeNomad]: {
    zh: "跨链摆渡人",
    en: "Bridge Nomad",
    verdict: {
      zh: "你不是在转账，你是在用跨链桥给自己做链上迁徙史。",
      en: "You are not bridging funds. You are writing a migration diary in transaction hashes."
    }
  },
  [PERSONALITIES.questNPC]: {
    zh: "任务列表永动机",
    en: "Quest List Perpetual Machine",
    verdict: {
      zh: "你的钱包像任务清单本人，看到交互按钮就觉得不能浪费。",
      en: "Your wallet treats every interaction button like an unclaimed side quest."
    }
  },
  [PERSONALITIES.nftGhost]: {
    zh: "NFT 时代遗民",
    en: "NFT Era Relic",
    verdict: {
      zh: "你的链上足迹还停在 JPEG 很贵、群里很吵的那个年代。",
      en: "Your onchain footprint still remembers when JPEGs were expensive and chats were louder."
    }
  },
  [PERSONALITIES.jpgArchaeologist]: {
    zh: "JPEG 考古学家",
    en: "JPEG Archaeologist",
    verdict: {
      zh: "你不是收藏 NFT，你是在替上一个周期保存文化遗址。",
      en: "You are not collecting NFTs. You are preserving cultural ruins from the last cycle."
    }
  },
  [PERSONALITIES.pressure]: {
    zh: "合约压力怪",
    en: "Contract Stress Tester",
    verdict: {
      zh: "你这个钱包看起来很冷静，实际下手的时候比群里喊单的人还急。",
      en: "This wallet looks calm until a contract appears. Then it starts stress-testing itself."
    }
  },
  [PERSONALITIES.gasArsonist]: {
    zh: "Gas 纵火犯",
    en: "Gas Arsonist",
    verdict: {
      zh: "你的手续费记录像火灾现场，链上每一步都带着焦味。",
      en: "Your fee history looks like a fire scene. Every click smells slightly burnt."
    }
  },
  [PERSONALITIES.contractButtonMasher]: {
    zh: "合约按钮连点器",
    en: "Contract Button Masher",
    verdict: {
      zh: "你不是在交互协议，你是在跟钱包弹窗打连招。",
      en: "You are not interacting with protocols. You are combo-clicking wallet popups."
    }
  },
  [PERSONALITIES.stable]: {
    zh: "稳定币躺平派",
    en: "Stablecoin Couch Strategist",
    verdict: {
      zh: "你把波动留给别人，把安全感留给自己，顺便错过一点刺激。",
      en: "You outsourced volatility to everyone else and kept the anxiety hedge."
    }
  },
  [PERSONALITIES.stablecoinMonk]: {
    zh: "USDT 禅修班学员",
    en: "USDT Meditation Student",
    verdict: {
      zh: "你不是没有野心，你只是把野心暂存在稳定币里。",
      en: "You are not ambitionless. Your ambition is temporarily parked in stablecoins."
    }
  },
  [PERSONALITIES.collector]: {
    zh: "只买不卖型收藏家",
    en: "Buy-Only Museum Curator",
    verdict: {
      zh: "你不是交易员，你像一个什么都舍不得扔的链上收藏夹。",
      en: "You are less a trader and more a museum curator for things you never sell."
    }
  },
  [PERSONALITIES.dustMuseum]: {
    zh: "链上灰尘博物馆馆长",
    en: "Dust Museum Director",
    verdict: {
      zh: "你的钱包不是乱，是每一粒链上灰尘都有自己的展柜。",
      en: "Your wallet is not messy. Every speck of onchain dust has its own display case."
    }
  },
  [PERSONALITIES.bluechipTourist]: {
    zh: "蓝筹观光客",
    en: "Bluechip Tourist",
    verdict: {
      zh: "你有主流资产的体面，也有随时想去小币区看热闹的心。",
      en: "You hold respectable assets, but your curiosity keeps staring at the spicy aisle."
    }
  },
  [PERSONALITIES.whaleCosplay]: {
    zh: "巨鲸 Cosplay 玩家",
    en: "Whale Cosplayer",
    verdict: {
      zh: "你的仓位有排面，操作却偶尔像在夜市试吃。",
      en: "The balance has presence. The behavior occasionally shops like a street-market sampler."
    }
  },
  [PERSONALITIES.yieldFarmGhost]: {
    zh: "流动性挖矿后遗症",
    en: "Yield Farm Afterimage",
    verdict: {
      zh: "你对池子、质押和收益率的条件反射，还停在 DeFi 夏天。",
      en: "Your reflex for pools, staking, and yield still smells faintly like DeFi summer."
    }
  }
};

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(data);
}

function isAddress(input) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(input || "").trim());
}

function normalizeLang(input) {
  const value = String(input || "").trim().toLowerCase();
  return SUPPORTED_LANGS.has(value) ? value : "zh";
}

function pickLocalized(lang, zh, en) {
  return lang === "en" ? en : zh;
}

function personalityName(id, lang) {
  return PERSONALITY_TEXT[id]?.[lang] || PERSONALITY_TEXT[PERSONALITIES.normal][lang];
}

function personalityVerdict(id, lang) {
  return PERSONALITY_TEXT[id]?.verdict?.[lang] || PERSONALITY_TEXT[PERSONALITIES.normal].verdict[lang];
}

function pickByAddress(address, options) {
  const candidates = options.filter(Boolean);
  if (!candidates.length) return PERSONALITIES.normal;
  const bucket = Number.parseInt(String(address || "").slice(-8), 16);
  return candidates[Number.isFinite(bucket) ? bucket % candidates.length : 0];
}

function normalizeAddress(input) {
  return String(input || "").trim();
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function formatUnits(value, decimals = 18) {
  if (value === undefined || value === null || value === "") return 0;
  try {
    const raw = BigInt(String(value));
    const scale = 10n ** BigInt(decimals);
    const whole = raw / scale;
    const fraction = raw % scale;
    const precision = decimals > 6 ? 6 : decimals;
    const fractionText = fraction.toString().padStart(decimals, "0").slice(0, precision);
    return Number(`${whole.toString()}.${fractionText || "0"}`);
  } catch {
    return safeNumber(value, 0);
  }
}

function usd(value) {
  if (!Number.isFinite(value) || value <= 0) return "$0";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toPrecision(2)}`;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 10_000);
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "user-agent": "OnchainMirror/0.1"
      },
      body: options.body,
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function safeFetch(label, task) {
  try {
    return { ok: true, value: await task() };
  } catch (error) {
    return { ok: false, label, error: error.message || String(error) };
  }
}

function items(payload) {
  return Array.isArray(payload?.items) ? payload.items : [];
}

async function fetchBlockscoutChain(chain, address) {
  const base = chain.explorer.replace(/\/$/, "");
  const encodedAddress = encodeURIComponent(address);
  const [profile, counters, transactions, tokenTransfers, nft721Transfers, nft1155Transfers, tokens, nftTokens] =
    await Promise.all([
      safeFetch("profile", () => fetchJson(`${base}/api/v2/addresses/${encodedAddress}`)),
      safeFetch("counters", () => fetchJson(`${base}/api/v2/addresses/${encodedAddress}/counters`)),
      safeFetch("transactions", () => fetchJson(`${base}/api/v2/addresses/${encodedAddress}/transactions`)),
      safeFetch("erc20Transfers", () =>
        fetchJson(`${base}/api/v2/addresses/${encodedAddress}/token-transfers?type=ERC-20`)
      ),
      safeFetch("erc721Transfers", () =>
        fetchJson(`${base}/api/v2/addresses/${encodedAddress}/token-transfers?type=ERC-721`)
      ),
      safeFetch("erc1155Transfers", () =>
        fetchJson(`${base}/api/v2/addresses/${encodedAddress}/token-transfers?type=ERC-1155`)
      ),
      safeFetch("tokens", () => fetchJson(`${base}/api/v2/addresses/${encodedAddress}/tokens?type=ERC-20`)),
      safeFetch("nftTokens", () => fetchJson(`${base}/api/v2/addresses/${encodedAddress}/tokens?type=ERC-721`))
    ]);

  if (!profile.ok) {
    return {
      id: chain.id,
      name: chain.name,
      color: chain.color,
      ok: false,
      source: "Blockscout",
      error: profile.error
    };
  }

  const tokenItems = items(tokens.value);
  const nativeBalance = formatUnits(profile.value?.coin_balance || "0", 18);
  const nativePrice = safeNumber(profile.value?.exchange_rate, 0);

  return {
    id: chain.id,
    name: chain.name,
    nativeSymbol: chain.nativeSymbol,
    color: chain.color,
    ok: true,
    source: "Blockscout",
    explorer: base,
    nativeBalance,
    nativeUsd: nativeBalance * nativePrice,
    txCount: safeNumber(counters.value?.transactions_count, items(transactions.value).length),
    tokenTransferCount: safeNumber(counters.value?.token_transfers_count, items(tokenTransfers.value).length),
    gasUsage: safeNumber(counters.value?.gas_usage_count, 0),
    hasTokens: Boolean(profile.value?.has_tokens),
    hasTokenTransfers: Boolean(profile.value?.has_token_transfers),
    isContract: Boolean(profile.value?.is_contract),
    ens: profile.value?.ens_domain_name || null,
    addressName: profile.value?.name || null,
    transactions: items(transactions.value),
    erc20Transfers: items(tokenTransfers.value),
    nftTransfers: [...items(nft721Transfers.value), ...items(nft1155Transfers.value)],
    tokens: tokenItems,
    nftTokens: items(nftTokens.value),
    errors: [counters, transactions, tokenTransfers, nft721Transfers, nft1155Transfers, tokens, nftTokens]
      .filter((result) => !result.ok)
      .map((result) => `${result.label}: ${result.error}`)
  };
}

async function rpcCall(rpc, method, params = []) {
  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params
  });
  const response = await fetchJson(rpc, { method: "POST", body: payload });
  if (response.error) throw new Error(response.error.message || "RPC error");
  return response.result;
}

async function fetchBnbChain(address) {
  const apiKey = process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "";
  if (apiKey) {
    return fetchBnbViaEtherscan(address, apiKey);
  }

  const [balance, nonce] = await Promise.all([
    safeFetch("bnbBalance", () => rpcCall(BNB_CHAIN.rpc, "eth_getBalance", [address, "latest"])),
    safeFetch("bnbNonce", () => rpcCall(BNB_CHAIN.rpc, "eth_getTransactionCount", [address, "latest"]))
  ]);

  if (!balance.ok && !nonce.ok) {
    return {
      id: BNB_CHAIN.id,
      name: BNB_CHAIN.name,
      nativeSymbol: BNB_CHAIN.nativeSymbol,
      color: BNB_CHAIN.color,
      ok: false,
      source: "BNB public RPC",
      error: balance.error || nonce.error
    };
  }

  return {
    id: BNB_CHAIN.id,
    name: BNB_CHAIN.name,
    nativeSymbol: BNB_CHAIN.nativeSymbol,
    color: BNB_CHAIN.color,
    ok: true,
    source: "BNB public RPC",
    nativeBalance: balance.ok ? formatUnits(BigInt(balance.value).toString(), 18) : 0,
    nativeUsd: 0,
    txCount: nonce.ok ? Number.parseInt(nonce.value, 16) : 0,
    tokenTransferCount: 0,
    gasUsage: 0,
    transactions: [],
    erc20Transfers: [],
    nftTransfers: [],
    tokens: [],
    nftTokens: [],
    errors: ["BNB Chain uses public RPC only unless BSCSCAN_API_KEY or ETHERSCAN_API_KEY is set."]
  };
}

async function fetchBnbViaEtherscan(address, apiKey) {
  const base = `https://api.etherscan.io/v2/api?chainid=${BNB_CHAIN.chainId}&apikey=${encodeURIComponent(apiKey)}`;
  const [balance, txs, erc20, nft] = await Promise.all([
    safeFetch("balance", () => fetchJson(`${base}&module=account&action=balance&address=${address}&tag=latest`)),
    safeFetch("txlist", () =>
      fetchJson(`${base}&module=account&action=txlist&address=${address}&page=1&offset=50&sort=desc`)
    ),
    safeFetch("tokentx", () =>
      fetchJson(`${base}&module=account&action=tokentx&address=${address}&page=1&offset=50&sort=desc`)
    ),
    safeFetch("tokennfttx", () =>
      fetchJson(`${base}&module=account&action=tokennfttx&address=${address}&page=1&offset=50&sort=desc`)
    )
  ]);

  const txItems = Array.isArray(txs.value?.result) ? txs.value.result : [];
  const erc20Items = Array.isArray(erc20.value?.result) ? erc20.value.result : [];
  const nftItems = Array.isArray(nft.value?.result) ? nft.value.result : [];
  const tokenMap = new Map();
  for (const transfer of erc20Items) {
    const symbol = transfer.tokenSymbol || "TOKEN";
    const key = `${transfer.contractAddress}:${symbol}`;
    if (!tokenMap.has(key)) {
      tokenMap.set(key, {
        token: {
          address_hash: transfer.contractAddress,
          decimals: transfer.tokenDecimal || "18",
          exchange_rate: null,
          holders_count: null,
          name: transfer.tokenName || symbol,
          symbol,
          type: "ERC-20"
        },
        value: "0"
      });
    }
  }

  return {
    id: BNB_CHAIN.id,
    name: BNB_CHAIN.name,
    nativeSymbol: BNB_CHAIN.nativeSymbol,
    color: BNB_CHAIN.color,
    ok: true,
    source: "Etherscan V2",
    nativeBalance: balance.ok ? formatUnits(balance.value?.result || "0", 18) : 0,
    nativeUsd: 0,
    txCount: txItems.length,
    tokenTransferCount: erc20Items.length + nftItems.length,
    gasUsage: txItems.reduce((sum, tx) => sum + safeNumber(tx.gasUsed, 0), 0),
    transactions: txItems.map(normalizeEtherscanTx),
    erc20Transfers: erc20Items.map(normalizeEtherscanTokenTransfer),
    nftTransfers: nftItems.map(normalizeEtherscanTokenTransfer),
    tokens: [...tokenMap.values()],
    nftTokens: [],
    errors: [balance, txs, erc20, nft]
      .filter((result) => !result.ok)
      .map((result) => `${result.label}: ${result.error}`)
  };
}

function normalizeEtherscanTx(tx) {
  return {
    hash: tx.hash,
    timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : null,
    status: tx.isError === "1" ? "error" : "ok",
    method: tx.methodId || tx.functionName || "",
    value: tx.value || "0",
    from: { hash: tx.from },
    to: { hash: tx.to },
    transaction_types: tx.input && tx.input !== "0x" ? ["contract_call"] : ["coin_transfer"]
  };
}

function normalizeEtherscanTokenTransfer(tx) {
  return {
    transaction_hash: tx.hash,
    timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : null,
    from: { hash: tx.from },
    to: { hash: tx.to },
    method: tx.functionName || "transfer",
    token_type: tx.tokenID ? "ERC-721" : "ERC-20",
    token: {
      address_hash: tx.contractAddress,
      decimals: tx.tokenDecimal || "18",
      name: tx.tokenName,
      symbol: tx.tokenSymbol,
      type: tx.tokenID ? "ERC-721" : "ERC-20"
    },
    total: {
      decimals: tx.tokenDecimal || "18",
      value: tx.value || "0"
    },
    type: "token_transfer"
  };
}

function classifyMethod(method = "") {
  const normalized = String(method || "").toLowerCase();
  const groups = [];
  for (const [group, hints] of Object.entries(METHOD_GROUPS)) {
    if (hints.some((hint) => normalized.includes(hint))) groups.push(group);
  }
  return groups;
}

function tokenSymbol(tokenItem) {
  return String(tokenItem?.token?.symbol || "").toUpperCase();
}

function tokenName(tokenItem) {
  return String(tokenItem?.token?.name || "");
}

function tokenUsdValue(tokenItem) {
  const token = tokenItem?.token || {};
  const decimals = safeNumber(token.decimals, 18);
  const amount = formatUnits(tokenItem.value || tokenItem.total?.value || "0", decimals);
  return amount * safeNumber(token.exchange_rate, 0);
}

function isMemeToken(tokenItem) {
  const symbol = tokenSymbol(tokenItem);
  const name = tokenName(tokenItem).toUpperCase();
  return MEME_HINTS.some((hint) => symbol.includes(hint) || name.includes(hint));
}

function isStableToken(tokenItem) {
  return STABLES.has(tokenSymbol(tokenItem));
}

function isBluechipToken(tokenItem) {
  return BLUECHIPS.has(tokenSymbol(tokenItem));
}

function uniqueBy(itemsToDedupe, selector) {
  const seen = new Set();
  const result = [];
  for (const item of itemsToDedupe) {
    const key = selector(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function timestampOf(item) {
  const timestamp = item?.timestamp;
  const time = timestamp ? new Date(timestamp).getTime() : NaN;
  return Number.isFinite(time) ? time : null;
}

function addressMatches(address, candidate) {
  return String(address).toLowerCase() === String(candidate || "").toLowerCase();
}

function buildMetrics(address, chains) {
  const okChains = chains.filter((chain) => chain.ok);
  const allTxs = okChains.flatMap((chain) =>
    chain.transactions.map((tx) => ({
      ...tx,
      chainId: chain.id,
      chainName: chain.name
    }))
  );
  const allTransfers = okChains.flatMap((chain) =>
    [...chain.erc20Transfers, ...chain.nftTransfers].map((transfer) => ({
      ...transfer,
      chainId: chain.id,
      chainName: chain.name
    }))
  );
  const allTokens = okChains.flatMap((chain) =>
    chain.tokens.map((token) => ({
      ...token,
      chainId: chain.id,
      chainName: chain.name
    }))
  );
  const uniqueTokens = uniqueBy(allTokens, (item) => `${item.chainId}:${item.token?.address_hash}:${tokenSymbol(item)}`);
  const nftTransfers = okChains.flatMap((chain) => chain.nftTransfers);
  const txCount = okChains.reduce((sum, chain) => sum + safeNumber(chain.txCount, 0), 0);
  const transferCount = okChains.reduce((sum, chain) => sum + safeNumber(chain.tokenTransferCount, 0), 0);
  const nativeUsd = okChains.reduce((sum, chain) => sum + safeNumber(chain.nativeUsd, 0), 0);
  const tokenUsd = uniqueTokens.reduce((sum, token) => sum + tokenUsdValue(token), 0);
  const portfolioUsd = nativeUsd + tokenUsd;
  const stableUsd = uniqueTokens.filter(isStableToken).reduce((sum, token) => sum + tokenUsdValue(token), 0);
  const memeTokens = uniqueTokens.filter(isMemeToken);
  const memeUsd = memeTokens.reduce((sum, token) => sum + tokenUsdValue(token), 0);
  const bluechipTokens = uniqueTokens.filter(isBluechipToken);
  const lowLiquidityTokens = uniqueTokens.filter((item) => safeNumber(item?.token?.holders_count, 10_000) < 1_000);
  const methods = allTxs.flatMap((tx) => classifyMethod(tx.method));
  const failedTxs = allTxs.filter((tx) => tx.status && tx.status !== "ok").length;
  const outgoingTransfers = allTransfers.filter((transfer) => addressMatches(address, transfer.from?.hash)).length;
  const incomingTransfers = allTransfers.filter((transfer) => addressMatches(address, transfer.to?.hash)).length;
  const timestamps = [...allTxs, ...allTransfers].map(timestampOf).filter(Boolean);
  const newest = timestamps.length ? Math.max(...timestamps) : null;
  const oldest = timestamps.length ? Math.min(...timestamps) : null;
  const sampleWindowDays = newest && oldest ? Math.max(1, (newest - oldest) / 86_400_000) : 0;
  const txPerDay = sampleWindowDays ? allTxs.length / sampleWindowDays : allTxs.length;
  const activeDays = new Set(timestamps.map((time) => new Date(time).toISOString().slice(0, 10))).size;

  const heldTokenAddresses = new Set(uniqueTokens.map((item) => String(item.token?.address_hash || "").toLowerCase()));
  const holdSamples = allTransfers
    .filter((transfer) => {
      const tokenAddress = String(transfer.token?.address_hash || "").toLowerCase();
      return heldTokenAddresses.has(tokenAddress) && addressMatches(address, transfer.to?.hash);
    })
    .map(timestampOf)
    .filter(Boolean)
    .map((time) => (Date.now() - time) / 86_400_000);
  const sampledHoldDays = holdSamples.length
    ? holdSamples.reduce((sum, days) => sum + days, 0) / holdSamples.length
    : null;

  return {
    okChainCount: okChains.length,
    chainCount: chains.length,
    chainsWithActivity: okChains.filter((chain) => chain.txCount || chain.tokenTransferCount || chain.nativeBalance).length,
    txCount,
    transferCount,
    sampledTxs: allTxs.length,
    activeDays,
    sampleWindowDays,
    txPerDay,
    failedTxs,
    failedRate: allTxs.length ? failedTxs / allTxs.length : 0,
    outgoingTransfers,
    incomingTransfers,
    uniqueTokenCount: uniqueTokens.length,
    nftTransferCount: nftTransfers.length,
    nftTokenCount: okChains.reduce((sum, chain) => sum + chain.nftTokens.length, 0),
    portfolioUsd,
    nativeUsd,
    tokenUsd,
    stableUsd,
    stableRatio: portfolioUsd ? stableUsd / portfolioUsd : 0,
    memeUsd,
    memeRatio: tokenUsd ? memeUsd / tokenUsd : memeTokens.length ? 0.35 : 0,
    memeTokenCount: memeTokens.length,
    bluechipTokenCount: bluechipTokens.length,
    lowLiquidityTokenCount: lowLiquidityTokens.length,
    methodCounts: methods.reduce((acc, method) => {
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {}),
    sampledHoldDays,
    topTokens: uniqueTokens
      .map((item) => ({
        chain: item.chainName,
        symbol: tokenSymbol(item) || "TOKEN",
        name: tokenName(item) || "Unknown",
        usd: tokenUsdValue(item),
        isStable: isStableToken(item),
        isMeme: isMemeToken(item),
        isBluechip: isBluechipToken(item),
        holders: safeNumber(item?.token?.holders_count, 0)
      }))
      .sort((a, b) => b.usd - a.usd)
      .slice(0, 8),
    recentTransactions: allTxs
      .sort((a, b) => (timestampOf(b) || 0) - (timestampOf(a) || 0))
      .slice(0, 8)
      .map((tx) => ({
        chain: tx.chainName,
        hash: tx.hash,
        method: tx.method || tx.transaction_types?.join(" / ") || "transfer",
        status: tx.status || tx.result || "ok",
        timestamp: tx.timestamp || null,
        value: formatUnits(tx.value || "0", 18)
      }))
  };
}

function scoreWallet(metrics) {
  const degen =
    18 +
    Math.min(22, metrics.txPerDay * 6) +
    Math.min(20, metrics.memeRatio * 32) +
    Math.min(13, metrics.memeTokenCount * 2.4) +
    Math.min(10, metrics.lowLiquidityTokenCount * 2.2) +
    Math.min(8, metrics.nftTransferCount / 5) +
    Math.min(10, metrics.methodCounts.swap * 2.5 || 0) +
    Math.min(8, metrics.failedRate * 28) +
    Math.min(6, metrics.chainsWithActivity * 1.4) -
    Math.min(20, metrics.stableRatio * 22);

  const holdBase = metrics.sampledHoldDays === null ? 42 : Math.min(42, metrics.sampledHoldDays / 3);
  const diamond =
    28 +
    holdBase +
    Math.min(16, metrics.bluechipTokenCount * 4) +
    Math.min(12, metrics.stableRatio * 14) -
    Math.min(18, metrics.txPerDay * 4) -
    Math.min(14, metrics.memeTokenCount * 1.8) -
    Math.min(6, metrics.failedRate * 20);

  const airdrop =
    Math.min(35, metrics.chainsWithActivity * 6) +
    Math.min(25, metrics.methodCounts.claim * 8 || 0) +
    Math.min(20, metrics.methodCounts.bridge * 5 || 0) +
    Math.min(20, metrics.uniqueTokenCount / 2);

  return {
    degen: clamp(degen),
    diamond: clamp(diamond),
    airdrop: clamp(airdrop)
  };
}

function choosePersonality(metrics, scores, address) {
  const picks = [];
  if (metrics.portfolioUsd > 100_000 && scores.degen > 68) picks.push(PERSONALITIES.whaleCosplay);
  if (metrics.failedRate > 0.18) picks.push(PERSONALITIES.gasArsonist, PERSONALITIES.contractButtonMasher);
  if (metrics.methodCounts.swap > 8) picks.push(PERSONALITIES.pressure, PERSONALITIES.contractButtonMasher);
  if (metrics.methodCounts.defi > 6) picks.push(PERSONALITIES.yieldFarmGhost);
  if (scores.airdrop > 68 && metrics.chainsWithActivity >= 4) {
    picks.push(PERSONALITIES.airdrop, PERSONALITIES.bridgeNomad, PERSONALITIES.questNPC);
  }
  if (metrics.nftTransferCount > metrics.sampledTxs && metrics.nftTransferCount > 8) {
    picks.push(PERSONALITIES.nftGhost, PERSONALITIES.jpgArchaeologist);
  }
  if (scores.diamond > 78 && metrics.txPerDay < 1.2) {
    picks.push(PERSONALITIES.diamond, PERSONALITIES.timeCapsuleHolder, PERSONALITIES.bagMonk);
  }
  if (metrics.stableRatio > 0.68 && scores.degen < 45) {
    picks.push(PERSONALITIES.stable, PERSONALITIES.stablecoinMonk);
  }
  if (metrics.memeTokenCount >= 8 && scores.degen > 70) {
    picks.push(PERSONALITIES.memeSoldier, PERSONALITIES.dogcoinSurgeon, PERSONALITIES.liquidityDiver);
  }
  if (metrics.memeRatio > 0.45 && metrics.lowLiquidityTokenCount > 4) {
    picks.push(PERSONALITIES.topBuyer, PERSONALITIES.greenCandleRomantic, PERSONALITIES.exitLiquidityPoet);
  }
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 4 && metrics.uniqueTokenCount > 12) {
    picks.push(PERSONALITIES.collector, PERSONALITIES.dustMuseum);
  }
  if (metrics.bluechipTokenCount >= 2 && scores.degen < 55) picks.push(PERSONALITIES.bluechipTourist);
  if (metrics.uniqueTokenCount > 24 && scores.degen < 65) picks.push(PERSONALITIES.dustMuseum);
  if (scores.degen < 25) picks.push(PERSONALITIES.civilServant, PERSONALITIES.coldWalletMonk);
  if (scores.degen < 42) picks.push(PERSONALITIES.conservative, PERSONALITIES.riskCommittee);
  if (!picks.length) {
    picks.push(PERSONALITIES.normal, PERSONALITIES.groupChatIndicator, PERSONALITIES.halfThesisBeliever);
  }
  return pickByAddress(address, [...new Set(picks)]);
}

function degenBand(score, lang) {
  if (score <= 20) return pickLocalized(lang, "链上公务员", "Onchain Civil Servant");
  if (score <= 40) return pickLocalized(lang, "保守型玩家", "Conservative Player");
  if (score <= 60) return pickLocalized(lang, "正常韭菜", "Standard Retail Specimen");
  if (score <= 80) return pickLocalized(lang, "高风险冲锋队", "High-Risk Vanguard");
  return pickLocalized(lang, "钱包生命垂危，但精神状态良好", "Wallet critical, morale excellent");
}

function buildLossCause(metrics, scores, lang) {
  if (metrics.memeTokenCount >= 8) return pickLocalized(lang, "看到别人赚钱后手速过快", "your hands accelerate when other people post gains");
  if (metrics.lowLiquidityTokenCount >= 6) return pickLocalized(lang, "喜欢冲流动性不太够的小币", "you keep diving into tokens with suspiciously shallow liquidity");
  if (metrics.txPerDay > 2.5) return pickLocalized(lang, "交易频率太高，手续费和情绪一起收割你", "your trade frequency lets fees and feelings farm you together");
  if (metrics.failedRate > 0.12) return pickLocalized(lang, "合约交互太急，失败交易都在替你喊停", "your failed transactions are trying to be your risk manager");
  if (metrics.stableRatio > 0.72 && scores.degen < 45) return pickLocalized(lang, "不是亏损，是把牛市活成了观察席", "you turned the bull market into a spectator sport");
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 5) return pickLocalized(lang, "只会进货，不太会体面下车", "you know how to enter, but exits remain theoretical");
  return pickLocalized(lang, "不是市场太坏，是你太容易相信下一根阳线", "the market is not the problem; your faith in the next green candle is");
}

function buildVerdict(personalityId, metrics, scores, lang) {
  if (metrics.portfolioUsd > 100_000 && scores.degen > 70) {
    return pickLocalized(
      lang,
      "你不是风险偏好高，你是带着金库在夜市里试吃。",
      "You are not merely risk-on. You are taking a treasury wallet to a street-food market."
    );
  }
  return personalityVerdict(personalityId, lang);
}

function buildAlphaRadar(metrics, lang) {
  const signals = [];
  if (metrics.bluechipTokenCount >= 2) {
    signals.push(pickLocalized(lang, "钱包里有主流资产留存，不是纯靠情绪开车。", "Bluechip exposure exists, so this is not pure emotional driving."));
  }
  if (metrics.chainsWithActivity >= 4) {
    signals.push(pickLocalized(lang, "跨链探索能力不错，至少不是单链游客。", "Cross-chain exploration is real; you are not a one-chain tourist."));
  }
  if (metrics.methodCounts.claim || metrics.methodCounts.bridge) {
    signals.push(pickLocalized(lang, "有空投/跨链交互习惯，属于会翻任务列表的人。", "Airdrop or bridge habits detected; you know where the quest lists live."));
  }
  if (metrics.stableUsd > 100) {
    signals.push(pickLocalized(lang, "稳定币仓位给你留了后手，说明还没完全上头。", "Stablecoin reserves give you a second move, which means the wallet is not fully tilted."));
  }
  if (metrics.sampledHoldDays && metrics.sampledHoldDays > 30) {
    signals.push(pickLocalized(lang, "样本里有长期留存资产，多少有点拿得住。", "Some assets survived longer holding windows; there is at least a trace of patience."));
  }
  if (metrics.nftTransferCount > 3) {
    signals.push(pickLocalized(lang, "NFT 痕迹明显，社区活动和链上身份感都不弱。", "NFT traces are visible; the wallet has social identity residue."));
  }
  if (!signals.length) {
    signals.push(pickLocalized(lang, "这个钱包行为还比较轻，至少暂时没有把自己写成反面教材。", "The wallet is still light on data, which means it has not yet written itself into a cautionary tale."));
  }
  return signals.slice(0, 4);
}

function buildFate(metrics, scores, lang) {
  const first =
    scores.degen > 70
      ? pickLocalized(lang, "错过一个观察很久的币，然后在别人翻倍后重新冲进去", "miss a token you watched for weeks, then re-enter after someone posts a 2x")
      : pickLocalized(lang, "继续观察几个热点，最后只在群里打出“我早看好了”", "keep watching narratives and eventually type 'I saw this early' in chat");
  const second =
    metrics.stableRatio > 0.6
      ? pickLocalized(lang, "在稳定币里等回调，等到回调结束", "wait in stables for a pullback until the pullback is already over")
      : pickLocalized(lang, "发现自己的主要仓位又开始讲一个全新的叙事", "discover that your main bag has adopted a brand-new narrative");
  const third =
    metrics.txPerDay > 1.5
      ? pickLocalized(lang, "开始研究自动交易系统，试图把手速交给机器", "start researching automation so your hand speed can be outsourced")
      : pickLocalized(lang, "开始研究事件雷达，想在下一次动手前多一个确认", "start using an event radar to get one more confirmation before clicking");
  return [first, second, third];
}

function buildStrategyFit(metrics, scores, lang) {
  if (metrics.txPerDay > 2 || scores.degen > 75) return pickLocalized(lang, "事件驱动 + 二次确认", "Event-driven trading + second confirmation");
  if (metrics.stableRatio > 0.62) return pickLocalized(lang, "低频波段 + 资金管理", "Low-frequency swing + capital management");
  if (scores.diamond > 72) return pickLocalized(lang, "趋势跟随 + 长线持仓", "Trend following + long holding windows");
  if (metrics.methodCounts.bridge || metrics.methodCounts.claim) return pickLocalized(lang, "空投交互路线 + 协议雷达", "Airdrop route + protocol radar");
  return pickLocalized(lang, "趋势跟随 + 轻量风控", "Trend following + lightweight risk controls");
}

function buildLabels(personalityId, metrics, scores, lang) {
  const labels = [personalityName(personalityId, lang)];
  if (scores.degen > 70) labels.push(pickLocalized(lang, "高风险冲锋队", "High-Risk Vanguard"));
  if (scores.airdrop > 55) labels.push(pickLocalized(lang, "空投游牧民", "Airdrop Nomad"));
  if (metrics.memeTokenCount >= 4) labels.push(pickLocalized(lang, "Meme 冲锋队", "Meme Frontline"));
  if (metrics.lowLiquidityTokenCount >= 4) labels.push(pickLocalized(lang, "土狗幸存者", "Microcap Survivor"));
  if (metrics.nftTransferCount > 4) labels.push(pickLocalized(lang, "NFT 时代遗民", "NFT Era Relic"));
  if (metrics.stableRatio > 0.6) labels.push(pickLocalized(lang, "稳定币躺平派", "Stablecoin Couch"));
  if (scores.diamond > 70) labels.push(pickLocalized(lang, "钻石手老登", "Ancient Diamond Hands"));
  if (metrics.methodCounts.swap > 4) labels.push(pickLocalized(lang, "合约压力怪", "Contract Stress Tester"));
  return [...new Set(labels)].slice(0, 5);
}

function buildReport(address, chains, lang = "zh") {
  const metrics = buildMetrics(address, chains);
  const scores = scoreWallet(metrics);
  const personalityId = choosePersonality(metrics, scores, address);
  const personality = personalityName(personalityId, lang);
  const lossCause = buildLossCause(metrics, scores, lang);
  const verdict = buildVerdict(personalityId, metrics, scores, lang);
  const labels = buildLabels(personalityId, metrics, scores, lang);

  const behavior =
    metrics.sampledHoldDays === null
      ? pickLocalized(lang, "样本里还看不出稳定持仓周期，更像刚开始在链上留下脚印。", "The sample does not reveal a stable holding period yet; this wallet is still leaving early footprints.")
      : pickLocalized(
          lang,
          `样本平均持仓约 ${metrics.sampledHoldDays.toFixed(1)} 天，${
            metrics.sampledHoldDays < 7
              ? "属于刚买就想换下一个叙事的类型。"
              : metrics.sampledHoldDays > 60
                ? "要么信仰很硬，要么真的忘记卖了。"
                : "能拿一阵，但看到新叙事还是会心动。"
          }`,
          `Average sampled holding period is about ${metrics.sampledHoldDays.toFixed(1)} days. ${
            metrics.sampledHoldDays < 7
              ? "This wallet starts looking for the next narrative almost immediately."
              : metrics.sampledHoldDays > 60
                ? "That is either conviction or a very committed forgotten bag."
                : "It can hold for a while, but new narratives still get its attention."
          }`
        );

  return {
    generatedAt: new Date().toISOString(),
    language: lang,
    address,
    shortAddress: shortAddress(address),
    siteUrl: SITE_URL,
    siteHost: SITE_HOST,
    productName: pickLocalized(lang, "链上照妖镜", "Degen DNA"),
    productSubtitle: pickLocalized(lang, "Degen DNA Report", "Onchain Mirror"),
    personalityId,
    personality,
    verdict,
    lossCause,
    labels,
    degenBand: degenBand(scores.degen, lang),
    scores,
    metrics: {
      ...metrics,
      portfolioUsdText: usd(metrics.portfolioUsd),
      stableUsdText: usd(metrics.stableUsd),
      memeUsdText: usd(metrics.memeUsd),
      sampleWindowDays: Number(metrics.sampleWindowDays.toFixed(1)),
      txPerDay: Number(metrics.txPerDay.toFixed(2)),
      sampledHoldDays: metrics.sampledHoldDays === null ? null : Number(metrics.sampledHoldDays.toFixed(1))
    },
    report: {
      assetPersonality:
        pickLocalized(
          lang,
          `这个钱包像${personality}。公开样本显示它跨 ${metrics.chainsWithActivity}/${metrics.chainCount} 条链活动，Token 样本 ${metrics.uniqueTokenCount} 个，稳定币占比约 ${Math.round(metrics.stableRatio * 100)}%，Meme 暴露约 ${Math.round(metrics.memeRatio * 100)}%。`,
          `This wallet reads like a ${personality}. Public samples show activity across ${metrics.chainsWithActivity}/${metrics.chainCount} chains, ${metrics.uniqueTokenCount} token samples, about ${Math.round(metrics.stableRatio * 100)}% stablecoin exposure, and roughly ${Math.round(metrics.memeRatio * 100)}% meme exposure.`
        ),
      holdingBehavior: behavior,
      lossBlackBox: pickLocalized(lang, `你的主要亏损来源不是市场，而是${lossCause}。`, `Your main leak is not the market; it is that ${lossCause}.`),
      alphaRadar: buildAlphaRadar(metrics, lang),
      fate90Days: buildFate(metrics, scores, lang),
      strategyFit: buildStrategyFit(metrics, scores, lang)
    },
    chains: chains.map((chain) => ({
      id: chain.id,
      name: chain.name,
      color: chain.color,
      ok: chain.ok,
      source: chain.source,
      nativeSymbol: chain.nativeSymbol,
      nativeBalance: Number((chain.nativeBalance || 0).toFixed ? chain.nativeBalance.toFixed(5) : chain.nativeBalance || 0),
      nativeUsd: chain.nativeUsd || 0,
      txCount: chain.txCount || 0,
      tokenTransferCount: chain.tokenTransferCount || 0,
      errors: chain.errors || (chain.error ? [chain.error] : [])
    })),
    warnings: chains
      .flatMap((chain) => chain.errors || (chain.error ? [chain.error] : []))
      .slice(0, 8)
  };
}

async function analyzeWallet(address, lang = "zh") {
  const normalized = normalizeAddress(address);
  const language = normalizeLang(lang);
  const key = `chains:${normalized.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return { ...buildReport(normalized, cached.chains, language), cache: "hit" };
  }

  const chainResults = await Promise.all([
    ...BLOCKSCOUT_CHAINS.map((chain) => fetchBlockscoutChain(chain, normalized)),
    fetchBnbChain(normalized)
  ]);
  cache.set(key, { createdAt: Date.now(), chains: chainResults });
  return { ...buildReport(normalized, chainResults, language), cache: "miss" };
}

function compareReports(a, b, lang = "zh") {
  const aBull = a.scores.degen * 0.55 + a.metrics.txPerDay * 8 + a.metrics.memeTokenCount * 2;
  const bBull = b.scores.degen * 0.55 + b.metrics.txPerDay * 8 + b.metrics.memeTokenCount * 2;
  const aBear = a.scores.diamond * 0.7 + a.metrics.stableRatio * 30 - a.metrics.failedRate * 20;
  const bBear = b.scores.diamond * 0.7 + b.metrics.stableRatio * 30 - b.metrics.failedRate * 20;

  return {
    bullWinner: aBull >= bBull ? "A" : "B",
    bearWinner: aBear >= bBear ? "A" : "B",
    verdict:
      aBull >= bBull
        ? pickLocalized(lang, "A 更像牛市里敢冲敢晒的人；B 更像会在旁边说“风险太高”的人。", "A looks more like the bull-market sprinter; B looks more like the person saying 'risk is high' from the side.")
        : pickLocalized(lang, "B 更像牛市里敢冲敢晒的人；A 更像会在旁边说“风险太高”的人。", "B looks more like the bull-market sprinter; A looks more like the person saying 'risk is high' from the side."),
    survival:
      aBear >= bBear
        ? pickLocalized(lang, "A 更像熊市里能活下来的人。", "A looks more likely to survive a bear market.")
        : pickLocalized(lang, "B 更像熊市里能活下来的人。", "B looks more likely to survive a bear market.")
  };
}

async function handleApi(req, res, pathname, searchParams) {
  if (pathname === "/api/health") {
    return json(res, 200, {
      ok: true,
      service: "onchain-mirror",
      chains: [...BLOCKSCOUT_CHAINS.map((chain) => chain.name), BNB_CHAIN.name]
    });
  }

  if (pathname === "/api/analyze") {
    const lang = normalizeLang(searchParams.get("lang"));
    const address = normalizeAddress(searchParams.get("address"));
    if (!isAddress(address)) {
      return json(res, 400, { error: pickLocalized(lang, "请输入有效的 EVM 钱包地址。", "Enter a valid EVM wallet address.") });
    }
    try {
      return json(res, 200, await analyzeWallet(address, lang));
    } catch (error) {
      return json(res, 502, { error: error.message || pickLocalized(lang, "链上数据读取失败。", "Failed to read onchain data.") });
    }
  }

  if (pathname === "/api/compare") {
    const lang = normalizeLang(searchParams.get("lang"));
    const addressA = normalizeAddress(searchParams.get("addressA"));
    const addressB = normalizeAddress(searchParams.get("addressB"));
    if (!isAddress(addressA) || !isAddress(addressB)) {
      return json(res, 400, { error: pickLocalized(lang, "请输入两个有效的 EVM 钱包地址。", "Enter two valid EVM wallet addresses.") });
    }
    try {
      const [a, b] = await Promise.all([analyzeWallet(addressA, lang), analyzeWallet(addressB, lang)]);
      return json(res, 200, {
        a,
        b,
        comparison: compareReports(a, b, lang)
      });
    } catch (error) {
      return json(res, 502, { error: error.message || pickLocalized(lang, "钱包 PK 数据读取失败。", "Wallet PK data fetch failed.") });
    }
  }

  return json(res, 404, { error: "Not found" });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

async function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const target = resolve(join(publicDir, safePath));
  if (!target.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(target);
    if (!fileStat.isFile()) throw new Error("not a file");
    const body = await readFile(target);
    const ext = extname(target);
    const cacheControl = target.endsWith("index.html") || ext === ".css" || ext === ".js"
      ? "no-store"
      : "public, max-age=3600";
    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": cacheControl
    });
    res.end(body);
  } catch {
    const body = await readFile(join(publicDir, "index.html"));
    res.writeHead(200, {
      "content-type": MIME[".html"],
      "cache-control": "no-store"
    });
    res.end(body);
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url.pathname, url.searchParams);
    return;
  }
  await serveStatic(req, res, url.pathname);
});

server.listen(port, host, () => {
  const shownHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`链上照妖镜 running at http://${shownHost}:${port}`);
});
