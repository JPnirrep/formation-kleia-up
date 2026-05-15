import api from './client';

export interface JournalEntry {
  id: string;
  user_id: string;
  lesson_id: string | null;
  content: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryCreate {
  lesson_id?: string;
  content: string;
  is_shared?: boolean;
}

export interface JournalEntryUpdate {
  content?: string;
  is_shared?: boolean;
}

export interface PaginatedJournalResponse {
  items: JournalEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Récupérer les entrées de journal
 */
export async function getJournalEntries(params?: {
  skip?: number;
  limit?: number;
  lesson_id?: string;
}): Promise<PaginatedJournalResponse> {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set('skip', String(params.skip));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.lesson_id) searchParams.set('lesson_id', params.lesson_id);
  const qs = searchParams.toString();
  return api.request<PaginatedJournalResponse>(`/journal${qs ? `?${qs}` : ''}`);
}

/**
 * Créer une entrée dans le journal
 */
export async function createJournalEntry(data: JournalEntryCreate): Promise<JournalEntry> {
  return api.request<JournalEntry>('/journal', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Mettre à jour une entrée de journal
 */
export async function updateJournalEntry(id: string, data: JournalEntryUpdate): Promise<JournalEntry> {
  return api.request<JournalEntry>(`/journal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Supprimer une entrée de journal
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  return api.request<void>(`/journal/${id}`, {
    method: 'DELETE',
  });
}
