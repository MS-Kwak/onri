'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldAlert,
  MapPin,
  Sparkles,
  HeartHandshake,
  UserRound,
  Lock,
  Camera,
  X,
  ImagePlus,
  Star,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useEmblaCarousel from 'embla-carousel-react';
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
const REGIONS = [
  '서울',
  '경기',
  '부산',
  '인천',
  '대전',
  '대구',
  '광주',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
];

const STEPS = [
  { label: '본인인증', done: true },
  { label: '프로필 설정', done: false },
  { label: '완료', done: false },
];
const CURRENT_STEP = 1;

export default function ProfileSetupPage() {
  const router = useRouter();

  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState('');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [otherIdentity, setOtherIdentity] = useState('');
  const [goals, setGoals] = useState<RelationGoal[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<{
    region: Visibility;
    age: Visibility;
  }>({
    region: 'public',
    age: 'public',
  });
  const [sensitiveAgreed, setSensitiveAgreed] = useState(false);

  const MAX_PHOTOS = 6;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const newPhotos = Array.from(files)
      .slice(0, remaining)
      .map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPhotos((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const toggleGoal = (goal: RelationGoal) => {
    setGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal],
    );
  };

  const toggleVisibility = (field: 'region' | 'age') => {
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
    regions.length > 0 &&
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
        {/* 프로필 사진 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <Camera size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-cream">
              프로필 사진
            </h2>
          </div>
          <p className="mb-4 text-xs text-cream/50">
            최대 {MAX_PHOTOS}장까지 등록할 수 있어요 (선택)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoAdd}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <SortablePhotoItem
                    key={src}
                    id={src}
                    src={src}
                    index={i}
                    onRemove={() => handlePhotoRemove(i)}
                  />
                ))}

                {photos.length < MAX_PHOTOS && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-cream/15 transition-colors hover:border-gold/30 hover:bg-cream/3"
                  >
                    <ImagePlus size={20} className="text-cream/25" />
                    <span className="text-[10px] text-cream/25">
                      {photos.length}/{MAX_PHOTOS}
                    </span>
                  </button>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </section>

        {/* 닉네임 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <UserRound size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-cream">
              닉네임
            </h2>
          </div>
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
        <section className="-mx-6">
          <div className="mb-1 flex items-center gap-1.5 px-6">
            <Sparkles size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-cream">
              나를 어떻게 표현할까요?
            </h2>
          </div>
          <p className="mb-4 px-6 text-xs text-cream/50">
            하나를 선택해주세요
          </p>
          <PillCarousel>
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
          </PillCarousel>
          {identity === 'OTHER' && (
            <div className="mt-3 px-6">
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
        <section className="-mx-6">
          <div className="mb-1 flex items-center gap-1.5 px-6">
            <HeartHandshake size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-cream">
              무엇을 찾고 있나요?
            </h2>
          </div>
          <p className="mb-4 px-6 text-xs text-cream/50">
            복수 선택 가능
          </p>
          <PillCarousel>
            {GOALS.map((goal) => (
              <Pill
                key={goal}
                label={RELATION_GOAL_LABELS[goal]}
                variant="identity"
                selected={goals.includes(goal)}
                onPress={() => toggleGoal(goal)}
              />
            ))}
          </PillCarousel>
        </section>

        {/* 지역 선택 */}
        <section className="-mx-6">
          <div className="mb-1 flex items-center gap-1.5 px-6">
            <MapPin size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-cream">
              지역
            </h2>
          </div>
          <p className="mb-4 px-6 text-xs text-cream/50">
            활동하는 지역을 선택해주세요 (복수 선택 가능)
          </p>
          <PillCarousel>
            {REGIONS.map((r) => (
              <Pill
                key={r}
                label={r}
                variant="identity"
                selected={regions.includes(r)}
                onPress={() =>
                  setRegions((prev) =>
                    prev.includes(r)
                      ? prev.filter((v) => v !== r)
                      : [...prev, r],
                  )
                }
              />
            ))}
          </PillCarousel>
        </section>

        {/* 노출 범위 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <Lock size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-cream">
              공개 범위
            </h2>
          </div>
          <p className="mb-4 text-xs text-cream/50">
            각 항목의 공개/비공개를 직접 제어할 수 있어요
          </p>
          <div className="flex flex-col gap-3">
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
            <button
              onClick={() => toggleVisibility('age')}
              className="flex items-center justify-between rounded-xl border border-navy-light bg-navy-light px-4 py-3 transition-colors hover:border-gold-soft/50"
            >
              <span className="text-sm text-cream">나이</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-cream/50">
                  {visibility.age === 'public' ? '공개' : '비공개'}
                </span>
                {visibility.age === 'public' ? (
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

function SortablePhotoItem({
  id,
  src,
  index,
  onRemove,
}: {
  id: string;
  src: string;
  index: number;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-xl border border-navy-light"
      {...attributes}
      {...listeners}
    >
      <Image
        src={src}
        alt={`사진 ${index + 1}`}
        fill
        className="object-cover"
      />
      {index === 0 && (
        <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-navy">
          <Star size={9} className="fill-navy" />
          대표
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy/70 text-cream/70 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  );
}

function PillCarousel({ children }: { children: React.ReactNode }) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
    align: 'start',
  });

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-2 pl-6">
        {children}
        <div className="shrink-0 w-6" />
      </div>
    </div>
  );
}
