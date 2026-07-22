import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  BookOpenCheck,
  ChartNoAxesCombined,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  EyeOff,
  Flame,
  Hand,
  HeartPulse,
  History,
  LifeBuoy,
  MessageCircle,
  Moon,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { SCENARIOS } from "./workflows.js";
import { xc } from "./i18n.js";

const SCENARIO_ICONS = {
  fomo: Activity,
  loss: Flame,
  sold: ChartNoAxesCombined,
  rush: Zap,
  revenge: Target,
  review: ClipboardCheck,
  persona: BrainCircuit,
  rest: Moon,
  talk: MessageCircle,
  safety: LifeBuoy
};

const TOOL_ITEMS = [
  { id: "discipline", title: "小镜纪律协议", note: "交易前检查、触发地图与行为证据", icon: BookOpenCheck, action: "discipline" },
  { id: "fomo", title: "3 分钟冷静器", note: "把冲动和计划拆开", icon: Clock3 },
  { id: "review", title: "交易复盘卡", note: "复盘过程，不审判结果", icon: ClipboardCheck },
  { id: "snapshot", title: "今日状态快照", note: "60 秒记录决策负荷", icon: HeartPulse },
  { id: "persona", title: "交易人格自查", note: "进入 DegenDNA 48 题版本", icon: Radar, external: "persona" },
  { id: "mental", title: "心理自测中心", note: "私密、不绑定钱包、不上榜", icon: ShieldCheck, external: "mental" }
];

