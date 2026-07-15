'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as PortOne from '@portone/browser-sdk/v2';
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type VerifyState = 'idle' | 'verifying' | 'processing' | 'success' | 'error';

export default function VerifyPage() {
  const router = useRouter();
  const [state, setState] = useState<VerifyState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedInfo, setVerifiedInfo] = useState<{
    name: string;
    age: number;
  } | null>(null);

  const handleVerify = async () => {
    setState('verifying');
    setErrorMsg('');

    try {
      const identityVerificationId = `identity-${crypto.randomUUID()}`;

      const response = await PortOne.requestIdentityVerification({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        identityVerificationId,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
      });

      if (!response || response.code != null) {
        if (response?.code === 'USER_CANCELLED') {
          setState('idle');
          return;
        }
        throw new Error(response?.message || '본인인증에 실패했습니다');
      }

      setState('processing');

      const verifyRes = await fetch('/api/identity-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityVerificationId }),
      });

      const result = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(result.error || '인증 검증에 실패했습니다');
      }

      setVerifiedInfo({ name: result.name, age: result.age });
      setState('success');
      toast.success('본인인증이 완료되었어요!');

      setTimeout(() => {
        router.push('/onboarding/profile');
      }, 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '본인인증에 실패했습니다';
      setErrorMsg(message);
      setState('error');
      toast.error(message);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      {/* 고정 헤더 */}
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <ShieldCheck size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">본인인증</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      {/* 프로그레스 바 */}
      <div className="px-6 pt-4 pb-4">
        <div className="flex gap-1.5">
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="h-1 w-full rounded-full bg-gold" />
            <span className="text-[10px] text-gold">본인인증</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="h-1 w-full rounded-full bg-surface" />
            <span className="text-[10px] text-foreground-soft">
              프로필 설정
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <div className="h-1 w-full rounded-full bg-surface" />
            <span className="text-[10px] text-foreground-soft">완료</span>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {state === 'idle' && (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
                <ShieldCheck size={36} className="text-gold" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                본인인증이 필요해요
              </h2>
              <p className="text-sm leading-relaxed text-foreground-soft">
                온리는 안전한 커뮤니티를 위해
                <br />
                만 19세 이상만 가입할 수 있어요.
                <br />
                휴대폰 본인인증으로 간편하게 확인합니다.
              </p>
            </div>
            <div className="w-full rounded-xl bg-surface p-4">
              <ul className="space-y-2 text-xs text-foreground-soft">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-gold/60"
                  />
                  본인 명의 휴대폰이 필요합니다
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-gold/60"
                  />
                  인증 정보는 나이 확인 용도로만 사용됩니다
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-gold/60"
                  />
                  이름과 전화번호는 다른 사용자에게 공개되지 않습니다
                </li>
              </ul>
            </div>
          </>
        )}

        {state === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-gold" />
            <p className="text-sm text-foreground-soft">
              본인인증 창이 열렸어요
            </p>
          </div>
        )}

        {state === 'processing' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-gold" />
            <p className="text-sm text-foreground-soft">
              인증 결과를 확인하고 있어요...
            </p>
          </div>
        )}

        {state === 'success' && verifiedInfo && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 size={36} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              인증 완료!
            </h2>
            <p className="text-sm text-foreground-soft">
              {verifiedInfo.name}님, 환영합니다 (만 {verifiedInfo.age}세)
            </p>
            <p className="text-xs text-foreground-soft">
              프로필 설정으로 이동합니다...
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              인증에 실패했어요
            </h2>
            <p className="text-sm text-foreground-soft">{errorMsg}</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-6 pb-8 pt-4">
        {(state === 'idle' || state === 'error') && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleVerify}
          >
            {state === 'error' ? '다시 인증하기' : '본인인증 시작하기'}
          </Button>
        )}
      </div>
    </main>
  );
}
