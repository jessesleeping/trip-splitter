'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/use-auth.tsx';
import { Mail, Lock, User, LogIn, UserPlus, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isSignUp
        ? await signUp(email, password, fullName)
        : await signIn(email, password);

      if (result.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(result.error || '操作失败');
      }
    } catch (err: any) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
          >
            <X size={20} className="text-white" />
          </button>
          
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
              {isSignUp ? <UserPlus size={32} /> : <LogIn size={32} />}
            </div>
            <h2 className="text-2xl font-bold">
              {isSignUp ? '创建账户' : '欢迎回来'}
            </h2>
            <p className="text-indigo-100 mt-1">
              {isSignUp ? '开始你的旅行分账之旅' : '登录继续管理旅行'}
            </p>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* 姓名（仅注册） */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                姓名
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition text-gray-900 placeholder-gray-400"
                placeholder="你的姓名"
              />
            </div>
          )}

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition text-gray-900 placeholder-gray-400"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock size={16} className="inline mr-1" />
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition text-gray-900 placeholder-gray-400"
              placeholder="至少 6 位"
              minLength={6}
              required
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg'
            }`}
          >
            {loading ? '处理中...' : isSignUp ? '创建账户' : '登录'}
          </button>

          {/* 切换登录/注册 */}
          <div className="text-center pt-4 border-t">
            <p className="text-gray-600 text-sm">
              {isSignUp ? '已有账户？' : '还没有账户？'}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="ml-2 text-indigo-600 font-semibold hover:underline"
              >
                {isSignUp ? '登录' : '注册'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
