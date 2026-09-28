import { isCurrentRecord } from './scoring.js';

// A transparent reading of reported experiences and functioning, not a clinical scale.
export const stateRuleVersion = 'current-state-20260927';
const moduleCopy = {
  quick: ['疲惫或情绪困扰反复出现，先给自己减负', '必要的生活任务是否更容易完成，疲惫或烦躁有没有少占用一点时间？'],
  mood: ['情绪相关的困扰反复出现，需要认真照顾', '一件必要的日常小事是否更容易开始，难受时有没有可联系的人？'],
  anxiety: ['担心或紧张反复出现，先处理最打扰你的那一件事', '担心出现后，是否更容易回到眼前的事情，而不是要求自己完全不担心？'],
  stress: ['压力相关的消耗反复出现，先减少一项负担', '非必要安排是否减少，是否多了一点休息或获得协助的空间？'],
  sleep: ['睡眠相关的困扰反复出现，先照顾休息与日间安全', '休息安排和白天清醒情况如何？反复睡不好或困倦影响生活时，带着记录就医。'],
  trading: ['交易相关的困扰反复出现，先照顾生活与决定的余地', '交易是否仍挤占进餐、休息或必要生活资金？看生活影响，不用盈亏评价这次调整。'],
  recovery: ['恢复时仍有反复遇到的阻碍，需要腾出照顾自己的空间', '哪项现实阻碍得到了一点协助，休息是否更容易安排？'],
  support: ['关系或求助中的困难反复出现，需要更合适的支持', '有没有增加一次让你安心的联系，或得到一项具体帮助？'],
  workbound: ['工作相关的消耗反复出现，需要给休息留出空间', '休息被工作打断的情况怎样，进餐和必要生活安排有没有更容易落实？'],
  digital: ['信息正在反复牵动你，需要找回注意力的空间', '一次浏览结束后，是否更容易回到原本想做的事？'],
  decisions: ['决定或开始行动时反复卡住，先把下一步缩小', '有没有完成一个具体的小动作？看能否开始，不要求一次完成整件事。'],
  boundaries: ['关系表达中的顾虑反复出现，先照顾自己的需要', '在安全的关系里，是否有一次更清楚地确认或表达自己的需要？'],
  selfview: ['自我评价中的消耗反复出现，需要调整对自己的要求', '遇到不理想的结果时，是否能说清具体困难，而不把整个人都否定？'],
  adjustment: ['生活变化中的费力感反复出现，先稳住一项日常安排', '哪件安顿小事更容易处理，是否多了一个熟悉的安排或实际帮助？']
};
const byFrequency = (a, b) => b.frequent / b.answered - a.frequent / a.answered || b.occasional / b.answered - a.occasional / a.answered;
const contextReason = e => `${e.question}：你选择了“${e.label}”。`;

