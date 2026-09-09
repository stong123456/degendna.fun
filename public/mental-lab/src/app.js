import { assessments, assessmentMap, responseScale, contextQuestions } from "./assessments.js";
import { buildCompositeProfile, scoreAssessment, isCurrentRecord, compareRecords, sources } from "./scoring.js";
import { humanizeReport } from "./report-copy.js";
import { recentType } from "./recent-type.js";

const storageKey = "degendna-mental-lab-records";
const themeKey = "degendna-mental-lab-theme";
const app = document.querySelector("#app");

const themes = [
  { id: "garden", name: "暖光疗愈", code: "01", icon: "sun", heading: "给自己，\n一点留白。", label: "A LITTLE ROOM TO BREATHE" },
  { id: "prism", name: "晶体实验室", code: "02", icon: "gem", heading: "看见自己\n的更多面。", label: "A CLEARER VIEW OF YOU" },
  { id: "night", name: "夜航诊所", code: "03", icon: "moon", heading: "今夜，\n慢慢来。", label: "A QUIET PLACE TO LAND" }
];

function readPreference(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
const initialTheme = new URLSearchParams(location.search).get("theme") || readPreference(themeKey);

const state = {
  route: new URLSearchParams(location.search).get("page") === "about" ? "about" : "home",
  activeAssessmentId: "trading",
  answers: {},
  context: {},
  lastResult: null,
  savedThisRun: false,
  storageError: "",
  saveLocal: false,
  theme: themes.some((theme) => theme.id === initialTheme) ? initialTheme : "garden"
};

const navItems = [
  ["home", "首页", "house"],
  ["library", "自测库", "layout-grid"],
  ["trading", "交易心理", "chart-no-axes-combined"],
  ["records", "本地记录", "book-open"],
  ["safety", "安全支持", "heart-handshake"],
  ["method", "方法说明", "shield-check"],
  ["about", "关于", "heart"]
];

function icon(name) {
  return el("i", { "data-lucide": name, class: "icon", "aria-hidden": "true" });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== false && value !== null && value !== undefined) node.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function getRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(records) ? records.filter((record) => record && typeof record === "object" && typeof record.title === "string") : [];
  } catch {
    return [];
  }
}

function saveRecord(result) {
  if (!isCurrentRecord(result)) return false;
  const records = getRecords();
  records.unshift(result);
  try {
    localStorage.setItem(storageKey, JSON.stringify(records.slice(0, 100)));
    return true;
  } catch {
    state.storageError = "浏览器未能保存记录。本次报告仍可查看，但关闭页面后可能丢失。";
    return false;
  }
}

function setRoute(route) {
  state.route = route;
  const url = new URL(location.href);
  if (route === "about") url.searchParams.set("page", "about");
  else url.searchParams.delete("page");
  history.replaceState(null, "", url);
  state.lastResult = null;
  render();
}

function selectAssessment(id, route = "home") {
  state.activeAssessmentId = id;
  state.saveLocal = false;
  state.answers = {};
  state.context = {};
  state.lastResult = null;
  state.savedThisRun = false;
  state.storageError = "";
  state.route = assessmentMap[id]?.safetyOnly ? "safety" : route;
  render();
}

function getActiveAssessment() {
  return assessmentMap[state.activeAssessmentId] || assessments[0];
}

function shell(content) {
  return el("div", { class: `product-shell theme-${state.theme}`, "data-route": state.route }, [
    iconRail(),
    sideIntro(),
    el("main", { class: "workspace", id: "main-content" }, [
      el("header", { class: "workspace-toolbar" }, [
        el("span", { class: "breadcrumb" }, "MENTAL LAB / 个人觉察空间"), compactThemeSwitch()
      ]), ...content,
      el("footer", { class: "workspace-footer" }, [
        el("span", {}, "你不是账户余额，也不是一次交易结果。"),
        el("button", { onclick: () => setRoute("method") }, "原创自测 · 非诊断")
      ])
    ]),
    state.route === "safety" ? null : statusRail()
  ]);
}

function iconRail() {
  return el("aside", { class: "icon-rail", "aria-label": "快捷导航" }, [
    el("button", { class: "dna-logo", onclick: () => setRoute("home"), "aria-label": "DegenDNA" }, icon("dna")),
    el("nav", {}, navItems.map(([route, label, iconName]) =>
      el("button", {
        class: `rail-button ${state.route === route ? "active" : ""}`,
        title: label,
        "aria-label": label,
        "aria-current": state.route === route ? "page" : null,
        onclick: () => setRoute(route)
      }, [icon(iconName), el("span", { class: "nav-label" }, label)])
    )),
    el("button", { class: "rail-button bottom", title: "安全支持", "aria-label": "立即获得支持", onclick: () => setRoute("safety") }, icon("heart-handshake"))
  ]);
}

