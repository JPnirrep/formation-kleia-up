import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function TransformationSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const steps = [
    {
      step: '01',
      title: 'Découvre ta signature vocale',
      desc: 'Pas de technique imposée. On part de qui tu es vraiment pour révéler ton autorité naturelle.',
    },
    {
      step: '02',
      title: 'Apprivoise ton trac',
      desc: 'Ton corps parle avant toi. Apprends à lire ses signaux et à en faire des alliés, pas des ennemis.',
    },
    {
      step: '03',
      title: 'Passe à l\'impact',
      desc: 'Mises en situation réelles, feedback bienveillant, progression mesurable. Tu t\'entraînes, tu progresses, tu brilles.',
    },
  ];

  return (
    <section ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'py-24 bg-white',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-kleia-gold uppercase tracking-widest mb-4">
            Le parcours
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-4">
            Du trac à l'impact.
          </h2>
          <p className="text-kleia-gray max-w-xl mx-auto text-lg">
            Trois étapes pour transformer ta sensibilité en super-pouvoir.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className={clsx(
                isVisible ? `animate-reveal animate-reveal-delay-${idx + 1}` : 'opacity-0',
                'relative group p-8 rounded-2xl hover:bg-kleia-cream/50 transition-colors duration-300',
              )}
            >
              <span className="text-5xl font-extrabold text-kleia-violet/10 group-hover:text-kleia-violet/20 transition-colors">
                {s.step}
              </span>
              <h3 className="text-xl font-bold text-kleia-dark mt-4 mb-3">{s.title}</h3>
              <p className="text-kleia-gray text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
