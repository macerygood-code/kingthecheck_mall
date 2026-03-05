'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  SlidersHorizontal, X, ChevronDown, ShoppingCart, Star, Heart, SearchX
} from 'lucide-react';
import { dummyProducts } from '@/lib/dummy-products';
import { fetchProducts, isSupabaseConfigured } from '@/lib/db';
import { useCartStore, useWishlistStore } from '@/lib/store';
import type { Product, Category } from '@/lib/types';

// ─────────────────────────────────────
// 상수
// ─────────────────────────────────────
const CATEGORIES: Category[] = [
  '전자기기', '패션/의류', '생활/주방', '건강/뷰티',
  '스포츠/레저', '식품', '유아/완구', '반려동물', '기타',
];

const PRICE_RANGES = [
  { label: '1만원 이하', min: 0, max: 10000 },
  { label: '1~3만원', min: 10000, max: 30000 },
  { label: '3~5만원', min: 30000, max: 50000 },
  { label: '5~10만원', min: 50000, max: 100000 },
  { label: '10만원 이상', min: 100000, max: Infinity },
];

const SORT_OPTIONS = [
  { value: 'recommend', label: '추천순' },
  { value: 'latest', label: '최신순' },
  { value: 'price_asc', label: '낮은가격순' },
  { value: 'price_desc', label: '높은가격순' },
  { value: 'review', label: '리뷰많은순' },
];

const PAGE_SIZE = 8;

