'use client';

import React from 'react';
import { Home, Plus, Users, Calculator, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

interface Trip {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  participantCount?: number;
}

interface TripListProps {
  trips: Trip[];
  onCreateTrip: () => void;
  onSelectTrip: (trip: Trip) => void;
}

export default function TripList({ trips, onCreateTrip, onSelectTrip }: TripListProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* 美化头部 - 渐变 + 阴影 */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Sparkles size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">✈️ Trip Splitter</h1>
                <p className="text-white/80 mt-1">旅游分账，轻松结算</p>
              </div>
            </div>
            <UserMenu />
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{trips.length}</div>
              <div className="text-sm text-white/80">旅行</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">
                {trips.reduce((sum, t: any) => sum + (t.participantCount || 0), 0)}
              </div>
              <div className="text-sm text-white/80">参与者</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">¥0</div>
              <div className="text-sm text-white/80">总支出</div>
            </div>
          </div>
        </div>
      </div>

      {/* 旅行列表 */}
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Home size={24} className="text-indigo-500" />
            我的旅行
          </h2>
          <button
            onClick={onCreateTrip}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            <Plus size={20} />
            创建旅行
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Home size={48} className="text-indigo-400" />
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">还没有旅行</p>
            <p className="text-gray-400 text-sm">创建一个旅行开始分账</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* 卡片顶部渐变条 */}
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition">
                        {trip.name}
                      </h3>
                      
                      {(trip.startDate || trip.endDate) && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                          <Calendar size={16} />
                          <span>
                            {trip.startDate && new Date(trip.startDate).toLocaleDateString('zh-CN')}
                            {' - '}
                            {trip.endDate && new Date(trip.endDate).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      )}
                      
                      {trip.participantCount !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {[...Array(Math.min(3, trip.participantCount))].map((_, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white"
                              />
                            ))}
                          </div>
                          {trip.participantCount > 3 && (
                            <span className="text-sm text-gray-500">+{trip.participantCount - 3}</span>
                          )}
                          <span className="text-sm text-gray-500">人参与</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl group-hover:scale-110 transition">
                        <Calculator size={24} className="text-indigo-500" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <TrendingUp size={14} />
                        <span>点击查看</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
