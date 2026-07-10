'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { Identity, RelationGoal, Visibility } from '@/types';
import {
  IDENTITY_LABELS,
  RELATION_GOAL_LABELS,
} from '@/lib/constants';

const IDENTITIES: Identity[] = [
  'FTM',
  'MTF',
  'NONBINARY',
  'TRANS',
  'CIS',
  'OTHER',
];
const GOALS: RelationGoal[] = ['DATING', 'FRIEND', 'INFO'];

const STEPS = [
  { label: '본인인증', done: true },
  { label: '프로필 설정', done: false },
  { label: '완료', done: false },
];
const CURRENT_STEP = 1;

export default function ProfileSetupPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [otherIdentity, setOtherIdentity] = useState('');
  const [goals, setGoals] = useState<RelationGoal[]>([]);
  const [visibility, setVisibility] = useState<{
    identity: Visibility;
    region: Visibility;
  }>({
    identity: 'private',
    region: 'public',
  });
  const [sensitiveAgreed, setSensitiveAgreed] = useState(false);

  const toggleGoal = (goal: RelationGoal) => {
    setGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal],
    );
  };

  const toggleVisibility = (field: 'identity' | 'region') => {
    setVisibility((prev) => ({
      ...prev,
      [field]: prev[field] === 'public' ? 'private' : 'public',
    }));
  };

  const nicknameValid =
    nickname.trim().length >= 2 && nickname.trim().length <= 10;
  const identityValid =
    identity &&
    (identity !== 'OTHER' || otherIdentity.trim().length > 0);
  const canProceed =
    nicknameValid &&
    identityValid &&
    goals.length > 0 &&
    sensitiveAgreed;

  const handleNext = () => {
    router.push('/onboarding/complete');
  };

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
            프로필 설정
          </h1>
        </header>

        {/* 프로그레스 바 (단계 라벨 포함) */}
        <div className="px-6 pt-2 pb-4">
          <div className="flex gap-1.5">
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className={`h-1 w-full rounded-full ${
                    i <= CURRENT_STEP ? 'bg-gold' : 'bg-navy-light'
                  }`}
                />
                <span
                  className={`text-[10px] ${
                    i <= CURRENT_STEP ? 'text-gold' : 'text-cream/30'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-navy-light" />
      </div>

      {/* 스크롤 컨텐츠 */}
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pt-6 pb-4">
        {/* 닉네임 */}
        <section>
          <h2 className="mb-1 text-base font-semibold text-cream">
            닉네임
          </h2>
          <p className="mb-4 text-xs text-cream/50">
            온리에서 사용할 이름이에요 (2~10자)
          </p>
          <Input
            placeholder="닉네임을 입력해주세요"
            maxLength={10}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            error={
              nickname.length > 0 && nickname.trim().length < 2
                ? '2자 이상 입력해주세요'
                : undefined
            }
          />
        </section>

        {/* 정체성 선택 */}
        <section>
          <h2 className="mb-1 text-base font-semibold text-cream">
            나를 어떻게 표현할까요?
          </h2>
          <p className="mb-4 text-xs text-cream/50">
            하나를 선택해주세요
          </p>
          <div className="flex flex-wrap gap-2">
            {IDENTITIES.map((id) => (
              <Pill
                key={id}
                label={IDENTITY_LABELS[id]}
                variant="identity"
                selected={identity === id}
                onPress={() => {
                  setIdentity(id);
                  if (id !== 'OTHER') setOtherIdentity('');
                }}
              />
            ))}
          </div>
          {identity === 'OTHER' && (
            <div className="mt-3">
              <Input
                placeholder="어떻게 표현하고 싶은지 알려주세요"
                value={otherIdentity}
                onChange={(e) => setOtherIdentity(e.target.value)}
                error={
                  identity === 'OTHER' && otherIdentity.trim() === ''
                    ? '필수 입력 항목입니다'
                    : undefined
                }
              />
            </div>
          )}
        </section>

        {/* 관계 목적 */}
        <section>
          <h2 className="mb-1 text-base font-semibold text-cream">
            무엇을 찾고 있나요?
          </h2>
          <p className="mb-4 text-xs text-cream/50">복수 선택 가능</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((goal) => (
              <Pill
                key={goal}
                label={RELATION_GOAL_LABELS[goal]}
                variant="active"
                selected={goals.includes(goal)}
                onPress={() => toggleGoal(goal)}
              />
            ))}
          </div>
        </section>

        {/* 노출 범위 */}
        <section>
          <h2 className="mb-1 text-base font-semibold text-cream">
            공개 범위
          </h2>
          <p className="mb-4 text-xs text-cream/50">
            각 항목의 공개/비공개를 직접 제어할 수 있어요
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleVisibility('identity')}
              className="flex items-center justify-between rounded-xl border border-navy-light bg-navy-light px-4 py-3 transition-colors hover:border-gold-soft/50"
            >
              <span className="text-sm text-cream">정체성</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-cream/50">
                  {visibility.identity === 'public'
                    ? '공개'
                    : '비공개'}
                </span>
                {visibility.identity === 'public' ? (
                  <Eye size={16} className="text-gold" />
                ) : (
                  <EyeOff size={16} className="text-gray" />
                )}
              </div>
            </button>
            <button
              onClick={() => toggleVisibility('region')}
              className="flex items-center justify-between rounded-xl border border-navy-light bg-navy-light px-4 py-3 transition-colors hover:border-gold-soft/50"
            >
              <span className="text-sm text-cream">지역</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-cream/50">
                  {visibility.region === 'public' ? '공개' : '비공개'}
                </span>
                {visibility.region === 'public' ? (
                  <Eye size={16} className="text-gold" />
                ) : (
                  <EyeOff size={16} className="text-gray" />
                )}
              </div>
            </button>
          </div>
        </section>

        {/* 민감정보 동의 */}
        <section className="rounded-xl border border-navy-light bg-navy-light/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-gold" />
            <span className="text-sm font-medium text-cream">
              민감정보 수집 동의
            </span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-cream/50">
            성정체성·성적 지향은 개인정보보호법상 민감정보에
            해당합니다. 안전한 매칭을 위해 별도의 명시적 동의가
            필요하며, 암호화하여 저장됩니다.
          </p>
          <Checkbox
            checked={sensitiveAgreed}
            onCheckedChange={setSensitiveAgreed}
            label="민감정보 수집 및 이용에 동의합니다"
          />
        </section>
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
