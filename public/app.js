import {
  MENTAL_EN,
  localizeMentalMode,
  localizeMentalModule,
  localizeMentalQuestion,
  localizePersonaDimension,
  localizePersonaType,
  mentalLocale
} from "./mental-i18n.js?v=20260722-bilingual-v158";

const form = document.querySelector("#scan-form");
const addressInput = document.querySelector("#wallet-address");
const xHandleInput = document.querySelector("#x-handle");
const statusLine = document.querySelector("#form-status");
const languageButton = document.querySelector("#language-toggle");
const languageCurrent = document.querySelector("[data-language-current]");
const menuButton = document.querySelector(".menu-button");
const topMoreMenu = document.querySelector("[data-top-more-menu]");
const navButtons = [...document.querySelectorAll("[data-page-target]")];
const degenNavButtons = [...document.querySelectorAll("[data-degen-persona-nav]")];
const xiaojingNavButtons = [...document.querySelectorAll("[data-xiaojing-nav]")];
const menuPageButtons = [...document.querySelectorAll("[data-menu-page-target]")];
const routeLinks = [...document.querySelectorAll("[data-route]")];

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const LANG_KEY = "degendna-home-language";
const LOCAL_LEADERBOARD_KEY = "degendna:wallet-leaderboard:v1";
const COMMUNITY_REPORT_BASE = 10231;
const COMMUNITY_VISIT_KEY = "degendna:community-visits:v1";
const COMMUNITY_SESSION_KEY = "degendna:community-visit-session:v1";
const PAGE_NAMES = ["home", "report", "report-detail", "wallet", "rarity", "psyche", "psyche-test", "about"];
const STAGE_DESIGNS = {
  home: { width: 1586, height: 992 },
  app: { width: 1586, height: 992 }
};

const I18N = {
  zh: {
    "brand.name": "链上照妖镜",
    "nav.home": "首页",
    "nav.wallet": "钱包PK",
    "nav.degenPersona": "交易人格自查",
    "nav.xiaojing": "小镜 AI",
    "nav.rank": "稀有度榜",
    "nav.test": "心理自测中心",
    "nav.about": "关于",
    "language.aria": "切换语言",
    "language.current": "中文",
    "hero.chip": "链上精神健康诊断终端",
    "hero.titleTop": "输入地址，",
    "hero.titleBottom": "照出链上病历。",
    "hero.lead": "链上数据不会撒谎，但文案会补刀。",
    "hero.note": "Onchain Clinic · 首个区块链心理状态分析与病历生成系统",
    "form.title": "患者信息录入",
    "form.sub": "Patient Intake · Public Data Only",
    "form.wallet": "EVM 钱包地址",
    "form.x": "X 用户名（可选）",
    "form.submit": "开始扫描 / 生成链上病历",
    "trust.keys": "不存储私钥",
    "trust.read": "只读链上数据",
    "trust.privacy": "100% 隐私保护",
    "scan.title": "大脑 · DNA 扫描中",
    "scan.ekg": "心电图 EKG",
    "scan.wave": "脑波 BRAINWAVE",
    "scan.status": "扫描状态 SCAN STATUS",
    "scan.source": "数据源 DATA SOURCE",
    "scan.case": "病例编号 / CASE ID",
    "symptoms.title": "症状标签",
    "symptoms.overthinking": "过度脑补",
    "symptoms.volatility": "波动焦虑",
    "symptoms.fomo": "踏空恐惧",
    "symptoms.sleep": "土狗失眠",
    "symptoms.hopium": "希望麻醉",
    "symptoms.more": "查看更多 +",
    "cap.engine": "数据分析引擎",
    "cap.privacy": "隐私保护",
    "cap.zk": "零知识分析",
    "cap.zkSub": "100% 隐私保护",
    "cap.case": "病例生成",
    "cap.ai": "AI 模型驱动",
    "cap.aiSub": "链上行为心理分析",
    "cap.report": "可信报告",
    "cap.verify": "可验证 · 不可篡改",
    "cap.verifySub": "上链存证",
    "cap.community": "社区信任",
    "cap.count": "10,231+ 份报告",
    "cap.countSub": "来自全球患者",
    "wallet.title": "钱包 PK 病区",
    "wallet.lead": "输入两个地址，对比链上人格、交易冲动和胜率诊断。",
    "wallet.aLabel": "左侧患者钱包",
    "wallet.bLabel": "右侧患者钱包",
    "wallet.run": "启动链上会诊",
    "wallet.left": "左侧钱包",
    "wallet.right": "右侧钱包",
    "wallet.leftTrait": "钻石手偏执型",
    "wallet.rightTrait": "FOMO 冲动型",
    "wallet.metric1": "胜率诊断",
    "wallet.metric1Value": "左侧钱包更稳，右侧钱包更会整活。",
    "wallet.metric2": "亏损免疫",
    "wallet.metric2Value": "双方均存在追涨后遗症。",
    "wallet.metric3": "治疗建议",
    "wallet.metric3Value": "减少凌晨三点下单，增加睡眠。",
    "rarity.title": "稀有度排行榜",
    "rarity.lead": "按链上行为样本，把患者分成珍稀病症、常见病症和高危病症。",
    "rarity.filterAll": "全部",
    "rarity.filterRare": "稀有症状",
    "rarity.filterRisk": "高危行为",
    "rarity.rank1": "冷钱包隐士",
    "rarity.rank1Note": "三年无卖出，疑似已飞升。",
    "rarity.rank2": "凌晨梭哈者",
    "rarity.rank2Note": "Gas 高峰期仍坚持冲锋。",
    "rarity.rank3": "空投考古学家",
    "rarity.rank3Note": "钱包里全是早期足迹。",
    "rarity.rank4": "土狗连环追踪者",
    "rarity.rank4Note": "买入速度超过思考速度。",
    "rarity.readout": "当前样本",
    "rarity.readoutNote": "筛选会同步更新病症样本池。",
    "psyche.title": "链上心理自测",
    "psyche.lead": "回答三个症状问题，生成你的链上精神状态快照。",
    "psyche.question": "看到代币突然拉升 40%，你的第一反应是？",
    "psyche.option1": "先看链上数据",
    "psyche.option2": "先冲一点再说",
    "psyche.option3": "满仓，命运会眷顾我",
    "psyche.resultLabel": "精神波动指数",
    "psyche.defaultDiagnosis": "轻度 FOMO，建议先喝水再交易。",
    "psyche.calmDiagnosis": "状态稳定，适合担任朋友群风控。",
    "psyche.hotDiagnosis": "中度冲动，建议把买入键冷藏十分钟。",
    "psyche.maxDiagnosis": "重度上头，今日处方：断网、睡觉、明天再看。",
    "psyche.therapy1": "睡前禁盘",
    "psyche.therapy1Text": "睡前 30 分钟不看 K 线。",
    "psyche.therapy2": "仓位处方",
    "psyche.therapy2Text": "单次冲动仓位不超过 12%。",
    "psyche.therapy3": "复盘治疗",
    "psyche.therapy3Text": "每周导出一次链上病历。",
    "about.title": "关于链上照妖镜",
    "about.lead": "我们把公开链上数据翻译成更好笑、更好懂、也更扎心的行为报告。",
    "about.mission1": "只读公开数据",
    "about.mission1Text": "不连接钱包、不索要签名、不触碰私钥。",
    "about.mission2": "医疗风叙事",
    "about.mission2Text": "用诊断报告的形式呈现链上人格。",
    "about.mission3": "社区可玩性",
    "about.mission3Text": "适合分享、PK、排行榜和自测扩展。",
    "about.step1": "采集公开足迹",
    "about.step1Text": "读取交易、交互和资产行为。",
    "about.step2": "生成心理画像",
    "about.step2Text": "映射成 FOMO、钻石手、波动焦虑等标签。",
    "about.step3": "输出链上病历",
    "about.step3Text": "生成可分享的赛博医疗报告。",
    "status.invalid": "请输入有效的 EVM 钱包地址。",
    "status.success": "扫描任务已接收：读取公开链上数据，不连接钱包，不需要签名。",
    "status.menu": "扩展入口已展开，可进入钱包 PK 与稀有度榜。",
    "status.pk": "会诊完成：两侧钱包已生成链上人格对比。",
    "status.rarity": "排行榜样本已切换。",
    "status.psyche": "心理波动指数已更新。"
  },
  en: {
    "brand.name": "Degen DNA",
    "nav.home": "Home",
    "nav.wallet": "Wallet PK",
    "nav.degenPersona": "Trading Persona",
    "nav.xiaojing": "Xiaojing AI",
    "nav.rank": "Rarity Rank",
    "nav.test": "Psyche Test Center",
    "nav.about": "About",
    "language.aria": "Switch language",
    "language.current": "EN",
    "hero.chip": "Onchain Mental Health Terminal",
    "hero.titleTop": "Enter address,",
    "hero.titleBottom": "reveal the record.",
    "hero.lead": "Onchain data does not lie. The diagnosis adds the sting.",
    "hero.note": "Onchain Clinic · A blockchain psyche analysis and case-report system",
    "form.title": "Patient Intake",
    "form.sub": "Public Data Only",
    "form.wallet": "EVM Wallet Address",
    "form.x": "X Username (Optional)",
    "form.submit": "Start Scan / Generate Report",
    "trust.keys": "No private keys stored",
    "trust.read": "Read-only onchain data",
    "trust.privacy": "100% privacy protected",
    "scan.title": "Brain · DNA Mapping",
    "scan.ekg": "EKG",
    "scan.wave": "Brainwave",
    "scan.status": "SCAN STATUS",
    "scan.source": "DATA SOURCE",
    "scan.case": "CASE ID",
    "symptoms.title": "Symptom Tags",
    "symptoms.overthinking": "Overthinking",
    "symptoms.volatility": "Volatility Anxiety",
    "symptoms.fomo": "FOMO",
    "symptoms.sleep": "Degen Sleep",
    "symptoms.hopium": "Hopium Dependence",
    "symptoms.more": "View More +",
    "cap.engine": "Analysis Engine",
    "cap.privacy": "Privacy Guard",
    "cap.zk": "Zero-knowledge Analysis",
    "cap.zkSub": "100% privacy protected",
    "cap.case": "Case Generator",
    "cap.ai": "AI Model Driven",
    "cap.aiSub": "Behavioral psyche analysis",
    "cap.report": "Trusted Report",
    "cap.verify": "Verifiable · Immutable",
    "cap.verifySub": "Onchain attestation",
    "cap.community": "Community Trust",
    "cap.count": "10,231+ Reports",
    "cap.countSub": "From global patients",
    "wallet.title": "Wallet PK Ward",
    "wallet.lead": "Compare two wallets by onchain personality, trading impulse, and survival odds.",
    "wallet.aLabel": "Left patient wallet",
    "wallet.bLabel": "Right patient wallet",
    "wallet.run": "Start Onchain Consult",
    "wallet.left": "Left Wallet",
    "wallet.right": "Right Wallet",
    "wallet.leftTrait": "Diamond-hand obsessive",
    "wallet.rightTrait": "FOMO impulse type",
    "wallet.metric1": "Win-rate diagnosis",
    "wallet.metric1Value": "Left wallet is steadier; right wallet is more chaotic.",
    "wallet.metric2": "Loss immunity",
    "wallet.metric2Value": "Both show post-pump chasing symptoms.",
    "wallet.metric3": "Treatment",
    "wallet.metric3Value": "Reduce 3 a.m. orders and increase sleep.",
    "rarity.title": "Rarity Leaderboard",
    "rarity.lead": "Classify patients into rare symptoms, common disorders, and high-risk behavior.",
    "rarity.filterAll": "All",
    "rarity.filterRare": "Rare Symptoms",
    "rarity.filterRisk": "High Risk",
    "rarity.rank1": "Cold-wallet Hermit",
    "rarity.rank1Note": "No sells for three years. Possible ascension.",
    "rarity.rank2": "Midnight Ape",
    "rarity.rank2Note": "Still charges during peak gas.",
    "rarity.rank3": "Airdrop Archaeologist",
    "rarity.rank3Note": "Wallet full of early footprints.",
    "rarity.rank4": "Meme-chain Tracker",
    "rarity.rank4Note": "Buys faster than thoughts can form.",
    "rarity.readout": "Current sample",
    "rarity.readoutNote": "Filters update the symptom sample pool.",
    "psyche.title": "Onchain Psyche Test",
    "psyche.lead": "Answer the symptom prompt and generate your onchain mental snapshot.",
    "psyche.question": "A token suddenly pumps 40%. What is your first reaction?",
    "psyche.option1": "Check onchain data first",
    "psyche.option2": "Buy a little, then think",
    "psyche.option3": "Full send. Destiny loves me",
    "psyche.resultLabel": "Volatility Index",
    "psyche.defaultDiagnosis": "Mild FOMO. Drink water before trading.",
    "psyche.calmDiagnosis": "Stable state. Suitable as group risk officer.",
    "psyche.hotDiagnosis": "Moderate impulse. Freeze the buy button for ten minutes.",
    "psyche.maxDiagnosis": "Severe overheat. Prescription: disconnect, sleep, check tomorrow.",
    "psyche.therapy1": "No charts before bed",
    "psyche.therapy1Text": "No candles 30 minutes before sleep.",
    "psyche.therapy2": "Position prescription",
    "psyche.therapy2Text": "Impulse trades capped at 12%.",
    "psyche.therapy3": "Review therapy",
    "psyche.therapy3Text": "Export one onchain report weekly.",
    "about.title": "About Degen DNA",
    "about.lead": "We translate public onchain data into funnier, clearer, sharper behavior reports.",
    "about.mission1": "Public data only",
    "about.mission1Text": "No wallet connection, no signatures, no private keys.",
    "about.mission2": "Medical narrative",
    "about.mission2Text": "Onchain personality presented as a diagnostic report.",
    "about.mission3": "Community-native",
    "about.mission3Text": "Built for sharing, PK battles, rankings, and self-tests.",
    "about.step1": "Collect public traces",
    "about.step1Text": "Read transactions, interactions, and asset behavior.",
    "about.step2": "Generate psyche profile",
    "about.step2Text": "Map actions into FOMO, diamond hands, volatility anxiety, and more.",
    "about.step3": "Output onchain record",
    "about.step3Text": "Generate a shareable cyber-medical report.",
    "status.invalid": "Please enter a valid EVM wallet address.",
    "status.success": "Scan received: reading public onchain data only. No wallet connection or signature needed.",
    "status.menu": "Expanded menu opened. Wallet PK and Rarity Rank are available here.",
    "status.pk": "Consult complete: wallet comparison generated.",
    "status.rarity": "Leaderboard sample switched.",
    "status.psyche": "Psyche volatility index updated."
  }
};

let currentLang = readStoredLang() === "en" ? "en" : "zh";
let currentPage = pageFromHash();
let stageScaleFrame = 0;
let communityVisitCount = recordCommunityVisit();

function recordCommunityVisit() {
  try {
    const visits = Number.parseInt(window.localStorage?.getItem(COMMUNITY_VISIT_KEY) || "0", 10) || 0;
    if (window.sessionStorage?.getItem(COMMUNITY_SESSION_KEY) === "1") return visits;
    const nextVisits = visits + 1;
    window.localStorage?.setItem(COMMUNITY_VISIT_KEY, String(nextVisits));
    window.sessionStorage?.setItem(COMMUNITY_SESSION_KEY, "1");
    return nextVisits;
  } catch {
    return 0;
  }
}

function readStoredLang() {
  try {
    return window.localStorage?.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

function writeStoredLang(value) {
  try {
    window.localStorage?.setItem(LANG_KEY, value);
  } catch {
    // Storage can be unavailable in restricted previews; the live toggle still works.
  }
}

function pageFromHash() {
  const page = window.location.hash.replace(/^#/, "").split("?", 1)[0];
  return PAGE_NAMES.includes(page) ? page : "home";
}

function mentalRouteFromHash() {
  const rawHash = window.location.hash.replace(/^#/, "");
  const [page, queryString = ""] = rawHash.split("?");
  if (page !== "psyche-test") return null;
  const query = new URLSearchParams(queryString);
  return {
    mode: query.get("mode") === "degen-persona" ? "degen-persona" : ""
  };
}

function reportDetailRoute() {
  const rawHash = window.location.hash.replace(/^#/, "");
  const [page, queryString = ""] = rawHash.split("?");
  if (page !== "report-detail") return null;

  const query = new URLSearchParams(queryString);
  const address = query.get("address")?.trim() || "";
  return {
    address: EVM_ADDRESS.test(address) ? address : "",
    handle: query.get("handle")?.trim() || ""
  };
}

function reportDetailUrl() {
  const query = new URLSearchParams();
  const address = activeReportIdentity.rawWallet?.trim();
  const handle = normalizeHandle(activeReportIdentity.handle, "");

  if (EVM_ADDRESS.test(address || "")) query.set("address", address);
  if (handle && handle !== "@handle") query.set("handle", handle);

  const hash = query.toString() ? `#report-detail?${query.toString()}` : "#report-detail";
  return `${window.location.origin}${window.location.pathname}${hash}`;
}

function stageDesignForPage(page = document.body.dataset.page || currentPage) {
  return page === "home" ? STAGE_DESIGNS.home : STAGE_DESIGNS.app;
}

function updateViewportStageScale(page = document.body.dataset.page || currentPage) {
  const design = stageDesignForPage(page);
  const viewportWidth = Math.max(320, window.innerWidth || design.width);
  const viewportHeight = Math.max(320, window.innerHeight || design.height);
  const scale = Math.min(viewportWidth / design.width, viewportHeight / design.height);
  const offsetY = Math.max(0, (viewportHeight - design.height * scale) / 2);
  const root = document.documentElement;

  root.style.setProperty("--app-stage-design-width", `${design.width}px`);
  root.style.setProperty("--app-stage-design-height", `${design.height}px`);
  root.style.setProperty("--app-stage-scale", scale.toFixed(5));
  root.style.setProperty("--app-stage-offset-y", `${offsetY.toFixed(2)}px`);
}

function queueViewportStageScale() {
  if (stageScaleFrame) window.cancelAnimationFrame(stageScaleFrame);
  stageScaleFrame = window.requestAnimationFrame(() => {
    stageScaleFrame = 0;
    updateViewportStageScale();
  });
}

function resetViewportScroll() {
  const reset = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll(".terminal-shell, .homepage-stage").forEach((shell) => {
      shell.scrollTop = 0;
      shell.scrollLeft = 0;
    });
  };

  reset();
  window.requestAnimationFrame(reset);
}

function t(key) {
  return I18N[currentLang][key] || I18N.zh[key] || key;
}

const FINAL_PAGE_COPY = {
  zh: {
    wallet: {
      aTitle: "A 钱包",
      bTitle: "B 钱包",
      walletPlaceholderA: "输入 A 钱包地址",
      walletPlaceholderB: "输入 B 钱包地址",
      namePlaceholder: "钱包指名",
      degen: "Degen 指数",
      diamond: "钻石手指数",
      rarity: "稀有度",
      run: "开始 PK",
      judge: "系统判定",
      metric1: "牛市冲锋",
      metric2: "熊市苟住",
      metric3: "链上异常体",
      verdict: "输入两个钱包，启动链上会诊。",
      winnerA: "A 钱包",
      winnerB: "B 钱包",
      verdictDone: (winner) => `${winner} 当前更像链上异常体，建议先验血再梭哈。`
    },
    rarity: {
      tabs: ["综合处罚榜", "Degen 冲锋榜", "钻石手榜", "空投游牧榜", "精神病历榜"],
      labels: ["排名", "@handle", "钱包人格", "稀有度", "综合评分"],
      rows: [
        ["#1", "@0xSleepless", "高频冲锋型", "Common"],
        ["#2", "@DiamondDose", "冷钱包隐士", "Uncommon"],
        ["#3", "@GasFever", "Gas 峰值患者", "Uncommon"],
        ["#4", "@HopiumLab", "希望麻醉依赖", "Epic"],
        ["#5", "@AirdropER", "空投急诊科", "Legendary"],
        ["#6", "@RugTherapy", "土狗复健中", "Mythic"],
        ["1/1", "@BlackSwan", "链上异常体", "1/1"]
      ],
      cardTitle: "本周链上异常体",
      cardLines: ["本周链上异常", "异常链分", "综合评分", "连接上异常体"],
      readout: "7 / 7"
    },
    psyche: {
      title: "心理健康自测中心",
      lead: "不是诊断，只是帮你更早看见自己的状态。",
      callout: "照亮钱包，也照顾一下自己。",
      bullets: ["不登录", "不上链", "不公开", "不和钱包绑定", "本地保存可选"],
      save: "本地保存",
      clear: "清除记录",
      options: ["快速体检", "情绪低落", "焦虑", "幸福感", "睡眠自测", "压力自测", "交易心理自查"],
      ekg: "心电图",
      breath: "呼吸波",
      slogan: "你不是账户余额，也不是一次交易结果。",
      diagnosisCalm: "状态平稳，适合先观察再下单。",
      diagnosisHot: "波动升温，建议把买入键冷静十分钟。",
      diagnosisMax: "冲动指数过高，今日处方：断网、睡觉、明天再看。"
    },
    about: {
      doctor: "石头",
      role: "Onchain Clinic 值班医生",
      title: "为什么我做链上照妖镜？",
      lead: "一个用代码和抽象感对抗情绪低谷的加密实验。",
      byline: "我是石头，DegenDNA.fun 的创建者，也是链上照妖镜的主理人。",
      reasons: [
        "我平时研究 AI Agent、自动交易、预测市场和链上数据，也长期在用各种小工具观察市场和观察自己。",
        "我本人也是中度抑郁症患者。做这个网站的起点其实很简单：币圈太容易让人焦虑了，钱包盈亏、K 线波动、错过机会、追高回撤，都会不断放大人的情绪。",
        "所以我想做一个有点抽象、有点嘴毒，但最后还能提醒大家好好爱自己的链上人格实验。",
        "它可以吐槽你的钱包，但不会定义你的人生。"
      ],
      ekg: "心电图",
      breath: "呼吸波",
      slogan: "市场会波动，钱包会回撤，人也要好好休息。"
    },
    report: {
      ribbon: "链上精神科病例",
      handle: "@handle",
      wallet: "short wallet: 00000039...",
      personality: "钱包人格",
      personalityValue: "高位接盘艺术家",
      rarity: "稀有度",
      degen: "Degen 指数:",
      diamond: "钻石手指数:",
      cause: "亏损主因",
      causeValue: "看到别人赚钱后手速过快",
      sentence: "一句话判词",
      sentenceValue: "你的钱包最大问题，是太容易相信下一根阳线。",
      widgets: ["链上资产性格", "亏损黑匣子", "90 天钱包命运", "Alpha 雷达", "核心徽章", "适合你的交易风格"],
      wordCloud: "热点牵引强，适合先分层，再出手。",
      assetFacts: [
        ["主导人格", "冲锋型"],
        ["持仓气质", "波动敏感"]
      ],
      lossLines: ["追涨触发", "回撤复盘", "深夜下单"],
      fateStrip: ["短期回撤", "中段修复", "尾段反弹"],
      radar: ["解锁", "持仓", "冲动"],
      badges: ["纸手之王", "土狗采样员", "手速比脑子快"],
      share: "复制晒图文案",
      copyLabel: "复制推文",
      tweet: "我让钱包做了个链上体检，医生说：不是我穷，是它正在经历流动性叛逆期。来照照你的：degendna.fun",
      nft: "领取 NFT 病例",
      copied: "已生成晒图文案，复制区可直接使用。",
      claimed: "测试网 NFT 病例已领取"
    }
  },
  en: {
    wallet: {
      aTitle: "Wallet A",
      bTitle: "Wallet B",
      walletPlaceholderA: "Enter wallet A",
      walletPlaceholderB: "Enter wallet B",
      namePlaceholder: "Wallet alias",
      degen: "Degen Index",
      diamond: "Diamond Hand",
      rarity: "Rarity",
      run: "Start PK",
      judge: "System Verdict",
      metric1: "Bull Charge",
      metric2: "Bear Survival",
      metric3: "Onchain Anomaly",
      verdict: "Enter two wallets to start the consult.",
      winnerA: "Wallet A",
      winnerB: "Wallet B",
      verdictDone: (winner) => `${winner} reads as the stronger onchain anomaly. Run one more check before full send.`
    },
    rarity: {
      tabs: ["Overall Chart", "Degen Rush", "Diamond Hands", "Airdrop Nomads", "Psyche Cases"],
      labels: ["Rank", "@handle", "Wallet Type", "Rarity", "Score"],
      rows: [
        ["#1", "@0xSleepless", "High-frequency charger", "Common"],
        ["#2", "@DiamondDose", "Cold-wallet monk", "Uncommon"],
        ["#3", "@GasFever", "Gas peak patient", "Uncommon"],
        ["#4", "@HopiumLab", "Hopium dependent", "Epic"],
        ["#5", "@AirdropER", "Airdrop emergency", "Legendary"],
        ["#6", "@RugTherapy", "Meme coin rehab", "Mythic"],
        ["1/1", "@BlackSwan", "Onchain anomaly", "1/1"]
      ],
      cardTitle: "Weekly Onchain Anomaly",
      cardLines: ["Weekly anomaly", "Anomaly score", "Composite score", "Linked anomaly"],
      readout: "7 / 7"
    },
    psyche: {
      title: "Psyche Self-Test Center",
      lead: "Not a diagnosis. Just an earlier look at your state.",
      callout: "Light up the wallet, and take care of yourself too.",
      bullets: ["No login", "No upload", "No public post", "No wallet binding", "Local save optional"],
      save: "Save locally",
      clear: "Clear records",
      options: ["Quick Check", "Low Mood", "Anxiety", "Wellbeing", "Sleep Check", "Stress Check", "Trading Psyche"],
      ekg: "EKG",
      breath: "Breathwave",
      slogan: "You are not your balance, and not one trade result.",
      diagnosisCalm: "Stable state. Observe first, then place an order.",
      diagnosisHot: "Volatility warming up. Freeze the buy button for ten minutes.",
      diagnosisMax: "Impulse index too high. Prescription: disconnect, sleep, check tomorrow."
    },
    about: {
      doctor: "Stone",
      role: "Onchain Clinic duty doctor",
      title: "Why I Built Degen DNA Report",
      lead: "A crypto experiment that uses code and abstraction to push back against emotional lows.",
      byline: "I am Stone, creator of DegenDNA.fun and lead of the onchain mirror project.",
      reasons: [
        "I study AI agents, automated trading, prediction markets, and onchain data, while using small tools to observe both the market and myself.",
        "I also live with moderate depression. This site started from a simple truth: crypto can amplify anxiety through PnL, candles, missed chances, chases, and drawdowns.",
        "So I wanted to build an absurd, sharp-tongued onchain personality experiment that still reminds people to care for themselves.",
        "It can roast your wallet, but it will not define your life."
      ],
      ekg: "EKG",
      breath: "Breathwave",
      slogan: "Markets move, wallets draw down, people need rest too."
    },
    report: {
      ribbon: "Onchain Psychiatry Case",
      handle: "@handle",
      wallet: "short wallet: 00000039...",
      personality: "Wallet Type",
      personalityValue: "High-entry performance artist",
      rarity: "Rarity",
      degen: "Degen Index:",
      diamond: "Diamond Hand:",
      cause: "Loss trigger",
      causeValue: "Hands move too fast after seeing others win",
      sentence: "One-line verdict",
      sentenceValue: "Your wallet's biggest issue is believing the next green candle too easily.",
      widgets: ["Onchain Asset Persona", "Loss Black Box", "90-Day Wallet Fate", "Alpha Radar", "Core Badges", "Your Trading Style"],
      wordCloud: "Fast rotation, hype-led positions; scale in before acting.",
      assetFacts: [
        ["Primary", "Chaser"],
        ["Holding", "Volatile"]
      ],
      lossLines: ["Chase trigger", "Drawdown review", "Late-night orders"],
      fateStrip: ["Dip", "Repair", "Rebound"],
      radar: ["Unlock", "Hold", "Impulse"],
      badges: ["Paperhand King", "Meme Sampler", "Hands Faster Than Brain"],
      share: "Generate card for X",
      copyLabel: "Copy post",
      tweet: "My wallet got an onchain checkup. Diagnosis: not poor, just in its liquidity rebellion era. Try yours: degendna.fun",
      nft: "Claim Testnet NFT Case",
      copied: "Share copy generated. The post field is ready.",
      claimed: "Testnet NFT case claimed"
    }
  }
};

function finalText(section, key) {
  return FINAL_PAGE_COPY[currentLang]?.[section]?.[key] ?? FINAL_PAGE_COPY.zh[section]?.[key] ?? "";
}

function setText(element, value) {
  if (element && value !== undefined) element.textContent = value;
}

async function copySharePayload(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return "text";
      } catch {
        // Clipboard permissions should never block the X composer.
      }
    }
    return "none";
}

function openXComposer(text) {
  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) return true;
  window.location.href = url;
  return false;
}

function reportShareStatus(result) {
  if (currentLang === "en") {
    return result === "text"
      ? "Share copy copied. Opening X compose."
      : "Opening X compose with the report copy.";
  }
  return result === "text"
    ? "晒文案已复制，正在打开 X 发推页面。"
    : "正在打开 X 发推页面，并带入报告文案。";
}

function withTimeout(promise, timeoutMs, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => window.setTimeout(() => resolve(fallback), timeoutMs))
  ]);
}

