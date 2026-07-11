'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ban, UserX, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { MOCK_PROFILES } from '@/data/mock-profiles';

const MOCK_BLOCKED = MOCK_PROFILES.slice(2, 4).map((p) => ({
  id: p.id,
  nickname: p.nickname,
  thumbnailUrl: p.thumbnailUrl,
  blockedAt: '2026-07-05',
}));

export default function BlockedPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState(MOCK_BLOCKED);

  const handleUnblock = (id: string, nickname: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success(`${nickname}님의 차단을 해제했어요`);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center gap-2 px-5 pt-12 pb-3">
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
        <div className="h-px bg-line" />
      </header>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-10">
        {blockedUsers.length === 0 ? (
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
                key={user.id}
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
                    handleUnblock(user.id, user.nickname)
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
