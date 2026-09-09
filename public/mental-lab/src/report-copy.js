// Presentation only: keep saved answers, scoring rules and comparisons unchanged.
export function humanizeReport(result) {
  const labels = {
    load: '累不累，能不能集中精神', distress: '心里反复绕着的那些事', restoration: '让自己缓过来的小事', space: '给自己留一点空间',
    mood: '最近的心情与兴趣', self_view: '你怎样看待自己和以后', daily: '日常小事做起来费不费力', worry: '那些放不下的担心',
    checking: '反复确认，或不敢面对的事', tension: '紧张时，身体和注意力的变化', regulation: '担心的时候，怎样缓一缓',
    demands: '事情多不多，能不能歇一歇', rumination: '总在想，也总在和别人比', coping_load: '扛压力时，自己付出了什么', resources: '能让你喘口气的安排',
    sleep: '晚上睡得怎么样', night_screen: '夜里还放不下的消息', daytime: '白天能不能保持清醒', sleep_resources: '给休息留出时间',
    market_pull: '会不会被行情和消息带着走', loss_reaction: '亏损之后，想马上做点什么', exposure: '交易有没有挤占生活的钱', life_emotion: '交易之外，你过得怎么样',
    planning: '给交易和生活的钱留好界限', pause: '情绪上来时，能不能停一下', care: '吃饭、休息，也照顾自己', compassion: '对自己，能不能少一点责备',
    barriers: result.id === 'support' ? '想求助时，心里有哪些顾虑' : '是什么让你没法好好休息', support: '说出需要，也保留自己的空间',
    available: '有没有人愿意听你说', asking: '开口求助，也允许别人帮忙', isolation: '在人群里，会不会仍觉得孤单'
  };
  const domains = result.domains.map((domain) => {
    const resource = domain.kind === 'resource';
    let interpretation;
    if (!domain.interpretable) interpretation = '这一部分回答还不多，我还不能了解你的情况。你可以按自己的节奏补充，也可以留白，不用勉强自己。';
    else if (resource && domain.frequent) interpretation = '你提到，这里有一些事情是你经常能做到或感受到的。可以留意其中哪一件真的帮到了你，给它留一点位置。有这些支持，也不意味着你就不该难受。';
    else if (resource) interpretation = '这段时间，这些能帮你缓一缓的事情似乎不常出现。也许是没有需要，也许是时间、精力或身边的条件不允许。这不是你不够努力，不必因此责备自己。';
    else if (domain.frequent) interpretation = '你提到，这一方面有些感受经常出现。它们可能让你费心，也值得被认真听见。可以先看一眼下面的回答，选出最让你在意的那件事，不用一次处理所有问题。';
    else if (domain.occasional) interpretation = '这一方面有些感受偶尔会来。即使不常发生，如果当时很难受，也值得照顾，不必拿次数说服自己忍一忍。';
    else interpretation = '你在这一部分选的都是“从不”或“很少”。这些事情最近可能不太打扰你。如果还有题目没问到的难处，你的感受依然值得被听见。';
    const example = domain.interpretable && domain.evidence.find(item => item.value >= 3);
    if (example) interpretation = `比如“${example.text}”，你选了“${example.response}”。${interpretation}`;
    return { ...domain, label: labels[domain.key] || domain.label, interpretation, reflection: resource ? '这里面，哪一件事曾让你稍微轻松一点？' : '如果只想聊一件事，你现在最想让别人理解什么？' };
  });
  const frequent = domains.filter(d => d.interpretable && d.kind === 'burden' && d.frequent);
  const understood = domains.some(d => d.interpretable && d.kind === 'burden');
  const summary = !result.answered
    ? '你还没有选择具体的发生频率，现在还不能从这些回答了解你的近况。留白也没关系，你仍然可以查看支持建议。'
    : !domains.some(d => d.interpretable)
      ? '你已经分享了一些感受，不过现在的信息还不多。我们先看看你愿意说的部分，不急着给你下结论。'
      : frequent.length
        ? `你提到，最近在“${frequent.slice(0, 2).map(d => d.label).join('”、“')}”这些方面，有些感受常常出现。可以先照顾最让你费心的一件事，不必要求自己马上把一切理顺。`
        : understood
          ? '在回答比较完整的部分，你没有提到经常出现的困扰。如果这和你的感受相符，可以留意哪些日常安排让你舒服一些；如果你仍然难受，也不用让这份结果替你否定自己。'
          : '你分享了一些平时怎样照顾自己、获得支持的情况。关于让你难受的部分，我们还了解得不多，所以先不判断你过得轻不轻松。';
  const urgent = result.context.some(e => ['work', 'care', 'relations'].includes(e.id) && e.value === 'substantial' || e.id === 'intensity' && e.value === 'overwhelming');
  const ongoing = result.context.some(e => e.value === 'clear' || e.value === 'worse' || ['weeks', 'months', 'long'].includes(e.value));
  const support = { ...result.support,
    title: urgent ? '现在，先找个人陪你一起面对' : ongoing ? '这段路，可以请别人陪你走一段' : '想找人聊聊，不需要先证明自己够难受',
    text: urgent
      ? '你提到最近的感受很难承受，或已经明显影响到日常生活。请尽快联系心理健康专业人员或医生，也可以先告诉一个你信任的人：“我最近有些撑不住，能陪我一起找帮助吗？”不用等到情况更严重。如果你现在无法保证自己的安全，请立即联系当地紧急服务或去急诊。'
      : ongoing
        ? '你提到有些困扰持续了一段时间、变得更难受，或已经影响生活。可以找心理健康专业人员或医生聊聊。你不用先想好所有答案，带着“最近哪里最难熬”这个问题去，就可以开始。'
        : '如果你想被听一听，可以联系一个让你安心的人，也可以直接找专业人士。这份自查不能判断你是否需要治疗；偶尔才出现的难受，也不需要独自忍着。'
  };
  return { ...result, summary, domains, support,
    warnings: result.warnings.map(text => text.startsWith('跳过') ? '有些题目被跳过或还没回答，我们不会把它们当成“没有困扰”。你可以留白，这份结果只谈你已经告诉我们的部分。' : text.startsWith('本次频率') ? '这次你选择的频率都一样。这完全可能是你的真实感受；如果愿意，也可以回头看看有没有哪道题需要调整。' : '有几处回答看起来不太一致，也许是你想到了不同的事情。可以回头看看，不需要为了让结果整齐而改变真实感受。'),
    patterns: result.patterns.map(p => ({ ...p, title: p.title.replaceAll('同时被报告', '都在最近出现过').replaceAll('体验', '感受').replaceAll('信息牵引', '被消息带着走').replaceAll('资金边界', '生活资金的使用'), text: p.text })),
    plan: result.plan.map(step => ({ ...step, title: step.title === '保留一个现有支点' ? '留住一件对你有帮助的小事' : step.title === '准备一次支持对话' ? '不知道怎么开口时，可以这样说' : step.title,
      text: step.title === '准备一次支持对话' ? '“我最近有些难受，想找个人聊聊。你现在方便听我说一会儿吗？”如果准备去见专业人士，可以简单记下从什么时候开始、最影响什么，以及已经试过的办法。' : step.title === '接下来一周' ? '挑一个你现在做得到的小行动就够了。过几天再看看它有没有帮到你。暂时做不到也没关系，可以把步骤再缩小，或请别人搭把手。' : step.text }))
  };
}
