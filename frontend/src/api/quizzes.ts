import api from './client';
import type { Quiz, AttemptSubmit, AttemptResult, Attempt } from '../types';

export async function getQuiz(quizId: string): Promise<Quiz> {
  return api.request<Quiz>(`/quizzes/${quizId}`);
}

export async function submitAttempt(quizId: string, data: AttemptSubmit): Promise<AttemptResult> {
  return api.request<AttemptResult>(`/quizzes/${quizId}/attempt`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAttempts(quizId: string): Promise<Attempt[]> {
  return api.request<Attempt[]>(`/quizzes/${quizId}/attempts`);
}

export type { Quiz, AttemptSubmit, AttemptResult, Attempt };
