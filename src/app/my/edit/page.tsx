'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  Pencil,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
  HeartHandshake,
  UserRound,
  Lock,
  Camera,
  X,
  ImagePlus,
  Star,
  MessageSquareText,
  Ruler,
  Clock,
  Hash,
  Plus,
  Check,
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
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Input } from '@/components/ui/input';
import { MOCK_CURRENT_USER } from '@/data/mock-profiles';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
const ACTIVE_TIMES = ['오전', '오후', '저녁', '밤'];
const INTEREST_SUGGESTIONS = [
  '음악',
  '영화',
  '독서',
  '산책',
  '요리',
  '카페',
  '사진',
  '여행',
  '운동',
  '게임',
  '그림',
  '등산',
  '자전거',
  '넷플릭스',
  '디저트',
  '코딩',
  '고양이',
  '강아지',
  '명상',
  '요가',
];

export default function ProfileEditPage() {
  const router = useRouter();
  const profile = MOCK_CURRENT_USER;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [nickname, setNickname] = useState(profile.nickname);
  const [bio, setBio] = useState(profile.bio);
  const [identity, setIdentity] = useState<Identity>(
    profile.identity,
  );
  const [otherIdentity, setOtherIdentity] = useState('');
  const [goals, setGoals] = useState<RelationGoal[]>([
    ...profile.lookingFor,
  ]);
  const [regions, setRegions] = useState<string[]>([profile.region]);
  const [height, setHeight] = useState(
    profile.height?.toString() ?? '',
  );
  const [weight, setWeight] = useState(
    profile.weight?.toString() ?? '',
  );
  const [activeTimes, setActiveTimes] = useState<string[]>([
    ...profile.activeTime,
  ]);
  const [interests, setInterests] = useState<string[]>([
    ...profile.interests,
  ]);
  const [newInterest, setNewInterest] = useState('');
  const [visibility, setVisibility] = useState<{
    region: Visibility;
    age: Visibility;
  }>({ ...profile.visibility });

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

  const addInterest = (tag: string) => {
    const trimmed = tag.trim();
    if (
      !trimmed ||
      interests.includes(trimmed) ||
      interests.length >= 10
    )
      return;
    setInterests((prev) => [...prev, trimmed]);
    setNewInterest('');
  };

  const removeInterest = (tag: string) => {
    setInterests((prev) => prev.filter((t) => t !== tag));
  };

  const nicknameValid =
    nickname.trim().length >= 2 && nickname.trim().length <= 10;
  const canSave =
    photos.length >= 1 &&
    nicknameValid &&
    identity &&
    goals.length > 0 &&
    regions.length > 0;

  const handleSave = () => {
    toast.success('프로필이 저장되었어요');
    router.back();
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
            <Pencil size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              프로필 편집
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pt-6 pb-10">
        {/* 프로필 사진 */}
        <Section
          icon={<Camera size={16} />}
          title="프로필 사진"
          desc={`최소 1장 필수 · 최대 ${MAX_PHOTOS}장 · 드래그로 순서 변경`}
        >
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
                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line transition-colors hover:border-gold/30 hover:bg-foreground/8"
                  >
                    <ImagePlus
                      size={20}
                      className="text-foreground-soft"
                    />
                    <span className="text-[10px] text-foreground-soft">
                      {photos.length}/{MAX_PHOTOS}
                    </span>
                  </button>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </Section>

        {/* 닉네임 */}
        <Section
          icon={<UserRound size={16} />}
          title="닉네임"
          desc="2~10자"
        >
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
        </Section>

        {/* 자기소개 */}
        <Section
          icon={<MessageSquareText size={16} />}
          title="자기소개"
          desc="나를 한 줄로 표현해주세요"
        >
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={100}
            rows={3}
            placeholder="자유롭게 작성해주세요"
            className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
          />
          <p className="mt-1 text-right text-[10px] text-foreground-dim">
            {bio.length}/100
          </p>
        </Section>

        {/* 키 / 몸무게 */}
        <Section
          icon={<Ruler size={16} />}
          title="신체 정보"
          desc="선택 사항이에요 · 비공개 가능"
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-foreground/40">
                키
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="-"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-10 text-sm text-foreground placeholder:text-foreground-dim focus:border-gold-soft/50 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-foreground-soft">
                  cm
                </span>
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-foreground/40">
                몸무게
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="-"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 pr-10 text-sm text-foreground placeholder:text-foreground-dim focus:border-gold-soft/50 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-foreground-soft">
                  kg
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* 정체성 */}
        <div className="-mx-6">
          <Section
            icon={<Sparkles size={16} />}
            title="정체성"
            desc="하나를 선택해주세요"
            className="px-6"
          >
            <div />
          </Section>
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
              />
            </div>
          )}
        </div>

        {/* 관계 목적 */}
        <div className="-mx-6">
          <Section
            icon={<HeartHandshake size={16} />}
            title="관계 목적"
            desc="복수 선택 가능"
            className="px-6"
          >
            <div />
          </Section>
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
        </div>

        {/* 지역 */}
        <div className="-mx-6">
          <Section
            icon={<MapPin size={16} />}
            title="지역"
            desc="복수 선택 가능"
            className="px-6"
          >
            <div />
          </Section>
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
        </div>

        {/* 활동 시간 */}
        <div className="-mx-6">
          <Section
            icon={<Clock size={16} />}
            title="활동 시간"
            desc="주로 접속하는 시간대 (복수 선택 가능)"
            className="px-6"
          >
            <div />
          </Section>
          <PillCarousel>
            {ACTIVE_TIMES.map((time) => (
              <Pill
                key={time}
                label={time}
                variant="identity"
                selected={activeTimes.includes(time)}
                onPress={() =>
                  setActiveTimes((prev) =>
                    prev.includes(time)
                      ? prev.filter((t) => t !== time)
                      : [...prev, time],
                  )
                }
              />
            ))}
          </PillCarousel>
        </div>

        {/* 관심사 */}
        <Section
          icon={<Hash size={16} />}
          title="관심사"
          desc={`최대 10개 · ${interests.length}/10`}
        >
          {interests.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold"
                >
                  {tag}
                  <button
                    onClick={() => removeInterest(tag)}
                    className="text-gold/50 hover:text-gold"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {interests.length < 10 && (
            <div className="flex gap-2">
              <Input
                placeholder="관심사 입력"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    addInterest(newInterest);
                  }
                }}
              />
              <button
                onClick={() => addInterest(newInterest)}
                disabled={!newInterest.trim()}
                className="shrink-0 rounded-xl bg-gold/10 px-3 text-gold transition-colors hover:bg-gold/15 disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>
          )}

          {interests.length < 10 && (
            <div className="mt-3">
              <p className="mb-2 text-[10px] text-foreground-dim">
                추천 관심사
              </p>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_SUGGESTIONS.filter(
                  (s) => !interests.includes(s),
                )
                  .slice(0, 12)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addInterest(tag)}
                      className="rounded-full border border-line px-2.5 py-1 text-[11px] text-foreground/35 transition-colors hover:border-gold/20 hover:text-gold/60"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </Section>

        {/* 공개 범위 */}
        <Section
          icon={<Lock size={16} />}
          title="공개 범위"
          desc="각 항목의 공개/비공개를 설정해요"
        >
          <div className="flex flex-col gap-3">
            <VisibilityRow
              label="지역"
              value={visibility.region}
              onToggle={() => toggleVisibility('region')}
            />
            <VisibilityRow
              label="나이"
              value={visibility.age}
              onToggle={() => toggleVisibility('age')}
            />
          </div>
        </Section>
      </div>

      {/* 하단 저장 버튼 (모바일용) */}
      <div className="sticky bottom-0 bg-background px-6 pt-2 pb-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSave}
          onClick={handleSave}
        >
          <Check size={18} />
          저장하기
        </Button>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-gold/60">{icon}</span>
        <h2 className="text-base font-semibold text-foreground">
          {title}
        </h2>
      </div>
      {desc && (
        <p className="mb-4 text-xs text-foreground/50">{desc}</p>
      )}
      {children}
    </section>
  );
}

function VisibilityRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: Visibility;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-gold-soft/50"
    >
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-foreground/50">
          {value === 'public' ? '공개' : '비공개'}
        </span>
        {value === 'public' ? (
          <Eye size={16} className="text-gold" />
        ) : (
          <EyeOff size={16} className="text-gray" />
        )}
      </div>
    </button>
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
      className="group relative aspect-square overflow-hidden rounded-xl border border-line"
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
        <span className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-ink">
          <Star size={9} className="fill-ink" />
          대표
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/70 text-foreground/70 opacity-0 transition-opacity group-hover:opacity-100"
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
        <div className="w-6 shrink-0" />
      </div>
    </div>
  );
}
