'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  Loader2,
  Users,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type PushLog = {
  id: string;
  title: string;
  body: string;
  target: string;
  target_user_id: string | null;
  token_count: number;
  status: string;
  created_at: string;
};

export default function PushPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'user'>('all');
  const [userId, setUserId] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/push');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      /* ignore */
    }
    setLoadingLogs(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await fetchLogs();
      if (cancelled) return;
    };
    load();
    return () => { cancelled = true; };
  }, [fetchLogs]);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('제목과 내용을 입력하세요');
      return;
    }
    if (target === 'user' && !userId.trim()) {
      toast.error('유저 ID를 입력하세요');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          target,
          userId: userId.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (data.message) {
        toast.info(data.message);
      } else if (data.sent > 0) {
        toast.success(`${data.sent}명에게 푸시 알림을 보냈어요`);
      } else {
        toast.info('전송 대상이 없습니다');
      }

      setTitle('');
      setBody('');
      setUserId('');
      fetchLogs();
    } catch {
      toast.error('전송에 실패했습니다');
    }
    setSending(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
        <Bell size={20} className="text-gold" />
        푸시 알림
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 전송 폼 */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground/70">
            알림 보내기
          </h2>

          {/* 대상 선택 */}
          <div className="mb-4">
            <label className="mb-2 block text-xs text-foreground/40">
              전송 대상
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTarget('all')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-all ${
                  target === 'all'
                    ? 'border border-gold/30 bg-gold/10 font-medium text-gold'
                    : 'border border-line bg-background text-foreground/50 hover:border-foreground/20'
                }`}
              >
                <Users size={14} />
                전체 유저
              </button>
              <button
                onClick={() => setTarget('user')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-all ${
                  target === 'user'
                    ? 'border border-gold/30 bg-gold/10 font-medium text-gold'
                    : 'border border-line bg-background text-foreground/50 hover:border-foreground/20'
                }`}
              >
                <User size={14} />
                특정 유저
              </button>
            </div>
          </div>

          {target === 'user' && (
            <div className="mb-4">
              <label className="mb-1 block text-xs text-foreground/40">
                유저 ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="유저 UUID"
                className="w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="mb-1 block text-xs text-foreground/40">
              알림 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 온리에서 새 소식이 있어요"
              maxLength={50}
              className="w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1 block text-xs text-foreground/40">
              알림 내용
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="알림 본문을 입력하세요"
              maxLength={200}
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
            />
            <p className="mt-1 text-right text-[11px] text-foreground/20">
              {body.length}/200
            </p>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
          >
            {sending ? (
              <Loader2 size={16} className="mr-1.5 animate-spin" />
            ) : (
              <Send size={14} className="mr-1.5" />
            )}
            {sending ? '전송 중...' : '푸시 알림 보내기'}
          </Button>

          <p className="mt-3 text-center text-[11px] text-foreground/20">
            Firebase Admin 설정이 완료되어야 실제 전송됩니다
          </p>
        </div>

        {/* 전송 로그 */}
        <div>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground/70">
            <Clock size={13} />
            전송 이력
          </h2>

          {loadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={20}
                className="animate-spin text-gold/30"
              />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-surface py-12">
              <Bell size={28} className="mb-2 text-foreground/10" />
              <p className="text-xs text-foreground/30">
                전송 이력이 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl bg-surface px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground/80">
                          {log.title}
                        </p>
                        <span
                          className={`flex items-center gap-0.5 text-[10px] ${
                            log.status === 'sent'
                              ? 'text-green-500'
                              : 'text-foreground/30'
                          }`}
                        >
                          {log.status === 'sent' ? (
                            <CheckCircle2 size={10} />
                          ) : (
                            <AlertCircle size={10} />
                          )}
                          {log.status === 'sent'
                            ? '전송됨'
                            : '토큰 없음'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-foreground/50">
                        {log.body}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-foreground/30">
                        <span>
                          {log.target === 'all' ? '전체' : '개별'}
                        </span>
                        <span>·</span>
                        <span>토큰 {log.token_count}개</span>
                        <span>·</span>
                        <span>
                          {new Date(log.created_at).toLocaleString(
                            'ko-KR',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
