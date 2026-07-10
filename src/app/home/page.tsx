'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  SlidersHorizontal,
  Search,
  Heart,
  RotateCcw,
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Pill } from '@/components/ui/pill';
import { ProfileCard } from '@/components/ui/profile-card';
import { BottomTab } from '@/components/ui/bottom-tab';
import {
  MOCK_PROFILES,
  MOCK_CURRENT_USER,
} from '@/data/mock-profiles';
import {
  IDENTITY_LABELS,
  RELATION_GOAL_LABELS,
} from '@/lib/constants';
import type { Identity, RelationGoal } from '@/types';

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
    return MOCK_PROFILES.filter((p) => {
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
  }, [filterIdentities, filterGoals, filterRegions, filterAges]);

  const clearFilters = () => {
    setFilterIdentities(new Set());
    setFilterGoals(new Set());
    setFilterRegions(new Set());
    setFilterAges(new Set());
  };

  const handleHeart = (id: string) => {
    const target = MOCK_PROFILES.find((p) => p.id === id);
    if (target) {
      toast.success(`${target.nickname}님에게 하트를 보냈어요`, {
        icon: <Heart size={16} className="fill-gold text-gold" />,
      });
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-navy pb-20">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 bg-navy">
        <div className="flex items-center justify-between px-5 pt-12 pb-3">
          {/* 로고 */}
          <div className="flex items-center gap-2">
            <Image
              src="/onri-symbol-gold.svg"
              alt="온리"
              width={28}
              height={28}
            />
            <span className="text-base font-semibold tracking-wide text-cream">
              온리
            </span>
          </div>

          {/* 우측: 필터 + 프로필 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="relative rounded-lg p-2 text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <SlidersHorizontal size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push('/my')}
              className="flex items-center gap-2"
            >
              <Avatar
                src={MOCK_CURRENT_USER.thumbnailUrl || null}
                name={MOCK_CURRENT_USER.nickname}
                size="sm"
                className=""
              />
              <span className="text-sm font-medium text-cream/80">
                {MOCK_CURRENT_USER.nickname}
              </span>
            </button>
          </div>
        </div>

        {/* 필터 패널 */}
        {showFilter && (
          <div className="border-t border-navy-light py-3">
            {activeFilterCount > 0 && (
              <div className="flex justify-end px-5 pb-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-full bg-cream/5 px-3 py-1 text-xs text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
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

        <div className="h-px bg-navy-light" />
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
            <Search size={40} className="text-cream/20" />
            <div className="text-center">
              <p className="text-sm font-medium text-cream/60">
                조건에 맞는 프로필이 없어요
              </p>
              <p className="mt-1 text-xs text-cream/40">
                필터를 완화해보세요
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="mt-2 rounded-xl bg-navy-light px-5 py-2.5 text-sm text-gold transition-colors hover:bg-navy-light/80"
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
      <span className="mb-1.5 block px-5 text-xs font-medium text-cream/50">
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
