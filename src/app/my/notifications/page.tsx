'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircleMore,
  Megaphone,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { toast } from 'sonner';

type NotificationSetting = {
  id: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  enabled: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'signal',
      icon: <Heart size={17} className="text-gold" />,
      label: '시그널 알림',
      desc: '새로운 시그널을 받으면 알려드려요',
      enabled: true,
    },
    {
      id: 'signal_accepted',
      icon: <ShieldCheck size={17} className="text-gold" />,
      label: '시그널 수락 알림',
      desc: '보낸 시그널이 수락되면 알려드려요',
      enabled: true,
    },
    {
      id: 'chat',
      icon: <MessageCircleMore size={17} className="text-gold" />,
      label: '채팅 알림',
      desc: '새로운 메시지가 오면 알려드려요',
      enabled: true,
    },
    {
      id: 'attendance',
      icon: <CalendarCheck size={17} className="text-gold" />,
      label: '출석체크 리마인더',
      desc: '매일 출석체크를 잊지 않도록 알려드려요',
      enabled: false,
    },
    {
      id: 'marketing',
      icon: <Megaphone size={17} className="text-foreground/40" />,
      label: '이벤트·혜택 알림',
      desc: '할인, 이벤트 등 유용한 정보를 알려드려요',
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s,
      ),
    );
    const setting = settings.find((s) => s.id === id);
    if (setting) {
      toast.success(
        `${setting.label} ${setting.enabled ? 'OFF' : 'ON'}`,
      );
    }
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
          <Bell size={18} className="text-gold" />
          <h1 className="text-lg font-bold text-foreground">
            알림 설정
          </h1>
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex flex-col gap-2 px-5 pt-5 pb-10">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between rounded-2xl bg-surface-secondary px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5">{setting.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {setting.label}
                </p>
                <p className="mt-0.5 text-[11px] text-foreground/35">
                  {setting.desc}
                </p>
              </div>
            </div>

            <Switch.Root
              checked={setting.enabled}
              onCheckedChange={() => toggleSetting(setting.id)}
              className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-foreground/10 transition-colors data-[state=checked]:bg-gold"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
        ))}
      </div>
    </div>
  );
}
