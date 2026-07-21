import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { PRICE_TO_PACKAGE } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId가 필요합니다' },
        { status: 400 },
      );
    }

    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
        },
        cache: 'no-store',
      },
    );

    if (!paymentResponse.ok) {
      console.error(
        '[Payment] 포트원 결제 조회 실패:',
        paymentResponse.status,
        await paymentResponse.text(),
      );
      return NextResponse.json(
        { error: '결제 정보를 확인할 수 없습니다' },
        { status: 400 },
      );
    }

    const payment = await paymentResponse.json();

    if (payment.status !== 'PAID') {
      console.error('[Payment] 결제 상태:', payment.status);
      return NextResponse.json(
        { error: '결제가 완료되지 않았습니다' },
        { status: 400 },
      );
    }

    const paidAmount = payment.amount?.total;
    const pkg = PRICE_TO_PACKAGE[paidAmount];

    if (!pkg) {
      console.error(
        '[Payment] 금액 불일치:',
        paidAmount,
        '원 — 매칭되는 패키지 없음',
      );
      return NextResponse.json(
        { error: '결제 금액이 올바르지 않습니다' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // ignore
            }
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const { data: existingTx } = await admin
      .from('heart_transactions')
      .select('id')
      .eq('reference_id', paymentId)
      .maybeSingle();

    if (existingTx) {
      console.log('[Payment] 이미 처리된 결제:', paymentId);
      const { data: heartData } = await admin
        .from('hearts')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      return NextResponse.json({
        success: true,
        amount: pkg.amount,
        balance: heartData?.balance ?? 0,
      });
    }

    console.log(
      '[Payment] 지급 시작:',
      paymentId,
      `유저: ${user.id.slice(0, 8)}`,
      `지급량: ${pkg.amount}`,
    );

    const { data: currentHeart } = await admin
      .from('hearts')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const currentBalance = currentHeart?.balance ?? 0;
    const newBalance = currentBalance + pkg.amount;

    const { error: updateError } = await admin.from('hearts').upsert(
      {
        user_id: user.id,
        balance: newBalance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    if (updateError) {
      console.error(
        '[Payment] 하트 잔액 업데이트 실패:',
        updateError,
      );
      return NextResponse.json(
        { error: '하트 지급에 실패했습니다' },
        { status: 500 },
      );
    }

    const { error: txError } = await admin
      .from('heart_transactions')
      .insert({
        user_id: user.id,
        amount: pkg.amount,
        type: 'purchase',
        description: `하트 충전 (${pkg.amount}개)`,
        reference_id: paymentId,
      });

    if (txError) {
      console.error('[Payment] 거래 내역 기록 실패:', txError);
    }

    const { data: heartData } = await admin
      .from('hearts')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const finalBalance = heartData?.balance ?? newBalance;

    console.log(
      '[Payment] 결제 완료:',
      paymentId,
      `+${pkg.amount}하트`,
      `${currentBalance} → ${finalBalance}`,
    );

    return NextResponse.json({
      success: true,
      amount: pkg.amount,
      balance: finalBalance,
    });
  } catch (err) {
    console.error('[Payment] 검증 오류:', err);
    return NextResponse.json(
      { error: '결제 검증 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}
