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
  Flag,
  Ban,
  Loader2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
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

type HeartStatus = 'idle' | 'sending' | 'sent';

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const profile = MOCK_PROFILES.find((p) => p.id === profileId);

  const [heartStatus, setHeartStatus] = useState<HeartStatus>('idle');
  const [showMenu, setShowMenu] = useState(false);
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
        icon: <Heart size={16} className="text-cream/40" />,
      });
      return;
    }

    setHeartStatus('sending');

    await new Promise((r) => setTimeout(r, 800));

    const success = deduct(HEART_COST.SIGNAL);
    if (success) {
      setHeartStatus('sent');
      toast.success(`${profile?.nickname}님에게 시그널을 보냈어요`, {
        description: '하트 1개를 사용했어요',
        icon: <Heart size={16} className="fill-gold text-gold" />,
      });
    } else {
      setHeartStatus('idle');
      toast.error('하트가 부족해요');
    }
  }, [heartStatus, balance, deduct, profile?.nickname]);

  const handleReport = () => {
    setShowMenu(false);
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
      <div className="flex min-h-dvh items-center justify-center bg-navy">
        <p className="text-cream/60">프로필을 찾을 수 없어요</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-navy pb-28">
      {/* 프로필 이미지 영역 */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-navy-light">
        {profile.thumbnailUrl ? (
          <Image
            src={profile.thumbnailUrl}
            alt={profile.nickname}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-b from-navy-light to-navy">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-navy text-5xl font-bold text-gold ring-2 ring-gold/20">
              {profile.nickname.charAt(0)}
            </div>
          </div>
        )}

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-linear-to-t from-navy via-transparent to-transparent" />

        {/* 상단 네비게이션 */}
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-4 pt-12 pb-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/40 text-cream backdrop-blur-sm transition-colors hover:bg-navy/60"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/40 text-cream backdrop-blur-sm transition-colors hover:bg-navy/60"
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
                <div className="absolute top-12 right-0 z-50 min-w-[140px] overflow-hidden rounded-xl border border-navy-light bg-navy shadow-xl">
                  <button
                    onClick={handleReport}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-cream/70 transition-colors hover:bg-cream/5"
                  >
                    <Flag size={15} />
                    신고하기
                  </button>
                  <div className="mx-3 h-px bg-navy-light" />
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

      {/* 프로필 정보 */}
      <div className="-mt-16 relative z-10 px-5">
        {/* 닉네임 · 나이 · 셀카 인증 */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-cream">
            {profile.nickname}
          </h1>
          {visibleAge && (
            <span className="text-lg text-cream/50">
              {profile.age}
            </span>
          )}
          {profile.isVerified && (
            <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
              <ShieldCheck size={12} />
              셀카 인증
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
              className="rounded-lg border border-cream/10 bg-cream/5 px-3 py-1 text-xs text-cream/70"
            >
              {RELATION_GOAL_LABELS[goal]}
            </span>
          ))}
        </div>

        {/* 소개 */}
        {profile.bio && (
          <div className="mt-5">
            <p className="leading-relaxed text-[15px] text-cream/80">
              {profile.bio}
            </p>
          </div>
        )}

        {/* 구분선 */}
        <div className="my-5 h-px bg-cream/5" />

        {/* 상세 정보 그리드 */}
        <div className="grid grid-cols-1 gap-3">
          <InfoRow
            icon={<MapPin size={16} />}
            label="지역"
            value={visibleRegion || '-'}
          />
          <InfoRow
            icon={<Clock size={16} />}
            label="활동 시간"
            value={profile.activeTime || '-'}
            action={
              isMyProfile && !profile.activeTime
                ? () =>
                    toast(
                      '프로필 편집에서 설정할 수 있어요 (준비 중)',
                    )
                : undefined
            }
          />

          <div className="flex items-start gap-3 rounded-2xl bg-cream/3 px-4 py-3.5">
            <Sparkles
              size={16}
              className="mt-0.5 shrink-0 text-gold/60"
            />
            <div className="flex-1">
              <span className="text-xs text-cream/40">관심사</span>
              {profile.interests.length > 0 ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-cream/5 px-2.5 py-1 text-xs text-cream/60"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-sm text-cream/25">-</span>
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
        <p className="mt-6 text-center text-[11px] text-cream/20">
          {new Date(profile.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          에 가입
        </p>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-cream/5 bg-navy/95 px-5 pb-8 pt-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-cream/30">보유</span>
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
                ? 'bg-cream/10 text-cream/50'
                : heartStatus === 'sending'
                  ? 'bg-gold/80 text-navy'
                  : 'bg-gold text-navy active:scale-[0.98] hover:bg-gold/90'
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
    <div className="flex items-center gap-3 rounded-2xl bg-cream/3 px-4 py-3.5">
      <span className="text-gold/60">{icon}</span>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-xs text-cream/40">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className={
              isEmpty
                ? 'text-sm text-cream/25'
                : 'text-sm text-cream/70'
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
