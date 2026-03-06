'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import type { Product } from '@/lib/types';

interface CategorySectionProps {
    title: string;
    themeColor: string; // Tailwind class, e.g., 'text-blue-600', 'bg-blue-600'
    bannerUrl?: string;
    heroText?: string;
    heroSubText?: string;
    keywords: string[];
    products: Product[];
}

export default function CategorySection({
    title,
    themeColor,
    bannerUrl,
    heroText,
    heroSubText,
    keywords,
    products,
}: CategorySectionProps) {
    // 제품을 3x2 그리드로 표시하기 위해 상위 6개만 사용
    const displayProducts = products.slice(0, 6);

    return (
        <section className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row bg-white border-t-2 border-gray-200" style={{ borderTopColor: themeColor }}>

                {/* 왼쪽 섹션: 카테고리 정보 & 키워드 (데스크탑 기준 1/4 정도) */}
                <div className="w-full md:w-64 flex-shrink-0 p-6 border-r border-gray-100 flex flex-col">
                    <div className="mb-8">
                        <h2 className={`text-2xl font-bold mb-1`} style={{ color: themeColor }}>
                            {title}
                        </h2>
                        <Link href={`/products?category=${encodeURIComponent(title)}`} className="text-xs text-gray-400 flex items-center hover:underline">
                            바로가기 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-gray-900 mb-3">HOT키워드</h3>
                        <div className="flex flex-wrap gap-1.5">
                            {keywords.map((kw) => (
                                <Link
                                    key={kw}
                                    href={`/products?search=${encodeURIComponent(kw)}`}
                                    className="px-2 py-1.5 border border-gray-200 text-[11px] text-blue-500 hover:bg-gray-50 transition-colors"
                                >
                                    #{kw}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 중앙 섹션: 메인 히어로 배너 (데스크탑 기준) */}
                <div className="relative w-full md:w-80 flex-shrink-0 bg-gray-50 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={bannerUrl || `https://via.placeholder.com/400x600?text=${encodeURIComponent(title)}`}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                        <h4 className="text-lg font-bold leading-tight mb-1">{heroText || '나를 위한 선택'}</h4>
                        <p className="text-xs opacity-90 mb-4">{heroSubText || '지금 바로 확인해보세요'}</p>
                        <Link
                            href={`/products?category=${encodeURIComponent(title)}`}
                            className="inline-block px-4 py-2 text-xs font-bold border border-white hover:bg-white hover:text-black transition-all"
                        >
                            지금 구매하기
                        </Link>
                    </div>
                </div>

                {/* 오른쪽 섹션: 상품 그리드 (3x2) */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-3">
                    {displayProducts.map((product) => (
                        <div key={product.id} className="border-r border-b border-gray-100 last:border-r-0">
                            <ProductCard product={product} highDensity={true} />
                        </div>
                    ))}
                    {/* 상품이 부족할 경우 빈 칸 채우기 (데스트용) */}
                    {displayProducts.length < 6 && Array.from({ length: 6 - displayProducts.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-r border-b border-gray-100 last:border-r-0 bg-gray-50/30" />
                    ))}
                </div>
            </div>
        </section>
    );
}
