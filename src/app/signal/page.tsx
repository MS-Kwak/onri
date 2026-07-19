'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  HeartOff,
  Check,
  X,
  Clock,
  MessageCircleMore,
  Inbox,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { BottomTab } from '@/components/ui/bottom-tab';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useHeartStore } from '@/store';
import { createClient } from '@/lib/supabase';

type Tab = 'received' | 'sent';
type SignalStatus = 'pending' | 'accepted' | 'declined' | 'expired';

type Signal = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: SignalStatus;
  createdAt: string;
  nickname: string;
  age: number;
  bio: string;
  thumbnailUrl: string;
  sendCount?: number;
};

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

const STATUS_CONFIG: Record<
  SignalStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  pending: { label: '대기중', color: 'text-gold', icon: Clock },
  accepted: {
    label: '수락됨',
    color: 'text-emerald-400',
    icon: Check,
  },
  declined: {
    label: '거절됨',
    color: 'text-foreground-soft',
    icon: X,
  },
  expired: {
    label: '만료됨',
    color: 'text-foreground-dim',
    icon: Clock,
  },
};

export default function SignalPage() {
  const router = useRouter();
  const { balance, setBalance } = useHeartStore();
  const [activeTab, setActiveTab] = useState<Tab>('received');
  const [receivedSignals, setReceivedSignals] = useState<Signal[]>(
    [],
  );
  const [sentSignals, setSentSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSignals() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setCurrentUserId(user.id);

      const { data: heartData } = await supabase
        .from('hearts')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      if (heartData) setBalance(heartData.balance);

      const [receivedRes, sentRes] = await Promise.all([
        supabase
          .from('signals')
          .select('id, from_user_id, to_user_id, status, created_at')
          .eq('to_user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('signals')
          .select('id, from_user_id, to_user_id, status, created_at')
          .eq('from_user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;

      const allUserIds = new Set<string>();
      receivedRes.data?.forEach((s: { from_user_id: string }) =>
        allUserIds.add(s.from_user_id),
      );
      sentRes.data?.forEach((s: { to_user_id: string }) =>
        allUserIds.add(s.to_user_id),
      );

      const userIdArr = Array.from(allUserIds);
      const profileMap = new Map<
        string,
        { nickname: string; age: number; bio: string }
      >();
      const photoMap = new Map<string, string>();

      if (userIdArr.length > 0) {
        const [profilesRes, photosRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, nickname, age, bio')
            .in('id', userIdArr),
          supabase
            .from('profile_photos')
            .select('user_id, storage_path')
            .in('user_id', userIdArr)
            .order('display_order'),
        ]);

        profilesRes.data?.forEach(
          (p: {
            id: string;
            nickname: string;
            age: number;
            bio: string;
          }) => {
            profileMap.set(p.id, {
              nickname: p.nickname,
              age: p.age,
              bio: p.bio || '',
            });
          },
        );
        photosRes.data?.forEach(
          (ph: { user_id: string; storage_path: string }) => {
            if (!photoMap.has(ph.user_id))
              photoMap.set(ph.user_id, ph.storage_path);
          },
        );
      }

      type RawSignal = {
        id: string;
        from_user_id: string;
        to_user_id: string;
        status: string;
        created_at: string;
      };

      const mapSignal = (
        s: RawSignal,
        otherUserId: string,
      ): Signal => {
        const prof = profileMap.get(otherUserId);
        return {
          id: s.id,
          fromUserId: s.from_user_id,
          toUserId: s.to_user_id,
          status: s.status as SignalStatus,
          createdAt: s.created_at,
          nickname: prof?.nickname || '알 수 없음',
          age: prof?.age || 0,
          bio: prof?.bio || '',
          thumbnailUrl: photoMap.get(otherUserId) || '',
        };
      };

      if (cancelled) return;
      setReceivedSignals(
        (receivedRes.data || []).map((s: RawSignal) =>
          mapSignal(s, s.from_user_id),
        ),
      );
      setSentSignals(
        (sentRes.data || []).map((s: RawSignal) =>
          mapSignal(s, s.to_user_id),
        ),
      );
      setLoading(false);
    }

    loadSignals();
    return () => {
      cancelled = true;
    };
  }, [setBalance]);

  const pendingCount = useMemo(
    () =>
      receivedSignals.filter((s) => s.status === 'pending').length,
    [receivedSignals],
  );

  const groupedSentSignals = useMemo(() => {
    const groups = new Map<string, Signal[]>();
    sentSignals.forEach((s) => {
      const existing = groups.get(s.toUserId);
      if (existing) {
        existing.push(s);
      } else {
        groups.set(s.toUserId, [s]);
      }
    });
    return Array.from(groups.values()).map((group) => {
      const latest = group[0];
      return { ...latest, sendCount: group.length };
    });
  }, [sentSignals]);

  const handleAccept = async (signal: Signal) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc('respond_signal', {
        p_signal_id: signal.id,
        p_action: 'accepted',
      });

      if (error) {
        console.error('[Signal] 수락 실패:', error);
        toast.error('시그널 수락에 실패했어요');
        return;
      }

      setReceivedSignals((prev) =>
        prev.map((s) =>
          s.id === signal.id
            ? { ...s, status: 'accepted' as const }
            : s,
        ),
      );
      toast.success(`${signal.nickname}님과 매칭되었어요!`, {
        description: '채팅을 시작해보세요',
        icon: <MessageCircleMore size={16} className="text-gold" />,
      });
    } catch {
      toast.error('시그널 수락에 실패했어요');
    }
  };

  const handleDecline = async (signal: Signal) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc('respond_signal', {
        p_signal_id: signal.id,
        p_action: 'declined',
      });

      if (error) {
        console.error('[Signal] 거절 실패:', error);
        toast.error('시그널 거절에 실패했어요');
        return;
      }

      setReceivedSignals((prev) =>
        prev.map((s) =>
          s.id === signal.id
            ? { ...s, status: 'declined' as const }
            : s,
        ),
      );
      toast('시그널을 거절했어요', {
        icon: <HeartOff size={16} className="text-foreground/40" />,
      });
    } catch {
      toast.error('시그널 거절에 실패했어요');
    }
  };

  const handleChat = async (otherUserId: string) => {
    if (!currentUserId) return;
    const supabase = createClient();
    const u1 =
      otherUserId < currentUserId ? otherUserId : currentUserId;
    const u2 =
      otherUserId < currentUserId ? currentUserId : otherUserId;

    const { data: room } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('user1_id', u1)
      .eq('user2_id', u2)
      .single();

    if (room) {
      router.push(`/chat/${room.id}`);
    } else {
      toast.error('채팅방을 찾을 수 없어요');
    }
  };

  const signals =
    activeTab === 'received' ? receivedSignals : groupedSentSignals;
  const pendingSignals = signals.filter(
    (s) => s.status === 'pending',
  );
  const otherSignals = signals.filter((s) => s.status !== 'pending');

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background pt-12">
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              시그널
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/my/hearts')}
              className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1.5 transition-colors hover:bg-gold/15"
            >
              <Heart size={13} className="fill-gold text-gold" />
              <span className="text-xs font-semibold text-gold">
                {balance}
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* 탭 */}
        <div className="px-5 pb-3">
          <div className="relative flex rounded-xl bg-surface-secondary p-1">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gold/15 shadow-sm transition-transform duration-300 ease-out"
              style={{
                transform:
                  activeTab === 'received'
                    ? 'translateX(0)'
                    : 'translateX(calc(100% + 8px))',
              }}
            />
            <button
              onClick={() => setActiveTab('received')}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                activeTab === 'received'
                  ? 'text-gold'
                  : 'text-foreground/35'
              }`}
            >
              <Inbox size={14} />
              받은 시그널
              {pendingCount > 0 && (
                <span
                  className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    activeTab === 'received'
                      ? 'bg-gold text-ink'
                      : 'bg-foreground/10 text-foreground/40'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                activeTab === 'sent'
                  ? 'text-gold'
                  : 'text-foreground/35'
              }`}
            >
              <Send size={14} />
              보낸 시그널
            </button>
          </div>
        </div>
        <div className="h-px bg-line" />
      </header>

      {/* 컨텐츠 */}
      <div className="flex-1 px-4 pt-4">
        {loading ? (
          <div className="flex justify-center pt-24">
            <Loader2 size={28} className="animate-spin text-gold" />
          </div>
        ) : signals.length === 0 ? (
          <EmptyState
            tab={activeTab}
            onExplore={() => router.push('/home')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {pendingSignals.length > 0 && (
              <section>
                {activeTab === 'received' &&
                  pendingSignals.length > 0 && (
                    <p className="mb-2 px-1 text-xs font-medium text-gold">
                      {pendingSignals.length}개의 새로운 시그널
                    </p>
                  )}
                {pendingSignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    tab={activeTab}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onProfile={(id) => router.push(`/profile/${id}`)}
                    onChat={handleChat}
                  />
                ))}
              </section>
            )}

            {otherSignals.length > 0 && (
              <section>
                {pendingSignals.length > 0 &&
                  otherSignals.length > 0 && (
                    <p className="mb-2 mt-3 px-1 text-xs text-foreground-soft">
                      이전 시그널
                    </p>
                  )}
                {otherSignals.map((signal) => (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    tab={activeTab}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onProfile={(id) => router.push(`/profile/${id}`)}
                    onChat={handleChat}
                  />
                ))}
              </section>
            )}
          </div>
        )}
      </div>

      <BottomTab />
    </div>
  );
}

