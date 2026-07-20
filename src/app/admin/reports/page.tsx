'use client';

import { useState, useEffect } from 'react';
import {
  Flag,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

const REASON_LABELS: Record<string, string> = {
  FAKE_PROFILE: '허위 프로필 (타인 사진 도용)',
  HARASSMENT: '욕설 · 비하 · 혐오 표현',
  SPAM: '스팸 · 광고 · 홍보',
  SEXUAL: '성적 불쾌감을 주는 콘텐츠',
  THREAT: '협박 · 위협',
  OUTING: '아웃팅 · 개인정보 유출 시도',
  OTHER: '기타',
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: '대기', color: 'bg-amber-500/10 text-amber-600' },
  reviewed: { label: '검토', color: 'bg-blue-500/10 text-blue-600' },
  resolved: {
    label: '해결',
    color: 'bg-green-500/10 text-green-600',
  },
  dismissed: {
    label: '기각',
    color: 'bg-foreground/5 text-foreground/50',
  },
};

const STATUS_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '대기' },
  { value: 'reviewed', label: '검토' },
  { value: 'resolved', label: '해결' },
  { value: 'dismissed', label: '기각' },
];

type Report = {
  id: string;
  reporter_id: string;
  target_id: string;
  reason: string;
  detail: string | null;
  context: string | null;
  status: string;
  created_at: string;
  reporterNickname: string;
  targetNickname: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?status=${filter}`);
      const data = await res.json();
      if (mounted) {
        setReports(data.reports || []);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [filter]);

  const handleStatusChange = async (
    reportId: string,
    newStatus: string,
  ) => {
    setProcessing(reportId);
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status: newStatus }),
    });
    if (res.ok) {
      toast.success(
        `신고 상태를 '${STATUS_CONFIG[newStatus]?.label}'(으)로 변경했어요`,
      );
      if (filter !== 'all') {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: newStatus } : r,
          ),
        );
      }
    } else {
      toast.error('상태 변경에 실패했어요');
    }
    setProcessing(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Flag size={20} className="text-red-400" />
          신고 관리
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
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Flag size={40} className="mb-3 text-foreground/10" />
          <p className="text-sm text-foreground/30">
            신고가 없습니다
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => {
            const st =
              STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === r.id;
            return (
              <div
                key={r.id}
                className="overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : r.id)
                  }
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-foreground/3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {r.targetNickname}
                      </span>
                      <span className="text-xs text-foreground/30">
                        ← {r.reporterNickname}
                      </span>
                      {r.context && (
                        <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[10px] text-foreground/40">
                          {r.context === 'chat' ? '채팅' : '프로필'}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-foreground/40">
                      {REASON_LABELS[r.reason] || r.reason}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${st.color}`}
                    >
                      {st.label}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-foreground/30">
                      <Clock size={10} />
                      {formatDate(r.created_at)}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-foreground/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-line bg-background px-5 py-4">
                    {r.detail && (
                      <div className="mb-4">
                        <p className="mb-1 text-[11px] font-medium text-foreground/40">
                          상세 내용
                        </p>
                        <p className="rounded-lg bg-surface px-3 py-2 text-sm text-foreground/70">
                          {r.detail}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          window.open(
                            `/profile/${r.target_id}`,
                            '_blank',
                          )
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-2 text-xs text-foreground/60 transition-colors hover:bg-foreground/10"
                      >
                        <Eye size={12} />
                        대상 프로필
                      </button>
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(r.id, 'reviewed')
                            }
                            disabled={processing === r.id}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-600 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
                          >
                            <Eye size={12} />
                            검토 완료
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(r.id, 'resolved')
                            }
                            disabled={processing === r.id}
                            className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-600 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                          >
                            <CheckCircle size={12} />
                            해결
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(r.id, 'dismissed')
                            }
                            disabled={processing === r.id}
                            className="flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-2 text-xs text-foreground/50 transition-colors hover:bg-foreground/10 disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            기각
                          </button>
                        </>
                      )}
                      {r.status === 'reviewed' && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(r.id, 'resolved')
                            }
                            disabled={processing === r.id}
                            className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-2 text-xs text-green-600 transition-colors hover:bg-green-500/20 disabled:opacity-50"
                          >
                            <CheckCircle size={12} />
                            해결
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(r.id, 'dismissed')
                            }
                            disabled={processing === r.id}
                            className="flex items-center gap-1.5 rounded-lg bg-foreground/5 px-3 py-2 text-xs text-foreground/50 transition-colors hover:bg-foreground/10 disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            기각
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
