/**
 * Endpoints del backend consumidos por el frontend.
 *
 * Centraliza todas las rutas de la API para garantizar
 * consistencia y evitar duplicación en los componentes.
 */

const API_BASE = "/api";

export const ENDPOINTS = {
  LOGIN: `${API_BASE}/login/`,
  LOGOUT: `${API_BASE}/logout/`,
} as const;
