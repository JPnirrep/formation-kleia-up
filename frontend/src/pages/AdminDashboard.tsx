import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { listEnrollments, getAdminStats, getEventStats } from '@/api/admin';
import type { Enrollment } from '@/api/enrollments';
import type { AdminStats, EventTimelineEntry } from '@/api/admin';

const statusBadge: Record<string, 'success' | 'warning' | 'info'> = { active: 'success', pending: 'warning', completed: 'info' };
const statusLabel: Record<string, string> = { active: 'Actif', pending: 'En attente', completed: 'Terminé' };

function TimelineChart({ timeline }: { timeline: EventTimelineEntry[] }) {
  const maxPlays = Math.max(...timeline.map((d) => d.plays), 1);
  return (
    <div className="flex items-end gap-1 h-24 mt-4" role="img" aria-label="Graphique des lectures vidéo par jour">
      {timeline.map((entry) => (
        <div
          key={entry.date}
          className="flex-1 flex flex-col items-center justify-end h-full"
          title={`${entry.date}: ${entry.plays} lectures`}
        >
          <div
            className="w-full bg-kleia-violet/70 rounded-t transition-all"
            style={{ height: `${(entry.plays / maxPlays) * 100}%`, minHeight: entry.plays > 0 ? '4px' : '0' }}
          />
          <span className="text-[8px] text-kleia-gray mt-0.5 truncate w-full text-center" aria-hidden="true">
            {entry.date.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  useEffect(() => { document.title = 'Administration — Kleia-up'; }, []);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [eventsData, setEventsData] = useState<{ timeline: EventTimelineEntry[]; total_events: number } | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [s, e, enr] = await Promise.all([
          getAdminStats(),
          getEventStats(14),
          listEnrollments(),
        ]);
        setStats(s);
        setEventsData(e);
        setEnrollments(enr?.items || []);
      } catch {
        // silent fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending');
  const recentEnrollments = enrollments.slice(0, 10);

  const actions = [
    { label: 'Créer une formation', icon: '📝', action: () => navigate('/admin/courses/new'), variant: 'primary' as const, testId: 'admin-create-course' },
    { label: 'Gérer les formations', icon: '📚', action: () => navigate('/admin/courses'), variant: 'outline' as const },
    { label: 'Gérer les utilisateurs', icon: '👥', action: () => navigate('/admin/users'), variant: 'outline' as const, testId: 'admin-manage-users' },
  ];

  if (loading) return <Loading className="py-12" text="Chargement des données..." />;

  return (
    <div className="space-y-8" role="region" aria-label="Tableau de bord administration">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 data-testid="admin-title" className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-violet tracking-tight">
            Administration
          </h1>
          <p className="text-kleia-gray font-body text-sm mt-1">
            Connecté en tant que {user?.display_name || '—'}
          </p>
        </div>
        <Badge variant="danger">Admin</Badge>
      </div>

      {/* ── File d'actions ── */}
      <section>
        <h2 className="text-lg font-bold font-heading text-kleia-dark mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-kleia-violet animate-pulse" />
          À faire
          {pendingEnrollments.length > 0 && (
            <Badge variant="warning">{pendingEnrollments.length} en attente</Badge>
          )}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.action}
              data-testid={a.testId}
              className="bg-white border border-kleia-border rounded-kleia p-5 text-left hover:border-kleia-violet/30 hover:shadow-glass transition-all duration-200 space-y-2 group"
              aria-label={a.label}
            >
              <span className="text-xl">{a.icon}</span>
              <p className="text-sm font-semibold font-heading text-kleia-dark group-hover:text-kleia-violet transition-colors">
                {a.label}
              </p>
            </button>
          ))}
        </div>
        {pendingEnrollments.length > 0 && (
          <Card variant="surface" className="!p-4 mt-4 border-l-4 border-kleia-warning">
            <div className="flex items-center justify-between">
              <p className="text-sm text-kleia-dark font-body">
                <strong>{pendingEnrollments.length}</strong> inscription(s) en attente de validation
              </p>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
                Voir →
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* ── Statistiques ── */}
      {stats && (
        <section>
          <h2 className="text-lg font-bold font-heading text-kleia-dark mb-4">Aperçu</h2>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: 'Apprenants', value: stats.total_users.toString(), color: 'text-kleia-violet' },
              { label: 'Formations', value: stats.total_courses.toString(), color: 'text-kleia-gold' },
              { label: 'Inscrits actifs', value: stats.active_enrollments.toString(), color: 'text-kleia-success' },
              { label: 'Lectures vidéo', value: stats.total_video_plays.toString(), color: 'text-kleia-dark' },
              { label: 'Taux complétion', value: `${stats.completion_rate_percent}%`, color: 'text-kleia-violet' },
              { label: 'Spectateurs uniques', value: stats.unique_viewers.toString(), color: 'text-kleia-gold' },
            ].map((stat) => (
              <Card key={stat.label} variant="surface" className="!p-4">
                <p className={`${stat.color} text-2xl font-bold font-heading`}>{stat.value}</p>
                <p className="text-xs text-kleia-gray font-body mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ── Timeline ── */}
      {eventsData && eventsData.timeline.length > 0 && (
        <Card variant="surface">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-bold text-kleia-dark">Lectures vidéo (14 jours)</h2>
            <span className="text-xs text-kleia-gray font-body">{eventsData.total_events} événements</span>
          </div>
          <TimelineChart timeline={eventsData.timeline} />
        </Card>
      )}

      {/* ── Inscriptions récentes ── */}
      <section aria-labelledby="recent-enrollments">
        <h2 id="recent-enrollments" className="text-lg font-bold font-heading text-kleia-dark mb-4">Inscriptions récentes</h2>
        {recentEnrollments.length === 0 ? (
          <EmptyState
            title="Aucune inscription récente"
            description="Les nouvelles inscriptions apparaîtront ici."
            icon="empty"
          />
        ) : (
        <Card variant="surface" className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-kleia-dark/10 bg-kleia-alt">
                  <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">ID</th>
                  <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Utilisateur</th>
                  <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Formation</th>
                  <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Date</th>
                  <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Statut</th>
                </tr>
              </thead>
              <tbody>
                  {recentEnrollments.map((enr: Enrollment) => (
                    <tr key={enr.id} className="border-b border-kleia-dark/5 last:border-0 hover:bg-kleia-violet/5 transition-colors">
                      <td className="px-5 py-3 font-body text-kleia-gray text-xs">{enr.id}</td>
                      <td className="px-5 py-3 font-body text-kleia-dark">{enr.user_id}</td>
                      <td className="px-5 py-3 font-body text-kleia-gray">{enr.course_id}</td>
                      <td className="px-5 py-3 font-body text-kleia-gray">
                        {new Date(enr.granted_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={statusBadge[enr.status] || 'default'}>
                          {statusLabel[enr.status] || enr.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
        )}
      </section>
    </div>
  );
}
