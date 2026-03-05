'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Filter } from 'lucide-react';

const fmt = (n: number) => n.toLocaleString('ko-KR');

// ────────────────────────────────────
// 더미 상품 데이터
// ────────────────────────────────────
const DUMMY_PRODUCTS = [
  { id: '1', name: '무선 블루투스 이어폰 AGX Pro', category: '전자기기', price: 89000, discountedPrice: 59000, stock: 45, sales: 128, isActive: true },
  { id: '2', name: '스테인리스 진공 텀블러 500ml', category: '생활/주방', price: 22000, discountedPrice: 17900, stock: 82, sales: 95, isActive: true },
  { id: '3', name: '에어프라이어 5.5L 대용량', category: '생활/주방', price: 89000, discountedPrice: 67900, stock: 31, sales: 67, isActive: true },
  { id: '4', name: '고탄력 요가 매트 6mm', category: '스포츠/레저', price: 35000, discountedPrice: 28900, stock: 57, sales: 54, isActive: true },
  { id: '5', name: '셀린느 스타일 토트백', category: '패션/의류', price: 58000, discountedPrice: 42000, stock: 23, sales: 48, isActive: false },
  { id: '6', name: '다기능 주방 타이머', category: '생활/주방', price: 15000, discountedPrice: null, stock: 3, sales: 112, isActive: true },
  { id: '7', name: '반려견 자동급식기 4L', category: '반려동물', price: 52000, discountedPrice: 38000, stock: 9, sales: 32, isActive: true },
  { id: '8', name: '유기농 그린 스무디 혼합 6종', category: '식품', price: 38000, discountedPrice: 29900, stock: 120, sales: 89, isActive: true },
];

const CATEGORIES = ['전체', '전자기기', '패션/의류', '생활/주방', '건강/뷰티', '스포츠/레저', '식품', '유아/완구', '반려동물'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState(DUMMY_PRODUCTS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('전체');
  const [filterOpen, setFilterOpen] = useState(false);

  // 활성화 토글
  const toggleActive = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p)
    );
    // TODO: Supabase 업데이트
    // await supabase.from('products').update({ is_active: !product.isActive }).eq('id', id);
  };

  // 삭제
  const handleDelete = (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // TODO: await supabase.from('products').delete().eq('id', id);
  };

  const filtered = products.filter((p) => {
    const matchCat = catFilter === '전체' || p.category === catFilter;
    const matchSearch = !search || p.name.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl space-y-4">

      {/* 상단 도구바 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 검색 */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상품명 검색..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary bg-white"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-primary transition-colors"
          >
            <Filter className="w-4 h-4 text-[#666]" />
            {catFilter}
          </button>
          {filterOpen && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 min-w-32">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => { setCatFilter(c); setFilterOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F0F5FF] ${catFilter === c ? 'text-primary font-semibold' : 'text-[#555]'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-sm text-[#999]">총 {filtered.length}개</span>

        {/* 상품 등록 버튼 */}
        <Link href="/admin/products/new"
          className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />상품 등록
        </Link>
      </div>

      {/* 상품 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['썸네일', '상품명', '카테고리', '정가', '할인가', '재고', '판매수', '활성화', '관리'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#666] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const discountRate = p.discountedPrice ? Math.round((1 - p.discountedPrice / p.price) * 100) : 0;
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors">
                    {/* 썸네일 */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                        📦
                      </div>
                    </td>
                    {/* 상품명 */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#111] max-w-[200px] line-clamp-2">{p.name}</p>
                    </td>
                    {/* 카테고리 */}
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-[#555] px-2 py-1 rounded-full">{p.category}</span>
                    </td>
                    {/* 정가 */}
                    <td className="px-4 py-3 text-[#999] line-through text-xs">{fmt(p.price)}원</td>
                    {/* 할인가 */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#111]">{fmt(p.discountedPrice ?? p.price)}원</p>
                      {discountRate > 0 && <p className="text-[10px] text-red-500 font-semibold">{discountRate}% 할인</p>}
                    </td>
                    {/* 재고 */}
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${p.stock <= 5 ? 'text-red-600' : p.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {p.stock}개
                      </span>
                    </td>
                    {/* 판매수 */}
                    <td className="px-4 py-3 text-[#555] font-semibold">{p.sales.toLocaleString()}</td>
                    {/* 활성화 토글 */}
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p.id)} className="transition-transform hover:scale-110">
                        {p.isActive
                          ? <ToggleRight className="w-8 h-8 text-primary" />
                          : <ToggleLeft className="w-8 h-8 text-gray-300" />
                        }
                      </button>
                    </td>
                    {/* 관리 버튼 */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-[#666] hover:text-primary hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-[#666] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
