'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { Profile } from '@/types';
import {
  IDENTITY_LABELS,
  RELATION_GOAL_LABELS,
} from '@/lib/constants';

type ProfileCardProps = {
  profile: Profile;
  onHeart?: (id: string) => void;
  onPress?: (id: string) => void;
  className?: string;
};

export function ProfileCard({
  profile,
  onHeart,
  onPress,
  className,
}: ProfileCardProps) {
  const visibleAge = profile.visibility.age === 'public';

  return (
    <div
      onClick={() => onPress?.(profile.id)}
      className={twMerge(
        'relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface',
        'dark:border-navy-light dark:bg-navy-light',
        'shadow-sm transition-shadow hover:shadow-md',
        onPress && 'cursor-pointer',
        className,
      )}
    >
      {/* 썸네일 영역 */}
      <div className="relative aspect-square w-full overflow-hidden bg-line dark:bg-navy">
        {profile.thumbnailUrl ? (
          <Image
            src={profile.thumbnailUrl}
            alt={profile.nickname}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-navy-light">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-xl font-bold text-gold">
              {profile.nickname.charAt(0)}
            </div>
          </div>
        )}
        {profile.verificationStatus === 'approved' && (
          <span className="absolute top-2 left-2 rounded-full bg-gold px-2 py-0.5 text-xs font-medium text-navy">
            셀카 인증
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-foreground">
              {profile.nickname}
            </span>
            {visibleAge && (
              <span className="text-sm text-gray">{profile.age}</span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onHeart?.(profile.id);
            }}
            className="rounded-full p-1.5 text-gold transition-colors hover:bg-gold/10 active:bg-gold/20"
            aria-label="시그널 보내기"
          >
            <Heart size={20} />
          </button>
        </div>

        {profile.bio && (
          <p className="line-clamp-1 text-sm text-gray">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-gold">
            {IDENTITY_LABELS[profile.identity]}
          </span>
          {profile.lookingFor.length > 0 && (
            <span className="text-[10px] text-cream/20">|</span>
          )}
          {profile.lookingFor.slice(0, 2).map((goal, i) => (
            <span key={goal} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-[10px] text-cream/15">·</span>
              )}
              <span className="text-[11px] text-cream/50">
                {RELATION_GOAL_LABELS[goal]}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { ProfileCardProps };
