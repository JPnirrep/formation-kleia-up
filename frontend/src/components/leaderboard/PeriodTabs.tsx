import clsx from 'clsx';

const PERIODS = [
  { value: 'all_time', label: 'Tout le temps' },
  { value: 'weekly', label: 'Cette semaine' },
  { value: 'monthly', label: 'Ce mois' },
] as const;

interface PeriodTabsProps {
  period: string;
  onPeriodChange: (v: string) => void;
}

export default function PeriodTabs({ period, onPeriodChange }: PeriodTabsProps) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-heading font-bold transition-all uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none',
            period === p.value
              ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5'
              : 'bg-kleia-dark/5 dark:bg-white/5 text-kleia-gray/70 dark:text-[#A89A90] border border-transparent hover:bg-kleia-dark/10 dark:hover:bg-white/10 hover:text-kleia-dark dark:hover:text-white',
          )}
          aria-pressed={period === p.value}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
