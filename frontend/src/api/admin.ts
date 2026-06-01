import api from './client';
import type {
  CourseCreate, CourseUpdate, ModuleCreate, LessonCreate, EnrollmentGrant,
} from '../types';
import type { Course, Module, Lesson, PaginatedResponse } from './courses';
import type { Enrollment } from './enrollments';

export async function createCourse(data: CourseCreate): Promise<Course> {
  return api.request<Course>('/admin/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(courseId: string, data: CourseUpdate): Promise<Course> {
  return api.request<Course>(`/admin/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(courseId: string): Promise<void> {
  return api.request(`/admin/courses/${courseId}`, { method: 'DELETE' });
}

export async function getAdminCourses(params?: { limit?: number; status?: string }): Promise<PaginatedResponse<Course>> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status_filter', params.status);
  const qs = query.toString();
  return api.request<PaginatedResponse<Course>>(`/admin/courses${qs ? '?' + qs : ''}`);
}

export async function createModule(courseId: string, data: ModuleCreate): Promise<Module> {
  return api.request<Module>(`/admin/courses/${courseId}/modules`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteModule(moduleId: string): Promise<void> {
  return api.request(`/admin/modules/${moduleId}`, { method: 'DELETE' });
}

export async function createLesson(moduleId: string, data: LessonCreate): Promise<Lesson> {
  return api.request<Lesson>(`/admin/modules/${moduleId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLesson(lessonId: string, data: Record<string, unknown>): Promise<Lesson> {
  return api.request<Lesson>(`/admin/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  return api.request(`/admin/lessons/${lessonId}`, { method: 'DELETE' });
}

export async function updateModule(moduleId: string, data: { title?: string; order?: number }): Promise<Module> {
  return api.request<Module>(`/admin/modules/${moduleId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function reorderLesson(lessonId: string, order: number): Promise<Lesson> {
  return api.request<Lesson>(`/admin/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify({ order }),
  });
}

export interface VideoAsset {
  id: string;
  title: string;
  playback_url: string | null;
}

export async function listLessonVideos(lessonId: string): Promise<VideoAsset[]> {
  return api.request<VideoAsset[]>(`/admin/lessons/${lessonId}/videos`);
}

export async function addYoutubeVideo(
  lessonId: string,
  youtubeUrl: string,
  title?: string,
): Promise<VideoAsset> {
  return api.request<VideoAsset>(`/admin/lessons/${lessonId}/videos/link`, {
    method: 'POST',
    body: JSON.stringify({
      lesson_id: lessonId,
      title: title || 'Vidéo YouTube',
      playback_url: youtubeUrl,
      status: 'published',
      visibility: 'published',
    }),
  });
}

export async function deleteVideo(videoId: string): Promise<void> {
  return api.request(`/admin/videos/${videoId}`, { method: 'DELETE' });
}

export async function uploadVideoFile(
  lessonId: string,
  file: File,
  title?: string,
  onProgress?: (pct: number) => void,
): Promise<VideoAsset> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/v1/admin/lessons/${lessonId}/videos`);

    const token = api.getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Erreur upload vidéo'));
      }
    };

    xhr.onerror = () => reject(new Error('Erreur réseau'));

    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);

    xhr.send(fd);
  });
}

export async function grantEnrollment(data: EnrollmentGrant): Promise<Enrollment> {
  return api.request<Enrollment>('/enrollments/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface EnrollmentListResponse {
  items: Enrollment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function listEnrollments(): Promise<EnrollmentListResponse> {
  return api.request<EnrollmentListResponse>('/admin/enrollments');
}

export async function deleteEnrollment(enrollmentId: string): Promise<void> {
  return api.request(`/admin/enrollments/${enrollmentId}`, { method: 'DELETE' });
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: string,
): Promise<Enrollment> {
  return api.request<Enrollment>(
    `/admin/enrollments/${enrollmentId}?status_field=${status}`,
    { method: 'PATCH' },
  );
}

export interface AdminStats {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  active_enrollments: number;
  total_video_plays: number;
  unique_viewers: number;
  total_video_completions: number;
  completion_rate_percent: number;
  total_watch_time_seconds: number;
}

export interface EventTimelineEntry {
  date: string;
  plays: number;
  heartbeats: number;
  pauses: number;
  seeks: number;
  ended: number;
}

export interface EventStats {
  timeline: EventTimelineEntry[];
  total_events: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  return api.request<AdminStats>('/admin/stats');
}

export async function getEventStats(days: number = 14): Promise<EventStats> {
  return api.request<EventStats>(`/admin/stats/events?days=${days}`);
}

// --- User management ---

export interface UserAdmin {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  auth_provider: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserListResponse {
  items: UserAdmin[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function listUsers(): Promise<UserListResponse> {
  return api.request<UserListResponse>('/admin/users');
}

export async function createUser(data: {
  email: string;
  display_name: string;
  password: string;
}): Promise<UserAdmin> {
  return api.request<UserAdmin>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  userId: string,
  data: { display_name?: string; role?: string; is_active?: boolean },
): Promise<UserAdmin> {
  return api.request<UserAdmin>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// --- Quiz management ---

export interface QuizRead {
  id: string;
  lesson_id: string;
  title: string;
  passing_score_percent: number;
  max_attempts: number | null;
  questions: QuestionRead[];
  created_at: string;
  updated_at: string;
}

export interface QuestionRead {
  id: string;
  quiz_id: string;
  text: string;
  order: number;
  question_type: string;
  options: { label: string; text: string; is_correct: boolean }[];
  explanation: string | null;
  points: number;
}

export async function getLessonQuiz(lessonId: string): Promise<QuizRead> {
  return api.request<QuizRead>(`/admin/lessons/${lessonId}/quiz`);
}

export async function createQuiz(lessonId: string, data: { title: string; passing_score_percent: number }): Promise<QuizRead> {
  return api.request<QuizRead>(`/admin/lessons/${lessonId}/quiz`, {
    method: 'POST',
    body: JSON.stringify({ lesson_id: lessonId, ...data }),
  });
}

export async function updateQuiz(quizId: string, data: { title?: string; passing_score_percent?: number }): Promise<QuizRead> {
  return api.request<QuizRead>(`/admin/quizzes/${quizId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteQuiz(quizId: string): Promise<void> {
  return api.request(`/admin/quizzes/${quizId}`, { method: 'DELETE' });
}

export async function addQuestion(quizId: string, data: {
  text: string;
  order: number;
  question_type: string;
  options: { label: string; text: string; is_correct: boolean }[];
  points: number;
}): Promise<QuestionRead> {
  return api.request<QuestionRead>(`/admin/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(questionId: string, data: {
  text: string;
  order: number;
  question_type: string;
  options: { label: string; text: string; is_correct: boolean }[];
  points: number;
}): Promise<QuestionRead> {
  return api.request<QuestionRead>(`/admin/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteQuestion(questionId: string): Promise<void> {
  return api.request(`/admin/questions/${questionId}`, { method: 'DELETE' });
}
