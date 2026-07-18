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
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: blocks } = await supabase
        .from('blocks')
        .select('id, blocked_id, created_at')
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (!blocks || blocks.length === 0) {
        setLoading(false);
        return;
      }

      const blockedIds = blocks.map(
        (b: { blocked_id: string }) => b.blocked_id,
      );
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nickname')
        .in('id', blockedIds);

      const { data: photos } = await supabase
        .from('profile_photos')
        .select('user_id, storage_path')
        .in('user_id', blockedIds)
        .order('display_order');

      const photoMap = new Map<string, string>();
      photos?.forEach(
        (p: { user_id: string; storage_path: string }) => {
          if (!photoMap.has(p.user_id))
            photoMap.set(p.user_id, p.storage_path);
        },
      );

      const profileMap = new Map<string, string>();
      profiles?.forEach((p: { id: string; nickname: string }) => {
        profileMap.set(p.id, p.nickname);
      });

      const mapped: BlockedUser[] = blocks.map(
        (b: {
          id: string;
          blocked_id: string;
          created_at: string;
        }) => ({
          blockId: b.id,
          id: b.blocked_id,
          nickname: profileMap.get(b.blocked_id) || '알 수 없음',
          thumbnailUrl: photoMap.get(b.blocked_id) || '',
          blockedAt: new Date(b.created_at)
            .toISOString()
            .slice(0, 10),
        }),
      );

      setBlockedUsers(mapped);
      setLoading(false);
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
