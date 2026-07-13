/**
 * Tipos compartidos del módulo de autenticación.
 *
 * Centraliza las definiciones de tipos para la API de autenticación,
 * el contexto de sesión y los componentes relacionados.
 * Las interfaces planas siguen la convención TypeScript del proyecto.
 */

// ─── API Request ───────────────────────────────────────────────

export interface LoginRequest {
  numero_identificacion: string;
  password: string;
}

// ─── API Response ──────────────────────────────────────────────

export interface UsuarioResponse {
  id: number;
  numero_identificacion: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export interface LoginSuccessResponse {
  token: string;
  usuario: UsuarioResponse;
}

export interface LoginErrorResponse {
  error?: string;
  numero_identificacion?: string[];
  password?: string[];
}

export interface LogoutSuccessResponse {
  mensaje: string;
}

export interface ActiveRole {
  id: number;
  nombre: string;
  nombre_display: string;
}

// ─── Context ───────────────────────────────────────────────────

export interface AuthContextValue {
  activeRoles: ActiveRole[];
  token: string | null;
  user: UsuarioResponse | null;
  login: (credentials: LoginRequest) => Promise<LoginSuccessResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
