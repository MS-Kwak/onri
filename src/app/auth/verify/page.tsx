'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import {
  ChevronDown,
  Check,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const CARRIERS = [
  'SKT',
  'KT',
  'LG U+',
  'SKT 알뜰폰',
  'KT 알뜰폰',
  'LG U+ 알뜰폰',
];

export default function VerifyPage() {
  const router = useRouter();

  const [carrier, setCarrier] = useState('');
  const [name, setName] = useState('');
  const [birthPrefix, setBirthPrefix] = useState('');
  const [genderDigit, setGenderDigit] = useState('');
  const [phone, setPhone] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [timer, setTimer] = useState(0);

  const canRequestCode =
    carrier &&
    name &&
    birthPrefix.length === 6 &&
    genderDigit.length === 1 &&
    phone.length >= 10;
  const canProceed = codeSent && verifyCode.length === 6 && agreed;

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleRequestCode = () => {
    setCodeSent(true);
    setTimer(180);
    toast.success('인증번호가 발송되었습니다', {
      description: '3분 내에 입력해주세요.',
    });
  };

  const handleResend = () => {
    setTimer(180);
    setVerifyCode('');
    toast('인증번호를 다시 발송했습니다');
  };

  const handleNext = () => {
    router.push('/onboarding/profile');
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <main className="flex min-h-dvh flex-col bg-navy">
      {/* 고정 헤더 + 프로그레스 */}
      <div className="sticky top-0 z-40 bg-navy">
        <header className="flex items-center gap-3 px-5 pt-14 pb-2">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-cream">
            본인인증
          </h1>
        </header>

        <div className="px-6 pt-2 pb-4">
          <div className="flex gap-1.5">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div className="h-1 w-full rounded-full bg-gold" />
              <span className="text-[10px] text-gold">본인인증</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div className="h-1 w-full rounded-full bg-navy-light" />
              <span className="text-[10px] text-cream/30">
                프로필 설정
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div className="h-1 w-full rounded-full bg-navy-light" />
              <span className="text-[10px] text-cream/30">완료</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-navy-light" />
      </div>

      {/* 안내 */}
      <div className="flex items-start gap-2.5 px-6 pt-6 pb-6">
        <ShieldCheck
          size={18}
          className="mt-0.5 shrink-0 text-gold"
        />
        <p className="text-sm leading-relaxed text-cream/60">
          만 19세 이상만 가입할 수 있습니다.
          <br />
          휴대폰 본인인증이 필요합니다.
        </p>
      </div>

      {/* 폼 */}
      <div className="flex flex-1 flex-col gap-4 px-6">
        {/* 통신사 선택 (Radix Select) */}
        <Select.Root value={carrier} onValueChange={setCarrier}>
          <Select.Trigger className="flex w-full items-center justify-between rounded-xl border border-navy-light bg-navy-light px-4 py-3 text-sm text-cream outline-none transition-colors data-placeholder:text-gray hover:border-gold-soft/50 focus:border-gold-soft">
            <Select.Value placeholder="통신사 선택" />
            <Select.Icon>
              <ChevronDown size={16} className="text-gray" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="overflow-hidden rounded-xl border border-navy-light bg-navy-light shadow-xl"
              position="popper"
              sideOffset={4}
            >
              <Select.Viewport className="p-1.5">
                {CARRIERS.map((c) => (
                  <Select.Item
                    key={c}
                    value={c}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cream outline-none transition-colors data-highlighted:bg-gold/10 data-highlighted:text-gold"
                  >
                    <Select.ItemText>{c}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={14} className="text-gold" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* 이름 */}
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-navy-light bg-navy-light px-4 py-3 text-sm text-cream outline-none placeholder:text-gray transition-colors hover:border-gold-soft/50 focus:border-gold-soft"
        />

        {/* 주민번호 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="생년월일 6자리"
            maxLength={6}
            value={birthPrefix}
            onChange={(e) =>
              setBirthPrefix(e.target.value.replace(/\D/g, ''))
            }
            className="min-w-0 flex-1 rounded-xl border border-navy-light bg-navy-light px-4 py-3 text-sm text-cream outline-none placeholder:text-gray transition-colors hover:border-gold-soft/50 focus:border-gold-soft"
          />
          <span className="shrink-0 text-cream/30">—</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            placeholder="●"
            value={genderDigit}
            onChange={(e) =>
              setGenderDigit(e.target.value.replace(/\D/g, ''))
            }
            className="w-10 shrink-0 rounded-xl border border-navy-light bg-navy-light px-2 py-3 text-center text-sm text-cream outline-none placeholder:text-gray transition-colors hover:border-gold-soft/50 focus:border-gold-soft"
          />
          <span className="shrink-0 whitespace-nowrap text-sm text-cream/25">
            ● ● ● ● ● ●
          </span>
        </div>

        {/* 휴대폰 번호 */}
        <input
          type="tel"
          inputMode="numeric"
          placeholder="휴대폰 번호 (- 없이)"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, ''))
          }
          className="w-full rounded-xl border border-navy-light bg-navy-light px-4 py-3 text-sm text-cream outline-none placeholder:text-gray transition-colors hover:border-gold-soft/50 focus:border-gold-soft"
        />

        {/* 인증번호 요청 / 입력 */}
        {!codeSent ? (
          <Button
            variant="primary"
            fullWidth
            disabled={!canRequestCode}
            onClick={handleRequestCode}
          >
            인증번호 요청
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                placeholder="인증번호 6자리"
                maxLength={6}
                value={verifyCode}
                onChange={(e) =>
                  setVerifyCode(e.target.value.replace(/\D/g, ''))
                }
                className="w-full rounded-xl border border-navy-light bg-navy-light px-4 py-3 pr-16 text-sm text-cream outline-none placeholder:text-gray transition-colors hover:border-gold-soft/50 focus:border-gold-soft"
              />
              {timer > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gold">
                  {formatTime(timer)}
                </span>
              )}
            </div>
            <button
              onClick={handleResend}
              className="shrink-0 rounded-xl border border-navy-light p-3 text-gray transition-colors hover:border-gold-soft/50 hover:text-gold"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* 약관 동의 (Radix Checkbox) */}
        <div className="mt-2 flex items-start gap-2.5">
          <Checkbox.Root
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border border-gray/50 transition-colors data-[state=checked]:border-gold data-[state=checked]:bg-gold"
          >
            <Checkbox.Indicator>
              <Check size={12} className="text-navy" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span className="cursor-pointer text-xs leading-relaxed text-cream/50">
            본인확인 서비스 이용약관, 개인정보 수집·이용 동의
            (민감정보 포함)
          </span>
        </div>
      </div>

      {/* 하단 다음 버튼 */}
      <div className="px-6 pb-8 pt-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canProceed}
          onClick={handleNext}
        >
          다음
        </Button>
      </div>
    </main>
  );
}
