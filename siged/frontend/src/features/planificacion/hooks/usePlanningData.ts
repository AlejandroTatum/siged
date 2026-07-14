/**
 * Hook: usePlanningData
 *
 * Carga los datos de la sección activa (planes, grados o asignaturas)
 * y mantiene paginación, búsqueda, orden y estado de carga.
 * El componente sólo consume el resultado: la página no realiza fetch
 * directo ni mantiene useState relacionado con la carga.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { planningApi } from "../api";
import type { PlanningItem } from "../planItem";
import type { Grade, Level, Page } from "../types";

const LOAD_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type LoadStatus = (typeof LOAD_STATUS)[keyof typeof LOAD_STATUS];

export interface PlanningDataResult {
  status: LoadStatus;
  error: string;
  items: PlanningItem[];
  levels: Level[];
  gradeAlert: Grade | null;
  pageData: Page<PlanningItem>;
  search: string;
  ordering: string;
  page: number;
  setSearch: (value: string) => void;
  setOrdering: (value: string) => void;
  setPage: (value: number) => void;
  reload: () => Promise<void>;
}

interface UsePlanningDataOptions {
  token: string | null;
  institutionId: number;
  section: string;
  parentId: number;
  allowed: boolean;
}

const EMPTY_PAGE: Page<PlanningItem> = { count: 0, next: null, previous: null, results: [] };

export function usePlanningData({ token, institutionId, section, parentId, allowed }: UsePlanningDataOptions): PlanningDataResult {
  const [status, setStatus] = useState<LoadStatus>(LOAD_STATUS.IDLE);
  const [error, setError] = useState("");
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [gradeAlert, setGradeAlert] = useState<Grade | null>(null);
  const [pageData, setPageData] = useState<Page<PlanningItem>>(EMPTY_PAGE);
  const [search, setSearchState] = useState("");
  const [ordering, setOrderingState] = useState("nombre");
  const [page, setPageState] = useState(1);
  const reloadKeyRef = useRef(0);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageState(1);
  }, []);

  const setOrdering = useCallback((value: string) => {
    setOrderingState(value);
    setPageState(1);
  }, []);

  const setPage = useCallback((value: number) => {
    setPageState(value);
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    if (!token || !allowed) return;
    setStatus(LOAD_STATUS.LOADING);
    setError("");
    try {
      const query = `?page=${page}&ordering=${ordering}&nombre=${encodeURIComponent(search)}`;
      if (section === "planes") {
        const data = await planningApi.plans(token, institutionId, query);
        setItems(data.results ?? []);
        setPageData(data);
      } else if (section === "grados" && parentId) {
        const catalog = await planningApi.levels(token);
        const data = await planningApi.grades(token, parentId, query);
        setLevels(catalog);
        setItems(data.results ?? []);
        setPageData(data);
      } else if (section === "asignaturas" && parentId) {
        const data = await planningApi.subjects(token, parentId);
        const grade = await planningApi.grade(token, parentId);
        setItems(data);
        setGradeAlert(grade);
      }
      setStatus(LOAD_STATUS.SUCCESS);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No fue posible cargar los datos de planificación.");
      setStatus(LOAD_STATUS.ERROR);
    }
  }, [token, allowed, section, parentId, institutionId, page, ordering, search]);

  useEffect(() => {
    void reload();
    reloadKeyRef.current += 1;
  }, [reload]);

  return {
    status,
    error,
    items,
    levels,
    gradeAlert,
    pageData,
    search,
    ordering,
    page,
    setSearch,
    setOrdering,
    setPage,
    reload,
  };
}
