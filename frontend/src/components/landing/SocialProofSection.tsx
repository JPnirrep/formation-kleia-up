import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { IconStar } from './icons';

export default function SocialProofSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  return (
    <section ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'py-24 bg-kleia-cream',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-4">
            Ce qu'ils disent après avoir sauté le pas
          </h2>
        </div>

        {/* Logos */}
        <div className="flex flex-wrap justify-center items-center gap-12 mb-16 opacity-30">
          <span className="text-3xl font-extrabold text-kleia-gray select-none">Le Figaro</span>
          <span className="text-3xl font-extrabold text-kleia-gray select-none">Microsoft</span>
          <span className="text-3xl font-extrabold text-kleia-gray select-none">CEVA</span>
        </div>

        {/* Témoignages */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              text: "Je pensais que ma sensibilité était un frein. Sandrina m'a montré que c'était ma plus grande force. J'ai enfin pris la parole sans trembler.",
              name: 'Claire D.',
              role: 'Entrepreneure, Nantes',
            },
            {
              text: "Avant, je préparais mes prises de parole pendant des heures. Maintenant, je suis moi-même et ça passe. Mieux : ça impacte.",
              name: 'Marc L.',
              role: 'Manager, La Roche-sur-Yon',
            },
          ].map((t, idx) => (
            <div
              key={t.name}
              className={clsx(
                isVisible ? `animate-reveal animate-reveal-delay-${idx + 1}` : 'opacity-0',
                'bg-white rounded-2xl p-8 border border-kleia-violet/5',
              )}
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <IconStar key={s} className="w-4 h-4 text-kleia-gold" />
                ))}
              </div>
              <p className="text-kleia-dark italic leading-relaxed mb-4">"{t.text}"</p>
              <div className="text-sm">
                <div className="font-bold text-kleia-dark">{t.name}</div>
                <div className="text-kleia-gray">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
