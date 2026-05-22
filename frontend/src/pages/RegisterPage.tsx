import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: '', color: '', width: '0%' };
  if (pw.length < 6) return { label: 'Faible', color: '#dc2626', width: '25%' };
  if (pw.length < 8) return { label: 'Moyen', color: '#f59e0b', width: '50%' };
  if (pw.length < 12) return { label: 'Bon', color: '#10b981', width: '75%' };
  return { label: 'Excellent', color: '#10b981', width: '100%' };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: authRegister, error, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) navigate('/onboarding', { replace: true });
  }, [user, navigate]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'L\'email est requis.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Format d\'email invalide.';
    }

    if (!displayName.trim()) {
      errors.displayName = 'Votre nom est requis.';
    }

    if (!password) {
      errors.password = 'Le mot de passe est requis.';
    } else if (password.length < 8) {
      errors.password = 'Minimum 8 caractères.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmez votre mot de passe.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await authRegister(email, password, displayName);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || loading;
  const strength = passwordStrength(password);

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-heading text-kleia-violet tracking-tight">
              Inscription
            </h1>
            <p className="mt-2 text-sm text-kleia-gray font-body">
              Créez votre compte Kleia-up
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-kleia-dark mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setValidationErrors(prev => ({ ...prev, email: '' })); }}
                required
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                placeholder="vous@exemple.com"
              />
              {validationErrors.email && (
                <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">{validationErrors.email}</p>
              )}
            </div>

            {/* Display name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-kleia-dark mb-1">
                Nom complet
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); setValidationErrors(prev => ({ ...prev, displayName: '' })); }}
                required
                aria-invalid={!!validationErrors.displayName}
                aria-describedby={validationErrors.displayName ? 'name-error' : undefined}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                placeholder="Sandrina Perrin"
              />
              {validationErrors.displayName && (
                <p id="name-error" className="mt-1 text-xs text-red-600" role="alert">{validationErrors.displayName}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-kleia-dark mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setValidationErrors(prev => ({ ...prev, password: '', confirmPassword: '' })); }}
                required
                aria-invalid={!!validationErrors.password}
                aria-describedby={validationErrors.password ? 'password-error' : undefined}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                placeholder="••••••••"
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-kleia-gray">{strength.label}</p>
                </div>
              )}
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-kleia-dark mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setValidationErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                required
                aria-invalid={!!validationErrors.confirmPassword}
                aria-describedby={validationErrors.confirmPassword ? 'confirm-error' : undefined}
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                placeholder="••••••••"
              />
              {validationErrors.confirmPassword && (
                <p id="confirm-error" className="mt-1 text-xs text-red-600" role="alert">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-lg gradient-violet text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBusy ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-kleia-gray font-body">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-kleia-violet font-medium hover:underline">
                Connectez-vous
              </Link>
            </p>
            <p className="text-sm text-kleia-gray font-body">
              <Link to="/forgot-password" className="text-kleia-violet font-medium hover:underline">
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
