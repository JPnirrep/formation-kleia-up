import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { getMyCertificates, downloadCertificate } from '@/api/certificates';
import { getMyEnrollments } from '@/api/enrollments';
import type { CertificateWithDetails } from '@/api/certificates';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  useEffect(() => { document.title = 'Mon profil — Kleia-up'; }, []);
  const [notifications, setNotifications] = useState({ email: true, progress: true });
  const [certs, setCerts] = useState<CertificateWithDetails[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [certsError, setCertsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyCertificates();
        setCerts(data);
      } catch {
        setCertsError('Erreur de chargement des certificats');
      } finally {
        setCertsLoading(false);
      }
    })();
  }, [user]);

  const handleDownload = async (certId: string) => {
    try {
      const blob = await downloadCertificate(certId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat-${certId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  const [enrollments, setEnrollments] = useState<{ id: string; status: string }[]>([]);
  const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyEnrollments();
        setEnrollments(data);
      } catch {
        setEnrollmentsError('Erreur de chargement des inscriptions');
      }
    })();
  }, []);

  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const startedCourses = enrollments.filter(e => e.status === 'active').length;
  const totalHours = 0; // would need per-course duration from real enrollments

  const stats = [
    { label: 'Formations en cours', value: startedCourses.toString() },
    { label: 'Terminées', value: completedCourses.toString() },
    { label: 'Heures visionnées', value: totalHours.toString() + 'h' },
    { label: 'Certificats', value: certs.length.toString() },
  ];

  if (authLoading) return <Loading text="Chargement du profil..." />;
  if (!user) return <Loading text="Chargement du profil..." />;

  const roleLabel = user.role === 'admin' ? 'Administrateur' : user.role === 'trainer' ? 'Formateur' : 'Apprenant';
  const roleVariant = user.role === 'admin' ? 'danger' : user.role === 'trainer' ? 'warning' : 'info';

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="h-20 w-20 rounded-full gradient-violet flex items-center justify-center text-white text-2xl font-bold font-heading shadow-lg flex-shrink-0">
            {user.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">{user.display_name}</h1>
            <p className="text-kleia-gray font-body">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <Badge variant={roleVariant}>
                {roleLabel}
              </Badge>
              <span className="text-xs text-kleia-gray font-body">
                Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
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
      {enrollmentsError && (
        <p className="text-sm text-red-500 font-body text-center">{enrollmentsError}</p>
      )}

      <section>
        <h2 className="text-xl font-bold font-heading text-kleia-dark mb-4">Mes certificats</h2>
        {certsLoading ? (
          <Loading text="Chargement des certificats..." />
        ) : certsError ? (
          <Card>
            <p className="text-red-500 font-body text-center py-4">
              {certsError}
            </p>
          </Card>
        ) : certs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {certs.map((cert) => (
              <Card key={cert.id} className="border-l-4 border-kleia-gold">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-kleia-dark">{cert.course_title}</h3>
                    <p className="text-sm text-kleia-gray font-body mt-1">
                      Délivré le {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-kleia-gray/60 font-body mt-0.5">
                      N° {cert.certificate_number}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(cert.id)}>
                    Télécharger
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun certificat"
            description="Terminez une formation pour obtenir votre premier certificat."
            icon="empty"
          />
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
                  notifications.email ? 'gradient-violet' : 'bg-kleia-dark/20',
                )}
                role="switch"
                aria-checked={notifications.email}
                aria-label="Notifications par email"
                tabIndex={0}
                onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNotifications(prev => ({ ...prev, email: !prev.email })); } }}
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
