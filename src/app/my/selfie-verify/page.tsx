'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  ShieldCheck,
  Camera,
  Check,
  RefreshCw,
  Loader2,
  Clock,
  Eye,
  UserCheck,
  Lock,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step =
  | 'intro'
  | 'capture'
  | 'confirm'
  | 'processing'
  | 'submitted';

export default function SelfieVerifyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('intro');
  const [selfieUrl, setSelfieUrl] = useState('');

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelfieUrl(url);
    setStep('confirm');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRetake = () => {
    setSelfieUrl('');
    setStep('capture');
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleSubmit = async () => {
    setStep('processing');
    await new Promise((r) => setTimeout(r, 1500));
    setStep('submitted');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-navy">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-navy">
        <div className="flex items-center gap-3 px-5 pt-12 pb-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-1.5 text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-cream">
            셀카 인증
          </h1>
        </div>
        <div className="h-px bg-navy-light" />
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleCapture}
      />

      <div className="flex flex-1 flex-col">
        {/* ① 안내 화면 */}
        {step === 'intro' && (
          <div className="flex flex-1 flex-col px-6 pt-8 pb-8">
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
                <ShieldCheck size={36} className="text-gold" />
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-cream">
                  셀카로 나를 인증해요
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-cream/50">
                  프로필 사진과 실제 얼굴이 같은지 확인해요.
                  <br />
                  인증이 완료되면 프로필에 뱃지가 표시됩니다.
                </p>
              </div>

              <div className="mt-4 w-full space-y-3">
                <GuideItem
                  icon={<Eye size={16} />}
                  title="정면을 바라봐주세요"
                  desc="얼굴이 잘 보이도록 밝은 곳에서 촬영해요"
                />
                <GuideItem
                  icon={<UserCheck size={16} />}
                  title="본인 얼굴만 나오게"
                  desc="다른 사람이나 사진 속 사진은 인정되지 않아요"
                />
                <GuideItem
                  icon={<Lock size={16} />}
                  title="안전하게 보관돼요"
                  desc="인증 사진은 검증 후 즉시 삭제됩니다"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setStep('capture');
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
            >
              <Camera size={18} />
              셀카 촬영하기
            </Button>
          </div>
        )}

        {/* ② 촬영 (파일 선택 후 자동으로 ③으로 이동) */}
        {step === 'capture' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-dashed border-gold/30 bg-cream/3">
              <Camera size={48} className="text-cream/20" />
            </div>
            <p className="text-sm text-cream/40">
              카메라가 열리지 않았나요?
            </p>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              다시 촬영하기
            </Button>
          </div>
        )}

        {/* ③ 촬영 결과 확인 */}
        {step === 'confirm' && selfieUrl && (
          <div className="flex flex-1 flex-col px-6 pt-6 pb-8">
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              <div className="relative h-64 w-64 overflow-hidden rounded-3xl border-2 border-gold/20 shadow-lg">
                <Image
                  src={selfieUrl}
                  alt="셀카"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="text-center">
                <h2 className="text-lg font-bold text-cream">
                  이 사진으로 인증할까요?
                </h2>
                <p className="mt-1 text-xs text-cream/40">
                  얼굴이 잘 보이는지 확인해주세요
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-cream/10 py-3.5 text-sm font-medium text-cream/60 transition-colors hover:bg-cream/5"
              >
                <RefreshCw size={16} />
                다시 촬영
              </button>
              <button
                onClick={handleSubmit}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gold py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90 active:scale-[0.98]"
              >
                <Check size={16} />
                인증하기
              </button>
            </div>
          </div>
        )}

        {/* ④ 검토 중 */}
        {step === 'processing' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
              <Loader2 size={32} className="animate-spin text-gold" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-cream">
                검토 중이에요
              </h2>
              <p className="mt-1 text-sm text-cream/40">
                잠시만 기다려주세요...
              </p>
            </div>
          </div>
        )}

        {/* ⑤ 접수 완료 (관리자 검토 대기) */}
        {step === 'submitted' && (
          <div className="flex flex-1 flex-col px-6 pt-8 pb-8">
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15">
                <Send size={36} className="text-gold" />
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-cream">
                  인증 요청이 접수되었어요
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-cream/50">
                  관리자가 프로필 사진과 셀카를 비교해서
                  <br />
                  확인할 예정이에요. 보통 24시간 이내 완료돼요.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-cream/5 px-4 py-2.5">
                <Clock size={14} className="text-cream/40" />
                <span className="text-xs text-cream/50">
                  검토까지 약 24시간 소요
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => router.push('/my?verification=pending')}
            >
              마이페이지로 돌아가기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function GuideItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-cream/3 px-4 py-3">
      <span className="mt-0.5 text-gold/60">{icon}</span>
      <div>
        <p className="text-sm font-medium text-cream/80">{title}</p>
        <p className="mt-0.5 text-xs text-cream/35">{desc}</p>
      </div>
    </div>
  );
}
