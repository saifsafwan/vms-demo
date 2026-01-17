import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// ============================================
// Styles - Monzo inspired
// ============================================

const inputStyles = [
  'w-full h-14 px-4 text-base rounded-xl',
  'border-2 border-gray-200 bg-white',
  'text-navy-900 placeholder:text-gray-400',
  'transition-colors duration-150',
  'hover:border-gray-300',
  'focus:outline-none focus:border-coral-500',
].join(' ');

const errorStyles = 'border-red-400 hover:border-red-400 focus:border-red-500';

// ============================================
// Component
// ============================================

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(inputStyles, error && errorStyles, className)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${id}-error`}
            className="mt-2 text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
