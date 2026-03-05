'use client';

import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Star, Heart, Share2, ShoppingCart, Truck,
  ChevronDown, ChevronUp, ZoomIn, Lock, MessageSquare,
} from 'lucide-react';
import { dummyProducts } from '@/lib/dummy-products';
import { useCartStore, useWishlistStore } from '@/lib/store';
import type { Product } from '@/lib/types';

const DUMMY_REVIEWS = [
  { id: 1, name: '김*수', rating: 5, date: '2025-02-20', body: '품질이 정말 좋아요! 가격 대비 최고입니다. 재구매 의사 100%' },
  { id: 2, name: '박*영', rating: 4, date: '2025-02-15', body: '배송도 빠르고 포장도 꼼꼼했어요. 상품도 사진이랑 똑같아서 만족합니다.' },
  { id: 3, name: '이*진', rating: 5, date: '2025-02-10', body: '지인 추천으로 구매했는데 정말 좋네요. 주변에 다 추천했습니다.' },
  { id: 4, name: '최*안', rating: 3, date: '2025-01-28', body: '보통입니다. 가격 생각하면 나쁘지 않아요.' },
];

const DUMMY_QNA = [
  { id: 1, question: '이 제품 AS는 어떻게 되나요?', answer: '구매일로부터 1년간 무상 AS가 제공됩니다.', isSecret: false, date: '2025-02-18' },
  { id: 2, question: '색상 옵션이 더 있나요?', answer: null, isSecret: false, date: '2025-02-22' },
  { id: 3, question: '비밀 질문입니다.', answer: null, isSecret: true, date: '2025-02-25' },
];

function Stars({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating}점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-${size} h-${size} ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </span>
  );
}

