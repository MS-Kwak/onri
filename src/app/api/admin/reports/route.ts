import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createAdminClient } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status') || 'all';

  const admin = createAdminClient();

  let query = admin
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: reports } = await query;

  if (!reports || reports.length === 0) {
    return NextResponse.json({ reports: [] });
  }

  const userIds = new Set<string>();
  reports.forEach((r) => {
    userIds.add(r.reporter_id);
    userIds.add(r.target_id);
  });

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, nickname')
    .in('id', Array.from(userIds));

  const nicknameMap: Record<string, string> = {};
  profiles?.forEach((p) => {
    nicknameMap[p.id] = p.nickname;
  });

  const enriched = reports.map((r) => ({
    ...r,
    reporterNickname: nicknameMap[r.reporter_id] || '알 수 없음',
    targetNickname: nicknameMap[r.target_id] || '알 수 없음',
  }));

  return NextResponse.json({ reports: enriched });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { reportId, status } = await request.json();
  const admin = createAdminClient();

  const { error } = await admin
    .from('reports')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
