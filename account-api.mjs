import { createHash, randomBytes, createHmac } from 'node:crypto';

const emailOf = v => typeof v === 'string' && v.trim().length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? v.trim().toLowerCase() : null;
const codeOf = v => typeof v==='string' && /^\d{6}$/.test(v);
const uuid = v => typeof v==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const roleOf = key => {try{return JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role;}catch{return null;}};
export function accountConfig(env=process.env) {
  const url=(env.SUPABASE_AUTH_URL||'').trim(),key=(env.SUPABASE_AUTH_PUBLISHABLE_KEY||'').trim(),admin=(env.SUPABASE_AUTH_SERVICE_ROLE_KEY||'').trim();
  let valid=false;try{const u=new URL(url);valid=u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'&&u.hostname.endsWith('.supabase.co');}catch{}
  return {url:url.replace(/\/$/,''),key,admin,ready:valid&&(key.startsWith('sb_publishable_')&&key.length>25||roleOf(key)==='anon'),adminReady:roleOf(admin)==='service_role'||/^sb_secret_[A-Za-z0-9_-]{20,}$/.test(admin),
    admins:new Set((env.AUTH_ADMIN_USER_IDS||'').split(',').map(s=>s.trim()).filter(uuid)),
    enabled:env.AUTH_ENABLED==='true',production:env.NODE_ENV==='production',origin:(env.PUBLIC_SITE_URL||'https://degendna.fun').replace(/\/$/,''),captchaRequired:env.AUTH_CAPTCHA_REQUIRED==='true'};
}
class HttpError extends Error {constructor(status,message){super(message);this.status=status;}}
export function createAccountApi({config=accountConfig(),fetcher=fetch,now=Date.now}={}) {
  const attempts=new Map(), reauthKey=config.admin||randomBytes(32).toString('hex');
  const reauthProof=(id,expiry)=>createHmac('sha256',reauthKey).update(id+':'+expiry).digest('hex');
  const prefix=config.production?'__Host-ddna-':'ddna-';
  function limited(scope,identity,max,windowMs){
    const key=createHash('sha256').update(scope+':'+identity).digest('hex'),t=now();
    if(attempts.size>10000){for(const [k,v] of attempts)if(v.until<=t)attempts.delete(k);if(attempts.size>10000)throw new HttpError(429,'请求较多，请稍后再试。');}
    const entry=attempts.get(key);if(entry&&entry.until>t){if(entry.count>=max)throw new HttpError(429,'请求太频繁，请稍后再试。');entry.count++;}else attempts.set(key,{count:1,until:t+windowMs});
  }
  function cookie(res,name,value,age){
    const item=`${prefix}${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${config.production?'; Secure':''}`;
    res.setHeader('set-cookie',[...(res.getHeader('set-cookie')||[]),item]);
  }
  function readCookie(req,name){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(prefix+name+'='));if(!raw)return '';try{return decodeURIComponent(raw.slice(raw.indexOf('=')+1));}catch{return '';}}
  function clear(res){for(const name of ['access','refresh','pkce','reauth'])cookie(res,name,'',0);}
  function session(res,s){if(typeof s.access_token!=='string'||typeof s.refresh_token!=='string'||s.access_token.length>4000||s.refresh_token.length>2000)throw new HttpError(502,'登录服务返回异常，请重试。');cookie(res,'access',s.access_token,Math.min(Number(s.expires_in)||3600,3600));cookie(res,'refresh',s.refresh_token,60*60*24*30);}
  async function provider(path,{method='GET',body,token,admin=false}={}) {
    let response;try {response=await fetcher(config.url+'/auth/v1'+path,{method,headers:{apikey:admin?config.admin:config.key,...(token?{authorization:'Bearer '+token}:admin&&roleOf(config.admin)==='service_role'?{authorization:'Bearer '+config.admin}:{}),...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000),redirect:'error'});}catch{throw new HttpError(503,'登录服务暂时不可用，请稍后再试。');}
    const data=await response.json().catch(()=>({}));
    if(!response.ok){if(response.status===429)throw new HttpError(429,'请求太频繁，请稍后再试。');if(response.status>=500)throw new HttpError(503,'登录服务暂时不可用，请稍后再试。');throw new HttpError(401,'验证信息无效、已过期，或登录状态已失效。');}
    return data;
  }
  const verified=u=>u&&uuid(u.id)&&emailOf(u.email)&&u.email_confirmed_at&&(!u.banned_until||Date.parse(u.banned_until)<=now());
  function publicUser(u){return {id:u.id,email:u.email,nickname:typeof u.user_metadata?.nickname==='string'?u.user_metadata.nickname.slice(0,40):'DegenDNA 用户',createdAt:u.created_at,lastSignInAt:u.last_sign_in_at,isAdmin:config.adminReady&&config.admins.has(u.id)};}
  async function identity(req,res,required=true){
    let access=readCookie(req,'access'),u;
    if(access){try{u=await provider('/user',{token:access});}catch(e){if(e.status!==401)throw e;}}
    if(!u&&readCookie(req,'refresh')){try{const s=await provider('/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:readCookie(req,'refresh')}});u=await provider('/user',{token:s.access_token});if(verified(u)){session(res,s);access=s.access_token;}}catch(e){if(e.status!==401)throw e;clear(res);}}
    if(verified(u)&&config.adminReady){const managed=await provider('/admin/users/'+u.id,{admin:true});const record=managed.user||managed;if(record.id!==u.id||!verified(record))u=null;}
    if(!verified(u)){if(access||readCookie(req,'refresh'))clear(res);if(required)throw new HttpError(401,'请先通过邮箱链接登录。');return null;}
    return {user:u,access};
  }
  async function bodyOf(req){
    if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new HttpError(415,'请使用 JSON 请求。');
    if(Number(req.headers['content-length'])>8192)throw new HttpError(413,'请求内容过长。');
    let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>8192)throw new HttpError(413,'请求内容过长。');}
    try{const b=JSON.parse(text);if(!b||Array.isArray(b)||typeof b!=='object')throw Error();return b;}catch{throw new HttpError(400,'请求格式无效。');}
  }
  const fields=(b,allowed)=>{if(Object.keys(b).some(k=>!allowed.includes(k)))throw new HttpError(400,'请求包含不支持的字段。');};
  async function handle(req,res,path,search=new URLSearchParams()){
    if(!path.startsWith('/api/account/'))return false;
    const send=(status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','vary':'Cookie'});res.end(JSON.stringify(data));};
    try{
      const action=path.slice('/api/account/'.length);
      if(req.method==='GET'&&action==='status'){send(200,{ready:config.enabled&&config.ready,method:'email-link',privacy:'账号只保存邮箱、昵称与登录信息，不同步测评或日记。'});return true;}
      if(!config.enabled||!config.ready)throw new HttpError(503,'邮箱登录尚未接通。你仍可匿名使用全部自查与工具。');
      if(!['GET','POST'].includes(req.method))throw new HttpError(405,'不支持此请求方法。');
      if(req.method==='POST'){
        const origin=req.headers.origin;
        if(origin!==config.origin)throw new HttpError(403,'请从本站页面操作。');
        const ip=String(req.headers['fly-client-ip']||req.socket.remoteAddress||'unknown');limited('ip',ip,120,600000);
      }
      if(req.method==='GET'&&action==='me'){const id=await identity(req,res,false);send(200,{user:id?publicUser(id.user):null});return true;}
      if(req.method==='POST'&&action==='send'){
        const body=await bodyOf(req);fields(body,['email','captchaToken','consent']);const email=emailOf(body.email);
        if(!email||body.consent!==true)throw new HttpError(400,'请输入有效邮箱，并确认账号数据说明。');
        if(config.captchaRequired&&!body.captchaToken)throw new HttpError(400,'请先完成人机验证。');
        limited('send',email,1,60000);
        const verifier=randomBytes(32).toString('hex');
        const challenge=createHash('sha256').update(verifier).digest('base64url');
        await provider('/otp?redirect_to='+encodeURIComponent(config.origin+'/auth/callback.html'),{method:'POST',body:{email,create_user:true,code_challenge:challenge,code_challenge_method:'s256',...(body.captchaToken?{gotrue_meta_security:{captcha_token:body.captchaToken}}:{})}});
        cookie(res,'pkce',verifier,3600);
        send(200,{ok:true,message:'登录邮件请求已提交，请在发起登录的同一浏览器中打开邮件链接。',retryAfter:60});return true;
      }
      if(req.method==='POST'&&action==='callback'){
        const body=await bodyOf(req);fields(body,['code']);const verifier=readCookie(req,'pkce');
        if(typeof body.code!=='string'||body.code.length>2048||!body.code||!/^[a-f0-9]{64}$/.test(verifier))throw new HttpError(401,'登录链接已失效，或不是在发起登录的浏览器中打开。请返回账号页重新申请。');
        limited('callback',verifier,8,600000);
        const s=await provider('/token?grant_type=pkce',{method:'POST',body:{auth_code:body.code,code_verifier:verifier}});
        const u=await provider('/user',{token:s.access_token});if(!verified(u))throw new HttpError(401,'未能确认邮箱身份。');
        if(config.adminReady){const managed=await provider('/admin/users/'+u.id,{admin:true});if(!verified(managed.user||managed))throw new HttpError(401,'账号暂不可用。');}
        session(res,s);cookie(res,'pkce','',0);const expiry=now()+600000;cookie(res,'reauth',expiry+'.'+reauthProof(u.id,expiry),600);send(200,{user:publicUser(u)});return true;
      }
      if(req.method==='POST'&&action==='verify'){
        const body=await bodyOf(req);fields(body,['email','code']);const email=emailOf(body.email);if(!email||!codeOf(body.code))throw new HttpError(400,'请输入有效邮箱和六位验证码。');limited('verify',email,8,600000);
        const s=await provider('/verify',{method:'POST',body:{email,token:body.code,type:'email'}});const u=await provider('/user',{token:s.access_token});if(!verified(u)||emailOf(u.email)!==email)throw new HttpError(401,'未能确认邮箱身份。');session(res,s);send(200,{user:publicUser(u)});return true;
      }
      if(req.method==='POST'&&action==='logout'){
        const body=await bodyOf(req);fields(body,[]);const access=readCookie(req,'access');clear(res);let remoteRevoked=false;
        if(access){try{await provider('/logout?scope=local',{method:'POST',token:access});remoteRevoked=true;}catch{}}
        send(200,{ok:true,remoteRevoked});return true;
      }
      const id=await identity(req,res);
      if(req.method==='POST'&&action==='delete'){
        if(!config.adminReady)throw new HttpError(503,'账号注销服务尚未配置，请联系产品维护者。');
        if(config.admins.has(id.user.id))throw new HttpError(400,'管理员需先由部署维护者移除管理权限，再注销账号。');
        const body=await bodyOf(req);fields(body,['confirmation']);
        if(body.confirmation!=='DELETE')throw new HttpError(400,'请输入 DELETE 确认注销。');
        const [expiry,proof]=readCookie(req,'reauth').split('.');
        if(!expiry||Number(expiry)<=now()||Number(expiry)>now()+600000||proof!==reauthProof(id.user.id,expiry))throw new HttpError(401,'请先重新申请登录邮件并点击链接，在10分钟内完成注销确认。');
        limited('delete',id.user.id,5,600000);
        await provider('/admin/users/'+id.user.id,{method:'DELETE',admin:true,body:{should_soft_delete:false}});clear(res);send(200,{ok:true});return true;
      }
      if(req.method==='POST'&&action==='profile'){
        const body=await bodyOf(req);fields(body,['nickname']);const nickname=typeof body.nickname==='string'?body.nickname.trim():'';if(!nickname||nickname.length>40||/[\x00-\x1f]/.test(nickname))throw new HttpError(400,'昵称需要1至40个字符。');
        const u=await provider('/user',{method:'PUT',token:id.access,body:{data:{nickname}}});send(200,{user:publicUser(u)});return true;
      }
      if(action==='users'&&req.method==='GET'){
        if(!config.adminReady||!config.admins.has(id.user.id))throw new HttpError(403,'仅指定管理员可管理账号。');
        const page=Number(search.get('page')||1);if(!Number.isInteger(page)||page<1||page>10000)throw new HttpError(400,'分页参数无效。');
        const data=await provider(`/admin/users?page=${page}&per_page=20`,{admin:true});send(200,{page,users:(data.users||[]).map(u=>({...publicUser(u),bannedUntil:u.banned_until||null})),hasMore:(data.users||[]).length===20});return true;
      }
      if(action==='access'&&req.method==='POST'){
        if(!config.adminReady||!config.admins.has(id.user.id))throw new HttpError(403,'仅指定管理员可管理账号。');
        const body=await bodyOf(req);fields(body,['userId','suspend']);if(!uuid(body.userId)||typeof body.suspend!=='boolean'||config.admins.has(body.userId))throw new HttpError(400,'不能修改管理员账号或无效账号。');
        await provider('/admin/users/'+body.userId,{method:'PUT',admin:true,body:{ban_duration:body.suspend?'876000h':'none'}});
        console.info(JSON.stringify({event:'account-access',actor:id.user.id,target:body.userId,suspended:body.suspend,at:new Date(now()).toISOString()}));send(200,{ok:true});return true;
      }
      throw new HttpError(404,'接口不存在。');
    }catch(e){send(e.status||500,{error:e.status?e.message:'账号服务暂时不可用。'});return true;}
  }
  return {handle};
}
