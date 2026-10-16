import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
const exec=promisify(execFile);
const config=JSON.parse(await readFile(new URL('./xlayer-config.json',import.meta.url),'utf8'));
const implSlot='0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
async function rpc(url,method,params=[]){const args=['--silent','--show-error','--fail','--max-time','15','--retry','2','--retry-all-errors','--header','Content-Type: application/json','--data',JSON.stringify({jsonrpc:'2.0',id:1,method,params}),url];const {stdout}=await exec('curl',args,{maxBuffer:2e6});const data=JSON.parse(stdout);if(data.error||data.result===undefined)throw Error(method+' failed');return data.result;}
const report={format:'degendna-xlayer-preflight-v1',checkedAt:new Date().toISOString(),source:config.source,chainId:config.chainId,status:'UNVERIFIED',readOnly:true,transactionsSent:0,checks:[]};
try{
 const chains=await Promise.all(config.rpcs.map(u=>rpc(u,'eth_chainId')));if(!chains.every(c=>Number(c)===196))throw Error('RPC chain ID mismatch');
 const heights=await Promise.all(config.rpcs.map(u=>rpc(u,'eth_blockNumber')));const block='0x'+(Math.min(...heights.map(h=>Number(h)))-2).toString(16);report.block=block;
 const blocks=await Promise.all(config.rpcs.map(u=>rpc(u,'eth_getBlockByNumber',[block,false])));if(!blocks[0]?.hash||blocks[0].hash!==blocks[1]?.hash)throw Error('Independent RPC block mismatch');report.blockHash=blocks[0].hash;
 for(const name of ['factory','opener','registry','binding']){
   const values=await Promise.all(config.rpcs.map(u=>rpc(u,'eth_getCode',[config[name],block])));
   if(values[0]==='0x'||values[0]!==values[1])throw Error(name+' missing code or inconsistent RPC');
   report.checks.push({name,address:config[name],codeBytes:(values[0].length-2)/2,codeSha256:createHash('sha256').update(Buffer.from(values[0].slice(2),'hex')).digest('hex'),status:'PASS'});
 }
 for(const name of ['registry','binding']){
   const values=await Promise.all(config.rpcs.map(u=>rpc(u,'eth_getStorageAt',[config[name],implSlot,block])));
   const actual='0x'+values[0].slice(-40);if(values[0]!==values[1]||actual.toLowerCase()!==config.implementations[name].toLowerCase())throw Error(name+' implementation differs from pinned upstream config');
   report.checks.push({name:name+' implementation',address:actual,status:'PASS'});
 }
 report.status='PASS';
}catch(e){report.error=e.message;process.exitCode=1;}
await mkdir(new URL('../../docs/accelerator/',import.meta.url),{recursive:true});await writeFile(new URL('../../docs/accelerator/xlayer-preflight.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
