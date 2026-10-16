// Dedicated callback: no analytics, third-party scripts, or access to personal records.
const params=new URLSearchParams(location.search),code=params.get('code'),failed=params.has('error')||location.hash.includes('error');
history.replaceState(null,'','/auth/callback.html');
const status=document.getElementById('status');
if(failed||!code){status.textContent='登录链接无效或已过期，请返回账号页重新申请。';}
else{try{const r=await fetch('/api/account/callback',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({code})});const d=await r.json();if(!r.ok)throw Error(d.error||'暂时无法完成登录。');status.textContent='登录成功，正在返回账号页…';location.replace('/?page=account');}catch(e){status.textContent=e.message;}}
