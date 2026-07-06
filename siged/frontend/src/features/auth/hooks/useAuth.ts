/**
 * Hook para acceder al contexto de autenticación.
 *
 * Provee una interfaz simple para que los componentes
 * accedan al estado de sesión y a las funciones de
 * inicio y cierre de sesión.
 */

import { useContext } from "react";
import type { AuthContextValue } from "@/features/auth/types/authTypes";
import { AuthContext } from "@/features/auth/context/AuthContext";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de un AuthProvider.",
    );
  }
  return context;
}
