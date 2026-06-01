import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { IconArrow } from './icons';

export default function FinalCTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  return (
    <section ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'py-24 bg-gradient-to-br from-kleia-violet to-kleia-violet-light text-white overflow-hidden relative',
    )}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-kleia-gold/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
          Prêt·e à prendre ta place ?
        </h2>
        <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Rejoins celles et ceux qui ont décidé d'arrêter de se taire. Ta voix compte. Fais-la entendre.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 py-4 px-10 rounded-xl bg-white text-kleia-violet font-bold text-base hover:brightness-95 transition-all shadow-xl"
        >
          Je commence maintenant
          <IconArrow className="w-5 h-5" />
        </Link>
        <p className="mt-6 text-white/50 text-sm">
          Premier module offert. Sans engagement.
        </p>
      </div>
    </section>
  );
}
