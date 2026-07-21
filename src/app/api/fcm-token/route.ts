import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { token, platform } = await request.json();

  if (!token) {
    return NextResponse.json(
      { error: 'FCM 토큰이 필요합니다' },
      { status: 400 },
    );
  }

  const serverClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: '인증이 필요합니다' },
      { status: 401 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await admin.from('fcm_tokens').upsert(
    {
      user_id: user.id,
      token,
      platform: platform || 'unknown',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token' },
  );

  if (error) {
    console.error('[FCM Token] 저장 실패:', error);
    return NextResponse.json(
      { error: '토큰 저장에 실패했습니다' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { token } = await request.json();

  const serverClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: '인증이 필요합니다' },
      { status: 401 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await admin
    .from('fcm_tokens')
    .delete()
    .eq('user_id', user.id)
    .eq('token', token);

  return NextResponse.json({ success: true });
}
