-- Trip Splitter 数据库 Schema
-- 支持多币种、Family 聚合结算的旅游分账系统

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. 旅行表
-- ============================================
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    base_currency VARCHAR(3) DEFAULT 'CNY',  -- 基础结算货币
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. 参与者表
-- ============================================
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,  -- 参与者姓名（可手动输入）
    email VARCHAR(255),  -- 可选，用于邀请
    is_admin BOOLEAN DEFAULT FALSE,  -- 是否为管理员
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trip_id, user_id)  -- 同一旅行中同一用户只能有一个记录
);

-- ============================================
-- 4. Family 表
-- ============================================
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,  -- Family 名称（如"张家"）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. Family 成员关联表
-- ============================================
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) DEFAULT 1.0,  -- 分摊权重（小孩可设为 0.5）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id, participant_id)
);

-- ============================================
-- 6. 支出表
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES participants(id),  -- 支付人
    amount DECIMAL(12,2) NOT NULL,  -- 金额
    currency VARCHAR(3) NOT NULL DEFAULT 'CNY',  -- 币种
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,  -- 汇率（相对于 base_currency）
    amount_in_base DECIMAL(12,2),  -- 转换后的基础货币金额
    description TEXT NOT NULL,  -- 支出描述
    category VARCHAR(50),  -- 类别：餐饮/交通/住宿/门票/购物/其他
    expense_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 支出发生时间
    
    -- 分摊范围
    split_type VARCHAR(20) DEFAULT 'all',  -- 'all'=全体，'families'=指定 Family，'participants'=指定个人
    created_by UUID REFERENCES participants(id),  -- 记录创建人
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. 支出 - Family 分摊关联表
-- ============================================
CREATE TABLE IF NOT EXISTS expense_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    UNIQUE(expense_id, family_id)
);

-- ============================================
-- 8. 支出 - 参与者分摊关联表
-- ============================================
CREATE TABLE IF NOT EXISTS expense_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) DEFAULT 1.0,  -- 个人分摊权重
    UNIQUE(expense_id, participant_id)
);

-- ============================================
-- 9. 汇率缓存表（用于多币种支持）
-- ============================================
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',  -- 'manual'=手动，'api'=API 获取
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, date)
);

-- ============================================
-- 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
CREATE INDEX IF NOT EXISTS idx_participants_trip ON participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_families_trip ON families(trip_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payer ON expenses(payer_id);
CREATE INDEX IF NOT EXISTS idx_expense_families_expense ON expense_families(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_participants_expense ON expense_participants(expense_id);

-- ============================================
-- 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
