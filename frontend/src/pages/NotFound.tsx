import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4" role="main" aria-label="Page non trouvée">
      <div className="relative select-none">
        <span className="text-8xl font-heading font-extrabold text-kleia-burgundy/10" aria-hidden="true">404</span>
        <h1 className="absolute inset-0 flex items-center justify-center text-5xl font-heading font-bold text-kleia-burgundy">404</h1>
      </div>
      <p className="text-xl font-body text-kleia-dark font-medium">Page introuvable</p>
      <p className="text-sm text-kleia-gray font-body text-center max-w-sm">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/"><Button variant="primary" size="sm">Accueil</Button></Link>
        <Link to="/formations"><Button variant="outline" size="sm">Catalogue</Button></Link>
        <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
      </div>
    </div>
  );
}
