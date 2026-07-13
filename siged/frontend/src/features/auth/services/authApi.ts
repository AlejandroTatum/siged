/**
 * Servicio de API para autenticación.
 *
 * Centraliza las llamadas a los endpoints de login y logout,
 * reutilizando las constantes definidas en endpoints.ts.
 */

import type {
  LoginRequest,
  LoginSuccessResponse,
  LogoutSuccessResponse,
  ActiveRole,
} from "@/features/auth/types/authTypes";
import { ENDPOINTS } from "@/config/endpoints";

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw an object with status and data so callers can inspect both
    throw { status: response.status, data };
  }

  return data as T;
}

export async function getActiveRoles(tokenValue: string): Promise<ActiveRole[]> {
  return request<ActiveRole[]>(ENDPOINTS.USER_ROLES, {
    headers: { Authorization: `Token ${tokenValue}` },
  });
}

export async function login(
  credentials: LoginRequest,
): Promise<LoginSuccessResponse> {
  return request<LoginSuccessResponse>(ENDPOINTS.LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logout(tokenValue: string): Promise<LogoutSuccessResponse> {
  return request<LogoutSuccessResponse>(ENDPOINTS.LOGOUT, {
    method: "POST",
    headers: {
      Authorization: `Token ${tokenValue}`,
    },
  });
}
