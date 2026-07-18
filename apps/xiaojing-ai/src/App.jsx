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
  buildSystemPrompt,
  crisisMessage,
  detectCrisis,
  localCompanionReply,
  personaInterpretation,
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

const APP_BASE_URL = new URL(import.meta.env.BASE_URL, window.location.href);
const IS_DEGENDNA_EMBEDDED = window.location.pathname.startsWith("/xiaojing");
const DEGEN_DNA_URL = IS_DEGENDNA_EMBEDDED ? "/" : "https://degendna.fun";

function appUrl(path) {
  return new URL(String(path).replace(/^\/+/, ""), APP_BASE_URL).toString();
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
    content: "我在。先不分析行情，先看看此刻的你。",
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

const DEGEN_PERSONA_RECORDS_KEY = "degendna:mental-records:v1";
const PERSONA_DIMENSION_NAMES = [
  "机会敏感度",
  "决策果断性",
  "资金管理力",
  "风险承受力",
  "耐心与纪律",
  "情绪稳定性"
];

function normalizePersonaPayload(payload = {}) {
  const sourceDimensions = payload.dimensions || {};
  const dimensions = Object.fromEntries(PERSONA_DIMENSION_NAMES.map((name) => {
    const matched = Array.isArray(sourceDimensions)
      ? sourceDimensions.find((item) => item.name === name || item.key === name)
      : null;
    const value = matched?.score ?? matched?.strength ?? sourceDimensions[name] ?? 0;
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

function ModelSettingsDrawer({ open, onClose, settings, setSettings, onSaved }) {
  const [showKey, setShowKey] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [connection, setConnection] = useState({ state: "idle", message: "尚未测试" });

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
    setConnection({ state: "idle", message: "设置已变化，请重新测试" });
  }

  async function testConnection() {
    setConnection({ state: "testing", message: "正在建立连接…" });
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
      setConnection({ state: "ok", message: `连接正常 · ${elapsed} ms` });
    } catch (error) {
      setConnection({ state: "error", message: error.message || "连接失败" });
    }
  }

  function saveSettings() {
    writeProviderSettings(settings);
    onSaved?.();
    setConnection((current) => ({
      ...current,
      message: current.state === "ok" ? current.message : "设置已保存"
    }));
  }

  function clearKey() {
    clearProviderSettings();
    setSettings(defaultProviderSettings());
    setConnection({ state: "idle", message: "本机密钥已清除" });
  }

  return (
    <>
      <button
        className={`drawer-scrim ${open ? "is-open" : ""}`}
        type="button"
        onClick={onClose}
        aria-label="关闭模型设置"
        tabIndex={open ? 0 : -1}
      />
      <aside className={`settings-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <header className="drawer-head">
          <div>
            <span>BYOK / LOCAL FIRST</span>
            <h2>模型与接口</h2>
          </div>
          <IconButton label="关闭" onClick={onClose}><X size={22} /></IconButton>
        </header>

        <div className="drawer-scroll">
          <section className="provider-section">
            <label>提供方</label>
            <div className="provider-list" role="radiogroup" aria-label="模型提供方">
              {PROVIDERS.map((provider) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={settings.providerId === provider.id}
                  className={settings.providerId === provider.id ? "active" : ""}
                  key={provider.id}
                  onClick={() => selectProvider(provider.id)}
                >
                  <span>{provider.label}</span>
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
                placeholder="输入你的 API Key"
                onChange={(event) => setSettings((current) => ({ ...current, apiKey: event.target.value }))}
              />
              <IconButton label={showKey ? "隐藏密钥" : "显示密钥"} onClick={() => setShowKey((value) => !value)}>
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

            <label htmlFor="model-name">模型名称</label>
            <input
              id="model-name"
              value={settings.model}
              placeholder="模型 ID"
              onChange={(event) => setSettings((current) => ({ ...current, model: event.target.value }))}
            />
          </section>

          <section className="privacy-toggles">
            <div>
              <span>仅在本次会话中使用</span>
              <button
                type="button"
                className={`toggle ${!settings.rememberOnDevice ? "on" : ""}`}
                onClick={() => setSettings((current) => ({ ...current, rememberOnDevice: false }))}
                aria-pressed={!settings.rememberOnDevice}
              ><i /></button>
            </div>
            <div>
              <span>记住在此设备</span>
              <button
                type="button"
                className={`toggle ${settings.rememberOnDevice ? "on" : ""}`}
                onClick={() => setSettings((current) => ({ ...current, rememberOnDevice: !current.rememberOnDevice }))}
                aria-pressed={settings.rememberOnDevice}
              ><i /></button>
            </div>
          <p><LockKeyhole size={14} /> 密钥仅随请求无状态转发给所选模型，不保存、不记录。</p>
          </section>

          <div className="drawer-actions">
            <button type="button" className="primary-outline" onClick={testConnection} disabled={connection.state === "testing"}>
              {connection.state === "testing" ? "测试中…" : "测试连接"}
            </button>
            <button type="button" className="secondary-button" onClick={saveSettings}>保存设置</button>
          </div>
          <p className={`connection-state ${connection.state}`}>
            {connection.state === "ok" ? <CheckCircle2 size={15} /> : null}
            {connection.state === "error" ? <AlertTriangle size={15} /> : null}
            {connection.message}
          </p>

          <section className={`advanced-settings ${advanced ? "open" : ""}`}>
            <button type="button" onClick={() => setAdvanced((value) => !value)}>
              <span><SlidersHorizontal size={16} /> 高级参数</span>
              <ChevronDown size={17} />
            </button>
            {advanced ? (
              <div>
                {selected.id === "custom" ? (
                  <label>
                    接口协议
                    <select
                      value={settings.protocol}
                      onChange={(event) => setSettings((current) => ({ ...current, protocol: event.target.value }))}
                    >
                      <option value="openai">OpenAI 兼容</option>
                      <option value="anthropic">Anthropic Messages</option>
                      <option value="gemini">Gemini GenerateContent</option>
                    </select>
                  </label>
                ) : null}
                <label>
                  温度 <b>{Number(settings.temperature).toFixed(2)}</b>
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
                  最大输出 Token
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

          <button type="button" className="clear-key" onClick={clearKey}><Trash2 size={15} /> 清除本机密钥</button>
        </div>
      </aside>
    </>
  );
}

function ObservationRail({ observation, onOpenSettings, providerSettings, pauseRemaining }) {
  const connected = Boolean(providerSettings.apiKey && providerSettings.model && providerSettings.baseUrl);
  return (
    <aside className="observation-rail">
      <header>
        <span>LIVE REFLECTION</span>
        <h2>此刻观察</h2>
      </header>
      <div className="observation-metrics">
        <article>
          <Zap size={21} />
          <div><span>冲动强度</span><strong>{observation.urge}<small>/10</small></strong></div>
          <i><b style={{ width: `${observation.urge * 10}%` }} /></i>
        </article>
        <article>
          <HeartPulse size={21} />
          <div><span>身体状态</span><strong>{observation.body}</strong></div>
        </article>
        <article>
          <Clock3 size={21} />
          <div>
            <span>建议动作</span>
            <strong>{pauseRemaining > 0 ? `暂停 ${secondsLabel(pauseRemaining)}` : observation.action}</strong>
          </div>
        </article>
      </div>

      <blockquote>“K 线没有资格给你的人格估值。”</blockquote>

      <button type="button" className="model-status" onClick={onOpenSettings}>
        <Settings2 size={17} />
        <span><b>{connected ? providerById(providerSettings.providerId).label : "本地陪伴模式"}</b><small>{connected ? providerSettings.model : "点击接入你的模型"}</small></span>
        <ChevronRight size={16} />
      </button>

      <p className="rail-boundary"><ShieldCheck size={16} /> 小镜 AI 不是医生，也不提供医疗建议或投资建议。</p>
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
  onTogglePause
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, sending]);

  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const localReflection = lastUser && !lastUser.sensitive
    ? localCompanionReply(lastUser.content, activeMode)
    : null;

  return (
    <main className="conversation-panel">
      <div className="conversation-meta">
        <span><LockKeyhole size={13} /> 对话默认只保存在当前设备</span>
        <b>{MODES.find((mode) => mode.id === activeMode)?.label}</b>
      </div>

      <div className="message-scroll" ref={scrollRef}>
        <section className="state-prompt">
          <span>现在最接近哪种状态？</span>
          <div>
            {QUICK_STATES.map((state) => {
              const Icon = state.id === "fomo" ? Activity : state.id === "loss" ? Flame : state.id === "sleep" ? Moon : MessageCircle;
              return <button type="button" key={state.id} onClick={() => onQuickState(state.id)}><Icon size={18} />{state.label}</button>;
            })}
          </div>
        </section>

        <div className="messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <span>{message.role === "assistant" ? "小镜" : "你"} · {timeLabel(message.timestamp)}</span>
              <p>{message.content}</p>
              {message.role === "assistant" && message.id !== "welcome" && !message.sensitive ? (
                <button type="button" className="save-inline" onClick={onSaveRecord}><Save size={14} /> 保存这段复盘</button>
              ) : null}
            </article>
          ))}
          {sending ? <article className="message assistant is-thinking"><span>小镜正在整理</span><i /><i /><i /></article> : null}
        </div>

        {localReflection && messages.length > 2 ? (
          <section className="reflection-block">
            <span>把事情拆开看</span>
            <p><b>事实</b>{lastUser.content}</p>
            <p><b>故事</b>我必须立刻修复这一切，否则就是失败。</p>
            <p><b>冲动</b>{localReflection.observation.action}</p>
            <button type="button" onClick={onTogglePause}>
              <Clock3 size={17} />
              {pauseRemaining > 0 ? `暂停中 ${secondsLabel(pauseRemaining)}` : "先离开交易界面 15 分钟"}
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
          placeholder="把刚才发生的事告诉我…"
          aria-label="对话输入"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />
        <IconButton label="发送" className="send-button" type="submit" disabled={sending || !input.trim()}><Send size={21} /></IconButton>
      </form>
      <p className="local-note"><LockKeyhole size={13} /> 本次对话默认只保存在当前设备，不与钱包地址绑定。</p>
    </main>
  );
}

function PersonaWorkspace({ onDiscuss }) {
  const [form, setForm] = useState(() => normalizePersonaPayload(JSON.parse(PERSONA_SAMPLE)));
  const [value, setValue] = useState(PERSONA_SAMPLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sourceStatus, setSourceStatus] = useState("正在查找最近一次交易人格结果…");

  useEffect(() => {
    loadLatestPersona(true);
  }, []);

  function updateForm(next) {
    setForm(next);
    setCopied(false);
  }

  function loadLatestPersona(silent = false) {
    const latest = readLatestDegenPersona();
    if (!latest) {
      setSourceStatus("当前设备还没有可读取的交易人格结果");
      if (!silent) setError("先完成一次 DegenDNA 交易人格自查，回来后即可一键读取。");
      return;
    }
    updateForm(latest);
    setValue(JSON.stringify(latest, null, 2));
    setResult(personaInterpretation(latest));
    setSourceStatus("已读取当前设备最近一次交易人格结果");
    setError("");
  }

  function analyzeForm() {
    setResult(personaInterpretation(form));
    setValue(JSON.stringify(form, null, 2));
    setError("");
  }

  function analyzeJson() {
    try {
      const payload = normalizePersonaPayload(JSON.parse(value));
      updateForm(payload);
      setResult(personaInterpretation(payload));
      setSourceStatus("已从高级 JSON 导入更新结果");
      setError("");
    } catch {
      setError("JSON 格式无法读取，请检查括号、引号和数字格式。");
    }
  }

  return (
    <main className="tool-workspace persona-workspace">
      <header>
        <span>DEGENDNA PERSONA BRIDGE</span>
        <h1>人格解读</h1>
        <p>把交易人格当作复盘坐标，不把它当成命运判决。</p>
      </header>
      <div className="persona-layout">
        <section className="import-panel">
          <div className="persona-source-card">
            <span><Activity size={17} /> {sourceStatus}</span>
            <div>
              <button type="button" onClick={() => loadLatestPersona(false)}><RotateCcw size={15} /> 读取最近结果</button>
              <a href={IS_DEGENDNA_EMBEDDED ? "/#psyche" : "https://degendna.fun/#psyche"}>重新测 48 题 <ExternalLink size={14} /></a>
            </div>
          </div>

          <div className="persona-basic-fields">
            <label>人格名称
              <input value={form.type} onChange={(event) => updateForm({ ...form, type: event.target.value })} />
            </label>
            <label>人格代码
              <input value={form.code} onChange={(event) => updateForm({ ...form, code: event.target.value })} />
            </label>
          </div>

          <div className="persona-dimension-editor">
            {PERSONA_DIMENSION_NAMES.map((name) => (
              <label key={name}>
                <span>{name}<output>{form.dimensions[name]}</output></span>
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
          <button type="button" className="primary-outline persona-analyze" onClick={analyzeForm}>更新人格解读</button>

          <details className="persona-advanced-import">
            <summary><SlidersHorizontal size={14} /> 高级 JSON 导入</summary>
            <label htmlFor="persona-json">人格结果 JSON</label>
            <textarea id="persona-json" value={value} onChange={(event) => setValue(event.target.value)} />
            <button type="button" onClick={analyzeJson}>导入 JSON</button>
          </details>
        </section>
        <section className="persona-result" aria-live="polite">
          {result ? (
            <>
              <span>当前观察</span>
              <h2>{result.title}</h2>
              <code>{result.code}</code>
              <p>{result.summary}</p>
              <div className="persona-guidance">
                <p><b>最容易上头</b>{result.trigger}</p>
                <p><b>最容易亏钱</b>{result.lossState}</p>
                <p><b>适合的冷静流程</b>{result.cooling}</p>
                <p><b>交易前提醒</b>{result.preTrade}</p>
                <p><b>交易后复盘</b>{result.postTrade}</p>
              </div>
              <button type="button" onClick={() => onDiscuss(`我想复盘“${result.title}”这个结果。${result.summary}`)}>和小镜继续聊 <ChevronRight size={16} /></button>
              <button type="button" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.shareText);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}><Save size={15} /> {copied ? "分享文案已复制" : "复制人格分享文案"}</button>
            </>
          ) : (
            <div className="empty-state"><BrainCircuit size={36} /><p>读取最近结果或调整六维分数后，这里会生成不贴标签、不做诊断的行为解释。</p></div>
          )}
        </section>
      </div>
      <p className="persona-boundary"><ShieldCheck size={15} /> 交易人格结果用于娱乐、自我观察与复盘，不构成心理诊断或投资建议。</p>
    </main>
  );
}

function RecordsWorkspace({ records, workflowResults, disciplineChecks, onClear, onResume, onViewResult, onOpenDiscipline }) {
  const total = records.length + workflowResults.length + disciplineChecks.length;
  return (
    <main className="tool-workspace records-workspace">
      <header>
        <span>PRIVATE / THIS DEVICE ONLY</span>
        <h1>私密记录</h1>
        <p>只有你主动保存的复盘才会出现在这里。</p>
      </header>
      <div className="records-toolbar">
        <span>{total} 条本机记录</span>
        <button type="button" onClick={onClear} disabled={!total}><Trash2 size={15} /> 清除全部</button>
      </div>
      <section className="record-list">
        {disciplineChecks.map((check) => (
          <article key={check.id} className="discipline-record">
            <header><span>纪律协议 · {check.trigger}</span><time>{timeLabel(check.completedAt || check.createdAt)}</time></header>
            <p><b>冲动变化</b>{check.urgeBefore}/10 → {check.urgeAfter}/10</p>
            <p><b>执行结果</b>{check.followed ? "执行了自己的协议" : "本次偏离了协议"} · {check.outcome}</p>
            <button type="button" onClick={onOpenDiscipline}>查看行为账本 <ChevronRight size={15} /></button>
          </article>
        ))}
        {workflowResults.map((result) => (
          <article key={result.id} className="workflow-record">
            <header><span>{result.title}</span><time>{timeLabel(result.createdAt)}</time></header>
            <p><b>{result.scoreLabel}</b>{result.score}/100</p>
            <p><b>小镜整理</b>{result.verdict}</p>
            <button type="button" onClick={() => onViewResult(result)}>查看结果卡 <ChevronRight size={15} /></button>
          </article>
        ))}
        {records.length ? records.map((record) => (
          <article key={record.id}>
            <header><span>{record.mode}</span><time>{timeLabel(record.timestamp)}</time></header>
            <p><b>当时发生</b>{record.user}</p>
            <p><b>小镜整理</b>{record.assistant}</p>
            <button type="button" onClick={() => onResume(record)}>继续复盘 <ChevronRight size={15} /></button>
          </article>
        )) : !workflowResults.length ? (
          <div className="empty-state"><LockKeyhole size={38} /><p>还没有保存记录。你可以在任意一段小镜回复下点击“保存这段复盘”。</p></div>
        ) : null}
      </section>
    </main>
  );
}

function SafetyWorkspace({ onReturn }) {
  const [answer, setAnswer] = useState("");
  const urgent = answer === "urgent";
  return (
    <main className="tool-workspace safety-workspace">
      <header>
        <span>SAFETY SUPPORT</span>
        <h1>先确认你现在是安全的</h1>
        <p>这里不做人格分析、不生成分享内容，也不讨论行情。</p>
      </header>

      <section className="safety-question">
        <AlertTriangle size={27} />
        <h2>你现在是否可能在接下来的几分钟或几小时里伤害自己或他人？</h2>
        <div>
          <button type="button" className={answer === "urgent" ? "active" : ""} onClick={() => setAnswer("urgent")}>是 / 不确定</button>
          <button type="button" className={answer === "distressed" ? "active" : ""} onClick={() => setAnswer("distressed")}>否，但我很难受</button>
        </div>
      </section>

      {answer ? (
        <section className={`safety-steps ${urgent ? "urgent" : ""}`} aria-live="assertive">
          <h2>{urgent ? "现在请把现实中的人接进来" : "你不需要一个人扛住"}</h2>
          <ol>
            {urgent ? (
              <>
                <li><b>联系紧急帮助</b><span>立即拨打当地紧急服务或前往最近的急诊。</span></li>
                <li><b>联系可信任的人</b><span>直接告诉对方：“我现在不安全，需要你陪着我。”</span></li>
                <li><b>远离危险条件</b><span>离开可能造成伤害的物品或地点，不要独处。</span></li>
                <li><b>保持连接</b><span>在现实支持到达前，和可信任的人保持通话或待在一起。</span></li>
              </>
            ) : (
              <>
                <li><b>告诉一个真实的人</b><span>联系朋友、家人、咨询师、医生或其他可信任的人。</span></li>
                <li><b>降低眼前压力</b><span>先离开交易界面、酒精或其他会放大冲动的环境。</span></li>
                <li><b>安排专业支持</b><span>尽快联系当地心理健康服务或危机支持资源。</span></li>
              </>
            )}
          </ol>
          <div className="safety-actions">
            <a href="https://findahelpline.com" target="_blank" rel="noreferrer">查找所在地区危机热线 <ExternalLink size={15} /></a>
            <a href="https://988lifeline.org" target="_blank" rel="noreferrer">美国：拨打或短信 988 <ExternalLink size={15} /></a>
            <button type="button" onClick={onReturn}>确认安全后返回对话</button>
          </div>
          <p>如果你无法自己完成这些步骤，请把这个页面直接给身边的人看。</p>
        </section>
      ) : null}
    </main>
  );
}

function PrivacyDialog({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="privacy-dialog" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <header><h2 id="privacy-title">隐私与边界</h2><IconButton label="关闭" onClick={onClose}><X size={20} /></IconButton></header>
        <ul>
          <li>对话默认只存在当前会话；只有主动保存的复盘会写入本机浏览器。</li>
          <li>API Key 默认保存在会话存储；只有开启“记住在此设备”才写入本机。</li>
          <li>启用模型后，密钥会随请求经过本站无状态转发并发送给所选模型，但不会写入数据库或日志。</li>
          <li>心理自测和危机信息不生成分享卡、不进入排行榜、不绑定钱包。</li>
          <li>小镜 AI 不做心理诊断，不替代专业帮助，也不提供投资建议。</li>
        </ul>
        <button type="button" className="primary-outline" onClick={onClose}>我知道了</button>
      </section>
    </div>
  );
}

export default function App() {
  const [activeMode, setActiveMode] = useState("home");
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
    if (pauseRemaining <= 0) return undefined;
    const timer = window.setInterval(() => {
      setPauseRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pauseRemaining]);

  const isToolMode = ["home", "workflow", "discipline", "persona", "records", "safety"].includes(activeMode);
  const statusCard = useMemo(
    () => deriveStatusCard(workflowResults, latestPersona?.type || "尚未接入"),
    [workflowResults, latestPersona]
  );
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
        content: crisisMessage(),
        timestamp: Date.now(),
        sensitive: true
      };
      setMessages([...nextMessages, support]);
      setActiveMode("safety");
      setObservation({ urge: 10, body: "安全优先", action: "联系现实支持" });
      return;
    }

    setSending(true);
    const local = localCompanionReply(text, explicitMode);
    try {
      let reply = local.text;
      if (providerReady) {
        const response = await fetch(appUrl("api/chat"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            provider: providerSettings,
            systemPrompt: buildSystemPrompt(explicitMode),
            messages: nextMessages.slice(-12).map(({ role, content }) => ({ role, content }))
          })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "模型请求失败");
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
      setStatus(`当前模型暂时不可用，已用本地陪伴流程继续。${error.message ? ` 原因：${error.message}` : ""}`);
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

  function startWorkflow(id) {
    if (!WORKFLOWS[id]) return;
    setWorkflowId(id);
    setVisibleResult(null);
    setActiveMode("workflow");
    setMobileMenuOpen(false);
    setObservation({ urge: id === "fomo" || id === "loss" ? 8 : 5, body: "流程进行中", action: "一次回答一个问题" });
  }

  function handleScenario(scenario) {
    if (scenario.action === "persona") {
      window.location.href = IS_DEGENDNA_EMBEDDED ? "/#psyche" : "https://degendna.fun/#psyche";
      return;
    }
    if (scenario.action === "safety") {
      switchMode("safety");
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
      window.location.href = IS_DEGENDNA_EMBEDDED ? "/#psyche" : "https://degendna.fun/#psyche";
      return;
    }
    if (tool.external === "mental") {
      window.location.href = IS_DEGENDNA_EMBEDDED ? "/#mental" : "https://degendna.fun/#mental";
      return;
    }
    startWorkflow(tool.id);
  }

  function completeWorkflow(result) {
    const next = [result, ...workflowResults].slice(0, 50);
    setWorkflowResults(next);
    setObservation({
      urge: Math.max(1, Math.min(10, Math.round(result.score / 10))),
      body: result.score >= 70 ? "负荷偏高" : "已完成扫描",
      action: result.action
    });
    try {
      saveWorkflowResults(next);
    } catch {
      setStatus("当前浏览器不允许保存本地结果，但本次结果仍可查看。");
    }
  }

  function updateDisciplineRules(nextRules) {
    setDisciplineRules(nextRules);
    try {
      saveDisciplineRules(nextRules);
    } catch {
      setStatus("当前浏览器不允许保存纪律协议。");
    }
  }

  function completeDiscipline(evaluation, outcome) {
    const completed = completeDisciplineCheck(evaluation, outcome);
    const next = [completed, ...disciplineChecks].slice(0, 100);
    setDisciplineChecks(next);
    setObservation({
      urge: completed.urgeAfter,
      body: completed.followed ? "已执行协议" : "本次有偏离",
      action: completed.outcome
    });
    try {
      saveDisciplineChecks(next);
    } catch {
      setStatus("当前浏览器不允许保存行为证据，但本次结果仍可查看。");
    }
  }

  function deleteDisciplineCheck(id) {
    const next = disciplineChecks.filter((check) => check.id !== id);
    setDisciplineChecks(next);
    try {
      saveDisciplineChecks(next);
    } catch {
      setStatus("当前浏览器不允许删除这条行为证据。");
    }
  }

  function saveCurrentRecord() {
    const user = [...messages].reverse().find((message) => message.role === "user");
    const assistant = [...messages].reverse().find((message) => message.role === "assistant" && message.id !== "welcome");
    if (!user || !assistant) {
      setStatus("先完成一轮对话，再保存复盘。");
      return;
    }
    if (user.sensitive || assistant.sensitive) {
      setStatus("安全支持内容不会保存到复盘记录。");
      return;
    }
    const next = [{
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      mode: MODES.find((mode) => mode.id === activeMode)?.label || "情绪复盘",
      user: user.content,
      assistant: assistant.content
    }, ...records].slice(0, 50);
    setRecords(next);
    try {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(next));
      setStatus("这段复盘已保存到当前设备。");
    } catch {
      setRecords(records);
      setStatus("当前浏览器不允许写入本地记录。");
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
          <div><strong>小镜 AI</strong><span>链上陪诊员</span></div>
          <i />
          <small>{IS_DEGENDNA_EMBEDDED ? "DegenDNA 集成" : "独立模式"}</small>
        </div>
        <div className="top-actions">
          <a
            href={DEGEN_DNA_URL}
            target={IS_DEGENDNA_EMBEDDED ? undefined : "_blank"}
            rel={IS_DEGENDNA_EMBEDDED ? undefined : "noreferrer"}
          >
            {IS_DEGENDNA_EMBEDDED ? "返回 DegenDNA" : "DegenDNA"} <ExternalLink size={14} />
          </a>
          <button type="button" onClick={() => setSettingsOpen(true)}><Settings2 size={16} /> 模型设置</button>
          <button type="button" onClick={() => setPrivacyOpen(true)}><ShieldCheck size={16} /> 隐私说明</button>
          <button type="button" onClick={resetSession}><RotateCcw size={16} /> 退出本次对话</button>
          <IconButton label="打开导航" className="mobile-menu-trigger" onClick={() => setMobileMenuOpen((value) => !value)}><Menu size={21} /></IconButton>
        </div>
      </header>

      <div className={`app-body ${activeMode === "companion" ? "" : "without-observation"}`}>
        <nav className={`side-nav ${mobileMenuOpen ? "is-open" : ""}`} aria-label="主要功能">
          <div>
            {MODES.map((mode) => {
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
            <LifeBuoy size={23} /><span>安全支持<small>危机时优先进入</small></span>
          </button>
        </nav>

        <section className={`main-stage ${isToolMode ? "tool-mode" : ""}`}>
          {activeMode === "home" ? (
            <ClinicHome
              statusCard={statusCard}
              latestResult={workflowResults[0]}
              disciplineStats={disciplineStats}
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
              onRulesChange={updateDisciplineRules}
              onCheckComplete={completeDiscipline}
              onDeleteCheck={deleteDisciplineCheck}
              onBack={() => switchMode("home")}
            />
          ) : null}
          {activeMode === "persona" ? <PersonaWorkspace onDiscuss={discussPersona} /> : null}
          {activeMode === "records" ? (
            <RecordsWorkspace
              records={records}
              workflowResults={workflowResults}
              disciplineChecks={disciplineChecks}
              onClear={clearRecords}
              onResume={resumeRecord}
              onViewResult={(result) => handleTool({ id: "latest", result })}
              onOpenDiscipline={() => switchMode("discipline")}
            />
          ) : null}
          {activeMode === "safety" ? <SafetyWorkspace onReturn={() => switchMode("companion")} /> : null}
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
            />
          ) : null}
        </section>

        {activeMode === "companion" ? (
          <ObservationRail
            observation={observation}
            onOpenSettings={() => setSettingsOpen(true)}
            providerSettings={providerSettings}
            pauseRemaining={pauseRemaining}
          />
        ) : null}
      </div>

      <nav className="bottom-nav" aria-label="移动端主要功能">
        {MODES.map((mode) => {
          const Icon = MODE_ICONS[mode.id];
          return <button type="button" key={mode.id} className={activeMode === mode.id ? "active" : ""} onClick={() => switchMode(mode.id)}><Icon size={20} /><span>{mode.label}</span></button>;
        })}
      </nav>

      <ModelSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={providerSettings}
        setSettings={setProviderSettings}
        onSaved={() => setSettingsOpen(false)}
      />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}
