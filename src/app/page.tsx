'use client';

import React, { useState, useEffect } from 'react';
import TripList from '@/components/TripList';
import TripExpenseList from '@/components/TripExpenseList';
import FamilySettlement from '@/components/FamilySettlement';
import ExpenseForm from '@/components/ExpenseForm';
import CreateTripForm from '@/components/CreateTripForm';
import { ArrowLeft, Calculator, Plus, Users, Wallet, TrendingUp } from 'lucide-react';
import { loadFromStorage, addTrip, addParticipant, addFamily, addExpense, deleteExpense, updateExpense, getTripData } from '@/lib/storage';

// 系统维护者 ID（可配置）
const SYSTEM_ADMIN_ID = 'system_admin';

export default function TripDetailPage() {
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'settlement' | 'setup'>('list');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [tripData, setTripData] = useState<any>({ trip: null, participants: [], families: [], expenses: [] });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'settlement' | 'setup'>('expenses');

  // 加载数据
  useEffect(() => {
    const data = loadFromStorage();
    console.log('加载数据:', data);
  }, []);

  // 刷新旅行数据
  const refreshTripData = () => {
    if (selectedTrip) {
      setTripData(getTripData(selectedTrip.id));
    }
  };

  useEffect(() => {
    refreshTripData();
  }, [selectedTrip]);

  const handleSelectTrip = (trip: any) => {
    setSelectedTrip(trip);
    setTripData(getTripData(trip.id));
    setCurrentView('detail');
    setActiveTab('expenses');
  };

  const handleCreateTrip = (tripData: any) => {
    const data = addTrip({
      ...tripData,
      baseCurrency: tripData.baseCurrency || 'CNY',
    });
    
    // 添加创建者为管理员
    if (tripData.creatorName) {
      addParticipant(data.trips[data.trips.length - 1].id, {
        name: tripData.creatorName,
        isAdmin: true,
        familyId: null,
      });
    }
    
    setShowCreateTrip(false);
    setCurrentView('list');
  };

  const handleAddExpense = (expenseData: any) => {
    const result = addExpense(selectedTrip.id, expenseData);
    
    if (result.duplicate) {
      if (!confirm(`⚠️ 发现可能的重复支出：\n${result.duplicate.description}\n${result.duplicate.amount} ${result.duplicate.currency}\n确定还要添加吗？`)) {
        return;
      }
    }
    
    refreshTripData();
    setShowExpenseForm(false);
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('确定删除这条支出吗？')) {
      deleteExpense(selectedTrip.id, id);
      refreshTripData();
    }
  };

  const handleUpdateExpense = (expenseData: any) => {
    updateExpense(selectedTrip.id, editingExpense.id, expenseData);
    refreshTripData();
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleAddParticipant = (name: string, familyId?: string) => {
    addParticipant(selectedTrip.id, { name, familyId, isAdmin: false });
    refreshTripData();
  };

  const handleAddFamily = (name: string) => {
    addFamily(selectedTrip.id, { name, members: [] });
    refreshTripData();
  };

  // 渲染主页面
  if (currentView === 'list') {
    return (
      <>
        <TripList
          trips={loadFromStorage().trips}
          onCreateTrip={() => setShowCreateTrip(true)}
          onSelectTrip={handleSelectTrip}
        />
        {showCreateTrip && (
          <CreateTripForm
            onSubmit={handleCreateTrip}
            onCancel={() => setShowCreateTrip(false)}
          />
        )}
      </>
    );
  }

  // 旅行详情页
  if (currentView === 'detail' && selectedTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* 美化头部 - 渐变背景 */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg">
          <div className="p-4 flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('list')} 
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Wallet size={24} />
                {selectedTrip.name}
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                📅 {new Date(selectedTrip.startDate).toLocaleDateString('zh-CN')} -{' '}
                {new Date(selectedTrip.endDate).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">总支出</div>
              <div className="text-2xl font-bold">
                {tripData.expenses.reduce((sum: number, e: any) => sum + (e.amountInBase || 0), 0).toFixed(0)} {selectedTrip.baseCurrency}
              </div>
            </div>
          </div>

          {/* Tab 导航 - 美化 */}
          <div className="flex border-t border-white/20">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 py-4 text-center flex items-center justify-center gap-2 transition ${
                activeTab === 'expenses' 
                  ? 'bg-white/20 text-white font-semibold' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Wallet size={20} />
              支出记录
              {tripData.expenses.length > 0 && (
                <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                  {tripData.expenses.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settlement')}
              className={`flex-1 py-4 text-center flex items-center justify-center gap-2 transition ${
                activeTab === 'settlement' 
                  ? 'bg-white/20 text-white font-semibold' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Calculator size={20} />
              结算中心
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`flex-1 py-4 text-center flex items-center justify-center gap-2 transition ${
                activeTab === 'setup' 
                  ? 'bg-white/20 text-white font-semibold' 
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Users size={20} />
              人员管理
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-4 max-w-4xl mx-auto">
          {activeTab === 'expenses' && (
            <TripExpenseList
              expenses={tripData.expenses.map((e: any) => ({
                ...e,
                payerName: tripData.participants.find((p: any) => p.id === e.payerId)?.name || '未知',
                familyName: tripData.participants.find((p: any) => p.id === e.payerId)?.familyId 
                  ? tripData.families.find((f: any) => f.id === tripData.participants.find((p: any) => p.id === e.payerId)?.familyId)?.name 
                  : null,
              }))}
              onAddExpense={() => setShowExpenseForm(true)}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'settlement' && (
            <FamilySettlement
              families={tripData.families}
              familyBalances={calculateFamilyBalances(tripData)}
              settlements={calculateSettlements(tripData)}
              baseCurrency={selectedTrip.baseCurrency || 'CNY'}
            />
          )}

          {activeTab === 'setup' && (
            <TripSetup
              tripData={tripData}
              onAddParticipant={handleAddParticipant}
              onAddFamily={handleAddFamily}
            />
          )}
        </div>

        {/* 支出表单弹窗 */}
        {showExpenseForm && (
          <ExpenseForm
            onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
            onCancel={() => {
              setShowExpenseForm(false);
              setEditingExpense(null);
            }}
            initialData={editingExpense}
            participants={tripData.participants}
            families={tripData.families}
            baseCurrency={selectedTrip.baseCurrency}
          />
        )}

        {/* 悬浮添加按钮 */}
        {activeTab === 'expenses' && (
          <button
            onClick={() => setShowExpenseForm(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center justify-center"
          >
            <Plus size={28} />
          </button>
        )}
      </div>
    );
  }

  return null;
}

// 简化版结算计算（用于展示）
function calculateFamilyBalances(tripData: any) {
  const balances = new Map<string, number>();
  tripData.families.forEach((f: any) => balances.set(f.id, 0));

  tripData.expenses.forEach((expense: any) => {
    const payer = tripData.participants.find((p: any) => p.id === expense.payerId);
    if (!payer?.familyId) return;

    const currentBalance = balances.get(payer.familyId) || 0;
    balances.set(payer.familyId, currentBalance + (expense.amountInBase || 0));

    let targetFamilies: string[] = [];
    if (expense.splitType === 'all') {
      targetFamilies = tripData.families.map((f: any) => f.id);
    } else if (expense.splitType === 'families' && expense.targetFamilyIds) {
      targetFamilies = expense.targetFamilyIds;
    }

    const sharePerFamily = (expense.amountInBase || 0) / targetFamilies.length;
    targetFamilies.forEach((familyId: string) => {
      const familyBalance = balances.get(familyId) || 0;
      balances.set(familyId, familyBalance - sharePerFamily);
    });
  });

  return balances;
}

function calculateSettlements(tripData: any) {
  const balances = calculateFamilyBalances(tripData);
  const settlements: any[] = [];
  const creditors: any[] = [];
  const debtors: any[] = [];

  balances.forEach((balance, familyId) => {
    if (balance > 0) creditors.push({ familyId, amount: balance });
    else if (balance < 0) debtors.push({ familyId, amount: -balance });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const amount = Math.min(creditor.amount, debtor.amount);

    if (amount > 0.01) {
      settlements.push({
        fromFamily: debtor.familyId,
        toFamily: creditor.familyId,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.amount -= amount;
    debtor.amount -= amount;
    if (creditor.amount < 0.01) i++;
    if (debtor.amount < 0.01) j++;
  }

  return settlements;
}

// 人员管理组件
function TripSetup({ tripData, onAddParticipant, onAddFamily }: any) {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');

  return (
    <div className="space-y-6">
      {/* Family 管理 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} className="text-blue-500" />
          Family 管理
        </h3>
        
        <div className="space-y-3">
          {tripData.families.map((family: any) => (
            <div key={family.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">{family.name}</p>
                <p className="text-sm text-gray-500">
                  {tripData.participants.filter((p: any) => p.familyId === family.id).length} 人
                </p>
              </div>
              <TrendingUp size={20} className="text-blue-400" />
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newFamilyName}
            onChange={(e) => setNewFamilyName(e.target.value)}
            placeholder="Family 名称（如：张家）"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              if (newFamilyName.trim()) {
                onAddFamily(newFamilyName.trim());
                setNewFamilyName('');
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            添加
          </button>
        </div>
      </div>

      {/* 参与者管理 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} className="text-green-500" />
          参与者管理
        </h3>
        
        <div className="space-y-2">
          {tripData.participants.map((participant: any) => (
            <div key={participant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">{participant.name}</p>
                <p className="text-sm text-gray-500">
                  {participant.isAdmin ? '👑 管理员' : '成员'}
                  {participant.familyId && ` · ${tripData.families.find((f: any) => f.id === participant.familyId)?.name}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            placeholder="姓名"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedFamilyId}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">不属于任何 Family</option>
            {tripData.families.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              if (newParticipantName.trim()) {
                onAddParticipant(newParticipantName.trim(), selectedFamilyId || null);
                setNewParticipantName('');
                setSelectedFamilyId('');
              }
            }}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            添加参与者
          </button>
        </div>
      </div>
    </div>
  );
}
