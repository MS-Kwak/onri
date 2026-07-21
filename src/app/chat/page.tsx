'use client';

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircleMore,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Loader2,
  Ban,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { BottomTab } from '@/components/ui/bottom-tab';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';
import type { ChatRoomWithPartner, Message } from '@/types';

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
  const [rooms, setRooms] = useState<ChatRoomWithPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    null,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userIdRef = useRef<string | null>(null);

  const fetchRooms = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    userIdRef.current = user.id;

    const { data: chatRooms } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!chatRooms || chatRooms.length === 0) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const partnerIds = chatRooms.map((r) =>
      r.user1_id === user.id ? r.user2_id : r.user1_id,
    );

    const roomIds = chatRooms.map((r) => r.id);

    const [partnerData, lastMessagesResults, unreadCountsResults] =
      await Promise.all([
        fetch('/api/chat-partner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partnerIds }),
        }).then((r) => r.json()),

        Promise.all(
          roomIds.map((roomId) =>
            supabase
              .from('messages')
              .select('*')
              .eq('room_id', roomId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single(),
          ),
        ),

        Promise.all(
          roomIds.map((roomId) =>
            supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('room_id', roomId)
              .neq('sender_id', user.id)
              .is('read_at', null),
          ),
        ),
      ]);

    const partnersMap: Record<
      string,
      {
        nickname: string;
        age: number;
        verification_status: string;
        thumbnailUrl: string | null;
        isBlocked: boolean;
        blockedAt: string | null;
      }
    > = partnerData?.partners || {};

    const enrichedRooms: ChatRoomWithPartner[] = chatRooms.map(
      (room, i) => {
        const partnerId =
          room.user1_id === user.id ? room.user2_id : room.user1_id;
        const pInfo = partnersMap[partnerId];

        const blocked = pInfo?.isBlocked || false;

        return {
          ...room,
          partner: {
            id: partnerId,
            nickname: pInfo?.nickname || '탈퇴한 유저',
            age: pInfo?.age || 0,
            verification_status: pInfo?.verification_status || 'none',
            thumbnailUrl: pInfo?.thumbnailUrl || null,
          },
          isBlocked: blocked,
          lastMessage: lastMessagesResults[i]?.data || null,
          unreadCount: blocked
            ? 0
            : unreadCountsResults[i]?.count || 0,
        };
      },
    );

    enrichedRooms.sort((a, b) => {
      const timeA = a.lastMessage
        ? new Date(a.lastMessage.created_at).getTime()
        : new Date(a.created_at).getTime();
      const timeB = b.lastMessage
        ? new Date(b.lastMessage.created_at).getTime()
        : new Date(b.created_at).getTime();
      return timeB - timeA;
    });

    setRooms(enrichedRooms);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await fetchRooms();
      if (cancelled) return;
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchRooms]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchRooms();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibility,
      );
    };
  }, [fetchRooms]);

  useEffect(() => {
    if (!currentUserId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`chat-list-messages-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          const uid = userIdRef.current;
          setRooms((prev) => {
            const updated = prev.map((room) => {
              if (room.id !== newMsg.room_id) return room;
              if (room.isBlocked) return room;
              return {
                ...room,
                lastMessage: newMsg,
                unreadCount:
                  newMsg.sender_id !== uid
                    ? room.unreadCount + 1
                    : room.unreadCount,
              };
            });
            return updated.sort((a, b) => {
              const timeA = a.lastMessage
                ? new Date(a.lastMessage.created_at).getTime()
                : new Date(a.created_at).getTime();
              const timeB = b.lastMessage
                ? new Date(b.lastMessage.created_at).getTime()
                : new Date(b.created_at).getTime();
              return timeB - timeA;
            });
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  const totalUnread = rooms.reduce(
    (sum, room) => sum + room.unreadCount,
    0,
  );

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter((room) =>
      room.partner.nickname.toLowerCase().includes(q),
    );
  }, [rooms, searchQuery]);

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
                placeholder="이름으로 검색"
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2
              size={28}
              className="animate-spin text-gold/40"
            />
          </div>
        ) : filteredRooms.length === 0 ? (
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
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className={`flex items-center gap-3.5 rounded-2xl px-1 py-3.5 text-left transition-colors hover:bg-foreground/8 active:bg-foreground/5 ${
                  room.isBlocked ? 'opacity-50' : ''
                }`}
              >
                <div className="relative">
                  <Avatar
                    src={room.partner.thumbnailUrl}
                    name={room.partner.nickname}
                    size="lg"
                  />
                  {room.isBlocked ? (
                    <div className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-background">
                      <Ban
                        size={11}
                        className="text-foreground-dim"
                      />
                    </div>
                  ) : room.partner.verification_status ===
                    'approved' ? (
                    <div className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-background">
                      <ShieldCheck size={12} className="text-gold" />
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {room.partner.nickname}
                      </span>
                      {!room.isBlocked && room.partner.age > 0 && (
                        <span className="text-[11px] text-foreground-soft">
                          {room.partner.age}세
                        </span>
                      )}
                    </div>
                    {room.lastMessage && (
                      <span className="text-[11px] text-foreground-soft">
                        {formatTime(room.lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {room.isBlocked ? (
                      <p className="flex items-center gap-1 text-[13px] text-foreground/30">
                        <Ban size={11} />
                        차단된 대화
                      </p>
                    ) : (
                      <p className="truncate pr-2 text-[13px] text-foreground/45">
                        {room.lastMessage
                          ? room.lastMessage.image_url
                            ? '📷 사진'
                            : room.lastMessage.text
                          : '대화를 시작해보세요'}
                      </p>
                    )}
                    {room.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold text-ink">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomTab />
    </div>
  );
}
