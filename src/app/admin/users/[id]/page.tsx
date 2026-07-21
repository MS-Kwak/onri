'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
  Heart,
  ShieldCheck,
  MapPin,
  Clock,
  Ruler,
  UserX,
  UserCheck,
  Send,
  Inbox,
  Flag,
  Ban,
  CalendarCheck,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  IDENTITY_LABELS,
  RELATION_GOAL_LABELS,
} from '@/lib/constants';

type ProfileData = {
  id: string;
  nickname: string;
  age: number;
  identity: string;
  identity_other: string | null;
  region: string;
  bio: string | null;
  height: number | null;
  weight: number | null;
  interests: string[] | null;
  active_time: string[] | null;
  looking_for: string[] | null;
  verification_status: string;
  visibility_age: string;
  visibility_region: string;
  role: string;
  is_active: boolean;
  created_at: string;
  phone: string | null;
};

type Photo = {
  id: string;
  storage_path: string;
  display_order: number;
};

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string;
  reference_id: string | null;
  created_at: string;
};

type Signal = {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  status: string;
  created_at: string;
};

type Report = {
  id: string;
  reporter_id: string;
  target_id: string;
  reason: string;
  detail: string | null;
  context: string;
  status: string;
  created_at: string;
};

type Block = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

type AttendanceRow = {
  date: string;
  streak: number;
  rewarded_hearts: number;
};

type Tab =
  | 'profile'
  | 'hearts'
  | 'signals'
  | 'reports'
  | 'blocks'
  | 'attendance';

const TABS: { id: Tab; label: string; icon: typeof Heart }[] = [
  { id: 'profile', label: '프로필', icon: UserCheck },
  { id: 'hearts', label: '하트', icon: Heart },
  { id: 'signals', label: '시그널', icon: Send },
  { id: 'reports', label: '신고', icon: Flag },
  { id: 'blocks', label: '차단', icon: Ban },
  { id: 'attendance', label: '출석', icon: CalendarCheck },
];

const VERIFY_STATUS: Record<
  string,
  { label: string; color: string }
> = {
  none: { label: '미인증', color: 'text-foreground/40' },
  pending: { label: '심사중', color: 'text-amber-500' },
  approved: { label: '인증됨', color: 'text-green-500' },
  rejected: { label: '거절됨', color: 'text-red-400' },
};