export default function ClinicHome({ statusCard, latestResult, disciplineStats, toneMode, language, onScenario, onTool, onOpenDiscipline }) {
  const isDegen = toneMode === "degen";
  const scenarioCopy = {
    fomo: ["The market just rallied and I am afraid of missing out", "Check whether this decision has a complete plan"],
    loss: ["I just lost and want to win it back now", "Separate the loss from the next decision"],
    sold: ["I sold, and I keep checking the chart", "Separate outcome regret from decision quality"],
    rush: ["I wrote a plan but want to change it now", "Check for new information versus short-term impulse"],
    review: ["I want to review the last trade", "Review the process without judging yourself by P&L"],
    rest: ["I know I should rest, but cannot stop checking", "Use 60 seconds to see today's decision load"],
    talk: ["My mind is messy and I just want to talk", "Separate facts from the story in your head"],
    safety: ["I need safety support", "Stop trading talk and connect with real-world help"]
  };
  const toolCopy = {
    discipline: ["Xiaojing Discipline Protocol", "Pre-trade checks, trigger maps, and behavioral evidence"],
    fomo: ["3-Minute Cooler", "Separate impulse from plan"], review: ["Trade Review Card", "Review process, not outcome"],
    snapshot: ["Today's State Snapshot", "Record decision load in 60 seconds"], persona: ["Trading Persona Check", "Open the 48-question DegenDNA assessment"],
    mental: ["Mental Health Check-In Center", "Private, not tied to a wallet, never ranked"]
  };
  return (
    <main className="clinic-home">
      <section className="clinic-intro">
        <div className="intro-copy">
          <span className="section-kicker"><Sparkles size={14} /> {isDegen ? "DEGEN DECISION CHECK" : "DECISION CALIBRATION"}</span>
          <h1>{language === "en" ? <>Before the next confirmation,<br />calibrate your current state.</> : isDegen ? <>K 线在加速，<br />你不用跟着失速。</> : <>下一次点确认前，<br />先校准现在的状态。</>}</h1>
          <p>{language === "en" ? "No market calls and no judgment. Separate facts, plans, and impulses before deciding what comes next." : isDegen ? "小镜不喊单，只负责看看现在是谁在点确认。把计划和冲动拆开，再决定下一步。" : "不判断行情，也不判断你。把事实、计划和冲动拆开，再决定下一步。"}</p>
          <div className="intro-actions">
            <button type="button" className="clinic-primary" onClick={() => onScenario(SCENARIOS[0])}>
              <Hand size={19} /> {language === "en" ? "Start State Calibration" : isDegen ? "照一下再点确认" : "开始状态校准"} <ChevronRight size={18} />
            </button>
            <button type="button" className="discipline-entry" onClick={onOpenDiscipline}>
              <BookOpenCheck size={17} /> {xc(language, "我的纪律协议", "My Discipline Protocol")}
            </button>
            <span><EyeOff size={15} /> {xc(language, "默认只保存在当前设备", "Stored only on this device by default")}</span>
          </div>
        </div>

        <aside className="status-card">
          <header>
            <div><span>MY DECISION STATE</span><h2>{xc(language, "我的决策状态", "My Decision State")}</h2></div>
            <i className={statusCard.emotion === "负荷偏高" ? "high" : ""}>{statusCard.emotion}</i>
          </header>
          <dl>
            <div><dt>{xc(language, "交易人格", "Trading Persona")}</dt><dd>{statusCard.persona}</dd></div>
            <div><dt>{xc(language, "最近触发点", "Latest Trigger")}</dt><dd>{statusCard.trigger}</dd></div>
            <div><dt>{xc(language, "建议动作", "Suggested Action")}</dt><dd>{statusCard.action}</dd></div>
            <div><dt>{xc(language, "计划轨迹", "Plan Track")}</dt><dd>{disciplineStats.total ? xc(language, `${disciplineStats.total} 次检查 · ${disciplineStats.adherence}% 计划兑现`, `${disciplineStats.total} checks · ${disciplineStats.adherence}% plan adherence`) : xc(language, "等待第一次交易前检查", "Waiting for the first pre-trade check")}</dd></div>
            <div><dt>{xc(language, "上次复盘", "Last Review")}</dt><dd>{statusCard.updatedAt}</dd></div>
          </dl>
          {latestResult ? (
            <button type="button" onClick={() => onTool({ id: "latest" })}>
              {xc(language, "查看最近结果", "View Latest Result")} <ChevronRight size={16} />
            </button>
          ) : (
            <p><Activity size={15} /> {xc(language, "完成一次检查后，这里会形成你的状态轨迹。", "Your state track appears here after the first check.")}</p>
          )}
        </aside>
      </section>

      <section className="scenario-section">
        <header className="section-heading">
          <div><span>01 / WHAT HAPPENED</span><h2>{xc(language, "现在发生了什么？", "What Is Happening Now?")}</h2></div>
          <p>{xc(language, "选最接近的情境，不需要先给自己贴标签。", "Choose the closest situation. You do not need to label yourself first.")}</p>
        </header>
        <div className="scenario-grid">
          {SCENARIOS.map((scenario) => {
            const Icon = SCENARIO_ICONS[scenario.id] || AlertTriangle;
            return (
              <button
                type="button"
                className={`scenario-card tone-${scenario.tone}`}
                key={scenario.id}
                onClick={() => onScenario(scenario)}
              >
                <Icon size={23} />
                <span><b>{language === "en" ? scenarioCopy[scenario.id]?.[0] : scenario.label}</b><small>{language === "en" ? scenarioCopy[scenario.id]?.[1] : scenario.note}</small></span>
                <ChevronRight size={17} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="toolbox-section">
        <header className="section-heading compact">
          <div><span>02 / QUICK TOOLS</span><h2>{xc(language, "整理与复盘工具", "Organize and Review")}</h2></div>
          <p>{xc(language, "需要时才深入，不要求你先承认自己有问题。", "Go deeper only when useful. You do not need to declare that something is wrong.")}</p>
        </header>
        <div className="tool-strip">
          {TOOL_ITEMS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button type="button" key={tool.id} onClick={() => onTool(tool)}>
                <Icon size={20} />
                <span><b>{language === "en" ? toolCopy[tool.id]?.[0] : tool.title}</b><small>{language === "en" ? toolCopy[tool.id]?.[1] : tool.note}</small></span>
                <ChevronRight size={15} />
              </button>
            );
          })}
        </div>
      </section>

      <footer className="clinic-boundary">
        <ShieldCheck size={18} />
        <p><b>{xc(language, "小镜的边界：", "Xiaojing's boundaries: ")}</b>{xc(language, "不做心理诊断，不预测行情，不给买卖或仓位建议。出现即时安全风险时，会停止交易话题并引导连接现实支持。", "No psychological diagnosis, market prediction, or buy, sell, leverage, or position advice. If immediate safety risk appears, trading talk stops and real-world support takes priority.")}</p>
        <History size={17} />
      </footer>
    </main>
  );
}
