import test from "node:test";
import assert from "node:assert/strict";
import { assessments, assessmentMap, contextQuestions, reportVersion } from "../public/mental-lab/src/assessments.js";
import { isAnswer, scoreAssessment, buildCompositeProfile, compareRecords, isCurrentRecord } from "../public/mental-lab/src/scoring.js";

const quick = assessmentMap.quick;
const fill = (module, value) => Object.fromEntries(module.items.map((item) => [item.id, typeof value === "function" ? value(item) : value]));
const report = (value, context = {}) => scoreAssessment(quick, fill(quick, value), context);

test("all IDs, item wording and domain membership are unique and defined", () => {
  const ids = new Set();
  for (const module of assessments) {
    assert.equal(typeof module.version, "string");
    if (module.safetyOnly) { assert.equal(module.items.length, 0); continue; }
    assert(module.scope && module.subtitle);
    assert(module.domains.length >= 4);
    assert.equal(new Set(module.domains.map((domain) => domain.key)).size, module.domains.length);
    for (const domain of module.domains) {
      assert(domain.items.length >= 3);
      for (const field of ["meaning", "action", "limit", "label"]) assert(domain[field].length > 3);
      assert(["burden", "resource"].includes(domain.kind));
      for (const item of domain.items) {
        assert(!ids.has(item.id), item.id); ids.add(item.id);
        assert.equal(item.dimension, domain.key); assert.equal(item.kind, domain.kind);
        assert(!item.reverse && !item.severe && !item.riskFlag);
        assert(item.text.endsWith("。"));
      }
    }
    assert.equal(new Set(module.items.map((item) => item.text)).size, module.items.length);
  }
});

test("trading preserves every original ordinary topic ID and separates safety", () => {
  for (let i = 1; i <= 48; i++) if (i !== 40) assert(assessmentMap.trading.items.some((item) => item.id === `tr${i}`));
  assert(assessmentMap.trading.items.some((item) => item.id === "tr49"));
  assert(assessmentMap.trading.items.some((item) => item.id === "tr50"));
  assert(assessmentMap.trading.items.some((item) => item.id === "tr51"));
});

for (const invalid of [undefined, null, NaN, Infinity, -1, 5, 2.5, "4", true, {}, []]) {
  test(`invalid answer is missing, not zero: ${String(invalid)}`, () => {
    assert.equal(isAnswer(invalid), false);
    const result = scoreAssessment(quick, { q1: invalid, invented: 4 });
    assert.equal(result.answered, 0); assert.equal(result.score, null);
    assert.match(result.summary, /尚无有效/);
  });
}

for (const module of assessments.filter((entry) => !entry.safetyOnly)) {
  test(`${module.id}: all zero, all frequent and missing remain non-diagnostic`, () => {
    for (const value of [0, 1, 2, 3, 4, "skip"]) {
      const result = scoreAssessment(module, fill(module, value));
      assert.equal(result.safetyTriggered, false);
      assert.equal(result.score, null);
      assert.equal(result.band, undefined);
      assert.equal(result.domains.length, module.domains.length);
      assert.equal(result.answered, value === "skip" ? 0 : module.items.length);
      assert(result.limitations.length >= 5);
      for (const domain of result.domains) {
        assert.equal(domain.frequent + domain.occasional + domain.infrequent, domain.answered);
        assert.equal(domain.frequent, typeof value === "number" && value >= 3 ? domain.total : 0);
        for (const evidence of domain.evidence) {
          assert.equal(evidence.value, value);
          assert(module.items.some((item) => item.id === evidence.id && item.text === evidence.text));
        }
      }
    }
  });
}

test("protective resources do not cancel burden or reverse into illness", () => {
  const result = report(4);
  assert(result.domains.filter((domain) => domain.kind === "resource").every((domain) => domain.frequent === domain.total));
  assert(result.domains.filter((domain) => domain.kind === "burden").every((domain) => domain.frequent === domain.total));
  assert.match(result.summary, /困扰条目/); assert.match(result.summary, /资源体验/);
});

test("one or two responses never become a dimension conclusion", () => {
  const result = scoreAssessment(quick, { q1: 4, q3: 4 });
  assert.equal(result.domains[0].interpretable, false);
  assert.equal(result.patterns.length, 0);
  assert.match(result.summary, /覆盖不足/);
});

test("three items in a large domain do not meet 75 percent completeness", () => {
  const result = scoreAssessment(assessmentMap.trading, { tr4: 4, tr17: 4, tr20: 4 });
  assert.equal(result.domains.find((domain) => domain.key === "exposure").interpretable, false);
});

test("resources-only answers cannot imply absence of burden", () => {
  const result = report((item) => item.kind === "resource" ? 4 : "skip");
  assert.match(result.summary, /困扰组覆盖不足/);
});

test("zero and occasional responses are not promoted to dominant problems", () => {
  assert.equal(report(0).patterns.length, 0);
  assert.equal(report(2).patterns.length, 0);
  assert.match(report(0).domains[0].interpretation, /不能排除/);
  assert.match(report(2).domains[0].interpretation, /有时/);
});

