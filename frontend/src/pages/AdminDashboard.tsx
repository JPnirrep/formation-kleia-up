import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useApi } from '@/hooks/useApi';
import { getCourses } from '@/api/courses';
import { listEnrollments } from '@/api/admin';
import type { Enrollment } from '@/api/enrollments';
import { mockUser } from '@/mock';

const statusBadge: Record<string, 'success' | 'warning' | 'info'> = { active: 'success', pending: 'warning', completed: 'info' };
const statusLabel: Record<string, string> = { active: 'Actif', pending: 'En attente', completed: 'Terminé' };

export default function AdminDashboard() {
  const { data: coursesData, loading: coursesLoading } = useApi(() => getCourses({ limit: 50 }), []);
  const { data: enrollments, loading: enrollmentsLoading } = useApi(() => listEnrollments(), []);

  const loading = coursesLoading || enrollmentsLoading;

  const totalCourses = coursesData?.items?.length || 0;
  const totalDurationHours = coursesData?.items
    ? Math.round((coursesData.items.reduce((acc, c) => acc + c.duration_seconds, 0) || 0) / 3600)
    : 0;
  const totalEnrollments = enrollments?.length || 0;
  const activeEnrollments = enrollments?.filter((e: Enrollment) => e.status === 'active').length || 0;

  const stats = [
    { label: 'Inscrits actifs', value: activeEnrollments.toString(), color: 'text-kleia-burgundy' },
    { label: 'Formations', value: totalCourses.toString(), color: 'text-kleia-gold' },
    { label: 'Heures de contenu', value: `${totalDurationHours}h`, color: 'text-kleia-success' },
    { label: 'Inscriptions', value: totalEnrollments.toString(), color: 'text-kleia-dark' },
  ];

  const recentEnrollments = (enrollments || []).slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-burgundy">
            Administration
          </h1>
          <p className="text-kleia-gray font-body text-sm mt-1">
            Connecté en tant que {mockUser.name}
          </p>
        </div>
        <Badge variant="danger">Admin</Badge>
      </div>

      {loading ? (
        <Loading className="py-12" text="Chargement des données..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <p className={stat.color + ' text-3xl font-bold font-heading'}>{stat.value}</p>
                <p className="text-sm text-kleia-gray font-body mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>

          <section>
            <h2 className="text-xl font-bold font-heading text-kleia-dark mb-4">Inscriptions récentes</h2>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-kleia-dark/10 bg-kleia-dark/5">
                      <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">ID</th>
                      <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Utilisateur</th>
                      <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Formation</th>
                      <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Date</th>
                      <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Statut</th>
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

      <section>
        <h2 className="text-xl font-bold font-heading text-kleia-dark mb-4">Gestion du contenu</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="primary" size="lg" className="w-full" onClick={() => {}}>
            Créer une formation
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => {}}>
            Gérer les utilisateurs
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => {}}>
            Voir les statistiques
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => {}}>
            Gérer les catégories
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => {}}>
            Publier un cours
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={() => {}}>
            Paramètres
          </Button>
        </div>
      </section>
    </div>
  );
}
