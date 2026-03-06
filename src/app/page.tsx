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
import CategorySection from '@/components/home/CategorySection';
import ProductCard from '@/components/common/ProductCard';

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
  const [slide, setSlide] = useState(0);
  const nextSlide = useCallback(() => setSlide((p) => (p + 1) % SLIDES.length), []);
  const prevSlide = useCallback(() => setSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    const id = setInterval(nextSlide, 5000);
    return () => clearInterval(id);
  }, [nextSlide]);

  const timer = useCountdown();

  // 데이터 분류 (실제 환경에서는 DB에서 가져옴)
  const digitalProducts = dummyProducts.filter(p => p.category === '전자기기');
  const fashionProducts = dummyProducts.filter(p => p.category === '패션/의류');
  const livingProducts = dummyProducts.filter(p => p.category === '생활/주방');
  const babyProducts = dummyProducts.filter(p => p.category === '유아/완구');
  const petProducts = dummyProducts.filter(p => p.category === '반려동물');

  const s = SLIDES[slide];

  return (
    <div className="bg-[#F7F8FA] pb-12">

      {/* 1. 메인 히어로 슬라이더 (Full Width) */}
      <section className="relative w-full h-[320px] md:h-[450px] overflow-hidden group">
        <div
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${s.bg} flex items-center justify-center`}
        >
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col items-start z-10">
            <span className="inline-block text-sm font-bold bg-black/10 px-3 py-1 rounded mb-4 text-white">
              {s.tag}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              {s.title}
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-8 max-w-lg">
              {s.sub}
            </p>
            <Link
              href={s.href}
              className={`px-8 py-3 rounded-full font-bold transition-all shadow-lg ${s.btnClass}`}
            >
              {s.cta}
            </Link>
          </div>
          {/* 장식용 배경 이미지 (실제 서비스시) */}
          <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-l from-white/20 to-transparent" />
          </div>
        </div>

        {/* 조절 버튼 */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all text-white">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 하단 인디케이터 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 transition-all rounded-full ${i === slide ? 'bg-white w-8' : 'bg-white/30 w-4'}`}
            />
          ))}
        </div>
      </section>

      {/* 2. 오늘의 골드박스 (Time Sale) */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-30">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-[#E9967A] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">✨ 골드박스</span>
              <span className="text-xs opacity-80 border-l border-white/30 pl-2 ml-2 hidden sm:inline">오늘만 이 가격, 선착순 한정수량!</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">종료까지</span>
              <div className="flex gap-1 font-mono font-bold">
                <span className="bg-white text-[#E9967A] px-1.5 py-0.5 rounded">{timer.h}</span>:
                <span className="bg-white text-[#E9967A] px-1.5 py-0.5 rounded">{timer.m}</span>:
                <span className="bg-white text-[#E9967A] px-1.5 py-0.5 rounded">{timer.s}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 p-4 gap-4">
            {dummyProducts.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} highDensity />
            ))}
          </div>
        </div>
      </section>

      {/* 3. 카테고리별 전문 섹션 (쿠팡 컨셉) */}

      {/* 가전디지털 */}
      <CategorySection
        title="가전디지털"
        themeColor="#1A4FC4"
        heroText="스마트한 일상을 위한 선택"
        heroSubText="최신 가전부터 주변기기까지 한눈에"
        keywords={['노트북', '아이패드', '에어팟', '모니터', '기계식키보드', '게이밍마우스', '스마트워치']}
        products={digitalProducts}
      />

      {/* 가로 광고 배너 1 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="w-full h-24 bg-[#E8F0FE] rounded-lg flex items-center justify-center border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
          <p className="text-blue-600 font-bold text-lg">🚀 로켓와우 회원이라면? 최대 20% 추가 적립 혜택을 확인하세요!</p>
        </div>
      </div>

      {/* 패션/의류 */}
      <CategorySection
        title="패션/의류"
        themeColor="#E02020"
        heroText="봄 신상 트렌드 가이드"
        heroSubText="가장 핫한 룩을 가장 먼저 만나보세요"
        keywords={['원피스', '후드티', '청바지', '바람막이', '운동화', '에코백', '선글라스']}
        products={fashionProducts}
      />

      {/* 유아동 */}
      <CategorySection
        title="유아/완구"
        themeColor="#FFD700"
        heroText="우리 아이를 위한 모든 것"
        heroSubText="안전하고 즐거운 육아의 시작"
        keywords={['물티슈', '기저귀', '유모차', '카시트', '블록완구', '어린이영양제', '유아내의']}
        products={babyProducts}
      />

      {/* 반려동물 */}
      <CategorySection
        title="반려동물"
        themeColor="#4CAF50"
        heroText="멍냥이를 위한 꿀템 모음"
        heroSubText="사랑하는 가족을 위한 건강한 간식과 용품"
        keywords={['강아지사료', '고양이모래', '애견패드', '츄르', '스크래쳐', '자동급식기', '강아지옷']}
        products={petProducts}
      />

      {/* 주방용품 (예시용 데이터 추가 로드 필요하나 기존 데이터 활용) */}
      <CategorySection
        title="생활/주방"
        themeColor="#FF8C00"
        heroText="품격 있는 주방의 완성"
        heroSubText="매일 쓰는 도구일수록 더 특별하게"
        keywords={['텀블러', '프라이팬', '밀폐용기', '수저세트', '앞치마', '주방저울', '도마']}
        products={livingProducts}
      />

    </div>
  );
}
