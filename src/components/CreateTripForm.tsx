import React, { useState } from 'react';
import { X, Calendar, Wallet, User } from 'lucide-react';
import { COMMON_CURRENCIES } from '@/lib/currency';

interface CreateTripFormProps {
  onSubmit: (trip: any) => void;
  onCancel: () => void;
}

export default function CreateTripForm({ onSubmit, onCancel }: CreateTripFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    baseCurrency: 'CNY',
    creatorName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar size={28} />
                创建新旅行
              </h2>
              <p className="text-indigo-100 text-sm mt-1">
                开始记录你们的旅行支出
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
          {/* 旅行名称 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              旅行名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
              placeholder="例如：2026 日本樱花行"
              required
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              描述（可选）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
              placeholder="简单描述一下这次旅行..."
              rows={3}
            />
          </div>

          {/* 日期范围 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                required
              />
            </div>
          </div>

          {/* 基础货币 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              基础货币
            </label>
            <select
              value={formData.baseCurrency}
              onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
            >
              {COMMON_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* 创建者姓名 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              你的姓名 *
            </label>
            <input
              type="text"
              value={formData.creatorName}
              onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
              placeholder="用于记录第一笔支出"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              你将自动成为这次旅行的管理员
            </p>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition font-semibold shadow-lg"
            >
              创建旅行
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
