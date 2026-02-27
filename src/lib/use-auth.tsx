/**
 * 认证状态 Hook
 */
'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { supabase, type Profile } from './supabase';
import { getCurrentProfile, signOut as authSignOut } from './auth';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化认证状态
  useEffect(() => {
    let mounted = true;
    
    // 5 秒超时保护，防止 loading 状态永久卡住
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Loading timeout, forcing state update');
        setLoading(false);
      }
    }, 5000);

    // 检查当前会话
    supabase.auth.getSession().then(({ data, error }: { data: { session: any }, error: any }) => {
      if (!mounted) return;
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Session error:', error);
      }
      
      const sessionUser = data.session?.user || null;
      console.log('[Auth] Initial session:', sessionUser ? { email: sessionUser.email, id: sessionUser.id } : 'null');
      
      setUser(sessionUser);
      setLoading(false);
      
      // 如果有用户，加载 profile
      if (sessionUser) {
        getCurrentProfile().then(setProfile).catch(console.error);
      }
    }).catch((err: any) => {
      if (!mounted) return;
      clearTimeout(timeoutId);
      console.error('getSession failed:', err);
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (!mounted) return;
      
      console.log('[Auth] State change:', _event, session?.user?.email);
      
      setUser(session?.user || null);
      
      if (session?.user) {
        const profile = await getCurrentProfile();
        setProfile(profile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    setUser(data.user);
    return { success: true };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    setUser(data.user);
    return { success: true };
  };

  const signOut = async () => {
    await authSignOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
