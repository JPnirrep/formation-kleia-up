import api from './client';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface CertificateWithDetails extends Certificate {
  user_name: string;
  course_title: string;
  course_slug: string;
}

export async function getMyCertificates(): Promise<CertificateWithDetails[]> {
  return api.request<CertificateWithDetails[]>('/certificates/my');
}

export async function getCertificate(id: string): Promise<CertificateWithDetails> {
  return api.request<CertificateWithDetails>(`/certificates/${id}`);
}

export async function generateCertificate(courseId: string): Promise<CertificateWithDetails> {
  return api.request<CertificateWithDetails>(`/certificates/${courseId}/generate`, {
    method: 'POST',
  });
}

export async function downloadCertificate(id: string): Promise<Blob> {
  const token = api.getToken();
  const res = await fetch(`/api/v1/certificates/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Erreur lors du téléchargement');
  return res.blob();
}
