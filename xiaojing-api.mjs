import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const MAX_BODY_BYTES = 128 * 1024;
const REQUEST_TIMEOUT_MS = 45_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
const MAX_RATE_BUCKETS = 2000;
const ALLOW_LOCAL_MODELS = String(process.env.XIAOJING_ALLOW_LOCAL_MODELS || "false").toLowerCase() === "true";
const rateBuckets = new Map();

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("请求内容过大");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function requestIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function allowRequest(req) {
  const now = Date.now();
  if (rateBuckets.size >= MAX_RATE_BUCKETS) {
    for (const [key, value] of rateBuckets) {
      if (now - value.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(key);
    }
    while (rateBuckets.size >= MAX_RATE_BUCKETS) {
      const oldestKey = rateBuckets.keys().next().value;
      if (oldestKey === undefined) break;
      rateBuckets.delete(oldestKey);
    }
  }
  const ip = requestIp(req);
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_LIMIT;
}

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function isPrivateIpv4(hostname) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return parts[0] === 10
    || parts[0] === 127
    || parts[0] === 0
    || (parts[0] === 169 && parts[1] === 254)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168);
}

function isPrivateHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (["localhost", "::1"].includes(host)) return true;
  if (isIP(host) === 4) return isPrivateIpv4(host);
  if (isIP(host) === 6) return host === "::" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
  return false;
}

async function assertProviderConfig(config) {
  if (!config || typeof config !== "object") throw new Error("缺少模型配置");
  if (!String(config.apiKey || "").trim()) throw new Error("请填写 API Key");
  if (!String(config.model || "").trim()) throw new Error("请填写模型名称");

  const url = new URL(normalizeUrl(config.baseUrl));
  if (url.username || url.password) throw new Error("Base URL 不能包含账号信息");
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Base URL 仅支持 HTTP 或 HTTPS");

  const privateHost = isPrivateHost(url.hostname);
  if (privateHost && !ALLOW_LOCAL_MODELS) throw new Error("线上版本不允许访问本机或内网模型地址");
  if (url.protocol === "http:" && !privateHost) throw new Error("远程模型接口必须使用 HTTPS");

  if (!privateHost && !isIP(url.hostname)) {
    const addresses = await lookup(url.hostname, { all: true, verbatim: true });
    if (addresses.some(({ address }) => isPrivateHost(address)) && !ALLOW_LOCAL_MODELS) {
      throw new Error("模型域名不能解析到本机或内网地址");
    }
  }
}

function timeoutSignal() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  timer.unref?.();
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function fetchJson(url, options) {
  const timeout = timeoutSignal();
  try {
    const response = await fetch(url, { ...options, signal: timeout.signal });
    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = { raw: raw.slice(0, 1000) };
    }
    if (!response.ok) {
      throw new Error(payload?.error?.message || payload?.message || `模型接口返回 ${response.status}`);
    }
    return payload;
  } finally {
    timeout.clear();
  }
}

async function callOpenAi(config, messages, systemPrompt, options) {
  const base = normalizeUrl(config.baseUrl);
  const endpoint = /\/chat\/completions$/i.test(base) ? base : `${base}/chat/completions`;
  const payload = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: Number(config.temperature ?? 0.55),
      max_tokens: options.test ? 12 : Number(config.maxTokens || 700)
    })
  });
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("模型没有返回可读文本");
  return String(content);
}

async function callAnthropic(config, messages, systemPrompt, options) {
  const base = normalizeUrl(config.baseUrl);
  const endpoint = /\/messages$/i.test(base) ? base : `${base}/messages`;
  const payload = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: config.model,
      system: systemPrompt,
      messages,
      temperature: Number(config.temperature ?? 0.55),
      max_tokens: options.test ? 12 : Number(config.maxTokens || 700)
    })
  });
  const content = payload?.content?.map((part) => part?.text || "").join("").trim();
  if (!content) throw new Error("模型没有返回可读文本");
  return content;
}

async function callGemini(config, messages, systemPrompt, options) {
  const base = normalizeUrl(config.baseUrl);
  const model = encodeURIComponent(config.model);
  const endpoint = `${base}/models/${model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
  const payload = await fetchJson(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      })),
      generationConfig: {
        temperature: Number(config.temperature ?? 0.55),
        maxOutputTokens: options.test ? 12 : Number(config.maxTokens || 700)
      }
    })
  });
  const content = payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("").trim();
  if (!content) throw new Error("模型没有返回可读文本");
  return content;
}

async function callProvider(config, messages, systemPrompt, options) {
  await assertProviderConfig(config);
  const protocol = String(config.protocol || "openai");
  if (protocol === "anthropic") return callAnthropic(config, messages, systemPrompt, options);
  if (protocol === "gemini") return callGemini(config, messages, systemPrompt, options);
  return callOpenAi(config, messages, systemPrompt, options);
}

export async function handleXiaojingApi(req, res, pathname) {
  if (pathname === "/xiaojing/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, product: "xiaojing-ai", version: "0.2.0" });
    return;
  }

  if (pathname !== "/xiaojing/api/chat") {
    sendJson(res, 404, { ok: false, error: "Not found" });
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  if (!allowRequest(req)) {
    sendJson(res, 429, { ok: false, error: "请求过于频繁，请稍后再试" });
    return;
  }

  try {
    const body = await readJson(req);
    const messages = Array.isArray(body.messages)
      ? body.messages.slice(-16).map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: String(message.content || "").slice(0, 8000)
      }))
      : [];
    if (!messages.length) throw new Error("没有可发送的对话内容");
    const text = await callProvider(
      body.provider,
      messages,
      String(body.systemPrompt || "").slice(0, 20_000),
      { test: Boolean(body.test) }
    );
    sendJson(res, 200, { ok: true, text });
  } catch (error) {
    const message = error?.name === "AbortError" ? "模型响应超时，请稍后重试" : error?.message || "模型请求失败";
    sendJson(res, 400, { ok: false, error: message });
  }
}
