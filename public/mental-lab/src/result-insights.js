import { assessmentMap } from './assessments.js';
import { isCurrentRecord } from './scoring.js';
import { plainFacet, plainIntros } from './plain-reflections.js';

// Presentation rules only. No new trait score, clinical cut-off or saved-answer schema.
export const insightVersion = 'reflection-20261022-v3';
const guide = (lens, exercise, example, trap, checkpoint, question) => ({ lens, exercise, example, trap, checkpoint, question });
export const moduleGuides = {
  quick: guide('把精力、情绪、日常恢复和支持空间分开看，了解最近的负担与支点。', '选最近一次最费力的时刻，写下事件、身体或情绪反应、需要的帮助，各一句。', '例如：消息堆积 → 很累、难集中 → 今天请人协助一件必要小事。', '别把疲惫直接解释为懒惰，也别因为仍能做事就忽略休息需要。', '看一件必要的生活任务是否更容易完成，以及有没有获得实际帮助。', '你现在最需要减少什么，又希望保留什么？'),
  mood: guide('区分情绪与兴趣、自我评价、行动难度以及恢复做法；状态不等于人的价值。', '把今天一件必要小事缩到能开始的第一步，同时准备一个可以联系的人。', '例如：“整理好生活”缩成“准备一份方便吃的食物”；做不到时请人协助。', '不要把低落变成“我就是消极的人”，也不用靠强迫自己开心证明好转。', '看基本生活是否更容易维持；难受持续、加重或影响生活时联系专业人员。', '哪些事情以前不费力、现在却很难？你希望别人具体帮哪一步？'),
  anxiety: guide('观察担心、反复确认或回避、身体紧张，以及你已有的调整方式。', '挑一个日常担心，分开写“已知事实”“尚不确定”“现在能做的一步”。', '例如：“还没收到回复”是事实，“对方一定不满意”是推测；可以先确认合理回复时间。', '重要安全检查仍需进行，不要把练习变成强行取消必要检查或独自面对危险。', '看担心出现后能否回到眼前的事；身体不适、持续困扰或功能受损时寻求评估。', '继续确认是在获得新事实，还是只让安心短暂延长？'),
  stress: guide('区分外部任务量、反复思考、应对代价与可获得的恢复条件。', '把今天的任务分成必须、可协商、可延后，只选一项去协商。', '例如：“接新任务可以，但请一起确定旧任务哪项延后。”', '不能把制度性超负荷全变成个人效率问题；休息也不需要完成指标。', '看是否少扛了一项额外负担，进餐、休息或支持是否更容易安排。', '如果不是继续提高效率，哪一种外部调整最有帮助？'),
  sleep: guide('同时看夜间体验、信息占用、白天清醒和休息条件，不用单一数字判断睡眠。', '用简短日记记作息大致时间、睡醒感受、白天困倦及轮班等背景。', '例如：“夜里等通知，第二天通勤犯困”；只记大致情况，不反复看钟追求完美。', '不要自行停改药物或把睡眠练习当治疗；困倦时不要驾驶或操作危险设备。', '看日间清醒与必要生活安排；反复睡不好、困倦或明显受影响时带记录就医。', '最影响你的，是入睡、睡后恢复、夜间信息，还是白天的安全与精力？'),
  trading: guide('分开看消息牵动、亏损反应、生活资金、情绪与现有保护做法，不能用盈亏判断心理状态。', '复盘一次操作，只列事前条件、实际动作、触发变化的信息，以及生活资金是否受到影响。', '例如：“原定条件未满足，看到他人收益后改变了决定”；记录过程，不用下一单证明自己。', '计划和暂停不能保证收益或资金安全；借贷、生活资金挤占等问题要单独处理。', '看是否减少对基本生活、休息和必要资金的挤占，不以赚回多少评估练习。', '最近哪次决定来自新事实，哪次更像是在缓解不舒服？'),
  recovery: guide('看基础照顾、自我宽容、恢复障碍和支持条件；缺少资源不等于意志薄弱。', '挑一项最难落实的基本需要，写下阻碍，再提出一个能减少阻碍的具体请求。', '例如：“没有时间吃饭”对应“请同事代看十分钟”；有现实限制时先找协助。', '不要把恢复变成又一项绩效任务；休息、求助和降低要求可以同时存在。', '看一项基本需要是否更容易被照顾，而非完成了多少自我照顾清单。', '你缺的是方法、时间、物质条件，还是有人一起分担？'),
  support: guide('区分支持质量、表达与接受帮助、开口顾虑及孤独感；独处不等于孤独。', '先确定自己希望得到倾听、陪伴还是实际协助，再选择安全的人和方式。', '例如：“你现在方便听我说十分钟吗？我暂时不需要建议。”', '不要向不安全或不尊重边界的人强行披露；联系数量不代表支持质量。', '看这次联系是否让需要更清楚、是否得到尊重；持续孤独可把专业支持作为入口。', '什么样的回应会让你安心？什么信息你希望保留给自己？'),
  fomo: guide('了解他人收益如何牵动自我评价、决定速度和生活注意力，以及你已有的决定余地。', '遇到收益截图时，先写“我确切知道什么”“缺少什么信息”“自己的决定条件是什么”。', '例如：“只看到一次收益，没看到成本和全部亏损”；没有足够依据时允许不行动。', '不要把别人的展示当成完整样本，也不要把没有参与理解为失败。', '看是否能按自己的条件作决定、结束比较后回到生活，不以错过的涨幅计分。', '你想追赶的是事实中的机会，还是“不该落后”的感受？'),
  loss: guide('把急于挽回、回避复盘、自责与日常影响分开，也看看已有的借力方式。', '先暂停为挽回亏损而追加的动作，分开记录可核对的过程与对自己的评价。', '例如：“这次偏离了什么条件”可复盘；“我什么都不行”需要回到具体事实。', '复盘不是马上找到下一笔机会；生活资金、债务或加大风险要优先保护和求助。', '看必要生活是否恢复、是否能讨论过程，而非是否赚回亏损。', '如果不需要靠下一笔证明自己，你现在最需要处理哪件现实事？'),
  marketbound: guide('看反复查看、休息占用、生活打断和时间边界，区分必要职责与额外查看。', '选一次非必要查看，提前确定目的与结束点，结束后回到一件具体生活安排。', '例如：“查完必要信息就去吃饭”；保留真正需要的紧急联系和责任。', '边界不是彻底断联；职业要求、照护职责和现实条件需要一起考虑。', '看进餐、休息或交流是否更少被打断，而非单纯追求屏幕时间最少。', '这一次查看会改变什么决定？如果不会，能否稍后再看？'),
  execution: guide('分清计划是否明确、临时变动的原因、事后判断负担与可回看的记录。', '下次决定前写下依据、什么新事实可以改变决定、何时回看；事后只比较过程。', '例如：“只有出现新事实才重看”，并记录实际改变理由；不因后来涨跌改写原先理由。', '执行一致不等于决定正确；新事实出现时允许调整，不为守规则而忽略变化。', '看能否说清为什么改、什么时候改，不用短期结果倒推当时所有判断。', '你改变的是计划条件，还是只是在回应眼前的情绪和波动？'),
  workbound: guide('看工作挂心、即时回应、基本需要被挤占，以及协商、收尾和生活空间。', '收工前写下一次继续的第一步，并和相关的人确认一类非紧急消息的回复时间。', '例如：“明早先核对第二页；非紧急事项明早回复。”轮班或值班按真实职责安排。', '不能把工作量和制度问题全归因于不会拒绝；没有协商权时先寻求现实支持。', '看必要休息和进餐能否落实，离岗后是否更容易回到生活。', '什么必须由你现在处理，什么需要共同确认优先级？'),
  digital: guide('区分通知打断、浏览漂移、意见过载与目的、边界和注意回归。', '下一次打开页面前写一个目的和停止条件，被打断时留一行下一步提示。', '例如：“核实原始出处后关闭页面，再回到文档第一段。”休闲浏览也可以有价值。', '不必把所有上网都变成高效任务；辅助工具和必要联系需要保留。', '看是否更容易完成原本在意的事，浏览后是否仍长时间烦乱。', '你是在补充当前真正缺少的信息，还是因为不确定而一直扩大搜索？'),
  decisions: guide('看反复比较、开始困难、担心出错，以及试行、调整和外部支持。', '对一个低风险、可逆的小决定，写两项必要条件，再选能试的一步和回看点。', '例如：“先写三行提纲，请一位同事给反馈”；重大不可逆决定仍需充分考虑。', '小步行动不意味着所有事都要快速决定；真实风险和缺少资源都要纳入判断。', '看有没有开始、得到什么新信息、需不需要调整，而非一次完成整件事。', '你缺少的是事实、可承受的试法，还是有人帮你开始？'),
  boundaries: guide('看先答应后委屈、表达顾虑、交流后反复想，以及表达、协商和安全联系。', '在安全关系里先说具体需要，再提出可选择的安排，允许稍后答复。', '例如：“今天没有余力，你希望我明天帮哪一部分？”不需要一次解释所有感受。', '表达技巧不能解决所有权力不对等或不安全关系；安全比练习直接表达优先。', '看需要是否被说清和尊重，不以对方是否立刻同意判断自己表达好坏。', '你愿意承担哪一部分？需要保留的底线是什么？'),
  selfview: guide('区分整体自我否定、比较和过高要求，也看看处境、小进展和调整余地。', '把一次不满意写成具体事件，再补充当时条件和一项可调整的动作。', '例如：“这次准备不足”不同于“我永远不行”；记录实际做过的一小步，不强行积极。', '自我宽容不是否认责任；同样也不能拿结果否定整个人。', '看能否更具体地讨论问题、允许调整，而非要求自己一直自信。', '如果朋友遇到同样处境，你会把哪些现实条件也算进去？'),
  adjustment: guide('在确实经历变化的前提下，看不确定、日常重排、失落，以及熟悉感、尝试和实际帮助。', '先稳住一项日常安排，再选一个需要了解的新事项和一个可求助的入口。', '例如：“保留熟悉的早餐时间，今天只弄清一条必要路线。”允许怀念旧生活。', '没有经历变化时不把低频解释成适应能力强；适应快慢没有统一期限。', '看一件安顿小事是否更容易、是否有实际帮助，而非是否不再失落。', '哪些旧生活的东西值得保留，哪些新安排需要别人协助？')
};

