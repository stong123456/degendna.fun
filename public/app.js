const STONE_X_HANDLE = "@Stone141319";
const STONE_AVATAR_URL = "/assets/stone-avatar.png";
const LIGHTHOUSE_X_HANDLE = "@Lighthouse_2026";
const LIGHTHOUSE_INVITE_URL = "https://app.lhdao.top/?ref=cmkamdijn000cc94wijye0uz7";

const I18N = {
  zh: {
    meta: {
      title: "链上照妖镜 - Degen DNA Report",
      description: "输入钱包地址，生成能晒、能比、能自嘲的链上人格报告。"
    },
    brand: { aria: "链上照妖镜", mark: "照", name: "链上照妖镜", sub: "Degen DNA Report" },
    nav: { aria: "工具入口", mirror: "照钱包", pk: "钱包 PK", board: "X 排行榜", mental: "心理自测", about: "关于", tg: "TG 频道" },
    views: { aria: "页面视图", mirror: "钱包检测", pk: "钱包 PK", board: "稀有度排行榜", mental: "心理自测" },
    gate: {
      aria: "关注任务",
      avatarAlt: "Stone141319 头像",
      title: "先关注石头，再照钱包",
      copy: "关注后就能照钱包；填 @X 用户名会显示头像和名字，并自动加入公开排行榜。",
      follow: "关注石头 @Stone141319",
      unlock: "我已关注，解锁工具",
      unlocked: "已解锁",
      lockText: "关注石头后解锁"
    },
    hero: {
      eyebrow: "Degen DNA Report",
      title: "输入地址，照出链上病历。",
      copy: "链上数据不会撒谎，但文案会补刀。"
    },
    clinic: {
      aria: "链上精神科就诊流程",
      step1Title: "挂号",
      step1Copy: "输入公开地址",
      step2Title: "听诊",
      step2Copy: "读取链上心电图",
      step3Title: "诊断",
      step3Copy: "生成精神病历",
      step4Title: "出院",
      step4Copy: "晒图或领取 NFT"
    },
    form: {
      label: "EVM 钱包地址",
      submit: "生成报告",
      samples: "示例钱包",
      sampleTitle: "不知道测什么？先照这几个钱包。",
      trustAria: "安全提示",
      unlockedNote: "已解锁。不连接钱包，不要签名，不碰私钥。只读取公开链上数据。",
      lockedNote: "先关注石头并确认后解锁。全程不连接钱包、不签名。",
      invalid: "请输入有效的 EVM 钱包地址。",
      xLabel: "X 用户名（可选，上榜用）",
      xPlaceholder: "@Stone141319",
      xHelp: "填 @用户名后会读取 X 头像，自动加入公开排行榜。",
      invalidX: "请输入有效的 @X 用户名，最多 15 位字母、数字或下划线。",
      loading: "正在读取 Ethereum / Base / Arbitrum / Optimism / Polygon / BNB Chain 公开链上数据...",
      loadingProfile: "正在读取 X 头像和用户名...",
      failed: "生成失败，请稍后再试。",
      mustFollow: "先完成关注石头的任务，再生成链上人格报告。"
    },
    trust: {
      public: "只分析公开链上数据",
      noConnect: "不连接钱包",
      noSign: "不需要签名",
      noKey: "不读取私钥",
      noAsset: "不触碰资产"
    },
    samples: {
      vitalik: "照 Vitalik 钱包",
      binance: "照 Binance 热钱包",
      random: "照随机 Degen 钱包"
    },
    metrics: { aria: "核心指数", degen: "Degen 指数", diamond: "钻石手指数", airdrop: "空投雷达" },
    rarity: {
      personalityTitle: "钱包人格稀有度",
      comboTitle: "组合稀有度",
      seasonPrefix: "赛季样本",
      rankedWallets: "个上榜钱包"
    },
    sections: {
      asset: "链上资产性格",
      loss: "亏损黑匣子",
      holding: "钻石手 / 纸手",
      alpha: "Alpha 雷达",
      fate: "90 天钱包命运",
      strategy: "适合你的交易风格",
      strategyNote: "由 Hermes 策略映射生成"
    },
    mode: {
      aria: "报告模式",
      normal: "普通版",
      roast: "嘴毒版",
      abstract: "抽象版",
      kol: "KOL 版"
    },
    card: {
      reportTitle: "链上听诊器诊断报告",
      personalityPrefix: "钱包人格：",
      degen: "Degen 指数",
      diamond: "钻石手指数",
      loss: "亏损主因",
      tags: "核心徽章",
      rarity: "稀有度",
      share: "生成晒图并发到 X",
      defaultVerdict: "你的判断力偶尔在线，但下一根阳线总能让它下线。",
      doctor: "链上主治医生：石头",
      publicOnly: "不签名 · 只看公开数据",
      reminders: [
        "照完钱包，也记得照顾好自己。",
        "钱包可以回撤，人不要一直硬扛。",
        "今天少看一会儿盘，也算一种止损。",
        "亏损只是账户状态，不是你的人生评价。",
        "别让一根 K 线决定你今天的心情。",
        "市场不会心疼你，所以你要自己心疼自己。",
        "少熬夜，多喝水，别和钱包一起破防。",
        "你可以对市场嘴硬，但别对自己的情绪装没事。",
        "如果今天状态不好，先离开屏幕也没关系。",
        "链上数据会记录交易，但不会定义你这个人。",
        "钱包需要风控，人也需要休息。",
        "交易可以慢慢来，人要先稳住。",
        "别把所有情绪都交给涨跌。",
        "今天没赚钱，也可以好好睡觉。",
        "照妖镜负责补刀，你负责好好生活。",
        "你有多久没有照过自己的钱包了？也许更该问的是，你有多久没有认真看看自己了。",
        "市场一直开着，但你不用一直紧绷。",
        "你不是账户余额，你是一个需要被好好照顾的人。",
        "难受的时候，找朋友说说话，不要一个人扛太久。",
        "必要的时候，寻求专业帮助也是一种勇气。",
        "钱包里的亏损可以复盘，心里的压力也需要出口。",
        "世界很吵，你可以先把自己照顾好。",
        "错过行情不等于错过人生。",
        "不要把一次交易失败，写成对自己的判决。",
        "愿你赚到钱，也愿你睡得着。"
      ]
    },
    tweet: {
      title: "可复制推文",
      copy: "复制推文",
      copied: "推文已复制，拿去公开处刑。",
      failed: "复制失败，可以手动选中文案。"
    },
    nft: {
      title: "领取测试网病历 NFT",
      copy: "不用连接钱包，不签名，不授权。输入接收地址后，由链上主治医生把病例发送到 Sepolia。",
      receiver: "NFT 接收地址",
      claim: "领取病历",
      disabled: "样本钱包可以无限生成报告，但不能领取测试网 NFT。",
      ready: "这份病例可以领取 Sepolia 测试网 NFT。一个钱包只能获得 1 张。",
      claiming: "正在发送 Sepolia 病历 NFT，请不要重复点击。",
      claimed: "病历 NFT 已发送。",
      duplicate: "这个钱包或 X 用户名已经领取过病历 NFT。",
      invalidReceiver: "请输入有效的 EVM 接收地址。",
      failed: "NFT 领取失败。"
    },
    stats: { title: "样本数据", portfolio: "估算资产", tx: "交易次数", token: "Token 样本", meme: "Meme 暴露" },
    medical: {
      title: "链上听诊器 · 精神病历（娱乐版）",
      copy: "这是一份只听钱包心跳的娱乐诊断，不是医学诊断。链上主治医生可以补刀，但真实的人要被好好照顾。"
    },
    pk: {
      title: "钱包 PK",
      copy: "你说你比我会交易？地址拿来。链上照妖镜帮你们打一架。",
      a: "钱包 A：0x...",
      b: "钱包 B：0x...",
      submit: "开始 PK",
      invalid: "请输入两个有效的 EVM 钱包地址。",
      loading: "正在读取两个钱包的真实链上样本...",
      failed: "PK 失败。"
    },
    board: {
      title: "X 用户名排行榜",
      copy: "填 @X 用户名生成报告后，头像、名字、钱包人格、报告语言和综合评分会自动上榜。中文报告和英文报告同榜展示，各自保留原文。",
      refresh: "刷新榜单",
      teaser: "上榜后会显示：X 头像 / @handle / 钱包人格 / 报告语言 / Degen 指数 / 钻石手指数 / 综合处刑分",
      empty: "还没有公开记录。填 @X 用户名生成报告，第一份 Degen DNA 报告就会自动上榜。",
      retest: "重测",
      diamond: "钻石手",
      composite: "综合处刑分",
      rarity: "稀有度",
      degen: "Degen",
      airdrop: "空投",
      language: "语言",
      langZh: "中文报告",
      langEn: "English",
      submitted: "已自动加入排行榜。",
      submitFailed: "排行榜提交失败，但报告已生成。",
      loading: "正在读取公开排行榜...",
      rankAria: "排行榜分类",
      tabComposite: "综合处刑榜",
      tabDegen: "Degen 冲锋榜",
      tabDiamond: "钻石手榜",
      tabAirdrop: "空投游牧榜",
      tabRarity: "稀有人格榜",
      tabMedical: "精神病历榜",
      rankSummary: "当前榜单按 {metric} 排序，中文/英文报告同场公开处刑。",
      metricComposite: "综合评分",
      metricDegen: "Degen 指数",
      metricDiamond: "钻石手指数",
      metricAirdrop: "空投雷达",
      metricRarity: "人格稀有度",
      metricMedical: "链上精神病历分",
      lighthouseTitle: "灯塔蓝 V 入口",
      lighthouseCopy: "1000 粉以上蓝 V / KOL 如果已经被链上听诊器诊断出来，可以顺手加入灯塔，把链上人格样本带进更大的社交实验。",
      lighthouseFollow: "关注灯塔 @Lighthouse_2026",
      lighthouseJoin: "加入灯塔"
    },
    about: {
      title: "为什么我做链上照妖镜？",
      kicker: "一个用代码和抽象感对抗情绪低谷的加密实验。",
      p1: "我是石头，DegenDNA.fun 的创建者，也是链上照妖镜的主理人。",
      p2: "我平时研究 AI Agent、自动交易、预测市场和链上数据，也长期在用各种小工具观察市场和观察自己。",
      p3: "我本人也是中度抑郁症患者。做这个网站的起点其实很简单：币圈太容易让人焦虑了，钱包盈亏、K 线波动、错过机会、追高回撤，都会不断放大人的情绪。",
      p4: "所以我想做一个有点抽象、有点嘴毒，但最后还能提醒大家好好爱自己的链上人格实验。",
      p5: "它可以吐槽你的钱包，但不会定义你的人生。"
    },
    footer: {
      line1: "你有多久没有照过自己的钱包了？",
      line2: "也许更该问的是：",
      line3: "你有多久没有认真看看自己，好好爱自己了？记得好好照顾自己！"
    },
    report: {
      strategyPrefix: "",
      strategySuffix: "",
      noTokens: "暂无可估值 Token",
      weakSample: "公开样本不足",
      offline: "离线"
    },
    share: {
      titlePrefix: "链上照妖镜：",
      preparing: "正在生成晒图...",
      imageCopied: "已打开 X 发帖页，晒图已复制到剪贴板，直接粘贴即可。",
      imageDownloaded: "已打开 X 发帖页，浏览器不支持复制图片，PNG 已自动下载。",
      text: (report) => `我刚被链上主治医生做了链上诊断。
钱包人格：${report.personality}
稀有度：${report.rarity?.tierName || "链上异类"} · 组合出现率 ${report.rarity?.combo?.appearanceRate || "--"}%
Degen 指数 ${report.scores.degen}/100，钻石手 ${report.scores.diamond}/100。
${report.verdict}

你敢测吗？`
    }
  },
  en: {
    meta: {
      title: "Degen DNA - Onchain Mirror",
      description: "Paste a wallet address and generate a shareable onchain personality report."
    },
    brand: { aria: "Degen DNA", mark: "DNA", name: "Degen DNA", sub: "链上照妖镜" },
    nav: { aria: "Tool navigation", mirror: "Scan", pk: "Wallet PK", board: "X Leaderboard", mental: "Self-check", about: "About", tg: "TG Channel" },
    views: { aria: "Page views", mirror: "Wallet Scan", pk: "Wallet PK", board: "Rarity Leaderboard", mental: "Self-check" },
    gate: {
      aria: "Follow gate",
      avatarAlt: "Stone141319 avatar",
      title: "Follow Stone to unlock the mirror",
      copy: "Following unlocks scans. Add an @X handle to show avatar/name and enter the public leaderboard.",
      follow: "Follow @Stone141319",
      unlock: "I followed, unlock",
      unlocked: "Unlocked",
      lockText: "Follow @Stone141319 to unlock"
    },
    hero: {
      eyebrow: "Degen DNA Report",
      title: "Enter address. Get diagnosed.",
      copy: "Onchain data does not lie. The copy just adds the punchline."
    },
    clinic: {
      aria: "Onchain psychiatry intake flow",
      step1Title: "Check in",
      step1Copy: "Enter public address",
      step2Title: "Stethoscope",
      step2Copy: "Read onchain pulse",
      step3Title: "Diagnosis",
      step3Copy: "Generate psych chart",
      step4Title: "Discharge",
      step4Copy: "Share or claim NFT"
    },
    form: {
      label: "EVM wallet address",
      submit: "Generate report",
      samples: "Sample wallets",
      sampleTitle: "No wallet ready? Test these first.",
      trustAria: "Trust notes",
      unlockedNote: "Unlocked. No wallet connection, no signature, no private keys. Public onchain data only.",
      lockedNote: "Follow @Stone141319 and confirm to unlock. No wallet connection or signature required.",
      invalid: "Enter a valid EVM wallet address.",
      xLabel: "X handle (optional, for ranking)",
      xPlaceholder: "@Stone141319",
      xHelp: "Add an @handle to fetch the X avatar and enter the public leaderboard.",
      invalidX: "Enter a valid @X handle, up to 15 letters, numbers, or underscores.",
      loading: "Reading public onchain data from Ethereum / Base / Arbitrum / Optimism / Polygon / BNB Chain...",
      loadingProfile: "Reading X avatar and username...",
      failed: "Generation failed. Try again later.",
      mustFollow: "Follow @Stone141319 first, then generate your Degen DNA report."
    },
    trust: {
      public: "Public onchain data only",
      noConnect: "No wallet connection",
      noSign: "No signature",
      noKey: "No private keys",
      noAsset: "No asset access"
    },
    samples: {
      vitalik: "Scan Vitalik",
      binance: "Scan Binance hot wallet",
      random: "Scan a random Degen"
    },
    metrics: { aria: "Core scores", degen: "Degen Index", diamond: "Diamond Hands", airdrop: "Airdrop Radar" },
    rarity: {
      personalityTitle: "Personality Rarity",
      comboTitle: "Combo Rarity",
      seasonPrefix: "Season sample",
      rankedWallets: "ranked wallets"
    },
    sections: {
      asset: "Asset Personality",
      loss: "Loss Black Box",
      holding: "Diamond / Paper Hands",
      alpha: "Alpha Radar",
      fate: "90-Day Wallet Plot",
      strategy: "Your Trading Style Fit",
      strategyNote: "Generated through Hermes strategy mapping"
    },
    mode: {
      aria: "Report mode",
      normal: "Normal",
      roast: "Roast",
      abstract: "Absurd",
      kol: "KOL"
    },
    card: {
      reportTitle: "Onchain Stethoscope Report",
      personalityPrefix: "DNA Type: ",
      degen: "Degen Index",
      diamond: "Diamond Hands",
      loss: "Main Leak",
      tags: "Core Badges",
      rarity: "Rarity",
      share: "Create card and share to X",
      defaultVerdict: "Your judgment occasionally comes online, but the next green candle always logs it out.",
      doctor: "Onchain attending: Stone",
      publicOnly: "No signature · public data only",
      reminders: [
        "Scan the wallet, then take care of yourself too.",
        "Wallets can draw down. You do not have to tough it out forever.",
        "Looking away from the chart can be a stop-loss too.",
        "A loss is an account state, not a life verdict.",
        "Do not let one candle decide your whole day.",
        "The market will not be gentle with you, so be gentle with yourself.",
        "Sleep more, hydrate, and do not break down with the wallet.",
        "You can act tough to the market, but be honest with your mood.",
        "If today feels heavy, stepping away from the screen is allowed.",
        "Onchain data records trades. It does not define you.",
        "Wallets need risk control. People need rest.",
        "Trading can wait. Your nervous system comes first.",
        "Do not hand every feeling to price action.",
        "No profit today can still end with decent sleep.",
        "The mirror can roast. You still get to live gently.",
        "The market is always open. You do not have to stay tense forever.",
        "You are not your account balance. You are a person worth caring for.",
        "If today feels heavy, talk to someone. You do not have to carry it alone.",
        "Getting professional help when needed is courage too.",
        "Wallet losses can be reviewed. Pressure needs an outlet too.",
        "Missing a trade is not missing your life.",
        "Do not turn one bad trade into a verdict on yourself.",
        "May you make money, and may you still sleep well."
      ]
    },
    tweet: {
      title: "Copy-ready tweet",
      copy: "Copy tweet",
      copied: "Tweet copied. Public execution is now portable.",
      failed: "Copy failed. Select the text manually."
    },
    nft: {
      title: "Claim Testnet Medical NFT",
      copy: "No wallet connection, no signature, no approval. Enter a receiver address and the onchain attending sends the case file on Sepolia.",
      receiver: "NFT receiver address",
      claim: "Claim record",
      disabled: "Sample wallets can generate unlimited reports, but cannot claim testnet NFTs.",
      ready: "This case file can claim a Sepolia testnet NFT. One wallet can receive only one.",
      claiming: "Sending Sepolia medical-record NFT. Do not click twice.",
      claimed: "Medical-record NFT sent.",
      duplicate: "This wallet or X handle has already claimed a medical-record NFT.",
      invalidReceiver: "Enter a valid EVM receiver address.",
      failed: "NFT claim failed."
    },
    stats: { title: "Sample Data", portfolio: "Est. Assets", tx: "Transactions", token: "Token Sample", meme: "Meme Exposure" },
    medical: {
      title: "Onchain Stethoscope · Psych Chart (for fun)",
      copy: "This is an entertainment diagnosis of wallet behavior only, not a medical diagnosis. The onchain attending can roast the wallet; the person still deserves care."
    },
    pk: {
      title: "Wallet PK",
      copy: "You say you trade better? Drop the addresses. Degen DNA will let the wallets fight it out.",
      a: "Wallet A: 0x...",
      b: "Wallet B: 0x...",
      submit: "Start PK",
      invalid: "Enter two valid EVM wallet addresses.",
      loading: "Reading real onchain samples for both wallets...",
      failed: "PK failed."
    },
    board: {
      title: "X Handle Leaderboard",
      copy: "Add an @X handle before generating a report. Avatar, name, wallet type, report language, and composite score enter the public board. Chinese and English reports stay in their original language.",
      refresh: "Refresh board",
      teaser: "Leaderboard identity: X avatar / @handle / wallet type / report language / Degen Index / Diamond Hands / Composite Score",
      empty: "No public records yet. Add an @X handle and generate the first Degen DNA report.",
      retest: "Retest",
      diamond: "Diamond",
      composite: "Composite",
      rarity: "Rarity",
      degen: "Degen",
      airdrop: "Airdrop",
      language: "Language",
      langZh: "中文",
      langEn: "English report",
      submitted: "Added to the leaderboard.",
      submitFailed: "Leaderboard submission failed, but the report is ready.",
      loading: "Loading public leaderboard...",
      rankAria: "Leaderboard categories",
      tabComposite: "Overall Board",
      tabDegen: "Degen Board",
      tabDiamond: "Diamond Board",
      tabAirdrop: "Airdrop Board",
      tabRarity: "Rarity Board",
      tabMedical: "Psych Chart Board",
      rankSummary: "Sorted by {metric}. Chinese and English reports share the same arena.",
      metricComposite: "Composite Score",
      metricDegen: "Degen Index",
      metricDiamond: "Diamond Hands",
      metricAirdrop: "Airdrop Radar",
      metricRarity: "Personality Rarity",
      metricMedical: "Onchain Psych Score",
      lighthouseTitle: "Lighthouse Blue-V Entry",
      lighthouseCopy: "If you are a 1,000+ follower Blue-V / KOL and your wallet has been diagnosed by the Onchain Stethoscope, join Lighthouse and bring this wallet-personality experiment into a wider social graph.",
      lighthouseFollow: "Follow Lighthouse @Lighthouse_2026",
      lighthouseJoin: "Join Lighthouse"
    },
    about: {
      title: "Why I Built Degen DNA",
      kicker: "A crypto experiment built with code, absurd humor, and a way through low emotional states.",
      p1: "I am Stone, creator of DegenDNA.fun and the person behind 链上照妖镜.",
      p2: "I study AI agents, automated trading, prediction markets, and onchain data, and I use small tools to observe both markets and myself.",
      p3: "I also live with moderate depression. This site started from a simple feeling: crypto can make people anxious. Wallet PnL, candles, missed chances, top buys, and drawdowns can all amplify emotions.",
      p4: "So I wanted to build an onchain personality experiment that is absurd and sharp, but still reminds people to care for themselves.",
      p5: "It can roast your wallet, but it cannot define your life."
    },
    footer: {
      line1: "How long has it been since you looked at your wallet?",
      line2: "Maybe the better question is:",
      line3: "How long has it been since you looked at yourself with care? Please take care of yourself too."
    },
    report: {
      strategyPrefix: "",
      strategySuffix: "",
      noTokens: "No priced token sample",
      weakSample: "Public sample too thin",
      offline: "Offline"
    },
    share: {
      titlePrefix: "Degen DNA: ",
      preparing: "Creating share card...",
      imageCopied: "X composer opened. The card image is copied, paste it into the post.",
      imageDownloaded: "X composer opened. This browser cannot copy images, so the PNG was downloaded.",
      text: (report) => `My wallet just got diagnosed by the onchain attending.
Degen DNA: ${report.scores.degen}/100
Type: ${report.personality}
Rarity: ${report.rarity?.tierName || "Rare"} · combo occurrence ${report.rarity?.combo?.appearanceRate || "--"}%
Diamond Hands: ${report.scores.diamond}/100
${report.verdict}

Dare to test yours?`
    }
  }
};

