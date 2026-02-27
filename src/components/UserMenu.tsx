'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/use-auth.tsx';
import AuthModal from './AuthModal';
import { User, LogOut, Settings, Sparkles } from 'lucide-react';

export default function UserMenu() {
  const { user, profile, signOut, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition"
        >
          <User size={20} />
          <span className="text-sm font-medium">登录</span>
        </button>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
            {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-white hidden sm:block">
            {profile?.full_name || user.email?.split('@')[0]}
          </span>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-20 overflow-hidden">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-gray-800">
                  {profile?.full_name || '用户'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  // TODO: 打开设置页面
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings size={16} />
                账户设置
              </button>
              
              <button
                onClick={async () => {
                  await signOut();
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          </>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