function sideIntro() {
  const theme = themes.find((item) => item.id === state.theme);
  return el("aside", { class: "intro-panel" }, [
    el("img", { class: "intro-art", src: `/mental-lab/assets/${state.theme}.png`, alt: "", "aria-hidden": "true" }),
    el("div", { class: "brand-lockup" }, [
      el("strong", {}, "DegenDNA"),
      el("span", {}, "Mental Lab")
    ]),
    el("section", { class: "intro-copy" }, [
      el("span", { class: "intro-eyebrow" }, theme.label),
      el("h1", {}, theme.heading),
      el("p", {}, "照顾自己的开始，\n是愿意听听内心的声音。")
    ]),
    el("button", { class: "safety-card", onclick: () => setRoute("safety") }, [
      el("span", { class: "soft-icon" }, icon("heart-handshake")),
      el("span", {}, [
        el("strong", {}, "安全支持"),
        el("small", {}, "当你需要倾诉或帮助时")
      ]),
      icon("arrow-up-right")
    ])
  ]);
}

function statusRail() {
  const records = getRecords().filter(isCurrentRecord);
  const latest = records[0];
  const dims = latest?.domains || [];

  return el("aside", { class: "status-panel" }, [
    el("div", { class: "account-chip" }, [
      el("span", { class: "shield-dot" }, icon("shield-check")),
      el("span", {}, [
        el("strong", {}, "你的私人空间"),
        el("small", {}, "不登录 · 答案不上传")
      ]),
      el("i", {})
    ]),
    el("section", { class: "status-card" }, [
      el("div", { class: "card-head" }, [
        el("h2", {}, "最近状态"),
        el("button", { onclick: () => setRoute("records"), "aria-label": "查看记录" }, icon("arrow-up-right"))
      ]),
      el("div", { class: "score-row" }, [
        el("div", {}, [
          el("span", {}, latest ? latest.title : "还没有自测记录"),
          el("strong", {}, latest ? "回答画像" : "从了解开始"),
          el("small", {}, latest ? `${latest.answered}/${latest.totalItems} 项有效回答` : "按照自己的节奏就好")
        ]),
        el("span", { class: "empty-state-icon" }, icon("sprout"))
      ])
    ]),
    el("section", { class: "status-card" }, [
      el("div", { class: "card-head" }, [
        el("h2", {}, latest ? "同项复测" : "一次小小的开始"),
        icon("leaf")
      ]),
      latest ? el("p", {}, "同模块、同版本、相同已答项目才作描述性回看。不把不同自测混成一个健康分数。") : el("p", {}, "留几分钟给自己。不必急着找到答案，也不用追求一个漂亮的分数。"),
      el("button", { class: "text-action", onclick: () => selectAssessment("quick", "assessment") }, [el("span", {}, "做一次快速自查"), icon("arrow-right")])
    ]),
    el("section", { class: "status-card" }, [
      el("h2", {}, dims.length ? "近期维度" : "在这里，你可以"),
      dims.length ? el("div", { class: "snapshot-list" }, dims.slice(0, 4).map((dim) => el("p", {}, `${dim.label}：${dim.interpretable ? `${dim.frequent}/${dim.answered} 项较常出现` : "回答覆盖不足"}`))) : el("ol", { class: "gentle-steps" }, ["选择想了解的状态", "按真实感受回答", "给自己一个小行动"].map((text) => el("li", {}, text)))
    ]),
    el("section", { class: "privacy-note" }, [
      icon("lock-keyhole"),
      el("strong", {}, "保存与否，由你决定"),
      el("span", {}, "自测默认不保存。主动保存的记录只留在当前浏览器。")
    ])
  ]);
}

function setTheme(theme) {
  if (!themes.some((item) => item.id === theme)) return;
  state.theme = theme;
  try { localStorage.setItem(themeKey, theme); } catch { /* Theme works without storage. */ }
  const url = new URL(location.href);
  url.searchParams.set("theme", theme);
  history.replaceState(null, "", url);
  document.body.dataset.theme = theme;
  document.querySelector(".product-shell").className = `product-shell theme-${theme}`;
  document.querySelector(".intro-panel").replaceWith(sideIntro());
  document.querySelector(".compact-themes").replaceWith(compactThemeSwitch());
  window.lucide?.createIcons();
}

