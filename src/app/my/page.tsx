'use client';

import { useState, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Heart,
  HeartPlus,
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
  UserX,
  Sparkles,
  Crown,
  Check,
  Info,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/avatar';
import { BottomTab } from '@/components/ui/bottom-tab';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MOCK_CURRENT_USER } from '@/data/mock-profiles';
import { IDENTITY_LABELS } from '@/lib/constants';
import type { VerificationStatus } from '@/types';
import { useHeartStore } from '@/store';
import { ATTENDANCE_REWARD, BRAND } from '@/lib/constants';

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

const WITHDRAW_REASONS = [
  { id: 'NO_MATCH', label: '마음에 드는 사람을 찾지 못했어요' },
  { id: 'FOUND_PARTNER', label: '좋은 사람을 만났어요' },
  { id: 'RARELY_USE', label: '잘 사용하지 않게 됐어요' },
  { id: 'UNCOMFORTABLE', label: '불편한 경험을 했어요' },
  { id: 'OTHER_APP', label: '다른 앱을 사용하려고요' },
  { id: 'OTHER', label: '기타' },
];

function getMockAttendance() {
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1;
  return WEEKDAYS.map((_, i) => i < adjustedToday);
}

export default function MyPageWrapper() {
  return (
    <Suspense>
      <MyPage />
    </Suspense>
  );
}

