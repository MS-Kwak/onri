import { NextResponse } from 'next/server';
import { verifyAdmin, createAdminClient } from '@/lib/admin';

export async function GET() {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: withdrawals } = await admin
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const reasons: Record<string, number> = {};
  (withdrawals || []).forEach((w) => {
    reasons[w.reason] = (reasons[w.reason] || 0) + 1;
  });

  return NextResponse.json({
    withdrawals: withdrawals || [],
    reasonStats: reasons,
    total: (withdrawals || []).length,
  });
}
