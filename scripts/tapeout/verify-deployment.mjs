// Read-only verification. Never requests a key, signs a transaction or uploads user data.
import { readFile,writeFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';import {promisify} from 'node:util';
import { Interface,getAddress } from 'ethers';
import {allowedContentType} from './file-types.mjs';
const exec=promisify(execFile),root=resolve(new URL('../..',import.meta.url).pathname);
const args=process.argv.slice(2);const value=name=>args[args.indexOf(name)+1];
if(!args.includes('--processor-index')||!args.includes('--circuit-id'))throw Error('Use --processor-index <number> --circuit-id <positive number>. No wallet key is used.');
const index=value('--processor-index'),id=value('--circuit-id');if(!/^(0|[1-9]\d*)$/.test(index)||!/^([1-9]\d*)$/.test(id))throw Error('Invalid processor or circuit ID');
const dir=resolve(args.includes('--directory')?value('--directory'):join(root,'dist/deweb'));
const manifest=JSON.parse(await readFile(join(dir,'release/manifest.json'),'utf8'));
const {releaseId,...payload}=manifest,hash=b=>createHash('sha256').update(b).digest('hex');if(releaseId!==hash(JSON.stringify(payload))||manifest.mode!=='deweb')throw Error('Use an intact DeWEB release manifest');
const cfg=JSON.parse(await readFile(new URL('./xlayer-config.json',import.meta.url),'utf8'));
const abi=new Interface(['function cpuAt(uint256) view returns(address)','function accountOf(address,uint256) view returns(address)','function ownerOf(uint256) view returns(address)','function isOpened(address,uint256) view returns(bool)','function isContainerLive(address) view returns(bool)','function fileInfo(address,string) view returns(uint256 size,string contentType,bytes32 sha256Hash,uint256 updatedAt,uint256 chunkCount)','function read(address,string) view returns(bytes)','function readRange(address,string,uint256,uint256) view returns(bytes)']);
async function rpc(url,method,params=[]){const {stdout}=await exec('curl',['--silent','--show-error','--fail','--max-time','20','--retry','2','--retry-all-errors','--header','Content-Type: application/json','--data',JSON.stringify({jsonrpc:'2.0',id:1,method,params}),url],{maxBuffer:3e6});const d=JSON.parse(stdout);if(d.error||d.result===undefined)throw Error('RPC failed: '+method);return d.result;}
async function agreed(method,params){const r=await Promise.all(cfg.rpcs.map(url=>rpc(url,method,params)));if(JSON.stringify(r[0])!==JSON.stringify(r[1]))throw Error('Independent RPC disagreement: '+method);return r[0];}
const chains=await Promise.all(cfg.rpcs.map(url=>rpc(url,'eth_chainId')));if(!chains.every(c=>Number(c)===196))throw Error('Wrong chain');
const heights=await Promise.all(cfg.rpcs.map(url=>rpc(url,'eth_blockNumber'))),block='0x'+(Math.min(...heights.map(Number))-2).toString(16),header=await agreed('eth_getBlockByNumber',[block,false]);
const slot='0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
for(const name of ['registry','binding']){const impl=await agreed('eth_getStorageAt',[cfg[name],slot,block]);if(('0x'+impl.slice(-40)).toLowerCase()!==cfg.implementations[name].toLowerCase())throw Error('Protocol implementation changed; review before continuing');}
async function call(address,method,values){const data=abi.encodeFunctionData(method,values),raw=await agreed('eth_call',[{to:address,data},block]);return abi.decodeFunctionResult(method,raw);}
const [processor]=await call(cfg.factory,'cpuAt',[index]);const [container]=await call(cfg.opener,'accountOf',[processor,id]);const [owner]=await call(processor,'ownerOf',[id]);const [opened]=await call(cfg.opener,'isOpened',[processor,id]);if(!opened)throw Error('Container has not been opened');const [live]=await call(cfg.binding,'isContainerLive',[container]);if(!live)throw Error('Container not activated according to current binding');
const files=[];
for(const file of manifest.files){if(!/^\/(?:index\.html|favicon\.ico|mental-lab\/[a-zA-Z0-9_./-]+\.(?:js|css|png)|mental-lab\/vendor\/lucide-LICENSE)$/.test(file.path)||file.path.includes('..'))throw Error('Unexpected release path');
 const storePath=file.path.slice(1);
 const local=await readFile(join(dir,storePath));if(hash(local)!==file.sha256||local.length!==file.bytes)throw Error('Local file changed: '+file.path);
 const info=await call(cfg.registry,'fileInfo',[container,storePath]);if(!allowedContentType(storePath,info[1])||Number(info[0])!==file.bytes||info[2].slice(2)!==file.sha256||Number(info[4])===0)throw Error('On-chain file metadata differs or is incomplete: '+file.path);
 let data;if(file.bytes<=96000){const [bytes]=await call(cfg.registry,'read',[container,storePath]);data=Buffer.from(bytes.slice(2),'hex');}else{const chunks=[];for(let offset=0;offset<file.bytes;offset+=96000){const [bytes]=await call(cfg.registry,'readRange',[container,storePath,offset,Math.min(96000,file.bytes-offset)]);chunks.push(Buffer.from(bytes.slice(2),'hex'));}data=Buffer.concat(chunks);}
 if(data.length!==file.bytes||hash(data)!==file.sha256)throw Error('On-chain bytes differ: '+file.path);files.push({path:file.path,sha256:file.sha256,bytes:file.bytes,status:'verified'});console.log('Verified '+file.path);
}
const deployedManifest=await call(cfg.registry,'read',[container,'release/manifest.json']);if(hash(Buffer.from(deployedManifest[0].slice(2),'hex'))!==hash(await readFile(join(dir,'release/manifest.json'))))throw Error('On-chain public manifest differs');
const receipt={format:'degendna-tapeout-deployment-v1',status:'verified',chainId:196,sourceReleaseId:releaseId,verifiedAt:new Date().toISOString(),verification:'Two independent RPCs, pinned block and implementation, full byte comparison; not a contract audit or clinical validation',deployments:[{processorIndex:index,circuitId:id,processor:getAddress(processor),container:getAddress(container),owner:getAddress(owner),name:`${id}.2.${index}.tape`,block,blockHash:header.hash,files}]};
const output=args.includes('--output')?resolve(value('--output')):join(dir,'release/verified-deployment.json');await writeFile(output,JSON.stringify(receipt,null,2)+'\n');console.log('Verified receipt written to '+output);
