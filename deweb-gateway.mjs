// A single-site, read-only gateway. It never signs, proxies arbitrary URLs or handles accounts.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Interface} from 'ethers';
import {agreedBlock} from './scripts/tapeout/rpc-agreement.mjs';
import {allowedContentType} from './scripts/tapeout/file-types.mjs';
const protocol=JSON.parse(await readFile(new URL('./scripts/tapeout/xlayer-config.json',import.meta.url),'utf8'));
export const published=Object.freeze({"container":"0x07e0c049a3f1ba08fb5de8ab76369cd053af2e11","name":"4.2.101.tape","block":"0x4679e2e","blockHash":"0xd7b69e589fca0307b1cfef5725e843eada348d3683f40f8f0fc40b505401c1ff","releaseId":"1a99470e00f6767600c8e7b4072e18c748aa26abf76536febccb6edc8938fe75","releaseDirectory":"release/v20261022-plain3","fileCount":26});
const hash=b=>createHash('sha256').update(b).digest('hex');
const abi=new Interface(['function fileInfo(address,string) view returns(uint256,string,bytes32,uint256,uint256)','function readRange(address,string,uint256,uint256) view returns(bytes)','function isContainerLive(address) view returns(bool)']);
const slot='0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
export async function publicRpc(url,method,params){
 for(let n=0;n<3;n++)try{const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('RPC HTTP failure');const text=await r.text();if(text.length>2500000)throw Error('RPC response too large');const data=JSON.parse(text);if(data.error||data.result===undefined)throw Error('RPC failure');return data.result;}catch(e){if(n===2)throw e;}
}
export function createChainReader(rpc=publicRpc,publication=published){
 if(!/^release(?:\/v[0-9]{8}-[a-z0-9-]{1,32})?$/.test(publication.releaseDirectory||'release')||!Number.isInteger(publication.fileCount||25)||(publication.fileCount||25)<1||(publication.fileCount||25)>128)throw Error('Invalid pinned release configuration');
 async function agree(method,params){const rows=await Promise.all(protocol.rpcs.map(url=>rpc(url,method,params)));if(method==='eth_getBlockByNumber')return agreedBlock(rows,params[0]);if(JSON.stringify(rows[0])!==JSON.stringify(rows[1]))throw Error('Independent RPC disagreement');return rows[0];}
 async function implementation(name,block){const value=await agree('eth_getStorageAt',[protocol[name],slot,block]);if(('0x'+value.slice(-40)).toLowerCase()!==protocol.implementations[name])throw Error('Protocol implementation changed');}
 async function call(address,method,args,block){const value=await agree('eth_call',[{to:address,data:abi.encodeFunctionData(method,args)},block]);return abi.decodeFunctionResult(method,value);}
 async function gate(){
  const chainIds=await Promise.all(protocol.rpcs.map(url=>rpc(url,'eth_chainId',[])));if(!chainIds.every(id=>Number(id)===196))throw Error('Wrong chain');
  const safe=await Promise.all(protocol.rpcs.map(url=>rpc(url,'eth_getBlockByNumber',['safe',false])));if(!safe.every(header=>header&&/^0x[0-9a-f]+$/i.test(header.number)&&BigInt(header.number)>=BigInt(publication.block)))throw Error('Safe height unavailable');
  const block='0x'+safe.map(h=>BigInt(h.number)).reduce((a,b)=>a<b?a:b).toString(16);await agree('eth_getBlockByNumber',[block,false]);
  for(const name of ['binding','registry'])await implementation(name,block);
  const [active]=await call(protocol.binding,'isContainerLive',[publication.container],block);if(!active)throw Error('Container name is not activated');
  return {activationVerified:true,activationBlock:block};
 }
 async function snapshot(){
  const header=await agree('eth_getBlockByNumber',[publication.block,false]);if(header.hash.toLowerCase()!==publication.blockHash)throw Error('Published snapshot block changed');
  const current=await gate();
  await implementation('registry',publication.block);
  async function read(path,expected,block=publication.block){
   const info=await call(protocol.registry,'fileInfo',[publication.container,path],block),size=Number(info[0]);
   if(!Number.isSafeInteger(size)||size<=0||size>1000000||!Number(info[4])||!allowedContentType(path,info[1]))throw Error('Invalid file metadata');
   if(expected&&(size!==expected.bytes||info[2].slice(2)!==expected.sha256))throw Error('Published metadata mismatch');
   const chunks=[];for(let offset=0;offset<size;offset+=96000){const [data]=await call(protocol.registry,'readRange',[publication.container,path,offset,Math.min(96000,size-offset)],block);chunks.push(Buffer.from(data.slice(2),'hex'));}
   const bytes=Buffer.concat(chunks);if(bytes.length!==size||hash(bytes)!==info[2].slice(2))throw Error('Published bytes mismatch');return {bytes,type:info[1]};
  }
  const manifestFile=await read((publication.releaseDirectory||'release')+'/manifest.json'),manifest=JSON.parse(manifestFile.bytes.toString('utf8')),{releaseId,...payload}=manifest;
  if(releaseId!==publication.releaseId||hash(JSON.stringify(payload))!==releaseId||manifest.mode!=='deweb'||manifest.format!=='degendna-public-release-v1'||!Array.isArray(manifest.files)||manifest.files.length!==(publication.fileCount||25))throw Error('Unexpected published release');
  const paths=new Set(),files=new Map([['/'+(publication.releaseDirectory||'release')+'/manifest.json',manifestFile]]);let total=0;
  for(const row of manifest.files){if(!/^\/(?:index\.html|favicon\.ico|mental-lab\/[a-zA-Z0-9_./-]+\.(?:js|css|png)|mental-lab\/(?:v[0-9]{8}-[a-z0-9-]{1,32}\/)?vendor\/lucide-LICENSE)$/.test(row.path)||row.path.includes('..')||paths.has(row.path)||!Number.isSafeInteger(row.bytes)||row.bytes<1||!/^[0-9a-f]{64}$/.test(row.sha256))throw Error('Invalid manifest path');paths.add(row.path);total+=row.bytes;}
  if(total>1000000||!paths.has('/index.html'))throw Error('Unexpected release size');
  let next=0;await Promise.all(Array.from({length:2},async()=>{while(next<manifest.files.length){const row=manifest.files[next++];files.set(row.path,await read(row.path.slice(1),row));}}));
  // The receipt is a later public attestation; core bytes remain pinned to the original snapshot.
  const receiptFile=await read((publication.releaseDirectory||'release')+'/deployment.json',null,current.activationBlock),receipt=JSON.parse(receiptFile.bytes.toString('utf8'));
  if(receipt.format!=='degendna-tapeout-deployment-v1'||receipt.status!=='verified'||receipt.chainId!==196||receipt.sourceReleaseId!==publication.releaseId||!receipt.deployments?.some(d=>d.container.toLowerCase()===publication.container&&d.files?.length===manifest.files.length&&manifest.files.every(f=>d.files.some(v=>v.path===f.path&&v.sha256===f.sha256&&v.bytes===f.bytes&&v.status==='verified'))))throw Error('Verified publication receipt unavailable');
  files.set('/'+(publication.releaseDirectory||'release')+'/deployment.json',receiptFile);
  const end=await agree('eth_getBlockByNumber',[publication.block,false]);if(end.hash.toLowerCase()!==publication.blockHash)throw Error('Snapshot changed during read');return files;
 }
 return {gate,snapshot};
}
export function createDewebGateway({host=process.env.DEWEB_GATEWAY_HOST||'',reader=createChainReader(),now=Date.now}={}){
 let files=null,loading=null,lastAttempt=0,lastGate=0,gateResult=null,gateLoading=null,lastError='Not initialized';
 async function active(){if(gateResult&&now()-lastGate<30000)return gateResult;if(!gateLoading)gateLoading=reader.gate().then(value=>{gateResult=value;lastGate=now();return value;}).catch(e=>{gateResult=null;throw e;}).finally(()=>{gateLoading=null;});return gateLoading;}
 function warm(){if(!loading&&(!lastAttempt||now()-lastAttempt>=30000)){lastAttempt=now();loading=(async()=>{await active();files=await reader.snapshot();lastError='';})().catch(()=>{lastError='Chain verification unavailable or name inactive';}).finally(()=>{loading=null;});}return loading;}
 const headers={'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','cross-origin-opener-policy':'same-origin','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",'permissions-policy':'camera=(), microphone=(), geolocation=()'};
 async function handle(req,res,pathname){
  if(!host||String(req.headers.host||'').toLowerCase()!==host.toLowerCase())return false;
  const send=(code,type,body,extra={})=>{res.writeHead(code,{...headers,'content-type':type,...extra});res.end(req.method==='HEAD'?undefined:body);};
  if(!['GET','HEAD'].includes(req.method)){send(405,'text/plain; charset=utf-8','Read-only gateway',{'allow':'GET, HEAD'});return true;}
  if(pathname.startsWith('/api/')||pathname.startsWith('/auth/')||pathname.startsWith('/xiaojing/')){send(404,'text/plain; charset=utf-8','Accounts and AI are available only at https://degendna.fun/');return true;}
  let activeNow=false;try{await active();activeNow=true;}catch{lastError='Chain verification unavailable or name inactive';}
  if(pathname==='/.tape/status'){send(200,'application/json',JSON.stringify({format:'degendna-read-only-gateway-v1',...published,chainId:196,ready:!!files&&activeNow,activationVerified:activeNow,verification:'Two RPCs; fixed safe-covered snapshot; byte-identical responses; server verification is not trustless browser verification',files:files?.size||0,error:lastError,personalData:'No account API. Local records belong to this origin only.'}));return true;}
  if(!activeNow||!files){warm();send(503,'text/html; charset=utf-8','<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>DegenDNA 链上读取</title><h1>正在核对链上公开版本</h1><p>核验通过且名字激活后才会展示内容。首次读取可能需要数分钟。</p><p><a href="/">重新检查</a> · <a href="https://degendna.fun/" rel="noreferrer">使用正式网站</a> · <a href="/.tape/status">读取状态</a></p>',{'retry-after':'15'});return true;}
  const path=pathname==='/'?'/index.html':pathname,file=files.get(path);
  if(!file){send(404,'text/plain; charset=utf-8','File not in verified release');return true;}
  send(200,file.type,file.bytes,{'x-degendna-release':published.releaseId,'x-degendna-block':published.block,'content-length':String(file.bytes.length)});return true;
 }
 return {handle,warm};
}
