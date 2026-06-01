import clsx from 'clsx';
import type { LeaderboardEntry } from '@/api/gamification';

const MEDAL = ['🥇', '🥈', '🥉'];

function getMedalEmoji(rank: number): string | null {
  if (rank >= 1 && rank <= 3) return MEDAL[rank - 1];
  return null;
}

interface LeaderboardTableProps {
  items: LeaderboardEntry[];
  page: number;
  pageSize: number;
}

export default function LeaderboardTable({ items, page, pageSize }: LeaderboardTableProps) {
  return (
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
            const rank = (page - 1) * pageSize + index + 1;
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
  );
}