function homeView() {
  const active = getActiveAssessment();
  const modules = ["trading", "stress", "mood", "sleep"].map((id) => assessmentMap[id]);
  return shell([
    el("section", { class: "workspace-head" }, [
      el("div", {}, [
        el("span", { class: "eyebrow" }, "SELF REFLECTION"),
        el("h2", {}, "今天，想先了解哪一面？"),
        el("p", {}, "从一个小问题开始，慢慢看见最近的自己。")
      ]),
      el("span", { class: "section-count" }, "01 / EXPLORE")
    ]),
    el("section", { class: "module-showcase" }, modules.map((module) => moduleTile(module, module.id === active.id))),
    previewQuestion(active)
  ]);
}

function compactThemeSwitch() {
  return el("div", { class: "compact-themes", "aria-label": "切换视觉模板" }, themes.map((theme) =>
    el("button", {
      class: state.theme === theme.id ? "active" : "",
      title: theme.name,
      "aria-pressed": state.theme === theme.id ? "true" : "false",
      "aria-label": theme.name,
      onclick: () => setTheme(theme.id)
    }, [icon(theme.icon), el("span", {}, theme.name)])
  ));
}

function moduleTile(module, active = false) {
  return el("button", {
    class: `soft-module accent-${module.accent} ${active ? "active" : ""}`,
    "aria-pressed": active ? "true" : "false",
    onclick: () => selectAssessment(module.id, state.route === "home" ? "home" : "assessment")
  }, [
    el("span", { class: "module-symbol" }, icon(moduleSymbol(module.id))),
    el("span", { class: "module-category" }, module.enTitle),
    el("h3", {}, ({trading: "交易心理自查", stress: "压力与恢复", mood: "情绪状态觉察", sleep: "睡眠与精力"})[module.id] || shortTitle(module.title)),
    el("p", {}, shortSubtitle(module)),
    el("div", { class: "tile-foot" }, [
      el("span", {}, [icon("clock-3"), `约 ${module.minutes} 分钟`]),
      el("b", {}, icon("arrow-up-right"))
    ])
  ]);
}

function moduleSymbol(id) {
  return ({ trading: "chart-no-axes-combined", stress: "sprout", mood: "smile", sleep: "moon", quick: "scan-heart", anxiety: "wind", recovery: "battery-charging", support: "hand-heart", safety: "heart-handshake" })[id] || "activity";
}

function shortTitle(title) {
  return title.replace("检测", "").replace("自查", "");
}

function shortSubtitle(module) {
  const copy = {
    stress: "分开观察任务负担和可获得的恢复空间",
    mood: "观察近期情绪体验与日常行动",
    sleep: "记录睡眠体验与日间困倦",
    quick: "从近期体验开始，不给自己下结论",
    anxiety: "观察担心、检查行为和身体紧张",
    recovery: "了解恢复机会和现实阻碍",
    support: "观察关系中的支持和求助顾虑"
  };
  return copy[module.id] || module.subtitle;
}

function previewQuestion(assessment) {
  const item = assessment.items[0];
  return el("section", { class: `question-preview accent-${assessment.accent}` }, [
    el("div", { class: "preview-top" }, [
      el("span", {}, `问题预览 · ${assessment.title}`),
      el("div", { class: "mini-progress" }, [
        el("small", {}, `${assessment.items.length} 道原创题目`),
        icon("sparkles")
      ])
    ]),
    el("div", { class: "preview-body" }, [
      el("div", { class: "preview-question" }, [
        el("h3", {}, item.text),
        el("p", {}, `${assessment.scope}，这种情况出现的频率是？`),
        el("div", { class: "preview-options", role: "radiogroup", "aria-label": "预览题回答" }, responseScale.map((option) => previewOption(option, item))),
        el("div", { class: "preview-bottom" }, [
          el("button", { class: "primary", onclick: () => { state.route = "assessment"; render(); window.scrollTo(0, 0); } }, [el("span", {}, "开始完整自查"), icon("arrow-right")]),
          el("span", {}, "原创自查工具，尚未经临床验证")
        ])
      ]),
      el("div", { class: "preview-visual", "aria-hidden": "true" }, [
        icon(moduleSymbol(assessment.id)),
        el("span", { class: "quiet-number" }, String(assessment.items.length).padStart(2, "0")),
        el("span", {}, "QUESTIONS"),
        el("p", {}, "了解自己，\n不必急于定义自己。")
      ])
    ])
  ]);
}

