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
import { xc } from "./i18n.js";

const INITIAL_FORM = {
  trigger: DISCIPLINE_TRIGGERS[0],
  urgeBefore: 7,
  reason: "",
  exitCondition: "",
  lossBoundary: "还没有写清",
  socialPressure: "轻微",
  physicalState: "正常"
};

const DISCIPLINE_EN = new Map([
  ["尚未形成", "Not enough data"], ["行情快速拉升", "Rapid market rally"], ["亏损后想翻本", "Wanting to win back a loss"],
  ["卖飞后想追回", "Chasing after selling early"], ["群友或社媒刺激", "Group or social-media stimulus"], ["深夜疲惫看盘", "Late-night tired chart watching"],
  ["临时偏离计划", "Last-minute plan drift"], ["其他", "Other"], ["还没有写清", "Not defined yet"], ["有模糊范围", "A vague range"],
  ["已经写进原计划", "Written into the original plan"], ["没有", "None"], ["轻微", "Mild"], ["明显", "Marked"], ["几乎由它触发", "Almost entirely triggered by it"],
  ["正常", "Normal"], ["紧绷", "Tense"], ["睡眠不足", "Sleep deprived"], ["非常疲惫", "Very tired"], ["可承受边界", "Affordable boundary"],
  ["外部刺激影响", "External stimulus"], ["身体状态", "Body state"]
]);

const DISCIPLINE_COPY_EN = new Map([
  ["冲动强度达到 7/10，且退出条件没有写清", "Urge intensity is at least 7/10 and the exit condition is still unclear"],
  ["离开交易界面，只保留价格提醒，冷静结束后重新阅读退出条件。", "Leave the trading screen, keep only price alerts, and reread the exit condition after cooling down."],
  ["亏损后想立刻用下一单把结果追回来", "After a loss, you want the next trade to win it back immediately"],
  ["当天只允许观察和复盘，不新增由情绪推动的风险决定。", "For the rest of today, observe and review only. Do not add risk decisions driven by emotion."],
  ["睡眠不足或身体已经明显疲惫", "You are sleep deprived or physically exhausted"],
  ["停止新增决定，静音行情提醒，把睡眠还给自己。", "Stop making new decisions, mute market alerts, and give yourself the sleep back."],
  ["主要理由来自他人的盈利截图、喊单或热度", "The main reason comes from other people's profit screenshots, calls, or social hype"],
  ["退出信息流，独立写下交易理由；写不出来就继续观察。", "Leave the feed and write down your own trade rationale. If you cannot, keep observing."],
  ["当我发现自己不是按原计划行动时", "When I notice that I am no longer following the original plan"],
  ["离开交易界面，写清事实、冲动和退出条件后再决定。", "Leave the trading screen and write down the facts, urge, and exit condition before deciding."],
  ["离开交易界面，冷静结束后重新阅读自己的理由和退出条件。", "Leave the trading screen and reread your rationale and exit condition after cooling down."],
  ["冲动强度偏高", "Urge intensity is high"], ["计划还没有闭环", "The plan is not complete"],
  ["外部刺激正在放大决定", "External stimulus is amplifying the decision"], ["身体状态不适合新增决定", "Your physical state is not suitable for a new decision"],
  ["先暂停，不新增决定", "Pause first; do not make a new decision"], ["进入冷静观察期", "Enter a cooling observation period"],
  ["计划基本完整，仍建议延迟确认", "The plan is mostly complete; delayed confirmation is still recommended"]
]);

function disciplineLabel(language, value) {
  return language === "en" ? DISCIPLINE_EN.get(value) || value : value;
}

function disciplineText(language, value) {
  return language === "en" ? DISCIPLINE_COPY_EN.get(value) || value : value;
}

