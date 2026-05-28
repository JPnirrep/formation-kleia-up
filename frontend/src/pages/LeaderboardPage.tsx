import { useState, useEffect, useCallback } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '@/api/gamification';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import clsx from 'clsx';

const PERIODS = [
  { value: 'all_time', label: 'Tout le temps' },
  { value: 'weekly', label: 'Cette semaine' },
  { value: 'monthly', label: 'Ce mois' },
] as const;

const PAGE_SIZE = 20;

const MEDAL = ['🥇', '🥈', '🥉'];

function getMedalEmoji(rank: number): string | null {
  if (rank >= 1 && rank <= 3) return MEDAL[rank - 1];
  return null;
}

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
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
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
        <div className="overflow-x-auto">
          <table data-testid="leaderboard-table" className="w-full text-sm">
            <thead>
              <tr className="border-b border-kleia-dark/10 dark:border-white/10 text-left text-kleia-gray/70 dark:text-[#A89A90] text-xs uppercase tracking-widest font-heading font-bold">
                <th className="pb-3 pr-4 w-12">#</th>
                <th className="pb-3 pr-4">Utilisateur</th>
                <th className="pb-3 pr-4 text-right">Points</th>
                <th className="pb-3 pr-4 text-center">Niveau</th>
                <th className="pb-3 pr-4 text-center">🔥 Streak</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry, index) => {
                const rank = (page - 1) * PAGE_SIZE + index + 1;
                const medal = getMedalEmoji(rank);
                return (
                  <tr
                    key={entry.user_id}
                    className={clsx(
                      'border-b border-kleia-dark/5 dark:border-white/5 transition-colors hover:bg-kleia-dark/[0.02] dark:hover:bg-white/[0.02]',
                      medal && 'bg-[#D4AF37]/[0.03] dark:bg-[#D4AF37]/[0.03]',
                    )}
                  >
                    {/* Rang */}
                    <td className="py-3 pr-4">
                      {medal ? (
                        <span className="text-xl">{medal}</span>
                      ) : (
                        <span className="text-kleia-gray/70 dark:text-[#A89A90] font-mono text-sm">
                          {rank}
                        </span>
                      )}
                    </td>

                    {/* Avatar + Name */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#D4A97A] to-[#E0B988] flex items-center justify-center text-white text-xs font-bold font-heading shrink-0 overflow-hidden">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            entry.display_name?.charAt(0).toUpperCase() || '?'
                          )}
                        </div>
                        <span className="text-kleia-dark dark:text-white font-medium truncate">
                          {entry.display_name}
                        </span>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-3 pr-4 text-right">
                      <span
                        className={clsx(
                          'font-mono font-bold',
                          medal ? 'text-[#D4AF37]' : 'text-kleia-dark dark:text-white',
                        )}
                      >
                        {entry.points.toLocaleString()}
                      </span>
                    </td>

                    {/* Level */}
                    <td className="py-3 pr-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-kleia-dark/5 dark:bg-white/5 text-kleia-gray/70 dark:text-[#A89A90] text-xs font-heading font-bold">
                        {entry.level}
                      </span>
                    </td>

                    {/* Streak */}
                    <td className="py-3 pr-4 text-center">
                      {entry.streak_days > 0 ? (
                        <span className="text-orange-600 dark:text-orange-400 font-mono font-bold text-sm">
                          🔥 {entry.streak_days}
                        </span>
                      ) : (
                        <span className="text-[#5a4e45] text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
      )}
    </div>
  );
}