const REPORT_RARITY_TIERS = [
  { key: "common", label: "Common", min: 0 },
  { key: "uncommon", label: "Uncommon", min: 35 },
  { key: "rare", label: "Rare", min: 50 },
  { key: "epic", label: "Epic", min: 65 },
  { key: "legendary", label: "Legendary", min: 80 },
  { key: "mythic", label: "Mythic", min: 92 },
  { key: "one", label: "1/1", min: 98 }
];

let activeReportScores = { degen: 86, diamond: 31 };
let activeReportIdentity = { handle: "@handle", wallet: "00000039...", rawWallet: "" };
let activeReportDimensions = [86, 31, 69, 78, 92, 44];
let activeReportNarrative = null;
let activeReportApiData = null;
let detailRouteLoadKey = "";
let activeLeaderboardEntries = [];
let activeRankPage = 0;
const RANK_PAGE_SIZE = 7;
const REPORT_BADGE_CATALOG = [
  { key: "paper-king", icon: "♕", code: "PAPER", dimension: 2, min: 48, color: "#ffe58f", zh: "纸手之王", en: "Paperhand King" },
  { key: "diamond-fever", icon: "◆", code: "DIAMOND", dimension: 1, min: 70, color: "#7ff7ff", zh: "钻石执念", en: "Diamond Fever" },
  { key: "ape-engine", icon: "✦", code: "APE", dimension: 0, min: 78, color: "#ffdd74", zh: "冲锋引擎", en: "Ape Engine" },
  { key: "night-watch", icon: "☾", code: "NIGHT", dimension: 3, min: 68, color: "#bd72ff", zh: "深夜看盘", en: "Night Watch" },
  { key: "abstract-core", icon: "✧", code: "ABSTRACT", dimension: 4, min: 76, color: "#7cf9d4", zh: "抽象核心", en: "Abstract Core" },
  { key: "self-heal", icon: "✚", code: "HEAL", dimension: 5, min: 58, color: "#8dffb3", zh: "自愈回血", en: "Self Heal" },
  { key: "fomo-siren", icon: "▲", code: "FOMO", dimension: 0, min: 62, color: "#ff8f72", zh: "FOMO 警报", en: "FOMO Siren" },
  { key: "meme-sampler", icon: "●", code: "MEME", dimension: 4, min: 60, color: "#f7b85f", zh: "土狗采样员", en: "Meme Sampler" },
  { key: "gas-patient", icon: "◇", code: "GAS", dimension: 0, min: 55, color: "#50f8ff", zh: "Gas 峰值患者", en: "Gas Patient" },
  { key: "sleep-debt", icon: "◐", code: "SLEEP", dimension: 3, min: 74, color: "#9b8cff", zh: "睡眠负债", en: "Sleep Debt" },
  { key: "risk-sponge", icon: "⬢", code: "RISK", dimension: 2, min: 62, color: "#ffca6a", zh: "风险海绵", en: "Risk Sponge" },
  { key: "one-case", icon: "✹", code: "1/1", dimension: 4, min: 94, color: "#fff0a8", zh: "链上异象", en: "Onchain Anomaly" },
  { key: "alpha-ear", icon: "✺", code: "ALPHA", dimension: 5, min: 72, color: "#69f6ff", zh: "Alpha 听诊", en: "Alpha Listener" },
  { key: "panic-brake", icon: "■", code: "BRAKE", dimension: 3, min: 82, color: "#ff7f7f", zh: "情绪刹车", en: "Panic Brake" }
];
const REPORT_DIMENSION_LABELS = ["Degen 指数", "钻石手指数", "纸手指数", "深夜内耗", "抽象浓度", "自愈速率"];

const WALLET_REPORT_COPY_BANK = {
  zh: {
    personalities: [
      "高位接盘艺术家", "流动性夜行者", "空投病历收集员", "土狗急诊实习生", "钻石手考古学家", "K线幻觉观察员",
      "Gas峰值冲锋队", "稳定币防空洞管理员", "桥接游牧民", "叙事过敏体质", "合约按钮压力怪", "回撤复盘诗人",
      "止损失联患者", "阳线祈雨师", "链上冷启动人格", "仓位漂移驾驶员", "群聊截图受害者", "资产轮动强迫症",
      "低流动性潜水员", "本金保卫战临时队长", "反向指标预言家", "协议门诊常客", "夜盘神经兴奋型", "冷钱包冥想者"
    ],
    causes: [
      "看到别人赚钱后手速过快", "把群聊截图当成了临床证据", "对下一根阳线存在过度信任", "在深夜把小仓位买成了病例编号",
      "退出按钮长期处于选择性失明", "每次热点升温都会自动挂号", "喜欢在流动性最薄的地方证明勇气", "把稳定币防守误会成错过人生",
      "桥接次数像迁徙，复盘次数像忏悔", "明明想做趋势，却总被短线噪音点名", "止损写在计划里，执行留在平行宇宙",
      "手续费和情绪一起偷偷扣血", "买入前像研究员，买入后像许愿池", "只会进场，不太会体面离场",
      "把空投任务做成了链上通勤", "仓位管理靠感觉，感觉经常请假", "越亏越想用下一笔交易写论文",
      "对低市值叙事的免疫系统偏弱", "一看到新概念就开始给钱包改简历", "复盘很真诚，下次仍然按原路径发病"
    ],
    sentences: [
      "你的钱包最大问题，是太容易把热闹误读成命运。",
      "这不是单纯风险偏好高，这是钱包在替情绪抢方向盘。",
      "你并不缺判断力，只是市场一吵，判断力就会静音。",
      "这个地址像一台叙事雷达，能发现机会，也会把噪音当信号。",
      "你的链上病灶不在亏损本身，而在每次亏损后都想立刻证明自己。",
      "钱包会回撤，人也会疲惫，先把仓位和睡眠都降一点杠杆。",
      "你适合把买入按钮旁边贴一张纸：再等十分钟也不会错过人生。",
      "这份病例最危险的地方，是你总觉得下一次会完全不同。",
      "你的 Alpha 嗅觉不差，但退出系统需要重新挂号。",
      "钱包没有坏，只是经常在情绪高温时把风控忘在门口。",
      "你像在链上写日记：每一笔交易都很诚实，也很嘴硬。",
      "这个钱包不是没救，是需要把冲动从主治医生降级为实习生。",
      "越想翻本，越要先停止让钱包替自尊做决定。",
      "你和行情的关系，像恋爱脑和已读不回：总想再解释一次。",
      "当你开始相信截图能治疗焦虑，钱包就会自动进入高危观察。",
      "最适合你的处方不是神单，而是分批、复盘和准时睡觉。"
    ],
    wordCloud: [
      "热点牵引强，适合先分层，再出手。",
      "资产分布像情绪热力图，亮点很多，冷静更少。",
      "主线嗅觉在线，但仓位切换容易过快。",
      "链上足迹偏实验型，适合小样本、多验证。",
      "防守意识存在，只是经常被新叙事打断。",
      "组合气质偏进攻，建议给稳定仓留固定席位。",
      "钱包很会找故事，也很会把故事买成仓位。",
      "行为像多线程复盘：一边自救，一边继续探索。"
    ],
    primary: ["冲锋型", "观察型", "游牧型", "考古型", "复盘型", "防守型", "抽象型", "波段型"],
    holding: ["波动敏感", "叙事驱动", "半自动切换", "长短混合", "防守偏弱", "耐心间歇性上线", "风险嗅觉灵敏", "退出纪律待修复"],
    lossLines: [
      ["追涨触发", "回撤复盘", "深夜下单"],
      ["截图上头", "止损失联", "手续费扣血"],
      ["叙事漂移", "仓位走散", "反弹犹豫"],
      ["桥接过量", "空投疲劳", "低流动性探险"],
      ["群聊污染", "K线催眠", "卖飞后补票"],
      ["小仓试水", "越亏越勇", "复盘延迟"]
    ],
    fateStrip: [
      ["短期回撤", "中段修复", "尾段反弹"],
      ["先冷静", "再验证", "后加仓"],
      ["错过热点", "重建节奏", "抓到回声"],
      ["任务堆积", "筛掉噪音", "等待结算"],
      ["小亏止血", "仓位归位", "信号回暖"],
      ["情绪降温", "资金回流", "耐心复活"]
    ],
    radar: [
      ["解锁", "持仓", "冲动"],
      ["空投", "桥接", "复盘"],
      ["叙事", "流动性", "退出"],
      ["睡眠", "仓位", "纪律"],
      ["Alpha", "噪音", "冷却"],
      ["本金", "风控", "耐心"]
    ],
    shareDigest: [
      "这份病历适合保存下来，睡醒后再复盘。",
      "结果只做娱乐化人格摘要，不定义真实人生。",
      "钱包可以被吐槽，风险需要被认真管理。",
      "先照见模式，再决定下一次怎么点按钮。"
    ],
    tweet: [
      "我的钱包做了链上体检：医生说不是穷，是流动性叛逆期。来照照你的：degendna.fun",
      "刚给钱包挂了个链上精神科，诊断结果比K线还诚实。来照照你的：degendna.fun",
      "钱包病历已生成：症状包括嘴硬、追热点、以及偶尔相信下一根阳线。degendna.fun",
      "我让钱包照了照妖镜，结果它比我更需要风控。你也来试试：degendna.fun",
      "链上体检完成：钱包没坏，只是情绪管理还在测试网。degendna.fun"
    ]
  },
  en: {
    personalities: [
      "High-Entry Performance Artist", "Liquidity Night Walker", "Airdrop Case Collector", "Meme ER Intern", "Diamond-Hand Archaeologist", "Candle Hallucination Observer",
      "Gas-Peak Vanguard", "Stablecoin Bunker Warden", "Bridge Nomad", "Narrative Allergy Patient", "Contract Button Stress Tester", "Drawdown Postmortem Poet",
      "Missing Stop-Loss Case", "Green-Candle Rainmaker", "Onchain Cold-Start Persona", "Position Drift Driver", "Group-Chat Screenshot Victim", "Rotation Compulsion Wallet"
    ],
    causes: [
      "your hands accelerate when other people post gains", "group-chat screenshots are treated as clinical evidence", "the next green candle receives too much faith",
      "small late-night entries become full case numbers", "the exit button has selective invisibility", "every warm narrative files an appointment for you",
      "you prove courage where liquidity is thinnest", "stablecoin defense gets mistaken for missing your life", "fees and feelings drain the account together",
      "you buy like an analyst and hold like a wishing well", "entries are easy while graceful exits remain theoretical", "airdrop tasks became an onchain commute",
      "position sizing depends on mood, and mood often calls in sick", "low-cap narratives slip past the immune system", "every new concept makes the wallet rewrite its resume"
    ],
    sentences: [
      "Your wallet's biggest issue is mistaking market noise for destiny.",
      "This is not simple risk appetite; the wallet keeps grabbing the emotional steering wheel.",
      "Your judgment exists, but it goes silent when the room gets loud.",
      "This address is a narrative radar: good at finding signals, also good at adopting noise.",
      "The leak is not one loss; it is the urge to prove yourself immediately after it.",
      "Wallets draw down, people get tired; lower leverage on both positions and sleep.",
      "Put a note next to the buy button: waiting ten minutes will not ruin your life.",
      "The risky part is believing the next attempt will be completely different.",
      "Your alpha nose works. Your exit system needs another appointment.",
      "The wallet is not broken; it simply forgets risk controls at high emotional temperature."
    ],
    wordCloud: [
      "Hype pulls hard; scale first, act second.",
      "Asset distribution reads like an emotion heatmap: many bright spots, less calm.",
      "Theme detection is live, but position switching runs too fast.",
      "Onchain traces feel experimental: small samples, many validations.",
      "Defense exists, but new narratives interrupt it often.",
      "The portfolio leans offensive; reserve a fixed seat for stables."
    ],
    primary: ["Charger", "Observer", "Nomad", "Archaeologist", "Postmortem", "Defender", "Abstract", "Swing"],
    holding: ["Volatility-sensitive", "Narrative-led", "Semi-automatic", "Mixed horizon", "Defense-light", "Intermittent patience", "Risk-aware", "Exit discipline pending"],
    lossLines: [
      ["Chase trigger", "Drawdown review", "Late-night order"],
      ["Screenshot tilt", "Stop-loss offline", "Fee bleed"],
      ["Narrative drift", "Position scatter", "Rebound hesitation"],
      ["Bridge overload", "Airdrop fatigue", "Thin-liquidity dive"],
      ["Chat pollution", "Candle hypnosis", "Buyback after selling"]
    ],
    fateStrip: [
      ["Dip", "Repair", "Rebound"],
      ["Cool down", "Validate", "Scale in"],
      ["Miss hype", "Reset rhythm", "Catch echo"],
      ["Task pile", "Filter noise", "Wait settlement"],
      ["Stop bleed", "Re-seat bags", "Signal warms"]
    ],
    radar: [
      ["Unlock", "Hold", "Impulse"],
      ["Airdrop", "Bridge", "Review"],
      ["Narrative", "Liquidity", "Exit"],
      ["Sleep", "Sizing", "Discipline"],
      ["Alpha", "Noise", "Cooldown"]
    ],
    shareDigest: [
      "Save this case and review it after sleep.",
      "Entertainment persona summary only; it does not define real life.",
      "The wallet can be roasted. Risk still deserves respect.",
      "See the pattern first, then decide how to click next time."
    ],
    tweet: [
      "My wallet got an onchain checkup: not poor, just in its liquidity rebellion era. Try yours: degendna.fun",
      "I sent my wallet to onchain psychiatry. The diagnosis was more honest than the chart. degendna.fun",
      "Wallet case generated: symptoms include denial, narrative chasing, and faith in the next green candle. degendna.fun",
      "My wallet looked into the onchain mirror. Turns out it needs risk management more than I do. degendna.fun"
    ]
  }
};

function clampReportScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function reportRarityFromScore(score) {
  const normalized = clampReportScore(score);
  return [...REPORT_RARITY_TIERS].reverse().find((tier) => normalized >= tier.min) || REPORT_RARITY_TIERS[0];
}

