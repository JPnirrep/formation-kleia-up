import api from './client';
import type { CourseProgress } from '../types';

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  return api.request<CourseProgress>(`/progress/courses/${courseId}`);
}

export async function completeLesson(lessonId: string): Promise<void> {
  return api.request(`/progress/lessons/${lessonId}/complete`, { method: 'POST' });
}

export async function updateVideoProgress(videoId: string, data: {
  last_position_seconds: number;
  max_position_seconds: number;
  percent_watched: number;
  completed: boolean;
}): Promise<void> {
  return api.request(`/progress/videos/${videoId}/progress`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

