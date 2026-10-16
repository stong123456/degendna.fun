import test from "node:test";
import assert from "node:assert/strict";
import {
  assessments,
  assessmentMap,
} from "../public/mental-lab/src/assessments.js";
import {
  tradingTopics,
  topicJourneys,
} from "../public/mental-lab/src/trading-topics.js";
import {
  scoreAssessment,
  compareRecords,
  isCurrentRecord,
} from "../public/mental-lab/src/scoring.js";
import { playResult } from "../public/mental-lab/src/play.js";
import {
  readReset,
  saveReset,
  weekReview,
  RESET_KEY,
  resetTools,
} from "../public/mental-lab/src/reset.js";
import {
  writeDraft,
  readDraft,
  DRAFT_KEY,
  REPORT_KEY,
  PRIVATE_KEYS,
  encryptBackup,
  decryptBackup,
  validateBackup,
  replacePrivateData,
  privateSnapshot,
} from "../public/mental-lab/src/privacy.js";
const memory = (initial) => {
  const rows = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => rows.get(k) ?? null,
    setItem: (k, v) => rows.set(k, v),
    removeItem: (k) => rows.delete(k),
    rows,
  };
};
for (const a of tradingTopics)
  test(`${a.id}: partial, skipped, resources and rare harm remain distinct`, () => {
    assert.equal(a.items.length, 12);
    assert.equal(a.domains.length, 4);
    assert.ok(a.items.every((i) => i.observes));
    assert.equal(a.scope, "过去 7 天");
    const all = Object.fromEntries(
      a.items.map((i) => [i.id, i.kind === "resource" ? 4 : 0]),
    );
    const r = scoreAssessment(a, all);
    assert.equal(r.score, null);
    assert.ok(isCurrentRecord(r));
    assert.equal(
      r.domains
        .filter((d) => d.kind === "burden")
        .reduce((n, d) => n + d.frequent, 0),
      0,
    );
    const partial = scoreAssessment(a, {
      [a.items[0].id]: 4,
      [a.items[1].id]: "skip",
    });
    assert.ok(partial.domains.every((d) => !d.interpretable));
    assert.equal(partial.skipped, 1);
    assert.equal(compareRecords(r, partial).length, 0);
    const harm = a.items.find((i) => i.notice === "financial");
    if (harm) {
      const rare = scoreAssessment(a, { [harm.id]: 1 });
      assert.equal(rare.notices.length, 1);
      assert.equal(rare.safetyTriggered, false);
    }
    assert.equal(
      scoreAssessment(a, all, { safety: "yes" }).safetyTriggered,
      true,
    );
  });
