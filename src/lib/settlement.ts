/**
 * 旅游分账核心算法
 * 支持 Family 维度的聚合结算
 */

interface Participant {
  id: string;
  name: string;
  familyId: string | null;
}

interface Family {
  id: string;
  name: string;
  members: Participant[];
}

interface Expense {
  id: string;
  payerId: string;
  amount: number;
  amountInBase: number;  // 基础货币金额
  description: string;
  splitType: 'all' | 'families' | 'participants';
  targetFamilyIds?: string[];
  targetParticipantIds?: string[];
}

interface Settlement {
  fromFamily: string;
  toFamily: string;
  amount: number;
}

/**
 * 计算每个参与者的净余额
 * 正数 = 应该收钱（多付了）
 * 负数 = 应该付钱（少付了）
 */
export function calculateParticipantBalances(
  participants: Participant[],
  expenses: Expense[]
): Map<string, number> {
  const balances = new Map<string, number>();
  
  // 初始化所有参与者余额为 0
  participants.forEach(p => balances.set(p.id, 0));
  
  expenses.forEach(expense => {
    const payerBalance = balances.get(expense.payerId) || 0;
    
    // 支付人先加上全部支出（他先垫付了）
    balances.set(expense.payerId, payerBalance + expense.amountInBase);
    
    // 确定分摊目标
    let splitTargets: string[] = [];
    
    if (expense.splitType === 'all') {
      splitTargets = participants.map(p => p.id);
    } else if (expense.splitType === 'families' && expense.targetFamilyIds) {
      // 找到这些 Family 的所有成员
      splitTargets = participants
        .filter(p => p.familyId && expense.targetFamilyIds!.includes(p.familyId))
        .map(p => p.id);
    } else if (expense.splitType === 'participants' && expense.targetParticipantIds) {
      splitTargets = expense.targetParticipantIds;
    }
    
    // 计算每个目标参与者应承担的金额（简单平均分摊）
    const sharePerPerson = expense.amountInBase / splitTargets.length;
    
    // 从每个目标参与者的余额中扣除应承担的部分
    splitTargets.forEach(targetId => {
      const targetBalance = balances.get(targetId) || 0;
      balances.set(targetId, targetBalance - sharePerPerson);
    });
  });
  
  return balances;
}

/**
 * 按 Family 聚合余额
 */
export function aggregateFamilyBalances(
  participants: Participant[],
  participantBalances: Map<string, number>
): Map<string, number> {
  const familyBalances = new Map<string, number>();
  
  participants.forEach(p => {
    if (!p.familyId) return;
    
    const currentBalance = familyBalances.get(p.familyId) || 0;
    const participantBalance = participantBalances.get(p.id) || 0;
    
    familyBalances.set(p.familyId, currentBalance + participantBalance);
  });
  
  return familyBalances;
}

/**
 * 计算 Family 间的结算方案
 * 使用贪心算法优化交易次数
 */
export function calculateSettlements(
  families: Family[],
  familyBalances: Map<string, number>
): Settlement[] {
  const settlements: Settlement[] = [];
  
  // 分离债权人和债务人
  const creditors: { familyId: string; amount: number }[] = [];
  const debtors: { familyId: string; amount: number }[] = [];
  
  familyBalances.forEach((balance, familyId) => {
    if (balance > 0) {
      creditors.push({ familyId, amount: balance });
    } else if (balance < 0) {
      debtors.push({ familyId, amount: -balance });  // 转为正数
    }
  });
  
  // 按金额排序
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);
  
  // 贪心匹配
  let i = 0;  // creditors index
  let j = 0;  // debtors index
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = Math.min(creditor.amount, debtor.amount);
    
    if (amount > 0.01) {  // 忽略小于 1 分钱的差额
      settlements.push({
        fromFamily: debtor.familyId,
        toFamily: creditor.familyId,
        amount: Math.round(amount * 100) / 100,  // 保留 2 位小数
      });
    }
    
    creditor.amount -= amount;
    debtor.amount -= amount;
    
    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }
  
  return settlements;
}

/**
 * 计算单个支出的分摊详情
 */
export function calculateExpenseSplit(
  expense: Expense,
  participants: Participant[],
  families: Family[]
): { participantId: string; amount: number }[] {
  let splitTargets: Participant[] = [];
  
  if (expense.splitType === 'all') {
    splitTargets = participants;
  } else if (expense.splitType === 'families' && expense.targetFamilyIds) {
    splitTargets = participants.filter(
      p => p.familyId && expense.targetFamilyIds!.includes(p.familyId)
    );
  } else if (expense.splitType === 'participants' && expense.targetParticipantIds) {
    splitTargets = participants.filter(p => expense.targetParticipantIds!.includes(p.id));
  }
  
  const sharePerPerson = expense.amountInBase / splitTargets.length;
  
  return splitTargets.map(p => ({
    participantId: p.id,
    amount: Math.round(sharePerPerson * 100) / 100,
  }));
}

/**
 * 数据验证：检查收支平衡
 */
export function validateBalance(
  expenses: Expense[],
  participants: Participant[]
): { valid: boolean; message: string } {
  const balances = calculateParticipantBalances(participants, expenses);
  
  let totalBalance = 0;
  balances.forEach(balance => {
    totalBalance += balance;
  });
  
  // 允许 1 分钱的误差（浮点数精度问题）
  if (Math.abs(totalBalance) < 0.01) {
    return { valid: true, message: '收支平衡' };
  } else {
    return {
      valid: false,
      message: `收支不平衡，差额：${totalBalance.toFixed(2)}`,
    };
  }
}

/**
 * 检测可能的重复支出
 */
export function detectDuplicateExpenses(
  expenses: Expense[],
  threshold: {
    amountDiff: number;  // 金额差异阈值
    timeDiffMs: number;  // 时间差异阈值（毫秒）
  } = { amountDiff: 0.01, timeDiffMs: 60000 }  // 默认：1 分钱，1 分钟
): { expense1: Expense; expense2: Expense; reason: string }[] {
  const duplicates: { expense1: Expense; expense2: Expense; reason: string }[] = [];
  
  for (let i = 0; i < expenses.length; i++) {
    for (let j = i + 1; j < expenses.length; j++) {
      const e1 = expenses[i];
      const e2 = expenses[j];
      
      // 检查金额是否相同
      const amountDiff = Math.abs(e1.amountInBase - e2.amountInBase);
      if (amountDiff > threshold.amountDiff) continue;
      
      // 检查描述是否相似（简单字符串比较）
      const descSimilar = e1.description === e2.description;
      if (!descSimilar) continue;
      
      // 检查支付人是否相同
      if (e1.payerId !== e2.payerId) continue;
      
      // 检查时间是否接近（使用 createdAt 字段）
      const time1 = new Date((e1 as any).expenseDate || (e1 as any).createdAt || Date.now()).getTime();
      const time2 = new Date((e2 as any).expenseDate || (e2 as any).createdAt || Date.now()).getTime();
      const timeDiff = Math.abs(time1 - time2);
      
      if (timeDiff <= threshold.timeDiffMs) {
        duplicates.push({
          expense1: e1,
          expense2: e2,
          reason: `相同金额 (${e1.amountInBase}) + 相同描述 + 相同支付人 + 时间接近 (${(timeDiff / 1000).toFixed(0)}秒)`,
        });
      }
    }
  }
  
  return duplicates;
}
