import clsx from 'clsx';

interface StreakWidgetProps {
  streakDays: number;
  className?: string;
}

export default function StreakWidget({ streakDays, className }: StreakWidgetProps) {
  const hasStreak = streakDays > 0;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium font-heading transition-all',
        hasStreak
          ? 'bg-kleia-success/15 text-kleia-success animate-pulse'
          : 'bg-kleia-dark/5 text-kleia-gray',
        className,
      )}
      aria-label={`Série de ${streakDays} jour${streakDays > 1 ? 's' : ''} consécutif${streakDays > 1 ? 's' : ''}`}
    >
      <span
        className={clsx(
          'text-base',
          hasStreak ? '' : 'grayscale opacity-50',
        )}
        aria-hidden="true"
      >
        🔥
      </span>
      <span>{streakDays}</span>
    </div>
  );
}
