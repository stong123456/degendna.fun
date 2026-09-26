import test from 'node:test';
import assert from 'node:assert/strict';
import { assessments, assessmentMap } from '../public/mental-lab/src/assessments.js';
import { sceneAssessments, SCENE_VERSION } from '../public/mental-lab/src/scene-assessments.js';
import { scoreAssessment, isCurrentRecord, compareRecords } from '../public/mental-lab/src/scoring.js';
import { recentType, typeOptions } from '../public/mental-lab/src/recent-type.js';
import { readMoodRecords, saveMoodRecord, MOOD_KEY, practices } from '../public/mental-lab/src/care-tools.js';

test('six scene banks have 144 unique items, six balanced dimensions each and auditable item purposes', () => {
  assert.equal(sceneAssessments.length,6);
  const ids=new Set(), texts=new Set();
  for(const a of assessments) for(const item of a.items){
    assert.ok(!ids.has(item.id),item.id); ids.add(item.id);
    const normalized=item.text.replace(/[\s，。！？、：“”]/g,'');
    assert.ok(!texts.has(normalized),item.text); texts.add(normalized);
  }
  for(const s of sceneAssessments){
    assert.equal(s.items.length,24); assert.equal(s.domains.length,6);
    assert.equal(s.domains.filter(d=>d.kind==='resource').length,3);
    assert.equal(s.version,SCENE_VERSION);
    for(const d of s.domains){assert.equal(d.items.length,4); assert.ok(d.action && d.limit && d.meaning); d.items.forEach(i=>assert.ok(i.observes && i.dimension===d.key));}
  }
});
test('all 126 single and paired profiles are reachable, evidence-based and have unique short codes', () => {
  const codes=new Set();
  for(const s of sceneAssessments){
    const options=typeOptions(s.id); assert.equal(options.length,21);
    for(const option of options){
      assert.match(option.code,/^[A-Z]{2}\d{2}$/); assert.ok(!codes.has(option.code)); codes.add(option.code);
      const answers=Object.fromEntries(s.items.map(i=>[i.id,option.keys.includes(i.dimension)?3:0]));
      const r=scoreAssessment(s,answers), p=recentType(r);
      assert.equal(p.state,'matched'); assert.equal(p.code,option.code); assert.equal(p.facets.length,6);
      assert.ok(p.evidence.every(i=>answers[i.id]===3));
      assert.equal(p.facets.filter(f=>f.state==='prominent').length,option.keys.length);
    }
  }
  assert.equal(codes.size,126);
});
test('partial answers, multiway ties, safety and prior draft versions stay separate', () => {
  for(const s of sceneAssessments){
    const answers=Object.fromEntries(s.items.map(i=>[i.id,0]));
    const full=scoreAssessment(s,answers); assert.ok(isCurrentRecord(full));
    assert.equal(recentType(full).state,'none');
    s.items.slice(0,7).forEach(i=>answers[i.id]='skip');
    assert.equal(recentType(scoreAssessment(s,answers)).state,'incomplete');
    const mixed=recentType(scoreAssessment(s,Object.fromEntries(s.items.map(i=>[i.id,3]))));
    assert.equal(mixed.state,'mixed'); assert.equal(mixed.facets.filter(f=>f.state==='prominent').length,6);
    assert.equal(recentType(scoreAssessment(s,{}, {safety:'yes'})),null);
    const old={...full,version:'2.0-content-review'}; assert.equal(isCurrentRecord(old),false); assert.deepEqual(compareRecords(full,old),[]);
  }
  assert.ok(isCurrentRecord(scoreAssessment(assessmentMap.quick,{})));
});
test('mood journal rejects malformed storage and limits history without touching report keys', () => {
  const map=new Map([['degendna-mental-lab-records','preserve']]);
  const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
  assert.deepEqual(readMoodRecords(storage),[]);
  map.set(MOOD_KEY,'broken'); assert.deepEqual(readMoodRecords(storage),[]);
  assert.throws(()=>saveMoodRecord({mood:'bogus'},storage));
  for(let i=0;i<105;i++) saveMoodRecord({version:1,id:String(i),mood:'平静',note:'<script>plain text</script>',at:new Date().toISOString()},storage);
  assert.equal(readMoodRecords(storage).length,100); assert.equal(readMoodRecords(storage)[0].id,'104');
  assert.equal(map.get('degendna-mental-lab-records'),'preserve');
  assert.equal(practices.length,4); practices.forEach(p=>assert.equal(p.steps.length,3));
});
