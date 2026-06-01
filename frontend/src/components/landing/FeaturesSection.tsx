import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { IconMic, IconTarget, IconHeart, IconChart, IconMobile, IconMessage } from './icons';

const features = [
  {
    icon: IconMic,
    title: 'Prise de parole incarnée',
    desc: 'Dépasse le trac. Apprends à parler avec ton corps, ta voix, ton souffle — sans réciter.',
  },
  {
    icon: IconTarget,
    title: 'Coaching sur mesure',
    desc: 'Pas de méthode générique. Un accompagnement qui part de ta singularité, HPI, HSP ou atypique.',
  },
  {
    icon: IconHeart,
    title: 'Confiance durable',
    desc: 'Ce n\'est pas du développement personnel. C\'est une transformation profonde qui reste.',
  },
  {
    icon: IconChart,
    title: 'Progression visible',
    desc: 'Des exercices concrets, des feedbacks précis, et une montée en compétence que tu mesures.',
  },
  {
    icon: IconMobile,
    title: 'Accessible partout',
    desc: 'Depuis ton mobile. Des modules courts qui s\'intègrent dans ta vie, pas l\'inverse.',
  },
  {
    icon: IconMessage,
    title: 'Communauté bienveillante',
    desc: 'Échange avec d\'autres leaders sensibles. Brise l\'isolement, cultive l\'entraide.',
  },
];

export default function FeaturesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  return (
    <section ref={ref} className={clsx(
      isVisible ? 'animate-reveal' : 'opacity-0',
      'py-24 bg-kleia-cream',
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-4">
            Tout pour t'aider à prendre ta place
          </h2>
          <p className="text-kleia-gray max-w-xl mx-auto">
            Une plateforme pensée pour les leaders sensibles qui veulent impacter sans se trahir.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={f.title}
              className={clsx(
                isVisible ? `animate-reveal animate-reveal-delay-${idx + 1}` : 'opacity-0',
                'group p-6 bg-white rounded-2xl border border-kleia-violet/5 hover:shadow-lg hover:border-kleia-gold/30 transition-all duration-300',
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-kleia-violet/5 flex items-center justify-center mb-4 group-hover:bg-kleia-violet/10 transition-colors">
                <f.icon className="w-6 h-6 text-kleia-violet" />
              </div>
              <h3 className="text-lg font-bold text-kleia-dark mb-2">{f.title}</h3>
              <p className="text-kleia-gray text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
