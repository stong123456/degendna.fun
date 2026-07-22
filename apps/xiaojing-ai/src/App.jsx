import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Hand,
  HeartPulse,
  House,
  LifeBuoy,
  LockKeyhole,
  Menu,
  MessageCircle,
  MessagesSquare,
  Moon,
  RotateCcw,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
  Zap
} from "lucide-react";
import {
  MODES,
  QUICK_STATES,
  TONE_MODES,
  buildSystemPrompt,
  crisisMessage,
  detectCrisis,
  localCompanionReply,
  personaInterpretation,
  readToneMode,
  saveToneMode,
  scenarioSeed,
  urgencyFromText
} from "./companion.js";
import {
  PROVIDERS,
  RECORDS_KEY,
  clearProviderSettings,
  defaultProviderSettings,
  providerById,
  readProviderSettings,
  writeProviderSettings
} from "./providers.js";
import ClinicHome from "./ClinicHome.jsx";
import DisciplineWorkspace from "./DisciplineWorkspace.jsx";
import WorkflowRunner from "./WorkflowRunner.jsx";
import {
  completeDisciplineCheck,
  deriveDisciplineStats,
  readDisciplineChecks,
  readDisciplineRules,
  saveDisciplineChecks,
  saveDisciplineRules
} from "./discipline.js";
import {
  deriveStatusCard,
  readWorkflowResults,
  saveWorkflowResults,
  WORKFLOWS
} from "./workflows.js";
import { localizeWorkflowResult, readXiaojingLanguage, saveXiaojingLanguage, xc } from "./i18n.js";

const APP_BASE_URL = new URL(import.meta.env.BASE_URL, window.location.href);
const IS_DEGENDNA_EMBEDDED = window.location.pathname.startsWith("/xiaojing");
const DEGEN_DNA_URL = IS_DEGENDNA_EMBEDDED ? "/" : "https://degendna.fun";
const DEGEN_PERSONA_URL = IS_DEGENDNA_EMBEDDED ? "/#psyche-test?mode=degen-persona" : "https://degendna.fun/#psyche-test?mode=degen-persona";
const MENTAL_CENTER_URL = IS_DEGENDNA_EMBEDDED ? "/#psyche" : "https://degendna.fun/#psyche";

function appUrl(path) {
  return new URL(String(path).replace(/^\/+/, ""), APP_BASE_URL).toString();
}

function providerLabel(language, provider) {
  if (language !== "en") return provider.label;
  if (provider.id === "qwen") return "Qwen";
  if (provider.id === "custom") return "Custom Compatible API";
  return provider.label;
}

const MODE_ICONS = {
  home: House,
  discipline: BookOpenCheck,
  companion: MessagesSquare,
  persona: BrainCircuit,
  records: LockKeyhole
};

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "assistant",
    content: "我在。先不分析行情，也不判断你。我们只整理此刻正在影响决定的东西。",
    timestamp: Date.now()
  }
];

const PERSONA_SAMPLE = JSON.stringify({
  type: "FOMO 短跑手",
  code: "SNEAQF",
  dimensions: {
    机会敏感度: 72,
    决策果断性: 58,
    资金管理力: -18,
    风险承受力: 64,
    耐心与纪律: 31,
    情绪稳定性: 76
  }
}, null, 2);
const PERSONA_SAMPLE_EN = JSON.stringify({
  type: "FOMO Sprinter",
  code: "SNEAQF",
  dimensions: {
    "Opportunity Sensitivity": 72,
    "Decision Style": 58,
    "Capital Management": -18,
    "Risk Tolerance": 64,
    "Patience & Discipline": 31,
    "Emotional Stability": 76
  }
}, null, 2);

const DEGEN_PERSONA_RECORDS_KEY = "degendna:mental-records:v1";
const PERSONA_DIMENSION_NAMES = [
  "机会敏感度",
  "决策果断性",
  "资金管理力",
  "风险承受力",
  "耐心与纪律",
  "情绪稳定性"
];
const PERSONA_DIMENSION_EN = {
  "机会敏感度": "Opportunity Sensitivity", "决策果断性": "Decision Style", "资金管理力": "Capital Management",
  "风险承受力": "Risk Tolerance", "耐心与纪律": "Patience & Discipline", "情绪稳定性": "Emotional Stability"
};

function normalizePersonaPayload(payload = {}) {
  const sourceDimensions = payload.dimensions || {};
  const dimensions = Object.fromEntries(PERSONA_DIMENSION_NAMES.map((name) => {
    const matched = Array.isArray(sourceDimensions)
      ? sourceDimensions.find((item) => item.name === name || item.key === name)
      : null;
    const value = matched?.score ?? matched?.strength ?? sourceDimensions[name] ?? sourceDimensions[PERSONA_DIMENSION_EN[name]] ?? 0;
    return [name, Math.max(-100, Math.min(100, Number(value) || 0))];
  }));
  return {
    type: payload.type?.name || payload.type || payload.name || "均衡复盘型",
    code: payload.code || "未提供代码",
    dimensions
  };
}

function readLatestDegenPersona() {
  try {
    const records = JSON.parse(localStorage.getItem(DEGEN_PERSONA_RECORDS_KEY) || "[]");
    const record = records.find((item) => item.mode === "Degen 交易人格自查");
    if (!record) return null;
    const legacyCode = record.summaries?.find((item) => item.title === "交易人格代码")?.display;
    return normalizePersonaPayload(record.persona || {
      type: record.headline,
      code: legacyCode,
      dimensions: {}
    });
  } catch {
    return null;
  }
}

function readRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
  } catch {
    return [];
  }
}

