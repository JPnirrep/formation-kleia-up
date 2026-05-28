import api from './client';

export interface GamificationData {
  points: number;
  level: string;
  level_number: number;
  streak_days: number;
  last_activity_date: string | null;
  total_points_earned: number;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  level: string;
  level_number: number;
  streak_days: number;
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[];
  total: number;
}

export async function getMyGamification(): Promise<GamificationData> {
  return api.request<GamificationData>('/gamification/me');
}

export async function getLeaderboard(
  period: string = 'all_time',
  page: number = 1,
  page_size: number = 20,
): Promise<LeaderboardResponse> {
  return api.request<LeaderboardResponse>(
    `/gamification/leaderboard?period=${period}&page=${page}&page_size=${page_size}`,
  );
}
