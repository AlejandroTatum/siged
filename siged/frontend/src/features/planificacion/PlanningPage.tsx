import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { institutionApi } from "@/features/instituciones/services/api";
import { planningApi } from "./api";
import type { Grade, Level, Page, Plan, Subject } from "./types";

const SECTIONS = ["planes", "grados", "asignaturas", "catalogo"] as const;
type Item = Plan | Grade | Subject;

export function PlanningPage() {
  const { institutionId, section } = useParams(); const [params] = useSearchParams(); const { token } = useAuth();
  const id = Number(institutionId); const parentId = Number(params.get(section === "grados" ? "plan" : "grado"));
  const [access,setAccess]=useState<"checking"|"allowed"|"denied">("checking"); const [items,setItems]=useState<Item[]>([]);
  const [levels,setLevels]=useState<Level[]>([]); const [gradeAlert,setGradeAlert]=useState<Grade|null>(null);
  const [name,setName]=useState(""); const [active,setActive]=useState(false); const [levelId,setLevelId]=useState(""); const [sublevelId,setSublevelId]=useState(""); const [weeklyLoad,setWeeklyLoad]=useState("1"); const [editingId,setEditingId]=useState<number|null>(null);
  const [search,setSearch]=useState(""); const [ordering,setOrdering]=useState("nombre"); const [page,setPage]=useState(1); const [pageData,setPageData]=useState<Page<Item>>({count:0,next:null,previous:null,results:[]});
  const [notice,setNotice]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const selectedLevel=levels.find(x=>x.id===Number(levelId)); const sublevels=selectedLevel?.subniveles ?? levels.flatMap(x=>x.subniveles);

  useEffect(()=>{ if(!token||!Number.isInteger(id)||id<1)return; setAccess("checking"); institutionApi.mine(token).then(xs=>setAccess(xs.some(x=>x.id===id)?"allowed":"denied")).catch(()=>setAccess("denied")); },[token,id]);
  const load=useCallback(async()=>{ if(!token||access!=="allowed")return; setError(""); try {
    if(section==="planes"){const q=`?page=${page}&ordering=${ordering}&nombre=${encodeURIComponent(search)}`; const d=await planningApi.plans(token,id,q); setItems(d.results ?? []);setPageData(d);}
    if(section==="grados"&&parentId){const q=`?page=${page}&ordering=${ordering}&nombre=${encodeURIComponent(search)}`; const [c,d]=await Promise.all([planningApi.levels(token),planningApi.grades(token,parentId,q)]);setLevels(c);setItems(d.results ?? []);setPageData(d);}
    if(section==="asignaturas"&&parentId){const [d,grade]=await Promise.all([planningApi.subjects(token,parentId),planningApi.grade(token,parentId)]);setItems(d.results ?? []);setPageData(d);setGradeAlert(grade);}
    if(section==="catalogo")setLevels(await planningApi.levels(token));
  } catch(e){setError(e instanceof Error?e.message:"Unable to load planning data.");}},[token,access,section,parentId,id,page,ordering,search]);
  useEffect(()=>{void load()},[load]);
  if(!institutionId||!Number.isInteger(id)||id<1||!SECTIONS.includes(section as typeof SECTIONS[number]))return <Navigate to="/mis-instituciones" replace/>;
  if(access==="denied")return <Navigate to="/mis-instituciones" replace/>; if(access==="checking")return <p role="status">Checking institution access...</p>;

  function reset(){setEditingId(null);setName("");setActive(false);setLevelId("");setSublevelId("");setWeeklyLoad("1")}
  async function submit(e:React.FormEvent){e.preventDefault();if(!token)return;setBusy(true);setError("");setNotice("");try{
    const edited=editingId?items.find(x=>x.id===editingId):undefined; const existing=edited&&"orden" in edited?edited.orden:undefined; const order=existing??Math.max(0,...items.map(x=>"orden" in x?x.orden:0))+1;
    if(section==="grados"&&sublevels.length>0&&!sublevelId)throw new Error("Select a sublevel for the chosen level.");
    if(section==="asignaturas"&&Number(weeklyLoad)<=0)throw new Error("Weekly load must be greater than zero.");
    const data=section==="planes"?{nombre:name,es_activo:active}:section==="grados"?{nombre:name,orden:order,nivel:Number(levelId),subnivel:sublevelId?Number(sublevelId):null}:{nombre:name,orden:order,carga_horaria_semanal:Number(weeklyLoad)};
    if(editingId)await planningApi.update(token,section!,editingId,data); else if(section==="planes")await planningApi.createPlan(token,id,data); else if(section==="grados")await planningApi.createGrade(token,parentId,data); else await planningApi.createSubject(token,parentId,data);
    setNotice(`${section==="planes"?"Study plan":section==="grados"?"Grade":"Subject"} ${editingId?"updated":"created"} successfully.`);reset();await load();
  }catch(e){setError(e instanceof Error?e.message:"Unable to save.")}finally{setBusy(false)}}
  function edit(x:Item){setEditingId(x.id);setName(x.nombre);if("es_activo" in x)setActive(x.es_activo);if("nivel" in x){setLevelId(String(x.nivel));setSublevelId(String(x.subnivel??""))}if("carga_horaria_semanal" in x)setWeeklyLoad(String(x.carga_horaria_semanal))}
  async function remove(x:Item){if(!token||!confirm(`Delete ${x.nombre}?`))return;setError("");try{await planningApi.remove(token,section!,x.id);setNotice(`${section==="planes"?"Study plan":section==="grados"?"Grade":"Subject"} deleted successfully.`);await load()}catch(e){setError(e instanceof Error?e.message:"This record cannot be deleted because it is in use.")}}
  const heading=section==="planes"?"Study plans":section==="grados"?"Grades":section==="asignaturas"?"Subjects":"Education level catalog";
  const empty=section==="planes"?"No study plans found.":section==="grados"?"No grades found.":"No subjects found.";
  const orderOptions=section==="planes"?[["nombre","Name"],["-nombre","Name descending"],["es_activo","Status"],["-es_activo","Status descending"]]:[["nombre","Name"],["-nombre","Name descending"],["orden","Order"],["-orden","Order descending"],["nivel","Level"],["subnivel","Sublevel"]];
  return <main className="space-y-6 p-8"><header className="border border-t-4 border-t-primary bg-heading-block p-6"><h1 className="text-3xl font-bold">{heading}</h1></header>
    {notice&&<p role="status" className="bg-success/10 p-3 text-success">{notice}</p>}{error&&<p role="alert" className="bg-danger/10 p-3 text-danger">{error}</p>}
    <nav className="flex flex-wrap gap-4"><Link to={`/instituciones/${id}`}>My institution</Link><Link to={`/instituciones/${id}/planificacion/planes`}>Study plans</Link><Link to={`/instituciones/${id}/planificacion/planes`}>Grades</Link><Link to={`/instituciones/${id}/planificacion/planes`}>Subjects</Link>{section==="grados"&&parentId&&<Link to={`/instituciones/${id}/planificacion/grados?plan=${parentId}`}>Grades</Link>}{section==="asignaturas"&&parentId&&<Link to={`/instituciones/${id}/planificacion/asignaturas?grado=${parentId}`}>Subjects</Link>}</nav>
    {(section==="planes"||section==="grados")&&<div className="flex gap-3"><label>Search by name<input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></label><label>Order by<select value={ordering} onChange={e=>{setOrdering(e.target.value);setPage(1)}}>{orderOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label></div>}
    {section!=="catalogo"&&<form onSubmit={submit} className="grid max-w-lg gap-3"><label>Name<input required value={name} onChange={e=>setName(e.target.value)}/></label>{section==="planes"&&<label><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/>Active</label>}{section==="grados"&&<><label>Level<select required value={levelId} onChange={e=>{setLevelId(e.target.value);setSublevelId("")}}><option value="">Seleccione el nivel</option>{levels.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label><label>Sublevel<select required={sublevels.length>0} disabled={!sublevels.length} value={sublevelId} onChange={e=>setSublevelId(e.target.value)}><option value="">Seleccione un subnivel</option>{sublevels.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label></>}{section==="asignaturas"&&<label>Weekly load<input type="number" min="1" required value={weeklyLoad} onChange={e=>setWeeklyLoad(e.target.value)}/></label>}<div><button disabled={busy}>{editingId?"Update":"Save"} {section==="planes"?"plan":section==="grados"?"grade":"subject"}</button>{editingId&&<button type="button" onClick={reset}>Cancel</button>}</div></form>}
    {section!=="catalogo"&&(items.length===0?<p>{empty}</p>:<table><thead><tr><th>Name</th>{section==="planes"&&<th>Status</th>}{section!=="planes"&&<th>Order</th>}<th>Actions</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td>{x.nombre}</td>{"es_activo" in x&&<td>{x.es_activo?"Active":"Inactive"}</td>}{"orden" in x&&<td>{x.orden}</td>}{"alerta_carga_horaria" in x&&x.alerta_carga_horaria&&<td role="alert">Load alert: {x.carga_horaria_actual} / {x.carga_horaria_minima}</td>}<td>{section==="planes"&&<Link aria-label={`Manage grades for ${x.nombre}`} to={`/instituciones/${id}/planificacion/grados?plan=${x.id}`}>Grades</Link>}{section==="grados"&&<Link aria-label={`Manage subjects for ${x.nombre}`} to={`/instituciones/${id}/planificacion/asignaturas?grado=${x.id}`}>Subjects</Link>} <button aria-label={`Edit ${x.nombre}`} onClick={()=>edit(x)}>Edit</button> <button aria-label={`Delete ${x.nombre}`} onClick={()=>void remove(x)}>Delete</button></td></tr>)}</tbody></table>)}
    {(section==="planes"||section==="grados")&&<div><button disabled={!pageData.previous} onClick={()=>setPage(x=>x-1)}>Previous</button><span> Page {page} </span><button disabled={!pageData.next} onClick={()=>setPage(x=>x+1)}>Next</button><span> {pageData.count} results</span></div>}
    {section==="catalogo"&&<ul>{levels.map(x=><li key={x.id}>{x.nombre}<ul>{x.subniveles.map(s=><li key={s.id}>{s.nombre}</li>)}</ul></li>)}</ul>}
    {gradeAlert?.alerta_carga_horaria&&<p role="alert">Load alert: {gradeAlert.carga_horaria_actual} / {gradeAlert.carga_horaria_minima}</p>}
  </main>
}
