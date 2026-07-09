import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(__dirname, "public");
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

const SITE_URL = process.env.PUBLIC_SITE_URL || "https://degendna.fun";
const SITE_HOST = process.env.PUBLIC_SITE_HOST || "degendna.fun";
const LEADERBOARD_PATH = process.env.LEADERBOARD_PATH || join(tmpdir(), "degendna-leaderboard.json");
const LEADERBOARD_LIMIT = 100;
const LEADERBOARD_READ_LIMIT = 1000;
const SUPABASE_URL = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_LEADERBOARD_TABLE = process.env.SUPABASE_LEADERBOARD_TABLE || "onchain_leaderboard";
const SUPABASE_NFT_CLAIMS_TABLE = process.env.SUPABASE_NFT_CLAIMS_TABLE || "nft_claims";
const SUPABASE_TIMEOUT_MS = 3500;
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN || process.env.X_API_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN || "";
const X_PROFILE_TIMEOUT_MS = 3500;
const NFT_CLAIM_ENABLED = String(process.env.NFT_CLAIM_ENABLED || "false").toLowerCase() === "true";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const SEPOLIA_MINTER_PRIVATE_KEY = process.env.SEPOLIA_MINTER_PRIVATE_KEY || "";
const SEPOLIA_NFT_CONTRACT_ADDRESS = process.env.SEPOLIA_NFT_CONTRACT_ADDRESS || "";

const REPORT_VERSION = "20260710-release-v117";
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const ANALYZE_CACHE_TTL_MS = 6 * HOUR_MS;
const SAMPLE_CACHE_TTL_MS = 24 * HOUR_MS;
const CHAIN_CACHE_TTL_MS = 6 * HOUR_MS;
const X_PROFILE_CACHE_TTL_MS = 24 * HOUR_MS;
const MAX_CACHE_ENTRIES = 500;
const CACHE_PRUNE_INTERVAL_MS = 5 * MINUTE_MS;
const ONCHAIN_FETCH_TIMEOUT_MS = 8000;
const RATE_LIMIT_MESSAGE_ZH = "链上照妖镜现在排队中，稍后再照一次。";
const RATE_LIMIT_MESSAGE_EN = "Degen DNA is queuing right now. Try another scan shortly.";
const SAMPLE_ADDRESSES = new Set([
  "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  "0x28c6c06298d514db089934071355e5743bf21d60",
  "0x020ca66c30bec2c4fe3861a94e4db4a498a35872",
  "0x742d35cc6634c0532925a3b844bc454e4438f44e",
  "0xf977814e90da44bfa03b6295a0616a897441acec",
  "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67"
]);

const NFT_CONTRACT_ABI = [
  "function mintMedicalRecord(address to,string tokenUri,bytes32 reportHash,uint8 rarityTier) external returns (uint256)",
  "event MedicalRecordMinted(address indexed to,uint256 indexed tokenId,bytes32 indexed reportHash,uint8 rarityTier,string tokenUri)"
];

const reportCache = new Map();
const chainCache = new Map();
const xProfileCache = new Map();
const analyzeInflight = new Map();
const addressInflight = new Map();
const rateBuckets = new Map();
let lastCachePrune = 0;

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
      zh: "你的判断力偶尔在线，但下一根阳线总能让它下线。",
      en: "Your judgment occasionally comes online, but the next green candle always logs it out."
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

const EXTRA_PERSONALITIES = {
  leverageSleepwalker: "leverageSleepwalker",
  stopLossMissingPerson: "stopLossMissingPerson",
  greenCandleAllergy: "greenCandleAllergy",
  redCandleAmnesia: "redCandleAmnesia",
  narrativeHostage: "narrativeHostage",
  liquidityExitVolunteer: "liquidityExitVolunteer",
  fomoCardiacPatient: "fomoCardiacPatient",
  thesisAfterBuy: "thesisAfterBuy",
  mouseFingerAthlete: "mouseFingerAthlete",
  chartPossessed: "chartPossessed",
  gasFeePhilanthropist: "gasFeePhilanthropist",
  mevSnack: "mevSnack",
  walletAutopsyIntern: "walletAutopsyIntern",
  bullMarketHallucination: "bullMarketHallucination",
  bearMarketPretendDead: "bearMarketPretendDead",
  liquidityPoolLifeguard: "liquidityPoolLifeguard",
  airdropReceiptCollector: "airdropReceiptCollector",
  bridgeStampCollector: "bridgeStampCollector",
  protocolDoorKnocker: "protocolDoorKnocker",
  nftMemoryPalace: "nftMemoryPalace",
  jpgBagHistorian: "jpgBagHistorian",
  stablecoinZenGarden: "stablecoinZenGarden",
  usdtParkingLotGuard: "usdtParkingLotGuard",
  dustPositionBuddha: "dustPositionBuddha",
  approvalArchaeologist: "approvalArchaeologist",
  walletPersonalityCrisis: "walletPersonalityCrisis",
  smartMoneyCosplayer: "smartMoneyCosplayer",
  kolShadowTrader: "kolShadowTrader",
  reverseIndicatorOracle: "reverseIndicatorOracle",
  exitButtonPhilosopher: "exitButtonPhilosopher",
  dipBuyerOnRooftop: "dipBuyerOnRooftop",
  candleWorshipper: "candleWorshipper",
  portfolioJengaPlayer: "portfolioJengaPlayer",
  pnlFogMachine: "pnlFogMachine",
  lateCycleRomantic: "lateCycleRomantic",
  degenMedicalRecord: "degenMedicalRecord",
  chainPsychWardVIP: "chainPsychWardVIP",
  contractExorcist: "contractExorcist",
  treasuryNightMarket: "treasuryNightMarket",
  multiChainVagrant: "multiChainVagrant",
  liquidityBlackHole: "liquidityBlackHole",
  notificationAddict: "notificationAddict"
};

Object.assign(PERSONALITY_TEXT, {
  [EXTRA_PERSONALITIES.leverageSleepwalker]: {
    zh: "合约梦游症患者",
    en: "Leverage Sleepwalker",
    verdict: {
      zh: "你的钱包像半夜起来开仓，醒来只剩一张风险复盘。",
      en: "This wallet trades like it opens positions while sleepwalking and wakes up to a risk review."
    }
  },
  [EXTRA_PERSONALITIES.stopLossMissingPerson]: {
    zh: "止损功能失踪人口",
    en: "Stop-Loss Missing Person",
    verdict: {
      zh: "你的止损按钮疑似离家出走，留下仓位独自面对世界。",
      en: "Your stop-loss button appears to have left home, leaving the position to face the world alone."
    }
  },
  [EXTRA_PERSONALITIES.greenCandleAllergy]: {
    zh: "阳线过敏体质",
    en: "Green Candle Allergy",
    verdict: {
      zh: "别人看到阳线是行情，你看到阳线是命运在私信你。",
      en: "Others see a green candle as price action. You see destiny sliding into your DMs."
    }
  },
  [EXTRA_PERSONALITIES.redCandleAmnesia]: {
    zh: "阴线失忆症",
    en: "Red Candle Amnesia",
    verdict: {
      zh: "每次下跌你都短暂失忆，然后把补仓叫做信仰升级。",
      en: "Every dip triggers memory loss, then you rename averaging down as upgraded conviction."
    }
  },
  [EXTRA_PERSONALITIES.narrativeHostage]: {
    zh: "叙事绑架受害者",
    en: "Narrative Hostage",
    verdict: {
      zh: "你不是在研究赛道，你是被每个新名词轮流扣押。",
      en: "You are not researching sectors. You are being held hostage by rotating buzzwords."
    }
  },
  [EXTRA_PERSONALITIES.liquidityExitVolunteer]: {
    zh: "退出流动性志愿者",
    en: "Exit Liquidity Volunteer",
    verdict: {
      zh: "你总在别人需要流动性的时候出现，币圈应该给你发锦旗。",
      en: "You appear whenever others need liquidity. Crypto should issue you a certificate."
    }
  },
  [EXTRA_PERSONALITIES.fomoCardiacPatient]: {
    zh: "FOMO 心内科常客",
    en: "FOMO Cardiology Patient",
    verdict: {
      zh: "群里一喊翻倍，你的心率和 gas price 一起上链。",
      en: "When chat says 2x, your heart rate and gas price go onchain together."
    }
  },
  [EXTRA_PERSONALITIES.thesisAfterBuy]: {
    zh: "买后补论文型选手",
    en: "Thesis-After-Buy Trader",
    verdict: {
      zh: "你不是没有研究，你只是喜欢先买票再写出行攻略。",
      en: "You do research. You just prefer buying the ticket before writing the travel plan."
    }
  },
  [EXTRA_PERSONALITIES.mouseFingerAthlete]: {
    zh: "鼠标左键运动员",
    en: "Left-Click Athlete",
    verdict: {
      zh: "你的核心竞争力不是判断，是手指比脑子先完成热身。",
      en: "Your edge is not judgment. It is finger speed arriving before the brain finishes booting."
    }
  },
  [EXTRA_PERSONALITIES.chartPossessed]: {
    zh: "K 线附体型人格",
    en: "Chart-Possessed Personality",
    verdict: {
      zh: "K 线没有杀死你，但你的解读方式差点把钱包送走。",
      en: "The candle did not kill you. Your interpretation almost escorted the wallet out."
    }
  },
  [EXTRA_PERSONALITIES.gasFeePhilanthropist]: {
    zh: "Gas 费慈善家",
    en: "Gas Fee Philanthropist",
    verdict: {
      zh: "你对节点生态的贡献，主要体现在手续费慈善。",
      en: "Your contribution to network infrastructure is best described as fee philanthropy."
    }
  },
  [EXTRA_PERSONALITIES.mevSnack]: {
    zh: "MEV 零食包",
    en: "MEV Snack Pack",
    verdict: {
      zh: "你的交易路径看起来很努力，但在链上像被路过顺手咬了一口。",
      en: "Your route looks hardworking, but onchain it resembles a snack left unattended."
    }
  },
  [EXTRA_PERSONALITIES.walletAutopsyIntern]: {
    zh: "钱包尸检实习生",
    en: "Wallet Autopsy Intern",
    verdict: {
      zh: "这不是复盘，这是在给自己的仓位做链上尸检。",
      en: "This is not a review. It is an onchain autopsy of your own positions."
    }
  },
  [EXTRA_PERSONALITIES.bullMarketHallucination]: {
    zh: "牛市幻觉型选手",
    en: "Bull Market Hallucinator",
    verdict: {
      zh: "你看到的不是趋势，是大脑给钱包播放的励志片。",
      en: "What you see is not a trend. It is motivational cinema projected onto your wallet."
    }
  },
  [EXTRA_PERSONALITIES.bearMarketPretendDead]: {
    zh: "熊市装死型选手",
    en: "Bear Market Possum Mode",
    verdict: {
      zh: "你不卖不是因为坚定，是钱包已经进入低功耗求生模式。",
      en: "You are not holding from conviction. The wallet has entered low-power survival mode."
    }
  },
  [EXTRA_PERSONALITIES.liquidityPoolLifeguard]: {
    zh: "流动性池救生员",
    en: "Liquidity Pool Lifeguard",
    verdict: {
      zh: "你看见池子就想下水，至于会不会游泳，链上另说。",
      en: "You see a pool and jump in. Whether you can swim is a separate onchain question."
    }
  },
  [EXTRA_PERSONALITIES.airdropReceiptCollector]: {
    zh: "空投小票收集癖",
    en: "Airdrop Receipt Collector",
    verdict: {
      zh: "你的交互像便利店小票，单张不值钱，但你坚信会有兑奖日。",
      en: "Your interactions look like receipts: tiny alone, sacred if a reward day appears."
    }
  },
  [EXTRA_PERSONALITIES.bridgeStampCollector]: {
    zh: "跨链邮戳收藏家",
    en: "Bridge Stamp Collector",
    verdict: {
      zh: "你不是跨链，你是在给每条链盖到此一游的章。",
      en: "You are not bridging. You are stamping 'I was here' across chains."
    }
  },
  [EXTRA_PERSONALITIES.protocolDoorKnocker]: {
    zh: "协议敲门办事员",
    en: "Protocol Door Knocker",
    verdict: {
      zh: "每个新协议你都去敲一下门，像怕空投名单把你漏在门外。",
      en: "You knock on every new protocol like the airdrop list might forget your address."
    }
  },
  [EXTRA_PERSONALITIES.nftMemoryPalace]: {
    zh: "NFT 记忆宫殿管理员",
    en: "NFT Memory Palace Keeper",
    verdict: {
      zh: "你的 NFT 不是资产，是上一轮社交幻觉的标本。",
      en: "Your NFTs are not assets. They are preserved specimens of last cycle's social hallucination."
    }
  },
  [EXTRA_PERSONALITIES.jpgBagHistorian]: {
    zh: "JPEG 套牢史学家",
    en: "JPEG Bag Historian",
    verdict: {
      zh: "你的钱包保存的不是图片，是每个地板价下沉的历史切片。",
      en: "Your wallet stores not images, but historical slices of every floor-price collapse."
    }
  },
  [EXTRA_PERSONALITIES.stablecoinZenGarden]: {
    zh: "稳定币禅院住持",
    en: "Stablecoin Zen Garden",
    verdict: {
      zh: "你的波动率被修剪得很整齐，像一座不敢开仓的禅院。",
      en: "Your volatility is neatly trimmed, like a Zen garden afraid to open a position."
    }
  },
  [EXTRA_PERSONALITIES.usdtParkingLotGuard]: {
    zh: "USDT 停车场保安",
    en: "USDT Parking Lot Guard",
    verdict: {
      zh: "你的资金不是空仓，是在停车场等一个永远不来的完美买点。",
      en: "Your capital is not sidelined. It is guarding a parking lot for the perfect entry."
    }
  },
  [EXTRA_PERSONALITIES.dustPositionBuddha]: {
    zh: "灰尘仓位菩萨",
    en: "Dust Position Buddha",
    verdict: {
      zh: "每个小仓位都被你普度众生，哪怕它只剩浏览器收藏夹级别的意义。",
      en: "Every tiny position receives compassion, even when its only value is sentimental."
    }
  },
  [EXTRA_PERSONALITIES.approvalArchaeologist]: {
    zh: "授权记录考古队",
    en: "Approval Archaeologist",
    verdict: {
      zh: "你的授权历史像地下遗址，随便一铲都有古早协议露头。",
      en: "Your approval history is an excavation site; every shovel reveals an ancient protocol."
    }
  },
  [EXTRA_PERSONALITIES.walletPersonalityCrisis]: {
    zh: "钱包人格分裂现场",
    en: "Wallet Identity Crisis",
    verdict: {
      zh: "这个钱包同时想当聪明钱、空投党和土狗选手，精神状态很链上。",
      en: "This wallet wants to be smart money, an airdrop hunter, and a meme sprinter at once."
    }
  },
  [EXTRA_PERSONALITIES.smartMoneyCosplayer]: {
    zh: "聪明钱 Cosplay",
    en: "Smart Money Cosplayer",
    verdict: {
      zh: "你模仿聪明钱的姿势很像，问题是出场时机比较像观众。",
      en: "The smart-money pose is convincing. The timing still resembles the audience."
    }
  },
  [EXTRA_PERSONALITIES.kolShadowTrader]: {
    zh: "KOL 影子跟单员",
    en: "KOL Shadow Trader",
    verdict: {
      zh: "你不是跟趋势，你是在跟某个头像的情绪周期。",
      en: "You are not following trends. You are following the mood cycle of someone else's avatar."
    }
  },
  [EXTRA_PERSONALITIES.reverseIndicatorOracle]: {
    zh: "反向指标预言机",
    en: "Contra-Signal Oracle",
    verdict: {
      zh: "你的钱包不是亏，它是在给市场提供反向参考数据。",
      en: "Your wallet is not losing; it is donating contra-signal data to the market."
    }
  },
  [EXTRA_PERSONALITIES.exitButtonPhilosopher]: {
    zh: "退出按钮哲学家",
    en: "Exit Button Philosopher",
    verdict: {
      zh: "你经常思考退出，但思考本身已经占用了退出窗口。",
      en: "You think deeply about exits. The thinking usually consumes the exit window."
    }
  },
  [EXTRA_PERSONALITIES.dipBuyerOnRooftop]: {
    zh: "抄底天台观察员",
    en: "Dip Buyer on the Roof",
    verdict: {
      zh: "你每次说抄底，都像站在楼顶研究风向。",
      en: "Every 'buy the dip' from this wallet feels like checking wind direction on a roof."
    }
  },
  [EXTRA_PERSONALITIES.candleWorshipper]: {
    zh: "K 线祭司",
    en: "Candle Worshipper",
    verdict: {
      zh: "你对图表的尊重已经接近宗教活动，缺点是神谕经常延迟。",
      en: "Your respect for charts borders on religion. The oracle just happens to lag."
    }
  },
  [EXTRA_PERSONALITIES.portfolioJengaPlayer]: {
    zh: "仓位叠叠乐玩家",
    en: "Portfolio Jenga Player",
    verdict: {
      zh: "你的资产组合像叠叠乐，抽错一块就开始全场安静。",
      en: "Your portfolio is Jenga: one wrong block and the room goes quiet."
    }
  },
  [EXTRA_PERSONALITIES.pnlFogMachine]: {
    zh: "盈亏迷雾制造机",
    en: "PnL Fog Machine",
    verdict: {
      zh: "你的盈亏不是曲线，是舞台烟雾，适合遮住真实情绪。",
      en: "Your PnL is less a curve and more stage fog for hiding emotions."
    }
  },
  [EXTRA_PERSONALITIES.lateCycleRomantic]: {
    zh: "周期末浪漫主义者",
    en: "Late-Cycle Romantic",
    verdict: {
      zh: "你总在故事最热闹的时候相信爱情，市场负责分手。",
      en: "You believe in love near the end of every cycle. The market handles the breakup."
    }
  },
  [EXTRA_PERSONALITIES.degenMedicalRecord]: {
    zh: "链上精神病历本人",
    en: "Degen Medical Record",
    verdict: {
      zh: "这份报告不是财务分析，更像你的链上精神病历被打印出来。",
      en: "This is not financial analysis. It is your onchain psychiatric file printed in public."
    }
  },
  [EXTRA_PERSONALITIES.chainPsychWardVIP]: {
    zh: "链上精神病院 VIP",
    en: "Onchain Psych Ward VIP",
    verdict: {
      zh: "你不是高风险偏好，你是把钱包挂号到了链上精神科。",
      en: "This is not high risk appetite. This wallet has checked into onchain psychiatry."
    }
  },
  [EXTRA_PERSONALITIES.contractExorcist]: {
    zh: "合约驱魔师",
    en: "Contract Exorcist",
    verdict: {
      zh: "你和智能合约的关系像驱魔现场，每次确认都带点仪式感。",
      en: "Your relationship with smart contracts feels like an exorcism with a confirm button."
    }
  },
  [EXTRA_PERSONALITIES.treasuryNightMarket]: {
    zh: "金库夜市试吃员",
    en: "Treasury Night-Market Sampler",
    verdict: {
      zh: "你不是风险偏好高，你是带着金库在夜市里试吃。",
      en: "You are not risk-on; you are sampling street food with a treasury wallet."
    }
  },
  [EXTRA_PERSONALITIES.multiChainVagrant]: {
    zh: "多链流浪汉",
    en: "Multi-Chain Vagrant",
    verdict: {
      zh: "你的钱包没有主场，只有一串到处留下的链上脚印。",
      en: "This wallet has no home chain, only footprints scattered across networks."
    }
  },
  [EXTRA_PERSONALITIES.liquidityBlackHole]: {
    zh: "流动性黑洞体质",
    en: "Liquidity Black Hole",
    verdict: {
      zh: "资金一靠近你选的池子，就开始思考存在主义。",
      en: "Capital approaches your chosen pools and immediately questions existence."
    }
  },
  [EXTRA_PERSONALITIES.notificationAddict]: {
    zh: "行情提醒成瘾者",
    en: "Notification Addict",
    verdict: {
      zh: "你不是在盯盘，你是在等手机给钱包判刑。",
      en: "You are not watching the market. You are waiting for your phone to sentence the wallet."
    }
  }
});

function expandedPersonality(id, zh, en, zhVerdict, enVerdict) {
  return { id: `expanded:${id}`, zh, en, verdict: { zh: zhVerdict, en: enVerdict } };
}

