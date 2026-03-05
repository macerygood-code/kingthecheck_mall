'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

/** 상단 카테고리 네비게이션 목록 */
const CATEGORIES = [
  '전자기기', '패션/의류', '생활/주방', '건강/뷰티',
  '스포츠/레저', '식품', '유아/완구', '반려동물', '기타',
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const totalCount = useCartStore((state) => state.getTotalCount());
  const { user, signOut } = useAuth();
  const router = useRouter();

  const displayName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? '회원';

  // 외부 클릭 시 드롭다운 닫기
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
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* ─── 상단 바: 로고 + 검색창 + 아이콘 ─── */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* 로고 */}
        <Link href="/" className="flex-shrink-0 text-2xl font-extrabold text-primary tracking-tight">
          KingTheCheck
        </Link>

        {/* 검색창 */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center bg-[#F7F8FA] border border-gray-200 rounded-lg overflow-hidden max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="상품을 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-transparent text-sm outline-none text-[#111111] placeholder:text-[#666666]"
          />
          <button type="submit" aria-label="검색" className="px-4 py-2.5 bg-primary text-white hover:bg-blue-700 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* 우측 아이콘 그룹 */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* 찜 */}
          <Link href="/mypage?tab=wishlist" aria-label="찜목록" className="hidden md:flex items-center gap-1 text-sm text-[#666666] hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
            <span>찜</span>
          </Link>

          {/* 장바구니 */}
          <Link href="/cart" aria-label="장바구니" className="relative flex items-center gap-1 text-sm text-[#666666] hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden md:inline">장바구니</span>
            {totalCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </Link>

          {/* ─── 로그인/유저 버튼 ─── */}
          {user ? (
            /* 로그인 상태: 이름 + 드롭다운 */
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 text-sm text-[#333] hover:text-primary transition-colors font-semibold"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {displayName.charAt(0)}
                </div>
                <span>{displayName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-bold text-[#111]">{displayName}</p>
                    <p className="text-[10px] text-[#999] truncate">{user.email}</p>
                  </div>
                  <nav className="py-1">
                    <Link href="/mypage" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#555] hover:bg-[#F0F5FF] hover:text-primary transition-colors">
                      <User className="w-4 h-4" />마이페이지
                    </Link>
                    <Link href="/mypage?tab=orders" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#555] hover:bg-[#F0F5FF] hover:text-primary transition-colors">
                      <Package className="w-4 h-4" />주문/배송
                    </Link>
                    <Link href="/mypage?tab=profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#555] hover:bg-[#F0F5FF] hover:text-primary transition-colors">
                      <Settings className="w-4 h-4" />회원정보 수정
                    </Link>
                    <hr className="border-gray-50 my-1" />
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" />로그아웃
                    </button>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            /* 비로그인 상태: 로그인 버튼 */
            <Link href="/login" aria-label="로그인" className="hidden md:flex items-center gap-1 text-sm text-[#666666] hover:text-primary transition-colors">
              <User className="w-5 h-5" />
              <span>로그인</span>
            </Link>
          )}

          {/* 모바일 햄버거 메뉴 */}
          <button className="md:hidden text-[#111111]" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ─── 데스크탑 카테고리 네비 ─── */}
      <nav className="hidden md:block border-t border-gray-100">
        <ul className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none">
          <li>
            <Link href="/products" className="flex-shrink-0 px-3 py-2.5 text-sm font-semibold text-[#111111] hover:text-primary transition-colors">
              전체
            </Link>
          </li>
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <Link href={`/products?category=${encodeURIComponent(cat)}`}
                className="flex-shrink-0 px-3 py-2.5 text-sm text-[#666666] hover:text-primary transition-colors whitespace-nowrap">
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ─── 모바일 드롭다운 메뉴 ─── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4">
          <ul className="space-y-1">
            {user ? (
              <>
                <li className="flex items-center gap-2 py-2 border-b border-gray-100 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111]">{displayName}</p>
                    <p className="text-[10px] text-[#999]">{user.email}</p>
                  </div>
                </li>
                <li><Link href="/mypage" className="block py-2 text-sm text-[#111]" onClick={() => setMenuOpen(false)}>마이페이지</Link></li>
                <li><button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="block py-2 text-sm text-red-500">로그아웃</button></li>
              </>
            ) : (
              <li><Link href="/login" className="block py-2 text-sm font-medium text-[#111]" onClick={() => setMenuOpen(false)}>로그인 / 회원가입</Link></li>
            )}
            <li><Link href="/mypage?tab=wishlist" className="block py-2 text-sm text-[#666666]" onClick={() => setMenuOpen(false)}>찜목록</Link></li>
            <li className="pt-2 border-t border-gray-100">
              <p className="text-xs text-[#999] mb-1">카테고리</p>
              {CATEGORIES.map((cat) => (
                <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`}
                  className="block py-1.5 text-sm text-[#666666] hover:text-primary" onClick={() => setMenuOpen(false)}>
                  {cat}
                </Link>
              ))}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
