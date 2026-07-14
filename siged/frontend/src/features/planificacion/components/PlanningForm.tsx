import type { FormEvent } from "react";
import type { Level } from "../types";

interface PlanningFormProps {
  active: boolean;
  busy: boolean;
  editing: boolean;
  levelId: string;
  levels: Level[];
  name: string;
  onActiveChange: (value: boolean) => void;
  onCancel: () => void;
  onLevelChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onSublevelChange: (value: string) => void;
  onWeeklyLoadChange: (value: string) => void;
  order: string;
  onOrderChange: (value: string) => void;
  section: string;
  sublevelId: string;
  sublevels: Level["subniveles"];
  weeklyLoad: string;
  /**
   * Indicates the parent is fetching data this form depends on
   * (e.g. the education level catalog for the "grados" section).
   * When true, the form renders a polite loading state.
   */
  loading?: boolean;
  /**
   * Server- or hook-level error to surface inline. Rendered with
   * `role="alert"` so screen readers announce it immediately.
   */
  error?: string;
  /**
   * Optional retry handler surfaced when `error` is present. The
   * button is hidden when the error is purely a client validation
   * (e.g. "Selecciona un subnivel…") because retry would not help.
   */
  onRetry?: () => void;
}

const fieldClass = "mt-2 w-full rounded-lg border border-input-border bg-input-bg px-3 py-2.5 text-text-body outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-background";

export function PlanningForm(props: PlanningFormProps) {
  const noun = props.section === "planes" ? "plan" : props.section === "grados" ? "grado" : "asignatura";
  const loading = props.loading === true;
  const error = props.error ?? "";
  const empty = props.section === "grados" && !loading && props.levels.length === 0 && !props.editing;

  if (loading) {
    return (
      <section aria-labelledby="planning-form-title" data-testid="planning-form-loading" className="grid min-h-64 place-items-center rounded-xl border border-dashed border-input-border bg-surface p-8 text-center">
        <div role="status" aria-live="polite">
          <span aria-hidden="true" className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          <p className="mt-3 text-sm font-bold text-text-muted">Cargando datos del formulario…</p>
        </div>
      </section>
    );
  }

  if (empty) {
    return (
      <section aria-labelledby="planning-form-title" data-testid="planning-form-empty" className="grid min-h-64 place-items-center rounded-xl border border-dashed border-input-border bg-surface p-8 text-center">
        <div>
          <span aria-hidden="true" className="material-symbols-outlined text-6xl text-text-disabled">school</span>
          <h2 id="planning-form-title" className="mt-3 font-headline text-lg font-bold text-text-heading">No hay niveles educativos registrados</h2>
          <p className="mt-1 max-w-md text-sm text-text-muted">Para crear un grado necesitas al menos un nivel educativo. Crea un nivel en el catálogo antes de continuar.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="planning-form-title" className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span aria-hidden="true" className="material-symbols-outlined rounded-lg bg-primary/10 p-2 text-primary">{props.editing ? "edit" : "add_circle"}</span>
        <div>
          <h2 id="planning-form-title" className="font-headline text-lg font-bold text-text-heading">{props.editing ? `Editar ${noun}` : `Nuevo ${noun}`}</h2>
          <p className="text-sm text-text-muted">Completa los campos obligatorios para guardar el registro.</p>
        </div>
      </div>
      <form onSubmit={props.onSubmit} className="grid gap-4 p-5 md:grid-cols-2" noValidate={Boolean(error)}>
        {error && (
          <div role="alert" data-testid="planning-form-error" className="md:col-span-2 flex flex-col items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-text-body">
            <div className="flex items-start gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-danger">error</span>
              <span className="font-medium text-danger">{error}</span>
            </div>
            {props.onRetry && (
              <button type="button" onClick={props.onRetry} className="inline-flex items-center gap-2 rounded-lg border border-danger/40 bg-surface px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 focus:outline-none focus:ring-2 focus:ring-danger">
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">refresh</span>
                Reintentar
              </button>
            )}
          </div>
        )}
        <label className="text-sm font-bold text-text-body">Nombre <span className="text-danger">*</span><input required value={props.name} onChange={(event) => props.onNameChange(event.target.value)} className={fieldClass} /></label>
        {props.section === "planes" && <label className="mt-7 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-bold"><input type="checkbox" checked={props.active} onChange={(event) => props.onActiveChange(event.target.checked)} className="size-4 accent-primary" />Plan activo</label>}
        {props.section === "grados" && (
          <>
            <label className="text-sm font-bold">Nivel educativo <span className="text-danger">*</span>
              <select required value={props.levelId} onChange={(event) => props.onLevelChange(event.target.value)} className={fieldClass}>
                <option value="">Selecciona un nivel</option>
                {props.levels.map((level) => <option key={level.id} value={level.id}>{level.nombre}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">Subnivel <span className="text-danger">*</span>
              <select required={props.sublevels.length > 0} disabled={!props.sublevels.length} value={props.sublevelId} onChange={(event) => props.onSublevelChange(event.target.value)} className={fieldClass}>
                <option value="">Selecciona un subnivel</option>
                {props.sublevels.map((sublevel) => <option key={sublevel.id} value={sublevel.id}>{sublevel.nombre}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">Orden <span className="text-danger">*</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={props.order}
                onChange={(event) => props.onOrderChange(event.target.value)}
                className={fieldClass}
              />
            </label>
          </>
        )}
        {props.section === "asignaturas" && (
          <label className="text-sm font-bold">Carga semanal mínima <span className="text-danger">*</span>
            <div className="relative">
              <input type="number" min="1" required value={props.weeklyLoad} onChange={(event) => props.onWeeklyLoadChange(event.target.value)} className={`${fieldClass} pr-24`} />
              <span className="absolute bottom-2.5 right-3 text-sm text-text-muted">períodos</span>
            </div>
          </label>
        )}
        <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={props.busy}
            data-testid="planning-form-submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-text-inverse shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">save</span>
            {props.busy ? "Guardando…" : props.editing ? `Actualizar ${noun}` : `Guardar ${noun}`}
          </button>
          {props.editing && (
            <button type="button" onClick={props.onCancel} className="rounded-lg border border-input-border px-5 py-2.5 font-bold hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
