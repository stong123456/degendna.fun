const I18N = {
  zh: {
    meta: {
      title: "链上照妖镜 - Degen DNA Report",
      description: "输入钱包地址，生成能晒、能比、能自嘲的链上人格报告。"
    },
    brand: { aria: "链上照妖镜", mark: "照", name: "链上照妖镜", sub: "Degen DNA Report" },
    nav: { aria: "工具入口", mirror: "照钱包", pk: "钱包 PK", board: "X 排行榜", tg: "TG 频道" },
    views: { aria: "页面视图", mirror: "链上精神病历", pk: "钱包 PK", board: "稀有度排行榜" },
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
      eyebrow: "链上精神病历",
      title: "输入钱包地址，看看你到底是哪种链上玩家。",
      copy: "你的钱包，比你自己更诚实。K 线没杀死你，你的手速差点杀死你。这份报告更像一张链上精神病历。"
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
      reportTitle: "链上精神病历",
      personalityPrefix: "钱包人格：",
      degen: "Degen 指数",
      diamond: "钻石手指数",
      loss: "亏损主因",
      tags: "核心徽章",
      rarity: "稀有度",
      share: "生成晒图并发到 X",
      defaultVerdict: "你不是没有判断力，你只是太容易相信下一根阳线。",
      publicOnly: "不签名 · 只看公开数据"
    },
    tweet: {
      title: "可复制推文",
      copy: "复制推文",
      copied: "推文已复制，拿去公开处刑。",
      failed: "复制失败，可以手动选中文案。"
    },
    stats: { title: "样本数据", portfolio: "估算资产", tx: "交易次数", token: "Token 样本", meme: "Meme 暴露" },
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
      copy: "填 @X 用户名生成报告后，头像、名字、钱包人格和综合评分会自动上榜。",
      refresh: "刷新榜单",
      teaser: "上榜后会显示：X 头像 / @handle / 钱包人格 / Degen 指数 / 钻石手指数 / 综合处刑分",
      empty: "还没有公开记录。填 @X 用户名生成报告，第一张链上精神病历就会自动上榜。",
      retest: "重测",
      diamond: "钻石手",
      composite: "综合处刑分",
      rarity: "稀有度",
      submitted: "已自动加入排行榜。",
      submitFailed: "排行榜提交失败，但报告已生成。",
      loading: "正在读取公开排行榜...",
      rankAria: "排行榜分类",
      rankDegen: "本周最高 Degen 指数",
      rankDiamond: "本周最强钻石手",
      rankAirdrop: "本周最像空投猎人",
      rankTop: "本周最惨接盘侠",
      rankCivil: "本周最像链上公务员",
      rankUninstall: "本周最有可能卸载钱包"
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
      text: (report) => `我的链上 Degen 基因检测结果出来了：${report.personality}
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
    nav: { aria: "Tool navigation", mirror: "Scan", pk: "Wallet PK", board: "X Leaderboard", tg: "TG Channel" },
    views: { aria: "Page views", mirror: "Onchain Medical File", pk: "Wallet PK", board: "Rarity Leaderboard" },
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
      eyebrow: "Onchain Medical File",
      title: "Paste a wallet address. Find out your Degen DNA.",
      copy: "Your wallet is more honest than you are. Candles did not kill you; hand speed almost did. This report reads like an onchain medical file."
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
      reportTitle: "Degen DNA Report",
      personalityPrefix: "DNA Type: ",
      degen: "Degen Index",
      diamond: "Diamond Hands",
      loss: "Main Leak",
      tags: "Core Badges",
      rarity: "Rarity",
      share: "Create card and share to X",
      defaultVerdict: "You do have judgment. It simply melts whenever the next candle turns green.",
      publicOnly: "No signature · public data only"
    },
    tweet: {
      title: "Copy-ready tweet",
      copy: "Copy tweet",
      copied: "Tweet copied. Public execution is now portable.",
      failed: "Copy failed. Select the text manually."
    },
    stats: { title: "Sample Data", portfolio: "Est. Assets", tx: "Transactions", token: "Token Sample", meme: "Meme Exposure" },
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
      copy: "Add an @X handle before generating a report, and the avatar, name, wallet type, and composite score rank automatically.",
      refresh: "Refresh board",
      teaser: "Leaderboard identity: X avatar / @handle / wallet type / Degen Index / Diamond Hands / Composite Score",
      empty: "No public records yet. Add an @X handle and generate the first onchain medical file.",
      retest: "Retest",
      diamond: "Diamond",
      composite: "Composite",
      rarity: "Rarity",
      submitted: "Added to the leaderboard.",
      submitFailed: "Leaderboard submission failed, but the report is ready.",
      loading: "Loading public leaderboard...",
      rankAria: "Leaderboard categories",
      rankDegen: "Highest Degen Index this week",
      rankDiamond: "Strongest Diamond Hands",
      rankAirdrop: "Most Airdrop Hunter",
      rankTop: "Most Tragic Top Buyer",
      rankCivil: "Most Onchain Civil Servant",
      rankUninstall: "Most Likely to Uninstall Wallet"
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
      text: (report) => `My Degen DNA: ${report.scores.degen}/100
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
  activeView: "mirror"
};

