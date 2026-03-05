'use client';

import { useState } from 'react';
import { Search, User } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('ko-KR');

const DUMMY_USERS = [
  { id: '1', name: '홍길동', email: 'hong@example.com', joinedAt: '2024-10-12', orders: 8, totalSpend: 320000, grade: 'VIP' },
  { id: '2', name: '김철수', email: 'kim@example.com',  joinedAt: '2024-11-03', orders: 3, totalSpend: 87000,  grade: '일반' },
  { id: '3', name: '이영희', email: 'lee@example.com',  joinedAt: '2024-11-25', orders: 5, totalSpend: 214500, grade: '우수' },
  { id: '4', name: '박민수', email: 'park@example.com', joinedAt: '2024-12-01', orders: 2, totalSpend: 54800,  grade: '일반' },
  { id: '5', name: '정수빈', email: 'jung@example.com', joinedAt: '2025-01-02', orders: 1, totalSpend: 42000,  grade: '일반' },
  { id: '6', name: '최예진', email: 'choi@example.com', joinedAt: '2024-09-15', orders: 12, totalSpend: 580000, grade: 'VIP' },
];

const GRADE_COLOR: Record<string, string> = {
  VIP:  'bg-yellow-100 text-yellow-700',
  '우수': 'bg-blue-100 text-blue-700',
  '일반': 'bg-gray-100 text-gray-500',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');

  const filtered = DUMMY_USERS.filter((u) =>
    !search || u.name.includes(search) || u.email.includes(search)
  );

  return (
    <div className="max-w-6xl space-y-4">

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '전체 회원', value: `${DUMMY_USERS.length}명` },
          { label: 'VIP 회원', value: `${DUMMY_USERS.filter((u) => u.grade === 'VIP').length}명` },
          { label: '이번달 신규', value: '2명' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-[#999] mb-1">{label}</p>
            <p className="text-xl font-extrabold text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* 검색 */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일 검색..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary bg-white" />
        </div>
        <span className="text-sm text-[#999]">총 {filtered.length}명</span>
      </div>

      {/* 회원 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['회원', '이메일', '가입일', '총 주문수', '총 구매액', '등급'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#666]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-[#111]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#555]">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-[#999]">{u.joinedAt}</td>
                  <td className="px-4 py-3 font-semibold text-center">{u.orders}건</td>
                  <td className="px-4 py-3 font-bold text-[#111]">{fmt(u.totalSpend)}원</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${GRADE_COLOR[u.grade] ?? 'bg-gray-100 text-gray-500'}`}>
                      {u.grade}
                    </span>
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
