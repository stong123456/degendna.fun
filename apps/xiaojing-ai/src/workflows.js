export const WORKFLOW_STORAGE_KEY = "xiaojing:workflow-results:v2";
export const STATUS_STORAGE_KEY = "xiaojing:daily-status:v2";

const scale = (labels) => labels.map((label, index) => ({ label, value: index + 1 }));

export const SCENARIOS = [
  { id: "fomo", label: "我现在 FOMO 了", note: "行情突然拉升，怕错过", tone: "cyan", workflow: "fomo" },
  { id: "loss", label: "我刚亏了一笔", note: "先区分计划内亏损和情绪失控", tone: "red", workflow: "loss" },
  { id: "sold", label: "我又卖飞了", note: "把结果遗憾和决策质量分开", tone: "purple", workflow: "sold" },
  { id: "rush", label: "我想冲进去", note: "下单前做一次计划完整度检查", tone: "gold", workflow: "fomo" },
  { id: "revenge", label: "我想翻本", note: "先拦住报复性交易冲动", tone: "red", workflow: "loss" },
  { id: "review", label: "我想复盘一笔交易", note: "只复盘过程，不审判盈亏", tone: "blue", workflow: "review" },
  { id: "persona", label: "我想测交易人格", note: "连接 DegenDNA 48 题自查", tone: "purple", action: "persona" },
  { id: "rest", label: "我今天不太想看盘", note: "做一张不含敏感分数的情绪快照", tone: "green", workflow: "snapshot" },
  { id: "safety", label: "我需要安全支持", note: "停止交易话题，优先连接现实帮助", tone: "red", action: "safety" }
];

