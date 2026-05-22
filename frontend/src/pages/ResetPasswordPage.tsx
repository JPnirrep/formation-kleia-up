import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '@/api/auth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      setError('Veuillez saisir un nouveau mot de passe.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!token) {
      setError('Token de réinitialisation manquant.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch {
      setError('Token invalide ou expiré. Demandez un nouveau lien.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10 text-center space-y-6">
            <h1 className="text-3xl font-extrabold font-heading text-kleia-burgundy tracking-tight">
              Mot de passe réinitialisé
            </h1>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              Votre mot de passe a été mis à jour avec succès.
            </div>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-2.5 px-4 rounded-lg gradient-burgundy text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity"
            >
              Se connecter
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-heading text-kleia-burgundy tracking-tight">
              Nouveau mot de passe
            </h1>
            <p className="mt-2 text-sm text-kleia-gray font-body">
              Définissez un nouveau mot de passe
            </p>
          </div>

          {!token && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700 mb-5">
              Lien de réinitialisation invalide. Demandez-en un nouveau depuis la page de connexion.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-kleia-dark mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                required
                disabled={!token}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-burgundy/30 focus:border-kleia-burgundy text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-kleia-dark mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                required
                disabled={!token}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-burgundy/30 focus:border-kleia-burgundy text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !token}
              className="w-full py-2.5 px-4 rounded-lg gradient-burgundy text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mise à jour…' : 'Mettre à jour'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-kleia-burgundy font-medium hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
