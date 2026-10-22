import test from 'node:test';
import assert from 'node:assert/strict';
import { agreedBlock, commonSafeBlock } from '../scripts/tapeout/rpc-agreement.mjs';
const hash = '0x' + 'ab'.repeat(32);
test('same pinned block accepts reordered keys and provider-specific fields', () => {
  const a = {hash,number:'0x10',transactions:[],providerExtra:true};
  const b = {number:'0x010',hash:hash.toUpperCase().replace('0X','0x')};
  assert.equal(agreedBlock([a,b],'0x10'),a);
});
test('different, missing, malformed and wrong-height blocks cannot agree', () => {
  const a = {hash,number:'0x10'};
  for (const b of [null,{}, {hash:'0x123',number:'0x10'}, {hash:'0x'+'cd'.repeat(32),number:'0x10'}, {hash,number:'0x11'}]) {
    assert.throws(() => agreedBlock([a,b],'0x10'));
  }
  assert.throws(() => agreedBlock([a],'0x10'));
});
test('safe verification pins the lower safe height and never falls back to latest', () => {
  assert.equal(commonSafeBlock([{number:'0x20'},{number:'0x18'}]),'0x18');
  assert.throws(() => commonSafeBlock([{number:'0x20'},null]));
  assert.throws(() => commonSafeBlock([{number:'latest'},{number:'0x18'}]));
});
