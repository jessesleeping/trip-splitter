import React from 'react';
import { Plus, DollarSign, Trash2, Edit, Clock, User, Users } from 'lucide-react';

interface Expense {
  id: string;
  payerName: string;
  familyName?: string | null;
  amount: number;
  currency: string;
  amountInBase?: number;
  description: string;
  category: string;
  date: string;
  splitType: string;
}

interface TripExpenseListProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export default function TripExpenseList({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: TripExpenseListProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '餐饮': return '🍽️';
      case '交通': return '🚗';
      case '住宿': return '🏨';
      case '门票': return '🎫';
      case '购物': return '🛍️';
      case '其他': return '📝';
      default: return '💰';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amountInBase || e.amount), 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign size={24} />
              支出记录
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              共 {expenses.length} 笔 · 总计 {totalAmount.toFixed(2)} 元
            </p>
          </div>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition shadow-lg"
          >
            <Plus size={20} />
            添加支出
          </button>
        </div>
      </div>

      {/* 支出列表 */}
      <div className="divide-y divide-gray-100">
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-4">
              <DollarSign size={40} className="text-emerald-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">还没有支出记录</p>
            <p className="text-gray-400 text-sm mb-4">点击"添加支出"开始记账</p>
            <button
              onClick={onAddExpense}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition"
            >
              添加第一笔支出
            </button>
          </div>
        ) : (
          expenses.map((expense) => (
            <div 
              key={expense.id} 
              className="p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition group"
            >
              <div className="flex justify-between items-start gap-4">
                {/* 左侧：类别图标 + 详情 */}
                <div className="flex gap-4 flex-1">
                  {/* 类别图标 */}
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition">
                    {getCategoryIcon(expense.category)}
                  </div>
                  
                  {/* 详情 */}
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{expense.description}</p>
                    
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-medium">
                        {expense.category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock size={14} />
                        {formatDate(expense.date)}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <User size={14} />
                        {expense.payerName} 支付
                      </span>
                      {expense.familyName && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Users size={14} />
                          {expense.familyName}
                        </span>
                      )}
                    </div>
                    
                    {/* 分摊方式 */}
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-gray-400">分摊方式：</span>
                      <span className={`px-2 py-1 rounded-lg font-medium ${
                        expense.splitType === 'all' 
                          ? 'bg-green-100 text-green-700' 
                          : expense.splitType === 'families'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {expense.splitType === 'all' ? '👥 全体分摊' : 
                         expense.splitType === 'families' ? '🏠 指定 Family' : 
                         '👤 指定人员'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右侧：金额 + 操作 */}
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    {expense.currency === 'CNY' ? '¥' : expense.currency} {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {expense.currency !== 'CNY' && expense.amountInBase && (
                    <p className="text-sm text-gray-400 mt-1">
                      ≈ ¥{expense.amountInBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部统计 */}
      {expenses.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-emerald-50 p-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{expenses.length}</span> 笔支出
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">总支出</div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                ¥{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
