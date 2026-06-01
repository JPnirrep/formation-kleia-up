import api from './client';
import type { AuthResponse, UserProfile } from '../types';

const AUTH_BASE = '';

export async function loginWithGoogle(idToken: string) {
  const res = await api.request<AuthResponse>(`${AUTH_BASE}/auth/google`, {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
  api.setTokens(res.access_token, res.refresh_token);
  return res;
}

export async function loginWithEmail(email: string, password: string) {
  const res = await api.request<AuthResponse>(`${AUTH_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  api.setTokens(res.access_token, res.refresh_token);
  return res;
}

export async function register(email: string, password: string, displayName: string) {
  const res = await api.request<AuthResponse>(`${AUTH_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
  api.setTokens(res.access_token, res.refresh_token);
  return res;
}

export async function getProfile(): Promise<UserProfile> {
  return api.request<UserProfile>(`${AUTH_BASE}/auth/me`);
}

export async function updateProfile(data: {
  display_name?: string;
  avatar_url?: string;
}): Promise<UserProfile> {
  return api.request<UserProfile>(`${AUTH_BASE}/auth/me`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function logout() {
  try {
    await api.request(`${AUTH_BASE}/auth/logout`, { method: 'POST' });
  } catch {
    // Server unreachable — clear tokens locally anyway
  }
  api.clearTokens();
}

export async function forgotPassword(email: string) {
  return api.request<{ message: string }>(`${AUTH_BASE}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return api.request<{ message: string }>(`${AUTH_BASE}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export async function completeOnboarding(data: {
  onboarding_completed: boolean;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
}) {
  return api.request<UserProfile>(`${AUTH_BASE}/auth/me/onboarding`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
