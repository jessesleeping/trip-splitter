# Trip Splitter - 部署指南

## 🚀 快速部署到 Vercel（推荐）

### 步骤 1：准备代码

```bash
cd /home/admin/openclaw/workspace/trip-splitter

# 初始化 Git（如未初始化）
git init
git add .
git commit -m "Initial commit"
```

### 步骤 2：部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
vercel
```

按提示操作：
- Set up and deploy? **Y**
- Which scope? （选择你的账户）
- Link to existing project? **N**
- Project name? **trip-splitter**
- Directory? **.**
- Override settings? **N**

### 步骤 3：访问应用

部署完成后，Vercel 会提供一个 URL：
```
https://trip-splitter-xxx.vercel.app
```

---

## 🖥️ 本地运行

### 安装依赖

```bash
cd trip-splitter
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

---

## ☁️ 部署到 Supabase（可选 - 数据持久化）

### 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com
2. 创建新项目
3. 记录 Project URL 和 Anon Key

### 步骤 2：运行数据库 Schema

在 Supabase SQL Editor 中运行 `schema.sql` 文件内容

### 步骤 3：配置环境变量

创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

### 步骤 4：更新代码

修改 `src/app/page.tsx` 使用 Supabase 客户端：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 📱 移动端优化

应用已使用 Tailwind CSS 响应式设计，在手机上自动适配：

- 触摸友好的按钮大小
- 移动端优化的表单
- 自适应布局

---

## 🔒 安全注意事项

### 当前版本（MVP）
- 数据存储在浏览器本地（LocalStorage）
- 无用户认证
- 适合个人使用或可信小团体

### 生产环境建议
1. 添加用户认证（Supabase Auth / NextAuth）
2. 启用 HTTPS（Vercel 默认提供）
3. 设置行级安全策略（RLS）
4. 添加速率限制
5. 启用 CORS 保护

---

## 📊 性能优化

### 已实现
- ✅ 代码分割（Next.js 自动）
- ✅ 图片优化
- ✅ 响应式设计

### 可优化
- [ ] 添加 Service Worker（离线支持）
- [ ] 启用缓存策略
- [ ] 压缩静态资源

---

## 🐛 故障排查

### 问题：依赖安装失败

```bash
# 清除缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题：开发服务器启动失败

```bash
# 检查端口占用
lsof -i :3000

# 或使用不同端口
npm run dev -- -p 3001
```

### 问题：部署失败

```bash
# 查看构建日志
vercel logs

# 本地测试构建
npm run build
```

---

## 📞 支持

遇到问题？
1. 查看 [README.md](./README.md)
2. 检查 Issue 列表
3. 提交新 Issue

---

**Happy Coding! 🎉**
