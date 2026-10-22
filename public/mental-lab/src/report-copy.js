import { plainFacet } from './plain-reflections.js';
// Presentation only: keep saved answers, scoring rules and comparisons unchanged.
export function humanizeReport(result) {
  const domains = result.domains.map((domain) => {
    const plain = plainFacet(result.id,domain);
    return { ...domain, humanTitle: plain.title, interpretation: plain.reading, care: plain.care, nextStep: plain.step,
      hypothesis: plain.hypothesis, reflection: plain.hypothesis || (domain.kind === 'resource' ? '哪一种做法真的帮过你，今天想留住哪一点？' : '哪一句贴近你？如果不贴近，你更愿意怎样描述自己？') };
  });
  const frequent = domains.filter(d => d.interpretable && d.kind === 'burden' && d.frequent);
  const understood = domains.some(d => d.interpretable && d.kind === 'burden');
  const summaryBase = !result.answered
    ? '你还没有选择具体的发生频率，现在还不能从这些回答了解你的近况。留白也没关系，你仍然可以查看支持建议。'
    : !domains.some(d => d.interpretable)
      ? '你已经分享了一些感受，不过现在的信息还不多。我们先看看你愿意说的部分，不急着给你下结论。'
      : frequent.length
        ? `你提到，最近在“${frequent.slice(0, 2).map(d => d.label).join('”、“')}”这些方面，有些感受常常出现。可以先照顾最让你费心的一件事，不必要求自己马上把一切理顺。`
        : understood
          ? '在回答比较完整的部分，你没有提到经常出现的困扰。如果这和你的感受相符，可以留意哪些日常安排让你舒服一些；如果你仍然难受，也不用让这份结果替你否定自己。'
          : '你分享了一些平时怎样照顾自己、获得支持的情况。关于让你难受的部分，我们还了解得不多，所以先不判断你过得轻不轻松。';
  const missingBurden = domains.filter(d => d.kind === 'burden' && !d.interpretable);
  const summary = summaryBase + (missingBurden.length && domains.some(d => d.interpretable) ? ` “${missingBurden.map(d=>d.label).join('、')}”回答不足，暂不能概括；上述描述不代表全部方面。` : '');
  const urgent = result.context.some(e => ['work', 'care', 'relations'].includes(e.id) && e.value === 'substantial' || e.id === 'intensity' && e.value === 'overwhelming');
  const ongoing = result.context.some(e => e.value === 'clear' || e.value === 'worse' || e.id === 'intensity' && e.value === 'distressing' || ['weeks', 'months', 'long'].includes(e.value));
  const supportBasis = result.context.filter(e => urgent
    ? ['work', 'care', 'relations'].includes(e.id) && e.value === 'substantial' || e.id === 'intensity' && e.value === 'overwhelming'
    : e.value === 'clear' || e.value === 'worse' || e.id === 'intensity' && e.value === 'distressing' || ['weeks', 'months', 'long'].includes(e.value));
  const support = { ...result.support,
    reasons: supportBasis.length ? supportBasis.map(e=>`${e.question}：${e.label}`) : result.support.reasons,
    title: urgent ? '现在，先找个人陪你一起面对' : ongoing ? '这段路，可以请别人陪你走一段' : '想找人聊聊，不需要先证明自己够难受',
    text: urgent
      ? '你提到最近的感受很难承受，或已经明显影响到日常生活。请尽快联系心理健康专业人员或医生，也可以先告诉一个你信任的人：“我最近有些撑不住，能陪我一起找帮助吗？”不用等到情况更严重。如果你现在无法保证自己的安全，请立即联系当地紧急服务或去急诊。'
      : ongoing
        ? '你提供的信息中，有值得进一步了解的难受程度、持续时间、变化或生活影响。可以找心理健康专业人员或医生聊聊。你不用先想好所有答案，带着“最近哪里最难熬”这个问题去，就可以开始。'
        : '如果你想被听一听，可以联系一个让你安心的人，也可以直接找专业人士。这份自查不能判断你是否需要治疗；偶尔才出现的难受，也不需要独自忍着。'
  };
  return { ...result, summary, domains, support,
    warnings: result.warnings.map(text => text.startsWith('跳过') ? '有些题目被跳过或还没回答，我们不会把它们当成“没有困扰”。你可以留白，这份结果只谈你已经告诉我们的部分。' : text.startsWith('本次频率') ? '这次你选择的频率都一样。这完全可能是你的真实感受；如果愿意，也可以回头看看有没有哪道题需要调整。' : '有几处回答看起来不太一致，也许是你想到了不同的事情。可以回头看看，不需要为了让结果整齐而改变真实感受。'),
    patterns: result.patterns.map(p => ({ ...p, title: p.title.replaceAll('同时被报告', '都在最近出现过').replaceAll('体验', '感受').replaceAll('信息牵引', '被消息带着走').replaceAll('资金边界', '生活资金的使用'), text: p.text })),
    plan: result.plan.map(step => ({ ...step, title: step.title === '保留一个现有支点' ? '留住一件对你有帮助的小事' : step.title === '准备一次支持对话' ? '不知道怎么开口时，可以这样说' : step.title,
      text: step.title === '准备一次支持对话' ? '“我最近有些难受，想找个人聊聊。你现在方便听我说一会儿吗？”如果准备去见专业人士，可以简单记下从什么时候开始、最影响什么，以及已经试过的办法。' : step.title === '接下来一周' ? '挑一个你现在做得到的小行动就够了。过几天再看看它有没有帮到你。暂时做不到也没关系，可以把步骤再缩小，或请别人搭把手。' : step.text }))
  };
}
