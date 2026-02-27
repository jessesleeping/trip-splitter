'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/use-auth.tsx';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function TestPage() {
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleTestSignIn = async () => {
    setMessage('测试登录中...');
    const result = await signIn(email, password);
    setMessage(result.success ? '✅ 登录成功！' : `❌ 失败：${result.error}`);
  };

  const handleTestSignUp = async () => {
    setMessage('测试注册中...');
    // 使用 useAuth 中的 signUp
    const { signUp } = useAuth();
    const result = await signUp(email, password);
    setMessage(result.success ? '✅ 注册成功！请检查邮箱' : `❌ 失败：${result.error}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔧 Supabase 连接测试
        </h1>

        {/* 配置状态 */}
        <div className={`p-4 rounded-xl mb-6 ${
          isSupabaseConfigured
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-lg font-semibold mb-2">
            {isSupabaseConfigured ? '✅ Supabase 已配置' : '❌ Supabase 未配置'}
          </p>
          <p className="text-sm text-gray-600">
            {isSupabaseConfigured
              ? `URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`
              : '请检查 .env.local 文件'}
          </p>
        </div>

        {/* 用户状态 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
          <p className="text-lg font-semibold mb-2">👤 用户状态</p>
          {loading ? (
            <p className="text-gray-600">加载中...</p>
          ) : user ? (
            <div>
              <p className="text-green-700">✅ 已登录</p>
              <p className="text-sm text-gray-600 mt-1">
                邮箱：{user.email}
              </p>
              {profile && (
                <p className="text-sm text-gray-600">
                  姓名：{profile.full_name || '未设置'}
                </p>
              )}
              <button
                onClick={async () => {
                  await signOut();
                  setMessage('✅ 已退出登录');
                }}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                退出登录
              </button>
            </div>
          ) : (
            <p className="text-gray-600">❌ 未登录</p>
          )}
        </div>

        {/* 测试表单 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">测试登录/注册</h2>
          
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="测试邮箱"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="测试密码（至少 6 位）"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          
          <div className="flex gap-3">
            <button
              onClick={handleTestSignIn}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              测试登录
            </button>
            <button
              onClick={handleTestSignUp}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              测试注册
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-50 text-green-700'
                : message.includes('❌')
                ? 'bg-red-50 text-red-700'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* 快速链接 */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🔗 快速链接</h3>
          <div className="space-y-2 text-sm">
            <a
              href="https://supabase.com/dashboard/project/zrbcxtamglfjarupqkic"
              target="_blank"
              className="block text-indigo-600 hover:underline"
            >
              → Supabase Dashboard
            </a>
            <a
              href="https://supabase.com/dashboard/project/zrbcxtamglfjarupqkic/auth/users"
              target="_blank"
              className="block text-indigo-600 hover:underline"
            >
              → 用户管理
            </a>
            <a
              href="/"
              className="block text-indigo-600 hover:underline"
            >
              → 返回主页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