function stableHash(value, salt = "") {
  let hash = 2166136261;
  const input = `${salt}:${String(value || "")}`;
  for (const char of input) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickVariant(list, seed, offset = 0) {
  if (!Array.isArray(list) || !list.length) return "";
  return list[(seed + offset * 9973) % list.length];
}

function normalizeReportApiData(apiReport) {
  if (!apiReport || typeof apiReport !== "object") return null;
  const mode = apiReport.report || apiReport.modes?.[apiReport.defaultMode] || apiReport.modes?.abstract || null;
  const scores = apiReport.scores || {};
  return {
    personality: apiReport.personality,
    lossCause: apiReport.lossCause || mode?.lossCause,
    verdict: apiReport.verdict || mode?.verdict,
    assetPersonality: mode?.assetPersonality,
    holdingBehavior: mode?.holdingBehavior,
    lossBlackBox: mode?.lossBlackBox,
    alphaRadar: Array.isArray(mode?.alphaRadar) ? mode.alphaRadar : [],
    fate90Days: Array.isArray(mode?.fate90Days) ? mode.fate90Days : [],
    strategyFit: mode?.strategyFit,
    labels: Array.isArray(apiReport.labels) ? apiReport.labels : [],
    scores: {
      degen: scores.degen,
      diamond: scores.diamond,
      airdrop: scores.airdrop
    },
    rankScore: apiReport.rankScore,
    rarity: apiReport.rarity,
    shortAddress: apiReport.shortAddress
  };
}

function buildWalletNarrative(options = {}) {
  const bank = WALLET_REPORT_COPY_BANK[currentLang] || WALLET_REPORT_COPY_BANK.zh;
  const api = normalizeReportApiData(options.apiReport);
  const seedSource = options.rawWallet || activeReportIdentity.rawWallet || activeReportIdentity.wallet || "degendna";
  const seed = stableHash(seedSource, `${currentLang}:${options.degen}:${options.diamond}`);
  const degen = clampReportScore(api?.scores.degen ?? options.degen ?? activeReportScores.degen);
  const diamond = clampReportScore(api?.scores.diamond ?? options.diamond ?? activeReportScores.diamond);
  const tier = options.tier || reportRarityFromScore(degen);
  const personality = api?.personality || pickVariant(bank.personalities, seed, 1);
  const cause = api?.lossCause || pickVariant(bank.causes, seed, 2);
  const sentence = api?.verdict || pickVariant(bank.sentences, seed, 3);
  const wordCloud = api?.assetPersonality || pickVariant(bank.wordCloud, seed, 4);
  const primary = pickVariant(bank.primary, seed + degen, 5);
  const holding = api?.holdingBehavior || pickVariant(bank.holding, seed + diamond, 6);
  const lossLines = api?.lossBlackBox
    ? [pickVariant(pickVariant(bank.lossLines, seed, 7), seed, 1), api.lossBlackBox, pickVariant(pickVariant(bank.lossLines, seed, 8), seed, 2)]
    : pickVariant(bank.lossLines, seed, 7);
  const fateStrip = api?.fate90Days?.length ? api.fate90Days.slice(0, 3) : pickVariant(bank.fateStrip, seed, 8);
  const radar = api?.alphaRadar?.length ? api.alphaRadar.slice(0, 3) : pickVariant(bank.radar, seed, 9);
  const shareDigest = [
    api?.strategyFit ? (currentLang === "en" ? `Best fit: ${api.strategyFit}.` : `适合你的风格：${api.strategyFit}。`) : pickVariant(bank.shareDigest, seed, 10),
    pickVariant(bank.shareDigest, seed, 11)
  ];
  const tags = (api?.labels?.length ? api.labels : [
    personality,
    degen >= 76 ? (currentLang === "en" ? "High Risk" : "高风险冲锋") : (currentLang === "en" ? "Risk Sample" : "风险样本"),
    diamond >= 70 ? (currentLang === "en" ? "Diamond Hands" : "钻石手") : (currentLang === "en" ? "Cooldown Needed" : "需要冷却")
  ]).slice(0, 3);
  const tweet = pickVariant(bank.tweet, seed, 12);

  return {
    personality,
    cause,
    sentence,
    wordCloud,
    assetFacts: [
      [currentLang === "en" ? "Primary" : "主导人格", primary],
      [currentLang === "en" ? "Holding" : "持仓气质", holding]
    ],
    lossLines: lossLines.slice(0, 3),
    fateStrip: fateStrip.slice(0, 3),
    radar: radar.slice(0, 3),
    shareDigest,
    tags,
    tweet,
    tier,
    api
  };
}

function compactReportText(value, limit = 18) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean || clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(1, limit - 3))}...`;
}

function completeReportSentence(value, fallback = "") {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  const match = clean.match(/^.*?[。.!！?？]/u);
  return (match?.[0] || `${clean}。`).trim();
}

function applyReportNarrative(report, narrative = activeReportNarrative) {
  if (!report || !narrative) return;
  const compact = (value, limit) => compactReportText(value, currentLang === "en" ? limit + 8 : limit);
  const dossierBlocks = report.querySelectorAll(".report-dossier > div");
  setText(dossierBlocks[0]?.querySelector("b"), narrative.personality);
  const dossierRows = report.querySelectorAll(".report-dossier p");
  setText(dossierRows[3]?.querySelector("strong"), narrative.cause);
  setText(dossierRows[4]?.querySelector("strong"), narrative.sentence);
  setText(report.querySelector(".share-card-preview p"), compact(narrative.personality, 12));
  report.querySelectorAll(".share-card-tags small").forEach((tag, index) => {
    setText(tag, compact(narrative.tags[index] || narrative.tags[0] || "", 8));
  });
  report.querySelectorAll(".share-card-digest p").forEach((line, index) => {
    setText(line, completeReportSentence(narrative.shareDigest[index] || ""));
  });
  setText(report.querySelector(".word-cloud"), completeReportSentence(narrative.wordCloud));
  report.querySelectorAll(".asset-widget .widget-facts div").forEach((row, index) => {
    setText(row.querySelector("dt"), narrative.assetFacts?.[index]?.[0]);
    setText(row.querySelector("dd"), completeReportSentence(narrative.assetFacts?.[index]?.[1] || ""));
  });
  report.querySelectorAll(".black-widget .widget-lines li").forEach((item, index) => setText(item, narrative.lossLines?.[index]));
  report.querySelectorAll(".luck-widget .fate-strip span").forEach((item, index) => setText(item, completeReportSentence(narrative.fateStrip?.[index] || "")));
  report.querySelectorAll(".radar-widget li").forEach((item, index) => {
    const bar = item.querySelector("span");
    item.textContent = narrative.radar?.[index] || "";
    if (bar) item.prepend(bar);
  });
  renderDetailedReport();
}

function selectReportBadges(dimensions = activeReportDimensions, tier = reportRarityFromScore(activeReportScores.degen)) {
  const ranked = REPORT_BADGE_CATALOG.map((badge, order) => {
    const value = clampReportScore(dimensions[badge.dimension] ?? activeReportScores.degen);
    const rarityBoost = tier.key === "one" && badge.key === "one-case" ? 42 : tier.key === "mythic" && value >= badge.min ? 16 : 0;
    return { badge, order, score: value - badge.min + rarityBoost };
  }).sort((a, b) => b.score - a.score || a.order - b.order);

  const selected = [];
  ranked.forEach((item) => {
    if (selected.length >= 3) return;
    const eligible = item.score >= 0 || selected.length < 2;
    if (eligible && !selected.some((entry) => entry.dimension === item.badge.dimension)) selected.push(item.badge);
  });

  ranked.forEach((item) => {
    if (selected.length < 3 && !selected.includes(item.badge)) selected.push(item.badge);
  });

  return selected.slice(0, 3);
}

function renderReportBadges(report, dimensions = activeReportDimensions, tier = reportRarityFromScore(activeReportScores.degen)) {
  if (!report) return;
  const badges = selectReportBadges(dimensions, tier);
  report.querySelectorAll(".badge-row span").forEach((badgeElement, index) => {
    const badge = badges[index];
    if (!badge) return;
    badgeElement.dataset.badgeKey = badge.key;
    badgeElement.style.setProperty("--badge-accent", badge.color);
    setText(badgeElement.querySelector("i"), badge.icon);
    setText(badgeElement.querySelector("strong"), currentLang === "en" ? badge.en : badge.zh);
    setText(badgeElement.querySelector("em"), badge.code);
  });
}

function updateReportScores(degenScore, diamondScore, options = {}) {
  const report = document.querySelector(".ref-report-page");
  if (!report) return;

  const api = normalizeReportApiData(options.apiReport);
  if (options.apiReport) activeReportApiData = options.apiReport;
  const degen = clampReportScore(api?.scores.degen ?? degenScore);
  const diamond = clampReportScore(api?.scores.diamond ?? diamondScore);
  const paper = clampReportScore(100 - Math.round((degen + diamond) / 2));
  const night = clampReportScore(38 + (degen % 55));
  const abstract = clampReportScore(44 + ((degen * 7 + diamond) % 53));
  const recovery = clampReportScore(100 - Math.round((night + paper) / 2));
  const tier = reportRarityFromScore(degen);

  activeReportScores = { degen, diamond };
  activeReportDimensions = [degen, diamond, paper, night, abstract, recovery];
  report.dataset.rarityTier = tier.key;
  report.style.setProperty("--report-score-angle", `${degen * 3.6}deg`);
  setText(report.querySelector("[data-report-degen]"), `${degen}/100`);
  setText(report.querySelector("[data-report-diamond]"), `${diamond}/100`);
  setText(report.querySelector("[data-report-score]"), String(degen));
  setText(report.querySelector("[data-report-score-card]"), String(degen));
  setText(report.querySelector("[data-report-degen-mini]"), String(degen));
  setText(report.querySelector("[data-report-diamond-mini]"), String(diamond));
  setText(report.querySelector("[data-report-degen-card]"), String(degen));
  setText(report.querySelector("[data-report-diamond-card]"), String(diamond));
  report.querySelectorAll(".metric-grid p").forEach((row, index) => {
    const value = activeReportDimensions[index];
    if (value === undefined) return;
    setText(row.querySelector("b"), String(value));
    const bar = row.querySelector("i em");
    if (bar) bar.style.width = `${value}%`;
  });
  setText(report.querySelector(".rarity-current"), tier.label);
  setText(report.querySelector("[data-report-rarity-card]"), tier.label);
  setText(report.querySelector("[data-report-rarity-card-mini]"), tier.label);

  const degenBar = report.querySelector("[data-report-degen-bar]");
  const diamondBar = report.querySelector("[data-report-diamond-bar]");
  if (degenBar) degenBar.style.width = `${degen}%`;
  if (diamondBar) diamondBar.style.width = `${diamond}%`;

  report.querySelectorAll(".rarity-ladder span").forEach((item) => {
    item.classList.toggle("active", item.textContent.trim() === tier.label);
  });
  activeReportNarrative = buildWalletNarrative({
    rawWallet: options.rawWallet || activeReportIdentity.rawWallet || activeReportIdentity.wallet,
    degen,
    diamond,
    dimensions: activeReportDimensions,
    tier,
    apiReport: options.apiReport
  });
  applyReportNarrative(report, activeReportNarrative);
  renderReportDimensionCurves(report, activeReportDimensions);
  renderReportBadges(report, activeReportDimensions, tier);
  renderDetailedReport();
}

function reportCurveSvg(value, index) {
  const color = ["#51f6ff", "#bd62ff", "#f5c95d", "#51f6ff", "#bd62ff", "#f5c95d"][index % 6];
  const label = REPORT_DIMENSION_LABELS[index] || "链上指数";
  const score = clampReportScore(value);
  const clampY = (point) => Math.max(18, Math.min(76, point));
  const points = Array.from({ length: 8 }, (_, pointIndex) => {
    const x = 8 + pointIndex * 12;
    const amplitude = 8 + (index % 3) * 2.2;
    const trend = (score - 50) * 0.12;
    const y =
      51 -
      trend +
      Math.sin(pointIndex * 1.18 + index * 0.78) * amplitude +
      Math.cos(score * 0.055 + pointIndex * 0.86) * 4.8;
    return { x, y: clampY(y) };
  });
  const makeCurvePath = (curvePoints) =>
    curvePoints.reduce((path, point, pointIndex) => {
      if (pointIndex === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      const previous = curvePoints[pointIndex - 1];
      const midX = (previous.x + point.x) / 2;
      return `${path} C ${midX.toFixed(1)} ${previous.y.toFixed(1)}, ${midX.toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }, "");
  const curvePath = makeCurvePath(points);
  const tailPath = makeCurvePath(points.slice(-4));
  const areaPath = `${curvePath} L ${points[points.length - 1].x.toFixed(1)} 80 L ${points[0].x.toFixed(1)} 80 Z`;
  const pulsePoint = points[Math.min(points.length - 1, Math.max(0, Math.round((score / 100) * (points.length - 1))))];
  const nodeMarkup = points
    .map((point, pointIndex) => {
      const nodeClass = pointIndex % 2 === 0 ? "sci-node" : "sci-node dim";
      return `<circle class="${nodeClass}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${pointIndex % 2 === 0 ? "2.4" : "1.4"}" />`;
    })
    .join("");
  const fillId = `reportCurveFill${index}`;
  return `
    <b class="curve-name">${label}</b>
    <em class="curve-value">${score}</em>
    <svg class="sci-curve-chart" viewBox="0 0 100 90" aria-hidden="true" focusable="false" style="--curve-color: ${color}; --curve-delay: ${index * 90}ms">
      <defs>
        <linearGradient id="${fillId}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.34" />
          <stop offset="72%" stop-color="${color}" stop-opacity="0.06" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path class="sci-grid" d="M8 26 H92 M8 48 H92 M8 70 H92" />
      <path class="sci-scan" d="M8 18 H35 M65 18 H92 M8 80 H92" />
      <path class="sci-area" d="${areaPath}" fill="url(#${fillId})" />
      <path class="sci-trace-back" d="${curvePath}" />
      <path class="sci-trace" d="${curvePath}" />
      <path class="sci-tail" d="${tailPath}" />
      ${nodeMarkup}
      <circle class="sci-pulse" cx="${pulsePoint.x.toFixed(1)}" cy="${pulsePoint.y.toFixed(1)}" r="4.2" />
    </svg>
  `;
}

function renderReportDimensionCurves(report, dimensions = activeReportDimensions) {
  report.querySelectorAll("[data-dimension-curve]").forEach((slot) => {
    const index = Number(slot.dataset.dimensionCurve || 0);
    slot.innerHTML = reportCurveSvg(dimensions[index] ?? 50, index);
  });
}

const REPORT_DETAIL_DIMENSIONS = [
  { key: "degen", zh: "Degen 指数", en: "Degen Index", color: "#ff7d68" },
  { key: "diamond", zh: "钻石手指数", en: "Diamond Hand", color: "#7ff7ff" },
  { key: "paper", zh: "纸手指数", en: "Paperhand", color: "#ffe08a" },
  { key: "night", zh: "深夜内耗", en: "Night Friction", color: "#bd72ff" },
  { key: "abstract", zh: "抽象浓度", en: "Abstract Density", color: "#f2a65a" },
  { key: "recovery", zh: "自愈速率", en: "Recovery Rate", color: "#71f0b2" }
];

function escapeDetailHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function reportDetailBand(score) {
  if (score >= 80) return currentLang === "en" ? "dominant signal" : "显著信号";
  if (score >= 60) return currentLang === "en" ? "active signal" : "活跃信号";
  if (score >= 40) return currentLang === "en" ? "watch signal" : "观察信号";
  return currentLang === "en" ? "quiet signal" : "低频信号";
}

function reportDetailDimensionCopy(index, score) {
  const zh = [
    score >= 75 ? "行动反应快，容易把市场热度转化成即时仓位。" : "行动冲动相对可控，更适合先看数据再落单。",
    score >= 70 ? "能忍受波动，持仓信念通常比短期噪音更稳定。" : "遇到回撤时容易提前离场，需要预先写好退出条件。",
    score >= 70 ? "对浮亏和错过都很敏感，情绪容易影响仓位大小。" : "纸手反应不算强，但仍要区分纪律性退出与恐慌退出。",
    score >= 70 ? "夜间复盘和反复推演明显，休息不足会放大判断偏差。" : "深夜内耗较低，决策节奏相对不容易被睡眠打乱。",
    score >= 70 ? "擅长捕捉新叙事，也更容易把故事的感染力当成确定性。" : "叙事敏感度适中，验证机制能帮助你过滤大部分噪音。",
    score >= 70 ? "有把亏损经验转化成规则的能力，恢复节奏较快。" : "修复需要外部结构，复盘和仓位上限会比意志力更可靠。"
  ];
  const en = [
    score >= 75 ? "Fast reactions can turn market heat into an immediate position." : "Impulse is relatively contained; observe data before acting.",
    score >= 70 ? "Drawdowns are tolerated better than short-term noise suggests." : "Pullbacks may trigger early exits; pre-write the exit rule.",
    score >= 70 ? "Losses and missed chances can both influence position size." : "Paperhand pressure is moderate; separate discipline from panic.",
    score >= 70 ? "Late-night rumination is visible and fatigue may amplify bias." : "Night friction is contained and the rhythm is easier to protect.",
    score >= 70 ? "New narratives are easy to detect, but stories can feel like certainty." : "Narrative sensitivity is balanced; verification can filter noise.",
    score >= 70 ? "Experience can become a rule quickly once the review loop is active." : "Recovery benefits from external structure more than willpower."
  ];
  return currentLang === "en" ? en[index] : zh[index];
}

function reportDetailCaseId() {
  const seed = activeReportIdentity.rawWallet || activeReportIdentity.wallet || "degendna";
  return `DN-${stableHash(seed, "case").toString(16).slice(0, 6).toUpperCase()}`;
}

function renderDetailedReport() {
  const page = document.querySelector(".report-detail-page");
  if (!page) return;

  const narrative = activeReportNarrative || buildWalletNarrative({ rawWallet: activeReportIdentity.rawWallet });
  const scores = activeReportDimensions.map((value) => clampReportScore(value));
  const tier = reportRarityFromScore(activeReportScores.degen);
  const personality = narrative.personality || finalText("report", "personalityValue");
  const api = normalizeReportApiData(activeReportApiData) || narrative.api || {};
  const highDegen = scores[0] >= 70;
  const highDiamond = scores[1] >= 70;
  const highNight = scores[3] >= 70;
  const highAbstract = scores[4] >= 70;

  setText(page.querySelector("[data-detail-handle]"), activeReportIdentity.handle);
  setText(page.querySelector("[data-detail-wallet]"), `short wallet: ${activeReportIdentity.wallet}`);
  setText(page.querySelector("[data-detail-case]"), reportDetailCaseId());
  setText(page.querySelector("[data-detail-rarity]"), tier.label);
  setText(page.querySelector("[data-detail-score]"), `${activeReportScores.degen} / 100`);
  setText(page.querySelector("[data-detail-score-large]"), String(activeReportScores.degen));
  setText(page.querySelector("[data-detail-personality]"), personality);
  setText(page.querySelector("[data-detail-personality-title]"), personality);
  setText(page.querySelector("[data-detail-verdict]"), narrative.sentence || finalText("report", "sentenceValue"));
  setText(page.querySelector("[data-detail-driver]"), api.assetPersonality || narrative.wordCloud);
  setText(page.querySelector("[data-detail-risk]"), narrative.cause);
  setText(page.querySelector("[data-detail-strength]"), highDiamond ? "你的持仓耐受力是重要缓冲，适合把它转化成固定的交易纪律。" : "你的机会感很敏锐，适合用验证流程把速度变成优势。 ");
  setText(page.querySelector("[data-detail-personality-copy]"), highDegen
    ? `你属于“${personality}”：对机会窗口、叙事变化和即时反馈都很敏感。这个特征让你比很多人更早看到变化，也让你更容易把“现在就行动”误认为“现在不行动就会失去一切”。${narrative.wordCloud}`
    : `你属于“${personality}”：你的交易反应不是单纯追逐速度，而是会先观察，再在确认感出现后集中行动。真正需要保护的是确认感过强之后的仓位边界。${narrative.wordCloud}`);
  setText(page.querySelector("[data-detail-holding-copy]"), api.holdingBehavior || narrative.assetFacts?.[1]?.[1] || "持仓节奏会随着市场叙事和波动强度改变。");
  setText(page.querySelector("[data-detail-alpha-copy]"), highAbstract
    ? "你的 Alpha 雷达对新叙事非常灵敏，但灵敏度越高，越需要两步验证：先确认流动性，再确认自己是否只是被故事吸引。"
    : "你的机会感更适合放在可验证的信号上。把热度、流动性和自己的退出条件分开记录，能明显减少误判。");

  const evidence = [
    ["人格核心", personality],
    ["损失触发", narrative.cause],
    ["一句话判词", narrative.sentence]
  ];
  page.querySelector("[data-detail-evidence]").innerHTML = evidence.map(([label, value]) => `<div><span>${escapeDetailHtml(label)}</span><strong>${escapeDetailHtml(value)}</strong></div>`).join("");

  page.querySelector("[data-detail-dimensions]").innerHTML = REPORT_DETAIL_DIMENSIONS.map((dimension, index) => {
    const score = scores[index];
    return `<article class="detail-dimension" style="--detail-accent:${dimension.color}">
      <div class="detail-dimension-top"><span>${escapeDetailHtml(currentLang === "en" ? dimension.en : dimension.zh)}</span><strong>${score}</strong></div>
      <i><em style="width:${score}%"></em></i>
      <small>${escapeDetailHtml(reportDetailBand(score))}</small>
      <p>${escapeDetailHtml(reportDetailDimensionCopy(index, score))}</p>
    </article>`;
  }).join("");

  const holdingItems = [
    highDegen ? "进入速度快于退出规则的形成速度" : "确认感形成后才会明显加速",
    highDiamond ? "能够承受波动，但要警惕把坚持变成拒绝复盘" : "需要提前写好回撤后的处理动作",
    highNight ? "深夜和疲劳状态可能放大交易叙事" : "日间决策更容易保持清晰"
  ];
  page.querySelector("[data-detail-holding-list]").innerHTML = holdingItems.map((item) => `<li>${escapeDetailHtml(item)}</li>`).join("");

  const lossItems = (narrative.lossLines || []).slice(0, 3);
  page.querySelector("[data-detail-loss]").innerHTML = lossItems.map((item, index) => `<div><b>0${index + 1}</b><span>${escapeDetailHtml(item)}</span><small>${escapeDetailHtml(index === 0 ? narrative.cause : "将这个触发点写进下一次复盘，而不是等情绪过去后凭印象回忆")}</small></div>`).join("");

  page.querySelector("[data-detail-alpha]").innerHTML = (narrative.radar || []).slice(0, 3).map((item) => `<span>${escapeDetailHtml(item)}</span>`).join("");
  page.querySelector("[data-detail-fate]").innerHTML = (narrative.fateStrip || []).slice(0, 3).map((item, index) => `<div><b>0${index + 1}</b><span>${escapeDetailHtml(item)}</span><small>${escapeDetailHtml(index === 0 ? "先降低情绪噪音" : index === 1 ? "再恢复固定规则" : "最后才扩大行动范围")}</small></div>`).join("");

  const prescriptions = [
    highDegen ? "任何新仓位先延迟 10 分钟，期间只允许写入场理由。" : "把每次入场理由压缩成一句可验证的话。",
    highDiamond ? "为持仓设置复盘触发点，避免“能扛”替代了“该不该扛”。" : "入场前同时写出止损、退出和重新评估条件。",
    highNight ? "睡前不新增仓位，把夜间想法放进观察清单。" : "把重要决定放到精力最稳定的时段完成。",
    "每周只复盘行为，不给自己贴人格标签；记录做对了什么，比责备更有用。"
  ];
  page.querySelector("[data-detail-prescription]").innerHTML = prescriptions.map((item, index) => `<article><b>0${index + 1}</b><p>${escapeDetailHtml(item)}</p></article>`).join("");
}

function shortWallet(value) {
  const clean = String(value || "").trim();
  if (!clean) return activeReportIdentity.wallet;
  if (clean.length <= 14) return clean;
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
}

function normalizeHandle(value, fallback = activeReportIdentity.handle) {
  const clean = String(value || "").trim();
  if (!clean) return fallback;
  return clean.startsWith("@") ? clean : `@${clean}`;
}

function xAvatarUrl(handle) {
  const username = String(handle || "").replace(/^@/, "").trim();
  if (!username || username === "handle") return "";
  return `https://unavatar.io/x/${encodeURIComponent(username)}`;
}

function applyReportAvatar(report, handle) {
  const avatarUrl = xAvatarUrl(handle);
  report.querySelectorAll("[data-x-avatar], [data-x-avatar-clone]").forEach((avatar) => {
    const image = avatar.querySelector("img");
    const fallback = avatar.querySelector("b");
    if (!image || !fallback) return;
    if (!avatarUrl) {
      image.hidden = true;
      image.removeAttribute("src");
      fallback.hidden = false;
      return;
    }
    image.hidden = false;
    fallback.hidden = true;
    image.referrerPolicy = "no-referrer";
    image.src = avatarUrl;
    image.onerror = () => {
      image.hidden = true;
      fallback.hidden = false;
    };
  });
}

function updateReportIdentity(options = {}) {
  const report = document.querySelector(".ref-report-page");
  if (!report) return;

  const hasHandle = Object.prototype.hasOwnProperty.call(options, "handle");
  const handle = normalizeHandle(options.handle, hasHandle ? "@handle" : activeReportIdentity.handle);
  const wallet = shortWallet(options.wallet);
  const rawWallet = options.wallet || activeReportIdentity.rawWallet || wallet;
  activeReportIdentity = { handle, wallet, rawWallet };

  setText(report.querySelector(".patient-strip strong"), handle);
  setText(report.querySelector(".patient-strip small"), `short wallet: ${wallet}`);
  setText(report.querySelector(".share-card-preview span"), handle);
  applyReportAvatar(report, handle);

  renderDetailedReport();
}

function readLocalLeaderboard() {
  try {
    const parsed = JSON.parse(window.localStorage?.getItem(LOCAL_LEADERBOARD_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalLeaderboard(entries) {
  try {
    window.localStorage?.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 30)));
  } catch {
    // Local ranking is a progressive enhancement; the report still works without storage.
  }
}

function leaderboardEntryKey(entry) {
  return String(entry?.address || entry?.id || entry?.handle || "").toLowerCase();
}

function leaderboardRarityScore(entry) {
  return Number(entry?.rarity?.score ?? entry?.rankScore ?? entry?.degen ?? 0) || 0;
}

function leaderboardCategory(entry) {
  if (entry?.category) return entry.category;
  const degen = Number(entry?.degen || 0);
  const diamond = Number(entry?.diamond || 0);
  const airdrop = Number(entry?.airdrop || 0);
  if (airdrop >= Math.max(degen, diamond, 58)) return "airdrop";
  if (diamond >= Math.max(degen, 62)) return "diamond";
  if (degen >= 68) return "degen";
  return "psyche";
}

function tierClassForEntry(entry) {
  const tier = String(entry?.rarity?.tier || entry?.rarity?.key || "").toLowerCase();
  const label = String(entry?.rarity?.tierName || entry?.rarity?.label || entry?.rarity || "").toLowerCase();
  if (tier === "unique" || tier === "one" || label.includes("1/1")) return "tier-glitch";
  if (tier === "mythic" || label.includes("mythic")) return "tier-red";
  if (tier === "legendary" || label.includes("legendary")) return "tier-gold";
  if (tier === "epic" || label.includes("epic")) return "tier-purple";
  if (tier === "rare" || label.includes("rare")) return "tier-blue";
  if (tier === "uncommon" || label.includes("uncommon")) return "tier-green";
  const degen = Number(entry?.degen || entry?.rankScore || 0);
  return degen >= 92 ? "tier-red" : degen >= 80 ? "tier-gold" : degen >= 65 ? "tier-purple" : degen >= 50 ? "tier-blue" : "tier-green";
}

function leaderboardRarityLabel(entry) {
  if (entry?.rarity?.tierName) return entry.rarity.tierName;
  if (entry?.rarity?.label) return entry.rarity.label;
  if (typeof entry?.rarity === "string") return entry.rarity;
  return reportRarityFromScore(entry?.degen || entry?.rankScore || 0).label;
}

function mergeLeaderboardEntries(...lists) {
  const byKey = new Map();
  lists.flat().filter(Boolean).forEach((entry) => {
    const key = leaderboardEntryKey(entry);
    if (!key) return;
    const existing = byKey.get(key);
    if (!existing || String(entry.generatedAt || "").localeCompare(String(existing.generatedAt || "")) >= 0) {
      byKey.set(key, entry);
    }
  });
  return [...byKey.values()]
    .sort((a, b) =>
      leaderboardRarityScore(b) - leaderboardRarityScore(a) ||
      Number(b.rankScore || 0) - Number(a.rankScore || 0) ||
      String(b.generatedAt || "").localeCompare(String(a.generatedAt || ""))
    )
    .slice(0, 30);
}

function rankAvatarMarkup(entry) {
  const handle = String(entry?.handle || "");
  const username = String(entry?.username || "").replace(/^@/, "");
  const usableHandle = handle.startsWith("@") ? handle : username && !username.startsWith("wallet_") ? `@${username}` : "";
  const avatarUrl = usableHandle ? xAvatarUrl(usableHandle) : "";
  return { avatarUrl, fallback: "X" };
}

function paintScoreBar(bar, score) {
  if (!bar) return;
  const fill = Math.max(18, Math.min(100, Math.round(Number(score) || 0)));
  bar.style.background = `linear-gradient(90deg, currentColor 0 ${fill}%, transparent ${fill}% 100%), repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 10px)`;
  bar.title = currentLang === "en" ? `Score ${fill}` : `综合评分 ${fill}`;
}

function leaderboardDisplayPersonality(entry) {
  const raw = String(entry?.personality || finalText("report", "personalityValue") || "").trim();
  const [firstSegment] = raw.split(/\s*[·•|｜]\s*/);
  return (firstSegment || raw).replace(/\s+[A-Z0-9]{3,}$/i, "").trim() || raw;
}

function leaderboardActiveFilter(page) {
  return page?.querySelector("[data-rarity-filter].active")?.dataset.rarityFilter || "all";
}

function leaderboardFilteredEntries(entries, page) {
  const activeFilter = leaderboardActiveFilter(page);
  if (activeFilter === "all") return entries;
  return entries.filter((entry) => leaderboardCategory(entry) === activeFilter);
}

function updateRankPager(page, totalPages) {
  const pager = page?.querySelector(".rank-pager");
  if (!pager) return;
  const safeTotal = Math.max(1, totalPages);
  const output = pager.querySelector("[data-rank-page-current]");
  if (output) output.textContent = `${String(activeRankPage + 1).padStart(2, "0")} / ${String(safeTotal).padStart(2, "0")}`;
  pager.querySelectorAll("button").forEach((button) => {
    const disabled = safeTotal <= 1;
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
  });
}

function renderLeaderboardRows(entries = activeLeaderboardEntries) {
  const rarity = document.querySelector(".ref-rarity-page");
  const list = rarity?.querySelector(".rank-list");
  if (!rarity || !list) return;
  const filteredEntries = leaderboardFilteredEntries(entries, rarity);
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / RANK_PAGE_SIZE));
  activeRankPage = Math.max(0, Math.min(activeRankPage, totalPages - 1));
  const offset = activeRankPage * RANK_PAGE_SIZE;
  const rows = filteredEntries.slice(offset, offset + RANK_PAGE_SIZE);
  updateRankPager(rarity, totalPages);
  if (!rows.length) {
    list.replaceChildren();
    syncRarityReadout(rarity, 0, filteredEntries.length);
    return;
  }
  list.replaceChildren();
  rows.forEach((entry, index) => {
    const row = document.createElement("article");
    row.className = `rank-row ${tierClassForEntry(entry)}`;
    row.dataset.rarityRow = leaderboardCategory(entry);

    const rank = document.createElement("b");
    const rankNumber = offset + index + 1;
    rank.textContent = rankNumber === 7 && leaderboardRarityLabel(entry) === "1/1" ? "1/1" : `#${rankNumber}`;

    const avatarSlot = document.createElement("i");
    const avatar = rankAvatarMarkup(entry);
    if (avatar.avatarUrl) {
      const image = document.createElement("img");
      image.className = "rank-avatar";
      image.alt = "";
      image.referrerPolicy = "no-referrer";
      image.src = avatar.avatarUrl;
      image.onerror = () => {
        image.remove();
        avatarSlot.textContent = avatar.fallback;
      };
      avatarSlot.append(image);
    } else {
      avatarSlot.textContent = avatar.fallback;
    }

    const handle = document.createElement("strong");
    handle.textContent = entry.handle || entry.shortAddress || shortWallet(entry.address) || "@handle";

    const personality = document.createElement("span");
    personality.textContent = leaderboardDisplayPersonality(entry);
    personality.title = entry.personality || personality.textContent;

    const rarityLabel = document.createElement("em");
    rarityLabel.textContent = leaderboardRarityLabel(entry);

    const score = document.createElement("small");
    paintScoreBar(score, leaderboardRarityScore(entry));

    row.append(rank, avatarSlot, handle, personality, rarityLabel, score);
    list.append(row);
  });
  for (let index = rows.length; index < RANK_PAGE_SIZE; index += 1) {
    const row = document.createElement("article");
    row.className = "rank-row rank-row-empty";
    row.setAttribute("aria-hidden", "true");
    list.append(row);
  }
  syncRarityReadout(rarity, rows.length, filteredEntries.length);
}

