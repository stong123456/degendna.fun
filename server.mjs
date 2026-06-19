import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(__dirname, "public");
const port = Number(process.env.PORT || 8787);

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

const PERSONALITIES = {
  civilServant: "链上公务员",
  conservative: "保守型玩家",
  normal: "正常韭菜观察样本",
  memeSoldier: "Meme 冲锋队",
  topBuyer: "高位接盘艺术家",
  diamond: "钻石手老登",
  airdrop: "空投游牧民",
  nftGhost: "NFT 时代遗民",
  pressure: "合约压力怪",
  stable: "稳定币躺平派",
  collector: "只买不卖型收藏家"
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

function choosePersonality(metrics, scores) {
  if (metrics.failedRate > 0.18 || metrics.methodCounts.swap > 8) return PERSONALITIES.pressure;
  if (scores.airdrop > 68 && metrics.chainsWithActivity >= 4) return PERSONALITIES.airdrop;
  if (metrics.nftTransferCount > metrics.sampledTxs && metrics.nftTransferCount > 8) return PERSONALITIES.nftGhost;
  if (scores.diamond > 78 && metrics.txPerDay < 1.2) return PERSONALITIES.diamond;
  if (metrics.stableRatio > 0.68 && scores.degen < 45) return PERSONALITIES.stable;
  if (metrics.memeTokenCount >= 8 && scores.degen > 70) return PERSONALITIES.memeSoldier;
  if (metrics.memeRatio > 0.45 && metrics.lowLiquidityTokenCount > 4) return PERSONALITIES.topBuyer;
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 4 && metrics.uniqueTokenCount > 12) return PERSONALITIES.collector;
  if (scores.degen < 25) return PERSONALITIES.civilServant;
  if (scores.degen < 42) return PERSONALITIES.conservative;
  return PERSONALITIES.normal;
}

function degenBand(score) {
  if (score <= 20) return "链上公务员";
  if (score <= 40) return "保守型玩家";
  if (score <= 60) return "正常韭菜";
  if (score <= 80) return "高风险冲锋队";
  return "钱包生命垂危，但精神状态良好";
}

function buildLossCause(metrics, scores) {
  if (metrics.memeTokenCount >= 8) return "看到别人赚钱后手速过快";
  if (metrics.lowLiquidityTokenCount >= 6) return "喜欢冲流动性不太够的小币";
  if (metrics.txPerDay > 2.5) return "交易频率太高，手续费和情绪一起收割你";
  if (metrics.failedRate > 0.12) return "合约交互太急，失败交易都在替你喊停";
  if (metrics.stableRatio > 0.72 && scores.degen < 45) return "不是亏损，是把牛市活成了观察席";
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 5) return "只会进货，不太会体面下车";
  return "不是市场太坏，是你太容易相信下一根阳线";
}

function buildVerdict(personality, metrics, scores) {
  const verdicts = {
    [PERSONALITIES.memeSoldier]: "你这个钱包不像资产组合，更像热点雷达的急诊室。",
    [PERSONALITIES.topBuyer]: "你不是没有判断力，你只是太容易相信下一根阳线。",
    [PERSONALITIES.airdrop]: "你像是在链上迁徙，哪里有任务，哪里就有你的 gas 费。",
    [PERSONALITIES.diamond]: "你有几个币拿了很久，可能是信仰，也可能是忘记卖了。",
    [PERSONALITIES.pressure]: "你这个钱包看起来很冷静，实际下手的时候比群里喊单的人还急。",
    [PERSONALITIES.stable]: "你把波动留给别人，把安全感留给自己，顺便错过一点刺激。",
    [PERSONALITIES.nftGhost]: "你的链上足迹还停在 JPEG 很贵、群里很吵的那个年代。",
    [PERSONALITIES.collector]: "你不是交易员，你像一个什么都舍不得扔的链上收藏夹。",
    [PERSONALITIES.civilServant]: "你的钱包纪律性很强，强到牛市路过都怕打扰你。",
    [PERSONALITIES.conservative]: "你不是不敢冲，你只是每次冲之前先把自己劝退了。",
    [PERSONALITIES.normal]: "你很像一个标准币圈玩家：懂一点，冲一点，嘴硬很多点。"
  };

  if (metrics.portfolioUsd > 100_000 && scores.degen > 70) {
    return "你不是风险偏好高，你是带着金库在夜市里试吃。";
  }
  return verdicts[personality] || verdicts[PERSONALITIES.normal];
}

