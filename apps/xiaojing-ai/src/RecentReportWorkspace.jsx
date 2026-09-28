import { useState } from 'react';
import { isCurrentRecord } from '../../../public/mental-lab/src/scoring.js';
import { recentType } from '../../../public/mental-lab/src/recent-type.js';
import { humanizeReport } from '../../../public/mental-lab/src/report-copy.js';
import { mentalLink } from './mental-theme.js';
import { currentState } from '../../../public/mental-lab/src/current-state.js';

export default function RecentReportWorkspace({ theme }) {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('主动点击后，只读取当前浏览器里最近的一份新版自查，不会发送给模型。');
  function load() {
    try {
      const rows = JSON.parse(localStorage.getItem('degendna-mental-lab-records') || '[]');
      const latest = Array.isArray(rows) ? rows.find(isCurrentRecord) : null;
      setReport(latest ? humanizeReport(latest) : null);
      setMessage(latest ? '已读取本机记录，没有发给模型。' : '这里还没有保存过新版自查。你可以先去自测库，愿意时再选择本地保存。');
    } catch { setReport(null); setMessage('暂时无法读取本机记录，你仍可以直接去做自查。'); }
  }
  const type = report ? recentType(report) : null;
  const status = report ? currentState(report) : null;
  return <main className="tool-workspace persona-workspace">
    <h1>聊聊我的近期自查</h1><p>看看自己最近在经历什么，也看看哪些小事曾经帮到你。</p>
    <div className="intro-actions"><button className="primary-outline" onClick={load}>读取我保存的新版自查</button><a href={mentalLink('library', theme)}>前往自测库</a></div>
    <p role="status">{message}</p>
    {report && <section className="persona-result"><h2>{report.title}</h2>
      {status && <article className="current-state" data-state={status.kind}><h3>{status.title}</h3><p>{status.description}</p><p><strong>现在优先做什么：</strong>{status.priority}</p><details><summary>为什么得到这个结果？</summary><ul>{status.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></details>{status.caveats.map(text=><p key={text}>{text}</p>)}<h3>接下来怎么改善</h3>{status.steps.map(step=><section className="state-step" key={step.when}><small>{step.when}</small><h4>{step.title}</h4><p>{step.text}</p></section>)}<details><summary>回看调整与求助时机</summary><p>{status.checkpoint}</p><p>{status.escalation}</p></details><p>{status.boundary}</p></article>}
      {type && <article><h3>{type.name || '先不急着选一个类型'} {type.code || ''}</h3><p>{type.text}</p></article>}<p>如果想聊其中一件事，可以去“小镜聊聊”自己输入愿意分享的部分。</p></section>}
  </main>;
}
