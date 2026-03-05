import { MetadataRoute } from "next";

// ──────────────────────────────────────────────
// robots.txt 자동 생성 (Next.js 13.3+ 방식)
// 배포 후: https://도메인/robots.txt 로 확인
// ──────────────────────────────────────────────
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kingthecheck.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",      // 관리자 페이지 크롤링 차단
          "/api/",        // API 라우트 차단
          "/checkout/",   // 결제 페이지 차단
          "/mypage/",     // 마이페이지 차단
          "/_next/",      // Next.js 내부 파일 차단
        ],
      },
      {
        // Googlebot에는 더 넓은 권한
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/mypage/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
