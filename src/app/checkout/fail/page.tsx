'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RotateCcw, Home } from 'lucide-react';

// ──────────────────────────────────────────
// 결제 실패 원인별 메시지 매핑
// ──────────────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  'PAY_PROCESS_CANCELED': '결제가 취소되었습니다.',
  'PAY_PROCESS_ABORTED': '결제 처리 중 오류가 발생했습니다.',
  'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.\n카드 정보를 확인해주세요.',
  'EXCEED_MAX_DAILY_PAYMENT_COUNT': '일일 결제 한도를 초과했습니다.',
  'EXCEED_MAX_PAYMENT_AMOUNT': '최대 결제 금액을 초과했습니다.',
  'INVALID_CARD_EXPIRATION': '카드 유효기간이 올바르지 않습니다.',
  'INVALID_STOPPED_CARD': '사용 정지된 카드입니다.',
  'EXCEED_MAX_ONE_DAY_WITHDRAW_AMOUNT': '일일 출금 한도를 초과했습니다.',
  'CARD_PROCESSING_ERROR': '카드 처리 중 오류가 발생했습니다.\n다른 카드를 사용해주세요.',
  'INSUFFICIENT_BALANCE': '잔액이 부족합니다.',
  'NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT': '할부 결제를 지원하지 않는 카드입니다.',
};

function FailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') ?? '';
  const rawMessage = searchParams.get('message') ?? '결제 처리 중 오류가 발생했습니다.';

  const displayMessage = ERROR_MESSAGES[code] ?? rawMessage;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F8FA] px-4 py-12">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm text-center">

        {/* X 아이콘 */}
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#111] mb-2">결제 실패</h1>

        {/* 오류 내용 */}
        <div className="bg-red-50 rounded-xl px-4 py-3 mb-2 text-left">
          {code && (
            <p className="text-[10px] text-red-400 font-mono mb-1">오류코드: {code}</p>
          )}
          <p className="text-sm text-red-700 font-semibold whitespace-pre-line">{displayMessage}</p>
        </div>

        {/* 도움말 */}
        <p className="text-xs text-[#999] mb-6">
          문제가 반복될 경우 고객센터(1588-0000)로 문의해주세요.
        </p>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Link href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />다시 시도
          </Link>
          <Link href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-[#555] rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
            <Home className="w-4 h-4" />홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#999]">로딩 중...</div>}>
      <FailContent />
    </Suspense>
  );
}
