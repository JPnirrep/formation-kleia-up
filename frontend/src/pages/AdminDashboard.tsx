import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { mockCourses, mockUser } from '@/mock';

const recentEnrollments = [
  { name: 'Amina Diallo', course: 'Branding Personnel', date: '2025-03-28', status: 'active' as const },
  { name: 'Fatou Ndiaye', course: 'Marketing Digital', date: '2025-03-25', status: 'active' as const },
  { name: 'Mariam Konaté', course: 'UX/UI Design', date: '2025-03-22', status: 'pending' as const },
  { name: 'Khadija Sy', course: 'Leadership Féminin', date: '2025-03-20', status: 'completed' as const },
  { name: 'Rokhaya Fall', course: 'Branding Personnel', date: '2025-03-18', status: 'active' as const },
];

const statusBadge = { active: 'success' as const, pending: 'warning' as const, completed: 'info' as const };
const statusLabel = { active: 'Actif', pending: 'En attente', completed: 'Terminé' };

export default function AdminDashboard() {
  const totalUsers = 42;
  const totalEnrollments = mockCourses.reduce((acc, c) => acc + c.lessons, 0);
  const revenue = '12 450 €';

  const stats = [
    { label: 'Utilisateurs', value: totalUsers.toString(), color: 'text-kleia-burgundy' },
    { label: 'Formations', value: mockCourses.length.toString(), color: 'text-kleia-gold' },
    { label: 'Inscriptions', value: totalEnrollments.toString(), color: 'text-kleia-success' },
    { label: 'Revenus', value: revenue, color: 'text-kleia-dark' },
  ];

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
                  <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Apprenant</th>
                  <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Formation</th>
                  <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Date</th>
                  <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((enr, idx) => (
                  <tr key={idx} className="border-b border-kleia-dark/5 last:border-0 hover:bg-kleia-dark/5 transition-colors">
                    <td className="px-5 py-3 font-body text-kleia-dark">{enr.name}</td>
                    <td className="px-5 py-3 font-body text-kleia-gray">{enr.course}</td>
                    <td className="px-5 py-3 font-body text-kleia-gray">{enr.date}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusBadge[enr.status]}>{statusLabel[enr.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

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
