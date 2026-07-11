'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          color: 'var(--foreground)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
        classNames: {
          title: 'text-sm font-medium',
          description: 'text-xs !text-foreground-soft',
        },
        unstyled: false,
      }}
    />
  );
}
