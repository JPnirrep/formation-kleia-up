import api from './client';

export interface AILesson {
  title: string;
  description: string;
  lesson_type: string;
  order: number;
  duration_seconds: number;
}

export interface AIModule {
  title: string;
  description: string;
  order: number;
  lessons: AILesson[];
}

export interface AIGeneratedCourse {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  level: string;
  category: string;
  modules: AIModule[];
}

export async function generateCourse(prompt: string): Promise<AIGeneratedCourse> {
  return api.request<AIGeneratedCourse>('/ai/generate-course', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

// ── Quiz generation ──────────────────────────────────────────────────────

export interface AIQuizOption {
  label: string;
  text: string;
  is_correct: boolean;
}

export interface AIQuizQuestion {
  text: string;
  order: number;
  question_type: string;
  explanation: string;
  points: number;
  options: AIQuizOption[];
}

export interface AIGeneratedQuiz {
  title: string;
  passing_score_percent: number;
  questions: AIQuizQuestion[];
}

export async function generateQuiz(lessonId: string): Promise<AIGeneratedQuiz> {
  return api.request<AIGeneratedQuiz>(`/ai/generate-quiz/${lessonId}`, {
    method: 'POST',
  });
}
