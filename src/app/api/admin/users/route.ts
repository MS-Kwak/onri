import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createAdminClient } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const admin = createAdminClient();

  let query = admin
    .from('profiles')
    .select(
      'id, nickname, age, identity, identity_other, region, verification_status, role, is_active, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike('nickname', `%${search}%`);
  }

  const { data: users, count } = await query;

  const userIds = (users || []).map((u) => u.id);

  const [photosRes, heartsRes] = await Promise.all([
    admin
      .from('profile_photos')
      .select('user_id, storage_path')
      .in('user_id', userIds)
      .order('display_order'),
    admin
      .from('hearts')
      .select('user_id, balance')
      .in('user_id', userIds),
  ]);

  const photoMap: Record<string, string> = {};
  photosRes.data?.forEach((p) => {
    if (!photoMap[p.user_id]) photoMap[p.user_id] = p.storage_path;
  });

  const heartMap: Record<string, number> = {};
  heartsRes.data?.forEach((h) => {
    heartMap[h.user_id] = h.balance;
  });

  const enriched = (users || []).map((u) => ({
    ...u,
    thumbnailUrl: photoMap[u.id] || null,
    heartBalance: heartMap[u.id] ?? 0,
  }));

  return NextResponse.json({
    users: enriched,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function PATCH(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const body = await request.json();
  const admin = createAdminClient();

  if ('is_active' in body) {
    const { error } = await admin
      .from('profiles')
      .update({ is_active: body.is_active })
      .eq('id', body.userId);
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true });
  }

  if ('adjustHearts' in body) {
    const { userId, adjustHearts, reason } = body;
    const amount = parseInt(adjustHearts);
    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { error: '올바른 수량을 입력하세요' },
        { status: 400 },
      );
    }

    const { data: current } = await admin
      .from('hearts')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const newBalance = Math.max(0, (current?.balance || 0) + amount);

    const { error: updateErr } = await admin
      .from('hearts')
      .update({ balance: newBalance })
      .eq('user_id', userId);

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message },
        { status: 500 },
      );
    }

    await admin.from('heart_transactions').insert({
      user_id: userId,
      amount,
      type: amount > 0 ? 'admin_grant' : 'admin_deduct',
      description: reason || `관리자 ${amount > 0 ? '지급' : '차감'}`,
    });

    return NextResponse.json({ success: true, newBalance });
  }

  return NextResponse.json(
    { error: '알 수 없는 요청' },
    { status: 400 },
  );
}
