import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { IconRocket, IconPeople, IconTarget, IconArrow } from './icons';

const cases = [
  {
    tag: 'Pour toi',
    title: 'Entrepreneur·e hypersensible',
    desc: 'Tu as un message puissant mais tu n\'oses pas le porter. On t\'aide à aligner ta voix, ton corps et ton intention pour incarner pleinement ton leadership.',
    icon: IconRocket,
  },
  {
    tag: 'Pour ton équipe',
    title: 'Manager en quête d\'impact',
    desc: 'Tu veux que ton équipe te suive sans crier. Apprends à inspirer par ta présence plutôt qu\'à t\'épuiser à convaincre.',
    icon: IconPeople,
  },
  {
    tag: 'Pour ton entreprise',
    title: 'Organisation qui mise sur l\'humain',
    desc: 'Des formations sur mesure pour vos talents atypiques. Parce qu\'une équipe diverse et alignée est une équipe qui performe.',
    icon: IconTarget,
  },
];

export default function UseCasesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const [active, setActive] = useState(0);
  const current = cases[active];

  return (
    <section ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'py-24 bg-white',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-4">
            Une solution pour chaque étape
          </h2>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-kleia-cream rounded-2xl p-1.5 gap-1 flex-wrap justify-center">
            {cases.map((c, i) => (
              <button
                key={c.tag}
                onClick={() => setActive(i)}
                className={clsx(
                  'px-6 py-2.5 rounded-xl font-semibold text-sm transition-all',
                  active === i
                    ? 'bg-white text-kleia-violet shadow-md'
                    : 'text-kleia-gray hover:text-kleia-dark',
                )}
              >
                {c.tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
          <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-kleia-cream via-white to-kleia-violet/5 border border-kleia-violet/10 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Decorative ring */}
                <div className="absolute -inset-8 rounded-full border border-kleia-violet/10" />
                <div className="absolute -inset-16 rounded-full border border-kleia-violet/5" />
                <current.icon className="w-20 h-20 text-kleia-violet/20" />
              </div>
            </div>
            {/* Corner accents */}
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-kleia-gold/30" />
            <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-kleia-violet/30" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-kleia-dark mb-4">{current.title}</h3>
            <p className="text-kleia-gray text-lg leading-relaxed mb-6">{current.desc}</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-kleia-violet font-semibold hover:underline"
            >
              En savoir plus <IconArrow className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