function timeLabel(timestamp, language = "zh") {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "zh-CN", {
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

export default function DisciplineWorkspace({ rules, checks, workflowResults, language, onRulesChange, onCheckComplete, onDeleteCheck, onBack, latestResult }) {
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
        <button type="button" onClick={onBack}><ArrowLeft size={17} /> {xc(language, "返回校准台", "Back to Calibration")}</button>
        <span><ShieldCheck size={14} /> {xc(language, "本机私密 · 不连接钱包 · 不提供投资建议", "Private on this device · No wallet connection · No investment advice")}</span>
      </header>

      <section className="discipline-hero">
        <div>
          <span><Sparkles size={14} /> PERSONAL DISCIPLINE PROTOCOL</span>
          <h1>{xc(language, "小镜纪律协议", "Xiaojing Discipline Protocol")}</h1>
          <p>{xc(language, "不判断交易对错。先把最容易偏离计划的时刻，交给你清醒时写下的规则。", "This does not judge a trade. Let rules written in a clear state handle the moments when plans are easiest to abandon.")}</p>
        </div>
        <div className="discipline-stats">
          <StatCard label={xc(language, "已完成检查", "Completed Checks")} value={stats.total} note={xc(language, "行为证据", "Behavioral evidence")} />
          <StatCard label={xc(language, "计划兑现率", "Plan Adherence")} value={`${stats.adherence}%`} note={xc(language, "按自己写下的规则行动", "Actions followed written rules")} />
          <StatCard label={xc(language, "平均冲动下降", "Average Urge Drop")} value={stats.averageReduction} note={xc(language, "0-10 强度变化", "Change on a 0-10 scale")} />
          <StatCard label={xc(language, "常见触发点", "Common Trigger")} value={disciplineLabel(language, stats.topTrigger)} note={language === "en" ? `${stats.activeRules} protocols active` : `${stats.activeRules} 条协议启用`} />
        </div>
      </section>

      <nav className="discipline-tabs" aria-label={xc(language, "纪律协议功能", "Discipline protocol tools")}>
        <button type="button" className={tab === "check" ? "active" : ""} onClick={() => setTab("check")}><SlidersHorizontal size={17} /> {xc(language, "交易前检查", "Pre-Trade Check")}</button>
        <button type="button" className={tab === "map" ? "active" : ""} onClick={() => setTab("map")}><Radar size={17} /> {xc(language, "触发地图", "Trigger Map")}</button>
        <button type="button" className={tab === "rules" ? "active" : ""} onClick={() => setTab("rules")}><BookOpenCheck size={17} /> {xc(language, "我的协议", "My Protocols")}</button>
        <button type="button" className={tab === "ledger" ? "active" : ""} onClick={() => setTab("ledger")}><History size={17} /> {xc(language, "行为证据账本", "Behavior Ledger")}</button>
      </nav>

      {tab === "check" ? (
        <section className="discipline-panel discipline-check-panel">
          {!evaluation ? (
            <form onSubmit={runCheck}>
              <div className="discipline-form-head">
                <div><span>PRE-TRADE CHECK</span><h2>{xc(language, "这次决定，现在由什么在推动？", "What Is Driving This Decision Right Now?")}</h2></div>
                <label>{xc(language, "当前冲动", "Current Urge")} <output>{form.urgeBefore}/10</output><input type="range" min="0" max="10" value={form.urgeBefore} onChange={(event) => updateForm("urgeBefore", event.target.value)} /></label>
              </div>
              <fieldset>
                <legend>01 / {xc(language, "选择触发点", "Choose a Trigger")}</legend>
                <div className="trigger-options">
                  {DISCIPLINE_TRIGGERS.map((trigger) => <button type="button" key={trigger} className={form.trigger === trigger ? "active" : ""} onClick={() => updateForm("trigger", trigger)}>{disciplineLabel(language, trigger)}</button>)}
                </div>
              </fieldset>
              <div className="discipline-form-grid">
                <label><span>02 / {xc(language, "现在行动的真实理由", "The Real Reason to Act Now")}</span><textarea required value={form.reason} onChange={(event) => updateForm("reason", event.target.value)} placeholder={xc(language, "只写此刻能确认的事实，不写对行情的预测。", "Write only facts you can confirm now, not a market prediction.")} /></label>
                <label><span>03 / {xc(language, "什么情况说明原计划不再成立", "What Would Invalidate the Original Plan?")}</span><textarea required value={form.exitCondition} onChange={(event) => updateForm("exitCondition", event.target.value)} placeholder={xc(language, "写清退出、停止观察或重新评估的条件。", "Define the condition for exit, stopping observation, or reassessment.")} /></label>
              </div>
              <div className="discipline-select-grid">
                <label><span>{xc(language, "可承受边界", "Affordable Boundary")}</span><select value={form.lossBoundary} onChange={(event) => updateForm("lossBoundary", event.target.value)}>{["还没有写清","有模糊范围","已经写进原计划"].map((value)=><option key={value} value={value}>{disciplineLabel(language,value)}</option>)}</select></label>
                <label><span>{xc(language, "外部刺激影响", "External Stimulus")}</span><select value={form.socialPressure} onChange={(event) => updateForm("socialPressure", event.target.value)}>{["没有","轻微","明显","几乎由它触发"].map((value)=><option key={value} value={value}>{disciplineLabel(language,value)}</option>)}</select></label>
                <label><span>{xc(language, "身体状态", "Body State")}</span><select value={form.physicalState} onChange={(event) => updateForm("physicalState", event.target.value)}>{["正常","紧绷","睡眠不足","非常疲惫"].map((value)=><option key={value} value={value}>{disciplineLabel(language,value)}</option>)}</select></label>
              </div>
              <button className="discipline-primary" type="submit"><ShieldCheck size={18} /> {xc(language, "运行纪律检查", "Run Discipline Check")} <ChevronRight size={17} /></button>
            </form>
          ) : (
            <div className="discipline-evaluation" aria-live="polite">
              <div className="evaluation-summary">
                <span>CHECK COMPLETE</span>
                <h2>{evaluation.readiness}</h2>
                <p>{evaluation.action}</p>
                <div className="evaluation-flags">
                  {evaluation.flags.length ? evaluation.flags.map((flag) => <span key={flag}><Flame size={14} /> {flag}</span>) : <span className="calm"><CheckCircle2 size={14} /> {xc(language, "暂未发现明显的情绪干扰", "No strong emotional interference detected")}</span>}
                </div>
              </div>
              <aside className="cooldown-console">
                <span>COOLING WINDOW</span>
                <strong>{cooldown ? clockLabel(remaining) : `${evaluation.cooldownMinutes} MIN`}</strong>
                <small>{cooldown ? xc(language, "计时中，请离开交易界面", "Timer running; leave the trading screen") : xc(language, "让冲动离开峰值后再回来", "Return after the urge leaves its peak")}</small>
                <button type="button" onClick={startCooldown} disabled={Boolean(cooldown)}><Pause size={16} /> {cooldown ? xc(language, "冷静期进行中", "Cooldown Active") : xc(language, "开始冷静计时", "Start Cooldown")}</button>
              </aside>
              <section className="matched-rules">
                <header><span>{xc(language, "本次命中协议", "Matched Protocols")}</span><b>{evaluation.matchedRules.length}</b></header>
                  {evaluation.matchedRules.length ? evaluation.matchedRules.map((rule) => <article key={rule.id}><Clock3 size={17} /><div><b>{xc(language, "如果：", "If: ")}{disciplineText(language, rule.condition)}</b><p>{xc(language, "那么：", "Then: ")}{disciplineText(language, rule.action)}</p></div><span>{rule.cooldownMinutes} {xc(language, "分钟", "min")}</span></article>) : <p>{xc(language, "还没有匹配协议。完成本次记录后，可以为这个触发点建立一条自己的规则。", "No protocol matched yet. After saving this check, you can create a rule for this trigger.")}</p>}
              </section>
              <section className="discipline-outcome">
                <div><span>{xc(language, "冷静后冲动强度", "Urge After Cooling")}</span><output>{urgeAfter}/10</output><input type="range" min="0" max="10" value={urgeAfter} onChange={(event) => setUrgeAfter(event.target.value)} /></div>
                <label><span>{xc(language, "最后怎么做了", "Final Action")}</span><select value={outcome} onChange={(event) => setOutcome(event.target.value)}><option>继续观察</option><option>取消冲动动作</option><option>仍按原计划行动</option><option>偏离了原计划</option></select></label>
                <label className="discipline-checkbox"><input type="checkbox" checked={followed} onChange={(event) => setFollowed(event.target.checked)} /><span><Check size={14} /> {xc(language, "我执行了自己写下的协议", "I followed my written protocol")}</span></label>
                <button type="button" className="discipline-primary" onClick={finishCheck}>{xc(language, "保存行为证据", "Save Behavioral Evidence")} <ChevronRight size={17} /></button>
              </section>
              <button type="button" className="discipline-reset" onClick={() => setEvaluation(null)}>{xc(language, "重新检查", "Run Again")}</button>
            </div>
          )}
        </section>
      ) : null}

      {tab === "map" ? (
        <TriggerMapPanel
          checks={checks}
          workflowResults={workflowResults}
          rules={rules}
          language={language}
          onStartCheck={() => setTab("check")}
        />
      ) : null}

      {tab === "rules" ? (
        <section className="discipline-panel rules-panel">
          <div className="rules-list">
            <header><div><span>IF / THEN PROTOCOLS</span><h2>{xc(language, "状态稳定时写规则，高负荷时只执行", "Write Rules While Clear; Execute Them Under Load")}</h2></div><b>{stats.activeRules} / {rules.length} {xc(language, "启用", "active")}</b></header>
            {rules.map((rule) => <article key={rule.id} className={rule.enabled ? "active" : ""}>
              <button type="button" className="rule-toggle" aria-label={rule.enabled ? "停用协议" : "启用协议"} onClick={() => toggleRule(rule.id)}><i>{rule.enabled ? <Check size={14} /> : null}</i></button>
              <div><span>{xc(language, "如果", "If")} · {disciplineLabel(language, rule.trigger)}</span><b>{disciplineText(language, rule.condition)}</b><p>{xc(language, "那么", "Then")} · {disciplineText(language, rule.action)}</p></div>
              <aside><Clock3 size={14} /> {rule.cooldownMinutes} {xc(language, "分钟", "min")}{rule.preset ? <small>{xc(language, "系统协议", "System Protocol")}</small> : <button type="button" aria-label={xc(language, "删除协议", "Delete protocol")} onClick={() => removeRule(rule.id)}><Trash2 size={15} /></button>}</aside>
            </article>)}
          </div>
          <form className="new-rule-form" onSubmit={addRule}>
            <span><Plus size={14} /> NEW PROTOCOL</span><h2>{xc(language, "新建我的协议", "Create My Protocol")}</h2>
            <label><span>{xc(language, "触发场景", "Trigger")}</span><select value={ruleDraft.trigger} onChange={(event) => setRuleDraft((current) => ({ ...current, trigger: event.target.value }))}>{DISCIPLINE_TRIGGERS.map((trigger) => <option key={trigger} value={trigger}>{disciplineLabel(language, trigger)}</option>)}</select></label>
            <label><span>{xc(language, "如果", "If")}</span><textarea required value={disciplineText(language, ruleDraft.condition)} onChange={(event) => setRuleDraft((current) => ({ ...current, condition: event.target.value }))} placeholder={xc(language, "描述能被自己识别的触发条件", "Describe a trigger you can recognize")} /></label>
            <label><span>{xc(language, "那么", "Then")}</span><textarea required value={disciplineText(language, ruleDraft.action)} onChange={(event) => setRuleDraft((current) => ({ ...current, action: event.target.value }))} placeholder={xc(language, "写一个具体、可执行的小行动", "Write one specific, executable action")} /></label>
            <label><span>{xc(language, "冷静时间", "Cooldown")}</span><div className="rule-duration"><input type="number" min="2" max="60" value={ruleDraft.cooldownMinutes} onChange={(event) => setRuleDraft((current) => ({ ...current, cooldownMinutes: event.target.value }))} /><i>{xc(language, "分钟", "min")}</i></div></label>
            <button type="submit" className="discipline-primary"><Plus size={17} /> {xc(language, "保存协议", "Save Protocol")}</button>
          </form>
        </section>
      ) : null}

      {tab === "ledger" ? (
        <section className="discipline-panel ledger-panel">
          <header><div><span>BEHAVIOR EVIDENCE</span><h2>{xc(language, "行为证据账本", "Behavior Evidence Ledger")}</h2></div><p>{xc(language, "记录的不是盈亏，而是你有没有把决定拿回自己手里。", "This records whether you took the decision back, not profit or loss.")}</p></header>
          <div className="ledger-list">
            {checks.length ? checks.map((check) => <article key={check.id}>
              <div className="ledger-score"><strong>{check.urgeBefore}</strong><i /><strong>{check.urgeAfter}</strong><span>{xc(language, "冲动变化", "Urge Change")}</span></div>
              <div><header><b>{check.trigger}</b><time>{timeLabel(check.completedAt || check.createdAt)}</time></header><p>{check.readiness}</p><span>{check.outcome}</span></div>
              <aside className={check.followed ? "followed" : "missed"}>{check.followed ? <CheckCircle2 size={17} /> : <Activity size={17} />}{check.followed ? xc(language, "协议已执行", "Protocol Followed") : xc(language, "本次有偏离", "Protocol Drift")}</aside>
              <button type="button" className="ledger-delete" aria-label={`删除 ${check.trigger} 记录`} onClick={() => onDeleteCheck(check.id)}><Trash2 size={15} /></button>
            </article>) : <div className="discipline-empty"><History size={38} /><h3>{xc(language, "还没有行为证据", "No Behavioral Evidence Yet")}</h3><p>{xc(language, "完成一次交易前检查，并记录冷静后的选择，这里就会开始形成你的纪律轨迹。", "Complete a pre-trade check and record the choice after cooling to begin your discipline track.")}</p><button type="button" onClick={() => setTab("check")}>{xc(language, "开始第一次检查", "Start the First Check")} <ChevronRight size={16} /></button></div>}
          </div>
        </section>
      ) : null}
    </main>
  );
}
