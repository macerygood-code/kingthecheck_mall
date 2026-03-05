import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ──────────────────────────────────────────────────────────
// 미들웨어: /admin/* 경로에 대한 권한 검사
// ──────────────────────────────────────────────────────────
// ▶ 동작 방식:
//   1. /admin 접근 시 Supabase 쿠키에서 세션 확인
//   2. 미인증 → /login?redirect=/admin 으로 리디렉트
//   3. 인증됐으나 role != 'admin' → / (홈)으로 리디렉트
//
// ▶ Supabase 미설정 시 (개발 환경): 미들웨어를 통과시켜 어드민 페이지에서
//    직접 더미 데이터/모드로 동작하도록 처리
// ──────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 경로에서만 동작
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Supabase 미설정 시 개발용으로 통과
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = !!(supabaseUrl && supabaseKey &&
    supabaseUrl !== 'https://your-project.supabase.co');

  if (!isConfigured) {
    // 개발 환경 – 어드민 페이지 직접 접근 허용
    return NextResponse.next();
  }

  try {
    const { createServerClient } = await import('@supabase/ssr');
    const response = NextResponse.next();

    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // 미인증 → 로그인 페이지
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // users 테이블에서 role 확인
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      // 일반 유저 → 홈으로 리디렉트
      return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
  } catch {
    // 예외 발생 시 홈으로 리디렉트
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
