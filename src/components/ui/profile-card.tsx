"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { twMerge } from "tailwind-merge";
import type { Profile } from "@/types";
import { Pill } from "./pill";
import { IDENTITY_LABELS, RELATION_GOAL_LABELS } from "@/lib/constants";

type ProfileCardProps = {
  profile: Profile;
  onHeart?: (id: string) => void;
  onPress?: (id: string) => void;
  className?: string;
};

export function ProfileCard({ profile, onHeart, onPress, className }: ProfileCardProps) {
  const visibleIdentity =
    profile.visibility.identity === "public" ? profile.identity : null;

  return (
    <div
      onClick={() => onPress?.(profile.id)}
      className={twMerge(
        "relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface",
        "dark:border-navy-light dark:bg-navy-light",
        "shadow-sm transition-shadow hover:shadow-md",
        onPress && "cursor-pointer",
        className,
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-line dark:bg-navy">
        <Image
          src={profile.thumbnailUrl}
          alt={profile.nickname}
          fill
          className="object-cover"
        />
        {profile.isVerified && (
          <span className="absolute top-2 left-2 rounded-full bg-gold px-2 py-0.5 text-xs font-medium text-navy">
            인증
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-foreground">
              {profile.nickname}
            </span>
            <span className="text-sm text-gray">{profile.age}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onHeart?.(profile.id);
            }}
            className="rounded-full p-1.5 text-gold transition-colors hover:bg-gold/10 active:bg-gold/20"
            aria-label="하트 보내기"
          >
            <Heart size={20} />
          </button>
        </div>

        {profile.bio && (
          <p className="line-clamp-1 text-sm text-gray">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {visibleIdentity && (
            <Pill label={IDENTITY_LABELS[visibleIdentity]} variant="identity" />
          )}
          {profile.lookingFor.slice(0, 2).map((goal) => (
            <Pill key={goal} label={RELATION_GOAL_LABELS[goal]} variant="status" />
          ))}
        </div>
      </div>
    </div>
  );
}

export type { ProfileCardProps };
