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

export default function ClinicHome({ statusCard, latestResult, disciplineStats, toneMode, onScenario, onTool, onOpenDiscipline }) {
  const isDegen = toneMode === "degen";
  return (
    <main className="clinic-home">
      <section className="clinic-intro">
        <div className="intro-copy">
          <span className="section-kicker"><Sparkles size={14} /> {isDegen ? "DEGEN DECISION CHECK" : "DECISION CALIBRATION"}</span>
          <h1>{isDegen ? <>K 线在加速，<br />你不用跟着失速。</> : <>下一次点确认前，<br />先校准现在的状态。</>}</h1>
          <p>{isDegen ? "小镜不喊单，只负责看看现在是谁在点确认。把计划和冲动拆开，再决定下一步。" : "不判断行情，也不判断你。把事实、计划和冲动拆开，再决定下一步。"}</p>
          <div className="intro-actions">
            <button type="button" className="clinic-primary" onClick={() => onScenario(SCENARIOS[0])}>
              <Hand size={19} /> {isDegen ? "照一下再点确认" : "开始状态校准"} <ChevronRight size={18} />
            </button>
            <button type="button" className="discipline-entry" onClick={onOpenDiscipline}>
              <BookOpenCheck size={17} /> 我的纪律协议
            </button>
            <span><EyeOff size={15} /> 默认只保存在当前设备</span>
          </div>
        </div>

        <aside className="status-card">
          <header>
            <div><span>MY DECISION STATE</span><h2>我的决策状态</h2></div>
            <i className={statusCard.emotion === "负荷偏高" ? "high" : ""}>{statusCard.emotion}</i>
          </header>
          <dl>
            <div><dt>交易人格</dt><dd>{statusCard.persona}</dd></div>
            <div><dt>最近触发点</dt><dd>{statusCard.trigger}</dd></div>
            <div><dt>建议动作</dt><dd>{statusCard.action}</dd></div>
            <div><dt>计划轨迹</dt><dd>{disciplineStats.total ? `${disciplineStats.total} 次检查 · ${disciplineStats.adherence}% 计划兑现` : "等待第一次交易前检查"}</dd></div>
            <div><dt>上次复盘</dt><dd>{statusCard.updatedAt}</dd></div>
          </dl>
          {latestResult ? (
            <button type="button" onClick={() => onTool({ id: "latest" })}>
              查看最近结果 <ChevronRight size={16} />
            </button>
          ) : (
            <p><Activity size={15} /> 完成一次检查后，这里会形成你的状态轨迹。</p>
          )}
        </aside>
      </section>

      <section className="scenario-section">
        <header className="section-heading">
          <div><span>01 / WHAT HAPPENED</span><h2>现在发生了什么？</h2></div>
          <p>选最接近的情境，不需要先给自己贴标签。</p>
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
                <span><b>{scenario.label}</b><small>{scenario.note}</small></span>
                <ChevronRight size={17} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="toolbox-section">
        <header className="section-heading compact">
          <div><span>02 / QUICK TOOLS</span><h2>整理与复盘工具</h2></div>
          <p>需要时才深入，不要求你先承认自己有问题。</p>
        </header>
        <div className="tool-strip">
          {TOOL_ITEMS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button type="button" key={tool.id} onClick={() => onTool(tool)}>
                <Icon size={20} />
                <span><b>{tool.title}</b><small>{tool.note}</small></span>
                <ChevronRight size={15} />
              </button>
            );
          })}
        </div>
      </section>

      <footer className="clinic-boundary">
        <ShieldCheck size={18} />
        <p><b>小镜的边界：</b>不做心理诊断，不预测行情，不给买卖或仓位建议。出现即时安全风险时，会停止交易话题并引导连接现实支持。</p>
        <History size={17} />
      </footer>
    </main>
  );
}
