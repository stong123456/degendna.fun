import { readFile,writeFile,mkdir,readdir,rm,cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve,join,relative } from 'node:path';
import { assessments } from '../public/mental-lab/src/assessments.js';
import { insightVersion } from '../public/mental-lab/src/result-insights.js';
import { stateRuleVersion } from '../public/mental-lab/src/current-state.js';
const root=resolve(new URL('..',import.meta.url).pathname), mode=process.argv.includes('--deweb')?'deweb':'web';
const hash=b=>createHash('sha256').update(b).digest('hex');
const publicRoot=join(root,'public');
const target=mode==='deweb'?join(root,'dist/deweb'):publicRoot;
if(mode==='deweb'){await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});await cp(join(publicRoot,'index.html'),join(target,'index.html'));await cp(join(publicRoot,'mental-lab'),join(target,'mental-lab'),{recursive:true});const p=join(target,'mental-lab/src/build-mode.js');await writeFile(p,(await readFile(p,'utf8')).replace("mode: 'web'","mode: 'deweb'"));}
async function walk(dir){let rows=[];for(const e of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const p=join(dir,e.name);if(e.isDirectory())rows.push(...await walk(p));else if(e.isFile())rows.push(p);}return rows;}
const paths=[join(target,'index.html'),...await walk(join(target,'mental-lab'))];
const files=[];for(const p of paths){const b=await readFile(p);if(!/\.(?:html|js|css|png)$/.test(p)&&!p.endsWith('/vendor/lucide-LICENSE'))throw Error('Unexpected public release file: '+p);if(b.length>8400000)throw Error('File exceeds TapeKit limit: '+p);files.push({path:'/'+relative(target,p).replaceAll('\\','/'),bytes:b.length,sha256:hash(b)});}
const sourceRevision='public-files:'+hash(JSON.stringify(files));
const data={format:'degendna-public-release-v1',mode,sourceRevision,interpretationVersion:insightVersion,typeVersion:'types-20261016-v2',stateVersion:stateRuleVersion,modules:assessments.filter(a=>!a.safetyOnly).map(a=>({id:a.id,title:a.title,version:a.version,scope:a.scope})),files};
const releaseId=hash(JSON.stringify(data));await mkdir(join(target,'release'),{recursive:true});await writeFile(join(target,'release/manifest.json'),JSON.stringify({...data,releaseId},null,2)+'\n');
await writeFile(join(target,'release/deployment.json'),JSON.stringify({format:'degendna-tapeout-deployment-v1',status:'not-published',chainId:196,sourceReleaseId:releaseId,deployments:[]},null,2)+'\n');
console.log(JSON.stringify({mode,releaseId,files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),target}));
