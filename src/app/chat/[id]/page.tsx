'use client';

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  use,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MoreVertical,
  Send,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Flag,
  AlertTriangle,
  X,
  CheckCheck,
  Check,
  UserX,
  MessageSquareWarning,
  CircleAlert,
  FileWarning,
  Search,
  ChevronUp,
  ChevronDown,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';
import { useChatStore } from '@/store';
import type { Message } from '@/types';

const REPORT_REASONS = [
  {
    id: 'FAKE_PROFILE',
    label: '허위 프로필 (타인 사진 도용 등)',
    icon: UserX,
  },
  {
    id: 'HARASSMENT',
    label: '욕설 · 비하 · 혐오 표현',
    icon: MessageSquareWarning,
  },
  { id: 'SPAM', label: '스팸 · 광고 · 홍보', icon: AlertTriangle },
  {
    id: 'SEXUAL',
    label: '성적 불쾌감을 주는 콘텐츠',
    icon: ShieldAlert,
  },
  { id: 'THREAT', label: '협박 · 위협', icon: CircleAlert },
  { id: 'OUTING', label: '아웃팅 · 개인정보 유출 시도', icon: Flag },
  { id: 'OTHER', label: '기타 (직접 입력)', icon: FileWarning },
];

type PartnerInfo = {
  id: string;
  nickname: string;
  age: number;
  verification_status: string;
  thumbnailUrl: string | null;
};

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateSeparator(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

function shouldShowDateSeparator(
  current: Message,
  prev: Message | null,
) {
  if (!prev) return true;
  const currentDate = new Date(current.created_at).toDateString();
  const prevDate = new Date(prev.created_at).toDateString();
  return currentDate !== prevDate;
}

function shouldShowAvatar(
  current: Message,
  prev: Message | null,
  myId: string,
) {
  if (!prev) return current.sender_id !== myId;
  if (current.sender_id === myId) return false;
  if (prev.sender_id !== current.sender_id) return true;
  const diff =
    new Date(current.created_at).getTime() -
    new Date(prev.created_at).getTime();
  return diff > 5 * 60 * 1000;
}

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = use(params);
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { decrementUnread } = useChatStore();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isRoomActive, setIsRoomActive] = useState(true);
  const blockedAtRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    null,
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const searchResults = useMemo(
    () =>
      searchQuery.trim()
        ? messages
            .map((m, i) => ({ msg: m, idx: i }))
            .filter(({ msg }) =>
              (msg.text || '')
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase()),
            )
        : [],
    [searchQuery, messages],
  );

  const scrollToMessage = (msgIdx: number) => {
    const el = document.getElementById(`msg-${msgIdx}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    if (searchResults.length > 0 && searchResults[searchIndex]) {
      scrollToMessage(searchResults[searchIndex].idx);
    }
  }, [searchIndex, searchResults]);

  const scrollToBottom = useCallback(() => {
    const doScroll = () => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'instant',
      });
    };
    requestAnimationFrame(() => {
      doScroll();
      setTimeout(doScroll, 50);
    });
  }, []);

  const markAsRead = useCallback(
    async (msgs: Message[]) => {
      if (!currentUserId) return;
      const supabase = createClient();
      const unreadIds = msgs
        .filter((m) => m.sender_id !== currentUserId && !m.read_at)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
      }
    },
    [currentUserId],
  );

  useEffect(() => {
    let mounted = true;

    const fetchChatData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      setCurrentUserId(user.id);

      const { data: room } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (!room) {
        setLoading(false);
        return;
      }

      const partnerId =
        room.user1_id === user.id ? room.user2_id : room.user1_id;

      const partnerRes = await fetch('/api/chat-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerIds: [partnerId] }),
      });
      const partnerData = await partnerRes.json();
      const partnerInfo = partnerData?.partners?.[partnerId];

      if (!mounted) return;

      const roomActive = !partnerInfo?.isBlocked;
      const blockTime = partnerInfo?.blockedAt || null;
      setIsRoomActive(roomActive);
      blockedAtRef.current = blockTime;

      setPartner({
        id: partnerId,
        nickname: partnerInfo?.nickname || '탈퇴한 유저',
        age: partnerInfo?.age || 0,
        verification_status:
          partnerInfo?.verification_status || 'none',
        thumbnailUrl: partnerInfo?.thumbnailUrl || null,
      });

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      let fetchedMessages = msgs || [];
      if (blockTime) {
        fetchedMessages = fetchedMessages.filter(
          (m) =>
            m.sender_id === user.id ||
            new Date(m.created_at) <= new Date(blockTime),
        );
      }
      if (!mounted) return;
      setMessages(fetchedMessages);
      setLoading(false);

      setTimeout(() => scrollToBottom(), 100);

      const unreadIds = fetchedMessages
        .filter((m) => m.sender_id !== user.id && !m.read_at)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
        if (mounted) decrementUnread(unreadIds.length);
      }
    };

    fetchChatData();

    return () => {
      mounted = false;
    };
  }, [roomId, scrollToBottom, decrementUnread]);

  useEffect(() => {
    if (!currentUserId || !roomId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            blockedAtRef.current &&
            newMsg.sender_id !== currentUserId &&
            new Date(newMsg.created_at) >
              new Date(blockedAtRef.current)
          ) {
            return;
          }
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          scrollToBottom();

          if (newMsg.sender_id !== currentUserId) {
            markAsRead([newMsg]);
            decrementUnread(1);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    currentUserId,
    roomId,
    scrollToBottom,
    markAsRead,
    decrementUnread,
  ]);

  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('10MB 이하의 이미지만 보낼 수 있어요');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 보낼 수 있어요');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSendImage = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !currentUserId || !isRoomActive || uploadingImage)
      return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      const res = await fetch('/api/chat-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '업로드 실패');
      }
    } catch {
      toast.error('이미지 전송에 실패했어요');
    } finally {
      setUploadingImage(false);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      scrollToBottom();
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending || !currentUserId || !isRoomActive)
      return;

    setSending(true);
    const supabase = createClient();

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: currentUserId,
      text: trimmed,
    });

    if (error) {
      toast.error('메시지 전송에 실패했어요');
      console.error('[Chat] 메시지 전송 실패:', error);
    }

    setInputText('');
    setSending(false);
    scrollToBottom();
    inputRef.current?.focus();
  };

  const handleReport = async () => {
    if (!reportReason || !partner) return;
    const supabase = createClient();

    await supabase.from('reports').insert({
      reporter_id: currentUserId,
      target_id: partner.id,
      reason: reportReason,
      detail: reportReason === 'OTHER' ? reportDetail : null,
      context: 'chat',
    });

    toast.success('신고가 접수되었어요', {
      description: '운영팀에서 검토 후 조치할게요',
      icon: <Flag size={16} className="text-gold" />,
    });
    setReportOpen(false);
    setReportReason('');
    setReportDetail('');
  };

  const handleBlock = async () => {
    if (!partner) return;
    const supabase = createClient();

    await supabase.from('blocks').insert({
      blocker_id: currentUserId,
      blocked_id: partner.id,
    });

    await supabase
      .from('chat_rooms')
      .update({ is_active: false })
      .eq('id', roomId);

    setIsRoomActive(false);
    setMenuOpen(false);
    toast.success(`${partner.nickname}님을 차단했어요`, {
      description: '더 이상 대화할 수 없어요',
      icon: <Ban size={16} className="text-red-400" />,
    });
  };

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-gold/40" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-foreground/50">채팅방을 찾을 수 없어요</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="rounded-full p-1 text-foreground/60 transition-colors hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => router.push(`/profile/${partner.id}`)}
              className="flex items-center gap-2.5"
            >
              <div className="relative">
                <Avatar
                  src={partner.thumbnailUrl}
                  name={partner.nickname}
                  size="sm"
                />
                {partner.verification_status === 'approved' && (
                  <div className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background">
                    <ShieldCheck size={9} className="text-gold" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {partner.nickname}
                  </span>
                  {partner.age > 0 && (
                    <span className="text-[11px] text-foreground-soft">
                      {partner.age}세
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) {
                  setSearchQuery('');
                  setSearchIndex(0);
                }
              }}
              className={`rounded-full p-1.5 transition-colors ${searchOpen ? 'bg-gold/10 text-gold' : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'}`}
            >
              <Search size={16} />
            </button>

            <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <Dialog.Trigger asChild>
                <button className="rounded-full p-1.5 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground">
                  <MoreVertical size={18} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed right-4 top-24 z-50 w-52 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                  <Dialog.Title className="sr-only">
                    메뉴
                  </Dialog.Title>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setReportOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    <Flag size={15} className="text-gold/60" />
                    신고하기
                  </button>
                  <div className="h-px bg-foreground/5" />
                  <button
                    onClick={handleBlock}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/5"
                  >
                    <Ban size={15} />
                    차단하기
                  </button>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <ThemeToggle />
          </div>
        </div>

        {searchOpen && (
          <div className="flex items-center gap-2 px-4 pb-3">
            <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-surface px-3.5 py-2">
              <Search
                size={14}
                className="shrink-0 text-foreground-soft"
              />
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                placeholder="메시지 검색"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchIndex(0);
                }}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-soft focus:outline-none"
              />
              {searchQuery && (
                <span className="shrink-0 text-[11px] text-foreground-soft">
                  {searchResults.length > 0
                    ? `${searchIndex + 1}/${searchResults.length}`
                    : '0건'}
                </span>
              )}
            </div>
            {searchResults.length > 1 && (
              <div className="flex gap-0.5">
                <button
                  onClick={() =>
                    setSearchIndex((prev) =>
                      prev > 0 ? prev - 1 : searchResults.length - 1,
                    )
                  }
                  className="rounded-lg p-1.5 text-foreground/40 hover:text-foreground"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() =>
                    setSearchIndex((prev) =>
                      prev < searchResults.length - 1 ? prev + 1 : 0,
                    )
                  }
                  className="rounded-lg p-1.5 text-foreground/40 hover:text-foreground"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="h-px bg-line" />
      </header>

      <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-gold/5 px-3.5 py-2.5">
        <ShieldCheck size={14} className="shrink-0 text-gold/60" />
        <p className="text-[11px] text-foreground/35">
          안전하게 대화하세요 · 개인정보 공유에 주의하세요
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pt-3 pb-2"
      >
        <div className="flex flex-col gap-1">
          {messages.map((msg, idx) => {
            const prev = idx > 0 ? messages[idx - 1] : null;
            const next =
              idx < messages.length - 1 ? messages[idx + 1] : null;
            const showDate = shouldShowDateSeparator(msg, prev);
            const showAvt = shouldShowAvatar(
              msg,
              prev,
              currentUserId,
            );
            const isMine = msg.sender_id === currentUserId;

            const isLastInGroup =
              !next ||
              next.sender_id !== msg.sender_id ||
              new Date(next.created_at).getTime() -
                new Date(msg.created_at).getTime() >
                5 * 60 * 1000;

            return (
              <div key={msg.id} id={`msg-${idx}`}>
                {showDate && (
                  <div className="flex justify-center py-4">
                    <span className="rounded-full bg-foreground/5 px-3.5 py-1 text-[11px] text-foreground-soft">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showAvt ? 'mt-3' : 'mt-0.5'}`}
                >
                  {!isMine && (
                    <div className="mr-2 w-8 shrink-0">
                      {showAvt && partner && (
                        <button
                          onClick={() =>
                            router.push(`/profile/${partner.id}`)
                          }
                        >
                          <Avatar
                            src={partner.thumbnailUrl}
                            name={partner.nickname}
                            size="sm"
                          />
                        </button>
                      )}
                    </div>
                  )}

                  <div
                    className={`flex max-w-[70%] items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {msg.image_url ? (
                      <button
                        onClick={() => setLightboxUrl(msg.image_url)}
                        className={`overflow-hidden rounded-2xl transition-all ${
                          isMine ? 'rounded-br-md' : 'rounded-bl-md'
                        } ${searchResults.some((r) => r.idx === idx) ? 'ring-2 ring-gold/60' : ''} ${searchResults[searchIndex]?.idx === idx ? 'ring-2 ring-gold scale-[1.02]' : ''}`}
                      >
                        <Image
                          src={msg.image_url}
                          alt="공유된 이미지"
                          width={240}
                          height={240}
                          className="max-h-60 w-auto max-w-[240px] object-cover"
                          unoptimized
                        />
                        {msg.text && (
                          <div
                            className={`px-3.5 py-2 text-[13.5px] leading-relaxed ${
                              isMine
                                ? 'bg-gold text-ink'
                                : 'bg-surface text-foreground'
                            }`}
                          >
                            {msg.text}
                          </div>
                        )}
                      </button>
                    ) : (
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed transition-all ${
                          isMine
                            ? 'rounded-br-md bg-gold text-ink'
                            : 'rounded-bl-md bg-surface text-foreground'
                        } ${searchResults.some((r) => r.idx === idx) ? 'ring-2 ring-gold/60' : ''} ${searchResults[searchIndex]?.idx === idx ? 'ring-2 ring-gold scale-[1.02]' : ''}`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {isLastInGroup && (
                      <div
                        className={`flex shrink-0 flex-col gap-0.5 pb-0.5 ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        {isMine && (
                          <span className="text-[10px] text-foreground-soft">
                            {msg.read_at ? (
                              <CheckCheck
                                size={12}
                                className="text-gold/50"
                              />
                            ) : (
                              <Check
                                size={12}
                                className="text-foreground-dim"
                              />
                            )}
                          </span>
                        )}
                        <span className="text-[10px] text-foreground-dim">
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isRoomActive ? (
        <div className="border-t border-line bg-background px-4 pt-4 pb-8">
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-foreground/5 py-3.5">
            <Ban size={15} className="text-foreground-dim" />
            <span className="text-sm text-foreground-dim">
              차단된 상대와는 대화할 수 없어요
            </span>
          </div>
        </div>
      ) : (
        <div className="border-t border-line bg-background px-4 pt-3 pb-8">
          {imagePreview && (
            <div className="relative mb-3 inline-block">
              <Image
                src={imagePreview}
                alt="미리보기"
                width={120}
                height={120}
                className="h-24 w-24 rounded-xl object-cover"
                unoptimized
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  if (fileInputRef.current)
                    fileInputRef.current.value = '';
                }}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground/60 disabled:opacity-30"
            >
              <ImagePlus size={20} />
            </button>
            <div className="flex min-h-10 flex-1 items-center rounded-2xl bg-surface">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    if (imagePreview) {
                      handleSendImage();
                    } else {
                      handleSend();
                    }
                  }
                }}
                placeholder="메시지를 입력하세요..."
                rows={1}
                className="max-h-24 w-full resize-none bg-transparent px-4 py-2.5 text-sm leading-5 text-foreground placeholder:text-foreground-soft focus:outline-none"
              />
            </div>
            <button
              onClick={imagePreview ? handleSendImage : handleSend}
              disabled={
                imagePreview
                  ? uploadingImage
                  : !inputText.trim() || sending
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-all hover:bg-gold/90 active:scale-95 disabled:opacity-30"
            >
              {uploadingImage ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      )}

      <Dialog.Root open={reportOpen} onOpenChange={setReportOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border border-line bg-background p-6 pb-10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
            <div className="mb-5 flex items-center justify-between">
              <Dialog.Title className="flex items-center gap-2 text-base font-bold text-foreground">
                <Flag size={16} className="text-gold" />
                {partner.nickname}님 신고
              </Dialog.Title>
              <Dialog.Close className="rounded-full p-1 text-foreground/40 transition-colors hover:text-foreground">
                <X size={18} />
              </Dialog.Close>
            </div>

            <div className="mb-4 flex flex-col gap-1.5">
              {REPORT_REASONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setReportReason(id)}
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                    reportReason === id
                      ? 'border border-gold/30 bg-gold/10 text-gold'
                      : 'border border-transparent bg-surface text-foreground/60 hover:bg-foreground/5'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {reportReason === 'OTHER' && (
              <textarea
                placeholder="신고 사유를 입력해주세요"
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                rows={3}
                className="mb-4 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
              />
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={
                !reportReason ||
                (reportReason === 'OTHER' && !reportDetail.trim())
              }
              onClick={handleReport}
            >
              신고 접수하기
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-12 right-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <Image
            src={lightboxUrl}
            alt="이미지 미리보기"
            width={800}
            height={800}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            unoptimized
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
