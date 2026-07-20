import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createAdminClient } from '@/lib/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUser = await verifyAdmin();
  if (!adminUser) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { id: userId } = await params;
  const admin = createAdminClient();

  const [
    profileRes,
    photosRes,
    heartsRes,
    txRes,
    signalsSentRes,
    signalsReceivedRes,
    reportsRes,
    blocksRes,
    attendanceRes,
  ] = await Promise.all([
    admin.from('profiles').select('*').eq('id', userId).single(),
    admin
      .from('profile_photos')
      .select('id, storage_path, display_order')
      .eq('user_id', userId)
      .order('display_order'),
    admin
      .from('hearts')
      .select('balance')
      .eq('user_id', userId)
      .single(),
    admin
      .from('heart_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30),
    admin
      .from('signals')
      .select('id, to_user_id, status, created_at')
      .eq('from_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('signals')
      .select('id, from_user_id, status, created_at')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('reports')
      .select(
        'id, reporter_id, target_id, reason, detail, context, status, created_at',
      )
      .or(`reporter_id.eq.${userId},target_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('blocks')
      .select('id, blocker_id, blocked_id, created_at')
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`)
      .order('created_at', { ascending: false }),
    admin
      .from('attendance')
      .select('date, streak, hearts_rewarded')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(14),
  ]);

  if (!profileRes.data) {
    return NextResponse.json({ error: '유저 없음' }, { status: 404 });
  }

  const relatedUserIds = new Set<string>();
  signalsSentRes.data?.forEach((s) =>
    relatedUserIds.add(s.to_user_id),
  );
  signalsReceivedRes.data?.forEach((s) =>
    relatedUserIds.add(s.from_user_id),
  );
  reportsRes.data?.forEach((r) => {
    relatedUserIds.add(r.reporter_id);
    relatedUserIds.add(r.target_id);
  });
  blocksRes.data?.forEach((b) => {
    relatedUserIds.add(b.blocker_id);
    relatedUserIds.add(b.blocked_id);
  });
  relatedUserIds.delete(userId);

  const nicknameMap: Record<string, string> = {};
  if (relatedUserIds.size > 0) {
    const { data: nicks } = await admin
      .from('profiles')
      .select('id, nickname')
      .in('id', Array.from(relatedUserIds));
    nicks?.forEach((n) => {
      nicknameMap[n.id] = n.nickname;
    });
  }

  return NextResponse.json({
    profile: profileRes.data,
    photos: photosRes.data || [],
    heartBalance: heartsRes.data?.balance ?? 0,
    transactions: txRes.data || [],
    signalsSent: signalsSentRes.data || [],
    signalsReceived: signalsReceivedRes.data || [],
    reports: reportsRes.data || [],
    blocks: blocksRes.data || [],
    attendance: attendanceRes.data || [],
    nicknameMap,
  });
}
