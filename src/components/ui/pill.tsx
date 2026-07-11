'use client';

import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type PillVariant = 'default' | 'active' | 'identity' | 'status';

type PillProps = {
  label: string;
  variant?: PillVariant;
  selected?: boolean;
  dismissible?: boolean;
  onPress?: () => void;
  className?: string;
};

const variantStyles: Record<
  PillVariant,
  { base: string; active: string }
> = {
  default: {
    base: 'border border-line text-gray bg-transparent',
    active: 'border-gold bg-gold/10 text-gold',
  },
  active: {
    base: 'bg-gold/10 text-gold border border-gold-soft',
    active: 'bg-gold text-ink border-gold',
  },
  identity: {
    base: 'bg-surface/50 text-foreground border border-line',
    active: 'bg-gold/15 text-gold border-gold-soft',
  },
  status: {
    base: 'bg-surface text-gray border border-line',
    active: 'bg-gold/10 text-gold border-gold-soft',
  },
};

export function Pill({
  label,
  variant = 'default',
  selected = false,
  dismissible = false,
  onPress,
  className,
}: PillProps) {
  const styles = variantStyles[variant];
  const Component = onPress ? 'button' : 'span';

  return (
    <Component
      onClick={onPress}
      className={twMerge(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full text-sm transition-colors duration-150',
        dismissible ? 'pl-3 pr-2 py-1' : 'px-3 py-1',
        selected ? styles.active : styles.base,
        onPress && 'cursor-pointer',
        className,
      )}
    >
      {label}
      {dismissible && <X size={12} className="opacity-60" />}
    </Component>
  );
}

export type { PillProps, PillVariant };
