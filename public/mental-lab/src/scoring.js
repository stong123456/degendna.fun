import { contextQuestions, reportVersion, responseScale } from "./assessments.js";

export const sources = [
  { title: "COSMIN：内容效度与测量质量", url: "https://www.cosmin.nl/" },
  { title: "CDC：认知访谈与问卷评价", url: "https://www.cdc.gov/nchs/ccqder/question-evaluation/cognitive-interviewing.html" },
  { title: "NICE NG225：自伤支持，不用分数预测危险", url: "https://www.nice.org.uk/guidance/ng225/chapter/recommendations" },
  { title: "NIMH：何时寻求心理健康帮助", url: "https://www.nimh.nih.gov/health/publications/my-mental-health-do-i-need-help" },
  { title: "NHLBI：睡眠问题需要完整评估", url: "https://www.nhlbi.nih.gov/health/insomnia/diagnosis" },
  { title: "WHO：压力中的自我照顾", url: "https://www.who.int/publications/i/item/9789240003927" }
];

export const isAnswer = (value) => Number.isInteger(value) && value >= 0 && value <= 4;
export const isCurrentRecord = (record) => Boolean(
  record?.schemaVersion === 2 && record.version === reportVersion && !record.safetyTriggered &&
  typeof record.id === "string" && typeof record.title === "string" && Number.isFinite(Date.parse(record.createdAt)) &&
  Array.isArray(record.domains) && record.domains.length > 0 && record.domains.every((domain) =>
    domain && typeof domain.key === "string" && typeof domain.label === "string" &&
    Number.isInteger(domain.answered) && Number.isInteger(domain.frequent) &&
    Array.isArray(domain.evidence) && domain.evidence.every((item) => item && typeof item.id === "string" && typeof item.text === "string")) &&
  ["context", "patterns", "notices", "plan", "warnings", "limitations"].every((key) => Array.isArray(record[key])) &&
  record.support && Array.isArray(record.support.reasons)
);
const frequency = (value) => responseScale.find((option) => option.value === value)?.zh;

function contextReport(context) {
  return contextQuestions.map((question) => {
    const option = question.options.find(([value]) => value === context[question.id]);
    return { id: question.id, question: question.text, value: option?.[0] ?? "skip", label: option?.[1] ?? "未提供", provided: Boolean(option && option[0] !== "skip") };
  });
}

function domainReport(domain, answers) {
  const evidence = domain.items.filter((item) => isAnswer(answers[item.id])).map((item) => ({
    id: item.id, text: item.text, value: answers[item.id], response: frequency(answers[item.id])
  }));
  const answered = evidence.length;
  const total = domain.items.length;
  const frequent = evidence.filter((item) => item.value >= 3).length;
  const occasional = evidence.filter((item) => item.value === 2).length;
  const infrequent = evidence.filter((item) => item.value <= 1).length;
  // A conservative display-completeness rule, not a clinical cut-off or confidence level.
  const interpretable = answered >= 3 && answered / total >= 0.75;
  const resource = domain.kind === "resource";
  let interpretation;
  if (!interpretable) interpretation = `本组只提供了 ${answered}/${total} 项有效频率回答，暂不概括这一方面。跳过不会按“从不”计算。`;
  else if (resource && frequent) interpretation = `你在 ${frequent}/${answered} 项资源实践或体验中选择了“经常 / 几乎总是”。这些是可以进一步了解的现有支点，不会抵消其他困扰。`;
  else if (resource) interpretation = `已回答的 ${answered} 项中，没有选择“经常 / 几乎总是”。这只说明本组资源在这段时间没有被频繁报告，也可能是没有相应需要、机会或支持条件。`;
  else if (frequent) interpretation = `${frequent}/${answered} 项困扰体验被报告为“经常 / 几乎总是”。值得结合具体情境和生活影响进一步了解；这不是疾病严重程度分级。`;
  else if (occasional) interpretation = `其中 ${occasional}/${answered} 项选择了“有时”，没有项目选择“经常 / 几乎总是”。偶尔发生的体验也可能让人很难受，频率不能代替强度。`;
  else interpretation = `本组已回答项目均为“从不 / 很少”。这不能排除未被问到的困扰，也不构成“心理健康正常”的证明。`;
  return {
    key: domain.key, label: domain.label, kind: domain.kind, meaning: domain.meaning, limit: domain.limit,
    action: domain.action, answered, total, frequent, occasional, infrequent, interpretable, interpretation, evidence,
    reflection: resource ? "哪一种支持确实对你有帮助？如果难以获得，主要受什么现实条件限制？" : "最近一次出现这种体验是什么情境？持续多久、感受多强，最影响哪一件事？"
  };
}

