import { useEffect, useState, useCallback } from 'react';
import { Award, Download, FileText } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { useApi } from '@/hooks/useApi';
import {
  getMyCertificates,
  downloadCertificate,
  type CertificateWithDetails,
} from '@/api/certificates';

export default function CertificatsPage() {
  useEffect(() => { document.title = 'Certificats — Kleia-up'; }, []);
  const { data, loading, error, refetch } = useApi(() => getMyCertificates(), []);
  const [downloading, setDownloading] = useState<string | null>(null);

  const certificates: CertificateWithDetails[] = data || [];

  const handleDownload = useCallback(async (id: string, courseTitle: string) => {
    setDownloading(id);
    try {
      const blob = await downloadCertificate(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificat-${courseTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement certificat:', err);
    } finally {
      setDownloading(null);
    }
  }, []);

  if (loading) return <Loading className="py-20" text="Chargement des certificats..." />;

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">
          Connectez-vous pour accéder à vos certificats.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-violet">
          🏅 Mes Certificats
        </h1>
        <p className="text-kleia-gray font-body mt-1">
          Vos certifications obtenues en complétant les formations.
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          title="Aucun certificat"
          description="Terminez une formation pour débloquer votre premier certificat !"
          icon="empty"
          actionLabel="Voir les formations"
          onAction={() => { window.location.href = '/formations'; }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="flex flex-col justify-between">
              <div className="flex items-start gap-3 mb-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-kleia-gold/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-kleia-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold font-heading text-kleia-dark text-lg leading-tight">
                    {cert.course_title}
                  </h3>
                  <Badge variant="info" className="mt-1">
                    N° {cert.certificate_number}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-kleia-dark/5">
                <span className="text-xs text-kleia-gray font-body flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Délivré le {new Date(cert.issued_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  loading={downloading === cert.id}
                  onClick={() => handleDownload(cert.id, cert.course_title)}
                >
                  <Download className="w-4 h-4" /> PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
