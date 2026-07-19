import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: profileId } = await params;

  const serverClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: p } = await admin
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (!p) {
    return NextResponse.json(
      { error: '프로필 없음' },
      { status: 404 },
    );
  }

  const { data: photos } = await admin
    .from('profile_photos')
    .select('storage_path')
    .eq('user_id', profileId)
    .order('display_order');

  const { data: block } = await admin
    .from('blocks')
    .select('id')
    .eq('blocker_id', user.id)
    .eq('blocked_id', profileId)
    .maybeSingle();

  return NextResponse.json({
    profile: p,
    photos: photos || [],
    isBlocked: !!block,
  });
}
