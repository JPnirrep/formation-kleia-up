import clsx from 'clsx';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingProps {
  size?: LoadingSize;
  className?: string;
  text?: string;
}

const sizeStyles: Record<LoadingSize, string> = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function Loading({ size = 'md', className, text }: LoadingProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)} role="status" aria-label="Chargement">
      <svg
        className={clsx('animate-spin', sizeStyles[size])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="text-kleia-dark/10" />
        <path
          d="M12 2a10 10 0 019.95 9"
          stroke="url(#spinner-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <defs>
          {/* Thème Kleia-up : burgundy + gold */}
          <linearGradient id="spinner-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B1D3D" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
      </svg>
      {text && <span className="text-sm text-kleia-gray font-body">{text}</span>}
      <span className="sr-only">Chargement...</span>
    </div>
  );
}