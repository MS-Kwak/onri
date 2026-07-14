'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log('[Auth Callback Page] 세션 확인:', {
        userId: session?.user?.id?.slice(0, 8) ?? 'null',
        error: error?.message ?? 'none',
      });

      if (!session) {
        console.log('[Auth Callback Page] 세션 없음 → 로그인 페이지');
        router.replace('/?error=auth');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', session.user.id)
        .single();

      console.log('[Auth Callback Page] 프로필 조회:', {
        nickname: profile?.nickname ?? 'null',
        error: profileError?.message ?? 'none',
      });

      if (
        profile &&
        profile.nickname &&
        !profile.nickname.startsWith('사용자_')
      ) {
        console.log('[Auth Callback Page] 기존 유저 → /home');
        router.replace('/home');
      } else {
        console.log('[Auth Callback Page] 신규 유저 → /auth/verify');
        router.replace('/auth/verify');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <Loader2 size={32} className="animate-spin text-gold" />
      <p className="text-sm text-foreground/60">로그인 처리 중...</p>
    </div>
  );
}
