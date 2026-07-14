/**
 * Hook: usePlanningForm
 *
 * Mantiene el estado del formulario (campos del borrador, identidad de
 * edición, ocupado, aviso y error) y orquesta las mutaciones canónicas
 * contra el backend. La página no usa useState para el payload del
 * formulario ni conoce la forma del cuerpo que se envía al servidor.
 */

import { useCallback, useState } from "react";
import { PlanningApiError, planningApi, type PlanningApiErrors } from "../api";
import type { PlanningItem } from "../planItem";
import type { Level } from "../types";

const FORM_STATUS = {
  IDLE: "idle",
  BUSY: "busy",
} as const;

export type FormStatus = (typeof FORM_STATUS)[keyof typeof FORM_STATUS];

export interface FormDraft {
  name: string;
  active: boolean;
  levelId: string;
  sublevelId: string;
  weeklyLoad: string;
  order: string;
}

export interface UsePlanningFormOptions {
  token: string | null;
  section: string;
  institutionId: number;
  parentId: number;
  items: PlanningItem[];
  levels: Level[];
  reload: () => Promise<void>;
}

export interface UsePlanningFormResult {
  draft: FormDraft;
  editingId: number | null;
  status: FormStatus;
  notice: string;
  error: string;
  fieldErrors: Record<string, string[]>;
  sublevels: { id: number; nombre: string; pp_semana_minimo: number }[];
  setField: <K extends keyof FormDraft>(key: K, value: FormDraft[K]) => void;
  setLevel: (value: string) => void;
  edit: (item: PlanningItem) => void;
  reset: () => void;
  submit: () => Promise<boolean>;
  remove: (item: PlanningItem) => Promise<boolean>;
}

const EMPTY_DRAFT: FormDraft = {
  name: "",
  active: false,
  levelId: "",
  sublevelId: "",
  weeklyLoad: "1",
  order: "",
};

const GLOBAL_ERROR_KEYS = new Set(["detail", "non_field_errors"]);

function errorMessages(value: string | string[] | undefined): string[] {
  if (typeof value === "string") return [value];
  return Array.isArray(value) ? value.filter((message): message is string => typeof message === "string") : [];
}

function splitApiErrors(caught: unknown, fallback: string): { error: string; fieldErrors: Record<string, string[]> } {
  if (!(caught instanceof PlanningApiError) && !(caught instanceof Error && "data" in caught)) {
    return { error: caught instanceof Error ? caught.message : fallback, fieldErrors: {} };
  }
  const data = (caught as Error & { data?: PlanningApiErrors }).data ?? {};
  const fieldErrors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!GLOBAL_ERROR_KEYS.has(key)) fieldErrors[key] = errorMessages(value);
  }
  const globalMessages = [...errorMessages(data.detail), ...errorMessages(data.non_field_errors)];
  return { error: globalMessages.join(" "), fieldErrors };
}

export function usePlanningForm({ token, section, institutionId, parentId, items, levels, reload }: UsePlanningFormOptions): UsePlanningFormResult {
  const [draft, setDraft] = useState<FormDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<FormStatus>(FORM_STATUS.IDLE);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const setField = useCallback(<K extends keyof FormDraft>(key: K, value: FormDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const setLevel = useCallback((value: string) => {
    setDraft((current) => ({ ...current, levelId: value, sublevelId: "" }));
  }, []);

  const reset = useCallback(() => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError("");
    setFieldErrors({});
  }, []);

  const edit = useCallback((item: PlanningItem) => {
    setEditingId(item.id);
    setDraft({
      name: item.nombre,
      active: "es_activo" in item ? item.es_activo : false,
      levelId: "nivel" in item ? String(item.nivel.id) : "",
      sublevelId: "nivel" in item ? String(item.subnivel?.id ?? "") : "",
      weeklyLoad: "pp_semana_minimo" in item ? String(item.pp_semana_minimo) : "1",
      order: "orden" in item ? String(item.orden) : "",
    });
    setError("");
    setFieldErrors({});
    setNotice("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    setStatus(FORM_STATUS.BUSY);
    setError("");
    setFieldErrors({});
    setNotice("");
    try {
      const { name, active, levelId, sublevelId, weeklyLoad, order } = draft;
      const selectedLevel = levels.find((level) => level.id === Number(levelId));
      const sublevels = selectedLevel?.subniveles ?? [];
      if (section === "grados" && sublevels.length > 0 && !sublevelId) throw new Error("Selecciona un subnivel para el nivel elegido.");
      if (section === "asignaturas" && Number(weeklyLoad) <= 0) throw new Error("La carga semanal debe ser mayor que cero.");

      let parsedOrder: number | undefined;
      if (section === "grados") {
        const trimmed = order.trim();
        if (trimmed === "") {
          throw new Error("Ingresa un número de orden positivo para el grado.");
        }
        const numeric = Number(trimmed);
        if (!Number.isInteger(numeric) || numeric <= 0) {
          throw new Error("El orden debe ser un número entero positivo.");
        }
        parsedOrder = numeric;
      }

      const data = section === "planes"
        ? { nombre: name, es_activo: active }
        : section === "grados"
          ? { nombre: name, orden: parsedOrder as number, nivel: Number(levelId), subnivel: sublevelId ? Number(sublevelId) : null }
          : { nombre: name, pp_semana_minimo: Number(weeklyLoad) };

      if (editingId) {
        await planningApi.update(token, section, editingId, data);
      } else if (section === "planes") {
        await planningApi.createPlan(token, institutionId, data);
      } else if (section === "grados") {
        await planningApi.createGrade(token, parentId, data);
      } else {
        await planningApi.createSubject(token, parentId, data);
      }
      const noun = section === "planes" ? "Plan" : section === "grados" ? "Grado" : "Asignatura";
      setNotice(`${noun} ${editingId ? "actualizado" : "creado"} correctamente.`);
      setEditingId(null);
      setDraft(EMPTY_DRAFT);
      await reload();
      return true;
    } catch (caught) {
      const parsed = splitApiErrors(caught, "No fue posible guardar el registro.");
      setError(parsed.error);
      setFieldErrors(parsed.fieldErrors);
      return false;
    } finally {
      setStatus(FORM_STATUS.IDLE);
    }
  }, [draft, editingId, institutionId, levels, parentId, reload, section, token]);

  const remove = useCallback(async (item: PlanningItem): Promise<boolean> => {
    if (!token) return false;
    if (!confirm(`¿Eliminar ${item.nombre}? Esta acción no se puede deshacer.`)) return false;
    setError("");
    try {
      await planningApi.remove(token, section, item.id);
      setNotice("Registro eliminado correctamente.");
      await reload();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Este registro no se puede eliminar porque está en uso.");
      return false;
    }
  }, [reload, section, token]);

  const selectedLevelId = Number(draft.levelId);
  const selectedLevel = levels.find((level) => level.id === selectedLevelId);
  const sublevels = selectedLevel?.subniveles ?? [];

  return { draft, editingId, status, notice, error, fieldErrors, sublevels, setField, setLevel, edit, reset, submit, remove };
}
