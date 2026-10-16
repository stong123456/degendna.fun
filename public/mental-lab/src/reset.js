import { localStore } from "./storage.js";
// Local-only Reset tools. No timers, streaks, market data or automated advice.
export const RESET_KEY = "degendna-reset-v1";
export const resetTools = [
  {
    id: "pause",
    title: "下单前暂停卡",
    intro: "给感受与决定之间留一点余地。这不是买卖建议。",
    fields: [
      "刚才是什么消息或情境触发了我？",
      "我事前的计划是什么？没有计划也可以如实写。",
      "现在想行动的理由：哪些是事实，哪些是感受？",
      "接下来我想先做的一件小事",
    ],
    action:
      "可以先离开屏幕、喝水或联系一个人。是否继续交易，仍需独立考虑现实后果。",
  },
  {
    id: "review",
    title: "亏损后温和复盘",
    intro: "不用一次重现所有经历。不舒服时可以停止。",
    fields: [
      "发生了什么？只记录愿意面对的事实。",
      "我当时知道什么？哪些是事后才知道的？",
      "这件事怎样影响了我的感受和生活？",
      "现在需要怎样的支持或下一步安排？",
    ],
    action:
      "一次结果不能定义你。如果涉及生活必需资金、债务或难以维持生活，优先寻求现实支持。",
  },
  {
    id: "sleep",
    title: "睡前收个尾巴",
    intro: "按你的工作、轮班或照顾责任调整，不要求马上入睡。",
    fields: [
      "现在能静音的一条非必要提醒",
      "明天再处理的一件事",
      "今天准备何时结束非必要浏览？",
      "适合自己的一个收尾动作",
    ],
    action:
      "保留紧急联系。持续睡不好或明显影响白天生活时，可以带着记录找医生。",
  },
  {
    id: "decision",
    title: "决定与计划对照",
    intro: "记录理由和变化，便于以后回看，不评价收益或能力。",
    fields: [
      "原来的计划和重新检查条件",
      "现在出现了什么新事实？",
      "我准备改变什么？为什么？",
      "之后复盘时，想检查哪个执行步骤？",
    ],
    action: "不必为了写完整而作决定。这张卡不能验证策略有效或资产安全。",
  },
  {
    id: "information",
    title: "给信息留一道边界",
    intro: "整理此刻真正需要的信息，不要求把所有消息处理完。",
    fields: [
      "现在需要回答的一个具体问题",
      "为这个问题保留的一至两个来源",
      "可以暂时静音的内容或提醒",
      "何时结束浏览，回到哪件事？",
    ],
    action: "保留必要的工作和紧急渠道。边界可以根据现实条件调整。",
  },
  {
    id: "support",
    title: "准备一次支持对话",
    intro: "只对安全、尊重你边界的人说。不会替你发送任何信息。",
    fields: [
      "我愿意联系谁？可以只写称呼。",
      "我想让对方理解的一件事",
      "我希望得到倾听，还是一项具体帮助？",
      "我愿意分享的程度和不想讨论的内容",
    ],
    action:
      "可以这样开口：“我最近有点难，方便听我说一会儿吗？”如果此刻无法保持安全，请使用安全支持入口。",
  },
  {
    id: "daily",
    title: "今日状态记录",
    intro: "记录生活，不计算健康总分，也不要求每天完成。",
    fields: [
      "现在的精力，用自己的话形容",
      "最近一次睡醒后的感受",
      "今天最占心力的一件事",
      "今天有帮助的一件小事",
    ],
    action: "偶尔记录也可以。记录变化不能证明原因，也不是治疗效果评估。",
  },
];
const valid = (r) =>
  r &&
  r.version === 1 &&
  typeof r.id === "string" &&
  r.id.length <= 80 &&
  resetTools.some((t) => t.id === r.tool) &&
  Number.isFinite(Date.parse(r.at)) &&
  Array.isArray(r.values) &&
  r.values.length === 4 &&
  r.values.every((v) => typeof v === "string" && v.length <= 1000);