function previewOption(option, item) {
  const selected = state.answers[item.id] === option.value;
  return el("button", { class: `preview-option ${selected ? "selected" : ""}`, role: "radio", "aria-checked": selected ? "true" : "false", onclick: () => { state.answers[item.id] = option.value; render(); } }, [
    el("span", { class: "radio-dot" }),
    el("b", {}, option.zh)
  ]);
}

function libraryView(filter = null) {
  const list = filter ? assessments.filter((item) => item.id === filter) : assessments;
  return shell([
    el("section", { class: "workspace-head" }, [
      el("div", {}, [
        el("h2", {}, filter ? "交易心理自查" : "完整模块库"),
        el("p", {}, filter ? "观察行情、仓位、亏损、FOMO、睡眠和自我评价之间的关系。" : "原创题库，覆盖情绪、焦虑、压力、睡眠、恢复力、社交支持和安全支持。")
      ]),
      el("button", { class: "ghost-action", onclick: () => setRoute("method") }, "查看方法")
    ]),
    el("section", { class: "library-grid" }, list.map((module) => moduleTile(module, module.id === state.activeAssessmentId)))
  ]);
}

function assessmentView() {
  const assessment = getActiveAssessment();
  if (assessment.safetyOnly) return safetyView();
  const answered = assessment.items.filter((item) => Object.hasOwn(state.answers, item.id)).length;
  const progress = Math.round((answered / assessment.items.length) * 100);
  return shell([
    el("section", { class: `test-panel accent-${assessment.accent}` }, [
      el("div", { class: "test-head" }, [
        el("button", { class: "ghost-action", onclick: () => setRoute("library") }, "返回模块库"),
        el("div", {}, [
          el("h2", {}, assessment.title),
          el("p", {}, `${assessment.scope} · ${assessment.items.length} 题 · 约 ${assessment.minutes} 分钟`)
        ]),
        el("div", { class: "round-progress" }, `${progress}%`)
      ]),
      el("p", { class: "note-band" }, "适用于成年人自我观察，尚未经临床验证。请按指定时间内的真实体验回答；没有遇到相关情境、无法判断或不想回答时，可以跳过。频率不是能力或严重度。结果仅依据你提供的信息。"),
      safetyQuestion(),
      el("div", { class: "progress-line" }, el("span", { style: `width:${progress}%` })),
      el("div", { class: "questions" }, assessment.items.map((item, index) => questionCard(item, index))),
      contextPanel(),
      el("div", { class: "submit-panel" }, [
        el("label", { class: "local-toggle" }, [
          el("input", { type: "checkbox", checked: state.saveLocal, onchange: (event) => { state.saveLocal = event.target.checked; } }),
          el("span", {}, "保存报告与回答依据到本地浏览器（共用设备请谨慎）")
        ]),
        el("button", {
          class: "primary",
          disabled: answered === 0,
          onclick: () => completeAssessment(assessment)
        }, answered === assessment.items.length ? "生成回答画像" : `查看已答 ${answered} 题的结果`)
      ])
    ]),
    state.lastResult ? resultPanel(state.lastResult) : null
  ]);
}

function questionCard(item, index) {
  return el("fieldset", { class: "question-card" }, [
    el("legend", { class: "question-title" }, [
      el("span", {}, String(index + 1).padStart(2, "0")),
      el("h3", {}, item.text)
    ]),
    el("div", { class: "scale-row" }, responseScale.map((option) =>
      el("label", { class: state.answers[item.id] === option.value ? "selected" : "" }, [
        el("input", {
          type: "radio",
          name: item.id,
          value: option.value,
          checked: state.answers[item.id] === option.value,
          onchange: () => {
            state.answers = { ...state.answers, [item.id]: option.value };
            state.lastResult = null;
            state.savedThisRun = false;
            render();
          }
        }),
        el("span", {}, option.zh)
      ])
    ))
  ]);
}

function safetyQuestion() {
  return el("fieldset", { class: "context-question" }, [
    el("legend", {}, "在这次自查的观察期内，你是否出现过伤害自己、结束生命，或希望自己不再醒来的想法？即使很少也算。"),
    el("p", {}, "这项不计分、不保存。选择“有过”会先打开支持页，不意味着系统判断你处于即时危险。"),
    el("div", { class: "context-options" }, [["no", "没有"], ["yes", "有过，先看看支持"], ["skip", "不愿回答"]].map(([value, label]) => el("label", {}, [
      el("input", { type: "radio", name: "safety", value, checked: state.context.safety === value, onchange: () => {
        state.context.safety = value;
        state.lastResult = null;
        if (value === "yes") { state.route = "safety"; state.answers = {}; }
        render();
        if (value === "yes") window.scrollTo(0, 0);
      } }), label
    ])))
  ]);
}

