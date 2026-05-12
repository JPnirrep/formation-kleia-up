import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { listEnrollments, getAdminStats, getEventStats } from '@/api/admin';
import type { Enrollment } from '@/api/enrollments';
import type { AdminStats, EventTimelineEntry } from '@/api/admin';
import { mockUser } from '@/mock';

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
            className="w-full bg-kleia-burgundy/70 rounded-t"
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

  const recentEnrollments = enrollments.slice(0, 10);

  const statCards = stats
    ? [
        { label: 'Apprenants', value: stats.total_users.toString(), color: 'text-kleia-burgundy' },
        { label: 'Formations', value: stats.total_courses.toString(), color: 'text-kleia-gold' },
        { label: 'Inscrits actifs', value: stats.active_enrollments.toString(), color: 'text-kleia-success' },
        { label: 'Lectures vidéo', value: stats.total_video_plays.toString(), color: 'text-kleia-dark' },
        { label: 'Taux complétion', value: `${stats.completion_rate_percent}%`, color: 'text-kleia-burgundy' },
        { label: 'Spectateurs uniques', value: stats.unique_viewers.toString(), color: 'text-kleia-gold' },
      ]
    : [];

  return (
    <div className="space-y-8" role="region" aria-label="Tableau de bord administration">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-burgundy">
            Administration
          </h1>
          <p className="text-kleia-gray font-body text-sm mt-1">
            Connecté en tant que {user?.display_name || mockUser.name}
          </p>
        </div>
        <Badge variant="danger">Admin</Badge>
      </div>

      {loading ? (
        <Loading className="py-12" text="Chargement des données..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <p className={`${stat.color} text-2xl font-bold font-heading`}>{stat.value}</p>
                <p className="text-xs text-kleia-gray font-body mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>

          {eventsData && eventsData.timeline.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-heading font-bold text-kleia-dark">
                  Lectures vidéo (14 jours)
                </h2>
                <span className="text-xs text-kleia-gray font-body">
                  {eventsData.total_events} événements
                </span>
              </div>
              <TimelineChart timeline={eventsData.timeline} />
            </Card>
          )}

          <section aria-labelledby="recent-enrollments">
            <h2 id="recent-enrollments" className="text-xl font-bold font-heading text-kleia-dark mb-4">Inscriptions récentes</h2>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-kleia-dark/10 bg-kleia-dark/5">
                      <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">ID</th>
                      <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Utilisateur</th>
                      <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Formation</th>
                      <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Date</th>
                      <th scope="col" className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-kleia-gray font-body">
                          Aucune donnée
                        </td>
                      </tr>
                    ) : (
                      recentEnrollments.map((enr: Enrollment) => (
                        <tr key={enr.id} className="border-b border-kleia-dark/5 last:border-0 hover:bg-kleia-dark/5 transition-colors">
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </>
      )}

      <section aria-labelledby="content-management">
        <h2 id="content-management" className="text-xl font-bold font-heading text-kleia-dark mb-4">Gestion du contenu</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/admin/courses/new')}>
            Créer une formation
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/admin/users')}>
            Gérer les utilisateurs
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/admin/courses')}>
            Gérer les formations
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/admin/courses')}>
            Publier un cours
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/admin/courses')}>
            Gérer les vidéos
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => navigate('/admin')}>
            Voir les stats
          </Button>
        </div>
      </section>
    </div>
  );
}