const byFrequency = (a, b) => b.frequent / b.answered - a.frequent / a.answered || b.occasional / b.answered - a.occasional / a.answered;
export function resultInsights(result) {
  if (!isCurrentRecord(result)) return null;
  const module = assessmentMap[result.id];
  const g = moduleGuides[result.id];
  if (!g) return null;
  const facets = result.domains.map(d => {
    const definition = module.domains.find(entry => entry.key === d.key);
    const resource = d.kind === 'resource';
    const evidence = d.evidence.filter(e => e.value >= 3);
    const state = !d.interpretable ? 'incomplete' : d.frequent ? 'frequent' : d.occasional ? 'occasional' : 'infrequent';
    const plain = plainFacet(result.id,d);
    const reading = plain.reading;
    return { key: d.key, kind: d.kind, label: definition.label, answered: d.answered, total: d.total, frequent: d.frequent, occasional: d.occasional,
      state, reading, humanTitle: plain.title, care: plain.care, nextStep: plain.step, hypothesis: plain.hypothesis, grounded: plain.grounded, meaning: definition.meaning, action: definition.action, limit: definition.limit,
      evidence: state === 'incomplete' ? [] : evidence.length ? evidence : d.evidence.filter(e => e.value === 2),
      // One high-frequency item is shown specifically; it does not qualify the whole domain as a strength.
      strength: resource && d.interpretable && d.frequent >= 2 && d.frequent / d.answered >= .5 };
  });
  const strengths = facets.filter(d => d.strength).sort(byFrequency);
  const costs = facets.filter(d => d.kind === 'burden' && ['frequent', 'occasional'].includes(d.state)).sort(byFrequency);
  const unknown = facets.filter(d => d.state === 'incomplete').map(d => d.label);
  const bridge = costs.length && strengths.length ? `你可以一边遇到这些难处，一边仍保有照顾自己的办法。先保留真正帮过你的一小件事，不用拿它证明自己不该难受；做不到的时候，也可以请别人搭把手。` : null;
  return { version: insightVersion, lens: plainIntros[result.id], facets, strengths, costs, unknown, bridge,
    strengthsEmpty: '目前没有足够回答支持概括一项较常使用的优势或资源。这不是“没有优点”；这套题也没有测量你的全部能力。',
    costsEmpty: '回答充分的部分没有报告有时或更常出现的困扰。未回答、未问到的困难仍未知，不能据此说你没有盲点。',
    exercise: { ...g, matched: costs.length > 0 || strengths.length > 0,
      focus: costs[0]?.humanTitle || strengths[0]?.humanTitle || null,
      firstStep: costs[0]?.nextStep || strengths[0]?.nextStep || '如果愿意，从一次具体经历开始，描述发生了什么、当时的反应和需要；也可以保留空白。' },
    boundary: '下面试着理解你最近的经历，不是在读心、诊断或给性格定型。可能的原因请用自己的经历核对，不贴近的部分可以不接受；有支持，也仍然可以难受。' };
}

