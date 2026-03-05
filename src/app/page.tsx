'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Smartphone, Shirt, Home, Heart, Bike, Apple, Baby, PawPrint, Gift,
  ChevronLeft, ChevronRight, ShoppingCart, Star, Truck, BadgeCheck, MessageCircle, RotateCcw,
} from 'lucide-react';
import { dummyProducts } from '@/lib/dummy-products';
import { useCartStore, useWishlistStore } from '@/lib/store';
import type { Product, Category } from '@/lib/types';

// ─────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('ko-KR');

// ─────────────────────────────────────
// 1. 히어로 슬라이더 데이터
// ─────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    bg: 'bg-[#E02020]',
    tag: '오늘의 특가',
    title: '최대 50% 할인',
    sub: '오늘 자정까지만! 놓치면 후회하는 가격',
    cta: '특가 보러가기',
    href: '/products',
    textColor: 'text-white',
    btnClass: 'bg-white text-[#E02020] hover:bg-gray-100',
  },
  {
    id: 2,
    bg: 'bg-[#1A4FC4]',
    tag: '신뢰할 수 있는 쇼핑',
    title: '정품 인증 보장',
    sub: '모든 상품 100% 정품 · 당일 검수 후 발송',
    cta: '지금 쇼핑하기',
    href: '/products',
    textColor: 'text-white',
    btnClass: 'bg-white text-[#1A4FC4] hover:bg-gray-100',
  },
  {
    id: 3,
    bg: 'bg-[#F0F7FF]',
    tag: '무료배송 이벤트',
    title: '전 상품 무료배송',
    sub: '쿠폰 없이도, 금액 제한 없이 무료배송 진행 중',
    cta: '혜택 받기',
    href: '/products',
    textColor: 'text-[#1A4FC4]',
    btnClass: 'bg-[#1A4FC4] text-white hover:bg-blue-700',
  },
];

const SMALL_BANNERS = [
  { bg: 'bg-[#FFF3CD]', emoji: '🎁', label: '첫 구매 5,000원 할인' },
  { bg: 'bg-[#D4EDDA]', emoji: '🚚', label: '오늘 주문 오늘 출고' },
];

// ─────────────────────────────────────
// 2. 카테고리 바 데이터
// ─────────────────────────────────────
const CATS: { name: Category; icon: React.ElementType }[] = [
  { name: '전자기기', icon: Smartphone },
  { name: '패션/의류', icon: Shirt },
  { name: '생활/주방', icon: Home },
  { name: '건강/뷰티', icon: Heart },
  { name: '스포츠/레저', icon: Bike },
  { name: '식품', icon: Apple },
  { name: '유아/완구', icon: Baby },
  { name: '반려동물', icon: PawPrint },
  { name: '기타', icon: Gift },
];

// ─────────────────────────────────────
// 신뢰 배지
// ─────────────────────────────────────
const BADGES = [
  { icon: BadgeCheck, color: 'text-green-600', label: '정품 보장' },
  { icon: Truck, color: 'text-blue-600', label: '빠른 배송' },
  { icon: MessageCircle, color: 'text-purple-600', label: '친절 상담' },
  { icon: RotateCcw, color: 'text-orange-500', label: '쉬운 반품' },
];

