import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, createAdminClient } from '@/lib/admin';
import {
  initializeApp,
  getApps,
  cert,
  type App,
} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let fbApp: App | null = null;

function ensureFirebase() {
  if (fbApp) return fbApp;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) return null;

  try {
    if (getApps().length === 0) {
      fbApp = initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      });
    } else {
      fbApp = getApps()[0];
    }
    return fbApp;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: logs, error } = await admin
    .from('push_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ logs: [] });
  }

  return NextResponse.json({ logs: logs || [] });
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin();
  if (!user) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { title, body, target, userId } = await request.json();

  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json(
      { error: '제목과 내용을 입력하세요' },
      { status: 400 },
    );
  }

  if (target === 'user' && !userId?.trim()) {
    return NextResponse.json(
      { error: '유저 ID를 입력하세요' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  let tokenList: string[] = [];

  if (target === 'all') {
    const { data: tokens } = await admin
      .from('fcm_tokens')
      .select('token');
    tokenList = (tokens || []).map((t) => t.token);
  } else if (target === 'user') {
    const { data: tokens } = await admin
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', userId);
    tokenList = (tokens || []).map((t) => t.token);
  }

  await admin.from('push_logs').insert({
    title,
    body,
    target,
    target_user_id: target === 'user' ? userId : null,
    token_count: tokenList.length,
    status: tokenList.length > 0 ? 'sent' : 'no_tokens',
  });

  if (tokenList.length === 0) {
    return NextResponse.json({
      success: true,
      sent: 0,
      message:
        '대상 FCM 토큰이 없습니다 (아직 앱에서 푸시 등록을 한 유저가 없음)',
    });
  }

  try {
    const app = ensureFirebase();
    if (!app) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message:
          'Firebase Admin이 설정되지 않았습니다. FIREBASE_SERVICE_ACCOUNT 환경변수를 확인하세요.',
      });
    }

    const messaging = getMessaging(app);
    const response = await messaging.sendEachForMulticast({
      tokens: tokenList,
      notification: { title, body },
    });

    return NextResponse.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (err) {
    console.error('[Push] FCM 전송 실패:', err);
    return NextResponse.json({
      success: true,
      sent: 0,
      message:
        'FCM 전송 중 오류가 발생했습니다. Firebase 설정을 확인하세요.',
    });
  }
}
