import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const serverClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('selfie') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: '셀카 파일이 필요합니다' },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: '파일 크기는 10MB 이하여야 합니다' },
      { status: 400 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: existing } = await admin
    .from('selfie_verifications')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: '이미 심사 대기 중인 인증 요청이 있습니다' },
      { status: 409 },
    );
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from('selfie-verifications')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('[SelfieVerify] 업로드 실패:', uploadError);
    return NextResponse.json(
      { error: '셀카 업로드에 실패했습니다' },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('selfie-verifications').getPublicUrl(path);

  const signedUrl =
    publicUrl ||
    admin.storage.from('selfie-verifications').getPublicUrl(path).data
      .publicUrl;

  const { error: insertError } = await admin
    .from('selfie_verifications')
    .insert({
      user_id: user.id,
      photo_path: signedUrl || path,
      status: 'pending',
    });

  if (insertError) {
    console.error('[SelfieVerify] DB 삽입 실패:', insertError);
    return NextResponse.json(
      { error: '인증 요청 등록에 실패했습니다' },
      { status: 500 },
    );
  }

  await admin
    .from('profiles')
    .update({ verification_status: 'pending' })
    .eq('id', user.id);

  return NextResponse.json({ success: true });
}
