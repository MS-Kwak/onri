import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '유효한 이메일이 필요합니다' },
        { status: 400 },
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error('[check-email] listUsers 오류:', error);
      return NextResponse.json({ exists: false });
    }

    const existingUser = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!existingUser) {
      return NextResponse.json({ exists: false });
    }

    const provider = existingUser.app_metadata?.provider || 'email';

    return NextResponse.json({
      exists: true,
      provider,
    });
  } catch (err) {
    console.error('[check-email] 서버 오류:', err);
    return NextResponse.json({ exists: false });
  }
}
