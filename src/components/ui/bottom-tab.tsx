'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Heart, MessageCircleMore, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES } from '@/data/mock-chats';

type TabItem = {
  href: string;
  label: string;
  icon: typeof Home;
  badge?: number;
};

function getUnreadTotal() {
  return MOCK_CHAT_ROOMS.reduce((sum, room) => {
    const msgs = MOCK_MESSAGES[room.id];
    if (!msgs) return sum;
    return (
      sum +
      msgs.filter((m) => m.senderId !== 'me' && !m.readAt).length
    );
  }, 0);
}

export function BottomTab({ className }: { className?: string }) {
  const pathname = usePathname();
  const unreadCount = getUnreadTotal();

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
