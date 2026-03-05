'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/lib/store';

// 모바일 하단 탭바에 표시될 5개 항목
const NAV_ITEMS = [
  { href: '/', label: '홈', icon: Home },
  { href: '/products', label: '카테고리', icon: LayoutGrid },
  { href: '/search', label: '검색', icon: Search },
  { href: '/cart', label: '장바구니', icon: ShoppingCart },
  { href: '/mypage', label: '마이페이지', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const totalCount = useCartStore((state) => state.getTotalCount());

  return (
    // md 이상 화면에서는 hidden. 모바일에서만 하단 고정으로 표시
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <ul className="flex items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const isCart = href === '/cart';

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors ${
                  isActive ? 'text-primary' : 'text-[#666666] hover:text-primary'
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  {/* 장바구니 뱃지 */}
                  {isCart && totalCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {totalCount > 99 ? '99+' : totalCount}
                    </span>
                  )}
                </span>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-normal'}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