function buildAlphaRadar(metrics) {
  const signals = [];
  if (metrics.bluechipTokenCount >= 2) signals.push("钱包里有主流资产留存，不是纯靠情绪开车。");
  if (metrics.chainsWithActivity >= 4) signals.push("跨链探索能力不错，至少不是单链游客。");
  if (metrics.methodCounts.claim || metrics.methodCounts.bridge) signals.push("有空投/跨链交互习惯，属于会翻任务列表的人。");
  if (metrics.stableUsd > 100) signals.push("稳定币仓位给你留了后手，说明还没完全上头。");
  if (metrics.sampledHoldDays && metrics.sampledHoldDays > 30) signals.push("样本里有长期留存资产，多少有点拿得住。");
  if (metrics.nftTransferCount > 3) signals.push("NFT 痕迹明显，社区活动和链上身份感都不弱。");
  if (!signals.length) signals.push("这个钱包行为还比较轻，至少暂时没有把自己写成反面教材。");
  return signals.slice(0, 4);
}

function buildFate(metrics, scores) {
  const first =
    scores.degen > 70
      ? "错过一个观察很久的币，然后在别人翻倍后重新冲进去"
      : "继续观察几个热点，最后只在群里打出“我早看好了”";
  const second =
    metrics.stableRatio > 0.6
      ? "在稳定币里等回调，等到回调结束"
      : "发现自己的主要仓位又开始讲一个全新的叙事";
  const third =
    metrics.txPerDay > 1.5
      ? "开始研究自动交易系统，试图把手速交给机器"
      : "开始研究事件雷达，想在下一次动手前多一个确认";
  return [first, second, third];
}

function buildStrategyFit(metrics, scores) {
  if (metrics.txPerDay > 2 || scores.degen > 75) return "事件驱动 + 二次确认";
  if (metrics.stableRatio > 0.62) return "低频波段 + 资金管理";
  if (scores.diamond > 72) return "趋势跟随 + 长线持仓";
  if (metrics.methodCounts.bridge || metrics.methodCounts.claim) return "空投交互路线 + 协议雷达";
  return "趋势跟随 + 轻量风控";
}

function buildLabels(personality, metrics, scores) {
  const labels = [personality];
  if (scores.degen > 70) labels.push("高风险冲锋队");
  if (scores.airdrop > 55) labels.push("空投游牧民");
  if (metrics.memeTokenCount >= 4) labels.push("Meme 冲锋队");
  if (metrics.lowLiquidityTokenCount >= 4) labels.push("土狗幸存者");
  if (metrics.nftTransferCount > 4) labels.push("NFT 时代遗民");
  if (metrics.stableRatio > 0.6) labels.push("稳定币躺平派");
  if (scores.diamond > 70) labels.push("钻石手老登");
  if (metrics.methodCounts.swap > 4) labels.push("合约压力怪");
  return [...new Set(labels)].slice(0, 5);
}

