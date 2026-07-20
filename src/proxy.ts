import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';

const PUBLIC_PATHS = [
  '/',
  '/auth/verify',
  '/auth/callback',
  '/auth/confirm',
  '/api/identity-verify',
  '/api/check-email',
  '/auth/reset-password',
  '/about',
  '/terms',
  '/privacy',
  '/refund',
];

function isValidAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  const hmac = request.cookies.get('admin_hmac')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!token || !hmac || !adminPassword) return false;

  const expectedHmac = crypto
    .createHmac('sha256', adminPassword)
    .update(token)
    .digest('hex');

  return hmac === expectedHmac;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isPublic) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin')
  ) {
    if (
      pathname === '/admin/login' ||
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout'
    ) {
      return NextResponse.next();
    }

    if (!isValidAdminSession(request)) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: '관리자 인증 필요' },
          { status: 403 },
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(
    `[Proxy] ${pathname} | user: ${user?.id?.slice(0, 8) ?? 'none'}`,
  );

  if (!user) {
    console.log(`[Proxy] 비인증 접근 차단 → /`);
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
