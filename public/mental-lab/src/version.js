import { productBuild } from './build-mode.js';
export function versionView(el) {
  const root=el('section',{class:'version-workspace'});let manifest=null,receipt=null,message='正在读取公开版本清单…',error='',busy=false,checks=[];
  const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
  function render(){root.replaceChildren(...[
    el('header',{class:'workspace-head'},[el('h2',{},'核对解读版本'),el('p',{},'查看公开题库、解释规则与程序文件；核对版本不会读取你的自查答案。')]),
    el('p',{class:'note-band'},'文件一致性只说明字节与公开清单相符，不能证明题库科学有效、解释准确或已经完成链上发布。注册、AI及个人答案不属于公开上链内容。'),
    el('p',{role:'status','aria-live':'polite'},message),error?el('p',{role:'alert'},error):null,
    manifest?el('section',{class:'care-card'},[
      el('h3',{},'本次公开版本'),el('p',{},`构建方式：${productBuild.mode==='deweb'?'DeWEB 静态核心包':'正式网站'}`),
      el('p',{},`清单标识：${manifest.releaseId}`),el('p',{},`清单生成依据：${manifest.sourceRevision}`),
      el('p',{},`解释规则：${manifest.interpretationVersion}；近期类型：${manifest.typeVersion}`),
      el('details',{},[el('summary',{},'各测评题库版本'),el('ul',{},manifest.modules.map(m=>el('li',{},`${m.title}：${m.version}，${m.scope}`)))]),
      el('button',{class:'primary',disabled:busy,onclick:async()=>{busy=true;error='';checks=[];render();try{
        if(!Array.isArray(manifest.files)||manifest.files.length>128)throw Error('清单范围异常。');
        for(const f of manifest.files){if(!/^\/(?:index\.html|mental-lab\/[a-zA-Z0-9_./-]+\.(?:js|css|png)|mental-lab\/vendor\/lucide-LICENSE)$/.test(f.path)||f.path.includes('..')||!Number.isInteger(f.bytes)||f.bytes>8400000)throw Error('文件路径或大小不受支持。');
          const r=await fetch(f.path,{cache:'no-store',credentials:'omit'});if(!r.ok)throw Error('未能读取公开文件。');const bytes=await r.arrayBuffer();checks.push({path:f.path,match:bytes.byteLength===f.bytes&&await digest(bytes)===f.sha256});
        }
        message=checks.every(c=>c.match)?`已核对 ${checks.length} 个公开文件，均与本清单一致。清单本身的可信来源仍需你独立核对。`:'部分文件与清单不一致，请暂缓使用并核对更新状态。';
      }catch(e){error=e.message;}finally{busy=false;render();}}},busy?'正在核对公开文件…':'核对公开文件'),
      checks.length?el('ul',{},checks.map(c=>el('li',{},`${c.match?'一致':'不一致'} · ${c.path}`))):null,
      el('a',{href:'/release/manifest.json',download:'degendna-public-manifest.json'},'下载公开版本清单')
    ]):null,
    el('section',{class:'care-card'},[
      el('h3',{},'TapeOut / X Layer 发布状态'),el('p',{},receipt?.status==='verified'?'有发布记录，仍请通过链浏览器独立核对。':'尚未记录已核验的链上发布；当前不能宣称已经完成 TapeOut 集成。'),
      el('p',{},'参赛核心包包含公开程序、题库、说明和工具。邮箱账号由独立认证服务处理；个人数据默认留在当前浏览器。')
    ])
  ].filter(Boolean));}
  render();
  Promise.all([fetch('/release/manifest.json',{credentials:'omit'}).then(r=>r.ok?r.json():Promise.reject(Error('公开版本清单暂不可用。'))),fetch('/release/deployment.json',{credentials:'omit'}).then(r=>r.ok?r.json():null).catch(()=>null)])
    .then(async([m,r])=>{if(m.format!=='degendna-public-release-v1'||!Array.isArray(m.modules))throw Error('版本清单格式不支持。');const {releaseId,...payload}=m;if(await digest(new TextEncoder().encode(JSON.stringify(payload)))!==releaseId)throw Error('清单标识校验失败。');manifest=m;receipt=r?.format==='degendna-tapeout-deployment-v1'&&r.chainId===196&&r.sourceReleaseId===releaseId&&Array.isArray(r.deployments)&&r.deployments.length>0&&r.deployments.every(d=>/^0x[0-9a-fA-F]{40}$/.test(d.container)&&Array.isArray(d.files)&&d.files.length===m.files.length&&m.files.every(f=>d.files.some(v=>v.path===f.path&&v.sha256===f.sha256&&v.bytes===f.bytes&&v.status==='verified')))?r:null;message='公开版本清单已读取。可按需要核对全部公开文件。';render();}).catch(e=>{error=e.message;message='未能读取版本信息，不影响你查看现有自查内容。';render();});
  return root;
}
