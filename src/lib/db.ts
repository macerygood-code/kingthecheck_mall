import { supabase } from './supabase';
import type { Product, Category } from './types';

// ──────────────────────────────────────────────────────────
// Supabase Row → 앱 Product 타입 변환
// ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(row: any): Product {
  return {
    id:            row.id,
    name:          row.name,
    description:   row.description ?? '',
    price:         row.original_price ?? row.price,
    discountedPrice: row.original_price ? row.price : undefined,
    category:      row.categories?.name ?? '기타',
    imageUrl:      row.thumbnail_url ?? `https://via.placeholder.com/400x400?text=${encodeURIComponent(row.name?.slice(0, 4) ?? '')}`,
    rating:        Number(row.rating_avg) || 0,
    reviewCount:   row.review_count ?? 0,
    stock:         row.stock ?? 0,
    isBest:        row.is_featured ?? false,
    isNew:         row.is_new ?? false,
    tags:          [],
    createdAt:     row.created_at ?? new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────────────────
// 상품 목록 패치 (필터/정렬 포함)
// ──────────────────────────────────────────────────────────
export async function fetchProducts(options?: {
  categorySlug?: string;
  sort?: string;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
  isNew?: boolean;
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true);

  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (options?.isFeatured) query = query.eq('is_featured', true);
  if (options?.isNew)       query = query.eq('is_new', true);
  if (options?.search)      query = query.ilike('name', `%${options.search}%`);

  switch (options?.sort) {
    case 'price_asc':  query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'review':     query = query.order('review_count', { ascending: false }); break;
    case 'latest':     query = query.order('created_at', { ascending: false }); break;
    default:           query = query.order('rating_avg', { ascending: false }); break;
  }

  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error('[fetchProducts]', error.message);
    return [];
  }
  return (data ?? []).map(rowToProduct);
}

// ──────────────────────────────────────────────────────────
// 단일 상품 패치
// ──────────────────────────────────────────────────────────
export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToProduct(data);
}

// ──────────────────────────────────────────────────────────
// 카테고리 목록
// ──────────────────────────────────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('sort_order');

  if (error) {
    console.error('[fetchCategories]', error.message);
    return [];
  }
  return (data ?? []).map((row) => row.name as Category);
}

// ──────────────────────────────────────────────────────────
// 베스트셀러
// ──────────────────────────────────────────────────────────
export async function fetchBestSellers(limit = 8): Promise<Product[]> {
  return fetchProducts({ sort: 'review', limit, isFeatured: true });
}

// ──────────────────────────────────────────────────────────
// 오늘의 특가 (할인율 높은 순)
// ──────────────────────────────────────────────────────────
export async function fetchDailyDeals(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_active', true)
    .gt('discount_rate', 0)
    .order('discount_rate', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[fetchDailyDeals]', error.message);
    return [];
  }
  return (data ?? []).map(rowToProduct);
}

// ──────────────────────────────────────────────────────────
// 신상품
// ──────────────────────────────────────────────────────────
export async function fetchNewArrivals(limit = 8): Promise<Product[]> {
  return fetchProducts({ isNew: true, sort: 'latest', limit });
}

// ──────────────────────────────────────────────────────────
// 배너
// ──────────────────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  position: string;
  sort_order: number;
}

export async function fetchBanners(position = 'hero'): Promise<Banner[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('position', position)
    .eq('is_active', true)
    .or(`start_at.is.null,start_at.lte.${now}`)
    .or(`end_at.is.null,end_at.gte.${now}`)
    .order('sort_order');

  if (error) {
    console.error('[fetchBanners]', error.message);
    return [];
  }
  return data ?? [];
}

// ──────────────────────────────────────────────────────────
// Supabase 연결 가능 여부 확인
// ──────────────────────────────────────────────────────────
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co'
  );
}
