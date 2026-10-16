import test from 'node:test';
import assert from 'node:assert/strict';
import { assessments, assessmentMap } from '../public/mental-lab/src/assessments.js';
import { scoreAssessment, compareRecords } from '../public/mental-lab/src/scoring.js';
import { humanizeReport } from '../public/mental-lab/src/report-copy.js';
import { resultInsights, moduleGuides } from '../public/mental-lab/src/result-insights.js';
import { privateReportText } from '../public/mental-lab/src/report-text.js';
import { recentType, typeOptions } from '../public/mental-lab/src/recent-type.js';
import { playResult, playQuestions } from '../public/mental-lab/src/play.js';
const modules = assessments.filter(a => !a.safetyOnly);
const fill = (a,value) => Object.fromEntries(a.items.map(i=>[i.id,value]));

for (const a of modules) test(`${a.id}: every result branch has bounded evidence and a distinct practical guide`,()=>{
  assert.ok(moduleGuides[a.id]);
  for (const value of [0,1,2,3,4,'skip',9,null]) {
    const raw=scoreAssessment(a,fill(a,value)), before=JSON.stringify(raw), profile=resultInsights(raw);
    assert.equal(profile.facets.length,a.domains.length);
    assert.ok(profile.exercise.exercise.length>25 && profile.exercise.checkpoint.length>20);
    assert.ok(profile.exercise.example.includes('例如：'));
    assert.equal(profile.strengths.length,value===3||value===4?a.domains.filter(d=>d.kind==='resource').length:0);
    assert.equal(profile.costs.length,[2,3,4].includes(value)?a.domains.filter(d=>d.kind==='burden').length:0);
    for(const d of [...profile.strengths,...profile.costs]) {
      assert.ok(d.evidence.length>0);
      assert.ok(d.evidence.every(e=>a.domains.find(x=>x.key===d.key).items.some(i=>i.id===e.id)));
      assert.ok(d.evidence.every(e=>e.value>=2));
    }
    assert.equal(JSON.stringify(raw),before);
    assert.deepEqual(compareRecords(raw,raw),compareRecords(raw,humanizeReport(raw)));
    const exported=privateReportText(raw);
    assert.ok(exported.includes(profile.version));
    assert.ok(exported.includes(profile.exercise.example));
    assert.ok(exported.includes(profile.exercise.trap));
    assert.ok(!exported.includes('undefined'));
  }
});

test('guides cover all 18 distinct modules and retain every domain action and boundary',()=>{
  assert.equal(Object.keys(moduleGuides).length,18);
  for(const field of ['lens','exercise','example','trap','checkpoint','question']) assert.equal(new Set(Object.values(moduleGuides).map(g=>g[field])).size,18,field);
  for(const a of modules){
    const p=resultInsights(scoreAssessment(a,fill(a,3)));
    for(const d of a.domains){const f=p.facets.find(x=>x.key===d.key);assert.equal(f.action,d.action);assert.equal(f.limit,d.limit);assert.equal(f.meaning,d.meaning);}
    const supported=new Set(typeOptions(a.id).flatMap(t=>t.keys));
    assert.ok(a.domains.every(d=>supported.has(d.key)),`${a.id}: uncovered type domain`);
  }
});

test('one response never invents strengths or broad traits; rare financial notices stay in export',()=>{
  for(const a of modules)for(const d of a.domains){
    const r=scoreAssessment(a,{[d.items[0].id]:4}), p=resultInsights(r);
    assert.equal(p.strengths.length,0);assert.equal(p.costs.length,0);assert.equal(p.exercise.matched,false);
    assert.equal(p.unknown.length,a.domains.length);
  }
  const r=scoreAssessment(assessmentMap.trading,{tr41:1});
  assert.ok(privateReportText(r).includes(r.notices[0].text));
  assert.ok(privateReportText(r).includes(r.notices[0].evidence[0].text));
});

test('resources cannot hide burden or override explicit life impairment and recommendations agree',()=>{
  for(const a of modules){
    const r=scoreAssessment(a,Object.fromEntries(a.items.map(i=>[i.id,i.kind==='resource'?4:3])),{care:'substantial'}),p=resultInsights(r);
    assert.ok(p.strengths.length>0 && p.costs.length>0);
    assert.match(privateReportText(r),/日常已经很难维持/);
    const hard=humanizeReport(scoreAssessment(a,fill(a,0),{intensity:'distressing',change:'same'}));
    assert.ok(hard.support.reasons.some(s=>s.includes('应付起来费力')));
    assert.match(hard.support.text,/专业人员/);
    assert.ok(!hard.support.text.includes('变得更难受'));
  }
});

