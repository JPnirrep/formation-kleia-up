import api from './client';
import type {
  CourseCreate, CourseUpdate, ModuleCreate, LessonCreate, EnrollmentGrant,
} from '../types';
import type { Course, Module, Lesson } from './courses';
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

export async function createModule(courseId: string, data: ModuleCreate): Promise<Module> {
  return api.request<Module>(`/admin/courses/${courseId}/modules`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createLesson(moduleId: string, data: LessonCreate): Promise<Lesson> {
  return api.request<Lesson>(`/admin/modules/${moduleId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function grantEnrollment(data: EnrollmentGrant): Promise<Enrollment> {
  return api.request<Enrollment>('/enrollments/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listEnrollments(): Promise<{ items: Enrollment[]; total: number }> {
  return api.request<{ items: Enrollment[]; total: number }>('/admin/enrollments');
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
