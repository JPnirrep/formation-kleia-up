import clsx from 'clsx';

interface LeaderboardPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export default function LeaderboardPagination({ page, totalPages, onPageChange }: LeaderboardPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className={clsx(
          'px-3 py-1.5 rounded-lg text-sm font-heading font-bold transition-all',
          page <= 1
            ? 'text-[#5a4a3f] cursor-not-allowed'
            : 'text-kleia-gray/70 dark:text-[#A89A90] hover:text-kleia-dark dark:hover:text-white hover:bg-kleia-dark/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
      >
        ← Précédent
      </button>

      <span className="text-kleia-gray/70 dark:text-[#A89A90] text-sm px-3">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className={clsx(
          'px-3 py-1.5 rounded-lg text-sm font-heading font-bold transition-all',
          page >= totalPages
            ? 'text-[#5a4a3f] cursor-not-allowed'
            : 'text-kleia-gray/70 dark:text-[#A89A90] hover:text-kleia-dark dark:hover:text-white hover:bg-kleia-dark/5 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
      >
        Suivant →
      </button>
    </div>
  );
}
