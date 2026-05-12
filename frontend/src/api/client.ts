// URL relative : le proxy Vite redirige /api/* → localhost:8000
// En production, Nginx fait le même reverse proxy
const API_BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('kleia_access_token');
}

function setToken(token: string) {
  localStorage.setItem('kleia_access_token', token);
}

function getRefreshToken(): string | null {
  return localStorage.getItem('kleia_refresh_token');
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('kleia_access_token', access);
  localStorage.setItem('kleia_refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('kleia_access_token');
  localStorage.removeItem('kleia_refresh_token');
}

function isAuthenticated(): boolean {
  return !!getToken();
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, 'Erreur reseau. Verifiez votre connexion.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? 'Erreur serveur');
  }

  if (res.status === 204) throw new ApiError(204, 'Aucun contenu');
  return res.json();
}

const api = {
  getToken, setToken, setTokens, clearTokens, isAuthenticated,
  getRefreshToken, request, ApiError,
};

export default api;
export { ApiError, isAuthenticated, setTokens };