function SignalCard({
  signal,
  tab,
  onAccept,
  onDecline,
  onProfile,
  onChat,
}: {
  signal: Signal;
  tab: Tab;
  onAccept: (s: Signal) => void;
  onDecline: (s: Signal) => void;
  onProfile: (id: string) => void;
  onChat: (otherUserId: string) => void;
}) {
  const otherUserId =
    tab === 'received' ? signal.fromUserId : signal.toUserId;

  const config = STATUS_CONFIG[signal.status];
  const StatusIcon = config.icon;
  const isPending = signal.status === 'pending';
  const isAccepted = signal.status === 'accepted';
  const isDone =
    signal.status === 'declined' || signal.status === 'expired';

  return (
    <div
      className={`mb-2 overflow-hidden rounded-2xl border transition-all ${
        isPending
          ? 'border-gold/15 bg-surface-secondary'
          : 'border-line bg-surface/30'
      } ${isDone ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => onProfile(otherUserId)}
          className="shrink-0"
        >
          <Avatar
            src={signal.thumbnailUrl || null}
            name={signal.nickname}
            size="lg"
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onProfile(otherUserId)}
              className="truncate text-sm font-semibold text-foreground hover:underline"
            >
              {signal.nickname}
            </button>
            {signal.age > 0 && (
              <span className="shrink-0 text-xs text-foreground-soft">
                {signal.age}
              </span>
            )}
          </div>

          {signal.bio && (
            <p className="mt-0.5 truncate text-xs text-foreground/40">
              {signal.bio}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-1.5">
            <StatusIcon size={11} className={config.color} />
            <span className={`text-[11px] ${config.color}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-foreground-dim">·</span>
            <span className="text-[10px] text-foreground-dim">
              {getRelativeTime(signal.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {tab === 'received' && isPending && (
            <>
              <button
                onClick={() => onDecline(signal)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-foreground/10 text-foreground/40 transition-colors hover:border-foreground/20 hover:text-foreground/60"
              >
                <X size={16} />
              </button>
              <button
                onClick={() => onAccept(signal)}
                className="flex h-9 items-center gap-1 rounded-xl bg-gold px-3.5 text-xs font-semibold text-ink transition-colors hover:bg-gold/90 active:scale-95"
              >
                <Heart size={14} className="fill-navy" />
                수락
              </button>
            </>
          )}

          {isAccepted && (
            <button
              onClick={() => onChat(otherUserId)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
            >
              <MessageCircleMore size={14} />
              채팅
            </button>
          )}

          {tab === 'sent' && isPending && (
            <span className="rounded-lg bg-gold/10 px-2.5 py-1.5 text-[11px] font-medium text-gold/70">
              응답 대기중
            </span>
          )}

          {tab === 'sent' &&
            signal.sendCount &&
            signal.sendCount > 1 && (
              <span className="rounded-lg bg-foreground/5 px-2 py-1 text-[10px] font-medium text-foreground/40">
                {signal.sendCount}회 전송
              </span>
            )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  tab,
  onExplore,
}: {
  tab: Tab;
  onExplore: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-24">
      {tab === 'received' ? (
        <Inbox size={44} className="text-foreground-dim" />
      ) : (
        <Send size={44} className="text-foreground-dim" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/50">
          {tab === 'received'
            ? '아직 받은 시그널이 없어요'
            : '아직 보낸 시그널이 없어요'}
        </p>
        <p className="mt-1 text-xs text-foreground-soft">
          {tab === 'received'
            ? '프로필을 꾸미면 시그널을 받을 확률이 높아져요'
            : '마음에 드는 사람에게 시그널을 보내보세요'}
        </p>
      </div>
      <button
        onClick={onExplore}
        className="mt-2 rounded-xl bg-surface px-5 py-2.5 text-sm text-gold transition-colors hover:bg-surface/80"
      >
        홈에서 둘러보기
      </button>
    </div>
  );
}
