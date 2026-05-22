import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/* ── Google Sign-In inline (pas de fichier séparé) ── */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (element: HTMLElement | null, config: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            width?: number;
            logo_alignment?: 'left' | 'center';
          }) => void;
        };
      };
    };
  }
}

function GoogleButton() {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (window.google?.accounts?.id && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        clearInterval(id);
        setReady(true);
      }
    }, 200);
    // immediate check
    if (window.google?.accounts?.id && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      clearInterval(id);
      setReady(true);
    }
    setTimeout(() => clearInterval(id), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => loginWithGoogle(resp.credential),
      cancel_on_tap_outside: true,
    });
    window.google!.accounts.id.renderButton(containerRef.current, {
      theme: 'outline', size: 'large', text: 'signin_with',
      shape: 'rectangular', width: 320, logo_alignment: 'center',
    });
  }, [ready, loginWithGoogle]);

  if (!ready) return null;
  return <div ref={containerRef} className="flex justify-center" />;
}

/* ── LoginPage ── */

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
        const onboardingDone = user.onboarding_completed || localStorage.getItem('kleia_onboarding_done');
        navigate(onboardingDone ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try { await login(email, password); } catch {} finally { setSubmitting(false); }
  };

  const isBusy = submitting || loading;

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-heading text-kleia-burgundy tracking-tight">Bienvenue</h1>
            <p className="mt-2 text-sm text-kleia-gray font-body">Connectez-vous pour accéder à vos formations</p>
          </div>

          {/* ── Déjà membre ── */}
          <p className="text-xs font-semibold text-kleia-burgundy uppercase tracking-wider mb-4">Déjà membre</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-kleia-dark mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-burgundy/30 focus:border-kleia-burgundy text-sm transition-colors"
                placeholder="vous@exemple.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-kleia-dark mb-1">Mot de passe</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-burgundy/30 focus:border-kleia-burgundy text-sm transition-colors"
                placeholder="••••••••" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={isBusy}
              className="w-full py-2.5 px-4 rounded-lg gradient-burgundy text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              {isBusy ? 'Connexion…' : 'Se connecter'}
            </button>
            <p className="text-center text-sm text-kleia-gray">
              <Link to="/forgot-password" className="text-kleia-burgundy font-medium hover:underline">Mot de passe oublié ?</Link>
            </p>
          </form>

          {/* ── Séparateur ── */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-kleia-dark/10" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/70 px-3 text-kleia-gray">ou</span></div>
          </div>

          {/* ── Première visite ── */}
          <p className="text-xs font-semibold text-kleia-burgundy uppercase tracking-wider mb-4">Première visite</p>
          <GoogleButton />
          <p className="mt-4 text-center">
            <Link to="/register"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg border-2 border-kleia-burgundy/20 text-kleia-burgundy font-semibold text-sm font-heading hover:bg-kleia-burgundy/5 transition-colors">
              Créer un compte avec email
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}
