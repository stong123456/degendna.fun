export const MOOD_KEY = 'degendna-mood-journal-v1';
const moods = ['轻松', '平静', '说不清', '疲惫', '烦躁', '低落'];
export const practices = [
  { title: '给眼前留一点空白', intro: '不需要闭眼，也不要求控制呼吸。不舒服时可以随时停下。', steps: ['先把手里的事放一放，找一个坐着或站着都舒服的位置。', '看看周围，选一件普通的物品，留意它的颜色和形状。没有特别感受也没关系。', '问问自己：接下来，我想喝口水、换个姿势，还是继续休息？选一个就好。'] },
  { title: '把绕圈的事放到纸上', intro: '可以只在心里想，也可以用自己的纸笔写。这里不要求提交内容。', steps: ['选一件你愿意碰一碰的小事。太难受的经历可以先不处理。', '分开写：我知道的事实；我还不确定的事。暂时不急着解释原因。', '圈出今天能做的一小步。其余部分，可以留到有支持、有精力的时候再说。'] },
  { title: '睡前收个小尾巴', intro: '这是日常安排提示，不是失眠治疗。轮班或照顾家人时，请按现实情况调整。', steps: ['看看有没有一条非必要的通知，可以先静音；保留需要的紧急联系。', '把明天要记住的一件事记在自己的纸上，让它不必一直占着脑子。', '选一个对自己舒服的收尾动作，比如整理枕头或调暗灯光。不强迫自己立刻入睡。'] },
  { title: '给自己写一句宽松的话', intro: '不必逼自己积极。如果某句话不合适，跳过它。', steps: ['想一件今天费了力的事。不用挑最难的一件。', '把“我怎么连这个都做不好”，试着换成“这件事现在对我有点难”。', '给自己补一句具体的允许，例如“今天先做到这里，明天再接着来”。'] }
];
const validMood = r => r?.version === 1 && typeof r.id === 'string' && moods.includes(r.mood) && typeof r.note === 'string' && r.note.length <= 500 && Number.isFinite(Date.parse(r.at));
export function readMoodRecords(storage) {
  try { const rows = JSON.parse((storage || localStorage).getItem(MOOD_KEY) || '[]'); return Array.isArray(rows) ? rows.filter(validMood).slice(0,100) : []; } catch { return []; }
}
export function saveMoodRecord(record, storage = localStorage) {
  if (!validMood(record)) throw new Error('Invalid mood record');
  storage.setItem(MOOD_KEY, JSON.stringify([record, ...readMoodRecords(storage)].slice(0,100)));
}
let mood = '', note = '', consent = false, feedback = '', selected = -1, step = 0;
export function careTools(el, onSafety, onChat) {
  consent = false;
  const root = el('section', { class: 'care-tools' });
  const render = () => {
    root.replaceChildren(
      el('header', { class: 'workspace-head' }, [el('div', {}, [el('h2', {}, '日常照顾'), el('p', {}, '记一记此刻，或者选一个小练习。没有打卡任务，也不需要连续完成。')])]),
      el('section', { class: 'care-card' }, [
        el('h3', {}, '今天的心情，想用哪个词？'),
        el('div', { class: 'care-options', role: 'group', 'aria-label': '选择此刻心情' }, moods.map(m => el('button', { class: 'secondary', 'aria-pressed': mood === m, onclick: () => { mood=m; feedback=''; render(); } }, m))),
        el('label', {}, ['想记下一件小事吗？（选填，最多 500 字）', el('textarea', { rows: 3, maxlength: 500, oninput: e => { note=e.target.value; } }, note)]),
        el('label', { class: 'care-consent' }, [el('input', { type:'checkbox', checked:consent, onchange:e => {consent=e.target.checked; render();} }), '我愿意把这条心情保存在当前浏览器']),
        el('p', {}, '默认不保存、不上传，也不会自动发给小镜。共用设备请谨慎；本地记录没有加密。'),
        el('button', { class:'secondary', disabled:!mood, onclick:() => {
          if (!consent) { feedback='谢谢你给此刻留了一点位置。这次没有保存；你可以继续看看下面的小练习。'; render(); return; }
          try { saveMoodRecord({version:1,id:crypto.randomUUID(),mood,note,at:new Date().toISOString()}); mood=''; note=''; consent=false; feedback='已保存在当前浏览器。你可以在下面回看，也可以随时删除。'; } catch { feedback='浏览器没有保存成功，文字还留在这里。你可以复制到自己信任的地方。'; }
          render();
        } }, consent ? '保存这条心情' : '记住此刻，不保存'),
        el('p', { role:'status', 'aria-live':'polite' }, feedback)
      ]),
      el('section', { class:'care-card' }, [el('h3', {}, '留在本机的小记录'), el('p', {}, '只按时间回看，不计算情绪健康分数。最多保留最近 100 条。'), ...readMoodRecords().map(row => el('article', {class:'mood-entry'}, [
        el('strong', {}, row.mood), el('time', {}, new Date(row.at).toLocaleString('zh-CN')), el('p', {}, row.note),
        el('button', {class:'secondary',onclick:() => { if (!confirm('删除这条心情记录？删除后无法恢复。')) return; try { localStorage.setItem(MOOD_KEY,JSON.stringify(readMoodRecords().filter(r=>r.id!==row.id))); feedback='已删除这条记录。'; } catch { feedback='未能删除，请检查浏览器存储权限。'; } render(); }}, '删除这条')
      ])), !readMoodRecords().length ? el('p', {}, '还没有保存的记录。只是来看看，也很好。') : null]),
      el('section', {class:'care-card'}, [el('h3', {}, '照顾自己的一小步'), el('div', {class:'care-practice-grid'}, practices.map((p,i)=>el('button',{class:'secondary',onclick:()=>{selected=i;step=0;render();}},p.title))),
        selected >= 0 ? el('article',{class:'practice-active','aria-live':'polite'},[
          el('h3',{},practices[selected].title), el('p',{},practices[selected].intro),
          el('p',{},step < 3 ? `第 ${step+1} 步 / 3 · ${practices[selected].steps[step]}` : '这次先到这里。无论有没有变化，都不用给自己打分。'),
          step < 3 ? el('div',{class:'care-options'},[el('button',{class:'secondary',onclick:()=>{step++;render();}},'下一步'),el('button',{class:'secondary',onclick:()=>{step++;render();}},'跳过这一步')]) : el('button',{class:'secondary',onclick:()=>{step=0;render();}},'再看一遍'),
          el('button',{class:'secondary',onclick:()=>{selected=-1;step=0;render();}},'先停在这里')
        ]) : el('p',{},'任选一个，不计时、不催促。你随时可以停止。')]),
      el('div',{class:'care-options'},[el('button',{class:'secondary',onclick:onChat},'去和小镜聊聊'),el('button',{class:'secondary',onclick:onSafety},'我现在需要支持')])
    );
  };
  render(); return root;
}
