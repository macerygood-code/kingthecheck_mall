import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { AuthProvider } from "@/lib/auth-context";

// ──────────────────────────────────────────────
// 폰트: Google Fonts Inter (next/font으로 최적화)
// → 자동으로 폰트 파일을 프리로드 + 레이아웃 시프트 방지
// ──────────────────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// ──────────────────────────────────────────────
// 전역 메타데이터 (각 페이지에서 override 가능)
// ──────────────────────────────────────────────
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kingthecheck.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "킹더체크몰 | 더 저렴하게, 더 믿음직하게",
    template: "%s | 킹더체크몰",
  },
  description:
    "킹더체크몰 자사몰 — 전자기기, 패션, 생활용품 등 모든 상품을 합리적인 가격으로. 무료배송 이벤트 진행 중!",
  keywords: ["쇼핑몰", "이커머스", "킹더체크몰", "저렴한 쇼핑", "무료배송"],
  authors: [{ name: "킹더체크몰" }],
  creator: "킹더체크몰",
  publisher: "킹더체크몰",

  // ── OpenGraph ──
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "킹더체크몰",
    title: "킹더체크몰 | 더 저렴하게, 더 믿음직하게",
    description: "모든 상품을 한 곳에서, 합리적인 가격으로",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "킹더체크몰 쇼핑몰",
      },
    ],
  },

  // ── Twitter Card ──
  twitter: {
    card: "summary_large_image",
    title: "킹더체크몰 | 더 저렴하게, 더 믿음직하게",
    description: "모든 상품을 한 곳에서, 합리적인 가격으로",
    images: ["/og-image.png"],
  },

  // ── robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Verification (구글 서치콘솔 연동 시 입력) ──
  // verification: {
  //   google: "your-google-site-verification-code",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className={`antialiased bg-[#F7F8FA] text-[#111111] ${inter.className}`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
