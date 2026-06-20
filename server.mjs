import { createServer } from "node:http";
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
      zh: "你的钱包像半夜起来开仓，醒来只剩一张链上精神病历。",
      en: "This wallet trades like it opens positions while sleepwalking and wakes up to an onchain medical record."
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

function normalizeXUsername(input) {
  const value = String(input || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  return /^[A-Za-z0-9_]{1,15}$/.test(value) ? value : "";
}

function buildXProfile(username) {
  const normalized = normalizeXUsername(username);
  if (!normalized) return null;
  return {
    username: normalized,
    handle: `@${normalized}`,
    name: `@${normalized}`,
    avatarUrl: `https://unavatar.io/x/${encodeURIComponent(normalized)}`,
    profileUrl: `https://x.com/${encodeURIComponent(normalized)}`
  };
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
  if (metrics.portfolioUsd > 100_000 && scores.degen > 68) picks.push(PERSONALITIES.whaleCosplay, EXTRA_PERSONALITIES.treasuryNightMarket);
  if (metrics.failedRate > 0.18) {
    picks.push(PERSONALITIES.gasArsonist, PERSONALITIES.contractButtonMasher, EXTRA_PERSONALITIES.stopLossMissingPerson, EXTRA_PERSONALITIES.contractExorcist);
  }
  if (metrics.methodCounts.swap > 8) {
    picks.push(PERSONALITIES.pressure, PERSONALITIES.contractButtonMasher, EXTRA_PERSONALITIES.mouseFingerAthlete, EXTRA_PERSONALITIES.leverageSleepwalker);
  }
  if (metrics.methodCounts.swap > 4 && scores.degen > 60) {
    picks.push(EXTRA_PERSONALITIES.fomoCardiacPatient, EXTRA_PERSONALITIES.chartPossessed, EXTRA_PERSONALITIES.notificationAddict);
  }
  if (metrics.methodCounts.defi > 6) picks.push(PERSONALITIES.yieldFarmGhost, EXTRA_PERSONALITIES.liquidityPoolLifeguard, EXTRA_PERSONALITIES.liquidityBlackHole);
  if (scores.airdrop > 68 && metrics.chainsWithActivity >= 4) {
    picks.push(PERSONALITIES.airdrop, PERSONALITIES.bridgeNomad, PERSONALITIES.questNPC, EXTRA_PERSONALITIES.airdropReceiptCollector, EXTRA_PERSONALITIES.bridgeStampCollector, EXTRA_PERSONALITIES.protocolDoorKnocker, EXTRA_PERSONALITIES.multiChainVagrant);
  }
  if (metrics.nftTransferCount > metrics.sampledTxs && metrics.nftTransferCount > 8) {
    picks.push(PERSONALITIES.nftGhost, PERSONALITIES.jpgArchaeologist, EXTRA_PERSONALITIES.nftMemoryPalace, EXTRA_PERSONALITIES.jpgBagHistorian);
  }
  if (scores.diamond > 78 && metrics.txPerDay < 1.2) {
    picks.push(PERSONALITIES.diamond, PERSONALITIES.timeCapsuleHolder, PERSONALITIES.bagMonk, EXTRA_PERSONALITIES.bearMarketPretendDead, EXTRA_PERSONALITIES.exitButtonPhilosopher);
  }
  if (metrics.stableRatio > 0.68 && scores.degen < 45) {
    picks.push(PERSONALITIES.stable, PERSONALITIES.stablecoinMonk, EXTRA_PERSONALITIES.stablecoinZenGarden, EXTRA_PERSONALITIES.usdtParkingLotGuard);
  }
  if (metrics.memeTokenCount >= 8 && scores.degen > 70) {
    picks.push(PERSONALITIES.memeSoldier, PERSONALITIES.dogcoinSurgeon, PERSONALITIES.liquidityDiver, EXTRA_PERSONALITIES.greenCandleAllergy, EXTRA_PERSONALITIES.bullMarketHallucination, EXTRA_PERSONALITIES.chainPsychWardVIP);
  }
  if (metrics.memeRatio > 0.45 && metrics.lowLiquidityTokenCount > 4) {
    picks.push(PERSONALITIES.topBuyer, PERSONALITIES.greenCandleRomantic, PERSONALITIES.exitLiquidityPoet, EXTRA_PERSONALITIES.liquidityExitVolunteer, EXTRA_PERSONALITIES.lateCycleRomantic, EXTRA_PERSONALITIES.dipBuyerOnRooftop);
  }
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 4 && metrics.uniqueTokenCount > 12) {
    picks.push(PERSONALITIES.collector, PERSONALITIES.dustMuseum, EXTRA_PERSONALITIES.dustPositionBuddha, EXTRA_PERSONALITIES.approvalArchaeologist);
  }
  if (metrics.lowLiquidityTokenCount >= 8) {
    picks.push(EXTRA_PERSONALITIES.liquidityBlackHole, EXTRA_PERSONALITIES.mevSnack, EXTRA_PERSONALITIES.walletAutopsyIntern);
  }
  if (metrics.bluechipTokenCount >= 2 && scores.degen < 55) picks.push(PERSONALITIES.bluechipTourist, EXTRA_PERSONALITIES.smartMoneyCosplayer);
  if (metrics.uniqueTokenCount > 24 && scores.degen < 65) picks.push(PERSONALITIES.dustMuseum, EXTRA_PERSONALITIES.walletPersonalityCrisis);
  if (scores.degen > 80) {
    picks.push(EXTRA_PERSONALITIES.degenMedicalRecord, EXTRA_PERSONALITIES.chainPsychWardVIP, EXTRA_PERSONALITIES.portfolioJengaPlayer);
  }
  if (scores.degen < 25) picks.push(PERSONALITIES.civilServant, PERSONALITIES.coldWalletMonk, EXTRA_PERSONALITIES.usdtParkingLotGuard);
  if (scores.degen < 42) picks.push(PERSONALITIES.conservative, PERSONALITIES.riskCommittee, EXTRA_PERSONALITIES.stablecoinZenGarden);
  if (!picks.length) {
    picks.push(PERSONALITIES.normal, PERSONALITIES.groupChatIndicator, PERSONALITIES.halfThesisBeliever, EXTRA_PERSONALITIES.thesisAfterBuy, EXTRA_PERSONALITIES.narrativeHostage, EXTRA_PERSONALITIES.kolShadowTrader, EXTRA_PERSONALITIES.reverseIndicatorOracle, EXTRA_PERSONALITIES.pnlFogMachine, EXTRA_PERSONALITIES.candleWorshipper);
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
        zh: "样本里还看不出稳定持仓周期，像刚挂号还没进诊室。",
        en: "The sample does not reveal a stable holding period yet; the wallet is checked in but not examined."
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
      zh: `链上数据显示：你不是没有判断力，你只是把判断力经常外包给热闹。`,
      en: "Onchain evidence suggests you have judgment; you just outsource it to noise too often."
    }
  ]);
  const abstract = pickStableLocalized(address, "verdict-abstract", lang, [
    {
      zh: `钱包状态：阳线过敏，阴线失忆，止损功能疑似离家出走。Degen 指数 ${scores.degen}/100，建议挂链上精神科。`,
      en: `Wallet status: allergic to green candles, amnesiac on red candles, stop-loss missing. Degen Index ${scores.degen}/100.`
    },
    {
      zh: `这不是财务报告，这是链上精神病历：症状稳定，病因复杂，复发概率取决于群友截图。`,
      en: "This is not a financial report. It is an onchain medical file: stable symptoms, complex causes, relapse triggered by screenshots."
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
  const { address, lang, lossCause, metrics } = context;
  if (mode === "normal") return lossCause;
  const bank = {
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
      }
    ]
  };

  if (metrics.lowLiquidityTokenCount >= 8 && mode !== "normal") {
    return pickLocalized(lang, "流动性像地下室，你进去的时候很丝滑，出来的时候开始研究人生。", "liquidity behaves like a basement: easy to enter, philosophical to exit");
  }
  return pickStableLocalized(address, `loss-cause-${mode}`, lang, bank[mode] || bank.roast);
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
      }
    ]),
    abstract: pickStableLocalized(address, "asset-abstract", lang, [
      {
        zh: `资产性格：K 线附体，叙事中毒，仓位偶尔出现短暂清醒。`,
        en: "Asset personality: chart-possessed, narrative-intoxicated, occasionally visited by short bursts of clarity."
      },
      {
        zh: `钱包像一张链上精神病历，主诉是“我再也不追高了”，复诊记录是“又追了”。`,
        en: "The wallet reads like an onchain medical file: chief complaint 'never chasing again', follow-up note 'chased again'."
      },
      {
        zh: `资产组合呈现出一种抽象的自洽：哪里能讲故事，哪里就能住一点本金。`,
        en: "The allocation has abstract coherence: wherever a story can live, some capital can rent a room."
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
      }
    ],
    abstract: [
      {
        zh: "链上精神病历新增一页：阳线过敏复发，止损按钮继续失联。",
        en: "the onchain medical file gains a new page: green-candle allergy relapsed, stop-loss still missing"
      },
      {
        zh: "钱包进入薛定谔盈利状态：不打开组合就永远没亏。",
        en: "wallet enters Schroedinger PnL: as long as the portfolio stays closed, the loss is not real"
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
        zh: `链上精神科建议：趋势跟随可以，叙事上头时需要 Hermes 做第二监护人。`,
        en: "Onchain psychiatry suggests: trend following is fine; Hermes should supervise during narrative intoxication."
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
      }
    ])
  };
  return diagnosis[mode] || diagnosis.normal;
}

