import test from 'node:test';
import assert from 'node:assert/strict';
import { assessments } from '../public/mental-lab/src/assessments.js';
import { scoreAssessment } from '../public/mental-lab/src/scoring.js';
import { recentType } from '../public/mental-lab/src/recent-type.js';
const modules = assessments.filter(a => !a.safetyOnly);
const answers = (a, value = 0) => Object.fromEntries(a.items.map(i => [i.id, value]));

test('each module can match its own supported pattern without altering stored data', () => {
  for (const module of modules) {
    const input = answers(module);
    module.domains[0].items.forEach(i => input[i.id] = 3);
    const report = scoreAssessment(module, input);
    const before = JSON.stringify(report);
    const result = recentType(report);
    assert.equal(result.state, 'matched', module.id);
    assert.match(result.code, /^[A-Z]{2}[0-9]{2}$/);
    assert.ok(result.evidence.length >= 2);
    assert.ok(result.evidence.every(e => input[e.id] === 3));
    assert.equal(JSON.stringify(report), before);
  }
});
test('missing, low frequency and mixed answers never force a type', () => {
  for (const module of modules) {
    assert.equal(recentType(scoreAssessment(module, {})).state, 'incomplete');
    assert.equal(recentType(scoreAssessment(module, answers(module, 'skip'))).state, 'incomplete');
    assert.equal(recentType(scoreAssessment(module, answers(module, 0))).state, 'none');
    assert.equal(recentType(scoreAssessment(module, answers(module, 2))).state, 'none');
    assert.equal(recentType(scoreAssessment(module, answers(module, 3))).state, 'mixed');
    assert.equal(recentType(scoreAssessment(module, answers(module), { safety: 'yes' })), null);
  }
  assert.equal(recentType({}), null);
});
test('one rare financial answer remains a notice without a type or safety classification', () => {
  const module = modules.find(a => a.id === 'trading');
  const input = answers(module); input.tr41 = 1;
  const report = scoreAssessment(module, input);
  assert.equal(recentType(report).state, 'none');
  assert.ok(report.notices.some(n => n.type === 'financial'));
  assert.equal(report.safetyTriggered, false);
});
