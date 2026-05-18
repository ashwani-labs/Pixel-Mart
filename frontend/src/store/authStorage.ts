import type { AuthUser } from '../types/auth';

const STORAGE_KEY = 'pixelmart.auth';

export interface PersistedAuth {
  accessToken: string;
  user: AuthUser;
}

export function loadPersistedAuth(): PersistedAuth | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuth;
  } catch {
    return null;
  }
}

export function persistAuth(accessToken: string, user: AuthUser) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, user }));
}

export function clearPersistedAuth() {
  sessionStorage.removeItem(STORAGE_KEY);
}
