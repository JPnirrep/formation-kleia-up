import api from './client';
import type { AuthResponse, TokenResponse, UserProfile } from '../types';

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
  const res = await api.request<TokenResponse>(`${AUTH_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
  api.setTokens(res.access_token, res.refresh_token);
  return res;
}

export async function getProfile(): Promise<UserProfile> {
  return api.request<UserProfile>(`${AUTH_BASE}/auth/me`);
}

export function logout() {
  api.clearTokens();
}
