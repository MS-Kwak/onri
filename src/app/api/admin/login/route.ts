import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  const { id, password } = await request.json();

  const adminId = process.env.ADMIN_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminId || !adminPassword) {
    return NextResponse.json(
      { error: '관리자 계정이 설정되지 않았습니다' },
      { status: 500 },
    );
  }

  if (id !== adminId || password !== adminPassword) {
    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 일치하지 않습니다' },
      { status: 401 },
    );
  }

  const token = generateToken();
  const cookieStore = await cookies();

  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8시간
  });

  // 토큰을 환경변수 기반으로 검증하기 위해 HMAC 생성
  const hmac = crypto
    .createHmac('sha256', adminPassword)
    .update(token)
    .digest('hex');

  cookieStore.set('admin_hmac', hmac, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ success: true });
}
