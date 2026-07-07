"use client";

import { twMerge } from "tailwind-merge";

type PillVariant = "default" | "active" | "identity" | "status";

type PillProps = {
  label: string;
  variant?: PillVariant;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
};

const variantStyles: Record<PillVariant, { base: string; active: string }> = {
  default: {
    base: "border border-line text-gray bg-transparent",
    active: "border-gold bg-gold/10 text-gold",
  },
  active: {
    base: "bg-gold/10 text-gold border border-gold-soft",
    active: "bg-gold text-navy border-gold",
  },
  identity: {
    base: "bg-navy-light/50 text-cream border border-navy-light dark:bg-navy-light dark:border-navy-light",
    active: "bg-gold/15 text-gold border-gold-soft",
  },
  status: {
    base: "bg-paper text-gray border border-line dark:bg-navy-light dark:text-cream dark:border-navy-light",
    active: "bg-gold/10 text-gold border-gold-soft",
  },
};

export function Pill({ label, variant = "default", selected = false, onPress, className }: PillProps) {
  const styles = variantStyles[variant];
  const Component = onPress ? "button" : "span";

  return (
    <Component
      onClick={onPress}
      className={twMerge(
        "inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors duration-150",
        selected ? styles.active : styles.base,
        onPress && "cursor-pointer",
        className,
      )}
    >
      {label}
    </Component>
  );
}

export type { PillProps, PillVariant };
