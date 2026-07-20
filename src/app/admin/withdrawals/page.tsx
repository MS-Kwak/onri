'use client';

import { useState, useEffect } from 'react';
import { LogOut, Loader2, Clock, Heart } from 'lucide-react';

const REASON_LABELS: Record<string, string> = {
  NO_MATCH: '마음에 드는 상대가 없어서',
  FOUND_PARTNER: '좋은 사람을 만나서',
  RARELY_USE: '거의 사용하지 않아서',
  UNCOMFORTABLE: '사용이 불편해서',
  OTHER_APP: '다른 앱을 사용하려고',
  OTHER: '기타',
};

type Withdrawal = {
  id: string;
  user_id: string;
  reason: string;
  detail: string | null;
  hearts_lost: number;
  created_at: string;
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

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [reasonStats, setReasonStats] = useState<
    Record<string, number>
  >({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/withdrawals')
      .then((r) => r.json())
      .then((data) => {
        setWithdrawals(data.withdrawals || []);
        setReasonStats(data.reasonStats || {});
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalHeartsLost = withdrawals.reduce(
    (sum, w) => sum + w.hearts_lost,
    0,
  );

  const sortedReasons = Object.entries(reasonStats).sort(
    ([, a], [, b]) => b - a,
  );

  return (
    <div className="p-6 lg:p-8">
      <h1 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
        <LogOut size={20} className="text-foreground/40" />
        탈퇴 기록
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gold/40" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-1 text-sm text-foreground/40">
                총 탈퇴
              </p>
              <p className="text-2xl font-bold text-foreground">
                {total}명
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-1 text-sm text-foreground/40">
                소멸된 하트
              </p>
              <p className="flex items-center gap-1.5 text-2xl font-bold text-foreground">
                <Heart size={18} className="text-red-400" />
                {totalHeartsLost.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="mb-2 text-sm text-foreground/40">
                탈퇴 사유 분포
              </p>
              <div className="flex flex-col gap-1.5">
                {sortedReasons.length === 0 ? (
                  <p className="text-xs text-foreground/20">
                    데이터 없음
                  </p>
                ) : (
                  sortedReasons.map(([reason, count]) => {
                    const pct =
                      total > 0
                        ? Math.round((count / total) * 100)
                        : 0;
                    return (
                      <div
                        key={reason}
                        className="flex items-center gap-2"
                      >
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/5">
                          <div
                            className="h-full rounded-full bg-gold/40"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-24 truncate text-[11px] text-foreground/50">
                          {REASON_LABELS[reason] || reason}
                        </span>
                        <span className="text-[11px] font-medium text-foreground/40">
                          {count}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LogOut size={40} className="mb-3 text-foreground/10" />
              <p className="text-sm text-foreground/30">
                탈퇴 기록이 없습니다
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                      유저 ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                      사유
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                      상세
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-foreground/40">
                      소멸 하트
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-foreground/40">
                      탈퇴일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr
                      key={w.id}
                      className="border-b border-line last:border-0 hover:bg-foreground/3"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-foreground/40">
                        {w.user_id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60">
                        {REASON_LABELS[w.reason] || w.reason}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-xs text-foreground/40">
                        {w.detail || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground/50">
                        {w.hearts_lost > 0 ? (
                          <span className="flex items-center justify-end gap-1 text-red-400">
                            <Heart size={11} />
                            {w.hearts_lost}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="flex items-center justify-end gap-1 text-xs text-foreground/30">
                          <Clock size={10} />
                          {formatDate(w.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