const RANDOM_SAMPLES = [
  "0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872",
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67"
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

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
  const next = ["mirror", "pk", "board"].includes(view) ? view : "mirror";
  state.activeView = next;
  $$("[data-view-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== next;
    panel.classList.toggle("active", panel.dataset.viewPanel === next);
  });
  $$("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === next);
  });
  if (next === "board") renderLeaderboard();
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
  await renderLeaderboard(payload.entries);
}

async function renderLeaderboard(providedItems = null) {
  const board = $("#leaderboard-list");
  let items = providedItems;
  if (!items) {
    board.innerHTML = `<div class="empty">${escapeHtml(t("board.loading"))}</div>`;
    try {
      const response = await fetch(`/api/leaderboard?lang=${state.lang}`);
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

  renderList(
    board,
    items.sort((a, b) => Number(b.rarity?.score || 0) - Number(a.rarity?.score || 0) || Number(b.rankScore || 0) - Number(a.rankScore || 0)),
    (item, index) => {
      const rarity = item.rarity || {};
      const badges = item.badges || [];
      const badgeText = badges.slice(0, 3).map((badge) => badge.name).join(" / ");
      return `
      <div class="board-row" data-rarity="${escapeHtml(rarity.tier || "common")}">
        <div class="board-rank">#${index + 1}</div>
        <div class="board-user">
          <img src="${escapeHtml(item.avatarUrl || "/assets/stone-avatar.png")}" alt="${escapeHtml(item.handle || "@X")}" referrerpolicy="no-referrer" />
          <div>
            <b>${escapeHtml(item.handle || item.name || "@X")} · ${escapeHtml(item.personality)}</b>
            <small>${escapeHtml(item.shortAddress)} · ${escapeHtml(t("board.rarity"))} ${escapeHtml(rarity.tierName || "--")} · ${escapeHtml(t("board.composite"))} ${Number(item.rankScore || 0).toFixed(2)}/100 · ${escapeHtml(badgeText)}</small>
          </div>
        </div>
        <button class="ghost-button" type="button" data-board-address="${escapeHtml(item.address)}" data-board-x="${escapeHtml(item.handle || item.username || "")}">${escapeHtml(t("board.retest"))}</button>
      </div>
    `;
    }
  );
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
    handle: "@Stone141319",
    name: "@Stone141319",
    avatarUrl: "/assets/stone-avatar.png"
  };
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
  text("#card-owner-name", identity.handle || identity.name || "@X");
}

function renderRarity(report = state.currentReport) {
  const rarity = report?.rarity || {};
  const badges = report?.badges || [];
  text("#rarity-tier", `${rarity.personality?.tierName || "--"} · ${report?.personality || ""}`);
  text("#rarity-detail", rarity.personality?.text || "");
  text("#combo-rarity", rarity.combo?.tierName || "--");
  text("#combo-detail", rarity.combo?.text || "");
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
  text("#card-rarity", `${rarity.tierName || "--"} · ${rarity.combo?.tierName || ""}`);
  text("#card-rarity-detail", rarity.combo?.text || "");
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
  text("#card-site", report.siteHost);
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
    clearStatus();
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
  return {
    common: "#d8d3ca",
    uncommon: "#7dff9f",
    rare: "#64b5ff",
    epic: "#c27bff",
    legendary: "#ffd166",
    mythic: "#ff5b35",
    unique: "#f7f1e8"
  }[tier] || "#b8ff5c";
}

async function drawShareCanvas(report) {
  const lang = report.language || state.lang;
  const tr = (key) => getText(lang, key);
  const selected = modeReport(report) || report.report || {};
  const rarity = report.rarity || {};
  const badges = report.badges || [];
  const rarityColor = rarityColorValue(rarity.tier);
  const canvas = $("#card-canvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const identity = identityForReport(report);
  const avatar = await loadImage(identity.avatarUrl || "/assets/stone-avatar.png")
    .catch(() => loadImage("/assets/stone-avatar.png"));

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#3a140d");
  bg.addColorStop(0.46, "#0b0a08");
  bg.addColorStop(1, "#1d160f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.07)";
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
  ctx.lineWidth = 4;
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
  ctx.fillText(identity.handle || identity.name || "@X", 176, 116);
  ctx.fillStyle = "#a99f91";
  ctx.font = "700 22px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(`${report.siteHost} · @Stone141319`, 176, 150);

  ctx.fillStyle = "#b8ff5c";
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

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "900 72px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, `${tr("card.personalityPrefix")}${report.personality}`, 92, 338, 980, 82, 2);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  roundedRect(ctx, 92, 506, 1010, 112, 16);
  ctx.fill();
  ctx.strokeStyle = rarityColor;
  ctx.stroke();
  ctx.fillStyle = "#a99f91";
  ctx.font = "800 26px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.rarity"), 126, 548);
  ctx.fillStyle = rarityColor;
  ctx.font = "900 42px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(`${rarity.tierName || "--"} · ${rarity.combo?.tierName || ""}`, 126, 594);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "700 24px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(rarity.combo?.text || "", 600, 574, 470);

  const scoreY = 668;
  const scoreBoxW = 482;
  for (const [index, item] of [
    [tr("card.degen"), `${report.scores.degen}/100`, "#ff4934"],
    [tr("card.diamond"), `${report.scores.diamond}/100`, "#b8ff5c"]
  ].entries()) {
    const x = 92 + index * (scoreBoxW + 40);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundedRect(ctx, x, scoreY, scoreBoxW, 174, 16);
    ctx.fill();
    ctx.fillStyle = "#a99f91";
    ctx.font = "700 28px Microsoft YaHei, Inter, sans-serif";
    ctx.fillText(item[0], x + 34, scoreY + 54);
    ctx.fillStyle = item[2];
    ctx.font = "900 64px Inter, Microsoft YaHei, sans-serif";
    ctx.fillText(item[1], x + 34, scoreY + 126);
  }

  ctx.fillStyle = "#ff9b3d";
  ctx.font = "900 38px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.loss"), 92, 940);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 44px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, selected.lossCause || report.lossCause, 92, 1002, 1000, 58, 3);

  ctx.fillStyle = "#b8ff5c";
  ctx.font = "800 30px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.tags"), 92, 1162);
  let tagX = 92;
  let tagY = 1200;
  ctx.font = "800 28px Microsoft YaHei, Inter, sans-serif";
  for (const item of (badges.length ? badges : report.labels).slice(0, 5)) {
    const tag = item.name || item;
    const tagWidth = Math.min(980, ctx.measureText(tag).width + 46);
    if (tagX + tagWidth > 1090) {
      tagX = 92;
      tagY += 62;
    }
    ctx.fillStyle = "rgba(184,255,92,0.1)";
    roundedRect(ctx, tagX, tagY, tagWidth, 44, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(184,255,92,0.36)";
    ctx.stroke();
    ctx.fillStyle = "#b8ff5c";
    ctx.fillText(tag, tagX + 23, tagY + 31, tagWidth - 38);
    tagX += tagWidth + 14;
  }

  ctx.fillStyle = "#ff4934";
  ctx.fillRect(92, 1340, 6, 158);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 42px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, selected.verdict || report.verdict, 122, 1402, 940, 54, 3);

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "700 22px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(`TG: t.me/Stone141319`, 92, 1524);
  ctx.textAlign = "right";
  ctx.fillText(tr("card.publicOnly"), 1110, 1510);
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
  return chars.length <= max ? chars.join("") : `${chars.slice(0, Math.max(0, max - 1)).join("")}…`;
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
  const url = new URL("https://twitter.com/intent/tweet");
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
  setStatus(t("share.preparing"));
  const canvas = await drawShareCanvas(report);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
  const filename = `degendna-${report.address.slice(2, 8)}.png`;
  const file = new File([blob], filename, { type: "image/png" });
  const shareData = {
    title: `${t("share.titlePrefix")}${report.personality}`,
    text: buildShareText(report),
    url: report.siteUrl || location.href,
    files: [file]
  };

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  const copiedImage = await copyImageToClipboard(blob);
  if (!copiedImage) downloadBlob(blob, filename);
  openXIntent(report);
  setStatus(copiedImage ? t("share.imageCopied") : t("share.imageDownloaded"));
  setTimeout(clearStatus, 5200);
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
    clearStatus();
  } catch (error) {
    setStatus(error.message || t("form.failed"), "error");
  }
}

form.addEventListener("submit", handleScan);
$("#pk-form").addEventListener("submit", handlePk);
$("#share-card-button").addEventListener("click", shareCard);
$("#copy-tweet").addEventListener("click", copyTweet);
$("#language-toggle").addEventListener("click", () => setLanguage(state.lang === "zh" ? "en" : "zh"));
$$("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setActiveView(button.dataset.view));
});
$$("[data-report-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.reportMode = button.dataset.reportMode;
    localStorage.setItem("onchainMirrorReportMode", state.reportMode);
    renderModeContent(state.currentReport);
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
