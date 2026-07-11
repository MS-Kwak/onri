'use client';

import { useRouter } from 'next/navigation';
import {
  MessageCircleMore,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { BottomTab } from '@/components/ui/bottom-tab';
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES } from '@/data/mock-chats';
import { MOCK_PROFILES } from '@/data/mock-profiles';

function getPartner(userIds: [string, string]) {
  const partnerId = userIds.find((id) => id !== 'me')!;
  return MOCK_PROFILES.find((p) => p.id === partnerId);
}

function getLastMessage(roomId: string) {
  const messages = MOCK_MESSAGES[roomId];
  if (!messages || messages.length === 0) return null;
  return messages[messages.length - 1];
}

function getUnreadCount(roomId: string) {
  const messages = MOCK_MESSAGES[roomId];
  if (!messages) return 0;
  return messages.filter((m) => m.senderId !== 'me' && !m.readAt)
    .length;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

export default function ChatListPage() {
  const router = useRouter();

  const totalUnread = MOCK_CHAT_ROOMS.reduce(
    (sum, room) => sum + getUnreadCount(room.id),
    0,
  );

  const sortedRooms = [...MOCK_CHAT_ROOMS].sort((a, b) => {
    const lastA = getLastMessage(a.id);
    const lastB = getLastMessage(b.id);
    if (!lastA) return 1;
    if (!lastB) return -1;
    return (
      new Date(lastB.createdAt).getTime() -
      new Date(lastA.createdAt).getTime()
    );
  });

  return (
    <div className="flex min-h-dvh flex-col bg-navy">
      <header className="sticky top-0 z-40 bg-navy">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <MessageCircleMore size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-cream">채팅</h1>
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </div>
          <button className="rounded-full p-2 text-cream/50 transition-colors hover:bg-cream/5 hover:text-cream">
            <Search size={18} />
          </button>
        </div>
        <div className="h-px bg-navy-light" />
      </header>

      {/* 안전 배너 */}
      <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-xl border border-gold/10 bg-gold/5 px-4 py-3">
        <ShieldCheck size={16} className="shrink-0 text-gold" />
        <p className="text-xs leading-relaxed text-cream/50">
          <span className="font-medium text-gold/80">
            안전하게 대화하세요.
          </span>{' '}
          개인정보(실명·연락처·주소 등) 공유에 주의하세요.
        </p>
      </div>

      <main className="flex-1 px-5 pt-3 pb-24">
        {sortedRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream/5">
              <Sparkles size={28} className="text-gold/30" />
            </div>
            <p className="mb-1 text-sm font-medium text-cream/50">
              아직 대화가 없어요
            </p>
            <p className="text-xs text-cream/30">
              시그널이 수락되면 채팅이 시작돼요
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {sortedRooms.map((room) => {
              const partner = getPartner(room.userIds);
              const lastMsg = getLastMessage(room.id);
              const unread = getUnreadCount(room.id);

              if (!partner) return null;

              return (
                <button
                  key={room.id}
                  onClick={() => router.push(`/chat/${room.id}`)}
                  className="flex items-center gap-3.5 rounded-2xl px-1 py-3.5 text-left transition-colors hover:bg-cream/3 active:bg-cream/5"
                >
                  <div className="relative">
                    <Avatar
                      src={partner.thumbnailUrl || null}
                      name={partner.nickname}
                      size="lg"
                    />
                    {partner.verificationStatus === 'approved' && (
                      <div className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-navy">
                        <ShieldCheck
                          size={12}
                          className="text-gold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-cream">
                          {partner.nickname}
                        </span>
                        <span className="text-[11px] text-cream/30">
                          {partner.age}세
                        </span>
                      </div>
                      {lastMsg && (
                        <span className="text-[11px] text-cream/25">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate pr-2 text-[13px] text-cream/45">
                        {lastMsg
                          ? lastMsg.text
                          : '대화를 시작해보세요'}
                      </p>
                      {unread > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-navy">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomTab />
    </div>
  );
}
