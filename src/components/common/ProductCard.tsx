'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore, useWishlistStore } from '@/lib/store';
import type { Product } from '@/lib/types';

const fmt = (n: number) => n.toLocaleString('ko-KR');

interface ProductCardProps {
  product: Product;
  highDensity?: boolean;
}

export default function ProductCard({ product, highDensity = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();
  const [hovered, setHovered] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const discountRate = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100)
    : 0;

  return (
    <div
      className={`relative bg-white overflow-hidden transition-all duration-200 group border border-transparent hover:border-gray-200 ${
        highDensity ? 'p-1' : 'rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 찜 버튼 */}
      <button
        onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="찜하기"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-gray-600'}`}
        />
      </button>

      {/* 이미지 */}
      <Link href={`/products/${product.id}`}>
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://via.placeholder.com/400x400?text=${encodeURIComponent(product.name.slice(0, 6))}`}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* 텍스트 */}
      <div className={highDensity ? 'mt-2 px-1 pb-2' : 'p-3'}>
        <Link href={`/products/${product.id}`}>
          <p className={`text-[#111] line-clamp-2 mb-1 leading-snug hover:text-primary transition-colors ${
            highDensity ? 'text-xs h-8' : 'text-sm font-medium'
          }`}>
            {product.name}
          </p>
        </Link>

        {/* 가격 라인 */}
        <div className="flex flex-col">
          {product.discountedPrice && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[#888] line-through">{fmt(product.price)}원</span>
              <span className="text-[11px] text-red-500 font-bold">{discountRate}%</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className={`font-extrabold text-[#111] ${highDensity ? 'text-sm' : 'text-base'}`}>
              {fmt(product.discountedPrice ?? product.price)}원
            </span>
            {/* 쿠팡 스타일 로켓 배지 (임시 아이콘) */}
            {product.price > 10000 && (
              <span className="bg-[#007aff] text-white text-[9px] font-bold px-1 rounded-sm ml-1 flex items-center gap-0.5">
                🚀 로켓
              </span>
            )}
          </div>
        </div>

        {/* 별점 & 리뷰 */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-2.5 h-2.5 ${star <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
              />
            ))}
          </div>
          <span className="text-[10px] text-[#666] ml-0.5">({fmt(product.reviewCount)})</span>
        </div>

        {/* 장바구니 버튼 (Desktop hover 전용) */}
        {!highDensity && (
          <button
            onClick={() => addItem(product)}
            className={`mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 hidden md:flex ${
              hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            장바구니
          </button>
        )}
      </div>
    </div>
  );
}
