import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { api } from '@/api';
import type { UserProfile } from '@/types';

const ROLES = ['learner', 'trainer', 'admin'] as const;
const ROLE_LABELS: Record<string, string> = { learner: 'Apprenant', trainer: 'Formateur', admin: 'Administrateur' };
const ROLE_VARIANTS: Record<string, 'info' | 'warning' | 'danger'> = { learner: 'info', trainer: 'warning', admin: 'danger' };

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.request<UserProfile[]>('/admin/users');
      setUsers(data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.request(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as UserProfile['role'] } : u))
      );
    } catch {
      alert('Erreur lors du changement de rôle.');
    }
  };

  if (loading) return <Loading className="py-20" text="Chargement des utilisateurs..." />;

  return (
    <div className="space-y-6" role="region" aria-label="Gestion des utilisateurs">
      <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">
        Gestion des utilisateurs
      </h1>

      {users.length === 0 ? (
        <EmptyState
          title="Aucun utilisateur"
          description="Les utilisateurs apparaîtront ici après leur inscription."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-kleia-dark/10 bg-kleia-dark/5">
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Nom</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Email</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Rôle</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-kleia-dark/5 last:border-0 hover:bg-kleia-dark/5 transition-colors">
                  <td className="px-5 py-3 font-body text-kleia-dark">{user.display_name}</td>
                  <td className="px-5 py-3 font-body text-kleia-gray">{user.email}</td>
                  <td className="px-5 py-3">
                    <Badge variant={ROLE_VARIANTS[user.role] || 'info'}>
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-2 py-1 rounded border border-kleia-dark/20 text-sm font-body bg-white focus:border-kleia-burgundy focus:ring-1 focus:ring-kleia-burgundy/20 outline-none"
                      aria-label={`Changer le rôle de ${user.display_name}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
