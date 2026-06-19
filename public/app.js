const I18N = {
  zh: {
    meta: {
      title: "链上照妖镜 - Degen DNA Report",
      description: "输入钱包地址，生成能晒、能比、能自嘲的链上人格报告。"
    },
    brand: { aria: "链上照妖镜", mark: "照", name: "链上照妖镜", sub: "Degen DNA Report" },
    nav: { aria: "工具入口", pk: "钱包 PK", board: "X 排行榜" },
    gate: {
      aria: "关注任务",
      avatarAlt: "Stone141319 头像",
      title: "先关注 Stone，再照钱包",
      copy: "关注后就能照钱包；想进公开排行榜、显示 X 头像和名字，再用 X 授权登录。",
      follow: "关注 @Stone141319",
      unlock: "我已关注，解锁工具",
      unlocked: "已解锁",
      lockText: "关注 @Stone141319 后解锁"
    },
    hero: {
      eyebrow: "中文名出梗，英文名出圈",
      title: "输入钱包地址，看看你到底是哪种链上玩家。",
      copy: "是钻石手，还是高位接盘侠？是空投猎人，还是土狗冲锋队？链上数据不会撒谎，但文案会补刀。"
    },
    form: {
      label: "EVM 钱包地址",
      submit: "生成报告",
      samples: "示例钱包",
      unlockedNote: "已解锁。不连接钱包，不要签名，不碰私钥。只读取公开链上数据。",
      lockedNote: "先关注 @Stone141319 并确认后解锁。全程不连接钱包、不签名。",
      invalid: "请输入有效的 EVM 钱包地址。",
      loading: "正在读取 Ethereum / Base / Arbitrum / Optimism / Polygon / BNB Chain 公开链上数据...",
      failed: "生成失败，请稍后再试。",
      mustFollow: "先完成关注 @Stone141319 的任务，再生成链上人格报告。"
    },
    metrics: { aria: "核心指数", degen: "Degen 指数", diamond: "钻石手指数", airdrop: "空投雷达" },
    sections: {
      asset: "链上资产性格",
      loss: "亏损黑匣子",
      holding: "钻石手 / 纸手",
      alpha: "Alpha 雷达",
      fate: "90 天钱包命运",
      strategy: "Hermes 策略映射"
    },
    card: {
      reportTitle: "链上照妖镜检测报告",
      personalityPrefix: "钱包人格：",
      degen: "Degen 指数",
      diamond: "钻石手指数",
      loss: "亏损主因",
      tags: "链上标签",
      share: "生成晒图并发到 X",
      defaultVerdict: "你不是没有判断力，你只是太容易相信下一根阳线。",
      publicOnly: "不签名 · 只看公开数据"
    },
    stats: { title: "样本数据", portfolio: "估算资产", tx: "交易次数", token: "Token 样本", meme: "Meme 暴露" },
    pk: {
      title: "钱包 PK",
      copy: "我的 Degen 指数 82，你敢测吗？两个地址一比，谁适合牛市冲锋、谁适合熊市活下来，一眼就很水尬。",
      a: "钱包 A：0x...",
      b: "钱包 B：0x...",
      submit: "开始 PK",
      invalid: "请输入两个有效的 EVM 钱包地址。",
      loading: "正在读取两个钱包的真实链上样本...",
      failed: "PK 失败。"
    },
    board: {
      title: "X 授权排行榜",
      copy: "普通检测不需要登录；只有自愿上榜的钱包才需要 X 授权，用头像、昵称和钱包人格一起卷。",
      clear: "清空本机预览",
      teaser: "上榜后会显示：X 头像 / 昵称 / @handle / 钱包人格 / Degen 指数 / 钻石手指数",
      auth: "X 授权上榜",
      empty: "还没有本机预览记录。正式公开榜会在 X 授权后写入服务端榜单。",
      retest: "重测",
      diamond: "钻石手",
      authHint: "X 授权上榜需要先在 X Developer Portal 配置 OAuth App：callback 用 https://degendna.fun/api/auth/x/callback。配置好 Client ID/Secret 后就能接入。"
    },
    report: {
      strategyPrefix: "你的交易风格更适合：",
      strategySuffix: "。如果继续手动追热点，最好让 Hermes 事件雷达先帮你做二次确认。",
      noTokens: "暂无可估值 Token",
      weakSample: "公开样本不足",
      offline: "离线"
    },
    share: {
      titlePrefix: "链上照妖镜：",
      text: (report) => `我的链上 Degen 基因检测结果出来了：${report.personality}
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
    nav: { aria: "Tool navigation", pk: "Wallet PK", board: "X Leaderboard" },
    gate: {
      aria: "Follow gate",
      avatarAlt: "Stone141319 avatar",
      title: "Follow Stone to unlock the mirror",
      copy: "Following unlocks wallet scans. X login is only needed if you want to enter the public leaderboard with avatar and name.",
      follow: "Follow @Stone141319",
      unlock: "I followed, unlock",
      unlocked: "Unlocked",
      lockText: "Follow @Stone141319 to unlock"
    },
    hero: {
      eyebrow: "Chinese memes, global screenshots",
      title: "Paste a wallet address. Find out your Degen DNA.",
      copy: "Diamond hands or top buyer? Airdrop hunter or meme sprinter? Onchain data does not lie. The report just makes it easier to laugh at."
    },
    form: {
      label: "EVM wallet address",
      submit: "Generate report",
      samples: "Sample wallets",
      unlockedNote: "Unlocked. No wallet connection, no signature, no private keys. Public onchain data only.",
      lockedNote: "Follow @Stone141319 and confirm to unlock. No wallet connection or signature required.",
      invalid: "Enter a valid EVM wallet address.",
      loading: "Reading public onchain data from Ethereum / Base / Arbitrum / Optimism / Polygon / BNB Chain...",
      failed: "Generation failed. Try again later.",
      mustFollow: "Follow @Stone141319 first, then generate your Degen DNA report."
    },
    metrics: { aria: "Core scores", degen: "Degen Index", diamond: "Diamond Hands", airdrop: "Airdrop Radar" },
    sections: {
      asset: "Asset Personality",
      loss: "Loss Black Box",
      holding: "Diamond / Paper Hands",
      alpha: "Alpha Radar",
      fate: "90-Day Wallet Plot",
      strategy: "Hermes Strategy Fit"
    },
    card: {
      reportTitle: "Degen DNA Report",
      personalityPrefix: "DNA Type: ",
      degen: "Degen Index",
      diamond: "Diamond Hands",
      loss: "Main Leak",
      tags: "Onchain Tags",
      share: "Create card and share to X",
      defaultVerdict: "You do have judgment. It simply melts whenever the next candle turns green.",
      publicOnly: "No signature · public data only"
    },
    stats: { title: "Sample Data", portfolio: "Est. Assets", tx: "Transactions", token: "Token Sample", meme: "Meme Exposure" },
    pk: {
      title: "Wallet PK",
      copy: "My Degen Index is 82. Dare to compare? Put two wallets in the ring and see who chases bull markets, who survives bear markets.",
      a: "Wallet A: 0x...",
      b: "Wallet B: 0x...",
      submit: "Start PK",
      invalid: "Enter two valid EVM wallet addresses.",
      loading: "Reading real onchain samples for both wallets...",
      failed: "PK failed."
    },
    board: {
      title: "X-Verified Leaderboard",
      copy: "Scanning does not require login. Only wallets that choose to rank publicly need X auth for avatar, name, and handle.",
      clear: "Clear local preview",
      teaser: "Leaderboard identity: X avatar / name / @handle / wallet type / Degen Index / Diamond Hands",
      auth: "Login with X to rank",
      empty: "No local preview records yet. The public board will write to the server after X auth.",
      retest: "Retest",
      diamond: "Diamond",
      authHint: "X leaderboard login needs an OAuth app first. Callback: https://degendna.fun/api/auth/x/callback. Add Client ID/Secret and this button can go live."
    },
    report: {
      strategyPrefix: "This wallet is better suited for: ",
      strategySuffix: ". If you keep chasing manually, let the Hermes event radar add a second confirmation first.",
      noTokens: "No priced token sample",
      weakSample: "Public sample too thin",
      offline: "Offline"
    },
    share: {
      titlePrefix: "Degen DNA: ",
      text: (report) => `My Degen DNA: ${report.scores.degen}/100
Type: ${report.personality}
Diamond Hands: ${report.scores.diamond}/100
${report.verdict}

Dare to test yours?`
    }
  }
};

const state = {
  currentReport: null,
  unlocked: localStorage.getItem("onchainMirrorFollowUnlocked") === "1",
  lang: localStorage.getItem("onchainMirrorLang") === "en" ? "en" : "zh"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const form = $("#scan-form");
const addressInput = $("#wallet-address");
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

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
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
  for (const item of items) {
    node.insertAdjacentHTML("beforeend", renderer(item));
  }
}

async function analyze(address) {
  const response = await fetch(`/api/analyze?address=${encodeURIComponent(address)}&lang=${state.lang}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || t("form.failed"));
  return payload;
}

function saveToLeaderboard(report) {
  const key = "onchainMirrorLeaderboard";
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  const next = [
    {
      address: report.address,
      shortAddress: report.shortAddress,
      personality: report.personality,
      personalityId: report.personalityId,
      language: state.lang,
      degen: report.scores.degen,
      diamond: report.scores.diamond,
      generatedAt: report.generatedAt
    },
    ...current.filter((item) => item.address.toLowerCase() !== report.address.toLowerCase())
  ].slice(0, 12);
  localStorage.setItem(key, JSON.stringify(next));
  renderLeaderboard();
}

function renderLeaderboard() {
  const board = $("#leaderboard-list");
  const items = JSON.parse(localStorage.getItem("onchainMirrorLeaderboard") || "[]");
  if (!items.length) {
    board.innerHTML = `<div class="empty">${escapeHtml(t("board.empty"))}</div>`;
    return;
  }

  renderList(
    board,
    items.sort((a, b) => b.degen - a.degen),
    (item) => `
      <div class="board-row">
        <div>
          <b>${escapeHtml(item.personality)}</b>
          <small>${escapeHtml(item.shortAddress)} · Degen ${item.degen}/100 · ${escapeHtml(t("board.diamond"))} ${item.diamond}/100</small>
        </div>
        <button class="ghost-button" type="button" data-board-address="${escapeHtml(item.address)}">${escapeHtml(t("board.retest"))}</button>
      </div>
    `
  );
}

function renderReport(report) {
  state.currentReport = report;
  reportView.hidden = false;

  const locale = state.lang === "zh" ? "zh-CN" : "en-US";
  text("#report-address", `${report.shortAddress} · ${new Date(report.generatedAt).toLocaleString(locale)}`);
  text("#personality", report.personality);
  text("#degen-band", report.degenBand);
  text("#verdict", report.verdict);
  text("#degen-score", `${report.scores.degen}/100`);
  text("#diamond-score", `${report.scores.diamond}/100`);
  text("#airdrop-score", `${report.scores.airdrop}/100`);
  setMeter("#degen-meter", report.scores.degen);
  setMeter("#diamond-meter", report.scores.diamond);
  setMeter("#airdrop-meter", report.scores.airdrop);
  text("#asset-personality", report.report.assetPersonality);
  text("#loss-black-box", report.report.lossBlackBox);
  text("#holding-behavior", report.report.holdingBehavior);
  text("#strategy-fit", `${t("report.strategyPrefix")}${report.report.strategyFit}${t("report.strategySuffix")}`);

  $("#label-list").innerHTML = report.labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("");

  renderList($("#alpha-list"), report.report.alphaRadar, (item) => `<li>${escapeHtml(item)}</li>`);
  renderList($("#fate-list"), report.report.fate90Days, (item) => `<li>${escapeHtml(item)}</li>`);

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
  text("#card-degen", `${report.scores.degen}/100`);
  text("#card-diamond", `${report.scores.diamond}/100`);
  text("#card-loss-cause", report.lossCause);
  text("#card-verdict", report.verdict);
  text("#card-site", report.siteHost);
  $("#card-tags").innerHTML = report.labels.slice(0, 4).map((label) => `<span>${escapeHtml(label)}</span>`).join("");

  text("#stat-portfolio", report.metrics.portfolioUsdText);
  text("#stat-tx", `${report.metrics.txCount}`);
  text("#stat-token", `${report.metrics.uniqueTokenCount}`);
  text("#stat-meme", `${Math.round(report.metrics.memeRatio * 100)}%`);

  saveToLeaderboard(report);
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
  setStatus(t("form.loading"));
  form.querySelector("button[type='submit']").disabled = true;
  try {
    const report = await analyze(address);
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
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function drawShareCanvas(report) {
  const lang = report.language || state.lang;
  const tr = (key) => getText(lang, key);
  const canvas = $("#card-canvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const avatar = await loadImage("/assets/stone-avatar.png");

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

  ctx.strokeStyle = "#ff4934";
  ctx.lineWidth = 4;
  roundedRect(ctx, 58, 58, w - 116, h - 116, 24);
  ctx.stroke();

  ctx.fillStyle = "#b8ff5c";
  ctx.font = "800 34px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.reportTitle"), 92, 132);
  ctx.fillStyle = "#a99f91";
  ctx.font = "700 24px Consolas, monospace";
  ctx.fillText(lang === "zh" ? "Degen DNA Report" : "Onchain Mirror", 92, 174);

  ctx.fillStyle = "#a99f91";
  ctx.font = "28px Consolas, monospace";
  ctx.fillText(report.shortAddress, 92, 248);

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "900 72px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, `${tr("card.personalityPrefix")}${report.personality}`, 92, 348, 980, 82, 2);

  const scoreY = 550;
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
  ctx.fillText(tr("card.loss"), 92, 822);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 44px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, report.lossCause, 92, 884, 1000, 58, 3);

  ctx.fillStyle = "#b8ff5c";
  ctx.font = "800 30px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(tr("card.tags"), 92, 1054);
  let tagX = 92;
  let tagY = 1092;
  ctx.font = "800 28px Microsoft YaHei, Inter, sans-serif";
  for (const tag of report.labels.slice(0, 5)) {
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
  ctx.fillRect(92, 1260, 6, 178);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 42px Microsoft YaHei, Inter, sans-serif";
  drawWrappedText(ctx, report.verdict, 122, 1322, 940, 58, 3);

  ctx.save();
  ctx.beginPath();
  ctx.arc(126, 1498, 34, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 92, 1464, 68, 68);
  ctx.restore();
  ctx.strokeStyle = "#b8ff5c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(126, 1498, 34, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 28px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText("@Stone141319", 176, 1490);
  ctx.fillStyle = "#a99f91";
  ctx.font = "700 22px Microsoft YaHei, Inter, sans-serif";
  ctx.fillText(report.siteHost, 176, 1524);
  ctx.textAlign = "right";
  ctx.fillText(tr("card.publicOnly"), 1110, 1510);
  ctx.textAlign = "left";
  return canvas;
}

async function downloadCard() {
  if (!state.currentReport) return;
  const canvas = await drawShareCanvas(state.currentReport);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `degendna-${state.currentReport.address.slice(2, 8)}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildShareText(report) {
  return I18N[state.lang].share.text(report);
}

function openXIntent(report) {
  if (!state.currentReport) return;
  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", buildShareText(report));
  url.searchParams.set("url", report.siteUrl || location.href);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}

async function shareCard() {
  if (!state.currentReport) return;
  const report = state.currentReport;
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

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
  openXIntent(report);
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
  renderLeaderboard();

  if (!state.currentReport) return;
  const address = state.currentReport.address;
  setStatus(t("form.loading"));
  try {
    const report = await analyze(address);
    renderReport(report);
    clearStatus();
  } catch (error) {
    setStatus(error.message || t("form.failed"), "error");
  }
}

form.addEventListener("submit", handleScan);
$("#pk-form").addEventListener("submit", handlePk);
$("#share-card-button").addEventListener("click", shareCard);
$("#language-toggle").addEventListener("click", () => setLanguage(state.lang === "zh" ? "en" : "zh"));
$("#unlock-follow").addEventListener("click", () => {
  state.unlocked = true;
  localStorage.setItem("onchainMirrorFollowUnlocked", "1");
  renderGate();
  setStatus(state.lang === "zh" ? "已解锁。现在可以生成你的链上人格报告了。" : "Unlocked. You can generate your Degen DNA report now.");
  setTimeout(clearStatus, 1800);
});
$("#clear-board").addEventListener("click", () => {
  localStorage.removeItem("onchainMirrorLeaderboard");
  renderLeaderboard();
});
$("#x-login-teaser").addEventListener("click", () => {
  setStatus(t("board.authHint"));
  setTimeout(clearStatus, 5200);
});

$$("[data-sample]").forEach((button) => {
  button.addEventListener("click", () => {
    addressInput.value = button.dataset.sample;
    if (!state.unlocked) {
      requireUnlocked();
      return;
    }
    form.requestSubmit();
  });
});

$$("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-board-address]");
  if (!button) return;
  addressInput.value = button.dataset.boardAddress;
  form.requestSubmit();
});

applyLanguage();
renderLeaderboard();
renderGate();