test("pattern explanations require both complete groups and two frequent items per group", () => {
  const answers = fill(quick, 0);
  Object.assign(answers, { q1: 3, q3: 3, q5: 3 });
  assert.equal(scoreAssessment(quick, answers).patterns.length, 0);
  answers.q7 = 3;
  const result = scoreAssessment(quick, answers);
  assert.equal(result.patterns.length, 1);
  assert.equal(result.patterns[0].evidence.length, 2);
});

test("any reported self-harm opens unscored support, not a risk prediction", () => {
  const result = report(0, { safety: "yes" });
  assert.equal(result.safetyTriggered, true); assert.equal(result.score, null);
  assert.deepEqual(result.domains, []); assert.equal(isCurrentRecord(result), false);
  const legacyQuestion = { ...quick, items: [{ id: "risk", riskFlag: "self_harm" }] };
  assert.equal(scoreAssessment(legacyQuestion, { risk: 1 }).safetyTriggered, true);
});

test("safety module has no questionnaire or graded result", () => {
  const result = scoreAssessment(assessmentMap.safety, {});
  assert.equal(result.safetyTriggered, true); assert.equal(result.score, null);
  assert.equal(result.band, undefined); assert.deepEqual(result.domains, []);
});

test("high frequency and financial harm cannot infer self-harm", () => {
  const result = scoreAssessment(assessmentMap.trading, fill(assessmentMap.trading, 4));
  assert.equal(result.safetyTriggered, false);
  assert(result.notices.some((notice) => notice.type === "financial"));
});

test("single rare financial or sleep-safety response is not hidden by a low average", () => {
  assert(scoreAssessment(assessmentMap.trading, { tr41: 1 }).notices.some((notice) => notice.type === "financial"));
  assert(scoreAssessment(assessmentMap.sleep, { sl7: 1 }).notices.some((notice) => notice.type === "sleepiness"));
  assert.equal(scoreAssessment(assessmentMap.sleep, { sl7: "skip" }).notices.length, 0);
});

test("support follows explicit functioning, duration and change, not invented severity", () => {
  assert.match(report(0, { care: "substantial" }).support.title, /优先/);
  assert.match(report(0, { intensity: "overwhelming" }).support.title, /优先/);
  assert.equal(report(0, { intensity: "overwhelming" }).safetyTriggered, false);
  assert.match(report(0, { duration: "months" }).support.title, /专业支持/);
  assert.match(report(0, { change: "worse" }).support.title, /专业支持/);
  assert.match(report(4).support.text, /不足以判断/);
  assert(report(0, { work: "clear" }).support.reasons.some((reason) => reason.includes("完成变困难")));
});

test("unknown context is not silently treated as no impact", () => {
  const result = report(0, { work: "invented" });
  assert(result.context.every((entry) => !entry.provided));
  assert.equal(result.context.length, contextQuestions.length);
  assert.match(result.support.reasons[0], /尚未提供/);
  assert(!JSON.stringify(result).includes('"safety":"no"'));
});

test("straight-line responses are not labelled invalid", () => {
  assert(report(4).warnings.some((text) => text.includes("不会因此判定回答无效")));
});

test("old records and different modules never enter a composite score", () => {
  const legacy = { id: "quick", score: 98, title: "Old", dimensionScores: [] };
  const current = report(4);
  const composite = buildCompositeProfile([legacy, current, report(0)]);
  assert.equal(composite.legacyCount, 1); assert.equal(composite.modules.length, 1);
  assert.equal(composite.averageScore, undefined);
  assert.deepEqual(compareRecords(current, legacy), []);
  assert.deepEqual(compareRecords(current, scoreAssessment(assessmentMap.mood, fill(assessmentMap.mood, 4))), []);
});

test("comparison requires same version, scope and exact answered item sets", () => {
  const current = report(4); const previous = report(0);
  assert.equal(compareRecords(current, previous).length, quick.domains.length);
  assert(compareRecords(current, previous).every((entry) => entry.current === entry.total && entry.previous === 0));
  assert.deepEqual(compareRecords(current, { ...previous, version: "future" }), []);
  assert.deepEqual(compareRecords(current, { ...previous, scope: "other" }), []);
  assert.deepEqual(compareRecords(current, scoreAssessment(quick, { q1: 3 })), []);
});

test("safety and skipped responses are absent from saved evidence", () => {
  const result = scoreAssessment(quick, { q1: 4, q3: "skip" }, { safety: "skip" });
  assert(!result.domains.flatMap((domain) => domain.evidence).some((item) => item.id === "q3"));
  assert(!result.context.some((entry) => entry.id === "safety"));
});

test("corrupt or incomplete stored reports are not passed to the new renderer", () => {
  const good = report(3);
  assert.equal(isCurrentRecord(good), true);
  for (const patch of [{ domains: [null] }, { domains: [] }, { plan: null }, { support: {} }, { createdAt: "broken" }, { domains: [{ key: "load", evidence: null }] }]) {
    assert.equal(isCurrentRecord({ ...good, ...patch }), false);
  }
});
