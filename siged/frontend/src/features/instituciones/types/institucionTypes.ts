export interface UserOption { id:number; username:string; first_name:string; last_name:string; email?:string; numero_identificacion?:string; is_active?:boolean }
export interface Role { id:number; nombre:string; nombre_display?:string }
export interface Authority { id:number; usuario:UserOption; rol:Role; institucion?:{id:number;nombre:string}; es_activo:boolean; fecha_desde:string; fecha_hasta?:string|null }
export interface Institution { id:number; nombre:string; codigo:string; ruc:string; fecha_creacion:string; fecha_actualizacion:string|null; autoridades_academicas?:Authority[] }
export type InstitutionInput = Pick<Institution,"codigo"|"nombre"|"ruc">;
export interface InstitutionPage { count:number; next:string|null; previous:string|null; results:Institution[] }
export type ApiErrors = Record<string, string[]>;