const PERSONALITY_POOL_EXPANSIONS = {
  whale: [
    expandedPersonality("whale-risk-opera", "金库风险歌剧演员", "Treasury Risk Opera Singer", "你的资产规模有舞台感，但每次点击都像在唱高音。", "Your balance has stage presence, but every click sounds like a high note."),
    expandedPersonality("vault-market-taster", "金库夜宵试吃员", "Vault Midnight Sampler", "你不是在配置资产，你是在拿金库点夜宵。", "You are not allocating capital. You are ordering midnight snacks with a vault."),
    expandedPersonality("liquidity-banquet-host", "流动性宴会主人", "Liquidity Banquet Host", "别人是进场，你像是在给市场摆席。", "Others enter the market; you look like you are hosting a banquet for liquidity."),
    expandedPersonality("treasury-impulse-curator", "金库冲动策展人", "Treasury Impulse Curator", "你的仓位很体面，冲动也被摆进了展柜。", "The positions look respectable; the impulses are curated beside them."),
    expandedPersonality("large-balance-small-button", "大余额小按钮受害者", "Large Balance, Tiny Button Victim", "余额越大，确认按钮看起来越像命运开关。", "The bigger the balance, the more the confirm button looks like a fate switch.")
  ],
  failed: [
    expandedPersonality("revert-collector", "Revert 收藏家", "Revert Collector", "你的失败交易不是错误，是链上拒签纪念册。", "Your failed transactions are not errors; they are an onchain rejection album."),
    expandedPersonality("gas-ash-accountant", "Gas 灰烬会计", "Gas Ash Accountant", "每一笔失败都留下手续费灰烬，你负责记账。", "Every failed click leaves fee ashes, and you keep the books."),
    expandedPersonality("popup-boxer", "钱包弹窗拳击手", "Wallet Popup Boxer", "你和确认弹窗打了很多回合，胜负主要体现在手续费里。", "You fought many rounds with wallet popups; the score is mostly in fees."),
    expandedPersonality("simulation-skipper", "模拟交易跳读者", "Simulation Skipper", "你对模拟提示的态度，像考试直接翻到最后一页。", "You treat simulation warnings like skipping straight to the last page of an exam."),
    expandedPersonality("failed-tx-calligrapher", "失败交易书法家", "Failed Transaction Calligrapher", "你的失败记录很有笔锋，链上看起来像一行行草书。", "Your failed history has brushwork; onchain it looks like frantic calligraphy.")
  ],
  swapHeavy: [
    expandedPersonality("button-combo-scholar", "合约连招学者", "Contract Combo Scholar", "你不是在 swap，你是在研究确认按钮的连招帧数。", "You are not swapping; you are studying the frame data of confirm-button combos."),
    expandedPersonality("router-maze-runner", "路由迷宫跑者", "Router Maze Runner", "你的交易路径像迷宫，出口通常写着滑点。", "Your routes look like a maze; the exit sign usually says slippage."),
    expandedPersonality("approval-speedrunner", "授权速通玩家", "Approval Speedrunner", "别人慢慢授权，你像在给协议打速通纪录。", "Others approve slowly; you try to speedrun protocol permissions."),
    expandedPersonality("nonce-drummer", "Nonce 鼓手", "Nonce Drummer", "你的交易节奏很密，钱包像在给区块打鼓。", "Your transaction rhythm is dense; the wallet drums for the block."),
    expandedPersonality("contract-keyboard-warrior", "合约键盘武术家", "Contract Keyboard Martial Artist", "你和智能合约的关系，主要靠手速维持和平。", "Your relationship with smart contracts is held together by hand speed.")
  ],
  swapDegen: [
    expandedPersonality("heat-map-patient", "热点热成像患者", "Heat-Map Patient", "哪里发热你就往哪里贴，钱包像自带热成像。", "Wherever the market heats up, your wallet presses its face against it."),
    expandedPersonality("green-candle-siren", "阳线警报接线员", "Green Candle Alarm Operator", "一根阳线响起，你的风控系统就开始转人工。", "One green candle rings, and your risk control transfers to manual support."),
    expandedPersonality("narrative-oxygen-mask", "叙事氧气面罩佩戴者", "Narrative Oxygen Mask Wearer", "叙事一浓，你就像必须吸两口才能下单。", "When narrative thickens, you need two breaths before clicking buy."),
    expandedPersonality("fomo-accelerator", "FOMO 油门焊死型", "FOMO Pedal Welded Down", "你不是反应快，是油门疑似被焊住。", "You are not reacting fast; the accelerator appears welded down."),
    expandedPersonality("screenshot-triggered-trader", "截图触发型交易员", "Screenshot-Triggered Trader", "别人晒收益，你的钱包开始自动热身。", "Someone posts gains and your wallet starts warming up.")
  ],
  defi: [
    expandedPersonality("apy-hypnosis-subject", "APY 催眠受试者", "APY Hypnosis Subject", "收益率一亮，你的怀疑精神就开始打瞌睡。", "Once the APY glows, your skepticism starts napping."),
    expandedPersonality("pool-basement-tenant", "流动性地下室租客", "Liquidity Basement Tenant", "你住进池子的时候很丝滑，退租时开始研究人生。", "Moving into pools feels smooth; moving out triggers life research."),
    expandedPersonality("yield-ritual-priest", "收益率仪式主持", "Yield Ritual Host", "你不是质押，你是在给 APR 举办小型仪式。", "You are not staking; you are hosting a small ritual for APR."),
    expandedPersonality("lp-receipt-hoarder", "LP 小票囤积者", "LP Receipt Hoarder", "你的仓位不一定赚钱，但收据非常完整。", "The position may not win, but the receipt collection is immaculate."),
    expandedPersonality("farm-afterglow-resident", "农场余晖居民", "Farm Afterglow Resident", "DeFi 夏天已经退场，你还在余温里找入口。", "DeFi summer left, and you are still looking for doors in the afterglow.")
  ],
  airdrop: [
    expandedPersonality("quest-airport-resident", "任务机场常住民", "Quest Airport Resident", "你的钱包像住在任务机场，随时准备登上下一条链。", "Your wallet lives in a quest airport, ready to board the next chain."),
    expandedPersonality("interaction-rice-cooker", "交互电饭煲", "Interaction Rice Cooker", "你把任务一锅一锅焖好，等空投开饭。", "You cook interactions batch by batch, waiting for the airdrop meal."),
    expandedPersonality("gas-ticket-collector", "Gas 车票收藏家", "Gas Ticket Collector", "每条链都留下车票，你相信终点站会返钱。", "Every chain gets a ticket; you believe the last station pays back."),
    expandedPersonality("protocol-attendance-monitor", "协议考勤委员", "Protocol Attendance Monitor", "新协议一点名，你的钱包先举手。", "When a new protocol takes attendance, your wallet raises its hand first."),
    expandedPersonality("airdrop-shadow-clerk", "空投影子办事员", "Airdrop Shadow Clerk", "你不确定有没有工资，但每天都在链上打卡。", "You are unsure there is a salary, but you clock in onchain anyway.")
  ],
  nft: [
    expandedPersonality("floor-price-archivist", "地板价档案员", "Floor-Price Archivist", "你的 NFT 记录像档案馆，主要收藏下沉曲线。", "Your NFT record is an archive, mostly preserving sinking floors."),
    expandedPersonality("jpeg-museum-night-guard", "JPEG 博物馆夜班保安", "JPEG Museum Night Guard", "游客散了，你还在给上一轮图片资产巡逻。", "The visitors left, and you still patrol last cycle's image assets."),
    expandedPersonality("metadata-dream-keeper", "Metadata 梦境保管员", "Metadata Dream Keeper", "你保存的不只是图，是那年群里相信过的梦。", "You preserve not just images, but dreams the chat once believed in."),
    expandedPersonality("pfp-identity-residue", "头像身份残留物", "PFP Identity Residue", "你的链上身份有一点旧头像时代的回声。", "Your onchain identity carries echoes from the old avatar era."),
    expandedPersonality("mint-button-nostalgic", "Mint 按钮怀旧病", "Mint Button Nostalgia", "看到 mint，你的手会想起一些很贵的青春。", "The word mint makes your hand remember an expensive youth.")
  ],
  diamond: [
    expandedPersonality("forgotten-exit-monument", "忘记卖纪念碑", "Forgotten Exit Monument", "你的长期持有有纪念碑气质，碑文写着当时太忙。", "Your long holds feel monumental; the inscription says you were busy."),
    expandedPersonality("cycle-sleep-capsule", "周期睡眠舱", "Cycle Sleep Capsule", "钱包像睡眠舱，醒来时叙事已经换了三套衣服。", "The wallet is a sleep capsule; when it wakes, narratives have changed outfits."),
    expandedPersonality("bag-zen-resident", "套牢禅院住客", "Bag Zen Resident", "你把波动修成了禅，亏损听起来像木鱼。", "You turned volatility into Zen; drawdown sounds like a temple bell."),
    expandedPersonality("long-hold-fossil", "长期持仓化石", "Long-Hold Fossil", "有些仓位不是资产，是地质年代。", "Some positions are not assets; they are geological eras."),
    expandedPersonality("conviction-or-screensaver", "信仰或屏保型持仓", "Conviction or Screensaver Holder", "你可能很坚定，也可能只是钱包太久没被点开。", "You may be convicted, or the wallet may simply have been a screensaver.")
  ],
  stable: [
    expandedPersonality("usdt-meditation-room", "USDT 静音室", "USDT Quiet Room", "市场很吵，你的钱包把自己调成了静音。", "The market is loud; your wallet has muted itself."),
    expandedPersonality("stablecoin-sleep-mode", "稳定币睡眠模式", "Stablecoin Sleep Mode", "你不是退出市场，你是在给情绪省电。", "You did not leave the market; you are saving battery for your mood."),
    expandedPersonality("risk-off-tea-master", "避险茶艺师", "Risk-Off Tea Master", "别人冲热点，你在稳定币里泡一壶冷静。", "Others chase heat; you brew calm inside stablecoins."),
    expandedPersonality("bull-market-observer-seat", "牛市观察席票根", "Bull Market Observer Seat Stub", "你没有错过牛市，你只是坐在观众席看完了。", "You did not miss the bull market; you watched it from the audience seats."),
    expandedPersonality("capital-parking-attendant", "本金停车管理员", "Capital Parking Attendant", "资金停得很整齐，就是偶尔忘了开出去。", "Capital is parked neatly; sometimes it forgets to drive out.")
  ],
  meme: [
    expandedPersonality("ticker-fever-carrier", "Ticker 发烧携带者", "Ticker Fever Carrier", "每个新符号都像体温计，你看一眼就开始升温。", "Every new ticker is a thermometer; one glance and you heat up."),
    expandedPersonality("meme-emergency-surgeon", "Meme 急诊外科", "Meme Emergency Surgeon", "你给每个土狗做抢救，病历写满了滑点。", "You perform emergency care on every meme; the chart is full of slippage."),
    expandedPersonality("dogcoin-field-medic", "土狗战地医师", "Microcap Field Medic", "别人撤退时，你还在给低流动性做人工呼吸。", "When others retreat, you still perform CPR on shallow liquidity."),
    expandedPersonality("green-candle-cultivator", "阳线种植户", "Green Candle Farmer", "你总觉得下一根阳线是自己种出来的。", "You keep thinking the next green candle is something you planted."),
    expandedPersonality("meme-oracle-intern", "Meme 预言机实习生", "Meme Oracle Intern", "你的预言准确率不稳定，但气氛很到位。", "Your prophecy accuracy varies, but the atmosphere is excellent.")
  ],
  memeLowLiquidity: [
    expandedPersonality("slippage-silk-road", "滑点丝绸之路商人", "Slippage Silk Road Merchant", "你走的每条路都很丝滑，直到成交价开始讲故事。", "Every road feels smooth until the fill price starts telling stories."),
    expandedPersonality("exit-door-mirage", "退出门海市蜃楼", "Exit Door Mirage", "买入时门很宽，卖出时门开始变成文学意象。", "The door is wide on entry; on exit it becomes a literary metaphor."),
    expandedPersonality("thin-pool-deep-thinker", "浅池深度思考家", "Thin-Pool Deep Thinker", "池子很浅，你的信心却像深海。", "The pool is shallow; your confidence is oceanic."),
    expandedPersonality("microcap-oxygen-tank", "小币氧气瓶", "Microcap Oxygen Tank", "每次流动性缺氧，你都试图给它输一口信仰。", "Whenever liquidity runs out of oxygen, you donate a breath of conviction."),
    expandedPersonality("liquidity-basement-tourist", "流动性地下室游客", "Liquidity Basement Tourist", "你进去的时候很顺，出来的时候开始找楼梯。", "Entry is smooth; exit begins with searching for stairs.")
  ],
  collector: [
    expandedPersonality("token-drawer-hoarder", "Token 抽屉囤积癖", "Token Drawer Hoarder", "你的钱包像抽屉，什么都能放，什么都舍不得扔。", "Your wallet is a drawer: everything fits, nothing leaves."),
    expandedPersonality("entry-only-curator", "只进不出策展人", "Entry-Only Curator", "你不是不卖，你是在给每个仓位办永久展。", "You are not refusing to sell; you are giving every position a permanent exhibit."),
    expandedPersonality("dust-zoo-registrar", "灰尘仓位户籍员", "Dust Position Registrar", "每个小仓位都有户口，虽然没人知道它住哪。", "Every tiny position has paperwork, even if nobody knows where it lives."),
    expandedPersonality("wallet-attic-keeper", "钱包阁楼管理员", "Wallet Attic Keeper", "你的资产像阁楼旧箱子，打开总有上一轮的味道。", "Your assets feel like attic boxes; opening them smells like last cycle."),
    expandedPersonality("approval-fossil-reader", "授权化石解读员", "Approval Fossil Reader", "你的授权记录比部分项目路线图更有历史厚度。", "Your approval history has more historical depth than some roadmaps.")
  ],
  lowLiquidity: [
    expandedPersonality("liquidity-black-ice", "流动性黑冰路段", "Liquidity Black Ice", "看起来能走，踩上去才知道滑。", "It looks walkable until the first step slips."),
    expandedPersonality("depth-chart-mirage", "深度图海市蜃楼", "Depth Chart Mirage", "你看到的是深度，链上看到的是幻觉。", "You see depth; onchain sees hallucination."),
    expandedPersonality("mev-lunchbox", "MEV 便当盒", "MEV Lunchbox", "你的路径很努力，路过的机器人也吃得很饱。", "Your route tries hard, and passing bots eat well."),
    expandedPersonality("pool-edge-philosopher", "池边哲学家", "Pool-Edge Philosopher", "你每次下水前都很哲学，下水后开始现实主义。", "Before entering pools you are philosophical; after entering, realist."),
    expandedPersonality("spread-tax-resident", "价差税常住民", "Spread Tax Resident", "你交的不是滑点，是给不流动世界的居住税。", "That is not slippage; it is residency tax for an illiquid world.")
  ],
  bluechip: [
    expandedPersonality("bluechip-window-shopper", "蓝筹橱窗游客", "Bluechip Window Shopper", "你看起来很稳，但眼神一直飘向隔壁小币柜台。", "You look stable, but your eyes drift toward the small-cap counter."),
    expandedPersonality("respectable-degen-in-suit", "穿正装的 Degen", "Degen in Formal Wear", "你的组合很体面，灵魂还在找刺激。", "The portfolio is formal; the soul still wants trouble."),
    expandedPersonality("eth-btc-family-doctor", "ETH/BTC 家庭医生", "ETH/BTC Family Doctor", "主流资产让你看起来健康，病灶藏在点击习惯里。", "Major assets make you look healthy; the symptoms hide in click habits."),
    expandedPersonality("smart-money-theater-seat", "聪明钱剧场观众", "Smart-Money Theater Audience", "你坐在聪明钱剧场，但偶尔会冲上台。", "You sit in the smart-money theater, occasionally rushing the stage."),
    expandedPersonality("bluechip-seatbelt-user", "蓝筹安全带使用者", "Bluechip Seatbelt User", "你系了安全带，但车还是往 Meme 区开。", "You wear a seatbelt, but the car keeps driving toward memes.")
  ],
  widePortfolio: [
    expandedPersonality("portfolio-confetti-machine", "仓位彩纸机", "Portfolio Confetti Machine", "你的 Token 多样性像彩纸，热闹但扫起来费劲。", "Your token diversity is confetti: festive, then hard to clean."),
    expandedPersonality("asset-identity-parliament", "资产身份议会", "Asset Identity Parliament", "每个仓位都有意见，组合像在开会。", "Every position has an opinion; the portfolio is holding parliament."),
    expandedPersonality("token-soup-chef", "Token 浓汤厨师", "Token Soup Chef", "你什么都加一点，最后味道主要靠信仰解释。", "You add a bit of everything; the flavor is explained by conviction."),
    expandedPersonality("wallet-tab-explosion", "钱包标签页爆炸", "Wallet Tab Explosion", "你的钱包像浏览器开太多标签，关哪个都舍不得。", "Your wallet is too many browser tabs; every close feels wrong."),
    expandedPersonality("narrative-sample-library", "叙事样本库管理员", "Narrative Sample Librarian", "热门叙事你都留过样，像链上实验室。", "You sampled every narrative like an onchain lab.")
  ],
  extremeDegen: [
    expandedPersonality("onchain-intensive-care", "链上重症观察室", "Onchain Intensive Care", "钱包还在呼吸，但指标已经适合家属会谈。", "The wallet is breathing, but the chart invites a family meeting."),
    expandedPersonality("risk-permissionless-patient", "无需许可高危患者", "Permissionless High-Risk Patient", "你的风险偏好完全开源，任何叙事都能调用。", "Your risk appetite is open source; any narrative can call it."),
    expandedPersonality("degen-reactor-core", "Degen 反应堆核心", "Degen Reactor Core", "能量很大，冷却系统看起来外包给了运气。", "The energy is huge; cooling appears outsourced to luck."),
    expandedPersonality("wallet-red-zone-resident", "钱包红区常住民", "Wallet Red-Zone Resident", "你不是路过高风险区，你像在里面签了租约。", "You are not visiting the risk zone; you appear to have leased space."),
    expandedPersonality("liquidation-weather-station", "爆仓天气站", "Liquidation Weather Station", "你的钱包气象预报经常出现大风和强制平仓云。", "Your wallet forecast often includes strong winds and liquidation clouds.")
  ],
  lowDegen: [
    expandedPersonality("chain-library-card", "链上图书馆借书证", "Onchain Library Card", "你的钱包安静得像图书馆，连牛市都放低声音。", "Your wallet is so quiet even bull markets lower their voice."),
    expandedPersonality("cold-start-savings-account", "冷启动储蓄人格", "Cold-Start Savings Personality", "你不像交易员，更像给链上开了一个储蓄抽屉。", "You are less a trader and more an onchain savings drawer."),
    expandedPersonality("risk-off-office-worker", "避险办公室职员", "Risk-Off Office Worker", "每天按时下班，行情加班与你无关。", "Clocking out on time; market overtime is not your department."),
    expandedPersonality("blockchain-quiet-quitter", "链上安静离场者", "Onchain Quiet Quitter", "你没有离开币圈，只是把存在感调低了。", "You did not leave crypto; you lowered your onchain volume."),
    expandedPersonality("wallet-do-not-disturb", "钱包勿扰模式", "Wallet Do-Not-Disturb", "通知可以响，仓位不一定动。", "Notifications may ring; positions do not necessarily move.")
  ],
  conservative: [
    expandedPersonality("entry-approval-board", "入场审批委员会", "Entry Approval Board", "你买币前像开会，错过后像写纪要。", "You buy like a committee meeting and miss like meeting minutes."),
    expandedPersonality("risk-memo-author", "风险备忘录作者", "Risk Memo Author", "你的谨慎很完整，偶尔完整到行情已经结束。", "Your caution is thorough, sometimes until the move has ended."),
    expandedPersonality("buy-button-legal-review", "买入按钮法务审核", "Buy Button Legal Review", "每次下单前，钱包像在等法务盖章。", "Before every order, the wallet seems to await legal approval."),
    expandedPersonality("capital-seatbelt-inspector", "本金安全带检查员", "Capital Seatbelt Inspector", "你不是保守，你只是每次出门先检查三遍安全带。", "You are not timid; you check the seatbelt three times before leaving."),
    expandedPersonality("fomo-firewall-admin", "FOMO 防火墙管理员", "FOMO Firewall Admin", "你给冲动装了防火墙，偶尔也把机会拦在外面。", "You installed a firewall for impulse; sometimes it blocks opportunity too.")
  ],
  fallback: [
    expandedPersonality("standard-chaos-sample", "标准混沌样本", "Standard Chaos Sample", "你看起来普通，但普通本身就是币圈的高级病症。", "You look ordinary, which in crypto is already an advanced symptom."),
    expandedPersonality("retail-weather-vane", "散户风向标", "Retail Weather Vane", "风往哪吹你不一定追，但一定会看很久。", "You may not chase every wind, but you watch it for a long time."),
    expandedPersonality("market-mood-sponge", "市场情绪海绵", "Market Mood Sponge", "你的钱包吸收情绪的能力，比吸收收益稳定。", "Your wallet absorbs emotion more reliably than returns."),
    expandedPersonality("narrative-waiting-room", "叙事候诊室", "Narrative Waiting Room", "每个新故事都在你这里挂过号。", "Every new story has checked in at your wallet."),
    expandedPersonality("chart-side-eye-expert", "K 线斜眼专家", "Chart Side-Eye Expert", "你看盘的眼神很复杂，操作的证据更复杂。", "Your chart stare is complex; the transaction evidence is more complex."),
    expandedPersonality("wallet-inner-monologue", "钱包内心戏导演", "Wallet Inner-Monologue Director", "每笔交易都有心理活动，只是链上不显示字幕。", "Every trade has inner monologue; onchain just hides the subtitles.")
  ]
};

