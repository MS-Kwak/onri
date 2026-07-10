'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  HeartOff,
  Check,
  X,
  Clock,
  MessageCircle,
  Inbox,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { BottomTab } from '@/components/ui/bottom-tab';
import { MOCK_PROFILES } from '@/data/mock-profiles';
import {
  MOCK_RECEIVED_SIGNALS,
  MOCK_SENT_SIGNALS,
} from '@/data/mock-signals';
import { useHeartStore } from '@/store';
import type { HeartSend, HeartSendStatus } from '@/types';

type Tab = 'received' | 'sent';

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
  HeartSendStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  PENDING: { label: '대기중', color: 'text-gold', icon: Clock },
  ACCEPTED: {
    label: '수락됨',
    color: 'text-emerald-400',
    icon: Check,
  },
  DECLINED: { label: '거절됨', color: 'text-cream/30', icon: X },
  EXPIRED: { label: '만료됨', color: 'text-cream/20', icon: Clock },
};

export default function SignalPage() {
  const router = useRouter();
  const { balance } = useHeartStore();
  const [activeTab, setActiveTab] = useState<Tab>('received');
  const [receivedSignals, setReceivedSignals] = useState(
    MOCK_RECEIVED_SIGNALS,
  );
  const [sentSignals] = useState(MOCK_SENT_SIGNALS);

  const pendingCount = useMemo(
    () =>
      receivedSignals.filter((s) => s.status === 'PENDING').length,
    [receivedSignals],
  );

  const handleAccept = (signal: HeartSend) => {
    const profile = MOCK_PROFILES.find(
      (p) => p.id === signal.fromUserId,
    );
    setReceivedSignals((prev) =>
      prev.map((s) =>
        s.id === signal.id
          ? { ...s, status: 'ACCEPTED' as const }
          : s,
      ),
    );
    toast.success(`${profile?.nickname}님과 매칭되었어요!`, {
      description: '채팅을 시작해보세요',
      icon: <MessageCircle size={16} className="text-gold" />,
    });
  };

  const handleDecline = (signal: HeartSend) => {
    setReceivedSignals((prev) =>
      prev.map((s) =>
        s.id === signal.id
          ? { ...s, status: 'DECLINED' as const }
          : s,
      ),
    );
    toast('시그널을 거절했어요', {
      icon: <HeartOff size={16} className="text-cream/40" />,
    });
  };

  const signals =
    activeTab === 'received' ? receivedSignals : sentSignals;
  const pendingSignals = signals.filter(
    (s) => s.status === 'PENDING',
  );
  const otherSignals = signals.filter((s) => s.status !== 'PENDING');

  return (
    <div className="flex min-h-dvh flex-col bg-navy pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-navy pt-12">
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <ArrowLeft size={20} />
            </button>
            <Heart size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-cream">시그널</h1>
          </div>

          <button
            onClick={() => toast('하트 충전 (준비 중)')}
            className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1.5 transition-colors hover:bg-gold/15"
          >
            <Heart size={13} className="fill-gold text-gold" />
            <span className="text-xs font-semibold text-gold">
              {balance}
            </span>
          </button>
        </div>

        {/* 탭 */}
        <div className="px-5 pb-3">
          <div className="relative flex rounded-xl bg-cream/5 p-1">
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
                  : 'text-cream/35'
              }`}
            >
              <Inbox size={14} />
              받은 시그널
              {pendingCount > 0 && (
                <span
                  className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                    activeTab === 'received'
                      ? 'bg-gold text-navy'
                      : 'bg-cream/10 text-cream/40'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-medium transition-colors ${
                activeTab === 'sent' ? 'text-gold' : 'text-cream/35'
              }`}
            >
              <Send size={14} />
              보낸 시그널
            </button>
          </div>
        </div>
      </header>

      {/* 컨텐츠 */}
      <div className="flex-1 px-4 pt-4">
        {signals.length === 0 ? (
          <EmptyState
            tab={activeTab}
            onExplore={() => router.push('/home')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {/* 대기중 시그널 */}
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
                    onChat={() => router.push('/chat')}
                  />
                ))}
              </section>
            )}

            {/* 처리된 시그널 */}
            {otherSignals.length > 0 && (
              <section>
                {pendingSignals.length > 0 &&
                  otherSignals.length > 0 && (
                    <p className="mb-2 mt-3 px-1 text-xs text-cream/30">
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
                    onChat={() => router.push('/chat')}
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
  signal: HeartSend;
  tab: Tab;
  onAccept: (s: HeartSend) => void;
  onDecline: (s: HeartSend) => void;
  onProfile: (id: string) => void;
  onChat: () => void;
}) {
  const userId =
    tab === 'received' ? signal.fromUserId : signal.toUserId;
  const profile = MOCK_PROFILES.find((p) => p.id === userId);
  if (!profile) return null;

  const config = STATUS_CONFIG[signal.status];
  const StatusIcon = config.icon;
  const isPending = signal.status === 'PENDING';
  const isAccepted = signal.status === 'ACCEPTED';
  const isDone =
    signal.status === 'DECLINED' || signal.status === 'EXPIRED';

  return (
    <div
      className={`mb-2 overflow-hidden rounded-2xl border transition-all ${
        isPending
          ? 'border-gold/15 bg-cream/2'
          : 'border-navy-light bg-navy-light/30'
      } ${isDone ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 p-4">
        {/* 아바타 */}
        <button
          onClick={() => onProfile(profile.id)}
          className="shrink-0"
        >
          <Avatar
            src={profile.thumbnailUrl || null}
            name={profile.nickname}
            size="lg"
          />
        </button>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onProfile(profile.id)}
              className="truncate text-sm font-semibold text-cream hover:underline"
            >
              {profile.nickname}
            </button>
            <span className="shrink-0 text-xs text-cream/30">
              {profile.age}
            </span>
          </div>

          {profile.bio && (
            <p className="mt-0.5 truncate text-xs text-cream/40">
              {profile.bio}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-1.5">
            <StatusIcon size={11} className={config.color} />
            <span className={`text-[11px] ${config.color}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-cream/20">·</span>
            <span className="text-[10px] text-cream/20">
              {getRelativeTime(signal.createdAt)}
            </span>
          </div>
        </div>

        {/* 액션 */}
        <div className="flex shrink-0 items-center gap-1.5">
          {tab === 'received' && isPending && (
            <>
              <button
                onClick={() => onDecline(signal)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-cream/10 text-cream/40 transition-colors hover:border-cream/20 hover:text-cream/60"
              >
                <X size={16} />
              </button>
              <button
                onClick={() => onAccept(signal)}
                className="flex h-9 items-center gap-1 rounded-xl bg-gold px-3.5 text-xs font-semibold text-navy transition-colors hover:bg-gold/90 active:scale-95"
              >
                <Heart size={14} className="fill-navy" />
                수락
              </button>
            </>
          )}

          {isAccepted && (
            <button
              onClick={onChat}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3.5 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
            >
              <MessageCircle size={14} />
              채팅
            </button>
          )}

          {tab === 'sent' && isPending && (
            <span className="rounded-lg bg-gold/10 px-2.5 py-1.5 text-[11px] font-medium text-gold/70">
              응답 대기중
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
        <Inbox size={44} className="text-cream/15" />
      ) : (
        <Send size={44} className="text-cream/15" />
      )}
      <div className="text-center">
        <p className="text-sm font-medium text-cream/50">
          {tab === 'received'
            ? '아직 받은 시그널이 없어요'
            : '아직 보낸 시그널이 없어요'}
        </p>
        <p className="mt-1 text-xs text-cream/30">
          {tab === 'received'
            ? '프로필을 꾸미면 시그널을 받을 확률이 높아져요'
            : '마음에 드는 사람에게 시그널을 보내보세요'}
        </p>
      </div>
      <button
        onClick={onExplore}
        className="mt-2 rounded-xl bg-navy-light px-5 py-2.5 text-sm text-gold transition-colors hover:bg-navy-light/80"
      >
        홈에서 둘러보기
      </button>
    </div>
  );
}
