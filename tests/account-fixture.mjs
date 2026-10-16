// Synthetic identity provider for isolated tests only. Production never imports this module.
import { createServer } from 'node:http';
import { createAccountApi } from '../account-api.mjs';
export const USER='11111111-1111-4111-8111-111111111111', ADMIN='22222222-2222-4222-8222-222222222222';
const jwt=role=>'x.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.x';
export async function accountFixture({enabled=true,production=false,serve}={}) {
 const users=new Map([['user-token',{id:USER,email:'tester@example.test',email_confirmed_at:'2026-10-16T00:00:00Z',created_at:'2026-10-16T00:00:00Z',user_metadata:{nickname:'测试用户',isAdmin:true}}],['admin-token',{id:ADMIN,email:'owner@example.test',email_confirmed_at:'2026-10-16T00:00:00Z',user_metadata:{nickname:'测试管理员'}}]]),calls=[];
 const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
 const config={enabled,production,ready:true,url:'https://fixture.supabase.co',key:jwt('anon'),admin:jwt('service_role'),adminReady:true,admins:new Set([ADMIN]),origin:'',captchaRequired:false};
 const provider=async(url,options={})=>{
  calls.push({url,options});const u=new URL(url),body=options.body?JSON.parse(options.body):{},token=options.headers?.authorization?.replace('Bearer ','');
  if(u.pathname.endsWith('/otp'))return response({});
  if(u.pathname.endsWith('/verify'))return body.token==='123456'?response({access_token:body.email==='owner@example.test'?'admin-token':'user-token',refresh_token:'refresh-token',expires_in:3600}):response({error:'bad-code'},401);
  if(u.pathname.endsWith('/token')&&u.searchParams.get('grant_type')==='pkce')return body.auth_code==='valid-link'&&/^[a-f0-9]{64}$/.test(body.code_verifier)?response({access_token:'user-token',refresh_token:'refresh-token',expires_in:3600}):response({},401);
  if(u.pathname.endsWith('/token'))return body.refresh_token==='refresh-token'?response({access_token:'user-token',refresh_token:'rotated-token',expires_in:3600}):response({},401);
  if(u.pathname.endsWith('/admin/users'))return response({users:[...users.values()]});
  if(u.pathname.includes('/admin/users/')){const user=[...users.values()].find(row=>row.id===u.pathname.split('/').at(-1));if(!options.method||options.method==='GET')return user?response(user):response({},404);if(options.method==='DELETE'){for(const [key,value] of users)if(value.id===u.pathname.split('/').at(-1))users.delete(key);return response({});}if(user)user.banned_until=body.ban_duration==='none'?null:'2099-01-01T00:00:00Z';return response({});}
  if(u.pathname.endsWith('/logout'))return response({});
  if(u.pathname.endsWith('/user')){const user=users.get(token);if(!user)return response({},401);if(options.method==='PUT')user.user_metadata={...user.user_metadata,...body.data};return response(user);}
  return response({},404);
 };
 const api=createAccountApi({config,fetcher:provider});
 const server=createServer(async(req,res)=>{const u=new URL(req.url,'http://localhost');if(await api.handle(req,res,u.pathname,u.searchParams))return;if(serve)return serve(req,res,u);res.writeHead(404);res.end();});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;config.origin=origin;
 return {server,origin,users,calls,config,close:()=>new Promise(r=>server.close(r)),request:async(path,{body,cookie,origin:requestOrigin=origin,method}={})=>fetch(origin+'/api/account/'+path,{method:method||(body===undefined?'GET':'POST'),headers:{...(cookie?{cookie}:{}),...(body!==undefined?{'content-type':'application/json',origin:requestOrigin}:{}),...(method==='POST'?{origin:requestOrigin}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})})};
}
