'use client';

import { useState, useRef, useCallback } from 'react';
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
  MessageSquareText,
  Ruler,
  Clock,
  Hash,
  Plus,
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
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { createClient } from '@/lib/supabase';
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

const STEPS = [
  { label: '본인인증', done: true },
  { label: '프로필 설정', done: false },
  { label: '완료', done: false },
];
const CURRENT_STEP = 1;

export default function ProfileSetupPage() {
  const router = useRouter();

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nicknameDup, setNicknameDup] = useState<boolean | null>(
    null,
  );
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const nicknameDupTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const checkNicknameDuplicate = useCallback(
    async (value: string) => {
      if (value.trim().length < 2) {
        setNicknameDup(null);
        return;
      }
      setNicknameChecking(true);
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('nickname', value.trim())
        .maybeSingle();

      setNicknameDup(!!data);
      setNicknameChecking(false);
    },
    [],
  );

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameDup(null);
    if (nicknameDupTimer.current)
      clearTimeout(nicknameDupTimer.current);
    if (value.trim().length >= 2) {
      nicknameDupTimer.current = setTimeout(
        () => checkNicknameDuplicate(value),
        500,
      );
    }
  };
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
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activeTimes, setActiveTimes] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [sensitiveAgreed, setSensitiveAgreed] = useState(false);

  const MAX_PHOTOS = 6;
  const ACTIVE_TIMES = [
    '아침',
    '오전',
    '점심',
    '오후',
    '저녁',
    '밤',
    '새벽',
  ];
  const MAX_INTERESTS = 10;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const selected = Array.from(files).slice(0, remaining);
    const newPhotos = selected.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setPhotoFiles((prev) => [...prev, ...selected]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPhotos((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        setPhotoFiles((pf) => arrayMove(pf, oldIndex, newIndex));
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

  const addInterest = (value: string) => {
    const trimmed = value.trim();
    if (
      trimmed &&
      !interests.includes(trimmed) &&
      interests.length < MAX_INTERESTS
    ) {
      setInterests((prev) => [...prev, trimmed]);
    }
    setNewInterest('');
  };

  const removeInterest = (value: string) => {
    setInterests((prev) => prev.filter((i) => i !== value));
  };

  const toggleVisibility = (field: 'region' | 'age') => {
    setVisibility((prev) => ({
      ...prev,
      [field]: prev[field] === 'public' ? 'private' : 'public',
    }));
  };

  const nicknameValid =
    nickname.trim().length >= 2 &&
    nickname.trim().length <= 10 &&
    nicknameDup === false;
  const identityValid =
    identity &&
    (identity !== 'OTHER' || otherIdentity.trim().length > 0);
  const canProceed =
    photos.length >= 1 &&
    nicknameValid &&
    identityValid &&
    goals.length > 0 &&
    regions.length > 0 &&
    sensitiveAgreed;

  const handleNext = async () => {
    if (!canProceed || saving) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nickname: nickname.trim(),
          identity: identity!,
          identity_other:
            identity === 'OTHER' ? otherIdentity.trim() : null,
          looking_for: goals,
          region: regions[0],
          bio: bio.trim() || null,
          height: height ? parseInt(height) : null,
          weight: weight ? parseInt(weight) : null,
          active_time: activeTimes,
          interests,
          visibility_region: visibility.region,
          visibility_age: visibility.age,
          sensitive_agreed: sensitiveAgreed,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const uploadedUrls: { url: string; order: number }[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        if (!file) continue;
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${user.id}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('[Profile] 사진 업로드 에러:', uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(path);

        uploadedUrls.push({ url: publicUrl, order: i });
      }

      if (uploadedUrls.length > 0) {
        const photoRows = uploadedUrls.map(({ url, order }) => ({
          user_id: user.id,
          storage_path: url,
          display_order: order,
        }));
        const { error: photoError } = await supabase
          .from('profile_photos')
          .insert(photoRows);

        if (photoError) {
          console.error('[Profile] 사진 DB 저장 에러:', photoError);
        }
      }

      router.push('/onboarding/complete');
    } catch (err) {
      console.error('[Profile] 저장 실패:', err);
      const { toast } = await import('sonner');
      toast.error('프로필 저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      {/* 고정 헤더 */}
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-1.5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
            <UserRound size={18} className="text-gold" />
            <h1 className="text-lg font-bold text-foreground">
              프로필 설정
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="h-px bg-line" />
      </header>

      {/* 프로그레스 바 */}
      <div className="px-6 pt-4 pb-4">
        <div className="flex gap-1.5">
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                className={`h-1 w-full rounded-full ${
                  i <= CURRENT_STEP ? 'bg-gold' : 'bg-surface'
                }`}
              />
              <span
                className={`text-[10px] ${
                  i <= CURRENT_STEP
                    ? 'text-gold'
                    : 'text-foreground-soft'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 컨텐츠 */}
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-6 pt-6 pb-4">
        {/* 프로필 사진 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <Camera size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              프로필 사진
            </h2>
          </div>
          <p className="mb-4 text-xs text-foreground/50">
            최소 1장 필수 · 최대 {MAX_PHOTOS}장까지 등록할 수 있어요
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
        </section>

        {/* 닉네임 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <UserRound size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              닉네임
            </h2>
          </div>
          <p className="mb-4 text-xs text-foreground/50">
            온리에서 사용할 이름이에요 (2~10자)
          </p>
          <Input
            placeholder="닉네임을 입력해주세요"
            maxLength={10}
            value={nickname}
            onChange={(e) => handleNicknameChange(e.target.value)}
            error={
              nickname.length > 0 && nickname.trim().length < 2
                ? '2자 이상 입력해주세요'
                : nicknameDup === true
                  ? '이미 사용 중인 닉네임이에요'
                  : undefined
            }
          />
          {nicknameChecking && nickname.trim().length >= 2 && (
            <p className="mt-1.5 text-xs text-foreground/40">
              중복 확인 중...
            </p>
          )}
          {nicknameDup === false &&
            nickname.trim().length >= 2 &&
            !nicknameChecking && (
              <p className="mt-1.5 text-xs text-green-400">
                사용 가능한 닉네임이에요
              </p>
            )}
        </section>

        {/* 자기소개 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <MessageSquareText size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              자기소개
            </h2>
          </div>
          <p className="mb-4 text-xs text-foreground/50">
            나를 소개하는 한 줄 (선택)
          </p>
          <div className="relative">
            <textarea
              placeholder="자유롭게 소개해주세요"
              maxLength={100}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none"
            />
            <span className="absolute right-3 bottom-2 text-[10px] text-foreground-soft">
              {bio.length}/100
            </span>
          </div>
        </section>

        {/* 키/몸무게 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <Ruler size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              신체 정보
            </h2>
          </div>
          <p className="mb-4 text-xs text-foreground/50">
            선택 사항이에요 · 비공개 가능
          </p>
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
                  className="w-full appearance-none rounded-xl border border-line bg-surface px-4 py-3 pr-12 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-foreground/40">
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
                  className="w-full appearance-none rounded-xl border border-line bg-surface px-4 py-3 pr-12 text-sm text-foreground placeholder:text-foreground-soft focus:border-gold-soft/50 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-foreground/40">
                  kg
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 정체성 선택 */}
        <section className="-mx-6">
          <div className="mb-1 flex items-center gap-1.5 px-6">
            <Sparkles size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              나를 어떻게 표현할까요?
            </h2>
          </div>
          <p className="mb-4 px-6 text-xs text-foreground/50">
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
            <h2 className="text-base font-semibold text-foreground">
              무엇을 찾고 있나요?
            </h2>
          </div>
          <p className="mb-4 px-6 text-xs text-foreground/50">
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
            <h2 className="text-base font-semibold text-foreground">
              지역
            </h2>
          </div>
          <p className="mb-4 px-6 text-xs text-foreground/50">
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

        {/* 활동 시간 */}
        <section className="-mx-6">
          <div className="mb-1 flex items-center gap-1.5 px-6">
            <Clock size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              활동 시간
            </h2>
          </div>
          <p className="mb-4 px-6 text-xs text-foreground/50">
            주로 활동하는 시간대를 선택해주세요 (복수 선택 가능, 선택)
          </p>
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
        </section>

        {/* 관심사 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <Hash size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              관심사
            </h2>
          </div>
          <p className="mb-4 text-xs text-foreground/50">
            관심사를 입력해주세요 (선택, 최대 {MAX_INTERESTS}개)
          </p>
          {interests.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold"
                >
                  #{interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="ml-0.5 transition-colors hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {interests.length < MAX_INTERESTS && (
            <div className="flex gap-2">
              <Input
                placeholder="예: 음악, 영화, 요리"
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
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors hover:bg-gold/20 disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>
          )}
          {interests.length < MAX_INTERESTS && (
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
        </section>

        {/* 노출 범위 */}
        <section>
          <div className="mb-1 flex items-center gap-1.5">
            <Lock size={16} className="text-gold/60" />
            <h2 className="text-base font-semibold text-foreground">
              공개 범위
            </h2>
          </div>
          <p className="mb-4 text-xs text-foreground/50">
            각 항목의 공개/비공개를 직접 제어할 수 있어요
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleVisibility('region')}
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-gold-soft/50"
            >
              <span className="text-sm text-foreground">지역</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/50">
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
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-gold-soft/50"
            >
              <span className="text-sm text-foreground">나이</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/50">
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
        <section className="rounded-xl border border-line bg-surface/50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-gold" />
            <span className="text-sm font-medium text-foreground">
              민감정보 수집 동의
            </span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-foreground/50">
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
          disabled={!canProceed || saving}
          onClick={handleNext}
        >
          {saving ? '저장 중...' : '다음'}
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
        <div className="shrink-0 w-6" />
      </div>
    </div>
  );
}