function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { balance, add } = useHeartStore();
  const profile = MOCK_CURRENT_USER;

  const [attendance, setAttendance] = useState(getMockAttendance);
  const [checkedToday, setCheckedToday] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawDetail, setWithdrawDetail] = useState('');

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
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <User size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              마이페이지
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
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
        <section className="mx-5 mt-3 overflow-hidden rounded-2xl bg-surface-secondary p-5">
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
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={18} className="text-foreground" />
              </span>
              {isVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold ring-2 ring-background">
                  <ShieldCheck size={13} className="text-ink" />
                </span>
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {profile.nickname}
                </h2>
                {isVerified && (
                  <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
                    셀카 인증
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-foreground/40">
                <span>{IDENTITY_LABELS[profile.identity]}</span>
                <span>·</span>
                <span>{profile.age}세</span>
                <span>·</span>
                <span>{profile.region}</span>
              </div>
              {profile.bio && (
                <p className="mt-1.5 text-xs text-foreground-soft line-clamp-1">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.push('/my/edit')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground/5 py-2.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-foreground/8"
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
        <section className="mx-5 mt-3 flex items-center justify-between rounded-2xl bg-surface-secondary px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
              <Heart size={20} className="fill-gold text-gold" />
            </div>
            <div>
              <p className="text-xs text-foreground/40">보유 하트</p>
              <p className="text-xl font-bold text-foreground">
                {balance}
                <span className="ml-0.5 text-sm font-normal text-foreground/40">
                  개
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/my/hearts')}
            className="flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-gold/90 active:scale-95"
          >
            <HeartPlus size={14} />
            충전하기
          </button>
        </section>

        {/* 출석체크 */}
        <section className="mx-5 mt-3 rounded-2xl bg-surface-secondary p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-gold" />
              <h3 className="text-sm font-semibold text-foreground">
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

              const dateObj = new Date();
              dateObj.setDate(dateObj.getDate() + (i - todayIndex));
              const dateNum = dateObj.getDate();

              return (
                <div
                  key={day}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-colors ${
                    isToday && !checkedToday
                      ? 'bg-gold/10 ring-1 ring-gold/30'
                      : checked
                        ? 'bg-gold/5'
                        : 'bg-surface-secondary'
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium ${
                      isToday
                        ? 'text-gold'
                        : isFuture
                          ? 'text-foreground-dim'
                          : 'text-foreground-soft'
                    }`}
                  >
                    {day}
                  </span>
                  <span
                    className={`text-[9px] ${
                      isToday
                        ? 'text-gold/70'
                        : isFuture
                          ? 'text-foreground-dim'
                          : 'text-foreground-soft'
                    }`}
                  >
                    {dateObj.getMonth() + 1}/{dateNum}
                  </span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      checked
                        ? 'bg-gold text-ink'
                        : isToday
                          ? 'border border-dashed border-gold/40'
                          : isFuture
                            ? 'border border-line'
                            : 'border border-foreground/10'
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
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-surface-secondary px-3 py-2">
            <Info
              size={12}
              className="shrink-0 text-foreground-dim"
            />
            <p className="text-[10px] text-foreground-soft">
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
                ? 'bg-foreground/5 text-foreground-soft'
                : 'bg-gold text-ink active:scale-[0.98] hover:bg-gold/90'
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
              onClick={() => router.push('/my/notifications')}
            />
            <MenuItem
              icon={<Ban size={17} />}
              label="차단 목록"
              onClick={() => router.push('/my/blocked')}
            />
          </MenuGroup>

          <MenuGroup label="지원">
            <MenuItem
              icon={<HelpCircle size={17} />}
              label="고객센터"
              onClick={() => router.push('/my/support')}
            />
            <MenuItem
              icon={<FileText size={17} />}
              label="이용약관 · 개인정보처리방침"
              onClick={() => router.push('/my/terms')}
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

        {/* 회원탈퇴 + 앱 버전 */}
        <div className="mt-6 mb-4 flex flex-col items-center gap-3">
          <button
            onClick={() => setWithdrawOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-foreground-dim transition-colors hover:bg-foreground/5 hover:text-foreground-soft"
          >
            <UserX size={12} />
            회원탈퇴
          </button>
          <p className="text-[11px] text-foreground-dim">
            {BRAND.nameEn} v0.1.0
          </p>
        </div>
      </div>

      {/* 회원탈퇴 확인 다이얼로그 */}
      <Dialog.Root
        open={withdrawOpen}
        onOpenChange={(open) => {
          setWithdrawOpen(open);
          if (!open) {
            setWithdrawReason('');
            setWithdrawDetail('');
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-48px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <Dialog.Title className="text-lg font-bold text-foreground">
                정말 탈퇴하시겠어요?
              </Dialog.Title>
              <Dialog.Description className="text-center text-sm leading-relaxed text-foreground/60">
                탈퇴 시 모든 데이터가{' '}
                <span className="font-medium text-red-400">
                  즉시 삭제
                </span>
                되며 복구할 수 없어요.
              </Dialog.Description>
            </div>

            {/* 탈퇴 이유 */}
            <div className="mt-5 space-y-1.5">
              <p className="mb-2 text-xs font-medium text-foreground/50">
                탈퇴 이유를 알려주세요
              </p>
              {WITHDRAW_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                    withdrawReason === reason.id
                      ? 'bg-gold/10 text-gold'
                      : 'bg-surface-secondary text-foreground/70 hover:bg-surface-secondary/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="withdraw-reason"
                    value={reason.id}
                    checked={withdrawReason === reason.id}
                    onChange={(e) => {
                      setWithdrawReason(e.target.value);
                      if (e.target.value !== 'OTHER')
                        setWithdrawDetail('');
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      withdrawReason === reason.id
                        ? 'border-gold bg-gold'
                        : 'border-foreground/20'
                    }`}
                  >
                    {withdrawReason === reason.id && (
                      <Check size={10} className="text-ink" />
                    )}
                  </div>
                  {reason.label}
                </label>
              ))}

              {withdrawReason === 'OTHER' && (
                <textarea
                  value={withdrawDetail}
                  onChange={(e) => setWithdrawDetail(e.target.value)}
                  placeholder="이유를 알려주세요"
                  maxLength={200}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-foreground/15 bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-foreground-dim focus:border-gold/50"
                />
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  if (!withdrawReason) {
                    toast.error('탈퇴 이유를 선택해주세요');
                    return;
                  }
                  if (
                    withdrawReason === 'OTHER' &&
                    !withdrawDetail.trim()
                  ) {
                    toast.error('기타 이유를 입력해주세요');
                    return;
                  }
                  setWithdrawOpen(false);
                  setWithdrawReason('');
                  setWithdrawDetail('');
                  toast.success('회원탈퇴가 완료되었어요', {
                    description:
                      '그동안 온리를 이용해주셔서 감사합니다.',
                  });
                  router.push('/');
                }}
                className="flex-1 rounded-xl border border-red-500/30 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/5"
              >
                탈퇴하기
              </button>
              <button
                onClick={() => setWithdrawOpen(false)}
                className="flex-1 rounded-xl bg-gold py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-soft"
              >
                계속 이용하기
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
      <p className="mb-1.5 px-1 text-[11px] font-medium text-foreground-soft">
        {label}
      </p>
      <div className="overflow-hidden rounded-2xl bg-surface-secondary">
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
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-foreground/8"
    >
      <span
        className={
          danger ? 'text-red-400/70' : 'text-foreground-soft'
        }
      >
        {icon}
      </span>
      <span
        className={`flex-1 text-sm ${danger ? 'text-red-400' : 'text-foreground/70'}`}
      >
        {label}
      </span>
      {!danger && (
        <ChevronRight size={15} className="text-foreground-dim" />
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
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground/5 py-2.5 text-xs font-medium text-foreground-soft"
        >
          <ShieldCheck size={13} />
          셀카 인증 완료
        </button>
      );
    case 'pending':
      return (
        <button
          disabled
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground/5 py-2.5 text-xs font-medium text-amber-400/60"
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
