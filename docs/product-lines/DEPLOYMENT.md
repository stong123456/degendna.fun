# 生产发布记录 · 2026-10-16

- 目标：现有 Fly.io 应用 `degendna-fun-web`，正式域名 https://degendna.fun/ 。
- GitHub 功能更新已通过 PR #1 合并：https://github.com/stong123456/degendna.fun/pull/1 。
- 部署代码文件树：`4d3f2e6fbaf183b6cef7f93f88c0d6d37ba62664`，与 GitHub 已推送代码一致。
- 发布前重新执行：93 项自动测试通过，13 项源码级检查通过。
- Fly 发布版本：9。沿用已有应用、区域及机器配置，滚动更新成功。
- 新镜像：`registry.fly.io/degendna-fun-web:deployment-01M51JXSE3WPXD14D8HY45A829`。
- 镜像摘要：`sha256:d6aa2684c42e8ac7170986cd9b4339cd16de353c715d817fdce6da99c11a0cb2`。
- Fly 机器检查、HTTP 健康检查和 DNS 检查通过。
- 正式域名 `/api/health` 返回 `ok: true`、`frontend: product-lines-20261016`。
- 12 个发生变化的公开前端文件逐一下载核对 SHA-256，全部与本地测试源码一致，无失败项。

## 回滚依据

发布前版本为 8，镜像：

```
registry.fly.io/degendna-fun-web:deployment-01M3JYRRAWC63KW420KCPZ41G1
```

需要回滚时，使用已授权的 Fly CLI 对同一应用部署该既有镜像，并重新检查机器健康和正式域名。不要创建新应用、修改 DNS 或覆盖服务端秘密来回滚代码。

## 边界

上线验证不等于临床验证。独立专业审阅、真人认知访谈、目标人群试测及信效度研究仍未完成；产品继续以原创自我观察工具呈现。支付与云同步没有开通。

## 正式域名浏览器冒烟

实际访问 https://degendna.fun/ ，首页三条产品入口可见。只回答一项合成 FOMO 题后，报告正确保留信息不足与非诊断边界；可打开“下单前暂停卡”。隐私页可见加密备份和二次清除确认，打开后取消，未保存、恢复或删除任何记录。

手机 390×844 未发现横向溢出；无应用控制台错误或运行时异常。远程测试浏览器的部分中文字形缺失，属于该环境视觉检查的限制，不据此声称所有平台字体显示均已验证。本机 Mac 桌面/手机尺寸截图已在先前验收中检查。浏览器对密码表单给出一条非错误可访问性建议；此处是文件备份密码，不是账户登录表单，不额外收集用户名。

## 结果内容审计修订 · Fly v10

2026-10-16 用户明确允许独立 Chrome 验收后，完成本地132项浏览器检查（含三主题、桌面/手机、18模块、导出/保存回看、小镜主动读取与Play下载），120项自动测试和19项源码检查；小镜正式构建通过。

- PR #2 已合并：https://github.com/stong123456/degendna.fun/pull/2 。合并提交 `a1d3f2b2ea675462b61f3ac94a4c63a0d19ca8b4`。
- 实际部署源码树 `64a7f71ae5e81ba82c5adecbb3918f4e32c78cae`，与 GitHub 对应功能提交及本机已验收版本一致。
- Fly 发布版本10，现有应用、配置和机器，滚动更新完成，未创建新应用。
- 镜像 `registry.fly.io/degendna-fun-web:deployment-01M51N9ANY5Z5EK7617MNPT21X`。
- 摘要 `sha256:f52043bcbae77db94da4f693d419e6ca04d24da58e1498de0ae87e2b0d6d9aab`。
- 正式域名健康检查 `ok: true`、`frontend: result-audit-20261016-v2`；访问后机器HTTP服务检查通过。现有配置仍允许空闲自动暂停，首次访问可自动唤醒。
- 11个变化的公开前端文件逐一下载比较SHA-256，全部与本机一致。没有以发布命令成功代替实际文件核对。
- 独立Chrome实际访问正式域名，在1440×1000和390×844生成完整FOMO结果，确认新版解读版本、优势/消耗内容、无横向溢出且没有自动保存；线上Play四方向并列解释通过。无应用控制台错误。
- 正式域名截图已在本机打开核对，位于本机 `outputs/result-audit/10-production-result-1440.png`、`10-production-result-390.png` 和 `11-production-play-mobile.png`。不得把旧版截图当新版发布证据。

本轮回滚目标为前一版9镜像：

```
registry.fly.io/degendna-fun-web:deployment-01M51JXSE3WPXD14D8HY45A829
```

独立专业内容审阅、认知访谈与实证效度研究仍未完成；不宣称临床验证或终身人格测量。以上功能已上线，但这些人类研究任务仍须如实列为待办。
