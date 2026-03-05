import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─────────────────────────────────────────────
  // 이미지 최적화 (next/image 사용 시 허용 외부 도메인)
  // ─────────────────────────────────────────────
  images: {
    // 이미지 포맷 우선순위 (WebP → AVIF 순으로 자동 변환)
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      // 개발용 placeholder
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage (운영 도메인으로 교체 필요)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // 카카오 프로필 이미지 (소셜 로그인 사용 시)
      { protocol: "https", hostname: "k.kakaocdn.net" },
    ],
  },

  // ─────────────────────────────────────────────
  // 패키지 최적화 (번들 사이즈 감소)
  // ─────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/ssr"],
  },

  // ─────────────────────────────────────────────
  // 컴파일러 최적화 (프로덕션 console.log 제거)
  // ─────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // 응답 헤더 압축
  compress: true,

  // 파워드바이 헤더 제거 (보안)
  poweredByHeader: false,
};

export default nextConfig;
