// Produces an unsigned, public-file upload inventory. No keys, RPC or transactions.
import {readFile,writeFile,mkdir,readdir,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,join,relative,extname} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../..',import.meta.url)),args=process.argv.slice(2);
const dir=resolve(args.includes('--directory')?args[args.indexOf('--directory')+1]:join(root,'dist/deweb'));
const output=resolve(args.includes('--output')?args[args.indexOf('--output')+1]:join(root,'docs/accelerator/upload-plan.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const releaseDir=args.includes('--release-dir')?args[args.indexOf('--release-dir')+1]:'release';
if(!/^release(?:\/v[0-9]{8}-[a-z0-9-]{1,32})?$/.test(releaseDir))throw Error('Invalid release directory');
const manifest=JSON.parse(await readFile(join(dir,releaseDir,'manifest.json'),'utf8')),{releaseId,...payload}=manifest;
if(manifest.mode!=='deweb'||manifest.format!=='degendna-public-release-v1'||hash(JSON.stringify(payload))!==releaseId)throw Error('Expected intact DeWEB build');
const allowed=new Map(manifest.files.map(f=>[f.path.slice(1),f]));
allowed.set(releaseDir+'/manifest.json',null);allowed.set(releaseDir+'/deployment.json',null);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.ico':'image/x-icon'};
async function walk(directory){let out=[];for(const entry of await readdir(directory)){const p=join(directory,entry),s=await lstat(p);if(s.isSymbolicLink())throw Error('No symbolic links');if(s.isDirectory())out.push(...await walk(p));else if(s.isFile())out.push(p);else throw Error('Unsupported file');}return out;}
const files=[];for(const path of (await walk(dir)).sort()){const name=relative(dir,path).replaceAll('\\','/');if(!allowed.has(name)||name.startsWith('/')||name.split('/').some(p=>p==='.'||p==='..')||name!==name.normalize('NFC'))throw Error('Unexpected public path: '+name);const bytes=await readFile(path),f=allowed.get(name);if(bytes.length>8400000||f&&(f.bytes!==bytes.length||f.sha256!==hash(bytes)))throw Error('Changed or oversized file: '+name);const contentType=types[extname(name)]||(/^mental-lab\/(?:v[0-9]{8}-[a-z0-9-]{1,32}\/)?vendor\/lucide-LICENSE$/.test(name)?'text/plain; charset=utf-8':null);if(!contentType)throw Error('Unknown MIME type');files.push({path:name,contentType,bytes:bytes.length,sha256:hash(bytes),chunks:Math.max(1,Math.ceil(bytes.length/24000))});}
if(files.length!==allowed.size)throw Error('Missing public file');
const plan={format:'degendna-unsigned-upload-plan-v1',chainId:196,releaseId,chunkBytes:24000,fallback:'index.html',status:'ready-not-published',transactionsSent:0,totalBytes:files.reduce((n,f)=>n+f.bytes,0),fileCount:files.length,chunkWrites:files.reduce((n,f)=>n+f.chunks,0),fees:'Not estimated; user must review current chain-196 wallet estimates before signing',files};
await mkdir(resolve(output,'..'),{recursive:true});await writeFile(output,JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({status:plan.status,files:plan.fileCount,bytes:plan.totalBytes,chunkWrites:plan.chunkWrites,transactionsSent:0}));