const state = {
  currentReport: null,
  xProfile: null,
  unlocked: localStorage.getItem("onchainMirrorFollowUnlocked") === "1",
  lang: localStorage.getItem("onchainMirrorLang") === "en" ? "en" : "zh",
  reportMode: localStorage.getItem("onchainMirrorReportMode") || "abstract",
  activeView: "mirror",
  boardCategory: localStorage.getItem("onchainMirrorBoardCategory") || "composite"
};

const BOARD_RANKS = {
  composite: {
    labelKey: "board.metricComposite",
    score: (item) => Number(item.rankScore || 0)
  },
  degen: {
    labelKey: "board.metricDegen",
    score: (item) => Number(item.degen || 0)
  },
  diamond: {
    labelKey: "board.metricDiamond",
    score: (item) => Number(item.diamond || 0)
  },
  airdrop: {
    labelKey: "board.metricAirdrop",
    score: (item) => Number(item.airdrop || 0)
  },
  rarity: {
    labelKey: "board.metricRarity",
    score: (item) => Number(item.rarity?.score || 0)
  },
  medical: {
    labelKey: "board.metricMedical",
    score: (item) => {
      const degen = Number(item.degen || 0);
      const rarity = Number(item.rarity?.score || 0);
      const paper = 100 - Number(item.diamond || 0);
      return Number((degen * 0.42 + rarity * 0.38 + paper * 0.2).toFixed(2));
    }
  }
};

