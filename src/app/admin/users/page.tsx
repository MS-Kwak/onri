'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  Eye,
  X,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { IDENTITY_LABELS } from '@/lib/constants';

type UserRow = {
  id: string;
  nickname: string;
  age: number;
  identity: string;
  identity_other: string | null;
  region: string;
  verification_status: string;
  role: string;
  is_active: boolean;
  created_at: string;
  thumbnailUrl: string | null;
  heartBalance: number;
};

const VERIFY_STATUS: Record<
  string,
  { label: string; color: string }
> = {
  none: { label: '미인증', color: 'text-foreground/40' },
  pending: { label: '심사중', color: 'text-amber-500' },
  approved: { label: '인증됨', color: 'text-green-500' },
  rejected: { label: '거절됨', color: 'text-red-400' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const [heartTarget, setHeartTarget] = useState<UserRow | null>(
    null,
  );
  const [heartAmount, setHeartAmount] = useState('');
  const [heartReason, setHeartReason] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set('search', search.trim());
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await fetchUsers();
      if (cancelled) return;
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleAdjustHearts = async () => {
    if (!heartTarget || !heartAmount) return;
    setProcessing(heartTarget.id);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: heartTarget.id,
        adjustHearts: parseInt(heartAmount),
        reason: heartReason || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === heartTarget.id
            ? { ...u, heartBalance: data.newBalance }
            : u,
        ),
      );
      toast.success(
        `${heartTarget.nickname}님 하트 ${parseInt(heartAmount) > 0 ? '+' : ''}${heartAmount} 처리 완료`,
      );
      setHeartTarget(null);
      setHeartAmount('');
      setHeartReason('');
    } else {
      toast.error(data.error || '처리 실패');
    }
    setProcessing(null);
  };

  const toggleActive = async (
    userId: string,
    currentActive: boolean,
  ) => {
    setProcessing(userId);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, is_active: !currentActive }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: !currentActive } : u,
        ),
      );
      toast.success(
        currentActive
          ? '유저를 비활성화했어요'
          : '유저를 활성화했어요',
      );
    } else {
      toast.error('처리에 실패했어요');
    }
    setProcessing(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Users size={20} className="text-gold" />
          유저 관리
          <span className="text-sm font-normal text-foreground/30">
            ({total}명)
          </span>
        </h1>

        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2">
            <Search size={14} className="text-foreground/30" />
            <input
              type="text"
              placeholder="닉네임 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 bg-transparent text-sm text-foreground placeholder:text-foreground-soft focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="text-foreground/30 hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gold/40" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Users size={40} className="mb-3 text-foreground/10" />
          <p className="text-sm text-foreground/30">
            {search ? '검색 결과가 없습니다' : '유저가 없습니다'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                    유저
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                    정체성
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                    지역
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                    인증
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-foreground/40">
                    하트
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                    가입일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground/40">
                    상태
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-foreground/40">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const vs =
                    VERIFY_STATUS[u.verification_status] ||
                    VERIFY_STATUS.none;
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-line transition-colors last:border-0 hover:bg-foreground/3 ${!u.is_active ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.thumbnailUrl}
                            name={u.nickname}
                            size="sm"
                          />
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {u.nickname}
                            </span>
                            {u.role === 'admin' && (
                              <span className="ml-1.5 rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                                관리자
                              </span>
                            )}
                            <p className="text-[11px] text-foreground/30">
                              {u.age}세
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60">
                        {u.identity === 'OTHER' && u.identity_other
                          ? u.identity_other
                          : IDENTITY_LABELS[u.identity] || u.identity}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60">
                        {u.region || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`flex items-center gap-1 text-xs ${vs.color}`}
                        >
                          {u.verification_status === 'approved' && (
                            <ShieldCheck size={12} />
                          )}
                          {vs.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setHeartTarget(u)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-foreground/60 transition-colors hover:bg-gold/10 hover:text-gold"
                        >
                          <Heart size={11} className="text-gold/50" />
                          {u.heartBalance}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/40">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${u.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}
                        >
                          {u.is_active ? '활성' : '정지'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              router.push(`/admin/users/${u.id}`)
                            }
                            className="rounded-lg p-1.5 text-foreground/30 transition-colors hover:bg-foreground/5 hover:text-foreground"
                            title="상세 보기"
                          >
                            <Eye size={14} />
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() =>
                                toggleActive(u.id, u.is_active)
                              }
                              disabled={processing === u.id}
                              className={`rounded-lg p-1.5 transition-colors ${
                                u.is_active
                                  ? 'text-red-400 hover:bg-red-500/5'
                                  : 'text-green-500 hover:bg-green-500/5'
                              } disabled:opacity-30`}
                              title={
                                u.is_active ? '비활성화' : '활성화'
                              }
                            >
                              {u.is_active ? (
                                <UserX size={14} />
                              ) : (
                                <UserCheck size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg p-2 text-foreground/40 transition-colors hover:bg-foreground/5 disabled:opacity-20"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-foreground/50">
                {page} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page === totalPages}
                className="rounded-lg p-2 text-foreground/40 transition-colors hover:bg-foreground/5 disabled:opacity-20"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {heartTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-line bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Heart size={14} className="text-gold" />
                {heartTarget.nickname}님 하트 조정
              </h3>
              <button
                onClick={() => {
                  setHeartTarget(null);
                  setHeartAmount('');
                  setHeartReason('');
                }}
                className="text-foreground/30 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mb-4 text-sm text-foreground/50">
              현재 잔액:{' '}
              <span className="font-semibold text-gold">
                {heartTarget.heartBalance}
              </span>
              개
            </p>

            <div className="mb-3">
              <label className="mb-1 block text-xs text-foreground/40">
                조정 수량 (양수: 지급, 음수: 차감)
              </label>
              <input
                type="number"
                value={heartAmount}
                onChange={(e) => setHeartAmount(e.target.value)}
                placeholder="예: 10 또는 -5"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-xs text-foreground/40">
                사유 (선택)
              </label>
              <input
                type="text"
                value={heartReason}
                onChange={(e) => setHeartReason(e.target.value)}
                placeholder="예: 결제 오류 보상"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setHeartTarget(null);
                  setHeartAmount('');
                  setHeartReason('');
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleAdjustHearts}
                disabled={
                  !heartAmount ||
                  parseInt(heartAmount) === 0 ||
                  processing === heartTarget.id
                }
              >
                {processing === heartTarget.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  '적용'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
