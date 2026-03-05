'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Home, Loader2, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store';

const fmt = (n: number) => n.toLocaleString('ko-KR');

// ──────────────────────────────────────────
// 결제 성공 처리 컴포넌트
// ──────────────────────────────────────────
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = Number(searchParams.get('amount') ?? '0');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderData, setOrderData] = useState<{
    orderId: string; amount: number; orderName?: string; method?: string; approvedAt?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMsg('잘못된 접근입니다. 결제 파라미터가 누락됐습니다.');
      return;
    }

    // 결제 승인 API 호출
    const confirmPayment = async () => {
      try {
        // Zustand에서 장바구니 아이템 가져오기
        const cartItems = useCartStore.getState().items;

        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount, cartItems }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus('error');
          setErrorMsg(data.error ?? '결제 승인에 실패했습니다.');
          return;
        }

        // 성공: 장바구니 비우기
        clearCart();
        setOrderData({
          orderId: data.orderId,
          amount: data.amount,
          orderName: data.orderName,
          method: data.method,
          approvedAt: data.approvedAt,
        });
        setStatus('success');
      } catch {
        setStatus('error');
        setErrorMsg('네트워크 오류가 발생했습니다. 고객센터로 문의해주세요.');
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, clearCart]);

  // ── 로딩 ──
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F7F8FA]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[#555] text-sm font-semibold">결제를 확인하고 있어요...</p>
      </div>
    );
  }

  // ── 에러 ──
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F7F8FA] px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-extrabold text-[#111] mb-2">결제 오류</h1>
          <p className="text-sm text-[#666] mb-6">{errorMsg}</p>
          <div className="flex gap-3">
            <button onClick={() => router.back()}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-[#666]">
              다시 시도
            </button>
            <Link href="/" className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold text-center">
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── 성공 ──
  const approvedDate = orderData?.approvedAt
    ? new Date(orderData.approvedAt).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA] px-4 py-12">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm text-center">

        {/* 체크 아이콘 애니메이션 */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#111] mb-1">결제 완료!</h1>
        <p className="text-sm text-[#999] mb-6">주문이 성공적으로 접수되었습니다</p>

        {/* 주문 정보 */}
        <div className="bg-[#F7F8FA] rounded-xl p-4 mb-6 text-left space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#999]">주문번호</span>
            <span className="text-xs font-mono font-semibold text-[#111]">{orderData?.orderId}</span>
          </div>
          {orderData?.orderName && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#999]">주문상품</span>
              <span className="text-xs font-semibold text-[#555] max-w-[180px] text-right line-clamp-1">{orderData.orderName}</span>
            </div>
          )}
          {orderData?.method && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#999]">결제수단</span>
              <span className="text-xs font-semibold text-[#555]">{orderData.method}</span>
            </div>
          )}
          {approvedDate && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#999]">결제일시</span>
              <span className="text-xs text-[#555]">{approvedDate}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-bold text-[#111]">결제금액</span>
            <span className="text-xl font-extrabold text-primary">
              {fmt(orderData?.amount ?? amount)}원
            </span>
          </div>
        </div>

        {/* 포인트 적립 안내 */}
        <div className="bg-blue-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <span className="text-blue-500 text-lg">🎁</span>
          <p className="text-xs text-blue-700 font-semibold">
            {fmt(Math.floor((orderData?.amount ?? amount) * 0.01))}포인트가 적립됩니다
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Link href="/mypage?tab=orders"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">
            <Package className="w-4 h-4" />주문 내역
          </Link>
          <Link href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
            <Home className="w-4 h-4" />쇼핑 계속
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
