import type { Level } from "../types";

interface EducationCatalogProps {
  levels: Level[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function EducationCatalog({ levels, loading = false, error = "", onRetry }: EducationCatalogProps) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" className="grid min-h-64 place-items-center rounded-xl border border-dashed border-input-border bg-surface p-8 text-center">
        <div>
          <span aria-hidden="true" className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
          <p className="mt-3 text-sm font-bold text-text-muted">Cargando catálogo educativo…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-8 text-center">
        <span aria-hidden="true" className="material-symbols-outlined text-5xl text-danger">error</span>
        <div>
          <h2 className="font-headline text-lg font-bold text-text-heading">No fue posible cargar el catálogo</h2>
          <p className="mt-1 text-sm text-text-body">{error}</p>
        </div>
        {onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-lg border border-danger/40 bg-surface px-4 py-2 text-sm font-bold text-danger hover:bg-danger/10 focus:outline-none focus:ring-2 focus:ring-danger">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">refresh</span>
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (!levels.length) {
    return <p className="rounded-xl border border-dashed border-input-border bg-surface p-8 text-center text-text-muted">No hay niveles educativos disponibles.</p>;
  }

  return (
    <section aria-labelledby="catalog-title">
      <div className="mb-5">
        <h2 id="catalog-title" className="font-headline text-xl font-bold text-text-heading">Estructura del sistema educativo</h2>
        <p className="text-sm text-text-muted">Consulta los niveles y subniveles disponibles para organizar los grados.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {levels.map((level) => (
          <article key={level.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span aria-hidden="true" className="material-symbols-outlined rounded-lg bg-secondary/10 p-2 text-secondary">account_tree</span>
                <div>
                  <h3 className="font-bold text-text-heading">{level.nombre}</h3>
                  <p className="text-sm text-text-muted">{level.pp_minutos} min. por período · mínimo {level.pp_semana_minimo} períodos</p>
                </div>
              </div>
            </div>
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {level.subniveles.map((sublevel) => (
                <li key={sublevel.id} className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                  <span>{sublevel.nombre}</span>
                  <span className="font-bold text-text-secondary">{sublevel.pp_semana_minimo} períodos</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