const SIGNAL_STATUS: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: '대기중', color: 'text-amber-500' },
  accepted: { label: '수락됨', color: 'text-green-500' },
  declined: { label: '거절됨', color: 'text-red-400' },
  expired: { label: '만료됨', color: 'text-foreground/30' },
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [heartBalance, setHeartBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signalsSent, setSignalsSent] = useState<Signal[]>([]);
  const [signalsReceived, setSignalsReceived] = useState<Signal[]>(
    [],
  );
  const [reports, setReports] = useState<Report[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [nicknameMap, setNicknameMap] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        toast.error('유저 정보를 불러올 수 없습니다');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
      setPhotos(data.photos);
      setHeartBalance(data.heartBalance);
      setTransactions(data.transactions);
      setSignalsSent(data.signalsSent);
      setSignalsReceived(data.signalsReceived);
      setReports(data.reports);
      setBlocks(data.blocks);
      setAttendance(data.attendance);
      setNicknameMap(data.nicknameMap);
    } catch {
      toast.error('데이터 로딩 실패');
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await fetchData();
      if (cancelled) return;
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  const toggleActive = async () => {
    if (!profile) return;
    setProcessing(true);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, is_active: !profile.is_active }),
    });
    if (res.ok) {
      setProfile({ ...profile, is_active: !profile.is_active });
      toast.success(
        profile.is_active
          ? '유저를 비활성화했어요'
          : '유저를 활성화했어요',
      );
    }
    setProcessing(false);
  };

  const nick = (id: string) => nicknameMap[id] || id.slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="animate-spin text-gold/40" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <UserX size={40} className="mb-3 text-foreground/10" />
        <p className="text-sm text-foreground/30">
          유저를 찾을 수 없습니다
        </p>
      </div>
    );
  }

  const vs =
    VERIFY_STATUS[profile.verification_status] || VERIFY_STATUS.none;

  return (
    <div className="p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/users')}
          className="rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-1 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface">
            {photos[0] ? (
              <Image
                src={photos[0].storage_path}
                alt={profile.nickname}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gold">
                {profile.nickname.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">
                {profile.nickname}
              </h1>
              <span className="text-sm text-foreground/40">
                {profile.age}세
              </span>
              {profile.role === 'admin' && (
                <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                  관리자
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/40">
              <span className={vs.color}>
                {profile.verification_status === 'approved' && (
                  <ShieldCheck size={10} className="mr-0.5 inline" />
                )}
                {vs.label}
              </span>
              <span>·</span>
              <span
                className={
                  profile.is_active
                    ? 'text-green-500'
                    : 'text-red-400'
                }
              >
                {profile.is_active ? '활성' : '정지'}
              </span>
              <span>·</span>
              <span>{formatDate(profile.created_at)} 가입</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-gold/10 px-3 py-1.5">
            <Heart size={12} className="fill-gold text-gold" />
            <span className="text-sm font-semibold text-gold">
              {heartBalance}
            </span>
          </div>
          {profile.role !== 'admin' && (
            <Button
              variant={profile.is_active ? 'ghost' : 'primary'}
              size="sm"
              onClick={toggleActive}
              disabled={processing}
            >
              {profile.is_active ? (
                <>
                  <UserX size={14} className="mr-1" />
                  비활성화
                </>
              ) : (
                <>
                  <UserCheck size={14} className="mr-1" />
                  활성화
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-1 rounded-xl bg-surface p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-foreground/40 hover:text-foreground/60'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'profile' && (
        <ProfileTab profile={profile} photos={photos} />
      )}
      {activeTab === 'hearts' && (
        <HeartsTab transactions={transactions} />
      )}
      {activeTab === 'signals' && (
        <SignalsTab
          sent={signalsSent}
          received={signalsReceived}
          nick={nick}
          userId={userId}
        />
      )}
      {activeTab === 'reports' && (
        <ReportsTab reports={reports} nick={nick} userId={userId} />
      )}
      {activeTab === 'blocks' && (
        <BlocksTab blocks={blocks} nick={nick} userId={userId} />
      )}
      {activeTab === 'attendance' && (
        <AttendanceTab attendance={attendance} />
      )}
    </div>
  );
}

function ProfileTab({
  profile,
  photos,
}: {
  profile: ProfileData;
  photos: Photo[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 사진 */}
      <div>
        <h3 className="mb-3 text-xs font-semibold text-foreground/40">
          프로필 사진
        </h3>
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div
                key={p.id}
                className="relative aspect-square overflow-hidden rounded-xl bg-surface"
              >
                <Image
                  src={p.storage_path}
                  alt="프로필 사진"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl bg-surface text-sm text-foreground/20">
            사진 없음
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="space-y-3">
        <h3 className="mb-3 text-xs font-semibold text-foreground/40">
          상세 정보
        </h3>
        <InfoItem
          label="정체성"
          value={
            profile.identity === 'OTHER' && profile.identity_other
              ? profile.identity_other
              : IDENTITY_LABELS[profile.identity] || profile.identity
          }
        />
        <InfoItem
          label="관계 목표"
          value={
            (profile.looking_for || [])
              .map((g) => RELATION_GOAL_LABELS[g] || g)
              .join(', ') || '-'
          }
        />
        <InfoItem
          icon={<MapPin size={13} />}
          label="지역"
          value={profile.region || '-'}
          badge={
            profile.visibility_region === 'private'
              ? '비공개'
              : undefined
          }
        />
        <InfoItem
          label="나이 공개"
          value={
            profile.visibility_age === 'public' ? '공개' : '비공개'
          }
        />
        {(profile.height || profile.weight) && (
          <InfoItem
            icon={<Ruler size={13} />}
            label="신체"
            value={[
              profile.height ? `${profile.height}cm` : null,
              profile.weight ? `${profile.weight}kg` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          />
        )}
        <InfoItem
          icon={<Clock size={13} />}
          label="활동 시간"
          value={(profile.active_time || []).join(', ') || '-'}
        />
        {profile.bio && (
          <div className="rounded-xl bg-surface p-4">
            <span className="mb-1 block text-[11px] text-foreground/30">
              소개
            </span>
            <p className="text-sm leading-relaxed text-foreground/70">
              {profile.bio}
            </p>
          </div>
        )}
        {(profile.interests || []).length > 0 && (
          <div className="rounded-xl bg-surface p-4">
            <span className="mb-2 block text-[11px] text-foreground/30">
              관심사
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests!.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-foreground/60"
                >
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}
        {profile.phone && (
          <InfoItem label="전화번호" value={profile.phone} />
        )}
      </div>
    </div>
  );
}

function HeartsTab({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold text-foreground/40">
        최근 하트 내역
      </h3>
      {transactions.length === 0 ? (
        <Empty icon={CreditCard} text="하트 내역이 없습니다" />
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm text-foreground/70">
                  {tx.description}
                </p>
                <p className="text-[11px] text-foreground/30">
                  {formatDateTime(tx.created_at)}
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-red-400'}`}
              >
                {tx.amount > 0 ? '+' : ''}
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SignalsTab({
  sent,
  received,
  nick,
}: {
  sent: Signal[];
  received: Signal[];
  nick: (id: string) => string;
  userId: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-foreground/40">
          <Send size={12} /> 보낸 시그널 ({sent.length})
        </h3>
        {sent.length === 0 ? (
          <Empty icon={Send} text="보낸 시그널이 없습니다" />
        ) : (
          <div className="space-y-1">
            {sent.map((s) => {
              const ss = SIGNAL_STATUS[s.status] || {
                label: s.status,
                color: 'text-foreground/40',
              };
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-foreground/70">
                      → {nick(s.to_user_id!)}
                    </p>
                    <p className="text-[11px] text-foreground/30">
                      {formatDateTime(s.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${ss.color}`}>
                    {ss.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-foreground/40">
          <Inbox size={12} /> 받은 시그널 ({received.length})
        </h3>
        {received.length === 0 ? (
          <Empty icon={Inbox} text="받은 시그널이 없습니다" />
        ) : (
          <div className="space-y-1">
            {received.map((s) => {
              const ss = SIGNAL_STATUS[s.status] || {
                label: s.status,
                color: 'text-foreground/40',
              };
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-foreground/70">
                      ← {nick(s.from_user_id!)}
                    </p>
                    <p className="text-[11px] text-foreground/30">
                      {formatDateTime(s.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${ss.color}`}>
                    {ss.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsTab({
  reports,
  nick,
  userId,
}: {
  reports: Report[];
  nick: (id: string) => string;
  userId: string;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold text-foreground/40">
        신고 이력
      </h3>
      {reports.length === 0 ? (
        <Empty icon={Flag} text="신고 이력이 없습니다" />
      ) : (
        <div className="space-y-1">
          {reports.map((r) => {
            const isSender = r.reporter_id === userId;
            return (
              <div
                key={r.id}
                className="rounded-xl bg-surface px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isSender ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'}`}
                    >
                      {isSender ? '신고함' : '신고당함'}
                    </span>
                    <span className="text-sm text-foreground/70">
                      {isSender
                        ? `→ ${nick(r.target_id)}`
                        : `← ${nick(r.reporter_id)}`}
                    </span>
                  </div>
                  <span className="text-[11px] text-foreground/30">
                    {formatDateTime(r.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  사유: {r.reason}
                  {r.detail ? ` — ${r.detail}` : ''}
                </p>
                <span
                  className={`mt-1 inline-block text-[10px] ${
                    r.status === 'resolved'
                      ? 'text-green-500'
                      : r.status === 'reviewed'
                        ? 'text-amber-500'
                        : r.status === 'dismissed'
                          ? 'text-foreground/30'
                          : 'text-foreground/40'
                  }`}
                >
                  {r.status === 'pending'
                    ? '대기'
                    : r.status === 'reviewed'
                      ? '검토중'
                      : r.status === 'resolved'
                        ? '처리완료'
                        : '기각'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlocksTab({
  blocks,
  nick,
  userId,
}: {
  blocks: Block[];
  nick: (id: string) => string;
  userId: string;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold text-foreground/40">
        차단 이력
      </h3>
      {blocks.length === 0 ? (
        <Empty icon={Ban} text="차단 이력이 없습니다" />
      ) : (
        <div className="space-y-1">
          {blocks.map((b) => {
            const isBlocker = b.blocker_id === userId;
            return (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isBlocker ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'}`}
                  >
                    {isBlocker ? '차단함' : '차단당함'}
                  </span>
                  <span className="text-sm text-foreground/70">
                    {isBlocker
                      ? nick(b.blocked_id)
                      : nick(b.blocker_id)}
                  </span>
                </div>
                <span className="text-[11px] text-foreground/30">
                  {formatDateTime(b.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AttendanceTab({
  attendance,
}: {
  attendance: AttendanceRow[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold text-foreground/40">
        최근 출석 기록
      </h3>
      {attendance.length === 0 ? (
        <Empty icon={CalendarCheck} text="출석 기록이 없습니다" />
      ) : (
        <div className="space-y-1">
          {attendance.map((a) => (
            <div
              key={a.date}
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground/70">
                  {formatDate(a.date)}
                </span>
                <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-gold">
                  {a.streak}일 연속
                </span>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                +{a.rewarded_hearts}
                <Heart size={11} className="fill-green-500" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  badge,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-foreground/30">{icon}</span>}
        <span className="text-xs text-foreground/40">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/70">{value}</span>
        {badge && (
          <span className="rounded bg-foreground/5 px-1.5 py-0.5 text-[10px] text-foreground/30">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function Empty({
  icon: Icon,
  text,
}: {
  icon: typeof Heart;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-surface py-12">
      <Icon size={28} className="mb-2 text-foreground/10" />
      <p className="text-xs text-foreground/30">{text}</p>
    </div>
  );
}