const PERSONALITY_POOL_SECOND_WAVE = {
  whale: [
    expandedPersonality("treasury-mirage-conductor", "金库错觉指挥官", "Treasury Mirage Conductor", "你的余额像指挥台，但每一次加仓都像在给幻觉配乐。", "Your balance looks like a podium, but every add sounds scored for a mirage."),
    expandedPersonality("large-holder-night-pilot", "大户夜航员", "Large-Holder Night Pilot", "你带着很重的仓位穿过夜盘，仪表盘上写着别上头。", "You fly heavy positions through late markets; the dashboard says do not tilt."),
    expandedPersonality("position-empire-archaeologist", "仓位帝国考古学家", "Position Empire Archaeologist", "你的仓位有帝国感，遗址里埋着几次没来得及退出。", "Your positions feel imperial; the ruins contain several exits that never happened."),
    expandedPersonality("liquidity-throne-mover", "流动性王座搬运工", "Liquidity Throne Mover", "别人搬砖，你搬王座；只是王座偶尔会坐在滑点上。", "Others move bricks; you move thrones, occasionally seated on slippage.")
  ],
  failed: [
    expandedPersonality("failed-receipt-bookbinder", "失败回执装订师", "Failed Receipt Bookbinder", "你把失败交易装订成册，封面写着下次一定先模拟。", "You bind failed receipts into volumes; the cover says simulate first next time."),
    expandedPersonality("gas-cremation-officer", "手续费火化员", "Gas Cremation Officer", "每一次失败都很安静，只有手续费被现场火化。", "Every failure is quiet; only the gas gets cremated on site."),
    expandedPersonality("confirm-button-sparring-partner", "确认按钮拳击陪练", "Confirm Button Sparring Partner", "你和确认按钮打了很多回合，判定胜负的通常是 Gas。", "You spar with confirm buttons often; gas usually judges the match."),
    expandedPersonality("simulator-level-skipper", "模拟器跳关者", "Simulator Level Skipper", "提示框说慢点，你的手说我已经看完结局了。", "The prompt says slow down; your hand says it already knows the ending.")
  ],
  swapHeavy: [
    expandedPersonality("nonce-machine-gunner", "Nonce 连珠炮", "Nonce Machine Gunner", "交易节奏密到像打点，钱包像在给区块链敲军鼓。", "Your transaction rhythm fires in bursts; the wallet drums for the chain."),
    expandedPersonality("router-maze-warden", "路由器迷宫保安", "Router Maze Warden", "你不是路过路由器，你像在里面值班。", "You are not passing through routers; you seem stationed inside them."),
    expandedPersonality("approval-waterfall-observer", "授权瀑布观测员", "Approval Waterfall Observer", "授权一层接一层往下流，风控站在岸边看风景。", "Approvals cascade downward while risk control watches from the bank."),
    expandedPersonality("slippage-stopwatch-player", "滑点秒表玩家", "Slippage Stopwatch Player", "你追求成交速度，滑点负责帮你记录代价。", "You chase execution speed; slippage records the price.")
  ],
  swapDegen: [
    expandedPersonality("green-candle-ambulance-driver", "阳线急救车驾驶员", "Green-Candle Ambulance Driver", "一根阳线刚亮，你的钱包就开着警报往现场冲。", "One green candle flashes and your wallet drives toward it with sirens on."),
    expandedPersonality("fomo-ignition-technician", "FOMO 点火师", "FOMO Ignition Technician", "你不追热点，你负责给热点补一把火。", "You do not chase heat; you help ignite it."),
    expandedPersonality("narrative-highway-tollkeeper", "叙事高速入口收费员", "Narrative Highway Tollkeeper", "每条新叙事都从你这里上高速，过路费叫本金。", "Every new narrative enters the highway through you; the toll is principal."),
    expandedPersonality("group-screenshot-responder", "群友截图响应者", "Group Screenshot Responder", "群友一晒收益，你的钱包就像收到紧急工单。", "A profit screenshot appears and your wallet treats it as an urgent ticket.")
  ],
  defi: [
    expandedPersonality("apr-chanting-machine", "APR 念经机", "APR Chanting Machine", "收益率开始发光时，你的怀疑精神会自动静音。", "When yield starts glowing, skepticism mutes itself."),
    expandedPersonality("yield-auditory-hallucination", "收益率幻听患者", "Yield Auditory Hallucination", "你听见的不是收益，是协议在耳边说再质押一次。", "What you hear is not yield; it is a protocol whispering stake once more."),
    expandedPersonality("lp-basement-landlord", "LP 地下室房东", "LP Basement Landlord", "你给流动性租了地下室，退租时才发现楼梯很窄。", "You rent a basement for liquidity; moving out reveals narrow stairs."),
    expandedPersonality("farm-afterheat-collector", "挖矿余温采集者", "Farm Afterheat Collector", "DeFi 热闹散场后，你还在收集最后一点余温。", "After DeFi leaves the room, you still collect the afterheat.")
  ],
  airdrop: [
    expandedPersonality("interaction-punch-card-migrant", "交互打卡迁徙者", "Interaction Punch-Card Migrant", "你的钱包像带着工牌跨链上班，哪条链开门就去哪签到。", "Your wallet crosses chains with an employee badge, clocking in wherever doors open."),
    expandedPersonality("quest-list-bricklayer", "任务清单搬砖员", "Quest List Bricklayer", "别人研究叙事，你研究每个任务框有没有勾上。", "Others study narratives; you study whether every quest box is ticked."),
    expandedPersonality("crosschain-gate-attendant", "跨链登机口保安", "Crosschain Gate Attendant", "每条链都像登机口，你的钱包负责确认还能不能上车。", "Every chain is a boarding gate and your wallet checks whether boarding is still open."),
    expandedPersonality("airdrop-shadow-attendant", "空投影子签到员", "Airdrop Shadow Attendant", "你不确定有没有奖励，但签到动作已经形成肌肉记忆。", "You are not sure there is a reward, but check-in is now muscle memory.")
  ],
  nft: [
    expandedPersonality("floor-price-night-watch", "地板价守夜人", "Floor-Price Night Watch", "夜深了，地板价还在，你也还在。", "It is late, the floor price remains, and so do you."),
    expandedPersonality("mint-old-dream-keeper", "Mint 旧梦保管员", "Mint Old-Dream Keeper", "Mint 按钮一出现，你的手会想起一些很贵的青春。", "When a mint button appears, your hand remembers an expensive youth."),
    expandedPersonality("avatar-era-archivist", "头像时代考古员", "Avatar-Era Archivist", "你的钱包里还保存着上一轮头像时代的空气标本。", "Your wallet still preserves air samples from the last avatar era."),
    expandedPersonality("metadata-medium", "Metadata 灵媒", "Metadata Medium", "你和元数据之间的关系，已经接近通灵。", "Your relationship with metadata is approaching mediumship.")
  ],
  diamond: [
    expandedPersonality("exit-button-amnesia", "退出按钮遗忘症", "Exit Button Amnesia", "你不是不卖，你是每次想卖时都忘了出口长什么样。", "You are not refusing to sell; you forget what exits look like whenever needed."),
    expandedPersonality("cycle-cryosleep-passenger", "周期冷冻舱乘客", "Cycle Cryosleep Passenger", "你把仓位放进冷冻舱，醒来时叙事已经换了三代。", "You place positions into cryosleep and wake after narratives changed generations."),
    expandedPersonality("bag-zen-student", "套牢禅修院院生", "Bag Zen Student", "你把波动修成了禅，回撤听起来像晚课钟声。", "You turned volatility into Zen; drawdown sounds like evening bells."),
    expandedPersonality("position-petrification", "仓位石化症", "Position Petrification", "有些仓位不是持有，是正在形成地质结构。", "Some positions are not held; they are forming geological structures.")
  ],
  stable: [
    expandedPersonality("usdc-abbot", "USDC 禅房住持", "USDC Quiet-Room Abbot", "市场在外面敲锣，你在稳定币里负责关灯。", "The market bangs outside; you turn off the lights inside stablecoins."),
    expandedPersonality("stablecoin-cryosleep", "稳定币冷冻睡眠", "Stablecoin Cryosleep", "你没有离场，只是把情绪暂时冻住。", "You did not exit; you froze the emotions temporarily."),
    expandedPersonality("risk-off-teahouse-regular", "避险茶馆常客", "Risk-Off Teahouse Regular", "别人冲锋的时候，你在稳定币茶馆里续杯。", "When others charge forward, you refill tea in the stablecoin house."),
    expandedPersonality("bull-market-auditorium-student", "牛市旁听生", "Bull-Market Audit Student", "牛市你不是没参加，你只是坐在最后一排记笔记。", "You did not miss the bull market; you audited it from the back row.")
  ],
  meme: [
    expandedPersonality("ticker-fever-clinic", "Ticker 发烧门诊", "Ticker Fever Clinic", "新代码一出现，你的钱包就开始量体温。", "A new ticker appears and your wallet starts taking its temperature."),
    expandedPersonality("microcap-emergency-queue-jumper", "土狗急诊插队者", "Microcap Emergency Queue Jumper", "别人排队观察，你已经躺在土狗急诊室。", "Others wait to observe; you are already inside microcap emergency."),
    expandedPersonality("marketcap-microscope-patient", "市值显微镜患者", "Market-Cap Microscope Patient", "市值越小，你越觉得自己看见了宇宙。", "The smaller the market cap, the more you think you saw the universe."),
    expandedPersonality("green-candle-hypnosis-subject", "阳线催眠受试者", "Green-Candle Hypnosis Subject", "阳线不需要说服你，只需要亮一下。", "Green candles do not need to persuade you; they only need to glow.")
  ],
  memeLowLiquidity: [
    expandedPersonality("slippage-underpass-passenger", "滑点地下通道乘客", "Slippage Underpass Passenger", "你进去的时候走的是通道，出来的时候开始找出口标识。", "Entry feels like a passage; exit becomes a search for signs."),
    expandedPersonality("exit-mirage-collector", "退出门海市蜃楼收藏家", "Exit-Door Mirage Collector", "每次想走，出口都像加载中的幻觉。", "Every time you want to leave, the exit looks like a loading hallucination."),
    expandedPersonality("shallow-pool-diver", "浅池潜水员", "Shallow-Pool Diver", "池子很浅，你却穿着深潜装备跳了进去。", "The pool is shallow; you jumped in wearing deep-diving gear."),
    expandedPersonality("wide-entry-narrow-exit", "买入宽门卖出窄巷", "Wide Entry, Narrow Exit", "买入像进商场，卖出像钻通风管。", "Buying feels like entering a mall; selling feels like crawling through vents.")
  ],
  collector: [
    expandedPersonality("token-specimen-curator", "Token 标本瓶管理员", "Token Specimen Curator", "你给每个小仓位贴了标签，只是不一定还记得它为什么来。", "Every tiny position has a label, though its origin story may be missing."),
    expandedPersonality("position-storage-room-landlord", "仓位杂物间房东", "Position Storage-Room Landlord", "你的钱包像杂物间，能放的都放，能扔的都舍不得。", "Your wallet is a storage room: everything fits, nothing gets thrown away."),
    expandedPersonality("approval-fossil-cleaner", "授权化石清洁工", "Approval Fossil Cleaner", "你不是在管理授权，你是在清理上一轮留下的化石层。", "You are not managing approvals; you are cleaning fossil layers from prior cycles."),
    expandedPersonality("entry-only-customs", "只进不出海关", "Entry-Only Customs", "资产过海关很顺利，出境窗口长期休息。", "Assets clear entry smoothly; the exit window is on extended break.")
  ],
  lowLiquidity: [
    expandedPersonality("depth-chart-illusionist", "深度图幻觉师", "Depth-Chart Illusionist", "你看到的是深度，成交价看到的是魔术。", "You see depth; the fill price sees magic."),
    expandedPersonality("spread-tax-large-payer", "价差税纳税大户", "Spread-Tax Large Payer", "你的滑点记录很像在给低流动性世界纳税。", "Your slippage history looks like tax paid to the illiquid world."),
    expandedPersonality("mev-lunch-sponsor", "MEV 盒饭赞助商", "MEV Lunch Sponsor", "你的路径很努力，路过的机器人也吃得很饱。", "Your routes try hard; passing bots eat well."),
    expandedPersonality("shallow-pool-philosophy-major", "浅池哲学系学生", "Shallow-Pool Philosophy Major", "池子越浅，你关于信仰的解释越深。", "The shallower the pool, the deeper your explanation of conviction.")
  ],
  bluechip: [
    expandedPersonality("formal-degen-waiting-room", "正装 Degen 候诊者", "Formal Degen Waiting Room", "组合穿得很体面，精神状态还在等叫号。", "The portfolio is dressed formally; the mental state waits for its number."),
    expandedPersonality("bluechip-seatbelt-coach", "蓝筹安全带教练", "Bluechip Seatbelt Coach", "你知道怎么系安全带，也知道怎么偷偷把车开向热点区。", "You know how to buckle up, and how to steer quietly toward narratives."),
    expandedPersonality("major-asset-cover-letter", "主流资产遮羞布使用者", "Major-Asset Cover Letter", "主流资产负责体面，其他仓位负责暴露真实性格。", "Majors provide respectability; other positions reveal the real personality."),
    expandedPersonality("smart-money-ticket-checker", "聪明钱剧场检票员", "Smart-Money Theater Ticket Checker", "你在聪明钱剧场门口很久，偶尔也会冲上台。", "You stand at the smart-money theater entrance, sometimes rushing the stage.")
  ],
  widePortfolio: [
    expandedPersonality("token-kaleidoscope-keeper", "Token 万花筒保管员", "Token Kaleidoscope Keeper", "你的组合一转就换颜色，解释起来全靠当时的叙事光线。", "The portfolio changes colors when turned; explanation depends on narrative lighting."),
    expandedPersonality("position-un-spokesperson", "仓位联合国发言人", "Position United Nations Spokesperson", "每个仓位都有立场，会议纪要写满了但是没人退出。", "Every position has a stance; minutes are full, exits are absent."),
    expandedPersonality("narrative-lab-warehouse", "叙事实验室仓库员", "Narrative Lab Warehouse Clerk", "你把每个热点都留过样，钱包像实验室仓库。", "You sampled every hot story; the wallet feels like a lab warehouse."),
    expandedPersonality("wallet-browser-tab-explosion-2", "钱包浏览器标签爆炸", "Wallet Browser-Tab Explosion", "仓位多到像浏览器标签页，关掉哪一个都感觉会错过。", "Positions feel like browser tabs; closing any one feels like missing out.")
  ],
  extremeDegen: [
    expandedPersonality("risk-reactor-duty-officer", "风险反应堆值班员", "Risk Reactor Duty Officer", "你的风险偏好像反应堆，冷却系统经常请假。", "Your risk appetite is a reactor whose cooling system often takes leave."),
    expandedPersonality("liquidation-cloud-observer", "清算云层观察员", "Liquidation Cloud Observer", "天气预报显示多云，局部地区可能爆仓。", "The forecast is cloudy, with local liquidation possible."),
    expandedPersonality("red-zone-long-term-tenant", "红区长期租客", "Red-Zone Long-Term Tenant", "你不是经过高风险区，你像在里面签了长租。", "You are not passing through the red zone; you seem to have a long lease."),
    expandedPersonality("onchain-er-observation", "链上急诊留观患者", "Onchain ER Observation", "钱包还醒着，但护士已经开始记录 Degen 指数。", "The wallet is awake, but the nurse has started recording the Degen Index.")
  ],
  lowDegen: [
    expandedPersonality("onchain-silent-mode", "链上静音模式", "Onchain Silent Mode", "市场喊得很大声，你的钱包把存在感调到最低。", "The market shouts; your wallet turns presence down to minimum."),
    expandedPersonality("wallet-library-clerk", "钱包图书馆管理员", "Wallet Library Clerk", "你的链上行为很安静，连牛市进门都要小声。", "Your onchain behavior is quiet; even bull markets enter softly."),
    expandedPersonality("risk-off-clock-in-worker", "避险打卡上班族", "Risk-Off Clock-In Worker", "行情加班与你无关，本金按时下班。", "Market overtime is not your department; principal clocks out on time."),
    expandedPersonality("market-observer-seat-regular", "行情旁观席常客", "Market Observer-Seat Regular", "你很懂围观，真正动手时像在提交请假申请。", "You are excellent at observing; clicking feels like filing leave papers.")
  ],
  conservative: [
    expandedPersonality("buy-button-legal-department", "买入按钮法务部", "Buy Button Legal Department", "你每次下单都像要过三轮合规审查。", "Every order feels like it must clear three rounds of compliance."),
    expandedPersonality("fomo-firewall-admin-2", "FOMO 防火墙管理员", "FOMO Firewall Admin", "你把冲动拦在门外，偶尔也把机会拦在门外。", "You block impulse at the door, and sometimes opportunity with it."),
    expandedPersonality("capital-seatbelt-inspector-2", "本金安全带检查员", "Capital Seatbelt Inspector", "出发前你会检查安全带，市场已经开走两站。", "You check the seatbelt before departure; the market has moved two stops."),
    expandedPersonality("entry-approval-committee-2", "入场审批委员会", "Entry Approval Committee", "你不是不敢买，你只是把买入流程做成了委员会制度。", "You are not afraid to buy; you turned entry into committee governance.")
  ],
  fallback: [
    expandedPersonality("standard-chaos-sample-2", "普通混沌样本二号", "Standard Chaos Sample No. 2", "看起来普通，细看每一笔都有一点币圈专属的歪理。", "It looks normal until every transaction reveals crypto-specific logic."),
    expandedPersonality("market-mood-blotting-paper", "市场情绪吸水纸", "Market Mood Blotting Paper", "行情情绪一洒出来，你的钱包负责吸收。", "When market mood spills, your wallet absorbs it."),
    expandedPersonality("chart-side-eye-assistant", "K 线斜眼观察员", "Chart Side-Eye Assistant", "你看盘的眼神很专业，操作记录更像未剪辑花絮。", "Your chart stare looks professional; the actions look like unedited footage."),
    expandedPersonality("wallet-monologue-assistant", "钱包独白导演助理", "Wallet Monologue Assistant", "每笔交易都有心理活动，只是链上没有字幕。", "Every trade has inner monologue; onchain provides no subtitles.")
  ]
};

for (const [poolName, entries] of Object.entries(PERSONALITY_POOL_SECOND_WAVE)) {
  PERSONALITY_POOL_EXPANSIONS[poolName] = [
    ...(PERSONALITY_POOL_EXPANSIONS[poolName] || []),
    ...entries
  ];
}

const CURATED_PERSONALITY_POOLS = {
  meme: [
    expandedPersonality("meme-frontline-captain", "Meme 冲锋队长", "Meme Frontline Captain", "这个钱包不是在交易，它是在参加表情包战争。", "This wallet is not trading; it is enlisted in a meme war."),
    expandedPersonality("hotspot-wind-runner", "热点追风少年", "Narrative Wind Runner", "风往哪吹，你的钱包就往哪签名。", "Where the wind blows, this wallet signs."),
    expandedPersonality("fomo-perpetual-engine", "FOMO 永动机", "FOMO Perpetual Engine", "你的钱包可能没有开关，只有 FOMO 触发器。", "This wallet may not have a switch, only a FOMO trigger."),
    expandedPersonality("bull-market-charger", "牛市冲锋兵", "Bull-Market Charger", "只要市场一热，这个钱包就像听见了冲锋号。", "When the market heats up, this wallet hears a charge horn.")
  ],
  memeLowLiquidity: [
    expandedPersonality("microcap-survivor", "土狗幸存者", "Microcap Survivor", "你的钱包经常出现在理智下线后的第一现场。", "This wallet often appears at the first scene after reason logs off."),
    expandedPersonality("cold-ticker-collector", "冷门收藏家", "Obscure Ticker Collector", "你的钱包里有些币，连行情软件都想假装没看见。", "Some tokens in this wallet make chart apps pretend not to notice."),
    expandedPersonality("liquidity-contributor", "流动性贡献者", "Liquidity Contributor", "你看起来在交易，实际更像在维持市场生态。", "It looks like trading; it also looks like donating liquidity to the ecosystem."),
    expandedPersonality("late-ticket-buyer", "错过大师", "Late Ticket Buyer", "你的钱包总能在故事最精彩的时候买到片尾票。", "This wallet often buys a ticket right as the credits begin.")
  ],
  airdrop: [
    expandedPersonality("airdrop-nomad-pro", "空投游牧民", "Airdrop Nomad", "这个钱包像背着行囊在链上赶集。", "This wallet looks like it carries a backpack across onchain markets."),
    expandedPersonality("crosschain-migratory-bird", "跨链候鸟", "Crosschain Migratory Bird", "这个钱包没有故乡，只有下一个生态入口。", "This wallet has no hometown, only the next ecosystem entrance."),
    expandedPersonality("small-interaction-ranger", "小额交互侠", "Small-Interaction Ranger", "你的钱包像在链上到处盖章。", "This wallet stamps passports across protocols."),
    expandedPersonality("protocol-taste-tester", "链上试吃员", "Protocol Taste Tester", "每个新协议都点一下，主打一个链上自助餐。", "Every new protocol gets a bite; this wallet treats onchain like a buffet.")
  ],
  defi: [
    expandedPersonality("defi-farm-owner", "DeFi 农场主", "DeFi Farm Owner", "你的钱包看起来像在链上承包了一片地。", "This wallet looks like it leased a field onchain."),
    expandedPersonality("yield-soil-tiller", "收益率翻土机", "Yield Soil Tiller", "APR 一亮，这个钱包就开始松土。", "When APR glows, this wallet starts tilling."),
    expandedPersonality("liquidity-garden-keeper", "流动性花园管理员", "Liquidity Garden Keeper", "你的 LP 小票像园艺标签，整齐但不一定都开花。", "Your LP receipts look like garden labels: neat, not always blooming."),
    expandedPersonality("protocol-qa-worker", "协议体验官", "Protocol QA Worker", "你的钱包交互过的协议，比很多人下载过的 App 还多。", "This wallet has tested more protocols than many people have apps.")
  ],
  diamond: [
    expandedPersonality("diamond-old-timer-safe", "钻石手老登", "Ancient Diamond Hands", "你不是拿得住，你像是忘了还有卖出按钮。", "This is not only conviction; it may have forgotten the sell button exists."),
    expandedPersonality("onchain-sweep-monk", "链上扫地僧", "Onchain Silent Master", "这个钱包平时不说话，但链上资历很硬。", "This wallet is quiet, but its onchain seniority is loud."),
    expandedPersonality("wallet-sleep-master", "链上装死大师", "Onchain Possum Master", "你的钱包不是冷静，它像是开启了飞行模式。", "This wallet is not calm; it looks like airplane mode."),
    expandedPersonality("cycle-survivor-core", "链上幸存者", "Onchain Survivor", "这个钱包不一定优雅，但它确实活到了现在。", "This wallet may not be graceful, but it survived until now.")
  ],
  stable: [
    expandedPersonality("stablecoin-hermit", "稳定币修仙者", "Stablecoin Hermit", "你的钱包已经进入低欲望链上生活。", "This wallet has entered a low-desire onchain lifestyle."),
    expandedPersonality("empty-position-philosopher", "空仓哲学家", "Sideline Philosopher", "你看起来错过了很多，也避开了不少教育。", "It looks like you missed a lot, and also dodged a lot of lessons."),
    expandedPersonality("maincoin-conservative", "主流币保守派", "Major-Coin Conservative", "这个钱包看起来像币圈里少数还想活久一点的人。", "This wallet looks like it is trying to survive longer than one cycle."),
    expandedPersonality("low-frequency-hermit", "低频隐士", "Low-Frequency Hermit", "这个钱包最大的优点，是很少打扰市场。", "This wallet's strongest skill is not disturbing the market often.")
  ],
  bluechip: [
    expandedPersonality("bluechip-conservative-tourist", "主流币保守派", "Major-Coin Conservative", "主流资产让钱包显得体面，手指偶尔还是想去热点区散步。", "Major assets keep the wallet respectable; the finger still wanders toward heat."),
    expandedPersonality("smart-money-copycat", "聪明钱模仿犯", "Smart-Money Copycat", "你不是没有作业，你只是经常最后一个交卷。", "The homework exists; this wallet just often submits it late."),
    expandedPersonality("risk-seatbelt-inspector", "本金安全带检查员", "Capital Seatbelt Inspector", "这个钱包知道安全带在哪，只是偶尔会偷偷解开。", "This wallet knows where the seatbelt is; sometimes it quietly unbuckles."),
    expandedPersonality("quiet-capital-clerk", "本金值班员", "Capital Desk Clerk", "行情再吵，本金也想按时下班。", "No matter how loud the market gets, principal wants to clock out on time.")
  ],
  widePortfolio: [
    expandedPersonality("cyber-hamster", "赛博仓鼠", "Cyber Hamster", "你不是在配置资产，你是在链上囤冬粮。", "This is not allocation; it is onchain winter hoarding."),
    expandedPersonality("altcoin-cabinet", "山寨收藏柜", "Altcoin Cabinet", "这个钱包像一个山寨币博物馆，门票还挺贵。", "This wallet is an altcoin museum with expensive admission."),
    expandedPersonality("asset-spread-anxiety", "资产分散焦虑型", "Diversification Anxiety", "这个钱包的资产分布，像一场还没整理完的情绪。", "This wallet's allocation looks like an emotion that never finished sorting itself."),
    expandedPersonality("onchain-grocery-owner", "链上杂货铺老板", "Onchain Grocery Owner", "这个钱包像杂货铺，进货逻辑只有老板知道。", "This wallet is a grocery store; only the owner knows the stocking logic.")
  ],
  collector: [
    expandedPersonality("wallet-amnesia-safe", "钱包健忘症", "Wallet Amnesia", "这个钱包里有些资产，可能连你自己都忘了。", "Some assets in this wallet may have been forgotten even by the owner."),
    expandedPersonality("entry-only-collector", "只买不卖型收藏家", "Buy-Only Collector", "买入入口很熟，卖出出口像陌生人。", "The entry is familiar; the exit looks like a stranger."),
    expandedPersonality("onchain-archaeologist", "链上考古学家", "Onchain Archaeologist", "这个钱包打开后，像翻到上一轮牛市的遗址。", "Opening this wallet feels like uncovering ruins from the last bull market."),
    expandedPersonality("old-narrative-keeper", "旧叙事收藏者", "Old-Narrative Keeper", "钱包里还保留着旧时代的回声。", "This wallet still preserves echoes from older narratives.")
  ],
  failed: [
    expandedPersonality("gas-burning-master", "Gas 燃烧大师", "Gas Burning Master", "你的钱包对生态最大的贡献，可能是 Gas。", "This wallet's biggest contribution to the ecosystem may be gas."),
    expandedPersonality("confirm-button-fighter-safe", "确认按钮搏击手", "Confirm Button Fighter", "你和钱包弹窗打了很多回合，战绩主要写在手续费里。", "You fought wallet popups often; the score is written in fees."),
    expandedPersonality("revert-souvenir-collector", "失败交易纪念品收藏家", "Revert Souvenir Collector", "失败不是终点，它在这个钱包里变成了小票。", "Failure is not the end; in this wallet it becomes a receipt."),
    expandedPersonality("gas-incense-keeper", "Gas 香火供奉者", "Gas Incense Keeper", "手续费像香火，烧得不算少，愿望也挺多。", "Gas burns like incense: not little, and with many wishes attached.")
  ],
  swapHeavy: [
    expandedPersonality("high-frequency-shaky-hand", "高频手抖型选手", "High-Frequency Shaky Hand", "这个钱包最忙的时候，可能连自己都不知道在忙什么。", "When this wallet is busy, even it may not know why."),
    expandedPersonality("side-switch-trader", "反复横跳交易员", "Side-Switch Trader", "这个钱包每天都在和昨天的自己辩论。", "This wallet debates yesterday's self every day."),
    expandedPersonality("contract-pressure-worker", "合约压力怪", "Contract Pressure Worker", "你的钱包看起来不缺机会，缺的是睡眠。", "This wallet does not lack opportunities; it lacks sleep."),
    expandedPersonality("event-button-drummer", "事件按钮鼓手", "Event Button Drummer", "事件一来，钱包像在给区块打鼓。", "When events arrive, this wallet drums for the block.")
  ],
  extremeDegen: [
    expandedPersonality("onchain-anomaly-soft", "链上异常体", "Onchain Anomaly", "这不是普通钱包，更像一段链上异常现象。", "This is not a normal wallet; it is closer to an onchain anomaly."),
    expandedPersonality("risk-reactor-operator", "风险反应堆操作员", "Risk Reactor Operator", "能量很大，但冷却系统需要认真上班。", "The energy is huge; the cooling system needs to show up for work."),
    expandedPersonality("degen-stage-monster", "币圈怪物样本", "Crypto Monster Sample", "照妖镜多看了两眼，主要是行为组合太有节目效果。", "The mirror looked twice because the behavior combo has serious show value."),
    expandedPersonality("abstract-wallet-core", "抽象钱包核心", "Absurd Wallet Core", "钱包行为已经超出普通解释，但仍然只是娱乐报告。", "The wallet behavior exceeds normal explanation, but this is still entertainment.")
  ],
  fallback: [
    expandedPersonality("small-balance-big-dreamer", "小额大梦想家", "Small Balance, Big Dreamer", "这个钱包资金有限，但想象力很充足。", "The capital is limited; the imagination is not."),
    expandedPersonality("onchain-vagrant", "链上流浪钱包", "Onchain Wanderer", "这个钱包像一张没有导航的链上旅行地图。", "This wallet is an onchain travel map with no navigation."),
    expandedPersonality("narrative-allergy-safe", "叙事过敏体质", "Narrative Allergy", "这个钱包对新叙事没有免疫力。", "This wallet has no immunity to new narratives."),
    expandedPersonality("standard-retail-survivor", "正常韭菜幸存样本", "Standard Retail Survivor", "懂一点，冲一点，最后还愿意复盘一点。", "Knows a little, clicks a little, still willing to review a little.")
  ]
};

for (const [poolName, entries] of Object.entries(CURATED_PERSONALITY_POOLS)) {
  PERSONALITY_POOL_EXPANSIONS[poolName] = [
    ...(PERSONALITY_POOL_EXPANSIONS[poolName] || []),
    ...entries
  ];
}

for (const entries of Object.values(PERSONALITY_POOL_EXPANSIONS)) {
  for (const entry of entries) {
    PERSONALITY_TEXT[entry.id] = {
      zh: entry.zh,
      en: entry.en,
      verdict: entry.verdict
    };
  }
}

function addPersonalityPool(picks, poolName) {
  picks.push(...(PERSONALITY_POOL_EXPANSIONS[poolName] || []).map((entry) => entry.id));
}

function isShareSafePersonality(id) {
  const text = PERSONALITY_TEXT[id];
  if (!text) return false;
  const joined = `${text.zh || ""} ${text.en || ""} ${text.verdict?.zh || ""} ${text.verdict?.en || ""}`;
  return !/(病历|患者|急诊|诊断|精神科|精神病|重症|心内科|候诊|门诊|医疗|autopsy|medical|patient|clinic|hospital|psychiatry|cardiology|intensive|emergency|psych ward|diagnosis)/i.test(joined);
}

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

