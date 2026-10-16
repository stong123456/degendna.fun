import test from 'node:test';import assert from 'node:assert/strict';
import { accountConfig } from '../account-api.mjs';import { accountFixture,USER } from './account-fixture.mjs';
const cookie='ddna-access=user-token',admin='ddna-access=admin-token';
async function fixture(t,options){const f=await accountFixture(options);t.after(f.close);return f;}
test('configuration fails closed and never accepts server keys as public login keys',()=>{
 const jwt=role=>'x.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.x';
 for(const key of ['',jwt('service_role'),'sb_secret_example'])assert.equal(accountConfig({SUPABASE_AUTH_URL:'https://test.supabase.co',SUPABASE_AUTH_PUBLISHABLE_KEY:key}).ready,false);
 for(const url of ['http://test.supabase.co','https://test.supabase.co/evil','https://user:pass@test.supabase.co','https://test.supabase.co.evil.test'])assert.equal(accountConfig({SUPABASE_AUTH_URL:url,SUPABASE_AUTH_PUBLISHABLE_KEY:jwt('anon')}).ready,false);
 assert.equal(accountConfig({SUPABASE_AUTH_URL:'https://test.supabase.co',SUPABASE_AUTH_PUBLISHABLE_KEY:jwt('anon')}).ready,true);
});
test('disabled registration reports unavailable and makes no identity-provider call',async t=>{
 const f=await fixture(t,{enabled:false});assert.equal((await(await f.request('status')).json()).ready,false);assert.equal((await f.request('send',{body:{email:'tester@example.test',consent:true}})).status,503);assert.equal(f.calls.length,0);
});
test('verified OTP creates only HttpOnly session cookies, no token in response',async t=>{
 const f=await fixture(t);const r=await f.request('verify',{body:{email:' TESTER@example.test ',code:'123456'}});assert.equal(r.status,200);const data=await r.json();assert.equal(data.user.id,USER);assert.equal(data.user.isAdmin,false);assert.ok(!JSON.stringify(data).includes('token'));const cookies=r.headers.getSetCookie();assert.equal(cookies.length,2);assert.ok(cookies.every(c=>c.includes('HttpOnly')&&c.includes('SameSite=Lax')));
 const me=await(await f.request('me',{cookie})).json();assert.equal(me.user.id,USER);
});
test('production cookies use Host prefix and Secure',async t=>{
 const f=await fixture(t,{production:true});const r=await f.request('verify',{body:{email:'tester@example.test',code:'123456'}});assert.ok(r.headers.getSetCookie().every(c=>c.startsWith('__Host-ddna-')&&c.includes('Secure')&&c.includes('Path=/')));
});
test('invalid OTP, forged identity headers, mismatched email and foreign origins never authenticate',async t=>{
 const f=await fixture(t);assert.equal((await f.request('verify',{body:{email:'tester@example.test',code:'999999'}})).status,401);assert.equal((await f.request('verify',{body:{email:'other@example.test',code:'123456'}})).status,401);assert.equal((await f.request('verify',{body:{email:'tester@example.test',code:'123456'},origin:'https://evil.test'})).status,403);const r=await fetch(f.origin+'/api/account/me',{headers:{'x-user-id':USER,'x-user-email':'tester@example.test'}});assert.equal((await r.json()).user,null);
});
test('consent, fields, body and resend rate limits are enforced server-side',async t=>{
 const f=await fixture(t);assert.equal((await f.request('send',{body:{email:'tester@example.test'}})).status,400);assert.equal((await f.request('send',{body:{email:'tester@example.test',consent:true,answers:{secret:4}}})).status,400);assert.equal((await f.request('send',{body:{email:'tester@example.test',consent:true}})).status,200);assert.equal((await f.request('send',{body:{email:'tester@example.test',consent:true}})).status,429);assert.equal(f.calls.filter(c=>new URL(c.url).pathname.endsWith('/otp')).length,1);
});
test('profile supports only nickname and cannot elevate metadata roles',async t=>{
 const f=await fixture(t);assert.equal((await f.request('profile',{body:{nickname:'new',role:'admin'},cookie})).status,400);const r=await f.request('profile',{body:{nickname:'新的昵称'},cookie});assert.equal((await r.json()).user.nickname,'新的昵称');assert.equal((await f.request('users',{cookie})).status,403);
});
test('administrator must be allowlisted; user listing is paginated and excludes private data',async t=>{
 const f=await fixture(t);assert.equal((await f.request('users')).status,401);const r=await f.request('users',{cookie:admin});assert.equal(r.status,200);const d=await r.json();assert.equal(d.users.length,2);assert.ok(d.users.every(u=>!('user_metadata'in u)&&!('answers'in u)));assert.equal((await f.request('users?page=-1',{cookie:admin})).status,400);
});
test('access changes cannot target administrators, and suspended users are rejected',async t=>{
 const f=await fixture(t);assert.equal((await f.request('access',{cookie,body:{userId:USER,suspend:true}})).status,403);assert.equal((await f.request('access',{cookie:admin,body:{userId:'22222222-2222-4222-8222-222222222222',suspend:true}})).status,400);assert.equal((await f.request('access',{cookie:admin,body:{userId:USER,suspend:true}})).status,200);assert.equal((await f.request('profile',{cookie,body:{nickname:'blocked'}})).status,401);assert.equal((await f.request('access',{cookie:admin,body:{userId:USER,suspend:false}})).status,200);
});
test('refresh is verified remotely and rotated; logout clears both cookies',async t=>{
 const f=await fixture(t);const r=await f.request('me',{cookie:'ddna-refresh=refresh-token'});assert.equal((await r.json()).user.id,USER);assert.ok(r.headers.getSetCookie().some(c=>c.includes('rotated-token')));const out=await f.request('logout',{body:{},cookie});assert.equal(out.status,200);assert.ok(out.headers.getSetCookie().every(c=>c.includes('Max-Age=0')));
});
test('account deletion requires fresh email-link login and explicit confirmation',async t=>{
 const f=await fixture(t);assert.equal((await f.request('delete',{cookie,body:{confirmation:'DELETE'}})).status,401);
 const sent=await f.request('send',{body:{email:'tester@example.test',consent:true}});const pkce=sent.headers.getSetCookie().find(c=>c.startsWith('ddna-pkce=')).split(';')[0];
 const login=await f.request('callback',{cookie:pkce,body:{code:'valid-link'}});assert.equal(login.status,200);const reauth=login.headers.getSetCookie().find(c=>c.startsWith('ddna-reauth=')).split(';')[0];
 assert.equal((await f.request('delete',{cookie:cookie+'; '+reauth,body:{confirmation:'no'}})).status,400);
 assert.equal((await f.request('delete',{cookie:admin,body:{confirmation:'DELETE'}})).status,400);
 const r=await f.request('delete',{cookie:cookie+'; '+reauth,body:{confirmation:'DELETE'}});assert.equal(r.status,200);assert.ok(r.headers.getSetCookie().every(c=>c.includes('Max-Age=0')));assert.equal((await(await f.request('me',{cookie})).json()).user,null);
});