export const WORKFLOWS = {
  fomo: {
    id: "fomo",
    eyebrow: "PRE-TRADE COOLING",
    title: "FOMO 冷静器",
    description: "不判断行情，只检查这笔冲动有没有完整计划。",
    duration: "约 3 分钟",
    questions: [
      { id: "intent", label: "你现在最想做什么？", type: "text", placeholder: "例如：追进刚刚拉升的币，或者加大仓位" },
      { id: "trigger", label: "是什么触发了你？", options: ["价格快速拉升", "群友晒盈利", "大 V / 社媒信息", "刚错过上一段行情", "其他"] },
      { id: "fear", label: "你最怕错过什么？", options: ["一次翻倍机会", "把亏损赚回来", "证明自己判断没错", "不想落后别人", "说不清，只是很急"] },
      { id: "lossTolerance", label: "如果这笔交易亏损，你能接受到什么程度？", options: scale(["完全不能接受", "会明显影响情绪", "可承受但会难受", "在预设范围内", "已经写进计划"]) },
      { id: "stop", label: "你的退出或止损条件在哪里？", type: "text", placeholder: "没有明确条件也可以如实写“还没有”" },
      { id: "later", label: "30 分钟后再看，你还会做同样选择吗？", options: scale(["不会", "大概率不会", "不确定", "大概率会", "会，而且计划不变"]) }
    ]
  },
  loss: {
    id: "loss",
    eyebrow: "LOSS TRIAGE",
    title: "亏损急诊",
    description: "把这笔亏损从自我评价里拆出来，先确认有没有报复性交易倾向。",
    duration: "约 2 分钟",
    questions: [
      { id: "planned", label: "这笔交易是否有提前计划？", options: scale(["完全没有", "只有模糊想法", "有部分计划", "计划较完整", "完整且有记录"]) },
      { id: "stopFollowed", label: "你是否按原定退出或止损执行？", options: scale(["完全没有", "严重偏离", "部分执行", "基本执行", "严格执行"]) },
      { id: "nextAction", label: "亏损后你最想做什么？", options: ["立刻再下一单", "加仓摊低成本", "反复看图找原因", "离开屏幕冷静", "记录并复盘"] },
      { id: "lifeImpact", label: "它是否影响了睡眠、情绪或生活？", options: scale(["几乎没有", "轻微", "有一些", "明显", "已经影响正常生活"]) },
      { id: "intent", label: "你现在更接近哪种状态？", options: ["想认真复盘", "想找下一次机会", "只想马上翻回来", "脑子很乱", "先停下来"] }
    ]
  },
  sold: {
    id: "sold",
    eyebrow: "OUTCOME DETOX",
    title: "卖飞复盘",
    description: "卖出后的上涨不自动证明原决策错误。我们只检查当时的信息和计划。",
    duration: "约 2 分钟",
    questions: [
      { id: "reason", label: "当时卖出的理由是什么？", type: "text", placeholder: "例如：达到目标、风险变化、恐慌、临时需要资金" },
      { id: "planned", label: "卖出是否符合原计划？", options: scale(["完全不符合", "明显偏离", "部分符合", "基本符合", "完全符合"]) },
      { id: "regret", label: "你现在后悔的核心是什么？", options: ["少赚了", "觉得判断错了", "被别人收益刺激", "想证明自己", "只是反复看图停不下来"] },
      { id: "reentry", label: "如果重新进入，你的计划是否清楚？", options: scale(["完全没有", "只有冲动", "有模糊条件", "大致清楚", "条件完整且可执行"]) },
      { id: "goal", label: "你现在更想做什么？", options: ["继续交易", "追回刚才的涨幅", "修复情绪", "记录经验", "先离开屏幕"] }
    ]
  },
  review: {
    id: "review",
    eyebrow: "TRADE DEBRIEF",
    title: "交易复盘卡",
    description: "把一笔交易拆成计划、执行、情绪和下一条规则。",
    duration: "约 5 分钟",
    questions: [
      { id: "asset", label: "交易标的是什么？", type: "text", placeholder: "只写代号即可，不需要连接钱包" },
      { id: "direction", label: "交易方向？", options: ["现货买入", "现货卖出", "合约做多", "合约做空", "其他"] },
      { id: "entry", label: "你的入场理由是什么？", type: "text", placeholder: "写当时真实的理由，不写事后解释" },
      { id: "exit", label: "你的出场理由是什么？", type: "text", placeholder: "止盈、止损、计划变化、情绪退出或仍在持有" },
      { id: "stop", label: "是否设置并执行了退出条件？", options: scale(["没有设置", "设置但完全没执行", "部分执行", "基本执行", "严格执行"]) },
      { id: "plan", label: "整体执行计划的程度？", options: scale(["完全偏离", "严重偏离", "执行一部分", "基本执行", "严格执行"]) },
      { id: "result", label: "这笔交易的结果？", options: ["盈利", "亏损", "接近持平", "仍在持有", "不想记录金额"] },
      { id: "emotion", label: "当时最强烈的情绪？", options: ["平静", "兴奋", "害怕错过", "恐惧亏损", "不甘心", "麻木"] },
      { id: "social", label: "是否被社交媒体或他人收益影响？", options: scale(["完全没有", "轻微", "有一些", "明显", "几乎由它触发"]) },
      { id: "change", label: "下一次最想改进什么？", type: "text", placeholder: "只写一件事，越具体越好" }
    ]
  },
  snapshot: {
    id: "snapshot",
    eyebrow: "DAILY EMOTION SCAN",
    title: "今日情绪快照",
    description: "60 秒记录今天的交易状态，不做心理诊断。",
    duration: "约 1 分钟",
    questions: [
      { id: "screen", label: "今天看盘频率如何？", options: scale(["几乎没看", "偶尔", "正常", "频繁", "停不下来"]) },
      { id: "social", label: "今天是否被别人的收益影响？", options: scale(["完全没有", "轻微", "有一些", "明显", "非常强烈"]) },
      { id: "impulse", label: "今天是否有冲动交易？", options: scale(["没有", "闪过念头", "差点下单", "发生过一次", "多次发生"]) },
      { id: "sleep", label: "今天的睡眠状态如何？", options: scale(["很好", "还不错", "一般", "较差", "严重不足"]) },
      { id: "walletMood", label: "钱包波动是否影响了心情？", options: scale(["没有", "轻微", "有一些", "明显", "几乎被它控制"]) }
    ]
  }
};

