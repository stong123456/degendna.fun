import test from 'node:test';
import assert from 'node:assert/strict';
import { assessments, assessmentMap } from '../public/mental-lab/src/assessments.js';
import { scoreAssessment } from '../public/mental-lab/src/scoring.js';
import { currentState } from '../public/mental-lab/src/current-state.js';
import { humanizeReport } from '../public/mental-lab/src/report-copy.js';
const fill=(a,value)=>Object.fromEntries(a.items.map(i=>[i.id,value]));
for(const a of assessments.filter(a=>!a.safetyOnly))test(`${a.id}: clear state and actionable steps preserve saved evidence`,()=>{
  for(const value of [0,2,3]){
    const report=scoreAssessment(a,fill(a,value)), before=JSON.stringify(report), s=currentState(humanizeReport(report));
    assert.ok(s.title && s.priority && s.description);assert.equal(s.steps.length,3);
    assert.ok(s.steps.every(step=>step.when && step.title && step.text.length>15));
    assert.equal(JSON.stringify(report),before);
    assert.equal(s.kind,value===0?'infrequent':report.notices.length?'specific-concern':value===2?'occasional':'recurring');
    assert.ok(s.evidence.every(e=>a.items.some(i=>i.id===e.id)));
  }
});
test('explicit functioning overrides frequency, missing answers and plentiful resources',()=>{
 const a=assessmentMap.workbound;
 for(const answers of [{},fill(a,0),Object.fromEntries(a.items.map(i=>[i.id,i.kind==='resource'?4:0]))]){
   assert.equal(currentState(scoreAssessment(a,answers,{care:'substantial'})).kind,'support-now');
   assert.equal(currentState(scoreAssessment(a,answers,{work:'clear'})).kind,'daily-impact');
   assert.equal(currentState(scoreAssessment(a,answers,{intensity:'overwhelming'})).kind,'support-now');
 }
 const s=currentState(scoreAssessment(a,{}, {intensity:'overwhelming'}));
 assert.equal(s.steps[0].when,'现在');assert.match(s.steps[0].text,/立即联系当地紧急服务/);
 assert.match(s.reasons[0],/很难承受/);
});
test('missing and resource-only answers cannot produce a reassuring state; explicit context still counts',()=>{
 const a=assessmentMap.workbound;
 for(const answers of [{},fill(a,'skip'),Object.fromEntries(a.items.filter(i=>i.kind==='resource').map(i=>[i.id,4]))])assert.equal(currentState(scoreAssessment(a,answers)).kind,'incomplete');
 assert.equal(currentState(scoreAssessment(a,{}, {duration:'months'})).kind,'persistent');
 assert.equal(currentState(scoreAssessment(a,{}, {change:'worse'})).kind,'worsening');
 assert.equal(currentState(scoreAssessment(a,{}, {work:'some'})).kind,'some-impact');
 assert.equal(currentState(scoreAssessment(a,{}, {intensity:'distressing'})).kind,'struggling');
 assert.equal(currentState(scoreAssessment(a,{}, {safety:'yes'})),null);
 assert.equal(currentState({}),null);
});
test('actions follow the actual domain, rare notices remain visible, contradictions remain explicit',()=>{
 const a=assessmentMap.workbound;
 for(const d of a.domains.filter(d=>d.kind==='burden')){
   const s=currentState(scoreAssessment(a,Object.fromEntries(a.items.map(i=>[i.id,i.dimension===d.key?3:0]))));
   assert.equal(s.steps[0].text,d.action);assert.ok(s.priority.includes(d.label));
 }
 const financial=currentState(scoreAssessment(assessmentMap.trading,{tr41:1}));
 assert.equal(financial.kind,'specific-concern');assert.ok(financial.evidence.some(e=>e.id==='tr41'));
 const contradiction=currentState(scoreAssessment(a,fill(a,3),{intensity:'none'}));
 assert.ok(contradiction.caveats.some(text=>text.includes('没有相应困扰')));
});
