import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError('Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-heading text-kleia-violet tracking-tight">
              Mot de passe oublié
            </h1>
            <p className="mt-2 text-sm text-kleia-gray font-body">
              {submitted
                ? 'Vérifiez votre boîte de réception'
                : 'Saisissez votre email pour recevoir un lien de réinitialisation'}
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                Si un compte existe avec cette adresse, vous recevrez un email avec un lien de réinitialisation.
              </div>
              <Link
                to="/login"
                className="inline-block text-sm text-kleia-violet font-medium hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-kleia-dark mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                  placeholder="vous@exemple.com"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg gradient-violet text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-kleia-violet font-medium hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
