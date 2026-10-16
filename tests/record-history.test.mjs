import test from 'node:test';
import assert from 'node:assert/strict';
import {assessmentMap} from '../public/mental-lab/src/assessments.js';
import {scoreAssessment,buildCompositeProfile,previousComparableRecord,chronologicalRecords,compareRecords} from '../public/mental-lab/src/scoring.js';
const report=(id,date,value=3)=>({...scoreAssessment(assessmentMap[id],Object.fromEntries(assessmentMap[id].items.map(i=>[i.id,value]))),createdAt:date});
test('restoring records out of order still selects the latest module report without changing stored order',()=>{
 const old=report('fomo','2026-09-01T12:00:00Z',0),latest=report('fomo','2026-10-14T12:00:00Z'),other=report('sleep','2026-10-13T12:00:00Z');
 const input=[old,other,latest],snapshot=JSON.stringify(input);
 assert.equal(buildCompositeProfile(input).modules.find(r=>r.id==='fomo'),latest);
 assert.deepEqual(chronologicalRecords(input),[latest,other,old]);assert.equal(JSON.stringify(input),snapshot);
});
test('comparison uses the nearest earlier compatible report, never the first backup entry or a future report',()=>{
 const current=report('fomo','2026-10-15T12:00:00Z'),old=report('fomo','2026-09-01T12:00:00Z',0),near=report('fomo','2026-10-14T12:00:00Z',2);
 const future=report('fomo','2026-10-16T12:00:00Z'),other=report('sleep','2026-10-14T18:00:00Z'),wrongVersion={...near,version:'future',createdAt:'2026-10-15T10:00:00Z'};
 assert.equal(previousComparableRecord(current,[old,future,other,wrongVersion,near,current]),near);
 assert.equal(previousComparableRecord(current,[future,other,wrongVersion,current]),null);
 assert.equal(previousComparableRecord({...current,createdAt:'invalid'},[old]),null);
});
test('partial same-item comparisons retain only interpretable matching domains and ignore malformed dates',()=>{
 const a=assessmentMap.fomo,current=report('fomo','2026-10-15T12:00:00Z');
 const answers=Object.fromEntries(a.items.map(i=>[i.id,0]));delete answers[a.items[0].id];
 const partial={...scoreAssessment(a,answers),createdAt:'2026-10-14T12:00:00Z'};
 assert.ok(compareRecords(current,partial).length<a.domains.length);
 assert.ok(compareRecords(current,partial).length>0);
 assert.equal(previousComparableRecord(current,[{...current,createdAt:'invalid'},partial]),partial);
 assert.equal(chronologicalRecords([partial,{createdAt:'invalid'}])[0],partial);
});
