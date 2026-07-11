'use client';

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  MoreVertical,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Ruler,
  Flag,
  Ban,
  Loader2,
  Plus,
  UserX,
  MessageSquareWarning,
  AlertTriangle,
  ShieldAlert,
  CircleAlert,
  FileWarning,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  MOCK_PROFILES,
  MOCK_CURRENT_USER,
} from '@/data/mock-profiles';
import {
  IDENTITY_LABELS,
  RELATION_GOAL_LABELS,
  HEART_COST,
} from '@/lib/constants';
import { useHeartStore } from '@/store';
import { ThemeToggle } from '@/components/ui/theme-toggle';

type HeartStatus = 'idle' | 'sending' | 'sent';

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

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const profile = MOCK_PROFILES.find((p) => p.id === profileId);

  const [heartStatus, setHeartStatus] = useState<HeartStatus>('idle');
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const { balance, deduct } = useHeartStore();

  const isMyProfile = profileId === MOCK_CURRENT_USER.id;
  const visibleRegion =
    profile?.visibility.region === 'public' ? profile.region : null;
  const visibleAge = profile?.visibility.age === 'public';

  const handleSendHeart = useCallback(async () => {
    if (heartStatus !== 'idle') return;

    if (balance < HEART_COST.SIGNAL) {
      toast.error('하트가 부족해요', {
        description: '출석체크나 충전으로 하트를 모아보세요',
        icon: <Heart size={16} className="text-foreground/40" />,
      });
      return;
    }

    setHeartStatus('sending');

    await new Promise((r) => setTimeout(r, 800));

    const success = deduct(HEART_COST.SIGNAL);
    if (success) {
      setHeartStatus('sent');
      toast.success(`${profile?.nickname}님에게 시그널을 보냈어요`, {
        description: '하트 3개를 사용했어요',
        icon: <Heart size={16} className="fill-gold text-gold" />,
      });
    } else {
      setHeartStatus('idle');
      toast.error('하트가 부족해요');
    }
  }, [heartStatus, balance, deduct, profile?.nickname]);

  const handleReport = () => {
    setShowMenu(false);
    setReportReason('');
    setReportDetail('');
    setShowReport(true);
  };

  const handleReportSubmit = () => {
    if (!reportReason) return;
    setShowReport(false);
    toast.success('신고가 접수되었어요', {
      description: '검토 후 적절한 조치를 취할게요',
    });
  };

  const handleBlock = () => {
    setShowMenu(false);
    toast.success(`${profile?.nickname}님을 차단했어요`, {
      description: '더 이상 서로의 프로필이 보이지 않아요',
    });
    setTimeout(() => router.back(), 1200);
  };

  if (!profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-foreground/60">프로필을 찾을 수 없어요</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-background pb-28">
      {/* 프로필 이미지 영역 */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-surface">
        {profile.thumbnailUrl ? (
          <Image
            src={profile.thumbnailUrl}
            alt={profile.nickname}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-b from-profile-grad-from to-profile-grad-to">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-background text-5xl font-bold text-gold ring-2 ring-gold/20">
              {profile.nickname.charAt(0)}
            </div>
          </div>
        )}

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

        {/* 상단 네비게이션 */}
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-4 pt-12 pb-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-background/40 text-foreground backdrop-blur-sm transition-colors hover:bg-background/60"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle className="bg-background/40 backdrop-blur-sm hover:bg-background/60" />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-background/40 text-foreground backdrop-blur-sm transition-colors hover:bg-background/60"
              >
                <MoreVertical size={20} />
              </button>

              {/* 드롭다운 메뉴 */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute top-12 right-0 z-50 min-w-[140px] overflow-hidden rounded-xl border border-line bg-background shadow-xl">
                    <button
                      onClick={handleReport}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-foreground/70 transition-colors hover:bg-foreground/5"
                    >
                      <Flag size={15} />
                      신고하기
                    </button>
                    <div className="mx-3 h-px bg-line" />
                    <button
                      onClick={handleBlock}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-400/5"
                    >
                      <Ban size={15} />
                      차단하기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 프로필 정보 */}
      <div className="-mt-20 relative z-10 px-5">
        {/* 닉네임 · 나이 · 셀카 인증 */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-foreground">
            {profile.nickname}
          </h1>
          {visibleAge && (
            <span className="text-lg text-foreground/50">
              {profile.age}
            </span>
          )}
          {profile.verificationStatus === 'approved' && (
            <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
              <ShieldCheck size={12} />
              셀카 인증
            </span>
          )}
          {profile.verificationStatus === 'pending' && (
            <span className="flex items-center gap-1 rounded-full bg-foreground/10 px-2.5 py-0.5 text-[11px] font-medium text-foreground/40">
              <Clock size={12} />
              인증 검토 중
            </span>
          )}
        </div>

        {/* 정체성 · 관계목적 태그 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold">
            {IDENTITY_LABELS[profile.identity]}
          </span>
          {profile.lookingFor.map((goal) => (
            <span
              key={goal}
              className="rounded-lg border border-line bg-foreground/5 px-3 py-1 text-xs text-foreground/70"
            >
              {RELATION_GOAL_LABELS[goal]}
            </span>
          ))}
        </div>

        {/* 소개 */}
        {profile.bio && (
          <div className="mt-5">
            <p className="leading-relaxed text-[15px] text-foreground/80">
              {profile.bio}
            </p>
          </div>
        )}

        {/* 구분선 */}
        <div className="mt-6 mb-5 h-px bg-line" />

        {/* 상세 정보 그리드 */}
        <div className="grid grid-cols-1 gap-3">
          <InfoRow
            icon={<MapPin size={16} />}
            label="지역"
            value={visibleRegion || '-'}
          />
          {(profile.height || profile.weight) && (
            <InfoRow
              icon={<Ruler size={16} />}
              label="신체"
              value={[
                profile.height ? `${profile.height}cm` : null,
                profile.weight ? `${profile.weight}kg` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          )}
          <InfoRow
            icon={<Clock size={16} />}
            label="활동 시간"
            value={
              profile.activeTime.length > 0
                ? profile.activeTime.join(', ')
                : '-'
            }
            action={
              isMyProfile && profile.activeTime.length === 0
                ? () =>
                    toast(
                      '프로필 편집에서 설정할 수 있어요 (준비 중)',
                    )
                : undefined
            }
          />

          <div className="flex items-start gap-3 rounded-2xl bg-surface-secondary px-4 py-3.5">
            <Sparkles
              size={16}
              className="mt-0.5 shrink-0 text-gold/60"
            />
            <div className="flex-1">
              <span className="text-xs text-foreground/40">
                관심사
              </span>
              {profile.interests.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-foreground/60"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-sm text-foreground-soft">
                    -
                  </span>
                  {isMyProfile && (
                    <button
                      onClick={() =>
                        toast(
                          '프로필 편집에서 설정할 수 있어요 (준비 중)',
                        )
                      }
                      className="flex items-center gap-1 text-[11px] text-gold/50 transition-colors hover:text-gold"
                    >
                      <Plus size={12} />
                      추가하기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 가입일 */}
        <p className="mt-6 text-center text-[11px] text-foreground-dim">
          {new Date(profile.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          에 가입
        </p>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-background/95 px-5 pb-8 pt-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-foreground-soft">
              보유
            </span>
            <div className="flex items-center gap-1">
              <Heart size={12} className="fill-gold text-gold" />
              <span className="text-sm font-semibold text-gold">
                {balance}
              </span>
            </div>
          </div>

          <button
            onClick={handleSendHeart}
            disabled={heartStatus !== 'idle'}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all duration-300 ${
              heartStatus === 'sent'
                ? 'bg-foreground/10 text-foreground/50'
                : heartStatus === 'sending'
                  ? 'bg-gold/80 text-ink'
                  : 'bg-gold text-ink active:scale-[0.98] hover:bg-gold/90'
            }`}
          >
            {heartStatus === 'sending' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                보내는 중...
              </>
            ) : heartStatus === 'sent' ? (
              '수락 대기중'
            ) : (
              <>
                <Heart size={18} className="fill-navy" />
                시그널 보내기
              </>
            )}
          </button>
        </div>
      </div>

      {/* 신고 다이얼로그 */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent
          title="신고하기"
          description={`${profile?.nickname}님을 신고하는 이유를 선택해주세요`}
        >
          <div className="flex flex-col gap-1.5">
            {REPORT_REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <button
                  key={reason.id}
                  onClick={() => setReportReason(reason.id)}
                  className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    reportReason === reason.id
                      ? 'border-gold/30 bg-gold/10 text-gold'
                      : 'border-transparent bg-surface text-foreground/60 hover:bg-foreground/5'
                  }`}
                >
                  <Icon size={14} />
                  {reason.label}
                </button>
              );
            })}
          </div>

          {reportReason === 'OTHER' && (
            <textarea
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="신고 사유를 자세히 알려주세요"
              className="mt-3 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
            />
          )}

          <button
            onClick={handleReportSubmit}
            disabled={
              !reportReason ||
              (reportReason === 'OTHER' && !reportDetail.trim())
            }
            className="mt-4 w-full rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500/90 active:scale-[0.98] disabled:bg-surface-secondary disabled:text-foreground-dim"
          >
            신고 접수하기
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: () => void;
}) {
  const isEmpty = value === '-';

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-secondary px-4 py-3.5">
      <span className="text-gold/60">{icon}</span>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-xs text-foreground/40">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className={
              isEmpty
                ? 'text-sm text-foreground-soft'
                : 'text-sm text-foreground/70'
            }
          >
            {value}
          </span>
          {action && (
            <button
              onClick={action}
              className="flex items-center gap-0.5 text-[11px] text-gold/50 transition-colors hover:text-gold"
            >
              <Plus size={12} />
              설정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