function stableIndex(address, salt, length) {
  if (!length) return 0;
  const input = `${String(address || "").toLowerCase()}:${salt}`;
  let hash = 2166136261;
  for (const char of input) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

function pickStable(address, salt, items) {
  return items[stableIndex(address, salt, items.length)];
}

function pickStableLocalized(address, salt, lang, items) {
  const item = pickStable(address, salt, items);
  return pickLocalized(lang, item.zh, item.en);
}

function normalizeAddress(input) {
  return String(input || "").trim();
}

function normalizedAddressKey(address) {
  return normalizeAddress(address).toLowerCase();
}

function chainConfigKey() {
  const chainIds = [...BLOCKSCOUT_CHAINS.map((chain) => `${chain.id}:${chain.explorer}`), `${BNB_CHAIN.id}:${BNB_CHAIN.rpc}`];
  return chainIds.join("|");
}

function reportCacheKey(address, lang) {
  return `report:${REPORT_VERSION}:${normalizeLang(lang)}:${chainConfigKey()}:${normalizedAddressKey(address)}`;
}

function chainCacheKey(address) {
  return `chains:${REPORT_VERSION}:${chainConfigKey()}:${normalizedAddressKey(address)}`;
}

function isSampleWallet(address) {
  return SAMPLE_ADDRESSES.has(normalizedAddressKey(address));
}

function cacheTtlForAddress(address) {
  return isSampleWallet(address) ? SAMPLE_CACHE_TTL_MS : ANALYZE_CACHE_TTL_MS;
}

function clonePayload(payload) {
  return JSON.parse(JSON.stringify(payload));
}

function pruneCacheMap(map, now = Date.now()) {
  for (const [key, entry] of map.entries()) {
    if (!entry || now - entry.createdAt >= entry.ttlMs) map.delete(key);
  }
  while (map.size > MAX_CACHE_ENTRIES) {
    const first = map.keys().next().value;
    if (first === undefined) break;
    map.delete(first);
  }
}

function maybePruneCaches() {
  const now = Date.now();
  if (now - lastCachePrune < CACHE_PRUNE_INTERVAL_MS) return;
  lastCachePrune = now;
  pruneCacheMap(reportCache, now);
  pruneCacheMap(chainCache, now);
  pruneCacheMap(xProfileCache, now);
  pruneCacheMap(rateBuckets, now);
}

function getCached(map, key) {
  maybePruneCaches();
  const entry = map.get(key);
  if (!entry || Date.now() - entry.createdAt >= entry.ttlMs) {
    map.delete(key);
    return null;
  }
  return clonePayload(entry.value);
}

function setCached(map, key, value, ttlMs) {
  maybePruneCaches();
  map.set(key, { createdAt: Date.now(), ttlMs, value: clonePayload(value) });
}

function clientIp(req) {
  const forwarded = String(req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwarded || req.socket?.remoteAddress || "unknown";
}

function rateLimit(req, bucketName, { limit, windowMs }) {
  const now = Date.now();
  const key = `rate:${bucketName}:${clientIp(req)}`;
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.createdAt >= windowMs) {
    rateBuckets.set(key, { createdAt: now, ttlMs: windowMs, count: 1 });
    return { ok: true };
  }
  bucket.count += 1;
  bucket.ttlMs = windowMs;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - bucket.createdAt)) / 1000)) };
  }
  return { ok: true };
}

