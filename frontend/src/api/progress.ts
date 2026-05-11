import api from './client';
import type { CourseProgress, VideoProgressUpdate } from '../types';

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  return api.request<CourseProgress>(`/progress/courses/${courseId}`);
}

export async function completeLesson(lessonId: string): Promise<void> {
  return api.request(`/progress/lessons/${lessonId}/complete`, { method: 'POST' });
}

export async function updateVideoProgress(videoId: string, data: VideoProgressUpdate): Promise<void> {
  return api.request(`/progress/videos/${videoId}/progress`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export type { CourseProgress, VideoProgressUpdate };
