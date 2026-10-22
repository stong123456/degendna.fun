import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
test('DeWEB build is reproducible, complete, and contains no account secrets or identity API',async()=>{
 execFileSync(process.execPath,['scripts/build-public-release.mjs','--deweb']);const a=await readFile('dist/deweb/release/manifest.json','utf8');execFileSync(process.execPath,['scripts/build-public-release.mjs','--deweb']);assert.equal(await readFile('dist/deweb/release/manifest.json','utf8'),a);const m=JSON.parse(a),{releaseId,...payload}=m;assert.equal(releaseId,hash(JSON.stringify(payload)));assert.equal(m.modules.length,18);assert.equal(m.mode,'deweb');assert.ok(m.files.some(f=>f.path==='/favicon.ico'));assert.ok(m.files.some(f=>f.path.endsWith('/apple-touch-icon.png')));assert.ok(m.files.length>20);assert.ok(!m.files.some(f=>/\/(garden|prism|night)\.png$/.test(f.path)));assert.ok(m.files.reduce((n,f)=>n+f.bytes,0)<1000000);for(const file of m.files){assert.ok(!file.path.includes('..'));const b=await readFile('dist/deweb'+file.path);assert.equal(b.length,file.bytes);assert.equal(hash(b),file.sha256);assert.ok(file.bytes<=8400000);}
 const build=await readFile('dist/deweb/mental-lab/src/build-mode.js','utf8');assert.ok(build.includes("mode: 'deweb'"));const receipt=JSON.parse(await readFile('dist/deweb/release/deployment.json','utf8'));assert.equal(receipt.status,'not-published');assert.equal(receipt.deployments.length,0);
 await assert.rejects(readFile('dist/deweb/account-api.mjs'));await assert.rejects(readFile('dist/deweb/.env'));await assert.rejects(readFile('dist/deweb/server.mjs'));
});

test('unsigned upload plan includes exact public bytes and rejects a changed release before publishing',async()=>{
 const {mkdtemp,cp,rm,writeFile}=await import('node:fs/promises');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const temp=await mkdtemp(join(tmpdir(),'degendna-upload-'));
 try{await cp('dist/deweb',join(temp,'site'),{recursive:true});execFileSync(process.execPath,['scripts/tapeout/prepare-upload.mjs','--directory',join(temp,'site'),'--output',join(temp,'plan.json')]);const plan=JSON.parse(await readFile(join(temp,'plan.json'),'utf8'));assert.equal(plan.chainId,196);assert.equal(plan.transactionsSent,0);assert.equal(plan.status,'ready-not-published');assert.equal(plan.fallback,'index.html');assert.ok(plan.files.some(f=>f.path==='release/manifest.json'));assert.ok(plan.files.every(f=>!f.path.startsWith('/')&&f.chunks>=1&&f.contentType));
 await writeFile(join(temp,'site/index.html'),'tampered');assert.throws(()=>execFileSync(process.execPath,['scripts/tapeout/prepare-upload.mjs','--directory',join(temp,'site'),'--output',join(temp,'bad-plan.json')],{stdio:'pipe'}));
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('chain verifier rejects non-executable MIME types even when public file bytes match',async()=>{
 const {allowedContentType}=await import('../scripts/tapeout/file-types.mjs');
 assert.equal(allowedContentType('index.html','text/html; charset=utf-8'),true);
 assert.equal(allowedContentType('mental-lab/src/app.js','application/javascript'),true);
 assert.equal(allowedContentType('mental-lab/src/app.js','text/javascript; charset=utf-8'),true);
 assert.equal(allowedContentType('mental-lab/vendor/lucide-LICENSE','application/octet-stream'),true);
 assert.equal(allowedContentType('mental-lab/vendor/lucide-LICENSE','text/html'),false);
 assert.equal(allowedContentType('favicon.ico','application/octet-stream'),true);
 assert.equal(allowedContentType('favicon.ico','text/html'),false);
 assert.equal(allowedContentType('index.html','application/octet-stream'),false);
 assert.equal(allowedContentType('mental-lab/src/app.js','text/plain'),false);
 assert.equal(allowedContentType('unknown.exe','application/octet-stream'),false);
 assert.equal(allowedContentType('mental-lab/v20261022-plain3/vendor/lucide-LICENSE','application/octet-stream'),true);
});

test('versioned DeWEB resources preserve old paths and switch one small entry',async()=>{
 const namespace='v20261022-plain3',releaseDir=`release/${namespace}`;
 execFileSync(process.execPath,['scripts/build-public-release.mjs','--deweb','--namespace',namespace]);
 const manifestPath=`dist/deweb/${releaseDir}/manifest.json`,first=await readFile(manifestPath,'utf8'),m=JSON.parse(first);
 execFileSync(process.execPath,['scripts/build-public-release.mjs','--deweb','--namespace',namespace]);assert.equal(await readFile(manifestPath,'utf8'),first);
 assert.equal(m.releaseDirectory,releaseDir);assert.ok(m.files.every(f=>['/index.html','/favicon.ico'].includes(f.path)||f.path.startsWith(`/mental-lab/${namespace}/`)));
 const index=await readFile('dist/deweb/index.html','utf8');assert.ok(index.includes(`/mental-lab/${namespace}/src/app.js`));assert.ok(Buffer.byteLength(index)<24000);
 const version=await readFile(`dist/deweb/mental-lab/${namespace}/src/version.js`,'utf8');assert.ok(version.includes(`/${releaseDir}/manifest.json`));assert.ok(version.includes(`/${releaseDir}/deployment.json`));
 for(const f of m.files){const b=await readFile('dist/deweb'+f.path);assert.equal(hash(b),f.sha256);}
 const {mkdtemp,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path'),temp=await mkdtemp(join(tmpdir(),'versioned-deweb-'));
 try{execFileSync(process.execPath,['scripts/tapeout/prepare-upload.mjs','--directory','dist/deweb','--release-dir',releaseDir,'--output',join(temp,'plan.json')]);const plan=JSON.parse(await readFile(join(temp,'plan.json'),'utf8'));assert.equal(plan.fileCount,m.files.length+2);assert.ok(plan.files.some(f=>f.path===`${releaseDir}/manifest.json`));assert.ok(!plan.files.some(f=>f.path==='release/deployment.json'));}finally{await rm(temp,{recursive:true,force:true});}
});
