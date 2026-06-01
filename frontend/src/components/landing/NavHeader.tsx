import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function NavHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || menuOpen
            ? 'bg-white/95 backdrop-blur-[16px] border-b border-kleia-violet/10 shadow-sm'
            : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link to="/" className="flex items-center gap-2 z-50" onClick={closeMenu}>
              <span className="text-2xl font-extrabold text-kleia-violet tracking-tight">
                Kleia-up
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="py-2 px-4 text-sm font-semibold text-kleia-violet hover:text-kleia-violet-light transition-colors"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="py-2.5 px-5 rounded-xl gradient-violet text-white font-semibold text-sm hover:brightness-110 transition-all shadow-md"
              >
                Commencer
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden z-50 p-2 -mr-2 rounded-lg text-kleia-violet hover:bg-kleia-violet/5 transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:outline-none"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                {menuOpen ? (
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <>
                    <span className="w-full h-0.5 bg-kleia-violet rounded transition-transform duration-200" />
                    <span className="w-full h-0.5 bg-kleia-violet rounded" />
                    <span className="w-3/4 h-0.5 bg-kleia-violet rounded transition-all duration-200" />
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-300 md:hidden',
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
        )}
      >
        <nav className="flex flex-col items-center gap-6">
          <Link
            to="/login"
            onClick={closeMenu}
            className="text-xl font-semibold text-kleia-violet hover:text-kleia-violet-light transition-colors py-2 px-8"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            onClick={closeMenu}
            className="text-xl font-semibold py-3 px-10 rounded-xl gradient-violet text-white hover:brightness-110 transition-all shadow-lg"
          >
            Commencer
          </Link>
        </nav>
        <p className="absolute bottom-8 text-sm text-kleia-gray font-body">
          Leadership organique
        </p>
      </div>
    </>
  );
}
