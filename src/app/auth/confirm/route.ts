import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  console.log('[Auth Callback] 콜백 수신, code 존재:', !!code);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Server Component에서 쿠키 설정이 실패할 수 있음
            }
          },
        },
      },
    );

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth Callback] 세션 교환 실패:', error.message);
      return NextResponse.redirect(`${origin}/?error=auth`);
    }

    console.log('[Auth Callback] 세션 교환 성공');

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log('[Auth Callback] 유저 조회:', user?.id ?? 'null');

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();

      console.log('[Auth Callback] 프로필 조회:', {
        nickname: profile?.nickname ?? 'null',
        error: profileError?.message ?? 'none',
      });

      if (
        profile &&
        profile.nickname &&
        !profile.nickname.startsWith('사용자_')
      ) {
        console.log('[Auth Callback] 기존 유저 → /home');
        return NextResponse.redirect(`${origin}/home`);
      }
    }

    console.log('[Auth Callback] 신규 유저 → /auth/verify');
    return NextResponse.redirect(`${origin}/auth/verify`);
  }

  console.error(
    '[Auth Callback] code 없음 → 로그인 페이지로 리다이렉트',
  );
  return NextResponse.redirect(`${origin}/?error=auth`);
}
