# 📋 Supabase 数据库迁移

> 版本：1.0.0  
> 项目：zrbcxtamglfjarupqkic  
> 最后更新：2026-02-27

---

## 📄 表结构概览

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `profiles` | 用户资料 | id, email, full_name |
| `trips` | 旅行信息 | id, name, created_by |
| `trip_members` | 旅行成员 | trip_id, user_id, role |
| `families` | Family 分组 | id, trip_id, name, weight |
| `participants` | 参与者 | id, trip_id, name, family_id |
| `expenses` | 支出记录 | id, trip_id, payer_id, amount |

---

## 🔧 执行迁移

### 方式 1: SQL Editor（推荐）

1. 打开 https://supabase.com/dashboard/project/zrbcxtamglfjarupqkic/sql/new
2. 全选复制下方 SQL 代码
3. 粘贴到编辑器
4. 点击 **Run**

### 方式 2: Supabase CLI

```bash
supabase db push
```

---

## 📝 完整 SQL

```sql
-- =====================================================
-- Trip Splitter 数据库 Schema v1.0.0
-- =====================================================

-- 1. 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. 旅行表
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  base_currency TEXT DEFAULT 'CNY',
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own trips" ON trips
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Creators can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = created_by);

-- 3. 旅行成员表
CREATE TABLE IF NOT EXISTS trip_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view trip" ON trip_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage members" ON trip_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = trip_members.trip_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- 4. Family 表
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  weight DECIMAL(10,2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view families" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = families.trip_id
      AND tm.user_id = auth.uid()
    )
  );

-- 5. 参与者表
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view participants" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = participants.trip_id
      AND tm.user_id = auth.uid()
    )
  );

-- 6. 支出表
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES participants(id) ON DELETE RESTRICT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  exchange_rate DECIMAL(12,6) DEFAULT 1.0,
  amount_in_base DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT '其他',
  expense_date DATE DEFAULT CURRENT_DATE,
  split_type TEXT DEFAULT 'all' CHECK (split_type IN ('all', 'families', 'participants')),
  target_family_ids UUID[] DEFAULT '{}',
  target_participant_ids UUID[] DEFAULT '{}',
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create expenses" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Payers or admins can update expenses" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.id = expenses.payer_id
      AND p.user_id = auth.uid()
    )
  );

-- 7. 索引优化
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
CREATE INDEX IF NOT EXISTS idx_trip_members_user ON trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_participants_trip ON participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_families_trip ON families(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payer ON expenses(payer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- 8. 自动更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
```

---

## ✅ 验证迁移

```sql
-- 检查所有表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- 应该返回：
-- expenses
-- families
-- participants
-- profiles
-- trip_members
-- trips
```

---

## 📚 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-02-27 | 初始版本 |

---

*下次迁移时创建 `002_xxx.sql` 文件*
