import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { type VisitStatus, VISIT_STATUS_CONFIG } from '@/types';

// ============================================
// Types
// ============================================

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: VisitStatus;
}

// ============================================
// Component
// ============================================

export function Badge({ status, className, ...props }: BadgeProps) {
  const config = VISIT_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        config.bgColor,
        config.textColor,
        className
      )}
      {...props}
    >
      {config.label}
    </span>
  );
}
