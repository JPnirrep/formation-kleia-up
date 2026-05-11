import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { mockUser } from '@/mock';

interface NavLinkItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const navLinks: NavLinkItem[] = [
  { to: '/', label: 'Tableau de bord' },
  { to: '/formations', label: 'Mes formations' },
  { to: '/profil', label: 'Mon profil' },
  { to: '/admin', label: 'Administration', adminOnly: true },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleLinks = navLinks.filter(
    (link) => !link.adminOnly || mockUser.role === 'admin',
  );

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-[16px] border-b border-white/20 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold font-heading text-kleia-burgundy tracking-tight">
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
                    'text-sm font-medium font-heading transition-colors',
                    isActive
                      ? 'text-kleia-burgundy'
                      : 'text-kleia-gray hover:text-kleia-burgundy',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="h-9 w-9 rounded-full gradient-burgundy flex items-center justify-center text-white text-sm font-bold font-heading">
              {mockUser.initials}
            </div>
            <span className="text-sm font-medium text-kleia-dark">{mockUser.name}</span>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-kleia-dark hover:bg-kleia-dark/5 transition-colors"
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
                    'block px-3 py-2 rounded-lg text-sm font-medium font-heading transition-colors',
                    isActive
                      ? 'text-kleia-burgundy bg-kleia-burgundy/5'
                      : 'text-kleia-gray hover:text-kleia-burgundy hover:bg-kleia-burgundy/5',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex items-center gap-3 px-3 py-2 mt-2 border-t border-kleia-dark/10 pt-3">
              <div className="h-8 w-8 rounded-full gradient-burgundy flex items-center justify-center text-white text-xs font-bold font-heading">
                {mockUser.initials}
              </div>
              <span className="text-sm font-medium text-kleia-dark">{mockUser.name}</span>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
