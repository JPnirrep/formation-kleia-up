import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, loading, user } = useAuth();
  const [email, setEmail] = useState('clara.f@example.com');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-heading text-kleia-burgundy tracking-tight">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-kleia-gray font-body">
              Accédez à vos formations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-kleia-dark mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-burgundy/30 focus:border-kleia-burgundy text-sm transition-colors"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-kleia-dark mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-burgundy/30 focus:border-kleia-burgundy text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-lg gradient-burgundy text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBusy ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}