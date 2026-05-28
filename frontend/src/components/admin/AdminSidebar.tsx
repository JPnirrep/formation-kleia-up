import { NavLink } from 'react-router-dom';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Tableau de bord', icon: '📊', end: true },
  { to: '/admin/courses', label: 'Formations', icon: '📚' },
  { to: '/admin/users', label: 'Utilisateurs', icon: '👥' },
  { to: '/admin/enrollments', label: 'Inscriptions', icon: '📋' },
];

export default function AdminSidebar() {
  return (
    <nav className="w-56 flex-shrink-0 bg-white/80 backdrop-blur-sm border-r border-kleia-dark/10 min-h-[calc(100vh-4rem)] p-4 hidden lg:block" aria-label="Navigation administration">
      <ul className="space-y-1">
        {ADMIN_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isActive
                    ? 'bg-kleia-violet/10 text-kleia-violet font-semibold'
                    : 'text-kleia-dark hover:bg-kleia-dark/5 hover:text-kleia-violet'
                }`
              }
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t border-kleia-dark/10">
        <NavLink
          to="/formations"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body text-kleia-gray hover:text-kleia-violet transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          ← Retour au catalogue
        </NavLink>
      </div>
    </nav>
  );
}
