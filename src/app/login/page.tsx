'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Suspense } from 'react';

// ─────────────────────────────────────
// 카카오/구글 SVG 아이콘
// ─────────────────────────────────────
function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 11c0 2.965 1.71 5.55 4.286 7.033L5.4 21.6a.5.5 0 0 0 .688.583l4.272-2.136A11.2 11.2 0 0 0 12 20.2c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ─────────────────────────────────────
// 로그인 폼
// ─────────────────────────────────────
function LoginContent() {
  const { signInWithEmail, signInWithKakao, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 경우 리디렉트
  useEffect(() => {
    if (user) router.push(redirectTo);
  }, [user, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요.'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await signInWithEmail(email, password);
    setLoading(false);
    if (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-extrabold text-primary">KingTheCheck</h1>
          </Link>
          <p className="text-sm text-[#666] mt-2">킹더체크몰에 오신 걸 환영합니다 👋</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#555] mb-1.5 block">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#555] mb-1.5 block">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#666]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-extrabold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-100" />
            <span className="text-xs text-[#bbb]">또는</span>
            <hr className="flex-1 border-gray-100" />
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button
              onClick={signInWithKakao}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#FEE500] text-[#3C1E1E] font-bold rounded-xl hover:bg-yellow-300 transition-colors"
            >
              <KakaoIcon />
              카카오로 계속하기
            </button>
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white border-2 border-gray-200 text-[#333] font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <GoogleIcon />
              구글로 계속하기
            </button>
          </div>

          {/* 링크 */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[#999]">
            <Link href="/forgot-password" className="hover:text-primary transition-colors">비밀번호 찾기</Link>
            <span>|</span>
            <Link href="/signup" className="hover:text-primary transition-colors font-semibold text-primary">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <LoginContent />
    </Suspense>
  );
}