function numeric(answer, fallback = 3) {
  const value = Number(answer?.value ?? answer);
  return Number.isFinite(value) ? value : fallback;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function toScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function text(answer) {
  return String(answer?.label ?? answer ?? "").trim();
}

function isMissingPlan(value) {
  return !value || /没有|不清楚|还没|不知道|说不清/.test(value);
}

export function calculateWorkflowResult(workflowId, answers) {
  const now = Date.now();
  if (workflowId === "fomo") {
    const tolerance = numeric(answers.lossTolerance);
    const later = numeric(answers.later);
    const planScore = toScore((tolerance + later) * 10 - (isMissingPlan(text(answers.stop)) ? 20 : 0));
    const fomoScore = toScore(92 - planScore * 0.45 + (text(answers.trigger).includes("拉升") ? 9 : 3));
    return {
      id: crypto.randomUUID(), workflowId, createdAt: now, shareable: true,
      title: "FOMO 冷静卡", score: fomoScore, scoreLabel: "FOMO 指数",
      verdict: fomoScore >= 70 ? "现在更像是错过感在推着你走。" : "冲动存在，但计划仍有一部分在场。",
      metrics: [
        { label: "当前触发点", value: text(answers.trigger) },
        { label: "计划完整度", value: `${planScore}%` },
        { label: "冷静动作", value: fomoScore >= 65 ? "进入 10 分钟观察期" : planScore < 60 ? "补完退出条件再决定" : "保留计划并延迟 10 分钟" }
      ],
      action: fomoScore >= 65
        ? "离开交易界面 10 分钟，只保留价格提醒；回来后重读退出条件。"
        : planScore < 60
          ? "把最大可承受损失和退出条件写成一句话，再决定是否继续。"
          : "保留现有计划，但把确认动作延迟 10 分钟，观察计划是否仍然成立。",
      reminder: "错过一段行情，不等于错过证明自己的机会。",
      shareText: `我的 FOMO 指数 ${fomoScore}/100。今天先不让情绪替我点确认。degendna.fun/xiaojing/`
    };
  }

  if (workflowId === "loss") {
    const planned = numeric(answers.planned);
    const followed = numeric(answers.stopFollowed);
    const impact = numeric(answers.lifeImpact);
    const revenge = /立刻|加仓|翻回来|下一次机会/.test(`${text(answers.nextAction)} ${text(answers.intent)}`);
    const interference = toScore(impact * 15 + (5 - followed) * 8 + (revenge ? 18 : 0));
    return {
      id: crypto.randomUUID(), workflowId, createdAt: now, shareable: false,
      title: "亏损急诊记录", score: interference, scoreLabel: "情绪干扰",
      verdict: planned >= 4 && followed >= 4 ? "这更接近计划内亏损，不需要用下一单证明自己。" : "这笔亏损里夹着执行偏离，值得复盘，但不值得立刻翻本。",
      metrics: [
        { label: "亏损类型", value: planned >= 4 && followed >= 4 ? "计划内亏损" : "执行偏离型亏损" },
        { label: "报复交易倾向", value: revenge ? "偏高" : "当前不高" },
        { label: "建议", value: interference >= 65 || revenge ? "暂停交易 24 小时" : "完成复盘后再观察" }
      ],
      action: interference >= 65 || revenge ? "未来 24 小时不新开仓，把原计划和实际动作各写三条。" : "先写下原计划、实际动作和唯一需要改进的规则。",
      reminder: "这笔交易可以亏，但不要拿它评价整个人。"
    };
  }

  if (workflowId === "sold") {
    const planned = numeric(answers.planned);
    const reentry = numeric(answers.reentry);
    const chase = /追回|继续交易/.test(text(answers.goal)) && reentry <= 3;
    const regret = toScore((6 - planned) * 12 + (6 - reentry) * 8 + (chase ? 20 : 4));
    return {
      id: crypto.randomUUID(), workflowId, createdAt: now, shareable: true,
      title: "卖飞复盘卡", score: regret, scoreLabel: "结果遗憾",
      verdict: planned >= 4 ? "结果让人不爽，但当时的决策未必有错。" : "真正值得修的是退出规则，不是追回已经发生的涨幅。",
      metrics: [
        { label: "原决策质量", value: planned >= 4 ? "符合计划" : "需要补强" },
        { label: "追涨冲动", value: chase ? "明显" : "可控" },
        { label: "改进重点", value: planned >= 4 ? "保留原规则" : "明确分批退出条件" }
      ],
      action: chase ? "先退出行情页面 15 分钟，不用新交易修复卖飞情绪。" : "记录当时卖出依据，并标记下次是否需要分批退出。",
      reminder: "少赚不是亏损，事后最高点也不是你的义务。",
      shareText: "卖飞复盘完成：我决定复盘规则，不追讨已经发生的涨幅。degendna.fun/xiaojing/"
    };
  }

  if (workflowId === "review") {
    const execution = toScore(average([numeric(answers.stop), numeric(answers.plan)]) * 20);
    const social = numeric(answers.social);
    const emotionScore = toScore((social - 1) * 18 + (/害怕|不甘|兴奋/.test(text(answers.emotion)) ? 24 : 8));
    return {
      id: crypto.randomUUID(), workflowId, createdAt: now, shareable: true,
      title: "交易复盘卡", score: execution, scoreLabel: "执行评分",
      verdict: execution >= 75 ? "这笔交易的执行基本尊重了计划。" : "结果先放一边，执行偏离才是最值得修的部分。",
      metrics: [
        { label: "交易", value: `${text(answers.asset) || "未命名标的"} · ${text(answers.direction)}` },
        { label: "情绪干扰", value: `${emotionScore}%` },
        { label: "计划完整度", value: `${execution}%` },
        { label: "下次只改一件事", value: text(answers.change) || "把退出条件写在入场之前" }
      ],
      action: text(answers.change) || "下一次入场前，先写好退出条件并保留复盘记录。",
      reminder: "复盘不是审判过去，而是给下一次少留一个坑。",
      shareText: `交易复盘完成，执行评分 ${execution}/100。今天复盘过程，不拿盈亏给自己定价。degendna.fun/xiaojing/`
    };
  }

  const pressure = toScore(average([
    numeric(answers.screen), numeric(answers.social), numeric(answers.impulse), numeric(answers.sleep), numeric(answers.walletMood)
  ]) * 20);
  const triggerPairs = [
    ["看盘频率", numeric(answers.screen)],
    ["他人收益", numeric(answers.social)],
    ["冲动交易", numeric(answers.impulse)],
    ["睡眠不足", numeric(answers.sleep)],
    ["钱包波动", numeric(answers.walletMood)]
  ].sort((a, b) => b[1] - a[1]);
  return {
    id: crypto.randomUUID(), workflowId: "snapshot", createdAt: now, shareable: true,
    title: "今日 Degen 情绪快照", score: pressure, scoreLabel: "交易情绪负荷",
    verdict: pressure >= 70 ? "今天的交易情绪负荷偏高，减少刺激比增加判断更重要。" : "今天的状态仍可观察，继续把节奏留在自己手里。",
    metrics: [
      { label: "主要触发点", value: triggerPairs[0][0] },
      { label: "今日动作", value: pressure >= 70 ? "减少看盘并暂停新决定" : "保持原计划，不临时加码" },
      { label: "公开分享", value: "仅包含娱乐化状态，不含敏感心理分数" }
    ],
    action: pressure >= 70 ? "关掉一个行情提醒，安排至少 20 分钟完全离屏。" : "今天只保留原计划内动作，新增决定延迟 10 分钟。",
    reminder: "钱包在波动，不代表你也必须跟着波动。",
    shareText: `今日 Degen 情绪负荷 ${pressure}/100。钱包在波动，我先不跟着一起波动。degendna.fun/xiaojing/`
  };
}

export function readWorkflowResults() {
  try {
    return JSON.parse(localStorage.getItem(WORKFLOW_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveWorkflowResults(results) {
  localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(results.slice(0, 50)));
}

export function deriveStatusCard(results, persona = "尚未接入") {
  const latest = results[0];
  if (!latest) {
    return {
      emotion: "待扫描",
      persona,
      trigger: "还没有今天的记录",
      action: "选择一个当前状态",
      updatedAt: "尚未复盘"
    };
  }
  return {
    emotion: latest.score >= 70 ? "负荷偏高" : latest.score >= 45 ? "需要观察" : "相对稳定",
    persona,
    trigger: latest.metrics?.[0]?.value || latest.title,
    action: latest.action,
    updatedAt: new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(latest.createdAt))
  };
}