function supportRecommendation(context, answered) {
  const map = Object.fromEntries(context.map((entry) => [entry.id, entry.value]));
  if ([map.work, map.care, map.relations].includes("substantial") || map.intensity === "overwhelming") return {
    title: "优先安排现实支持与专业评估",
    text: "你报告困扰很难承受，或必要任务、基本生活受到了较大影响。建议尽快联系合格的心理健康专业人员或医疗服务，并请可信任的人协助眼前的生活需要。不必等待困扰满两周。若无法保障基本安全，请寻求即时帮助。",
    reasons: context.filter((entry) => entry.value === "substantial" || entry.value === "overwhelming").map((entry) => `${entry.question}：${entry.label}`)
  };
  const reasons = context.filter((entry) => entry.value === "clear" || entry.value === "worse" || ["weeks", "months", "long"].includes(entry.value)).map((entry) => `${entry.question}：${entry.label}`);
  if (reasons.length) return {
    title: "考虑进一步的专业支持",
    text: "你提到了持续、加重或明显影响生活的困扰。可以预约心理健康专业人员或先与医生讨论。专业评估会结合情境、身体状况和个人经历，而不只看这些回答。",
    reasons
  };
  return {
    title: answered ? "按需要选择支持，不必等一个高分" : "先保留判断，支持入口仍然开放",
    text: "目前的信息不足以判断你是否需要治疗。你可以先记录体验与生活影响，也可以直接寻求帮助。即使困扰很少出现，只要让你难以承受，就值得认真对待。",
    reasons: [context.some((entry) => entry.provided) ? "未提供上述持续、加重或明显影响生活的组合信息；这不等于没有困扰。" : "生活影响、持续时间和变化尚未提供。"]
  };
}

const patternPairs = {
  quick: [["load", "distress", "精力负担与情绪困扰同时被报告", "可以一起记录休息情况和困扰情境，不据此断定谁导致谁。"]],
  mood: [["mood", "daily", "低落体验与日常行动困难同时被报告", "讨论困扰时，把情绪感受和具体做事困难一起告诉支持者。"], ["self_view", "daily", "自我苛责与日常困难同时被报告", "实际处境和可获得的帮助可能比继续要求自己更值得先讨论。"]],
  anxiety: [["worry", "checking", "担心与检查、回避体验同时被报告", "观察一次检查后的安心持续多久，不据此认定存在强迫症。"], ["worry", "tension", "担心与紧张体验同时被报告", "同时记录思考和身体感受；身体不适仍应按需要就医。"]],
  stress: [["demands", "rumination", "任务负担与反复思考同时被报告", "可能需要同时讨论外部安排和休息空间，而不只是提高效率。"]],
  sleep: [["sleep", "night_screen", "睡眠困扰与夜间信息占用同时被报告", "可在睡眠日记里并列记录，两者的因果方向尚不确定。"], ["sleep", "daytime", "睡眠体验与日间困难同时被报告", "向医生说明夜间与白天的具体情况，有助于获得完整评估。"]],
  trading: [["market_pull", "loss_reaction", "信息牵引与亏损后的操作冲动同时被报告", "先分清外部消息、情绪和操作之间的顺序，不用新的操作急于证明自己。"], ["exposure", "life_emotion", "资金边界与生活困扰同时被报告", "优先讨论基本生活资金和现实支持；不能据此诊断交易成瘾。"]],
  support: [["barriers", "isolation", "求助顾虑与孤独体验同时被报告", "从安全、低压力的联系开始，不要求你向不信任的人披露。"]]
};

