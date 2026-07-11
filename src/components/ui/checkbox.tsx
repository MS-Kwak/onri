'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  className,
}: CheckboxProps) {
  return (
    <label
      className={twMerge(
        'flex cursor-pointer items-start gap-2.5',
        className,
      )}
    >
      <CheckboxPrimitive.Root
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border border-gray/50 transition-colors data-[state=checked]:border-gold data-[state=checked]:bg-gold"
      >
        <CheckboxPrimitive.Indicator>
          <Check size={12} className="text-ink" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-sm text-foreground">{label}</span>
          )}
          {description && (
            <span className="text-xs text-foreground/50">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

export type { CheckboxProps };
