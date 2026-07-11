'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { twMerge } from 'tailwind-merge';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, isDark, mounted } = useTheme();

  const toggle = () => setTheme(isDark ? 'light' : 'dark');

  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      onClick={toggle}
      className={twMerge(
        'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
        'text-foreground/40 hover:bg-foreground/5 hover:text-foreground',
        className,
      )}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
