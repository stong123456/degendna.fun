import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  assessments,
  assessmentMap,
} from "../public/mental-lab/src/assessments.js";
import {
  tradingTopics,
  topicJourneys,
} from "../public/mental-lab/src/trading-topics.js";
import { resetTools } from "../public/mental-lab/src/reset.js";
const findings = [];
const check = (name, fn) => {
  try {
    fn();
    findings.push({ name, status: "PASS" });
  } catch (e) {
    findings.push({ name, status: "FAIL", reason: e.message });
  }
};
const live = assessments.filter((a) => !a.safetyOnly);
check("18 original self-checks and 353 observation items", () => {
  assert.equal(live.length, 18);
  assert.equal(
    live.reduce((n, a) => n + a.items.length, 0),
    353,
  );
});
check(
  "new topics have an explicit version, purpose, direction and next step for every item",
  () => {
    for (const a of tradingTopics) {
      assert.ok(a.version);
      assert.equal(a.items.length, 12);
      for (const d of a.domains) {
        assert.ok(["resource", "burden"].includes(d.kind));
        assert.ok(d.meaning && d.limit && d.action);
        assert.ok(d.items.every((i) => i.observes && i.dimension === d.key));
      }
    }
  },
);
check("all eight user journeys resolve to existing tools", () => {
  assert.equal(topicJourneys.length, 8);
  for (const j of topicJourneys) {
    assert.ok(assessmentMap[j.id]);
    assert.ok(resetTools.some((t) => t.id === j.tool));
  }
});
for (const name of [
  "storage.js",
  "app.js",
  "play.js",
  "reset.js",
  "privacy.js",
  "care-tools.js",
  "scoring.js",
  "assessments.js",
  "trading-topics.js",
]) {
  const source = await readFile(
    new URL(`../public/mental-lab/src/${name}`, import.meta.url),
    "utf8",
  );
  check(`${name}: no outbound answer transport`, () =>
    assert.ok(
      !/\b(fetch\s*\(|sendBeacon\s*\(|XMLHttpRequest\s*\(|WebSocket\s*\()/u.test(
        source,
      ),
    ),
  );
}
const html = await readFile(
  new URL("../public/index.html", import.meta.url),
  "utf8",
);
check("entrypoint has no third-party scripts or analytics", () =>
  assert.ok(!/<script[^>]+src=["']https?:/u.test(html)),
);
const result = {
  date: new Date().toISOString(),
  scope:
    "Source-level product checks only; not clinical validation or a production penetration test.",
  findings,
};
console.log(JSON.stringify(result, null, 2));
if (findings.some((f) => f.status === "FAIL")) process.exitCode = 1;