function contextPanel() {
  return el("section", { class: "context-panel" }, [
    el("h3", {}, "把回答放回生活里"),
    el("p", {}, "以下信息可选，不与频率回答相加。没有提供时，结果会保留判断。"),
    ...contextQuestions.map((question) => el("fieldset", { class: "context-question" }, [
      el("legend", {}, question.text),
      el("div", { class: "context-options" }, question.options.map(([value, label]) => el("label", {}, [
        el("input", { type: "radio", name: `context-${question.id}`, value, checked: state.context[question.id] === value, onchange: () => {
          state.context[question.id] = value; state.lastResult = null; state.savedThisRun = false; render();
        } }), label
      ])))
    ]))
  ]);
}

function completeAssessment(assessment) {
  const result = scoreAssessment(assessment, state.answers, state.context);
  if (result.safetyTriggered) { state.route = "safety"; state.lastResult = null; render(); return; }
  state.lastResult = result;
  state.storageError = "";
  state.savedThisRun = state.saveLocal ? saveRecord(result) : false;
  render();
  requestAnimationFrame(() => document.querySelector("#result")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function resultPanel(result) {
  if (!isCurrentRecord(result)) return el("p", {}, "旧版结果不作新版解释，请重新自查。旧记录仍保留在本地。" );
  result = humanizeReport(result);
  const previous = getRecords().find((record) => Date.parse(record.createdAt) < Date.parse(result.createdAt) && compareRecords(result, record).length);
  const comparison = previous ? compareRecords(result, previous) : [];
  return el("section", { id: "result", class: "reflection-report", "aria-label": "多维回答报告" }, [
    el("header", {}, [el("p", { class: "system-label" }, `${result.scope} · ${result.title}`), el("h2", {}, "给此刻的你，一份温柔的回看"), el("p", {}, "谢谢你愿意停下来，看看自己的感受。你不用把这份结果当成成绩单，也不需要一下子改变很多。"), el("p", { class: "report-summary" }, result.summary)]),
    el("p", { class: "coverage-note" }, `你回答了 ${result.answered}/${result.totalItems} 题的发生频率，主动跳过 ${result.skipped} 题。这只是你最近生活的一小部分，不是对你的定义。`),
    el("p", { class: "coverage-note" }, "这是一份帮助你了解自己的原创自查，不是诊断，尚未经临床验证。你的真实感受比这份文字更重要。"),
    state.storageError ? el("p", { role: "alert" }, state.storageError) : null,
    reportSection("先看看，你现在需要什么支持", [el("h3", {}, result.support.title), el("p", {}, result.support.text), el("button", { class: "secondary", onclick: () => setRoute("safety") }, "我现在需要即时支持")]),
    ...result.notices.map((notice) => reportSection(notice.title, [el("p", {}, notice.text), evidenceList(notice.evidence)])),
    recentTypePanel(result),
    ...result.warnings.map((text) => el("p", { class: "note-band" }, text)),
    reportSection("01 / 从你愿意分享的事情说起", [el("p", {}, "下面既有让你费心的事，也有可能帮到你的事。回答还少的地方，我们先不猜。你可以只看现在最关心的一部分。"), ...result.domains.map(domainPanel)]),
    reportSection("02 / 这些感受，怎样影响了你的生活", [el("dl", { class: "context-results" }, result.context.flatMap((entry) => [el("dt", {}, entry.question), el("dd", {}, entry.label)])), el("p", {}, "即使刚刚开始，只要已经让你难受，也值得找人聊聊。")]),
    reportSection("03 / 有些事情，可以放在一起看看", result.patterns.length ? result.patterns.map((pattern) => el("article", {}, [el("h3", {}, pattern.title), el("p", {}, pattern.text), el("small", {}, `依据：${pattern.evidence.join("；")}。它们在同一段时间出现，不代表一件事造成了另一件事。`)])) : [el("p", {}, "现在还看不出这些感受之间有什么联系。没关系，我们不需要替每一种感受都找出原因。")]),

    reportSection("04 / 今天，只选一件小事就好", result.plan.map((step) => el("article", {}, [el("h3", {}, step.title), el("p", {}, step.text), el("details", {}, [el("summary", {}, "为什么提到这一步？"), el("p", {}, step.reason)])]))),
    reportSection("05 / 以后想回头看看时", [el("p", {}, "你可以过一周再回头看看，也可以等自己想聊的时候再来。不用反复做题追求一个更好的结果。前后回答变了，可能和那几天的生活有关，不能只凭数字判断自己好转或变糟。"), comparison.length ? el("ul", {}, comparison.map((entry) => el("li", {}, `${entry.label}：较常出现的条目 ${entry.previous}/${entry.total} → ${entry.current}/${entry.total}（${entry.kind === "resource" ? "资源" : "困扰"}）。`))) : el("p", {}, "现在还没有合适的旧记录可以一起看。不急，这次就从了解当下开始。")]),
    el("details", { class: "report-section report-method" }, [el("summary", {}, "想了解这份结果是怎么来的？"),el("ul", {}, result.limitations.map((text) => el("li", {}, text))), el("p", {}, "以下资料支持内容审阅原则和求助边界，不代表这些机构认可或验证了本产品。"), el("ul", {}, sources.map((source) => el("li", {}, el("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, source.title))))]),
    el("button", { class: "secondary", onclick: () => setRoute(state.savedThisRun ? "records" : "library") }, state.savedThisRun ? "已保存，查看本地记录" : "返回自测库")
  ]);
}

function reportSection(title, children) {
  return el("section", { class: "report-section" }, [el("h2", {}, title), ...children]);
}

function recentTypePanel(result) {
  const profile = recentType(result);
  if (!profile) return null;
  return el("section", { class: "report-section recent-type", "data-type-state": profile.state, "aria-label": "近期类型" }, [
    el("p", { class: "system-label" }, `${result.title} · 近期类型`),
    el("h2", {}, profile.state === "matched" ? `这段时间，你更接近：${profile.name}` : "先不急着用一个名字概括你"),
    profile.code ? el("strong", { class: "type-code" }, profile.code) : null,
    el("p", {}, profile.text),
    profile.evidence ? el("details", {}, [el("summary", {}, "为什么出现这个类型？"), evidenceList(profile.evidence)]) : null,
    profile.action ? el("p", {}, `可以试着做的一小步：${profile.action}`) : null,
    el("p", { class: "coverage-note" }, "这是近期回答的概括，会随生活变化，不是诊断。代号只是名字的编号，不是分数或排名。"),
    el("details", {}, [el("summary", {}, "类型是怎么选出来的？"), el("p", {}, "每个模块单独匹配：至少回答四分之三的题目，相关内容也要回答充分，其中至少两题、且不少于一半选了经常或几乎总是。多个特点接近时不选主类型。这里的规则是产品的试行整理方式，尚未经科学验证，不代表发生频率能衡量一个人的价值或能力。")])
  ]);
}

function evidenceList(evidence) {
  return el("ul", { class: "answer-evidence" }, evidence.map((item) => el("li", {}, [el("span", {}, item.text), el("strong", {}, item.response)])));
}

function domainPanel(domain) {
  return el("article", { class: `domain-report kind-${domain.kind}` }, [
    el("div", { class: "domain-heading" }, [el("h3", {}, domain.label), el("span", {}, domain.kind === "resource" ? "可能帮到你的事" : "值得照顾的感受")]),
    el("p", { class: "domain-interpretation" }, domain.interpretation),
    el("details", {}, [el("summary", {}, `看看我在这里怎么回答的（${domain.answered}/${domain.total}）`), el("div", { class: "frequency-distribution" }, [
      el("span", {}, `从不 / 很少 ${domain.infrequent} 项`), el("span", {}, `有时 ${domain.occasional} 项`), el("span", {}, `经常 / 几乎总是 ${domain.frequent} 项`)
    ]), evidenceList(domain.evidence)]),
    el("p", {}, `如果愿意，可以想一想：${domain.reflection}`),
    el("details", {}, [el("summary", {}, "这一部分还不能说明什么？"), el("p", {}, domain.limit)])
  ]);
}

function recordsView() {
  const records = getRecords();
  const profile = buildCompositeProfile(records);
  return shell([
    el("section", { class: "workspace-head" }, [
      el("div", {}, [
        el("h2", {}, "本地复测记录"),
        el("p", {}, "记录含回答依据，只在当前浏览器。不是加密保险箱，共用设备请谨慎；不会与钱包绑定。")
      ]),
      records.length ? el("button", { class: "ghost-action", onclick: () => { if (confirm("清除这个浏览器中的全部自测记录？此操作无法撤销。")) { try { localStorage.removeItem(storageKey); state.lastResult = null; render(); } catch { alert("未能清除，请检查浏览器存储权限。"); } } } }, "清除记录") : null
    ]),
    el("p", { class: "note-band" }, `已保存 ${profile.modules.length} 类新版自查。不计算跨模块健康总分。${profile.legacyCount ? `另有 ${profile.legacyCount} 条旧版记录，保留原始存储，不沿用其分级，也不混入新版比较。` : ""}`),
    records.length
      ? el("div", { class: "record-list" }, records.map(recordCard))
      : el("div", { class: "empty" }, "还没有本地记录。完成自测并勾选保存后，会出现在这里。"),
    state.lastResult ? resultPanel(state.lastResult) : null
  ]);
}

function recordCard(record) {
  return el("article", { class: "record-card" }, [
    el("div", {}, [
      el("h3", {}, record.title),
      el("p", {}, new Date(record.createdAt).toLocaleString("zh-CN")),
      el("small", {}, isCurrentRecord(record) ? `${record.answered}/${record.totalItems} 项有效回答 · ${record.version}` : "旧版记录：解释模型已更换，不继续展示原分级")
    ]),
    isCurrentRecord(record) ? el("button", { class: "secondary", onclick: () => { state.lastResult = record; state.savedThisRun = true; render(); document.querySelector("#result")?.scrollIntoView({ block: "start" }); } }, "查看报告") : null
  ]);
}

function safetyView() {
  return shell([
    el("section", { class: "safety-hero" }, [
      el("p", { class: "system-label" }, "安全支持"),
      el("h2", {}, "如果你现在撑不住，先不要一个人扛。"),
      el("p", {}, "先暂停会加重困扰的信息输入，尽可能去有人陪伴且安全的地方。这个页面不评分，也不判断危险等级。出现过相关想法，值得尽早获得支持；若你此刻可能伤害自己、无法保持安全，请立即联系当地紧急服务或去最近的急诊。")
    ]),
    el("section", { class: "support-grid" }, [
      safetyStep("1", "联系一个人", "给一个可信任的人打电话或发消息，让 TA 现在陪你，哪怕只是保持通话。"),
      safetyStep("2", "降低危险", "远离危险环境，请可信任的人协助保管可能伤害自己的物品，尽量不要独处。涉及处方药时，不要自行改变用药安排。"),
      safetyStep("3", "寻求即时帮助", "如果你已经有具体计划、工具或强烈冲动，请立刻联系当地紧急服务，或去最近的急诊。")
    ]),
    el("section", { class: "copy-box" }, [
      el("h2", {}, "可以直接发给朋友的话"),
      el("p", { id: "friend-message" }, "我现在状态很不好，可能需要你陪我一下。你能不能现在联系我，或者过来陪我一会儿？"),
      el("button", {
        class: "primary",
        onclick: async () => {
          try {
            if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
            await navigator.clipboard.writeText(document.querySelector("#friend-message").textContent);
            alert("已复制。请现在发给一个可信任的人。");
          } catch { alert("复制未成功。可以选中上面的文字手动复制，也可以直接打电话联系对方。"); }
        }
      }, "复制这句话")
    ])
  ]);
}

function safetyStep(number, title, copy) {
  return el("article", { class: "support-card" }, [
    el("span", {}, number),
    el("h3", {}, title),
    el("p", {}, copy)
  ]);
}

function aboutView() {
  return shell([
    el("section", { class: "about-letter", "aria-label": "关于石头与 DegenDNA" }, [
      el("p", { class: "system-label" }, "A NOTE FROM STONE / 写给来到这里的你"),
      el("h2", {}, "为什么我做 DegenDNA？"),
      el("p", { class: "about-lead" }, "市场会波动，钱包会回撤，人也要好好休息。"),
      el("p", {}, "我是石头，DegenDNA 的创建者，也是链上照妖镜的主理人。我平时研究 AI Agent、自动交易、预测市场和链上数据，也喜欢用小工具观察市场、观察自己。"),
      el("h3", {}, "从看钱包，到看见钱包背后的人"),
      el("p", {}, "链上照妖镜最初是一个用代码和抽象感对抗情绪低谷的加密实验。币圈里的盈亏、波动、错过机会和追高回撤，很容易把人的情绪越拉越紧。我想做一点有趣的东西，让大家能笑着看见自己的交易习惯，也记得好好爱自己。"),
      el("blockquote", {}, "它可以吐槽你的钱包，但不会定义你的人生。"),
      el("p", {}, "走到现在，我想把这份关心放得更近一些。除了交易，我们也会疲惫、睡不好、被压力推着走。于是有了 Mental Lab：留一块安静的地方，让你慢下来，听听自己最近的感受，看看身边还有哪些支持。"),
      el("h3", {}, "我希望你带走的，是对自己多一点理解"),
      el("p", {}, "一次回答不该把人定型，账户余额也不能衡量一个人的价值。我希望这份自查能帮你说清最近的处境，找到一个愿意尝试的小行动；需要帮助时，也更愿意向可信任的人和专业人士开口。"),
      el("p", {}, "这里使用原创题目，尚未经临床验证，不提供诊断。回答默认不上传、不保存；是否把报告留在当前浏览器，由你自己决定。"),
      el("p", { class: "about-signature" }, "愿你关心市场的时候，也别忘了关心自己。—— 石头")
    ]),
    el("section", { class: "about-follow", "aria-label": "关注石头的推特" }, [
      el("p", { class: "system-label" }, "LET’S STAY IN TOUCH"),
      el("h2", {}, "在推特，继续聊聊。"),
      el("p", {}, "如果你也关注 AI Agent、链上探索，或者喜欢这种认真做一点小产品的尝试，欢迎来我的 X（推特）主页看看。产品建议、使用感受，或一个新的想法，都欢迎和我交流。"),
      el("a", { class: "about-x-link", href: "https://x.com/Stone141319", target: "_blank", rel: "noopener noreferrer" }, "去 X 关注石头 · @Stone141319 ↗"),
      el("small", {}, "关注随意，自查始终向你开放。")
    ])
  ]);
}

function methodView() {
  return shell([
    el("section", { class: "workspace-head" }, [
      el("div", {}, [
        el("h2", {}, "方法说明"),
        el("p", {}, "严谨的第一步，是承认边界：这不是诊断，也不替代专业评估。")
      ])
    ]),
    el("section", { class: "method-grid" }, [
      infoBlock("原创题库", "题目围绕情绪、焦虑、压力、睡眠、恢复力、社交支持、交易心理和安全信号自研，不复制标准量表原题。"),
      infoBlock("描述性多维报告", "不设健康总分或临床轻中重阈值。困扰与资源分开，解释能追溯到具体回答；生活影响、时间和变化独立呈现。内容组尚不是已验证的心理学分量表。"),
      infoBlock("安全优先", "任何频率的自伤想法都先提供支持，不预测危险高低。资金伤害和日间困倦单独提示，不能据此推断自伤。"),
      infoBlock("隐私默认", "MVP 所有计算都在浏览器内完成。本地保存由用户手动选择，可一键清除。")
    ]),
    el("section", { class: "split-section" }, [
      el("div", {}, [
        el("h2", {}, "为什么不用标准量表原题？"),
        el("p", {}, "标准量表有自己的版权、授权、使用场景和解释边界。这个产品的定位是原创自测和早期觉察，因此采用自研题库，并把结果语言限制在“近期状态提示”。")
      ]),
      el("div", {}, [
        el("h2", {}, "什么时候该找专业帮助？"),
        el("p", {}, "如果低落、焦虑、失眠、冲动交易或自责已经持续影响生活，或者出现任何自伤念头、具体计划、无法保证安全的冲动，请优先联系专业人士、当地紧急服务或身边可信任的人。")
      ])
    ]),
    el("section", { class: "note-band" }, "原创不等于科学有效，也不构成版权法律保证。本版完成内容与规则审阅，尚需独立专业人员审阅、目标用户认知访谈、试测及信效度研究。适用于成年人自我观察，不用于诊断、治疗决策或人员筛选。"),
    el("ul", {}, sources.map((source) => el("li", {}, el("a", { href: source.url, target: "_blank", rel: "noopener noreferrer" }, source.title))))
  ]);
}

function infoBlock(title, copy) {
  return el("article", { class: "info-block" }, [
    el("h3", {}, title),
    el("p", {}, copy)
  ]);
}

function render() {
  const focus = document.activeElement;
  const focusName = focus?.getAttribute("name");
  const focusValue = focus?.getAttribute("value");
  document.body.dataset.theme = state.theme;
  app.replaceChildren(routeView());
  window.lucide?.createIcons();
  if (focusName) document.querySelector(`input[name="${CSS.escape(focusName)}"][value="${CSS.escape(focusValue || "")}"]`)?.focus({ preventScroll: true });
}

function routeView() {
  if (state.route === "library") return libraryView();
  if (state.route === "trading") return libraryView("trading");
  if (state.route === "assessment") return assessmentView();
  if (state.route === "records") return recordsView();
  if (state.route === "safety") return safetyView();
  if (state.route === "method") return methodView();
  if (state.route === "about") return aboutView();
  return homeView();
}

render();
