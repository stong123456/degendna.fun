// Uses only the official Management API; never prints configuration or credentials.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const token=process.env.SUPABASE_MANAGEMENT_ACCESS_TOKEN?.trim();
if(!token)throw Error('Fill SUPABASE_MANAGEMENT_ACCESS_TOKEN in the ignored local management env file first.');
const url='https://api.supabase.com/v1/projects/ndfbmaojvbyuxjsydlsn/config/auth';
async function request(method='GET',body){const r=await fetch(url,{method,headers:{authorization:'Bearer '+token,...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000),redirect:'error'});if(!r.ok)throw Error('Management API rejected request (HTTP '+r.status+'). No credentials were printed.');return r.json();}
const html=await readFile(new URL('../docs/accelerator/email-templates/otp.html',import.meta.url),'utf8');
const patch={mailer_otp_length:6,mailer_subjects_confirmation:'DegenDNA 邮箱验证码',mailer_templates_confirmation_content:html,mailer_subjects_magic_link:'DegenDNA 邮箱验证码',mailer_templates_magic_link_content:html};
const before=await request();
await mkdir(new URL('../.secrets/',import.meta.url),{recursive:true,mode:0o700});
await writeFile(new URL('../.secrets/auth-email-backup.json',import.meta.url),JSON.stringify(Object.fromEntries(Object.keys(patch).map(k=>[k,before[k]])),null,2),{mode:0o600});
await request('PATCH',patch);const after=await request();
if(Object.entries(patch).some(([k,v])=>after[k]!==v))throw Error('Saved template differs; review required.');
console.log(JSON.stringify({status:'PASS',project:'ndfbmaojvbyuxjsydlsn',templates:['confirmation','magic_link'],verifiedByReadback:true,templateSHA256:createHash('sha256').update(html).digest('hex'),otpLength:after.mailer_otp_length??'not exposed',emailConfirmationPreserved:after.mailer_autoconfirm===before.mailer_autoconfirm}));
