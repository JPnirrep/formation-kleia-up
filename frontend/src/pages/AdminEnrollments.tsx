import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { listEnrollments, deleteEnrollment, updateEnrollmentStatus } from '@/api/admin';
import type { EnrollmentListResponse } from '@/api/admin';
import type { Enrollment } from '@/api/enrollments';

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  completed: 'Terminé',
  cancelled: 'Annulé',
};
const STATUS_VARIANTS: Record<string, 'info' | 'success' | 'warning'> = {
  active: 'info',
  completed: 'success',
  cancelled: 'warning',
};

export default function AdminEnrollments() {
  const [data, setData] = useState<EnrollmentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await listEnrollments();
      setData(d);
    } catch {
      setError("Erreur lors du chargement des inscriptions.");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Révoquer cette inscription ?')) return;
    try {
      await deleteEnrollment(id);
      load();
    } catch { setError('Erreur suppression'); }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateEnrollmentStatus(id, status);
      load();
    } catch { setError('Erreur mise à jour statut'); }
  };

  if (loading) return <Loading className="py-20" text="Chargement..." />;

  const enrollments: Enrollment[] = (data as any)?.items || [];

  return (
    <div className="space-y-6" role="region" aria-label="Gestion des inscriptions">
      <div>
        <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">Inscriptions</h1>
        <p className="text-sm text-kleia-gray font-body">
          {data?.total || 0} inscription{(data?.total || 0) > 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-body">
          {error}
        </div>
      )}

      {enrollments.length === 0 ? (
        <EmptyState title="Aucune inscription" description="Les inscriptions apparaîtront ici." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Liste des inscriptions">
              <thead>
                <tr className="border-b border-kleia-dark/10 bg-kleia-dark/5">
                  <th className="text-left px-4 py-3 font-heading font-semibold text-kleia-dark whitespace-nowrap">Utilisateur</th>
                  <th className="text-left px-4 py-3 font-heading font-semibold text-kleia-dark whitespace-nowrap">Formation</th>
                  <th className="text-left px-4 py-3 font-heading font-semibold text-kleia-dark whitespace-nowrap">Statut</th>
                  <th className="text-left px-4 py-3 font-heading font-semibold text-kleia-dark whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 font-heading font-semibold text-kleia-dark whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kleia-dark/5">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-kleia-dark/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-kleia-gray">{e.user_id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-mono text-xs text-kleia-gray">{e.course_id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[e.status] || 'default'}>
                        {STATUS_LABELS[e.status] || e.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-kleia-gray whitespace-nowrap">
                      {new Date(e.granted_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <select
                          value={e.status}
                          onChange={(ev) => handleStatus(e.id, ev.target.value)}
                          className="text-xs px-2 py-1 rounded border border-kleia-dark/20 bg-white font-body"
                        >
                          <option value="active">Actif</option>
                          <option value="completed">Terminé</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                        <Button variant="ghost" size="sm" className="!text-red-400 !text-xs" onClick={() => handleDelete(e.id)} aria-label="Supprimer l'inscription">
                          ✕
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
