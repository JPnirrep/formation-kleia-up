import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { IconShield, IconMic, IconHeart } from './icons';

const pains = [
  {
    title: "L'épuisement de la sur-adaptation",
    desc: "Vouloir rentrer dans le moule des voix fortes et des certitudes affichées te vide de ton énergie vitale.",
    icon: IconShield,
  },
  {
    title: "La peur de prendre la parole",
    desc: "Cette boule au ventre avant chaque prise de parole. Comme si ta propre sensibilité devenait ton pire ennemi.",
    icon: IconMic,
  },
  {
    title: "Le syndrome de l'imposteur",
    desc: "Cette petite voix qui te murmure que tu n'es pas légitime. Qu'être sensible, c'est être faible.",
    icon: IconHeart,
  },
];

export default function PainMirrorSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  return (
    <section id="miroir" ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'py-24 bg-kleia-cream',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-4">
            La place que tu ne prends pas est <span className="text-kleia-violet">occupée par d'autres.</span>
          </h2>
          <p className="text-kleia-gray max-w-xl mx-auto text-lg">
            Tu n'es pas cassé·e. Tu es juste passé·e à côté de ta propre puissance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pains.map((pain, idx) => (
            <div
              key={pain.title}
              className={clsx(
                isVisible ? `animate-reveal animate-reveal-delay-${idx + 1}` : 'opacity-0',
                'group p-8 bg-white rounded-2xl border-l-[3px] border-kleia-violet hover:shadow-lg transition-all duration-300',
              )}
            >
              <pain.icon className="w-10 h-10 text-kleia-violet mb-4" />
              <h3 className="text-lg font-bold text-kleia-dark mb-2">{pain.title}</h3>
              <p className="text-kleia-gray text-sm leading-relaxed">{pain.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
