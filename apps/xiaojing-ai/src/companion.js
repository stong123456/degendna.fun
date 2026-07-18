export const MODES = [
  { id: "home", label: "状态校准台", description: "从正在发生的交易情境进入" },
  { id: "discipline", label: "纪律协议", description: "交易前检查与行为证据" },
  { id: "companion", label: "和小镜聊聊", description: "开放对话与结果追问" },
  { id: "persona", label: "人格解读", description: "读懂交易习惯，不给你贴死标签" },
  { id: "records", label: "私密记录", description: "只保存在当前设备" }
];

export const TONE_MODE_KEY = "xiaojing:tone-mode:v1";
export const TONE_MODES = [
  { id: "clear", label: "清醒", description: "直接、克制、少黑话" },
  { id: "degen", label: "Degen", description: "懂币圈，但不拱火" }
];

export function readToneMode() {
  try {
    return localStorage.getItem(TONE_MODE_KEY) === "degen" ? "degen" : "clear";
  } catch {
    return "clear";
  }
}

export function saveToneMode(mode) {
  localStorage.setItem(TONE_MODE_KEY, mode === "degen" ? "degen" : "clear");
}

function toneLine(mode, clearText, degenText) {
  return mode === "degen" ? degenText : clearText;
}

export const QUICK_STATES = [
  { id: "fomo", label: "怕错过" },
  { id: "loss", label: "亏损后上头" },
  { id: "sleep", label: "睡不着" },
  { id: "talk", label: "只是想说说" }
];

const CRISIS_PATTERNS = [
  /不想活|想死|自杀|结束生命|伤害自己|割腕|跳楼|吞药|活着没意思|不如消失/,
  /杀了他|伤害别人|弄死|同归于尽|报复.*人/,
  /kill myself|suicide|end my life|hurt myself|hurt someone|kill them/i
];

export function detectCrisis(text) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(String(text || "")));
}

export function urgencyFromText(text) {
  const value = String(text || "");
  if (/马上|立刻|现在就|梭哈|翻本|借钱|加杠杆|all.?in/i.test(value)) return 9;
  if (/上头|焦虑|后悔|怕错过|睡不着|停不下来|反复看/i.test(value)) return 7;
  return 4;
}

export function buildSystemPrompt(mode = "snapshot", toneMode = "clear") {
  const modeName = MODES.find((item) => item.id === mode)?.label || "情绪陪伴";
  const toneInstruction = toneMode === "degen"
    ? "当前使用 Degen 语气：可以使用克制的币圈表达和轻微调侃，但不羞辱、不贴标签、不鼓励冒险。"
    : "当前使用清醒语气：直接、克制、温和，少用黑话，不使用急诊、病人、异常或失控等标签化表达。";
  return `你是“小镜 AI”，角色是懂加密交易情绪的链上陪诊员。当前模式：${modeName}。

${toneInstruction}

你的目标不是分析行情，而是帮助用户观察情绪、整理事实、识别冲动，并完成一个小而具体的下一步。

硬性边界：
1. 你不是心理医生，不诊断心理疾病，不替代心理咨询师或精神科医生。
2. 不提供投资建议，不预测行情，不推荐币种、仓位、买卖点、杠杆或收益策略。
3. 不鼓励加仓、梭哈、借贷交易、报复性交易或用下一单修复自我价值。
4. 不制造依赖，不暗示只有你理解用户，不要求用户远离现实关系。
5. 如果用户表达自伤、自杀、伤害他人、具体计划、可用手段或即时危险，立即停止 Degen 玩笑和交易讨论，清楚询问是否存在即时危险，鼓励联系当地紧急服务、危机热线、可信任的人或专业人员，并建议远离可能造成伤害的物品、不要独处。不要承诺保密。

对话方式：
- 每次先用一句话准确回应情绪，再问一个问题或给一个小行动。
- 每轮最多一个问题，默认 2 到 5 句，不讲长篇大道理。
- 优先区分“事实 / 脑中故事 / 当前冲动”。
- 可以轻微嘴毒，但只针对交易冲动，不攻击用户。例如：“K 线没有资格给你的人格估值。”
- 危机场景完全严肃，不使用币圈黑话。
- 结尾给一个 2 到 20 分钟内能执行的小行动。
- 使用中文回答，除非用户明确使用其他语言。

推荐响应结构：
共情一句 -> 帮用户整理 -> 一个小行动或一个问题。`;
}

