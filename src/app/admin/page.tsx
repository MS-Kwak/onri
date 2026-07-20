'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Flag,
  Loader2,
  Clock,
  ArrowRight,
} from 'lucide-react';

const REPORT_REASON_LABELS: Record<string, string> = {
  FAKE_PROFILE: '허위 프로필',
  HARASSMENT: '욕설/비하',
  SPAM: '스팸/광고',
  SEXUAL: '성적 콘텐츠',
  THREAT: '협박/위협',
  OUTING: '아웃팅',
  OTHER: '기타',
};

const STATUS_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: '대기', color: 'bg-amber-500/10 text-amber-600' },
  approved: {
    label: '승인',
    color: 'bg-green-500/10 text-green-600',
  },
  rejected: { label: '거절', color: 'bg-red-500/10 text-red-500' },
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

type Stats = {
  totalUsers: number;
  todayUsers: number;
  pendingVerifications: number;
  pendingReports: number;
  recentVerifications: {
    id: string;
    user_id: string;
    status: string;
    created_at: string;
    nickname: string;
  }[];
  recentReports: {
    id: string;
    reason: string;
    status: string;
    created_at: string;
    reporterNickname: string;
    targetNickname: string;
  }[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gold/40" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: '총 유저',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: '오늘 가입',
      value: stats.todayUsers,
      icon: UserPlus,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: '인증 대기',
      value: stats.pendingVerifications,
      icon: ShieldCheck,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      href: '/admin/verifications',
    },
    {
      label: '신고 대기',
      value: stats.pendingReports,
      icon: Flag,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      href: '/admin/reports',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 text-xl font-bold text-foreground">
        대시보드
      </h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const content = (
            <div
              key={card.label}
              className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:bg-foreground/3"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-foreground/50">
                  {card.label}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <card.icon size={16} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {card.value.toLocaleString()}
              </p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck size={15} className="text-gold" />
              최근 인증 요청
            </h2>
            <Link
              href="/admin/verifications"
              className="flex items-center gap-1 text-xs text-foreground/40 transition-colors hover:text-gold"
            >
              전체 보기 <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recentVerifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-foreground/30">
              인증 요청이 없습니다
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.recentVerifications.map((v) => {
                const st =
                  STATUS_LABELS[v.status] || STATUS_LABELS.pending;
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-xl bg-background px-4 py-3"
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {v.nickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${st.color}`}
                      >
                        {st.label}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-foreground/30">
                        <Clock size={10} />
                        {formatDate(v.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Flag size={15} className="text-red-400" />
              최근 신고
            </h2>
            <Link
              href="/admin/reports"
              className="flex items-center gap-1 text-xs text-foreground/40 transition-colors hover:text-gold"
            >
              전체 보기 <ArrowRight size={12} />
            </Link>
          </div>
          {stats.recentReports.length === 0 ? (
            <p className="py-6 text-center text-sm text-foreground/30">
              신고가 없습니다
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.recentReports.map((r) => {
                const st =
                  STATUS_LABELS[r.status] || STATUS_LABELS.pending;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-background px-4 py-3"
                  >
                    <div className="min-w-0">
                      <span className="text-sm text-foreground">
                        <span className="font-medium">
                          {r.targetNickname}
                        </span>
                        <span className="text-foreground/40">
                          {' '}
                          ← {r.reporterNickname}
                        </span>
                      </span>
                      <p className="text-[11px] text-foreground/40">
                        {REPORT_REASON_LABELS[r.reason] || r.reason}
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
