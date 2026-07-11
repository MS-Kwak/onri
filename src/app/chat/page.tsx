'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircleMore,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { BottomTab } from '@/components/ui/bottom-tab';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return sortedRooms;
    const q = searchQuery.trim().toLowerCase();
    return sortedRooms.filter((room) => {
      const partner = getPartner(room.userIds);
      if (!partner) return false;
      if (partner.nickname.toLowerCase().includes(q)) return true;
      const msgs = MOCK_MESSAGES[room.id];
      return msgs?.some((m) => m.text.toLowerCase().includes(q));
    });
  }, [sortedRooms, searchQuery]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <MessageCircleMore size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              채팅
            </h1>
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) setSearchQuery('');
              }}
              className={`rounded-full p-2 transition-colors ${searchOpen ? 'bg-gold/10 text-gold' : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'}`}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        {searchOpen && (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-surface px-3.5 py-2.5">
              <Search
                size={16}
                className="shrink-0 text-foreground-soft"
              />
              <input
                autoFocus
                type="text"
                placeholder="이름 또는 메시지 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-soft focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="shrink-0 text-foreground-soft hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="h-px bg-line" />
      </header>

      {/* 안전 배너 */}
      <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-xl border border-gold/10 bg-gold/5 px-4 py-3">
        <ShieldCheck size={16} className="shrink-0 text-gold" />
        <p className="text-xs leading-relaxed text-foreground/50">
          <span className="font-medium text-gold/80">
            안전하게 대화하세요.
          </span>{' '}
          개인정보(실명·연락처·주소 등) 공유에 주의하세요.
        </p>
      </div>

      <main className="flex-1 px-5 pt-3 pb-24">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5">
              {searchQuery ? (
                <Search size={28} className="text-foreground-dim" />
              ) : (
                <Sparkles size={28} className="text-gold/30" />
              )}
            </div>
            <p className="mb-1 text-sm font-medium text-foreground/50">
              {searchQuery
                ? '검색 결과가 없어요'
                : '아직 대화가 없어요'}
            </p>
            <p className="text-xs text-foreground-soft">
              {searchQuery
                ? '다른 키워드로 검색해보세요'
                : '시그널이 수락되면 채팅이 시작돼요'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredRooms.map((room) => {
              const partner = getPartner(room.userIds);
              const lastMsg = getLastMessage(room.id);
              const unread = getUnreadCount(room.id);

              if (!partner) return null;

              return (
                <button
                  key={room.id}
                  onClick={() => router.push(`/chat/${room.id}`)}
                  className="flex items-center gap-3.5 rounded-2xl px-1 py-3.5 text-left transition-colors hover:bg-foreground/8 active:bg-foreground/5"
                >
                  <div className="relative">
                    <Avatar
                      src={partner.thumbnailUrl || null}
                      name={partner.nickname}
                      size="lg"
                    />
                    {partner.verificationStatus === 'approved' && (
                      <div className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-background">
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
                        <span className="text-sm font-semibold text-foreground">
                          {partner.nickname}
                        </span>
                        <span className="text-[11px] text-foreground-soft">
                          {partner.age}세
                        </span>
                      </div>
                      {lastMsg && (
                        <span className="text-[11px] text-foreground-soft">
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate pr-2 text-[13px] text-foreground/45">
                        {lastMsg
                          ? lastMsg.text
                          : '대화를 시작해보세요'}
                      </p>
                      {unread > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-ink">
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
