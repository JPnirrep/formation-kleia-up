import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { listUsers, createUser, updateUser } from '@/api/admin';
import type { UserAdmin } from '@/api/admin';

const ROLES = ['learner', 'trainer', 'admin'] as const;
const ROLE_LABELS: Record<string, string> = { learner: 'Apprenant', trainer: 'Formateur', admin: 'Administrateur' };

export default function AdminUsers() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers();
      setUsers(data.items || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch { setError('Erreur changement de rôle'); }
  };

  const handleToggleActive = async (user: UserAdmin) => {
    const newState = !user.is_active;
    const label = newState ? 'réactiver' : 'désactiver';
    if (!window.confirm(`Voulez-vous ${label} ${user.display_name} ?`)) return;
    try {
      await updateUser(user.id, { is_active: newState });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: newState } : u));
    } catch { setError('Erreur mise à jour'); }
  };

  const handleCreate = async () => {
    if (!newEmail.trim() || !newName.trim() || !newPassword.trim()) return;
    try {
      await createUser({
        email: newEmail.trim(),
        display_name: newName.trim(),
        password: newPassword,
      });
      setShowCreate(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      fetchUsers();
    } catch { setError('Erreur création utilisateur'); }
  };

  if (loading) return <Loading className="py-20" text="Chargement des utilisateurs..." />;

  return (
    <div className="space-y-6" role="region" aria-label="Gestion des utilisateurs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">Gestion des utilisateurs</h1>
          <p className="text-sm text-kleia-gray font-body">{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          + Créer un utilisateur
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-body">
          {error}
        </div>
      )}

      {/* Create user modal */}
      {showCreate && (
        <Card className="border-l-4 border-kleia-gold">
          <h3 className="font-heading font-bold text-kleia-dark mb-3">Nouvel utilisateur</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom affiché"
              className="px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-burgundy"
              autoFocus
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              className="px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-burgundy"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mot de passe"
              className="px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-burgundy"
            />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleCreate} disabled={!newEmail.trim() || !newName.trim() || !newPassword.trim()}>
                Créer
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </div>
        </Card>
      )}

      {users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" description="Les utilisateurs apparaîtront ici après leur inscription." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-kleia-dark/10 bg-kleia-dark/5">
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Nom</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Email</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Rôle</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Statut</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-kleia-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-kleia-dark/5 last:border-0 hover:bg-kleia-dark/5 transition-colors">
                  <td className="px-5 py-3 font-body text-kleia-dark">{user.display_name}</td>
                  <td className="px-5 py-3 font-body text-kleia-gray">{user.email}</td>
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
                  <td className="px-5 py-3">
                    <Badge variant={user.is_active ? 'success' : 'warning'}>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={user.is_active ? '!text-red-400' : '!text-green-600'}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.is_active ? 'Désactiver' : 'Réactiver'}
                    </Button>
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
