'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, DollarSign, AlertCircle, Package,
  TrendingUp, ArrowRight, ChevronRight
} from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('ko-KR');

// ────────────────────────────────────
// 더미 데이터 (Supabase 연동 전)
// ────────────────────────────────────
const KPI = [
  { label: '오늘 주문', value: '24건', sub: '어제 대비 +12%', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', trend: 'up' },
  { label: '오늘 매출', value: '₩1,284,000', sub: '어제 대비 +8%', icon: DollarSign, color: 'bg-green-50 text-green-600', trend: 'up' },
  { label: '미처리 주문', value: '7건', sub: '즉시 처리 필요', icon: AlertCircle, color: 'bg-red-50 text-red-600', trend: 'alert' },
  { label: '전체 상품', value: '142개', sub: '활성: 138개', icon: Package, color: 'bg-purple-50 text-purple-600', trend: 'neutral' },
];

const RECENT_ORDERS = [
  { id: 'ORD-20250106-001', date: '2025-01-06 09:12', buyer: '홍길동', product: '무선 블루투스 이어폰 AGX Pro', amount: 59000, status: '결제완료' },
  { id: 'ORD-20250106-002', date: '2025-01-06 10:45', buyer: '김철수', product: '스테인리스 진공 텀블러', amount: 17900, status: '배송중' },
  { id: 'ORD-20250106-003', date: '2025-01-06 11:00', buyer: '이영희', product: '에어프라이어 5.5L', amount: 67900, status: '상품준비중' },
  { id: 'ORD-20250106-004', date: '2025-01-06 13:22', buyer: '박민수', product: '고탄력 요가 매트', amount: 28900, status: '배송완료' },
  { id: 'ORD-20250106-005', date: '2025-01-06 14:05', buyer: '정수빈', product: '셀린느 스타일 토트백', amount: 42000, status: '결제완료' },
];

const LOW_STOCK = [
  { id: '1', name: '다기능 주방 타이머', category: '생활/주방', stock: 3 },
  { id: '2', name: '네이처하이크 초경량 텐트', category: '스포츠/레저', stock: 5 },
  { id: '3', name: '신생아 유기농 목욕 용품', category: '유아/완구', stock: 7 },
  { id: '4', name: '반려견 자동급식기', category: '반려동물', stock: 9 },
];

const STATUS_COLOR: Record<string, string> = {
  '결제완료':   'bg-blue-100 text-blue-700',
  '상품준비중': 'bg-yellow-100 text-yellow-700',
  '배송중':    'bg-orange-100 text-orange-700',
  '배송완료':  'bg-green-100 text-green-700',
  '취소':      'bg-gray-100 text-gray-500',
};

// ────────────────────────────────────
// 대시보드 페이지
// ────────────────────────────────────
export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-6xl">

      {/* ─── KPI 카드 ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(({ label, value, sub, icon: Icon, color, trend }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#999] mb-1">{label}</p>
            <p className="text-xl font-extrabold text-[#111] mb-1">{value}</p>
            <p className={`text-[11px] font-semibold ${trend === 'up' ? 'text-green-600' : trend === 'alert' ? 'text-red-500' : 'text-[#999]'}`}>
              {trend === 'up' && '↑ '}{trend === 'alert' && '⚠ '}{sub}
            </p>
          </div>
        ))}
      </div>

      {/* ─── 매출 트렌드 placeholder ─── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-[#111] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />최근 7일 매출
          </h2>
        </div>
        <div className="flex items-end gap-2 h-28">
          {[820000, 1050000, 730000, 1200000, 980000, 1100000, 1284000].map((v, i) => {
            const max = 1284000;
            const pct = Math.round((v / max) * 100);
            const days = ['월', '화', '수', '목', '금', '토', '일(오늘)'];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#EEF2FF] rounded-t-md relative flex items-end justify-center" style={{ height: `${pct}%` }}>
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all" style={{ height: '100%' }} />
                </div>
                <span className="text-[9px] text-[#999] whitespace-nowrap">{days[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ─── 최근 주문 ─── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-extrabold text-[#111]">최근 주문</h2>
            <Link href="/admin/orders" className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
              전체 보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#999]">주문번호</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#999]">주문자</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#999] hidden md:table-cell">상품</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold text-[#999]">금액</th>
                  <th className="px-4 py-2.5 text-center text-xs font-bold text-[#999]">상태</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-[#F8FAFF] cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-[#555]">{o.id}</p>
                      <p className="text-[10px] text-[#bbb]">{o.date}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#111]">{o.buyer}</td>
                    <td className="px-4 py-3 text-xs text-[#666] hidden md:table-cell max-w-[180px] truncate">{o.product}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#111] text-right">{fmt(o.amount)}원</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${STATUS_COLOR[o.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── 재고 부족 알림 ─── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-extrabold text-[#111] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />재고 부족
            </h2>
            <Link href="/admin/products" className="text-xs text-primary flex items-center gap-0.5 hover:underline">
              전체 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {LOW_STOCK.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#111] line-clamp-1">{p.name}</p>
                  <p className="text-[11px] text-[#999]">{p.category}</p>
                </div>
                <span className={`text-sm font-extrabold px-2.5 py-1 rounded-lg ${p.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                  {p.stock}개
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
