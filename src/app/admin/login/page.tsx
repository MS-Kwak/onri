'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !password.trim()) return;

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '로그인에 실패했습니다');
        setLoading(false);
        return;
      }

      router.push('/admin');
    } catch {
      toast.error('로그인 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10">
            <Lock size={24} className="text-gold" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            온리 관리자
          </h1>
          <p className="mt-1 text-sm text-foreground/40">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/50">
              아이디
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="관리자 아이디"
              autoComplete="username"
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/50">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                autoComplete="current-password"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-10 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground/30 hover:text-foreground/50"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!id.trim() || !password.trim() || loading}
            className="mt-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              '로그인'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
