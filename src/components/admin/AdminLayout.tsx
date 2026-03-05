'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Image, MessageSquare,
  ChevronLeft, ChevronRight, LogOut, Bell, Menu
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

// ────────────────────────────────────
// 사이드바 메뉴 목록
// ────────────────────────────────────
const NAV_ITEMS = [
  { href: '/admin',         icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/products', icon: Package,          label: '상품 관리' },
  { href: '/admin/orders',   icon: ShoppingCart,     label: '주문 관리' },
  { href: '/admin/users',    icon: Users,            label: '회원 관리' },
  { href: '/admin/banners',  icon: Image,            label: '배너 관리' },
  { href: '/admin/notices',  icon: MessageSquare,    label: '공지/FAQ' },
];

// ────────────────────────────────────
// 사이드바
// ────────────────────────────────────
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col h-screen bg-[#0F172A] text-white transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* 로고 */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <span className="font-extrabold text-lg text-white tracking-tight">
            KC<span className="text-[#FF4500]"> Admin</span>
          </span>
        )}
        <button
          onClick={onToggle}
          className="text-white/40 hover:text-white transition-colors ml-auto"
          aria-label="사이드바 접기"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-150 mb-0.5 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-semibold">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 하단 버전 */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <p className="text-[10px] text-white/30">v1.0.0 · KingTheCheck Admin</p>
        </div>
      )}
    </aside>
  );
}

// ────────────────────────────────────
// 어드민 레이아웃
// ────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const adminName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? '관리자';
  const pageTitle = NAV_ITEMS.find((n) =>
    pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href))
  )?.label ?? '대시보드';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5]">

      {/* 데스크탑 사이드바 */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* 상단 헤더 */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* 모바일 햄버거 */}
            <button
              className="md:hidden text-[#555] hover:text-primary"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] text-[#999]">관리자 콘솔</p>
              <h1 className="text-base font-extrabold text-[#111]">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-[#666] hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF4500] text-white text-[8px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                {adminName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#111]">{adminName}</p>
                <p className="text-[10px] text-[#999]">관리자</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[#999] hover:text-red-500 transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
