import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '@/api/gamification';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import PeriodTabs from '@/components/leaderboard/PeriodTabs';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import LeaderboardPagination from '@/components/leaderboard/LeaderboardPagination';

const PAGE_SIZE = 20;

export default function LeaderboardPage() {
  useEffect(() => { document.title = 'Classement — Kleia-up'; }, []);
  const [period, setPeriod] = useState<string>('all_time');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(period, page, PAGE_SIZE);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Erreur lors du chargement du classement';
      setError(msg);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [period, page]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 data-testid="leaderboard-title" className="text-2xl font-heading font-extrabold text-kleia-dark dark:text-white">
          🏆 Classement
        </h1>
      </div>

      {/* Period Tabs */}
      <PeriodTabs period={period} onPeriodChange={handlePeriodChange} />

      {/* Loading State */}
      {loading && (
        <Loading className="py-20" text="Chargement du classement…" />
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-3 px-4 py-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-heading font-bold hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-all focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && items.length > 0 && (
        <LeaderboardTable items={items} page={page} pageSize={PAGE_SIZE} />
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Aucun participant"
          description="Aucun participant pour cette période. Revenez plus tard pour voir le classement."
          icon="search"
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <LeaderboardPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
