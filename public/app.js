const state = {
  currentReport: null,
  unlocked: localStorage.getItem("onchainMirrorFollowUnlocked") === "1"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const form = $("#scan-form");
const addressInput = $("#wallet-address");
const statusLine = $("#status");
const reportView = $("#report-view");
const followGate = $("#follow-gate");

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
  $("#unlock-follow").textContent = state.unlocked ? "已解锁" : "我已关注，解锁工具";
  $("#unlock-follow").disabled = state.unlocked;
  form.querySelector("button[type='submit']").disabled = !state.unlocked;
  $("#pk-form").querySelector("button[type='submit']").disabled = !state.unlocked;
  $("#form-note").textContent = state.unlocked
    ? "已解锁。不连接钱包，不要签名，不碰私钥。只读取公开链上数据。"
    : "先关注 @Stone141319 并确认后解锁。全程不连接钱包、不签名。";
}

function requireUnlocked() {
  if (state.unlocked) return true;
  setStatus("先完成关注 @Stone141319 的任务，再生成链上人格报告。", "error");
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
  const response = await fetch(`/api/analyze?address=${encodeURIComponent(address)}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "链上数据读取失败");
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
    board.innerHTML = `<div class="empty">还没有本机预览记录。正式公开榜会在 X 授权后写入服务端榜单。</div>`;
    return;
  }

  renderList(
    board,
    items.sort((a, b) => b.degen - a.degen),
    (item) => `
      <div class="board-row">
        <div>
          <b>${item.personality}</b>
          <small>${item.shortAddress} · Degen ${item.degen}/100 · 钻石手 ${item.diamond}/100</small>
        </div>
        <button class="ghost-button" type="button" data-board-address="${item.address}">重测</button>
      </div>
    `
  );
}

function renderReport(report) {
  state.currentReport = report;
  reportView.hidden = false;

  text("#report-address", `${report.shortAddress} · ${new Date(report.generatedAt).toLocaleString()}`);
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
  text("#strategy-fit", `你的交易风格更适合：${report.report.strategyFit}。如果继续手动追热点，最好让 Hermes 事件雷达先帮你做二次确认。`);

  const labels = $("#label-list");
  labels.innerHTML = report.labels.map((label) => `<span>${label}</span>`).join("");

  renderList($("#alpha-list"), report.report.alphaRadar, (item) => `<li>${item}</li>`);
  renderList($("#fate-list"), report.report.fate90Days, (item) => `<li>${item}</li>`);

  renderList(
    $("#chain-list"),
    report.chains,
    (chain) => `
      <div class="chain-row">
        <div>
          <b>${chain.name}</b>
          <small>${chain.ok ? `${chain.txCount} tx · ${chain.tokenTransferCount} token transfers · ${chain.source}` : chain.errors.join(" / ")}</small>
        </div>
        <span class="chain-pill" style="border-color:${chain.color};color:${chain.color}">
          ${chain.ok ? `${Number(chain.nativeBalance || 0).toFixed(4)} ${chain.nativeSymbol}` : "离线"}
        </span>
      </div>
    `
  );

  renderList(
    $("#token-list"),
    report.metrics.topTokens.length ? report.metrics.topTokens : [{ symbol: "暂无可估值 Token", name: "公开样本不足", usd: 0 }],
    (token) => `
      <div class="token-row">
        <div>
          <b>${token.symbol} ${token.isMeme ? "· Meme" : token.isStable ? "· Stable" : token.isBluechip ? "· Bluechip" : ""}</b>
          <small>${token.name || token.chain || ""}${token.holders ? ` · holders ${token.holders}` : ""}</small>
        </div>
        <strong>${fmtUsd(token.usd)}</strong>
      </div>
    `
  );

  text("#card-address", report.shortAddress);
  text("#card-personality", `钱包人格：${report.personality}`);
  text("#card-degen", `${report.scores.degen}/100`);
  text("#card-diamond", `${report.scores.diamond}/100`);
  text("#card-loss-cause", report.lossCause);
  text("#card-verdict", report.verdict);
  text("#card-site", report.siteHost);
  $("#card-tags").innerHTML = report.labels.slice(0, 4).map((label) => `<span>${label}</span>`).join("");

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
    setStatus("请输入有效的 EVM 钱包地址。", "error");
    return;
  }
  setStatus("正在读取 Ethereum / Base / Arbitrum / Optimism / Polygon / BNB Chain 公开链上数据...");
  form.querySelector("button[type='submit']").disabled = true;
  try {
    const report = await analyze(address);
    renderReport(report);
    clearStatus();
  } catch (error) {
    setStatus(error.message || "生成失败，请稍后再试。", "error");
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

function drawWrappedText(ctx, textValue, x, y, maxWidth, lineHeight, maxLines = 4) {
  const chars = [...String(textValue)];
  let line = "";
  let lines = 0;
  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = char;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) ctx.fillText(line, x, y);
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
  ctx.font = "800 34px Microsoft YaHei, sans-serif";
  ctx.fillText("链上照妖镜检测报告", 92, 132);
  ctx.fillStyle = "#a99f91";
  ctx.font = "700 24px Consolas, monospace";
  ctx.fillText("Degen DNA Report", 92, 174);

  ctx.fillStyle = "#a99f91";
  ctx.font = "28px Consolas, monospace";
  ctx.fillText(report.shortAddress, 92, 248);

  ctx.fillStyle = "#f7f1e8";
  ctx.font = "900 72px Microsoft YaHei, sans-serif";
  drawWrappedText(ctx, `钱包人格：${report.personality}`, 92, 348, 980, 82, 2);

  const scoreY = 550;
  const scoreBoxW = 482;
  for (const [index, item] of [
    ["Degen 指数", `${report.scores.degen}/100`, "#ff4934"],
    ["钻石手指数", `${report.scores.diamond}/100`, "#b8ff5c"]
  ].entries()) {
    const x = 92 + index * (scoreBoxW + 40);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundedRect(ctx, x, scoreY, scoreBoxW, 174, 16);
    ctx.fill();
    ctx.fillStyle = "#a99f91";
    ctx.font = "700 28px Microsoft YaHei, sans-serif";
    ctx.fillText(item[0], x + 34, scoreY + 54);
    ctx.fillStyle = item[2];
    ctx.font = "900 64px Inter, sans-serif";
    ctx.fillText(item[1], x + 34, scoreY + 126);
  }

  ctx.fillStyle = "#ff9b3d";
  ctx.font = "900 38px Microsoft YaHei, sans-serif";
  ctx.fillText("亏损主因", 92, 822);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 44px Microsoft YaHei, sans-serif";
  drawWrappedText(ctx, report.lossCause, 92, 884, 1000, 58, 3);

  ctx.fillStyle = "#b8ff5c";
  ctx.font = "800 30px Microsoft YaHei, sans-serif";
  ctx.fillText("链上标签", 92, 1054);
  let tagX = 92;
  let tagY = 1092;
  ctx.font = "800 28px Microsoft YaHei, sans-serif";
  for (const tag of report.labels.slice(0, 5)) {
    const tagWidth = ctx.measureText(tag).width + 46;
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
    ctx.fillText(tag, tagX + 23, tagY + 31);
    tagX += tagWidth + 14;
  }

  ctx.fillStyle = "#ff4934";
  ctx.fillRect(92, 1260, 6, 178);
  ctx.fillStyle = "#f7f1e8";
  ctx.font = "800 42px Microsoft YaHei, sans-serif";
  drawWrappedText(ctx, report.verdict, 122, 1322, 940, 58, 3);

  ctx.fillStyle = "#a99f91";
  ctx.font = "700 26px Microsoft YaHei, sans-serif";
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
  ctx.font = "800 28px Microsoft YaHei, sans-serif";
  ctx.fillText("@Stone141319", 176, 1490);
  ctx.fillStyle = "#a99f91";
  ctx.font = "700 22px Microsoft YaHei, sans-serif";
  ctx.fillText(report.siteHost, 176, 1524);
  ctx.textAlign = "right";
  ctx.fillText("不签名 · 只看公开数据", 1110, 1510);
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
  link.download = `onchain-mirror-${state.currentReport.address.slice(2, 8)}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildShareText(report) {
  return `我的链上人格：${report.personality}
Degen 指数 ${report.scores.degen}/100，钻石手 ${report.scores.diamond}/100。
${report.verdict}

你敢测吗？`;
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
    title: `链上照妖镜：${report.personality}`,
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
    result.textContent = "请输入两个有效的 EVM 钱包地址。";
    return;
  }

  result.hidden = false;
  result.textContent = "正在读取两个钱包的真实链上样本...";
  const response = await fetch(`/api/compare?addressA=${encodeURIComponent(a)}&addressB=${encodeURIComponent(b)}`);
  const payload = await response.json();
  if (!response.ok) {
    result.textContent = payload.error || "PK 失败。";
    return;
  }

  result.innerHTML = `
    <strong>A：${payload.a.personality}</strong>，Degen ${payload.a.scores.degen}/100，钻石手 ${payload.a.scores.diamond}/100。<br />
    <strong>B：${payload.b.personality}</strong>，Degen ${payload.b.scores.degen}/100，钻石手 ${payload.b.scores.diamond}/100。<br />
    ${payload.comparison.verdict}<br />
    ${payload.comparison.survival}
  `;
}

form.addEventListener("submit", handleScan);
$("#pk-form").addEventListener("submit", handlePk);
$("#share-card-button").addEventListener("click", shareCard);
$("#unlock-follow").addEventListener("click", () => {
  state.unlocked = true;
  localStorage.setItem("onchainMirrorFollowUnlocked", "1");
  renderGate();
  setStatus("已解锁。现在可以生成你的链上人格报告了。");
  setTimeout(clearStatus, 1800);
});
$("#clear-board").addEventListener("click", () => {
  localStorage.removeItem("onchainMirrorLeaderboard");
  renderLeaderboard();
});
$("#x-login-teaser").addEventListener("click", () => {
  setStatus("X 授权上榜需要先在 X Developer Portal 配置 OAuth App：callback 用 https://degendna.fun/api/auth/x/callback。配置好 Client ID/Secret 后就能接入。");
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

renderLeaderboard();
renderGate();
