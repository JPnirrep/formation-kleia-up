import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

/* ------------------------------------------------------------------ */
/*  Icones inline                                                        */
/* ------------------------------------------------------------------ */

function IconTarget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}

function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4l3.5 10.5h11l-9 6.5 3.5 10.5L24 25l-9 6.5 3.5-10.5-9-6.5h11L24 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconMic({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="4" width="16" height="24" rx="8" stroke="currentColor" strokeWidth="2" />
      <path d="M10 22c0 7.7 6.3 14 14 14s14-6.3 14-14M24 36v8M16 44h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L6 12v12c0 13.3 7.6 19 18 20 10.4-1 18-6.7 18-20V12L24 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 24l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 42S6 30 6 18c0-6 4.5-10 10-10 3.5 0 6.5 2 8 5 1.5-3 4.5-5 8-5 5.5 0 10 4 10 10 0 12-18 24-18 24z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRocket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 40s-10-7-10-22c0 0 5-4 10-4s10 4 10 4c0 15-10 22-10 22z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="22" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M24 40v-6M19 14l-5-7M29 14l5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="28" width="8" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="18" width="8" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="30" y="12" width="8" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="42" y="8" width="2" height="36" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconPeople({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="14" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="34" cy="16" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M2 42c0-10 7.2-16 16-16s16 6 16 16M26 38c0-7 4-11 10-11s10 4 10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconMobile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="2" width="28" height="44" rx="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="38" r="2" fill="currentColor" />
    </svg>
  );
}