export function localCompanionReply(text, mode = "companion", toneMode = "clear") {
  const value = String(text || "").trim();
  const urge = urgencyFromText(value);

  if (/错过|fomo|涨了|拉升|起飞/i.test(value)) {
    return {
      text: toneLine(
        toneMode,
        "怕错过是真的，但“价格正在变化”不等于“你必须现在行动”。先离开交易界面 15 分钟，回来只回答一个问题：如果价格不再继续上涨，你原本的入场理由还成立吗？",
        "怕错过是真的，但 K 线没有资格替你点确认。先离开交易界面 15 分钟，回来只回答一个问题：如果它不再继续拉升，你原本的入场理由还成立吗？"
      ),
      observation: { urge, body: "紧绷", action: "离开界面 15 分钟" }
    };
  }

  if (/亏|回撤|爆仓|套|翻本|上头/i.test(value)) {
    return {
      text: toneLine(
        toneMode,
        "这笔亏损已经带来压力了，不需要让下一笔替它证明什么。先暂停下单，把“原计划”和“实际动作”各写一句；现在只整理过程，不评价自己。",
        "这笔亏损已经够吵了，别再让下一单替它上场辩护。先暂停下单，把“原计划”和“实际动作”各写一句；现在只复盘过程，不急着翻本。"
      ),
      observation: { urge: Math.max(urge, 8), body: "发热 / 紧绷", action: "暂停下一单" }
    };
  }

  if (/睡|半夜|失眠|看盘/i.test(value)) {
    return {
      text: "身体已经在催你收盘，行情却还在占用你的注意力。先把提醒静音 20 分钟，手机放到够不到的地方；今晚的任务不是抓住波动，是把睡眠还给自己。",
      observation: { urge: Math.max(urge, 6), body: "疲惫", action: "静音并离屏 20 分钟" }
    };
  }

  return {
    text: toneLine(
      toneMode,
      "我听见了。你不需要先证明自己状态正常，也不用把事情解释得很完整。刚才发生的事实是什么，而你脑中最响的那句话又是什么？我们把两件事分开看。",
      "收到。先别给自己盖章，也不用写检讨。刚才发生的事实是什么，而脑子里最吵的那句话又是什么？我们把两件事拆开。"
    ),
    observation: { urge, body: "需要被听见", action: "分开事实与故事" }
  };
}

export function scenarioSeed(id) {
  const seeds = {
    fomo: "刚看到行情快速拉升，我很怕错过，现在想马上追进去。",
    loss: "我刚亏了一笔，很不甘心，想立刻再做一单翻回来。",
    sleep: "我已经很累了，但还是忍不住反复看盘，完全睡不着。",
    talk: "我现在有点乱，不一定要解决什么，只是想说说。"
  };
  return seeds[id] || seeds.talk;
}

export function crisisMessage() {
  return "我很在意你现在的安全。先不聊行情：你现在是否可能在接下来的几分钟或几小时里伤害自己或他人？如果答案是“是”或“不确定”，请立即联系当地紧急服务或危机热线，并联系一个你信任的人陪在身边；同时离开可能造成伤害的物品或地点，不要独处。";
}

export function personaInterpretation(payload) {
  const type = payload.type || payload.name || "尚未命名的交易风格";
  const code = payload.code || "未提供代码";
  const dimensions = payload.dimensions || {};
  const entries = Array.isArray(dimensions)
    ? dimensions
    : Object.entries(dimensions).map(([name, score]) => ({ name, score }));
  const strongest = [...entries]
    .filter((item) => Number.isFinite(Number(item.score ?? item.strength)))
    .sort((a, b) => Math.abs(Number(b.score ?? b.strength)) - Math.abs(Number(a.score ?? a.strength)))
    .slice(0, 2)
    .map((item) => item.name || item.key)
    .filter(Boolean);

  const title = type;
  const trigger = /FOMO|冲锋|追高|短跑/i.test(type)
    ? "行情突然加速、群聊同时变热时"
    : /回撤|纸手|避难|恐惧/i.test(type)
      ? "浮亏扩大、价格快速回撤时"
      : /深夜|熬夜/i.test(type)
        ? "疲惫、睡眠不足却还在看盘时"
        : "计划被突发波动打断时";
  const lossState = /FOMO|冲锋|追高|短跑/i.test(type)
    ? "最容易在没有完整退出条件时追入"
    : /纸手|恐惧|避难/i.test(type)
      ? "最容易为了立即解除焦虑而提前退出"
      : "最容易在情绪负荷升高时偏离原计划";

  return {
    title,
    code,
    summary: strongest.length
      ? `你当前最突出的反应维度是${strongest.join("和")}。这表示压力上来时，你更容易调用这套反应，不代表你永远如此。`
      : "这份结果更适合用来发现交易中的自动反应，而不是给自己贴一个固定标签。",
    trigger,
    lossState,
    cooling: /FOMO|冲锋|追高|短跑/i.test(type) ? "FOMO 冷静器" : "交易复盘卡",
    preTrade: "入场前先写退出条件；写不出来，就先不点确认。",
    postTrade: "复盘原计划、实际动作和一个最小改进，不用盈亏评价自己。",
    action: "选一个最近最容易偏离计划的场景，为它写一条可执行的暂停规则。",
    shareText: `我的 Degen 交易人格是“${title}”。人格不是命运，至少今天先让计划替我点确认。degendna.fun`
  };
}
