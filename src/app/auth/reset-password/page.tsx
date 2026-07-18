'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }

    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError('비밀번호 변경에 실패했어요. 다시 시도해주세요.');
      setLoading(false);
      return;
    }

    toast.success('비밀번호가 변경되었어요');
    router.push('/home');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background pt-12">
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')}>
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <Lock size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              비밀번호 재설정
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex flex-1 flex-col items-center px-6 pt-12">
        <div className="w-full max-w-sm">
          <p className="mb-6 text-center text-sm text-foreground/60">
            새 비밀번호를 입력해주세요
          </p>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="새 비밀번호 (8자 이상)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
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
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              className="w-full rounded-xl border border-foreground/15 bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-foreground-dim focus:border-gold/50"
            />
          </div>

          {error && (
            <p className="mt-2 text-center text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={
              password.length < 8 || !passwordConfirm || loading
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : null}
            비밀번호 변경
          </button>
        </div>
      </div>
    </div>
  );
}
