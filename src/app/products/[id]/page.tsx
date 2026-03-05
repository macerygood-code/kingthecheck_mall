// ────────────────────────────────────────────────────────────
// 상품 상세 페이지 동적 메타태그 (서버 컴포넌트 래퍼 방식)
// Next.js에서 'use client' 페이지에는 generateMetadata가 안 됨
// 해결책: 이 파일은 서버 컴포넌트로 메타데이터만 담당하고
//        실제 UI는 기존 'use client' 컴포넌트에게 위임
// ────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import { dummyProducts } from "@/lib/dummy-products";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// ✅ 동적 메타태그 생성 (상품명, 상품이미지, OG 태그)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kingthecheck.vercel.app";

  // TODO: Supabase 연동 시 DB에서 실제 데이터 조회
  const product = dummyProducts.find((p) => p.id === id);

  if (!product) {
    return {
      title: "상품을 찾을 수 없음",
      description: "요청하신 상품이 존재하지 않습니다.",
    };
  }

  const price = product.discountedPrice ?? product.price;
  const discountRate = product.discountedPrice
    ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;

  const description = discountRate > 0
    ? `${discountRate}% 할인! ${price.toLocaleString("ko-KR")}원 — ${product.description}`
    : `${price.toLocaleString("ko-KR")}원 — ${product.description}`;

  const imageUrl = `https://via.placeholder.com/1200x630?text=${encodeURIComponent(product.name.slice(0, 10))}`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | 킹더체크몰`,
      description,
      url: `${siteUrl}/products/${id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [imageUrl],
    },
  };
}

// ✅ 정적 경로 생성 (빌드 시간에 미리 생성할 경로)
export async function generateStaticParams() {
  // TODO: Supabase 연동 시 DB 목록으로 교체
  return dummyProducts.map((p) => ({ id: p.id }));
}

// 서버 컴포넌트 — 메타데이터 처리 후 클라이언트 컴포넌트로 위임
export default function ProductDetailPage({ params }: Props) {
  return <ProductDetailClient params={params} />;
}
