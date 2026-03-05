'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────
// 비밀번호 강도 체크
// ─────────────────────────────────────
function PasswordStrength({ pw }: { pw: string }) {
  const checks = [
    { label: '8자 이상', ok: pw.length >= 8 },
    { label: '영문 포함', ok: /[a-zA-Z]/.test(pw) },
    { label: '숫자 포함', ok: /\d/.test(pw) },
  ];
  if (!pw) return null;
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-green-400'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-100'}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map(({ label, ok }) => (
          <span key={label} className={`text-[10px] flex items-center gap-0.5 ${ok ? 'text-green-600' : 'text-[#bbb]'}`}>
            <Check className="w-3 h-3" />{label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { signUpWithEmail } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', name: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [showPwc, setShowPwc] = useState(false);
  const [agree, setAgree] = useState({ all: false, terms: false, privacy: false, marketing: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleAgree = (key: keyof typeof agree) => {
    if (key === 'all') {
      const next = !agree.all;
      setAgree({ all: next, terms: next, privacy: next, marketing: next });
    } else {
      setAgree((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        next.all = next.terms && next.privacy && next.marketing;
        return next;
      });
    }
  };

  const pwMatch = form.password && form.passwordConfirm && form.password === form.passwordConfirm;
  const pwMismatch = form.passwordConfirm && form.password !== form.passwordConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.name) { setError('모든 필수 항목을 입력해주세요.'); return; }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (!agree.terms || !agree.privacy) { setError('필수 약관에 동의해주세요.'); return; }

    setLoading(true);
    setError('');
    const { error: err } = await signUpWithEmail(form.email, form.password, form.name, form.phone);
    setLoading(false);
    if (err) setError(err);
    else setDone(true);
  };

  // 완료 화면
  if (done) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-extrabold text-[#111] mb-2">거의 다 됐어요!</h2>
          <p className="text-sm text-[#666] mb-1">
            <span className="font-semibold text-primary">{form.email}</span> 으로
          </p>
          <p className="text-sm text-[#666] mb-6">인증 이메일을 발송했습니다.<br />메일을 확인하고 인증 링크를 클릭해주세요.</p>
          <Link href="/login" className="inline-block bg-primary text-white font-bold px-10 py-3.5 rounded-xl hover:bg-blue-700 transition-colors">
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-extrabold text-primary">KingTheCheck</h1>
          </Link>
          <p className="text-sm text-[#666] mt-2">회원가입하고 특별 혜택을 받아보세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {error && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="text-xs font-semibold text-[#555] mb-1.5 block">이메일 *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="example@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="text-xs font-semibold text-[#555] mb-1.5 block">비밀번호 *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="8자 이상, 영문+숫자"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength pw={form.password} />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="text-xs font-semibold text-[#555] mb-1.5 block">비밀번호 확인 *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                <input type={showPwc ? 'text' : 'password'} value={form.passwordConfirm} onChange={set('passwordConfirm')}
                  placeholder="비밀번호를 다시 입력"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm outline-none transition-colors ${
                    pwMismatch ? 'border-red-400 focus:border-red-400' :
                    pwMatch ? 'border-green-400 focus:border-green-400' :
                    'border-gray-200 focus:border-primary'
                  }`} />
                <button type="button" onClick={() => setShowPwc(!showPwc)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#bbb]">
                  {showPwc ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwMismatch && <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>}
              {pwMatch && <p className="text-xs text-green-600 mt-1">✓ 비밀번호가 일치합니다</p>}
            </div>

            {/* 이름 + 전화번호 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#555] mb-1.5 block">이름 *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                  <input type="text" value={form.name} onChange={set('name')} placeholder="홍길동"
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#555] mb-1.5 block">휴대폰</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="010-0000-0000"
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="bg-[#F7F8FA] rounded-xl p-4 space-y-2.5">
              {[
                { key: 'all', label: '전체 동의', bold: true },
                { key: 'terms', label: '(필수) 이용약관 동의', bold: false },
                { key: 'privacy', label: '(필수) 개인정보처리방침 동의', bold: false },
                { key: 'marketing', label: '(선택) 마케팅 수신 동의', bold: false },
              ].map(({ key, label, bold }) => (
                <div key={key}>
                  {key === 'terms' && <hr className="border-gray-200 mb-2.5" />}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => toggleAgree(key as keyof typeof agree)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        agree[key as keyof typeof agree] ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}
                    >
                      {agree[key as keyof typeof agree] && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${bold ? 'font-bold text-[#111]' : 'text-[#555]'}`}>{label}</span>
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FF4500] text-white font-extrabold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {loading ? '가입 중...' : '회원가입 완료'}
            </button>
          </form>

          <p className="text-center text-xs text-[#999] mt-4">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