export function insightsText(result) {
  const p = resultInsights(result);
  if (!p) return [];
  return [`解读版本：${p.version}`, p.lens, '已有优势与资源', ...(p.strengths.length ? p.strengths.flatMap(d => [d.humanTitle, d.reading, d.care, ...(d.hypothesis ? [d.hypothesis] : []), ...d.evidence.map(e => `依据：${e.text}：${e.response}`), `保留方式：${d.nextStep}`]) : [p.strengthsEmpty]),
    '值得留意的消耗与盲点', ...(p.costs.length ? p.costs.flatMap(d => [d.humanTitle, d.reading, d.care, ...(d.hypothesis ? [d.hypothesis] : []), ...d.evidence.map(e => `依据：${e.text}：${e.response}`), `可尝试：${d.nextStep}`]) : [p.costsEmpty]),
    ...(p.bridge ? [p.bridge] : []),
    ...(p.unknown.length ? [`暂不能概括：${p.unknown.join('、')}`] : []),
    p.exercise.matched ? '与你的回答对应的一步' : '可选的一般场景练习（尚无足够个体依据）', p.exercise.firstStep,
    p.exercise.exercise, p.exercise.example, `容易忽略：${p.exercise.trap}`, `回看标准：${p.exercise.checkpoint}`, `反思问题：${p.exercise.question}`, p.boundary];
}
