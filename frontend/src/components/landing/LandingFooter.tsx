import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function LandingFooter() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  return (
    <footer ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'bg-kleia-dark text-white',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <span className="text-2xl font-extrabold tracking-tight">Kleia-up</span>
            <p className="mt-3 text-sm text-white/50 leading-relaxed">
              Incarne ton autorité naturelle.
            </p>
          </div>
          {[
            { title: 'Plateforme', links: ['Pour toi', 'Pour ton équipe', 'Pour ton entreprise', 'Tarifs'] },
            { title: 'Ressources', links: ['Manifeste', 'Blog', 'Témoignages', 'FAQ'] },
            { title: 'Légal', links: ['Confidentialité', 'CGU', 'Mentions légales', 'Contact'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-sm uppercase tracking-widest text-white/60 mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/40 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} Kleia-up. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
