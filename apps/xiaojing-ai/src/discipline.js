export const DISCIPLINE_RULES_KEY = "xiaojing:discipline-rules:v1";
export const DISCIPLINE_CHECKS_KEY = "xiaojing:discipline-checks:v1";
export const ACTIVE_COOLDOWN_KEY = "xiaojing:active-cooldown:v1";

export const DISCIPLINE_TRIGGERS = [
  "行情快速拉升",
  "亏损后想翻本",
  "卖飞后想追回",
  "群友或社媒刺激",
  "深夜疲惫看盘",
  "临时偏离计划",
  "其他"
];

export const DEFAULT_DISCIPLINE_RULES = [
  {
    id: "preset-fomo",
    trigger: "行情快速拉升",
    condition: "冲动强度达到 7/10，且退出条件没有写清",
    action: "离开交易界面，只保留价格提醒，冷静结束后重新阅读退出条件。",
    cooldownMinutes: 10,
    enabled: true,
    preset: true
  },
  {
    id: "preset-revenge",
    trigger: "亏损后想翻本",
    condition: "亏损后想立刻用下一单把结果追回来",
    action: "当天只允许观察和复盘，不新增由情绪推动的风险决定。",
    cooldownMinutes: 30,
    enabled: true,
    preset: true
  },
  {
    id: "preset-late-night",
    trigger: "深夜疲惫看盘",
    condition: "睡眠不足或身体已经明显疲惫",
    action: "停止新增决定，静音行情提醒，把睡眠还给自己。",
    cooldownMinutes: 20,
    enabled: true,
    preset: true
  },
  {
    id: "preset-social",
    trigger: "群友或社媒刺激",
    condition: "主要理由来自他人的盈利截图、喊单或热度",
    action: "退出信息流，独立写下交易理由；写不出来就继续观察。",
    cooldownMinutes: 15,
    enabled: true,
    preset: true
  }
];

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function readDisciplineRules() {
  const saved = readJson(DISCIPLINE_RULES_KEY, null);
  if (!Array.isArray(saved)) return DEFAULT_DISCIPLINE_RULES;
  const savedById = new Map(saved.map((rule) => [rule.id, rule]));
  const presets = DEFAULT_DISCIPLINE_RULES.map((rule) => ({ ...rule, ...savedById.get(rule.id) }));
  const custom = saved.filter((rule) => !rule.preset && !DEFAULT_DISCIPLINE_RULES.some((item) => item.id === rule.id));
  return [...presets, ...custom];
}

export function saveDisciplineRules(rules) {
  localStorage.setItem(DISCIPLINE_RULES_KEY, JSON.stringify(rules));
}

export function readDisciplineChecks() {
  const checks = readJson(DISCIPLINE_CHECKS_KEY, []);
  return Array.isArray(checks) ? checks : [];
}

export function saveDisciplineChecks(checks) {
  localStorage.setItem(DISCIPLINE_CHECKS_KEY, JSON.stringify(checks.slice(0, 100)));
}

export function readActiveCooldown() {
  const cooldown = readJson(ACTIVE_COOLDOWN_KEY, null);
  if (!cooldown || Number(cooldown.endsAt) <= Date.now()) {
    localStorage.removeItem(ACTIVE_COOLDOWN_KEY);
    return null;
  }
  return cooldown;
}