export function readReset(storage) {
  try {
    const r = JSON.parse(storage.getItem(RESET_KEY) || "[]");
    return Array.isArray(r) ? r.filter(valid).slice(0, 100) : [];
  } catch {
    return [];
  }
}
export function saveReset(row, storage) {
  if (!valid(row)) throw Error("无效记录");
  storage.setItem(
    RESET_KEY,
    JSON.stringify([row, ...readReset(storage)].slice(0, 100)),
  );
}
export function weekReview(rows, now = new Date()) {
  const end = now.getTime(),
    start = end - 7 * 86400000;
  const recent = rows.filter(
    (r) => valid(r) && Date.parse(r.at) >= start && Date.parse(r.at) <= end,
  );
  return {
    count: recent.length,
    days: new Set(recent.map((r) => new Date(r.at).toLocaleDateString("zh-CN")))
      .size,
    tools: resetTools
      .map((t) => ({
        title: t.title,
        count: recent.filter((r) => r.tool === t.id).length,
      }))
      .filter((t) => t.count),
  };
}
let resetMemory = {};
export function clearResetMemory() {
  resetMemory = {};
}
export function resetView(el, toolId = "pause", onSafety = () => {}) {
  const root = el("section", { class: "reset-workspace" });
  let tool = resetTools.find((t) => t.id === toolId) || resetTools[0],
    values = ["", "", "", ""],
    consent = false,
    message = "",
    busy = false;
  if (resetMemory[tool.id]) values = resetMemory[tool.id];
  const remember = () => {
    resetMemory[tool.id] = values;
  };
  const render = () => {
    remember();
    const rows = readReset(localStore),
      week = weekReview(rows);
    root.replaceChildren(
      ...[
        el("header", { class: "workspace-head" }, [
          el("div", {}, [
            el("span", { class: "eyebrow" }, "DEGENDNA RESET"),
            el("h2", {}, "给自己一点缓冲"),
            el("p", {}, "选一个此刻用得上的工具。不打卡，不催促，也不评判。"),
          ]),
        ]),
        el(
          "div",
          { class: "journey-grid" },
          resetTools.map((t) =>
            el(
              "button",
              {
                class: "secondary",
                "aria-pressed": t.id === tool.id,
                onclick: () => {
                  if (
                    values.some(Boolean) &&
                    !confirm("切换工具会清空尚未保存的文字，继续吗？")
                  )
                    return;
                  tool = t;
                  values = resetMemory[t.id] || ["", "", "", ""];
                  consent = false;
                  message = "";
                  render();
                },
              },
              t.title,
            ),
          ),
        ),
        el(
          "form",
          {
            class: "care-card",
            onsubmit: (e) => {
              e.preventDefault();
              if (busy) return;
              if (!consent) {
                message = "这次没有保存。文字仍在当前页面，离开后不保留。";
                render();
                return;
              }
              try {
                busy = true;
                saveReset(
                  {
                    version: 1,
                    id: crypto.randomUUID(),
                    tool: tool.id,
                    at: new Date().toISOString(),
                    values,
                  },
                  localStore,
                );
                message = "已保存在当前浏览器，可以在下面回看或删除。";
                values = ["", "", "", ""];
                consent = false;
              } catch {
                message = "保存失败，文字仍在这里，请检查浏览器存储权限。";
              } finally {
                busy = false;
              }
              render();
            },
          },
          [
            el("h3", {}, tool.title),
            el("p", {}, tool.intro),
            ...tool.fields.map((f, i) =>
              el("label", { class: "reset-field" }, [
                f,
                el(
                  "textarea",
                  {
                    rows: 2,
                    maxlength: 1000,
                    oninput: (e) => {
                      values[i] = e.target.value;
                      remember();
                    },
                  },
                  values[i],
                ),
              ]),
            ),
            el("p", { class: "note-band" }, tool.action),
            el("label", { class: "care-consent" }, [
              el("input", {
                type: "checkbox",
                checked: consent,
                onchange: (e) => {
                  consent = e.target.checked;
                },
              }),
              "我愿意把这张卡保存在当前浏览器（未加密，共用设备请谨慎）",
            ]),
            el("button", { class: "primary", type: "submit" }, "完成这次记录"),
            el("p", { role: "status", "aria-live": "polite" }, message),
          ],
        ),
        el("section", { class: "care-card" }, [
          el("h3", {}, "最近 7 天，回头看看"),
          el(
            "p",
            {},
            `你主动保存了 ${week.count} 条记录，分布在 ${week.days} 天。这里只统计使用情况，不评价状态好坏。`,
          ),
          ...week.tools.map((t) => el("p", {}, `${t.title}：${t.count} 次`)),
          el(
            "p",
            {},
            "想一想：哪一个动作帮到了一点？哪些仍需要现实支持？没有记录的日子不作判断。",
          ),
        ]),
        el("section", { class: "care-card" }, [
          el("h3", {}, "本机工具记录"),
          el("p", {}, "最多保留最近 100 条。不上传，不自动传给小镜。"),
          ...rows.map((row) =>
            el("details", { class: "reset-entry" }, [
              el(
                "summary",
                {},
                `${resetTools.find((t) => t.id === row.tool).title} · ${new Date(row.at).toLocaleString("zh-CN")}`,
              ),
              ...row.values.map((v, i) =>
                el(
                  "p",
                  {},
                  `${resetTools.find((t) => t.id === row.tool).fields[i]}：${v || "未填写"}`,
                ),
              ),
              el(
                "button",
                {
                  class: "secondary",
                  type: "button",
                  onclick: () => {
                    if (!confirm("删除这条工具记录？此操作无法撤销。")) return;
                    try {
                      localStore.setItem(
                        RESET_KEY,
                        JSON.stringify(rows.filter((r) => r.id !== row.id)),
                      );
                      message = "已删除。";
                    } catch {
                      message = "未能删除，请检查浏览器存储权限。";
                    }
                    render();
                  },
                },
                "删除这条",
              ),
            ]),
          ),
          !rows.length ? el("p", {}, "还没有保存的工具记录。") : null,
        ]),
        el(
          "button",
          { class: "secondary", onclick: onSafety },
          "我现在需要安全支持",
        ),
      ].filter((node) => node !== null && node !== undefined),
    );
  };
  render();
  return root;
}
