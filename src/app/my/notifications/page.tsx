'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircleMore,
  Megaphone,
  CalendarCheck,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';

type SettingKey =
  | 'signal_received'
  | 'signal_accepted'
  | 'chat_message'
  | 'attendance_reminder'
  | 'marketing';

const SETTING_ITEMS: {
  key: SettingKey;
  icon: React.ReactNode;
  label: string;
  desc: string;
}[] = [
  {
    key: 'signal_received',
    icon: <Heart size={17} className="text-gold" />,
    label: '시그널 알림',
    desc: '새로운 시그널을 받으면 알려드려요',
  },
  {
    key: 'signal_accepted',
    icon: <ShieldCheck size={17} className="text-gold" />,
    label: '시그널 수락 알림',
    desc: '보낸 시그널이 수락되면 알려드려요',
  },
  {
    key: 'chat_message',
    icon: <MessageCircleMore size={17} className="text-gold" />,
    label: '채팅 알림',
    desc: '새로운 메시지가 오면 알려드려요',
  },
  {
    key: 'attendance_reminder',
    icon: <CalendarCheck size={17} className="text-gold" />,
    label: '출석체크 리마인더',
    desc: '매일 출석체크를 잊지 않도록 알려드려요',
  },
  {
    key: 'marketing',
    icon: <Megaphone size={17} className="text-foreground/40" />,
    label: '이벤트·혜택 알림',
    desc: '할인, 이벤트 등 유용한 정보를 알려드려요',
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<
    Record<SettingKey, boolean>
  >({
    signal_received: true,
    signal_accepted: true,
    chat_message: true,
    attendance_reminder: true,
    marketing: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings({
          signal_received: data.signal_received,
          signal_accepted: data.signal_accepted,
          chat_message: data.chat_message,
          attendance_reminder: data.attendance_reminder,
          marketing: data.marketing,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggleSetting = async (key: SettingKey) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notification_settings')
      .update({ [key]: newValue })
      .eq('user_id', user.id);

    if (error) {
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      toast.error('설정 변경에 실패했어요');
      return;
    }

    const item = SETTING_ITEMS.find((s) => s.key === key);
    toast.success(`${item?.label} ${newValue ? 'ON' : 'OFF'}`);
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
            <Bell size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              알림 설정
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex flex-col gap-2 px-5 pt-5 pb-10">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={24} className="animate-spin text-gold" />
          </div>
        ) : (
          SETTING_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-2xl bg-surface-secondary px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground/35">
                    {item.desc}
                  </p>
                </div>
              </div>

              <Switch.Root
                checked={settings[item.key]}
                onCheckedChange={() => toggleSetting(item.key)}
                className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-foreground/10 transition-colors data-[state=checked]:bg-gold"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
