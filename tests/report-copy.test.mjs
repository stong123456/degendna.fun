import test from 'node:test';
import assert from 'node:assert/strict';
import { assessments } from '../public/mental-lab/src/assessments.js';
import { scoreAssessment, compareRecords } from '../public/mental-lab/src/scoring.js';
import { humanizeReport } from '../public/mental-lab/src/report-copy.js';

test('friendly reports preserve answers, counts, notices and comparisons for every module', () => {
  for (const module of assessments.filter(a => !a.safetyOnly)) {
    for (const value of [0, 2, 3, 'skip']) {
      const result = scoreAssessment(module, Object.fromEntries(module.items.map(i => [i.id, value])));
      const before = JSON.stringify(result);
      const copy = humanizeReport(result);
      assert.equal(JSON.stringify(result), before, 'stored report was mutated');
      for (const key of ['answered', 'skipped', 'score', 'notices', 'context', 'version']) assert.deepEqual(copy[key], result[key]);
      copy.domains.forEach((domain, i) => {
        for (const key of ['key', 'kind', 'frequent', 'answered', 'interpretable', 'evidence']) assert.deepEqual(domain[key], result.domains[i][key]);
      });
      assert.deepEqual(compareRecords(copy, result).map(({ label, ...entry }) => entry), compareRecords(result, result).map(({ label, ...entry }) => entry));
      assert.ok(copy.summary.length > 20);
    }
  }
});

test('support remains direct when life is hard and never infers calm from missing answers', () => {
  const module = assessments[0];
  const empty = humanizeReport(scoreAssessment(module, {}));
  assert.match(empty.summary, /还不能/);
  const urgent = humanizeReport(scoreAssessment(module, {}, { intensity: 'overwhelming' }));
  assert.match(urgent.support.text, /请尽快联系/);
  assert.match(urgent.support.text, /立即联系当地紧急服务/);
  assert.ok(scoreAssessment(module, {}, { safety: 'yes' }).safetyTriggered);
});