export function saveActiveCooldown(cooldown) {
  if (!cooldown) {
    localStorage.removeItem(ACTIVE_COOLDOWN_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_COOLDOWN_KEY, JSON.stringify(cooldown));
}

export function createDisciplineRule({ trigger, condition, action, cooldownMinutes }) {
  return {
    id: crypto.randomUUID(),
    trigger,
    condition: String(condition || "").trim(),
    action: String(action || "").trim(),
    cooldownMinutes: Math.max(2, Math.min(60, Number(cooldownMinutes) || 10)),
    enabled: true,
    preset: false,
    createdAt: Date.now()
  };
}

function hasText(value, length = 6) {
  return String(value || "").trim().length >= length;
}

export function evaluateDisciplineCheck(form, rules) {
  const enabledRules = rules.filter((rule) => rule.enabled);
  const matchedRules = enabledRules.filter((rule) => (
    rule.trigger === form.trigger || rule.trigger === "其他"
  ));
  const urge = Number(form.urgeBefore) || 0;
  const missingPlan = !hasText(form.reason) || !hasText(form.exitCondition, 4) || form.lossBoundary === "还没有写清";
  const socialPressure = form.socialPressure === "明显" || form.socialPressure === "几乎由它触发";
  const fatigue = form.physicalState === "睡眠不足" || form.physicalState === "非常疲惫";
  const flags = [
    urge >= 7 ? "冲动强度偏高" : null,
    missingPlan ? "计划还没有闭环" : null,
    socialPressure ? "外部刺激正在放大决定" : null,
    fatigue ? "身体状态不适合新增决定" : null
  ].filter(Boolean);
  const riskLoad = urge * 7 + flags.length * 10;
  const cooldownMinutes = Math.max(
    riskLoad >= 75 ? 20 : riskLoad >= 50 ? 10 : 5,
    ...matchedRules.map((rule) => Number(rule.cooldownMinutes) || 0)
  );
  const readiness = flags.length >= 3 || urge >= 9
    ? "先暂停，不新增决定"
    : flags.length >= 1
      ? "进入冷静观察期"
      : "计划基本完整，仍建议延迟确认";

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    trigger: form.trigger,
    urgeBefore: urge,
    reason: String(form.reason || "").trim(),
    exitCondition: String(form.exitCondition || "").trim(),
    lossBoundary: form.lossBoundary,
    socialPressure: form.socialPressure,
    physicalState: form.physicalState,
    matchedRuleIds: matchedRules.map((rule) => rule.id),
    matchedRules,
    flags,
    readiness,
    cooldownMinutes,
    action: matchedRules[0]?.action || "离开交易界面，冷静结束后重新阅读自己的理由和退出条件。",
    status: "evaluated",
    urgeAfter: null,
    outcome: null,
    followed: null
  };
}

export function completeDisciplineCheck(check, { urgeAfter, outcome, followed }) {
  return {
    ...check,
    completedAt: Date.now(),
    status: "completed",
    urgeAfter: Number(urgeAfter),
    outcome,
    followed: Boolean(followed)
  };
}

export function deriveDisciplineStats(checks, rules) {
  const completed = checks.filter((check) => check.status === "completed");
  const followed = completed.filter((check) => check.followed).length;
  const reduced = completed.filter((check) => Number(check.urgeAfter) < Number(check.urgeBefore)).length;
  const delta = completed.length
    ? completed.reduce((sum, check) => sum + Math.max(0, Number(check.urgeBefore) - Number(check.urgeAfter)), 0) / completed.length
    : 0;
  const triggerCounts = completed.reduce((map, check) => {
    map.set(check.trigger, (map.get(check.trigger) || 0) + 1);
    return map;
  }, new Map());
  const topTrigger = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "尚未形成";

  return {
    total: completed.length,
    activeRules: rules.filter((rule) => rule.enabled).length,
    adherence: completed.length ? Math.round((followed / completed.length) * 100) : 0,
    reduced,
    averageReduction: Number(delta.toFixed(1)),
    topTrigger
  };
}

const WORKFLOW_TRIGGER_MAP = {
  fomo: "行情快速拉升",
  loss: "亏损后想翻本",
  sold: "卖飞后想追回",
  review: "临时偏离计划",
  snapshot: "其他"
};

const TIME_BUCKETS = [
  { id: "late", label: "深夜", detail: "00:00-05:59", start: 0, end: 5 },
  { id: "morning", label: "上午", detail: "06:00-11:59", start: 6, end: 11 },
  { id: "afternoon", label: "下午", detail: "12:00-17:59", start: 12, end: 17 },
  { id: "evening", label: "晚间", detail: "18:00-23:59", start: 18, end: 23 }
];

function eventTime(item) {
  return Number(item.completedAt || item.createdAt || item.timestamp || 0);
}

