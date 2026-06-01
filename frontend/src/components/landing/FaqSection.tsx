import { useState } from 'react';
import clsx from 'clsx';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "Kleia-up, c'est quoi exactement ?",
    answer: "Kleia-up est une plateforme de formation au leadership organique. Nous t'aidons à développer ta prise de parole, ta confiance et ton impact — sans masque, sans posture imposée, juste toi.",
  },
  {
    question: "Est-ce que c'est pour les personnes sensibles / atypiques ?",
    answer: "Oui, totalement. Notre pédagogie est conçue pour les profils HPI, HSP et hypersensibles. Ta sensibilité n'est pas un problème à résoudre : c'est ta plus grande force, et on va t'aider à l'incarner.",
  },
  {
    question: "Combien de temps dure une formation ?",
    answer: "Nos formations sont modulaires : chaque pilier dure entre 4 et 8 semaines, à raison de 2 à 4 heures par semaine. Tu avances à ton rythme, sans pression.",
  },
  {
    question: "Est-ce que le premier module est vraiment gratuit ?",
    answer: "Oui. Le premier module de chaque formation est accessible gratuitement. Cela te permet de découvrir la méthode et de voir si elle te correspond avant de t'engager.",
  },
  {
    question: "Comment se passe le coaching ?",
    answer: "Le coaching est intégré à la plateforme : tu as accès à un espace de suivi personnalisé, des exercices pratiques et des feedbacks. Pour les formules avancées, des sessions individuelles sont proposées.",
  },
  {
    question: "Puis-je former mon équipe avec Kleia-up ?",
    answer: "Absolument. Nous proposons des formules entreprise avec un suivi dédié, des tableaux de bord de progression et des ateliers collectifs. Contacte-nous pour un devis.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useScrollReveal<HTMLElement>();

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className={clsx('py-24 bg-white', isVisible ? 'animate-reveal' : 'opacity-0')}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-4">
            Questions fréquentes
          </h2>
          <p className="text-kleia-gray max-w-xl mx-auto">
            Tout ce que tu dois savoir avant de te lancer.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-kleia-violet/10 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggle(index)}
                className={clsx(
                  'w-full flex items-center justify-between p-5 text-left transition-colors',
                  openIndex === index ? 'bg-kleia-violet/5' : 'hover:bg-kleia-cream',
                )}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-bold text-kleia-dark text-sm sm:text-base pr-8">{item.question}</span>
                <span
                  className={clsx(
                    'text-kleia-violet text-xl flex-shrink-0 transition-transform duration-300',
                    openIndex === index ? 'rotate-45' : '',
                  )}
                >
                  +
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                className={clsx(
                  'overflow-hidden transition-all duration-300',
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                )}
              >
                <p className="px-5 pb-5 text-kleia-gray leading-relaxed text-sm sm:text-base">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm text-kleia-gray">
          Tu ne trouves pas ta réponse ?{' '}
          <a href="mailto:contact@kleia-up.com" className="text-kleia-violet font-semibold hover:underline">
            Écris-nous
          </a>
        </p>
      </div>
    </section>
  );
}
