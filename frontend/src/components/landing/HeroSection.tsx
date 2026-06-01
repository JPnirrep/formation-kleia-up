import { Link } from 'react-router-dom';
import { IconArrow, IconRocket, IconStar, IconPeople } from './icons';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#fdfbf7] via-white to-[#fdf4e6]">
      <div className="absolute top-20 -right-32 w-[600px] h-[600px] rounded-full bg-kleia-violet/3 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-kleia-gold/6 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block text-sm font-semibold text-kleia-violet uppercase tracking-widest mb-4">
              Leadership organique
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-kleia-dark tracking-tight leading-tight mb-6">
              Ta place est
              <br />
              <span className="italic font-normal text-kleia-violet">unique</span>. Prends-la.
            </h1>
            <p className="text-lg text-kleia-gray max-w-xl mb-10 leading-relaxed">
              Tant que tu doutes, le bruit des autres occupe l'espace. Kleia-up t'aide à passer du trac à l'impact —
              sans masque, sans posture, juste toi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="py-3.5 px-8 rounded-xl gradient-violet text-white font-semibold text-base hover:brightness-110 transition-all shadow-lg inline-flex items-center gap-2"
              >
                Je commence gratuitement
                <IconArrow className="w-5 h-5" />
              </Link>
              <a
                href="#miroir"
                className="py-3.5 px-8 rounded-xl border-2 border-kleia-violet/15 text-kleia-violet font-semibold text-base hover:bg-kleia-violet/5 transition-colors"
              >
                Découvrir
              </a>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main illustration: abstract geometric "leadership" composition */}
              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-kleia-violet/5 via-white/90 to-kleia-gold/5 border border-kleia-violet/10 overflow-hidden relative">
                {/* Top gradient blob */}
                <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-gradient-to-br from-kleia-violet/15 to-transparent blur-2xl" />
                {/* Bottom gradient blob */}
                <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-gradient-to-tr from-kleia-gold/10 to-transparent blur-2xl" />
                
                {/* Center: layered geometric shapes */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Outer circle */}
                    <div className="absolute inset-0 rounded-full border-2 border-kleia-violet/10" />
                    {/* Middle circle */}
                    <div className="absolute inset-4 rounded-full border-2 border-kleia-violet/20 bg-kleia-violet/5" />
                    {/* Inner circle */}
                    <div className="absolute inset-10 rounded-full bg-gradient-to-br from-kleia-violet to-kleia-violet-light flex items-center justify-center shadow-lg">
                      <IconRocket className="w-16 h-16 text-white" />
                    </div>
                    
                    {/* Orbiting dots */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-kleia-gold" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-kleia-gold/60" />
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-kleia-violet/40" />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-kleia-violet/30" />
                  </div>
                </div>
                
                {/* Decorative lines */}
                <div className="absolute top-8 left-8 w-12 h-[2px] bg-kleia-gold/40 rounded-full" />
                <div className="absolute top-12 left-8 w-8 h-[2px] bg-kleia-gold/30 rounded-full" />
                <div className="absolute bottom-8 right-8 w-16 h-[2px] bg-kleia-violet/30 rounded-full" />
                <div className="absolute bottom-12 right-8 w-10 h-[2px] bg-kleia-violet/20 rounded-full" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-kleia-violet/5">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <IconStar className="w-5 h-5 text-kleia-dark" />
                </div>
                <div>
                  <div className="text-xs text-kleia-gray">Note moyenne</div>
                  <div className="text-lg font-bold text-kleia-dark">4.9/5</div>
                </div>
              </div>
              <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-kleia-violet/5">
                <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center">
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
