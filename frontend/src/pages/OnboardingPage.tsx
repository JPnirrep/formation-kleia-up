import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { completeOnboarding } from '@/api/auth';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6]">
        <div className="w-8 h-8 border-2 border-kleia-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleFinish = (skip: boolean) => {
    setError(null);
    setSubmitting(true);
    // Marquer l'onboarding comme fait (même si l'API backend n'existe pas encore)
    localStorage.setItem('kleia_onboarding_done', '1');
    completeOnboarding({
      onboarding_completed: true,
      phone: skip ? '' : phone || undefined,
      whatsapp: skip ? '' : whatsapp || undefined,
      telegram: skip ? '' : telegram || undefined,
    }).catch(() => {
      // Silencieux — l'onboarding est facultatif
    });
    navigate('/formations', { replace: true });
  };

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s <= step ? 'bg-kleia-violet' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-extrabold font-heading text-kleia-violet tracking-tight">
                Bienvenue, {user.display_name.split(' ')[0]} !
              </h1>
              <p className="text-kleia-gray font-body leading-relaxed">
                Votre compte Kleia-up est créé. Avant de découvrir les formations,
                prenons 30 secondes pour personnaliser votre expérience.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 px-4 rounded-lg gradient-violet text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity"
              >
                Commencer
              </button>
              <button
                onClick={() => handleFinish(true)}
                className="text-sm text-kleia-gray hover:text-kleia-violet underline"
              >
                Passer, je verrai plus tard
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold font-heading text-kleia-violet">
                  Vos informations
                </h2>
                <p className="mt-1 text-sm text-kleia-gray font-body">
                  Facultatif — cela nous aide à mieux vous accompagner
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="onb-email" className="block text-sm font-medium text-kleia-dark mb-1">
                    Email
                  </label>
                  <input
                    id="onb-email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-gray-50 text-sm text-kleia-gray cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="onb-phone" className="block text-sm font-medium text-kleia-dark mb-1">
                    Téléphone
                  </label>
                  <input
                    id="onb-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label htmlFor="onb-whatsapp" className="block text-sm font-medium text-kleia-dark mb-1">
                    WhatsApp <span className="text-xs text-kleia-gray">(facultatif)</span>
                  </label>
                  <input
                    id="onb-whatsapp"
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label htmlFor="onb-telegram" className="block text-sm font-medium text-kleia-dark mb-1">
                    Telegram <span className="text-xs text-kleia-gray">(facultatif)</span>
                  </label>
                  <input
                    id="onb-telegram"
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-kleia-dark/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-kleia-violet/30 focus:border-kleia-violet text-sm transition-colors"
                    placeholder="@moncompte"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-kleia-dark/10 text-kleia-dark font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={submitting}
                  className="flex-[2] py-2.5 px-4 rounded-lg gradient-violet text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold font-heading text-kleia-violet">
                Vous êtes prêt !
              </h2>
              <p className="text-kleia-gray font-body leading-relaxed">
                Découvrez les formations Kleia-up conçues pour développer votre
                leadership organique et votre puissance de parole.
              </p>
              <button
                onClick={() => handleFinish(false)}
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg gradient-violet text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Enregistrement…' : 'Découvrir les formations'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
