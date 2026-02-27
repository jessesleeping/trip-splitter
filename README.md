# ✈️ Trip Splitter - 旅游分账应用

> 支持 Family 维度聚合结算的旅游分账工具 · 多币种 · 实时汇率

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![Status](https://img.shields.io/badge/status-MVP-green)

## 🎯 功能特性

### 核心功能
- ✅ **旅行管理** - 创建旅行、邀请参与者
- ✅ **Family 分组** - 支持单人/多人 Family，可设置分摊权重（如小孩半价）
- ✅ **支出记录** - 个人录入支出，支持多币种和**实时汇率转换**
- ✅ **灵活分摊** - 全体分摊/指定 Family 分摊/指定人员分摊
- ✅ **结算中心** - Family 维度聚合结算，优化交易次数
- ✅ **权限控制** - 仅创建者和管理员可修改/删除支出
- ✅ **数据校验** - 收支平衡检查、**重复支出检测**
- ✅ **本地存储** - 数据保存在浏览器，隐私安全

### 亮点功能
- 🌍 **多币种支持** - 12 种常见币种，实时汇率自动获取
- 🎨 **精美 UI** - 渐变背景、卡片设计、流畅动画
- 📱 **响应式** - 手机/电脑完美适配
- 💾 **离线可用** - LocalStorage 持久化，无需联网

---

## 🚀 快速开始

### 方式一：本地运行（推荐）

```bash
cd trip-splitter
./start.sh
```

访问 http://localhost:3000

### 方式二：手动启动

```bash
cd trip-splitter
npm install
npm run dev
```

### 方式三：部署到 Vercel

```bash
npm install -g vercel
vercel login
vercel
```

---

## 📊 使用示例

### 场景：3 个家庭日本游

**参与人员**：
- 张家：张三、张太太
- 李家：李四、李太太
- 王家：王五（单人 Family）

**支出记录**：
1. 张三支付机票 5000 CNY（全体分摊）
2. 李四支付酒店 8000 JPY（全体分摊，实时汇率 0.05 = 400 CNY）
3. 王五支付晚餐 1500 CNY（张家 + 李家分摊）

**结算结果**：
```
张家余额：+2150 CNY（应该收钱）💰
李家余额：+1650 CNY（应该收钱）💰
王家余额：-3800 CNY（应该付钱）💸

结算方案：
王家 → 张家：2150 CNY
王家 → 李家：1650 CNY
```

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + React + Tailwind CSS |
| 存储 | LocalStorage（可扩展 Supabase） |
| 汇率 | exchangerate-api.com（30 分钟缓存） |
| 部署 | Vercel |

---

## 📁 项目结构

```
trip-splitter/
├── src/
│   ├── app/
│   │   └── page.tsx              # 主页面（美化版）
│   ├── components/
│   │   ├── TripList.tsx          # 旅行列表（渐变卡片）
│   │   ├── TripExpenseList.tsx   # 支出列表（精美排版）
│   │   ├── FamilySettlement.tsx  # 结算展示（可视化）
│   │   ├── ExpenseForm.tsx       # 支出表单（实时汇率）
│   │   └── CreateTripForm.tsx    # 创建旅行
│   └── lib/
│       ├── settlement.ts         # 结算算法
│       ├── currency.ts           # 汇率工具（带缓存）
│       └── storage.ts            # LocalStorage 持久化
├── schema.sql                    # 数据库设计（Supabase 备用）
├── start.sh                      # 一键启动
├── README.md                     # 本文件
└── DEPLOYMENT.md                 # 部署指南
```

---

## 🔧 配置

### 环境变量（v1.0+ 云端同步）

```bash
# 复制示例文件
cp .env.example .env.local

# 编辑 .env.local，填入 Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**获取 Supabase 密钥**:
1. 访问 https://supabase.com 创建项目
2. Settings → API → 复制 Project URL 和 anon key
3. 详见 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### LocalStorage 模式（v0.x）

无需配置，开箱即用。数据保存在浏览器本地。

---

## 📝 更新日志

### v0.2.0 (2026-02-27) - UI 美化 + 实时汇率
- 🎨 全面美化 UI（渐变背景、卡片设计、动画效果）
- 💱 集成实时汇率 API（30 分钟缓存）
- 💾 实现 LocalStorage 数据持久化
- ⚠️ 添加重复支出检测
- 👑 自动设置旅行创建者为管理员
- 📱 优化移动端体验

### v0.1.0 (2026-02-27) - MVP
- ✅ 核心功能实现
- ✅ 结算算法
- ✅ 多币种支持
- ✅ 基础 UI 组件

---

## 🚧 开发计划

### v0.3.0（下一步）
- [ ] 数据导出（Excel/PDF）
- [ ] 支出统计图表
- [ ] 预算提醒
- [ ] 搜索/筛选功能

### v1.0.0
- [ ] 用户认证（邮箱/微信登录）
- [ ] 云端同步（Supabase）
- [ ] 旅行邀请功能
- [ ] 票据拍照上传

### v2.0.0
- [ ] 微信小程序
- [ ] 支付集成（微信/支付宝）
- [ ] 多语言支持
- [ ] 智能分类（AI）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 💡 灵感来源

- Splitwise - 个人分账应用
- Tricount - 旅行分账工具
- 现实需求 - 多次旅行分账痛点

---

## 📞 支持

遇到问题？
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md)
2. 检查 Issue 列表
3. 提交新 Issue

---

**Made with ❤️ for travelers**

*最后更新：2026-02-27*
