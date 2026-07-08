import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-navy font-semibold hover:bg-gold-soft active:bg-gold-soft',
  secondary:
    'bg-cream text-ink font-medium hover:bg-line active:bg-line',
  outline:
    'border border-gold-soft text-gold bg-transparent hover:bg-gold/10 active:bg-gold/20',
  ghost: 'text-gray bg-transparent hover:bg-line/50 active:bg-line',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-sm rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          'inline-flex items-center justify-center transition-colors duration-150',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          disabled &&
            'opacity-50 cursor-not-allowed pointer-events-none',
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
