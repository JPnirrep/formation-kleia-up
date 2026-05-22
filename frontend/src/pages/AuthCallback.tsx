import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const idToken = searchParams.get('id_token');
    if (!idToken) {
      setStatus('error');
      setErrorMsg('Paramètre manquant. Veuillez réessayer.');
      return;
    }

    loginWithGoogle(idToken)
      .then(() => {
        // AuthContext mettra à jour user → le useEffect dans LoginPage redirige
        navigate('/', { replace: true });
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Erreur de connexion Google.');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'error') {
    return (
      <main id="main-content" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
        <div className="bg-white/70 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-2xl p-8 sm:p-10 max-w-md text-center">
          <h1 className="text-2xl font-bold text-kleia-violet mb-4">Erreur de connexion</h1>
          <p className="text-kleia-gray mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-lg gradient-violet text-white font-semibold text-sm"
          >
            Retour à la connexion
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-kleia-violet border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-kleia-gray font-body">Connexion en cours…</p>
      </div>
    </div>
  );
}
