export const XIAOJING_LANG_KEY = "degendna-home-language";

const scale = (labels) => labels.map((label, index) => ({ label, value: index + 1 }));

export const WORKFLOWS_EN = {
  fomo: {
    id: "fomo", eyebrow: "PRE-TRADE CALIBRATION", title: "Pre-Trade State Calibration",
    description: "We do not judge market direction. We only check whether this decision is still driven by a complete plan.",
    why: "These questions separate short-term fear of missing out from an executable plan. They do not judge you or predict the market.", duration: "About 3 min",
    questions: [
      { id: "intent", label: "What do you most want to do right now?", type: "text", placeholder: "For example: chase a coin that just rallied, or increase the position" },
      { id: "trigger", label: "What triggered you?", options: ["A rapid price rally", "Friends posting profits", "Influencer or social-media content", "Missing the previous move", "Something else"] },
      { id: "fear", label: "What are you most afraid of missing?", options: ["A potential 2x", "Winning back a loss", "Proving my judgment was right", "Not falling behind others", "I cannot explain it; I just feel urgent"] },
      { id: "lossTolerance", label: "If this trade loses, how much can you accept?", options: scale(["I cannot accept a loss", "It would strongly affect my mood", "I can bear it, but it would hurt", "It is within a preset range", "It is already written into the plan"]) },
      { id: "stop", label: "Where is your exit or stop condition?", type: "text", placeholder: "If you do not have one, it is fine to write: not yet" },
      { id: "later", label: "Would you make the same choice 30 minutes from now?", options: scale(["No", "Probably not", "Not sure", "Probably yes", "Yes, with the same plan"]) }
    ]
  },
  loss: {
    id: "loss", eyebrow: "LOSS RESET", title: "Post-Loss Calibration",
    description: "Separate the loss from self-worth and check whether the next decision is being driven by the urge to win it back.",
    why: "These questions distinguish a planned loss, execution drift, and the urge to recover immediately. They do not rate your trading ability.", duration: "About 2 min",
    questions: [
      { id: "planned", label: "Did this trade have a plan in advance?", options: scale(["No plan", "Only a vague idea", "Partly planned", "Mostly complete", "Complete and documented"]) },
      { id: "stopFollowed", label: "Did you follow the original exit or stop?", options: scale(["Not at all", "Major deviation", "Partly", "Mostly", "Strictly"]) },
      { id: "nextAction", label: "What do you most want to do after the loss?", options: ["Place another trade now", "Add to lower the average", "Keep checking charts for a reason", "Leave the screen and cool down", "Document and review"] },
      { id: "lifeImpact", label: "Has it affected sleep, mood, or daily life?", options: scale(["Almost not at all", "Mildly", "Somewhat", "Clearly", "It is disrupting normal life"]) },
      { id: "intent", label: "Which state are you closest to now?", options: ["I want a serious review", "I want the next opportunity", "I just want to win it back", "My mind is chaotic", "I want to stop first"] }
    ]
  },
  sold: {
    id: "sold", eyebrow: "OUTCOME DETOX", title: "Sold-Too-Early Review",
    description: "A rally after you sell does not automatically make the earlier decision wrong. We only inspect the information and plan available then.",
    why: "These questions separate hindsight from information available at the time, so the peak price does not become the standard for judging yourself.", duration: "About 2 min",
    questions: [
      { id: "reason", label: "Why did you sell at the time?", type: "text", placeholder: "For example: target reached, risk changed, fear, or temporary cash need" },
      { id: "planned", label: "Did the sale follow the original plan?", options: scale(["Not at all", "Major deviation", "Partly", "Mostly", "Completely"]) },
      { id: "regret", label: "What is at the center of your regret?", options: ["I made less", "I think my judgment was wrong", "Other people's profits triggered me", "I want to prove myself", "I cannot stop checking the chart"] },
      { id: "reentry", label: "If you re-enter, is the new plan clear?", options: scale(["No plan", "Only impulse", "Vague conditions", "Mostly clear", "Complete and executable"]) },
      { id: "goal", label: "What do you most want to do now?", options: ["Keep trading", "Chase the missed move", "Repair my mood", "Document the lesson", "Leave the screen first"] }
    ]
  },
  review: {
    id: "review", eyebrow: "TRADE DEBRIEF", title: "Trade Review Card",
    description: "Break one trade into plan, execution, emotion, and one next rule.",
    why: "These questions compare the original plan with actual actions. Profit and loss are not used to judge you or the decision.", duration: "About 5 min",
    questions: [
      { id: "asset", label: "What asset did you trade?", type: "text", placeholder: "A ticker is enough; no wallet connection is needed" },
      { id: "direction", label: "What was the direction?", options: ["Spot buy", "Spot sell", "Perpetual long", "Perpetual short", "Other"] },
      { id: "entry", label: "What was your entry reason?", type: "text", placeholder: "Write the real reason you had then, not a hindsight explanation" },
      { id: "exit", label: "What was your exit reason?", type: "text", placeholder: "Target, stop, plan change, emotional exit, or still holding" },
      { id: "stop", label: "Did you set and follow an exit condition?", options: scale(["Not set", "Set but not followed", "Partly followed", "Mostly followed", "Strictly followed"]) },
      { id: "plan", label: "How closely did you follow the overall plan?", options: scale(["Completely off plan", "Major deviation", "Partly", "Mostly", "Strictly"]) },
      { id: "result", label: "What was the result?", options: ["Profit", "Loss", "Near break-even", "Still holding", "Prefer not to record an amount"] },
      { id: "emotion", label: "What was the strongest emotion?", options: ["Calm", "Excited", "Fear of missing out", "Fear of loss", "Unwilling to let go", "Numb"] },
      { id: "social", label: "Were you influenced by social media or other people's profits?", options: scale(["Not at all", "Mildly", "Somewhat", "Clearly", "It almost caused the trade"]) },
      { id: "change", label: "What is the one thing you most want to improve next time?", type: "text", placeholder: "Write one specific change" }
    ]
  },
  snapshot: {
    id: "snapshot", eyebrow: "DAILY DECISION SNAPSHOT", title: "Today's Trading State Snapshot",
    description: "A 60-second record of external stimulation and physical load affecting today's decisions. This is not a psychological diagnosis.",
    why: "These questions help you observe how charts, social stimulation, sleep, and impulses affect decisions. Results compare only with your own recent state.", duration: "About 1 min",
    questions: [
      { id: "screen", label: "How often did you check the market today?", options: scale(["Almost never", "Occasionally", "Normally", "Frequently", "Could not stop"]) },
      { id: "social", label: "Were you affected by other people's profits today?", options: scale(["Not at all", "Mildly", "Somewhat", "Clearly", "Very strongly"]) },
      { id: "impulse", label: "Did you have an impulsive trade today?", options: scale(["No", "The thought appeared", "Almost placed it", "Once", "More than once"]) },
      { id: "sleep", label: "How was your sleep today?", options: scale(["Very good", "Pretty good", "Average", "Poor", "Severely insufficient"]) },
      { id: "walletMood", label: "Did wallet moves affect your mood?", options: scale(["No", "Mildly", "Somewhat", "Clearly", "It almost controlled my mood"]) }
    ]
  }
};

