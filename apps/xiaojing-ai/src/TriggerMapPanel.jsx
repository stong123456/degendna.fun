import { useMemo, useState } from "react";
import {
  Activity,
  ChevronRight,
  Clock3,
  History,
  Radar,
  ShieldCheck,
  Sparkles,
  Target
} from "lucide-react";
import { deriveTriggerMap } from "./discipline.js";
import { xc } from "./i18n.js";

const TRIGGER_TONES = ["cyan", "red", "gold", "purple", "blue", "green", "silver"];

const TRIGGER_EN = new Map([
  ["行情快速拉升", "Rapid market rally"], ["亏损后想翻本", "Wanting to win back a loss"],
  ["卖飞后想追回", "Chasing after selling early"], ["群友或社媒刺激", "Group or social-media stimulus"],
  ["深夜疲惫看盘", "Late-night tired chart watching"], ["临时偏离计划", "Last-minute plan drift"], ["其他", "Other"]
]);

const TIME_EN = new Map([["深夜", "Late Night"], ["上午", "Morning"], ["下午", "Afternoon"], ["晚间", "Evening"]]);
const PROTOCOL_COPY_EN = new Map([
  ["离开交易界面，只保留价格提醒，冷静结束后重新阅读退出条件。", "Leave the trading screen, keep only price alerts, and reread the exit condition after cooling down."],
  ["当天只允许观察和复盘，不新增由情绪推动的风险决定。", "Observe and review only today. Do not add emotion-driven risk decisions."],
  ["停止新增决定，静音行情提醒，把睡眠还给自己。", "Stop making new decisions, mute market alerts, and give yourself the sleep back."],
  ["退出信息流，独立写下交易理由；写不出来就继续观察。", "Leave the feed and write your own rationale. If you cannot, keep observing."]
]);

function triggerLabel(language, value) {
  return language === "en" ? TRIGGER_EN.get(value) || value : value;
}

function timeBucketLabel(language, value) {
  return language === "en" ? TIME_EN.get(value) || value : value;
}

function protocolCopy(language, value) {
  return language === "en" ? PROTOCOL_COPY_EN.get(value) || value : value;
}

