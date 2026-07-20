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
  const file = formData.get('file') as File | null;
  const roomId = formData.get('roomId') as string | null;

  if (!file || !roomId) {
    return NextResponse.json(
      { error: 'file과 roomId가 필요합니다' },
      { status: 400 },
    );
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: '10MB 이하의 이미지만 보낼 수 있어요' },
      { status: 400 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some(
      (b) => b.name === 'chat-images',
    );
    if (!bucketExists) {
      const { error: createError } = await admin.storage.createBucket(
        'chat-images',
        { public: true },
      );
      if (createError) {
        console.error(
          '[chat-image] bucket create error:',
          createError,
        );
        return NextResponse.json(
          { error: `버킷 생성 실패: ${createError.message}` },
          { status: 500 },
        );
      }
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `chat/${roomId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from('chat-images')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[chat-image] upload error:', uploadError);
      return NextResponse.json(
        { error: `업로드 실패: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = admin.storage.from('chat-images').getPublicUrl(path);

    const { error: insertError } = await admin
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        text: '',
        image_url: publicUrl,
      });

    if (insertError) {
      console.error('[chat-image] insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, imageUrl: publicUrl });
  } catch (err) {
    console.error('[chat-image] unexpected error:', err);
    return NextResponse.json(
      { error: '이미지 업로드 실패' },
      { status: 500 },
    );
  }
}