export function currentState(result) {
  if (!isCurrentRecord(result)) return null;
  const ctx = Object.fromEntries(result.context.filter(e => e.provided).map(e => [e.id, e.value]));
  const impact = result.context.filter(e => ['work', 'care', 'relations'].includes(e.id) && e.provided);
  const burden = result.domains.filter(d => d.kind === 'burden');
  const understood = burden.filter(d => d.interpretable);
  const frequent = understood.filter(d => d.frequent > 0).sort(byFrequency);
  const occasional = understood.filter(d => d.occasional > 0).sort(byFrequency);
  const resources = result.domains.filter(d => d.kind === 'resource' && d.interpretable && d.frequent > 0).sort(byFrequency);
  const complete = result.answered / result.totalItems >= .75 && burden.length > 0 && understood.length === burden.length;
  const focus = frequent[0] || occasional[0];
  const urgent = impact.some(e => e.value === 'substantial') || ctx.intensity === 'overwhelming';
  const affected = impact.some(e => e.value === 'clear');
  const someImpact = impact.some(e => e.value === 'some');
  const persistent = ['weeks', 'months', 'long'].includes(ctx.duration);
  const notice = result.notices[0];
  let kind, title, description, basis = [];
  if (urgent) {
    kind = 'support-now';
    title = impact.some(e => e.value === 'substantial') ? '日常已经很难维持，现在需要有人一起帮你' : '你现在很难独自承受，需要尽快获得支持';
    description = '接下来最重要的是减轻眼前的负担，并尽快联系心理健康专业人员或医生。不要把恢复全部变成自己必须完成的任务，也不用等题目答完或再过几天。';
    basis = result.context.filter(e => e.provided && (e.value === 'substantial' || e.id === 'intensity' && e.value === 'overwhelming'));
  } else if (affected) {
    kind = 'daily-impact'; title = '困扰已明显影响日常，需要减负并安排支持';
    description = '你的回答说明，生活中的一些重要事情已经做得更困难。可以先减少一项非必要安排，同时联系专业人员讨论这些变化；自我照顾可以一起做。';
    basis = impact.filter(e => e.value === 'clear');
  } else if (ctx.change === 'worse') {
    kind = 'worsening'; title = '你感觉困扰正在加重，需要调整应对并寻求支持';
    description = '现有的安排可能还不足以应对这段时间的困难。请把最近的变化告诉可信任的人，并安排专业支持，不必靠反复做题确认自己是否够难受。';
    basis = result.context.filter(e => e.id === 'change' && e.provided);
  } else if (notice) {
    kind = 'specific-concern'; title = notice.title;
    description = notice.text;
  } else if (ctx.intensity === 'distressing') {
    kind = 'struggling'; title = '你正在费力应付，先把负担减下来';
    description = '即使某些体验出现得不多，你已经明确说自己应付起来费力。先处理最消耗你的那件事，也可以现在就安排一次专业支持对话。';
    basis = result.context.filter(e => e.id === 'intensity' && e.provided);
  } else if (persistent) {
    kind = 'persistent'; title = '困扰已持续一段时间，值得安排一次支持对话';
    description = '这轮困扰已经持续至少两周。仅凭持续时间不能判断原因或严重程度，但不必继续独自等待；可以联系专业人员，梳理生活影响和已经试过的办法。';
    basis = result.context.filter(e => e.id === 'duration' && e.provided);
  } else if (someImpact) {
    kind = 'some-impact'; title = '日常已经受到一些影响，先调整最费力的一件事';
    description = '你提到这些体验已经影响生活。先选一个能减轻实际负担的动作，再看它有没有帮助；暂时还能完成任务，也不等于必须继续硬撑。';
    basis = impact.filter(e => e.value === 'some');
  } else if (!complete) {
    kind = 'incomplete'; title = '目前信息不足，还不能明确概括你的状态';
    description = focus ? `已答内容里，“${focus.label}”值得先留意。其他方面还没了解充分，下面的动作只针对你已经分享的部分。` : '你还没有提供足够的困扰频率回答。可以补充最关心的题目，或直接说明生活受到什么影响；不想回答的内容仍可留白。';
    if (ctx.intensity === 'manageable') description += '你也提到有些难受、尚能承受，这部分感受仍值得照顾。';
  } else if (frequent.length) {
    kind = 'recurring'; title = moduleCopy[result.id]?.[0] || '有些困扰反复出现，先针对一件事调整';
    description = `本次最值得先看的方面是“${focus.label}”。先用下面的一个动作减少这部分消耗；频率本身不能说明对生活的影响有多大。`;
  } else if (occasional.length || ctx.intensity === 'manageable') {
    kind = 'occasional'; title = '有些困扰已经出现，先做针对性调整';
    description = '本次回答没有经常出现的困扰条目，但偶尔的难受也值得处理。先从一个具体场景着手，观察它是否继续打扰日常。';
  } else {
    kind = 'infrequent'; title = '本次回答中的困扰出现较少，先保留有帮助的安排';
    description = '回答充分的困扰题都选择了“从不”或“很少”。这次可以先维持对你有帮助的安排；这不代表未问到的方面没有困难，也不是健康证明。';
  }

  const reasons = basis.map(contextReason);
  if (focus) reasons.push(`“${focus.label}”已答 ${focus.answered}/${focus.total} 题：${focus.frequent} 题选择经常或几乎总是，${focus.occasional} 题选择有时。`);
  if (!reasons.length && !notice) reasons.push(complete ? '本模块的各个困扰方面均达到回答覆盖要求，没有条目选择经常或几乎总是。' : `已提供 ${result.answered}/${result.totalItems} 题的发生频率；未答和跳过不按“从不”处理。`);
  const evidence = notice ? notice.evidence : focus ? focus.evidence.filter(e => e.value >= (focus.frequent ? 3 : 2)).slice(0, 3) : [];
  const knowsImpact = impact.length === 3;
  const caveats = [];
  if (!complete) caveats.push('部分频率回答还不充分；若上方给出明确建议，依据的是你主动提供的生活影响或单独需要关注的回答。');
  if (!knowsImpact) caveats.push('生活影响信息还不完整，因此不判断你是否仍能正常应付，也不推断严重程度。');
  if (ctx.intensity === 'none' && frequent.length) caveats.push('你也选择了“没有相应困扰”。这与较常出现的体验可能指向不同处境，请结合原题确认；这里不会替你修改答案。');

  const professional = urgent || affected || persistent || ctx.change === 'worse' || ctx.intensity === 'distressing';
  const priority = urgent ? '先获得现实支持，帮助维持眼前的基本生活' : notice ? notice.title : focus ? `先处理：${focus.label}` : professional ? '先减轻眼前的负担，并安排一次支持对话' : kind === 'incomplete' ? '先说清最影响你的一件事' : resources.length ? '先保留一项已经有帮助的安排' : '先照顾一项必要的生活安排';
  const action = focus?.action || resources[0]?.action || '选一件今天必要的生活小事，看看需要什么时间、精力或实际帮助；不必为了完成建议增加新负担。';
  const steps = urgent ? [
    { when: '现在', title: '联系一个可信任的人，并尽快安排专业帮助', text: '可以直接说：“我最近很难应付，能陪我一起联系医生或心理健康专业人员吗？”若此刻可能伤害自己或无法保证安全，立即联系当地紧急服务或去急诊。' },
    { when: '今天', title: '把一项必要安排交给别人一起处理', text: notice ? notice.text : '从进餐、出行、必要职责里选一项最难维持的事，提出具体协助请求；暂缓可以延后的额外任务。' },
    { when: '获得支持后', title: '按实际情况决定下一步', text: '向帮助你的人说明何时开始、哪些事变难，以及已经试过什么。与专业人员商量后续安排，不用等复测结果再求助。' }
  ] : [
    { when: '今天', title: notice ? notice.title : focus ? '先做一个与你的回答对应的小动作' : kind === 'incomplete' ? '先描述一次真实发生的情况' : '保留一件对自己有帮助的小事', text: notice ? notice.text : kind === 'incomplete' && !focus ? '用自己的纸笔写三句话：发生了什么、当时什么感受、最影响哪件事。也可以补充下方生活影响信息，再生成结果。' : action },
    { when: professional ? '尽快安排' : '接下来几天', title: professional ? '把这段时间的困难带到一次支持对话里' : resources.length ? `继续用上：${resources[0].label}` : '为这一步准备现实条件', text: professional ? '联系心理健康专业人员或医生，说明困扰持续多久、是否加重、哪些事情受到影响。需要时请可信任的人协助联系；不必先把自我照顾练习做完。' : resources[0]?.action || '如果行动被时间、工作量或照护责任挡住，先找一项可以商量的安排，或提出一个具体协助请求。做不到不等于不够努力。' },
    { when: '一周内回看', title: '用生活中的变化判断是否有帮助', text: moduleCopy[result.id]?.[1] || '眼前最费力的事情是否容易了一点，是否得到需要的支持？不以类型代号或答题分数衡量进步。' }
  ];
  return { ruleVersion: stateRuleVersion, kind, title, description, reasons, evidence, caveats, priority, steps,
    checkpoint: '看实际生活有没有变容易：困扰占用的时间、必要任务能否完成、是否更容易休息或获得帮助。没有变化时，可以缩小动作或调整安排，不把它归为你的失败。',
    escalation: '如果困扰加重、持续影响生活，或这些尝试没有帮助，请联系心理健康专业人员或医生；不必等满一周。若此刻可能伤害自己或无法保证安全，请立即使用安全支持入口、联系当地紧急服务或去急诊。',
    boundary: '这是基于本次回答的近期状态与行动建议，不是疾病诊断，也不预测恢复时间。' };
}
