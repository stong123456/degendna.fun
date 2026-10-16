import test from "node:test";
import assert from "node:assert/strict";
import {
  privacyView,
  encryptBackup,
  REPORT_KEY,
  PRIVATE_KEYS,
} from "../public/mental-lab/src/privacy.js";
const makeStorage = () => {
  const m = new Map([
    [REPORT_KEY, "[]"],
    ["unrelated", "keep"],
  ]);
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
    m,
  };
};
const makeElement = (tag, attrs = {}, children = []) => ({
  tag,
  attrs,
  children: Array.isArray(children) ? children : [children],
  replaceChildren(...nodes) {
    this.children = nodes;
  },
});
const all = (node) => [
  node,
  ...(node?.children || [])
    .filter((c) => typeof c === "object" && c)
    .flatMap(all),
];
test("restore confirmation cancellation makes no writes and preserves current memory", async () => {
  const priorWindow = globalThis.window,
    priorConfirm = globalThis.confirm,
    storage = makeStorage();
  let cleared = false;
  globalThis.window = { localStorage: storage };
  try {
    const encrypted = await encryptBackup(
      { format: "degendna-private-backup", version: 1, values: {} },
      "unit-only-password-123",
    );
    const root = privacyView(makeElement, () => {
      cleared = true;
    });
    const forms = all(root).filter((n) => n.tag === "form");
    await forms[1].attrs.onsubmit({
      preventDefault() {},
      currentTarget: {
        elements: {
          backup: {
            files: [
              { size: 1024, text: async () => JSON.stringify(encrypted) },
            ],
          },
          password: { value: "unit-only-password-123" },
        },
        querySelectorAll: () => [],
      },
    });
    assert.ok(
      all(root).some(
        (n) =>
          n.attrs?.role === "region" &&
          n.attrs["aria-label"] === "确认恢复备份",
      ),
    );
    assert.equal(storage.getItem(REPORT_KEY), "[]");
    all(root)
      .find((n) => n.tag === "button" && n.children.includes("取消恢复"))
      .attrs.onclick();
    assert.equal(storage.getItem(REPORT_KEY), "[]");
    assert.equal(storage.getItem("unrelated"), "keep");
    assert.equal(cleared, false);
    assert.ok(
      all(root).some(
        (n) =>
          n.attrs?.role === "status" &&
          n.children.includes("已取消，当前数据未改变。"),
      ),
    );
  } finally {
    if (priorWindow === undefined) delete globalThis.window;
    else globalThis.window = priorWindow;
    if (priorConfirm === undefined) delete globalThis.confirm;
    else globalThis.confirm = priorConfirm;
  }
});
test("clear controls honour cancellation, then delete only owned data and clear memory", () => {
  const priorWindow = globalThis.window,
    priorConfirm = globalThis.confirm,
    storage = makeStorage();
  let cleared = 0;
  for (const k of PRIVATE_KEYS) storage.setItem(k, "[]");
  globalThis.window = { localStorage: storage };
  try {
    const root = privacyView(makeElement, () => {
      cleared++;
    });
    const button = all(root).find(
      (n) => n.tag === "button" && n.children.includes("清除全部私密数据"),
    );
    button.attrs.onclick();
    all(root)
      .find((n) => n.tag === "button" && n.children.includes("取消清除"))
      .attrs.onclick();
    assert.equal(cleared, 0);
    assert.ok(PRIVATE_KEYS.every((k) => storage.getItem(k) !== null));
    button.attrs.onclick();
    all(root)
      .find((n) => n.tag === "button" && n.children.includes("确认永久清除"))
      .attrs.onclick();
    assert.equal(cleared, 1);
    assert.ok(PRIVATE_KEYS.every((k) => storage.getItem(k) === null));
    assert.equal(storage.getItem("unrelated"), "keep");
  } finally {
    if (priorWindow === undefined) delete globalThis.window;
    else globalThis.window = priorWindow;
    if (priorConfirm === undefined) delete globalThis.confirm;
    else globalThis.confirm = priorConfirm;
  }
});
