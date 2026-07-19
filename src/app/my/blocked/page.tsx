'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Ban,
  UserX,
  ShieldOff,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';

type BlockedUser = {
  blockId: string;
  id: string;
  nickname: string;
  thumbnailUrl: string;
  blockedAt: string;
};

export default function BlockedPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/blocked-users');
        if (!res.ok) throw new Error('fetch failed');
        const { users } = await res.json();
        setBlockedUsers(users || []);
      } catch {
        toast.error('차단 목록을 불러올 수 없어요');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUnblock = async (blockId: string, nickname: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId);

    if (error) {
      toast.error('차단 해제에 실패했어요');
      return;
    }

    setBlockedUsers((prev) =>
      prev.filter((u) => u.blockId !== blockId),
    );
    toast.success(`${nickname}님의 차단을 해제했어요`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <Ban size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              차단 목록
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-10">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5">
              <ShieldOff size={28} className="text-foreground-dim" />
            </div>
            <p className="text-sm text-foreground-soft">
              차단한 유저가 없어요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs text-foreground-soft">
              총 {blockedUsers.length}명
            </p>
            {blockedUsers.map((user) => (
              <div
                key={user.blockId}
                className="flex items-center justify-between rounded-2xl bg-surface-secondary px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.thumbnailUrl || null}
                    name={user.nickname}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.nickname}
                    </p>
                    <p className="text-[10px] text-foreground-soft">
                      {user.blockedAt} 차단
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleUnblock(user.blockId, user.nickname)
                  }
                  className="flex items-center gap-1 rounded-lg bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground/50 transition-colors hover:bg-foreground/10 hover:text-foreground/70"
                >
                  <UserX size={13} />
                  해제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
