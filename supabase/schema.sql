# Supabase 数据库 Schema

## 用户表 (profiles)
```sql
-- 扩展用户信息（关联 auth.users）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己的信息
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 策略：用户可以更新自己的信息
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 旅行表 (trips)
```sql
CREATE TABLE trips (
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

-- 策略：创建者可以查看/编辑
CREATE POLICY "Creators can view own trips" ON trips
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Creators can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = created_by);
```

## 旅行成员表 (trip_members)
```sql
-- 支持多人协作同一个旅行
CREATE TABLE trip_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

-- 策略：成员可以查看旅行
CREATE POLICY "Members can view trip" ON trip_members
  FOR SELECT USING (auth.uid() = user_id);

-- 策略：管理员可以添加/删除成员
CREATE POLICY "Admins can manage members" ON trip_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = trip_members.trip_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );
```

## 参与者表 (participants)
```sql
-- 旅行中的参与者（可以是非用户）
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 关联注册用户
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 策略：旅行成员可以查看参与者
CREATE POLICY "Trip members can view participants" ON participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = participants.trip_id
      AND tm.user_id = auth.uid()
    )
  );
```

## Family 表 (families)
```sql
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  weight DECIMAL(10,2) DEFAULT 1.00, -- 分摊权重（小孩可以设 0.5）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

-- 策略：旅行成员可以查看 Family
CREATE POLICY "Trip members can view families" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = families.trip_id
      AND tm.user_id = auth.uid()
    )
  );
```

## 支出表 (expenses)
```sql
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES participants(id) ON DELETE RESTRICT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  exchange_rate DECIMAL(12,6) DEFAULT 1.0,
  amount_in_base DECIMAL(12,2) NOT NULL, -- 转换为基础货币
  description TEXT NOT NULL,
  category TEXT DEFAULT '其他',
  expense_date DATE DEFAULT CURRENT_DATE,
  split_type TEXT DEFAULT 'all' CHECK (split_type IN ('all', 'families', 'participants')),
  target_family_ids UUID[] DEFAULT '{}', -- 指定 Family
  target_participant_ids UUID[] DEFAULT '{}', -- 指定人员
  receipt_url TEXT, -- 票据图片
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 策略：旅行成员可以查看支出
CREATE POLICY "Trip members can view expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
    )
  );

-- 策略：旅行成员可以添加支出
CREATE POLICY "Trip members can create expenses" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members tm
      WHERE tm.trip_id = expenses.trip_id
      AND tm.user_id = auth.uid()
    )
  );

-- 策略：只有支付人或管理员可以编辑/删除
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
```

## 索引优化
```sql
-- 常用查询索引
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trip_members_user ON trip_members(user_id);
CREATE INDEX idx_trip_members_trip ON trip_members(trip_id);
CREATE INDEX idx_participants_trip ON participants(trip_id);
CREATE INDEX idx_families_trip ON families(trip_id);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_payer ON expenses(payer_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
```

## 自动更新时间戳函数
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到需要的表
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
