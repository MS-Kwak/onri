'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Heart, MessageCircle, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type TabItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const tabs: TabItem[] = [
  { href: '/home', label: '홈', icon: Home },
  { href: '/signal', label: '시그널', icon: Heart },
  { href: '/chat', label: '채팅', icon: MessageCircle },
  { href: '/my', label: '마이페이지', icon: User },
];

export function BottomTab({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={twMerge(
        'fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around',
        'border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]',
        'dark:border-navy-light dark:bg-navy',
        'h-16',
        className,
      )}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
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
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
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
