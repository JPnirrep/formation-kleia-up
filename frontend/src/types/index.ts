export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'learner' | 'trainer' | 'admin';
  initials: string;
  joinedAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserProfile;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CourseProgress {
  course_id: string;
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
  last_activity: string;
}

export interface VideoProgressUpdate {
  current_time: number;
  duration: number;
  completed: boolean;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  questions: Question[];
  passing_score: number;
  max_attempts: number | null;
  time_limit_seconds: number | null;
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'true_false';
  options: QuestionOption[];
  points: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface AttemptSubmit {
  answers: Answer[];
}

export interface Answer {
  question_id: string;
  selected_option: string | null;
  text_answer?: string;
}

export interface AttemptResult {
  attempt_id: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  answers: AnswerResult[];
  completed_at: string;
}

export interface AnswerResult {
  question_id: string;
  correct: boolean;
  points_earned: number;
  points_max: number;
}

export interface Attempt {
  id: string;
  quiz_id: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface CourseCreate {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  level: string;
  duration_seconds: number;
  thumbnail_url?: string;
  category?: string;
}

export interface CourseUpdate {
  title?: string;
  short_description?: string;
  description?: string;
  level?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  status?: string;
  category?: string;
}

export interface ModuleCreate {
  title: string;
  description?: string;
  order: number;
}

export interface LessonCreate {
  title: string;
  description?: string;
  order: number;
  lesson_type: string;
  duration_seconds: number;
  content?: Record<string, unknown>;
}

export interface EnrollmentGrant {
  user_id: string;
  course_id: string;
}