function IconMessage({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 24c0 11-9 20-20 20-2.3 0-4.5-.4-6.5-1.1L8 45l2-8.5C8.8 34 8 31.5 8 29c0-11 9-20 20-20s16 9 16 15z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav                                                                 */
/* ------------------------------------------------------------------ */

function NavHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-[16px] border-b border-kleia-burgundy/10 shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-kleia-burgundy tracking-tight">
              Kleia-up
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="py-2 px-4 text-sm font-semibold text-kleia-burgundy hover:text-kleia-burgundy-light transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="py-2.5 px-5 rounded-xl gradient-burgundy text-white font-semibold text-sm hover:brightness-110 transition-all shadow-md"
            >
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                                */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6]">
      <div className="absolute top-20 -right-32 w-[600px] h-[600px] rounded-full bg-kleia-burgundy/3 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-kleia-gold/6 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block text-sm font-semibold text-kleia-burgundy uppercase tracking-widest mb-4">
              Leadership organique
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-kleia-dark tracking-tight leading-tight mb-6">
              Ta place est
              <br />
              <span className="italic font-normal text-kleia-burgundy">unique</span>. Prends-la.
            </h1>
            <p className="text-lg text-kleia-gray max-w-xl mb-10 leading-relaxed">
              Tant que tu doutes, le bruit des autres occupe l'espace. Kleia-up t'aide à passer du trac à l'impact —
              sans masque, sans posture, juste toi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="py-3.5 px-8 rounded-xl gradient-burgundy text-white font-semibold text-base hover:brightness-110 transition-all shadow-lg inline-flex items-center gap-2"
              >
                Je commence gratuitement
                <IconArrow className="w-5 h-5" />
              </Link>
              <a
                href="#miroir"
                className="py-3.5 px-8 rounded-xl border-2 border-kleia-burgundy/15 text-kleia-burgundy font-semibold text-base hover:bg-kleia-burgundy/5 transition-colors"
              >
                Découvrir
              </a>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-kleia-burgundy/5 to-kleia-gold/10 border border-kleia-burgundy/10 flex items-center justify-center">
                <IconRocket className="w-24 h-24 text-kleia-burgundy/15" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-kleia-burgundy/5">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <IconStar className="w-5 h-5 text-kleia-dark" />
                </div>
                <div>
                  <div className="text-xs text-kleia-gray">Note moyenne</div>
                  <div className="text-lg font-bold text-kleia-dark">4.9/5</div>
                </div>
              </div>
              <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-kleia-burgundy/5">
                <div className="w-10 h-10 rounded-xl gradient-burgundy flex items-center justify-center">
                  <IconPeople className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-kleia-gray">Ils ont osé</div>
                  <div className="text-lg font-bold text-kleia-dark">+500</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Miroir douleur                                                      */
/* ------------------------------------------------------------------ */

function PainMirrorSection() {
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

  return (
    <section id="miroir" className="py-24 bg-[#FFF8F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-kleia-dark mb-4">
            La place que tu ne prends pas est <span className="text-kleia-burgundy">occupée par d'autres.</span>
          </h2>
          <p className="text-kleia-gray max-w-xl mx-auto text-lg">
            Tu n'es pas cassé·e. Tu es juste passé·e à côté de ta propre puissance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pains.map((pain) => (
            <div
              key={pain.title}
              className="group p-8 bg-white rounded-2xl border-l-[3px] border-kleia-burgundy hover:shadow-lg transition-all duration-300"
            >
              <pain.icon className="w-10 h-10 text-kleia-burgundy mb-4" />
              <h3 className="text-lg font-bold text-kleia-dark mb-2">{pain.title}</h3>
              <p className="text-kleia-gray text-sm leading-relaxed">{pain.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Manifeste teaser                                                     */
/* ------------------------------------------------------------------ */

function ManifestSection() {
  return (
    <section className="py-24 bg-kleia-cream text-center">
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
          className="inline-flex items-center gap-2 py-3.5 px-10 rounded-xl gradient-burgundy text-white font-bold text-base hover:brightness-110 transition-all shadow-lg"
        >
          Je découvre le manifeste
          <IconArrow className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Transformation (avant/après)                                        */
/* ------------------------------------------------------------------ */

function TransformationSection() {
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
    <section className="py-24 bg-white">
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
          {steps.map((s) => (
            <div
              key={s.step}
              className="relative group p-8 rounded-2xl hover:bg-kleia-cream/50 transition-colors duration-300"
            >
              <span className="text-5xl font-extrabold text-kleia-burgundy/10 group-hover:text-kleia-burgundy/20 transition-colors">
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

/* ------------------------------------------------------------------ */
/*  Features                                                             */
/* ------------------------------------------------------------------ */

function FeaturesSection() {
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

  return (
    <section className="py-24 bg-kleia-cream">
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
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 bg-white rounded-2xl border border-kleia-burgundy/5 hover:shadow-lg hover:border-kleia-gold/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-kleia-burgundy/5 flex items-center justify-center mb-4 group-hover:bg-kleia-burgundy/10 transition-colors">
                <f.icon className="w-6 h-6 text-kleia-burgundy" />
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

/* ------------------------------------------------------------------ */
/*  Use Cases tabs                                                       */
/* ------------------------------------------------------------------ */

function UseCasesSection() {
  const [active, setActive] = useState(0);
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

  const current = cases[active];

  return (
    <section className="py-24 bg-white">
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
                    ? 'bg-white text-kleia-burgundy shadow-md'
                    : 'text-kleia-gray hover:text-kleia-dark',
                )}
              >
                {c.tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
          <div className="aspect-[4/3] rounded-2xl bg-kleia-cream border border-kleia-burgundy/5 flex items-center justify-center">
            <current.icon className="w-20 h-20 text-kleia-burgundy/15" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-kleia-dark mb-4">{current.title}</h3>
            <p className="text-kleia-gray text-lg leading-relaxed mb-6">{current.desc}</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-kleia-burgundy font-semibold hover:underline"
            >
              En savoir plus <IconArrow className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Social Proof                                                         */
/* ------------------------------------------------------------------ */

function SocialProofSection() {
  return (
    <section className="py-24 bg-kleia-cream">
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
          ].map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-8 border border-kleia-burgundy/5"
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

/* ------------------------------------------------------------------ */
/*  CTA final                                                            */
/* ------------------------------------------------------------------ */

function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-kleia-burgundy to-kleia-burgundy-light text-white overflow-hidden relative">
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
          className="inline-flex items-center gap-2 py-4 px-10 rounded-xl bg-white text-kleia-burgundy font-bold text-base hover:brightness-95 transition-all shadow-xl"
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

/* ------------------------------------------------------------------ */
/*  Footer                                                               */
/* ------------------------------------------------------------------ */

function LandingFooter() {
  return (
    <footer className="bg-kleia-dark text-white">
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

/* ------------------------------------------------------------------ */
/*  Page                                                                 */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="antialiased">
      <NavHeader />
      <main id="main-content">
        <HeroSection />
        <PainMirrorSection />
        <ManifestSection />
        <TransformationSection />
        <FeaturesSection />
        <UseCasesSection />
        <SocialProofSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
