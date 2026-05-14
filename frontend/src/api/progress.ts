import api from './client';
import type { CourseProgress, ProgressResponse } from '../types';

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  return api.request<CourseProgress>(`/progress/courses/${courseId}`);
}

export async function completeLesson(lessonId: string): Promise<ProgressResponse> {
  return api.request<ProgressResponse>(`/progress/lessons/${lessonId}/complete`, { method: 'POST' });
}

export async function updateVideoProgress(videoId: string, data: {
  last_position_seconds: number;
  max_position_seconds: number;
  percent_watched: number;
  completed: boolean;
}): Promise<ProgressResponse> {
  return api.request<ProgressResponse>(`/progress/videos/${videoId}/progress`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