const RANDOM_SAMPLES = [
  "0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872",
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67"
];

const MENTAL_SCALE_LABELS = {
  well: ["完全没有", "偶尔", "少于一半时间", "超过一半时间", "大部分时间", "一直如此"],
  symptom: ["完全没有", "几天", "超过一半天数", "几乎每天"],
  stress: ["从不", "偶尔", "经常", "几乎总是"]
};

const MENTAL_TESTS = {
  quick: {
    title: "快速心理体检",
    copy: "3 分钟看见最近的整体状态。结果只用于自我了解，不会上传或公开。",
    range: "过去两周到一个月",
    time: "预计用时：3 分钟",
    scale: "stress",
    items: [
      "我最近经常觉得情绪低落、提不起兴趣，或者对很多事没感觉。",
      "我最近经常紧张、担心、坐立不安，脑子很难停下来。",
      "我最近睡眠明显变差，入睡、夜醒、早醒或醒来疲惫。",
      "我最近觉得压力过载，很难真正放松。",
      "行情、亏损、错过机会或社交比较明显影响了我的心情。"
    ],
    result: (score) => {
      if (score <= 3) return mentalResult("状态相对平稳", "你的回答提示近期压力和情绪困扰较低。继续保持休息、社交和基本生活节律。", "如果之后连续几天状态下滑，可以再回来复测。");
      if (score <= 7) return mentalResult("轻度关注", "你最近可能已经有一些疲惫、紧张或睡眠被打扰的信号。", "建议先减少熬夜和高频看盘，给自己安排一点可恢复的时间。");
      if (score <= 11) return mentalResult("建议认真关注", "你的近期状态提示压力或情绪困扰已经比较明显，可能影响休息、工作、学习或交易判断。", "建议做完整量表，并考虑和信任的人聊聊。如果持续两周以上，建议寻求专业帮助。");
      return mentalResult("建议寻求更多支持", "你的回答提示近期状态可能已经处在高压区间。", "请优先保证睡眠和安全，减少独自硬扛。可以联系可信任的人，也可以考虑心理咨询、精神科或当地心理健康服务。");
    }
  },
  who5: {
    title: "WHO-5 幸福感量表",
    copy: "观察最近两周的积极感受和心理幸福感。分数越高，幸福感越好。",
    range: "过去两周",
    time: "预计用时：1 分钟",
    scale: "well",
    items: [
      "我感到快乐、心情愉快。",
      "我感到平静、放松。",
      "我感到精力充沛、充满活力。",
      "我醒来时感到清新、休息充分。",
      "我的日常生活中有让我感兴趣的事情。"
    ],
    result: (score) => {
      if (score >= 18) return mentalResult("幸福感较好", "你的回答提示最近两周仍有较稳定的积极感受。", "继续保留让你恢复的事情，比如睡眠、运动、朋友、日常节律。");
      if (score >= 13) return mentalResult("需要一点照顾", "你的幸福感处于中间区间，可能有些累，但还没有明显掉到底。", "可以观察一周，主动减少熬夜和刺激源，安排能让你恢复的小事。");
      return mentalResult("建议认真关注", "你的 WHO-5 分数偏低，提示近期心理幸福感可能不足。", "如果低落、疲惫或兴趣下降持续影响生活，建议做 PHQ-9 或寻求专业支持。");
    }
  },
  phq9: {
    title: "情绪低落 PHQ-9",
    copy: "观察最近两周抑郁相关困扰。结果不是诊断，只是提示是否需要更多关注。",
    range: "过去两周",
    time: "预计用时：2 分钟",
    scale: "symptom",
    safetyIndex: 8,
    items: [
      "做事时提不起兴趣或没有乐趣。",
      "感到心情低落、沮丧或绝望。",
      "入睡困难、睡不安稳，或睡得太多。",
      "感到疲倦或没有精力。",
      "食欲不振或吃得过多。",
      "觉得自己很糟，或觉得自己让自己/家人失望。",
      "难以集中注意力，例如看东西或做事时走神。",
      "动作或说话慢到别人能注意到，或相反，烦躁到坐立不安。",
      "出现过不如死了好，或以某种方式伤害自己的想法。"
    ],
    result: (score, answers) => {
      if (answers[8] > 0) return mentalResult("先保证安全", "你在自伤相关问题上选择了非零答案。此时最重要的不是继续看分数，而是先确认你现在是安全的。", "请尽量不要一个人待着，联系可信任的人。如果你已经有具体计划、工具或强烈冲动，请立刻联系当地紧急服务或去最近的急诊。", true);
      if (score <= 4) return mentalResult("低困扰区间", "你的回答提示近期抑郁相关困扰较低。", "保持观察即可。状态会波动，分数不是你这个人的评价。");
      if (score <= 9) return mentalResult("轻度困扰", "你最近可能有一些低落、疲惫、兴趣下降或自我否定感。", "建议先照顾睡眠、减少熬夜，并观察是否持续两周以上。");
      if (score <= 14) return mentalResult("中等困扰", "你的分数提示近期抑郁相关困扰较明显，可能已经影响睡眠、工作、学习、人际关系或交易判断。", "建议认真关注，并考虑联系心理咨询师、精神科医生或当地心理健康服务。");
      return mentalResult("较高困扰", "你的回答提示近期情绪困扰偏高，可能不适合继续独自硬扛。", "建议尽快寻求专业帮助，并告诉一个可信任的人你最近的真实状态。");
    }
  },
  gad7: {
    title: "焦虑紧张 GAD-7",
    copy: "观察最近两周紧张、担心、坐立不安和难以放松等状态。",
    range: "过去两周",
    time: "预计用时：2 分钟",
    scale: "symptom",
    items: [
      "感到紧张、焦虑或急切。",
      "不能停止或控制担心。",
      "对各种事情担心得太多。",
      "很难放松下来。",
      "坐立不安，难以安静待着。",
      "变得容易烦躁或易怒。",
      "感到害怕，好像可怕的事情要发生。"
    ],
    result: (score) => {
      if (score <= 4) return mentalResult("焦虑水平较低", "你的回答提示近期焦虑困扰较低。", "继续保持基本节律，尤其是睡眠和屏幕使用边界。");
      if (score <= 9) return mentalResult("轻度焦虑信号", "你最近可能有一些担心、紧张或难以放松。", "可以先减少高刺激信息流，给大脑一点恢复时间。");
      if (score <= 14) return mentalResult("中度焦虑信号", "你的分数提示近期焦虑相关困扰较明显。", "如果已经影响睡眠、工作、学习或交易判断，建议考虑进一步评估或专业帮助。");
      return mentalResult("较高焦虑信号", "你最近可能处在比较高的紧张和担心状态。", "建议尽快寻求专业支持，尤其当焦虑伴随失眠、惊恐、明显回避或身体不适时。");
    }
  },
  sleep: {
    title: "睡眠自测",
    copy: "观察睡眠质量、熬夜看盘和白天疲惫。不是标准诊断量表。",
    range: "最近两周",
    time: "预计用时：2 分钟",
    scale: "symptom",
    items: [
      "入睡困难，躺下后很久睡不着。",
      "夜里醒来，或醒后很难再次入睡。",
      "早醒，醒来后觉得疲惫。",
      "睡前或半夜会刷盘、看行情或查看钱包。",
      "睡眠影响了白天精神、工作或学习。",
      "因为行情提醒、群消息或交易软件打断睡眠。"
    ],
    result: (score) => {
      if (score <= 5) return mentalResult("睡眠相对稳定", "你的睡眠困扰暂时不高。", "继续保持睡前边界，别让行情把夜晚占满。");
      if (score <= 10) return mentalResult("睡眠需要关注", "你最近可能已经被入睡、夜醒或看盘习惯影响。", "建议睡前 30 分钟不看盘，把价格提醒改成关键价位提醒。");
      return mentalResult("睡眠困扰明显", "你的回答提示睡眠已经明显受影响。", "如果连续两周严重失眠、白天功能受损，建议考虑专业帮助。");
    }
  },
  stress: {
    title: "压力与内耗",
    copy: "观察最近一个月失控感、反刍、比较和压力过载。不是标准诊断量表。",
    range: "最近一个月",
    time: "预计用时：2 分钟",
    scale: "stress",
    items: [
      "我觉得很多事情失控，自己很难掌握节奏。",
      "我总在复盘、后悔、比较，脑子很难停下来。",
      "我觉得自己很难真正放松。",
      "亏损、回撤、错过机会会反复占据我的注意力。",
      "我会因为别人的盈利截图或社交比较而焦虑。",
      "我经常明明很累，却仍然逼自己继续盯盘或工作。"
    ],
    result: (score) => {
      if (score <= 5) return mentalResult("压力可控", "你的回答提示压力暂时处在较可控区间。", "继续保留恢复性活动，不要只靠意志力硬撑。");
      if (score <= 11) return mentalResult("中等内耗", "你最近可能有较多复盘、担心、比较或压力过载。", "建议减少高频信息源，给自己设置固定离屏时间。");
      return mentalResult("高压状态", "你的回答提示压力和内耗已经较明显。", "如果已经影响睡眠、人际或日常功能，建议和可信任的人聊聊，并考虑专业支持。");
    }
  },
  trading: {
    title: "交易心理自查",
    copy: "观察交易行为和情绪关系。它不是医学诊断，也不是投资建议。",
    range: "最近一个月",
    time: "预计用时：2 分钟",
    scale: "stress",
    items: [
      "我容易因为 FOMO 冲动下单。",
      "亏损后我会强烈自责，觉得自己很没用。",
      "盈利后我会兴奋过度，风险控制变松。",
      "我会用交易、刷盘或研究项目来逃避现实压力。",
      "连续亏损后，我会想通过更大仓位快速扳回来。",
      "我的钱包余额会明显影响自我评价。",
      "我会因为错过机会反复内耗。",
      "我知道自己该休息，但还是停不下来。"
    ],
    result: (score) => {
      if (score <= 6) return mentalResult("相对稳定型", "你的交易情绪牵引暂时不高。", "保持风险边界，别让市场挤掉生活。");
      if (score <= 13) return mentalResult("行情牵引型", "行情、盈亏或社交比较可能已经在影响你的情绪。", "建议把交易决策和情绪状态分开记录，疲惫时不做大决策。");
      if (score <= 18) return mentalResult("中度交易内耗", "你的回答提示交易和情绪之间已经有较强绑定。", "建议设置暂停交易规则，例如睡眠不足、连续亏损、强烈 FOMO 时不下单。");
      return mentalResult("高压交易状态", "你可能正在用交易承受或转移很大的压力。", "建议暂停高风险操作，先恢复睡眠和安全感。必要时寻求专业支持。");
    }
  },
  support: {
    title: "风险支持",
    copy: "如果你现在感觉撑不住，这里只做一件事：先帮助你保证安全。",
    range: "现在",
    time: "先不要计时",
    scale: "stress",
    items: [
      "我现在不想一个人待着。",
      "我担心自己可能会伤害自己。",
      "我需要立刻联系一个可信任的人。",
      "我需要离开交易界面，先把自己稳住。"
    ],
    result: () => mentalResult("请先保证安全", "你现在最重要的事情不是继续测分数，而是先保证自己安全。", "请尽量不要一个人待着。联系一个可信任的人，让 TA 现在陪你。如果你已经有具体计划、工具或强烈冲动，请立刻联系当地紧急服务或去最近的急诊。", true)
  }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function ownedBoardKey(username, address) {
  const user = String(username || "").replace(/^@/, "").toLowerCase();
  const wallet = String(address || "").toLowerCase();
  return user && wallet ? `degendna:own:${user}:${wallet}` : "";
}

function markOwnedBoardItem(username, address) {
  const key = ownedBoardKey(username, address);
  if (key) localStorage.setItem(key, "1");
}

function isOwnedBoardItem(item = {}) {
  return localStorage.getItem(ownedBoardKey(item.username || item.handle, item.address)) === "1";
}

const form = $("#scan-form");
const addressInput = $("#wallet-address");
const xInput = $("#x-username");
const statusLine = $("#status");
const reportView = $("#report-view");
const followGate = $("#follow-gate");

function getText(lang, key) {
  return key.split(".").reduce((obj, part) => obj?.[part], I18N[lang]) ?? key;
}

function t(key) {
  return getText(state.lang, key);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value) {
  return String(value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyLanguage() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("meta.title");
  document.querySelector("meta[name='description']")?.setAttribute("content", t("meta.description"));
  document.body.dataset.lang = state.lang;
  document.body.dataset.lockText = t("gate.lockText");

  $$("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  $$("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  $$("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  });
  $$("[data-i18n-alt]").forEach((node) => {
    node.setAttribute("alt", t(node.dataset.i18nAlt));
  });
  $$("[data-lang-option]").forEach((node) => {
    node.classList.toggle("active", node.dataset.langOption === state.lang);
  });
  $("#language-toggle").setAttribute("aria-label", state.lang === "zh" ? "Switch to English" : "切换到中文");
  if (!state.currentReport) {
    text("#card-personality", `${t("card.personalityPrefix")}${state.lang === "zh" ? "钱包人格" : "Wallet Type"}`);
    text("#card-verdict", t("card.defaultVerdict"));
    const tweetText = $("#tweet-text");
    if (tweetText) tweetText.value = "";
  } else {
    renderModeContent(state.currentReport);
  }
}

function setStatus(message, tone = "info") {
  statusLine.hidden = false;
  statusLine.textContent = message;
  statusLine.dataset.tone = tone;
}

function clearStatus() {
  statusLine.hidden = true;
  statusLine.textContent = "";
}

function renderGate() {
  document.body.classList.toggle("is-locked", !state.unlocked);
  followGate.classList.toggle("unlocked", state.unlocked);
  $("#unlock-follow").textContent = state.unlocked ? t("gate.unlocked") : t("gate.unlock");
  $("#unlock-follow").disabled = state.unlocked;
  form.querySelector("button[type='submit']").disabled = !state.unlocked;
  $("#pk-form").querySelector("button[type='submit']").disabled = !state.unlocked;
  $("#form-note").textContent = state.unlocked ? t("form.unlockedNote") : t("form.lockedNote");
}

function requireUnlocked() {
  if (state.unlocked) return true;
  setStatus(t("form.mustFollow"), "error");
  followGate.scrollIntoView({ behavior: "smooth", block: "center" });
  return false;
}

function setActiveView(view, { scroll = true } = {}) {
  const next = ["mirror", "pk", "board", "mental", "about"].includes(view) ? view : "mirror";
  state.activeView = next;
  $$("[data-view-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== next;
    panel.classList.toggle("active", panel.dataset.viewPanel === next);
  });
  $$("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === next);
  });
  if (next === "board") renderLeaderboard();
  if (next === "mental") renderMentalCenter();
  if (scroll) {
    const target = $(`[data-view-panel="${next}"]`) || document.body;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
}

function normalizeXUsername(value) {
  const username = String(value || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  return /^[A-Za-z0-9_]{1,15}$/.test(username) ? username : "";
}

function shortHash(hash) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function fmtUsd(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "$0";
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  if (num >= 1) return `$${num.toFixed(2)}`;
  return `$${num.toPrecision(2)}`;
}

function text(id, value) {
  const node = $(id);
  if (node) node.textContent = value;
}

function setMeter(id, value) {
  const node = $(id);
  if (node) node.style.width = `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

function renderList(node, items, renderer) {
  node.innerHTML = "";
  for (const [index, item] of items.entries()) {
    node.insertAdjacentHTML("beforeend", renderer(item, index));
  }
}

async function analyze(address) {
  const response = await fetch(`/api/analyze?address=${encodeURIComponent(address)}&lang=${state.lang}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || t("form.failed"));
  return payload;
}

async function fetchXProfile(username) {
  const response = await fetch(`/api/x-profile?username=${encodeURIComponent(username)}&lang=${state.lang}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || t("form.invalidX"));
  return payload;
}

async function saveToLeaderboard(report) {
  if (!report.xProfile?.username) {
    await renderLeaderboard();
    return;
  }

  const response = await fetch(`/api/leaderboard?lang=${state.lang}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: report.address,
      username: report.xProfile.username,
      lang: state.lang
    })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || t("board.submitFailed"));
  markOwnedBoardItem(report.xProfile.username, report.address);
  await renderLeaderboard(payload.entries);
}

async function renderLeaderboard(providedItems = null) {
  const board = $("#leaderboard-list");
  let items = providedItems;
  if (!BOARD_RANKS[state.boardCategory]) {
    state.boardCategory = "composite";
  }
  updateBoardRankButtons();
  if (!items) {
    board.innerHTML = `<div class="empty">${escapeHtml(t("board.loading"))}</div>`;
    try {
      const response = await fetch("/api/leaderboard");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("form.failed"));
      items = payload.entries || [];
    } catch {
      items = [];
    }
  }
  if (!items.length) {
    board.innerHTML = `<div class="empty">${escapeHtml(t("board.empty"))}</div>`;
    return;
  }

  const rankConfig = BOARD_RANKS[state.boardCategory] || BOARD_RANKS.composite;
  const metricName = t(rankConfig.labelKey);
  const sortedItems = items
    .slice()
    .sort((a, b) =>
      rankConfig.score(b) - rankConfig.score(a) ||
      Number(b.rankScore || 0) - Number(a.rankScore || 0) ||
      Number(b.rarity?.score || 0) - Number(a.rarity?.score || 0) ||
      String(b.generatedAt || "").localeCompare(String(a.generatedAt || ""))
    )
    .slice(0, 30);

  board.innerHTML = `
    <div class="board-summary">${escapeHtml(t("board.rankSummary").replace("{metric}", metricName))}</div>
    ${sortedItems.map((item, index) => renderBoardRow(item, index, rankConfig, metricName)).join("")}
  `;
}

