import api from './client';
import type { VideoAssetRead } from '@/types';

export async function getLessonVideos(lessonId: string): Promise<VideoAssetRead[]> {
  return api.request<VideoAssetRead[]>(`/videos/lessons/${lessonId}/videos`);
}

export async function recordVideoEvent(videoId: string, data: {
  session_id: string;
  event_type: string;
  position_seconds: number;
  payload_json?: Record<string, unknown>;
}): Promise<void> {
  return api.request(`/videos/videos/${videoId}/events`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
