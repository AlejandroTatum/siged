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
} from "react";
import type {
  AuthContextValue,
  LoginRequest,
  LoginSuccessResponse,
  UsuarioResponse,
} from "@/features/auth/types/authTypes";
import {
  login as apiLogin,
  logout as apiLogout,
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
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(false);
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, login, logout, isLoading }),
    [token, user, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
