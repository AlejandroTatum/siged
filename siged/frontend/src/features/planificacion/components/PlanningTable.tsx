import { Link } from "react-router-dom";
import type { PlanningItem } from "../planItem";

interface PlanningTableProps {
  institutionId: number;
  items: PlanningItem[];
  onDelete: (item: PlanningItem) => void;
  onEdit: (item: PlanningItem) => void;
  section: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function PlanningTable({ institutionId, items, onDelete, onEdit, section, loading = false, error = "", onRetry }: PlanningTableProps) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" className="grid min-h-64 place-items-center rounded-xl border border-dashed border-input-border bg-surface p-8 text-center">
        <div>
          <span aria-hidden="true" className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          <p className="mt-3 text-sm font-bold text-text-muted">Cargando registros…</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-8 text-center">
        <span aria-hidden="true" className="material-symbols-outlined text-5xl text-danger">error</span>
        <p className="text-sm text-text-body">{error}</p>
        {onRetry && <button type="button" onClick={onRetry}>Reintentar</button>}
      </div>
    );
  }
  if (!items.length) {
    const empty = section === "planes" ? "No hay planes de estudio registrados" : section === "grados" ? "No hay grados registrados" : "No hay asignaturas registradas";
    return <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-input-border bg-surface p-8 text-center"><div><span aria-hidden="true" className="material-symbols-outlined text-6xl text-text-disabled">inventory_2</span><h2 className="mt-3 font-headline text-lg font-bold text-text-heading">{empty}</h2><p className="mt-1 text-sm text-text-muted">Usa el formulario para crear el primer registro.</p></div></div>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[820px] text-left">
        <caption className="sr-only">Registros de planificación académica</caption>
        <thead className="bg-heading-block text-xs uppercase tracking-wider text-text-secondary">
          <tr>
            <th scope="col" className="px-5 py-4">Nombre</th>
            {section === "planes" && <th scope="col" className="px-5 py-4">Estado</th>}
            {section === "grados" && (
              <>
                <th scope="col" className="px-5 py-4">Nivel</th>
                <th scope="col" className="px-5 py-4">Subnivel</th>
                <th scope="col" className="px-5 py-4">Orden</th>
                <th scope="col" className="px-5 py-4">Carga pedagógica</th>
              </>
            )}
            {section === "asignaturas" && <th scope="col" className="px-5 py-4">Carga semanal mínima</th>}
            <th scope="col" className="px-5 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-background/70">
              <td className="px-5 py-4 font-bold text-text-heading">{item.nombre}</td>
              {"es_activo" in item && (
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.es_activo ? "bg-success/10 text-success" : "bg-background text-text-muted"}`}>
                    {item.es_activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
              )}
              {"orden" in item && (
                <>
                  <td className="px-5 py-4 text-sm font-medium">{item.nivel.nombre}</td>
                  <td className="px-5 py-4 text-sm text-text-muted">{item.subnivel?.nombre ?? ""}</td>
                  <td className="px-5 py-4">{item.orden}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${item.alerta_carga_pedagogica ? "bg-warning/15 text-text-body" : "bg-success/10 text-success"}`}>
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{item.alerta_carga_pedagogica ? "warning" : "check_circle"}</span>
                      {item.carga_pedagogica_actual} / {item.carga_pedagogica_minima}
                    </span>
                  </td>
                </>
              )}
              {"pp_semana_minimo" in item && <td className="px-5 py-4">{item.pp_semana_minimo} períodos</td>}
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {section === "planes" && "es_activo" in item && (
                    <Link
                      aria-label={`Gestionar grados de ${item.nombre}`}
                      title="Gestionar grados"
                      to={`/instituciones/${institutionId}/planificacion/grados?plan=${item.id}`}
                      className="rounded-lg border border-primary p-2 text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined">school</span>
                    </Link>
                  )}
                  {section === "grados" && (
                    <Link
                      aria-label={`Gestionar asignaturas de ${item.nombre}`}
                      title="Gestionar asignaturas"
                      to={`/instituciones/${institutionId}/planificacion/asignaturas?grado=${item.id}`}
                      className="rounded-lg border border-primary p-2 text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined">auto_stories</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    aria-label={`Editar ${item.nombre}`}
                    title="Editar"
                    onClick={() => onEdit(item)}
                    className="rounded-lg border border-input-border p-2 text-text-secondary hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Eliminar ${item.nombre}`}
                    title="Eliminar"
                    onClick={() => onDelete(item)}
                    className="rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger/10 focus:outline-none focus:ring-2 focus:ring-danger"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