function noticesFor(assessment, answers) {
  const definitions = {
    financial: ["单独关注资金与生活安全", "你报告过涉及资金边界、债务或大亏后加风险的行为。即使次数不多，也值得暂停追加生活资金，与可信任的人或正规财务支持服务讨论。这不是投资建议，也不据此推断自伤危险。"],
    sleepiness: ["单独关注日间清醒与安全", "你报告过白天难以保持清醒。感到困倦时不要驾驶或操作危险设备；反复发生或明显影响生活时，请联系医疗人员。"],
    alcohol: ["单独关注饮酒应对", "你报告过用饮酒应对情绪。可与医疗或心理健康专业人员讨论更安全的支持方式；本工具不判断依赖程度，也不提供自行停药或戒断指导。"]
  };
  return Object.entries(definitions).flatMap(([type, [title, text]]) => {
    const evidence = assessment.items.filter((item) => item.notice === type && isAnswer(answers[item.id]) && answers[item.id] > 0).map((item) => ({ id: item.id, text: item.text, response: frequency(answers[item.id]) }));
    return evidence.length ? [{ type, title, text, evidence }] : [];
  });
}

export function scoreAssessment(assessment, answers = {}, context = {}) {
  const safetyTriggered = context.safety === "yes" || assessment.items.some((item) => item.riskFlag && isAnswer(answers[item.id]) && answers[item.id] > 0);
  if (assessment.safetyOnly || safetyTriggered) return {
    schemaVersion: 2, version: reportVersion, id: assessment.id, safetyTriggered: true, score: null,
    title: "先查看安全支持", domains: [], summary: "出现过自伤想法值得认真对待，但本工具不预测危险程度。若此刻可能伤害自己，请立即联系当地紧急服务或身边可信任的人。", createdAt: new Date().toISOString()
  };
  const answeredItems = assessment.items.filter((item) => isAnswer(answers[item.id]));
  const domains = assessment.domains.map((domain) => domainReport(domain, answers));
  const contextEntries = contextReport(context);
  const burden = domains.filter((domain) => domain.kind === "burden" && domain.interpretable);
  const resources = domains.filter((domain) => domain.kind === "resource" && domain.interpretable);
  const salient = burden.filter((domain) => domain.frequent > 0);
  const available = resources.filter((domain) => domain.frequent > 0);
  const summary = !answeredItems.length ? "尚无有效频率回答，暂不生成状态判断。你仍可查看一般建议和支持入口。"
    : !domains.some((domain) => domain.interpretable) ? "目前各组回答覆盖不足，暂不概括状态。下面只呈现你实际提供的回答。"
      : `在${assessment.scope}的回答中，${salient.length ? `“${salient.map((domain) => domain.label).join("、")}”有较常出现的困扰条目` : burden.length ? "覆盖足够的困扰组中，未报告经常或几乎总是出现的条目" : "困扰组覆盖不足，暂不概括其频率"}。${available.length ? `“${available.map((domain) => domain.label).join("、")}”有较常报告的资源体验。` : "资源需要结合实际机会和使用情境进一步了解。"}这是一份回答摘要，不是诊断或人格结论。`;
  const patterns = (patternPairs[assessment.id] || []).flatMap(([a, b, title, text]) => {
    const pair = [a, b].map((key) => domains.find((domain) => domain.key === key));
    return pair.every((domain) => domain?.interpretable && domain.frequent >= 2) ? [{ title, text, evidence: pair.map((domain) => `${domain.label}：${domain.frequent}/${domain.answered} 项选择经常或几乎总是`) }] : [];
  });
  const warnings = [];
  if (answeredItems.length < assessment.items.length) warnings.push("跳过或未回答的项目不按零分计入；资料较少的内容组不作概括。不能据此与完整回答比较。");
  if (answeredItems.length >= 6 && new Set(answeredItems.map((item) => answers[item.id])).size === 1) warnings.push("本次频率回答相同。这可以是真实情况，也可回看是否区分了困扰与资源题、是否遇到相应情境；系统不会因此判定回答无效。");
  const contextualConflict = contextEntries.some((entry) => entry.value === "none" && entry.id === "duration") && salient.length > 0;
  if (contextualConflict) warnings.push("你报告了较常出现的困扰条目，同时选择没有相应困扰。这可能反映不同理解或情境，请结合原题再看，系统不替你纠正答案。");
  const support = supportRecommendation(contextEntries, answeredItems.length);
  const selected = [...salient.slice(0, 2), ...available.slice(0, 1)];
  const plan = selected.map((domain) => ({ title: domain.kind === "resource" ? "保留一个现有支点" : "选择一个小行动", text: domain.action, reason: `${domain.label}中 ${domain.frequent}/${domain.answered} 项较常出现。` }));
  if (!plan.length) plan.push({ title: "从一次具体体验开始", text: "记录发生的事情、当时的感受和对生活的影响。无需为了补足报告而强行作答。", reason: "目前没有足够的个体信息支持更具体的行动匹配。" });
  plan.push({ title: "接下来一周", text: "选一个最可行的行动，观察它是否有帮助。没有改善时可以调整，也可以请人协助，不把执行程度当成自律成绩。", reason: "这是一般的自我观察安排，不是治疗处方。" });
  plan.push({ title: "准备一次支持对话", text: "可以带上困扰何时开始、影响哪些必要任务、近期身体或睡眠变化，以及已经试过的方法。涉及药物时与开药人员讨论，不自行调整。", reason: support.title });
  return {
    schemaVersion: 2, version: reportVersion, id: assessment.id, title: assessment.title, scope: assessment.scope,
    score: null, safetyTriggered: false, answered: answeredItems.length, totalItems: assessment.items.length,
    skipped: assessment.items.filter((item) => answers[item.id] === "skip").length,
    summary, domains, context: contextEntries, patterns, notices: noticesFor(assessment, answers), support, plan, warnings,
    limitations: [
      "面向成年人自我观察的原创题库，尚未经过目标人群认知访谈、信效度研究或临床验证。未成年人请使用适龄服务并寻求可信任的成人或专业支持。",
      "内容组按主题组织，不是已验证的心理学分量表；项目数量与频率分布不是疾病严重度、百分位、能力或危险等级。",
      "频率不等于强度、后果或原因；没有询问到、没有回答或很少发生，都不等于不存在重要困难。本报告也不能判断或排除安全风险。",
      "回答可能受当前情绪、回忆、情境机会和题意理解影响。资源与困扰可同时存在，不能相互抵消。",
      "复测只适合回看同一模块、同一版本、相同已答项目的变化；观察期重叠、情境变化和测量误差都可能影响结果，不能证明改善或治疗效果。"
    ], createdAt: new Date().toISOString()
  };
}

// Keep modules and versions separate. There is deliberately no composite score.
export function buildCompositeProfile(results) {
  const latest = new Map();
  for (const result of results) if (isCurrentRecord(result) && !latest.has(result.id)) latest.set(result.id, result);
  return { modules: [...latest.values()], legacyCount: results.filter((result) => !isCurrentRecord(result)).length };
}

export function compareRecords(current, previous) {
  if (!isCurrentRecord(current) || !isCurrentRecord(previous) || current.id !== previous.id || current.version !== previous.version || current.scope !== previous.scope) return [];
  return current.domains.flatMap((domain) => {
    const prior = previous.domains.find((entry) => entry.key === domain.key);
    if (!domain.interpretable || !prior?.interpretable || domain.evidence.map((item) => item.id).sort().join() !== prior.evidence.map((item) => item.id).sort().join()) return [];
    return [{ label: domain.label, kind: domain.kind, previous: prior.frequent, current: domain.frequent, total: domain.answered }];
  });
}
