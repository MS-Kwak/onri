'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    router.push('/auth/verify');
  };

  const handleAppleLogin = () => {
    router.push('/auth/verify');
  };

  const handleEmailLogin = () => {
    router.push('/auth/verify');
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between bg-background px-6 py-12">
      {/* 상단 여백 + 로고 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Image
          src="/onri-gold.svg"
          alt="온리 로고"
          width={80}
          height={120}
          priority
        />
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-foreground/50">
            온전한 나로 쉬어가는 곳
          </p>
          <div className="h-px w-12 bg-foreground/20" />
          <span className="text-lg font-light tracking-widest text-foreground">
            온리
          </span>
        </div>
      </div>

      {/* 로그인 버튼 영역 */}
      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={handleKakaoLogin}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-base font-semibold text-ink transition-colors hover:bg-gold-soft active:bg-gold-soft"
        >
          카카오로 시작하기
        </button>

        <button
          onClick={handleAppleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-base font-semibold text-ink transition-colors hover:bg-cream active:bg-cream"
        >
          Apple로 시작하기
        </button>

        <button
          onClick={handleEmailLogin}
          className="w-full py-3 text-center text-sm text-gray transition-colors hover:text-foreground"
        >
          이메일로 로그인
        </button>
      </div>
    </main>
  );
}
