import api from './client';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  granted_at: string;
  completed_at?: string;
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  return api.request<Enrollment[]>('/enrollments/my');
}
