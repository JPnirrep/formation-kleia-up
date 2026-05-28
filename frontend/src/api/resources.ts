import api from './client';

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export async function uploadResource(
  lessonId: string,
  file: File,
  title?: string,
): Promise<LessonResource> {
  const token = api.getToken();
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);

  const res = await fetch(`/api/v1/admin/lessons/${lessonId}/resources`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur upload');
  return res.json();
}

export async function listLessonResources(lessonId: string): Promise<LessonResource[]> {
  return api.request<LessonResource[]>(`/admin/lessons/${lessonId}/resources`);
}

export async function deleteResource(resourceId: string): Promise<void> {
  return api.request(`/admin/resources/${resourceId}`, { method: 'DELETE' });
}