const RESULT_EN = {
  fomo: ["Pre-Trade Calibration Result", "Current Decision Load", "Price speed is compressing your thinking time. Take the decision back from the chart.", "You paused before confirming, which is already an act of regaining control.", "Fear of missing out is shortening the time available for thought.", "Leave the trading screen for 10 minutes and reread your exit conditions afterward.", "Missing one move is not the same as missing a chance to prove yourself."],
  loss: ["Post-Loss Calibration Result", "Current Interference", "Separate the last loss from the next decision. The process needs review; your worth does not.", "You are willing to compare the plan with what actually happened.", "The previous result is still occupying attention and may be pulling on the next decision.", "Do not open a new position for now. Write the original plan and actual actions in three points each.", "A trade can lose without becoming a verdict on you."],
  sold: ["Sold-Too-Early Review Result", "Outcome Pull", "Later gains can hurt, but they do not travel backward and rewrite the information you had.", "You are checking the original evidence rather than judging yourself from the peak.", "Hindsight is pulling attention toward a move that has already happened.", "Record why you sold and whether a staged exit would improve the next plan.", "Making less is not the same as losing, and the peak was never an obligation."],
  review: ["Trade Review Result", "Plan Adherence", "Put profit and loss aside for a moment. The most useful evidence is the gap between plan and action.", "You documented a real trade and chose one thing to improve.", "The main question is whether the rule was specific enough to execute.", "Before the next entry, write the exit condition and keep it with the review record.", "Review is not a trial of the past; it removes one trap from the next decision."],
  snapshot: ["Today's Trading State Snapshot", "Today's Decision Load", "Observe today's load without turning it into a fixed personality label.", "You actively recorded what is affecting decisions before impulse took over.", "Today's strongest input is only a current-state signal, not a permanent trait.", "Close one market alert and spend at least 20 minutes fully away from the screen.", "The wallet can move without requiring you to move with it."]
};

