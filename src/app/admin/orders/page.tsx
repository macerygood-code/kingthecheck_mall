'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('ko-KR');

const STATUS_LIST = ['전체', '결제완료', '상품준비중', '배송중', '배송완료', '취소'];
const STATUS_COLOR: Record<string, string> = {
  '결제완료':   'bg-blue-100 text-blue-700',
  '상품준비중': 'bg-yellow-100 text-yellow-700',
  '배송중':    'bg-orange-100 text-orange-700',
  '배송완료':  'bg-green-100 text-green-700',
  '취소':      'bg-gray-100 text-gray-500',
};

const DUMMY_ORDERS = [
  { id: 'ORD-20250106-001', date: '2025-01-06 09:12', buyer: '홍길동', phone: '010-1234-5678', product: '무선 블루투스 이어폰 AGX Pro', amount: 59000, status: '결제완료', trackingNo: '' },
  { id: 'ORD-20250106-002', date: '2025-01-06 10:45', buyer: '김철수', phone: '010-2345-6789', product: '스테인리스 진공 텀블러', amount: 17900, status: '배송중', trackingNo: '123456789012' },
  { id: 'ORD-20250106-003', date: '2025-01-06 11:00', buyer: '이영희', phone: '010-3456-7890', product: '에어프라이어 5.5L', amount: 67900, status: '상품준비중', trackingNo: '' },
  { id: 'ORD-20250106-004', date: '2025-01-06 13:22', buyer: '박민수', phone: '010-4567-8901', product: '고탄력 요가 매트', amount: 28900, status: '배송완료', trackingNo: '234567890123' },
  { id: 'ORD-20250105-001', date: '2025-01-05 16:00', buyer: '정수빈', phone: '010-5678-9012', product: '셀린느 스타일 토트백', amount: 42000, status: '취소', trackingNo: '' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(DUMMY_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  const updateStatus = (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    // TODO: await supabase.from('orders').update({ status }).eq('id', id);
  };

  const updateTracking = (id: string, trackingNo: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, trackingNo } : o));
    // TODO: await supabase.from('orders').update({ tracking_no: trackingNo }).eq('id', id);
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === '전체' || o.status === statusFilter;
    const matchSearch = !search || o.id.includes(search) || o.buyer.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-6xl space-y-4">

      {/* 도구바 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="주문번호 또는 주문자명 검색..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary bg-white" />
        </div>

        {/* 상태 필터 탭 */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {STATUS_LIST.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === s ? 'bg-primary text-white' : 'text-[#666] hover:bg-gray-50'
              }`}>
              {s}
            </button>
          ))}
        </div>

        <span className="text-sm text-[#999]">총 {filtered.length}건</span>
      </div>

      {/* 주문 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['주문번호', '날짜', '주문자', '상품', '금액', '배송상태', '운송장번호'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#666] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors">
                  {/* 주문번호 */}
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono font-semibold text-[#111]">{o.id}</p>
                  </td>
                  {/* 날짜 */}
                  <td className="px-4 py-3 text-xs text-[#999] whitespace-nowrap">{o.date}</td>
                  {/* 주문자 */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-[#111]">{o.buyer}</p>
                    <p className="text-[10px] text-[#bbb]">{o.phone}</p>
                  </td>
                  {/* 상품 */}
                  <td className="px-4 py-3 text-xs text-[#555] max-w-[160px]">
                    <p className="line-clamp-2">{o.product}</p>
                  </td>
                  {/* 금액 */}
                  <td className="px-4 py-3 font-bold text-[#111] whitespace-nowrap">{fmt(o.amount)}원</td>
                  {/* 배송상태 드롭다운 */}
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${STATUS_COLOR[o.status] ?? 'bg-gray-100 text-gray-500'}`}
                    >
                      {STATUS_LIST.filter((s) => s !== '전체').map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  {/* 운송장 번호 */}
                  <td className="px-4 py-3">
                    <input
                      value={o.trackingNo}
                      onChange={(e) => updateTracking(o.id, e.target.value)}
                      disabled={o.status !== '배송중'}
                      placeholder={o.status === '배송중' ? '운송장 번호 입력' : '-'}
                      className={`px-3 py-1.5 border rounded-lg text-xs outline-none w-36 transition-colors ${
                        o.status === '배송중'
                          ? 'border-orange-200 focus:border-orange-400 bg-orange-50'
                          : 'border-gray-100 bg-gray-50 text-[#ccc] cursor-not-allowed'
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