function syncRarityReadout(page = document.querySelector(".ref-rarity-page"), visibleOverride, totalOverride) {
  if (!page) return;
  if (Number.isFinite(visibleOverride) && Number.isFinite(totalOverride)) {
    const readout = page.querySelector("[data-rarity-readout]");
    if (readout) readout.textContent = `${visibleOverride} / ${totalOverride}`;
    return;
  }
  const activeFilter = page.querySelector("[data-rarity-filter].active")?.dataset.rarityFilter || "all";
  let visible = 0;
  const rows = page.querySelectorAll("[data-rarity-row]");
  rows.forEach((row) => {
    const shouldShow = activeFilter === "all" || row.dataset.rarityRow === activeFilter;
    row.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });
  const readout = page.querySelector("[data-rarity-readout]");
  if (readout) readout.textContent = `${visible} / ${rows.length}`;
}

function localLeaderboardEntry(address, handle, apiReport) {
  const api = normalizeReportApiData(apiReport);
  const rawAddress = String(address || activeReportIdentity.rawWallet || "").trim();
  const displayHandle = normalizeHandle(handle, "");
  const hasXHandle = displayHandle.startsWith("@") && displayHandle !== "@handle";
  const degen = clampReportScore(api?.scores.degen ?? activeReportScores.degen);
  const diamond = clampReportScore(api?.scores.diamond ?? activeReportScores.diamond);
  const airdrop = clampReportScore(api?.scores.airdrop ?? (32 + ((degen * 3 + diamond) % 59)));
  const tier = reportRarityFromScore(degen);
  const personality = api?.personality || activeReportNarrative?.personality || finalText("report", "personalityValue");
  const rarityScore = Number((api?.rarity?.score ?? Math.min(100, degen * 0.68 + airdrop * 0.18 + diamond * 0.14)).toFixed?.(2) ?? degen);
  return {
    id: `${hasXHandle ? displayHandle.slice(1).toLowerCase() : "wallet"}:${rawAddress.toLowerCase()}:${currentLang}`,
    username: hasXHandle ? displayHandle.slice(1) : `wallet_${rawAddress.slice(2, 10).toLowerCase()}`,
    handle: hasXHandle ? displayHandle : shortWallet(rawAddress),
    name: hasXHandle ? displayHandle.slice(1) : shortWallet(rawAddress),
    avatarUrl: hasXHandle ? xAvatarUrl(displayHandle) : "",
    profileUrl: hasXHandle ? `https://x.com/${encodeURIComponent(displayHandle.slice(1))}` : "",
    address: rawAddress,
    shortAddress: shortWallet(rawAddress),
    personality,
    degen,
    diamond,
    airdrop,
    rankScore: api?.rankScore ?? Number((degen * 0.54 + diamond * 0.18 + airdrop * 0.28).toFixed(2)),
    rarity: api?.rarity || { tier: tier.key === "one" ? "unique" : tier.key, tierName: tier.label, score: rarityScore },
    generatedAt: new Date().toISOString(),
    language: currentLang,
    category: leaderboardCategory({ degen, diamond, airdrop })
  };
}

function addLocalLeaderboardEntry(address, handle, apiReport) {
  const entry = localLeaderboardEntry(address, handle, apiReport);
  const merged = mergeLeaderboardEntries(entry, readLocalLeaderboard(), activeLeaderboardEntries);
  activeLeaderboardEntries = merged;
  writeLocalLeaderboard(merged);
  renderLeaderboardRows(merged);
  return entry;
}

async function fetchJsonPayload(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
  return payload;
}

async function refreshLeaderboard() {
  const local = readLocalLeaderboard();
  try {
    const payload = await fetchJsonPayload(`/api/leaderboard?lang=${encodeURIComponent(currentLang)}`);
    activeLeaderboardEntries = mergeLeaderboardEntries(payload.entries || [], local);
  } catch {
    activeLeaderboardEntries = mergeLeaderboardEntries(local);
  }
  renderLeaderboardRows(activeLeaderboardEntries);
}

async function syncLeaderboardEntry(address, handle) {
  const username = normalizeHandle(handle, "").replace(/^@/, "");
  try {
    const payload = await fetchJsonPayload(`/api/leaderboard?lang=${encodeURIComponent(currentLang)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address, username, lang: currentLang })
    });
    if (payload.entry) addLocalLeaderboardEntry(address, handle, { ...payload.entry, scores: { degen: payload.entry.degen, diamond: payload.entry.diamond, airdrop: payload.entry.airdrop } });
    if (payload.entries) {
      activeLeaderboardEntries = mergeLeaderboardEntries(payload.entries, readLocalLeaderboard());
      writeLocalLeaderboard(activeLeaderboardEntries);
      renderLeaderboardRows(activeLeaderboardEntries);
    }
  } catch {
    // Auto-ranking should never block report generation.
  }
}

async function enrichReportFromApi(address, handle) {
  try {
    const report = await fetchJsonPayload(`/api/analyze?address=${encodeURIComponent(address)}&lang=${encodeURIComponent(currentLang)}`);
    updateReportScores(report.scores?.degen ?? activeReportScores.degen, report.scores?.diamond ?? activeReportScores.diamond, {
      rawWallet: address,
      apiReport: report
    });
    addLocalLeaderboardEntry(address, handle, report);
  } catch {
    // The deterministic local report remains the fallback if live chain reads are unavailable.
  } finally {
    syncLeaderboardEntry(address, handle);
  }
}

function setPlaceholder(element, value) {
  if (element && value !== undefined) element.setAttribute("placeholder", value);
}

function hydrateFinalPages() {
  const communityCount = document.querySelector("[data-community-report-count]");
  if (communityCount) {
    const totalReports = COMMUNITY_REPORT_BASE + communityVisitCount;
    const formatted = new Intl.NumberFormat(currentLang === "en" ? "en-US" : "zh-CN").format(totalReports);
    setText(communityCount, currentLang === "en" ? `${formatted}+ Reports` : `${formatted}+ 份报告`);
  }

  const wallet = document.querySelector(".ref-wallet-page");
  if (wallet) {
    setText(wallet.querySelector(".duel-wallet-a h2"), finalText("wallet", "aTitle"));
    setText(wallet.querySelector(".duel-wallet-b h2"), finalText("wallet", "bTitle"));
    setPlaceholder(wallet.querySelector('[name="leftWallet"]'), finalText("wallet", "walletPlaceholderA"));
    setPlaceholder(wallet.querySelector('[name="rightWallet"]'), finalText("wallet", "walletPlaceholderB"));
    wallet.querySelectorAll('[name="leftName"], [name="rightName"]').forEach((input) => {
      setPlaceholder(input, finalText("wallet", "namePlaceholder"));
    });
    wallet.querySelectorAll(".duel-meter span").forEach((label, index) => {
      setText(label, index % 2 === 0 ? finalText("wallet", "degen") : finalText("wallet", "diamond"));
    });
    wallet.querySelectorAll(".duel-wallet > strong").forEach((label) => setText(label, finalText("wallet", "rarity")));
    setText(wallet.querySelector(".pk-start"), finalText("wallet", "run"));
    setText(wallet.querySelector(".system-judge h3"), finalText("wallet", "judge"));
    wallet.querySelectorAll(".system-judge div b").forEach((label, index) => {
      setText(label, [finalText("wallet", "metric1"), finalText("wallet", "metric2"), finalText("wallet", "metric3")][index]);
    });
    if (!wallet.dataset.pkResolved) {
      setText(wallet.querySelector("[data-pk-verdict]"), finalText("wallet", "verdict"));
    }
  }

  const rarity = document.querySelector(".ref-rarity-page");
  if (rarity) {
    const rarityCopy = FINAL_PAGE_COPY[currentLang].rarity;
    rarity.querySelectorAll("[data-rarity-filter]").forEach((button, index) => setText(button, rarityCopy.tabs[index]));
    rarity.querySelectorAll(".rank-label-row span").forEach((label, index) => setText(label, rarityCopy.labels[index]));
    if (activeLeaderboardEntries.length) {
      renderLeaderboardRows(activeLeaderboardEntries);
    } else {
      rarity.querySelectorAll("[data-rarity-row]").forEach((row, index) => {
        const data = rarityCopy.rows[index];
        if (!data) return;
        setText(row.querySelector("b"), data[0]);
        setText(row.querySelector("strong"), data[1]);
        setText(row.querySelector("span"), data[2]);
        setText(row.querySelector("em"), data[3]);
      });
    }
    setText(rarity.querySelector(".anomaly-card h3"), rarityCopy.cardTitle);
    rarity.querySelectorAll(".anomaly-card p").forEach((line, index) => {
      const span = line.querySelector("span");
      line.firstChild.textContent = `${rarityCopy.cardLines[index]} `;
      if (span) span.textContent = "";
    });
    setText(rarity.querySelector("[data-rarity-readout]"), rarityCopy.readout);
  }

  const psyche = document.querySelector(".ref-psyche-page");
  if (psyche) {
    const psycheCopy = FINAL_PAGE_COPY[currentLang].psyche;
    setText(psyche.querySelector(".soft-intro h2"), psycheCopy.title);
    setText(psyche.querySelector(".soft-intro p"), psycheCopy.lead);
    setText(psyche.querySelector(".soft-intro strong"), psycheCopy.callout);
    psyche.querySelectorAll(".soft-intro li").forEach((item, index) => setText(item, psycheCopy.bullets[index]));
    psyche.querySelectorAll(".soft-intro div button").forEach((button, index) => setText(button, [psycheCopy.save, psycheCopy.clear][index]));
    psyche.querySelectorAll("[data-psyche-option]").forEach((button, index) => setText(button, psycheCopy.options[index]));
    const labels = psyche.querySelectorAll(".brain-monitor > span");
    setText(labels[0], psycheCopy.ekg);
    setText(labels[1], psycheCopy.breath);
    const slogan = psyche.querySelector(".soft-slogan");
    if (slogan) slogan.innerHTML = `${psycheCopy.slogan}<b>degendna.fun</b>`;
    updatePsycheDiagnosis(undefined, psyche);
  }

  const about = document.querySelector(".ref-about-page");
  if (about) {
    const aboutCopy = FINAL_PAGE_COPY[currentLang].about;
    setText(about.querySelector(".doctor-card strong"), aboutCopy.doctor);
    setText(about.querySelector(".doctor-card span"), aboutCopy.role);
    setText(about.querySelector(".about-copy h2"), aboutCopy.title);
    setText(about.querySelector(".about-copy p"), aboutCopy.lead);
    setText(about.querySelector(".about-copy small"), aboutCopy.byline);
    about.querySelectorAll(".reason-card").forEach((card, index) => setText(card, aboutCopy.reasons[index]));
    const labels = about.querySelectorAll(".brain-monitor > span");
    setText(labels[0], aboutCopy.ekg);
    setText(labels[1], aboutCopy.breath);
    const slogan = about.querySelector(".soft-slogan");
    if (slogan) {
      slogan.innerHTML = `${aboutCopy.slogan}<a class="about-site-link" href="https://degendna.fun" target="_blank" rel="noopener noreferrer">degendna.fun</a>`;
    }
  }

  const report = document.querySelector(".ref-report-page");
  if (report) {
    const reportCopy = FINAL_PAGE_COPY[currentLang].report;
    setText(report.querySelector(".report-ribbon"), reportCopy.ribbon);
    setText(report.querySelector(".patient-strip strong"), reportCopy.handle);
    setText(report.querySelector(".patient-strip small"), reportCopy.wallet);
    const dossierBlocks = report.querySelectorAll(".report-dossier > div");
    setText(dossierBlocks[0]?.querySelector("span"), reportCopy.personality);
    setText(dossierBlocks[0]?.querySelector("b"), reportCopy.personalityValue);
    setText(dossierBlocks[1]?.querySelector("span"), reportCopy.rarity);
    const dossierRows = report.querySelectorAll(".report-dossier p");
    const dossierData = [
      undefined,
      [reportCopy.degen, undefined],
      [reportCopy.diamond, undefined],
      [reportCopy.cause, reportCopy.causeValue],
      [reportCopy.sentence, reportCopy.sentenceValue]
    ];
    dossierRows.forEach((row, index) => {
      if (!dossierData[index]) return;
      setText(row.querySelector("em"), dossierData[index]?.[0]);
      if (dossierData[index]?.[1]) setText(row.querySelector("strong"), dossierData[index][1]);
    });
    report.querySelectorAll(".report-widget h3").forEach((title, index) => setText(title, reportCopy.widgets[index]));
    setText(report.querySelector(".word-cloud"), reportCopy.wordCloud);
    report.querySelectorAll(".asset-widget .widget-facts div").forEach((row, index) => {
      setText(row.querySelector("dt"), reportCopy.assetFacts?.[index]?.[0]);
      setText(row.querySelector("dd"), reportCopy.assetFacts?.[index]?.[1]);
    });
    report.querySelectorAll(".black-widget .widget-lines li").forEach((item, index) => setText(item, reportCopy.lossLines?.[index]));
    report.querySelectorAll(".luck-widget .fate-strip span").forEach((item, index) => setText(item, reportCopy.fateStrip?.[index]));
    report.querySelectorAll(".radar-widget li").forEach((item, index) => {
      const bar = item.querySelector("span");
      item.textContent = reportCopy.radar[index] || "";
      if (bar) item.prepend(bar);
    });
    renderReportBadges(report, activeReportDimensions, reportRarityFromScore(activeReportScores.degen));
    setText(report.querySelector(".share-button"), reportCopy.share);
    setText(report.querySelector("[data-report-detail]"), currentLang === "en" ? "Open full report" : "打开完整报告");
    setText(report.querySelector(".gold-action"), reportCopy.nft);
    applyReportNarrative(report, activeReportNarrative);
  }

  renderDetailedReport();
}

function hydrateReportDetailFromRoute() {
  const route = reportDetailRoute();
  if (!route?.address) return;

  const sameWallet = activeReportIdentity.rawWallet?.toLowerCase() === route.address.toLowerCase();
  const handle = normalizeHandle(route.handle, sameWallet ? activeReportIdentity.handle : "@handle");

  if (!sameWallet) {
    activeReportApiData = null;
    updateReportIdentity({ wallet: route.address, handle });
    updateReportScores(scoreFromText(route.address), 100 - (scoreFromText(route.address) % 48), { rawWallet: route.address });
  }

  const routeKey = `${route.address.toLowerCase()}:${currentLang}`;
  const loadedAddress = String(activeReportApiData?.address || "").toLowerCase();
  if (loadedAddress === route.address.toLowerCase() || detailRouteLoadKey === routeKey) return;

  detailRouteLoadKey = routeKey;
  fetchJsonPayload(`/api/analyze?address=${encodeURIComponent(route.address)}&lang=${encodeURIComponent(currentLang)}`)
    .then((report) => {
      updateReportScores(report.scores?.degen ?? activeReportScores.degen, report.scores?.diamond ?? activeReportScores.diamond, {
        rawWallet: route.address,
        apiReport: report
      });
    })
    .catch(() => {
      // The deterministic local narrative remains available when the shared report is offline.
    });
}

function setStatus(message, tone = "info") {
  if (!statusLine) return;
  statusLine.textContent = message;
  statusLine.dataset.tone = tone;
}

function clearStatus() {
  if (!statusLine) return;
  statusLine.textContent = "";
  delete statusLine.dataset.tone;
}

function closeTopMoreMenu() {
  document.body.classList.remove("menu-open");
  if (topMoreMenu) topMoreMenu.hidden = true;
  menuButton?.setAttribute("aria-expanded", "false");
}

function openTopMoreMenu() {
  document.body.classList.add("menu-open");
  if (topMoreMenu) topMoreMenu.hidden = false;
  menuButton?.setAttribute("aria-expanded", "true");
}

function startDegenPersonaFromNav() {
  const app = activeMentalApp || document.querySelector("[data-mental-app]");
  const state = activeMentalState;

  if (!app || !state) {
    applyPage("psyche");
    return;
  }

  startMentalSession(app, state, { mode: "degen-persona", singleModule: null });
}

function applyLanguage() {
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  if (languageCurrent) {
    languageCurrent.textContent = t("language.current");
  }

  const alternate = languageButton?.querySelector("i");
  if (alternate) {
    alternate.textContent = currentLang === "zh" ? "/ EN" : "/ 中文";
  }

  updatePsycheDiagnosis();
  hydrateMentalStaticCopy();
  if (activeMentalApp && activeMentalState) renderMentalHealth(activeMentalApp, activeMentalState);
  hydrateFinalPages();
  updateReportIdentity(activeReportIdentity);
  updateReportScores(activeReportScores.degen, activeReportScores.diamond);
}

function applyPage(page, options = {}) {
  const nextPage = PAGE_NAMES.includes(page) ? page : "home";
  currentPage = nextPage;
  document.body.dataset.page = nextPage;
  closeTopMoreMenu();

  const isDegenPersonaPage = nextPage === "psyche-test" && activeMentalState?.mode === "degen-persona";
  document.body.classList.toggle("degen-persona-quiz", isDegenPersonaPage);
  document.body.classList.toggle("degen-persona-result-mode", Boolean(isDegenPersonaPage && activeMentalState?.completed));
  document.body.classList.toggle("report-detail-mode", nextPage === "report-detail");
  updateViewportStageScale(nextPage);

  const activeNavPage = nextPage === "report-detail" ? "__reportDetail" : isDegenPersonaPage ? "__degenPersona" : nextPage === "psyche-test" ? "psyche" : nextPage;
  navButtons.forEach((button) => {
    const isActive = button.dataset.pageTarget === activeNavPage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });
  degenNavButtons.forEach((button) => {
    button.classList.toggle("active", isDegenPersonaPage);
    button.setAttribute("aria-current", isDegenPersonaPage ? "page" : "false");
  });
  const isMenuPage = menuPageButtons.some((button) => button.dataset.menuPageTarget === nextPage);
  menuButton?.classList.toggle("active", isMenuPage);
  menuPageButtons.forEach((button) => {
    const isActive = button.dataset.menuPageTarget === nextPage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  if (options.updateHash !== false && window.location.hash !== `#${nextPage}`) {
    window.history.pushState(null, "", `#${nextPage}`);
  }
  resetViewportScroll();

  if (nextPage === "rarity") {
    if (activeLeaderboardEntries.length) {
      renderLeaderboardRows(activeLeaderboardEntries);
    } else {
      syncRarityReadout(document.querySelector(".ref-rarity-page"));
    }
  }

  if (nextPage === "report-detail") {
    hydrateReportDetailFromRoute();
    renderDetailedReport();
  }

  clearStatus();
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const address = addressInput.value.trim();

  if (!EVM_ADDRESS.test(address)) {
    setStatus(t("status.invalid"), "error");
    addressInput.focus();
    return;
  }

  const handle = xHandleInput?.value || "";
  const degen = scoreFromText(address);
  const diamond = 100 - (degen % 48);
  setStatus(t("status.success"));
  updateReportIdentity({ wallet: address, handle });
  updateReportScores(degen, diamond, { rawWallet: address });
  addLocalLeaderboardEntry(address, handle);
  applyPage("report");
  enrichReportFromApi(address, handle);
});

languageButton?.addEventListener("click", () => {
  currentLang = currentLang === "zh" ? "en" : "zh";
  writeStoredLang(currentLang);
  applyLanguage();
  closeTopMoreMenu();
  clearStatus();
});

menuButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  if (document.body.classList.contains("menu-open")) {
    closeTopMoreMenu();
    clearStatus();
    return;
  }

  openTopMoreMenu();
  setStatus(t("status.menu"));
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => applyPage(button.dataset.pageTarget));
});

degenNavButtons.forEach((button) => {
  button.addEventListener("click", startDegenPersonaFromNav);
});

xiaojingNavButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const url = new URL("/xiaojing/", window.location.origin);
    url.searchParams.set("source", "degendna");
    url.searchParams.set("lang", currentLang);
    window.location.assign(url);
  });
});

menuPageButtons.forEach((button) => {
  button.addEventListener("click", () => applyPage(button.dataset.menuPageTarget));
});

routeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    applyPage(link.dataset.route);
  });
});

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("menu-open")) return;
  if (event.target.closest(".top-actions")) return;
  closeTopMoreMenu();
});

window.addEventListener("hashchange", () => {
  applyPage(pageFromHash(), { updateHash: false });
});

window.addEventListener("resize", queueViewportStageScale, { passive: true });
window.addEventListener("orientationchange", queueViewportStageScale, { passive: true });
window.visualViewport?.addEventListener("resize", queueViewportStageScale, { passive: true });

