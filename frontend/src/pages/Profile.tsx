import { useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { mockCertificates, mockCourses, getCompletedCourses } from '@/mock';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState({ email: true, progress: true });
  const completedCourses = getCompletedCourses();
  const startedCourses = mockCourses.filter(c => c.progress > 0 && c.progress < 100);
  const totalHours = mockCourses.reduce((acc, c) => {
    const h = parseInt(c.duration);
    return acc + (isNaN(h) ? 0 : h);
  }, 0);

  const stats = [
    { label: 'Formations en cours', value: startedCourses.length.toString() },
    { label: 'Terminées', value: completedCourses.length.toString() },
    { label: 'Heures visionnées', value: totalHours.toString() + 'h' },
    { label: 'Certificats', value: mockCertificates.length.toString() },
  ];

  if (authLoading) return <Loading text="Chargement du profil..." />;
  if (!user) return <Loading text="Chargement du profil..." />;

  const roleLabel = user.role === 'admin' ? 'Administrateur' : user.role === 'trainer' ? 'Formateur' : 'Apprenant';
  const roleVariant = user.role === 'admin' ? 'danger' : user.role === 'trainer' ? 'warning' : 'info';

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="h-20 w-20 rounded-full gradient-burgundy flex items-center justify-center text-white text-2xl font-bold font-heading shadow-lg flex-shrink-0">
            {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.initials}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">{user.display_name}</h1>
            <p className="text-kleia-gray font-body">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <Badge variant={roleVariant}>
                {roleLabel}
              </Badge>
              <span className="text-xs text-kleia-gray font-body">
                Membre depuis {new Date().toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-3xl font-bold font-heading text-kleia-dark">{stat.value}</p>
            <p className="text-sm text-kleia-gray font-body mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold font-heading text-kleia-dark mb-4">Mes certificats</h2>
        {mockCertificates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {mockCertificates.map((cert) => (
              <Card key={cert.id} className="border-l-4 border-kleia-gold">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-kleia-dark">{cert.courseName}</h3>
                    <p className="text-sm text-kleia-gray font-body mt-1">
                      Délivré le {cert.issuedDate}
                    </p>
                    <p className="text-xs text-kleia-gray/60 font-body mt-0.5">
                      N° {cert.certificateNumber}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    Télécharger
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-kleia-gray font-body text-center py-4">
              Aucun certificat obtenu pour le moment.
            </p>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold font-heading text-kleia-dark mb-4">Paramètres du compte</h2>
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-kleia-dark font-body">Notifications par email</p>
                <p className="text-sm text-kleia-gray font-body">Recevoir des mises à jour sur mes formations</p>
              </div>
              <div
                className={clsx(
                  'w-12 h-6 rounded-full p-0.5 cursor-pointer transition-colors',
                  notifications.email ? 'gradient-burgundy' : 'bg-kleia-dark/20',
                )}
                role="switch"
                aria-checked={notifications.email}
                aria-label="Notifications par email"
                tabIndex={0}
                onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
              >
                <div
                  className={clsx(
                    'w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                    notifications.email && 'translate-x-6',
                  )}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-kleia-dark/10">
              <div>
                <p className="font-medium text-kleia-dark font-body">Langue</p>
                <p className="text-sm text-kleia-gray font-body">Français</p>
              </div>
              <span className="text-sm text-kleia-gray font-body" aria-hidden="true">🇫🇷</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