function buildReport(address, chains) {
  const metrics = buildMetrics(address, chains);
  const scores = scoreWallet(metrics);
  const personality = choosePersonality(metrics, scores);
  const lossCause = buildLossCause(metrics, scores);
  const verdict = buildVerdict(personality, metrics, scores);
  const labels = buildLabels(personality, metrics, scores);

  const behavior =
    metrics.sampledHoldDays === null
      ? "样本里还看不出稳定持仓周期，更像刚开始在链上留下脚印。"
      : `样本平均持仓约 ${metrics.sampledHoldDays.toFixed(1)} 天，${
          metrics.sampledHoldDays < 7
            ? "属于刚买就想换下一个叙事的类型。"
            : metrics.sampledHoldDays > 60
              ? "要么信仰很硬，要么真的忘记卖了。"
              : "能拿一阵，但看到新叙事还是会心动。"
        }`;

  return {
    generatedAt: new Date().toISOString(),
    address,
    shortAddress: shortAddress(address),
    siteUrl: SITE_URL,
    siteHost: SITE_HOST,
    personality,
    verdict,
    lossCause,
    labels,
    degenBand: degenBand(scores.degen),
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
        `这个钱包像${personality}。` +
        `公开样本显示它跨 ${metrics.chainsWithActivity}/${metrics.chainCount} 条链活动，` +
        `Token 样本 ${metrics.uniqueTokenCount} 个，稳定币占比约 ${Math.round(metrics.stableRatio * 100)}%，` +
        `Meme 暴露约 ${Math.round(metrics.memeRatio * 100)}%。`,
      holdingBehavior: behavior,
      lossBlackBox: `你的主要亏损来源不是市场，而是${lossCause}。`,
      alphaRadar: buildAlphaRadar(metrics),
      fate90Days: buildFate(metrics, scores),
      strategyFit: buildStrategyFit(metrics, scores)
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

async function analyzeWallet(address) {
  const normalized = normalizeAddress(address);
  const key = normalized.toLowerCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return { ...cached.report, cache: "hit" };
  }

  const chainResults = await Promise.all([
    ...BLOCKSCOUT_CHAINS.map((chain) => fetchBlockscoutChain(chain, normalized)),
    fetchBnbChain(normalized)
  ]);
  const report = buildReport(normalized, chainResults);
  cache.set(key, { createdAt: Date.now(), report });
  return { ...report, cache: "miss" };
}

function compareReports(a, b) {
  const aBull = a.scores.degen * 0.55 + a.metrics.txPerDay * 8 + a.metrics.memeTokenCount * 2;
  const bBull = b.scores.degen * 0.55 + b.metrics.txPerDay * 8 + b.metrics.memeTokenCount * 2;
  const aBear = a.scores.diamond * 0.7 + a.metrics.stableRatio * 30 - a.metrics.failedRate * 20;
  const bBear = b.scores.diamond * 0.7 + b.metrics.stableRatio * 30 - b.metrics.failedRate * 20;

  return {
    bullWinner: aBull >= bBull ? "A" : "B",
    bearWinner: aBear >= bBear ? "A" : "B",
    verdict:
      aBull >= bBull
        ? "A 更像牛市里敢冲敢晒的人；B 更像会在旁边说“风险太高”的人。"
        : "B 更像牛市里敢冲敢晒的人；A 更像会在旁边说“风险太高”的人。",
    survival:
      aBear >= bBear
        ? "A 更像熊市里能活下来的人。"
        : "B 更像熊市里能活下来的人。"
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
    const address = normalizeAddress(searchParams.get("address"));
    if (!isAddress(address)) {
      return json(res, 400, { error: "请输入有效的 EVM 钱包地址。" });
    }
    try {
      return json(res, 200, await analyzeWallet(address));
    } catch (error) {
      return json(res, 502, { error: error.message || "链上数据读取失败。" });
    }
  }

  if (pathname === "/api/compare") {
    const addressA = normalizeAddress(searchParams.get("addressA"));
    const addressB = normalizeAddress(searchParams.get("addressB"));
    if (!isAddress(addressA) || !isAddress(addressB)) {
      return json(res, 400, { error: "请输入两个有效的 EVM 钱包地址。" });
    }
    try {
      const [a, b] = await Promise.all([analyzeWallet(addressA), analyzeWallet(addressB)]);
      return json(res, 200, {
        a,
        b,
        comparison: compareReports(a, b)
      });
    } catch (error) {
      return json(res, 502, { error: error.message || "钱包 PK 数据读取失败。" });
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
    res.writeHead(200, {
      "content-type": MIME[extname(target)] || "application/octet-stream",
      "cache-control": target.endsWith("index.html") ? "no-store" : "public, max-age=3600"
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

server.listen(port, "127.0.0.1", () => {
  console.log(`链上照妖镜 running at http://127.0.0.1:${port}`);
});