document.querySelectorAll("[data-wallet-pk-form]").forEach((walletForm) => {
  walletForm.addEventListener("submit", (event) => {
    event.preventDefault();
    walletForm.dataset.pkResolved = "true";

    const left = walletForm.querySelector('[name="leftWallet"]')?.value || "left";
    const right = walletForm.querySelector('[name="rightWallet"]')?.value || "right";
    const leftScore = scoreFromText(left);
    const rightScore = scoreFromText(right);
    const leftDiamond = 100 - (leftScore % 48);
    const rightDiamond = 100 - (rightScore % 48);

    setText(walletForm.querySelector("[data-pk-score-a]"), `${leftScore}/100`);
    setText(walletForm.querySelector("[data-pk-score-b]"), `${rightScore}/100`);
    walletForm.querySelector("[data-pk-left-bar]").style.width = `${leftScore}%`;
    walletForm.querySelector("[data-pk-right-bar]").style.width = `${rightScore}%`;
    walletForm.querySelector(".duel-wallet-a .duel-meter .wide").style.width = `${leftDiamond}%`;
    walletForm.querySelector(".duel-wallet-b .duel-meter .wide").style.width = `${rightDiamond}%`;
    updateReportScores(Math.max(leftScore, rightScore), Math.max(leftDiamond, rightDiamond));

    const winner = leftScore >= rightScore ? finalText("wallet", "winnerA") : finalText("wallet", "winnerB");
    setText(walletForm.querySelector("[data-pk-verdict]"), finalText("wallet", "verdictDone")(winner));
    setStatus(t("status.pk"));
  });
});

document.querySelectorAll("[data-rarity-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.closest("[data-page-screen]") || document;
    page.querySelectorAll("[data-rarity-filter]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    if (page.classList?.contains("ref-rarity-page")) {
      activeRankPage = 0;
      renderLeaderboardRows(activeLeaderboardEntries);
      resetViewportScroll();
    } else {
      syncRarityReadout(page);
    }
    setStatus(t("status.rarity"));
  });
});

document.querySelectorAll(".rank-pager").forEach((pager) => {
  pager.querySelector("[data-rank-page-prev]")?.addEventListener("click", () => {
    const page = pager.closest(".ref-rarity-page");
    const total = Math.max(1, Math.ceil(leaderboardFilteredEntries(activeLeaderboardEntries, page).length / RANK_PAGE_SIZE));
    activeRankPage = activeRankPage <= 0 ? total - 1 : activeRankPage - 1;
    renderLeaderboardRows(activeLeaderboardEntries);
    resetViewportScroll();
  });
  pager.querySelector("[data-rank-page-next]")?.addEventListener("click", () => {
    const page = pager.closest(".ref-rarity-page");
    const total = Math.max(1, Math.ceil(leaderboardFilteredEntries(activeLeaderboardEntries, page).length / RANK_PAGE_SIZE));
    activeRankPage = activeRankPage >= total - 1 ? 0 : activeRankPage + 1;
    renderLeaderboardRows(activeLeaderboardEntries);
    resetViewportScroll();
  });
  updateRankPager(pager.closest(".ref-rarity-page"), 1);
});

const MENTAL_STORAGE_KEY = "degendna:mental-records:v1";
const MENTAL_DRAFT_KEY = "degendna:mental-draft:v1";
let activeMentalApp = null;
let activeMentalState = null;
let mentalAutoAdvanceTimer = null;

function mc(zh, en) {
  return mentalLocale(currentLang, zh, en);
}

function localizedMentalModule(key) {
  return localizeMentalModule(currentLang, key, MENTAL_MODULES[key]);
}

function localizedMentalMode(key) {
  return localizeMentalMode(currentLang, key, MENTAL_MODE_COPY[key]);
}

function localizedPersona(persona) {
  const type = localizePersonaType(currentLang, persona.type);
  const dimensions = persona.dimensions.map((dimension) => {
    const localized = localizePersonaDimension(currentLang, dimension.key, dimension);
    return {
      ...localized,
      direction: dimension.score >= 0 ? localized.right : localized.left
    };
  });
  const strongestKeys = new Set(persona.strongest.map((item) => item.key));
  return {
    ...persona,
    type,
    dimensions,
    strongest: dimensions.filter((item) => strongestKeys.has(item.key)).sort((a, b) => b.strength - a.strength)
  };
}

function hydrateMentalStaticCopy() {
  const center = document.querySelector("[data-mental-app]");
  if (center) {
    const intake = center.querySelector(".mental-intake");
    if (intake) intake.innerHTML = `
      <span class="mental-kicker">${mc("心理健康自测中心", "Mental Health Check-In Center")}</span>
      <h2>${mc("照完钱包，也照顾一下自己。", "After checking the wallet, check in with yourself.")}</h2>
      <p>${mc("这里没有排行榜，没有 NFT，也不会公开你的结果。自测只帮助你观察最近状态，不能替代医生、心理咨询师或精神科医生的判断。", "There is no leaderboard or NFT here, and your results are never made public. These check-ins help you observe recent changes; they do not replace a doctor, counselor, or psychiatrist.")}</p>
      <ul>
        <li>${mc("结果默认只保存在本浏览器", "Results stay in this browser by default")}</li>
        <li>${mc("不上传服务器，不进入排行榜", "Nothing is uploaded or added to a leaderboard")}</li>
        <li>${mc("不生成分享图，不和钱包绑定", "No share image and no wallet linkage")}</li>
        <li>${mc("可以一键清除本地记录", "Local records can be cleared in one click")}</li>
      </ul>
      <div class="mental-privacy-note"><b>${mc("私密模式", "Private Mode")}</b><span>${mc("心理健康数据比钱包地址更敏感，本页只做本地自评与复测记录。", "Mental-health data is more sensitive than a wallet address. This page only supports local self-checks and retest records.")}</span></div>
    `;
    const tabs = center.querySelectorAll("[data-mental-mode]");
    const tabCopy = {
      quick: ["快速体检", "约 3 分钟", "Quick Check", "About 3 min"],
      full: ["完整自测", "约 15 分钟", "Full Check", "About 15 min"],
      deep: ["深度长卷", "分模块保存", "Deep Review", "Saved by module"],
      crisis: ["危机支持", "安全优先", "Crisis Support", "Safety first"]
    };
    tabs.forEach((button) => {
      const copy = tabCopy[button.dataset.mentalMode];
      if (copy) button.innerHTML = `${currentLang === "en" ? copy[2] : copy[0]}<small>${currentLang === "en" ? copy[3] : copy[1]}</small>`;
    });
    const entry = center.querySelector("[data-degen-persona-entry]");
    if (entry) entry.innerHTML = `${mc("Degen 交易人格自查", "Degen Trading Persona Check")}<small>${mc("DegenDNA 自研 · 约 8 分钟", "DegenDNA Original · About 8 min")}</small>`;
  }

  const psychePage = document.querySelector('[data-page-screen="psyche"]');
  const softIntro = psychePage?.querySelector(".soft-intro");
  if (softIntro) softIntro.innerHTML = `
    <h2>${mc("心理健康自测中心", "Mental Health Check-In Center")}</h2>
    <p>${mc("不是诊断，只是帮你更早看见自己的状态。", "Not a diagnosis, just an earlier view of how you are doing.")}</p>
    <strong>${mc("照亮钱包，<br />也照顾一下自己。", "Illuminate the wallet.<br />Take care of yourself, too.")}</strong>
    <ul><li>${mc("不登录", "No login")}</li><li>${mc("不上载", "No upload")}</li><li>${mc("不公开", "Private")}</li><li>${mc("不和钱包绑定", "Not tied to a wallet")}</li><li>${mc("本地保存可选", "Optional local storage")}</li></ul>
    <div><button type="button">${mc("本地保存", "Save locally")}</button><button type="button">${mc("清除记录", "Clear records")}</button></div>
  `;
  const selfTestLabels = currentLang === "en"
    ? ["Quick Check", "Low Mood", "Anxiety", "Well-Being", "Sleep", "Stress", "Trading Mindset"]
    : ["快速体检", "情绪低落", "焦虑", "幸福感", "睡眠自测", "压力自测", "交易心理自查"];
  psychePage?.querySelectorAll(".self-test-grid button").forEach((button, index) => {
    button.textContent = selfTestLabels[index] || button.textContent;
  });
  const monitorLabels = psychePage?.querySelectorAll(".brain-monitor > span");
  if (monitorLabels?.[0]) monitorLabels[0].textContent = mc("心电图", "ECG");
  if (monitorLabels?.[1]) monitorLabels[1].textContent = mc("呼吸波", "Respiration");
  const psycheSlogan = psychePage?.querySelector(".soft-slogan");
  if (psycheSlogan) psycheSlogan.innerHTML = `${mc("你不是账户余额，也不是一次交易结果。", "You are not an account balance or the result of one trade.")}<b>degendna.fun</b>`;

  document.querySelectorAll("[data-mental-back]").forEach((button) => {
    button.textContent = mc("返回自测中心", "Back to Check-In Center");
  });
  document.querySelectorAll("[data-mental-crisis]").forEach((card) => {
    card.innerHTML = `
      <h3>${mc("安全支持优先", "Safety Support First")}</h3>
      <p>${mc("如果你担心自己此刻无法保持安全，请先离开可能伤害自己的环境，联系当地紧急服务，或让身边可信任的人陪伴你。这个页面不会生成娱乐分数，也不会要求你分享结果。", "If you are worried that you cannot stay safe right now, move away from anything that could harm you, contact local emergency services, and ask someone you trust to stay with you. This page creates no entertainment score and never asks you to share a result.")}</p>
      <ul>
        <li>${mc("美国可拨打或短信 988 联系危机支持热线。", "In the United States, call or text 988 for crisis support.")}</li>
        <li>${mc("如有即时危险，请拨打当地紧急电话（例：香港 999 / 2382 0000 / 2389 2222；澳门 999 / 110 / 112；台湾 110 / 119 / 1925）。", "If there is immediate danger, call your local emergency number (for example: Hong Kong 999 / 2382 0000 / 2389 2222; Macao 999 / 110 / 112; Taiwan 110 / 119 / 1925).")}</li>
        <li>${mc("中国大陆可联系 120 / 110，或尽快前往急诊。", "In mainland China, call 120 / 110 or go to an emergency department as soon as possible.")}</li>
        <li>${mc("尽量把电话号码、门锁密码、当前位置和当前情况告诉一个可信任的人。", "Tell a trusted person your phone number, location, access details, and what is happening now.")}</li>
      </ul>
    `;
  });
}

const MENTAL_OPTIONS = {
  wellbeing: [
    { value: 0, label: "从未" },
    { value: 1, label: "偶尔" },
    { value: 2, label: "少于一半时间" },
    { value: 3, label: "超过一半时间" },
    { value: 4, label: "大部分时间" },
    { value: 5, label: "一直" }
  ],
  freq3: [
    { value: 0, label: "完全没有" },
    { value: 1, label: "几天" },
    { value: 2, label: "一半以上时间" },
    { value: 3, label: "几乎每天" }
  ],
  freq4: [
    { value: 0, label: "完全没有" },
    { value: 1, label: "轻微" },
    { value: 2, label: "中等" },
    { value: 3, label: "明显" },
    { value: 4, label: "非常明显" }
  ],
  distress5: [
    { value: 1, label: "从不" },
    { value: 2, label: "偶尔" },
    { value: 3, label: "有时" },
    { value: 4, label: "经常" },
    { value: 5, label: "总是" }
  ],
  yesno: [
    { value: 0, label: "否" },
    { value: 1, label: "是" }
  ],
  persona5: [
    { value: -2, label: "非常像左侧" },
    { value: -1, label: "比较像左侧" },
    { value: 0, label: "看情况 / 不确定" },
    { value: 1, label: "比较像右侧" },
    { value: 2, label: "非常像右侧" }
  ]
};

const MENTAL_MODULES = {
  degenPersona: {
    title: "DegenDNA 交易人格自查",
    phase: "DegenDNA 自研",
    purpose: "原创交易行为倾向复盘",
    optionType: "persona5",
    notice: "本测试用于娱乐、自我观察和交易复盘，不属于任何第三方人格量表或授权产品，也不构成投资建议。",
    prompts: []
  },
  who5: {
    title: "WHO-5 幸福感",
    phase: "第一阶段",
    purpose: "近两周心理幸福感",
    optionType: "wellbeing",
    prompts: [
      "近两周，我感到心情愉快、精神状态较好。",
      "近两周，我感到平静和放松。",
      "近两周，我感到精力充沛、能处理日常事务。",
      "近两周，我醒来时感觉休息得还可以。",
      "近两周，我的生活中有让我感兴趣的事情。"
    ]
  },
  phq9: {
    title: "PHQ-9 情绪低落",
    phase: "第一阶段",
    purpose: "抑郁相关困扰初筛",
    optionType: "freq3",
    riskIndexes: [8],
    prompts: [
      "近两周，做事时兴趣或愉快感减少。",
      "近两周，感到情绪低落、沮丧或没有希望。",
      "近两周，入睡困难、睡不安稳或睡太多。",
      "近两周，感到疲倦或没有精力。",
      "近两周，食欲不振或吃得过多。",
      "近两周，对自己感觉不好，觉得自己失败或让自己、家人失望。",
      "近两周，难以集中注意力，例如看屏幕、读信息或处理工作。",
      "近两周，动作或说话变慢，或坐立不安到别人可能注意到。",
      "近两周，出现过伤害自己的念头，或觉得自己不如消失。"
    ]
  },
  gad7: {
    title: "GAD-7 焦虑紧张",
    phase: "第一阶段",
    purpose: "焦虑、紧张、担心初筛",
    optionType: "freq3",
    prompts: [
      "近两周，感到紧张、焦虑或坐立不安。",
      "近两周，无法停止或控制担心。",
      "近两周，对各种事情担心过多。",
      "近两周，很难放松下来。",
      "近两周，烦躁到难以安静坐着。",
      "近两周，容易变得恼火或急躁。",
      "近两周，感到好像会发生可怕的事情。"
    ]
  },
  k10: {
    title: "K10 心理困扰",
    phase: "第一阶段",
    purpose: "综合心理困扰总览",
    optionType: "distress5",
    prompts: [
      "过去四周，无缘由地感到疲惫。",
      "过去四周，感到紧张。",
      "过去四周，紧张到很难平静下来。",
      "过去四周，感到无助。",
      "过去四周，感到坐立不安或无法安定。",
      "过去四周，烦躁到难以休息。",
      "过去四周，感到情绪低落。",
      "过去四周，觉得做什么都很费劲。",
      "过去四周，感到没有价值感。",
      "过去四周，觉得生活压力难以承受。"
    ]
  },
  isi: {
    title: "ISI 睡眠失眠",
    phase: "第一阶段",
    purpose: "睡眠与失眠严重程度",
    optionType: "freq4",
    prompts: [
      "最近两周，入睡困难的程度。",
      "最近两周，夜间醒来或睡不安稳的程度。",
      "最近两周，早醒且难以再睡的程度。",
      "最近两周，对当前睡眠状况的不满意程度。",
      "最近两周，睡眠问题影响白天功能的程度。",
      "最近两周，他人能看出你因睡眠问题受影响的程度。",
      "最近两周，你对睡眠问题的担心或痛苦程度。"
    ]
  },
  trading: {
    title: "交易心理自查",
    phase: "第一阶段",
    purpose: "币圈专属状态观察",
    optionType: "freq4",
    prompts: [
      "行情突然拉升时，我会强烈害怕错过机会。",
      "亏损后，我会反复责怪自己或否定自己。",
      "卖飞后，我会长时间反刍那笔交易。",
      "深夜，我会忍不住反复看盘。",
      "连续亏损后，我更容易报复性交易。",
      "看到别人晒收益，我会明显焦虑或自我比较。",
      "钱包余额会影响我对自身价值的评价。",
      "连续亏损时，我会感觉控制力下降。",
      "行情会打断我的睡眠或休息。",
      "我会用交易逃避现实压力。"
    ]
  },
  pss10: {
    title: "PSS-10 压力感知",
    phase: "第二阶段",
    purpose: "近一个月感知压力",
    optionType: "freq4",
    notice: "正式商用前建议确认授权与使用条件。",
    prompts: [
      "过去一个月，觉得重要事情无法掌控。",
      "过去一个月，因意外事件感到烦恼。",
      "过去一个月，觉得事情堆积到难以处理。",
      "过去一个月，感到能够处理个人问题。",
      "过去一个月，觉得事情按自己的方式发展。",
      "过去一个月，发现自己无法应付必须做的事情。",
      "过去一个月，能够控制生活中的烦恼。",
      "过去一个月，觉得自己掌握了局面。",
      "过去一个月，因无法控制的事情而生气。",
      "过去一个月，觉得困难越积越多。"
    ]
  },
  asrs6: {
    title: "ASRS-6 成人注意力",
    phase: "第二阶段",
    purpose: "成人 ADHD 初筛线索",
    optionType: "freq4",
    prompts: [
      "完成需要收尾的任务时，经常难以坚持到最后。",
      "需要组织安排的事情会让我明显困难。",
      "需要持续专注的任务会被我拖延或回避。",
      "坐着不动时，我常感到坐立不安。",
      "我经常像被马达驱动一样停不下来。",
      "我会打断别人或在不合适的时候插话。"
    ]
  },
  mdq: {
    title: "MDQ 情绪高涨线索",
    phase: "第二阶段",
    purpose: "躁狂/轻躁狂相关线索",
    optionType: "yesno",
    notice: "仅作筛查起点，高分也不能诊断双相障碍。",
    prompts: [
      "曾有一段时间，情绪异常高涨或兴奋到不像平时。",
      "曾有一段时间，精力异常增加、睡得很少也不觉得累。",
      "曾有一段时间，说话明显变多或很难停下来。",
      "曾有一段时间，想法飞快、脑子停不下来。",
      "曾有一段时间，自信或自我评价异常升高。",
      "曾有一段时间，更冲动地花钱、交易或冒险。",
      "曾有一段时间，社交、性或活动欲望明显增加。",
      "这些状态曾影响工作、关系或让身边人担心。",
      "这些状态曾持续数天，而不是几个小时。",
      "这些状态曾反复出现。",
      "这些状态曾伴随明显易怒或激惹。",
      "这些状态曾导致你做出事后后悔的决定。",
      "这些状态曾让你需要专业帮助或他人介入。"
    ]
  },
  scoff: {
    title: "SCOFF 进食问题",
    phase: "第二阶段",
    purpose: "进食问题风险线索",
    optionType: "yesno",
    prompts: [
      "你是否曾因为吃得太多而让自己催吐。",
      "你是否担心自己已经失去对进食的控制。",
      "你是否曾在短时间内体重明显下降。",
      "你是否觉得自己胖，即使别人认为你很瘦。",
      "食物、体重或体型是否明显影响你对自己的感受。"
    ]
  },
  pcl5: {
    title: "PCL-5 创伤反应",
    phase: "第二阶段",
    purpose: "创伤相关症状筛查",
    optionType: "freq4",
    notice: "高敏感模块，正式诊断需专业访谈。",
    prompts: [
      "反复出现与创伤或强烈压力事件相关的侵入性记忆。",
      "反复做相关噩梦。",
      "有时感觉事件像再次发生。",
      "被提醒时会强烈痛苦。",
      "被提醒时会出现明显身体反应。",
      "回避相关记忆、想法或感受。",
      "回避会让你想起事件的人、地点或情境。",
      "难以回忆事件的重要部分。",
      "对自己、他人或世界有持续负面看法。",
      "把事件原因或后果持续归咎于自己或他人。",
      "持续感到恐惧、愤怒、羞耻或内疚。",
      "对重要活动兴趣明显下降。",
      "感到与他人疏离。",
      "难以体验积极情绪。",
      "更容易发怒或爆发。",
      "出现鲁莽或自我伤害倾向。",
      "过度警觉。",
      "容易受惊。",
      "注意力困难。",
      "睡眠困难。"
    ]
  },
  cssrs: {
    title: "C-SSRS 安全筛查",
    phase: "第二阶段",
    purpose: "自伤风险安全入口",
    optionType: "yesno",
    safety: true,
    prompts: [
      "最近一个月，你是否希望自己睡着后不再醒来，或不想继续活着。",
      "最近一个月，你是否有过伤害自己或结束生命的念头。",
      "最近一个月，你是否考虑过具体方法。",
      "最近一个月，你是否有过意图或计划。",
      "最近三个月，你是否有过自伤、自杀行为或准备行为。",
      "此刻，你是否担心自己无法保持安全。"
    ]
  }
};

const MENTAL_MODE_COPY = {
  quick: {
    title: "快速体检",
    detail: "WHO-5 + PHQ-2 + GAD-2 + 睡眠 2 题 + 交易心理 3 题，约 14 题。",
    action: "开始快速体检"
  },
  full: {
    title: "完整自测",
    detail: "WHO-5、PHQ-9、GAD-7、K10、ISI 和交易心理自查，约 50 题。",
    action: "开始完整自测"
  },
  deep: {
    title: "深度长卷",
    detail: "包含第一阶段与第二阶段模块，题量较长，过程会自动保存在本地草稿。",
    action: "开始深度长卷"
  },
  crisis: {
    title: "危机支持",
    detail: "只做安全筛查与支持入口，不生成娱乐分数、不做分享、不进入排行榜。",
    action: "进入安全筛查"
  },
  module: {
    title: "单模块自测",
    detail: "只完成当前选中的模块，适合复测某一类状态。",
    action: "开始这个模块"
  },
  "degen-persona": {
    title: "DegenDNA 交易人格自查",
    detail: "DegenDNA.fun 自研测试。48 道原创题，从 6 个交易行为维度生成你的链上玩家类型，用于娱乐、自我观察和交易复盘。",
    action: "开始交易人格自查"
  }
};

const DEGEN_PERSONA_DIMENSIONS = {
  social: {
    name: "机会敏感度",
    left: "独立校准",
    right: "社交共振",
    leftCode: "I",
    rightCode: "S",
    color: "#62f7ff"
  },
  signal: {
    name: "决策果断性",
    left: "数据仪表",
    right: "叙事雷达",
    leftCode: "D",
    rightCode: "N",
    color: "#b36cff"
  },
  execution: {
    name: "资金管理力",
    left: "规则锚定",
    right: "情绪点火",
    leftCode: "R",
    rightCode: "E",
    color: "#ffe089"
  },
  risk: {
    name: "风险承受力",
    left: "风控防守",
    right: "冲锋进攻",
    leftCode: "G",
    rightCode: "A",
    color: "#6dffb7"
  },
  horizon: {
    name: "耐心与纪律",
    left: "长线耐受",
    right: "短线反应",
    leftCode: "L",
    rightCode: "Q",
    color: "#7ad8ff"
  },
  validation: {
    name: "情绪稳定性",
    left: "独立判断",
    right: "FOMO 牵引",
    leftCode: "C",
    rightCode: "F",
    color: "#ff9c74"
  }
};

