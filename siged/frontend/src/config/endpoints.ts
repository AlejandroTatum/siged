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
  USER_ROLES: `${API_BASE}/usuarioroles/roles/`,
  INSTITUTIONS: `${API_BASE}/instituciones/`,
  MY_INSTITUTIONS: `${API_BASE}/instituciones/usuario/`,
  ROLE_ASSIGNMENTS: `${API_BASE}/usuarioroles/`,
  ROLES: `${API_BASE}/roles/`,
  USERS: `${API_BASE}/usuarios/`,
} as const;
