import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6] px-4 text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-kleia-burgundy tracking-tight mb-4">
        Kleia-up
      </h1>
      <p className="text-lg text-kleia-gray font-body max-w-md mb-8">
        Développez votre leadership organique et votre puissance de parole.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="py-2.5 px-6 rounded-lg gradient-burgundy text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity">
          Se connecter
        </Link>
        <Link to="/register" className="py-2.5 px-6 rounded-lg border-2 border-kleia-burgundy/20 text-kleia-burgundy font-semibold text-sm font-heading hover:bg-kleia-burgundy/5 transition-colors">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
