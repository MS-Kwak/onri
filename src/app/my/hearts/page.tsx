'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as PortOne from '@portone/browser-sdk/v2';
import {
  ArrowLeft,
  Heart,
  HeartPlus,
  Sparkles,
  Star,
  Gem,
  Gift,
  Crown,
  Check,
  Clock,
  CalendarCheck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useHeartStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';
import {
  HEART_PACKAGES as PACKAGES,
  type HeartPackage,
} from '@/lib/constants';

const ICON_MAP: Record<string, typeof Heart> = {
  h10: Heart,
  h30: Star,
  h60: Gem,
  h120: Crown,
};

type HeartPackageWithIcon = HeartPackage & { icon: typeof Heart };

const HEART_PACKAGES: HeartPackageWithIcon[] = PACKAGES.map((p) => ({
  ...p,
  icon: ICON_MAP[p.id] || Heart,
}));

const TYPE_LABELS: Record<string, string> = {
  signup_bonus: '가입 축하 하트',
  attendance: '출석체크 보상',
  streak_bonus: '연속 출석 보너스',
  signal_send: '시그널 보내기',
  signal_accepted: '시그널 수락 환급',
  purchase: '하트 충전',
  profile_complete: '프로필 완성 보상',
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

type Transaction = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
};

export default function HeartsPageWrapper() {
  return (
    <Suspense>
      <HeartsPage />
    </Suspense>
  );
}

function HeartsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { balance, setBalance } = useHeartStore();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const verifiedRef = useRef(false);

  const refreshData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [heartRes, txRes] = await Promise.all([
      supabase
        .from('hearts')
        .select('balance')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('heart_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    if (heartRes.data) setBalance(heartRes.data.balance);
    if (txRes.data) setTransactions(txRes.data);
  }, [setBalance]);

  useEffect(() => {
    async function load() {
      await refreshData();
      setLoading(false);
    }
    load();
  }, [refreshData]);

  useEffect(() => {
    const paymentId =
      searchParams.get('paymentId') || searchParams.get('payment_id');
    if (!paymentId || verifiedRef.current) return;
    verifiedRef.current = true;

    const verifyRedirectPayment = async () => {
      try {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });

        const result = await verifyRes.json();

        if (verifyRes.ok && result.success) {
          setBalance(result.balance);
          toast.success(`하트 ${result.amount}개가 충전되었어요`, {
            icon: <Heart size={16} className="fill-gold text-gold" />,
          });
          await refreshData();
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch {
        toast.error('결제 확인에 실패했습니다');
      }

      router.replace('/my/hearts', { scroll: false });
    };

    verifyRedirectPayment();
  }, [searchParams, setBalance, refreshData, router]);

  const handlePurchase = async () => {
    const pkg = HEART_PACKAGES.find((p) => p.id === selectedPkg);
    if (!pkg) return;

    setIsPurchasing(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('로그인이 필요합니다');
        setIsPurchasing(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', user.id)
        .single();

      const paymentId = `pay-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey:
          process.env.NEXT_PUBLIC_PORTONE_PAYMENT_CHANNEL_KEY!,
        paymentId,
        orderName: `온리 하트 ${pkg.amount}개`,
        totalAmount: pkg.price,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
        customer: {
          fullName: profile?.name || undefined,
          email: user.email || undefined,
          phoneNumber: profile?.phone || undefined,
        },
        windowType: {
          pc: 'IFRAME',
          mobile: 'REDIRECTION',
        },
        redirectUrl: `${window.location.origin}/my/hearts?paymentId=${paymentId}`,
      });

      if (!response || response.code != null) {
        if (response?.code === 'USER_CANCELLED') {
          setIsPurchasing(false);
          return;
        }
        throw new Error(response?.message || '결제에 실패했습니다');
      }

      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      const result = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(result.error || '결제 검증에 실패했습니다');
      }

      setBalance(result.balance);
      setSelectedPkg(null);
      toast.success(`하트 ${pkg.amount}개가 충전되었어요`, {
        icon: <Heart size={16} className="fill-gold text-gold" />,
      });

      const { data: txData } = await supabase
        .from('heart_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (txData) setTransactions(txData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '결제에 실패했습니다';
      toast.error(message);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <HeartPlus size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              하트 충전
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-10">
        {/* 현재 잔액 */}
        <section className="flex items-center justify-center gap-3 rounded-2xl bg-surface-secondary py-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
            <Heart size={24} className="fill-gold text-gold" />
          </div>
          <div>
            <p className="text-xs text-foreground/40">보유 하트</p>
            <p className="text-3xl font-bold text-foreground">
              {balance}
              <span className="ml-1 text-sm font-normal text-foreground/40">
                개
              </span>
            </p>
          </div>
        </section>

        {/* 충전 패키지 */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            충전하기
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {HEART_PACKAGES.map((pkg) => {
              const Icon = pkg.icon;
              const isSelected = selectedPkg === pkg.id;
              const unitPrice = Math.round(pkg.price / pkg.amount);

              return (
                <button
                  key={pkg.id}
                  onClick={() =>
                    setSelectedPkg(isSelected ? null : pkg.id)
                  }
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition-all ${
                    isSelected
                      ? 'border-gold bg-gold/5 ring-1 ring-gold/30'
                      : 'border-line bg-surface-secondary hover:border-line'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-ink">
                      인기
                    </span>
                  )}
                  {pkg.best && (
                    <span className="absolute -top-2.5 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-ink">
                      BEST
                    </span>
                  )}

                  <Icon
                    size={22}
                    className={
                      isSelected
                        ? 'fill-gold text-gold'
                        : 'text-foreground-soft'
                    }
                  />
                  <div className="text-center">
                    <p
                      className={`text-lg font-bold ${isSelected ? 'text-gold' : 'text-foreground'}`}
                    >
                      {pkg.amount}
                      <span className="ml-0.5 text-xs font-normal text-foreground/40">
                        개
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/40">
                      {pkg.label}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${isSelected ? 'text-gold' : 'text-foreground/60'}`}
                  >
                    ₩{pkg.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-foreground-dim">
                    개당 ₩{unitPrice}
                  </p>

                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold">
                      <Check size={12} className="text-ink" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 하트 획득 방법 안내 */}
        <section className="rounded-2xl bg-surface-secondary p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-foreground/60">
            <Gift size={13} className="text-gold/60" />
            무료로 하트 받는 방법
          </h3>
          <div className="space-y-2.5">
            <FreeHeartItem
              icon={<CalendarCheck size={14} />}
              title="매일 출석체크"
              desc="하트 1개 (연속 보너스 최대 +3)"
            />
            <FreeHeartItem
              icon={<Sparkles size={14} />}
              title="프로필 완성도 100%"
              desc="하트 3개 보상 (1회)"
            />
            <FreeHeartItem
              icon={<Heart size={14} />}
              title="시그널 수락됨"
              desc="하트 1개 환급"
            />
          </div>
        </section>

        {/* 사용 내역 */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Clock size={14} className="text-foreground-soft" />
            사용 내역
          </h2>
          <div className="overflow-hidden rounded-2xl bg-surface-secondary">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2
                  size={20}
                  className="animate-spin text-gold"
                />
              </div>
            ) : transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-foreground-dim">
                아직 사용 내역이 없어요
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3 not-last:border-b not-last:border-line"
                >
                  <div>
                    <p className="text-sm text-foreground/70">
                      {TYPE_LABELS[tx.type] ||
                        tx.description ||
                        tx.type}
                    </p>
                    <p className="text-[10px] text-foreground-dim">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.amount > 0
                        ? 'text-gold'
                        : 'text-foreground/40'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 하단 구매 버튼 */}
      <div className="sticky bottom-0 bg-background px-5 pt-2 pb-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedPkg || isPurchasing}
          onClick={handlePurchase}
        >
          {isPurchasing ? (
            '충전 중...'
          ) : selectedPkg ? (
            <>
              <Heart size={18} className="fill-ink" />₩
              {HEART_PACKAGES.find(
                (p) => p.id === selectedPkg,
              )?.price.toLocaleString()}{' '}
              충전하기
            </>
          ) : (
            '패키지를 선택해주세요'
          )}
        </Button>
      </div>
    </div>
  );
}

function FreeHeartItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-gold/50">{icon}</span>
      <div>
        <p className="text-xs font-medium text-foreground/60">
          {title}
        </p>
        <p className="text-[10px] text-foreground-soft">{desc}</p>
      </div>
    </div>
  );
}
