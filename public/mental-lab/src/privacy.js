import { localStore } from "./storage.js";
import { assessmentMap, contextQuestions } from "./assessments.js";
import { scoreAssessment, isAnswer } from "./scoring.js";
import { readMoodRecords, MOOD_KEY } from "./care-tools.js";
import { readReset, RESET_KEY } from "./reset.js";
export const REPORT_KEY = "degendna-mental-lab-records";
export const DRAFT_KEY = "degendna-mental-lab-draft-v1";
export const PRIVATE_KEYS = [REPORT_KEY, DRAFT_KEY, MOOD_KEY, RESET_KEY];
const contextIds = new Set(contextQuestions.map((q) => q.id));
export function safeContext(context = {}) {
  return Object.fromEntries(
    contextQuestions.flatMap((q) =>
      q.options.some((o) => o[0] === context[q.id])
        ? [[q.id, context[q.id]]]
        : [],
    ),
  );
}
export function writeDraft(id, answers, context, storage) {
  const a = assessmentMap[id];
  if (!a || a.safetyOnly || context.safety === "yes")
    throw Error("不可保存这类内容");
  const clean = Object.fromEntries(
    a.items
      .filter((i) => isAnswer(answers[i.id]) || answers[i.id] === "skip")
      .map((i) => [i.id, answers[i.id]]),
  );
  storage.setItem(
    DRAFT_KEY,
    JSON.stringify({
      version: a.version,
      id,
      answers: clean,
      context: safeContext(context),
      at: new Date().toISOString(),
    }),
  );
}
export function readDraft(storage) {
  try {
    const d = JSON.parse(storage.getItem(DRAFT_KEY));
    const a = assessmentMap[d?.id];
    if (
      !a ||
      a.safetyOnly ||
      d.version !== a.version ||
      !d.answers ||
      typeof d.answers !== "object" ||
      !d.context ||
      typeof d.context !== "object" ||
      !Number.isFinite(Date.parse(d.at))
    )
      return null;
    const answers = Object.fromEntries(
      a.items
        .filter((i) => isAnswer(d.answers[i.id]) || d.answers[i.id] === "skip")
        .map((i) => [i.id, d.answers[i.id]]),
    );
    return { ...d, answers, context: safeContext(d.context) };
  } catch {
    return null;
  }
}
export function privateSnapshot(storage) {
  const values = {};
  for (const key of PRIVATE_KEYS) {
    const raw = storage.getItem(key);
    if (raw !== null) {
      if (raw.length > 2500000) throw Error("单项记录过大，请先减少记录。");
      values[key] = JSON.parse(raw);
    }
  }
  return {
    format: "degendna-private-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    values,
  };
}
// Imported reports are reconstructed from whitelisted item IDs and values, never rendered as supplied.
export function validateBackup(data) {
  if (
    !data ||
    data.format !== "degendna-private-backup" ||
    data.version !== 1 ||
    !data.values ||
    typeof data.values !== "object" ||
    Object.keys(data.values).some((k) => !PRIVATE_KEYS.includes(k))
  )
    throw Error("备份格式或版本不支持。");
  const v = data.values,
    out = {};
  if (v[REPORT_KEY] !== undefined) {
    if (!Array.isArray(v[REPORT_KEY]) || v[REPORT_KEY].length > 100)
      throw Error("自查记录格式错误。");
    out[REPORT_KEY] = v[REPORT_KEY].map((row) => {
      const a = assessmentMap[row?.id];
      if (
        !a ||
        a.safetyOnly ||
        row.version !== a.version ||
        !Array.isArray(row.domains) ||
        !Number.isFinite(Date.parse(row.createdAt))
      )
        throw Error("备份含不支持的旧版或无效报告，未导入。");
      const evidence = row.domains.flatMap((d) =>
          Array.isArray(d?.evidence) ? d.evidence : [],
        ),
        allowed = new Set(a.items.map((i) => i.id)),
        seen = new Set();
      const answers = {};
      for (const e of evidence) {
        if (!e || !allowed.has(e.id) || !isAnswer(e.value) || seen.has(e.id))
          throw Error("报告回答不完整或无效。");
        seen.add(e.id);
        answers[e.id] = e.value;
      }
      if (!Array.isArray(row.context)) throw Error("缺少情境记录。");
      const context = Object.fromEntries(
        row.context
          .filter((e) => e && contextIds.has(e.id))
          .map((e) => [e.id, e.value]),
      );
      return {
        ...scoreAssessment(a, answers, safeContext(context)),
        createdAt: row.createdAt,
        skipped:
          Number.isInteger(row.skipped) &&
          row.skipped >= 0 &&
          row.skipped <= a.items.length - evidence.length
            ? row.skipped
            : 0,
      };
    });
  }
  if (v[MOOD_KEY] !== undefined) {
    const s = { getItem: () => JSON.stringify(v[MOOD_KEY]) };
    if (
      !Array.isArray(v[MOOD_KEY]) ||
      v[MOOD_KEY].length > 100 ||
      readMoodRecords(s).length !== v[MOOD_KEY].length
    )
      throw Error("心情记录格式错误。");
    out[MOOD_KEY] = v[MOOD_KEY];
  }
  if (v[RESET_KEY] !== undefined) {
    const s = { getItem: () => JSON.stringify(v[RESET_KEY]) };
    if (
      !Array.isArray(v[RESET_KEY]) ||
      v[RESET_KEY].length > 100 ||
      readReset(s).length !== v[RESET_KEY].length
    )
      throw Error("工具记录格式错误。");
    out[RESET_KEY] = v[RESET_KEY];
  }
  if (v[DRAFT_KEY] !== undefined) {
    const d = readDraft({ getItem: () => JSON.stringify(v[DRAFT_KEY]) });
    if (!d) throw Error("草稿版本不支持。");
    out[DRAFT_KEY] = d;
  }
  return out;
}
export function replacePrivateData(data, storage) {
  const clean = validateBackup(data),
    prior = new Map(PRIVATE_KEYS.map((k) => [k, storage.getItem(k)]));
  try {
    for (const k of PRIVATE_KEYS)
      if (k in clean) storage.setItem(k, JSON.stringify(clean[k]));
      else storage.removeItem(k);
  } catch (error) {
    for (const [k, v] of prior) {
      try {
        v === null ? storage.removeItem(k) : storage.setItem(k, v);
      } catch {}
    }
    throw error;
  }
}
const bytesTo64 = (b) => {
  const bytes = new Uint8Array(b);
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
};
const from64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function derive(password, salt) {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
export async function encryptBackup(data, password) {
  if (typeof password !== "string" || password.length < 12)
    throw Error("请使用至少 12 个字符的备份密码。");
  const salt = crypto.getRandomValues(new Uint8Array(16)),
    iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(password, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );
  return {
    format: "degendna-encrypted",
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: 310000,
    salt: bytesTo64(salt),
    iv: bytesTo64(iv),
    cipher: bytesTo64(cipher),
  };
}
export async function decryptBackup(data, password) {
  if (
    data?.format !== "degendna-encrypted" ||
    data.version !== 1 ||
    data.algorithm !== "AES-256-GCM" ||
    data.kdf !== "PBKDF2-SHA256" ||
    data.iterations !== 310000 ||
    typeof data.salt !== "string" ||
    data.salt.length > 64 ||
    typeof data.iv !== "string" ||
    data.iv.length > 64 ||
    typeof data.cipher !== "string" ||
    data.cipher.length > 15000000
  )
    throw Error("不支持的加密备份。");
  try {
    const salt = from64(data.salt),
      iv = from64(data.iv);
    if (salt.length !== 16 || iv.length !== 12) throw Error();
    const key = await derive(password, salt);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      from64(data.cipher),
    );
    return JSON.parse(new TextDecoder().decode(plain));
  } catch {
    throw Error("无法解密：密码不正确或文件已损坏。");
  }
}
export function downloadFile(name, text, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function privacyView(el, onClear) {
  const root = el("section", {});
  let message = "",
    busy = false,
    pendingRestore = null,
    pendingClear = false;
  const render = () => {
    root.replaceChildren(
      el("header", { class: "workspace-head" }, [
        el("div", {}, [
          el("h2", {}, "隐私与备份"),
          el(
            "p",
            {},
            "自查、草稿、心情和 Reset 记录只留在当前浏览器。此处没有云同步。",
          ),
        ]),
      ]),
      el("section", { class: "care-card" }, [
        el("h3", {}, "哪些信息会离开浏览器？"),
        el(
          "p",
          {},
          "本模块不发送答案、分数或记录，不使用第三方分析脚本。访问网站本身仍会产生服务端访问日志。外部链接与小镜 AI 是单独服务；进入 AI 后主动提交的内容会发送到相应服务，不会自动附上这里的记录。",
        ),
        el(
          "p",
          {},
          "本地存储没有加密。同一浏览器的其他使用者和同源脚本可能访问它。清除浏览器数据会删除记录；更换设备不会自动同步。",
        ),
      ]),
      el(
        "form",
        {
          class: "care-card",
          onsubmit: async (e) => {
            e.preventDefault();
            if (busy) return;
            const form = e.currentTarget;
            const password = form.elements.password.value;
            try {
              busy = true;
              form
                .querySelectorAll("button")
                .forEach((b) => (b.disabled = true));
              message = "正在加密…";
              root.querySelector("[role=status]").textContent = message;
              const encrypted = await encryptBackup(
                privateSnapshot(localStore),
                password,
              );
              downloadFile(
                "degendna-private-backup.json",
                JSON.stringify(encrypted),
              );
              message = "已生成加密备份。请妥善保存文件和密码，密码无法找回。";
            } catch (error) {
              message = error.message;
            } finally {
              busy = false;
              render();
            }
          },
        },
        [
          el("h3", {}, "加密备份到自己的文件"),
          el(
            "p",
            {},
            "采用 AES-256-GCM；密码仅在本机用于加密，不会保存或上传。导出文件包含私密内容，请自行保管。",
          ),
          el("label", {}, [
            "备份密码（至少 12 个字符）",
            el("input", {
              type: "password",
              name: "password",
              minlength: 12,
              required: true,
              autocomplete: "new-password",
            }),
          ]),
          el(
            "button",
            { class: "secondary", type: "submit", disabled: busy },
            "下载加密备份",
          ),
        ],
      ),
      el(
        "form",
        {
          class: "care-card",
          onsubmit: async (e) => {
            e.preventDefault();
            if (busy) return;
            const form = e.currentTarget,
              file = form.elements.backup.files[0],
              password = form.elements.password.value;
            if (!file || file.size > 15000000) {
              message = "请选择不超过 15 MB 的备份文件。";
              render();
              return;
            }
            try {
              busy = true;
              form
                .querySelectorAll("button")
                .forEach((b) => (b.disabled = true));
              const encrypted = JSON.parse(await file.text()),
                data = await decryptBackup(encrypted, password);
              const clean = validateBackup(data);
              const counts = Object.entries(clean)
                .map(
                  ([k, v]) =>
                    `${k === REPORT_KEY ? "自查" : k === MOOD_KEY ? "心情" : k === RESET_KEY ? "工具" : "草稿"} ${Array.isArray(v) ? v.length : 1} 条`,
                )
                .join("，");
              pendingRestore = data;
              pendingClear = false;
              message = `已校验：${counts || "空备份"}。请在下方确认是否替换。`;
            } catch (error) {
              message = error.message || "恢复失败，当前数据未改变。";
            } finally {
              busy = false;
              render();
            }
          },
        },
        [
          el("h3", {}, "从加密文件恢复"),
          el(
            "p",
            {},
            "只接受本产品加密备份。先解密并校验，再询问是否替换；版本不支持时保留现有记录。",
          ),
          el("label", {}, [
            "选择备份文件",
            el("input", {
              type: "file",
              name: "backup",
              accept: ".json,application/json",
              required: true,
            }),
          ]),
          el("label", {}, [
            "备份密码",
            el("input", {
              type: "password",
              name: "password",
              required: true,
              autocomplete: "current-password",
            }),
          ]),
          el(
            "button",
            { class: "secondary", type: "submit", disabled: busy },
            "校验并恢复",
          ),
        ],
      ),
      el("section", { class: "care-card" }, [
        el("h3", {}, "清除全部本机私密数据"),
        el(
          "p",
          {},
          "清除自查报告、续答草稿、心情和 Reset 记录，并丢弃当前未保存内容。主题偏好保留，已下载的文件需要你自行删除。",
        ),
        el(
          "button",
          {
            class: "secondary",
            disabled: busy,
            onclick: () => {
              pendingClear = true;
              pendingRestore = null;
              message = "请在下方确认清除范围。尚未删除任何数据。";
              render();
            },
          },
          "清除全部私密数据",
        ),
      ]),
      ...(pendingRestore
        ? [
            el(
              "section",
              {
                class: "care-card",
                role: "region",
                "aria-label": "确认恢复备份",
              },
              [
                el("h3", {}, "确认替换本机记录"),
                el(
                  "p",
                  {},
                  "恢复将替换当前浏览器的自查、草稿、心情和 Reset 四类私密数据，备份中缺少的类别也会清空。建议先备份当前数据。",
                ),
                el(
                  "button",
                  {
                    class: "primary",
                    type: "button",
                    onclick: () => {
                      if (busy || !pendingRestore) return;
                      try {
                        replacePrivateData(pendingRestore, localStore);
                        onClear();
                        message = "备份已恢复，可以前往本地记录和 Reset 查看。";
                        pendingRestore = null;
                      } catch (error) {
                        message =
                          error.message || "恢复失败，已尝试保留原数据。";
                      }
                      render();
                    },
                  },
                  "确认恢复并替换",
                ),
                el(
                  "button",
                  {
                    class: "secondary",
                    type: "button",
                    onclick: () => {
                      pendingRestore = null;
                      message = "已取消，当前数据未改变。";
                      render();
                    },
                  },
                  "取消恢复",
                ),
              ],
            ),
          ]
        : []),
      ...(pendingClear
        ? [
            el(
              "section",
              {
                class: "care-card",
                role: "region",
                "aria-label": "确认清除私密数据",
              },
              [
                el("h3", {}, "确认清除四类私密数据"),
                el(
                  "p",
                  {},
                  "此操作会永久删除本机自查报告、续答草稿、心情和 Reset 记录，并清空当前未保存内容。主题偏好保留，已下载文件不会删除。",
                ),
                el(
                  "button",
                  {
                    class: "primary",
                    type: "button",
                    onclick: () => {
                      if (busy) return;
                      try {
                        for (const k of PRIVATE_KEYS) localStore.removeItem(k);
                        onClear();
                        message = "本机私密数据已清除。";
                        pendingClear = false;
                      } catch {
                        message = "未能全部清除，请检查浏览器存储权限。";
                      }
                      render();
                    },
                  },
                  "确认永久清除",
                ),
                el(
                  "button",
                  {
                    class: "secondary",
                    type: "button",
                    onclick: () => {
                      pendingClear = false;
                      message = "已取消，当前数据未改变。";
                      render();
                    },
                  },
                  "取消清除",
                ),
              ],
            ),
          ]
        : []),
      el("p", { role: "status", "aria-live": "polite" }, message),
    );
    root
      .querySelector?.(
        '[aria-label="确认恢复备份"] .secondary, [aria-label="确认清除私密数据"] .secondary',
      )
      ?.focus();
  };
  render();
  return root;
}