function buildTweetText(mode, context) {
  const { lang, personality, scores, lossCause, verdict, rarity, badges = [] } = context;
  const badgeLine = badges.slice(0, 3).map((badge) => badge.name).join(" / ");
  if (lang === "en") {
    return `My Degen DNA report is out.
Type: ${personality}
Rarity: ${rarity?.tierName || "Rare"} · combo occurrence ${rarity?.combo?.appearanceRate || "--"}%
Badges: ${badgeLine}
Degen Index: ${scores.degen}/100
Diamond Hands: ${scores.diamond}/100
Main leak: ${lossCause}

${verdict}

Dare to test yours?
degendna.fun`;
  }
  return `我刚用链上照妖镜测了一下钱包。
钱包人格：${personality}
稀有度：${rarity?.tierName || "链上异类"} · 组合出现率 ${rarity?.combo?.appearanceRate || "--"}%
核心徽章：${badgeLine}
Degen 指数：${scores.degen}/100
钻石手指数：${scores.diamond}/100
亏损主因：${lossCause}

${verdict}

你敢照吗？
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
  if (seasonSampleSize < 1000) {
    add("genesis-tester", "第一批照妖者", "Genesis Tester", "Season 0 早期照妖记录，适合以后拿出来嘴硬。", "An early Season 0 scan, useful for future bragging rights.", 2.2);
  }

  const fillers = [
    ["market-educated", "被市场教育过，但没完全服", "Educated, Not Convinced", "市场讲过课，但钱包还在补考。", "The market gave lessons; the wallet is still retaking the exam.", 13.5],
    ["wallet-autopsy", "链上精神病历在逃页", "Escaped Medical File Page", "这个钱包不一定离谱，但很适合截图会诊。", "The wallet is not always absurd, but it is excellent screenshot material.", 10.8],
    ["exit-button-tourist", "退出按钮游客", "Exit Button Tourist", "知道哪里是出口，但经常只是路过。", "It knows where the exit is, but often just walks past.", 11.6],
    ["groupchat-echo", "群友回声定位", "Groupchat Echolocation", "交易信号和群聊情绪之间存在神秘同步。", "Trading signals and group-chat mood show suspicious synchronization.", 9.9]
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
    }
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
  if (scores.degen > 80) labels.push(pickLocalized(lang, "链上精神病历", "Onchain Medical File"));
  if (scores.degen > 75 && metrics.memeTokenCount >= 4) labels.push(pickLocalized(lang, "阳线过敏", "Green Candle Allergy"));
  if (metrics.failedRate > 0.12) labels.push(pickLocalized(lang, "止损失联", "Stop-Loss Missing"));
  if (metrics.lowLiquidityTokenCount >= 8) labels.push(pickLocalized(lang, "流动性黑洞", "Liquidity Black Hole"));
  if (metrics.methodCounts.bridge > 2) labels.push(pickLocalized(lang, "跨链流浪", "Multi-Chain Vagrant"));
  if (metrics.methodCounts.claim > 1) labels.push(pickLocalized(lang, "任务清单成瘾", "Quest List Addict"));
  if (metrics.outgoingTransfers < metrics.incomingTransfers / 5) labels.push(pickLocalized(lang, "只进不出", "Entry-Only Mode"));
  if (metrics.txPerDay > 2.5) labels.push(pickLocalized(lang, "手速快过脑速", "Finger Faster Than Brain"));
  return [...new Set(labels)].slice(0, 6);
}

function buildReport(address, chains, lang = "zh", seasonSampleSize = 0) {
  const metrics = buildMetrics(address, chains);
  const scores = scoreWallet(metrics);
  const personalityId = choosePersonality(metrics, scores, address);
  const personality = personalityName(personalityId, lang);
  const lossCause = buildLossCause(metrics, scores, lang);
  const verdict = buildVerdict(personalityId, metrics, scores, lang);
  const labels = buildLabels(personalityId, metrics, scores, lang);
  const badges = buildBadges(metrics, scores, address, lang, seasonSampleSize);
  const rarity = buildRarity(metrics, scores, personality, badges, address, lang, seasonSampleSize);
  const context = { address, lang, metrics, scores, personalityId, personality, lossCause, verdict, labels, badges, rarity };
  const modes = buildReportModes(context);
  const defaultMode = "abstract";
  const compositeRankScore = rankScore(metrics, scores, address);

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
      .flatMap((chain) => chain.errors || (chain.error ? [chain.error] : []))
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

function hasSupabaseLeaderboard() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function supabaseLeaderboardUrl() {
  return `${SUPABASE_URL}/rest/v1/${encodeURIComponent(SUPABASE_LEADERBOARD_TABLE)}`;
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    ...extra
  };
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

  const response = await fetch(url, {
    headers: supabaseHeaders()
  });
  if (!response.ok) {
    throw new Error(`Supabase leaderboard read failed: ${response.status} ${await response.text()}`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(fromDbRow) : [];
}

async function writeSupabaseLeaderboard(entries) {
  const response = await fetch(`${supabaseLeaderboardUrl()}?on_conflict=id`, {
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

async function submitLeaderboardEntry({ address, lang, username }) {
  const normalizedAddress = normalizeAddress(address);
  const profile = buildXProfile(username);
  if (!isAddress(normalizedAddress) || !profile) {
    throw new Error(pickLocalized(lang, "请输入有效的钱包地址和 @X 用户名。", "Enter a valid wallet address and @X username."));
  }

  const report = await analyzeWallet(normalizedAddress, lang);
  if (report.metrics.txCount < 20 || report.metrics.sampleWindowDays < 30) {
    throw new Error(pickLocalized(
      lang,
      "这个钱包样本太薄，可以生成链上精神病历，但暂时不能进入稀有度排行榜。",
      "This wallet can generate a report, but the sample is too thin for the rarity leaderboard."
    ));
  }
  const entry = {
    id: `${profile.username.toLowerCase()}:${normalizedAddress.toLowerCase()}`,
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
  const next = publicLeaderboard([
    entry,
    ...current.filter((item) => item.id !== entry.id)
  ]);
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

async function analyzeWallet(address, lang = "zh") {
  const normalized = normalizeAddress(address);
  const language = normalizeLang(lang);
  const seasonSampleSize = await leaderboardSampleSize();
  const key = `chains:${normalized.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return { ...buildReport(normalized, cached.chains, language, seasonSampleSize), cache: "hit" };
  }

  const chainResults = await Promise.all([
    ...BLOCKSCOUT_CHAINS.map((chain) => fetchBlockscoutChain(chain, normalized)),
    fetchBnbChain(normalized)
  ]);
  cache.set(key, { createdAt: Date.now(), chains: chainResults });
  return { ...buildReport(normalized, chainResults, language, seasonSampleSize), cache: "miss" };
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
      `${bearWinner} 更像熊市能苟到下一轮的人。${otherBear} 建议不要互相抄作业，容易一起写进链上精神病历。`,
      `${bearWinner} looks more likely to survive a bear market. ${otherBear} should not copy-trade this; both could end up in the onchain medical file.`
    )
  };
}

async function handleApi(req, res, pathname, searchParams) {
  if (pathname === "/api/health") {
    return json(res, 200, {
      ok: true,
      service: "onchain-mirror",
      leaderboard: await leaderboardStorageStatus(),
      chains: [...BLOCKSCOUT_CHAINS.map((chain) => chain.name), BNB_CHAIN.name]
    });
  }

  if (pathname === "/api/x-profile") {
    const lang = normalizeLang(searchParams.get("lang"));
    const profile = buildXProfile(searchParams.get("username"));
    if (!profile) {
      return json(res, 400, { error: pickLocalized(lang, "请输入有效的 @X 用户名。", "Enter a valid @X username.") });
    }
    return json(res, 200, profile);
  }

  if (pathname === "/api/leaderboard") {
    const lang = normalizeLang(searchParams.get("lang"));
    if (req.method === "GET") {
      return json(res, 200, { entries: publicLeaderboard(await readLeaderboard()) });
    }
    if (req.method !== "POST") {
      return json(res, 405, { error: "Method not allowed" });
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
