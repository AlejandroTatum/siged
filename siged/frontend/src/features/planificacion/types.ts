export interface Page<T> { count: number; next: string | null; previous: string | null; results: T[] }
export interface Plan { id: number; nombre: string; es_activo: boolean }
export interface Sublevel { id: number; nombre: string; pp_semana_minimo: number }
export interface LevelSummary { id: number; nombre: string; pp_minutos?: number; pp_semana_minimo?: number }
export interface Level extends LevelSummary { pp_minutos: number; pp_semana_minimo: number; subniveles: Sublevel[] }
export interface Grade { id: number; nombre: string; orden: number; nivel: LevelSummary; subnivel: LevelSummary | null; carga_pedagogica_actual: number; carga_pedagogica_minima: number; alerta_carga_pedagogica: boolean; plan_estudio?: { id: number; nombre: string } }
export interface Subject { id: number; nombre: string; pp_semana_minimo: number }