function updateBoardRankButtons() {
  $$("[data-board-rank]").forEach((button) => {
    button.classList.toggle("active", button.dataset.boardRank === state.boardCategory);
  });
}

function boardLanguageLabel(item) {
  return item.language === "en" ? t("board.langEn") : t("board.langZh");
}

function renderBoardRow(item, index, rankConfig, metricName) {
  const rarity = item.rarity || {};
  const badges = item.badges || [];
  const badgeText = badges.slice(0, 3).map((badge) => badge.name).join(" / ");
  const profileUrl = item.profileUrl || `https://x.com/${encodeURIComponent(String(item.username || item.handle || "").replace(/^@/, ""))}`;
  const displayName = formatXName(item);
  const scoreValue = rankConfig.score(item);
  return `
      <div class="board-row" data-rarity="${escapeHtml(rarity.tier || "common")}">
        <div class="board-rank">#${index + 1}</div>
        <a class="board-user" href="${escapeHtml(profileUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(item.handle || item.name || "X user")} on X">
          <img src="${escapeHtml(item.avatarUrl || "/assets/stone-avatar.png")}" alt="${escapeHtml(item.handle || "@X")}" referrerpolicy="no-referrer" />
          <div>
            <b>${escapeHtml(displayName)} · ${escapeHtml(item.personality)}</b>
            <small>
              <span class="board-lang">${escapeHtml(boardLanguageLabel(item))}</span>
              ${escapeHtml(item.shortAddress)}
              · ${escapeHtml(metricName)} ${scoreValue.toFixed(2)}/100
              · ${escapeHtml(t("board.composite"))} ${Number(item.rankScore || 0).toFixed(2)}/100
              · ${escapeHtml(t("board.rarity"))} ${escapeHtml(rarity.tierName || "--")}
              ${badgeText ? ` · ${escapeHtml(badgeText)}` : ""}
            </small>
          </div>
        </a>
        ${isOwnedBoardItem(item) ? `<button class="ghost-button" type="button" data-board-address="${escapeHtml(item.address)}" data-board-x="${escapeHtml(item.handle || item.username || "")}">${escapeHtml(t("board.retest"))}</button>` : ""}
      </div>
    `;
}

