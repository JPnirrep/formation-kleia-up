import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { IconArrow } from './icons';

export default function ManifestSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  return (
    <section ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'py-24 bg-kleia-cream text-center',
    )}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-6">
          Oser l'humain, déclencher l'élan.
        </h2>
        <p className="text-kleia-gray text-lg mb-10 leading-relaxed">
          Le leadership n'est pas une question de volume sonore. C'est une question d'alignement entre qui tu es,
          ce que tu dis, et comment tu le portes.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 py-3.5 px-10 rounded-xl gradient-violet text-white font-bold text-base hover:brightness-110 transition-all shadow-lg"
        >
          Je découvre le manifeste
          <IconArrow className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
