import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
};

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'border-coral-500 border-t-transparent rounded-full animate-spin',
        sizeStyles[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="container-app">
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="mt-4 text-gray-500">{message}</p>
        )}
      </div>
    </div>
  );
}