function modeReport(report = state.currentReport) {
  if (!report) return null;
  const modes = report.modes || {};
  if (!modes[state.reportMode]) {
    state.reportMode = modes[report.defaultMode] ? report.defaultMode : Object.keys(modes)[0] || "abstract";
    localStorage.setItem("onchainMirrorReportMode", state.reportMode);
  }
  return modes[state.reportMode] || report.report;
}

function updateModeButtons() {
  $$("[data-report-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.reportMode === state.reportMode);
  });
}

function renderModeContent(report = state.currentReport) {
  const selected = modeReport(report);
  if (!selected) return;
  updateModeButtons();
  text("#verdict", selected.verdict || report.verdict);
  text("#asset-personality", selected.assetPersonality);
  text("#loss-black-box", selected.lossBlackBox);
  text("#holding-behavior", selected.holdingBehavior);
  text("#strategy-fit", `${t("report.strategyPrefix")}${selected.strategyFit}${t("report.strategySuffix")}`);
  renderList($("#alpha-list"), selected.alphaRadar || [], (item) => `<li>${escapeHtml(item)}</li>`);
  renderList($("#fate-list"), selected.fate90Days || [], (item) => `<li>${escapeHtml(item)}</li>`);

  text("#card-loss-cause", selected.lossCause || report.lossCause);
  text("#card-verdict", selected.verdict || report.verdict);
  const tweetText = $("#tweet-text");
  if (tweetText) tweetText.value = selected.tweetText || buildShareText(report);
}

function identityForReport(report = state.currentReport) {
  return report?.xProfile || {
    handle: STONE_X_HANDLE,
    name: "Stone",
    avatarUrl: STONE_AVATAR_URL
  };
}

function formatXName(identity = {}) {
  const name = identity.name || identity.username || String(identity.handle || "@X").replace(/^@/, "");
  const handle = identity.handle || (identity.username ? `@${identity.username}` : "");
  return handle && name !== handle ? `${name} · ${handle}` : name || handle || "@X";
}

function comboRarityDetail(rarity = {}) {
  const textValue = rarity.combo?.text || "";
  const tierName = rarity.combo?.tierName || "";
  if (!textValue) return "";
  return textValue
    .replace(new RegExp(`^${escapeRegExp(tierName)}\\s*(组合|combo)?\\s*[·:：-]\\s*`, "i"), "")
    .replace(/^(组合|combo)\s*[·:：-]\s*/i, "");
}

function cardRarityLabel(rarity = {}, lang = state.lang) {
  const rate = rarity.combo?.appearanceRate;
  const rateText = rate === undefined || rate === null || rate === "" ? "" : ` · ${lang === "zh" ? "组合出现率" : "combo rate"} ${rate}%`;
  return `${rarity.tierName || "--"}${rateText}`;
}

function recordIdForReport(report = state.currentReport) {
  const seed = hashString(`${report?.address || ""}:${report?.personalityId || ""}:${report?.rarity?.tier || ""}`);
  const serial = String((seed % 9999) + 1).padStart(4, "0");
  return `DDNA-CLINIC-S0-${serial}`;
}

function diagnosisLineForReport(report = state.currentReport) {
  if (!report) return "Onchain Clinic Case";
  if (report.language === "en") return report.personality || "Onchain Clinic Case";
  const tier = report.rarity?.tier || "common";
  return {
    common: "Onchain Civil Servant",
    uncommon: "Stablecoin Meditator",
    rare: "Airdrop Migratory Bird",
    epic: "Onchain Adaptation Disorder",
    legendary: "Cycle Survivor",
    mythic: "Contract Sleepwalker",
    unique: "Onchain Anomaly"
  }[tier] || "Onchain Clinic Case";
}

function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value || "")) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function careNoteForReport(report = state.currentReport) {
  const reminders = getText(state.lang, "card.reminders");
  const pool = Array.isArray(reminders) && reminders.length ? reminders : ["照完钱包，也记得照顾好自己。"];
  const key = `${report?.address || ""}:${report?.personalityId || ""}:${report?.rarity?.tier || ""}`;
  return pool[hashString(key) % pool.length];
}

function renderXIdentity(report = state.currentReport) {
  const profile = report?.xProfile || null;
  const pill = $("#x-profile-pill");
  if (pill) pill.hidden = !profile;
  if (profile) {
    $("#x-profile-avatar").src = profile.avatarUrl;
    $("#x-profile-avatar").alt = profile.handle;
    text("#x-profile-name", `${profile.name || profile.handle} · ${profile.handle}`);
  }

  const identity = identityForReport(report);
  $("#card-owner-avatar").src = identity.avatarUrl;
  $("#card-owner-avatar").alt = identity.handle || "@X";
  text("#card-owner-name", formatXName(identity));
}

function renderRarity(report = state.currentReport) {
  const rarity = report?.rarity || {};
  const badges = report?.badges || [];
  text("#rarity-tier", `${rarity.personality?.tierName || "--"} · ${report?.personality || ""}`);
  text("#rarity-detail", rarity.personality?.text || "");
  text("#combo-rarity", rarity.combo?.tierName || "--");
  text("#combo-detail", comboRarityDetail(rarity));
  text(
    "#rarity-season",
    `${rarity.season?.name || "DegenDNA Season 0"} · ${t("rarity.seasonPrefix")} ${rarity.season?.sampleSize ?? 0} ${t("rarity.rankedWallets")}`
  );
  const badgeList = $("#badge-list");
  if (badgeList) {
    badgeList.innerHTML = badges.map((badge) => `
      <span class="badge-chip" title="${escapeHtml(badge.description || "")}">
        ${escapeHtml(badge.name)}
        <small>${escapeHtml(badge.tierName || "")} · ${escapeHtml(badge.appearanceRate ?? "--")}%</small>
      </span>
    `).join("");
  }

  const shareCard = $("#share-card");
  if (shareCard) shareCard.dataset.rarity = rarity.tier || "common";
  text("#card-record-id", recordIdForReport(report));
  text("#card-diagnosis-en", diagnosisLineForReport(report));
  text("#card-rarity", cardRarityLabel(rarity));
  text("#card-rarity-detail", comboRarityDetail(rarity));
  text("#card-care-note", careNoteForReport(report));
  const mystic = $("#card-mystic");
  if (mystic) {
    mystic.innerHTML = (rarity.mystic || [])
      .slice(0, 4)
      .map((item) => `<span title="${escapeHtml(item.label || "")}: ${escapeHtml(item.value || "")}">${escapeHtml(item.value || "")}</span>`)
      .join("");
  }
}

function renderNftClaimPanel(report = state.currentReport) {
  const panel = $("#nft-claim-panel");
  if (!panel) return;
  panel.hidden = !report;
  const status = $("#nft-claim-status");
  const input = $("#nft-receiver");
  const button = $("#nft-claim-button");
  if (!report) return;
  if (input && !input.value) input.value = report.address || "";
  const eligible = report.nftEligible !== false;
  panel.classList.toggle("is-disabled", !eligible);
  if (button) button.disabled = !eligible;
  if (status) {
    status.textContent = eligible
      ? t("nft.ready")
      : report.nftIneligibleReason || t("nft.disabled");
    status.dataset.tone = eligible ? "info" : "error";
  }
}

function renderReport(report) {
  state.currentReport = report;
  if (report.defaultMode && !report.modes?.[state.reportMode]) {
    state.reportMode = report.defaultMode;
  }
  reportView.hidden = false;

  const locale = state.lang === "zh" ? "zh-CN" : "en-US";
  text("#report-address", `${report.shortAddress} · ${new Date(report.generatedAt).toLocaleString(locale)}`);
  text("#personality", report.personality);
  text("#degen-band", report.degenBand);
  text("#degen-score", `${report.scores.degen}/100`);
  text("#diamond-score", `${report.scores.diamond}/100`);
  text("#airdrop-score", `${report.scores.airdrop}/100`);
  setMeter("#degen-meter", report.scores.degen);
  setMeter("#diamond-meter", report.scores.diamond);
  setMeter("#airdrop-meter", report.scores.airdrop);

  $("#label-list").innerHTML = report.labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("");

  renderList(
    $("#chain-list"),
    report.chains,
    (chain) => `
      <div class="chain-row">
        <div>
          <b>${escapeHtml(chain.name)}</b>
          <small>${chain.ok ? `${chain.txCount} tx · ${chain.tokenTransferCount} token transfers · ${escapeHtml(chain.source)}` : escapeHtml((chain.errors || []).join(" / "))}</small>
        </div>
        <span class="chain-pill" style="border-color:${escapeHtml(chain.color)};color:${escapeHtml(chain.color)}">
          ${chain.ok ? `${Number(chain.nativeBalance || 0).toFixed(4)} ${escapeHtml(chain.nativeSymbol)}` : escapeHtml(t("report.offline"))}
        </span>
      </div>
    `
  );

  const fallbackToken = { symbol: t("report.noTokens"), name: t("report.weakSample"), usd: 0 };
  renderList(
    $("#token-list"),
    report.metrics.topTokens.length ? report.metrics.topTokens : [fallbackToken],
    (token) => `
      <div class="token-row">
        <div>
          <b>${escapeHtml(token.symbol)} ${token.isMeme ? "· Meme" : token.isStable ? "· Stable" : token.isBluechip ? "· Bluechip" : ""}</b>
          <small>${escapeHtml(token.name || token.chain || "")}${token.holders ? ` · holders ${token.holders}` : ""}</small>
        </div>
        <strong>${fmtUsd(token.usd)}</strong>
      </div>
    `
  );

  text("#card-address", report.shortAddress);
  text("#card-personality", `${t("card.personalityPrefix")}${report.personality}`);
  renderRarity(report);
  text("#card-degen", `${report.scores.degen}/100`);
  text("#card-diamond", `${report.scores.diamond}/100`);
  $("#card-tags").innerHTML = (report.badges?.length ? report.badges : report.labels)
    .slice(0, 4)
    .map((item) => `<span>${escapeHtml(item.name || item)}</span>`)
    .join("");
  renderXIdentity(report);

  text("#stat-portfolio", report.metrics.portfolioUsdText);
  text("#stat-tx", `${report.metrics.txCount}`);
  text("#stat-token", `${report.metrics.uniqueTokenCount}`);
  text("#stat-meme", `${Math.round(report.metrics.memeRatio * 100)}%`);

  renderModeContent(report);
  renderNftClaimPanel(report);
  saveToLeaderboard(report)
    .then(() => {
      if (report.xProfile) {
        setStatus(t("board.submitted"));
        setTimeout(clearStatus, 1800);
      }
    })
    .catch((error) => {
      setStatus(error.message || t("board.submitFailed"), "error");
      setTimeout(clearStatus, 2400);
    });
  reportView.scrollIntoView({ block: "start", behavior: "smooth" });
}

