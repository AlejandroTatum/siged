/**
 * Constantes y utilidades para el almacenamiento local de autenticación.
 *
 * Centraliza las claves de localStorage y las funciones de
 * lectura/escritura para evitar duplicación y errores tipográficos.
 */

export const AUTH_TOKEN_KEY = "authToken";
export const AUTH_USER_KEY = "authUser";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser<T = unknown>(): T | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // Silently fail — localStorage may be unavailable
  }
}

export function storeAuth(token: string, user: unknown): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // Silently fail — localStorage may be unavailable
  }
}
