import test from 'node:test';import assert from 'node:assert/strict';
import {createDewebGateway,createChainReader,published} from '../deweb-gateway.mjs';
import {Interface} from 'ethers';
const host='degendna-fun-web.fly.dev';
function response(){return {writeHead(code,headers){this.code=code;this.headers=headers;},end(body){this.body=body;}};}
const req=(method='GET',hostname=host)=>({method,headers:{host:hostname,cookie:'must-not-be-forwarded'}});
const reader=()=>({gate:async()=>({activationVerified:true}),snapshot:async()=>new Map([['/index.html',{bytes:Buffer.from('<h1>original</h1>'),type:'text/html'}]])});
test('gateway routes only its exact independent host and never handles account requests',async()=>{
 const g=createDewebGateway({host,reader:reader()});
 assert.equal(await g.handle(req('GET','degendna.fun'),response(),'/'),false);
 assert.equal(await g.handle(req('GET',host+'.evil.test'),response(),'/'),false);
 for(const path of ['/api/auth/me','/auth/callback.html','/xiaojing/api/chat']){const r=response();await g.handle(req(),r,path);assert.equal(r.code,404);assert.ok(!r.headers['set-cookie']);}
});
test('verified HTML is returned byte-identically with no navigation or tracking injection',async()=>{
 const g=createDewebGateway({host,reader:reader()});await g.warm();const r=response();await g.handle(req(),r,'/');assert.equal(r.code,200);assert.equal(r.body.toString(),'<h1>original</h1>');assert.equal(r.headers['x-degendna-release'],published.releaseId);assert.ok(r.headers['content-security-policy'].includes("connect-src 'self'"));
 const missing=response();await g.handle(req(),missing,'/unknown.js');assert.equal(missing.code,404);
 const head=response();await g.handle(req('HEAD'),head,'/');assert.equal(head.code,200);assert.equal(head.body,undefined);
});
test('no write methods or fallback HTML can reach the main application',async()=>{
 const g=createDewebGateway({host,reader:reader()});const r=response();await g.handle(req('POST'),r,'/');assert.equal(r.code,405);assert.equal(r.headers.allow,'GET, HEAD');
});
test('inactive, failed or expired gate cannot serve even a previously cached release',async()=>{
 let time=100000,live=true;const source=reader();source.gate=async()=>{if(!live)throw Error('inactive');return {};};const g=createDewebGateway({host,reader:source,now:()=>time});await g.warm();live=false;time+=31000;const r=response();await g.handle(req(),r,'/');assert.equal(r.code,503);assert.ok(!r.headers['x-degendna-release']);
 const state=response();await g.handle(req(),state,'/.tape/status');assert.equal(JSON.parse(state.body).activationVerified,false);
});
test('corrupted snapshot failure never falls back to local public files',async()=>{
 const source=reader();source.snapshot=async()=>{throw Error('bytes mismatch');};const g=createDewebGateway({host,reader:source});await g.warm();const r=response();await g.handle(req(),r,'/');assert.equal(r.code,503);
});
test('concurrent warming deduplicates the chain snapshot read',async()=>{
 let count=0;const source=reader(),original=source.snapshot;source.snapshot=async()=>{count++;return original();};const g=createDewebGateway({host,reader:source});await Promise.all([g.warm(),g.warm(),g.warm()]);assert.equal(count,1);
});
test('chain reader refuses a different snapshot hash before reading any file',async()=>{
 const source=createChainReader(async()=>({number:published.block,hash:'0x'+'cd'.repeat(32)}));await assert.rejects(source.snapshot(),/block changed/);
});
test('chain reader rejects inactive binding, wrong chain and missing safe blocks',async()=>{
 const cfg=JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../scripts/tapeout/xlayer-config.json',import.meta.url),'utf8'));
 const iface=new Interface(['function isContainerLive(address) view returns(bool)']);
 const rpc=async(url,method,params)=>{if(method==='eth_chainId')return '0xc4';if(method==='eth_getBlockByNumber')return {number:published.block,hash:published.blockHash};if(method==='eth_getStorageAt'){const key=params[0]===cfg.binding?'binding':'registry';return '0x'+'0'.repeat(24)+cfg.implementations[key].slice(2);}if(method==='eth_call')return iface.encodeFunctionResult('isContainerLive',[false]);throw Error('unexpected call');};
 await assert.rejects(createChainReader(rpc).gate(),/not activated/);
 await assert.rejects(createChainReader(async()=> '0x38').gate(),/Wrong chain/);
 await assert.rejects(createChainReader(async(u,m)=>m==='eth_chainId'?'0xc4':null).gate(),/Safe height/);
});
