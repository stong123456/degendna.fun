// No analytics, third-party scripts, storage, or access to personal assessment records.
const query=new URLSearchParams(location.search),fragment=new URLSearchParams(location.hash.slice(1));
const code=query.get('code'),accessToken=fragment.get('access_token'),refreshToken=fragment.get('refresh_token');
const errorCode=query.get('error_code')||fragment.get('error_code'),failed=query.has('error')||fragment.has('error');
history.replaceState(null,'','/auth/callback.html');
const status=document.getElementById('status');
if(failed){status.textContent=errorCode==='otp_expired'?'邮件链接已过期或已被使用。请返回账号页重新申请，只打开最新邮件一次。':'邮件服务未完成验证，请返回账号页重新申请登录链接。';}
else if(!code&&!(accessToken&&refreshToken)){
  try{const r=await fetch('/api/account/me',{credentials:'same-origin'}),d=await r.json();if(r.ok&&d.user)location.replace('/?page=account');else status.textContent='当前地址没有登录凭证。请从最新邮件打开完整链接，不要只打开或刷新回调地址。';}catch{status.textContent='暂时无法读取登录状态，请返回账号页重试。';}
}else{try{const r=await fetch('/api/account/callback',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(code?{code}:{accessToken,refreshToken})});const d=await r.json();if(!r.ok)throw Error(d.error||'暂时无法完成登录。');status.textContent='登录成功，正在返回账号页…';location.replace('/?page=account');}catch(e){status.textContent=e.message;}}
