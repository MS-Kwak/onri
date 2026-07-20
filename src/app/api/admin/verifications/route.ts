import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createAdminClient } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') || 'pending';

  const admin = createAdminClient();

  const { data: verifications } = await admin
    .from('selfie_verifications')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (!verifications || verifications.length === 0) {
    return NextResponse.json({ verifications: [] });
  }

  const userIds = verifications.map((v) => v.user_id);

  const [profilesRes, photosRes] = await Promise.all([
    admin
      .from('profiles')
      .select('id, nickname, age, identity, identity_other')
      .in('id', userIds),
    admin
      .from('profile_photos')
      .select('user_id, storage_path')
      .in('user_id', userIds)
      .order('display_order'),
  ]);

  const profiles = profilesRes.data || [];
  const profileMap: Record<string, (typeof profiles)[number]> = {};
  profiles.forEach((p) => {
    profileMap[p.id] = p;
  });

  const photoMap: Record<string, string> = {};
  photosRes.data?.forEach((p) => {
    if (!photoMap[p.user_id]) photoMap[p.user_id] = p.storage_path;
  });

  const enriched = verifications.map((v) => ({
    ...v,
    profile: profileMap[v.user_id] || null,
    profilePhoto: photoMap[v.user_id] || null,
  }));

  return NextResponse.json({ verifications: enriched });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { action, userId, reason } = await request.json();
  const admin = createAdminClient();

  if (action === 'approve') {
    const { error } = await admin.rpc('admin_approve_selfie', {
      p_user_id: userId,
    });
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }
  } else if (action === 'reject') {
    const { error } = await admin.rpc('admin_reject_selfie', {
      p_user_id: userId,
      p_reason: reason || '',
    });
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
