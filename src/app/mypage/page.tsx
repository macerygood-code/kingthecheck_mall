'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Heart, Star, Ticket, MapPin, User,
  ChevronRight, Truck, CheckCircle2, Clock, XCircle,
  LogOut, Edit3
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useWishlistStore, useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';

const fmt = (n: number) => n.toLocaleString('ko-KR');

// ────────────────────────────────────
// 더미 주문 데이터 (Supabase 연동 전 표시용)
// ────────────────────────────────────
const DUMMY_ORDERS = [
  {
    id: 'ORD-2024-001',
    date: '2024-12-15',
    products: [{ name: '무선 블루투스 이어폰 AGX Pro', price: 59000, qty: 1 }],
    total: 59000,
    status: '배송완료',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-12-28',
    products: [{ name: '스테인리스 진공 텀블러 500ml', price: 17900, qty: 2 }],
    total: 35800,
    status: '배송중',
  },
  {
    id: 'ORD-2025-001',
    date: '2025-01-03',
    products: [{ name: '에어프라이어 5.5L 대용량', price: 67900, qty: 1 }],
    total: 67900,
    status: '상품준비중',
  },
];

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  '결제완료':   { label: '결제완료',   color: 'bg-blue-100 text-blue-700',   icon: CheckCircle2 },
  '상품준비중': { label: '상품준비중', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  '배송중':    { label: '배송중',    color: 'bg-orange-100 text-orange-700', icon: Truck },
  '배송완료':  { label: '배송완료',  color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  '취소':      { label: '취소',      color: 'bg-gray-100 text-gray-500',     icon: XCircle },
};

// ────────────────────────────────────
// 탭 목록
// ────────────────────────────────────
const TABS = [
  { id: 'orders',    icon: Package,  label: '주문/배송' },
  { id: 'wishlist',  icon: Heart,    label: '찜 목록' },
  { id: 'reviews',   icon: Star,     label: '리뷰 관리' },
  { id: 'coupons',   icon: Ticket,   label: '쿠폰/포인트' },
  { id: 'addresses', icon: MapPin,   label: '배송지 관리' },
  { id: 'profile',   icon: User,     label: '회원정보 수정' },
];

// ────────────────────────────────────
// 주문/배송 탭
// ────────────────────────────────────
function OrdersTab() {
  const [period, setPeriod] = useState<'3' | '6' | '12'>('3');

  return (
    <div>
      {/* 기간 필터 */}
      <div className="flex gap-2 mb-4">
        {[{ v: '3', l: '최근 3개월' }, { v: '6', l: '6개월' }, { v: '12', l: '1년' }].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setPeriod(v as '3' | '6' | '12')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${period === v ? 'bg-primary text-white' : 'bg-gray-100 text-[#666] hover:bg-gray-200'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* 주문 카드 */}
      <div className="space-y-3">
        {DUMMY_ORDERS.map((order) => {
          const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE['결제완료'];
          const BadgeIcon = badge.icon;
          return (
            <div key={order.id} className="bg-[#F7F8FA] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#999]">{order.date} · {order.id}</span>
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${badge.color}`}>
                  <BadgeIcon className="w-3 h-3" />{badge.label}
                </span>
              </div>
              {order.products.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111] line-clamp-1">{p.name}</p>
                    <p className="text-xs text-[#999]">수량: {p.qty}개</p>
                  </div>
                  <p className="text-sm font-bold text-[#111]">{fmt(p.price)}원</p>
                </div>
              ))}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-primary">총 {fmt(order.total)}원</span>
                <div className="flex gap-2">
                  {order.status === '배송완료' && (
                    <button className="text-xs px-3 py-1.5 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                      리뷰 작성
                    </button>
                  )}
                  {order.status === '배송중' && (
                    <button className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                      배송 조회
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────
// 찜 목록 탭
// ────────────────────────────────────
function WishlistTab() {
  const { wishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-[#999] text-sm">찜한 상품이 없습니다</p>
        <Link href="/products" className="inline-block mt-4 text-sm text-primary font-semibold hover:underline">
          쇼핑하러 가기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {wishlist.map((p: Product) => {
        const discountRate = p.discountedPrice ? Math.round((1 - p.discountedPrice / p.price) * 100) : 0;
        return (
          <div key={p.id} className="bg-[#F7F8FA] rounded-xl overflow-hidden">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://via.placeholder.com/300x300?text=${encodeURIComponent(p.name.slice(0, 4))}`}
                alt={p.name} className="w-full aspect-square object-cover" />
              <button
                onClick={() => removeFromWishlist(p.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </button>
            </div>
            <div className="p-3">
              <Link href={`/products/${p.id}`}>
                <p className="text-xs text-[#111] line-clamp-2 mb-1 hover:text-primary">{p.name}</p>
              </Link>
              <div className="flex items-baseline gap-1">
                {discountRate > 0 && <span className="text-[10px] text-[#E02020] font-bold">{discountRate}%</span>}
                <span className="text-sm font-extrabold">{fmt(p.discountedPrice ?? p.price)}원</span>
              </div>
              <button
                onClick={() => addItem(p)}
                className="mt-2 w-full text-xs py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                장바구니 담기
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────
// 쿠폰/포인트 탭
// ────────────────────────────────────
function CouponsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '보유 포인트', value: '1,200P', sub: '1포인트 = 1원' },
          { label: '사용 가능 쿠폰', value: '2장', sub: '즉시 사용 가능' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-[#F0F5FF] rounded-xl p-4 text-center">
            <p className="text-xs text-[#666] mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-primary mb-1">{value}</p>
            <p className="text-[10px] text-[#999]">{sub}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { name: '신규 가입 쿠폰', discount: '3,000원 할인', expire: '2025-02-28' },
          { name: '첫 구매 감사 쿠폰', discount: '5,000원 할인', expire: '2025-03-31' },
        ].map(({ name, discount, expire }) => (
          <div key={name} className="border-2 border-dashed border-primary/30 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#111]">{name}</p>
              <p className="text-xs text-[#999] mt-0.5">유효기간 {expire}까지</p>
            </div>
            <span className="text-lg font-extrabold text-[#FF4500]">{discount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────
// 배송지 탭
// ────────────────────────────────────
function AddressesTab() {
  return (
    <div className="space-y-3">
      <div className="bg-[#F7F8FA] rounded-xl p-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <span className="text-xs bg-primary text-white rounded-full px-2 py-0.5 mr-2">기본</span>
            <span className="text-sm font-bold text-[#111]">홍길동</span>
            <span className="text-xs text-[#999] ml-2">010-0000-0000</span>
          </div>
          <button className="text-xs text-primary hover:underline">수정</button>
        </div>
        <p className="text-sm text-[#555]">서울특별시 강남구 테헤란로 123 AB타워 456호</p>
      </div>
      <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-[#999] hover:border-primary hover:text-primary transition-colors font-medium">
        + 배송지 추가
      </button>
    </div>
  );
}

// ────────────────────────────────────
// 회원정보 수정 탭
// ────────────────────────────────────
function ProfileTab() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.user_metadata?.name ?? '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone ?? '');

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-[#555] mb-1.5 block">이메일 (변경 불가)</label>
        <input value={user?.email ?? ''} readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-[#999]" />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#555] mb-1.5 block">이름</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#555] mb-1.5 block">휴대폰</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors" />
      </div>
      <button className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
        정보 수정 저장
      </button>
      <button
        onClick={handleSignOut}
        className="w-full py-3 border-2 border-gray-200 text-[#999] font-semibold rounded-xl hover:border-red-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />로그아웃
      </button>
    </div>
  );
}

// ────────────────────────────────────
// 미구현 탭 플레이스홀더
// ────────────────────────────────────
function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-[#999]">
      <Edit3 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
      <p className="text-sm">{label} 기능은 준비 중입니다</p>
    </div>
  );
}

// ────────────────────────────────────
// 마이페이지 메인
// ────────────────────────────────────
export default function MyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders');

  if (!loading && !user) {
    router.push('/login?redirect=/mypage');
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-[#999]">
        로딩 중...
      </div>
    );
  }

  const name = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? '회원';
  const email = user?.email ?? '';

  // 등급 계산 (더미 기준)
  const grade = '일반';
  const gradeColor = 'bg-gray-100 text-gray-600';

  const renderTab = () => {
    switch (activeTab) {
      case 'orders':    return <OrdersTab />;
      case 'wishlist':  return <WishlistTab />;
      case 'coupons':   return <CouponsTab />;
      case 'addresses': return <AddressesTab />;
      case 'profile':   return <ProfileTab />;
      default:          return <ComingSoonTab label={TABS.find((t) => t.id === activeTab)?.label ?? ''} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-8">

      {/* ─── 사용자 정보 카드 ─── */}
      <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold">
            {name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold">{name}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gradeColor}`}>{grade}</span>
            </div>
            <p className="text-sm text-white/70">{email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '주문', value: `${DUMMY_ORDERS.length}건` },
            { label: '포인트', value: '1,200P' },
            { label: '쿠폰', value: '2장' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl py-3 text-center">
              <p className="text-xs text-white/70 mb-0.5">{label}</p>
              <p className="text-base font-extrabold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 탭 메뉴 ─── */}
      <div className="flex overflow-x-auto gap-1 scrollbar-none bg-white rounded-2xl p-2 mb-5">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
              activeTab === id
                ? 'bg-primary text-white shadow-sm'
                : 'text-[#666] hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ─── 탭 콘텐츠 ─── */}
      <div className="bg-white rounded-2xl p-5">
        <h2 className="flex items-center gap-2 font-extrabold text-[#111] mb-5">
          {(() => { const Tab = TABS.find((t) => t.id === activeTab); return Tab ? <><Tab.icon className="w-5 h-5 text-primary" />{Tab.label}</> : null; })()}
          <ChevronRight className="w-4 h-4 text-[#ccc]" />
        </h2>
        {renderTab()}
      </div>
    </div>
  );
}
