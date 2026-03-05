import { createBrowserClient } from '@supabase/ssr';

// ──────────────────────────────────────────────────────────
// Supabase 클라이언트 (브라우저 / 클라이언트 컴포넌트 전용)
// 사용법: const supabase = createClient()
// ──────────────────────────────────────────────────────────
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 편의용 싱글턴 (컴포넌트 외부에서 사용할 때)
export const supabase = createClient();

// 타입 편의 re-export
export type { SupabaseClient } from '@supabase/supabase-js';
