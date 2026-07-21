'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Heart, MessageCircleMore, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { createClient } from '@/lib/supabase';
import { useChatStore } from '@/store';

type TabItem = {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
};

export function BottomTab({ className }: { className?: string }) {
  const pathname = usePathname();
  const { unreadCount, setUnreadCount, incrementUnread } =
    useChatStore();

  const userIdRef = useRef<string | null>(null);
  const roomsRef = useRef<
    { id: string; user1_id: string; user2_id: string }[]
  >([]);
  const blockedRef = useRef<Set<string>>(new Set());

  const fetchUnreadCount = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    userIdRef.current = user.id;

    const { data: rooms } = await supabase
      .from('chat_rooms')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (!rooms || rooms.length === 0) {
      setUnreadCount(0);
      roomsRef.current = [];
      return;
    }
    roomsRef.current = rooms;

    const partnerIds = rooms.map((r) =>
      r.user1_id === user.id ? r.user2_id : r.user1_id,
    );

    const res = await fetch('/api/chat-partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerIds }),
    });
    const partnerData = await res.json();
    const partners = partnerData?.partners || {};

    const blocked = new Set<string>();
    Object.entries(partners).forEach(([id, info]) => {
      const p = info as { isBlocked?: boolean };
      if (p?.isBlocked) blocked.add(id);
    });
    blockedRef.current = blocked;

    const unblockedRoomIds = rooms
      .filter((r) => {
        const pid = r.user1_id === user.id ? r.user2_id : r.user1_id;
        return !blocked.has(pid);
      })
      .map((r) => r.id);

    if (unblockedRoomIds.length === 0) {
      setUnreadCount(0);
    } else {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('room_id', unblockedRoomIds)
        .neq('sender_id', user.id)
        .is('read_at', null);
      setUnreadCount(count || 0);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      );
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`bottom-tab-messages-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new as {
            sender_id: string;
            room_id: string;
          };
          const uid = userIdRef.current;
          if (!uid || msg.sender_id === uid) return;

          const room = roomsRef.current.find(
            (r) => r.id === msg.room_id,
          );
          if (room) {
            const pid =
              room.user1_id === uid ? room.user2_id : room.user1_id;
            if (!blockedRef.current.has(pid)) {
              incrementUnread();
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incrementUnread]);

  const tabs: TabItem[] = [
    { href: '/home', label: '홈', icon: Home },
    { href: '/signal', label: '시그널', icon: Heart },
    {
      href: '/chat',
      label: '채팅',
      icon: MessageCircleMore,
      badge: unreadCount,
    },
    { href: '/my', label: '마이페이지', icon: User },
  ];

  return (
    <nav
      className={twMerge(
        'fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around',
        'border-t border-line bg-background pb-[env(safe-area-inset-bottom)]',
        'h-16',
        className,
      )}
    >
      {tabs.map(({ href, label, icon: Icon, badge }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={twMerge(
              'flex flex-col items-center gap-0.5 px-4 py-2 text-xs transition-colors',
              isActive ? 'text-gold' : 'text-gray',
            )}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span
              className={isActive ? 'font-semibold' : 'font-normal'}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
