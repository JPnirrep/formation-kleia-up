import api from './client';

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  level: string;
  duration_seconds: number;
  thumbnail_url: string | null;
  status: string;
  category: string | null;
  modules?: number | Module[];
  lessons: number;
  progress?: number;
  instructor?: string;
}

export interface CourseDetail extends Course {
  modules?: Module[];
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lesson_type: string;
  duration_seconds: number;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function getCourses(params?: {
  skip?: number;
  limit?: number;
  level?: string;
  category?: string;
}): Promise<PaginatedResponse<Course>> {
  const searchParams = new URLSearchParams();
  if (params?.skip) searchParams.set('skip', String(params.skip));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.level) searchParams.set('level', params.level);
  if (params?.category) searchParams.set('category', params.category);
  const qs = searchParams.toString();
  return api.request<PaginatedResponse<Course>>(`/courses/${qs ? `?${qs}` : ''}`);
}

export async function getCourse(slug: string): Promise<CourseDetail> {
  return api.request<CourseDetail>(`/courses/${slug}`);
}

export async function getCourseModules(slug: string): Promise<Module[]> {
  return api.request<Module[]>(`/courses/${slug}/modules`);
}

export async function getModuleLessons(slug: string, moduleId: string): Promise<Lesson[]> {
  return api.request<Lesson[]>(`/courses/${slug}/modules/${moduleId}/lessons`);
}
