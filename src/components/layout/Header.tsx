'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronDown, LogOut, Package, Settings, ChevronRight, BadgeCheck, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

/** 상단 카테고리 네비게이션 목록 (메가 메뉴용 상세 구조) */
const CATEGORY_DATA = [
  {
    name: '패션의류/잡화',
    sub: ['여성패션', '남성패션', '남녀 공용 의류', '유아동패션', '잡화/슈즈']
  },
  {
    name: '뷰티',
    sub: ['스킨케어', '메이크업', '향수', '헤어/바디', '남성 화장품']
  },
  {
    name: '출산/유아동',
    sub: ['기저귀', '물티슈', '분유/유아식', '유모차/카시트', '완구/교구']
  },
  {
    name: '식품',
    sub: ['과일', '채소/계란', '정육/수산', '생수/음료', '가공식품']
  },
  {
    name: '주방용품',
    sub: ['냄비/프라이팬', '그릇/식기', '보관/밀폐용기', '커피/티용품', '주방가전']
  },
  {
    name: '생활용품',
    sub: ['헤어/바디/세안', '청소/세탁/욕실', '화장지/물티슈', '탈취/방향제']
  },
  {
    name: '홈인테리어',
    sub: ['가구', '침구', '조명', '커튼/블라인드', '셀프인테리어']
  },
  {
    name: '가전디지털',
    sub: ['노트북/PC', '태블릿/패드', '휴대폰', '영상가전', '주변기기']
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryHover, setCategoryHover] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(CATEGORY_DATA[0]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalCount = useCartStore((state) => state.getTotalCount());
  const { user, signOut } = useAuth();
  const router = useRouter();

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? '회원';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white shadow-md border-b border-gray-100">
      {/* 1. 최상단 보조 바 (로그인/고객센터 등) */}
      <div className="bg-[#F0F0F0] text-[11px] text-[#666]">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-end gap-4">
          <Link href="/login" className="hover:text-black">로그인</Link>
          <Link href="/signup" className="hover:text-black">회원가입</Link>
          <Link href="/cs" className="hover:text-black">고객센터</Link>
        </div>
      </div>

      {/* 2. 메인 로고/검색 바 */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-8">
        {/* 카테고리 버튼 (메가 메뉴) */}
        <div
          className="relative flex-shrink-0"
          onMouseEnter={() => setCategoryHover(true)}
          onMouseLeave={() => setCategoryHover(false)}
        >
          <button className="flex flex-col items-center justify-center w-20 h-20 bg-primary text-white gap-1 rounded-sm hover:bg-blue-700 transition-colors">
            <Menu className="w-8 h-8" />
            <span className="text-[14px] font-bold">카테고리</span>
          </button>

          {/* 메가 메뉴 드롭다운 */}
          {categoryHover && (
            <div className="absolute top-full left-0 w-[800px] bg-white shadow-2xl border border-gray-200 flex min-h-[480px]">
              {/* 메인 카테고리 목록 */}
              <div className="w-56 bg-[#FAFAFA] border-r border-gray-100 py-2">
                {CATEGORY_DATA.map((cat) => (
                  <div
                    key={cat.name}
                    onMouseEnter={() => setActiveSubMenu(cat)}
                    className={`flex items-center justify-between px-4 py-3 text-[14px] cursor-pointer transition-colors ${activeSubMenu.name === cat.name ? 'bg-white text-primary font-bold' : 'text-[#333] hover:bg-gray-100'
                      }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                ))}
              </div>

              {/* 서브 카테고리 상세 목록 */}
              <div className="flex-1 p-8 grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="col-span-2 border-b border-gray-100 pb-4 mb-2">
                  <h4 className="text-xl font-bold text-[#111]">{activeSubMenu.name}</h4>
                </div>
                {activeSubMenu.sub.map(s => (
                  <Link
                    key={s}
                    href={`/products?category=${encodeURIComponent(s)}`}
                    className="text-[14px] text-[#555] hover:text-primary hover:underline"
                  >
                    {s}
                  </Link>
                ))}
                {/* 광고성 배너 (임시) */}
                <div className="col-span-2 mt-auto pt-8 flex gap-4">
                  <div className="flex-1 h-32 bg-blue-50 rounded flex items-center justify-center border border-blue-100 italic text-blue-400">
                    신학기 특가전 최대 50%
                  </div>
                  <div className="flex-1 h-32 bg-pink-50 rounded flex items-center justify-center border border-pink-100 italic text-pink-400">
                    오늘의 발견 추천 상품
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 로고 */}
        <Link href="/" className="flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <h1 className="text-4xl font-black text-primary italic tracking-tighter">COUPANG</h1>
        </Link>

        {/* 검색창 */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center bg-white border-2 border-primary rounded-sm overflow-hidden h-12">
          <div className="px-4 border-r border-gray-200 text-sm text-[#555] flex items-center gap-1 cursor-pointer hover:bg-gray-50 h-full">
            전체 <ChevronDown className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="찾고 싶은 상품을 검색해보세요!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 bg-transparent text-[15px] outline-none text-[#111111] placeholder:text-[#999]"
          />
          <button type="submit" aria-label="검색" className="px-6 h-full text-primary hover:bg-blue-50 transition-colors">
            <Search className="w-6 h-6" />
          </button>
        </form>

        {/* 우측 아이콘 그룹 */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* 마이쿠팡 */}
          <Link href="/mypage" className="flex flex-col items-center gap-1.5 text-[#333] hover:text-primary transition-colors">
            <User className="w-8 h-8" />
            <span className="text-[12px]">마이쿠팡</span>
          </Link>

          {/* 장바구니 */}
          <Link href="/cart" className="relative flex flex-col items-center gap-1.5 text-[#333] hover:text-primary transition-colors">
            <ShoppingCart className="w-8 h-8" />
            <span className="text-[12px]">장바구니</span>
            {totalCount > 0 && (
              <span className="absolute -top-1 right-0 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 3. 하단 네비게이션 가로 바 */}
      <nav className="border-t border-gray-100 bg-[#FAFAFA]">
        <ul className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-2.5">
          <li className="flex items-center gap-1 text-[13px] font-bold text-primary cursor-pointer hover:underline">
            <BadgeCheck className="w-4 h-4" /> 로켓배송
          </li>
          <li className="flex items-center gap-1 text-[13px] font-bold text-green-600 cursor-pointer hover:underline">
            <Truck className="w-4 h-4" /> 로켓프레시
          </li>
          <li className="text-[13px] font-medium text-[#333] cursor-pointer hover:text-primary">쿠팡비즈</li>
          <li className="text-[13px] font-medium text-[#333] cursor-pointer hover:text-primary">로켓직구</li>
          <li className="text-[13px] font-medium text-[#333] cursor-pointer hover:text-primary">골드박스</li>
          <li className="text-[13px] font-medium text-[#333] cursor-pointer hover:text-primary">정기배송</li>
          <li className="text-[13px] font-medium text-[#333] cursor-pointer hover:text-primary">이벤트/쿠폰</li>
        </ul>
      </nav>
    </header>
  );
}
