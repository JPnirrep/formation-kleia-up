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
  return api.request<Lesson[]>(`/courses/${slug}/modules/${moduleId}/lessons/`);
}

// ── Lesson detail & content endpoints ────────────────────────────────────

export interface LessonDetail {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  order: number;
  lesson_type: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  module: {
    id: string;
    title: string;
    course_id: string;
    lessons: { id: string; title: string; order: number }[];
  };
  videos: {
    id: string;
    title: string;
    playback_url: string | null;
    playback_manifest_url: string | null;
    duration_seconds: number;
    tracks: {
      id: string;
      kind: string;
      language: string;
      label: string;
      file_url: string;
      is_default: boolean;
    }[] | null;
  }[];
  audio: {
    id: string;
    title: string;
    transcript_text: string | null;
    transcript_status: string | null;
  }[];
}

export interface LessonContent {
  lesson_id: string;
  lesson_title: string;
  lesson_type: string;
  video_playlist: {
    id: string;
    title: string;
    playback_url: string | null;
    playback_manifest_url: string | null;
    duration_seconds: number;
    tracks: {
      id: string;
      kind: string;
      language: string;
      label: string;
      file_url: string;
      is_default: boolean;
    }[] | null;
  }[];
  audio_files: {
    id: string;
    title: string;
    transcript_text: string | null;
    transcript_status: string | null;
  }[];
}

export async function getLessonDetail(lessonId: string): Promise<LessonDetail> {
  return api.request<LessonDetail>(`/lessons/${lessonId}`);
}

export async function getLessonContent(lessonId: string): Promise<LessonContent> {
  return api.request<LessonContent>(`/lessons/${lessonId}/content`);
}
