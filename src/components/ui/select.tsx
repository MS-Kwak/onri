'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
};

export function Select({
  value,
  onValueChange,
  options,
  placeholder = '선택',
  label,
  error,
  className,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-foreground/70">
          {label}
        </label>
      )}
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
      >
        <SelectPrimitive.Trigger
          className={twMerge(
            'flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors',
            'data-placeholder:text-gray hover:border-gold-soft/50 focus:border-gold-soft',
            error && 'border-rose-500/70 focus:border-rose-500',
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={16} className="text-gray" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1.5">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground outline-none transition-colors data-highlighted:bg-gold/10 data-highlighted:text-gold"
                >
                  <SelectPrimitive.ItemText>
                    {opt.label}
                  </SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="ml-auto">
                    <Check size={14} className="text-gold" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <span className="text-xs text-rose-400">{error}</span>
      )}
    </div>
  );
}

export type { SelectProps, SelectOption };