function timeLabel(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function secondsLabel(seconds) {
  const minute = Math.floor(seconds / 60).toString().padStart(2, "0");
  const second = (seconds % 60).toString().padStart(2, "0");
  return `${minute}:${second}`;
}

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

function ModelSettingsDrawer({ open, onClose, settings, setSettings, onSaved, language }) {
  const [showKey, setShowKey] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [connection, setConnection] = useState({ state: "idle", message: xc(language, "尚未测试", "Not tested") });

  useEffect(() => {
    if (!open) setShowKey(false);
  }, [open]);

  const selected = providerById(settings.providerId);

  function selectProvider(id) {
    const next = providerById(id);
    setSettings((current) => ({
      ...current,
      providerId: next.id,
      protocol: next.protocol,
      baseUrl: next.baseUrl,
      model: next.model
    }));
    setConnection({ state: "idle", message: xc(language, "设置已变化，请重新测试", "Settings changed; test again") });
  }

  async function testConnection() {
    setConnection({ state: "testing", message: xc(language, "正在建立连接…", "Connecting...") });
    const startedAt = performance.now();
    try {
      const response = await fetch(appUrl("api/chat"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: settings,
          systemPrompt: "只回复：连接正常",
          messages: [{ role: "user", content: "测试连接" }],
          test: true
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "连接失败");
      const elapsed = Math.round(performance.now() - startedAt);
      setConnection({ state: "ok", message: `${xc(language, "连接正常", "Connected")} · ${elapsed} ms` });
    } catch (error) {
      setConnection({ state: "error", message: error.message || "连接失败" });
    }
  }

  function saveSettings() {
    writeProviderSettings(settings);
    onSaved?.();
    setConnection((current) => ({
      ...current,
      message: current.state === "ok" ? current.message : xc(language, "设置已保存", "Settings saved")
    }));
  }

  function clearKey() {
    clearProviderSettings();
    setSettings(defaultProviderSettings());
    setConnection({ state: "idle", message: xc(language, "本机密钥已清除", "Local key cleared") });
  }

  return (
    <>
      <button
        className={`drawer-scrim ${open ? "is-open" : ""}`}
        type="button"
        onClick={onClose}
        aria-label={xc(language, "关闭模型设置", "Close model settings")}
        tabIndex={open ? 0 : -1}
      />
      <aside className={`settings-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="drawer-head">
          <div>
            <span>BYOK / LOCAL FIRST</span>
            <h2>{xc(language, "模型与接口", "Models and API")}</h2>
          </div>
          <IconButton label={xc(language, "关闭", "Close")} onClick={onClose}><X size={22} /></IconButton>
        </header>

        <div className="drawer-scroll">
          <section className="provider-section">
            <label>{xc(language, "提供方", "Provider")}</label>
            <div className="provider-list" role="radiogroup" aria-label={xc(language, "模型提供方", "Model provider")}>
              {PROVIDERS.map((provider) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={settings.providerId === provider.id}
                  className={settings.providerId === provider.id ? "active" : ""}
                  key={provider.id}
                  onClick={() => selectProvider(provider.id)}
                >
                  <span>{providerLabel(language, provider)}</span>
                  {settings.providerId === provider.id ? <Check size={16} /> : null}
                </button>
              ))}
            </div>
          </section>

          <section className="field-stack">
            <label htmlFor="api-key">API Key</label>
            <div className="secret-field">
              <input
                id="api-key"
                type={showKey ? "text" : "password"}
                autoComplete="off"
                value={settings.apiKey}
                placeholder={xc(language, "输入你的 API Key", "Enter your API key")}
                onChange={(event) => setSettings((current) => ({ ...current, apiKey: event.target.value }))}
              />
              <IconButton label={showKey ? xc(language, "隐藏密钥", "Hide key") : xc(language, "显示密钥", "Show key")} onClick={() => setShowKey((value) => !value)}>
                {showKey ? <EyeOff size={17} /> : <Eye size={17} />}
              </IconButton>
            </div>

            <label htmlFor="base-url">Base URL</label>
            <input
              id="base-url"
              value={settings.baseUrl}
              placeholder="https://api.example.com/v1"
              onChange={(event) => setSettings((current) => ({ ...current, baseUrl: event.target.value }))}
            />

            <label htmlFor="model-name">{xc(language, "模型名称", "Model Name")}</label>
            <input
              id="model-name"
              value={settings.model}
              placeholder={xc(language, "模型 ID", "Model ID")}
              onChange={(event) => setSettings((current) => ({ ...current, model: event.target.value }))}
            />
          </section>

          <section className="privacy-toggles">
            <div>
              <span>{xc(language, "仅在本次会话中使用", "Use in this session only")}</span>
              <button
                type="button"
                className={`toggle ${!settings.rememberOnDevice ? "on" : ""}`}
                onClick={() => setSettings((current) => ({ ...current, rememberOnDevice: false }))}
                aria-pressed={!settings.rememberOnDevice}
              ><i /></button>
            </div>
            <div>
              <span>{xc(language, "记住在此设备", "Remember on this device")}</span>
              <button
                type="button"
                className={`toggle ${settings.rememberOnDevice ? "on" : ""}`}
                onClick={() => setSettings((current) => ({ ...current, rememberOnDevice: !current.rememberOnDevice }))}
                aria-pressed={settings.rememberOnDevice}
              ><i /></button>
            </div>
          <p><LockKeyhole size={14} /> {xc(language, "密钥仅随请求无状态转发给所选模型，不保存、不记录。", "The key is forwarded statelessly to the selected model and is neither stored nor logged.")}</p>
          </section>

          <div className="drawer-actions">
            <button type="button" className="primary-outline" onClick={testConnection} disabled={connection.state === "testing"}>
              {connection.state === "testing" ? xc(language, "测试中…", "Testing...") : xc(language, "测试连接", "Test Connection")}
            </button>
            <button type="button" className="secondary-button" onClick={saveSettings}>{xc(language, "保存设置", "Save Settings")}</button>
          </div>
          <p className={`connection-state ${connection.state}`}>
            {connection.state === "ok" ? <CheckCircle2 size={15} /> : null}
            {connection.state === "error" ? <AlertTriangle size={15} /> : null}
            {connection.message}
          </p>

          <section className={`advanced-settings ${advanced ? "open" : ""}`}>
            <button type="button" onClick={() => setAdvanced((value) => !value)}>
              <span><SlidersHorizontal size={16} /> {xc(language, "高级参数", "Advanced Parameters")}</span>
              <ChevronDown size={17} />
            </button>
            {advanced ? (
              <div>
                {selected.id === "custom" ? (
                  <label>
                    {xc(language, "接口协议", "API Protocol")}
                    <select
                      value={settings.protocol}
                      onChange={(event) => setSettings((current) => ({ ...current, protocol: event.target.value }))}
                    >
                      <option value="openai">{xc(language, "OpenAI 兼容", "OpenAI Compatible")}</option>
                      <option value="anthropic">Anthropic Messages</option>
                      <option value="gemini">Gemini GenerateContent</option>
                    </select>
                  </label>
                ) : null}
                <label>
                  {xc(language, "温度", "Temperature")} <b>{Number(settings.temperature).toFixed(2)}</b>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(event) => setSettings((current) => ({ ...current, temperature: Number(event.target.value) }))}
                  />
                </label>
                <label>
                  {xc(language, "最大输出 Token", "Maximum Output Tokens")}
                  <input
                    type="number"
                    min="128"
                    max="4000"
                    step="64"
                    value={settings.maxTokens}
                    onChange={(event) => setSettings((current) => ({ ...current, maxTokens: Number(event.target.value) }))}
                  />
                </label>
              </div>
            ) : null}
          </section>

          <button type="button" className="clear-key" onClick={clearKey}><Trash2 size={15} /> {xc(language, "清除本机密钥", "Clear Local Key")}</button>
        </div>
      </aside>
    </>
  );
}

function ObservationRail({ observation, language, onOpenSettings, providerSettings, pauseRemaining }) {
  const connected = Boolean(providerSettings.apiKey && providerSettings.model && providerSettings.baseUrl);
  return (
    <aside className="observation-rail">
      <header>
        <span>LIVE REFLECTION</span>
        <h2>{xc(language, "此刻观察", "Current Observation")}</h2>
      </header>
      <div className="observation-metrics">
        <article>
          <Zap size={21} />
          <div><span>{xc(language, "冲动强度", "Urge Intensity")}</span><strong>{observation.urge}<small>/10</small></strong></div>
          <i><b style={{ width: `${observation.urge * 10}%` }} /></i>
        </article>
        <article>
          <HeartPulse size={21} />
          <div><span>{xc(language, "身体状态", "Body State")}</span><strong>{observation.body}</strong></div>
        </article>
        <article>
          <Clock3 size={21} />
          <div>
            <span>{xc(language, "建议动作", "Suggested Action")}</span>
            <strong>{pauseRemaining > 0 ? `${xc(language, "暂停", "Pause")} ${secondsLabel(pauseRemaining)}` : observation.action}</strong>
          </div>
        </article>
      </div>

      <blockquote>“{xc(language, "K 线没有资格给你的人格估值。", "A chart does not get to price your identity.")}”</blockquote>

      <button type="button" className="model-status" onClick={onOpenSettings}>
        <Settings2 size={17} />
        <span><b>{connected ? providerLabel(language, providerById(providerSettings.providerId)) : xc(language, "本地陪伴模式", "Local Companion Mode")}</b><small>{connected ? providerSettings.model : xc(language, "点击接入你的模型", "Connect your own model")}</small></span>
        <ChevronRight size={16} />
      </button>

      <p className="rail-boundary"><ShieldCheck size={16} /> {xc(language, "小镜 AI 不是医生，也不提供医疗建议或投资建议。", "Xiaojing AI is not a doctor and provides neither medical nor investment advice.")}</p>
    </aside>
  );
}

function ChatWorkspace({
  activeMode,
  messages,
  input,
  setInput,
  sending,
  status,
  onSend,
  onQuickState,
  onSaveRecord,
  pauseRemaining,
  onTogglePause,
  language
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, sending]);

  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const localReflection = lastUser && !lastUser.sensitive
    ? localCompanionReply(lastUser.content, activeMode, "clear", language)
    : null;

  return (
    <main className="conversation-panel">
      <div className="conversation-meta">
        <span><LockKeyhole size={13} /> {xc(language, "对话默认只保存在当前设备", "Conversation stays on this device by default")}</span>
        <b>{xc(language, "和小镜聊聊", "Talk to Xiaojing")}</b>
      </div>

      <div className="message-scroll" ref={scrollRef}>
        <section className="state-prompt">
          <span>{xc(language, "现在最接近哪种状态？", "Which state feels closest right now?")}</span>
          <div>
            {QUICK_STATES.map((state) => {
              const Icon = state.id === "fomo" ? Activity : state.id === "loss" ? Flame : state.id === "sleep" ? Moon : MessageCircle;
              const labels = { fomo: "Fear of missing out", loss: "Activated after a loss", sleep: "Cannot sleep", talk: "Just want to talk" };
              return <button type="button" key={state.id} onClick={() => onQuickState(state.id)}><Icon size={18} />{language === "en" ? labels[state.id] : state.label}</button>;
            })}
          </div>
        </section>

        <div className="messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <span>{message.role === "assistant" ? xc(language, "小镜", "Xiaojing") : xc(language, "你", "You")} · {timeLabel(message.timestamp)}</span>
              <p>{message.id === "welcome" ? xc(language, "我在。先不分析行情，也不判断你。我们只整理此刻正在影响决定的东西。", "I am here. I will not analyze the market or judge you. We will only organize what is affecting the decision right now.") : message.content}</p>
              {message.role === "assistant" && message.id !== "welcome" && !message.sensitive ? (
                <button type="button" className="save-inline" onClick={onSaveRecord}><Save size={14} /> {xc(language, "保存这段复盘", "Save This Review")}</button>
              ) : null}
            </article>
          ))}
          {sending ? <article className="message assistant is-thinking"><span>{xc(language, "小镜正在整理", "Xiaojing is organizing")}</span><i /><i /><i /></article> : null}
        </div>

        {localReflection && messages.length > 2 ? (
          <section className="reflection-block">
            <span>{xc(language, "把事情拆开看", "Separate What Is Happening")}</span>
            <p><b>{xc(language, "事实", "Fact")}</b>{lastUser.content}</p>
            <p><b>{xc(language, "故事", "Story")}</b>{xc(language, "我必须立刻修复这一切，否则就是失败。", "I must fix this immediately, or it means I failed.")}</p>
            <p><b>{xc(language, "冲动", "Urge")}</b>{localReflection.observation.action}</p>
            <button type="button" onClick={onTogglePause}>
              <Clock3 size={17} />
              {pauseRemaining > 0 ? `${xc(language, "暂停中", "Paused")} ${secondsLabel(pauseRemaining)}` : xc(language, "先离开交易界面 15 分钟", "Leave the trading screen for 15 minutes")}
              <ChevronRight size={17} />
            </button>
          </section>
        ) : null}
      </div>

      {status ? <p className="chat-status"><AlertTriangle size={14} /> {status}</p> : null}

      <form className="composer" onSubmit={(event) => { event.preventDefault(); onSend(); }}>
        <textarea
          value={input}
          rows="2"
          placeholder={xc(language, "把刚才发生的事告诉我…", "Tell me what just happened...")}
          aria-label={xc(language, "对话输入", "Conversation input")}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />
        <IconButton label={xc(language, "发送", "Send")} className="send-button" type="submit" disabled={sending || !input.trim()}><Send size={21} /></IconButton>
      </form>
      <p className="local-note"><LockKeyhole size={13} /> {xc(language, "本次对话默认只保存在当前设备，不与钱包地址绑定。", "This conversation stays on this device by default and is not tied to a wallet address.")}</p>
    </main>
  );
}

function PersonaWorkspace({ onDiscuss, language }) {
  const sample = language === "en" ? PERSONA_SAMPLE_EN : PERSONA_SAMPLE;
  const [form, setForm] = useState(() => normalizePersonaPayload(JSON.parse(sample)));
  const [value, setValue] = useState(sample);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sourceStatus, setSourceStatus] = useState(xc(language, "正在查找最近一次交易人格结果…", "Looking for the latest trading persona result..."));

  useEffect(() => {
    loadLatestPersona(true);
  }, [language]);

  function updateForm(next) {
    setForm(next);
    setCopied(false);
  }

  function loadLatestPersona(silent = false) {
    const latest = readLatestDegenPersona();
    if (!latest) {
      setSourceStatus(xc(language, "当前设备还没有可读取的交易人格结果", "No readable trading persona result exists on this device yet"));
      if (!silent) setError(xc(language, "先完成一次 DegenDNA 交易人格自查，回来后即可一键读取。", "Complete the DegenDNA Trading Persona Check first, then return to load it in one click."));
      return;
    }
    updateForm(latest);
    setValue(JSON.stringify(latest, null, 2));
    setResult(personaInterpretation(latest, language));
    setSourceStatus(xc(language, "已读取当前设备最近一次交易人格结果", "Loaded the latest trading persona result from this device"));
    setError("");
  }

  function analyzeForm() {
    setResult(personaInterpretation(form, language));
    setValue(JSON.stringify(form, null, 2));
    setError("");
  }

  function analyzeJson() {
    try {
      const payload = normalizePersonaPayload(JSON.parse(value));
      updateForm(payload);
      setResult(personaInterpretation(payload, language));
      setSourceStatus(xc(language, "已从高级 JSON 导入更新结果", "Updated the result from advanced JSON import"));
      setError("");
    } catch {
      setError(xc(language, "JSON 格式无法读取，请检查括号、引号和数字格式。", "The JSON could not be read. Check brackets, quotation marks, and number formats."));
    }
  }

  return (
    <main className="tool-workspace persona-workspace">
      <header>
        <span>DEGENDNA PERSONA BRIDGE</span>
        <h1>{xc(language, "人格解读", "Persona Reading")}</h1>
        <p>{xc(language, "把交易人格当作复盘坐标，不把它当成命运判决。", "Use the trading persona as a review coordinate, not a verdict on your future.")}</p>
      </header>
      <div className="persona-layout">
        <section className="import-panel">
          <div className="persona-source-card">
            <span><Activity size={17} /> {sourceStatus}</span>
            <div>
              <button type="button" onClick={() => loadLatestPersona(false)}><RotateCcw size={15} /> {xc(language, "读取最近结果", "Load Latest Result")}</button>
              <a href={DEGEN_PERSONA_URL}>{xc(language, "重新测 48 题", "Retake 48 Questions")} <ExternalLink size={14} /></a>
            </div>
          </div>

          <div className="persona-basic-fields">
            <label>{xc(language, "人格名称", "Persona Name")}
              <input value={form.type} onChange={(event) => updateForm({ ...form, type: event.target.value })} />
            </label>
            <label>{xc(language, "人格代码", "Persona Code")}
              <input value={form.code} onChange={(event) => updateForm({ ...form, code: event.target.value })} />
            </label>
          </div>

          <div className="persona-dimension-editor">
            {PERSONA_DIMENSION_NAMES.map((name) => (
              <label key={name}>
                <span>{language === "en" ? PERSONA_DIMENSION_EN[name] || name : name}<output>{form.dimensions[name]}</output></span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={form.dimensions[name]}
                  onChange={(event) => updateForm({
                    ...form,
                    dimensions: { ...form.dimensions, [name]: Number(event.target.value) }
                  })}
                />
              </label>
            ))}
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          <button type="button" className="primary-outline persona-analyze" onClick={analyzeForm}>{xc(language, "更新人格解读", "Update Persona Reading")}</button>

          <details className="persona-advanced-import">
            <summary><SlidersHorizontal size={14} /> {xc(language, "高级 JSON 导入", "Advanced JSON Import")}</summary>
            <label htmlFor="persona-json">{xc(language, "人格结果 JSON", "Persona Result JSON")}</label>
            <textarea id="persona-json" value={value} onChange={(event) => setValue(event.target.value)} />
            <button type="button" onClick={analyzeJson}>{xc(language, "导入 JSON", "Import JSON")}</button>
          </details>
        </section>
        <section className="persona-result" aria-live="polite">
          {result ? (
            <>
              <span>{xc(language, "当前观察", "Current Observation")}</span>
              <h2>{result.title}</h2>
              <code>{result.code}</code>
              <p>{result.summary}</p>
              <div className="persona-guidance">
                <p><b>{xc(language, "高负荷触发", "High-Load Trigger")}</b>{result.trigger}</p>
                <p><b>{xc(language, "计划易偏离处", "Likely Plan Drift")}</b>{result.lossState}</p>
                <p><b>{xc(language, "适合的冷静流程", "Cooling Process")}</b>{result.cooling}</p>
                <p><b>{xc(language, "交易前提醒", "Pre-Trade Reminder")}</b>{result.preTrade}</p>
                <p><b>{xc(language, "交易后复盘", "Post-Trade Review")}</b>{result.postTrade}</p>
              </div>
              <button type="button" onClick={() => onDiscuss(xc(language, `我想复盘“${result.title}”这个结果。${result.summary}`, `I want to review the ${result.title} result. ${result.summary}`))}>{xc(language, "和小镜继续聊", "Continue with Xiaojing")} <ChevronRight size={16} /></button>
              <button type="button" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.shareText);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}><Save size={15} /> {copied ? xc(language, "分享文案已复制", "Share Text Copied") : xc(language, "复制人格分享文案", "Copy Persona Share Text")}</button>
            </>
          ) : (
            <div className="empty-state"><BrainCircuit size={36} /><p>{xc(language, "读取最近结果或调整六维分数后，这里会生成不贴标签、不做诊断的行为解释。", "Load the latest result or adjust the six dimensions to generate a behavioral reading without labels or diagnosis.")}</p></div>
          )}
        </section>
      </div>
      <p className="persona-boundary"><ShieldCheck size={15} /> {xc(language, "交易人格结果用于娱乐、自我观察与复盘，不构成心理诊断或投资建议。", "Trading persona results are for entertainment, self-observation, and review. They are neither psychological diagnosis nor investment advice.")}</p>
    </main>
  );
}

function RecordsWorkspace({ records, workflowResults, disciplineChecks, language, onClear, onResume, onViewResult, onOpenDiscipline }) {
  const total = records.length + workflowResults.length + disciplineChecks.length;
  return (
    <main className="tool-workspace records-workspace">
      <header>
        <span>PRIVATE / THIS DEVICE ONLY</span>
        <h1>{xc(language, "私密记录", "Private Records")}</h1>
        <p>{xc(language, "只有你主动保存的复盘才会出现在这里。", "Only reviews you explicitly save appear here.")}</p>
      </header>
      <div className="records-toolbar">
        <span>{total} {xc(language, "条本机记录", "local records")}</span>
        <button type="button" onClick={onClear} disabled={!total}><Trash2 size={15} /> {xc(language, "清除全部", "Clear All")}</button>
      </div>
      <section className="record-list">
        {disciplineChecks.map((check) => (
          <article key={check.id} className="discipline-record">
            <header><span>{xc(language, "纪律协议", "Discipline Protocol")} · {check.trigger}</span><time>{timeLabel(check.completedAt || check.createdAt)}</time></header>
            <p><b>{xc(language, "冲动变化", "Urge Change")}</b>{check.urgeBefore}/10 → {check.urgeAfter}/10</p>
            <p><b>{xc(language, "执行结果", "Execution Result")}</b>{check.followed ? xc(language, "执行了自己的协议", "Protocol followed") : xc(language, "本次偏离了协议", "Protocol drifted")} · {check.outcome}</p>
            <button type="button" onClick={onOpenDiscipline}>{xc(language, "查看行为账本", "View Behavior Ledger")} <ChevronRight size={15} /></button>
          </article>
        ))}
        {workflowResults.map((result) => {
          const viewResult = localizeWorkflowResult(language, result);
          return <article key={result.id} className="workflow-record">
            <header><span>{viewResult.title}</span><time>{timeLabel(result.createdAt)}</time></header>
            <p><b>{viewResult.scoreLabel}</b>{result.score}/100</p>
            <p><b>{xc(language, "小镜整理", "Xiaojing Summary")}</b>{viewResult.verdict}</p>
            <button type="button" onClick={() => onViewResult(result)}>{xc(language, "查看结果卡", "View Result Card")} <ChevronRight size={15} /></button>
          </article>;
        })}
        {records.length ? records.map((record) => (
          <article key={record.id}>
            <header><span>{record.mode}</span><time>{timeLabel(record.timestamp)}</time></header>
            <p><b>{xc(language, "当时发生", "What Happened")}</b>{record.user}</p>
            <p><b>{xc(language, "小镜整理", "Xiaojing Summary")}</b>{record.assistant}</p>
            <button type="button" onClick={() => onResume(record)}>{xc(language, "继续复盘", "Continue Review")} <ChevronRight size={15} /></button>
          </article>
        )) : !workflowResults.length ? (
          <div className="empty-state"><LockKeyhole size={38} /><p>{xc(language, "还没有保存记录。你可以在任意一段小镜回复下点击“保存这段复盘”。", "No saved records yet. Use Save This Review under any Xiaojing reply.")}</p></div>
        ) : null}
      </section>
    </main>
  );
}

function SafetyWorkspace({ onReturn, language }) {
  const [answer, setAnswer] = useState("");
  const urgent = answer === "urgent";
  return (
    <main className="tool-workspace safety-workspace">
      <header>
        <span>SAFETY SUPPORT</span>
        <h1>{xc(language, "先确认你现在是安全的", "First, Confirm That You Are Safe")}</h1>
        <p>{xc(language, "这里不做人格分析、不生成分享内容，也不讨论行情。", "There is no persona analysis, sharing, or market discussion here.")}</p>
      </header>

      <section className="safety-question">
        <AlertTriangle size={27} />
        <h2>{xc(language, "你现在是否可能在接下来的几分钟或几小时里伤害自己或他人？", "Is there a chance you may hurt yourself or someone else in the next few minutes or hours?")}</h2>
        <div>
          <button type="button" className={answer === "urgent" ? "active" : ""} onClick={() => setAnswer("urgent")}>{xc(language, "是 / 不确定", "Yes / Not Sure")}</button>
          <button type="button" className={answer === "distressed" ? "active" : ""} onClick={() => setAnswer("distressed")}>{xc(language, "否，但我很难受", "No, but I am in distress")}</button>
        </div>
      </section>

      {answer ? (
        <section className={`safety-steps ${urgent ? "urgent" : ""}`} aria-live="assertive">
          <h2>{urgent ? xc(language, "现在请把现实中的人接进来", "Bring a Real Person In Now") : xc(language, "你不需要一个人扛住", "You Do Not Have to Carry This Alone")}</h2>
          <ol>
            {urgent ? (
              <>
                <li><b>{xc(language, "联系紧急帮助", "Contact Emergency Help")}</b><span>{xc(language, "立即拨打当地紧急服务或前往最近的急诊。", "Call local emergency services or go to the nearest emergency department now.")}</span></li>
                <li><b>{xc(language, "联系可信任的人", "Contact Someone You Trust")}</b><span>{xc(language, "直接告诉对方：“我现在不安全，需要你陪着我。”", "Tell them directly: I am not safe right now and need you to stay with me.")}</span></li>
                <li><b>{xc(language, "远离危险条件", "Move Away from Danger")}</b><span>{xc(language, "离开可能造成伤害的物品或地点，不要独处。", "Move away from anything or any place that could cause harm, and do not stay alone.")}</span></li>
                <li><b>{xc(language, "保持连接", "Stay Connected")}</b><span>{xc(language, "在现实支持到达前，和可信任的人保持通话或待在一起。", "Stay on the phone or remain with someone you trust until support arrives.")}</span></li>
              </>
            ) : (
              <>
                <li><b>{xc(language, "告诉一个真实的人", "Tell a Real Person")}</b><span>{xc(language, "联系朋友、家人、咨询师、医生或其他可信任的人。", "Contact a friend, family member, counselor, doctor, or another trusted person.")}</span></li>
                <li><b>{xc(language, "降低眼前压力", "Reduce Immediate Pressure")}</b><span>{xc(language, "先离开交易界面、酒精或其他会放大冲动的环境。", "Step away from trading screens, alcohol, or other environments that intensify impulses.")}</span></li>
                <li><b>{xc(language, "安排专业支持", "Arrange Professional Support")}</b><span>{xc(language, "尽快联系当地心理健康服务或危机支持资源。", "Contact local mental-health or crisis-support services as soon as possible.")}</span></li>
              </>
            )}
          </ol>
          <div className="safety-actions">
            <a href="https://findahelpline.com" target="_blank" rel="noreferrer">{xc(language, "查找所在地区危机热线", "Find a Crisis Line in Your Region")} <ExternalLink size={15} /></a>
            <a href="https://988lifeline.org" target="_blank" rel="noreferrer">{xc(language, "美国：拨打或短信 988", "United States: Call or Text 988")} <ExternalLink size={15} /></a>
            <button type="button" onClick={onReturn}>{xc(language, "确认安全后返回对话", "Return After Safety Is Confirmed")}</button>
          </div>
          <p>{xc(language, "如果你无法自己完成这些步骤，请把这个页面直接给身边的人看。", "If you cannot complete these steps yourself, show this page directly to someone nearby.")}</p>
        </section>
      ) : null}
    </main>
  );
}

function PrivacyDialog({ open, onClose, dataSummary, onClearData, language }) {
  const [confirming, setConfirming] = useState(false);
  if (!open) return null;
  const closeDialog = () => {
    setConfirming(false);
    onClose();
  };
  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
      <section className="privacy-dialog" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <header><h2 id="privacy-title">{xc(language, "隐私与数据控制", "Privacy and Data Controls")}</h2><IconButton label={xc(language, "关闭", "Close")} onClick={closeDialog}><X size={20} /></IconButton></header>
        <ul>
          <li>{xc(language, "对话默认只存在当前会话；只有主动保存的复盘会写入本机浏览器。", "Conversation exists only in the current session by default; only reviews you explicitly save are written to this browser.")}</li>
          <li>{xc(language, "API Key 默认保存在会话存储；只有开启“记住在此设备”才写入本机。", "The API key uses session storage by default and is written locally only when Remember on this device is enabled.")}</li>
          <li>{xc(language, "启用模型后，密钥会随请求经过本站无状态转发并发送给所选模型，但不会写入数据库或日志。", "When a model is enabled, the key is forwarded statelessly with the request and is not written to a database or log.")}</li>
          <li>{xc(language, "心理自测和危机信息不生成分享卡、不进入排行榜、不绑定钱包。", "Mental-health checks and crisis information never create share cards, enter leaderboards, or link to a wallet.")}</li>
          <li>{xc(language, "小镜 AI 不做心理诊断，不替代专业帮助，也不提供投资建议。", "Xiaojing AI does not diagnose, replace professional help, or provide investment advice.")}</li>
        </ul>
        <section className="privacy-data-control">
          <div>
            <span>{xc(language, "当前设备保存", "Saved on This Device")}</span>
            <strong>{dataSummary.total} {xc(language, "条记录", "records")}</strong>
            <small>{language === "en" ? `${dataSummary.records} conversations · ${dataSummary.workflows} calibration results · ${dataSummary.discipline} behavior records` : `${dataSummary.records} 条对话 · ${dataSummary.workflows} 份校准结果 · ${dataSummary.discipline} 条行为证据`}</small>
          </div>
          <button
            type="button"
            className={confirming ? "confirming" : ""}
            disabled={!dataSummary.total}
            onClick={() => {
              if (!confirming) {
                setConfirming(true);
                return;
              }
              onClearData();
              setConfirming(false);
            }}
          >
            <Trash2 size={15} /> {confirming ? xc(language, "再次点击，确认清除", "Click Again to Confirm") : xc(language, "清除本机记录", "Clear Local Records")}
          </button>
        </section>
        <button type="button" className="primary-outline" onClick={closeDialog}>{xc(language, "完成", "Done")}</button>
      </section>
    </div>
  );
}

export default function App() {
  const [language, setLanguage] = useState(readXiaojingLanguage);
  const [activeMode, setActiveMode] = useState("home");
  const [toneMode, setToneMode] = useState(readToneMode);
  const [workflowId, setWorkflowId] = useState(null);
  const [visibleResult, setVisibleResult] = useState(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [providerSettings, setProviderSettings] = useState(readProviderSettings);
  const [observation, setObservation] = useState({ urge: 4, body: "待观察", action: "说清此刻" });
  const [records, setRecords] = useState(readRecords);
  const [workflowResults, setWorkflowResults] = useState(readWorkflowResults);
  const [disciplineRules, setDisciplineRules] = useState(readDisciplineRules);
  const [disciplineChecks, setDisciplineChecks] = useState(readDisciplineChecks);
  const [latestPersona] = useState(readLatestDegenPersona);
  const [pauseRemaining, setPauseRemaining] = useState(0);

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    saveXiaojingLanguage(language);
  }, [language]);

  const localizedModes = useMemo(() => {
    if (language !== "en") return MODES;
    const copy = {
      home: ["Calibration Desk", "Start from what is happening now"],
      discipline: ["Discipline Protocol", "Pre-trade checks and behavioral evidence"],
      companion: ["Talk to Xiaojing", "Open conversation and result follow-up"],
      persona: ["Persona Reading", "Understand habits without fixed labels"],
      records: ["Private Records", "Stored only on this device"]
    };
    return MODES.map((mode) => ({ ...mode, label: copy[mode.id]?.[0] || mode.label, description: copy[mode.id]?.[1] || mode.description }));
  }, [language]);

  useEffect(() => {
    if (pauseRemaining <= 0) return undefined;
    const timer = window.setInterval(() => {
      setPauseRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pauseRemaining]);

  const isToolMode = ["home", "workflow", "discipline", "persona", "records", "safety"].includes(activeMode);
  const statusCard = useMemo(() => {
    const raw = deriveStatusCard(workflowResults, latestPersona?.type || "尚未接入");
    if (language !== "en") return raw;
    const latest = workflowResults[0] ? localizeWorkflowResult("en", workflowResults[0]) : null;
    return {
      emotion: !latest ? "Not Calibrated" : latest.score >= 70 ? "High Load" : latest.score >= 45 ? "Worth Observing" : "Relatively Stable",
      persona: latestPersona ? personaInterpretation(latestPersona, "en").title : "Not Connected",
      trigger: latest?.metrics?.[0]?.value || latest?.title || "No behavior record today",
      action: latest?.action || "Choose a trading situation that is happening now",
      updatedAt: latest ? new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(latest.createdAt)) : "Not Calibrated"
    };
  }, [workflowResults, latestPersona, language]);
  const disciplineStats = useMemo(
    () => deriveDisciplineStats(disciplineChecks, disciplineRules),
    [disciplineChecks, disciplineRules]
  );

  const providerReady = useMemo(() => Boolean(
    providerSettings.apiKey && providerSettings.baseUrl && providerSettings.model
  ), [providerSettings]);

  async function sendMessage(explicitText, explicitMode = activeMode) {
    const text = String(explicitText ?? input).trim();
    if (!text || sending) return;
    setInput("");
    setStatus("");

    const isCrisis = detectCrisis(text);
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      sensitive: isCrisis
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setObservation((current) => ({ ...current, urge: urgencyFromText(text) }));

    if (isCrisis) {
      const support = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: crisisMessage(language),
        timestamp: Date.now(),
        sensitive: true
      };
      setMessages([...nextMessages, support]);
      setActiveMode("safety");
      setObservation({ urge: 10, body: xc(language, "安全优先", "Safety First"), action: xc(language, "联系现实支持", "Contact Real-World Support") });
      return;
    }

    setSending(true);
    const local = localCompanionReply(text, explicitMode, toneMode, language);
    try {
      let reply = local.text;
      if (providerReady) {
        const response = await fetch(appUrl("api/chat"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            provider: providerSettings,
            systemPrompt: buildSystemPrompt(explicitMode, toneMode, language),
            messages: nextMessages.slice(-12).map(({ role, content }) => ({ role, content }))
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || xc(language, "模型请求失败", "Model request failed"));
        reply = payload.text;
      }
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        timestamp: Date.now()
      }]);
      setObservation(local.observation);
    } catch (error) {
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: local.text,
        timestamp: Date.now()
      }]);
      setObservation(local.observation);
      setStatus(language === "en" ? `The current model is unavailable, so the local companion flow continued.${error.message ? ` Reason: ${error.message}` : ""}` : `当前模型暂时不可用，已用本地陪伴流程继续。${error.message ? ` 原因：${error.message}` : ""}`);
    } finally {
      setSending(false);
    }
  }

  function switchMode(mode) {
    setActiveMode(mode);
    setWorkflowId(null);
    setVisibleResult(null);
    setMobileMenuOpen(false);
  }

  function changeToneMode(mode) {
    const nextMode = mode === "degen" ? "degen" : "clear";
    setToneMode(nextMode);
    try {
      saveToneMode(nextMode);
    } catch {
      setStatus(xc(language, "语气偏好将在本次会话中生效，但当前浏览器不允许保存。", "The tone preference will work for this session, but this browser does not allow it to be saved."));
    }
  }

  function startWorkflow(id) {
    if (!WORKFLOWS[id]) return;
    setWorkflowId(id);
    setVisibleResult(null);
    setActiveMode("workflow");
    setMobileMenuOpen(false);
    setObservation({ urge: id === "fomo" || id === "loss" ? 8 : 5, body: xc(language, "流程进行中", "Flow in Progress"), action: xc(language, "一次回答一个问题", "Answer One Question at a Time") });
  }

  function handleScenario(scenario) {
    if (scenario.action === "persona") {
      window.location.href = DEGEN_PERSONA_URL;
      return;
    }
    if (scenario.action === "safety") {
      switchMode("safety");
      return;
    }
    if (scenario.action === "companion") {
      switchMode("companion");
      window.setTimeout(() => sendMessage(scenarioSeed(scenario.id), "companion"), 0);
      return;
    }
    startWorkflow(scenario.workflow);
  }

  function handleTool(tool) {
    if (tool.id === "discipline" || tool.action === "discipline") {
      switchMode("discipline");
      return;
    }
    if (tool.id === "latest" && (tool.result || workflowResults[0])) {
      const result = tool.result || workflowResults[0];
      setVisibleResult(result);
      setWorkflowId(result.workflowId);
      setActiveMode("workflow");
      return;
    }
    if (tool.external === "persona") {
      window.location.href = DEGEN_PERSONA_URL;
      return;
    }
    if (tool.external === "mental") {
      window.location.href = MENTAL_CENTER_URL;
      return;
    }
    startWorkflow(tool.id);
  }

  function completeWorkflow(result) {
    const next = [result, ...workflowResults].slice(0, 50);
    setWorkflowResults(next);
    setObservation({
      urge: Math.max(1, Math.min(10, Math.round(result.score / 10))),
      body: result.score >= 70 ? xc(language, "负荷偏高", "High Load") : xc(language, "已完成校准", "Calibrated"),
      action: result.action
    });
    try {
      saveWorkflowResults(next);
    } catch {
      setStatus(xc(language, "当前浏览器不允许保存本地结果，但本次结果仍可查看。", "This browser cannot save the result locally, but you can still view it in this session."));
    }
  }

  function updateDisciplineRules(nextRules) {
    setDisciplineRules(nextRules);
    try {
      saveDisciplineRules(nextRules);
    } catch {
      setStatus(xc(language, "当前浏览器不允许保存纪律协议。", "This browser does not allow discipline protocols to be saved."));
    }
  }

  function completeDiscipline(evaluation, outcome) {
    const completed = completeDisciplineCheck(evaluation, outcome);
    const next = [completed, ...disciplineChecks].slice(0, 100);
    setDisciplineChecks(next);
    setObservation({
      urge: completed.urgeAfter,
      body: completed.followed ? xc(language, "已执行协议", "Protocol Followed") : xc(language, "本次有偏离", "Protocol Drifted"),
      action: completed.outcome
    });
    try {
      saveDisciplineChecks(next);
    } catch {
      setStatus(xc(language, "当前浏览器不允许保存行为证据，但本次结果仍可查看。", "This browser cannot save behavioral evidence, but this result remains visible for the session."));
    }
  }

  function deleteDisciplineCheck(id) {
    const next = disciplineChecks.filter((check) => check.id !== id);
    setDisciplineChecks(next);
    try {
      saveDisciplineChecks(next);
    } catch {
      setStatus(xc(language, "当前浏览器不允许删除这条行为证据。", "This browser does not allow this behavior record to be deleted."));
    }
  }

  function saveCurrentRecord() {
    const user = [...messages].reverse().find((message) => message.role === "user");
    const assistant = [...messages].reverse().find((message) => message.role === "assistant" && message.id !== "welcome");
    if (!user || !assistant) {
      setStatus(xc(language, "先完成一轮对话，再保存复盘。", "Complete one conversation turn before saving a review."));
      return;
    }
    if (user.sensitive || assistant.sensitive) {
      setStatus(xc(language, "安全支持内容不会保存到复盘记录。", "Safety-support content is not saved to review records."));
      return;
    }
    const next = [{
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      mode: localizedModes.find((mode) => mode.id === activeMode)?.label || xc(language, "情绪复盘", "Emotion Review"),
      user: user.content,
      assistant: assistant.content
    }, ...records].slice(0, 50);
    setRecords(next);
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(next));
      setStatus(xc(language, "这段复盘已保存到当前设备。", "This review was saved on this device."));
    } catch {
      setRecords(records);
      setStatus(xc(language, "当前浏览器不允许写入本地记录。", "This browser does not allow local records to be written."));
    }
  }

  function clearRecords() {
    setRecords([]);
    setWorkflowResults([]);
    setDisciplineChecks([]);
    try {
      localStorage.removeItem(RECORDS_KEY);
      saveWorkflowResults([]);
      saveDisciplineChecks([]);
    } catch {
      setStatus("当前浏览器不允许清除本地记录。");
    }
  }

  function resumeRecord(record) {
    setMessages([
      ...INITIAL_MESSAGES,
      { id: crypto.randomUUID(), role: "user", content: record.user, timestamp: Date.now() },
      { id: crypto.randomUUID(), role: "assistant", content: record.assistant, timestamp: Date.now() }
    ]);
    setActiveMode("companion");
  }

  function resetSession() {
    setMessages(INITIAL_MESSAGES.map((message) => ({ ...message, timestamp: Date.now() })));
    setInput("");
    setStatus("");
    setPauseRemaining(0);
    setObservation({ urge: 4, body: "待观察", action: "说清此刻" });
    setWorkflowId(null);
    setVisibleResult(null);
    setActiveMode("home");
  }

  function discussPersona(text) {
    setActiveMode("companion");
    window.setTimeout(() => sendMessage(text, "companion"), 0);
  }

  function discussResult(result) {
    setActiveMode("companion");
    setWorkflowId(null);
    setVisibleResult(null);
    window.setTimeout(() => sendMessage(`我刚完成“${result.title}”。结果是：${result.verdict} 建议动作：${result.action} 请帮我继续整理，但不要给投资建议。`, "companion"), 0);
  }

  return (
    <div className="app-shell">
      <div className="scan-line" aria-hidden="true" />
      <header className="topbar">
        <div className="brand-lockup">
          <img src={appUrl("degendna-logo.png")} alt="DegenDNA" />
          <div><strong>{xc(language, "小镜 AI", "Xiaojing AI")}</strong><span>{xc(language, "交易状态陪伴 AI", "Trading-State Companion")}</span></div>
          <i />
          <small>{IS_DEGENDNA_EMBEDDED ? xc(language, "DegenDNA 集成", "DegenDNA Integrated") : xc(language, "独立模式", "Standalone Mode")}</small>
        </div>
        <div className="top-actions">
          <a
            href={DEGEN_DNA_URL}
            target={IS_DEGENDNA_EMBEDDED ? undefined : "_blank"}
            rel={IS_DEGENDNA_EMBEDDED ? undefined : "noreferrer"}
          >
            {IS_DEGENDNA_EMBEDDED ? xc(language, "返回 DegenDNA", "Back to DegenDNA") : "DegenDNA"} <ExternalLink size={14} />
          </a>
          <button type="button" aria-label={xc(language, "切换语言", "Switch language")} onClick={() => setLanguage((value) => value === "zh" ? "en" : "zh")}>⇄ {language === "zh" ? "中文 / EN" : "EN / 中文"}</button>
          <div className="tone-mode-switch" role="group" aria-label={xc(language, "小镜语气模式", "Xiaojing tone mode")}>
            {TONE_MODES.map((tone) => (
              <button
                type="button"
                key={tone.id}
                className={toneMode === tone.id ? "active" : ""}
                aria-pressed={toneMode === tone.id}
                title={tone.description}
                onClick={() => changeToneMode(tone.id)}
              >{language === "en" ? (tone.id === "clear" ? "Clear" : "Degen") : tone.label}</button>
            ))}
          </div>
          <button type="button" onClick={() => setSettingsOpen(true)}><Settings2 size={16} /> {xc(language, "模型设置", "Model Settings")}</button>
          <button type="button" onClick={() => setPrivacyOpen(true)}><ShieldCheck size={16} /> {xc(language, "隐私说明", "Privacy")}</button>
          <button type="button" onClick={resetSession}><RotateCcw size={16} /> {xc(language, "退出本次对话", "Reset Session")}</button>
          <IconButton label={xc(language, "打开导航", "Open navigation")} className="mobile-menu-trigger" onClick={() => setMobileMenuOpen((value) => !value)}><Menu size={21} /></IconButton>
        </div>
      </header>

      <div className={`app-body ${activeMode === "companion" ? "" : "without-observation"}`}>
        <nav className={`side-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label={xc(language, "主要功能", "Main navigation")}>
          <div>
            {localizedModes.map((mode) => {
              const Icon = MODE_ICONS[mode.id];
              return (
                <button
                  type="button"
                  key={mode.id}
                  className={activeMode === mode.id ? "active" : ""}
                  onClick={() => switchMode(mode.id)}
                >
                  <Icon size={23} />
                  <span>{mode.label}<small>{mode.description}</small></span>
                </button>
              );
            })}
          </div>
          <button type="button" className={activeMode === "safety" ? "active safety" : "safety"} onClick={() => switchMode("safety")}>
            <LifeBuoy size={23} /><span>{xc(language, "安全支持", "Safety Support")}<small>{xc(language, "危机时优先进入", "Use first in a crisis")}</small></span>
          </button>
        </nav>

        <section className={`main-stage ${isToolMode ? "tool-mode" : ""}`}>
          {activeMode === "home" ? (
            <ClinicHome
              statusCard={statusCard}
              latestResult={workflowResults[0]}
              language={language}
              disciplineStats={disciplineStats}
              toneMode={toneMode}
              language={language}
              onScenario={handleScenario}
              onTool={handleTool}
              onOpenDiscipline={() => switchMode("discipline")}
            />
          ) : null}
          {activeMode === "workflow" && workflowId ? (
            <WorkflowRunner
              key={`${workflowId}-${visibleResult?.id || "new"}`}
              workflowId={workflowId}
              existingResult={visibleResult}
              toneMode={toneMode}
              language={language}
              onComplete={completeWorkflow}
              onBack={() => switchMode("home")}
              onDiscuss={discussResult}
            />
          ) : null}
          {activeMode === "discipline" ? (
            <DisciplineWorkspace
              rules={disciplineRules}
              checks={disciplineChecks}
              workflowResults={workflowResults}
              latestResult={workflowResults[0]}
              language={language}
              onRulesChange={updateDisciplineRules}
              onCheckComplete={completeDiscipline}
              onDeleteCheck={deleteDisciplineCheck}
              onBack={() => switchMode("home")}
            />
          ) : null}
          {activeMode === "persona" ? <PersonaWorkspace language={language} onDiscuss={discussPersona} /> : null}
          {activeMode === "records" ? (
            <RecordsWorkspace
              records={records}
              workflowResults={workflowResults}
              disciplineChecks={disciplineChecks}
              language={language}
              onClear={clearRecords}
              onResume={resumeRecord}
              onViewResult={(result) => handleTool({ id: "latest", result })}
              onOpenDiscipline={() => switchMode("discipline")}
            />
          ) : null}
          {activeMode === "safety" ? <SafetyWorkspace language={language} onReturn={() => switchMode("companion")} /> : null}
          {activeMode === "companion" ? (
            <ChatWorkspace
              activeMode={activeMode}
              messages={messages}
              input={input}
              setInput={setInput}
              sending={sending}
              status={status}
              onSend={sendMessage}
              onQuickState={(id) => sendMessage(scenarioSeed(id))}
              onSaveRecord={saveCurrentRecord}
              pauseRemaining={pauseRemaining}
              onTogglePause={() => setPauseRemaining((current) => current > 0 ? 0 : 15 * 60)}
              language={language}
            />
          ) : null}
        </section>

        {activeMode === "companion" ? (
          <ObservationRail
            observation={observation}
            onOpenSettings={() => setSettingsOpen(true)}
            providerSettings={providerSettings}
            pauseRemaining={pauseRemaining}
            language={language}
          />
        ) : null}
      </div>

      <nav className="bottom-nav" aria-label={xc(language, "移动端主要功能", "Mobile navigation")}>
        {localizedModes.map((mode) => {
          const Icon = MODE_ICONS[mode.id];
          return <button type="button" key={mode.id} className={activeMode === mode.id ? "active" : ""} onClick={() => switchMode(mode.id)}><Icon size={20} /><span>{mode.label}</span></button>;
        })}
      </nav>

      <ModelSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={providerSettings}
        setSettings={setProviderSettings}
        language={language}
        onSaved={() => setSettingsOpen(false)}
      />
      <PrivacyDialog
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onClearData={clearRecords}
        language={language}
        dataSummary={{
          records: records.length,
          workflows: workflowResults.length,
          discipline: disciplineChecks.length,
          total: records.length + workflowResults.length + disciplineChecks.length
        }}
      />
    </div>
  );
}
