import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Users, User } from 'lucide-react';
import { COMMON_CURRENCIES, autoFillExchangeRate } from '@/lib/currency';

interface ExpenseFormProps {
  onSubmit: (expense: any) => void;
  onCancel: () => void;
  initialData?: any;
  participants: any[];
  families: any[];
  baseCurrency?: string;
}

export default function ExpenseForm({
  onSubmit,
  onCancel,
  initialData,
  participants,
  families,
  baseCurrency = 'CNY',
}: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    payerId: initialData?.payerId || '',
    amount: initialData?.amount || '',
    currency: initialData?.currency || 'CNY',
    exchangeRate: initialData?.exchangeRate?.toString() || '1',
    description: initialData?.description || '',
    category: initialData?.category || '餐饮',
    expenseDate: initialData?.expenseDate || new Date().toISOString().split('T')[0],
    splitType: initialData?.splitType || 'all',
    targetFamilyIds: initialData?.targetFamilyIds || [],
    targetParticipantIds: initialData?.targetParticipantIds || [],
  });

  const [fetchingRate, setFetchingRate] = useState(false);

  // 自动获取汇率
  useEffect(() => {
    if (formData.currency && formData.currency !== baseCurrency) {
      setFetchingRate(true);
      autoFillExchangeRate(formData.currency, baseCurrency).then((rate) => {
        if (rate) {
          setFormData((prev) => ({ ...prev, exchangeRate: rate }));
        }
        setFetchingRate(false);
      });
    } else {
      setFormData((prev) => ({ ...prev, exchangeRate: 1 }));
    }
  }, [formData.currency, baseCurrency]);

  const categories = [
    { value: '餐饮', icon: '🍽️' },
    { value: '交通', icon: '🚗' },
    { value: '住宿', icon: '🏨' },
    { value: '门票', icon: '🎫' },
    { value: '购物', icon: '🛍️' },
    { value: '其他', icon: '📝' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      exchangeRate: parseFloat(formData.exchangeRate),
      amountInBase: parseFloat(formData.amount) * parseFloat(formData.exchangeRate),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-t-2xl sticky top-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign size={28} />
                {initialData ? '编辑支出' : '添加支出'}
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                记录这次旅行的花费
              </p>
            </div>
            <button 
              onClick={onCancel} 
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 支付人 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              支付人 *
            </label>
            <select
              value={formData.payerId}
              onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition"
              required
            >
              <option value="">选择支付人</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.familyId ? `(${families.find(f => f.id === p.familyId)?.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 金额 + 币种 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                金额 *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                币种
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition"
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 汇率 */}
          {formData.currency !== baseCurrency && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                汇率（1 {formData.currency} = ? {baseCurrency}）
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.000001"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                  className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  required
                />
                {fetchingRate && (
                  <span className="text-blue-600 text-sm">🔄 获取中...</span>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💱 转换后金额：<strong>{((parseFloat(formData.amount) || 0) * (parseFloat(formData.exchangeRate) || 0)).toFixed(2)}</strong> {baseCurrency}
              </p>
            </div>
          )}

          {/* 描述 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              描述 *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition"
              placeholder="例如：晚餐、打车、门票"
              required
            />
          </div>

          {/* 类别 - 按钮式选择 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              类别
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-3 rounded-xl border-2 transition ${
                    formData.category === cat.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-sm font-medium">{cat.value}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 支出日期 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              支出日期
            </label>
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition"
              required
            />
          </div>

          {/* 分摊方式 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users size={16} className="inline mr-1" />
              分摊方式
            </label>
            <select
              value={formData.splitType}
              onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition"
            >
              <option value="all">👥 全体分摊</option>
              <option value="families">🏠 指定 Family</option>
              <option value="participants">👤 指定人员</option>
            </select>
          </div>

          {/* 指定 Family */}
          {formData.splitType === 'families' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <label className="block text-sm font-semibold text-purple-800 mb-3">
                选择 Family
              </label>
              <div className="space-y-2">
                {families.map((f) => (
                  <label 
                    key={f.id} 
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetFamilyIds.includes(f.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            targetFamilyIds: [...formData.targetFamilyIds, f.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            targetFamilyIds: formData.targetFamilyIds.filter((id: string) => id !== f.id),
                          });
                        }
                      }}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="font-medium text-gray-700">{f.name}</span>
                    <span className="text-sm text-gray-500">({f.members?.length || 0}人)</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 指定人员 */}
          {formData.splitType === 'participants' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <label className="block text-sm font-semibold text-orange-800 mb-3">
                选择人员
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {participants.map((p) => (
                  <label 
                    key={p.id} 
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-orange-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetParticipantIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            targetParticipantIds: [...formData.targetParticipantIds, p.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            targetParticipantIds: formData.targetParticipantIds.filter(
                              (id: string) => id !== p.id
                            ),
                          });
                        }
                      }}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="font-medium text-gray-700">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-semibold shadow-lg"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
