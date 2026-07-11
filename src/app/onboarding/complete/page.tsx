'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Heart,
  ArrowLeft,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function CompletePage() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <PartyPopper size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              완료
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      {/* 프로그레스 바 (3단계 완료) */}
      <div className="px-6 pt-4 pb-4">
        <div className="flex gap-1.5">
          {['본인인증', '프로필 설정', '완료'].map((label) => (
            <div
              key={label}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div className="h-1 w-full rounded-full bg-gold" />
              <span className="text-[10px] text-gold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/10">
            <CheckCircle size={48} className="text-gold" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            가입이 완료되었어요
          </h1>
          <p className="text-sm leading-relaxed text-foreground/60">
            온리에 오신 걸 환영합니다.
            <br />
            온전한 나로, 결이 맞는 사람을 만나보세요.
          </p>
        </div>

        <Image
          src={isDark ? '/onri-gold.svg' : '/onri-navy.svg'}
          alt="온리 로고"
          width={48}
          height={72}
          className="opacity-40"
        />

        <div className="flex items-center gap-2 rounded-xl bg-surface px-5 py-3">
          <Heart size={16} className="fill-gold text-gold" />
          <span className="text-sm text-foreground/80">
            가입 축하 하트{' '}
            <span className="font-semibold text-gold">10개</span>가
            지급되었어요
          </span>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-8 pt-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => router.push('/home')}
        >
          시작하기
        </Button>
      </div>
    </main>
  );
}
