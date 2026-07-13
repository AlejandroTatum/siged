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
  EDUCATION_LEVELS: `${API_BASE}/educacion-niveles/`,
  PLANS: `${API_BASE}/planes-estudio/`,
  INSTITUTION_PLANS: (institutionId: number) => `${API_BASE}/planes-estudio/instituciones/${institutionId}/`,
  GRADES: `${API_BASE}/grados-escolares/`,
  PLAN_GRADES: (planId: number) => `${API_BASE}/grados-escolares/planes-estudio/${planId}/`,
  SUBJECTS: `${API_BASE}/asignaturas/`,
  GRADE_SUBJECTS: (gradeId: number) => `${API_BASE}/asignaturas/grados-escolares/${gradeId}/`,
  GRADE: (gradeId: number) => `${API_BASE}/grados-escolares/${gradeId}/`,
  PLAN: (planId: number) => `${API_BASE}/planes-estudio/${planId}/`,
  SUBJECT: (subjectId: number) => `${API_BASE}/asignaturas/${subjectId}/`,
} as const;
