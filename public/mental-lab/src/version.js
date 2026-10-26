import { productBuild } from './build-mode.js';
export async function validatePublishedRelease(m,r) {
  if(m?.format!=='degendna-public-release-v1'||m.mode!=='deweb'||!Array.isArray(m.files)||!m.files.length||m.files.length>128)return false;
  const {releaseId,...payload}=m;
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload))))).map(v=>v.toString(16).padStart(2,'0')).join('');
  if(hash!==releaseId||r?.format!=='degendna-tapeout-deployment-v1'||r.status!=='verified'||r.chainId!==196||r.sourceReleaseId!==releaseId||!Array.isArray(r.deployments)||!r.deployments.length)return false;
  if(new Set(m.files.map(f=>f.path)).size!==m.files.length)return false;
  return r.deployments.every(d=>/^0x[0-9a-fA-F]{40}$/.test(d.container)&&/^0x[0-9a-fA-F]{64}$/.test(d.blockHash)&&/^0x[0-9a-fA-F]+$/.test(d.block)&&Array.isArray(d.files)&&d.files.length===m.files.length&&new Set(d.files.map(f=>f.path)).size===m.files.length&&m.files.every(f=>d.files.some(v=>v.path===f.path&&v.sha256===f.sha256&&v.bytes===f.bytes&&v.status==='verified')));
}
export function versionView(el) {
  const root=el('section',{class:'version-workspace'});let manifest=null,receipt=null,published=null,publishedMessage='正在读取链上发布记录…',message='正在读取公开版本清单…',error='',busy=false,checks=[];
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
        for(const f of manifest.files){if(!/^\/(?:index\.html|favicon\.ico|mental-lab\/[a-zA-Z0-9_./-]+\.(?:js|css|png)|mental-lab\/vendor\/lucide-LICENSE)$/.test(f.path)||f.path.includes('..')||!Number.isInteger(f.bytes)||f.bytes>8400000)throw Error('文件路径或大小不受支持。');
          const r=await fetch(f.path,{cache:'no-store',credentials:'omit'});if(!r.ok)throw Error('未能读取公开文件。');const bytes=await r.arrayBuffer();checks.push({path:f.path,match:bytes.byteLength===f.bytes&&await digest(bytes)===f.sha256});
        }
        message=checks.every(c=>c.match)?`已核对 ${checks.length} 个公开文件，均与本清单一致。清单本身的可信来源仍需你独立核对。`:'部分文件与清单不一致，请暂缓使用并核对更新状态。';
      }catch(e){error=e.message;}finally{busy=false;render();}}},busy?'正在核对公开文件…':'核对公开文件'),
      checks.length?el('ul',{},checks.map(c=>el('li',{},`${c.match?'一致':'不一致'} · ${c.path}`))):null,
      el('a',{href:'/release/manifest.json',download:'degendna-public-manifest.json'},'下载公开版本清单')
    ]):null,
    el('section',{class:'care-card'},[
      el('h3',{},'TapeOut / X Layer 发布状态'),
      el('p',{role:'status'},published?'公开核心已发布至 X Layer / TapeOut，并留有双 RPC 逐字节核验记录。':publishedMessage),
      published?el('div',{},[
        el('p',{},`链上名称：${published.receipt.deployments[0].name}；网络：X Layer（196）`),
        el('p',{},`已发布解释规则：${published.manifest.interpretationVersion}；公开核心文件：${published.manifest.files.length} 个`),
        el('p',{},`链上版本标识：${published.manifest.releaseId}`),
        el('p',{},`核验记录时间：${published.receipt.verifiedAt}；固定区块：${published.receipt.deployments[0].block}`),
        el('p',{},'这是已发布固定版本的核验记录，不代表当前网页的每次修改已同步上链，也不代表题库科学有效。电路用于容器身份，不运行心理评分。'),
        el('p',{},[el('a',{href:'https://degendna-fun-web.fly.dev/',target:'_blank',rel:'noopener noreferrer'},'打开链上固定版'),' · ',el('a',{href:'https://degendna-fun-web.fly.dev/release/v20261022-plain3/deployment.json',target:'_blank',rel:'noopener noreferrer'},'查看公开核验凭证'),' · ',el('a',{href:'https://www.oklink.com/xlayer/tx/0xb7ea1778c9b507e2d81c03ca5b9611a4a4804c8ffe9d102e29c59802844cc945',target:'_blank',rel:'noopener noreferrer'},'在链浏览器核对发布交易')])
      ]):null,
      el('p',{},'参赛核心包包含公开程序、题库、说明和工具。邮箱账号由独立认证服务处理；个人数据默认留在当前浏览器。')
    ])
  ].filter(Boolean));}
  render();
  if(productBuild.mode==='web')fetch('/release/published-deweb.json',{cache:'no-store',credentials:'omit'})
    .then(async r=>{if(!r.ok)throw Error();const b=await r.json();if(b.format!=='degendna-published-snapshot-v1'||!await validatePublishedRelease(b.manifest,b.receipt))throw Error();published=b;render();})
    .catch(()=>{publishedMessage='链上发布记录暂时无法读取或校验，请通过链上固定版入口核对；这不表示尚未发布。';render();});
  Promise.all([fetch('/release/manifest.json',{credentials:'omit'}).then(r=>r.ok?r.json():Promise.reject(Error('公开版本清单暂不可用。'))),fetch('/release/deployment.json',{credentials:'omit'}).then(r=>r.ok?r.json():null).catch(()=>null)])
    .then(async([m,r])=>{if(m.format!=='degendna-public-release-v1'||!Array.isArray(m.modules))throw Error('版本清单格式不支持。');const {releaseId,...payload}=m;if(await digest(new TextEncoder().encode(JSON.stringify(payload)))!==releaseId)throw Error('清单标识校验失败。');manifest=m;receipt=r?.format==='degendna-tapeout-deployment-v1'&&r.chainId===196&&r.sourceReleaseId===releaseId&&Array.isArray(r.deployments)&&r.deployments.length>0&&r.deployments.every(d=>/^0x[0-9a-fA-F]{40}$/.test(d.container)&&Array.isArray(d.files)&&d.files.length===m.files.length&&m.files.every(f=>d.files.some(v=>v.path===f.path&&v.sha256===f.sha256&&v.bytes===f.bytes&&v.status==='verified')))?r:null;if(productBuild.mode==='deweb'){if(await validatePublishedRelease(m,receipt))published={manifest:m,receipt};else publishedMessage='此构建未附有效的发布凭证，请独立核对链上记录。';}message='公开版本清单已读取。可按需要核对全部公开文件。';render();}).catch(e=>{error=e.message;message='未能读取版本信息，不影响你查看现有自查内容。';render();});
  return root;
}