function SummaryMetric({ label, value, note }) {
  return <article><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export default function TriggerMapPanel({ checks, workflowResults, rules, language, onStartCheck }) {
  const [period, setPeriod] = useState(30);
  const map = useMemo(
    () => deriveTriggerMap(checks, workflowResults, rules, period),
    [checks, workflowResults, rules, period]
  );
  const displayTrigger = map.topTrigger ? triggerLabel(language, map.topTrigger.trigger) : "";
  const displayTime = map.topTime?.count ? timeBucketLabel(language, map.topTime.label) : "";
  const confidence = language === "en"
    ? map.total >= 10 ? "Profile Stabilized" : map.total >= 4 ? "Initial Pattern Emerging" : "Building Your Pattern"
    : map.confidence;
  const insight = language === "en"
    ? map.total
      ? `Over the last ${period} days, high decision load appeared most often around “${displayTrigger}”${displayTime ? `, especially in the ${displayTime.toLowerCase()}` : ""}. ${map.completedChecks ? `After discipline checks, urges changed by ${map.averageReduction > 0 ? `an average drop of ${map.averageReduction}` : map.averageReduction < 0 ? `an average rise of ${Math.abs(map.averageReduction)}` : "0"} points.` : "Keep completing pre-trade checks so the map can verify which protocols actually help."}`
      : "There are not enough records yet. Complete your first pre-trade check and the trigger map will begin growing from real behavior."
    : map.insight;
  const focus = language === "en"
    ? !map.total
      ? "Start with one familiar urge. You do not need to record every problem at once."
      : map.completedChecks < 3
        ? `Record three before-and-after cooling checks for “${displayTrigger}”.`
        : map.adherence < 70
          ? "Keep only one easy protocol next and build consistency first."
          : map.averageReduction <= 0
            ? "Current cooling actions are not reducing the urge yet. Make the action smaller and extend time away from the screen."
            : `Keep the protocol that is working for “${triggerLabel(language, map.bestProtocol?.rule?.trigger || map.topTrigger.trigger)}”.`
    : map.focus;

  return (
    <section className="discipline-panel trigger-map-panel">
      <header className="trigger-map-head">
        <div>
          <span><Radar size={14} /> PERSONAL TRIGGER MAP</span>
          <h2>{xc(language, "个人交易触发地图", "Personal Trading Trigger Map")}</h2>
          <p>{xc(language, "只分析你主动保存在本机的纪律检查和复盘结果，不读取钱包交易，也不推断心理疾病。", "Uses only discipline checks and reviews you saved locally. It does not read wallet trades or infer mental illness.")}</p>
        </div>
        <div className="period-switch" aria-label="触发地图时间范围">
          <button type="button" className={period === 7 ? "active" : ""} onClick={() => setPeriod(7)}>{xc(language, "近 7 天", "Last 7 Days")}</button>
          <button type="button" className={period === 30 ? "active" : ""} onClick={() => setPeriod(30)}>{xc(language, "近 30 天", "Last 30 Days")}</button>
        </div>
      </header>

      <section className="trigger-summary">
        <div className="trigger-diagnosis">
          <span><Sparkles size={14} /> {confidence}</span>
          <h3>{map.topTrigger ? displayTrigger : xc(language, "等待第一次行为记录", "Waiting for the First Behavior Record")}</h3>
          <p>{insight}</p>
          <div><Target size={16} /><span><b>{xc(language, "下一条纪律", "Next Discipline")}</b>{focus}</span></div>
        </div>
        <div className="trigger-summary-metrics">
          <SummaryMetric label={xc(language, "观察样本", "Observed Samples")} value={map.total} note={language === "en" ? `${map.completedChecks} discipline checks` : `${map.completedChecks} 次纪律检查`} />
          <SummaryMetric label={xc(language, "计划兑现率", "Plan Adherence")} value={`${map.adherence}%`} note={xc(language, "只统计纪律检查", "Discipline checks only")} />
          <SummaryMetric label={xc(language, "平均冲动下降", "Average Urge Drop")} value={map.averageReduction} note={xc(language, "0-10 强度档位", "0-10 intensity scale")} />
          <SummaryMetric label={xc(language, "高发时段", "Peak Time") } value={map.topTime?.count ? displayTime : xc(language, "待观察", "Pending") } note={map.topTime?.count ? map.topTime.detail : xc(language, "暂无时间规律", "No time pattern yet")} />
        </div>
      </section>

      {map.total ? (
        <div className="trigger-map-grid">
          <section className="trigger-frequency">
            <header><div><span>01 / TRIGGER FREQUENCY</span><h3>{xc(language, "高频触发点", "Frequent Triggers")}</h3></div><small>{xc(language, "次数与平均负荷", "Frequency and average load")}</small></header>
            <div>
              {map.triggerStats.map((item, index) => (
                <article className={`tone-${TRIGGER_TONES[index % TRIGGER_TONES.length]}`} key={item.trigger}>
                  <div><b>{triggerLabel(language, item.trigger)}</b><span>{language === "en" ? `${item.count} ${item.count === 1 ? "time" : "times"}` : `${item.count} 次`}</span></div>
                  <i><b style={{ width: `${item.ratio}%` }} /></i>
                  <small>{xc(language, "平均负荷", "Average load")} {item.averageIntensity}/100</small>
                </article>
              ))}
            </div>
          </section>

          <section className="trigger-time-map">
            <header><div><span>02 / TIME WINDOW</span><h3>{xc(language, "高负荷时段", "High-Load Time Windows")}</h3></div><Clock3 size={18} /></header>
            <div>
              {map.timeStats.map((item) => (
                <article key={item.id} className={item.count === map.topTime?.count && item.count ? "peak" : ""}>
                  <span>{timeBucketLabel(language, item.label)}</span><small>{item.detail}</small>
                  <strong>{item.count}</strong><i><b style={{ height: `${Math.max(5, item.ratio)}%` }} /></i>
                  <em>{item.count ? `${item.averageIntensity} ${xc(language, "负荷", "load")}` : xc(language, "暂无", "None")}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="trigger-trend">
            <header><div><span>03 / BEHAVIOR TREND</span><h3>{xc(language, "触发与纪律趋势", "Trigger and Discipline Trend")}</h3></div><small>{xc(language, "柱高代表记录密度", "Bar height represents record density")}</small></header>
            <div className="trend-chart">
              {map.trend.map((item) => (
                <article key={item.label} title={language === "en" ? `${item.count} records · average load ${item.intensity}` : `${item.count} 条记录 · 平均负荷 ${item.intensity}`}>
                  <div><i style={{ height: `${item.ratio}%` }} /><b>{item.count}</b></div>
                  <span>{item.label}</span>
                  <small>{item.adherence == null ? "-" : `${item.adherence}% ${xc(language, "执行", "followed")}`}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="protocol-effectiveness">
            <header><div><span>04 / PROTOCOL EFFECT</span><h3>{xc(language, "协议有效性", "Protocol Effectiveness")}</h3></div><ShieldCheck size={18} /></header>
            {map.protocolStats.length ? (
              <div>
                {map.protocolStats.slice(0, 4).map((item, index) => (
                  <article key={item.id}>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <div><b>{triggerLabel(language, item.rule.trigger)}</b><p>{protocolCopy(language, item.rule.action)}</p></div>
                    <span><b>{item.averageReduction}</b>{xc(language, "档下降", " point drop")}<small>{item.adherence}% {xc(language, "执行", "followed")} · {item.count} {xc(language, "次", "checks")}</small></span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="protocol-empty"><ShieldCheck size={28} /><p>{xc(language, "记录命中协议后的冷静结果，这里会比较哪条规则真正对你有效。", "Record what happened after a protocol matched to compare which rules actually help.")}</p></div>
            )}
          </section>
        </div>
      ) : (
        <div className="trigger-map-empty">
          <Radar size={52} />
          <h3>{xc(language, "地图还没有开始生长", "The Map Has Not Started Growing Yet")}</h3>
          <p>{xc(language, "完成一次交易前检查，记录冷静前后的冲动变化。小镜会从真实行为中找规律，不会凭空给你贴标签。", "Complete a pre-trade check and record urge changes before and after cooling. Xiaojing finds patterns in real behavior instead of inventing labels.")}</p>
          <button type="button" onClick={onStartCheck}>{xc(language, "开始第一次检查", "Start the First Check")} <ChevronRight size={16} /></button>
        </div>
      )}

      <footer className="trigger-map-boundary">
        <History size={15} />
        <p>{xc(language, "触发地图是行为复盘摘要，不是心理诊断、风险评级或交易建议。样本少时只显示趋势，不做确定性结论。", "The trigger map is a behavioral review summary, not a diagnosis, risk rating, or trading recommendation. Small samples show trends only.")}</p>
        <Activity size={15} />
      </footer>
    </section>
  );
}
