# Supabase 配置指南

> 2 天实施计划 · 用户认证 + 云端同步

---

## 📋 第 1 天：基础设置

### 步骤 1: 创建 Supabase 项目 (15 分钟)

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 填写项目信息：
   - **Name**: trip-splitter
   - **Database Password**: 保存好（后续用不到，但需要记录）
   - **Region**: 选择最近的（亚洲选 Singapore/Tokyo）
4. 等待项目创建（约 2 分钟）

### 步骤 2: 获取 API 密钥 (5 分钟)

1. 进入项目 → Settings → API
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGci...`（以 `eyJ` 开头）

### 步骤 3: 配置环境变量 (5 分钟)

```bash
cd /home/admin/openclaw/workspace/trip-splitter

# 创建 .env.local 文件
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=你的 Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon key
EOF

# 验证
cat .env.local
```

### 步骤 4: 运行数据库迁移 (30 分钟)

**方式 A: 使用 Supabase Dashboard（推荐新手）**

1. 进入项目 → SQL Editor
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 全部内容
4. 点击 "Run" 执行
5. 确认所有表创建成功

**方式 B: 使用 Supabase CLI（推荐）**

```bash
# 安装 CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref 你的项目 ID

# 推送迁移
supabase db push
```

### 步骤 5: 配置邮箱认证 (10 分钟)

默认情况下，Supabase 需要邮箱确认。开发阶段可以禁用：

1. 进入项目 → Authentication → Providers
2. 找到 "Email" → 关闭 "Confirm email"
3. 保存

### 步骤 6: 安装依赖 (5 分钟)

```bash
cd /home/admin/openclaw/workspace/trip-splitter
npm install @supabase/supabase-js
```

---

## 📋 第 2 天：代码集成

### 步骤 7: 测试认证功能 (1 小时)

创建测试页面验证登录注册：

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:3000，应该能看到登录按钮。

### 步骤 8: 数据迁移脚本 (2 小时)

创建从 LocalStorage 迁移到 Supabase 的脚本：

```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from '@/lib/supabase';
import { loadFromStorage } from '@/lib/storage';

export async function migrateData() {
  const localData = loadFromStorage();
  const user = await getCurrentUser();
  
  if (!user) {
    console.error('请先登录');
    return;
  }
  
  // 迁移旅行
  for (const trip of localData.trips) {
    const { data, error } = await supabase
      .from('trips')
      .insert({ ...trip, created_by: user.id });
    
    if (error) console.error('迁移旅行失败:', error);
  }
  
  console.log('迁移完成！');
}
```

### 步骤 9: 测试完整流程 (1 小时)

测试清单：
- [ ] 注册新用户
- [ ] 登录
- [ ] 创建旅行
- [ ] 添加参与者
- [ ] 添加支出
- [ ] 查看结算
- [ ] 登出再登录，数据应该还在

---

## 🔧 故障排查

### 问题 1: "Missing Supabase environment variables"

**解决**: 确认 `.env.local` 文件存在且内容正确

```bash
cat .env.local
# 应该看到两行配置
```

### 问题 2: "Invalid API key"

**解决**: 检查使用的是 anon key（不是 service role key）

### 问题 3: 登录成功但数据不显示

**解决**: 检查 RLS（Row Level Security）策略

```sql
-- 在 SQL Editor 运行
SELECT * FROM trips;
-- 应该能看到数据
```

### 问题 4: 邮箱收不到确认信

**解决**: 开发阶段禁用邮箱确认（见步骤 5）

---

## 📊 数据库 Schema 概览

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `profiles` | 用户资料 | id, email, full_name |
| `trips` | 旅行 | id, name, created_by |
| `trip_members` | 旅行成员 | trip_id, user_id, role |
| `participants` | 参与者 | id, trip_id, name |
| `families` | Family | id, trip_id, name, weight |
| `expenses` | 支出 | id, trip_id, payer_id, amount |

---

## 🎯 完成标准

第 2 天结束时，应该能够：

1. ✅ 注册/登录账户
2. ✅ 创建旅行（数据保存到云端）
3. ✅ 添加支出（数据保存到云端）
4. ✅ 登出再登录，数据依然存在
5. ✅ 看到自己的用户信息

---

## 🚀 下一步（可选）

完成基础功能后，可以考虑：

1. **旅行邀请** - 通过邮箱邀请朋友加入旅行
2. **实时协作** - 多人同时记账，实时同步
3. **数据导出** - 导出 Excel/PDF
4. **票据上传** - 使用 Supabase Storage 存储收据图片

---

## 📞 需要帮助？

- Supabase 文档：https://supabase.com/docs
- 项目 Issue: 提交问题描述
- 邮件支持：联系开发者

---

*最后更新：2026-02-27*
