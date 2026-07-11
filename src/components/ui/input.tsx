import { type InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-foreground/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(
            'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-gray transition-colors',
            'hover:border-gold-soft/50 focus:border-gold-soft',
            error && 'border-rose-500/70 focus:border-rose-500',
            className,
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-rose-400">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
