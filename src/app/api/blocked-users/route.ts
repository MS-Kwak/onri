import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
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

  const { data: blocks } = await admin
    .from('blocks')
    .select('id, blocked_id, created_at')
    .eq('blocker_id', user.id)
    .order('created_at', { ascending: false });

  if (!blocks || blocks.length === 0) {
    return NextResponse.json({ users: [] });
  }

  const blockedIds = blocks.map((b) => b.blocked_id);

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, nickname')
    .in('id', blockedIds);

  const { data: photos } = await admin
    .from('profile_photos')
    .select('user_id, storage_path')
    .in('user_id', blockedIds)
    .order('display_order');

  const profileMap = new Map<string, string>();
  profiles?.forEach((p) => profileMap.set(p.id, p.nickname));

  const photoMap = new Map<string, string>();
  photos?.forEach((p) => {
    if (!photoMap.has(p.user_id))
      photoMap.set(p.user_id, p.storage_path);
  });

  const users = blocks.map((b) => ({
    blockId: b.id,
    id: b.blocked_id,
    nickname: profileMap.get(b.blocked_id) || '탈퇴한 유저',
    thumbnailUrl: photoMap.get(b.blocked_id) || '',
    blockedAt: new Date(b.created_at).toISOString().slice(0, 10),
  }));

  return NextResponse.json({ users });
}