// ─────────────────────────────────────
// 상품 카드 컴포넌트
// ─────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();
  const [hovered, setHovered] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const discountRate = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100)
    : 0;

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 찜 버튼 */}
      <button
        onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow"
        aria-label="찜하기"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`}
        />
      </button>

      {/* 이미지 */}
      <Link href={`/products/${product.id}`}>
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name.slice(0, 6))}`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discountRate > 0 && (
            <span className="absolute top-2 left-2 bg-[#E02020] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discountRate}%
            </span>
          )}
        </div>
      </Link>

      {/* 텍스트 */}
      <div className="p-3">
        <p className="text-[10px] text-[#999] mb-0.5">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <p className="text-sm font-medium text-[#111] line-clamp-2 mb-1 leading-snug hover:text-primary transition-colors">
            {product.name}
          </p>
        </Link>

        {/* 가격 */}
        <div className="flex items-baseline gap-1.5">
          {discountRate > 0 && (
            <span className="text-[#E02020] text-xs font-bold">{discountRate}%</span>
          )}
          <span className="text-base font-extrabold text-[#111]">
            {fmt(product.discountedPrice ?? product.price)}원
          </span>
        </div>
        {product.discountedPrice && (
          <p className="text-[11px] text-[#bbb] line-through">{fmt(product.price)}원</p>
        )}

        {/* 별점 */}
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] text-[#666]">{product.rating}</span>
          <span className="text-[11px] text-[#bbb]">({product.reviewCount})</span>
        </div>

        {/* 장바구니 버튼 (hover 시 나타남) */}
        <button
          onClick={() => addItem(product)}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
          aria-label="장바구니 담기"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          장바구니
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// 카운트다운 훅 (자정 기준)
// ─────────────────────────────────────
function useCountdown() {
  const getSecondsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };

  const [seconds, setSeconds] = useState(getSecondsUntilMidnight);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return { h, m, s };
}

