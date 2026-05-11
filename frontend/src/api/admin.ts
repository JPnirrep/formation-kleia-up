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
  return api.request<Enrollment>('/admin/enrollments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listEnrollments(): Promise<Enrollment[]> {
  return api.request<Enrollment[]>('/admin/enrollments');
}
