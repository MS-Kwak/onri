'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Heart,
  Coins,
  CalendarCheck,
  Gift,
  ChevronRight,
  Camera,
  ShieldCheck,
  Pencil,
  Bell,
  Ban,
  HelpCircle,
  FileText,
  LogOut,
  Sparkles,
  Crown,
  Check,
  Info,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { BottomTab } from '@/components/ui/bottom-tab';
import { MOCK_CURRENT_USER } from '@/data/mock-profiles';
import { IDENTITY_LABELS } from '@/lib/constants';
import type { VerificationStatus } from '@/types';
import { useHeartStore } from '@/store';
import { ATTENDANCE_REWARD, BRAND } from '@/lib/constants';

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

function getMockAttendance() {
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  return WEEKDAYS.map((_, i) => i < adjustedToday);
}

export default function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { balance, add } = useHeartStore();
  const profile = MOCK_CURRENT_USER;

  const [attendance, setAttendance] = useState(getMockAttendance);
  const [checkedToday, setCheckedToday] = useState(false);

  const todayIndex = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }, []);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = todayIndex - 1; i >= 0; i--) {
      if (attendance[i]) count++;
      else break;
    }
    if (checkedToday) count++;
    return count;
  }, [attendance, checkedToday, todayIndex]);

  const handleAttendance = () => {
    if (checkedToday) return;

    let reward = ATTENDANCE_REWARD.DAILY;
    const newStreak = streak + 1;
    if (newStreak >= 7) reward += ATTENDANCE_REWARD.STREAK_7;
    else if (newStreak >= 3) reward += ATTENDANCE_REWARD.STREAK_3;

    add(reward);
    setCheckedToday(true);
    setAttendance((prev) => {
      const next = [...prev];
      next[todayIndex] = true;
      return next;
    });

    if (newStreak >= 7) {
      toast.success(`${reward}개 하트 획득! 🎉`, {
        description: `7일 연속 출석 보너스 +${ATTENDANCE_REWARD.STREAK_7}`,
        icon: <Crown size={16} className="text-gold" />,
      });
    } else if (newStreak >= 3) {
      toast.success(`${reward}개 하트 획득!`, {
        description: `3일 연속 출석 보너스 +${ATTENDANCE_REWARD.STREAK_3}`,
        icon: <Gift size={16} className="text-gold" />,
      });
    } else {
      toast.success(`하트 ${reward}개를 받았어요`, {
        icon: <Heart size={16} className="fill-gold text-gold" />,
      });
    }
  };

  const [verificationStatus] = useState(() => {
    const param = searchParams.get('verification');
    if (param === 'pending') return 'pending' as const;
    if (profile.verificationStatus === 'approved')
      return 'approved' as const;
    return profile.verificationStatus;
  });
  const isVerified = verificationStatus === 'approved';

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const [profilePhoto, setProfilePhoto] = useState(
    profile.thumbnailUrl || '',
  );

  const handleProfilePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfilePhoto(url);
    toast.success('프로필 사진이 변경되었어요', {
      icon: <Camera size={16} className="text-gold" />,
    });
    if (profilePhotoRef.current) profilePhotoRef.current.value = '';
  };

  return (
    <div className="flex min-h-dvh flex-col bg-navy pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-navy px-5 pt-12 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <ArrowLeft size={20} />
          </button>
          <User size={18} className="text-gold" />
          <h1 className="text-lg font-bold text-cream">마이페이지</h1>
        </div>
      </header>

      <input
        ref={profilePhotoRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfilePhotoChange}
      />

      <div className="flex-1 overflow-y-auto">
        {/* 프로필 카드 */}
        <section className="mx-5 mt-3 overflow-hidden rounded-2xl bg-cream/3 p-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => profilePhotoRef.current?.click()}
              className="group relative"
            >
              <Avatar
                src={profilePhoto || null}
                name={profile.nickname}
                size="xl"
              />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={18} className="text-cream" />
              </span>
              {isVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold ring-2 ring-navy">
                  <ShieldCheck size={13} className="text-navy" />
                </span>
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-cream">
                  {profile.nickname}
                </h2>
                {isVerified && (
                  <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
                    셀카 인증
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-cream/40">
                <span>{IDENTITY_LABELS[profile.identity]}</span>
                <span>·</span>
                <span>{profile.age}세</span>
                <span>·</span>
                <span>{profile.region}</span>
              </div>
              {profile.bio && (
                <p className="mt-1.5 text-xs text-cream/30 line-clamp-1">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => toast('프로필 편집 (준비 중)')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cream/5 py-2.5 text-xs font-medium text-cream/60 transition-colors hover:bg-cream/8"
            >
              <Pencil size={13} />
              프로필 편집
            </button>
            <VerificationButton
              status={verificationStatus}
              onStart={() => router.push('/my/selfie-verify')}
            />
          </div>
        </section>

        {/* 하트 잔액 */}
        <section className="mx-5 mt-3 flex items-center justify-between rounded-2xl bg-cream/3 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
              <Heart size={20} className="fill-gold text-gold" />
            </div>
            <div>
              <p className="text-xs text-cream/40">보유 하트</p>
              <p className="text-xl font-bold text-cream">
                {balance}
                <span className="ml-0.5 text-sm font-normal text-cream/40">
                  개
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => toast('하트 충전 (준비 중)')}
            className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy transition-colors hover:bg-gold/90 active:scale-95"
          >
            <Coins size={14} />
            충전하기
          </button>
        </section>

        {/* 출석체크 */}
        <section className="mx-5 mt-3 rounded-2xl bg-cream/3 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-gold" />
              <h3 className="text-sm font-semibold text-cream">
                출석체크
              </h3>
            </div>
            {streak > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-gold">
                <Sparkles size={11} />
                {streak}일 연속
              </span>
            )}
          </div>

          {/* 7일 그리드 */}
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((day, i) => {
              const isToday = i === todayIndex;
              const checked =
                attendance[i] || (isToday && checkedToday);
              const isFuture = i > todayIndex;

              return (
                <div
                  key={day}
                  className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 transition-colors ${
                    isToday && !checkedToday
                      ? 'bg-gold/10 ring-1 ring-gold/30'
                      : checked
                        ? 'bg-gold/5'
                        : 'bg-cream/3'
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium ${
                      isToday
                        ? 'text-gold'
                        : isFuture
                          ? 'text-cream/15'
                          : 'text-cream/30'
                    }`}
                  >
                    {day}
                  </span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      checked
                        ? 'bg-gold text-navy'
                        : isToday
                          ? 'border border-dashed border-gold/40'
                          : isFuture
                            ? 'border border-cream/5'
                            : 'border border-cream/10'
                    }`}
                  >
                    {checked ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : isToday ? (
                      <Gift size={12} className="text-gold/60" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 보너스 안내 */}
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-cream/3 px-3 py-2">
            <Info size={12} className="shrink-0 text-cream/20" />
            <p className="text-[10px] text-cream/25">
              3일 연속 +{ATTENDANCE_REWARD.STREAK_3} · 7일 연속 +
              {ATTENDANCE_REWARD.STREAK_7} 보너스 하트
            </p>
          </div>

          {/* 출석 버튼 */}
          <button
            onClick={handleAttendance}
            disabled={checkedToday}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
              checkedToday
                ? 'bg-cream/5 text-cream/30'
                : 'bg-gold text-navy active:scale-[0.98] hover:bg-gold/90'
            }`}
          >
            {checkedToday ? (
              <>
                <Check size={16} />
                오늘 출석 완료
              </>
            ) : (
              <>
                <Gift size={16} />
                오늘 출석체크 하트 받기
              </>
            )}
          </button>
        </section>

        {/* 메뉴 리스트 */}
        <section className="mx-5 mt-5">
          <MenuGroup label="설정">
            <MenuItem
              icon={<Bell size={17} />}
              label="알림 설정"
              onClick={() => toast('알림 설정 (준비 중)')}
            />
            <MenuItem
              icon={<Ban size={17} />}
              label="차단 목록"
              onClick={() => toast('차단 목록 (준비 중)')}
            />
          </MenuGroup>

          <MenuGroup label="지원">
            <MenuItem
              icon={<HelpCircle size={17} />}
              label="고객센터"
              onClick={() => toast('고객센터 (준비 중)')}
            />
            <MenuItem
              icon={<FileText size={17} />}
              label="이용약관 · 개인정보처리방침"
              onClick={() => toast('약관 (준비 중)')}
            />
          </MenuGroup>

          <MenuGroup label="계정">
            <MenuItem
              icon={<LogOut size={17} />}
              label="로그아웃"
              danger
              onClick={() => {
                toast('로그아웃 되었어요');
                router.push('/');
              }}
            />
          </MenuGroup>
        </section>

        {/* 앱 버전 */}
        <div className="mt-6 mb-4 text-center">
          <p className="text-[11px] text-cream/15">
            {BRAND.nameEn} v0.1.0
          </p>
        </div>
      </div>

      <BottomTab />
    </div>
  );
}

function MenuGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 px-1 text-[11px] font-medium text-cream/25">
        {label}
      </p>
      <div className="overflow-hidden rounded-2xl bg-cream/3">
        {children}
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-cream/3"
    >
      <span className={danger ? 'text-red-400/70' : 'text-cream/30'}>
        {icon}
      </span>
      <span
        className={`flex-1 text-sm ${danger ? 'text-red-400' : 'text-cream/70'}`}
      >
        {label}
      </span>
      {!danger && (
        <ChevronRight size={15} className="text-cream/15" />
      )}
    </button>
  );
}

function VerificationButton({
  status,
  onStart,
}: {
  status: VerificationStatus;
  onStart: () => void;
}) {
  switch (status) {
    case 'approved':
      return (
        <button
          disabled
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cream/5 py-2.5 text-xs font-medium text-cream/30"
        >
          <ShieldCheck size={13} />
          셀카 인증 완료
        </button>
      );
    case 'pending':
      return (
        <button
          disabled
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cream/5 py-2.5 text-xs font-medium text-amber-400/60"
        >
          <Clock size={13} />
          검토 중
        </button>
      );
    case 'rejected':
      return (
        <button
          onClick={onStart}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/10 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15"
        >
          <Camera size={13} />
          재인증하기
        </button>
      );
    default:
      return (
        <button
          onClick={onStart}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold/10 py-2.5 text-xs font-medium text-gold transition-colors hover:bg-gold/15"
        >
          <Camera size={13} />
          셀카 인증하기
        </button>
      );
  }
}
