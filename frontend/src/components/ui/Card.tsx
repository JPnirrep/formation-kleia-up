import type { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}

export default function Card({ className, children, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'glass p-6',
        hover && 'transition-shadow duration-300 hover:shadow-gold',
        className,
      )}
    >
      {children}
    </div>
  );
}