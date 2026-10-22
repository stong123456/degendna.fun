import { humanizeReport } from './report-copy.js';
import { currentState } from './current-state.js';
import { recentType } from './recent-type.js';
import { insightsText } from './result-insights.js';
import { isCurrentRecord } from './scoring.js';

export function privateReportText(raw) {
  if (!isCurrentRecord(raw)) throw new Error('请使用当前版本的有效报告。');
  const result = humanizeReport(raw), status = currentState(result), type = recentType(result);
  return ['DegenDNA 私密自查报告',result.title,`观察期：${result.scope}`,`生成于：${result.createdAt}`,`题库版本：${result.version}`,
    '仅依据本次自报回答，原创工具，尚未经临床验证，不是诊断。请保管文件，不建议公开分享。',
    status.title,status.description,`现在优先：${status.priority}`,...status.reasons,...status.caveats,
    ...status.steps.map(s=>`${s.when} · ${s.title}\n${s.text}`),status.checkpoint,status.escalation,
    ...(type ? [`近期类型：${type.name || '暂不选主类型'}`,type.text] : []),
    ...insightsText(result),result.summary,...result.warnings,
    ...result.domains.flatMap(d=>[d.humanTitle || d.label,d.interpretation,d.care,...(d.hypothesis ? [d.hypothesis] : []),...d.evidence.map(e=>`${e.text}：${e.response}`),`今天先试这一小步：${d.nextStep || d.action}`,`边界：${d.limit}`]),
    ...result.context.map(e=>`${e.question}：${e.label}`),
    ...result.notices.flatMap(n=>[n.title,n.text,...n.evidence.map(e=>`${e.text}：${e.response}`)]),
    ...result.patterns.map(p=>`${p.title}：${p.text}`),result.support.title,result.support.text,...result.support.reasons,...result.limitations].join('\n\n');
}
