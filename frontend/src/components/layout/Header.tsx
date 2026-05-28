import { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

interface NavLinkItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const navLinks: NavLinkItem[] = [
  { to: '/', label: 'Tableau de bord' },
  { to: '/formations', label: 'Mes formations' },
  { to: '/coaching', label: 'Lien Direct' },
  { to: '/profil', label: 'Mon profil' },
  { to: '/admin', label: 'Administration', adminOnly: true },
  { to: '/admin/courses', label: 'Gérer les formations', adminOnly: true },
  { to: '/admin/users', label: 'Gérer les utilisateurs', adminOnly: true },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, loading, logout } = useAuth();
  const visibleLinks = navLinks.filter(
    (link) => !link.adminOnly || user?.role === 'admin',
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-[16px] border-b border-white/20 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg">
            <span className="text-2xl font-extrabold font-heading text-kleia-violet tracking-tight">
              Kleia-up
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'text-sm font-medium font-heading transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none rounded-md',
                    isActive
                      ? 'text-kleia-violet'
                      : 'text-kleia-gray hover:text-kleia-violet',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {loading ? null : user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-9 w-9 rounded-full gradient-violet flex items-center justify-center text-white text-sm font-bold font-heading">
                    {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-kleia-dark">{user.display_name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-[16px] border border-white/20 shadow-glass rounded-xl py-2">
                    <NavLink
                      to="/profil"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-kleia-dark hover:bg-kleia-violet/5 transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none rounded-md"
                    >
                      Mon profil
                    </NavLink>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-kleia-dark hover:bg-kleia-violet/5 transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none rounded-md"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="py-2 px-4 rounded-lg gradient-violet text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Connexion
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-kleia-dark hover:bg-kleia-dark/5 transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'block px-3 py-2 rounded-lg text-sm font-medium font-heading transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none',
                    isActive
                      ? 'text-kleia-violet bg-kleia-violet/5'
                      : 'text-kleia-gray hover:text-kleia-violet hover:bg-kleia-violet/5',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {loading ? null : user ? (
              <div className="flex items-center gap-3 px-3 py-2 mt-2 border-t border-kleia-dark/10 pt-3">
                <div className="h-8 w-8 rounded-full gradient-violet flex items-center justify-center text-white text-xs font-bold font-heading">
                  {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="text-sm font-medium text-kleia-dark">{user.display_name}</span>
              </div>
            ) : (
              <div className="px-3 py-2 mt-2 border-t border-kleia-dark/10 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2 px-4 rounded-lg gradient-violet text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Connexion
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}