'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Mail,
  ArrowRight,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';

type EmailStep = 'email' | 'code' | 'password-set' | 'login';

export default function OnboardingPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<EmailStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [lastLogin] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onri_last_login');
    }
    return null;
  });

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single();

        if (profile && !profile.nickname.startsWith('사용자_')) {
          router.replace('/home');
          return;
        }
      }
      setSessionChecked(true);
    };

    checkSession();
  }, [router]);

  const handleKakaoLogin = async () => {
    console.log('[Auth] 카카오 로그인 시도');
    setLoading('kakao');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (error) {
      console.error('[Auth] 카카오 로그인 실패:', error.message);
      setLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    console.log('[Auth] Apple 로그인 시도');
    setLoading('apple');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (error) {
      console.error('[Auth] Apple 로그인 실패:', error.message);
      setLoading(null);
    }
  };

  const handleEmailCheck = async () => {
    if (!email || !email.includes('@')) return;

    setLoading('email');
    setEmailError('');

    try {
      const checkRes = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        if (checkData.provider !== 'email') {
          const methodLabel =
            checkData.provider === 'kakao'
              ? '카카오'
              : checkData.provider === 'apple'
                ? 'Apple'
                : checkData.provider;
          setEmailError(
            `이 이메일은 ${methodLabel}로 가입되어 있어요. ${methodLabel}로 로그인해주세요.`,
          );
          setLoading(null);
          return;
        }
        setEmailStep('login');
        setLoading(null);
        return;
      }
    } catch (err) {
      console.error('[Auth] 이메일 중복 체크 실패:', err);
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      if (
        error.message?.includes('security purposes') ||
        error.status === 429
      ) {
        setEmailError(
          '인증 코드가 이미 발송되었어요. 잠시 후 다시 시도해주세요.',
        );
      } else if (error.status === 500) {
        setEmailError(
          '이메일 전송에 일시적인 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
        );
      } else {
        setEmailError(
          '인증코드 전송에 실패했어요. 이메일 주소를 확인해주세요.',
        );
      }
    } else {
      setEmailError('');
      setEmailStep('code');
    }
    setLoading(null);
  };

  const handleVerifyCode = async () => {
    if (otpCode.length < 8) return;

    setLoading('verify');
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    });

    if (error) {
      const { toast } = await import('sonner');
      toast.error(
        error.message?.includes('expired')
          ? '인증 코드가 만료되었어요. 다시 받아주세요.'
          : '인증 코드가 올바르지 않아요',
      );
      setLoading(null);
      return;
    }

    setLoading(null);
    setEmailStep('password-set');
  };

  const handleSetPassword = async () => {
    if (password.length < 8) {
      setEmailError('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (password !== passwordConfirm) {
      setEmailError('비밀번호가 일치하지 않아요.');
      return;
    }

    setLoading('password');
    setEmailError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setEmailError('비밀번호 설정에 실패했어요. 다시 시도해주세요.');
      setLoading(null);
      return;
    }

    localStorage.setItem('onri_last_login', 'email');
    setLoading(null);
    setEmailOpen(false);
    router.push('/auth/verify');
  };

  const handlePasswordLogin = async () => {
    if (!password) return;

    setLoading('password');
    setEmailError('');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        setEmailError('비밀번호가 올바르지 않아요.');
      } else {
        setEmailError('로그인에 실패했어요. 다시 시도해주세요.');
      }
      setLoading(null);
      return;
    }

    localStorage.setItem('onri_last_login', 'email');

    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', userId)
        .single();

      if (profile && !profile.nickname.startsWith('사용자_')) {
        router.push('/home');
      } else {
        router.push('/auth/verify');
      }
    } else {
      router.push('/auth/verify');
    }

    setLoading(null);
    setEmailOpen(false);
  };

  const handleForgotPassword = async () => {
    setLoading('reset');
    setEmailError('');
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      },
    );

    if (error) {
      setEmailError('비밀번호 재설정 이메일 발송에 실패했어요.');
    } else {
      const { toast } = await import('sonner');
      toast.success('비밀번호 재설정 이메일을 보냈어요', {
        description: '이메일을 확인해주세요.',
      });
      setEmailOpen(false);
    }
    setLoading(null);
  };

  if (!sessionChecked) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-gold" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-between bg-background px-6 py-12">
      <div className="absolute top-12 right-5 z-40">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Image
          src={isDark ? '/onri-gold.svg' : '/onri-navy.svg'}
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

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={handleKakaoLogin}
          disabled={loading !== null}
          className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-base font-semibold text-ink transition-colors hover:bg-gold-soft active:bg-gold-soft disabled:opacity-60"
        >
          {loading === 'kakao' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : null}
          카카오로 시작하기
          {lastLogin === 'kakao' && (
            <span className="absolute right-3 rounded-full bg-ink/15 px-2 py-0.5 text-[10px] font-medium text-ink/70">
              최근 로그인
            </span>
          )}
        </button>

        <button
          onClick={handleAppleLogin}
          disabled={loading !== null}
          className="relative flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-surface-secondary active:bg-surface-secondary disabled:opacity-60"
        >
          {loading === 'apple' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : null}
          Apple로 시작하기
          {lastLogin === 'apple' && (
            <span className="absolute right-3 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground/50">
              최근 로그인
            </span>
          )}
        </button>

        <button
          onClick={() => setEmailOpen(true)}
          disabled={loading !== null}
          className="relative w-full py-3 text-center text-sm text-gray transition-colors hover:text-foreground disabled:opacity-60"
        >
          이메일로 로그인
          {lastLogin === 'email' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground/50">
              최근 로그인
            </span>
          )}
        </button>
      </div>

      {/* 이메일 OTP 다이얼로그 */}
      <Dialog.Root
        open={emailOpen}
        onOpenChange={(open) => {
          setEmailOpen(open);
          if (!open) {
            setEmail('');
            setOtpCode('');
            setPassword('');
            setPasswordConfirm('');
            setShowPassword(false);
            setEmailStep('email');
            setEmailError('');
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-48px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            {emailStep === 'email' && (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                    <Mail size={22} className="text-gold" />
                  </div>
                  <Dialog.Title className="text-lg font-bold text-foreground">
                    이메일로 시작하기
                  </Dialog.Title>
                  <Dialog.Description className="text-center text-sm text-foreground/60">
                    이메일 주소를 입력해주세요
                  </Dialog.Description>
                </div>

                <div className="mt-5">
                  <input
                    type="email"
                    placeholder="이메일 주소"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEmailCheck();
                    }}
                    autoFocus
                    className="w-full rounded-xl border border-foreground/15 bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground-dim focus:border-gold/50"
                  />
                </div>

                {emailError && (
                  <p className="mt-2 text-center text-xs text-red-400">
                    {emailError}
                  </p>
                )}

                <button
                  onClick={handleEmailCheck}
                  disabled={
                    !email ||
                    !email.includes('@') ||
                    loading === 'email'
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-40"
                >
                  {loading === 'email' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  다음
                </button>
              </>
            )}

            {emailStep === 'code' && (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                    <KeyRound size={22} className="text-gold" />
                  </div>
                  <Dialog.Title className="text-lg font-bold text-foreground">
                    인증 코드 입력
                  </Dialog.Title>
                  <Dialog.Description className="text-center text-sm text-foreground/60">
                    <span className="font-medium text-gold">
                      {email}
                    </span>
                    <br />
                    으로 보낸 인증 코드를 입력해주세요
                  </Dialog.Description>
                </div>

                <div className="mt-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="인증 코드 8자리"
                    maxLength={8}
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\D/g, ''))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyCode();
                    }}
                    autoFocus
                    className="w-full rounded-xl border border-foreground/15 bg-surface px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] text-foreground outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-foreground-dim focus:border-gold/50"
                  />
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={
                    otpCode.length < 8 || loading === 'verify'
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-40"
                >
                  {loading === 'verify' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  확인
                </button>

                <button
                  onClick={() => {
                    setOtpCode('');
                    handleEmailCheck();
                  }}
                  disabled={loading !== null}
                  className="mt-2 w-full py-2 text-center text-xs text-foreground-soft transition-colors hover:text-foreground"
                >
                  코드 다시 받기
                </button>
              </>
            )}

            {emailStep === 'password-set' && (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                    <Lock size={22} className="text-gold" />
                  </div>
                  <Dialog.Title className="text-lg font-bold text-foreground">
                    비밀번호 설정
                  </Dialog.Title>
                  <Dialog.Description className="text-center text-sm text-foreground/60">
                    다음 로그인부터 사용할
                    <br />
                    비밀번호를 설정해주세요
                  </Dialog.Description>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호 (8자 이상)"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      autoFocus
                      className="w-full rounded-xl border border-foreground/15 bg-surface px-4 py-3 pr-11 text-sm text-foreground outline-none placeholder:text-foreground-dim focus:border-gold/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground-dim"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    value={passwordConfirm}
                    onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSetPassword();
                    }}
                    className="w-full rounded-xl border border-foreground/15 bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground-dim focus:border-gold/50"
                  />
                </div>

                {emailError && (
                  <p className="mt-2 text-center text-xs text-red-400">
                    {emailError}
                  </p>
                )}

                <button
                  onClick={handleSetPassword}
                  disabled={
                    password.length < 8 ||
                    !passwordConfirm ||
                    loading === 'password'
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-40"
                >
                  {loading === 'password' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  설정 완료
                </button>
              </>
            )}

            {emailStep === 'login' && (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                    <Lock size={22} className="text-gold" />
                  </div>
                  <Dialog.Title className="text-lg font-bold text-foreground">
                    로그인
                  </Dialog.Title>
                  <Dialog.Description className="text-center text-sm text-foreground/60">
                    <span className="font-medium text-gold">
                      {email}
                    </span>
                    <br />
                    비밀번호를 입력해주세요
                  </Dialog.Description>
                </div>

                <div className="mt-5">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePasswordLogin();
                      }}
                      autoFocus
                      className="w-full rounded-xl border border-foreground/15 bg-surface px-4 py-3 pr-11 text-sm text-foreground outline-none placeholder:text-foreground-dim focus:border-gold/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground-dim"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {emailError && (
                  <p className="mt-2 text-center text-xs text-red-400">
                    {emailError}
                  </p>
                )}

                <button
                  onClick={handlePasswordLogin}
                  disabled={!password || loading === 'password'}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-40"
                >
                  {loading === 'password' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  로그인
                </button>

                <button
                  onClick={handleForgotPassword}
                  disabled={loading !== null}
                  className="mt-2 w-full py-2 text-center text-xs text-foreground-soft transition-colors hover:text-foreground"
                >
                  비밀번호를 잊으셨나요?
                </button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
