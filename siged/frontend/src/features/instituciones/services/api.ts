import { ENDPOINTS } from "@/config/endpoints";
import type { ApiErrors, Authority, Institution, InstitutionInput, InstitutionPage, Role, UserOption } from "../types/institucionTypes";

async function request<T>(url:string, token:string, options:RequestInit={}):Promise<T>{
  const response=await fetch(url,{...options,headers:{"Content-Type":"application/json",Authorization:`Token ${token}`,...options.headers}});
  const data=response.status===204?null:await response.json();
  if(!response.ok) throw {status:response.status,data:data as ApiErrors};
  return data as T;
}
export const institutionApi={
  list:(token:string, params:URLSearchParams)=>request<InstitutionPage>(`${ENDPOINTS.INSTITUTIONS}?${params}`,token),
  mine:(token:string)=>request<Institution[]>(ENDPOINTS.MY_INSTITUTIONS,token),
  create:(token:string,data:InstitutionInput)=>request<Institution>(ENDPOINTS.INSTITUTIONS,token,{method:"POST",body:JSON.stringify(data)}),
  update:(token:string,id:number,data:InstitutionInput)=>request<Institution>(`${ENDPOINTS.INSTITUTIONS}${id}/`,token,{method:"PATCH",body:JSON.stringify(data)}),
  remove:(token:string,id:number)=>request<void>(`${ENDPOINTS.INSTITUTIONS}${id}/`,token,{method:"DELETE"}),
};
export const assignmentApi={
  roles:(token:string)=>request<Role[]>(ENDPOINTS.ROLES,token),
  list:(token:string,institutionId:number)=>request<Authority[]>(`${ENDPOINTS.ROLE_ASSIGNMENTS}?institucion=${institutionId}`,token),
  users:(token:string,activeOnly:boolean)=>request<UserOption[]>(`${ENDPOINTS.USERS}${activeOnly?"?activo=true":""}`,token),
  create:(token:string,data:object)=>request<Authority>(ENDPOINTS.ROLE_ASSIGNMENTS,token,{method:"POST",body:JSON.stringify(data)}),
  update:(token:string,id:number,data:object)=>request<Authority>(`${ENDPOINTS.ROLE_ASSIGNMENTS}${id}/`,token,{method:"PATCH",body:JSON.stringify(data)}),
  state:(token:string,id:number,es_activo:boolean)=>request<Authority>(`${ENDPOINTS.ROLE_ASSIGNMENTS}${id}/estado/`,token,{method:"PATCH",body:JSON.stringify({es_activo})}),
  remove:(token:string,id:number)=>request<void>(`${ENDPOINTS.ROLE_ASSIGNMENTS}${id}/`,token,{method:"DELETE"}),
};
