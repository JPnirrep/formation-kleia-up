import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-6xl font-heading text-kleia-burgundy">404</h1>
      <p className="text-lg text-kleia-gray">Page introuvable</p>
      <Link to="/" className="text-kleia-gold hover:underline">Retour à l'accueil</Link>
    </div>
  );
}
