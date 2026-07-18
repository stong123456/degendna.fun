import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  History,
  Pause,
  Plus,
  Radar,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2
} from "lucide-react";
import {
  createDisciplineRule,
  deriveDisciplineStats,
  DISCIPLINE_TRIGGERS,
  evaluateDisciplineCheck,
  readActiveCooldown,
  saveActiveCooldown
} from "./discipline.js";
import TriggerMapPanel from "./TriggerMapPanel.jsx";

const INITIAL_FORM = {
  trigger: DISCIPLINE_TRIGGERS[0],
  urgeBefore: 7,
  reason: "",
  exitCondition: "",
  lossBoundary: "还没有写清",
  socialPressure: "轻微",
  physicalState: "正常"
};

function timeLabel(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function clockLabel(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function StatCard({ label, value, note }) {
  return <article><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export default function DisciplineWorkspace({ rules, checks, workflowResults, onRulesChange, onCheckComplete, onDeleteCheck, onBack, latestResult }) {
  const workspaceRef = useRef(null);
  const [tab, setTab] = useState("check");
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    trigger: latestResult?.workflowId === "loss"
      ? "亏损后想翻本"
      : latestResult?.workflowId === "sold"
        ? "卖飞后想追回"
        : INITIAL_FORM.trigger
  }));
  const [cooldown, setCooldown] = useState(readActiveCooldown);
  const [evaluation, setEvaluation] = useState(() => cooldown?.evaluation || null);
  const [remaining, setRemaining] = useState(() => cooldown ? Math.max(0, Math.ceil((cooldown.endsAt - Date.now()) / 1000)) : 0);
  const [urgeAfter, setUrgeAfter] = useState(4);
  const [outcome, setOutcome] = useState("继续观察");
  const [followed, setFollowed] = useState(true);
  const [ruleDraft, setRuleDraft] = useState({
    trigger: DISCIPLINE_TRIGGERS[0],
    condition: "当我发现自己不是按原计划行动时",
    action: "离开交易界面，写清事实、冲动和退出条件后再决定。",
    cooldownMinutes: 10
  });
  const stats = useMemo(() => deriveDisciplineStats(checks, rules), [checks, rules]);

  useEffect(() => {
    workspaceRef.current?.scrollTo({ top: 0, behavior: "auto" });
    workspaceRef.current?.closest(".app-shell")?.scrollTo({ top: 0, behavior: "auto" });
  }, [tab]);

  useEffect(() => {
    if (!cooldown) return undefined;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((cooldown.endsAt - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        saveActiveCooldown(null);
        setCooldown(null);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function runCheck(event) {
    event.preventDefault();
    setEvaluation(evaluateDisciplineCheck(form, rules));
  }

  function startCooldown() {
    if (!evaluation) return;
    const next = {
      checkId: evaluation.id,
      evaluation,
      startedAt: Date.now(),
      endsAt: Date.now() + evaluation.cooldownMinutes * 60 * 1000
    };
    saveActiveCooldown(next);
    setCooldown(next);
    setRemaining(evaluation.cooldownMinutes * 60);
  }

  function finishCheck() {
    if (!evaluation) return;
    onCheckComplete(evaluation, { urgeAfter, outcome, followed });
    saveActiveCooldown(null);
    setCooldown(null);
    setRemaining(0);
    setEvaluation(null);
    setForm(INITIAL_FORM);
    setTab("ledger");
  }

  function toggleRule(id) {
    onRulesChange(rules.map((rule) => rule.id === id ? { ...rule, enabled: !rule.enabled } : rule));
  }

  function removeRule(id) {
    onRulesChange(rules.filter((rule) => rule.id !== id || rule.preset));
  }

  function addRule(event) {
    event.preventDefault();
    if (!ruleDraft.condition.trim() || !ruleDraft.action.trim()) return;
    onRulesChange([...rules, createDisciplineRule(ruleDraft)]);
    setRuleDraft((current) => ({ ...current, condition: "", action: "" }));
  }

  return (
    <main className="discipline-workspace" ref={workspaceRef}>
      <header className="discipline-topline">
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> 返回急诊台</button>
        <span><ShieldCheck size={14} /> 本机私密 · 不连接钱包 · 不提供投资建议</span>
      </header>

      <section className="discipline-hero">
        <div>
          <span><Sparkles size={14} /> PERSONAL DISCIPLINE PROTOCOL</span>
          <h1>小镜纪律协议</h1>
          <p>不判断交易对错。先把最容易失控的时刻，交给你清醒时写下的规则。</p>
        </div>
        <div className="discipline-stats">
          <StatCard label="已完成检查" value={stats.total} note="行为证据" />
          <StatCard label="协议执行率" value={`${stats.adherence}%`} note="按自己规则行动" />
          <StatCard label="平均冲动下降" value={stats.averageReduction} note="0-10 强度变化" />
          <StatCard label="常见触发点" value={stats.topTrigger} note={`${stats.activeRules} 条协议启用`} />
        </div>
      </section>

      <nav className="discipline-tabs" aria-label="纪律协议功能">
        <button type="button" className={tab === "check" ? "active" : ""} onClick={() => setTab("check")}><SlidersHorizontal size={17} /> 交易前检查</button>
        <button type="button" className={tab === "map" ? "active" : ""} onClick={() => setTab("map")}><Radar size={17} /> 触发地图</button>
        <button type="button" className={tab === "rules" ? "active" : ""} onClick={() => setTab("rules")}><BookOpenCheck size={17} /> 我的协议</button>
        <button type="button" className={tab === "ledger" ? "active" : ""} onClick={() => setTab("ledger")}><History size={17} /> 行为证据账本</button>
      </nav>

      {tab === "check" ? (
        <section className="discipline-panel discipline-check-panel">
          {!evaluation ? (
            <form onSubmit={runCheck}>
              <div className="discipline-form-head">
                <div><span>PRE-TRADE CHECK</span><h2>这次决定，现在由什么在推动？</h2></div>
                <label>当前冲动 <output>{form.urgeBefore}/10</output><input type="range" min="0" max="10" value={form.urgeBefore} onChange={(event) => updateForm("urgeBefore", event.target.value)} /></label>
              </div>
              <fieldset>
                <legend>01 / 选择触发点</legend>
                <div className="trigger-options">
                  {DISCIPLINE_TRIGGERS.map((trigger) => <button type="button" key={trigger} className={form.trigger === trigger ? "active" : ""} onClick={() => updateForm("trigger", trigger)}>{trigger}</button>)}
                </div>
              </fieldset>
              <div className="discipline-form-grid">
                <label><span>02 / 现在行动的真实理由</span><textarea required value={form.reason} onChange={(event) => updateForm("reason", event.target.value)} placeholder="只写此刻能确认的事实，不写对行情的预测。" /></label>
                <label><span>03 / 什么情况说明原计划不再成立</span><textarea required value={form.exitCondition} onChange={(event) => updateForm("exitCondition", event.target.value)} placeholder="写清退出、停止观察或重新评估的条件。" /></label>
              </div>
              <div className="discipline-select-grid">
                <label><span>可承受边界</span><select value={form.lossBoundary} onChange={(event) => updateForm("lossBoundary", event.target.value)}><option>还没有写清</option><option>有模糊范围</option><option>已经写进原计划</option></select></label>
                <label><span>外部刺激影响</span><select value={form.socialPressure} onChange={(event) => updateForm("socialPressure", event.target.value)}><option>没有</option><option>轻微</option><option>明显</option><option>几乎由它触发</option></select></label>
                <label><span>身体状态</span><select value={form.physicalState} onChange={(event) => updateForm("physicalState", event.target.value)}><option>正常</option><option>紧绷</option><option>睡眠不足</option><option>非常疲惫</option></select></label>
              </div>
              <button className="discipline-primary" type="submit"><ShieldCheck size={18} /> 运行纪律检查 <ChevronRight size={17} /></button>
            </form>
          ) : (
            <div className="discipline-evaluation" aria-live="polite">
              <div className="evaluation-summary">
                <span>CHECK COMPLETE</span>
                <h2>{evaluation.readiness}</h2>
                <p>{evaluation.action}</p>
                <div className="evaluation-flags">
                  {evaluation.flags.length ? evaluation.flags.map((flag) => <span key={flag}><Flame size={14} /> {flag}</span>) : <span className="calm"><CheckCircle2 size={14} /> 暂未发现明显的情绪干扰</span>}
                </div>
              </div>
              <aside className="cooldown-console">
                <span>COOLING WINDOW</span>
                <strong>{cooldown ? clockLabel(remaining) : `${evaluation.cooldownMinutes} MIN`}</strong>
                <small>{cooldown ? "计时中，请离开交易界面" : "让冲动离开峰值后再回来"}</small>
                <button type="button" onClick={startCooldown} disabled={Boolean(cooldown)}><Pause size={16} /> {cooldown ? "冷静期进行中" : "开始冷静计时"}</button>
              </aside>
              <section className="matched-rules">
                <header><span>本次命中协议</span><b>{evaluation.matchedRules.length}</b></header>
                {evaluation.matchedRules.length ? evaluation.matchedRules.map((rule) => <article key={rule.id}><Clock3 size={17} /><div><b>如果：{rule.condition}</b><p>那么：{rule.action}</p></div><span>{rule.cooldownMinutes} 分钟</span></article>) : <p>还没有匹配协议。完成本次记录后，可以为这个触发点建立一条自己的规则。</p>}
              </section>
              <section className="discipline-outcome">
                <div><span>冷静后冲动强度</span><output>{urgeAfter}/10</output><input type="range" min="0" max="10" value={urgeAfter} onChange={(event) => setUrgeAfter(event.target.value)} /></div>
                <label><span>最后怎么做了</span><select value={outcome} onChange={(event) => setOutcome(event.target.value)}><option>继续观察</option><option>取消冲动动作</option><option>仍按原计划行动</option><option>偏离了原计划</option></select></label>
                <label className="discipline-checkbox"><input type="checkbox" checked={followed} onChange={(event) => setFollowed(event.target.checked)} /><span><Check size={14} /> 我执行了自己写下的协议</span></label>
                <button type="button" className="discipline-primary" onClick={finishCheck}>保存行为证据 <ChevronRight size={17} /></button>
              </section>
              <button type="button" className="discipline-reset" onClick={() => setEvaluation(null)}>重新检查</button>
            </div>
          )}
        </section>
      ) : null}

      {tab === "map" ? (
        <TriggerMapPanel
          checks={checks}
          workflowResults={workflowResults}
          rules={rules}
          onStartCheck={() => setTab("check")}
        />
      ) : null}

      {tab === "rules" ? (
        <section className="discipline-panel rules-panel">
          <div className="rules-list">
            <header><div><span>IF / THEN PROTOCOLS</span><h2>清醒时写规则，上头时只执行</h2></div><b>{stats.activeRules} / {rules.length} 启用</b></header>
            {rules.map((rule) => <article key={rule.id} className={rule.enabled ? "active" : ""}>
              <button type="button" className="rule-toggle" aria-label={rule.enabled ? "停用协议" : "启用协议"} onClick={() => toggleRule(rule.id)}><i>{rule.enabled ? <Check size={14} /> : null}</i></button>
              <div><span>如果 · {rule.trigger}</span><b>{rule.condition}</b><p>那么 · {rule.action}</p></div>
              <aside><Clock3 size={14} /> {rule.cooldownMinutes} 分钟{rule.preset ? <small>系统协议</small> : <button type="button" aria-label="删除协议" onClick={() => removeRule(rule.id)}><Trash2 size={15} /></button>}</aside>
            </article>)}
          </div>
          <form className="new-rule-form" onSubmit={addRule}>
            <span><Plus size={14} /> NEW PROTOCOL</span><h2>新建我的协议</h2>
            <label><span>触发场景</span><select value={ruleDraft.trigger} onChange={(event) => setRuleDraft((current) => ({ ...current, trigger: event.target.value }))}>{DISCIPLINE_TRIGGERS.map((trigger) => <option key={trigger}>{trigger}</option>)}</select></label>
            <label><span>如果</span><textarea required value={ruleDraft.condition} onChange={(event) => setRuleDraft((current) => ({ ...current, condition: event.target.value }))} placeholder="描述能被自己识别的触发条件" /></label>
            <label><span>那么</span><textarea required value={ruleDraft.action} onChange={(event) => setRuleDraft((current) => ({ ...current, action: event.target.value }))} placeholder="写一个具体、可执行的小行动" /></label>
            <label><span>冷静时间</span><div className="rule-duration"><input type="number" min="2" max="60" value={ruleDraft.cooldownMinutes} onChange={(event) => setRuleDraft((current) => ({ ...current, cooldownMinutes: event.target.value }))} /><i>分钟</i></div></label>
            <button type="submit" className="discipline-primary"><Plus size={17} /> 保存协议</button>
          </form>
        </section>
      ) : null}

      {tab === "ledger" ? (
        <section className="discipline-panel ledger-panel">
          <header><div><span>BEHAVIOR EVIDENCE</span><h2>行为证据账本</h2></div><p>记录的不是盈亏，而是你有没有把决定拿回自己手里。</p></header>
          <div className="ledger-list">
            {checks.length ? checks.map((check) => <article key={check.id}>
              <div className="ledger-score"><strong>{check.urgeBefore}</strong><i /><strong>{check.urgeAfter}</strong><span>冲动变化</span></div>
              <div><header><b>{check.trigger}</b><time>{timeLabel(check.completedAt || check.createdAt)}</time></header><p>{check.readiness}</p><span>{check.outcome}</span></div>
              <aside className={check.followed ? "followed" : "missed"}>{check.followed ? <CheckCircle2 size={17} /> : <Activity size={17} />}{check.followed ? "协议已执行" : "本次有偏离"}</aside>
              <button type="button" className="ledger-delete" aria-label={`删除 ${check.trigger} 记录`} onClick={() => onDeleteCheck(check.id)}><Trash2 size={15} /></button>
            </article>) : <div className="discipline-empty"><History size={38} /><h3>还没有行为证据</h3><p>完成一次交易前检查，并记录冷静后的选择，这里就会开始形成你的纪律轨迹。</p><button type="button" onClick={() => setTab("check")}>开始第一次检查 <ChevronRight size={16} /></button></div>}
          </div>
        </section>
      ) : null}
    </main>
  );
}
