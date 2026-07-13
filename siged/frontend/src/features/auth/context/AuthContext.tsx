/**
 * Contexto global de autenticación.
 *
 * Provee el estado de sesión (token y usuario autenticado)
 * a toda la aplicación, gestionando el almacenamiento en
 * localStorage bajo la clave "authToken".
 */

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import type {
  AuthContextValue,
  LoginRequest,
  LoginSuccessResponse,
  UsuarioResponse,
  ActiveRole,
} from "@/features/auth/types/authTypes";
import {
  login as apiLogin,
  logout as apiLogout,
  getActiveRoles,
} from "@/features/auth/services/authApi";
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  storeAuth,
} from "@/features/auth/utils/authStorage";

export type { AuthContextValue };

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<UsuarioResponse | null>(
    () => getStoredUser<UsuarioResponse>(),
  );
  const [isLoading, setIsLoading] = useState(() => Boolean(getStoredToken()));
  const [activeRoles, setActiveRoles] = useState<ActiveRole[]>([]);

  useEffect(() => {
    if (!token) {
      setActiveRoles([]);
      setIsLoading(false);
      return;
    }
    let isCurrent = true;
    getActiveRoles(token)
      .then((roles) => {
        if (isCurrent) {
          setActiveRoles(roles);
          setIsLoading(false);
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (typeof error === "object" && error !== null && "status" in error && error.status === 401) {
          clearStoredAuth();
          setToken(null);
          setUser(null);
          setActiveRoles([]);
        }
        setIsLoading(false);
      });
    return () => { isCurrent = false; };
  }, [token]);

  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginSuccessResponse> => {
      setIsLoading(true);
      try {
        const result = await apiLogin(credentials);
        storeAuth(result.token, result.usuario);
        setToken(result.token);
        setUser(result.usuario);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (token) {
        try {
          await apiLogout(token);
        } catch {
          // Even if the API call fails, clear local state
        }
      }
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      setActiveRoles([]);
      setIsLoading(false);
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({ activeRoles, token, user, login, logout, isLoading }),
    [activeRoles, token, user, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
