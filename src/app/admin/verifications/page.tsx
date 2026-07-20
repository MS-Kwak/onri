'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  X,
  User,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { IDENTITY_LABELS } from '@/lib/constants';

type Verification = {
  id: string;
  user_id: string;
  photo_path: string;
  status: string;
  reject_reason: string | null;
  created_at: string;
  profile: {
    id: string;
    nickname: string;
    age: number;
    identity: string;
    identity_other: string | null;
  } | null;
  profilePhoto: string | null;
};

const STATUS_FILTERS = [
  { value: 'pending', label: '대기 중' },
  { value: 'approved', label: '승인됨' },
  { value: 'rejected', label: '거절됨' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [rejectTarget, setRejectTarget] =
    useState<Verification | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/admin/verifications?status=${filter}`,
      );
      const data = await res.json();
      if (mounted) {
        setVerifications(data.verifications || []);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [filter]);

  const handleApprove = async (v: Verification) => {
    setProcessing(v.id);
    const res = await fetch('/api/admin/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', userId: v.user_id }),
    });
    if (res.ok) {
      toast.success(`${v.profile?.nickname}님 인증을 승인했어요`);
      setVerifications((prev) => prev.filter((x) => x.id !== v.id));
    } else {
      toast.error('승인 처리에 실패했어요');
    }
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setProcessing(rejectTarget.id);
    const res = await fetch('/api/admin/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reject',
        userId: rejectTarget.user_id,
        reason: rejectReason,
      }),
    });
    if (res.ok) {
      toast.success(
        `${rejectTarget.profile?.nickname}님 인증을 거절했어요`,
      );
      setVerifications((prev) =>
        prev.filter((x) => x.id !== rejectTarget.id),
      );
    } else {
      toast.error('거절 처리에 실패했어요');
    }
    setProcessing(null);
    setRejectTarget(null);
    setRejectReason('');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <ShieldCheck size={20} className="text-gold" />
          셀카 인증 심사
        </h1>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-gold/10 text-gold'
                  : 'text-foreground/40 hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gold/40" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ShieldCheck
            size={40}
            className="mb-3 text-foreground/10"
          />
          <p className="text-sm text-foreground/30">
            {filter === 'pending'
              ? '대기 중인 인증이 없습니다'
              : '해당 상태의 인증이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {verifications.map((v) => (
            <div
              key={v.id}
              className="overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {v.profile?.nickname || '알 수 없음'}
                  </span>
                  <span className="ml-2 text-xs text-foreground/40">
                    {v.profile?.age}세 ·{' '}
                    {v.profile?.identity === 'OTHER' &&
                    v.profile?.identity_other
                      ? v.profile.identity_other
                      : IDENTITY_LABELS[v.profile?.identity || ''] ||
                        ''}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-foreground/30">
                  <Clock size={10} />
                  {formatDate(v.created_at)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4">
                <div>
                  <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-foreground/40">
                    <User size={10} /> 프로필 사진
                  </p>
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-background">
                    {v.profilePhoto ? (
                      <Image
                        src={v.profilePhoto}
                        alt="프로필"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User
                        size={40}
                        className="text-foreground/10"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-foreground/40">
                    <Camera size={10} /> 셀카 인증
                  </p>
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-background">
                    <Image
                      src={v.photo_path}
                      alt="셀카"
                      width={200}
                      height={200}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              {v.status === 'rejected' && v.reject_reason && (
                <div className="mx-4 mb-3 rounded-lg bg-red-500/5 px-3 py-2 text-xs text-red-400">
                  거절 사유: {v.reject_reason}
                </div>
              )}

              {filter === 'pending' && (
                <div className="flex gap-2 border-t border-line p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1.5 text-red-400 hover:bg-red-500/5"
                    onClick={() => setRejectTarget(v)}
                    disabled={processing === v.id}
                  >
                    <XCircle size={14} /> 거절
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => handleApprove(v)}
                    disabled={processing === v.id}
                  >
                    {processing === v.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    승인
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-line bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {rejectTarget.profile?.nickname}님 인증 거절
              </h3>
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="text-foreground/30 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
            <textarea
              placeholder="거절 사유를 입력하세요"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mb-4 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleReject}
                disabled={
                  !rejectReason.trim() ||
                  processing === rejectTarget.id
                }
              >
                {processing === rejectTarget.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  '거절하기'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
