# Supabase 验证码邮件模板

项目 Authentication → Emails → Templates。

分别打开 Magic Link 和 Confirm signup，将主题设为「DegenDNA 邮箱验证码」，把 otp.html 全部内容粘贴到 Source 编辑器并保存。必须保留 `{{ .Token }}`，不要替换成固定数字或 ConfirmationURL。

2026-10-16：真实邮件已送达，但用户反馈仅有登录链接。说明数字验证码模板尚未完成配置；当前不能标记真实 OTP 登录通过。修改后重新申请一次邮件，旧邮件不会改变。

检查 Email provider 的 OTP 长度为6位；如平台设置不同，应明确统一配置与前后端验证规则，不能截取验证码。保持邮箱确认开启，不能通过关闭确认绕过登录测试。

公开运营另需配置自有 SMTP 并验证真实收件人、限额及发信域名，默认邮件服务不能作为完成公开运营验收的证据。
