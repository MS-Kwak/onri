import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const { identityVerificationId } = await request.json();

  if (!identityVerificationId) {
    return NextResponse.json(
      { error: '인증 ID가 없습니다' },
      { status: 400 },
    );
  }

  const portoneRes = await fetch(
    `https://api.portone.io/identity-verifications/${encodeURIComponent(identityVerificationId)}`,
    {
      headers: {
        Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
      },
    },
  );

  if (!portoneRes.ok) {
    const err = await portoneRes.text();
    console.error('[Identity] PortOne API 에러:', err);
    return NextResponse.json(
      { error: '본인인증 조회에 실패했습니다' },
      { status: 500 },
    );
  }

  const verification = await portoneRes.json();

  if (verification.status !== 'VERIFIED') {
    return NextResponse.json(
      { error: '본인인증이 완료되지 않았습니다' },
      { status: 400 },
    );
  }

  const { name, birthDate, phoneNumber, gender } =
    verification.verifiedCustomer;

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  if (age < 19) {
    return NextResponse.json(
      { error: '만 19세 이상만 가입할 수 있습니다' },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 },
    );
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      name,
      birth_date: birthDate,
      phone: phoneNumber,
      gender: gender === 'MALE' ? 'male' : gender === 'FEMALE' ? 'female' : 'other',
      age,
      identity_verified: true,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('[Identity] 프로필 업데이트 에러:', updateError);
    return NextResponse.json(
      { error: '프로필 저장에 실패했습니다' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    name,
    age,
    gender,
  });
}
