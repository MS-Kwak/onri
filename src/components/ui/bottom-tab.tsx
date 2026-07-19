'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchUnread = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true);

      if (!rooms || rooms.length === 0) {
        setUnreadCount(0);
        return;
      }

      const roomIds = rooms.map((r) => r.id);
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('room_id', roomIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (mounted) setUnreadCount(count || 0);

      channel = supabase
        .channel(`bottom-tab-messages-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const msg = payload.new as { sender_id: string };
            if (msg.sender_id !== user.id) {
              incrementUnread();
            }
          },
        )
        .subscribe();
    };

    fetchUnread();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [setUnreadCount, incrementUnread]);

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