function finishReportStatus(report) {
  if (report?.degraded) {
    setStatus(
      state.lang === "zh"
        ? "部分链上数据源暂时拥堵，本次报告为降级版。"
        : "Some onchain sources are congested, so this report is in degraded mode."
    );
    setTimeout(clearStatus, 3200);
    return;
  }
  clearStatus();
}

function mentalResult(title, body, next, urgent = false) {
  return { title, body, next, urgent };
}

function activeMentalTestKey() {
  return document.querySelector("[data-mental-test].active")?.dataset.mentalTest || "quick";
}

function renderMentalCenter(testKey = activeMentalTestKey()) {
  const test = MENTAL_TESTS[testKey] || MENTAL_TESTS.quick;
  const formNode = $("#mental-form");
  if (!formNode) return;
  $$("[data-mental-test]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mentalTest === testKey);
  });
  text("#mental-test-title", test.title);
  text("#mental-test-copy", test.copy);
  text("#mental-test-range", test.range);
  text("#mental-test-time", test.time);
  const labels = MENTAL_SCALE_LABELS[test.scale] || MENTAL_SCALE_LABELS.symptom;
  formNode.innerHTML = test.items.map((item, index) => `
    <fieldset class="mental-question">
      <legend>${escapeHtml(index + 1)}. ${escapeHtml(item)}</legend>
      <div class="mental-options">
        ${labels.map((label, value) => `
          <label>
            <input type="radio" name="q${index}" value="${value}" ${value === 0 ? "checked" : ""} />
            <span>${escapeHtml(label)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("");
  const result = $("#mental-result");
  if (result) {
    result.hidden = true;
    result.innerHTML = "";
  }
  const save = $("#mental-save");
  if (save) save.disabled = true;
}

function readMentalAnswers(test) {
  return test.items.map((_, index) => Number(document.querySelector(`input[name="q${index}"]:checked`)?.value || 0));
}

function calculateMentalResult(testKey = activeMentalTestKey()) {
  const test = MENTAL_TESTS[testKey] || MENTAL_TESTS.quick;
  const answers = readMentalAnswers(test);
  const score = answers.reduce((sum, value) => sum + value, 0);
  const result = test.result(score, answers);
  return { testKey, test, answers, score, result, createdAt: new Date().toISOString() };
}

function renderMentalResult(payload = calculateMentalResult()) {
  const resultNode = $("#mental-result");
  if (!resultNode) return payload;
  const maxScore = payload.test.scale === "well"
    ? payload.test.items.length * 5
    : payload.test.items.length * 3;
  resultNode.hidden = false;
  resultNode.dataset.urgent = payload.result.urgent ? "true" : "false";
  resultNode.innerHTML = `
    <span>${escapeHtml(payload.test.title)} · ${escapeHtml(payload.test.range)}</span>
    <h3>${escapeHtml(payload.result.title)}</h3>
    <p>${escapeHtml(payload.result.body)}</p>
    <p>${escapeHtml(payload.result.next)}</p>
    <div class="mental-score-line">
      <b>${payload.score}</b>
      <small>/ ${maxScore}</small>
    </div>
    <p class="mental-result-note">这个分数不是你这个人的评价。它只是在提醒你，最近可能真的有点累了。</p>
  `;
  const save = $("#mental-save");
  if (save) save.disabled = false;
  if (payload.result.urgent) {
    $("#mental-support")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  state.lastMentalResult = payload;
  return payload;
}

function saveMentalResult() {
  const payload = state.lastMentalResult || calculateMentalResult();
  const existing = JSON.parse(localStorage.getItem("degenDnaMentalRecords") || "[]");
  existing.unshift({
    testKey: payload.testKey,
    title: payload.test.title,
    score: payload.score,
    result: payload.result.title,
    createdAt: payload.createdAt
  });
  localStorage.setItem("degenDnaMentalRecords", JSON.stringify(existing.slice(0, 20)));
  setStatus("已保存到本地浏览器。不会上传，也不会和钱包报告绑定。");
  setTimeout(clearStatus, 2400);
}

function clearMentalRecords() {
  localStorage.removeItem("degenDnaMentalRecords");
  state.lastMentalResult = null;
  setStatus("本地自测记录已清除。");
  setTimeout(clearStatus, 1800);
}

async function handleScan(event) {
  event.preventDefault();
  if (!requireUnlocked()) return;
  const address = addressInput.value.trim();
  if (!isAddress(address)) {
    setStatus(t("form.invalid"), "error");
    return;
  }
  const rawX = xInput.value.trim();
  const username = normalizeXUsername(rawX);
  if (rawX && !username) {
    setStatus(t("form.invalidX"), "error");
    return;
  }

  setStatus(username ? t("form.loadingProfile") : t("form.loading"));
  form.querySelector("button[type='submit']").disabled = true;
  try {
    const profile = username ? await fetchXProfile(username) : null;
    state.xProfile = profile;
    setStatus(t("form.loading"));
    const report = await analyze(address);
    report.xProfile = profile;
    setActiveView("mirror", { scroll: false });
    renderReport(report);
    finishReportStatus(report);
  } catch (error) {
    setStatus(error.message || t("form.failed"), "error");
  } finally {
    form.querySelector("button[type='submit']").disabled = false;
  }
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function textUnits(value) {
  const textValue = String(value);
  if (/[\u3400-\u9fff]/.test(textValue)) return [...textValue];
  return textValue.split(/(\s+)/).filter(Boolean);
}

function drawWrappedText(ctx, textValue, x, y, maxWidth, lineHeight, maxLines = 4) {
  const units = textUnits(textValue);
  let line = "";
  let lines = 0;
  for (const unit of units) {
    const test = line + unit;
    if (ctx.measureText(test).width > maxWidth && line.trim()) {
      ctx.fillText(line.trimEnd(), x, y);
      y += lineHeight;
      lines += 1;
      line = unit.trimStart();
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line.trimEnd(), x, y);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function rarityColorValue(tier) {
  return rarityThemeValue(tier).accent;
}

function rarityThemeValue(tier) {
  return {
    common: {
      accent: "#d8d3ca",
      secondary: "#8f887e",
      bg: ["#171512", "#0b0a08", "#201a14"],
      grid: "rgba(216,211,202,0.055)",
      panel: "rgba(255,255,255,0.055)",
      chip: "rgba(216,211,202,0.10)",
      chipBorder: "rgba(216,211,202,0.30)",
      quote: "#d8d3ca",
      foil: "rgba(255,255,255,0.045)"
    },
    uncommon: {
      accent: "#7dff9f",
      secondary: "#28d17a",
      bg: ["#071b12", "#060b08", "#122516"],
      grid: "rgba(125,255,159,0.07)",
      panel: "rgba(125,255,159,0.075)",
      chip: "rgba(125,255,159,0.12)",
      chipBorder: "rgba(125,255,159,0.38)",
      quote: "#7dff9f",
      foil: "rgba(125,255,159,0.055)"
    },
    rare: {
      accent: "#64b5ff",
      secondary: "#4ce0ff",
      bg: ["#071527", "#05070c", "#101f34"],
      grid: "rgba(100,181,255,0.08)",
      panel: "rgba(100,181,255,0.085)",
      chip: "rgba(100,181,255,0.13)",
      chipBorder: "rgba(100,181,255,0.42)",
      quote: "#64b5ff",
      foil: "rgba(76,224,255,0.06)"
    },
    epic: {
      accent: "#c27bff",
      secondary: "#ff7adf",
      bg: ["#201039", "#080611", "#2a1438"],
      grid: "rgba(194,123,255,0.09)",
      panel: "rgba(194,123,255,0.10)",
      chip: "rgba(194,123,255,0.14)",
      chipBorder: "rgba(255,122,223,0.45)",
      quote: "#ff7adf",
      foil: "rgba(194,123,255,0.075)"
    },
    legendary: {
      accent: "#ffd166",
      secondary: "#ff9f1c",
      bg: ["#2a1b06", "#090705", "#34250c"],
      grid: "rgba(255,209,102,0.10)",
      panel: "rgba(255,209,102,0.11)",
      chip: "rgba(255,209,102,0.15)",
      chipBorder: "rgba(255,209,102,0.52)",
      quote: "#ffd166",
      foil: "rgba(255,255,255,0.10)"
    },
    mythic: {
      accent: "#ff5b35",
      secondary: "#ffcf6e",
      bg: ["#330805", "#050303", "#240b0a"],
      grid: "rgba(255,91,53,0.095)",
      panel: "rgba(255,91,53,0.12)",
      chip: "rgba(255,91,53,0.16)",
      chipBorder: "rgba(255,207,110,0.48)",
      quote: "#ffcf6e",
      foil: "rgba(255,91,53,0.09)"
    },
    unique: {
      accent: "#f7f1e8",
      secondary: "#00f5ff",
      bg: ["#f7f1e8", "#111111", "#050505"],
      grid: "rgba(0,245,255,0.12)",
      panel: "rgba(247,241,232,0.13)",
      chip: "rgba(0,245,255,0.13)",
      chipBorder: "rgba(247,241,232,0.62)",
      quote: "#00f5ff",
      foil: "rgba(255,255,255,0.13)"
    }
  }[tier] || {
    accent: "#b8ff5c",
    secondary: "#ff9b3d",
    bg: ["#3a140d", "#0b0a08", "#1d160f"],
    grid: "rgba(255,255,255,0.06)",
    panel: "rgba(255,255,255,0.06)",
    chip: "rgba(184,255,92,0.10)",
    chipBorder: "rgba(184,255,92,0.36)",
    quote: "#ff4934",
    foil: "rgba(255,255,255,0.05)"
  };
}

function drawRarityTexture(ctx, theme, tier, w, h) {
  ctx.save();
  ctx.strokeStyle = theme.foil;
  ctx.lineWidth = tier === "unique" ? 2 : 1;
  const spacing = tier === "common" ? 94 : tier === "legendary" || tier === "mythic" || tier === "unique" ? 38 : 62;
  for (let x = -h; x < w + h; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + h, 0);
    ctx.stroke();
  }
  if (tier === "legendary" || tier === "mythic" || tier === "unique") {
    ctx.globalAlpha = 0.72;
    for (let i = 0; i < 5; i += 1) {
      const inset = 76 + i * 14;
      ctx.strokeStyle = i % 2 ? theme.secondary : theme.accent;
      ctx.lineWidth = i === 0 ? 2 : 1;
      roundedRect(ctx, inset, inset, w - inset * 2, h - inset * 2, 18);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 5;
    const corner = 118;
    for (const [sx, sy] of [[70, 70], [w - 70, 70], [70, h - 70], [w - 70, h - 70]]) {
      ctx.beginPath();
      ctx.moveTo(sx, sy + (sy < h / 2 ? corner : -corner));
      ctx.lineTo(sx, sy);
      ctx.lineTo(sx + (sx < w / 2 ? corner : -corner), sy);
      ctx.stroke();
    }
  }
  if (tier === "unique") {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#00f5ff";
    for (let y = 110; y < h - 110; y += 113) ctx.fillRect(70, y, w - 140, 2);
    ctx.fillStyle = "#ff3df2";
    for (let y = 157; y < h - 110; y += 151) ctx.fillRect(120, y, w - 240, 2);
  }
  ctx.restore();
}

function canvasTitleSize(textValue) {
  const length = charLength(textValue);
  if (length > 54) return 42;
  if (length > 44) return 48;
  if (length > 34) return 56;
  return 66;
}

function collectDocumentCss() {
  const chunks = [];
  for (const sheet of document.styleSheets) {
    try {
      chunks.push([...sheet.cssRules].map((rule) => rule.cssText).join("\n"));
    } catch {
      // Cross-origin stylesheets are ignored. The app stylesheet is same-origin.
    }
  }
  return chunks.join("\n");
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function textToDataUrl(textValue, mimeType = "text/plain") {
  const encoded = new TextEncoder().encode(textValue);
  let binary = "";
  for (let index = 0; index < encoded.length; index += 1) {
    binary += String.fromCharCode(encoded[index]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

async function imageSourceToDataUrl(src) {
  if (!src || src.startsWith("data:")) return src;
  const response = await fetch(src, { cache: "force-cache" });
  if (!response.ok) throw new Error("image fetch failed");
  return blobToDataUrl(await response.blob());
}

const NFT_TEMPLATE_BY_RARITY = {
  common: "common.png",
  uncommon: "uncommon.png",
  rare: "rare.png",
  epic: "epic.png",
  legendary: "legendary.png",
  mythic: "mythic.png",
  unique: "unique.png",
  oneofone: "unique.png"
};

async function inlineShareTemplateBackground(clone, report = state.currentReport) {
  const rarity = String(report?.rarity?.tier || clone?.dataset?.rarity || "common").toLowerCase();
  const filename = NFT_TEMPLATE_BY_RARITY[rarity] || NFT_TEMPLATE_BY_RARITY.common;
  try {
    const dataUrl = await imageSourceToDataUrl(`/nft-templates/${filename}`);
    clone.style.setProperty("--nft-template-image", `url("${dataUrl}")`);
  } catch {
    clone.style.setProperty("--nft-template-image", "none");
  }
}

async function inlineCloneImages(clone) {
  const images = [...clone.querySelectorAll("img")];
  await Promise.all(images.map(async (image) => {
    const src = image.getAttribute("src") || image.src;
    try {
      image.setAttribute("src", await imageSourceToDataUrl(src));
    } catch {
      try {
        image.setAttribute("src", await imageSourceToDataUrl(STONE_AVATAR_URL));
      } catch {
        image.removeAttribute("src");
      }
    }
  }));
}

async function captureShareCardCanvas(report = state.currentReport) {
  const element = $("#share-card");
  const canvas = $("#card-canvas");
  if (!element || !canvas) throw new Error("share card missing");
  await document.fonts?.ready?.catch?.(() => {});

  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  const bleed = 36;
  const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
  const clone = element.cloneNode(true);
  clone.style.width = `${width}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.margin = `${bleed}px`;
  clone.style.transform = "none";
  await inlineCloneImages(clone);
  await inlineShareTemplateBackground(clone, report);

  const css = collectDocumentCss();
  const serialized = new XMLSerializer().serializeToString(clone);
  const svgWidth = width + bleed * 2;
  const svgHeight = height + bleed * 2;
  const xhtml = `
    <div xmlns="http://www.w3.org/1999/xhtml" class="capture-stage">
      <style>
        ${css}
        .capture-stage {
          width: ${svgWidth}px;
          min-height: ${svgHeight}px;
          margin: 0;
          background: transparent;
          color: #f7f1e8;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif;
        }
        .capture-stage .share-card {
          width: ${width}px;
          min-width: ${width}px;
          max-width: ${width}px;
        }
      </style>
      ${serialized}
    </div>
  `;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <foreignObject width="100%" height="100%">${xhtml}</foreignObject>
    </svg>
  `;
  const image = await loadImage(textToDataUrl(svg, "image/svg+xml;charset=utf-8"));
  canvas.width = Math.ceil(svgWidth * scale);
  canvas.height = Math.ceil(svgHeight * scale);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, svgWidth, svgHeight);
  ctx.drawImage(image, 0, 0, svgWidth, svgHeight);
  return canvas;
}

async function drawShareCanvas(report) {
  try {
    return await captureShareCardCanvas(report);
  } catch (error) {
    console.warn("Falling back to synthetic share card", error);
    return drawSyntheticShareCanvas(report);
  }
}

async function drawSyntheticShareCanvas(report) {
  const lang = report.language || state.lang;
  const tr = (key) => getText(lang, key);
  const selected = modeReport(report) || report.report || {};
  const rarity = report.rarity || {};
  const badges = report.badges || [];
  const theme = rarityThemeValue(rarity.tier);
  const rarityColor = theme.accent;
  const canvas = $("#card-canvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const identity = identityForReport(report);
  const avatar = await loadImage(identity.avatarUrl || STONE_AVATAR_URL)
    .catch(() => loadImage(STONE_AVATAR_URL));

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, theme.bg[0]);
  bg.addColorStop(0.48, theme.bg[1]);
  bg.addColorStop(1, theme.bg[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  drawRarityTexture(ctx, theme, rarity.tier, w, h);

  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 56) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = rarity.tier === "legendary" || rarity.tier === "mythic" || rarity.tier === "unique" ? 7 : 4;
  roundedRect(ctx, 58, 58, w - 116, h - 116, 24);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(126, 126, 34, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 92, 92, 68, 68);
  ctx.restore();
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(126, 126, 34, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 28px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(formatXName(identity), 176, 116, 520);
  ctx.fillStyle = "#a99f91";
  ctx.font = "700 22px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(report.siteHost, 176, 150, 520);

  ctx.fillStyle = rarityColor;
  ctx.font = "800 34px Microsoft YaHei, Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(tr("card.reportTitle"), 1110, 118);
  ctx.fillStyle = "#a99f91";
  ctx.font = "700 24px Consolas, monospace";
  ctx.fillText(lang === "zh" ? "Degen DNA Report" : "Onchain Mirror", 1110, 154);
  ctx.textAlign = "left";

  ctx.fillStyle = "#a99f91";
  ctx.font = "28px Consolas, monospace";
  ctx.fillText(report.shortAddress, 92, 238);

  const personalityTitle = `${tr("card.personalityPrefix")}${report.personality}`;
  const titleSize = canvasTitleSize(personalityTitle);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = `900 ${titleSize}px Microsoft YaHei, Inter, sans-serif`;
  drawWrappedText(ctx, personalityTitle, 92, 318, 980, titleSize + 8, titleSize <= 56 ? 3 : 2);

  ctx.fillStyle = theme.panel;
  roundedRect(ctx, 92, 488, 1010, 112, 16);
  ctx.fill();
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#a99f91";
  ctx.font = "800 26px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.rarity"), 126, 530);
  ctx.fillStyle = rarityColor;
  ctx.font = "900 40px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(cardRarityLabel(rarity, lang), 126, 576, 820);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "700 24px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(rarity.combo?.text || "", 600, 556, 470);

  const scoreY = 642;
  const scoreBoxW = 482;
  for (const [index, item] of [
    [tr("card.degen"), `${report.scores.degen}/100`, "#ff4934"],
    [tr("card.diamond"), `${report.scores.diamond}/100`, "#b8ff5c"]
  ].entries()) {
    const x = 92 + index * (scoreBoxW + 40);
    ctx.fillStyle = theme.panel;
    roundedRect(ctx, x, scoreY, scoreBoxW, 174, 16);
    ctx.fill();
    ctx.fillStyle = "#a99f91";
    ctx.font = "700 28px Microsoft YaHei, Inter, sans-serif";
    ctx.fillText(item[0], x + 34, scoreY + 54);
    ctx.fillStyle = item[2];
    ctx.font = "900 64px Inter, Microsoft YaHei, sans-serif";
    ctx.fillText(item[1], x + 34, scoreY + 126);
  }

  ctx.fillStyle = theme.secondary;
  ctx.font = "900 38px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.loss"), 92, 900);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 38px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, selected.lossCause || report.lossCause, 92, 960, 1000, 50, 3);

  ctx.fillStyle = rarityColor;
  ctx.font = "800 30px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.tags"), 92, 1110);
  let tagX = 92;
  let tagY = 1148;
  ctx.font = "800 28px Microsoft YaHei, Inter, sans-serif";
  for (const item of (badges.length ? badges : report.labels).slice(0, 5)) {
    const tag = item.name || item;
    const tagWidth = Math.min(980, ctx.measureText(tag).width + 46);
    if (tagX + tagWidth > 1090) {
      tagX = 92;
      tagY += 62;
    }
    ctx.fillStyle = theme.chip;
    roundedRect(ctx, tagX, tagY, tagWidth, 44, 22);
    ctx.fill();
    ctx.strokeStyle = theme.chipBorder;
    ctx.stroke();
    ctx.fillStyle = rarityColor;
    ctx.fillText(tag, tagX + 23, tagY + 31, tagWidth - 38);
    tagX += tagWidth + 14;
  }

  ctx.fillStyle = theme.quote;
  ctx.fillRect(92, 1305, 6, 150);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 38px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, selected.verdict || report.verdict, 122, 1360, 940, 50, 3);

  ctx.fillStyle = "#a99f91";
  ctx.font = "800 22px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.doctor"), 92, 1482);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "900 24px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, careNoteForReport(report), 92, 1516, 760, 30, 1);
  ctx.textAlign = "right";
  ctx.fillStyle = "#b8ff5c";
  ctx.font = "900 28px Consolas, monospace";
  ctx.fillText("degendna.fun", 1110, 1516);
  ctx.textAlign = "left";
  return canvas;
}

