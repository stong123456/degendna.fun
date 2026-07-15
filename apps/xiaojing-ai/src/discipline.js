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