const COMMON_VALUE_EN = new Map([
  ["偏高", "Elevated"], ["当前不高", "Not elevated"], ["明显", "Marked"], ["可控", "Manageable"],
  ["符合计划", "Followed plan"], ["需要补强", "Needs strengthening"], ["保留原规则", "Keep the original rule"],
  ["明确分批退出条件", "Define staged exit conditions"], ["计划内亏损", "Planned loss"], ["执行偏离型亏损", "Execution-drift loss"],
  ["完成复盘后再观察", "Observe after completing the review"], ["暂停交易 24 小时", "Pause new trades for 24 hours"],
  ["仅包含娱乐化状态，不含敏感心理分数", "Entertainment-only state; no sensitive mental-health score"]
]);

export function readXiaojingLanguage() {
  const query = new URLSearchParams(window.location.search).get("lang");
  if (query === "en" || query === "zh") return query;
  try { return localStorage.getItem(XIAOJING_LANG_KEY) === "en" ? "en" : "zh"; } catch { return "zh"; }
}

export function saveXiaojingLanguage(language) {
  try { localStorage.setItem(XIAOJING_LANG_KEY, language); } catch { /* local storage may be disabled */ }
}

export function workflowFor(language, workflowId, fallback) {
  if (language !== "en") return fallback;
  const translated = WORKFLOWS_EN[workflowId];
  if (!translated) return fallback;
  return {
    ...translated,
    questions: translated.questions.map((question, questionIndex) => {
      const original = fallback?.questions?.[questionIndex];
      if (!question.options) return question;
      return {
        ...question,
        options: question.options.map((option, optionIndex) => {
          const source = original?.options?.[optionIndex];
          const label = option?.label ?? option;
          return {
            ...(typeof option === "object" ? option : {}),
            label,
            raw: source?.label ?? source ?? label
          };
        })
      };
    })
  };
}

export function localizeWorkflowResult(language, result) {
  if (language !== "en" || !result) return result;
  const copy = RESULT_EN[result.workflowId] || RESULT_EN.snapshot;
  return {
    ...result,
    title: copy[0], scoreLabel: copy[1], verdict: copy[2], strength: copy[3], interference: copy[4], action: copy[5], reminder: copy[6],
    metrics: (result.metrics || []).map((metric, index) => ({
      ...metric,
      label: ["Primary Trigger", "Plan / State Signal", "Suggested Action", "Next Review Item"][index] || `Signal ${index + 1}`,
      value: COMMON_VALUE_EN.get(metric.value) || metric.value
    })),
    shareText: result.shareable ? `I completed a private Degen decision check. One pause before the next click. degendna.fun/xiaojing/` : result.shareText
  };
}

export function xc(language, zh, en) {
  return language === "en" ? en : zh;
}