// ─────────────────────────────────────
// 상품 카드
// ─────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();
  const [hovered, setHovered] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const fmt = (n: number) => n.toLocaleString('ko-KR');
  const discountRate = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow"
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      </button>

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

      <div className="p-3">
        <p className="text-[10px] text-[#999] mb-0.5">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <p className="text-sm font-medium text-[#111] line-clamp-2 mb-1 leading-snug">{product.name}</p>
        </Link>
        <div className="flex items-baseline gap-1">
          {discountRate > 0 && <span className="text-[#E02020] text-xs font-bold">{discountRate}%</span>}
          <span className="text-base font-extrabold text-[#111]">
            {fmt(product.discountedPrice ?? product.price)}원
          </span>
        </div>
        {product.discountedPrice && (
          <p className="text-[11px] text-[#bbb] line-through">{fmt(product.price)}원</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-[11px] text-[#666]">{product.rating}</span>
          <span className="text-[11px] text-[#bbb]">({product.reviewCount})</span>
        </div>
        <button
          onClick={() => addItem(product)}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> 장바구니
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────
// 필터 패널 내용 (공통)
// ─────────────────────────────────────
interface FilterState {
  categories: Category[];
  priceRange: number | null;   // PRICE_RANGES index, null = 전체
  rating: number;              // 0 = 전체, 4.0, 4.5
  freeShipping: boolean;
}

interface FilterPanelProps {
  filter: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}

function FilterPanel({ filter, onChange, onReset }: FilterPanelProps) {
  const toggle = (cat: Category) => {
    const list = filter.categories.includes(cat)
      ? filter.categories.filter((c) => c !== cat)
      : [...filter.categories, cat];
    onChange({ ...filter, categories: list });
  };

  return (
    <div className="space-y-6">
      {/* 카테고리 */}
      <div>
        <h3 className="text-sm font-bold text-[#111] mb-3">카테고리</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filter.categories.includes(cat)}
                onChange={() => toggle(cat)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-[#555] group-hover:text-primary transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 가격 범위 */}
      <div>
        <h3 className="text-sm font-bold text-[#111] mb-3">가격 범위</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={filter.priceRange === null}
              onChange={() => onChange({ ...filter, priceRange: null })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-[#555]">전체</span>
          </label>
          {PRICE_RANGES.map((p, i) => (
            <label key={p.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={filter.priceRange === i}
                onChange={() => onChange({ ...filter, priceRange: i })}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-[#555]">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 평점 */}
      <div>
        <h3 className="text-sm font-bold text-[#111] mb-3">평점</h3>
        <div className="space-y-1.5">
          {[{ label: '전체', value: 0 }, { label: '4.0★ 이상', value: 4.0 }, { label: '4.5★ 이상', value: 4.5 }].map((r) => (
            <label key={r.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filter.rating === r.value}
                onChange={() => onChange({ ...filter, rating: r.value })}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-[#555]">{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 무료배송 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#111]">무료배송만 보기</span>
        <button
          onClick={() => onChange({ ...filter, freeShipping: !filter.freeShipping })}
          className={`relative w-10 h-5.5 rounded-full transition-colors ${
            filter.freeShipping ? 'bg-primary' : 'bg-gray-200'
          }`}
          style={{ height: '22px' }}
          aria-checked={filter.freeShipping}
          role="switch"
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              filter.freeShipping ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* 초기화 버튼 */}
      <button
        onClick={onReset}
        className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-[#666] hover:border-primary hover:text-primary transition-colors font-medium"
      >
        필터 초기화
      </button>
    </div>
  );
}

// ─────────────────────────────────────
// DEFAULT FILTER
// ─────────────────────────────────────
const DEFAULT_FILTER: FilterState = {
  categories: [],
  priceRange: null,
  rating: 0,
  freeShipping: false,
};

// ─────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL→상태 초기화
  const initFilter = (): FilterState => {
    const catParam = searchParams.get('category') as Category | null;
    const cats = catParam ? [catParam] : [];
    const priceParam = searchParams.get('priceRange');
    const ratingParam = searchParams.get('rating');
    return {
      categories: cats,
      priceRange: priceParam !== null ? Number(priceParam) : null,
      rating: ratingParam ? Number(ratingParam) : 0,
      freeShipping: searchParams.get('freeShipping') === 'true',
    };
  };

  const [filter, setFilter] = useState<FilterState>(initFilter);
  const [sort, setSort] = useState(searchParams.get('sort') || 'recommend');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // 실제 데이터 (모든 상품 저장 후 클라이언트 엖에서 필터링)
  const [allProducts, setAllProducts] = useState<Product[]>(dummyProducts);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchProducts({ limit: 200 }).then((d) => {
      if (d.length) setAllProducts(d);
    });
  }, []);

  // 검색어
  const searchQuery = searchParams.get('search') ?? '';

  // URL 업데이트
  const updateURL = useCallback((f: FilterState, s: string) => {
    const params = new URLSearchParams();
    if (f.categories.length === 1) params.set('category', f.categories[0]);
    if (f.priceRange !== null) params.set('priceRange', String(f.priceRange));
    if (f.rating) params.set('rating', String(f.rating));
    if (f.freeShipping) params.set('freeShipping', 'true');
    if (s !== 'recommend') params.set('sort', s);
    if (searchQuery) params.set('search', searchQuery);
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [router, searchQuery]);

  const handleFilterChange = (f: FilterState) => {
    setFilter(f);
    setVisibleCount(PAGE_SIZE);
    updateURL(f, sort);
  };

  const handleSortChange = (s: string) => {
    setSort(s);
    setSortOpen(false);
    updateURL(filter, s);
  };

  const handleReset = () => {
    setFilter(DEFAULT_FILTER);
    setVisibleCount(PAGE_SIZE);
    updateURL(DEFAULT_FILTER, sort);
  };

  // 필터링 (서버가 아닌 클라이언트에서)
  const filtered = allProducts
    .filter((p) => {
      if (filter.categories.length > 0 && !filter.categories.includes(p.category)) return false;
      if (filter.rating > 0 && p.rating < filter.rating) return false;
      if (filter.freeShipping && !p.isBest) return false; // isBest를 무료배송 임시 플래그로 활용
      if (filter.priceRange !== null) {
        const { min, max } = PRICE_RANGES[filter.priceRange];
        const price = p.discountedPrice ?? p.price;
        if (price < min || price > max) return false;
      }
      if (searchQuery && !p.name.includes(searchQuery)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price);
      if (sort === 'price_desc') return (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price);
      if (sort === 'review') return b.reviewCount - a.reviewCount;
      if (sort === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.rating - a.rating; // recommend
    });

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // 현재 카테고리 이름 (단일 선택 시)
  const currentCatName = filter.categories.length === 1 ? filter.categories[0] : '전체 상품';
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '추천순';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ─── 브레드크럼 ─── */}
      <nav className="flex items-center gap-1.5 text-xs text-[#999] mb-4">
        <Link href="/" className="hover:text-primary transition-colors">홈</Link>
        <span>/</span>
        <span className="text-[#111] font-medium">{currentCatName}</span>
      </nav>

      {/* ─── 헤더 영역 ─── */}
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold text-[#111]">
            {currentCatName}
            <span className="ml-2 text-sm font-normal text-[#999]">{filtered.length}개</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 모바일 필터 버튼 */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#555] hover:border-primary hover:text-primary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            필터
          </button>

          {/* 정렬 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#555] hover:border-primary hover:text-primary transition-colors min-w-[110px] justify-between"
            >
              {currentSortLabel}
              <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => handleSortChange(o.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F0F5FF] ${
                      sort === o.value ? 'text-primary font-semibold' : 'text-[#555]'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 활성 필터 태그 ─── */}
      {(filter.categories.length > 0 || filter.priceRange !== null || filter.rating > 0 || filter.freeShipping) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filter.categories.map((c) => (
            <span key={c} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {c}
              <button onClick={() => handleFilterChange({ ...filter, categories: filter.categories.filter((x) => x !== c) })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filter.priceRange !== null && (
            <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {PRICE_RANGES[filter.priceRange].label}
              <button onClick={() => handleFilterChange({ ...filter, priceRange: null })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filter.rating > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {filter.rating}★ 이상
              <button onClick={() => handleFilterChange({ ...filter, rating: 0 })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filter.freeShipping && (
            <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              무료배송
              <button onClick={() => handleFilterChange({ ...filter, freeShipping: false })}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={handleReset} className="text-xs text-[#999] hover:text-red-500 transition-colors">
            전체 초기화
          </button>
        </div>
      )}

      {/* ─── 메인 콘텐츠 레이아웃 ─── */}
      <div className="flex gap-6">

        {/* ───── 좌측 필터 (데스크탑 sticky) ───── */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="sticky top-[130px] bg-white rounded-2xl p-5 shadow-sm">
            <FilterPanel filter={filter} onChange={handleFilterChange} onReset={handleReset} />
          </div>
        </aside>

        {/* ───── 상품 그리드 ───── */}
        <div className="flex-1 min-w-0">
          {visibleProducts.length === 0 ? (
            /* 빈 결과 상태 */
            <div className="bg-white rounded-2xl py-20 text-center">
              <SearchX className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-[#333] mb-2">검색 결과가 없습니다</p>
              <p className="text-sm text-[#999] mb-6">다른 키워드나 필터를 사용해 보세요</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <>
              {/* 그리드: 데스크탑 4열 / 태블릿 3열 / 모바일 2열 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* 더보기 버튼 */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="px-10 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-200"
                  >
                    더보기 ({filtered.length - visibleCount}개 남음)
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-[#bbb] mt-4">
                {Math.min(visibleCount, filtered.length)} / {filtered.length}개 표시
              </p>
            </>
          )}
        </div>
      </div>

      {/* ───── 모바일 필터 드로어 ───── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 오버레이 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* 패널 */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#111]">필터</h2>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-[#666]" />
              </button>
            </div>
            <div className="p-5">
              <FilterPanel
                filter={filter}
                onChange={(f) => { handleFilterChange(f); }}
                onReset={() => { handleReset(); setMobileFilterOpen(false); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 정렬 드롭다운 외부 클릭 닫기 */}
      {sortOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
      )}
    </div>
  );
}

// Suspense wrapper (useSearchParams 사용 때문에 필요)
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10 text-center text-[#999]">로딩 중...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
