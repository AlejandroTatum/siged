export interface Page<T> { count: number; next: string | null; previous: string | null; results: T[] }
export interface Plan { id: number; nombre: string; es_activo: boolean }
export interface Sublevel { id: number; nombre: string; carga_horaria_minima_semanal: number }
export interface Level { id: number; nombre: string; carga_horaria_minima_semanal: number; subniveles: Sublevel[] }
export interface Grade { id: number; nombre: string; orden: number; nivel: number; subnivel: number | null; carga_horaria_actual: number; carga_horaria_minima: number; alerta_carga_horaria: boolean }
export interface Subject { id: number; nombre: string; orden: number; carga_horaria_semanal: number }
