'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';

// ────────────────────────────────────
// Supabase 설정 여부 확인
// ────────────────────────────────────
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url !== 'https://your-project.supabase.co' && key !== 'your-anon-key-here');
}

// ────────────────────────────────────
// Auth Context 타입
// ────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithKakao: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ────────────────────────────────────
// Provider
// ────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase 미설정 시 더미 상태로 바로 완료
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // 동적 import로 Supabase 클라이언트 초기화 (미설정 시 에러 방지)
    import('@/lib/supabase').then(({ createClient }) => {
      const supabase = createClient();

      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
      });

      return () => subscription.unsubscribe();
    });
  }, []);

  // ──────────────────────────────────
  // 이메일 로그인
  // ──────────────────────────────────
  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase가 설정되지 않았습니다. .env.local을 확인해주세요.' };
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  // ──────────────────────────────────
  // 카카오 OAuth 로그인
  // ▶ 설정 방법: Supabase 대시보드 → Authentication → Providers → Kakao
  //   Kakao Developers (https://developers.kakao.com)에서 앱 생성 후
  //   REST API 키(Client ID), 보안 코드를 Supabase에 입력
  //   Redirect URL: https://your-project.supabase.co/auth/v1/callback
  // ──────────────────────────────────
  const signInWithKakao = async () => {
    if (!isSupabaseConfigured()) { alert('Supabase 설정 후 사용 가능합니다.'); return; }
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ──────────────────────────────────
  // 구글 OAuth 로그인
  // ▶ 설정 방법: Supabase 대시보드 → Authentication → Providers → Google
  //   Google Cloud Console (https://console.cloud.google.com)에서
  //   OAuth 클라이언트 ID 생성 → Client ID, Secret을 Supabase에 입력
  //   승인된 리디렉션 URI: https://your-project.supabase.co/auth/v1/callback
  // ──────────────────────────────────
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) { alert('Supabase 설정 후 사용 가능합니다.'); return; }
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ──────────────────────────────────
  // 이메일 회원가입
  // ──────────────────────────────────
  const signUpWithEmail = async (email: string, password: string, name: string, phone: string) => {
    if (!isSupabaseConfigured()) return { error: 'Supabase가 설정되지 않았습니다.' };
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) return { error: error.message };

    if (data.user) {
      await supabase.from('users').upsert({ id: data.user.id, name, phone, role: 'user', points: 0 });
    }
    return { error: null };
  };

  // ──────────────────────────────────
  // 로그아웃
  // ──────────────────────────────────
  const signOut = async () => {
    if (!isSupabaseConfigured()) { setUser(null); setSession(null); return; }
    const { createClient } = await import('@/lib/supabase');
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signInWithKakao, signInWithGoogle, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ────────────────────────────────────
// 훅
// ────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
