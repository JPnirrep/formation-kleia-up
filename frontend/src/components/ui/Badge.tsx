import type { ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-kleia-dark/10 text-kleia-dark',
  success: 'bg-kleia-success/15 text-kleia-success',
  warning: 'bg-kleia-gold/20 text-amber-800',
  danger: 'bg-kleia-error/15 text-kleia-error',
  info: 'bg-kleia-burgundy/15 text-kleia-burgundy',
};

export default function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-heading',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}