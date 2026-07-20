import { NextResponse } from 'next/server';
import { verifyAdmin, createAdminClient } from '@/lib/admin';

export async function GET() {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const admin = createAdminClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsersRes,
    todayUsersRes,
    pendingVerificationsRes,
    pendingReportsRes,
    recentVerificationsRes,
    recentReportsRes,
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    admin
      .from('selfie_verifications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    admin
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    admin
      .from('selfie_verifications')
      .select('id, user_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('reports')
      .select(
        'id, reporter_id, target_id, reason, status, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const recentVerifications = recentVerificationsRes.data || [];
  const recentReports = recentReportsRes.data || [];

  const userIds = new Set<string>();
  recentVerifications.forEach((v) => userIds.add(v.user_id));
  recentReports.forEach((r) => {
    userIds.add(r.reporter_id);
    userIds.add(r.target_id);
  });

  const { data: nicknames } = await admin
    .from('profiles')
    .select('id, nickname')
    .in('id', Array.from(userIds));

  const nicknameMap: Record<string, string> = {};
  nicknames?.forEach((n) => {
    nicknameMap[n.id] = n.nickname;
  });

  return NextResponse.json({
    totalUsers: totalUsersRes.count || 0,
    todayUsers: todayUsersRes.count || 0,
    pendingVerifications: pendingVerificationsRes.count || 0,
    pendingReports: pendingReportsRes.count || 0,
    recentVerifications: recentVerifications.map((v) => ({
      ...v,
      nickname: nicknameMap[v.user_id] || '알 수 없음',
    })),
    recentReports: recentReports.map((r) => ({
      ...r,
      reporterNickname: nicknameMap[r.reporter_id] || '알 수 없음',
      targetNickname: nicknameMap[r.target_id] || '알 수 없음',
    })),
  });
}
