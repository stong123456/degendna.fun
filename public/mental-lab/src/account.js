// Account transport is deliberately isolated: never reads or sends assessment/local-record data.
export function accountView(el) {
  const root=el('section',{class:'account-workspace'});
  let ready=null,user=null,stage='email',email='',code='',nickname='',avatar='sprout',consent=false,busy=false,message='正在检查账号服务…',error='',cooldownUntil=0,page=1,users=null,hasMore=false,deleting=false,deleteCode='',deleteConfirm='';
  const api=async(action,body)=>{
    const r=await fetch('/api/account/'+action,{credentials:'same-origin',...(body===undefined?{}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})});
    const data=await r.json();if(!r.ok)throw Error(data.error||'暂时无法完成，请稍后重试。');return data;
  };
  async function run(task){if(busy)return;busy=true;error='';render();try{await task();}catch(e){error=e.message;if(ready===null)message="暂时无法读取账号状态，匿名功能不受影响。";}finally{busy=false;render();}}
  const button=(text,fn,secondary=false,disabled=false)=>el('button',{class:secondary?'secondary':'primary',type:'button',disabled:busy||disabled,onclick:()=>run(fn)},text);
  const field=(label,attrs)=>el('label',{class:'account-field'},[el('span',{},label),el('input',attrs)]);
  const avatars=[{id:'sprout',label:'新芽',symbol:'🌱'},{id:'sun',label:'日光',symbol:'☀️'},{id:'moon',label:'月亮',symbol:'🌙'},{id:'gem',label:'晶石',symbol:'💎'}];
  const dateText=value=>{const d=new Date(value);return value&&Number.isFinite(d.getTime())?new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium',timeStyle:'short'}).format(d):'暂无记录';};
  const readUser=async()=>{user=(await api('me')).user;nickname=user?.nickname||'';avatar=user?.avatar||'sprout';};
  const go=(label,page)=>el('a',{class:'profile-link',href:'/?page='+page},label);
  const loadUsers=async()=>{const d=await api('users?page='+page);users=d.users;hasMore=d.hasMore;};
  function render(){
    root.replaceChildren(...[
      el('header',{class:'workspace-head'},[el('h2',{},user?'我的资料':'注册 / 登录'),el('p',{},user?'让这里更像你的空间。账号资料与本机私密记录分别管理。':'点击邮箱登录链接，首次验证后自动创建账号。自查与工具也可继续匿名使用。')]),
      el('p',{class:'note-band'},'账号服务只处理邮箱、昵称、预设头像和登录信息。测评答案、报告、草稿、日记和 Reset 记录不会因注册而上传或自动跨设备同步。共用设备上的本地记录仍需你自行管理。'),
      el('p',{role:'status','aria-live':'polite'},message),error?el('p',{role:'alert'},error):null,
      ready===false?el('p',{},'真实邮箱登录尚未接通。平台配置与真实邮件送达验证完成后才开放，不提供虚假的演示验证码。'):null,
      ready&&!user&&stage==='email'?el('form',{class:'account-form',onsubmit:e=>{e.preventDefault();run(async()=>{const d=await api('send',{email,consent});cooldownUntil=Date.now()+d.retryAfter*1000;stage='sent';code='';message=d.message;});}},[
        field('邮箱',{type:'email',name:'email',autocomplete:'email',required:true,maxlength:254,value:email,disabled:busy,oninput:e=>{email=e.target.value;}}),
        el('label',{class:'account-consent'},[el('input',{type:'checkbox',required:true,checked:consent,disabled:busy,onchange:e=>{consent=e.target.checked;}}),el('span',{},'我已了解邮箱与登录信息由认证服务处理，私密自查数据仍留在本机。')]),
        el('button',{class:'primary',type:'submit',disabled:busy},busy?'正在发送…':'发送登录链接')
      ]):null,
      ready&&!user&&stage==='sent'?el('section',{class:'care-card'},[
        el('h3',{},'请查收登录邮件'),el('p',{},`发送目标：${email}。请检查收件箱和垃圾邮件，点击邮件中的登录链接。`),
        el('p',{},'请在发起登录的同一浏览器中打开链接；邮件应用内的浏览器可能无法完成登录。链接过期或重复使用时，请重新申请。'),
        button('重新发送登录邮件',async()=>{if(Date.now()<cooldownUntil)throw Error('请等待60秒后再重发。');const d=await api('send',{email,consent});cooldownUntil=Date.now()+d.retryAfter*1000;message=d.message;},true),
        button('我已点击链接，检查登录状态',async()=>{await readUser();message=user?'已确认登录成功。':'尚未读取到登录状态，请确认已在同一浏览器打开最新邮件链接。';},true),
        button('更换邮箱',async()=>{stage='email';message='请确认邮箱后重新发送。';},true)
      ]):null,
      user?el('div',{class:'profile-layout'},[
        el('section',{class:'care-card profile-main'},[
          el('div',{class:'profile-identity'},[
            el('span',{class:'profile-avatar','aria-hidden':'true'},avatars.find(a=>a.id===avatar)?.symbol||'🌱'),
            el('div',{},[el('h3',{},user.nickname),el('p',{},user.email),el('span',{class:'profile-badge'},user.emailVerified?'邮箱已验证':'邮箱待验证'),user.isAdmin?el('span',{class:'profile-badge'},'管理员'):null].filter(Boolean))
          ]),
          el('form',{class:'profile-form',onsubmit:e=>{e.preventDefault();run(async()=>{user=(await api('profile',{nickname,avatar})).user;nickname=user.nickname;avatar=user.avatar;message='个人资料已保存。';});}},[
            el('h3',{},'编辑个人资料'),
            field('昵称',{name:'nickname',autocomplete:'nickname',required:true,maxlength:40,value:nickname,disabled:busy,oninput:e=>{nickname=e.target.value;}}),
            el('p',{class:'profile-hint'},'1–40 个字符。昵称和头像会保存到账号，不会随之上传测评记录。'),
            el('fieldset',{class:'profile-avatar-picker'},[el('legend',{},'选择头像'),el('div',{class:'profile-avatar-options'},avatars.map(a=>el('button',{type:'button',class:'profile-avatar-option','aria-label':a.label+'头像','aria-pressed':String(avatar===a.id),disabled:busy,onclick:()=>{avatar=a.id;render();}},[el('span',{'aria-hidden':'true'},a.symbol),el('span',{},a.label)])))]),
            el('div',{class:'profile-actions'},[
              el('button',{class:'primary',type:'submit',disabled:busy},busy?'正在保存…':'保存资料'),
              button('取消修改',async()=>{nickname=user.nickname;avatar=user.avatar;message='已恢复已保存的资料。';},true)
            ])
          ])
        ]),
        el('section',{class:'care-card profile-meta'},[
          el('h3',{},'账号信息'),
          el('dl',{class:'profile-facts'},[
            el('dt',{},'登录方式'),el('dd',{},'邮箱登录链接'),
            el('dt',{},'注册时间'),el('dd',{},dateText(user.createdAt)),
            el('dt',{},'最近登录'),el('dd',{},dateText(user.lastSignInAt)),
            el('dt',{},'数据同步'),el('dd',{},'仅账号资料；测评记录不自动同步')
          ]),
          el('details',{},[el('summary',{},'查看账号 ID'),el('code',{class:'profile-account-id'},user.id)]),
          el('p',{class:'profile-hint'},'邮箱是当前登录凭证。本页暂不支持更换邮箱。')
        ]),
        el('section',{class:'care-card profile-data'},[
          el('h3',{},'我的数据与隐私'),el('p',{},'账号导出只包含邮箱、昵称、头像及账号时间。测评报告、草稿、日记和 Reset 内容留在当前浏览器，换设备或清除浏览器数据后不会自动恢复。'),
          el('div',{class:'profile-actions'},[
            button('导出账号资料',async()=>{const blob=new Blob([JSON.stringify({format:'degendna-account-export-v1',exportedAt:new Date().toISOString(),user},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='degendna-account.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message='账号资料已导出；私密记录请在隐私与备份中单独备份。';},true),
            go('查看本地记录','records'),go('隐私与备份','privacy')
          ])
        ]),
        el('section',{class:'care-card profile-security'},[
          el('h3',{},'登录与账号管理'),el('p',{},'在共用设备上，退出账号后还需自行管理本地私密记录。'),
          el('div',{class:'profile-actions'},[
            button('退出登录',async()=>{await api('logout',{});user=null;users=null;deleting=false;stage='email';message='已退出本机账号。本机私密记录没有自动删除；共用设备请到隐私中心管理。';},true),
            button('注销账号',async()=>{deleting=true;deleteConfirm='';message='注销前请阅读说明，并重新验证邮箱。';},true)
          ]),
        deleting?el('section',{class:'account-delete'},[
          el('h4',{},'注销前再次确认'),el('p',{},'确认后永久删除邮箱账号和昵称，无法通过本站恢复。本机自查记录、已下载文件不会因此删除；可另到隐私中心管理。管理员需先移交权限。'),
          button('发送重新验证链接',async()=>{await api('send',{email:user.email,consent:true});message='请点击新邮件中的登录链接，返回账号页后再次打开注销确认。';},true),
          field('输入 DELETE 确认永久注销',{name:'delete-confirm',autocomplete:'off',value:deleteConfirm,oninput:e=>{deleteConfirm=e.target.value;}}),
          button('确认永久注销',async()=>{await api('delete',{confirmation:deleteConfirm});user=null;users=null;deleting=false;stage='email';message='邮箱账号已注销。本机自查记录仍由你自行管理。';},true),
          button('取消注销',async()=>{deleting=false;deleteCode='';deleteConfirm='';message='已取消注销。';},true)
        ]):null
        ])
      ]):null,
      user?.isAdmin?el('section',{class:'care-card'},[
        el('h3',{},'用户管理'),el('p',{},'仅指定管理员可见。只管理账号状态，不提供用户测评、日记或报告。不会自动把首位注册者设为管理员。'),
        button('读取用户列表',loadUsers,true),
        ...(users||[]).map(row=>el('article',{class:'account-user'},[
          el('strong',{},row.nickname),el('p',{},row.email),el('small',{},`注册：${row.createdAt||'未提供'}；最近登录：${row.lastSignInAt||'未提供'}`),
          el('p',{},row.bannedUntil&&Date.parse(row.bannedUntil)>Date.now()?'账号已暂停':'账号正常'),
          !row.isAdmin?button(row.bannedUntil&&Date.parse(row.bannedUntil)>Date.now()?'恢复账号':'暂停账号',async()=>{const suspend=!(row.bannedUntil&&Date.parse(row.bannedUntil)>Date.now());if(!confirm(`${suspend?'暂停':'恢复'} ${row.email} 的账号访问？`))return;await api('access',{userId:row.id,suspend});await loadUsers();message='账号状态已更新。';},true):el('small',{},'管理员账号由部署配置管理')
        ])),users?el('div',{class:'care-options'},[button('上一页',async()=>{page--;await loadUsers();},true,page<=1),el('span',{},`第 ${page} 页`),button('下一页',async()=>{page++;await loadUsers();},true,!hasMore)]):null
      ]):null
    ].filter(Boolean));
  }
  render();
  run(async()=>{const s=await api('status');ready=s.ready;if(ready){await readUser();}message=ready?(user?'已读取当前登录状态，未读取或上传自查记录。':'请输入邮箱接收登录链接。'):'账号服务尚未开放，匿名功能照常可用。';});
  return root;
}
