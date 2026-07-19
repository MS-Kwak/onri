import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
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
      );
      return NextResponse.json(
        { error: '결제 정보를 확인할 수 없습니다' },
        { status: 400 },
      );
    }

    const payment = await paymentResponse.json();

    if (payment.status !== 'PAID') {
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
              // Route Handler에서 쿠키 설정 실패 무시
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

    const { error: rpcError } = await supabase.rpc(
      'purchase_hearts',
      {
        p_amount: pkg.amount,
        p_payment_ref: paymentId,
      },
    );

    if (rpcError) {
      console.error('[Payment] 하트 지급 실패:', rpcError);
      return NextResponse.json(
        { error: '하트 지급에 실패했습니다' },
        { status: 500 },
      );
    }

    const { data: heartData } = await supabase
      .from('hearts')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    console.log(
      '[Payment] 결제 완료:',
      paymentId,
      `+${pkg.amount}하트`,
      `잔액: ${heartData?.balance}`,
    );

    return NextResponse.json({
      success: true,
      amount: pkg.amount,
      balance: heartData?.balance ?? 0,
    });
  } catch (err) {
    console.error('[Payment] 검증 오류:', err);
    return NextResponse.json(
      { error: '결제 검증 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}
