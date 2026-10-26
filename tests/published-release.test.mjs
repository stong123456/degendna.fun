import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validatePublishedRelease} from '../public/mental-lab/src/version.js';
const bundle=JSON.parse(await readFile(new URL('../public/release/published-deweb.json',import.meta.url)));
test('published DeWEB snapshot remains separate from the current web build',async()=>{
 assert.equal(await validatePublishedRelease(bundle.manifest,bundle.receipt),true);
 assert.equal(bundle.manifest.releaseId,'1a99470e00f6767600c8e7b4072e18c748aa26abf76536febccb6edc8938fe75');
 for(const mutate of [b=>b.receipt.status='not-published',b=>b.receipt.sourceReleaseId='wrong',b=>b.receipt.chainId=1,b=>b.manifest.files[0].bytes++,b=>b.receipt.deployments[0].files[0].sha256='wrong',b=>b.receipt.deployments[0].files[1]=b.receipt.deployments[0].files[0]]){
  const b=structuredClone(bundle);mutate(b);assert.equal(await validatePublishedRelease(b.manifest,b.receipt),false);
 }
});