test('modern secret admin keys use apikey only and remain server-only',async t=>{
 const modern=['sb','secret','synthetic','server','key','1234567890'].join('_');assert.equal(accountConfig({SUPABASE_AUTH_SERVICE_ROLE_KEY:modern}).adminReady,true);const f=await fixture(t);f.config.admin=modern;const r=await f.request('users',{cookie:admin});assert.equal(r.status,200);const adminCalls=f.calls.filter(c=>c.url.includes('/admin/'));assert.ok(adminCalls.length>0);assert.ok(adminCalls.every(c=>c.options.headers.apikey===modern&&!c.options.headers.authorization));assert.ok(!JSON.stringify(await r.json()).includes(modern));
});

test('email links use PKCE and a fixed callback; missing, expired and cross-origin callbacks fail closed',async t=>{
 const f=await fixture(t);const sent=await f.request('send',{body:{email:'tester@example.test',consent:true}});const pkce=sent.headers.getSetCookie()[0].split(';')[0];const upstream=f.calls.find(c=>new URL(c.url).pathname.endsWith('/otp'));assert.equal(new URL(upstream.url).searchParams.get('redirect_to'),f.origin+'/auth/callback.html');const payload=JSON.parse(upstream.options.body);assert.equal(payload.code_challenge_method,'s256');assert.ok(payload.code_challenge);assert.ok(!JSON.stringify(payload).includes(decodeURIComponent(pkce.split('=')[1])));
 assert.equal((await f.request('callback',{body:{code:'valid-link'}})).status,401);assert.equal((await f.request('callback',{cookie:pkce,body:{code:'expired'}})).status,401);assert.equal((await f.request('callback',{cookie:pkce,origin:'https://evil.test',body:{code:'valid-link'}})).status,403);
 const r=await f.request('callback',{cookie:pkce,body:{code:'valid-link'}});assert.equal(r.status,200);assert.ok(!JSON.stringify(await r.json()).includes('token'));assert.ok(r.headers.getSetCookie().some(c=>c.startsWith('ddna-pkce=;')&&c.includes('Max-Age=0')));
});

test('fragment-session callback requires signed browser request, matching email, and verified token rotation',async t=>{
 const f=await fixture(t);const sent=await f.request('send',{body:{email:'tester@example.test',consent:true}});const cookies=sent.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 assert.equal((await f.request('callback',{cookie:'ddna-pkce='+ 'a'.repeat(64),body:{accessToken:'user-token',refreshToken:'refresh-token'}})).status,401);
 assert.equal((await f.request('callback',{cookie:cookies,body:{accessToken:'admin-token',refreshToken:'refresh-token'}})).status,401);
 const ok=await f.request('callback',{cookie:cookies,body:{accessToken:'user-token',refreshToken:'refresh-token'}});assert.equal(ok.status,200);assert.equal((await ok.json()).user.id,USER);assert.ok(ok.headers.getSetCookie().some(c=>c.startsWith('ddna-pending=;')&&c.includes('Max-Age=0')));
});