function periodStart(days, now) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start.getTime();
}

function workflowTrigger(result) {
  const mapped = WORKFLOW_TRIGGER_MAP[result.workflowId];
  if (mapped !== "其他") return mapped || "其他";
  const metric = String(result.metrics?.[0]?.value || "");
  if (/看盘/.test(metric)) return "深夜疲惫看盘";
  if (/收益|社交|他人/.test(metric)) return "群友或社媒刺激";
  if (/冲动/.test(metric)) return "临时偏离计划";
  return "其他";
}

function timeBucket(timestamp) {
  const hour = new Date(timestamp).getHours();
  return TIME_BUCKETS.find((bucket) => hour >= bucket.start && hour <= bucket.end)?.id || "evening";
}

function formatShortDate(timestamp) {
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(timestamp));
}

function averageOrZero(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function deriveTriggerMap(checks, workflowResults, rules, days = 30, now = Date.now()) {
  const startAt = periodStart(days, now);
  const endAt = new Date(now);
  endAt.setHours(0, 0, 0, 0);
  endAt.setDate(endAt.getDate() + 1);
  const periodEnd = endAt.getTime();
  const checkEvents = checks
    .filter((check) => check.status === "completed" && eventTime(check) >= startAt && eventTime(check) < periodEnd)
    .map((check) => ({
      id: check.id,
      source: "discipline",
      timestamp: eventTime(check),
      trigger: check.trigger || "其他",
      intensity: Math.max(0, Math.min(100, Number(check.urgeBefore) * 10)),
      reduction: Math.max(-10, Math.min(10, Number(check.urgeBefore) - Number(check.urgeAfter))),
      followed: Boolean(check.followed),
      matchedRuleIds: Array.isArray(check.matchedRuleIds) ? check.matchedRuleIds : [],
      outcome: check.outcome || "已记录"
    }));
  const workflowEvents = workflowResults
    .filter((result) => eventTime(result) >= startAt && eventTime(result) < periodEnd)
    .map((result) => ({
      id: result.id,
      source: "workflow",
      timestamp: eventTime(result),
      trigger: workflowTrigger(result),
      intensity: Math.max(0, Math.min(100, Number(result.score) || 0)),
      reduction: null,
      followed: null,
      matchedRuleIds: [],
      outcome: result.title
    }));
  const events = [...checkEvents, ...workflowEvents].sort((a, b) => b.timestamp - a.timestamp);
  const triggerMap = new Map(DISCIPLINE_TRIGGERS.map((trigger) => [trigger, []]));
  events.forEach((event) => {
    const key = triggerMap.has(event.trigger) ? event.trigger : "其他";
    triggerMap.get(key).push(event);
  });
  const triggerStats = [...triggerMap.entries()]
    .map(([trigger, items]) => ({
      trigger,
      count: items.length,
      averageIntensity: Math.round(averageOrZero(items.map((item) => item.intensity))),
      latestAt: items[0]?.timestamp || null
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || b.averageIntensity - a.averageIntensity);
  const maxTriggerCount = Math.max(1, ...triggerStats.map((item) => item.count));
  triggerStats.forEach((item) => { item.ratio = Math.round((item.count / maxTriggerCount) * 100); });

  const timeStats = TIME_BUCKETS.map((bucket) => {
    const items = events.filter((event) => timeBucket(event.timestamp) === bucket.id);
    return {
      ...bucket,
      count: items.length,
      averageIntensity: Math.round(averageOrZero(items.map((item) => item.intensity)))
    };
  });
  const maxTimeCount = Math.max(1, ...timeStats.map((item) => item.count));
  timeStats.forEach((item) => { item.ratio = Math.round((item.count / maxTimeCount) * 100); });

  const slotCount = 7;
  const trend = Array.from({ length: slotCount }, (_, index) => {
    const slotStartDay = Math.floor((index * days) / slotCount);
    const slotEndDay = Math.floor(((index + 1) * days) / slotCount);
    const slotStart = startAt + slotStartDay * 24 * 60 * 60 * 1000;
    const slotEnd = startAt + slotEndDay * 24 * 60 * 60 * 1000;
    const items = events.filter((event) => event.timestamp >= slotStart && event.timestamp < slotEnd);
    const disciplineItems = items.filter((item) => item.source === "discipline");
    return {
      label: days === slotCount ? formatShortDate(slotStart) : `${formatShortDate(slotStart)}-${formatShortDate(slotEnd - 1)}`,
      count: items.length,
      intensity: Math.round(averageOrZero(items.map((item) => item.intensity))),
      reduction: Number(averageOrZero(disciplineItems.map((item) => item.reduction)).toFixed(1)),
      adherence: disciplineItems.length
        ? Math.round((disciplineItems.filter((item) => item.followed).length / disciplineItems.length) * 100)
        : null
    };
  });
  const maxTrendCount = Math.max(1, ...trend.map((item) => item.count));
  trend.forEach((item) => { item.ratio = Math.max(item.count ? 12 : 3, Math.round((item.count / maxTrendCount) * 100)); });

  const ruleMap = new Map(rules.map((rule) => [rule.id, rule]));
  const protocolMap = new Map();
  checkEvents.forEach((event) => {
    event.matchedRuleIds.forEach((id) => {
      if (!ruleMap.has(id)) return;
      if (!protocolMap.has(id)) protocolMap.set(id, []);
      protocolMap.get(id).push(event);
    });
  });
  const protocolStats = [...protocolMap.entries()]
    .map(([id, items]) => ({
      id,
      rule: ruleMap.get(id),
      count: items.length,
      averageReduction: Number(averageOrZero(items.map((item) => item.reduction)).toFixed(1)),
      adherence: Math.round((items.filter((item) => item.followed).length / items.length) * 100)
    }))
    .sort((a, b) => b.averageReduction - a.averageReduction || b.adherence - a.adherence);

  const completedChecks = checkEvents.length;
  const adherence = completedChecks
    ? Math.round((checkEvents.filter((event) => event.followed).length / completedChecks) * 100)
    : 0;
  const averageReduction = Number(averageOrZero(checkEvents.map((event) => event.reduction)).toFixed(1));
  const topTrigger = triggerStats[0] || null;
  const topTime = [...timeStats].sort((a, b) => b.count - a.count || b.averageIntensity - a.averageIntensity)[0];
  const bestProtocol = protocolStats[0] || null;
  const confidence = events.length >= 10 ? "画像已稳定" : events.length >= 4 ? "形成初步轮廓" : "正在建立画像";
  const insight = events.length
    ? `过去 ${days} 天，你最常在“${topTrigger.trigger}”时进入高负荷状态${topTime.count ? `，${topTime.label}出现得最多` : ""}。${completedChecks ? `完成纪律检查后，冲动平均变化 ${averageReduction > 0 ? `下降 ${averageReduction}` : averageReduction < 0 ? `上升 ${Math.abs(averageReduction)}` : "为 0"} 档。` : "继续完成交易前检查后，地图会开始验证哪些协议真正有效。"}`
    : "还没有足够记录。完成第一次交易前检查，触发地图就会从真实行为开始生长。";
  const focus = !events.length
    ? "从最常见的一次冲动开始，不需要一次记录所有问题。"
    : completedChecks < 3
      ? `优先为“${topTrigger.trigger}”连续记录 3 次冷静前后变化。`
      : adherence < 70
        ? "下一阶段只守住一条最容易执行的协议，先提高执行稳定性。"
        : averageReduction <= 0
          ? "现有冷静动作还没有明显降低冲动，可以缩小动作并延长离屏时间。"
          : `继续保留“${bestProtocol?.rule?.trigger || topTrigger.trigger}”对应的有效协议。`;

  return {
    days,
    events,
    checkEvents,
    workflowEvents,
    triggerStats,
    timeStats,
    trend,
    protocolStats,
    total: events.length,
    completedChecks,
    adherence,
    averageReduction,
    topTrigger,
    topTime,
    bestProtocol,
    confidence,
    insight,
    focus
  };
}