async function downloadCard() {
  if (!state.currentReport) return;
  const canvas = await drawShareCanvas(state.currentReport);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
  downloadBlob(blob, `degendna-${state.currentReport.address.slice(2, 8)}.png`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildShareText(report) {
  const selected = modeReport(report);
  return fitTweetText(selected?.tweetText || I18N[state.lang].share.text(report));
}

function charLength(value) {
  return Array.from(String(value || "")).length;
}

function truncateChars(value, max) {
  const chars = Array.from(String(value || ""));
  return chars.length <= max ? chars.join("") : `${chars.slice(0, Math.max(0, max - 3)).join("")}...`;
}

function fitTweetText(value, max = 250) {
  const textValue = String(value || "").trim();
  if (charLength(textValue) <= max) return textValue;
  const site = "degendna.fun";
  const lines = textValue.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const kept = [];
  for (const line of lines) {
    if (line === site) continue;
    const candidate = `${kept.concat(line).join("\n")}\n\n${site}`;
    if (charLength(candidate) <= max) {
      kept.push(line);
      continue;
    }
    const remaining = max - charLength(`${kept.join("\n")}\n\n${site}`) - 2;
    if (remaining > 16) kept.push(truncateChars(line, remaining));
    break;
  }
  return `${kept.join("\n")}\n\n${site}`;
}

function buildXIntentUrl(report) {
  const url = new URL("https://x.com/intent/post");
  url.searchParams.set("text", buildShareText(report));
  return url.toString();
}

function openXIntent(report, popup = null) {
  if (!state.currentReport) return;
  const url = buildXIntentUrl(report);
  if (popup && !popup.closed) {
    popup.location.href = url;
    try {
      popup.opener = null;
    } catch {
      // Some browsers disallow writing opener. The composer still opens.
    }
    return;
  }
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.href = url;
}

async function copyImageToClipboard(blob) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") return false;
  try {
    const writePromise = navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    await Promise.race([
      writePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("clipboard timeout")), 1500))
    ]);
    return true;
  } catch {
    return false;
  }
}

