import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Wallet, CheckCircle } from 'lucide-react';

interface Family {
  id: string;
  name: string;
  members: string[];
}

interface Settlement {
  fromFamily: string;
  toFamily: string;
  amount: number;
}

interface FamilySettlementProps {
  families: Family[];
  familyBalances: Map<string, number>;
  settlements: Settlement[];
  baseCurrency: string;
}

export default function FamilySettlement({
  families,
  familyBalances,
  settlements,
  baseCurrency,
}: FamilySettlementProps) {
  const getFamilyName = (familyId: string) => {
    return families.find(f => f.id === familyId)?.name || familyId;
  };

  const totalPositive = Array.from(familyBalances.values())
    .filter(b => b > 0)
    .reduce((sum, b) => sum + b, 0);

  return (
    <div className="space-y-6">
      {/* 总览卡片 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={28} />
          <h3 className="text-xl font-bold">结算总览</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{families.length}</div>
            <div className="text-sm text-blue-100">Family</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{settlements.length}</div>
            <div className="text-sm text-blue-100">待结算</div>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">¥{totalPositive.toFixed(0)}</div>
            <div className="text-sm text-blue-100">流转金额</div>
          </div>
        </div>
      </div>

      {/* Family 余额概览 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          各 Family 余额
        </h3>
        <div className="space-y-3">
          {Array.from(familyBalances.entries()).map(([familyId, balance]) => (
            <div
              key={familyId}
              className={`flex justify-between items-center p-4 rounded-xl transition hover:scale-[1.02] ${
                balance > 0 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                  : balance < 0 
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    balance > 0 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                      : balance < 0 
                      ? 'bg-gradient-to-br from-red-400 to-orange-500'
                      : 'bg-gradient-to-br from-gray-300 to-gray-400'
                  }`}
                >
                  {balance > 0 ? (
                    <TrendingUp size={24} className="text-white" />
                  ) : balance < 0 ? (
                    <TrendingDown size={24} className="text-white" />
                  ) : (
                    <span className="text-white text-xl">-</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{getFamilyName(familyId)}</p>
                  <p className="text-sm text-gray-500">
                    {families.find(f => f.id === familyId)?.members.length || 0} 人
                  </p>
                </div>
              </div>
              <div
                className={`text-2xl font-bold ${
                  balance > 0 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600' 
                    : balance < 0 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600'
                    : 'text-gray-400'
                }`}
              >
                {balance > 0 ? '+' : ''}{balance.toFixed(2)} {baseCurrency}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 结算方案 */}
      {settlements.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ArrowRight size={20} className="text-indigo-500" />
            结算方案
          </h3>
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-100 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* 付款方 */}
                  <div className="text-right flex-1">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-red-600 text-lg">
                        {getFamilyName(settlement.fromFamily)}
                      </span>
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <TrendingDown size={16} className="text-red-500" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">应付</p>
                  </div>
                  
                  {/* 箭头 */}
                  <div className="px-4">
                    <ArrowRight size={28} className="text-indigo-400" />
                  </div>
                  
                  {/* 收款方 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp size={16} className="text-green-500" />
                      </div>
                      <span className="font-bold text-green-600 text-lg">
                        {getFamilyName(settlement.toFamily)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">应收</p>
                  </div>
                </div>
                
                {/* 金额 */}
                <div className="ml-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">
                    ¥{settlement.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">已结清！</h3>
          <p className="text-gray-500">所有 Family 收支平衡，无需结算</p>
        </div>
      )}

      {/* 说明 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
        <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          💡 结算说明
        </h4>
        <ul className="text-sm text-amber-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>正数余额表示该 Family 多付了，应该<strong>收钱</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>负数余额表示该 Family 少付了，应该<strong>付钱</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>结算方案已优化，<strong>交易次数最少</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-1">•</span>
            <span>金额已四舍五入到分</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
