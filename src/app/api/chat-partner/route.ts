import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const serverClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { partnerIds } = await request.json();
  if (
    !partnerIds ||
    !Array.isArray(partnerIds) ||
    partnerIds.length === 0
  ) {
    return NextResponse.json(
      { error: 'partnerIds 필요' },
      { status: 400 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, nickname, age, verification_status, visibility_age')
    .in('id', partnerIds);

  const { data: photos } = await admin
    .from('profile_photos')
    .select('user_id, storage_path')
    .in('user_id', partnerIds)
    .order('display_order');

  const photoMap = new Map<string, string>();
  photos?.forEach((p) => {
    if (!photoMap.has(p.user_id))
      photoMap.set(p.user_id, p.storage_path);
  });

  const result: Record<
    string,
    {
      id: string;
      nickname: string;
      age: number;
      verification_status: string;
      thumbnailUrl: string | null;
    }
  > = {};

  profiles?.forEach((p) => {
    const ageVisible = p.visibility_age !== 'private';
    result[p.id] = {
      id: p.id,
      nickname: p.nickname,
      age: ageVisible ? p.age || 0 : 0,
      verification_status: p.verification_status || 'none',
      thumbnailUrl: photoMap.get(p.id) || null,
    };
  });

  return NextResponse.json({ partners: result });
}
