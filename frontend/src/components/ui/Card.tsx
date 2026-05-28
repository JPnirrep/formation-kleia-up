import type { ReactNode } from 'react';
import clsx from 'clsx';

type CardVariant = 'surface' | 'glass' | 'elevated' | 'interactive';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  surface:
    'bg-kleia-surface border border-kleia-border rounded-kleia shadow-sm',
  glass:
    'bg-white/10 backdrop-blur-[12px] border border-white/20 rounded-kleia shadow-glass',
  elevated:
    'bg-kleia-surface border border-kleia-border rounded-kleia shadow-glass',
  interactive:
    'bg-kleia-surface border border-kleia-border rounded-kleia shadow-sm cursor-pointer transition-all duration-200 hover:shadow-glass hover:border-kleia-violet/20 hover:-translate-y-0.5',
};

export default function Card({ variant = 'surface', className, children }: CardProps) {
  return (
    <div className={clsx('p-6', variantStyles[variant], className)}>
      {children}
    </div>
  );
}
