import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { User } from 'lucide-react';

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({
  src,
  name,
  size = 'md',
  className,
}: AvatarProps) {
  const initial = name.charAt(0);

  if (src) {
    return (
      <div
        className={twMerge(
          'relative shrink-0 overflow-hidden rounded-full',
          sizeStyles[size],
          className,
        )}
      >
        <Image src={src} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        'flex shrink-0 items-center justify-center rounded-full bg-gold font-semibold text-ink',
        sizeStyles[size],
        className,
      )}
    >
      {initial || <User size={16} />}
    </div>
  );
}

export type { AvatarProps };