const DEGEN_PERSONA_QUESTIONS = [
  { dim: "social", left: "先自己查链上与仓位", right: "先看群里聪明钱怎么聊", text: "遇到一个新叙事时，我更像哪一种反应？" },
  { dim: "social", left: "独自复盘亏损原因", right: "立刻找朋友对答案", text: "一笔交易亏损后，我通常会怎么处理？" },
  { dim: "social", left: "少看喊单，保留距离", right: "群聊热起来时更有行动感", text: "社群情绪对我的下单节奏影响如何？" },
  { dim: "social", left: "更信自己的观察清单", right: "更信多人共识的热度", text: "当自己的判断和市场热度冲突时，我更接近哪边？" },
  { dim: "social", left: "交易前减少外部噪音", right: "交易前需要更多外部反馈", text: "临近下单前，我更需要哪种环境？" },
  { dim: "signal", left: "先看数据结构和资金流", right: "先判断故事能不能传播", text: "面对一个项目，我第一眼更看重什么？" },
  { dim: "signal", left: "链上证据不足就不动", right: "叙事窗口打开就先占位", text: "如果叙事很强但数据还早，我会怎么做？" },
  { dim: "signal", left: "指标变差会明显降权", right: "故事没破就愿意再等等", text: "持仓过程中，什么更容易改变我的态度？" },
  { dim: "signal", left: "用表格和阈值筛项目", right: "用趋势、情绪和传播感筛项目", text: "我筛选机会时更常用哪种方法？" },
  { dim: "signal", left: "厌恶模糊，喜欢可验证", right: "接受模糊，重视想象空间", text: "面对早期机会的不确定性，我更接近哪边？" },
  { dim: "execution", left: "按预设条件执行", right: "临场情绪会改计划", text: "行情快速波动时，我的执行更像哪边？" },
  { dim: "execution", left: "进场前先写退出条件", right: "先上车，边走边看", text: "我做一笔交易前通常会怎样准备？" },
  { dim: "execution", left: "亏损到线就退出", right: "亏损后容易加理由硬扛", text: "当价格跌破预期时，我更常见的反应是？" },
  { dim: "execution", left: "错过也不追规则外机会", right: "错过会让我想补一笔", text: "看到本来想买的币已经拉升后，我会怎样？" },
  { dim: "execution", left: "交易后按记录复盘", right: "交易后主要凭感觉总结", text: "我结束一笔交易后的复盘方式更像哪边？" },
  { dim: "risk", left: "先考虑亏多少", right: "先考虑能赚多少", text: "看到机会时，我脑中最先出现的问题是？" },
  { dim: "risk", left: "宁愿少赚，不想爆雷", right: "愿意承担波动换赔率", text: "我对风险和收益的权衡更接近哪边？" },
  { dim: "risk", left: "仓位变化比较克制", right: "确认机会后会明显加仓", text: "当我非常看好一个机会时，仓位会怎样变化？" },
  { dim: "risk", left: "对杠杆和小盘更谨慎", right: "高波动反而让我兴奋", text: "面对高波动资产，我的身体反应更像哪边？" },
  { dim: "risk", left: "先做最坏情况预案", right: "先抢时间窗口", text: "突发机会出现时，我更优先做什么？" },
  { dim: "horizon", left: "能忍受较长验证周期", right: "需要较快看到反馈", text: "我的交易耐心更像哪边？" },
  { dim: "horizon", left: "适合按周/月观察", right: "适合按小时/天反应", text: "我更舒服的决策节奏是？" },
  { dim: "horizon", left: "短期回撤不轻易动摇", right: "短期波动会促使我调整", text: "持仓出现短期回撤时，我更可能怎样？" },
  { dim: "horizon", left: "愿意等待叙事兑现", right: "更喜欢捕捉阶段性脉冲", text: "我更偏好的机会形态是？" },
  { dim: "horizon", left: "慢慢建仓和分批退出", right: "快进快出捕捉窗口", text: "我的仓位节奏更接近哪边？" },
  { dim: "validation", left: "不因别人盈利否定自己", right: "别人晒收益会影响我", text: "看到别人赚到我没赚的钱时，我更像哪边？" },
  { dim: "validation", left: "能接受空仓等待", right: "空仓时容易焦虑", text: "没有仓位时，我的状态更接近哪边？" },
  { dim: "validation", left: "把机会当筛选题", right: "把机会当不能错过的门票", text: "面对热门机会，我的内心叙事更像哪边？" },
  { dim: "validation", left: "我的自我评价不跟钱包走", right: "钱包涨跌会影响自我评价", text: "钱包表现对我情绪和自我感受的影响是？" },
  { dim: "validation", left: "能承认不适合就放弃", right: "越热越容易说服自己参与", text: "当一个机会不符合我的原则但热度很高时，我更像哪边？" }
];

DEGEN_PERSONA_QUESTIONS.push(
  { dim: "social", left: "先回到自己的验证清单", right: "先看市场共识是否已经形成", text: "当多个声音同时看多，但我的验证还没完成时，我更像哪种反应？" },
  { dim: "signal", left: "以链上证据校准故事热度", right: "以叙事传播速度校准仓位", text: "当数据和故事给出不同信号时，我更容易相信哪一边？" },
  { dim: "execution", left: "触发条件不满足就不行动", right: "临场机会出现时会调整规则", text: "遇到计划外插针或急拉时，我更像哪一种执行方式？" },
  { dim: "risk", left: "先锁定已有收益和最大回撤", right: "继续追求更高赔率窗口", text: "仓位已经盈利但波动开始放大时，我通常会怎么处理？" },
  { dim: "horizon", left: "允许项目继续横盘验证", right: "横盘太久就切换到新机会", text: "一个标的长时间没有反馈时，我更倾向于哪种选择？" },
  { dim: "validation", left: "盈利图只是噪音样本", right: "看到别人盈利会明显触发我", text: "当社交媒体连续晒出盈利截图时，我的自我校准会怎样变化？" }
);

DEGEN_PERSONA_QUESTIONS.push(
  { dim: "social", left: "先看自己的交易日志", right: "先问圈内人有没有同感", text: "一段行情让我犹豫时，我更依赖哪种确认方式？" },
  { dim: "social", left: "愿意逆着热度慢慢验证", right: "共识升温会明显推着我行动", text: "当市场开始形成一致预期时，我的参与欲会怎样变化？" },
  { dim: "signal", left: "先找反证再决定仓位", right: "先看叙事是否进入传播临界点", text: "判断一个机会能不能继续时，我最先检查什么？" },
  { dim: "signal", left: "没有数据闭环会降低兴趣", right: "想象空间越大越容易吸引我", text: "早期项目资料不完整时，我的判断更接近哪边？" },
  { dim: "execution", left: "计划写清楚才舒服", right: "边做边修正更自然", text: "面对复杂行情，我更喜欢哪种执行方式？" },
  { dim: "execution", left: "连续亏损后主动停手", right: "连续亏损后想尽快扳回", text: "当我连续几笔不顺时，下一步更像哪种反应？" },
  { dim: "risk", left: "先按可承受亏损定仓", right: "先按想要收益倒推仓位", text: "决定仓位大小时，我更常用哪种起点？" },
  { dim: "risk", left: "看不懂就先放弃", right: "看不懂但热度高会小冲一下", text: "遇到信息不透明但涨得很快的标的时，我更可能怎样？" },
  { dim: "horizon", left: "无聊时也能保持空仓", right: "无聊时容易找点机会做", text: "市场没有明显机会时，我的交易冲动更像哪边？" },
  { dim: "horizon", left: "愿意等二次确认", right: "更想吃第一段启动", text: "面对刚启动的趋势，我更偏向哪种节奏？" },
  { dim: "validation", left: "错过机会后能平静记录", right: "错过机会后容易追求补偿", text: "当我错过一段大涨时，内心更常出现什么？" },
  { dim: "validation", left: "亏损后先区分过程与结果", right: "亏损后容易否定整套判断", text: "一笔亏损发生后，我对自己的评价更像哪边？" }
);

const DEGEN_PERSONA_TYPES = [
  {
    key: "rocket-raider",
    name: "火箭冲锋手",
    subtitle: "机会窗口打开时，你的行动速度比复盘表更快。",
    match: (s) => s.risk >= 42 && s.execution >= 24,
    strengths: ["行动果断", "能抓住早期波动", "对机会窗口敏感"],
    risks: ["容易高位追入", "止损纪律被情绪覆盖", "连续亏损后可能加速上头"],
    protocol: "把单笔最大亏损、追高冷却时间和睡前禁盘写成硬规则。"
  },
  {
    key: "risk-surgeon",
    name: "链上风控师",
    subtitle: "你先看会不会死，再看能不能飞。",
    match: (s) => s.risk <= -42 && s.execution <= -18,
    strengths: ["风险边界清楚", "仓位克制", "更容易活到下一轮"],
    risks: ["可能错过高赔率窗口", "容易过度等待完美证据", "行情启动后进入成本焦虑"],
    protocol: "保留小仓试错额度，让系统允许自己参与非完美机会。"
  },
  {
    key: "fomo-sprinter",
    name: "FOMO 短跑手",
    subtitle: "你不是看不懂风险，而是最怕门票在眼前关上。",
    match: (s) => s.validation >= 42 && (s.risk >= 10 || s.horizon >= 14),
    strengths: ["对机会流动很敏锐", "能快速进入状态", "不容易错过市场情绪拐点"],
    risks: ["容易被错过感驱动", "入场理由会被热度改写", "亏损后可能寻找补偿性交易"],
    protocol: "所有热门机会先延迟一轮确认，写下不买也可以接受的理由，再决定是否行动。"
  },
  {
    key: "narrative-radar",
    name: "叙事雷达手",
    subtitle: "你能听见市场故事开始变响的那一秒。",
    match: (s) => s.signal >= 42 && (s.social >= 10 || s.validation >= 8),
    strengths: ["传播敏感", "叙事捕捉快", "能理解群体情绪"],
    risks: ["容易把热度误判成价值", "受社交反馈牵引", "对反证数据容忍过高"],
    protocol: "每个叙事都配一条反证指标，指标破位时必须降权。"
  },
  {
    key: "data-cartographer",
    name: "数据制图师",
    subtitle: "你喜欢把混沌市场画成能验证的地图。",
    match: (s) => s.signal <= -42 && s.execution <= 16,
    strengths: ["证据意识强", "复盘能力好", "不容易被空喊带走"],
    risks: ["进入过慢", "容易被早期模糊性劝退", "可能错过非线性爆发"],
    protocol: "给早期机会设置小额观察仓，用真实反馈补足模型。"
  },
  {
    key: "rule-forger",
    name: "规则锻造师",
    subtitle: "你真正信任的不是感觉，而是被市场反复打磨过的流程。",
    match: (s) => s.execution <= -38 && s.validation <= 20,
    strengths: ["执行稳定", "复盘颗粒度细", "能把冲动压进流程里"],
    risks: ["规则过重时会错失弹性", "临场变化容易带来迟疑", "可能把控制感误认为安全"],
    protocol: "保留一条小仓弹性规则，让系统既有纪律，也能识别罕见窗口。"
  },
  {
    key: "social-resonator",
    name: "社群共振体",
    subtitle: "你很会感受市场温度，也容易被温度烫到。",
    match: (s) => s.social >= 42 && s.validation >= 18,
    strengths: ["信息流广", "能感知共识形成", "传播趋势判断强"],
    risks: ["容易被晒图和喊单影响", "独立验证不足", "群体情绪退潮时反应慢"],
    protocol: "把社群观点分成线索而不是结论，所有入场都必须通过个人检查清单。"
  },
  {
    key: "quiet-holder",
    name: "仓位守夜人",
    subtitle: "你不是不动，你是在等逻辑自己证明自己。",
    match: (s) => s.horizon <= -42 && s.risk <= 18,
    strengths: ["耐心强", "不易被短期波动洗出", "适合分批规划"],
    risks: ["可能把迟钝误当信仰", "止盈反应慢", "对基本面恶化反应不足"],
    protocol: "为长线仓设定复核日和失效条件，不让信仰吞掉退出按钮。"
  },
  {
    key: "pulse-hunter",
    name: "短线脉冲猎手",
    subtitle: "你关注的是市场心跳最密集的那几拍。",
    match: (s) => s.horizon >= 42 && s.risk >= -6,
    strengths: ["反应快", "适合事件驱动", "能快速试错"],
    risks: ["交易频率过高", "手续费和滑点侵蚀收益", "容易被噪音牵动"],
    protocol: "限制每天有效交易次数，把无效点击从策略里剔除。"
  },
  {
    key: "conviction-architect",
    name: "信念架构师",
    subtitle: "你会给一个判断留出足够时间，让逻辑慢慢兑现。",
    match: (s) => s.horizon <= -34 && s.validation <= -12 && s.signal <= 18,
    strengths: ["不易被噪音洗出", "能承受验证周期", "适合搭建中长期假设"],
    risks: ["可能过度美化原始判断", "失效信号出现时反应偏慢", "容易低估机会成本"],
    protocol: "每个中长期假设必须配失效日期、失效指标和重新建模条件。"
  },
  {
    key: "volatility-scout",
    name: "波动侦察兵",
    subtitle: "你愿意走进高波动区，但最好带着绳索和地图。",
    match: (s) => s.risk >= 42 && s.execution <= 12 && s.validation <= 18,
    strengths: ["能承受不确定", "敢于小仓探索", "对赔率变化敏感"],
    risks: ["容易低估尾部风险", "胜率不高时仍被赔率吸引", "止损太松会侵蚀系统"],
    protocol: "把高波动机会拆成观察仓、验证仓和确认仓，不允许一次性打满。"
  },
  {
    key: "drawdown-alchemist",
    name: "回撤炼金师",
    subtitle: "亏损会让你想立刻修复局面，这既是燃料也是风险源。",
    match: (s) => s.execution >= 34 && s.validation >= 28,
    strengths: ["复原欲强", "行动能量高", "能快速寻找替代路径"],
    risks: ["容易把修复心态带进下一笔", "止损后马上反手", "复盘被情绪归因污染"],
    protocol: "亏损后先写下原计划与实际动作的差异，至少间隔一轮行情再做下一笔。"
  },
  {
    key: "balanced-reviewer",
    name: "均衡复盘型",
    subtitle: "你没有一个极端按钮，但这也意味着系统还有升级空间。",
    match: () => true,
    strengths: ["可塑性强", "不容易单点失控", "适合建立稳定交易系统"],
    risks: ["优势不够尖锐", "容易在不同策略间摇摆", "需要更清晰的主策略"],
    protocol: "选定一个主交易周期和一个主信号源，减少风格漂移。"
  }
];

function readMentalJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeMentalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be disabled by the browser.
  }
}

function escapeMentalHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function wrapMentalQuestionText(value, limit = 30) {
  const chars = Array.from(String(value));
  const chunks = [];
  for (let index = 0; index < chars.length; index += limit) {
    chunks.push(escapeMentalHtml(chars.slice(index, index + limit).join("")));
  }
  return chunks.join("<br>");
}

function buildDegenPersonaQueue() {
  return DEGEN_PERSONA_QUESTIONS.map((question, index) => ({
    id: `degenPersona:${index}`,
    moduleKey: "degenPersona",
    optionType: "persona5",
    index,
    dim: question.dim,
    text: question.text,
    left: question.left,
    right: question.right,
    risk: false
  }));
}

function buildMentalQueue(mode, singleModule) {
  const queue = [];
  const addModule = (moduleKey, limit) => {
    const module = MENTAL_MODULES[moduleKey];
    if (!module) return;
    module.prompts.slice(0, limit ?? module.prompts.length).forEach((text, index) => {
      queue.push({
        id: `${moduleKey}:${index}`,
        moduleKey,
        index,
        text,
        optionType: module.optionType,
        risk: module.safety || module.riskIndexes?.includes(index)
      });
    });
  };

  if (mode === "degen-persona") {
    return buildDegenPersonaQueue();
  }

  if (singleModule) {
    addModule(singleModule);
    return queue;
  }

  if (mode === "quick") {
    addModule("who5");
    addModule("phq9", 2);
    addModule("gad7", 2);
    addModule("isi", 2);
    addModule("trading", 3);
    return queue;
  }

  if (mode === "crisis") {
    addModule("cssrs");
    return queue;
  }

  ["who5", "phq9", "gad7", "k10", "isi", "trading"].forEach((key) => addModule(key));
  if (mode === "deep") {
    ["pss10", "asrs6", "mdq", "scoff", "pcl5"].forEach((key) => addModule(key));
  }
  return queue;
}

function shouldShowCrisisSupport(state) {
  return Boolean(state?.mode === "crisis" || state?.singleModule === "cssrs");
}

function mentalSeverityLabel(level) {
  const labels = currentLang === "en"
    ? ["Relatively Stable", "Mild Attention Needed", "Noticeable Distress", "Please Take This Seriously", "Safety Support First"]
    : ["状态相对平稳", "轻度需要关注", "困扰较明显", "建议认真关注", "安全支持优先"];
  return labels[level] || mc("需要关注", "Attention Needed");
}

function mentalSeverityClass(level) {
  return ["stable", "mild", "moderate", "high", "crisis"][level] || "moderate";
}

function isDegenPersonaState(state) {
  return state?.mode === "degen-persona";
}

function computeDegenPersonaResult(state) {
  const scores = Object.fromEntries(Object.keys(DEGEN_PERSONA_DIMENSIONS).map((key) => [key, 0]));
  state.queue.forEach((question) => {
    if (!question.dim || state.answers[question.id] === undefined) return;
    scores[question.dim] += Number(state.answers[question.id]) * 5;
  });

  const code = Object.entries(DEGEN_PERSONA_DIMENSIONS).map(([key, dimension]) => (
    scores[key] >= 0 ? dimension.rightCode : dimension.leftCode
  )).join("");
  const type = DEGEN_PERSONA_TYPES.find((candidate) => candidate.match(scores)) || DEGEN_PERSONA_TYPES.at(-1);
  const dimensions = Object.entries(DEGEN_PERSONA_DIMENSIONS).map(([key, dimension]) => {
    const score = scores[key];
    const direction = score >= 0 ? dimension.right : dimension.left;
    const strength = Math.min(100, Math.round(Math.abs(score) * 2));
    return {
      key,
      ...dimension,
      score,
      strength,
      direction
    };
  });
  const strongest = [...dimensions].sort((a, b) => b.strength - a.strength).slice(0, 2);

  return {
    code,
    type,
    scores,
    dimensions,
    strongest
  };
}

const DEGEN_PERSONA_METHOD_ROWS = [
  ["链上行为建模", "用交易习惯、仓位反应与信息路径生成画像"],
  ["决策偏好评估", "观察叙事、数据、规则和情绪的权重"],
  ["风险反应测量", "识别冲锋、防守、复盘和失控信号"],
  ["情绪稳定分析", "记录行情波动对执行系统的影响"],
  ["长期策略倾向", "判断长线耐受与短线反应的平衡"],
  ["综合画像生成", "输出类型、盲区和可执行复盘建议"]
];
const DEGEN_PERSONA_METHOD_ROWS_EN = [
  ["On-Chain Behavior Modeling", "Build a profile from habits, position responses, and information paths"],
  ["Decision Preference Review", "Observe the weight of narrative, data, rules, and emotion"],
  ["Risk Response Measurement", "Identify attack, defense, review, and loss-of-control signals"],
  ["Emotional Stability Analysis", "Track how volatility affects the execution system"],
  ["Long-Term Strategy Tendency", "Assess long-horizon patience and short-term reaction"],
  ["Integrated Profile", "Generate a type, blind spots, and an actionable review protocol"]
];

function degenPersonaAnsweredCount(state) {
  return Object.keys(state?.answers || {}).filter((key) => state.answers[key] !== undefined).length;
}

function degenPersonaAxisTone(dimension) {
  if (dimension.strength >= 76) return mc("高强度", "high-intensity");
  if (dimension.strength >= 54) return mc("明显", "clear");
  if (dimension.strength >= 32) return mc("轻度", "mild");
  return mc("相对中性", "relatively neutral");
}

function degenPersonaProfessionalAnalysis(persona) {
  if (currentLang === "en") {
    const view = localizedPersona(persona);
    const primary = view.strongest[0] || view.dimensions[0];
    const secondary = view.strongest[1] || view.dimensions[1] || primary;
    const byKey = (key) => view.dimensions.find((item) => item.key === key) || primary;
    const social = byKey("social");
    const risk = byKey("risk");
    const execution = byKey("execution");
    const signal = byKey("signal");
    const horizon = byKey("horizon");
    const validation = byKey("validation");
    const highAxes = view.dimensions.filter((item) => item.strength >= 52).map((item) => item.name).join(", ") || "a balanced profile";
    const softAxes = view.dimensions.filter((item) => item.strength < 32).map((item) => item.name).join(", ") || "no clearly low-sensitivity dimension";
    return [
      { title: "Core Trading Persona", body: `Your result is closest to ${view.type.name}, code ${view.code}. This is not a fixed identity label; it describes the response system you are more likely to use when volatility, information noise, position pressure, and social feedback arrive together. Your strongest dimensions are ${primary.name} and ${secondary.name}, showing ${degenPersonaAxisTone(primary)} and ${degenPersonaAxisTone(secondary)} tendencies.` },
      { title: "Decision Drivers", body: `Your information intake leans toward ${social.direction}; signal processing leans toward ${signal.direction}; execution leans toward ${execution.direction}. Instead of collecting more opinions, separate entry evidence, confirmation evidence, and market emotion in your notes.` },
      { title: "Risk and Position Profile", body: `Risk response leans toward ${risk.direction}, while capital management leans toward ${execution.direction}. Visible strengths include ${view.type.strengths.join(", ")}. Watch for ${view.type.risks.join(", ")}. A position is a stress test for the system, not proof of courage.` },
      { title: "Emotional Triggers and Calibration", body: `Emotional stability leans toward ${validation.direction}, while opportunity sensitivity leans toward ${social.direction}. If both pull toward external stimulation, screenshots, calls, and missed moves may influence execution. Lower-sensitivity areas currently include ${softAxes}; they may be useful places to strengthen the system.` },
      { title: "Horizon and Review", body: `Your preferred horizon leans toward ${horizon.direction}. Review on three levels: write the hypothesis before entry, record triggers during the trade, and evaluate process execution afterward. High-sensitivity dimensions are ${highAxes}; the stronger they are, the more they belong in written rules.` },
      { title: "Execution Protocol", body: `${view.type.protocol} Add one mandatory cooldown: after two emotionally driven deviations from plan, allow only observation and notes for the rest of the day, with no new risk exposure. This is a behavioral review tool, not investment advice.` }
    ];
  }
  const primary = persona.strongest[0] || persona.dimensions[0];
  const secondary = persona.strongest[1] || persona.dimensions[1] || primary;
  const social = persona.dimensions.find((item) => item.key === "social") || primary;
  const risk = persona.dimensions.find((item) => item.key === "risk") || primary;
  const execution = persona.dimensions.find((item) => item.key === "execution") || primary;
  const signal = persona.dimensions.find((item) => item.key === "signal") || primary;
  const horizon = persona.dimensions.find((item) => item.key === "horizon") || primary;
  const validation = persona.dimensions.find((item) => item.key === "validation") || primary;
  const highAxes = persona.dimensions
    .filter((item) => item.strength >= 52)
    .map((item) => item.name)
    .join("、") || "各维度相对均衡";
  const softAxes = persona.dimensions
    .filter((item) => item.strength < 32)
    .map((item) => item.name)
    .join("、") || "暂无明显低敏维度";
  const typeStrengths = persona.type.strengths.join("、");
  const typeRisks = persona.type.risks.join("、");

  return [
    {
      title: "核心交易人格",
      body: `你的结果更接近「${persona.type.name}」，交易人格代码为 ${persona.code}。这不是静态人格标签，而是你在波动、信息噪音、仓位压力和社交反馈同时出现时，更容易调用的一套交易反应系统。当前最突出的维度是「${primary.name}」与「${secondary.name}」，分别呈现${degenPersonaAxisTone(primary)}和${degenPersonaAxisTone(secondary)}倾向。`
    },
    {
      title: "决策驱动结构",
      body: `从信息入口看，你更接近「${social.direction}」；从信号处理看，你偏向「${signal.direction}」；从执行方式看，你更接近「${execution.direction}」。这三个维度共同决定你是被证据、叙事、社群温度还是临场冲动推着行动。适合你的系统不是收集更多观点，而是把入场信号、确认信号和市场情绪拆开记录。`
    },
    {
      title: "风险与仓位画像",
      body: `风险维度显示你更接近「${risk.direction}」，资金管理维度显示你更接近「${execution.direction}」。你的显性优势包括：${typeStrengths}；需要重点盯住的盲区包括：${typeRisks}。仓位不是勇气证明，而是系统承压测试；当仓位让你开始反复刷新价格，说明它已经超过了你当前心理带宽。`
    },
    {
      title: "情绪触发与校准",
      body: `情绪稳定性上，你更接近「${validation.direction}」；机会敏感度上，你更接近「${social.direction}」。如果这两个维度同时偏右，结果更容易受到晒图、喊单、错过感和短期盈亏影响；如果同时偏左，你的独立性更强，但也要防止过度封闭信息。当前低敏维度为：${softAxes}，这些地方通常不是问题本身，却可能是系统升级的空间。`
    },
    {
      title: "周期与复盘建议",
      body: `周期偏好上，你更接近「${horizon.direction}」。建议把复盘拆成三个层级：交易前记录假设，交易中记录触发条件，交易后只评估过程是否被执行。你的重点高敏维度为：${highAxes}。这些维度越强，越需要被写进规则，而不是只靠临场感觉管理。`
    },
    {
      title: "执行协议",
      body: `${persona.type.protocol} 额外保留一条强制冷却规则：当你连续两次因为情绪而偏离计划，当天后续交易只允许观察和记录，不再新增风险敞口。这个结果不构成投资建议，它更适合作为你的交易行为复盘模板。`
    }
  ];
}

function degenPersonaRadarVertex(index, total, ratio = 1) {
  const center = 60;
  const radius = 46;
  const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
  return {
    x: Number((center + Math.cos(angle) * radius * ratio).toFixed(2)),
    y: Number((center + Math.sin(angle) * radius * ratio).toFixed(2))
  };
}

