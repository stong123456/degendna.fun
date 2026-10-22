// Entertainment only; deliberately independent of assessment answers and storage.
export const playStyles = [
  {
    id: "research",
    name: "线索考古员",
    text: "在这些情境里，你更常选择补充信息。别忘了为调查留一个结束点。",
  },
  {
    id: "plan",
    name: "计划守门员",
    text: "在这些情境里，你更常回看既定安排。新事实出现时，也可以重新检查理由。",
  },
  {
    id: "social",
    name: "观点连接者",
    text: "在这些情境里，你更常通过交流整理想法。别人愿意说的，也只是经历的一部分。",
  },
  {
    id: "space",
    name: "留白观察者",
    text: "在这些情境里，你更常给自己留一点时间。旁观和休息，也可以是主动选择。",
  },
];
// Editorial reflections on these choices, never a psychometric personality result.
const styleGuides = {
  research: { trait:'在这些想象情境里，你更愿意先弄清楚，再决定要不要动。可能你需要的不是更多热闹，而是一点能说清理由的踏实。这只是娱乐解读，不是在断定你的动机。', strength:'别人急着往前时，你愿意多问一句“依据是什么”，能给讨论带来值得核对的信息。', blindSpot:'也看看自己是否在等一个完全确定的答案。材料越来越多，却还没想清要回答哪个问题时，可以先停。', action:'下次搜索前写一个问题和够用的条件，查到后先回到原本要处理的事。', question:'你还缺一条重要事实，还是只是有点不敢结束搜索？' },
  plan: { trait:'在这些想象情境里，你会先把原来的安排拿出来看一眼。它可能在提醒你：别因为眼前热闹，就忘了自己原本要做什么。这只是娱乐解读。', strength:'愿意保留当时的理由，让之后的复盘不至于只剩“早知道”。', blindSpot:'有时原来的条件真的变了，守计划不等于不能改。关键是有没有新事实，而不是必须显得坚定。', action:'给一个计划补一句“出现什么新事实时，我会重新看”，调整时记下理由。', question:'你在守住重要的需要，还是只是不想承认旧方法不合适了？' },
  social: { trait:'在这些想象情境里，你把想法带到对话里慢慢理清。有人回应可能让问题更好想，但赞同不一定就是证据。这只是娱乐解读。', strength:'你愿意听听别人怎么经历同一件事，也给自己的疑问找一个能说出口的位置。', blindSpot:'一群人都赞同，容易让人暂时放心；但也要看看有没有遗漏不同经历，以及自己究竟认同什么。', action:'聊完以后独立写三行：听到了什么事实、哪些是对方的解释、自己还需要确认什么。', question:'如果没人给这个想法点赞，你还认同哪些理由？' },
  space: { trait:'在这些想象情境里，你愿意先不急着加入。给自己一点时间，也是在把选择权留在自己手上。这只是娱乐解读。', strength:'你让眼前的生活也有位置，不必每一次热闹都立刻参与。', blindSpot:'留白和一直不敢开始有时很像。可以看看休息后有没有更清楚，还是下一步始终没被说出来。', action:'给一件在意的小事留一个回看时间，到时只决定一个可撤回的小步骤；也允许最终不参与。', question:'这一段时间是在帮你恢复，还是需要有人陪你把第一步说清楚？' }
};
export const playQuestions = [
  [
    "群里突然开始刷同一个项目，你先做什么？",
    ["找原始资料", "回看自己的计划", "问问大家依据", "先把手头的事做完"],
  ],
  [
    "朋友发来一张收益截图，你更想怎么接？",
    [
      "问问完整的过程",
      "看看是否符合自己的范围",
      "聊聊对方的经历",
      "恭喜，然后继续自己的安排",
    ],
  ],
  [
    "出现一个完全陌生的叙事，你习惯怎样了解？",
    [
      "核对概念和出处",
      "判断是否值得列入计划",
      "找不同的人交流",
      "先观察一段时间",
    ],
  ],
  [
    "观点互相矛盾时，你先怎么整理？",
    [
      "区分事实和推测",
      "检查自己的判断条件",
      "听听不同解释",
      "等自己有精力再处理",
    ],
  ],
  [
    "想复盘一次经历，你通常先做什么？",
    ["整理时间线", "对照事前安排", "找人一起讨论", "先休息再回看"],
  ],
  [
    "今天没有明确要处理的事，你更愿意？",
    [
      "研究一个长期疑问",
      "整理待办后结束",
      "与朋友交流近况",
      "离开屏幕做点别的",
    ],
  ],
  [
    "一条消息让你很想立刻行动，你会先？",
    ["确认消息来源", "检查原定条件", "找可信任的人聊聊", "给自己一点时间"],
  ],
  [
    "准备结束今天的浏览，你更常？",
    [
      "保存有用的出处",
      "记下下次检查点",
      "总结给愿意交流的人",
      "关闭提醒，回到生活",
    ],
  ],
].map(([text, options], i) => ({ id: `play-${i + 1}`, text, options }));
export function playResult(answers) {
  if (
    !Array.isArray(answers) ||
    answers.length !== playQuestions.length ||
    Array.from(answers).some((v) => !Number.isInteger(v) || v < 0 || v > 3)
  )
    return null;
  const counts = playStyles.map((s, i) => ({
    ...s,
    count: answers.filter((v) => v === i).length,
  }));
  const max = Math.max(...counts.map((s) => s.count));
  const top = counts.filter((s) => s.count === max);
  return {
    name: top.length === 1 ? top[0].name : "多面探索者",
    text:
      top.length === 1
        ? top[0].text
        : "几种选择同样常出现，不强选一种风格。你可以在不同情境里使用不同方式。",
    version: "play-20261016-v1",
    interpretationVersion: "play-reflection-20261022-v3",
    distribution: counts.map(({id,name,count})=>({id,name,count})),
    perspectives: top.map(style=>({ id:style.id, name:style.name, count:style.count, ...styleGuides[style.id],
      evidence:playQuestions.flatMap((q,i)=>answers[i]===playStyles.findIndex(s=>s.id===style.id)?[{question:q.text,answer:q.options[answers[i]]}]:[]) })),
  };
}
let playMemory = [];
export function clearPlayMemory() {
  playMemory = [];
}
export function playView(el) {
  const root = el("section", { class: "play-workspace" });
  let answers = [...playMemory],
    result = null,
    message = "";
  const render = () =>
    root.replaceChildren(
      ...[
        el("header", { class: "workspace-head" }, [
          el("div", {}, [
            el("span", { class: "eyebrow" }, "DEGENDNA PLAY"),
            el("h2", {}, "认识我的交易风格"),
            el(
              "p",
              {},
              "8 个想象情境，看看你更习惯怎样探索。仅供娱乐，不衡量能力、心理健康或收益。",
            ),
          ]),
        ]),
        el(
          "p",
          { class: "note-band" },
          "这里不读取钱包、自查报告或本地健康记录。答案只在本次页面内存，不保存。分享前会显示完整预览。",
        ),
        ...playQuestions.map((q, i) =>
          el("fieldset", { class: "question-card" }, [
            el("legend", {}, `${i + 1}. ${q.text}`),
            el(
              "div",
              { class: "play-options" },
              q.options.map((o, j) =>
                el("label", {}, [
                  el("input", {
                    type: "radio",
                    name: q.id,
                    value: j,
                    checked: answers[i] === j,
                    onchange: () => {
                      answers[i] = j;
                      playMemory = [...answers];
                      result = null;
                      message = "";
                      render();
                    },
                  }),
                  o,
                ]),
              ),
            ),
          ]),
        ),
        el(
          "button",
          {
            class: "primary",
            disabled: answers.filter(Number.isInteger).length !== 8,
            onclick: () => {
              result = playResult(answers);
              render();
              root
                .querySelector("#play-result")
                ?.scrollIntoView({ block: "start" });
            },
          },
          "看看我的风格",
        ),
        result
          ? el("section", { id: "play-result", class: "care-card" }, [
              el("h3", {}, result.name),
              el("p", {}, result.text),
              el("p", {}, "这些只是本次情境选择的概括，不是固定人格。优势是这些选择可能带来的帮助，盲点是值得核对的问题，并不表示你一定存在这些缺点。"),
              el('p',{},`本次分布：${result.distribution.map(s=>`${s.name} ${s.count}/8`).join('；')}。次数是本次选项数，不是能力分或百分位。`),
              ...result.perspectives.map(style=>el('article',{class:'insight-card'},[
                el('h4',{},style.name),el('p',{},`像不像你的一个小习惯：${style.trait}`),
                el('h4',{},'可能的优势'),el('p',{},style.strength),el('h4',{},'值得核对的盲点'),el('p',{},style.blindSpot),
                el('h4',{},'下一次可以试试'),el('p',{},style.action),el('p',{},style.question),
                el('details',{},[el('summary',{},'对应哪些选择？'),el('ul',{},style.evidence.map(e=>el('li',{},`${e.question} → ${e.answer}`)))])
              ])),
              el('small',{},`解读版本：${result.interpretationVersion} · 情境题不衡量人格、心理健康或交易表现。`),
              el("details", {}, [
                el("summary", {}, "风格怎样产生？"),
                el(
                  "p",
                  {},
                  "每道题的四个选项分别对应信息、计划、交流、留白。选择最多的方向成为本次风格，并列时呈现多面探索者。这是编辑设计的娱乐规则，未经过科学验证。",
                ),
              ]),
              el("h4", {}, "分享卡预览"),
              el("div", { class: "share-preview" }, [
                el("strong", {}, "DegenDNA Play"),
                el("h3", {}, result.name),
                el("p", {}, result.text),
                el("small", {}, "情境小游戏 · 仅供娱乐 · degendna.fun"),
              ]),
              el(
                "p",
                {},
                "图片只含上方文字，不含逐题答案、钱包、心理自查或心情记录。",
              ),
              el(
                "button",
                {
                  class: "secondary",
                  onclick: () => {
                    const c = document.createElement("canvas");
                    c.width = 1080;
                    c.height = 720;
                    const x = c.getContext("2d");
                    x.fillStyle = "#e9f1eb";
                    x.fillRect(0, 0, 1080, 720);
                    x.fillStyle = "#234a3e";
                    x.font = "32px sans-serif";
                    x.fillText("DegenDNA Play", 70, 100);
                    x.font = "bold 64px sans-serif";
                    x.fillText(result.name, 70, 235);
                    x.font = "30px sans-serif";
                    let line = "",
                      y = 345;
                    for (const ch of result.text) {
                      if (x.measureText(line + ch).width > 920) {
                        x.fillText(line, 70, y);
                        line = "";
                        y += 48;
                      }
                      line += ch;
                    }
                    x.fillText(line, 70, y);
                    x.font = "24px sans-serif";
                    x.fillText("情境小游戏 · 仅供娱乐 · degendna.fun", 70, 640);
                    c.toBlob((blob) => {
                      if (!blob) {
                        message = "图片生成失败，请重试。";
                        render();
                        return;
                      }
                      const url = URL.createObjectURL(blob),
                        a = document.createElement("a");
                      a.href = url;
                      a.download = "degendna-play.png";
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                      message = "已生成图片，你可以自行决定是否分享。";
                      render();
                    });
                  },
                },
                "下载这张娱乐卡",
              ),
              el(
                "button",
                {
                  class: "secondary",
                  onclick: () => {
                    answers = [];
                    playMemory = [];
                    result = null;
                    message = "";
                    render();
                  },
                },
                "重新玩一次",
              ),
              el("p", { role: "status" }, message),
            ])
          : null,
      ].filter((node) => node !== null && node !== undefined),
    );
  render();
  return root;
}