async function shareCard() {
  if (!state.currentReport) return;
  const report = state.currentReport;
  let popup = null;
  try {
    popup = window.open("about:blank", "_blank");
  } catch {
    popup = null;
  }
  if (popup) {
    openXIntent(report, popup);
  }
  setStatus(t("share.preparing"));
  const canvas = await drawShareCanvas(report);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
  const filename = `degendna-${report.address.slice(2, 8)}.png`;
  const copiedImage = await copyImageToClipboard(blob);
  if (!copiedImage) downloadBlob(blob, filename);
  if (!popup || popup.closed) openXIntent(report);
  setStatus(copiedImage ? t("share.imageCopied") : t("share.imageDownloaded"));
  setTimeout(clearStatus, 5200);
}

async function claimNft() {
  const report = state.currentReport;
  if (!report) return;
  const panel = $("#nft-claim-panel");
  const input = $("#nft-receiver");
  const button = $("#nft-claim-button");
  const status = $("#nft-claim-status");
  if (report.nftEligible === false) {
    if (status) {
      status.textContent = report.nftIneligibleReason || t("nft.disabled");
      status.dataset.tone = "error";
    }
    return;
  }
  const receiver = input?.value.trim() || "";
  if (!isAddress(receiver)) {
    if (status) {
      status.textContent = t("nft.invalidReceiver");
      status.dataset.tone = "error";
    }
    input?.focus();
    return;
  }
  if (button) button.disabled = true;
  panel?.classList.add("is-minting");
  if (status) {
    status.textContent = t("nft.claiming");
    status.dataset.tone = "info";
  }
  try {
    const response = await fetch(`/api/nft/claim?lang=${state.lang}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        address: report.address,
        receiver,
        username: report.xProfile?.username || "",
        lang: state.lang
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || t("nft.failed"));
    const claim = payload.claim || {};
    const link = claim.explorerUrl
      ? `<a href="${escapeHtml(claim.explorerUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("nft.claimed"))} #${escapeHtml(claim.tokenId || "--")}</a>`
      : escapeHtml(payload.duplicate ? t("nft.duplicate") : t("nft.claimed"));
    if (status) {
      status.innerHTML = link;
      status.dataset.tone = payload.duplicate ? "info" : "success";
    }
  } catch (error) {
    if (status) {
      status.textContent = error.message || t("nft.failed");
      status.dataset.tone = "error";
    }
  } finally {
    panel?.classList.remove("is-minting");
    if (button) button.disabled = report.nftEligible === false;
  }
}

async function copyTweet() {
  if (!state.currentReport) return;
  const value = buildShareText(state.currentReport);
  const textarea = $("#tweet-text");
  if (textarea) textarea.value = value;
  try {
    await navigator.clipboard.writeText(value);
    setStatus(t("tweet.copied"));
    setTimeout(clearStatus, 1800);
  } catch {
    textarea?.focus();
    textarea?.select();
    const copied = document.execCommand?.("copy");
    setStatus(copied ? t("tweet.copied") : t("tweet.failed"), copied ? "info" : "error");
    setTimeout(clearStatus, copied ? 1800 : 2200);
  }
}

async function handlePk(event) {
  event.preventDefault();
  if (!requireUnlocked()) return;
  const a = $("#pk-a").value.trim();
  const b = $("#pk-b").value.trim();
  const result = $("#pk-result");
  if (!isAddress(a) || !isAddress(b)) {
    result.hidden = false;
    result.textContent = t("pk.invalid");
    return;
  }

  result.hidden = false;
  result.textContent = t("pk.loading");
  const response = await fetch(`/api/compare?addressA=${encodeURIComponent(a)}&addressB=${encodeURIComponent(b)}&lang=${state.lang}`);
  const payload = await response.json();
  if (!response.ok) {
    result.textContent = payload.error || t("pk.failed");
    return;
  }

  result.innerHTML = `
    <strong>A: ${escapeHtml(payload.a.personality)}</strong>, Degen ${payload.a.scores.degen}/100, ${escapeHtml(t("metrics.diamond"))} ${payload.a.scores.diamond}/100.<br />
    <strong>B: ${escapeHtml(payload.b.personality)}</strong>, Degen ${payload.b.scores.degen}/100, ${escapeHtml(t("metrics.diamond"))} ${payload.b.scores.diamond}/100.<br />
    ${escapeHtml(payload.comparison.verdict)}<br />
    ${escapeHtml(payload.comparison.survival)}
  `;
}

async function setLanguage(lang) {
  if (!I18N[lang] || state.lang === lang) return;
  state.lang = lang;
  localStorage.setItem("onchainMirrorLang", lang);
  applyLanguage();
  renderGate();
  setActiveView(state.activeView, { scroll: false });
  renderLeaderboard();

  if (!state.currentReport) return;
  const address = state.currentReport.address;
  setStatus(t("form.loading"));
  try {
    const report = await analyze(address);
    report.xProfile = state.xProfile;
    renderReport(report);
    finishReportStatus(report);
  } catch (error) {
    setStatus(error.message || t("form.failed"), "error");
  }
}

form.addEventListener("submit", handleScan);
$("#pk-form").addEventListener("submit", handlePk);
$("#share-card-button").addEventListener("click", shareCard);
$("#nft-claim-button").addEventListener("click", claimNft);
$("#copy-tweet").addEventListener("click", copyTweet);
$("#mental-submit")?.addEventListener("click", () => renderMentalResult());
$("#mental-save")?.addEventListener("click", saveMentalResult);
$("#mental-clear")?.addEventListener("click", clearMentalRecords);
$("#mental-help-now")?.addEventListener("click", () => {
  setActiveView("mental");
  $$("[data-mental-test]").forEach((button) => button.classList.toggle("active", button.dataset.mentalTest === "support"));
  renderMentalCenter("support");
  $("#mental-support")?.scrollIntoView({ behavior: "smooth", block: "center" });
});
$("#mental-copy-help")?.addEventListener("click", async () => {
  const value = $("#mental-friend-message")?.value || "";
  try {
    await navigator.clipboard.writeText(value);
    setStatus("已经复制。现在可以发给一个你信任的人。");
  } catch {
    setStatus("复制失败，可以手动选中这句话发给朋友。", "error");
  }
  setTimeout(clearStatus, 2400);
});
$("#language-toggle").addEventListener("click", () => setLanguage(state.lang === "zh" ? "en" : "zh"));
$$("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setActiveView(button.dataset.view));
});
$$("[data-mental-test]").forEach((button) => {
  button.addEventListener("click", () => renderMentalCenter(button.dataset.mentalTest));
});
$$("[data-report-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.reportMode = button.dataset.reportMode;
    localStorage.setItem("onchainMirrorReportMode", state.reportMode);
    renderModeContent(state.currentReport);
  });
});
$$("[data-board-rank]").forEach((button) => {
  button.addEventListener("click", () => {
    state.boardCategory = BOARD_RANKS[button.dataset.boardRank] ? button.dataset.boardRank : "composite";
    localStorage.setItem("onchainMirrorBoardCategory", state.boardCategory);
    renderLeaderboard();
  });
});
$("#unlock-follow").addEventListener("click", () => {
  state.unlocked = true;
  localStorage.setItem("onchainMirrorFollowUnlocked", "1");
  renderGate();
  setStatus(state.lang === "zh" ? "已解锁。现在可以生成你的链上人格报告了。" : "Unlocked. You can generate your Degen DNA report now.");
  setTimeout(clearStatus, 1800);
});
$("#refresh-board").addEventListener("click", () => {
  renderLeaderboard();
});

$$("[data-sample], [data-sample-random]").forEach((button) => {
  button.addEventListener("click", () => {
    addressInput.value = button.dataset.sampleRandom
      ? RANDOM_SAMPLES[Math.floor(Math.random() * RANDOM_SAMPLES.length)]
      : button.dataset.sample;
    if (!state.unlocked) {
      requireUnlocked();
      return;
    }
    form.requestSubmit();
  });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-board-address]");
  if (!button) return;
  addressInput.value = button.dataset.boardAddress;
  if (button.dataset.boardX) xInput.value = button.dataset.boardX;
  setActiveView("mirror");
  form.requestSubmit();
});

applyLanguage();
renderGate();
setActiveView("mirror", { scroll: false });