test('a single frequent resource item is not a whole-domain strength; incomplete burden stays unknown',()=>{
  for(const a of modules){
    const input=fill(a,0), resource=a.domains.find(d=>d.kind==='resource');
    input[resource.items[0].id]=4;
    assert.equal(resultInsights(scoreAssessment(a,input)).strengths.length,0);
    const burden=a.domains.find(d=>d.kind==='burden');
    burden.items.forEach(i=>delete input[i.id]);
    const r=scoreAssessment(a,input), p=resultInsights(r);
    assert.ok(p.unknown.includes(burden.label));
    assert.match(humanizeReport(r).summary,/回答不足/);
  }
  const a=assessmentMap.quick,r=scoreAssessment(a,Object.fromEntries(a.items.map(i=>[i.id,i.dimension==='space'?3:0])));
  assert.equal(recentType(r).code,'SA23');
});

test('all Play answer combinations preserve counts, ties and traceable non-health guidance',()=>{
  for(let n=0;n<4**8;n++){
    const choices=Array.from({length:8},(_,i)=>(n >> (i*2)) & 3),p=playResult(choices);
    const max=Math.max(...p.distribution.map(d=>d.count));
    assert.equal(p.distribution.reduce((sum,d)=>sum+d.count,0),8);
    assert.equal(p.perspectives.length,p.distribution.filter(d=>d.count===max).length);
    assert.equal(p.name==='多面探索者',p.perspectives.length>1);
    for(const s of p.perspectives){assert.equal(s.count,max);assert.equal(s.evidence.length,max);assert.ok(s.trait&&s.strength&&s.blindSpot&&s.action&&s.question);assert.ok(s.evidence.every(e=>playQuestions.some(q=>q.text===e.question&&q.options.includes(e.answer))));}
  }
});

test('invalid, safety and historical reports never get new insights',()=>{
  assert.equal(resultInsights({}),null);
  assert.equal(resultInsights(scoreAssessment(assessmentMap.quick,{}, {safety:'yes'})),null);
  const r=scoreAssessment(assessmentMap.quick,{});r.version='old';
  assert.equal(resultInsights(r),null);assert.throws(()=>privateReportText(r));
});

test('all 177 named result options are reachable without asserting unselected evidence',()=>{
  let count=0;
  for(const a of modules)for(const option of typeOptions(a.id)){
    count++;
    const input=Object.fromEntries(a.items.map(i=>[i.id,option.keys.includes(i.dimension)?3:0]));
    const r=scoreAssessment(a,input),t=recentType(r),p=resultInsights(r);
    assert.equal(t.code,option.code,`${a.id}: ${option.code}`);
    assert.ok(t.evidence.every(e=>input[e.id]===3));
    const identified=new Set([...p.strengths,...p.costs].map(d=>d.key));
    assert.deepEqual([...identified].sort(),[...option.keys].sort());
    assert.ok(privateReportText(r).includes(t.name));
  }
  assert.equal(count,177);
});

test('corrupted stored dimensions, counts, evidence and context are rejected before rendering',()=>{
  const good=scoreAssessment(assessmentMap.quick,fill(assessmentMap.quick,3));
  for(const mutate of [r=>r.domains[0].key='unknown',r=>r.domains[0].kind='resource',r=>r.domains[0].evidence[0].value=99,r=>r.domains[0].evidence[1]={...r.domains[0].evidence[0]},r=>r.domains[0].frequent=0,r=>r.context[0].value='bogus',r=>r.context[0].provided=true,r=>r.scope='unknown']){
    const r=structuredClone(good);mutate(r);assert.equal(resultInsights(r),null);assert.throws(()=>privateReportText(r));
  }
  const r=scoreAssessment(assessmentMap.trading,{tr41:1});r.notices=[];assert.equal(resultInsights(r),null);
});

test('saved reports regenerate support reasons from original context with current presentation rules',()=>{
  const r=scoreAssessment(assessmentMap.quick,{}, {intensity:'distressing'});
  r.support.reasons=['生活影响、持续时间和变化尚未提供。'];
  assert.ok(humanizeReport(r).support.reasons.some(s=>s.includes('应付起来费力')));
});
