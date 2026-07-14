import { ENDPOINTS } from "@/config/endpoints";
import type { Grade, Level, Page, Plan, Subject } from "./types";

export type PlanningApiErrors = Record<string, string | string[]>;

export class PlanningApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: PlanningApiErrors,
  ) {
    super(message);
    this.name = "PlanningApiError";
  }
}

async function request<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", Authorization: `Token ${token}` } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const errors = data && typeof data === "object" ? data as PlanningApiErrors : {};
    const detail = errors.detail;
    const message = typeof detail === "string" ? detail : "No fue posible completar la solicitud de planificación.";
    throw new PlanningApiError(message, response.status, errors);
  }
  return data as T;
}
const post = <T>(url: string, token: string, data: object) => request<T>(url, token, { method: "POST", body: JSON.stringify(data) });
const resourceUrl = (section: string, id: number) => section === "planes" ? ENDPOINTS.PLAN(id) : section === "grados" ? ENDPOINTS.GRADE(id) : ENDPOINTS.SUBJECT(id);
export const planningApi = {
  levels: (token: string) => request<Level[]>(ENDPOINTS.EDUCATION_LEVELS, token),
  plans: (token: string, institutionId: number, query = "") => request<Page<Plan>>(`${ENDPOINTS.INSTITUTION_PLANS(institutionId)}${query}`, token),
  createPlan: (token: string, institutionId: number, data: object) => post<Plan>(ENDPOINTS.PLANS, token, { ...data, institucion: institutionId }),
  grades: (token: string, planId: number, query = "") => request<Page<Grade>>(`${ENDPOINTS.PLAN_GRADES(planId)}${query}`, token),
  createGrade: (token: string, planId: number, data: object) => post<Grade>(ENDPOINTS.GRADES, token, { ...data, plan_estudio: planId }),
  subjects: (token: string, gradeId: number) => request<Subject[]>(ENDPOINTS.GRADE_SUBJECTS(gradeId), token),
  createSubject: (token: string, gradeId: number, data: object) => post<Subject>(ENDPOINTS.SUBJECTS, token, { ...data, grado_escolar: gradeId }),
  grade: (token: string, gradeId: number) => request<Grade>(ENDPOINTS.GRADE(gradeId), token),
  update: <T>(token: string, section: string, id: number, data: object) => request<T>(resourceUrl(section, id), token, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (token: string, section: string, id: number) => request<void>(resourceUrl(section, id), token, { method: "DELETE" }),
};
