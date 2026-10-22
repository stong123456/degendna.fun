import test from 'node:test';import assert from 'node:assert/strict';
import {assessments,assessmentMap} from '../public/mental-lab/src/assessments.js';
import {plainReflections,plainFacet,plainIntros} from '../public/mental-lab/src/plain-reflections.js';
import {scoreAssessment,compareRecords} from '../public/mental-lab/src/scoring.js';
import {resultInsights} from '../public/mental-lab/src/result-insights.js';
import {privateReportText} from '../public/mental-lab/src/report-text.js';
import {humanizeReport} from '../public/mental-lab/src/report-copy.js';
const modules=assessments.filter(a=>!a.safetyOnly);
test('all 87 content groups have their own plain reading, care and concrete step',()=>{
 let count=0;const titles=new Set();for(const a of modules){assert.ok(plainIntros[a.id]);assert.deepEqual(Object.keys(plainReflections[a.id]).sort(),a.domains.map(d=>d.key).sort());for(const d of a.domains){const p=plainReflections[a.id][d.key];for(const k of ['title','journey','care','step'])assert.ok(p[k]?.length>=(k==='title'?6:12),`${a.id}/${d.key}/${k}`);assert.ok(!/童年|原生家庭|潜意识|你一定|你就是|人格障碍/.test(p.journey));titles.add(p.title);count++;}}assert.equal(count,87);assert.equal(titles.size,87);
});
test('a skipped or sparsely answered group never receives a whole psychological story',()=>{
 for(const a of modules)for(const d of a.domains){const r=scoreAssessment(a,{[d.items[0].id]:4}),f=plainFacet(a.id,r.domains.find(x=>x.key===d.key));assert.equal(f.grounded,false);assert.equal(f.hypothesis,null);assert.ok(!f.reading.includes(plainReflections[a.id][d.key].journey));assert.ok(!f.title.includes(plainReflections[a.id][d.key].title));}
});
test('one frequent item among a fully answered group is kept specific rather than attributed to the whole person',()=>{
 for(const a of modules)for(const d of a.domains){const input=Object.fromEntries(a.items.map(i=>[i.id,0]));input[d.items[0].id]=4;const r=scoreAssessment(a,input),f=plainFacet(a.id,r.domains.find(x=>x.key===d.key));assert.equal(f.grounded,false);assert.equal(f.hypothesis,null);assert.ok(!f.reading.includes(plainReflections[a.id][d.key].journey));}
});
test('rich interpretations are shared by browser model, saved rereading and private export without changing evidence',()=>{
 for(const a of modules){const r=scoreAssessment(a,Object.fromEntries(a.items.map(i=>[i.id,3]))),before=JSON.stringify(r),p=resultInsights(r),copy=humanizeReport(r),text=privateReportText(r);for(const f of p.facets){assert.equal(f.reading,plainReflections[a.id][f.key].journey);assert.ok(f.care&&f.nextStep);assert.ok(text.includes(f.reading)&&text.includes(f.care)&&text.includes(f.nextStep));assert.equal(copy.domains.find(d=>d.key===f.key).interpretation,f.reading);}assert.equal(JSON.stringify(r),before);assert.deepEqual(compareRecords(r,r),compareRecords(r,copy));}
});
test('care never replaces direct support for major life impact or rare financial harm',()=>{
 const a=assessmentMap.fomo,r=scoreAssessment(a,Object.fromEntries(a.items.map(i=>[i.id,3])),{care:'substantial'});assert.match(privateReportText(r),/日常已经很难维持/);const rare=scoreAssessment(assessmentMap.trading,{tr41:1});assert.ok(privateReportText(rare).includes(rare.notices[0].text));
});
