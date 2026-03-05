import { MetadataRoute } from "next";

// ──────────────────────────────────────────────
// sitemap.xml 자동 생성 (Next.js 13.3+ 방식)
// Supabase 연동 시 아래 TODO 부분을 실제 DB 데이터로 교체
// ──────────────────────────────────────────────

const CATEGORIES = [
  "전자기기", "패션/의류", "생활/주방", "건강/뷰티",
  "스포츠/레저", "식품", "유아/완구", "반려동물", "기타",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://kingthecheck.vercel.app";
  const now = new Date();

  // ── 정적 페이지 ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // ── 카테고리 페이지 ──
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${siteUrl}/products?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // ── 상품 페이지 (Supabase 연동 시 활성화) ──
  // TODO: Supabase에서 활성화된 상품 목록 가져오기
  // const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // const configured = supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co';
  // let productPages: MetadataRoute.Sitemap = [];
  // if (configured) {
  //   const { createBrowserClient } = await import('@supabase/ssr');
  //   const supabase = createBrowserClient(supabaseUrl!, supabaseKey!);
  //   const { data: products } = await supabase
  //     .from('products')
  //     .select('id, updated_at')
  //     .eq('is_active', true);
  //   productPages = (products ?? []).map((p) => ({
  //     url: `${siteUrl}/products/${p.id}`,
  //     lastModified: new Date(p.updated_at),
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.7,
  //   }));
  // }

  return [
    ...staticPages,
    ...categoryPages,
    // ...productPages,
  ];
}
