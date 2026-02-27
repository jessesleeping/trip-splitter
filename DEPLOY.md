# 🚀 部署到 Vercel

> 5 分钟上线，免费 HTTPS，自动 CI/CD

---

## 📋 前提条件

- ✅ GitHub 账号
- ✅ Vercel 账号（可用 GitHub 登录）
- ✅ Supabase 项目已配置

---

## 🔧 部署步骤

### 步骤 1: 推送到 GitHub

```bash
# 初始化 Git（如果还没有）
cd /home/admin/openclaw/workspace/trip-splitter
git init
git add .
git commit -m "Initial commit - Trip Splitter v1.0"

# 创建 GitHub 仓库（手动或 CLI）
# 方式 A: 使用 GitHub CLI
gh repo create trip-splitter --public --source=. --push

# 方式 B: 手动操作
# 1. 打开 https://github.com/new
# 2. 创建仓库 trip-splitter
# 3. 复制仓库地址
# 4. 执行：
git remote add origin https://github.com/YOUR_USERNAME/trip-splitter.git
git push -u origin main
```

---

### 步骤 2: 连接 Vercel

1. **访问**: https://vercel.com/new
2. **登录**: 使用 GitHub 账号
3. **导入项目**: 选择 `trip-splitter` 仓库
4. **配置环境变量**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://zrbcxtamglfjarupqkic.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_B9aae0u1JmEcOybu_E409Q_Z2r9GkDt
   ```
5. **点击 Deploy**

---

### 步骤 3: 等待部署完成

Vercel 会自动：
- 安装依赖
- 构建项目
- 分配域名（如：`trip-splitter-xxx.vercel.app`）

通常 2-3 分钟完成。

---

### 步骤 4: 配置 Supabase 重定向 URL

**重要**: 邮箱确认/重置密码需要配置回调 URL

1. 打开 Supabase Dashboard
2. 进入 **Authentication** → **URL Configuration**
3. 添加以下 URL 到 **Site URL** 和 **Redirect URLs**:
   ```
   https://trip-splitter-xxx.vercel.app
   https://trip-splitter-xxx.vercel.app/auth/callback
   ```
4. 保存

---

### 步骤 5: 测试

1. 访问 Vercel 分配的域名
2. 注册账户
3. 检查邮箱确认
4. 登录测试

---

## 🎯 自定义域名（可选）

如果有自己的域名：

1. Vercel Dashboard → Project Settings → Domains
2. 添加域名（如：`trips.yourdomain.com`）
3. 按提示配置 DNS

---

## 🔄 自动更新

之后每次 push 到 GitHub：
- Vercel 自动检测变更
- 自动构建部署
- 零配置 CI/CD

---

## 📊 免费额度

Vercel Hobby 计划：
- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 自定义域名

对于个人项目完全够用！

---

## 🐛 故障排查

### 构建失败

检查 Vercel 部署日志：
```bash
# 本地测试构建
npm run build
```

### 环境变量问题

确认 Vercel 中配置了：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase 认证失败

检查 Redirect URLs 是否包含 Vercel 域名

---

## 🎉 完成！

部署后，你可以：
- 分享链接给朋友
- 邀请他们协作旅行
- 手机/电脑随时访问

---

*需要帮助？告诉我部署中遇到的问题！*
