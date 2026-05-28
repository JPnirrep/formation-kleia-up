import clsx from 'clsx';

interface PointsBadgeProps {
  points: number;
  level: string;
  levelNumber: number;
  className?: string;
}

function getNextLevelPoints(levelNumber: number): number {
  switch (levelNumber) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 600;
    default: return null; // max level — no progression
  }
}

function getLevelProgress(points: number, levelNumber: number): { current: number; max: number; percent: number } {
  const thresholds = [0, 100, 300, 600];
  const currentThreshold = thresholds[levelNumber - 1] ?? 600;
  const nextThreshold = thresholds[levelNumber] ?? Infinity;

  if (nextThreshold === Infinity) {
    // Max level — full bar
    return { current: points, max: points, percent: 100 };
  }

  const current = points - currentThreshold;
  const max = nextThreshold - currentThreshold;
  const percent = Math.min(Math.max(Math.round((current / max) * 100), 0), 100);

  return { current, max, percent };
}

export default function PointsBadge({ points, level, levelNumber, className }: PointsBadgeProps) {
  const progress = getLevelProgress(points, levelNumber);
  const nextLevelPoints = getNextLevelPoints(levelNumber);

  return (
    <div
      className={clsx(
        'inline-flex flex-col gap-1 min-w-[160px]',
        className,
      )}
      aria-label={`${points} points, niveau ${level}`}
    >
      <div className="flex items-center justify-between text-sm font-heading">
        <span className="font-bold text-kleia-dark">
          {points} pts
        </span>
        <span className="text-kleia-violet font-medium">
          {level}
        </span>
      </div>
      {nextLevelPoints !== null && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-kleia-dark/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-kleia-violet rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="text-[10px] text-kleia-gray whitespace-nowrap">
            {progress.current}/{progress.max}
          </span>
        </div>
      )}
      {nextLevelPoints === null && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-kleia-success/15 rounded-full overflow-hidden">
            <div className="h-full w-full bg-kleia-success rounded-full" />
          </div>
          <span className="text-[10px] text-kleia-success whitespace-nowrap">
            Max
          </span>
        </div>
      )}
    </div>
  );
}
