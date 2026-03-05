'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { Check, ChevronDown, ChevronUp, CreditCard, Smartphone, Banknote, Phone, Loader2 } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('ko-KR');

// ─────────────────────────────────────
// 3단계 진행 표시
// ─────────────────────────────────────
const STEPS = ['배송 정보', '결제 수단', '최종 확인'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < current ? 'bg-primary text-white' :
              i === current ? 'bg-[#FF4500] text-white' :
              'bg-gray-100 text-[#999]'
            }`}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[11px] font-medium ${i === current ? 'text-[#FF4500]' : 'text-[#999]'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 md:w-24 h-[2px] mt-[-14px] ${i < current ? 'bg-primary' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────
// 카카오 주소 API 타입
// ─────────────────────────────────────
declare global {
  interface Window {
    daum?: {
      Postcode: new (config: { oncomplete: (data: { roadAddress: string; zonecode: string }) => void }) => { open: () => void };
    };
  }
}

// ─────────────────────────────────────
// 결제 수단 목록
// ─────────────────────────────────────
const PAY_METHODS = [
  { id: 'card', icon: CreditCard, label: '신용/체크카드' },
  { id: 'kakao', icon: Smartphone, label: '카카오페이' },
  { id: 'toss', icon: Smartphone, label: '토스페이' },
  { id: 'transfer', icon: Banknote, label: '계좌이체' },
  { id: 'phone', icon: Phone, label: '휴대폰결제' },
];

const DELIVERY_MEMO_OPTIONS = [
  '문 앞에 놓아주세요',
  '경비실에 맡겨주세요',
  '직접 수령하겠습니다',
  '배송 전 연락해주세요',
  '직접입력',
];

// ─────────────────────────────────────
// 메인 결제 컴포넌트
// ─────────────────────────────────────
function CheckoutContent() {
  const { items } = useCartStore();
  const [step, setStep] = useState(0);
  const [isPaying, setIsPaying] = useState(false);

  // 배송 정보 상태
  const [form, setForm] = useState({
    name: '',
    phone: '',
    zipcode: '',
    address: '',
    addressDetail: '',
    memoOption: DELIVERY_MEMO_OPTIONS[0],
    memoCustom: '',
  });

  // 결제 수단
  const [payMethod, setPayMethod] = useState('card');

  // 약관 체크
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    setAgreeAll(agreePrivacy && agreeTerms);
  }, [agreePrivacy, agreeTerms]);

  const toggleAll = () => {
    const next = !agreeAll;
    setAgreeAll(next);
    setAgreePrivacy(next);
    setAgreeTerms(next);
  };

  // 주문 상품 펼치기
  const [orderOpen, setOrderOpen] = useState(true);

  // 금액 계산
  const subtotal = items.reduce(
    (acc, { product, quantity }) => acc + (product.discountedPrice ?? product.price) * quantity,
    0
  );
  const shipping = subtotal >= 30000 || subtotal === 0 ? 0 : 3000;
  const total = subtotal + shipping;

  // 카카오 주소 API 스크립트 로드
  useEffect(() => {
    if (document.getElementById('daum-postcode-script')) return;
    const script = document.createElement('script');
    script.id = 'daum-postcode-script';
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const openPostcode = () => {
    if (!window.daum?.Postcode) {
      alert('주소 검색 스크립트가 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setForm((f) => ({ ...f, zipcode: data.zonecode, address: data.roadAddress }));
      },
    }).open();
  };

  // field 업데이트
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // 단계별 유효성 검사
  const step0Valid = form.name && form.phone && form.address;
  const step1Valid = !!payMethod;
  const canSubmit = agreePrivacy && agreeTerms;

  // ────────────────────────────────────────
  // 토스페이먼츠 결제창 호출
  // ────────────────────────────────────────
  const handlePayment = useCallback(async () => {
    if (!canSubmit || isPaying) return;
    setIsPaying(true);

    try {
      // 상품명 생성 (첫 상품 + 외 N개)
      const orderName = items.length === 1
        ? items[0].product.name
        : `${items[0].product.name} 외 ${items.length - 1}개`;

      // 주문 ID 생성 (고유값 보장)
      const orderId = `AG-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

      // 토스페이먼츠 SDK
      const tossClientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!tossClientKey) {
        alert('결제 설정이 완료되지 않았습니다.\n.env.local에 NEXT_PUBLIC_TOSS_CLIENT_KEY를 입력하세요.');
        setIsPaying(false);
        return;
      }

      const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
      const tossPayments = await loadTossPayments(tossClientKey);

      // 결제 수단 매핑 (토스페이먼츠 v2 API method 값)
      const methodMap: Record<string, 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE_PHONE' | 'CULTURE_GIFT_CERTIFICATE' | 'FOREIGN_EASY_PAY'> = {
        card: 'CARD',
        kakao: 'CARD',   // 카카오페이는 CARD 타입으로 처리
        toss: 'CARD',    // 토스페이도 CARD 타입으로 처리
        transfer: 'TRANSFER',
        phone: 'MOBILE_PHONE',
      };

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

      // @ts-expect-error - tosspayments-sdk v2 타입 호환성 이슈
      await tossPayments.requestPayment(methodMap[payMethod] ?? 'CARD', {
        amount: { currency: 'KRW', value: total },
        orderId,
        orderName,
        successUrl: `${appUrl}/checkout/success`,
        failUrl: `${appUrl}/checkout/fail`,
      });

    } catch (err: unknown) {
      setIsPaying(false);
      const tossErr = err as { code?: string; message?: string };
      if (tossErr?.code === 'USER_CANCEL') {
        // 사용자가 직접 결제창 닫음 - 에러 아님
        return;
      }
      console.error('[결제 오류]', tossErr);
      alert(tossErr?.message ?? '결제 중 오류가 발생했습니다.');
    }
  }, [canSubmit, isPaying, items, payMethod, total]);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-lg font-bold text-[#333] mb-4">장바구니가 비어있습니다</p>
        <Link href="/products" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      <h1 className="text-xl font-extrabold text-[#111] mb-6 text-center">결제하기</h1>
      <StepIndicator current={step} />

      {/* ══════════════════════════════
          STEP 0: 배송 정보
      ══════════════════════════════ */}
      {step === 0 && (
        <div className="space-y-4">
          <section className="bg-white rounded-2xl p-5">
            <h2 className="font-bold text-[#111] mb-4">배송지 정보</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#666] mb-1 block">이름 *</label>
                  <input placeholder="홍길동" value={form.name} onChange={set('name')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">연락처 *</label>
                  <input placeholder="010-0000-0000" value={form.phone} onChange={set('phone')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              {/* 주소 */}
              <div>
                <label className="text-xs text-[#666] mb-1 block">주소 *</label>
                <div className="flex gap-2 mb-2">
                  <input placeholder="우편번호" value={form.zipcode} readOnly
                    className="w-28 border border-gray-200 rounded-xl px-3 py-3 text-sm bg-gray-50" />
                  <button
                    onClick={openPostcode}
                    className="flex-1 border-2 border-primary text-primary text-sm font-semibold rounded-xl hover:bg-primary hover:text-white transition-all"
                  >
                    🔍 주소 검색 (카카오)
                  </button>
                </div>
                <input placeholder="도로명 주소" value={form.address} readOnly
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 mb-2" />
                <input placeholder="상세 주소 (동/호수)" value={form.addressDetail} onChange={set('addressDetail')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
              </div>

              {/* 배송 메모 */}
              <div>
                <label className="text-xs text-[#666] mb-1 block">배송 메모</label>
                <select value={form.memoOption} onChange={set('memoOption')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary bg-white">
                  {DELIVERY_MEMO_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
                {form.memoOption === '직접입력' && (
                  <input placeholder="배송 메모를 입력하세요" value={form.memoCustom} onChange={set('memoCustom')}
                    className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary" />
                )}
              </div>
            </div>
          </section>

          <button
            onClick={() => setStep(1)}
            disabled={!step0Valid}
            className="w-full py-4 bg-[#FF4500] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:bg-gray-200 disabled:text-[#999] disabled:cursor-not-allowed"
          >
            다음 단계 →
          </button>
        </div>
      )}

      {/* ══════════════════════════════
          STEP 1: 결제 수단
      ══════════════════════════════ */}
      {step === 1 && (
        <div className="space-y-4">
          {/* 주문 상품 확인 (접기/펼치기) */}
          <section className="bg-white rounded-2xl overflow-hidden">
            <button
              onClick={() => setOrderOpen(!orderOpen)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-[#111]">주문 상품 확인 ({items.length}개)</span>
              {orderOpen ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
            </button>
            {orderOpen && (
              <div className="px-5 pb-4 space-y-3 border-t border-gray-50">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 pt-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://via.placeholder.com/100x100?text=${encodeURIComponent(product.name.slice(0, 3))}`}
                        alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111] line-clamp-1">{product.name}</p>
                      <p className="text-xs text-[#999]">수량: {quantity}개</p>
                    </div>
                    <span className="text-sm font-bold text-[#111]">
                      {fmt((product.discountedPrice ?? product.price) * quantity)}원
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 결제 수단 선택 */}
          <section className="bg-white rounded-2xl p-5">
            <h2 className="font-bold text-[#111] mb-4">결제 수단</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PAY_METHODS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setPayMethod(id)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                    payMethod === id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-100 text-[#666] hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-4 border-2 border-gray-200 text-[#666] font-bold rounded-xl hover:border-gray-400 transition-colors">
              ← 이전
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="flex-2 flex-1 py-4 bg-[#FF4500] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:bg-gray-200 disabled:text-[#999]"
            >
              다음 단계 →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          STEP 2: 최종 확인 + 결제
      ══════════════════════════════ */}
      {step === 2 && (
        <div className="space-y-4">
          {/* 배송지 요약 */}
          <section className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[#111]">배송지</h2>
              <button onClick={() => setStep(0)} className="text-xs text-primary hover:underline">수정</button>
            </div>
            <p className="text-sm text-[#333]">{form.name} · {form.phone}</p>
            <p className="text-sm text-[#666]">{form.address} {form.addressDetail}</p>
          </section>

          {/* 결제 수단 요약 */}
          <section className="bg-white rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#111]">결제 수단</h2>
              <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline">수정</button>
            </div>
            <p className="text-sm text-[#666] mt-1">
              {PAY_METHODS.find((m) => m.id === payMethod)?.label}
            </p>
          </section>

          {/* 최종 금액 */}
          <section className="bg-white rounded-2xl p-5">
            <h2 className="font-bold text-[#111] mb-4">최종 금액</h2>
            <div className="space-y-2 text-sm text-[#666]">
              <div className="flex justify-between"><span>상품 금액</span><span>{fmt(subtotal)}원</span></div>
              <div className="flex justify-between">
                <span>배송비</span>
                {shipping === 0
                  ? <span className="text-green-600">무료</span>
                  : <span>{fmt(shipping)}원</span>
                }
              </div>
            </div>
            <hr className="my-3 border-gray-100" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#111]">최종 결제 금액</span>
              <span className="text-2xl font-extrabold text-primary">{fmt(total)}원</span>
            </div>
          </section>

          {/* 약관 동의 */}
          <section className="bg-white rounded-2xl p-5">
            <h2 className="font-bold text-[#111] mb-3">약관 동의</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={agreeAll} onChange={toggleAll} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-semibold text-[#333]">전체 약관 동의</span>
              </label>
              <hr className="border-gray-100" />
              <label className="flex items-center gap-2 cursor-pointer pl-2">
                <input type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-[#555]">[필수] 개인정보 수집 및 이용 동의</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer pl-2">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-[#555]">[필수] 구매조건 확인 및 결제 진행 동의</span>
              </label>
            </div>
          </section>

          <button onClick={() => setStep(1)} className="w-full py-3.5 border-2 border-gray-200 text-[#666] font-bold rounded-xl hover:border-gray-400 transition-colors">
            ← 이전
          </button>
        </div>
      )}

      {/* ═════════════════════════════
          하단 고정 "결제하기" 버튼 (STEP 2에서만)
      ═════════════════════════════ */}
      {step === 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-2xl">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div className="text-right flex-1">
              <p className="text-xs text-[#999]">최종 결제 금액</p>
              <p className="text-lg font-extrabold text-primary">{fmt(total)}원</p>
            </div>
            <button
              onClick={handlePayment}
              disabled={!canSubmit || isPaying}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-extrabold text-base transition-colors ${
                canSubmit && !isPaying
                  ? 'bg-[#FF4500] text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-[#999] cursor-not-allowed'
              }`}
            >
              {isPaying ? (
                <><Loader2 className="w-5 h-5 animate-spin" />결제 처리 중...</>
              ) : (
                `${fmt(total)}원 결제하기`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[#999]">로딩 중...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