function degenPersonaRadarPoints(dimensions, fixedRatio) {
  return dimensions.map((dimension, index) => {
    const rawRatio = fixedRatio ?? dimension.strength / 100;
    const ratio = Math.max(0.12, Math.min(1, rawRatio));
    const point = degenPersonaRadarVertex(index, dimensions.length, ratio);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function renderDegenPersonaChrome(page, state) {
  const isDegen = isDegenPersonaState(state);
  const method = page.querySelector("[data-degen-methodology]");
  const preview = page.querySelector("[data-degen-preview]");
  const archetypes = page.querySelector("[data-degen-archetypes]");
  const dimStrip = page.querySelector("[data-degen-dim-strip]");
  [method, preview, archetypes, dimStrip].forEach((element) => {
    if (element) element.hidden = !isDegen;
  });
  if (!isDegen) return;

  const persona = localizedPersona(computeDegenPersonaResult(state));
  const total = state.queue.length || DEGEN_PERSONA_QUESTIONS.length;
  const answered = state.completed ? total : degenPersonaAnsweredCount(state);
  const percent = total ? Math.round((answered / total) * 100) : 0;
  const strongest = persona.strongest[0] || persona.dimensions[0];

  if (method) {
    const methodRows = currentLang === "en" ? DEGEN_PERSONA_METHOD_ROWS_EN : DEGEN_PERSONA_METHOD_ROWS;
    method.innerHTML = `
      <strong>${mc("DegenDNA 交易心理结构模型", "DegenDNA Trading Psychology Model")}</strong>
      <p>${mc("自研交易人格自查，用于娱乐、自我观察和交易复盘；不属于 MBTI 或任何第三方授权人格量表。", "An original trading-persona check for entertainment, self-observation, and review. It is not MBTI or any third-party licensed personality test.")}</p>
      <div>
        ${methodRows.map((row) => `
          <article>
            <i></i>
            <span><b>${row[0]}</b><em>${row[1]}</em></span>
          </article>
        `).join("")}
      </div>
      <small>${mc("所有回答只在当前浏览器参与本地结果生成，不上传、不公开、不进入排行榜。", "Answers are processed only in this browser. They are not uploaded, published, or added to a leaderboard.")}</small>
    `;
  }

  if (dimStrip) {
    dimStrip.innerHTML = persona.dimensions.map((dimension) => `
      <article style="--persona-axis: ${dimension.color}; --persona-fill: ${Math.max(8, dimension.strength)}%">
        <b>${dimension.name}</b>
        <strong>${dimension.strength}</strong>
        <i><em></em></i>
      </article>
    `).join("");
  }

  if (preview) {
    const radarRings = [0.25, 0.5, 0.75, 1].map((ratio) => (
      `<polygon points="${degenPersonaRadarPoints(persona.dimensions, ratio)}"></polygon>`
    )).join("");
    const radarAxes = persona.dimensions.map((dimension, index) => {
      const point = degenPersonaRadarVertex(index, persona.dimensions.length, 1);
      return `<line x1="60" y1="60" x2="${point.x}" y2="${point.y}" style="--persona-axis:${dimension.color}"></line>`;
    }).join("");
    const radarShape = degenPersonaRadarPoints(persona.dimensions);
    const radarNodes = persona.dimensions.map((dimension, index) => {
      const ratio = Math.max(0.12, Math.min(1, dimension.strength / 100));
      const point = degenPersonaRadarVertex(index, persona.dimensions.length, ratio);
      return `<circle cx="${point.x}" cy="${point.y}" r="2.6" style="--persona-axis:${dimension.color}"></circle>`;
    }).join("");
    const radar = `
      <div class="degen-preview-radar" aria-label="${mc("六维交易人格雷达", "Six-dimension trading persona radar")}">
        <div class="degen-radar-plot" aria-hidden="true">
          <svg class="degen-radar-svg" viewBox="0 0 120 120" role="img">
            <g class="degen-radar-grid">
              ${radarRings}
              ${radarAxes}
            </g>
            <polygon class="degen-radar-area" points="${radarShape}"></polygon>
            <polyline class="degen-radar-stroke" points="${radarShape}"></polyline>
            <g class="degen-radar-nodes">
              ${radarNodes}
            </g>
          </svg>
        </div>
        <div class="degen-radar-metrics">
          ${persona.dimensions.map((dimension) => `
            <article style="--persona-axis:${dimension.color}">
              <b>${dimension.name}</b>
              <strong>${dimension.strength}</strong>
              <em>${dimension.direction}</em>
            </article>
          `).join("")}
        </div>
      </div>
    `;
    preview.innerHTML = state.completed ? `
      ${radar}
      <div class="persona-analysis-report">
        <strong>${mc("交易人格专业分析", "Professional Trading Persona Analysis")}</strong>
        ${degenPersonaProfessionalAnalysis(persona).map((section) => `
          <article>
            <b>${section.title}</b>
            <p>${section.body}</p>
          </article>
        `).join("")}
      </div>
    ` : `
      <strong>${mc("当前倾向预览", "Current Tendency Preview")}</strong>
      ${radar}
      <p>${persona.type.name}</p>
      <small>${strongest.name}：${strongest.direction}</small>
    `;
  }

  if (archetypes) {
    const orderedTypes = [persona.type, ...DEGEN_PERSONA_TYPES.filter((type) => type.key !== persona.type.key).map((type) => localizePersonaType(currentLang, type))].slice(0, 6);
    archetypes.innerHTML = `
      <button type="button" aria-label="${mc("上一组", "Previous group")}">‹</button>
      <div>
        ${orderedTypes.map((type, index) => `
          <article class="${type === persona.type ? "active" : ""}">
            <i>${index + 1}</i>
            <b>${type.name}</b>
            <span>${type.subtitle}</span>
            <em><strong style="width: ${type === persona.type ? Math.max(64, percent) : 48 + index * 6}%"></strong></em>
          </article>
        `).join("")}
      </div>
      <button type="button" aria-label="${mc("下一组", "Next group")}">›</button>
    `;
  }
}

function mentalQuestionOptions(question) {
  if (question?.moduleKey === "degenPersona" && question.dim) {
    const dimension = localizePersonaDimension(currentLang, question.dim, DEGEN_PERSONA_DIMENSIONS[question.dim]);
    const localized = localizeMentalQuestion(currentLang, question);
    return [
      { value: -2, label: localized.left },
      { value: -1.2, label: dimension.left },
      { value: -0.35, label: mc("先观察复盘", "Observe and review first") },
      { value: 0.35, label: mc("小额试错", "Test with a small amount") },
      { value: 1.2, label: dimension.right },
      { value: 2, label: localized.right }
    ];
  }
  const options = MENTAL_OPTIONS[question.optionType] || [];
  const labels = MENTAL_EN.options[question.optionType];
  return currentLang === "en" && labels
    ? options.map((option, index) => ({ ...option, label: labels[index] || option.label }))
    : options;
}

function localizedMentalSummaryMessage(moduleKey, level, raw) {
  if (currentLang !== "en") return null;
  const suffix = level >= 2 || (moduleKey === "cssrs" && raw > 0) ? "High" : "Low";
  return MENTAL_EN.summaries[`${moduleKey}${suffix}`]
    || MENTAL_EN.summaries[level >= 2 ? "defaultHigh" : "defaultLow"];
}

function summarizeMentalModule(moduleKey, answers, queue) {
  const module = MENTAL_MODULES[moduleKey];
  const moduleQuestions = queue.filter((item) => item.moduleKey === moduleKey && answers[item.id] !== undefined);
  if (!module || moduleQuestions.length === 0) return null;

  let raw = moduleQuestions.reduce((sum, item) => {
    const value = Number(answers[item.id] || 0);
    if (moduleKey === "pss10" && [3, 4, 6, 7].includes(item.index)) {
      return sum + (4 - value);
    }
    return sum + value;
  }, 0);
  let title = module.title;
  let max = moduleQuestions.reduce((sum, item) => {
    const values = MENTAL_OPTIONS[item.optionType].map((option) => option.value);
    return sum + Math.max(...values);
  }, 0);
  let level = 0;
  let display = `${raw}/${max}`;
  let message = "这份结果只是一段自我观察线索，不是诊断。你可以把它和最近两周到一个月的睡眠、压力、人际支持、交易节奏放在一起看，先照顾身体，再处理问题。";

  if (moduleKey === "who5") {
    const percent = Math.round(raw * 4);
    display = `${percent}/100`;
    if (percent <= 28) level = 3;
    else if (percent <= 50) level = 2;
    else if (percent <= 68) level = 1;
    message = percent <= 50
      ? "近期幸福感偏低，说明你的身心可能已经消耗了一段时间。请先把目标调小：保证一餐热饭、一次稳定睡眠、一次和可信任的人说话；如果这种低能量持续两周以上，或影响工作、人际和基本生活，建议尽早联系心理咨询师或精神科医生做进一步评估。"
      : "近期幸福感仍有可用资源，这是很珍贵的缓冲垫。建议继续保留让你有恢复感的小事：规律作息、适度运动、线下联系、减少深夜刷盘；状态好时也可以提前写下低落时能用的支持清单。";
  } else if (moduleKey === "phq9") {
    const isShort = moduleQuestions.length === 2;
    if (isShort) title = "PHQ-2 情绪低落";
    if (isShort) {
      if (raw >= 5) level = 3;
      else if (raw >= 3) level = 2;
      else if (raw >= 1) level = 1;
    } else {
      if (raw >= 20) level = 4;
      else if (raw >= 15) level = 3;
      else if (raw >= 10) level = 2;
      else if (raw >= 5) level = 1;
    }
    message = level >= 2
      ? "近期情绪低落、兴趣下降或自责疲惫的线索比较明显。你不需要靠意志力硬扛，先减少自我攻击，给自己安排低门槛支持：固定吃饭、晒太阳、把重要决定延后、告诉一个可信任的人你最近不太好；如果出现伤害自己的想法，或低落持续影响生活，请优先寻求专业帮助。"
      : "目前抑郁相关困扰不算突出，但这不代表你必须一直保持高能量。建议继续观察睡眠、兴趣感和自我评价的变化；一旦连续多天明显变差，可以提前求助，而不是等到完全撑不住。";
  } else if (moduleKey === "gad7") {
    const isShort = moduleQuestions.length === 2;
    if (isShort) title = "GAD-2 焦虑紧张";
    if (isShort) {
      if (raw >= 5) level = 3;
      else if (raw >= 3) level = 2;
      else if (raw >= 1) level = 1;
    } else {
      if (raw >= 15) level = 3;
      else if (raw >= 10) level = 2;
      else if (raw >= 5) level = 1;
    }
    message = level >= 2
      ? "焦虑紧张已经比较占用你的注意力，可能让你反复确认、难以放松，甚至把普通波动理解成危险信号。建议先降低刺激输入：减少高频看盘和信息流，给担心写一个固定处理时段，配合缓慢呼吸或身体放松；如果焦虑让你无法工作、睡觉或出门，建议找专业人士一起拆解。"
      : "当前焦虑线索不算高，可以继续保持对身体信号的觉察。若之后出现心慌、坐立不安、担心停不下来，可以先从减少刺激源、规律运动和稳定睡眠做起。";
  } else if (moduleKey === "k10") {
    max = moduleQuestions.length * 5;
    display = `${raw}/${max}`;
    if (raw >= 30) level = 3;
    else if (raw >= 25) level = 2;
    else if (raw >= 20) level = 1;
    message = level >= 2
      ? "整体心理困扰偏高，说明你可能同时承受疲惫、紧张、低落或失控感。请不要把所有问题都归因于自己不够强，先做减负：暂停不必要的高风险交易和社交比较，拆小任务，保证基本休息；如果困扰持续、升级或影响生活功能，建议尽快寻求线下支持和专业评估。"
      : "整体心理困扰目前处在较轻区间，这是一个可以继续维护的状态。建议保留稳定生活锚点：睡眠、饮食、运动、现实社交和清晰的交易边界。";
  } else if (moduleKey === "isi") {
    if (raw >= 22) level = 3;
    else if (raw >= 15) level = 2;
    else if (raw >= 8) level = 1;
    message = level >= 2
      ? "睡眠困扰已经比较明显，身体可能长期处在警觉或恢复不足中。建议把睡眠当成优先级：固定起床时间，睡前一小时减少屏幕和行情刺激，夜里醒来不要反复检查价格；如果失眠持续数周、白天功能受影响，建议咨询医生或睡眠相关专业人士。"
      : "睡眠困扰暂不突出，但仍值得维护。可以保持固定作息、减少睡前看盘、避免用酒精或过度刷手机来催眠，让身体慢慢重新相信夜晚是安全的。";
  } else if (moduleKey === "trading") {
    const ratio = max ? raw / max : 0;
    if (ratio >= 0.78) level = 3;
    else if (ratio >= 0.55) level = 2;
    else if (ratio >= 0.3) level = 1;
    message = [
      "你的交易心理状态相对稳定，说明你还有观察、等待和复盘的空间。建议继续保留仓位上限、止损规则和睡前不看盘的边界。",
      "行情已经开始牵动情绪，但还在可调整范围内。可以给自己设置冷静间隔：冲动买入前等 10 分钟，亏损后不立刻加仓，睡前把交易软件移出第一屏。",
      "交易内耗比较明显，可能出现反复看盘、后悔、自责或报复性操作。建议暂停高频决策，把仓位降到睡得着的水平，并记录触发情绪的场景，而不是只复盘盈亏。",
      "交易压力已经处在高位，请优先保护自己而不是保护仓位。建议暂停新开仓，离开行情界面，联系可信任的人陪你一起降温；如果交易冲动伴随失眠、绝望或自伤想法，请立即寻求专业支持。"
    ][level];
  } else if (moduleKey === "pss10") {
    if (raw >= 27) level = 3;
    else if (raw >= 20) level = 2;
    else if (raw >= 14) level = 1;
    message = level >= 2
      ? "你最近感知到的压力偏高，可能有很多事情像同时挤到你面前。先不要急着证明自己能全部扛住，可以把压力分成三类：今天必须处理、可以延后、需要求助；每天只完成最小可行动作，也是在恢复掌控感。"
      : "当前压力感相对可控。建议继续保留能让你回到现实的节奏：固定休息、有限信息摄入、清楚地拒绝额外负担，以及在压力升高前主动求助。";
  } else if (moduleKey === "asrs6") {
    const ratio = max ? raw / max : 0;
    if (ratio >= 0.72) level = 3;
    else if (ratio >= 0.5) level = 2;
    else if (ratio >= 0.28) level = 1;
    message = level >= 2
      ? "注意力、拖延或坐立不安的线索较明显。它不等于你懒，也不等于你不自律；可以先尝试外部结构：任务拆到 10 分钟、只开一个窗口、设置可见清单和提醒。如果这些困难长期影响学习、工作或关系，建议做进一步专业评估。"
      : "注意力相关困扰暂不突出。你可以继续用简单结构保护专注：固定开始仪式、减少多任务、给重要任务留出不被打扰的时间块。";
  } else if (moduleKey === "mdq") {
    if (raw >= 9) level = 3;
    else if (raw >= 7) level = 2;
    else if (raw >= 4) level = 1;
    message = level >= 2
      ? "情绪高涨、睡眠减少、冲动或精力异常增多的线索较多。请先把近期睡眠、花钱、交易、社交冲动记录下来，并避免在兴奋期做大额决定；这类线索需要谨慎看待，建议带着记录和专业人员讨论。"
      : "目前情绪高涨相关线索不多。若之后出现连续几天睡很少也不累、话变多、花钱或交易冲动明显增加，建议尽早记录并咨询专业人士。";
  } else if (moduleKey === "scoff") {
    if (raw >= 3) level = 3;
    else if (raw >= 2) level = 2;
    else if (raw >= 1) level = 1;
    message = level >= 2
      ? "进食、体重或身体评价相关线索比较明显。你不需要独自和羞耻感对抗，也不要用更严格的控制来惩罚自己；建议尽快找医生、心理咨询师或营养相关专业人士评估，同时告诉一个可信任的人，让吃饭这件事重新回到安全和照顾。"
      : "进食问题风险线索暂不明显。仍建议温柔地观察自己和食物、体重、身材之间的关系：如果它开始明显影响情绪、自尊或社交，就值得早点寻求帮助。";
  } else if (moduleKey === "pcl5") {
    const ratio = max ? raw / max : 0;
    if (ratio >= 0.66) level = 3;
    else if (ratio >= 0.42) level = 2;
    else if (ratio >= 0.22) level = 1;
    message = level >= 2
      ? "创伤相关反应线索较明显，可能包括回避、警觉、侵入性回忆、身体紧绷或情绪麻木。请先把安全感放在第一位：减少会强烈触发你的内容，回到当下的身体感受，找可信任的人陪伴；如果这些反应持续或影响生活，建议找创伤知情的专业人士支持。"
      : "创伤相关反应暂不突出。若某些场景仍会让你突然紧绷、闪回或回避，请不要责怪自己，那可能是身体在保护你；可以慢慢建立安全资源。";
  } else if (moduleKey === "cssrs") {
    if (raw > 0) level = 4;
    message = raw > 0
      ? "已触发安全支持模式。此处不生成娱乐分数，也不建议你继续独自处理。请立刻远离可能伤害自己的物品和环境，联系身边可信任的人陪你，必要时拨打当地紧急电话或危机热线。你值得被认真保护，先让自己安全地度过这一刻。"
      : "当前安全筛查未触发高风险入口。即便如此，如果之后出现不想活、想伤害自己、无法保证安全的念头，请不要等待分数变化，马上联系身边的人、当地紧急服务或专业支持。";
  } else {
    const ratio = max ? raw / max : 0;
    if (ratio >= 0.75) level = 3;
    else if (ratio >= 0.5) level = 2;
    else if (ratio >= 0.28) level = 1;
    message = level >= 2
      ? "这个模块显示出一些值得认真照顾的困扰。建议把它当成提醒，而不是标签：先降低刺激、保证休息、找一个可信任的人说清楚近况；如果影响生活功能或持续加重，请考虑专业支持。"
      : "这个模块目前没有显示出很高的困扰线索。你仍然可以把它当作一次温柔的自我检查，继续留意状态变化。";
  }

  const localizedModule = localizedMentalModule(moduleKey);
  return {
    moduleKey,
    title: currentLang === "en" ? localizedModule.title : title,
    display,
    level,
    message: localizedMentalSummaryMessage(moduleKey, level, raw) || message,
    notice: localizedModule.notice || ""
  };
}

function computeMentalSummaries(state) {
  if (isDegenPersonaState(state)) {
    const persona = computeDegenPersonaResult(state);
    return [{
      moduleKey: "degenPersona",
      title: persona.type.name,
      display: persona.code,
      level: 0,
      message: persona.type.subtitle,
      persona
    }];
  }
  const keys = [...new Set(state.queue.map((item) => item.moduleKey))];
  return keys.map((key) => summarizeMentalModule(key, state.answers, state.queue)).filter(Boolean);
}

function saveMentalRecord(state, summaries) {
  const records = readMentalJson(MENTAL_STORAGE_KEY, []);
  if (isDegenPersonaState(state)) {
    const persona = summaries[0]?.persona || computeDegenPersonaResult(state);
    const record = {
      id: Date.now(),
      date: new Date().toLocaleString("zh-CN", { hour12: false }),
      mode: "Degen 交易人格自查",
      headline: persona.type.name,
      risk: false,
      persona: {
        type: persona.type.name,
        code: persona.code,
        dimensions: Object.fromEntries(persona.dimensions.map((dimension) => [dimension.name, dimension.score]))
      },
      summaries: [{
        title: "交易人格代码",
        display: persona.code,
        level: 0
      }]
    };
    writeMentalJson(MENTAL_STORAGE_KEY, [record, ...records].slice(0, 8));
    return;
  }
  const highest = summaries.reduce((max, item) => item.level > max.level ? item : max, summaries[0] || { level: 0 });
  const record = {
    id: Date.now(),
    date: new Date().toLocaleString("zh-CN", { hour12: false }),
    mode: state.singleModule ? MENTAL_MODULES[state.singleModule]?.title : MENTAL_MODE_COPY[state.mode]?.title,
    headline: state.riskTriggered ? "安全支持优先" : mentalSeverityLabel(highest.level),
    risk: state.riskTriggered,
    summaries: summaries.slice(0, 5).map((item) => ({
      title: item.title,
      display: item.display,
      level: item.level
    }))
  };
  writeMentalJson(MENTAL_STORAGE_KEY, [record, ...records].slice(0, 8));
}

function writeMentalDraft(state) {
  if (!state.started || state.completed) return;
  writeMentalJson(MENTAL_DRAFT_KEY, {
    mode: state.mode,
    singleModule: state.singleModule,
    index: state.index,
    answers: state.answers,
    riskTriggered: state.riskTriggered
  });
}

function renderMentalModules(app, state) {
  const modules = app.querySelector("[data-mental-modules]");
  if (!modules) return;
  const primaryModules = ["who5", "phq9", "gad7", "k10", "isi", "trading"];
  const advancedModules = ["pss10", "asrs6", "mdq", "scoff", "pcl5"];
  const showSafetyModule = true;
  const renderButton = (key) => {
    const module = localizedMentalModule(key);
    if (!module) return "";
    const selected = state?.singleModule === key;
    const phase = module.safety ? "safety" : advancedModules.includes(key) ? "phase2" : "phase1";
    return `
      <button class="${selected ? "selected" : ""}" type="button" data-mental-module="${key}" data-mental-phase="${phase}" aria-pressed="${selected ? "true" : "false"}">
        <b>${module.title}</b>
        <span><i>${module.phase}</i><em>${module.purpose}</em></span>
      </button>
    `;
  };
  modules.innerHTML = `
    <h3>${mc("量表模块", "Assessment Modules")}</h3>
    <div class="mental-primary-modules">${primaryModules.map(renderButton).join("")}</div>
    <div class="mental-advanced-modules">${advancedModules.map(renderButton).join("")}</div>
    ${showSafetyModule ? `<div class="mental-safety-module">${renderButton("cssrs")}</div>` : ""}
  `;
}

function renderMentalRecords(app) {
  const target = app.querySelector("[data-mental-records]");
  if (!target) return;
  const records = readMentalJson(MENTAL_STORAGE_KEY, []);
  const localizedRecord = (value) => {
    if (currentLang !== "en") return value;
    const moduleKey = Object.keys(MENTAL_MODULES).find((key) => MENTAL_MODULES[key].title === value);
    if (moduleKey) return localizedMentalModule(moduleKey).title;
    const modeKey = Object.keys(MENTAL_MODE_COPY).find((key) => MENTAL_MODE_COPY[key].title === value);
    if (modeKey) return localizedMentalMode(modeKey).title;
    const type = DEGEN_PERSONA_TYPES.find((item) => item.name === value);
    if (type) return localizePersonaType(currentLang, type).name;
    const severity = ["状态相对平稳", "轻度需要关注", "困扰较明显", "建议认真关注", "安全支持优先"].indexOf(value);
    return severity >= 0 ? mentalSeverityLabel(severity) : value;
  };
  const recordList = records.length ? records.map((record) => `
      <article class="${record.risk ? "risk" : ""}">
        <b>${escapeMentalHtml(localizedRecord(record.headline))}</b>
        <span>${escapeMentalHtml(localizedRecord(record.mode || mc("自测", "Check-in")))} · ${escapeMentalHtml(record.date)}</span>
      </article>
    `).join("") : `<p>${mc("暂无记录。完成一次自测后，只会保存在当前浏览器。", "No records yet. Completed check-ins are stored only in this browser.")}</p>`;
  target.innerHTML = `
    <div class="mental-records-head">
      <h3>${mc("本地复测记录", "Local Retest Records")}</h3>
      <button type="button" data-mental-clear-records>${mc("清除本地记录", "Clear Local Records")}</button>
    </div>
    <div class="mental-record-list">${recordList}</div>
  `;
}

function renderMentalQuestion(app, state) {
  const card = app.querySelector("[data-mental-question-card]");
  if (!card) return;
  card.hidden = false;
  const moduleMode = localizedMentalMode("module");
  const modeCopy = state.singleModule
    ? { ...moduleMode, title: localizedMentalModule(state.singleModule)?.title || moduleMode.title }
    : localizedMentalMode(state.mode);

  app.querySelectorAll("[data-mental-mode]").forEach((button) => {
    button.classList.toggle("active", !state.singleModule && button.dataset.mentalMode === state.mode);
  });

  if (state.completed) {
    card.innerHTML = `
      <span class="mental-section-label">${mc("已完成", "Completed")}</span>
      <h3>${mc("结果已生成", "Results Ready")}</h3>
      <p>${mc("本次自评已保存到本地浏览器。你可以继续复测，也可以清除本地记录。", "This check-in has been saved locally. You can retake it or clear the local record.")}</p>
      <button type="button" data-mental-start>${mc("重新开始", "Start Again")}</button>
    `;
    return;
  }

  if (!state.started) {
    card.innerHTML = `
      <span class="mental-section-label">${mc("当前模式", "Current Mode")}</span>
      <h3>${modeCopy.title}</h3>
      <p>${modeCopy.detail}</p>
      <button type="button" data-mental-start>${modeCopy.action}</button>
    `;
    return;
  }

  const rawQuestion = state.queue[state.index];
  const question = localizeMentalQuestion(currentLang, rawQuestion);
  const module = localizedMentalModule(question.moduleKey);
  const answered = state.answers[question.id] !== undefined;
  const progress = Math.round(((state.index + 1) / state.queue.length) * 100);
  const dimension = question.dim ? localizePersonaDimension(currentLang, question.dim, DEGEN_PERSONA_DIMENSIONS[question.dim]) : null;
  const dimensionMarkup = dimension ? `
    <div class="persona-question-axis" style="--persona-axis: ${dimension.color}">
      <span><b>${dimension.left}</b>${question.left}</span>
      <i>${dimension.name}</i>
      <span><b>${dimension.right}</b>${question.right}</span>
    </div>
  ` : "";
  const questionText = isDegenPersonaState(state)
    ? currentLang === "en" ? escapeMentalHtml(question.text) : wrapMentalQuestionText(question.text, 30)
    : escapeMentalHtml(question.text);

  card.innerHTML = `
    <div class="mental-module-frame" data-current-module="${question.moduleKey}" ${question.dim ? `data-persona-dim="${question.dim}"` : ""}>
      <span class="mental-section-label">${module.title} · ${state.index + 1}/${state.queue.length}</span>
      <h3>${questionText}</h3>
      ${isDegenPersonaState(state) ? `<p class="persona-question-hint">${mc("请选择最符合你真实习惯的选项。", "Choose the option that best reflects your real habits.")}</p>` : ""}
      ${dimensionMarkup}
      <div class="mental-progress"><em style="width: ${progress}%"></em></div>
      <div class="mental-options">
        ${mentalQuestionOptions(question).map((option, optionIndex) => {
          const selected = Math.abs(Number(state.answers[question.id]) - Number(option.value)) < 0.001;
          const optionLabel = escapeMentalHtml(option.label);
          const optionCopy = isDegenPersonaState(state) ? `<span class="persona-option-copy">${optionLabel}</span>` : optionLabel;
          return `
            <button class="${selected ? "selected" : ""}" type="button" data-mental-answer="${option.value}" data-option-index="${optionIndex}" aria-pressed="${selected ? "true" : "false"}">
              ${optionCopy}
            </button>
          `;
        }).join("")}
      </div>
      ${module.notice ? `<p class="mental-notice">${module.notice}</p>` : ""}
      <div class="mental-question-actions">
        <button type="button" data-mental-prev ${state.index === 0 ? "disabled" : ""}>${mc("上一题", "Previous")}</button>
        <button type="button" data-mental-next ${answered ? "" : "disabled"}>${state.index === state.queue.length - 1 ? mc("生成结果", "Generate Results") : mc("下一题", "Next")}</button>
      </div>
    </div>
  `;
}

function renderMentalCenterPrompt(app, state) {
  const card = app.querySelector("[data-mental-question-card]");
  if (!card) return;
  card.hidden = false;
  const moduleMode = localizedMentalMode("module");
  const modeCopy = state.singleModule
    ? { ...moduleMode, title: localizedMentalModule(state.singleModule)?.title || moduleMode.title }
    : localizedMentalMode(state.mode);
  const selectedModule = state.singleModule ? localizedMentalModule(state.singleModule) : null;
  const selectedTitle = selectedModule?.title || modeCopy.title;
  const selectedDetail = state.singleModule
    ? `${selectedModule?.phase || ""} · ${selectedModule?.purpose || modeCopy.detail}`
    : modeCopy.detail;

  app.querySelectorAll("[data-mental-mode]").forEach((button) => {
    button.classList.toggle("active", !state.singleModule && button.dataset.mentalMode === state.mode);
    button.setAttribute("aria-pressed", String(!state.singleModule && button.dataset.mentalMode === state.mode));
  });
  const degenEntry = app.querySelector("[data-degen-persona-entry]");
  if (degenEntry) {
    degenEntry.classList.toggle("active", isDegenPersonaState(state));
    degenEntry.setAttribute("aria-pressed", String(isDegenPersonaState(state)));
  }

  const result = app.querySelector("[data-mental-result]");
  if (result) {
    result.hidden = true;
    result.innerHTML = "";
  }

  const crisis = app.querySelector("[data-mental-crisis]");
  if (crisis) crisis.hidden = true;

  if (state.started && !state.completed) {
    const current = state.queue.length ? state.index + 1 : 0;
    card.innerHTML = `
      <span class="mental-section-label">${mc("答题已转入专门页面", "Assessment Opened on Its Own Page")}</span>
      <h3>${mc("继续上次自测", "Continue Your Check-In")}</h3>
      <p>${mc(`当前进度 ${current} / ${state.queue.length}。所有题目都会在独立答题页完成，中心页只保留入口、模块和本地记录。`, `Current progress: ${current} / ${state.queue.length}. Questions are completed on the dedicated assessment page; the center keeps only entry points, modules, and local records.`)}</p>
      <button type="button" data-mental-continue>${mc("进入专门答题页", "Open Assessment Page")}</button>
    `;
    return;
  }

  card.innerHTML = `
    <span class="mental-section-label">${mc("当前选择", "Current Selection")}</span>
    <h3>${selectedTitle}</h3>
    <p>${selectedDetail}</p>
    <button type="button" data-mental-start>${mc("进入专门答题页", "Open Assessment Page")}</button>
  `;
}

function renderMentalResult(app, state) {
  const result = app.querySelector("[data-mental-result]");
  if (!result) return;
  if (!state.completed) {
    result.hidden = true;
    result.innerHTML = "";
    result.classList.remove("degen-persona-result");
    return;
  }

  if (isDegenPersonaState(state)) {
    renderDegenPersonaResult(result, state);
    return;
  }

  result.classList.remove("degen-persona-result");
  const summaries = computeMentalSummaries(state);
  const highest = summaries.reduce((max, item) => item.level > max.level ? item : max, summaries[0] || { level: 0 });
  const headline = state.riskTriggered ? mc("安全支持优先", "Safety Support First") : mentalSeverityLabel(highest.level);
  result.hidden = false;
  result.innerHTML = `
    <span class="mental-section-label">${mc("本次结果", "Your Results")}</span>
    <h3>${headline}</h3>
    <p>${mc("这不是诊断。结果只表示你最近一段时间的自评线索，不能替代医生、心理咨询师或精神科医生的判断。", "This is not a diagnosis. The results only reflect recent self-reported clues and cannot replace the judgment of a doctor, counselor, or psychiatrist.")}</p>
    <div class="mental-summary-list">
      ${summaries.map((item) => `
        <article class="${mentalSeverityClass(item.level)}">
          <b>${item.title}</b>
          <strong>${item.display}</strong>
          <span>${item.message}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function renderDegenPersonaResult(result, state) {
  const persona = localizedPersona(state.resultSummaries?.[0]?.persona || computeDegenPersonaResult(state));
  result.hidden = false;
  result.classList.add("degen-persona-result");
  result.innerHTML = `
    <span class="mental-section-label">${mc("DegenDNA 自研结果", "DegenDNA Original Result")}</span>
    <div class="persona-result-hero">
      <div>
        <h3>${persona.type.name}</h3>
        <p>${persona.type.subtitle}</p>
      </div>
      <strong>${persona.code}</strong>
    </div>
    <p class="persona-disclaimer">${mc("本测试为 DegenDNA.fun 自研的交易人格自查工具，用于娱乐、自我观察和交易行为复盘。它不属于 MBTI，也不与 Myers-Briggs Type Indicator 或相关机构存在关联；结果不构成投资建议。", "This DegenDNA.fun original trading-persona check is designed for entertainment, self-observation, and behavioral review. It is not MBTI, is not affiliated with Myers-Briggs Type Indicator or related organizations, and does not constitute investment advice.")}</p>
    <div class="persona-dimension-grid">
      ${persona.dimensions.map((dimension) => `
        <article style="--persona-axis: ${dimension.color}">
          <b>${dimension.name}</b>
          <span>${dimension.left}<i>${dimension.score >= 0 ? "" : "●"}</i><em style="width: ${dimension.strength}%"></em><i>${dimension.score >= 0 ? "●" : ""}</i>${dimension.right}</span>
          <strong>${dimension.direction}</strong>
        </article>
      `).join("")}
    </div>
    <div class="persona-insight-grid">
      <article>
        <b>${mc("优势雷达", "Strength Radar")}</b>
        ${persona.type.strengths.map((item) => `<span>${item}</span>`).join("")}
      </article>
      <article>
        <b>${mc("盲区警报", "Blind-Spot Alerts")}</b>
        ${persona.type.risks.map((item) => `<span>${item}</span>`).join("")}
      </article>
      <article>
        <b>${mc("复盘协议", "Review Protocol")}</b>
        <p>${persona.type.protocol}</p>
      </article>
    </div>
  `;
}

function renderMentalCrisis(app, state) {
  const crisis = app.querySelector("[data-mental-crisis]");
  if (!crisis) return;
  crisis.hidden = !shouldShowCrisisSupport(state);
}

function mentalSessionTitle(state) {
  if (isDegenPersonaState(state)) return localizedMentalMode("degen-persona").title;
  if (state.singleModule) return localizedMentalModule(state.singleModule)?.title || localizedMentalMode("module").title;
  return localizedMentalMode(state.mode)?.title || localizedMentalMode("quick").title;
}

function mentalSessionDetail(state) {
  if (isDegenPersonaState(state)) return localizedMentalMode("degen-persona").detail;
  if (state.singleModule) {
    const module = localizedMentalModule(state.singleModule);
    return module ? `${module.phase} · ${module.purpose}` : localizedMentalMode("module").detail;
  }
  return localizedMentalMode(state.mode)?.detail || localizedMentalMode("quick").detail;
}

function renderMentalQuizPage(state) {
  const page = document.querySelector("[data-mental-quiz-page]");
  if (!page || !state) {
    document.body.classList.remove("degen-persona-result-mode");
    return;
  }
  const hasCrisis = shouldShowCrisisSupport(state);
  const isDegen = isDegenPersonaState(state);
  page.classList.toggle("has-result", state.completed);
  page.classList.toggle("has-crisis", hasCrisis);
  page.classList.toggle("is-degen-persona", isDegen);
  document.body.classList.toggle("degen-persona-quiz", isDegen);
  document.body.classList.toggle("degen-persona-result-mode", isDegen && state.completed);

  setText(page.querySelector("[data-mental-quiz-kicker]"), isDegenPersonaState(state) ? mc("DegenDNA 自研测试", "DegenDNA Original Assessment") : state.singleModule ? mc("单模块自测", "Single-Module Check") : mc("心理健康自测", "Mental Health Check-In"));
  setText(page.querySelector("[data-mental-quiz-title]"), mentalSessionTitle(state));
  setText(page.querySelector("[data-mental-quiz-subtitle]"), mentalSessionDetail(state));

  const progress = page.querySelector("[data-mental-quiz-progress]");
  if (progress) {
    const total = state.queue.length || 0;
    const current = state.completed ? total : Math.min(state.index + 1, total);
    const percent = total ? Math.round((current / total) * 100) : 0;
    const progressDeg = `${percent * 3.6}deg`;
    const remaining = Math.max(0, total - current);
    const estimate = Math.max(1, Math.ceil(remaining * (isDegen ? 0.4 : 0.3)));
    progress.innerHTML = `
      <b>${isDegen ? mc("测评进度", "Assessment Progress") : mc("答题进度", "Question Progress")} <small>PROGRESS</small></b>
      <div class="quiz-progress-orb" style="--quiz-progress: ${percent}%; --quiz-progress-deg: ${progressDeg}" aria-hidden="true"><strong>${percent}<em>%</em></strong></div>
      <dl>
        <div><dt>${mc("已完成", "Completed")}</dt><dd>${current}</dd></div>
        <div><dt>${mc("剩余", "Remaining")}</dt><dd>${remaining}</dd></div>
        <div><dt>${mc("预计耗时", "Est. time")}</dt><dd>${estimate} ${mc("分钟", "min")}</dd></div>
      </dl>
      <i><em></em></i>
      <ol aria-hidden="true">
        <li>${mc("开始", "Start")}</li>
        <li>${isDegen ? mc("行为偏好", "Behavior") : mc("状态记录", "Check-in")}</li>
        <li>${isDegen ? mc("风险反应", "Risk") : mc("风险识别", "Safety")}</li>
        <li>${mc("综合分析", "Analysis")}</li>
        <li>${isDegen ? mc("报告生成", "Report") : mc("结果生成", "Results")}</li>
      </ol>
    `;
    const bar = progress.querySelector("i > em");
    if (bar) bar.style.width = `${percent}%`;
    const orb = progress.querySelector(".quiz-progress-orb");
    if (orb) {
      orb.style.setProperty("--quiz-progress", `${percent}%`);
      orb.style.setProperty("--quiz-progress-deg", progressDeg);
    }
    progress.style.setProperty("--quiz-progress", `${percent}%`);
    progress.style.setProperty("--quiz-progress-deg", progressDeg);
    progress.setAttribute("data-progress", `${percent}%`);
  }

  const questionCard = page.querySelector("[data-mental-question-card]");
  if (state.completed) {
    if (questionCard) {
      questionCard.hidden = true;
      questionCard.innerHTML = "";
    }
  } else {
    renderMentalQuestion(page, state);
  }
  renderMentalResult(page, state);
  renderMentalCrisis(page, state);
  renderMentalRecords(page);
  renderDegenPersonaChrome(page, state);
}

function renderMentalHealth(app, state) {
  renderMentalModules(app, state);
  renderMentalRecords(app);
  renderMentalCenterPrompt(app, state);
  renderMentalQuizPage(state);
}

function clearMentalAutoAdvance() {
  if (!mentalAutoAdvanceTimer) return;
  window.clearTimeout(mentalAutoAdvanceTimer);
  mentalAutoAdvanceTimer = null;
}

function completeMentalSession(state) {
  state.completed = true;
  state.started = false;
  state.resultSummaries = computeMentalSummaries(state);
  saveMentalRecord(state, state.resultSummaries);
  localStorage.removeItem(MENTAL_DRAFT_KEY);
}

function advanceMentalQuestion(app, state) {
  if (!state.started || state.completed) return;
  if (state.index < state.queue.length - 1) {
    state.index += 1;
    writeMentalDraft(state);
  } else {
    completeMentalSession(state);
  }
  renderMentalHealth(app, state);
}

function scheduleMentalAutoAdvance(app, state) {
  if (mentalAutoAdvanceTimer) window.clearTimeout(mentalAutoAdvanceTimer);
  mentalAutoAdvanceTimer = window.setTimeout(() => {
    mentalAutoAdvanceTimer = null;
    advanceMentalQuestion(app, state);
  }, 180);
}

function answerMentalQuestion(app, state, answerButton) {
  if (!state.started || state.completed) return;
  const question = state.queue[state.index];
  if (!question) return;
  state.answers[question.id] = Number(answerButton.dataset.mentalAnswer);
  if (question.risk && Number(answerButton.dataset.mentalAnswer) > 0) {
    state.riskTriggered = true;
  }
  writeMentalDraft(state);
  renderMentalHealth(app, state);
  scheduleMentalAutoAdvance(app, state);
}

function selectMentalSession(state, options = {}) {
  clearMentalAutoAdvance();
  state.mode = options.mode || state.mode || "quick";
  state.singleModule = options.singleModule || null;
  state.queue = buildMentalQueue(state.mode, state.singleModule);
  state.index = 0;
  state.answers = {};
  state.started = false;
  state.completed = false;
  state.riskTriggered = false;
  state.resultSummaries = null;
  try {
    localStorage.removeItem(MENTAL_DRAFT_KEY);
  } catch {
    // Local storage can be disabled by the browser.
  }
}

function startMentalSession(app, state, options = {}) {
  clearMentalAutoAdvance();
  state.mode = options.mode || state.mode || "quick";
  state.singleModule = Object.prototype.hasOwnProperty.call(options, "singleModule") ? options.singleModule : state.singleModule || null;
  state.queue = buildMentalQueue(state.mode, state.singleModule);
  state.index = 0;
  state.answers = {};
  state.started = true;
  state.completed = false;
  state.riskTriggered = false;
  state.resultSummaries = null;
  writeMentalDraft(state);
  renderMentalHealth(app, state);
  applyPage("psyche-test");
}

function initMentalHealthCenter(app) {
  const draft = readMentalJson(MENTAL_DRAFT_KEY, null);
  const state = {
    mode: draft?.mode || "quick",
    singleModule: draft?.singleModule || null,
    queue: buildMentalQueue(draft?.mode || "quick", draft?.singleModule || null),
    index: draft?.index || 0,
    answers: draft?.answers || {},
    started: Boolean(draft),
    completed: false,
    riskTriggered: Boolean(draft?.riskTriggered),
    resultSummaries: null
  };
  activeMentalApp = app;
  activeMentalState = state;

  const routedSession = mentalRouteFromHash();
  if (routedSession?.mode === "degen-persona") {
    startMentalSession(app, state, { mode: "degen-persona", singleModule: null });
  }

  app.addEventListener("click", (event) => {
    if (event.target.closest("[data-degen-persona-entry]")) {
      startMentalSession(app, state, { mode: "degen-persona", singleModule: null });
      return;
    }

    const modeButton = event.target.closest("[data-mental-mode]");
    if (modeButton) {
      selectMentalSession(state, { mode: modeButton.dataset.mentalMode });
      renderMentalHealth(app, state);
      return;
    }

    const moduleButton = event.target.closest("[data-mental-module]");
    if (moduleButton) {
      selectMentalSession(state, { mode: "module", singleModule: moduleButton.dataset.mentalModule });
      renderMentalHealth(app, state);
      return;
    }

    if (event.target.closest("[data-mental-continue]")) {
      clearMentalAutoAdvance();
      renderMentalHealth(app, state);
      applyPage("psyche-test");
      return;
    }

    if (event.target.closest("[data-mental-start]")) {
      startMentalSession(app, state);
      return;
    }

    const answerButton = event.target.closest("[data-mental-answer]");
    if (answerButton && state.started && !state.completed) {
      answerMentalQuestion(app, state, answerButton);
      return;
    }

    if (event.target.closest("[data-mental-prev]") && state.index > 0) {
      clearMentalAutoAdvance();
      state.index -= 1;
      writeMentalDraft(state);
      renderMentalHealth(app, state);
      return;
    }

    if (event.target.closest("[data-mental-next]") && state.answers[state.queue[state.index]?.id] !== undefined) {
      clearMentalAutoAdvance();
      if (state.index < state.queue.length - 1) {
        state.index += 1;
        writeMentalDraft(state);
      } else {
        completeMentalSession(state);
      }
      renderMentalHealth(app, state);
      return;
    }

    if (event.target.closest("[data-mental-clear-records]")) {
      localStorage.removeItem(MENTAL_STORAGE_KEY);
      renderMentalRecords(app);
    }
  });

  if (state.mode !== "degen-persona" || !state.started) renderMentalHealth(app, state);
}

document.querySelectorAll("[data-mental-quiz-page]").forEach((page) => {
  page.addEventListener("click", (event) => {
    const state = activeMentalState;
    const app = activeMentalApp;
    if (!state || !app) return;

    if (event.target.closest("[data-mental-back]")) {
      clearMentalAutoAdvance();
      applyPage("psyche");
      renderMentalHealth(app, state);
      return;
    }

    if (event.target.closest("[data-mental-start]")) {
      startMentalSession(app, state);
      return;
    }

    const answerButton = event.target.closest("[data-mental-answer]");
    if (answerButton && state.started && !state.completed) {
      answerMentalQuestion(app, state, answerButton);
      return;
    }

    if (event.target.closest("[data-mental-prev]") && state.index > 0) {
      clearMentalAutoAdvance();
      state.index -= 1;
      writeMentalDraft(state);
      renderMentalHealth(app, state);
      return;
    }

    if (event.target.closest("[data-mental-next]") && state.answers[state.queue[state.index]?.id] !== undefined) {
      clearMentalAutoAdvance();
      if (state.index < state.queue.length - 1) {
        state.index += 1;
        writeMentalDraft(state);
      } else {
        completeMentalSession(state);
      }
      renderMentalHealth(app, state);
      return;
    }

    if (event.target.closest("[data-mental-clear-records]")) {
      localStorage.removeItem(MENTAL_STORAGE_KEY);
      renderMentalHealth(app, state);
    }
  });
});

document.querySelectorAll("[data-mental-app]").forEach((app) => initMentalHealthCenter(app));

document.querySelectorAll("[data-psyche-option]").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.closest("[data-page-screen]") || document;
    const score = Number(button.dataset.psycheOption);
    page.querySelectorAll("[data-psyche-option]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    page.querySelector("[data-psyche-score]").textContent = String(score);
    page.querySelector("[data-psyche-meter]").style.width = `${score}%`;
    updatePsycheDiagnosis(score, page);
    setStatus(t("status.psyche"));
  });
});

function updatePsycheDiagnosis(explicitScore, root = document) {
  const scoreElement = root.querySelector("[data-psyche-score]");
  const diagnosis = root.querySelector("[data-psyche-diagnosis]");
  if (!scoreElement || !diagnosis) return;

  const score = explicitScore ?? Number(scoreElement.textContent);
  if (root.classList?.contains("ref-psyche-page")) {
    const psycheCopy = FINAL_PAGE_COPY[currentLang].psyche;
    let finalDiagnosis = psycheCopy.diagnosisCalm;
    if (score >= 70) finalDiagnosis = psycheCopy.diagnosisMax;
    if (score > 30 && score < 70) finalDiagnosis = psycheCopy.diagnosisHot;
    diagnosis.textContent = finalDiagnosis;
    return;
  }

  let key = "psyche.defaultDiagnosis";
  if (score <= 30) key = "psyche.calmDiagnosis";
  if (score >= 70) key = "psyche.maxDiagnosis";
  if (score > 30 && score < 70) key = "psyche.hotDiagnosis";
  diagnosis.textContent = t(key);
}

function scoreFromText(value) {
  let total = 0;
  for (const char of value) total += char.charCodeAt(0);
  return 42 + (total % 56);
}

document.querySelectorAll("[data-psyche-meter]").forEach((meter) => {
  meter.style.width = meter.closest(".ref-psyche-page") ? "26%" : "51%";
});

document.querySelectorAll("[data-report-detail]").forEach((button) => {
  button.addEventListener("click", () => {
    const url = reportDetailUrl();
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  });
});

document.querySelectorAll("[data-detail-copy-link]").forEach((button) => {
  button.addEventListener("click", async () => {
    const result = await copySharePayload(reportDetailUrl());
    setStatus(
      currentLang === "en"
        ? result === "text" ? "Detailed report link copied." : "Copy the detailed report URL from the address bar."
        : result === "text" ? "详细报告链接已复制。" : "请从浏览器地址栏复制详细报告链接。"
    );
  });
});

document.querySelectorAll(".share-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const copy = finalText("report", "tweet");
    const shareText = copy;

    button.disabled = true;
    button.classList.add("is-busy");

    try {
      const clipboardResult = await withTimeout(copySharePayload(shareText, null), 1800, "none");
      openXComposer(shareText);
      setStatus(reportShareStatus(clipboardResult));
    } catch (error) {
      console.warn("DegenDNA share copy failed", error);
      setStatus(currentLang === "en" ? "The share copy could not be prepared." : "晒文案生成失败，请重试。", "error");
    } finally {
      button.disabled = false;
      button.classList.remove("is-busy");
    }
  });
});

document.querySelectorAll(".gold-action").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.add("claimed");
    setText(button, finalText("report", "claimed"));
    setStatus(finalText("report", "claimed"));
  });
});

applyLanguage();
applyPage(currentPage, { updateHash: false });
refreshLeaderboard();
