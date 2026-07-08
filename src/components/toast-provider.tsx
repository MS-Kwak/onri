'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#1C2233',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#E9E4D9',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        },
        classNames: {
          title: 'text-sm font-medium',
          description: 'text-xs !text-[#E9E4D9]/80',
          success: '!border-emerald-500/50 !bg-emerald-950/90',
          error: '!border-rose-500/50 !bg-rose-950/90',
        },
      }}
    />
  );
}
