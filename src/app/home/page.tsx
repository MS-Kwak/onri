'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  SlidersHorizontal,
  Search,
  Heart,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';
import { Pill } from '@/components/ui/pill';
import { ProfileCard } from '@/components/ui/profile-card';
import { BottomTab } from '@/components/ui/bottom-tab';
import { createClient } from '@/lib/supabase';
import {
  IDENTITY_LABELS,
  RELATION_GOAL_LABELS,
} from '@/lib/constants';
import { useHeartStore } from '@/store';
import type { Identity, RelationGoal, Profile } from '@/types';

const REGIONS = [
  '전체',
  '서울',
  '경기',
  '부산',
  '인천',
  '대전',
  '기타',
];
const AGE_RANGES = ['전체', '20대', '30대', '40대', '50대'];

export default function HomePage() {
  const router = useRouter();
  const { balance, setBalance } = useHeartStore();
  const { isDark } = useTheme();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    nickname: string;
    thumbnailUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single();

      const { data: myPhotos } = await supabase
        .from('profile_photos')
        .select('storage_path')
        .eq('user_id', user.id)
        .order('display_order')
        .limit(1);

      setCurrentUser({
        nickname: myProfile?.nickname || '나',
        thumbnailUrl: myPhotos?.[0]?.storage_path || '',
      });

      const { data: heartData } = await supabase
        .from('hearts')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      if (heartData) setBalance(heartData.balance);

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (allProfiles && allProfiles.length > 0) {
        const userIds = allProfiles.map((p) => p.id);
        const { data: allPhotos } = await supabase
          .from('profile_photos')
          .select('user_id, storage_path, display_order')
          .in('user_id', userIds)
          .order('display_order');

        const photoMap = new Map<string, string>();
        allPhotos?.forEach((photo) => {
          if (!photoMap.has(photo.user_id)) {
            photoMap.set(photo.user_id, photo.storage_path);
          }
        });

        const mapped: Profile[] = allProfiles.map((p) => ({
          id: p.id,
          nickname: p.nickname,
          age: p.age,
          region: p.region,
          thumbnailUrl: photoMap.get(p.id) || '',
          isVerified: p.verification_status === 'approved',
          verificationStatus: p.verification_status,
          identity: p.identity as Identity,
          lookingFor: (p.looking_for || []) as RelationGoal[],
          bio: p.bio || '',
          height: p.height,
          weight: p.weight,
          interests: p.interests || [],
          activeTime: p.active_time || [],
          visibility: {
            region: p.visibility_region,
            age: p.visibility_age,
          },
          createdAt: p.created_at,
        }));

        setProfiles(mapped);
      }

      setLoading(false);
    };

    fetchData();
  }, [setBalance]);

  const [showFilter, setShowFilter] = useState(false);
  const [filterIdentities, setFilterIdentities] = useState<
    Set<Identity>
  >(new Set());
  const [filterGoals, setFilterGoals] = useState<Set<RelationGoal>>(
    new Set(),
  );
  const [filterRegions, setFilterRegions] = useState<Set<string>>(
    new Set(),
  );
  const [filterAges, setFilterAges] = useState<Set<string>>(
    new Set(),
  );

  const toggleFilter = <T,>(
    set: Set<T>,
    value: T,
    setter: (s: Set<T>) => void,
  ) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  const activeFilterCount =
    filterIdentities.size +
    filterGoals.size +
    filterRegions.size +
    filterAges.size;

  const ageRange = (label: string): [number, number] => {
    if (label === '20대') return [20, 29];
    if (label === '30대') return [30, 39];
    if (label === '40대') return [40, 49];
    return [50, 59];
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (
        filterIdentities.size > 0 &&
        !filterIdentities.has(p.identity)
      )
        return false;
      if (
        filterGoals.size > 0 &&
        !p.lookingFor.some((g) => filterGoals.has(g))
      )
        return false;
      if (filterRegions.size > 0 && !filterRegions.has(p.region))
        return false;
      if (filterAges.size > 0) {
        const matched = [...filterAges].some((a) => {
          const [min, max] = ageRange(a);
          return p.age >= min && p.age <= max;
        });
        if (!matched) return false;
      }
      return true;
    });
  }, [
    profiles,
    filterIdentities,
    filterGoals,
    filterRegions,
    filterAges,
  ]);

  const clearFilters = () => {
    setFilterIdentities(new Set());
    setFilterGoals(new Set());
    setFilterRegions(new Set());
    setFilterAges(new Set());
  };

  const handleHeart = (id: string) => {
    const target = profiles.find((p) => p.id === id);
    if (target) {
      toast.success(`${target.nickname}님에게 시그널을 보냈어요`, {
        icon: <Heart size={16} className="fill-gold text-gold" />,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          {/* 로고 */}
          <div className="flex items-center gap-2">
            <Image
              src={
                isDark
                  ? '/onri-symbol-gold.svg'
                  : '/onri-symbol-navy.svg'
              }
              alt="온리"
              width={28}
              height={28}
            />
            <span className="text-base font-semibold tracking-wide text-foreground">
              온리
            </span>
          </div>

          {/* 우측: 하트 + 필터 + 프로필 + 테마 */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/my/hearts')}
              className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1.5 transition-colors hover:bg-gold/15"
            >
              <Heart size={13} className="fill-gold text-gold" />
              <span className="text-xs font-semibold text-gold">
                {balance}
              </span>
            </button>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="relative rounded-lg p-2 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/my')}
              className="flex items-center gap-2"
            >
              <Avatar
                src={currentUser?.thumbnailUrl || null}
                name={currentUser?.nickname || '나'}
                size="sm"
                className=""
              />
              <span className="text-sm font-medium text-foreground/80">
                {currentUser?.nickname || '나'}
              </span>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* 필터 패널 */}
        {showFilter && (
          <div className="border-t border-line py-3">
            {activeFilterCount > 0 && (
              <div className="flex justify-end px-5 pb-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-full bg-foreground/5 px-3 py-1 text-xs text-foreground/50 transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <RotateCcw size={11} />
                  초기화
                </button>
              </div>
            )}
            <FilterCarousel label="정체성">
              {(Object.keys(IDENTITY_LABELS) as Identity[]).map(
                (id) => (
                  <Pill
                    key={id}
                    label={IDENTITY_LABELS[id]}
                    variant="identity"
                    selected={filterIdentities.has(id)}
                    onPress={() =>
                      toggleFilter(
                        filterIdentities,
                        id,
                        setFilterIdentities,
                      )
                    }
                  />
                ),
              )}
            </FilterCarousel>

            <FilterCarousel label="관계 목적">
              {(
                Object.keys(RELATION_GOAL_LABELS) as RelationGoal[]
              ).map((goal) => (
                <Pill
                  key={goal}
                  label={RELATION_GOAL_LABELS[goal]}
                  variant="identity"
                  selected={filterGoals.has(goal)}
                  onPress={() =>
                    toggleFilter(filterGoals, goal, setFilterGoals)
                  }
                />
              ))}
            </FilterCarousel>

            <FilterCarousel label="지역">
              {REGIONS.filter((r) => r !== '전체').map((r) => (
                <Pill
                  key={r}
                  label={r}
                  variant="identity"
                  selected={filterRegions.has(r)}
                  onPress={() =>
                    toggleFilter(filterRegions, r, setFilterRegions)
                  }
                />
              ))}
            </FilterCarousel>

            <FilterCarousel label="연령대">
              {AGE_RANGES.filter((a) => a !== '전체').map((a) => (
                <Pill
                  key={a}
                  label={a}
                  variant="identity"
                  selected={filterAges.has(a)}
                  onPress={() =>
                    toggleFilter(filterAges, a, setFilterAges)
                  }
                />
              ))}
            </FilterCarousel>
          </div>
        )}

        {/* 활성 필터 칩 (필터 패널 닫혀 있을 때) */}
        {!showFilter && activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto px-5 pb-3 scrollbar-hide">
            {[...filterIdentities].map((id) => (
              <Pill
                key={id}
                label={IDENTITY_LABELS[id]}
                variant="identity"
                selected
                dismissible
                onPress={() =>
                  toggleFilter(
                    filterIdentities,
                    id,
                    setFilterIdentities,
                  )
                }
              />
            ))}
            {[...filterGoals].map((goal) => (
              <Pill
                key={goal}
                label={RELATION_GOAL_LABELS[goal]}
                variant="identity"
                selected
                dismissible
                onPress={() =>
                  toggleFilter(filterGoals, goal, setFilterGoals)
                }
              />
            ))}
            {[...filterRegions].map((r) => (
              <Pill
                key={r}
                label={r}
                variant="identity"
                selected
                dismissible
                onPress={() =>
                  toggleFilter(filterRegions, r, setFilterRegions)
                }
              />
            ))}
            {[...filterAges].map((a) => (
              <Pill
                key={a}
                label={a}
                variant="identity"
                selected
                dismissible
                onPress={() =>
                  toggleFilter(filterAges, a, setFilterAges)
                }
              />
            ))}
          </div>
        )}

        <div className="h-px bg-line" />
      </header>

      {/* 프로필 카드 그리드 */}
      <div className="flex-1 px-4 pt-4">
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onHeart={handleHeart}
                onPress={(id) => router.push(`/profile/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 pt-24">
            <Search size={40} className="text-foreground-dim" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground/60">
                조건에 맞는 프로필이 없어요
              </p>
              <p className="mt-1 text-xs text-foreground/40">
                필터를 완화해보세요
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="mt-2 rounded-xl bg-surface px-5 py-2.5 text-sm text-gold transition-colors hover:bg-surface/80"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* 하단 탭 */}
      <BottomTab />
    </div>
  );
}

function FilterCarousel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
    align: 'start',
  });

  return (
    <div className="mb-2">
      <span className="mb-1.5 block px-5 text-xs font-medium text-foreground/50">
        {label}
      </span>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-1.5 pl-5">
          {children}
          <div className="shrink-0 w-5" />
        </div>
      </div>
    </div>
  );
}