function normalizeXUsername(input) {
  const value = String(input || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  return /^[A-Za-z0-9_]{1,15}$/.test(value) ? value : "";
}

function xAvatarPath(username) {
  return `/api/x-avatar?username=${encodeURIComponent(username)}`;
}

function buildXProfile(username) {
  const normalized = normalizeXUsername(username);
  if (!normalized) return null;
  return {
    username: normalized,
    handle: `@${normalized}`,
    name: normalized,
    avatarUrl: xAvatarPath(normalized),
    rawAvatarUrl: `https://unavatar.io/x/${encodeURIComponent(normalized)}`,
    profileUrl: `https://x.com/${encodeURIComponent(normalized)}`,
    source: "fallback"
  };
}

function fullSizeXAvatar(url) {
  const value = String(url || "");
  return value ? value.replace(/_normal(\.[a-zA-Z0-9]+)(\?|$)/, "_400x400$1$2") : "";
}

async function fetchOfficialXProfile(username) {
  const normalized = normalizeXUsername(username);
  if (!normalized || !X_BEARER_TOKEN) return null;
  const url = new URL(`https://api.x.com/2/users/by/username/${encodeURIComponent(normalized)}`);
  url.searchParams.set("user.fields", "profile_image_url,verified,verified_type");
  const payload = await fetchJson(url.toString(), {
    timeout: X_PROFILE_TIMEOUT_MS,
    headers: {
      authorization: `Bearer ${X_BEARER_TOKEN}`
    }
  });
  const data = payload?.data;
  if (!data?.username) return null;
  return {
    username: data.username,
    handle: `@${data.username}`,
    name: data.name || data.username,
    avatarUrl: xAvatarPath(data.username),
    rawAvatarUrl: fullSizeXAvatar(data.profile_image_url) || `https://unavatar.io/x/${encodeURIComponent(data.username)}`,
    profileUrl: `https://x.com/${encodeURIComponent(data.username)}`,
    verified: Boolean(data.verified),
    verifiedType: data.verified_type || "",
    source: "x-api"
  };
}

async function resolveXProfile(username) {
  const fallback = buildXProfile(username);
  if (!fallback) return null;
  const key = `x-profile:${fallback.username.toLowerCase()}`;
  const cached = getCached(xProfileCache, key);
  if (cached) return cached;

  let profile = fallback;
  try {
    profile = await fetchOfficialXProfile(fallback.username) || fallback;
  } catch (error) {
    console.error(`X profile fallback for @${fallback.username}: ${error.message}`);
  }

  setCached(xProfileCache, key, profile, X_PROFILE_CACHE_TTL_MS);
  return profile;
}

async function serveXAvatar(res, username) {
  const fallbackPath = join(publicDir, "assets", "stone-avatar.png");
  const fallback = async () => {
    const body = await readFile(fallbackPath);
    res.writeHead(200, {
      "content-type": "image/png",
      "cache-control": "public, max-age=3600"
    });
    res.end(body);
  };

  const profile = await resolveXProfile(username);
  const source = profile?.rawAvatarUrl || "";
  if (!source || !/^https:\/\/(unavatar\.io|pbs\.twimg\.com|abs\.twimg\.com)\//i.test(source)) {
    await fallback();
    return;
  }

  try {
    const response = await fetch(source, {
      headers: {
        "accept": "image/avif,image/webp,image/png,image/jpeg,image/*,*/*",
        "user-agent": "OnchainMirror/0.1"
      },
      signal: AbortSignal.timeout(X_PROFILE_TIMEOUT_MS)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.writeHead(200, {
      "content-type": response.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=86400"
    });
    res.end(buffer);
  } catch {
    await fallback();
  }
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
  const timeout = setTimeout(() => controller.abort(), options.timeout || ONCHAIN_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "user-agent": "OnchainMirror/0.1",
        ...(options.headers || {})
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

function rankScore(metrics, scores, address) {
  const fingerprint = stableIndex(address, "leaderboard-fingerprint", 1000) / 1000;
  const raw =
    scores.degen * 0.44 +
    scores.diamond * 0.2 +
    scores.airdrop * 0.18 +
    Math.min(7, metrics.chainsWithActivity * 1.15) +
    Math.min(6, Math.log10(metrics.uniqueTokenCount + 1) * 2.4) +
    Math.min(5, Math.log10(metrics.txCount + 1) * 1.6) +
    Math.min(4, metrics.memeTokenCount * 0.18) +
    fingerprint;
  return Number(Math.max(0, Math.min(100, raw)).toFixed(2));
}

function choosePersonality(metrics, scores, address) {
  const picks = [];
  if (metrics.portfolioUsd > 100_000 && scores.degen > 68) {
    picks.push(PERSONALITIES.whaleCosplay, EXTRA_PERSONALITIES.treasuryNightMarket);
    addPersonalityPool(picks, "whale");
  }
  if (metrics.failedRate > 0.18) {
    picks.push(PERSONALITIES.gasArsonist, PERSONALITIES.contractButtonMasher, EXTRA_PERSONALITIES.stopLossMissingPerson, EXTRA_PERSONALITIES.contractExorcist);
    addPersonalityPool(picks, "failed");
  }
  if (metrics.methodCounts.swap > 8) {
    picks.push(PERSONALITIES.pressure, PERSONALITIES.contractButtonMasher, EXTRA_PERSONALITIES.mouseFingerAthlete, EXTRA_PERSONALITIES.leverageSleepwalker);
    addPersonalityPool(picks, "swapHeavy");
  }
  if (metrics.methodCounts.swap > 4 && scores.degen > 60) {
    picks.push(EXTRA_PERSONALITIES.fomoCardiacPatient, EXTRA_PERSONALITIES.chartPossessed, EXTRA_PERSONALITIES.notificationAddict);
    addPersonalityPool(picks, "swapDegen");
  }
  if (metrics.methodCounts.defi > 6) {
    picks.push(PERSONALITIES.yieldFarmGhost, EXTRA_PERSONALITIES.liquidityPoolLifeguard, EXTRA_PERSONALITIES.liquidityBlackHole);
    addPersonalityPool(picks, "defi");
  }
  if (scores.airdrop > 68 && metrics.chainsWithActivity >= 4) {
    picks.push(PERSONALITIES.airdrop, PERSONALITIES.bridgeNomad, PERSONALITIES.questNPC, EXTRA_PERSONALITIES.airdropReceiptCollector, EXTRA_PERSONALITIES.bridgeStampCollector, EXTRA_PERSONALITIES.protocolDoorKnocker, EXTRA_PERSONALITIES.multiChainVagrant);
    addPersonalityPool(picks, "airdrop");
  }
  if (metrics.nftTransferCount > metrics.sampledTxs && metrics.nftTransferCount > 8) {
    picks.push(PERSONALITIES.nftGhost, PERSONALITIES.jpgArchaeologist, EXTRA_PERSONALITIES.nftMemoryPalace, EXTRA_PERSONALITIES.jpgBagHistorian);
    addPersonalityPool(picks, "nft");
  }
  if (scores.diamond > 78 && metrics.txPerDay < 1.2) {
    picks.push(PERSONALITIES.diamond, PERSONALITIES.timeCapsuleHolder, PERSONALITIES.bagMonk, EXTRA_PERSONALITIES.bearMarketPretendDead, EXTRA_PERSONALITIES.exitButtonPhilosopher);
    addPersonalityPool(picks, "diamond");
  }
  if (metrics.stableRatio > 0.68 && scores.degen < 45) {
    picks.push(PERSONALITIES.stable, PERSONALITIES.stablecoinMonk, EXTRA_PERSONALITIES.stablecoinZenGarden, EXTRA_PERSONALITIES.usdtParkingLotGuard);
    addPersonalityPool(picks, "stable");
  }
  if (metrics.memeTokenCount >= 8 && scores.degen > 70) {
    picks.push(PERSONALITIES.memeSoldier, PERSONALITIES.dogcoinSurgeon, PERSONALITIES.liquidityDiver, EXTRA_PERSONALITIES.greenCandleAllergy, EXTRA_PERSONALITIES.bullMarketHallucination, EXTRA_PERSONALITIES.chainPsychWardVIP);
    addPersonalityPool(picks, "meme");
  }
  if (metrics.memeRatio > 0.45 && metrics.lowLiquidityTokenCount > 4) {
    picks.push(PERSONALITIES.topBuyer, PERSONALITIES.greenCandleRomantic, PERSONALITIES.exitLiquidityPoet, EXTRA_PERSONALITIES.liquidityExitVolunteer, EXTRA_PERSONALITIES.lateCycleRomantic, EXTRA_PERSONALITIES.dipBuyerOnRooftop);
    addPersonalityPool(picks, "memeLowLiquidity");
  }
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 4 && metrics.uniqueTokenCount > 12) {
    picks.push(PERSONALITIES.collector, PERSONALITIES.dustMuseum, EXTRA_PERSONALITIES.dustPositionBuddha, EXTRA_PERSONALITIES.approvalArchaeologist);
    addPersonalityPool(picks, "collector");
  }
  if (metrics.lowLiquidityTokenCount >= 8) {
    picks.push(EXTRA_PERSONALITIES.liquidityBlackHole, EXTRA_PERSONALITIES.mevSnack, EXTRA_PERSONALITIES.walletAutopsyIntern);
    addPersonalityPool(picks, "lowLiquidity");
  }
  if (metrics.bluechipTokenCount >= 2 && scores.degen < 55) {
    picks.push(PERSONALITIES.bluechipTourist, EXTRA_PERSONALITIES.smartMoneyCosplayer);
    addPersonalityPool(picks, "bluechip");
  }
  if (metrics.uniqueTokenCount > 24 && scores.degen < 65) {
    picks.push(PERSONALITIES.dustMuseum, EXTRA_PERSONALITIES.walletPersonalityCrisis);
    addPersonalityPool(picks, "widePortfolio");
  }
  if (scores.degen > 80) {
    picks.push(EXTRA_PERSONALITIES.degenMedicalRecord, EXTRA_PERSONALITIES.chainPsychWardVIP, EXTRA_PERSONALITIES.portfolioJengaPlayer);
    addPersonalityPool(picks, "extremeDegen");
  }
  if (scores.degen < 25) {
    picks.push(PERSONALITIES.civilServant, PERSONALITIES.coldWalletMonk, EXTRA_PERSONALITIES.usdtParkingLotGuard);
    addPersonalityPool(picks, "lowDegen");
  }
  if (scores.degen < 42) {
    picks.push(PERSONALITIES.conservative, PERSONALITIES.riskCommittee, EXTRA_PERSONALITIES.stablecoinZenGarden);
    addPersonalityPool(picks, "conservative");
  }
  if (!picks.length) {
    picks.push(PERSONALITIES.normal, PERSONALITIES.groupChatIndicator, PERSONALITIES.halfThesisBeliever, EXTRA_PERSONALITIES.thesisAfterBuy, EXTRA_PERSONALITIES.narrativeHostage, EXTRA_PERSONALITIES.kolShadowTrader, EXTRA_PERSONALITIES.reverseIndicatorOracle, EXTRA_PERSONALITIES.pnlFogMachine, EXTRA_PERSONALITIES.candleWorshipper);
    addPersonalityPool(picks, "fallback");
  }
  const uniquePicks = [...new Set(picks)];
  const safePicks = uniquePicks.filter(isShareSafePersonality);
  return pickByAddress(address, safePicks.length ? safePicks : uniquePicks);
}

function personalizedPersonalityName(baseName, address, lang) {
  const zhPrefix = ["夜盘", "复盘", "滑点", "冷启动", "阳线", "阴线", "Gas", "叙事", "风控", "空投", "链上", "回撤", "手续费", "流动性", "截图", "止损", "清算", "授权", "桥接", "Mint", "APR", "冷钱包", "热钱包", "监控器", "买入键", "卖出键", "观察席", "仓位", "本金", "群聊", "K线", "雷达", "剧场"];
  const zhSuffix = ["过敏", "失忆", "梦游", "考古", "补刀", "复盘", "漂移", "开香槟", "打坐", "失联", "热成像", "走火", "封印", "低功耗", "加班", "静音", "漏电", "折返", "离线", "巡航", "摆烂", "过载", "熬夜", "翻车", "续命", "冷冻", "抽样", "延迟", "自证", "打转", "上头"];
  const enPrefix = ["Night-Desk", "Postmortem", "Slippage", "Cold-Start", "Green-Candle", "Red-Candle", "Gas", "Narrative", "Risk-Control", "Airdrop", "Onchain", "Drawdown", "Fee", "Liquidity", "Screenshot", "Stop-Loss", "Liquidation", "Approval", "Bridge", "Mint", "APR", "Cold-Wallet", "Hot-Wallet", "Monitor", "Buy-Key", "Sell-Key", "Observer-Seat", "Waiting-Room", "Position", "Principal", "Groupchat", "Candle"];
  const enSuffix = ["Allergy", "Amnesia", "Sleepwalk", "Archaeology", "Roast", "Consultation", "Drift", "Champagne", "Meditation", "Missing", "Thermal Scan", "Waiting Room", "Misfire", "Sealed Mode", "Low Power", "Overtime", "Silent Mode", "Leakage", "U-Turn", "Offline", "Emergency", "Cruise", "Tilt", "Overload", "Insomnia", "Crash", "Life Support", "Cryosleep", "Sampling", "Auditory Glitch", "Latency", "Self-Proof"];
  const prefixIndex = stableIndex(address, "personality-variant-prefix", zhPrefix.length);
  const suffixIndex = stableIndex(address, "personality-variant-suffix", zhSuffix.length);
  const code = String(address || "0000").slice(-4).toUpperCase();
  if (lang === "en") return `${baseName} · ${enPrefix[prefixIndex]} ${enSuffix[suffixIndex]} #${code}`;
  return `${baseName} · ${zhPrefix[prefixIndex]}${zhSuffix[suffixIndex]}型 ${code}`;
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

function holdingSummary(metrics, address, lang, mode) {
  const fast = [
    {
      zh: "平均持仓像短视频完播率，刚开始热血，下一秒就想换叙事。",
      en: "The holding period looks like short-form attention span: excited on entry, hunting a new narrative seconds later."
    },
    {
      zh: "你的纸手不是纸，是湿纸巾，行情一吹就开始变形。",
      en: "These are not paper hands. They are wet wipes in a wind tunnel."
    },
    {
      zh: "买入之后的耐心疑似按分钟计费，超过一周就算长期主义。",
      en: "Patience appears billed by the minute; surviving a week counts as long-term thinking."
    }
  ];
  const medium = [
    {
      zh: "你能拿一阵，但新叙事敲门时，钱包会自动整理行李。",
      en: "You can hold for a while, but when a new narrative knocks the wallet starts packing."
    },
    {
      zh: "这不是钻石手，也不是纸手，更像看心情开关的半自动仓位。",
      en: "Not diamond hands, not paper hands; more like semi-automatic exposure with mood controls."
    },
    {
      zh: "你的持仓周期介于信仰和手痒之间，属于币圈常见亚健康。",
      en: "Your holding window sits between conviction and itchy fingers: common crypto sub-health."
    }
  ];
  const slow = [
    {
      zh: "你拿得住，但链上照妖镜暂时无法判断这是信仰、麻木，还是忘了密码。",
      en: "You can hold, though the mirror cannot tell whether this is conviction, numbness, or a forgotten password."
    },
    {
      zh: "你的钻石手指数像祖传物件，可能值钱，也可能只是没人舍得扔。",
      en: "Your diamond-hand score feels inherited: maybe valuable, maybe just never thrown away."
    },
    {
      zh: "你把时间拉长成护城河，也把退出按钮修成了摆设。",
      en: "You stretch time into a moat and quietly turn the exit button into decoration."
    }
  ];

  if (!Number.isFinite(metrics.sampledHoldDays)) {
    return pickStableLocalized(address, `holding-empty-${mode}`, lang, [
      {
        zh: "样本里还看不出稳定持仓周期，像刚打开图表还没决定先看哪根线。",
        en: "The sample does not reveal a stable holding period yet; the wallet has opened the chart but not chosen a candle to stare at."
      },
      {
        zh: "持仓周期数据还太薄，暂时只能判断：这个钱包刚开始在链上留下鞋印。",
        en: "Holding data is thin; for now, this wallet is just leaving fresh footprints onchain."
      }
    ]);
  }

  const bucket = metrics.sampledHoldDays < 7 ? fast : metrics.sampledHoldDays > 60 ? slow : medium;
  const prefix = pickLocalized(lang, `样本平均持仓约 ${metrics.sampledHoldDays.toFixed(1)} 天。`, `Average sampled holding period is about ${metrics.sampledHoldDays.toFixed(1)} days. `);
  return `${prefix}${pickStableLocalized(address, `holding-${mode}`, lang, bucket)}`;
}

function buildModeVerdict(mode, context) {
  const { address, lang, verdict, personality, scores, metrics } = context;
  const normal = verdict;
  const roast = pickStableLocalized(address, "verdict-roast", lang, [
    {
      zh: `你的钱包人格是「${personality}」，核心症状是每次市场刚热起来，就觉得自己被行情点名表扬。`,
      en: `Your Degen DNA is ${personality}; the core symptom is thinking every warm market is personally applauding you.`
    },
    {
      zh: `这个钱包最大的问题不是不懂，而是懂一点之后立刻开始相信自己是天选之子。`,
      en: "The problem is not ignorance. It is knowing a little and immediately feeling chosen by the market."
    },
    {
      zh: `链上数据显示：你的判断力偶尔在线，但热闹一来就容易掉线。`,
      en: "Onchain evidence suggests your judgment is sometimes online, until the loudest narrative logs in."
    }
  ]);
  const abstract = pickStableLocalized(address, "verdict-abstract", lang, [
    {
      zh: `钱包状态：阳线过敏，阴线失忆，止损功能疑似离家出走。Degen 指数 ${scores.degen}/100，建议先做链上冷静复盘。`,
      en: `Wallet status: allergic to green candles, amnesiac on red candles, stop-loss missing. Degen Index ${scores.degen}/100.`
    },
    {
      zh: `这不是财务报告，这是链上精神状态评估：行为稳定抽象，复发概率取决于群友截图。`,
      en: "This is not a financial report. It is an onchain state check: stable absurdity, relapse triggered by screenshots."
    },
    {
      zh: `你的钱包像一台情绪矿机，输入叙事，输出手续费，副产品是嘴硬。`,
      en: "Your wallet is an emotion miner: narrative goes in, fees come out, denial is the byproduct."
    }
  ]);
  const kol = pickStableLocalized(address, "verdict-kol", lang, [
    {
      zh: `这个钱包适合发成 KOL 人设：被叙事反复教育，但仍然保留冲锋姿势的链上幸存者。`,
      en: "This wallet can be packaged as a KOL persona: repeatedly educated by narratives, still posing like a survivor."
    },
    {
      zh: `如果把这个钱包包装成观点号，简介可以写：经历过周期，尊重过亏损，偶尔还相信下一根阳线。`,
      en: "If this wallet had a bio: survived cycles, respected drawdowns, occasionally believes in the next green candle."
    },
    {
      zh: `它看起来像普通散户，但发言气质已经接近“我早就说过”。`,
      en: "It looks retail, but the posting energy is already dangerously close to 'I called this early'."
    }
  ]);

  if (metrics.portfolioUsd > 100_000 && scores.degen > 70 && mode !== "normal") {
    return pickLocalized(lang, "你不是风险偏好高，你是带着金库在夜市里随机试吃，还觉得自己在做资产配置。", "You are not risk-on; you are sampling street food with a treasury wallet and calling it allocation.");
  }
  return { normal, roast, abstract, kol }[mode] || normal;
}

function buildModeLossCause(mode, context) {
  const { address, lang, lossCause, metrics, scores } = context;
  const bank = {
    normal: [
      {
        zh: lossCause,
        en: lossCause
      },
      {
        zh: `主要风险不是单次判断失误，而是每次情绪升温时，钱包都会替你先举手。`,
        en: "the main risk is not one bad call; the wallet raises its hand whenever emotion heats up"
      },
      {
        zh: `亏损黑匣子显示：你最容易在“我就小买一点”的地方留下大段链上记录。`,
        en: "the black box says your biggest traces often begin with 'just a tiny position'"
      },
      {
        zh: `问题不是没有观察，是观察结束和点击买入之间几乎没有冷却时间。`,
        en: "the issue is not lack of observation; it is the missing cooldown between watching and buying"
      },
      {
        zh: `你的亏损来源更像习惯，不像意外：看到机会、害怕错过、然后让钱包替你解释。`,
        en: "your leak looks more like habit than accident: see opportunity, fear missing out, let the wallet explain"
      }
    ],
    roast: [
      {
        zh: `不是市场太坏，是${lossCause}，而且你还经常给它找宏观理由。`,
        en: `not the market being evil, but that ${lossCause}, usually with a macro excuse attached`
      },
      {
        zh: `主要亏损来源：情绪上链速度快于大脑同步速度。`,
        en: "main leak: emotions reach the chain before the brain finishes syncing"
      },
      {
        zh: `亏损不是意外，是你把“再看看”翻译成了“再买点”。`,
        en: "losses are not accidents; you translate 'watching' into 'buying more'"
      },
      {
        zh: `主要亏损来源：把别人截图里的收益当成自己的开仓信号。`,
        en: "main leak: treating other people's gain screenshots as your own entry signal"
      },
      {
        zh: `亏损路径很清晰：先被叙事说服，再被价格教育。`,
        en: "loss path is clear: persuaded by narrative, educated by price"
      },
      {
        zh: `问题不是你没做功课，是你做完功课后还会被一张盈利截图重新格式化。`,
        en: "the issue is not lack of homework; a profit screenshot can still reformat the whole thesis"
      },
      {
        zh: `你亏损的方式很有仪式感：先说轻仓参与，再让轻仓开始长身体。`,
        en: "your leak has ritual: call it a small position, then let the small position grow limbs"
      },
      {
        zh: `市场只是提供舞台，真正冲上去表演的是你的确认按钮。`,
        en: "the market provides the stage; the confirm button does the performance"
      },
      {
        zh: `你的主要亏损来源，是把“错过”看得比“做错”更可怕。`,
        en: "your main leak is treating missing out as scarier than being wrong"
      }
    ],
    abstract: [
      {
        zh: `阳线过敏、阴线失忆、退出按钮灵魂出窍。`,
        en: "green-candle allergy, red-candle amnesia, exit button out-of-body experience"
      },
      {
        zh: `钱包精神状态不稳定，看到群友盈利截图后会自动进入战斗形态。`,
        en: "wallet mental state unstable; profit screenshots trigger combat mode"
      },
      {
        zh: `止损功能离家出走，补仓按钮成为临时监护人。`,
        en: "stop-loss left home; average-down button became temporary guardian"
      },
      {
        zh: `钱包疑似对回撤免疫，但对群友盈利截图高度过敏。`,
        en: "wallet appears immune to drawdown but highly allergic to profit screenshots"
      },
      {
        zh: `本金进入梦游状态，醒来时已完成三次授权。`,
        en: "principal enters sleepwalk mode and wakes after three approvals"
      },
      {
        zh: `亏损黑匣子冒烟：叙事进气口过大，风控排气孔疑似堵塞。`,
        en: "loss black box smoking: narrative intake too wide, risk-control exhaust possibly blocked"
      },
      {
        zh: `钱包进入链上观察室：核心表现是 FOMO，伴随滑点、嘴硬和轻度复盘冲动。`,
        en: "wallet enters the onchain observation room: main signal FOMO, with slippage, denial, and mild review urges"
      },
      {
        zh: `K 线敲门时，大脑说等一下，手指说已上链。`,
        en: "when candles knock, the brain says wait, the finger says already onchain"
      },
      {
        zh: `该钱包疑似对退出按钮识别困难：买入入口很熟，卖出出口像陌生人。`,
        en: "wallet appears to struggle recognizing exits: entry is familiar, exit looks like a stranger"
      }
    ],
    kol: [
      {
        zh: `你很适合写复盘，但更适合先停止把复盘素材继续做大。`,
        en: "you are great at writing post-mortems; even better if you stop producing more material"
      },
      {
        zh: `交易风格像内容创业：先制造冲突，再寻找解释。`,
        en: "trading style resembles content creation: create conflict first, explain later"
      },
      {
        zh: `你亏的不是钱，是每次转发热点时多出来的自信。`,
        en: "you are not losing money; you are losing the extra confidence generated by reposting narratives"
      },
      {
        zh: `你适合写交易纪律，前提是别把正文写成例外清单。`,
        en: "you can write trading discipline, as long as the body does not become a list of exceptions"
      },
      {
        zh: `这不是亏损黑匣子，这是内容素材仓库，只是成本有点高。`,
        en: "this is less a loss black box and more a content warehouse with expensive rent"
      },
      {
        zh: `这套亏损路径很适合写成长帖：标题叫纪律，正文叫例外，结尾叫成长。`,
        en: "this loss path makes a great thread: title discipline, body exceptions, ending growth"
      },
      {
        zh: `你最危险的时刻不是亏钱后，而是刚把亏钱解释得很合理之后。`,
        en: "your most dangerous moment is not after losing, but right after making the loss sound reasonable"
      },
      {
        zh: `如果这钱包开课，第一章是风险控制，第二章就开始解释为什么这次不用。`,
        en: "if this wallet taught a course, chapter one is risk control and chapter two explains why not this time"
      },
      {
        zh: `主要亏损主因可以包装成一句话：观点很硬，退出很软。`,
        en: "main leak packaged in one line: strong opinions, soft exits"
      }
    ]
  };

  const featureBank = [];
  const pushFeature = (condition, entries) => {
    if (condition) featureBank.push(...entries);
  };
  pushFeature(metrics.lowLiquidityTokenCount >= 4, [
    {
      zh: "流动性像地下室，你进去的时候很丝滑，出来的时候开始研究人生。",
      en: "liquidity behaves like a basement: easy to enter, philosophical to exit"
    },
    {
      zh: "买入时像走正门，卖出时像找通风管，滑点负责收门票。",
      en: "entry feels like a front door, exit like finding an air vent, with slippage selling tickets"
    },
    {
      zh: "你的亏损主因不是判断错，是总在浅池里练深潜。",
      en: "your leak is not just bad judgment; it is practicing deep diving in shallow pools"
    },
    {
      zh: "低流动性没有骗你，它只是用很小的门欢迎你进来。",
      en: "illiquidity did not lie; it welcomed you through a very small door"
    }
  ]);
  pushFeature(metrics.memeTokenCount >= 4 || metrics.memeRatio > 0.18, [
    {
      zh: "Meme 一发热，你的钱包就像自动打开了冲锋入口。",
      en: "when memes heat up, your wallet automatically opens the charge gate"
    },
    {
      zh: "你的亏损主因，是把每个新 ticker 都当成命运给的暗号。",
      en: "your main leak is treating every new ticker as a secret message from destiny"
    },
    {
      zh: "市场给的是笑话，你有时会用本金认真接梗。",
      en: "the market offers a joke, and sometimes you answer it with principal"
    },
    {
      zh: "土狗不是问题，问题是你每次都觉得这只比较像狼。",
      en: "dogcoins are not the whole problem; the problem is thinking this one looks like a wolf"
    }
  ]);
  pushFeature(metrics.txPerDay > 1.8 || metrics.methodCounts.swap > 5, [
    {
      zh: "交易频率像心率监测，市场一动，你的钱包先心动。",
      en: "trade frequency looks like a heart monitor; the wallet reacts before the market finishes moving"
    },
    {
      zh: "手续费和情绪一起上班，你负责给它们发工资。",
      en: "fees and emotions clock in together, and you pay both salaries"
    },
    {
      zh: "你的手速不是优势，是一个没有冷却时间的技能。",
      en: "your hand speed is not an edge; it is a skill with no cooldown"
    },
    {
      zh: "亏损主因：鼠标比交易计划更像主理人。",
      en: "main leak: the mouse behaves more like the founder than the trading plan"
    }
  ]);
  pushFeature(metrics.failedRate > 0.08, [
    {
      zh: "失败交易已经在替你喊停，但你把它当成网络不好。",
      en: "failed transactions are trying to stop you, but you call it network issues"
    },
    {
      zh: "Gas 被烧成烟花，钱包还以为这是交互仪式感。",
      en: "gas burns like fireworks while the wallet calls it interaction ritual"
    },
    {
      zh: "你的合约交互像闯红灯，失败回执像罚单。",
      en: "your contract interactions look like red-light running, with failed receipts as tickets"
    }
  ]);
  pushFeature(metrics.stableRatio > 0.6 && scores.degen < 55, [
    {
      zh: "你不是亏损，你是把牛市坐成了旁听课。",
      en: "you are not losing; you audited the bull market from the back row"
    },
    {
      zh: "稳定币保护了本金，也顺手保护了你错过热点的能力。",
      en: "stablecoins protected principal and also protected your ability to miss narratives"
    },
    {
      zh: "你的风险不是冲太快，是等回调等到回调也下班。",
      en: "your risk is not rushing; it is waiting for a pullback until even the pullback clocks out"
    }
  ]);
  pushFeature(metrics.outgoingTransfers < metrics.incomingTransfers / 5, [
    {
      zh: "只进不出不是投资风格，更像钱包给退出按钮放了年假。",
      en: "entry-only is not an investment style; the wallet put the exit button on annual leave"
    },
    {
      zh: "你会进货，但体面下车这门课还在缓考。",
      en: "you know how to enter; graceful exits are still pending an exam"
    },
    {
      zh: "仓位像收藏品一样进柜，问题是市场不按博物馆估值。",
      en: "positions enter the cabinet like collectibles; the market does not price them like museum pieces"
    }
  ]);
  pushFeature(scores.diamond > 68, [
    {
      zh: "有些仓位不是信仰，是退出按钮被你修成了摆设。",
      en: "some positions are not conviction; the exit button became decoration"
    },
    {
      zh: "你拿得住，但亏损黑匣子暂时无法判断这是定力还是忘了卖。",
      en: "you can hold, though the black box cannot tell whether it is discipline or a forgotten exit"
    },
    {
      zh: "钻石手保护了故事，也偶尔保护了回撤。",
      en: "diamond hands preserve the story, and sometimes the drawdown too"
    }
  ]);
  pushFeature(scores.airdrop > 62 || metrics.methodCounts.claim > 1 || metrics.methodCounts.bridge > 2, [
    {
      zh: "你不是在交互，你像在给每个协议递简历，期待某天发工资。",
      en: "you are not merely interacting; you are handing resumes to protocols and hoping for payroll"
    },
    {
      zh: "跨链和任务做得很勤快，问题是勤快本身有时候也会收费。",
      en: "cross-chain quests are diligent, but diligence itself sometimes charges fees"
    },
    {
      zh: "空投雷达很忙，本金偶尔像给任务系统交押金。",
      en: "the airdrop radar is busy; principal sometimes feels like a deposit for quest systems"
    }
  ]);
  pushFeature(metrics.nftTransferCount > 4, [
    {
      zh: "NFT 旧梦还在钱包里回声，地板价负责提醒你青春的成本。",
      en: "old NFT dreams still echo in the wallet, with floor prices reminding you of youth's cost"
    },
    {
      zh: "你亏损的地方不一定是币，也可能是某个头像时代的余震。",
      en: "the leak may not be tokens; it may be aftershocks from an avatar era"
    },
    {
      zh: "JPEG 不是原罪，问题是你有时会把社区氛围当成退出流动性。",
      en: "JPEGs are not the sin; the issue is mistaking community vibes for exit liquidity"
    }
  ]);

  const candidates = [...(bank[mode] || bank.roast), ...featureBank];
  return pickStableLocalized(address, `loss-cause-${mode}`, lang, candidates);
}

function buildModeAssetPersonality(mode, context) {
  const { address, lang, metrics, personality } = context;
  const statsZh = `公开样本：${metrics.chainsWithActivity}/${metrics.chainCount} 条链有活动，Token 样本 ${metrics.uniqueTokenCount} 个，稳定币约 ${Math.round(metrics.stableRatio * 100)}%，Meme 暴露约 ${Math.round(metrics.memeRatio * 100)}%。`;
  const statsEn = `Public sample: activity on ${metrics.chainsWithActivity}/${metrics.chainCount} chains, ${metrics.uniqueTokenCount} token samples, about ${Math.round(metrics.stableRatio * 100)}% stablecoin exposure and ${Math.round(metrics.memeRatio * 100)}% meme exposure.`;
  const prefix = pickLocalized(lang, statsZh, statsEn);
  const modeLine = {
    normal: pickLocalized(lang, `这个钱包像${personality}。`, `This wallet reads like a ${personality}.`),
    roast: pickStableLocalized(address, "asset-roast", lang, [
      {
        zh: `这个钱包不是资产组合，是情绪、叙事和手速共同签字的事故现场。`,
        en: "This is not a portfolio; it is an incident report co-signed by emotion, narrative, and hand speed."
      },
      {
        zh: `资产分布看起来像群聊投票结果，哪里热闹哪里就出现一点仓位。`,
        en: "The allocation looks like a group-chat poll: wherever attention goes, exposure follows."
      },
      {
        zh: `它不像钱包，更像一个把热点全都试吃一口的链上自助餐盘。`,
        en: "This wallet feels less like capital allocation and more like an onchain buffet plate."
      },
      {
        zh: `资产结构像一张情绪热力图：哪里发烫，哪里就多一点仓位。`,
        en: "The allocation behaves like an emotion heatmap: exposure appears wherever attention burns."
      },
      {
        zh: `这个钱包把分散投资理解成了“每个叙事都给一点面子”。`,
        en: "This wallet interpreted diversification as giving every narrative a little respect."
      },
      {
        zh: `它看起来在管理资产，实际像在管理一群临时起意。`,
        en: "It looks like asset management, but behaves like managing a committee of impulses."
      }
    ]),
    abstract: pickStableLocalized(address, "asset-abstract", lang, [
      {
        zh: `资产性格：K 线附体，叙事中毒，仓位偶尔出现短暂清醒。`,
        en: "Asset personality: chart-possessed, narrative-intoxicated, occasionally visited by short bursts of clarity."
      },
      {
        zh: `钱包像一次链上照镜子，上一句是“我再也不追高了”，下一笔是“又追了”。`,
        en: "The wallet reads like an onchain mirror: one line says 'never chasing again', the next transaction chases again."
      },
      {
        zh: `资产组合呈现出一种抽象的自洽：哪里能讲故事，哪里就能住一点本金。`,
        en: "The allocation has abstract coherence: wherever a story can live, some capital can rent a room."
      },
      {
        zh: `钱包气质：本金在上班，情绪在夜店，风控在门口排队。`,
        en: "Wallet aura: principal is at work, emotions are at the club, risk control is waiting outside."
      },
      {
        zh: `这份组合像一张链上情绪热力图，波形主要由群聊和阳线共同驱动。`,
        en: "This portfolio reads like an onchain emotion heatmap, driven mostly by group chats and green candles."
      },
      {
        zh: `资产性格疑似多线程运行：一边想保命，一边想封神。`,
        en: "Asset personality appears multithreaded: one thread wants survival, another wants legend status."
      }
    ]),
    kol: pickStableLocalized(address, "asset-kol", lang, [
      {
        zh: `如果这个钱包当 KOL，会主打“我不是喊单，我只是把亏损写成叙事”。`,
        en: "If this wallet were a KOL, its tagline would be: not calls, just drawdowns converted into narrative."
      },
      {
        zh: `它的人设适合做成置顶帖：经历过很多，卖点不一定多，但故事一定够长。`,
        en: "Its persona fits a pinned post: many experiences, not necessarily many exits, definitely a long story."
      },
      {
        zh: `这是一个能把仓位讲成观点、把回撤讲成格局的钱包。`,
        en: "This wallet can turn positions into opinions and drawdowns into philosophy."
      },
      {
        zh: `它适合发长帖：前半段讲纪律，后半段解释为什么这次例外。`,
        en: "It fits a long thread: first half about discipline, second half explaining why this time was different."
      },
      {
        zh: `如果这个钱包开 Spaces，标题会是“从链上行为看散户精神韧性”。`,
        en: "If this wallet hosted a Space, the title would be about retail psychological resilience onchain."
      },
      {
        zh: `它最适合的人设不是聪明钱，是“被市场教育后仍会写小作文”。`,
        en: "Its best persona is not smart money; it is someone educated by markets who still writes essays."
      }
    ])
  };
  return `${modeLine[mode] || modeLine.normal}${pickLocalized(lang, " ", " ")}${prefix}`;
}

function buildModeAlphaRadar(mode, context) {
  const { address, lang, metrics } = context;
  const base = buildAlphaRadar(metrics, lang);
  const extras = {
    normal: [
      {
        zh: "至少链上留下了可分析的行为样本，比只在群里嘴硬强。",
        en: "At least there is analyzable onchain behavior, which beats pure chat-room confidence."
      },
      {
        zh: "这个钱包还有升级空间，前提是别把每次上头都叫实验。",
        en: "The wallet has upgrade potential, assuming every impulse is not renamed as an experiment."
      },
      {
        zh: "它至少愿意上链留下证据，这比只在群里复盘空气强。",
        en: "It at least leaves evidence onchain, which beats reviewing imaginary trades in chat."
      },
      {
        zh: "行为样本够用，说明这个钱包还有被调教成策略的可能。",
        en: "The behavior sample is usable, so the wallet may still be trained into a strategy."
      }
    ],
    roast: [
      {
        zh: "优点是行动力强；缺点是行动力经常绕过风控。",
        en: "Strength: decisive action. Weakness: decisive action often bypasses risk control."
      },
      {
        zh: "你的链上探索能力不错，只是有时像拿本金当门票。",
        en: "Exploration ability is real; sometimes the principal is simply treated as an admission ticket."
      },
      {
        zh: "你确实能发现热点，只是发现之后通常需要一个成年人在旁边按住鼠标。",
        en: "You can spot attention; you may still need adult supervision near the mouse."
      },
      {
        zh: "你的行动力不是问题，问题是行动力经常提前下班不等风控。",
        en: "Action is not the issue; the issue is action clocking in before risk control."
      },
      {
        zh: "这个钱包有嗅觉，只是偶尔会把火药味闻成饭香。",
        en: "This wallet has smell; it just sometimes mistakes gunpowder for dinner."
      }
    ],
    abstract: [
      {
        zh: "Alpha 雷达仍在工作，只是偶尔会把警报声听成冲锋号。",
        en: "The alpha radar works; it just occasionally mistakes alarms for battle horns."
      },
      {
        zh: "这个钱包具备链上嗅觉，但鼻炎发作时会把土狗闻成龙。",
        en: "This wallet has onchain smell, but during allergy season every dogcoin smells like a dragon."
      },
      {
        zh: "精神状态不算稳定，但至少不是完全离线，属于可抢救型 Degen。",
        en: "Mental state unstable, but not offline; this is a recoverable degen."
      },
      {
        zh: "Alpha 雷达没有坏，它只是经常把杂音识别成天启。",
        en: "The alpha radar is not broken; it just often classifies noise as revelation."
      },
      {
        zh: "你的链上第六感还在，只是需要先从群聊震动里分离出来。",
        en: "Your onchain sixth sense exists; it needs separating from group-chat vibrations."
      }
    ],
    kol: [
      {
        zh: "可包装亮点：跨链/交互/持仓痕迹足够写成一条“我的交易框架”。",
        en: "Packagable angle: enough cross-chain, interaction, or holding traces to become a 'my framework' post."
      },
      {
        zh: "适合做内容标题：我从这个钱包里看到了散户的三种幻觉。",
        en: "Content angle: three retail illusions visible inside one wallet."
      },
      {
        zh: "如果做公开榜，这个钱包不是最强，但很适合被评论区研究。",
        en: "For a public leaderboard, this wallet may not be the strongest, but it is comment-section material."
      },
      {
        zh: "内容角度：这个钱包证明了亏损也可以被包装成方法论。",
        en: "Content angle: this wallet proves drawdown can be packaged as methodology."
      },
      {
        zh: "可包装亮点：链上行为足够复杂，适合做成“我的进化路线”。",
        en: "Packagable angle: onchain behavior is complex enough to become 'my evolution path'."
      }
    ]
  };
  return [...base, pickStableLocalized(address, `alpha-${mode}-a`, lang, extras[mode] || extras.normal), pickStableLocalized(address, `alpha-${mode}-b`, lang, extras[mode] || extras.normal)]
    .filter((item, index, arr) => arr.indexOf(item) === index)
    .slice(0, 5);
}

function buildModeFate(metrics, scores, address, lang, mode) {
  const base = buildFate(metrics, scores, lang);
  const extra = {
    normal: [
      {
        zh: "某天开始认真整理交易纪律，然后在下一条热点出现时暂停整理。",
        en: "start organizing trading discipline, then pause the effort when the next narrative appears"
      },
      {
        zh: "把一个观察清单整理得很漂亮，然后只买了最不该买的那个",
        en: "make a beautiful watchlist, then buy the one item that should have stayed watched"
      },
      {
        zh: "在稳定和冲动之间反复横跳，最后给自己起名叫动态仓位管理",
        en: "bounce between caution and impulse, then rename it dynamic position management"
      }
    ],
    roast: [
      {
        zh: "看到别人晒收益后，立刻把“谨慎观察”改名为“轻仓参与”。",
        en: "after seeing someone post gains, rename 'careful observation' into 'small exploratory position'"
      },
      {
        zh: "在某个群里说“我就看看”，五分钟后链上出现新交易。",
        en: "say 'just watching' in a chat, then produce a new transaction five minutes later"
      },
      {
        zh: "把止损线画得很专业，然后在触发时改成长期主义",
        en: "draw a professional stop-loss line, then rename it long-term conviction when triggered"
      },
      {
        zh: "再次证明自己不是冲动，只是执行力过于主动",
        en: "prove again that it is not impulse, just excessively proactive execution"
      }
    ],
    abstract: [
      {
        zh: "链上状态评估新增一页：阳线过敏复发，止损按钮继续失联。",
        en: "the onchain state check gains a new page: green-candle allergy relapsed, stop-loss still missing"
      },
      {
        zh: "钱包进入薛定谔盈利状态：不打开组合就永远没亏。",
        en: "wallet enters Schroedinger PnL: as long as the portfolio stays closed, the loss is not real"
      },
      {
        zh: "K 线开始敲门，风控装作不在家",
        en: "candles knock on the door while risk control pretends nobody is home"
      },
      {
        zh: "情绪矿机继续运转，产出手续费、嘴硬和新的截图素材",
        en: "the emotion miner keeps producing fees, denial, and new screenshot material"
      }
    ],
    kol: [
      {
        zh: "把一次回撤写成“我对市场结构的再理解”，并获得三条安慰评论。",
        en: "turn a drawdown into 'my renewed understanding of market structure' and receive three comforting replies"
      },
      {
        zh: "开始考虑做公开复盘帖，标题里带“血泪”。",
        en: "consider publishing a public review post with 'painful lessons' in the title"
      },
      {
        zh: "把一次没卖写成“我尊重周期”，评论区表示懂你",
        en: "turn one missed exit into 'respecting the cycle', and receive understanding replies"
      },
      {
        zh: "发一条“这轮我学到了”，然后下一条开始研究新叙事",
        en: "post 'I learned a lot this cycle', then immediately research a new narrative"
      }
    ]
  };
  return [...base, pickStableLocalized(address, `fate-${mode}`, lang, extra[mode] || extra.normal)].slice(0, 4);
}

function buildModeStrategy(mode, context) {
  const { address, lang, metrics, scores } = context;
  const base = buildStrategyFit(metrics, scores, lang);
  const diagnosis = {
    normal: pickLocalized(lang, `${base}。`, `${base}.`),
    roast: pickStableLocalized(address, "strategy-roast", lang, [
      {
        zh: `${base}，但请先确认自己不是把“二次确认”理解成“第二次追高”。`,
        en: `${base}, but confirm that 'second confirmation' does not mean 'second chase'.`
      },
      {
        zh: `${base}。当前最大风控建议：让手指晚于脑子 10 秒钟上线。`,
        en: `${base}. Main risk control: let the finger log in ten seconds after the brain.`
      },
      {
        zh: `${base}。策略不是没有，主要是别让群友截图成为入场信号。`,
        en: `${base}. The strategy exists; just avoid using chat screenshots as entry signals.`
      },
      {
        zh: `${base}。执行前请先问一句：这是信号，还是我又不想错过？`,
        en: `${base}. Before execution, ask: is this a signal, or just fear of missing out?`
      },
      {
        zh: `${base}。最大优化项不是指标，是把“手痒”从策略参数里删除。`,
        en: `${base}. The biggest optimization is removing itchy fingers from the parameter set.`
      }
    ]),
    abstract: pickStableLocalized(address, "strategy-abstract", lang, [
      {
        zh: `高波动自毁型 + 事件雷达镇静剂。建议先给钱包降噪，再谈 Alpha。`,
        en: "High-volatility self-sabotage + event-radar sedative. Reduce wallet noise before discussing alpha."
      },
      {
        zh: `阳线脱敏训练 + 低频装死术。先治疗手速，再优化收益曲线。`,
        en: "Green-candle desensitization + low-frequency possum mode. Treat hand speed before optimizing returns."
      },
      {
        zh: `链上照妖镜建议：趋势跟随可以，叙事上头时需要 Hermes 做第二确认。`,
        en: "Degen DNA suggests: trend following is fine; Hermes should provide second confirmation during narrative heat."
      },
      {
        zh: `交易系统建议：先把钱包从群聊震动里隔离，再让 Hermes 接管二次确认。`,
        en: "System advice: isolate the wallet from group-chat vibrations, then let Hermes handle second confirmation."
      },
      {
        zh: `适配方案：事件雷达 + 冷却时间 + 截图触发禁买期。`,
        en: "Suggested stack: event radar + cooldown timer + screenshot-triggered no-buy window."
      }
    ]),
    kol: pickStableLocalized(address, "strategy-kol", lang, [
      {
        zh: `适合包装成“事件驱动型交易者”，实际执行时请把“看到别人赚钱”从信号源里删掉。`,
        en: "Can be packaged as event-driven trading; remove 'seeing others profit' from the signal source."
      },
      {
        zh: `适合做低频波段 + 公开复盘路线。每次动手前先问：这笔交易能不能经得住截图？`,
        en: "Fits low-frequency swing plus public review. Before every trade, ask: would this survive a screenshot?"
      },
      {
        zh: `适合用 Hermes 事件雷达做二次确认，把冲动留给文案，把本金留给下一轮。`,
        en: "Use Hermes event radar as second confirmation: let the copy be impulsive, keep the capital for the next cycle."
      },
      {
        zh: `适合把交易框架公开化：能截图的规则留下，不能截图的冲动删掉。`,
        en: "Fits a public framework: keep rules that survive screenshots, delete impulses that do not."
      },
      {
        zh: `适合做“低频但有梗”的路线，少动手，多让报告帮你制造内容。`,
        en: "Fits a low-frequency but content-friendly route: click less, let the report create more material."
      }
    ])
  };
  return diagnosis[mode] || diagnosis.normal;
}

function compactTweetLine(text, limit) {
  const clean = trimSentenceEnd(String(text || "").replace(/\s+/g, " ").trim());
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 3))}...`;
}

function tweetOpener(mode, lang) {
  const openers = {
    normal: ["我刚被链上主治医生做了链上诊断。", "My wallet just got diagnosed by the onchain attending."],
    roast: ["我刚被链上主治医生公开做了链上诊断。", "My wallet just got a public diagnosis from the onchain attending."],
    abstract: ["我刚被链上主治医生用链上听诊器诊断了。", "My wallet just got diagnosed with the Onchain Stethoscope."],
    kol: ["链上主治医生刚给这个钱包做了链上诊断。", "The onchain attending just diagnosed this wallet's public persona."]
  };
  const [zh, en] = openers[mode] || openers.abstract;
  return pickLocalized(lang, zh, en);
}

function buildTweetText(mode, context) {
  const { lang, personality, scores, verdict, rarity, badges = [] } = context;
  const badgeLine = badges.slice(0, 2).map((badge) => badge.name).join(" / ");
  const rarityName = rarity?.tierName || pickLocalized(lang, "链上异类", "Rare");
  const comboRate = rarity?.combo?.appearanceRate || "--";
  if (lang === "en") {
    return `${tweetOpener(mode, lang)}
Type: ${personality}
Rarity: ${rarityName} · ${comboRate}% combo
Badge: ${badgeLine || "Unclassified"}
Degen: ${scores.degen}/100

${compactTweetLine(verdict, 68)}

degendna.fun`;
  }
  return `${tweetOpener(mode, lang)}
人格：${personality}
稀有度：${rarityName} · ${comboRate}%组合
徽章：${badgeLine || "未收录"}
Degen：${scores.degen}/100

${compactTweetLine(verdict, 48)}

degendna.fun`;
}

function trimSentenceEnd(text) {
  return String(text || "").replace(/[。.!！?？]+$/u, "");
}

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "unique"];

function rarityTier(rate) {
  if (rate <= 0.08) return "unique";
  if (rate <= 0.8) return "mythic";
  if (rate <= 2.4) return "legendary";
  if (rate <= 5.5) return "epic";
  if (rate <= 12) return "rare";
  if (rate <= 28) return "uncommon";
  return "common";
}

function rarityTierName(tier, lang) {
  const names = {
    common: ["普通韭菜", "Common"],
    uncommon: ["小有抽象", "Uncommon"],
    rare: ["链上异类", "Rare"],
    epic: ["重度 Degen", "Epic"],
    legendary: ["币圈怪物", "Legendary"],
    mythic: ["精神状态存疑", "Mythic"],
    unique: ["1/1 链上异常体", "1/1 Onchain Anomaly"]
  };
  const [zh, en] = names[tier] || names.common;
  return pickLocalized(lang, zh, en);
}

function rarityColor(tier) {
  return {
    common: "#d8d3ca",
    uncommon: "#7dff9f",
    rare: "#64b5ff",
    epic: "#c27bff",
    legendary: "#ffd166",
    mythic: "#ff5b35",
    unique: "#f7f1e8"
  }[tier] || "#d8d3ca";
}

function rateFromScore(score, floor = 0.05) {
  const normalized = Math.max(0, Math.min(99.95, score)) / 100;
  const rate = floor + 42 * Math.pow(1 - normalized, 2.15);
  return Number(Math.max(floor, Math.min(65, rate)).toFixed(rate < 1 ? 2 : 1));
}

function mysticTrait(address, salt, lang, zhValues, enValues) {
  const labelsZh = {
    moon: "链上月相",
    pulse: "钱包脉象",
    candle: "K线卦象",
    room: "候诊室",
    fate: "命运向量"
  };
  const labelsEn = {
    moon: "Chain Moon Phase",
    pulse: "Onchain Pulse",
    candle: "Candle Omen",
    room: "Clinic Room",
    fate: "Fate Vector"
  };
  const index = stableIndex(address, `mystic-${salt}`, zhValues.length);
  return {
    id: salt,
    label: pickLocalized(lang, labelsZh[salt] || salt, labelsEn[salt] || salt),
    value: pickLocalized(lang, zhValues[index], enValues[index])
  };
}

function buildMysticTraits(address, lang) {
  return [
    mysticTrait(address, "moon", lang, ["新月挂单", "半月观望", "满月上头", "血月回撤", "虚空月相"], ["New Moon Bid", "Half Moon Wait", "Full Moon FOMO", "Blood Moon Drawdown", "Void Moon"]),
    mysticTrait(address, "pulse", lang, ["平稳脉", "过载脉", "间歇性发疯", "FOMO 尖峰", "钻石慢拍"], ["Calm", "Overclocked", "Irregular", "FOMO Spike", "Diamond Slowbeat"]),
    mysticTrait(address, "candle", lang, ["阳线海市蜃楼", "阴线迷雾", "横盘经文", "突破发热", "插针预言"], ["Green Mirage", "Red Fog", "Sideways Sutra", "Breakout Fever", "Wick Prophecy"]),
    mysticTrait(address, "room", lang, ["404 号诊室", "777 号诊室", "1314 号诊室", "8888 号急诊", "0x 号观察室"], ["Room 404", "Room 777", "Room 1314", "Room 8888", "Room 0x"]),
    mysticTrait(address, "fate", lang, ["均值回归", "叙事漂移", "周期回声", "流动性阴影", "命运滑点"], ["Mean Reversion", "Narrative Drift", "Cycle Echo", "Liquidity Shadow", "Fate Slippage"])
  ];
}

function rarityFromRate(rate, lang) {
  const tier = rarityTier(rate);
  return {
    tier,
    tierName: rarityTierName(tier, lang),
    color: rarityColor(tier),
    appearanceRate: rate,
    percentile: Number(Math.max(0, 100 - rate).toFixed(1))
  };
}

function makeBadge(id, lang, zh, en, descriptionZh, descriptionEn, rate) {
  const base = rarityFromRate(rate, lang);
  return {
    id,
    name: pickLocalized(lang, zh, en),
    description: pickLocalized(lang, descriptionZh, descriptionEn),
    ...base
  };
}

function buildBadges(metrics, scores, address, lang, seasonSampleSize) {
  const badges = [];
  const add = (id, zh, en, descriptionZh, descriptionEn, rate) => {
    if (badges.some((badge) => badge.id === id)) return;
    const jitter = stableIndex(address, `badge-${id}`, 80) / 100;
    badges.push(makeBadge(id, lang, zh, en, descriptionZh, descriptionEn, Math.max(0.05, Number((rate + jitter).toFixed(2)))));
  };

  if (Number.isFinite(metrics.sampledHoldDays) && metrics.sampledHoldDays < 8) {
    add("paper-king", "纸手之王", "Paper Hands Royalty", "平均持仓很短，叙事还没讲完，仓位已经换台。", "Holding windows are short; the narrative is still talking while the position has left.", 8.4);
  }
  if (scores.diamond > 76 || (Number.isFinite(metrics.sampledHoldDays) && metrics.sampledHoldDays > 120)) {
    add("diamond-elder", "钻石手老登", "Ancient Diamond Hands", "有些资产拿得很久，可能是信仰，也可能是忘了卖。", "Some assets stayed for a long time: conviction, or a forgotten exit.", 6.7);
  }
  if (scores.degen > 66 && metrics.methodCounts.swap > 4) {
    add("green-candle-chaser", "阳线追击者", "Green Candle Chaser", "行情一热，钱包就开始相信自己被市场点名。", "When candles turn green, the wallet assumes the market called its name.", 5.8);
  }
  if (scores.diamond > 64 && scores.degen > 55) {
    add("red-candle-amnesia", "阴线失忆症", "Red Candle Amnesia", "下跌后记忆自动清空，只剩一句“我长期看好”。", "After a drop, memory clears itself and only 'long-term bullish' remains.", 7.2);
  }
  if (metrics.lowLiquidityTokenCount >= 5) {
    add("microcap-sampler", "土狗采样员", "Microcap Sampler", "低流动性代币采样明显，像在链上逛夜市。", "Low-liquidity token sampling is obvious; the wallet shops at the onchain night market.", 4.1);
  }
  if (scores.airdrop > 64 && metrics.chainsWithActivity >= 4) {
    add("airdrop-migratory", "空投候鸟", "Airdrop Migratory Bird", "多链、多协议、多任务痕迹明显，像给协议挨个敲门。", "Multi-chain, multi-protocol, multi-quest traces. It knocks on every protocol door.", 7.8);
  }
  if (metrics.stableRatio > 0.55 && metrics.txPerDay < 1.3) {
    add("stable-zen", "稳定币禅师", "Stablecoin Zen Master", "仓位像在打坐，市场再吵也先躺平。", "The allocation meditates; the market screams and the wallet stays horizontal.", 9.5);
  }
  if (metrics.sampleWindowDays > 720) {
    add("cycle-survivor", "牛熊穿越者", "Cycle Survivor", "钱包年龄跨过多个市场阶段，至少见过几次叙事换皮。", "The wallet crossed multiple market phases and saw narratives change costumes.", 4.6);
  }
  if (metrics.sampleWindowDays > 1460) {
    add("ancient-address", "远古地址", "Ancient Address", "这个地址的链上年龄已经有点考古价值。", "This wallet age has archaeological value.", 1.9);
  }
  if (metrics.txPerDay > 2.4) {
    add("faster-than-brain", "手速比脑子快", "Fingers Faster Than Brain", "交易频率说明：手指上线速度经常领先风控系统。", "Trading frequency suggests the fingers log in before risk control.", 8.4);
  }
  if (metrics.failedRate > 0.12) {
    add("stoploss-missing", "止损按钮失踪", "Stop-Loss Button Missing", "失败交易和高压交互痕迹明显，止损按钮疑似离家出走。", "Failed transactions and pressure traces suggest the stop-loss button left home.", 6.9);
  }
  if (scores.degen > 78 || metrics.memeRatio > 0.28) {
    add("narrative-intoxicated", "看见叙事就上头", "Narrative Intoxication", "叙事浓度一上来，钱包就开始自动脑补下一根阳线。", "Once narrative density rises, the wallet hallucinates the next green candle.", 5.2);
  }
  if (scores.degen > 72 && scores.diamond < 45) {
    add("mental-questionable", "钱包活着，精神可疑", "Wallet Alive, Sanity Questionable", "钱包还在动，但精神状态需要链上复查。", "The wallet is alive, but its mental state needs onchain follow-up.", 2.7);
  }
  if (metrics.methodCounts.bridge > 2) {
    add("crosschain-hitchhiker", "跨链搭车客", "Crosschain Hitchhiker", "这只钱包对新链的态度很松弛，桥开到哪就坐到哪。", "This wallet is relaxed around new chains: if the bridge opens, it boards.", 7.4);
  }
  if (metrics.methodCounts.claim > 1) {
    add("quest-ritualist", "任务仪式执行员", "Quest Ritualist", "领取、签到、交互都有痕迹，像在给空投做早课。", "Claims, check-ins, and interactions appear like morning rituals for airdrops.", 8.1);
  }
  if (metrics.txCount > 500) {
    add("blockspace-tenant", "区块空间长租户", "Blockspace Long-Term Tenant", "交易次数已经不是路过，是在区块空间里交过房租。", "The transaction count is not a visit; it has paid rent in blockspace.", 5.9);
  }
  if (metrics.uniqueTokenCount > 30) {
    add("token-hydra", "Token 九头蛇", "Token Hydra", "仓位种类砍掉一个又长出两个，像叙事驱动的九头蛇。", "Cut one position and two more narratives appear; a token hydra.", 6.3);
  }
  if (metrics.stableRatio < 0.1 && scores.degen > 65) {
    add("no-seatbelt", "没系安全带", "No Seatbelt", "稳定币安全带几乎没系，行情一急刹就很有节目效果。", "The stablecoin seatbelt is barely fastened; sudden market brakes get dramatic.", 7.6);
  }
  if (metrics.portfolioUsd < 50 && metrics.txCount > 80) {
    add("small-balance-big-drama", "小本金大戏台", "Small Balance, Big Stage", "本金不大，链上戏剧张力很足，适合截图研究。", "The principal is small, but the onchain drama has excellent screenshot energy.", 9.2);
  }
  if (seasonSampleSize < 1000) {
    add("genesis-tester", "第一批照妖者", "Genesis Tester", "Season 0 早期照妖记录，适合以后拿出来嘴硬。", "An early Season 0 scan, useful for future bragging rights.", 2.2);
  }

  const fillers = [
    ["market-educated", "被市场教育过，但没完全服", "Educated, Not Convinced", "市场讲过课，但钱包还在补考。", "The market gave lessons; the wallet is still retaking the exam.", 13.5],
    ["wallet-autopsy", "链上照镜子样本", "Onchain Mirror Sample", "这个钱包不一定离谱，但很适合截图锐评。", "The wallet is not always absurd, but it is excellent screenshot material.", 10.8],
    ["exit-button-tourist", "退出按钮游客", "Exit Button Tourist", "知道哪里是出口，但经常只是路过。", "It knows where the exit is, but often just walks past.", 11.6],
    ["groupchat-echo", "群友回声定位", "Groupchat Echolocation", "交易信号和群聊情绪之间存在神秘同步。", "Trading signals and group-chat mood show suspicious synchronization.", 9.9],
    ["candle-stare-contest", "K 线对视冠军", "Candle Stare Champion", "看盘时间很足，眼神比策略更稳定。", "Chart-watching time is high; the stare is more stable than the strategy.", 12.1],
    ["bag-holder-poetry", "套牢诗歌朗诵者", "Bagholder Poetry Reader", "回撤之后开始讲格局，语言组织能力有所提升。", "After drawdown, it starts speaking philosophy with improved language skills.", 8.8],
    ["slippage-tuition-payer", "滑点学费缴纳者", "Slippage Tuition Payer", "每次成交都像交一点链上学费。", "Each fill feels like paying a little onchain tuition.", 10.4],
    ["narrative-compass-spinning", "叙事指南针打转", "Narrative Compass Spinning", "方向感不是没有，只是热点一多就开始原地转圈。", "Direction exists; it starts spinning when narratives multiply.", 11.2],
    ["portfolio-sleep-talker", "仓位梦话翻译员", "Portfolio Sleep Talk Translator", "不操作的时候也像在梦里给仓位找理由。", "Even without trading, it seems to dream excuses for positions.", 12.8],
    ["profit-screenshot-allergy", "盈利截图过敏", "Profit Screenshot Allergy", "别人一晒收益，钱包就开始出现轻微冲动反应。", "Someone posts gains and the wallet develops mild impulse symptoms.", 8.9],
    ["gas-incense-burner", "Gas 香火供奉者", "Gas Incense Burner", "手续费像香火，烧得不算少，愿望也挺多。", "Gas burns like incense: not little, and with many wishes attached.", 10.7],
    ["exit-theory-professor", "退出理论教授", "Exit Theory Professor", "退出逻辑很会讲，实际按钮不常按。", "Exit logic is well explained; the button is rarely pressed.", 9.4],
    ["alpha-noise-translator", "Alpha 杂音翻译器", "Alpha Noise Translator", "有时能听见信号，有时会把噪音翻译成天命。", "Sometimes it hears signal; sometimes it translates noise into destiny.", 9.7],
    ["wallet-night-shift", "钱包夜班工人", "Wallet Night-Shift Worker", "夜盘活动痕迹很像加班，精神状态另算。", "Late-market traces look like overtime; mental state is a separate topic.", 11.9],
    ["drawdown-makeup-artist", "回撤化妆师", "Drawdown Makeup Artist", "亏损会被修饰成周期理解，手法越来越熟。", "Losses get styled as cycle understanding, with improving technique.", 8.6],
    ["liquidity-echo-chamber", "流动性回音室", "Liquidity Echo Chamber", "喊一声成交，回来的声音是滑点。", "You shout execution; the echo returns as slippage.", 9.1]
  ];
  while (badges.length < 3) {
    const next = fillers[stableIndex(address, `badge-filler-${badges.length}`, fillers.length)];
    add(...next);
  }

  return badges
    .sort((a, b) => a.appearanceRate - b.appearanceRate)
    .slice(0, 5);
}

function buildRarity(metrics, scores, personality, badges, address, lang, seasonSampleSize) {
  const behaviorScore =
    scores.degen * 0.18 +
    scores.diamond * 0.14 +
    scores.airdrop * 0.14 +
    Math.min(12, metrics.chainsWithActivity * 2) +
    Math.min(11, Math.log10(metrics.uniqueTokenCount + 1) * 5) +
    Math.min(9, Math.log10(metrics.txCount + 1) * 2.4) +
    Math.min(8, metrics.lowLiquidityTokenCount * 0.7) +
    Math.min(7, metrics.memeTokenCount * 0.8) +
    Math.min(7, metrics.nftTransferCount / 12) +
    Math.min(6, metrics.sampleWindowDays / 365) +
    stableIndex(address, "personality-rarity", 900) / 100;
  const personalityRarity = rarityFromRate(rateFromScore(behaviorScore, 0.12), lang);
  const badgeAverageRate = badges.reduce((sum, badge) => sum + badge.appearanceRate, 0) / badges.length;
  const comboRate = Number(Math.max(0.05, Math.min(24, personalityRarity.appearanceRate * badgeAverageRate / 11 + stableIndex(address, "combo-rate", 70) / 100)).toFixed(2));
  const combo = rarityFromRate(comboRate, lang);
  const tierIndex = Math.max(RARITY_ORDER.indexOf(personalityRarity.tier), RARITY_ORDER.indexOf(combo.tier));
  const topTier = RARITY_ORDER[Math.max(0, tierIndex)];
  const score = Number(Math.max(0, Math.min(100, 100 - combo.appearanceRate + stableIndex(address, "rarity-score", 100) / 1000)).toFixed(2));

  return {
    season: {
      id: "season-0",
      name: pickLocalized(lang, "DegenDNA Season 0 · Genesis Wallets", "DegenDNA Season 0 · Genesis Wallets"),
      sampleSize: seasonSampleSize
    },
    tier: topTier,
    tierName: rarityTierName(topTier, lang),
    color: rarityColor(topTier),
    score,
    personality: {
      ...personalityRarity,
      title: personality,
      text: pickLocalized(
        lang,
        `${personalityRarity.tierName} · 全站出现率约 ${personalityRarity.appearanceRate}%，超过 ${personalityRarity.percentile}% 的已上榜钱包。`,
        `${personalityRarity.tierName} · estimated appearance ${personalityRarity.appearanceRate}%, ahead of ${personalityRarity.percentile}% of ranked wallets.`
      )
    },
    combo: {
      ...combo,
      text: pickLocalized(
        lang,
        `${combo.tierName} 组合 · 类似徽章组合出现率约 ${combo.appearanceRate}%。`,
        `${combo.tierName} combo · similar badge stack appears around ${combo.appearanceRate}%.`
      )
    },
    mystic: buildMysticTraits(address, lang)
  };
}

function buildReportModes(context) {
  const modes = {};
  for (const mode of ["normal", "roast", "abstract", "kol"]) {
    const modeContext = {
      ...context,
      verdict: buildModeVerdict(mode, context),
      lossCause: buildModeLossCause(mode, context)
    };
    modes[mode] = {
      mode,
      verdict: modeContext.verdict,
      lossCause: modeContext.lossCause,
      assetPersonality: buildModeAssetPersonality(mode, modeContext),
      holdingBehavior: holdingSummary(context.metrics, context.address, context.lang, mode),
      lossBlackBox: pickLocalized(
        context.lang,
        `你的主要亏损来源不是市场，而是${trimSentenceEnd(modeContext.lossCause)}。`,
        `Your main leak is not the market; it is that ${trimSentenceEnd(modeContext.lossCause)}.`
      ),
      alphaRadar: buildModeAlphaRadar(mode, modeContext),
      fate90Days: buildModeFate(context.metrics, context.scores, context.address, context.lang, mode),
      strategyFit: buildModeStrategy(mode, modeContext),
      tweetText: buildTweetText(mode, modeContext)
    };
  }
  return modes;
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
  if (scores.degen > 80) labels.push(pickLocalized(lang, "链上精神状态评估样本", "Onchain State Check"));
  if (scores.degen > 75 && metrics.memeTokenCount >= 4) labels.push(pickLocalized(lang, "阳线过敏", "Green Candle Allergy"));
  if (metrics.failedRate > 0.12) labels.push(pickLocalized(lang, "止损失联", "Stop-Loss Missing"));
  if (metrics.lowLiquidityTokenCount >= 8) labels.push(pickLocalized(lang, "流动性黑洞", "Liquidity Black Hole"));
  if (metrics.methodCounts.bridge > 2) labels.push(pickLocalized(lang, "跨链流浪", "Multi-Chain Vagrant"));
  if (metrics.methodCounts.claim > 1) labels.push(pickLocalized(lang, "任务清单成瘾", "Quest List Addict"));
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 5) labels.push(pickLocalized(lang, "只进不出", "Entry-Only Mode"));
  if (metrics.txPerDay > 2.5) labels.push(pickLocalized(lang, "手速快过脑速", "Finger Faster Than Brain"));
  if (metrics.uniqueTokenCount > 30) labels.push(pickLocalized(lang, "Token 万花筒", "Token Kaleidoscope"));
  if (metrics.txCount > 500) labels.push(pickLocalized(lang, "区块空间长租户", "Blockspace Tenant"));
  if (metrics.portfolioUsd < 50 && metrics.txCount > 80) labels.push(pickLocalized(lang, "小本金大戏台", "Small Balance Big Stage"));
  if (metrics.stableRatio < 0.1 && scores.degen > 65) labels.push(pickLocalized(lang, "没系安全带", "No Seatbelt"));
  if (scores.airdrop > 70 && metrics.methodCounts.bridge > 1) labels.push(pickLocalized(lang, "跨链打卡机", "Crosschain Punch Card"));
  if (metrics.methodCounts.swap > 8 && metrics.failedRate > 0.08) labels.push(pickLocalized(lang, "确认按钮搏击手", "Confirm Button Fighter"));
  if (scores.diamond > 65 && metrics.memeRatio > 0.18) labels.push(pickLocalized(lang, "套牢禅修者", "Bag Zen Student"));
  if (metrics.nftTransferCount > 8 && metrics.sampleWindowDays > 365) labels.push(pickLocalized(lang, "JPEG 守夜人", "JPEG Night Watch"));
  if (scores.degen > 65 && metrics.stableRatio > 0.45) labels.push(pickLocalized(lang, "一边躺平一边冲锋", "Cautious Charger"));
  return [...new Set(labels)].slice(0, 6);
}

function actionableChainErrors(chain) {
  const rawErrors = Array.isArray(chain.errors) ? chain.errors : (chain.error ? [chain.error] : []);
  return rawErrors.filter((error) => {
    const message = String(error || "");
    return message && !message.includes("BNB Chain uses public RPC only");
  });
}

function buildReport(address, chains, lang = "zh", seasonSampleSize = 0) {
  const generatedAt = new Date().toISOString();
  const degradedChains = chains
    .map((chain) => {
      const errors = actionableChainErrors(chain);
      return {
        id: chain.id,
        name: chain.name,
        ok: Boolean(chain.ok),
        error: chain.error || errors[0] || "",
        errors
      };
    })
    .filter((chain) => !chain.ok || chain.errors.length);
  const metrics = buildMetrics(address, chains);
  const scores = scoreWallet(metrics);
  const personalityId = choosePersonality(metrics, scores, address);
  const basePersonality = personalityName(personalityId, lang);
  const personality = personalizedPersonalityName(basePersonality, address, lang);
  const lossCause = buildLossCause(metrics, scores, lang);
  const verdict = buildVerdict(personalityId, metrics, scores, lang);
  const labels = buildLabels(personalityId, metrics, scores, lang);
  const badges = buildBadges(metrics, scores, address, lang, seasonSampleSize);
  const rarity = buildRarity(metrics, scores, personality, badges, address, lang, seasonSampleSize);
  const context = { address, lang, metrics, scores, personalityId, personality, lossCause, verdict, labels, badges, rarity, generatedAt };
  const modes = buildReportModes(context);
  const defaultMode = "abstract";
  const compositeRankScore = rankScore(metrics, scores, address);

  return {
    generatedAt,
    language: lang,
    address,
    shortAddress: shortAddress(address),
    siteUrl: SITE_URL,
    siteHost: SITE_HOST,
    productName: pickLocalized(lang, "链上照妖镜", "Degen DNA"),
    productSubtitle: pickLocalized(lang, "Degen DNA Report", "Onchain Mirror"),
    reportVersion: REPORT_VERSION,
    nftEligible: !isSampleWallet(address),
    nftIneligibleReason: isSampleWallet(address)
      ? pickLocalized(lang, "样本钱包可以无限生成报告，但不能领取测试网 NFT。", "Sample wallets can generate unlimited reports, but cannot claim testnet NFTs.")
      : "",
    degraded: degradedChains.length > 0,
    degradedChains,
    personalityId,
    basePersonality,
    personality,
    verdict,
    lossCause,
    labels,
    badges,
    rarity,
    modes,
    defaultMode,
    degenBand: degenBand(scores.degen, lang),
    rankScore: compositeRankScore,
    scores,
    metrics: {
      ...metrics,
      portfolioUsdText: usd(metrics.portfolioUsd),
      stableUsdText: usd(metrics.stableUsd),
      memeUsdText: usd(metrics.memeUsd),
      sampleWindowDays: Number(metrics.sampleWindowDays.toFixed(1)),
      txPerDay: Number(metrics.txPerDay.toFixed(2)),
      sampledHoldDays: Number.isFinite(metrics.sampledHoldDays) ? Number(metrics.sampledHoldDays.toFixed(1)) : null
    },
    report: modes[defaultMode],
    chains: chains.map((chain) => ({
      id: chain.id,
      name: chain.name,
      color: chain.color,
      ok: chain.ok,
      source: chain.source,
      nativeSymbol: chain.nativeSymbol,
      nativeBalance: Number(safeNumber(chain.nativeBalance, 0).toFixed(5)),
      nativeUsd: chain.nativeUsd || 0,
      txCount: chain.txCount || 0,
      tokenTransferCount: chain.tokenTransferCount || 0,
      errors: chain.errors || (chain.error ? [chain.error] : [])
    })),
    warnings: chains
      .flatMap((chain) => actionableChainErrors(chain))
      .slice(0, 8)
  };
}

async function readJsonBody(req, maxBytes = 32_768) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > maxBytes) throw new Error("Request body too large.");
  }
  if (!body.trim()) return {};
  return JSON.parse(body);
}

function hasSupabase() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function hasSupabaseLeaderboard() {
  return hasSupabase();
}

function supabaseTableUrl(tableName) {
  return `${SUPABASE_URL}/rest/v1/${encodeURIComponent(tableName)}`;
}

function supabaseLeaderboardUrl() {
  return supabaseTableUrl(SUPABASE_LEADERBOARD_TABLE);
}

function supabaseNftClaimsUrl() {
  return supabaseTableUrl(SUPABASE_NFT_CLAIMS_TABLE);
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra
  };
}

async function fetchSupabase(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || SUPABASE_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function toDbEntry(entry) {
  return {
    id: entry.id,
    username: entry.username,
    handle: entry.handle,
    name: entry.name,
    avatar_url: entry.avatarUrl,
    profile_url: entry.profileUrl,
    address: entry.address,
    short_address: entry.shortAddress,
    personality: entry.personality,
    personality_id: entry.personalityId,
    degen: entry.degen,
    diamond: entry.diamond,
    airdrop: entry.airdrop,
    rank_score: entry.rankScore,
    degen_band: entry.degenBand,
    labels: {
      tags: entry.labels || [],
      badges: entry.badges || [],
      rarity: entry.rarity || null
    },
    generated_at: entry.generatedAt,
    language: entry.language
  };
}

function fromDbRow(row) {
  const labelPayload = row.labels && typeof row.labels === "object" ? row.labels : [];
  const legacyLabels = Array.isArray(labelPayload) ? labelPayload : [];
  return {
    id: row.id,
    username: row.username,
    handle: row.handle,
    name: row.name,
    avatarUrl: row.avatar_url,
    profileUrl: row.profile_url,
    address: row.address,
    shortAddress: row.short_address,
    personality: row.personality,
    personalityId: row.personality_id,
    degen: safeNumber(row.degen, 0),
    diamond: safeNumber(row.diamond, 0),
    airdrop: safeNumber(row.airdrop, 0),
    rankScore: safeNumber(row.rank_score, 0),
    degenBand: row.degen_band,
    labels: Array.isArray(labelPayload.tags) ? labelPayload.tags : legacyLabels,
    badges: Array.isArray(labelPayload.badges) ? labelPayload.badges : [],
    rarity: labelPayload.rarity || null,
    generatedAt: row.generated_at,
    language: row.language || "zh"
  };
}

async function readSupabaseLeaderboard() {
  const url = new URL(supabaseLeaderboardUrl());
  url.searchParams.set(
    "select",
    "id,username,handle,name,avatar_url,profile_url,address,short_address,personality,personality_id,degen,diamond,airdrop,rank_score,degen_band,labels,generated_at,language"
  );
  url.searchParams.set("order", "generated_at.desc");
  url.searchParams.set("limit", String(LEADERBOARD_READ_LIMIT));

  const response = await fetchSupabase(url, {
    headers: supabaseHeaders()
  });
  if (!response.ok) {
    throw new Error(`Supabase leaderboard read failed: ${response.status} ${await response.text()}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(fromDbRow) : [];
}

async function writeSupabaseLeaderboard(entries) {
  const response = await fetchSupabase(`${supabaseLeaderboardUrl()}?on_conflict=id`, {
    method: "POST",
    headers: supabaseHeaders({
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    }),
    body: JSON.stringify(entries.map(toDbEntry))
  });
  if (!response.ok) {
    throw new Error(`Supabase leaderboard write failed: ${response.status} ${await response.text()}`);
  }
}

async function deleteSupabaseLeaderboardDuplicates({ username, address }) {
  if (!hasSupabaseLeaderboard()) return;
  const normalizedUsername = String(username || "").replace(/^@/, "");
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedUsername && !normalizedAddress) return;
  const url = new URL(supabaseLeaderboardUrl());
  const clauses = [];
  if (normalizedUsername) clauses.push(`username.eq.${normalizedUsername}`);
  if (normalizedAddress) clauses.push(`address.eq.${normalizedAddress}`);
  url.searchParams.set("or", `(${clauses.join(",")})`);
  const response = await fetchSupabase(url, {
    method: "DELETE",
    headers: supabaseHeaders({ prefer: "return=minimal" })
  });
  if (!response.ok) {
    throw new Error(`Supabase leaderboard dedupe failed: ${response.status} ${await response.text()}`);
  }
}

async function readLeaderboard() {
  if (hasSupabaseLeaderboard()) {
    try {
      return await readSupabaseLeaderboard();
    } catch (error) {
      console.error(error.message);
    }
  }

  try {
    const data = await readFile(LEADERBOARD_PATH, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLeaderboard(entries) {
  if (hasSupabaseLeaderboard()) {
    try {
      await writeSupabaseLeaderboard(entries);
      return;
    } catch (error) {
      console.error(error.message);
    }
  }

  await writeFile(LEADERBOARD_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

async function leaderboardStorageStatus() {
  if (!hasSupabaseLeaderboard()) {
    return { mode: "file", configured: false };
  }

  try {
    await readSupabaseLeaderboard();
    return { mode: "supabase", configured: true };
  } catch (error) {
    console.error(error.message);
    return { mode: "file-fallback", configured: true };
  }
}

function publicLeaderboard(entries) {
  return entries
    .slice()
    .sort((a, b) =>
      safeNumber(b.rarity?.score, 0) - safeNumber(a.rarity?.score, 0) ||
      safeNumber(b.rankScore) - safeNumber(a.rankScore) ||
      String(b.generatedAt).localeCompare(String(a.generatedAt))
    )
    .slice(0, LEADERBOARD_LIMIT);
}

function leaderboardCategories(entries) {
  const list = entries.slice();
  const rankers = {
    composite: (item) => safeNumber(item.rankScore, 0),
    degen: (item) => safeNumber(item.degen, 0),
    diamond: (item) => safeNumber(item.diamond, 0),
    airdrop: (item) => safeNumber(item.airdrop, 0),
    rarity: (item) => safeNumber(item.rarity?.score, 0),
    medical: (item) => {
      const degen = safeNumber(item.degen, 0);
      const rarity = safeNumber(item.rarity?.score, 0);
      const paper = 100 - safeNumber(item.diamond, 0);
      return Number((degen * 0.42 + rarity * 0.38 + paper * 0.2).toFixed(2));
    }
  };
  return Object.fromEntries(Object.entries(rankers).map(([key, score]) => [
    key,
    list
      .slice()
      .sort((a, b) =>
        score(b) - score(a) ||
        safeNumber(b.rankScore, 0) - safeNumber(a.rankScore, 0) ||
        String(b.generatedAt).localeCompare(String(a.generatedAt))
      )
      .slice(0, 30)
  ]));
}

async function submitLeaderboardEntry({ address, lang, username }) {
  const normalizedAddress = normalizeAddress(address);
  if (!isAddress(normalizedAddress)) {
    throw new Error(pickLocalized(lang, "请输入有效的钱包地址。", "Enter a valid wallet address."));
  }

  const xUsername = normalizeXUsername(username);
  const profile = xUsername
    ? await resolveXProfile(xUsername)
    : {
        username: `wallet_${normalizedAddress.slice(2, 10).toLowerCase()}`,
        handle: shortAddress(normalizedAddress),
        name: shortAddress(normalizedAddress),
        avatarUrl: "",
        rawAvatarUrl: "",
        profileUrl: "",
        source: "wallet"
      };

  const report = await analyzeWallet(normalizedAddress, lang);
  const entry = {
    id: `${profile.username.toLowerCase()}:${normalizedAddress.toLowerCase()}:${normalizeLang(lang)}`,
    username: profile.username,
    handle: profile.handle,
    name: profile.name,
    avatarUrl: profile.avatarUrl,
    profileUrl: profile.profileUrl,
    address: report.address,
    shortAddress: report.shortAddress,
    personality: report.personality,
    personalityId: report.personalityId,
    degen: report.scores.degen,
    diamond: report.scores.diamond,
    airdrop: report.scores.airdrop,
    rankScore: report.rankScore,
    degenBand: report.degenBand,
    labels: report.labels.slice(0, 4),
    badges: report.badges.slice(0, 5),
    rarity: report.rarity,
    generatedAt: new Date().toISOString(),
    language: lang
  };

  const current = await readLeaderboard();
  const entryUsername = String(entry.username || "").toLowerCase();
  const entryAddress = normalizedAddressKey(entry.address);
  const next = publicLeaderboard([
    entry,
    ...current.filter((item) =>
      item.id !== entry.id &&
      (!entryUsername || String(item.username || "").toLowerCase() !== entryUsername) &&
      normalizedAddressKey(item.address) !== entryAddress
    )
  ]);
  if (hasSupabaseLeaderboard()) {
    try {
      await deleteSupabaseLeaderboardDuplicates(entry);
    } catch (error) {
      console.error(error.message);
    }
  }
  await writeLeaderboard(next);
  return { entry, entries: next, profile };
}

async function leaderboardSampleSize() {
  try {
    return (await readLeaderboard()).length;
  } catch {
    return 0;
  }
}

const NFT_RARITY_TIERS = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
  unique: 6
};

const NFT_RARITY_SUPPLY = [4500, 2500, 1500, 800, 400, 249, 50];
const NFT_TEMPLATE_FILES = [
  "common.png",
  "uncommon.png",
  "rare.png",
  "epic.png",
  "legendary.png",
  "mythic.png",
  "unique.png"
];
const nftTemplateCache = new Map();

function nftTemplateDataUri(rarityTier = 0) {
  const tier = Math.max(0, Math.min(NFT_TEMPLATE_FILES.length - 1, Number(rarityTier) || 0));
  const filename = NFT_TEMPLATE_FILES[tier] || NFT_TEMPLATE_FILES[0];
  if (nftTemplateCache.has(filename)) return nftTemplateCache.get(filename);
  try {
    const templatePath = resolve(publicDir, "nft-templates", filename);
    const dataUri = `data:image/png;base64,${readFileSync(templatePath).toString("base64")}`;
    nftTemplateCache.set(filename, dataUri);
    return dataUri;
  } catch {
    return "";
  }
}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reportHashForNft(report, username = "") {
  const payload = JSON.stringify({
    version: REPORT_VERSION,
    address: normalizedAddressKey(report.address),
    username: String(username || "").replace(/^@/, "").toLowerCase(),
    language: report.language || "zh",
    personalityId: report.personalityId,
    rarity: report.rarity?.tier,
    degen: report.scores?.degen,
    diamond: report.scores?.diamond,
    airdrop: report.scores?.airdrop
  });
  return `0x${createHash("sha256").update(payload).digest("hex")}`;
}

function nftClaimId(reportHash) {
  return `ddna-${String(reportHash).replace(/^0x/, "").slice(0, 20)}`;
}

function nftMetadataUrl(claimId) {
  return `${SITE_URL.replace(/\/+$/, "")}/api/nft/metadata/${encodeURIComponent(claimId)}`;
}

function nftImageUrl(claimId) {
  return `${SITE_URL.replace(/\/+$/, "")}/api/nft/image/${encodeURIComponent(claimId)}.svg`;
}

function nftRarityTier(report) {
  return NFT_RARITY_TIERS[report.rarity?.tier] ?? 0;
}

function buildNftClinicVerdict(report, profile) {
  const lang = report.language || "zh";
  const tier = report.rarity?.tier || "common";
  const mystic = report.rarity?.mystic || [];
  const omen = mystic.map((item) => item.value).filter(Boolean).slice(0, 2).join(" / ");
  const address = report.address || "";
  const pools = {
    common: [
      ["链上心率稳定，但偶发性追涨反射仍需复诊观察。", "Onchain pulse is stable, with occasional green-candle reflex requiring follow-up."],
      ["钱包未见重大异常，建议继续保持睡眠，不要把横盘看成命运暗示。", "No major anomaly detected. Keep sleeping normally and stop reading destiny into chop."],
      ["当前症状偏轻，主要表现为看盘时间长于有效决策时间。", "Symptoms are mild: chart-watching time exceeds useful decision time."]
    ],
    uncommon: [
      ["病例显示轻度叙事敏感，遇到新热点时手指会先于大脑完成挂号。", "Mild narrative sensitivity detected; fingers check in before the brain when a new trend appears."],
      ["链上脉搏略快，疑似在稳定和上头之间反复横跳。", "Onchain pulse runs slightly hot, oscillating between stability and impulse."],
      ["该钱包有自救意识，但偶尔会把群聊截图当作临床证据。", "This wallet has self-preservation instincts, but sometimes treats group-chat screenshots as clinical evidence."]
    ],
    rare: [
      ["病例进入链上异类区间，建议减少半夜复盘，增加白天呼吸。", "Case enters onchain anomaly range. Reduce midnight post-mortems and increase daytime breathing."],
      ["该钱包对 Alpha 气味较敏感，但对退出按钮存在选择性失明。", "Sensitive to alpha scent, selectively blind to the exit button."],
      ["链上影像显示多处叙事残留，暂未危及生命，但很适合截图。", "Imaging shows narrative residue. Not life-threatening, excellent screenshot material."]
    ],
    epic: [
      ["链上精神科建议留观：该钱包对阳线、空投、土狗均存在复合型反应。", "Onchain psychiatry recommends observation: compound reaction to green candles, airdrops, and microcaps."],
      ["本病例稀有度偏高，症状包括过度相信下一根阳线以及间歇性忘记止损。", "High rarity case: excessive belief in the next green candle and intermittent stop-loss amnesia."],
      ["诊断结果显示，该钱包不是没救，是太会给冲动写病历摘要。", "Diagnosis: not hopeless, just unusually good at writing discharge notes for impulse."]
    ],
    legendary: [
      ["该病例已进入币圈怪物层级，建议封存为 Season 0 高危教学样本。", "This case reaches crypto-monster tier and should be archived as a Season 0 high-risk teaching specimen."],
      ["链上 CT 显示周期穿越痕迹明显，钱包活着，精神状态需要单独开会。", "Onchain CT shows clear cycle-survival traces. Wallet alive; mental state requires a separate meeting."],
      ["主治医生意见：此钱包不适合被模仿，但非常适合被围观。", "Attending note: this wallet should not be copied, but absolutely deserves observation."]
    ],
    mythic: [
      ["精神状态存疑。建议把交易按钮放远一点，把睡觉按钮放近一点。", "Mental state questionable. Move the trade button farther away and the sleep button closer."],
      ["该钱包疑似把波动率当咖啡因使用，链上神经系统处于高亮状态。", "This wallet appears to use volatility as caffeine; onchain nervous system is overlit."],
      ["病例罕见，已触发链上精神科二级会诊：先别加仓，先喝水。", "Rare case. Level-two onchain psych consult triggered: do not add first; drink water first."]
    ],
    unique: [
      ["链上异常体已收录。此病例不建议解释，建议供奉在截图文件夹。", "Onchain anomaly archived. Do not explain this case; place it in the screenshot shrine."],
      ["1/1 病例：钱包像从另一个周期逃出来的诊断残片。", "1/1 case: this wallet looks like a diagnostic fragment escaped from another cycle."],
      ["系统无法给出常规建议，只能确认：这不是普通钱包，这是链上异象。", "No standard advice available. Confirmed: not a normal wallet, an onchain apparition."]
    ]
  };
  const pool = pools[tier] || pools.common;
  const [zh, en] = pool[stableIndex(address, `nft-verdict-${tier}-${profile?.username || ""}`, pool.length)];
  const suffix = omen
    ? pickLocalized(lang, ` 玄学读数：${omen}。`, ` Mystic reading: ${omen}.`)
    : "";
  return `${pickLocalized(lang, zh, en)}${suffix}`;
}

function claimRowFromReport({ claimId, reportHash, report, receiver, profile }) {
  const tier = nftRarityTier(report);
  const selected = report.modes?.abstract || report.report || {};
  const nftVerdict = buildNftClinicVerdict(report, profile);
  return {
    id: claimId,
    report_hash: reportHash,
    report_id: report.rarity?.season?.id || "season-0",
    address: normalizedAddressKey(report.address),
    receiver: normalizedAddressKey(receiver),
    username: profile?.username || null,
    handle: profile?.handle || null,
    language: report.language || "zh",
    personality: report.personality,
    personality_id: report.personalityId,
    rarity_tier: tier,
    rarity_label: report.rarity?.tierName || report.rarity?.tier || "Common",
    rarity_supply_cap: NFT_RARITY_SUPPLY[tier],
    degen: report.scores.degen,
    diamond: report.scores.diamond,
    airdrop: report.scores.airdrop,
    mystic_traits: report.rarity?.mystic || {},
    badges: report.badges?.slice(0, 5) || [],
    verdict: nftVerdict || selected.verdict || report.verdict || "",
    loss_cause: selected.lossCause || report.lossCause || "",
    metadata_url: nftMetadataUrl(claimId),
    image_url: nftImageUrl(claimId),
    status: "pending",
    updated_at: new Date().toISOString()
  };
}

async function fetchNftClaimByFilter(filter) {
  if (!hasSupabase()) return null;
  const url = new URL(supabaseNftClaimsUrl());
  url.searchParams.set("select", "*");
  url.searchParams.set("limit", "1");
  Object.entries(filter).forEach(([key, value]) => url.searchParams.set(key, `eq.${value}`));
  const response = await fetchSupabase(url, { headers: supabaseHeaders() });
  if (!response.ok) throw new Error(`Supabase NFT claim read failed: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function fetchExistingNftClaim({ reportHash, address, receiver, username }) {
  if (!hasSupabase()) return null;
  const url = new URL(supabaseNftClaimsUrl());
  url.searchParams.set("select", "*");
  url.searchParams.set("limit", "1");
  const clauses = [
    `report_hash.eq.${reportHash}`,
    `address.eq.${normalizedAddressKey(address)}`,
    `receiver.eq.${normalizedAddressKey(receiver)}`
  ];
  const normalizedUsername = String(username || "").replace(/^@/, "").toLowerCase();
  if (normalizedUsername) clauses.push(`username.eq.${normalizedUsername}`);
  url.searchParams.set("or", `(${clauses.join(",")})`);
  const response = await fetchSupabase(url, { headers: supabaseHeaders() });
  if (!response.ok) throw new Error(`Supabase NFT claim lookup failed: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function insertNftClaim(row) {
  const response = await fetchSupabase(supabaseNftClaimsUrl(), {
    method: "POST",
    headers: supabaseHeaders({
      "content-type": "application/json",
      prefer: "return=representation"
    }),
    body: JSON.stringify(row)
  });
  if (response.status === 409) return null;
  if (!response.ok) throw new Error(`Supabase NFT claim insert failed: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || row : row;
}

async function updateNftClaim(id, patch) {
  const url = new URL(supabaseNftClaimsUrl());
  url.searchParams.set("id", `eq.${id}`);
  const response = await fetchSupabase(url, {
    method: "PATCH",
    headers: supabaseHeaders({
      "content-type": "application/json",
      prefer: "return=representation"
    }),
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
  });
  if (!response.ok) throw new Error(`Supabase NFT claim update failed: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

function nftClaimPublicPayload(row) {
  if (!row) return null;
  return {
    id: row.id,
    address: row.address,
    receiver: row.receiver,
    username: row.username,
    handle: row.handle,
    personality: row.personality,
    rarityTier: row.rarity_tier,
    rarityLabel: row.rarity_label,
    metadataUrl: row.metadata_url,
    imageUrl: row.image_url,
    tokenId: row.token_id,
    txHash: row.tx_hash,
    status: row.status,
    mintedAt: row.minted_at,
    explorerUrl: row.tx_hash ? `https://sepolia.etherscan.io/tx/${row.tx_hash}` : null
  };
}

async function mintNftClaim(row) {
  const { Contract, JsonRpcProvider, Wallet, isAddress: ethersIsAddress } = await import("ethers");
  if (!ethersIsAddress(SEPOLIA_NFT_CONTRACT_ADDRESS)) throw new Error("SEPOLIA_NFT_CONTRACT_ADDRESS is not configured.");
  if (!SEPOLIA_MINTER_PRIVATE_KEY) throw new Error("SEPOLIA_MINTER_PRIVATE_KEY is not configured.");
  const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(SEPOLIA_MINTER_PRIVATE_KEY, provider);
  const contract = new Contract(SEPOLIA_NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, wallet);
  const tx = await contract.mintMedicalRecord(row.receiver, row.metadata_url, row.report_hash, row.rarity_tier);
  const receipt = await tx.wait();
  let tokenId = null;
  for (const log of receipt.logs || []) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "MedicalRecordMinted") {
        tokenId = Number(parsed.args.tokenId);
        break;
      }
    } catch {
      // Ignore logs from other contracts.
    }
  }
  return {
    token_id: tokenId,
    tx_hash: receipt.hash,
    status: "minted",
    minted_at: new Date().toISOString()
  };
}

async function submitNftClaim({ address, receiver, username, lang }) {
  const normalizedSource = normalizeAddress(address);
  const normalizedReceiver = normalizeAddress(receiver);
  if (!isAddress(normalizedSource) || !isAddress(normalizedReceiver)) {
    throw new Error(pickLocalized(lang, "请输入有效的钱包地址和 NFT 接收地址。", "Enter a valid wallet address and NFT receiver address."));
  }
  if (isSampleWallet(normalizedSource)) {
    throw new Error(pickLocalized(lang, "样本钱包可以无限生成报告，但不能领取测试网 NFT。", "Sample wallets can generate unlimited reports, but cannot claim testnet NFTs."));
  }
  if (!NFT_CLAIM_ENABLED) {
    throw new Error(pickLocalized(lang, "测试网 NFT 领取还没开放，等合约部署完成后再来复诊。", "Testnet NFT claims are not open yet. Check back after contract deployment."));
  }
  if (!hasSupabase()) {
    throw new Error(pickLocalized(lang, "NFT 领取需要先配置 Supabase。", "NFT claims require Supabase configuration first."));
  }

  const profile = username ? await resolveXProfile(username) : null;
  const report = await analyzeWallet(normalizedSource, lang);
  const reportHash = reportHashForNft(report, profile?.username || username || "");
  const existing = await fetchExistingNftClaim({
    reportHash,
    address: normalizedSource,
    receiver: normalizedReceiver,
    username: profile?.username || username || ""
  });
  if (existing) {
    return { claim: nftClaimPublicPayload(existing), duplicate: true };
  }

  const claimId = nftClaimId(reportHash);
  const inserted = await insertNftClaim(claimRowFromReport({
    claimId,
    reportHash,
    report,
    receiver: normalizedReceiver,
    profile
  }));
  let row = inserted || await fetchExistingNftClaim({
    reportHash,
    address: normalizedSource,
    receiver: normalizedReceiver,
    username: profile?.username || username || ""
  });
  if (!row) throw new Error(pickLocalized(lang, "NFT 领取排队失败，请稍后重试。", "NFT claim queue failed. Try again later."));
  if (row.status === "minted") return { claim: nftClaimPublicPayload(row), duplicate: true };

  try {
    row = await updateNftClaim(row.id, { status: "minting", error: null });
    const minted = await mintNftClaim(row);
    row = await updateNftClaim(row.id, minted);
    return { claim: nftClaimPublicPayload(row), duplicate: false };
  } catch (error) {
    await updateNftClaim(row.id, { status: "failed", error: error.message || String(error) }).catch(() => {});
    throw error;
  }
}

function nftMetadataFromRow(row) {
  const traits = row.mystic_traits && typeof row.mystic_traits === "object" ? row.mystic_traits : {};
  const badges = Array.isArray(row.badges) ? row.badges : [];
  return {
    name: `Degen DNA Medical Record ${String(row.id || "").toUpperCase()}`,
    description: "A Sepolia testnet commemorative medical-record NFT generated from a degendna.fun onchain personality report. Entertainment only. Not medical, psychological, investment, or financial advice.",
    image: row.image_url || nftImageUrl(row.id),
    external_url: SITE_URL,
    attributes: [
      { trait_type: "Diagnosis", value: row.personality },
      { trait_type: "Rarity", value: row.rarity_label },
      { trait_type: "Rarity Tier", value: row.rarity_tier },
      { trait_type: "Degen Index", value: row.degen, max_value: 100 },
      { trait_type: "Diamond Hand Index", value: row.diamond, max_value: 100 },
      { trait_type: "Airdrop Radar", value: row.airdrop, max_value: 100 },
      ...badges.slice(0, 3).map((badge, index) => ({ trait_type: `Badge ${index + 1}`, value: badge.name || String(badge) })),
      ...Object.entries(traits).map(([key, value]) => ({ trait_type: key, value })),
      { trait_type: "Season", value: "Season 0: Genesis Clinic" },
      { trait_type: "Network", value: "Ethereum Sepolia" },
      { trait_type: "Attending", value: "Stone" }
    ]
  };
}

function nftImageSvgLegacy(row) {
  const accents = ["#9fb3c8", "#49d19d", "#5fb6ff", "#9a5cff", "#e8bd58", "#ff6d4c", "#e6f7ff"];
  const accent = accents[Number(row.rarity_tier || 0)] || accents[0];
  const traits = row.mystic_traits && typeof row.mystic_traits === "object" ? Object.values(row.mystic_traits).slice(0, 4) : [];
  const badges = Array.isArray(row.badges) ? row.badges.slice(0, 3).map((badge) => badge.name || String(badge)) : [];
  const title = htmlEscape(row.personality || "Onchain Adaptation Disorder");
  const rarity = htmlEscape(row.rarity_label || "Common");
  const verdict = htmlEscape(row.verdict || "Wallet status requires follow-up.");
  const symptoms = [...badges, ...traits].slice(0, 5);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1600 1600">
  <defs>
    <radialGradient id="g" cx="72%" cy="18%" r="82%"><stop offset="0" stop-color="${accent}" stop-opacity=".34"/><stop offset=".52" stop-color="#061316"/><stop offset="1" stop-color="#020405"/></radialGradient>
    <linearGradient id="b" x1="0" x2="1"><stop stop-color="${accent}"/><stop offset=".54" stop-color="#f0d08a"/><stop offset="1" stop-color="#6de6ff"/></linearGradient>
  </defs>
  <rect width="1600" height="1600" fill="#020405"/>
  <rect x="70" y="70" width="1460" height="1460" rx="86" fill="url(#g)" stroke="url(#b)" stroke-width="8"/>
  <rect x="124" y="124" width="1352" height="1352" rx="48" fill="#071013" opacity=".92" stroke="#39515a" stroke-width="2"/>
  <text x="190" y="198" fill="#e2c36e" font-family="Arial, sans-serif" font-size="34" letter-spacing="12">Degen DNA Medical Record</text>
  <text x="190" y="276" fill="#f4f6f8" font-family="Arial, sans-serif" font-size="62" font-weight="900">链上精神科测试网病历</text>
  <text x="190" y="334" fill="${accent}" font-family="Arial, sans-serif" font-size="36">Sepolia Testnet · Onchain Clinic</text>
  <circle cx="1322" cy="238" r="58" fill="#0b171b" stroke="#9fb3c8" stroke-width="4"/>
  <path d="M1274 238h32l16-38 24 78 22-48h50" fill="none" stroke="#9fb3c8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="190" y="430" width="760" height="420" rx="30" fill="#0a1719" stroke="${accent}" stroke-opacity=".72" stroke-width="3"/>
  <text x="238" y="506" fill="${accent}" font-family="Arial, sans-serif" font-size="27" letter-spacing="8">PRIMARY DIAGNOSIS</text>
  <foreignObject x="236" y="554" width="650" height="190"><div xmlns="http://www.w3.org/1999/xhtml" style="font:900 58px Arial,sans-serif;color:#f4f6f8;line-height:1.12">${title}</div></foreignObject>
  <text x="238" y="775" fill="#9fb3c8" font-family="Arial, sans-serif" font-size="34">Degen ${Number(row.degen || 0)}/100 · Diamond ${Number(row.diamond || 0)}/100</text>
  <rect x="1010" y="430" width="350" height="420" rx="30" fill="#061214" stroke="#23454c" stroke-width="3"/>
  <circle cx="1185" cy="620" r="118" fill="none" stroke="${accent}" stroke-opacity=".52" stroke-width="3"/>
  <path d="M1085 624c32-98 170-113 202-9 23 75-44 146-120 123-48-14-80-58-82-114z" fill="none" stroke="${accent}" stroke-width="8" opacity=".86"/>
  <path d="M1074 620h218M1184 502v236M1108 548c56 48 110 48 160 0M1104 696c55-38 108-38 164 0" stroke="${accent}" stroke-width="3" opacity=".45"/>
  <rect x="190" y="910" width="1170" height="178" rx="24" fill="#14110a" stroke="#e2bd64" stroke-width="4"/>
  <text x="258" y="998" fill="#e2c36e" font-family="Arial, sans-serif" font-size="28" letter-spacing="8">RARITY CLASS</text>
  <text x="258" y="1060" fill="${accent}" font-family="Arial, sans-serif" font-size="62" font-weight="900">Rarity: ${rarity}</text>
  <rect x="190" y="1140" width="1170" height="150" rx="24" fill="#081517" stroke="#38585c" stroke-width="2"/>
  <text x="238" y="1205" fill="${accent}" font-family="Arial, sans-serif" font-size="24" letter-spacing="7">SYMPTOM TAGS</text>
  ${symptoms.map((tag, i) => `<rect x="${238 + (i % 3) * 330}" y="${1230 + Math.floor(i / 3) * 48}" width="288" height="34" rx="17" fill="#0d2526" stroke="${accent}" stroke-opacity=".7"/><text x="${258 + (i % 3) * 330}" y="${1254 + Math.floor(i / 3) * 48}" fill="#d8fff7" font-family="Arial, sans-serif" font-size="22">${htmlEscape(tag)}</text>`).join("")}
  <foreignObject x="190" y="1320" width="880" height="90"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 30px Arial,sans-serif;color:#f4f6f8;line-height:1.25">${verdict}</div></foreignObject>
  <text x="190" y="1455" fill="#9fb3c8" font-family="Arial, sans-serif" font-size="30">链上主治医生：石头</text>
  <text x="1040" y="1455" fill="${accent}" font-family="Arial, sans-serif" font-size="32" font-weight="900">degendna.fun</text>
</svg>`;
}

function nftImageSvg(row) {
  const accents = ["#9fb3c8", "#49d19d", "#5fb6ff", "#9a5cff", "#e8bd58", "#ff6d4c", "#e6f7ff"];
  const tier = Math.max(0, Math.min(NFT_TEMPLATE_FILES.length - 1, Number(row.rarity_tier || 0)));
  const accent = accents[tier] || accents[0];
  const template = nftTemplateDataUri(tier);
  if (!template) return nftImageSvgLegacy(row);

  const traits = row.mystic_traits && typeof row.mystic_traits === "object" ? Object.values(row.mystic_traits).slice(0, 4) : [];
  const badges = Array.isArray(row.badges) ? row.badges.slice(0, 3).map((badge) => badge.name || String(badge)) : [];
  const symptoms = [...badges, ...traits].slice(0, 5).map((item) => htmlEscape(String(item).slice(0, 24)));
  const title = htmlEscape(row.personality || "Onchain Adaptation Disorder");
  const rarity = htmlEscape(row.rarity_label || "Common");
  const verdict = htmlEscape(row.verdict || "Wallet status requires follow-up.");
  const id = htmlEscape(String(row.id || "DDNA-CLINIC-S0").toUpperCase());
  const date = htmlEscape(new Date(row.created_at || Date.now()).toISOString().slice(0, 10));
  const degen = Math.round(Number(row.degen || 0));
  const diamond = Math.round(Number(row.diamond || 0));
  const airdrop = Math.round(Number(row.airdrop || 0));
  const supplyCap = NFT_RARITY_SUPPLY[tier] || NFT_RARITY_SUPPLY[0];
  const tierLabel = htmlEscape((NFT_TEMPLATE_FILES[tier] || "common.png").replace(".png", "").toUpperCase());

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1600 1600">
  <defs>
    <filter id="softGlow"><feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="${accent}" flood-opacity=".55"/></filter>
    <style>
      .tiny{font:700 25px Arial, sans-serif;letter-spacing:8px}
      .label{font:800 28px Arial, sans-serif;letter-spacing:8px;color:${accent}}
      .body{font:700 30px Arial, sans-serif;color:#d7e3e7;line-height:1.35}
      .diagnosis{font:900 70px Arial, sans-serif;color:#f4f6f8;line-height:1.04;text-shadow:0 0 18px rgba(0,0,0,.9)}
      .verdict{font:800 30px Arial, sans-serif;color:#eef8fb;line-height:1.25;text-shadow:0 0 16px rgba(0,0,0,.95)}
      .pill{font:800 22px Arial, sans-serif;color:#dffff9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    </style>
  </defs>
  <rect width="1600" height="1600" fill="#020405"/>
  <image href="${template}" x="0" y="0" width="1600" height="1600" preserveAspectRatio="xMidYMid slice"/>

  <rect x="136" y="128" width="840" height="128" rx="26" fill="#020405" opacity=".42"/>
  <text x="268" y="181" fill="#e2c36e" font-family="Arial, sans-serif" font-size="31" letter-spacing="12">Degen DNA Medical Record</text>
  <foreignObject x="266" y="196" width="700" height="68"><div xmlns="http://www.w3.org/1999/xhtml" style="font:900 48px Arial,sans-serif;color:#f4f6f8;letter-spacing:2px">链上精神科测试网病历</div></foreignObject>
  <text x="268" y="295" fill="${accent}" font-family="Arial, sans-serif" font-size="32" letter-spacing="4">Sepolia Testnet · Onchain Clinic</text>

  <foreignObject x="252" y="382" width="600" height="70"><div xmlns="http://www.w3.org/1999/xhtml" class="label">PRIMARY DIAGNOSIS</div></foreignObject>
  <foreignObject x="250" y="468" width="590" height="230"><div xmlns="http://www.w3.org/1999/xhtml" class="diagnosis">${title}</div></foreignObject>
  <text x="250" y="738" fill="${accent}" font-family="Arial, sans-serif" font-size="30" letter-spacing="3">ICD-DN-${String(tier + 1).padStart(3, "0")}</text>
  <foreignObject x="250" y="772" width="610" height="92"><div xmlns="http://www.w3.org/1999/xhtml" class="body">Degen ${degen}/100 · Diamond ${diamond}/100 · Airdrop ${airdrop}/100</div></foreignObject>

  <foreignObject x="570" y="933" width="520" height="50"><div xmlns="http://www.w3.org/1999/xhtml" class="label" style="color:#e2c36e">RARITY CLASS · ${tierLabel}</div></foreignObject>
  <foreignObject x="570" y="982" width="700" height="86"><div xmlns="http://www.w3.org/1999/xhtml" style="font:900 64px Georgia,serif;color:${accent};line-height:1;filter:drop-shadow(0 0 10px ${accent})">Rarity: ${rarity}</div></foreignObject>
  <text x="570" y="1084" fill="#e2c36e" font-family="Arial, sans-serif" font-size="25" letter-spacing="2">Supply cap ${supplyCap} · Certified Onchain Record</text>

  ${symptoms.map((tag, i) => `<foreignObject x="${260 + i * 244}" y="1196" width="210" height="48"><div xmlns="http://www.w3.org/1999/xhtml" class="pill" style="text-align:center">${tag}</div></foreignObject>`).join("")}

  <foreignObject x="228" y="1340" width="430" height="78"><div xmlns="http://www.w3.org/1999/xhtml" class="tiny" style="color:${accent}">RECORD ID</div></foreignObject>
  <foreignObject x="228" y="1384" width="430" height="55"><div xmlns="http://www.w3.org/1999/xhtml" style="font:800 30px Arial,sans-serif;color:#dce5e8;letter-spacing:2px">${id}</div></foreignObject>
  <foreignObject x="682" y="1340" width="350" height="78"><div xmlns="http://www.w3.org/1999/xhtml" class="tiny" style="color:${accent}">ATTENDING DOCTOR</div></foreignObject>
  <foreignObject x="682" y="1384" width="350" height="70"><div xmlns="http://www.w3.org/1999/xhtml" style="font:900 52px Arial,sans-serif;color:#f4f6f8">石头</div></foreignObject>
  <foreignObject x="1080" y="1340" width="280" height="78"><div xmlns="http://www.w3.org/1999/xhtml" class="tiny" style="color:${accent}">DATE</div></foreignObject>
  <text x="1080" y="1406" fill="#dce5e8" font-family="Arial, sans-serif" font-size="31" font-weight="800">${date}</text>
  <foreignObject x="228" y="1450" width="1070" height="66"><div xmlns="http://www.w3.org/1999/xhtml" class="verdict">${verdict}</div></foreignObject>
  <text x="420" y="1510" fill="${accent}" font-family="Arial, sans-serif" font-size="24" letter-spacing="5" filter="url(#softGlow)">degendna.fun · Ethereum Sepolia · Onchain Psychiatry</text>
</svg>`;
}

async function safeChainResult(chain, task) {
  try {
    return await task();
  } catch (error) {
    return {
      id: chain.id,
      name: chain.name,
      nativeSymbol: chain.nativeSymbol,
      color: chain.color,
      ok: false,
      source: chain.explorer ? "Blockscout" : "BNB public RPC",
      error: error.message || String(error),
      transactions: [],
      erc20Transfers: [],
      nftTransfers: [],
      tokens: [],
      nftTokens: [],
      errors: [error.message || String(error)]
    };
  }
}

async function fetchChainsForAddress(address) {
  const key = chainCacheKey(address);
  const cached = getCached(chainCache, key);
  if (cached) return { chains: cached, cache: "hit" };
  if (addressInflight.has(key)) {
    const chains = await addressInflight.get(key);
    return { chains: clonePayload(chains), cache: "coalesced" };
  }

  const promise = Promise.all([
    ...BLOCKSCOUT_CHAINS.map((chain) => safeChainResult(chain, () => fetchBlockscoutChain(chain, address))),
    safeChainResult(BNB_CHAIN, () => fetchBnbChain(address))
  ])
    .then((chains) => {
      setCached(chainCache, key, chains, CHAIN_CACHE_TTL_MS);
      return chains;
    })
    .finally(() => {
      addressInflight.delete(key);
    });
  addressInflight.set(key, promise);
  return { chains: clonePayload(await promise), cache: "miss" };
}

async function analyzeWallet(address, lang = "zh") {
  const normalized = normalizeAddress(address);
  const language = normalizeLang(lang);
  const reportKey = reportCacheKey(normalized, language);
  const cachedReport = getCached(reportCache, reportKey);
  if (cachedReport) return { ...cachedReport, cache: "hit" };

  if (analyzeInflight.has(reportKey)) {
    const report = await analyzeInflight.get(reportKey);
    return { ...clonePayload(report), cache: "coalesced" };
  }

  const promise = (async () => {
    const seasonSampleSize = await leaderboardSampleSize();
    const { chains, cache: chainCacheStatus } = await fetchChainsForAddress(normalized);
    const report = {
      ...buildReport(normalized, chains, language, seasonSampleSize),
      cache: chainCacheStatus === "hit" ? "chain-hit" : "miss"
    };
    setCached(reportCache, reportKey, report, cacheTtlForAddress(normalized));
    return report;
  })().finally(() => {
    analyzeInflight.delete(reportKey);
  });

  analyzeInflight.set(reportKey, promise);
  return { ...(await promise), cache: "miss" };
}

function compareReports(a, b, lang = "zh") {
  const aBull = a.scores.degen * 0.55 + a.metrics.txPerDay * 8 + a.metrics.memeTokenCount * 2;
  const bBull = b.scores.degen * 0.55 + b.metrics.txPerDay * 8 + b.metrics.memeTokenCount * 2;
  const aBear = a.scores.diamond * 0.7 + a.metrics.stableRatio * 30 - a.metrics.failedRate * 20;
  const bBear = b.scores.diamond * 0.7 + b.metrics.stableRatio * 30 - b.metrics.failedRate * 20;
  const bullWinner = aBull >= bBull ? "A" : "B";
  const bearWinner = aBear >= bBear ? "A" : "B";
  const otherBull = bullWinner === "A" ? "B" : "A";
  const otherBear = bearWinner === "A" ? "B" : "A";

  return {
    bullWinner,
    bearWinner,
    verdict: pickLocalized(
      lang,
      `${bullWinner} 负责冲锋，${otherBull} 负责在旁边说“我再等等”。链上照妖镜判定：${bullWinner} 更适合牛市热点互殴。`,
      `${bullWinner} handles the charge; ${otherBull} says 'I'll wait'. Degen DNA says ${bullWinner} is more built for bull-market brawls.`
    ),
    survival: pickLocalized(
      lang,
      `${bearWinner} 更像熊市能苟到下一轮的人。${otherBear} 建议不要互相抄作业，容易一起变成链上反面教材。`,
      `${bearWinner} looks more likely to survive a bear market. ${otherBear} should not copy-trade this; both could become onchain cautionary material.`
    )
  };
}

async function handleApi(req, res, pathname, searchParams) {
  if (pathname === "/api/health") {
    return json(res, 200, {
      ok: true,
      service: "onchain-mirror",
      reportVersion: REPORT_VERSION,
      leaderboard: await leaderboardStorageStatus(),
      cache: {
        reports: reportCache.size,
        chains: chainCache.size,
        xProfiles: xProfileCache.size,
        inflightReports: analyzeInflight.size,
        inflightAddresses: addressInflight.size
      },
      integrations: {
        xApi: Boolean(X_BEARER_TOKEN),
        supabase: hasSupabaseLeaderboard(),
        nftClaims: NFT_CLAIM_ENABLED && hasSupabase() && Boolean(SEPOLIA_NFT_CONTRACT_ADDRESS)
      },
      chains: [...BLOCKSCOUT_CHAINS.map((chain) => chain.name), BNB_CHAIN.name]
    });
  }

  if (pathname.startsWith("/api/nft/metadata/")) {
    const id = decodeURIComponent(pathname.replace("/api/nft/metadata/", ""));
    try {
      const row = await fetchNftClaimByFilter({ id });
      if (!row) return json(res, 404, { error: "NFT metadata not found" });
      return json(res, 200, nftMetadataFromRow(row));
    } catch (error) {
      return json(res, 502, { error: error.message || "NFT metadata failed" });
    }
  }

  if (pathname.startsWith("/api/nft/image/")) {
    const id = decodeURIComponent(pathname.replace("/api/nft/image/", "").replace(/\.svg$/i, ""));
    try {
      const row = await fetchNftClaimByFilter({ id });
      if (!row) return json(res, 404, { error: "NFT image not found" });
      res.writeHead(200, {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=3600"
      });
      res.end(nftImageSvg(row));
      return;
    } catch (error) {
      return json(res, 502, { error: error.message || "NFT image failed" });
    }
  }

  if (pathname === "/api/nft/claim") {
    const lang = normalizeLang(searchParams.get("lang"));
    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }
    const limited = rateLimit(req, "nft-claim", { limit: 5, windowMs: HOUR_MS });
    if (!limited.ok) {
      res.setHeader("retry-after", String(limited.retryAfter));
      return json(res, 429, { error: pickLocalized(lang, RATE_LIMIT_MESSAGE_ZH, RATE_LIMIT_MESSAGE_EN), retryAfter: limited.retryAfter });
    }
    try {
      const body = await readJsonBody(req);
      return json(res, 200, await submitNftClaim({
        address: body.address,
        receiver: body.receiver,
        username: body.username,
        lang: normalizeLang(body.lang || lang)
      }));
    } catch (error) {
      return json(res, 400, { error: error.message || pickLocalized(lang, "NFT 领取失败。", "NFT claim failed.") });
    }
  }

  if (pathname === "/api/x-profile") {
    const lang = normalizeLang(searchParams.get("lang"));
    const profile = await resolveXProfile(searchParams.get("username"));
    if (!profile) {
      return json(res, 400, { error: pickLocalized(lang, "请输入有效的 @X 用户名。", "Enter a valid @X username.") });
    }
    return json(res, 200, profile);
  }

  if (pathname === "/api/x-avatar") {
    await serveXAvatar(res, searchParams.get("username"));
    return;
  }

  if (pathname === "/api/leaderboard") {
    const lang = normalizeLang(searchParams.get("lang"));
    if (req.method === "GET") {
      const entries = publicLeaderboard(await readLeaderboard());
      return json(res, 200, { entries, categories: leaderboardCategories(entries) });
    }
    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
    }
    const limited = rateLimit(req, "leaderboard-post", { limit: 10, windowMs: HOUR_MS });
    if (!limited.ok) {
      res.setHeader("retry-after", String(limited.retryAfter));
      return json(res, 429, { error: pickLocalized(lang, RATE_LIMIT_MESSAGE_ZH, RATE_LIMIT_MESSAGE_EN), retryAfter: limited.retryAfter });
    }
    try {
      const body = await readJsonBody(req);
      return json(res, 200, await submitLeaderboardEntry({
        address: body.address,
        username: body.username,
        lang: normalizeLang(body.lang || lang)
      }));
    } catch (error) {
      return json(res, 400, { error: error.message || pickLocalized(lang, "上榜失败。", "Leaderboard submission failed.") });
    }
  }

  if (pathname === "/api/analyze") {
    const lang = normalizeLang(searchParams.get("lang"));
    const limited = rateLimit(req, "analyze", { limit: 5, windowMs: MINUTE_MS });
    if (!limited.ok) {
      res.setHeader("retry-after", String(limited.retryAfter));
      return json(res, 429, { error: pickLocalized(lang, RATE_LIMIT_MESSAGE_ZH, RATE_LIMIT_MESSAGE_EN), retryAfter: limited.retryAfter });
    }
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
    const limited = rateLimit(req, "compare", { limit: 3, windowMs: MINUTE_MS });
    if (!limited.ok) {
      res.setHeader("retry-after", String(limited.retryAfter));
      return json(res, 429, { error: pickLocalized(lang, RATE_LIMIT_MESSAGE_ZH, RATE_LIMIT_MESSAGE_EN), retryAfter: limited.retryAfter });
    }
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