// ─────────────────────────────────────
// 메인 홈 페이지
// ─────────────────────────────────────
export default function HomePage() {
  // 슬라이더 상태
  const [slide, setSlide] = useState(0);
  const nextSlide = useCallback(() => setSlide((p) => (p + 1) % SLIDES.length), []);
  const prevSlide = useCallback(() => setSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    const id = setInterval(nextSlide, 4000);
    return () => clearInterval(id);
  }, [nextSlide]);

  // 카테고리 탭 상태
  const TAB_CATS: Category[] = ['전자기기', '패션/의류', '생활/주방', '건강/뷰티'];
  const [activeTab, setActiveTab] = useState<Category>('전자기기');

  // 카운트다운
  const timer = useCountdown();

  // ── Supabase 데이터 패칭 (미설정 시 더미 데이터 폴백) ──
  const [dealProducts, setDealProducts] = useState<Product[]>(
    dummyProducts.filter((p) => p.discountedPrice).slice(0, 6)
  );
  const [bestProducts, setBestProducts] = useState<Product[]>(dummyProducts.slice(0, 8));
  const [newProducts, setNewProducts] = useState<Product[]>([...dummyProducts].reverse().slice(0, 8));
  const [allProducts, setAllProducts] = useState<Product[]>(dummyProducts);

  useEffect(() => {
    const loadData = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const configured = !!(supabaseUrl && supabaseKey &&
        supabaseUrl !== 'https://your-project.supabase.co' &&
        supabaseKey !== 'your-anon-key-here');
      if (!configured) return; // 미설정 시 더미 데이터 유지
      const { fetchDailyDeals: fdd, fetchProducts: fp, fetchNewArrivals: fna } = await import('@/lib/db');
      fdd(6).then((d) => { if (d.length) setDealProducts(d); });
      fp({ isFeatured: true, limit: 8 }).then((d) => { if (d.length) setBestProducts(d); });
      fna(8).then((d) => { if (d.length) setNewProducts(d); });
      fp({ limit: 50 }).then((d) => { if (d.length) setAllProducts(d); });
    };
    loadData();
  }, []);

  const tabProducts = allProducts.filter((p) => p.category === activeTab).slice(0, 4);
  const s = SLIDES[slide];

  return (
    <div className="bg-[#F7F8FA]">

      {/* ══════════════════════════════════
          1. 히어로 배너 슬라이더
      ══════════════════════════════════ */}
      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-4 items-stretch">
            {/* 메인 슬라이드 */}
            <div className={`relative flex-1 rounded-2xl overflow-hidden ${s.bg} min-h-[220px] md:min-h-[280px] flex items-center`}>
              <div className={`px-8 py-10 z-10 relative ${s.textColor}`}>
                <span className="inline-block text-xs font-semibold opacity-80 bg-white/20 px-3 py-1 rounded-full mb-3">
                  {s.tag}
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold mb-2 leading-tight">{s.title}</h1>
                <p className="text-sm md:text-base opacity-80 mb-5">{s.sub}</p>
                <Link
                  href={s.href}
                  className={`inline-block text-sm font-bold px-6 py-2.5 rounded-full transition-colors ${s.btnClass}`}
                >
                  {s.cta} →
                </Link>
              </div>
              {/* 좌우 화살표 */}
              <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors" aria-label="이전">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors" aria-label="다음">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
              {/* 인디케이터 */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-white w-5' : 'bg-white/40'}`} />
                ))}
              </div>
            </div>

            {/* 소형 배너 (데스크탑만) */}
            <div className="hidden md:flex flex-col gap-4 w-[200px] flex-shrink-0">
              {SMALL_BANNERS.map((b) => (
                <div key={b.label} className={`flex-1 ${b.bg} rounded-2xl flex flex-col items-center justify-center gap-2 p-4 cursor-pointer hover:opacity-90 transition-opacity`}>
                  <span className="text-3xl">{b.emoji}</span>
                  <p className="text-sm font-semibold text-center text-[#333] leading-snug">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          2. 카테고리 아이콘 바
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-white rounded-2xl p-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {CATS.map(({ name, icon: Icon }) => (
              <Link
                key={name}
                href={`/products?category=${encodeURIComponent(name)}`}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-xl hover:bg-[#F0F5FF] transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#F0F5FF] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[11px] text-[#555] whitespace-nowrap">{name.replace('/', '/\n')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          3. 오늘의 특가 (타이머)
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* 헤더 */}
          <div className="bg-[#E02020] px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white text-lg font-extrabold">🔥 오늘의 특가</span>
              <span className="text-white/70 text-sm hidden sm:inline">오늘만 이 가격!</span>
            </div>
            {/* 타이머 */}
            <div className="flex items-center gap-1.5">
              {[timer.h, timer.m, timer.s].map((val, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="bg-[#B00000] text-white text-sm font-mono font-bold w-9 py-1 rounded text-center">{val}</span>
                  {i < 2 && <span className="text-white font-bold">:</span>}
                </span>
              ))}
              <span className="text-white/70 text-xs ml-1">후 종료</span>
            </div>
          </div>
          {/* 상품 가로 스크롤 */}
          <div className="flex gap-4 overflow-x-auto p-4 scrollbar-none">
            {dealProducts.map((p) => (
              <div key={p.id} className="flex-shrink-0 w-[160px] md:w-[180px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className="text-center pb-4">
            <Link href="/products" className="text-sm text-primary font-semibold hover:underline">
              전체 특가 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          신뢰 배지 바
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-2">
        <div className="bg-white rounded-2xl px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map(({ icon: Icon, color, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-sm font-semibold text-[#333]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          4. 베스트셀러
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-[#111]">
            📦 지금 가장 많이 팔리는 상품
          </h2>
          <Link href="/products" className="text-sm text-primary hover:underline font-medium">더보기 →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bestProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ══════════════════════════════════
          5. 카테고리별 추천 (탭)
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-5">
          <h2 className="text-lg font-extrabold text-[#111] mb-4">카테고리별 추천</h2>
          {/* 탭 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4">
            {TAB_CATS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === cat
                    ? 'bg-primary text-white'
                    : 'bg-[#F7F8FA] text-[#666] hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* 상품 4개 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tabProducts.length > 0
              ? tabProducts.map((p) => <ProductCard key={p.id} product={p} />)
              : <p className="col-span-4 text-sm text-[#999] py-8 text-center">해당 카테고리 상품이 없습니다.</p>
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          7. 신규 입고
      ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-[#111]">✨ 방금 들어온 신상품</h2>
          <Link href="/products" className="text-sm text-primary hover:underline font-medium">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

    </div>
  );
}
