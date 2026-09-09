import { isCurrentRecord } from './scoring.js';

const type = (name, code, keys, text) => ({ name, code, keys, text });
// Editorial grouping of recent answers, not a validated personality taxonomy.
const catalog = {
  quick: [type('思绪绕圈型', 'LP01', ['distress'], '有些事情在心里绕了很久。可以先挑一件最在意的事，慢慢说清楚。'), type('暂时透支型', 'RS04', ['load'], '疲惫或紧绷最近常来打扰你。可以先照顾休息和必要的生活安排。'), type('小步照顾型', 'RC07', ['restoration'], '你提到一些照顾日常生活的小事。可以留住其中真正帮到你的那一件。')],
  mood: [type('对己严格型', 'SC05', ['self_view'], '没有达到期待时，你可能会先责备自己。也值得看看，当时的处境有多不容易。'), type('日常费力型', 'DL09', ['daily'], '最近，一些日常小事做起来也费力。你可以把任务缩小，或请别人搭把手。'), type('心情低落型', 'ML10', ['mood'], '最近的心情或兴趣让你有些费心。不必要求自己马上开心起来。'), type('小步照顾型', 'RC07', ['restoration'], '你有过让自己缓一缓的行动。这些小尝试值得被看见。')],
  anxiety: [type('思绪绕圈型', 'LP01', ['worry'], '有些还没确定的事，会让你提前担心。可以先分清眼前能做的一步。'), type('反复确认型', 'CK11', ['checking'], '你提到反复检查、确认或避开一些事情。可以留意，那一刻你最担心的是什么。'), type('紧绷费神型', 'TN12', ['tension'], '紧张有时也会牵动身体和注意力。身体不适仍值得按需要就医。'), type('留有余地型', 'SP06', ['regulation'], '你有过调整注意、给计划留余地的行动。这不要求你随时都能做到。')],
  stress: [type('思绪绕圈型', 'LP01', ['rumination'], '反复想事情、和别人比较，最近可能占了不少心力。'), type('暂时透支型', 'RS04', ['demands'], '事情多、休息少的时候，可以先看看哪些安排能少扛一点。'), type('硬撑应对型', 'HD03', ['coping_load'], '你提到一些扛压力时的做法。可以看看它们有没有让自己更累。'), type('小步照顾型', 'RC07', ['resources'], '你有过给自己安排恢复空间的行动，值得继续留意哪些最有帮助。')],
  sleep: [type('休息挂心型', 'SL13', ['sleep'], '入睡或睡醒后的感受最近让你费心。可以把具体情况告诉医生。'), type('夜间牵动型', 'NS14', ['night_screen'], '夜里的消息常常占住你的时间。可以给非必要通知留一道休息边界。'), type('白天困倦型', 'DY15', ['daytime'], '白天的困倦值得认真照顾。难以保持清醒时，请避免驾驶和危险操作。'), type('休息留白型', 'SP06', ['sleep_resources'], '你有过为休息调整安排的行动，不必把它变成必须完成的任务。')],
  trading: [type('行情牵动型', 'SW02', ['market_pull'], '行情、消息或别人的收益，最近容易牵动你的操作节奏。'), type('急于扳回型', 'LT16', ['loss_reaction'], '亏损之后，你提到一些急于操作或难以退出的时刻。可以先给决定留一点时间。'), type('资金挤压型', 'FB17', ['exposure'], '交易中的资金使用与风险变化值得单独看看，先照顾必要生活。'), type('交易挂心型', 'TL18', ['life_emotion'], '交易之外的生活和心情也被牵动了。你值得有一段不围着账户转的时间。'), type('计划守界型', 'PL19', ['planning'], '你提到事前计划、复盘或区分生活资金的行动。这不代表策略有效或交易安全。'), type('暂停留白型', 'SP06', ['pause'], '你有过在情绪与操作之间停一下的行动，这份余地可以继续保留。'), type('小步照顾型', 'RC07', ['care'], '你有过在交易之外照顾自己、寻求支持的行动。')],
  recovery: [type('小步照顾型', 'RC07', ['care'], '吃饭、休息和缓和情绪的小行动，都可以是一种照顾。'), type('对己留白型', 'SP06', ['compassion'], '你有过减少要求、认可小进展的时刻。不必总拿表现衡量自己。'), type('休息受阻型', 'RB20', ['barriers'], '你想恢复时，可能有现实安排或心里的顾虑挡着。先看看最需要哪种帮助。'), type('愿意借力型', 'CN08', ['support'], '你有过表达需要、调整安排或寻找支持的行动。')],
  support: [type('有人可聊型', 'CN08', ['available'], '你提到被倾听或联系到支持的经历。合适的关系值得珍惜。'), type('愿意借力型', 'AS21', ['asking'], '你有过表达需要、接受帮助的行动。不必每次都独自处理。'), type('开口顾虑型', 'HD03', ['barriers'], '想求助的时候，心里也有一些顾虑。可以从让你安心的一小步开始。'), type('关系孤单型', 'IS22', ['isolation'], '你提到一些孤单或关系中的难处。这些感受值得被听见。')]
};

export function recentType(result) {
  if (!isCurrentRecord(result) || !catalog[result.id]) return null;
  if (result.answered / result.totalItems < 0.75) return { state: 'incomplete', text: '还想多了解你一点。回答还不够，我们先不选类型；留白也没关系。' };
  const candidates = catalog[result.id].flatMap(t => {
    const groups = t.keys.map(key => result.domains.find(d => d.key === key));
    if (!groups.every(d => d?.interpretable && d.frequent >= 2 && d.frequent / d.answered >= 0.5)) return [];
    return [{ ...t, strength: Math.min(...groups.map(d => d.frequent / d.answered)), evidence: groups.flatMap(d => d.evidence.filter(e => e.value >= 3)), action: groups[0].action }];
  }).sort((a, b) => b.strength - a.strength);
  if (!candidates.length) return { state: 'none', text: '这次没有特别突出的类型。我们不把“没有类型”当成健康证明，也不需要给每个人都贴一个名字。' };
  if (candidates[1] && candidates[0].strength - candidates[1].strength < 0.15) return { state: 'mixed', text: '几种特点同时出现，现在不急着选一个主类型。你可以继续往下看，哪一部分最贴近自己。' };
  const { strength, keys, ...main } = candidates[0];
  return { state: 'matched', ...main };
}
