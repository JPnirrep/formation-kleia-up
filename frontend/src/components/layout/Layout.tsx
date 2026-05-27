import { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme, type Theme } from '@/context/ThemeContext';
import clsx from 'clsx';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { to: '/formations', label: 'Mes formations', icon: '📚' },
  { to: '/journal', label: 'Journal', icon: '✍️' },
  { to: '/coaching', label: 'Coach', icon: '💬' },
  { to: '/profil', label: 'Mon profil', icon: '👤' },
  { to: '/certificats', label: 'Certificats', icon: '🏅' },
  { to: '/admin', label: 'Administration', icon: '⚙️', adminOnly: true },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const visibleItems = navItems.filter(
    (i) => !i.adminOnly || user?.role === 'admin',
  );

  const isActive = (to: string) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ─── Sidebar (Cloned from Mockup) ─── */}
      <aside
        className={clsx(
          'sidebar flex flex-col h-full transition-all duration-300 shrink-0 z-50',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
          {!collapsed && (
            <Link to="/" className="text-xl font-extrabold font-heading text-[#FFFDF9] tracking-tighter uppercase">
              Kleia<span className="text-[#D4AF37]">up</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[#A89A90] hover:text-[#FFFDF9] hover:bg-white/5 transition-all"
            aria-label={collapsed ? 'Développer' : 'Réduire'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-6 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() => clsx(
                'sidebar-link group',
                isActive(item.to) && 'active'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className={clsx(
                'text-lg transition-transform group-hover:scale-110',
                isActive(item.to) ? 'opacity-100' : 'opacity-70'
              )}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Theme Selector (Clair is Hybrid, Sombre is Full Dark) */}
        <div className={clsx('px-3 py-4 border-t border-white/5', collapsed && 'px-1')}>
          {!collapsed ? (
            <div className="flex gap-1 bg-black/30 rounded-xl p-1">
              <button
                onClick={() => setTheme('dark')}
                className={clsx(
                  'flex-1 py-2 text-[10px] font-heading font-bold rounded-lg transition-all uppercase tracking-widest',
                  theme === 'dark'
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-[#A89A90] hover:text-white'
                )}
              >
                Sombre
              </button>
              <button
                onClick={() => setTheme('light')}
                className={clsx(
                  'flex-1 py-2 text-[10px] font-heading font-bold rounded-lg transition-all uppercase tracking-widest',
                  theme === 'light'
                    ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20'
                    : 'text-[#A89A90] hover:text-white'
                )}
              >
                Clair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={clsx(
                'w-full p-2.5 rounded-lg transition-all flex justify-center items-center',
                theme === 'light' ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-[#A89A90] hover:bg-white/5'
              )}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          )}
        </div>

        {/* User Profile */}
        {user && !collapsed && (
          <div className="px-3 py-4 border-t border-white/5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#D4A97A] to-[#E0B988] flex items-center justify-center text-white text-sm font-bold font-heading shadow-lg">
              {user.display_name?.charAt(0).toUpperCase() || 'K'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#FFFDF9] truncate font-heading uppercase tracking-tighter">{user.display_name}</p>
              <button
                onClick={logout}
                className="text-[10px] uppercase font-bold tracking-tighter text-[#A89A90] hover:text-[#D4A97A] transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ─── Main Content Area ─── */}
      <main id="main-content" className="flex-1 overflow-y-auto">
        <div className="min-h-full max-w-6xl mx-auto px-6 sm:px-10 py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