function RelatedCard({ product }: { product: Product }) {
  const fmt = (n: number) => n.toLocaleString('ko-KR');
  const addItem = useCartStore((s) => s.addItem);
  const discountRate = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  return (
    <div className="flex-shrink-0 w-40 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <Link href={`/products/${product.id}`}>
        <div className="w-full aspect-square bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name.slice(0, 4))}`}
            alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </div>
      </Link>
      <div className="p-2.5">
        <p className="text-xs text-[#111] line-clamp-2 mb-1">{product.name}</p>
        {discountRate > 0 && <p className="text-[10px] text-[#E02020] font-bold">{discountRate}%</p>}
        <p className="text-sm font-extrabold text-[#111]">{fmt(product.discountedPrice ?? product.price)}원</p>
        <button onClick={() => addItem(product)} className="mt-1.5 w-full text-[10px] bg-primary text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors">담기</button>
      </div>
    </div>
  );
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailClient({ params }: Props) {
  const { id } = use(params);
  const product = dummyProducts.find((p) => p.id === id);
  if (!product) notFound();

  const fmt = (n: number) => n.toLocaleString('ko-KR');
  const discountRate = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  const [mainImg, setMainImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'review' | 'qna'>('info');
  const [openQna, setOpenQna] = useState<number | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const THUMBS = [
    `https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name.slice(0, 4))}`,
    `https://via.placeholder.com/600x600/E0E0E0/555?text=IMG2`,
    `https://via.placeholder.com/600x600/C0D8FF/333?text=IMG3`,
    `https://via.placeholder.com/600x600/FFE0C0/333?text=IMG4`,
    `https://via.placeholder.com/600x600/D0FFD0/333?text=IMG5`,
  ];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getMonth() + 1}월 ${tomorrow.getDate()}일`;
  const related = dummyProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6);
  const unitPrice = product.discountedPrice ?? product.price;
  const totalPrice = unitPrice * qty;
  const ratingDist = [
    { star: 5, pct: 62 }, { star: 4, pct: 21 },
    { star: 3, pct: 10 }, { star: 2, pct: 4 }, { star: 1, pct: 3 },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-8">
        <nav className="flex items-center gap-1.5 text-xs text-[#999] mb-5">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span>/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">{product.category}</Link>
          <span>/</span>
          <span className="text-[#111] line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 mb-10">
          <div>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in group"
              onMouseEnter={() => setZoomed(true)} onMouseLeave={() => setZoomed(false)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={THUMBS[mainImg]} alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${zoomed ? 'scale-125' : 'scale-100'}`} />
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${zoomed ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                <ZoomIn className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
              {THUMBS.map((src, i) => (
                <button key={i} onClick={() => setMainImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${mainImg === i ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`썸네일${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-[22px] font-extrabold text-[#111] leading-snug mb-3">{product.name}</h1>
            <button onClick={() => setActiveTab('review')} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <Stars rating={product.rating} size={4} />
              <span className="text-sm font-semibold text-[#333]">{product.rating}</span>
              <span className="text-sm text-primary underline">({product.reviewCount}개 리뷰)</span>
            </button>
            <div className="flex items-center gap-2 bg-[#F0F7FF] rounded-xl px-4 py-3 mb-4">
              <Truck className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#111]">내일({tomorrowStr}) 도착 예정</p>
                <p className="text-xs text-green-600 font-semibold">무료배송</p>
              </div>
            </div>
            <hr className="border-gray-100 my-4" />
            <div className="mb-4">
              {discountRate > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#E02020] font-extrabold text-xl">{discountRate}%</span>
                  <span className="text-sm text-[#bbb] line-through">{fmt(product.price)}원</span>
                </div>
              )}
              <p className="text-3xl font-extrabold text-[#111]">{fmt(product.discountedPrice ?? product.price)}<span className="text-xl ml-1">원</span></p>
            </div>
            <hr className="border-gray-100 my-4" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#333]">수량</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center text-[#555] hover:bg-gray-50 transition-colors text-lg">−</button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-9 h-9 flex items-center justify-center text-[#555] hover:bg-gray-50 transition-colors text-lg">+</button>
              </div>
            </div>
            <div className="bg-[#F7F8FA] rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
              <span className="text-sm text-[#666]">총 금액</span>
              <span className="text-2xl font-extrabold text-primary">{fmt(totalPrice)}원</span>
            </div>
            <hr className="border-gray-100 mb-5" />
            <div className="hidden md:flex gap-3 mb-4">
              <button onClick={() => addItem(product)}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-3.5 rounded-xl hover:bg-primary hover:text-white transition-all duration-200">
                <ShoppingCart className="w-5 h-5" />장바구니 담기
              </button>
              <button onClick={() => addItem(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#FF4500] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors text-lg">
                바로 구매
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
                className="flex items-center gap-1.5 text-sm text-[#666] hover:text-red-500 transition-colors">
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlisted ? '찜 해제' : '찜하기'}
              </button>
              <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
                className="flex items-center gap-1.5 text-sm text-[#666] hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />공유하기
              </button>
              <span className="text-xs text-[#999] ml-auto">재고: {product.stock}개</span>
            </div>
          </div>
        </div>

        {/* 탭 섹션 */}
        <div className="bg-white rounded-2xl overflow-hidden mb-10">
          <div className="flex border-b border-gray-100 sticky top-[62px] bg-white z-10">
            {(['info', 'review', 'qna'] as const).map((tab) => {
              const labels = { info: '상품정보', review: `리뷰 (${product.reviewCount})`, qna: 'Q&A' };
              return (
                <button key={tab} id={`tab-${tab}`} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-[#999] hover:text-[#555]'}`}>
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {activeTab === 'info' && (
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-[#111] mb-4">상품 상세 정보</h2>
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                <p className="text-[#999] text-sm">상품 상세 이미지 영역</p>
              </div>
              <p className="text-sm text-[#555] leading-relaxed mb-6">{product.description}</p>
              <h3 className="text-base font-bold text-[#111] mb-3">상품 사양</h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[['카테고리', product.category], ['평점', `${product.rating}점 (${product.reviewCount}개 리뷰)`], ['재고', `${product.stock}개`], ['배송', '무료배송 / 1~3일 이내 출고'], ['교환/반품', '수령 후 7일 이내 가능']].map(([label, val]) => (
                    <tr key={label} className="border-b border-gray-100">
                      <td className="py-3 pr-4 w-28 text-[#999] font-medium">{label}</td>
                      <td className="py-3 text-[#333]">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="flex flex-col items-center justify-center bg-[#F7F8FA] rounded-2xl p-8 min-w-[160px]">
                  <span className="text-5xl font-extrabold text-[#111] mb-1">{product.rating}</span>
                  <Stars rating={product.rating} size={5} />
                  <span className="text-xs text-[#999] mt-2">총 {product.reviewCount}개</span>
                </div>
                <div className="flex-1 space-y-2">
                  {ratingDist.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-[#666] w-8 text-right">{star}점</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-[#999] w-7">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {DUMMY_REVIEWS.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{r.name[0]}</div>
                        <span className="text-sm font-semibold text-[#333]">{r.name}</span>
                      </div>
                      <span className="text-xs text-[#bbb]">{r.date}</span>
                    </div>
                    <Stars rating={r.rating} size={3} />
                    <p className="text-sm text-[#555] mt-2 leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'qna' && (
            <div className="p-6 md:p-8">
              <div className="flex justify-end mb-5">
                <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">질문 작성</button>
              </div>
              <div className="space-y-2">
                {DUMMY_QNA.map((q) => (
                  <div key={q.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button onClick={() => setOpenQna(openQna === q.id ? null : q.id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        {q.isSecret ? <Lock className="w-4 h-4 text-[#999]" /> : <MessageSquare className="w-4 h-4 text-primary" />}
                        <span className="text-sm text-[#333]">{q.isSecret ? '비밀글입니다.' : q.question}</span>
                        {q.answer && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">답변완료</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-[#bbb]">{q.date}</span>
                        {openQna === q.id ? <ChevronUp className="w-4 h-4 text-[#999]" /> : <ChevronDown className="w-4 h-4 text-[#999]" />}
                      </div>
                    </button>
                    {openQna === q.id && !q.isSecret && q.answer && (
                      <div className="px-4 py-3 bg-[#F7F8FA] border-t border-gray-100">
                        <p className="text-sm text-[#555] flex gap-2"><span className="text-primary font-bold flex-shrink-0">A.</span>{q.answer}</p>
                      </div>
                    )}
                    {openQna === q.id && !q.isSecret && !q.answer && (
                      <div className="px-4 py-3 bg-[#F7F8FA] border-t border-gray-100">
                        <p className="text-sm text-[#999]">아직 답변이 등록되지 않았습니다.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <section>
            <h2 className="text-lg font-extrabold text-[#111] mb-4">함께 보면 좋은 상품</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
              {related.map((p) => <RelatedCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* 모바일 하단 고정 구매 버튼 */}
      <div className="fixed bottom-16 left-0 right-0 md:hidden z-40 px-4 pb-3">
        <div className="flex gap-2 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-3">
          <button onClick={() => addItem(product)}
            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-sm">
            <ShoppingCart className="w-4 h-4" />장바구니
          </button>
          <button onClick={() => addItem(product)}
            className="flex-1 bg-[#FF4500] text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors text-sm">
            바로 구매
          </button>
        </div>
      </div>
    </>
  );
}
