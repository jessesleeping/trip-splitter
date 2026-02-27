/**
 * LocalStorage 数据持久化工具
 * 支持旅行、参与者、Family、支出等数据的本地存储
 */

const STORAGE_KEY = 'trip_splitter_data';

interface TripData {
  trips: any[];
  participants: Record<string, any[]>;  // tripId -> participants
  families: Record<string, any[]>;      // tripId -> families
  expenses: Record<string, any[]>;      // tripId -> expenses
}

/**
 * 获取存储的数据
 */
export function loadFromStorage(): TripData {
  // 服务器端渲染时不访问 localStorage
  if (typeof window === 'undefined') {
    return {
      trips: [],
      participants: {},
      families: {},
      expenses: {},
    };
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取存储失败:', error);
  }
  
  // 返回默认数据
  return {
    trips: [],
    participants: {},
    families: {},
    expenses: {},
  };
}

/**
 * 保存数据到存储
 */
export function saveToStorage(data: TripData): void {
  // 服务器端渲染时不访问 localStorage
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

/**
 * 添加旅行
 */
export function addTrip(trip: any): TripData {
  const data = loadFromStorage();
  data.trips.push({
    ...trip,
    id: `trip_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  data.participants[trip.id] = [];
  data.families[trip.id] = [];
  data.expenses[trip.id] = [];
  saveToStorage(data);
  return data;
}

/**
 * 删除旅行
 */
export function deleteTrip(tripId: string): TripData {
  const data = loadFromStorage();
  data.trips = data.trips.filter(t => t.id !== tripId);
  delete data.participants[tripId];
  delete data.families[tripId];
  delete data.expenses[tripId];
  saveToStorage(data);
  return data;
}

/**
 * 添加参与者
 */
export function addParticipant(tripId: string, participant: any): TripData {
  const data = loadFromStorage();
  if (!data.participants[tripId]) {
    data.participants[tripId] = [];
  }
  data.participants[tripId].push({
    ...participant,
    id: `p_${Date.now()}`,
  });
  saveToStorage(data);
  return data;
}

/**
 * 添加 Family
 */
export function addFamily(tripId: string, family: any): TripData {
  const data = loadFromStorage();
  if (!data.families[tripId]) {
    data.families[tripId] = [];
  }
  data.families[tripId].push({
    ...family,
    id: `f_${Date.now()}`,
  });
  saveToStorage(data);
  return data;
}

/**
 * 添加支出（带去重检查）
 */
export function addExpense(tripId: string, expense: any): { data: TripData; duplicate?: any } {
  const data = loadFromStorage();
  if (!data.expenses[tripId]) {
    data.expenses[tripId] = [];
  }
  
  // 去重检查
  const duplicate = detectDuplicate(data.expenses[tripId], expense);
  
  const newExpense = {
    ...expense,
    id: `e_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  data.expenses[tripId].push(newExpense);
  saveToStorage(data);
  
  return { data, duplicate };
}

/**
 * 删除支出
 */
export function deleteExpense(tripId: string, expenseId: string): TripData {
  const data = loadFromStorage();
  if (data.expenses[tripId]) {
    data.expenses[tripId] = data.expenses[tripId].filter(e => e.id !== expenseId);
  }
  saveToStorage(data);
  return data;
}

/**
 * 更新支出
 */
export function updateExpense(tripId: string, expenseId: string, updates: any): TripData {
  const data = loadFromStorage();
  if (data.expenses[tripId]) {
    const index = data.expenses[tripId].findIndex(e => e.id === expenseId);
    if (index !== -1) {
      data.expenses[tripId][index] = {
        ...data.expenses[tripId][index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  saveToStorage(data);
  return data;
}

/**
 * 检测重复支出
 */
function detectDuplicate(expenses: any[], newExpense: any): any | null {
  const threshold = {
    amountDiff: 0.01,  // 1 分钱
    timeDiffMs: 60000, // 1 分钟
  };
  
  for (const expense of expenses) {
    // 检查金额
    const amountDiff = Math.abs((expense.amountInBase || 0) - (newExpense.amountInBase || 0));
    if (amountDiff > threshold.amountDiff) continue;
    
    // 检查描述
    if (expense.description !== newExpense.description) continue;
    
    // 检查支付人
    if (expense.payerId !== newExpense.payerId) continue;
    
    // 检查时间
    const time1 = new Date(expense.expenseDate || expense.createdAt).getTime();
    const time2 = new Date(newExpense.expenseDate || Date.now()).getTime();
    const timeDiff = Math.abs(time1 - time2);
    
    if (timeDiff <= threshold.timeDiffMs) {
      return expense;  // 发现重复
    }
  }
  
  return null;
}

/**
 * 获取旅行的完整数据
 */
export function getTripData(tripId: string): {
  trip: any;
  participants: any[];
  families: any[];
  expenses: any[];
} {
  const data = loadFromStorage();
  const trip = data.trips.find(t => t.id === tripId);
  
  return {
    trip: trip || null,
    participants: data.participants[tripId] || [],
    families: data.families[tripId] || [],
    expenses: data.expenses[tripId] || [],
  };
}

/**
 * 清除所有数据（用于重置）
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
