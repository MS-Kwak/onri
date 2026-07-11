'use client';

import { useState, useRef, useEffect, use } from 'react';
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
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES } from '@/data/mock-chats';
import { MOCK_PROFILES } from '@/data/mock-profiles';
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
  const currentDate = new Date(current.createdAt).toDateString();
  const prevDate = new Date(prev.createdAt).toDateString();
  return currentDate !== prevDate;
}

function shouldShowAvatar(current: Message, prev: Message | null) {
  if (!prev) return current.senderId !== 'me';
  if (current.senderId === 'me') return false;
  if (prev.senderId !== current.senderId) return true;
  const diff =
    new Date(current.createdAt).getTime() -
    new Date(prev.createdAt).getTime();
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

  const room = MOCK_CHAT_ROOMS.find((r) => r.id === roomId);
  const partnerId = room?.userIds.find((uid) => uid !== 'me');
  const partner = MOCK_PROFILES.find((p) => p.id === partnerId);

  const [messages, setMessages] = useState<Message[]>(
    MOCK_MESSAGES[roomId] ?? [],
  );
  const [inputText, setInputText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'instant',
    });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      roomId,
      senderId: 'me',
      text: trimmed,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleReport = () => {
    if (!reportReason) return;
    toast.success('신고가 접수되었어요', {
      description: '운영팀에서 검토 후 조치할게요',
      icon: <Flag size={16} className="text-gold" />,
    });
    setReportOpen(false);
    setReportReason('');
    setReportDetail('');
  };

  const handleBlock = () => {
    toast.success(`${partner?.nickname}님을 차단했어요`, {
      description: '더 이상 대화할 수 없어요',
      icon: <Ban size={16} className="text-red-400" />,
    });
    setMenuOpen(false);
    router.push('/chat');
  };

  if (!room || !partner) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-navy">
        <p className="text-cream/50">채팅방을 찾을 수 없어요</p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-navy">
      {/* 상단 바 */}
      <header className="sticky top-0 z-40 bg-navy">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chat')}
              className="rounded-full p-1 text-cream/60 transition-colors hover:text-cream"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => router.push(`/profile/${partner.id}`)}
              className="flex items-center gap-2.5"
            >
              <div className="relative">
                <Avatar
                  src={partner.thumbnailUrl || null}
                  name={partner.nickname}
                  size="sm"
                />
                {partner.verificationStatus === 'approved' && (
                  <div className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-navy">
                    <ShieldCheck size={9} className="text-gold" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-cream">
                    {partner.nickname}
                  </span>
                  <span className="text-[11px] text-cream/30">
                    {partner.age}세
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* 더보기 메뉴 */}
          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger asChild>
              <button className="rounded-full p-1.5 text-cream/50 transition-colors hover:bg-cream/5 hover:text-cream">
                <MoreVertical size={18} />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed right-4 top-24 z-50 w-52 overflow-hidden rounded-2xl border border-navy-light bg-navy-light shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                <Dialog.Title className="sr-only">메뉴</Dialog.Title>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-cream/70 transition-colors hover:bg-cream/5 hover:text-cream"
                >
                  <Flag size={15} className="text-gold/60" />
                  신고하기
                </button>
                <div className="h-px bg-cream/5" />
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
        </div>
        <div className="h-px bg-navy-light" />
      </header>

      {/* 안전 배너 */}
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-gold/5 px-3.5 py-2.5">
        <ShieldCheck size={14} className="shrink-0 text-gold/60" />
        <p className="text-[11px] text-cream/35">
          안전하게 대화하세요 · 개인정보 공유에 주의하세요
        </p>
      </div>

      {/* 메시지 영역 */}
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
            const showAvatar = shouldShowAvatar(msg, prev);
            const isMine = msg.senderId === 'me';

            const isLastInGroup =
              !next ||
              next.senderId !== msg.senderId ||
              new Date(next.createdAt).getTime() -
                new Date(msg.createdAt).getTime() >
                5 * 60 * 1000;

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center py-4">
                    <span className="rounded-full bg-cream/5 px-3.5 py-1 text-[11px] text-cream/30">
                      {formatDateSeparator(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-3' : 'mt-0.5'}`}
                >
                  {/* 상대 아바타 */}
                  {!isMine && (
                    <div className="mr-2 w-8 shrink-0">
                      {showAvatar && (
                        <Avatar
                          src={partner.thumbnailUrl || null}
                          name={partner.nickname}
                          size="sm"
                        />
                      )}
                    </div>
                  )}

                  <div
                    className={`flex max-w-[70%] items-end gap-1.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                        isMine
                          ? 'rounded-br-md bg-gold text-navy'
                          : 'rounded-bl-md bg-navy-light text-cream'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {isLastInGroup && (
                      <div
                        className={`flex shrink-0 flex-col gap-0.5 pb-0.5 ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        {isMine && (
                          <span className="text-[10px] text-cream/25">
                            {msg.readAt ? (
                              <CheckCheck
                                size={12}
                                className="text-gold/50"
                              />
                            ) : (
                              <Check
                                size={12}
                                className="text-cream/20"
                              />
                            )}
                          </span>
                        )}
                        <span className="text-[10px] text-cream/20">
                          {formatMessageTime(msg.createdAt)}
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

      {/* 입력 영역 */}
      <div className="border-t border-navy-light bg-navy px-4 pt-3 pb-8">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-2xl bg-navy-light">
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
                  handleSend();
                }
              }}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="max-h-24 w-full resize-none bg-transparent px-4 py-3 text-sm text-cream placeholder:text-cream/25 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-navy transition-all hover:bg-gold/90 active:scale-95 disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* 신고 다이얼로그 */}
      <Dialog.Root open={reportOpen} onOpenChange={setReportOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border border-navy-light bg-navy p-6 pb-10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom">
            <div className="mb-5 flex items-center justify-between">
              <Dialog.Title className="flex items-center gap-2 text-base font-bold text-cream">
                <Flag size={16} className="text-gold" />
                {partner.nickname}님 신고
              </Dialog.Title>
              <Dialog.Close className="rounded-full p-1 text-cream/40 transition-colors hover:text-cream">
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
                      : 'border border-transparent bg-navy-light text-cream/60 hover:bg-cream/5'
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
                className="mb-4 w-full resize-none rounded-xl border border-navy-light bg-navy-light px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-soft/50 focus:outline-none"
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
    </div>
  );
}
