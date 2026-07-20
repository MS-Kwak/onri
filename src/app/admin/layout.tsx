'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShieldCheck,
  Flag,
  Users,
  LogOut,
  Bell,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const NAV_ITEMS = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  {
    href: '/admin/verifications',
    label: '셀카 인증',
    icon: ShieldCheck,
  },
  { href: '/admin/reports', label: '신고 관리', icon: Flag },
  { href: '/admin/users', label: '유저 관리', icon: Users },
  { href: '/admin/withdrawals', label: '탈퇴 기록', icon: LogOut },
  { href: '/admin/push', label: '푸시 알림', icon: Bell },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 flex h-dvh w-56 shrink-0 flex-col border-r border-line bg-surface">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-base font-bold text-gold">
            온리 관리자
          </h1>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-gold/10 font-semibold text-gold'
                    : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between border-t border-line px-4 py-3">
          <ThemeToggle />
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <LogOut size={13} />
            로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
