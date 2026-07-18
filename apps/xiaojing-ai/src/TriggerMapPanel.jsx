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

const TRIGGER_TONES = ["cyan", "red", "gold", "purple", "blue", "green", "silver"];

function SummaryMetric({ label, value, note }) {
  return <article><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export default function TriggerMapPanel({ checks, workflowResults, rules, onStartCheck }) {
  const [period, setPeriod] = useState(30);
  const map = useMemo(
    () => deriveTriggerMap(checks, workflowResults, rules, period),
    [checks, workflowResults, rules, period]
  );

  return (
    <section className="discipline-panel trigger-map-panel">
      <header className="trigger-map-head">
        <div>
          <span><Radar size={14} /> PERSONAL TRIGGER MAP</span>
          <h2>个人交易触发地图</h2>
          <p>只分析你主动保存在本机的纪律检查和复盘结果，不读取钱包交易，也不推断心理疾病。</p>
        </div>
        <div className="period-switch" aria-label="触发地图时间范围">
          <button type="button" className={period === 7 ? "active" : ""} onClick={() => setPeriod(7)}>近 7 天</button>
          <button type="button" className={period === 30 ? "active" : ""} onClick={() => setPeriod(30)}>近 30 天</button>
        </div>
      </header>

      <section className="trigger-summary">
        <div className="trigger-diagnosis">
          <span><Sparkles size={14} /> {map.confidence}</span>
          <h3>{map.topTrigger ? map.topTrigger.trigger : "等待第一次行为记录"}</h3>
          <p>{map.insight}</p>
          <div><Target size={16} /><span><b>下一条纪律</b>{map.focus}</span></div>
        </div>
        <div className="trigger-summary-metrics">
          <SummaryMetric label="观察样本" value={map.total} note={`${map.completedChecks} 次纪律检查`} />
          <SummaryMetric label="计划兑现率" value={`${map.adherence}%`} note="只统计纪律检查" />
          <SummaryMetric label="平均冲动下降" value={map.averageReduction} note="0-10 强度档位" />
          <SummaryMetric label="高发时段" value={map.topTime?.count ? map.topTime.label : "待观察"} note={map.topTime?.count ? map.topTime.detail : "暂无时间规律"} />
        </div>
      </section>

      {map.total ? (
        <div className="trigger-map-grid">
          <section className="trigger-frequency">
            <header><div><span>01 / TRIGGER FREQUENCY</span><h3>高频触发点</h3></div><small>次数与平均负荷</small></header>
            <div>
              {map.triggerStats.map((item, index) => (
                <article className={`tone-${TRIGGER_TONES[index % TRIGGER_TONES.length]}`} key={item.trigger}>
                  <div><b>{item.trigger}</b><span>{item.count} 次</span></div>
                  <i><b style={{ width: `${item.ratio}%` }} /></i>
                  <small>平均负荷 {item.averageIntensity}/100</small>
                </article>
              ))}
            </div>
          </section>

          <section className="trigger-time-map">
            <header><div><span>02 / TIME WINDOW</span><h3>高负荷时段</h3></div><Clock3 size={18} /></header>
            <div>
              {map.timeStats.map((item) => (
                <article key={item.id} className={item.count === map.topTime?.count && item.count ? "peak" : ""}>
                  <span>{item.label}</span><small>{item.detail}</small>
                  <strong>{item.count}</strong><i><b style={{ height: `${Math.max(5, item.ratio)}%` }} /></i>
                  <em>{item.count ? `${item.averageIntensity} 负荷` : "暂无"}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="trigger-trend">
            <header><div><span>03 / BEHAVIOR TREND</span><h3>触发与纪律趋势</h3></div><small>柱高代表记录密度</small></header>
            <div className="trend-chart">
              {map.trend.map((item) => (
                <article key={item.label} title={`${item.count} 条记录 · 平均负荷 ${item.intensity}`}>
                  <div><i style={{ height: `${item.ratio}%` }} /><b>{item.count}</b></div>
                  <span>{item.label}</span>
                  <small>{item.adherence == null ? "-" : `${item.adherence}% 执行`}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="protocol-effectiveness">
            <header><div><span>04 / PROTOCOL EFFECT</span><h3>协议有效性</h3></div><ShieldCheck size={18} /></header>
            {map.protocolStats.length ? (
              <div>
                {map.protocolStats.slice(0, 4).map((item, index) => (
                  <article key={item.id}>
                    <strong>{String(index + 1).padStart(2, "0")}</strong>
                    <div><b>{item.rule.trigger}</b><p>{item.rule.action}</p></div>
                    <span><b>{item.averageReduction}</b>档下降<small>{item.adherence}% 执行 · {item.count} 次</small></span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="protocol-empty"><ShieldCheck size={28} /><p>记录命中协议后的冷静结果，这里会比较哪条规则真正对你有效。</p></div>
            )}
          </section>
        </div>
      ) : (
        <div className="trigger-map-empty">
          <Radar size={52} />
          <h3>地图还没有开始生长</h3>
          <p>完成一次交易前检查，记录冷静前后的冲动变化。小镜会从真实行为中找规律，不会凭空给你贴标签。</p>
          <button type="button" onClick={onStartCheck}>开始第一次检查 <ChevronRight size={16} /></button>
        </div>
      )}

      <footer className="trigger-map-boundary">
        <History size={15} />
        <p>触发地图是行为复盘摘要，不是心理诊断、风险评级或交易建议。样本少时只显示趋势，不做确定性结论。</p>
        <Activity size={15} />
      </footer>
    </section>
  );
}
