/**
 * Hook: usePlanningAccess
 *
 * Verifica que la institución solicitada en la ruta esté efectivamente
 * asignada al usuario autenticado. Expone el estado de verificación
 * (checking / allowed / denied) y permite reintentar manualmente.
 */

import { useCallback, useEffect, useState } from "react";
import { institutionApi } from "@/features/instituciones/services/api";

const ACCESS = {
  CHECKING: "checking",
  ALLOWED: "allowed",
  DENIED: "denied",
} as const;

export type AccessStatus = (typeof ACCESS)[keyof typeof ACCESS];

export interface UsePlanningAccessResult {
  status: AccessStatus;
  retry: () => void;
}

export function usePlanningAccess(token: string | null, institutionId: number): UsePlanningAccessResult {
  const [status, setStatus] = useState<AccessStatus>(ACCESS.CHECKING);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (!token || !Number.isInteger(institutionId) || institutionId < 1) {
      setStatus(ACCESS.DENIED);
      return;
    }
    let isCurrent = true;
    setStatus(ACCESS.CHECKING);
    institutionApi
      .mine(token)
      .then((institutions) => {
        if (!isCurrent) return;
        setStatus(institutions.some((institution) => institution.id === institutionId) ? ACCESS.ALLOWED : ACCESS.DENIED);
      })
      .catch(() => {
        if (isCurrent) setStatus(ACCESS.DENIED);
      });
    return () => {
      isCurrent = false;
    };
  }, [token, institutionId, reloadKey]);

  return { status, retry };
}