test("journeys map to actual tools and assessments; IDs do not overlap", () => {
  assert.equal(new Set(assessments.map((a) => a.id)).size, assessments.length);
  for (const j of topicJourneys) {
    assert.ok(assessmentMap[j.id]);
    assert.ok(resetTools.some((t) => t.id === j.tool));
  }
});
test("play requires all valid answers and handles ties without health scores", () => {
  assert.equal(playResult([]), null);
  assert.equal(playResult(Array(8)), null);
  assert.equal(playResult([0, 0, 0, 0, 0, 0, 0, 9]), null);
  assert.equal(playResult([0, 0, 0, 0, 0, 0, 0, 0]).name, "线索考古员");
  assert.equal(playResult([0, 1, 2, 3, 0, 1, 2, 3]).name, "多面探索者");
  assert.equal(playResult(Array(8).fill(0)).score, undefined);
});
test("draft strips safety and unknown fields, refuses old versions and malformed input", () => {
  const s = memory();
  writeDraft(
    "fomo",
    { fm1: 3, fm2: "skip", fm3: 9, unknown: 4 },
    { safety: "no", work: "clear", injected: "x" },
    s,
  );
  const raw = s.getItem(DRAFT_KEY);
  assert.ok(!raw.includes("safety"));
  const d = readDraft(s);
  assert.deepEqual(d.answers, { fm1: 3, fm2: "skip" });
  assert.deepEqual(d.context, { work: "clear" });
  assert.throws(() => writeDraft("fomo", {}, { safety: "yes" }, s));
  s.setItem(DRAFT_KEY, JSON.stringify({ ...d, version: "old" }));
  assert.equal(readDraft(s), null);
  s.setItem(DRAFT_KEY, "{");
  assert.equal(readDraft(s), null);
});
test("Reset validates shape, caps history, excludes future and old rows from week review", () => {
  const s = memory(),
    now = new Date("2026-10-16T00:00:00Z");
  const row = {
    version: 1,
    id: "a",
    tool: "pause",
    at: now.toISOString(),
    values: ["测试", "", "", ""],
  };
  for (let i = 0; i < 105; i++) saveReset({ ...row, id: `row${i}` }, s);
  assert.equal(readReset(s).length, 100);
  assert.throws(() => saveReset({ ...row, values: ["x"] }, s));
  assert.throws(() => saveReset({ ...row, tool: "fake" }, s));
  assert.throws(() =>
    saveReset({ ...row, values: ["x".repeat(1001), "", "", ""] }, s),
  );
  assert.equal(
    weekReview(
      [row, { ...row, at: "2020-01-01" }, { ...row, at: "2030-01-01" }],
      now,
    ).count,
    1,
  );
  s.setItem(RESET_KEY, "broken");
  assert.deepEqual(readReset(s), []);
});
test("encrypted backups round trip Unicode and larger files, reject wrong password and tampering", async () => {
  const text = { format: "test", text: "私密测试".repeat(40000) };
  const a = await encryptBackup(text, "test-password-12345");
  const b = await encryptBackup(text, "test-password-12345");
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.salt, b.salt);
  assert.ok(!JSON.stringify(a).includes("私密"));
  assert.deepEqual(await decryptBackup(a, "test-password-12345"), text);
  await assert.rejects(decryptBackup(a, "wrong-password"));
  await assert.rejects(
    decryptBackup(
      { ...a, cipher: a.cipher.slice(0, -8) + "AAAAAAAA" },
      "test-password-12345",
    ),
  );
  await assert.rejects(encryptBackup(text, "short"));
});
test("restore recalculates reports from evidence and rejects unknown keys and old versions", () => {
  const a = assessmentMap.fomo,
    r = scoreAssessment(a, Object.fromEntries(a.items.map((i) => [i.id, 3])));
  r.summary = "FORGED";
  const data = {
    format: "degendna-private-backup",
    version: 1,
    values: { [REPORT_KEY]: [r] },
  };
  const out = validateBackup(data)[REPORT_KEY][0];
  assert.notEqual(out.summary, "FORGED");
  assert.equal(out.domains[0].frequent, 3);
  assert.throws(() =>
    validateBackup({ ...data, values: { unauthorized: [] } }),
  );
  assert.throws(() =>
    validateBackup({
      ...data,
      values: { [REPORT_KEY]: [{ ...r, version: "old" }] },
    }),
  );
  const duplicate = structuredClone(r);
  duplicate.domains[0].evidence.push(duplicate.domains[0].evidence[0]);
  assert.throws(() =>
    validateBackup({ ...data, values: { [REPORT_KEY]: [duplicate] } }),
  );
});
test("invalid backup never changes existing local data and clears only owned keys on success", () => {
  const s = memory({ [REPORT_KEY]: "[]", unrelated: "keep" });
  assert.throws(() => replacePrivateData({}, s));
  assert.equal(s.getItem(REPORT_KEY), "[]");
  replacePrivateData(
    { format: "degendna-private-backup", version: 1, values: {} },
    s,
  );
  assert.ok(PRIVATE_KEYS.every((k) => s.getItem(k) === null));
  assert.equal(s.getItem("unrelated"), "keep");
  assert.deepEqual(privateSnapshot(s).values, {});
});
test("storage failure during restoration attempts rollback", () => {
  const base = memory({ [REPORT_KEY]: "[]", [RESET_KEY]: "[]" });
  let failed = false;
  const s = {
    ...base,
    setItem(k, v) {
      if (k === RESET_KEY && !failed) {
        failed = true;
        throw Error("quota");
      }
      base.setItem(k, v);
    },
  };
  const data = {
    format: "degendna-private-backup",
    version: 1,
    values: { [REPORT_KEY]: [], [RESET_KEY]: [] },
  };
  assert.throws(() => replacePrivateData(data, s));
  assert.equal(base.getItem(REPORT_KEY), "[]");
  assert.equal(base.getItem(RESET_KEY), "[]");
});

test("denied browser Storage getter does not break reads and failed writes remain explicit", async () => {
  const { localStore } = await import("../public/mental-lab/src/storage.js");
  const { readMoodRecords } = await import(
    "../public/mental-lab/src/care-tools.js"
  );
  const prior = globalThis.window;
  globalThis.window = Object.defineProperty({}, "localStorage", {
    get() {
      throw new Error("Storage denied");
    },
  });
  try {
    assert.equal(readDraft(localStore), null);
    assert.deepEqual(readReset(localStore), []);
    assert.deepEqual(readMoodRecords(localStore), []);
    assert.throws(
      () => writeDraft("fomo", { fm1: 3 }, {}, localStore),
      /Storage denied/,
    );
    assert.throws(() => privateSnapshot(localStore), /Storage denied/);
  } finally {
    if (prior === undefined) delete globalThis.window;
    else globalThis.window = prior;
  }
});
