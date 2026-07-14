import { type FormEvent } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { EducationCatalog } from "./components/EducationCatalog";
import { PlanningForm } from "./components/PlanningForm";
import { PlanningNavigation } from "./components/PlanningNavigation";
import { PlanningTable } from "./components/PlanningTable";
import { usePlanningAccess } from "./hooks/usePlanningAccess";
import { usePlanningData } from "./hooks/usePlanningData";
import { usePlanningForm } from "./hooks/usePlanningForm";
import type { PlanningItem } from "./planItem";

const SECTIONS = ["planes", "grados", "asignaturas", "catalogo"] as const;
const SECTION_CONTENT = {
  planes: { title: "Planes de estudio", subtitle: "Define y administra la estructura curricular de la institución.", icon: "menu_book" },
  grados: { title: "Grados escolares", subtitle: "Organiza los grados, niveles y subniveles del plan seleccionado.", icon: "school" },
  asignaturas: { title: "Asignaturas", subtitle: "Gestiona las asignaturas y su carga pedagógica semanal.", icon: "auto_stories" },
  catalogo: { title: "Catálogo educativo", subtitle: "Consulta los niveles y subniveles oficiales disponibles.", icon: "category" },
} as const;

type Section = (typeof SECTIONS)[number];

function isSection(value: string | undefined): value is Section {
  return typeof value === "string" && (SECTIONS as readonly string[]).includes(value);
}

function isPositiveId(value: string | null): value is string {
  return value !== null && /^\d+$/.test(value) && Number(value) > 0;
}

export function PlanningPage() {
  const { institutionId, section } = useParams();
  const [params] = useSearchParams();
  const { token } = useAuth();

  const id = Number(institutionId);
  const sectionKey = isSection(section) ? section : null;
  const planParam = params.get("plan");
  const gradoParam = params.get("grado");
  const parentId =
    sectionKey === "grados" && isPositiveId(planParam)
      ? Number(planParam)
      : sectionKey === "asignaturas" && isPositiveId(gradoParam)
        ? Number(gradoParam)
        : 0;

  const { status: accessStatus, retry: retryAccess } = usePlanningAccess(token, id);
  const allowed = accessStatus === "allowed";

  const data = usePlanningData({ token, institutionId: id, section: sectionKey ?? "", parentId, allowed });
  const form = usePlanningForm({
    token,
    section: sectionKey ?? "",
    institutionId: id,
    parentId,
    items: data.items,
    levels: data.levels,
    reload: data.reload,
  });

  if (!institutionId || !Number.isInteger(id) || id < 1 || sectionKey === null) {
    return <Navigate to="/mis-instituciones" replace />;
  }
  if (accessStatus === "denied") return <Navigate to="/mis-instituciones" replace />;
  if (accessStatus === "checking") {
    return (
      <div role="status" className="grid min-h-64 place-items-center">
        <span className="inline-flex items-center gap-2 text-text-muted">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Validando acceso a la institución…
        </span>
      </div>
    );
  }

  const currentSection: Section = sectionKey;
  const content = SECTION_CONTENT[currentSection];
  const orderOptions =
    currentSection === "planes"
      ? [
          ["nombre", "Nombre (A–Z)"],
          ["-nombre", "Nombre (Z–A)"],
          ["es_activo", "Estado"],
          ["-es_activo", "Estado descendente"],
        ]
      : [
          ["nombre", "Nombre (A–Z)"],
          ["-nombre", "Nombre (Z–A)"],
          ["orden", "Orden ascendente"],
          ["-orden", "Orden descendente"],
          ["nivel", "Nivel"],
          ["subnivel", "Subnivel"],
        ];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit();
  };

  const onEdit = (item: PlanningItem) => form.edit(item);
  const onDelete = (item: PlanningItem) => void form.remove(item);
  const onNameChange = (value: string) => form.setField("name", value);
  const onActiveChange = (value: boolean) => form.setField("active", value);
  const onWeeklyLoadChange = (value: string) => form.setField("weeklyLoad", value);
  const onSublevelChange = (value: string) => form.setField("sublevelId", value);
  const onOrderChange = (value: string) => form.setField("order", value);
  const onCancel = () => form.reset();

  const totalRecords = currentSection === "catalogo" ? data.levels.length : data.pageData.count || data.items.length;

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="relative overflow-hidden rounded-xl border border-border border-t-4 border-t-heading-block-border bg-heading-block p-6 shadow-sm sm:p-8">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary/10" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <Link to={`/instituciones/${id}`} className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
              Mi institución
            </Link>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined rounded-xl bg-primary p-3 text-3xl text-text-inverse">{content.icon}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Planificación académica</p>
                <h1 className="font-headline text-2xl font-bold text-text-heading sm:text-3xl">{content.title}</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-text-secondary">{content.subtitle}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface/80 px-5 py-3 text-sm shadow-sm">
            <span className="block text-text-muted">Registros</span>
            <strong className="font-headline text-2xl text-text-heading">{totalRecords}</strong>
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        <PlanningNavigation institutionId={id} parentId={parentId} section={currentSection} />
      </div>

      {form.notice && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-success">
          <span aria-hidden="true" className="material-symbols-outlined">check_circle</span>
          <span className="font-medium">{form.notice}</span>
        </div>
      )}
      {data.error && !form.error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-danger">
          <span aria-hidden="true" className="material-symbols-outlined">error</span>
          <span className="font-medium">{data.error}</span>
          <button type="button" onClick={() => void data.reload()} className="ml-auto rounded-lg border border-danger/30 px-3 py-1 text-sm font-bold hover:bg-danger/10">Reintentar</button>
        </div>
      )}

      {data.gradeAlert?.alerta_carga_pedagogica && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-warning/50 bg-warning/10 px-5 py-4 text-text-body">
          <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-warning">warning</span>
          <div>
            <strong className="block text-text-heading">Carga pedagógica incompleta</strong>
            <p className="text-sm">La carga actual es de {data.gradeAlert.carga_pedagogica_actual} de {data.gradeAlert.carga_pedagogica_minima} períodos mínimos. Agrega asignaturas hasta completar la carga requerida.</p>
          </div>
        </div>
      )}

      {currentSection !== "catalogo" && (
        <PlanningForm
          active={form.draft.active}
          busy={form.status === "busy"}
          editing={form.editingId !== null}
          levelId={form.draft.levelId}
          levels={data.levels}
          loading={currentSection === "grados" && data.status === "loading"}
          name={form.draft.name}
          onActiveChange={onActiveChange}
          onCancel={onCancel}
          onLevelChange={form.setLevel}
          onNameChange={onNameChange}
          onOrderChange={onOrderChange}
          onSubmit={onSubmit}
          onSublevelChange={onSublevelChange}
          onWeeklyLoadChange={onWeeklyLoadChange}
          order={form.draft.order}
          section={currentSection}
          sublevelId={form.draft.sublevelId}
          sublevels={form.sublevels}
          weeklyLoad={form.draft.weeklyLoad}
          error={form.error || (data.status === "error" && currentSection === "grados" ? data.error : "")}
          onRetry={data.status === "error" ? () => void data.reload() : undefined}
        />
      )}

      {(currentSection === "planes" || currentSection === "grados") && (
        <section aria-label="Herramientas de listado" className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar por nombre</span>
            <span aria-hidden="true" className="material-symbols-outlined absolute left-3 top-2.5 text-text-muted">search</span>
            <input
              value={data.search}
              onChange={(event) => data.setSearch(event.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-lg border border-input-border bg-input-bg py-2.5 pl-11 pr-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <span>Ordenar por</span>
            <select
              value={data.ordering}
              onChange={(event) => data.setOrdering(event.target.value)}
              className="rounded-lg border border-input-border bg-input-bg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {orderOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </section>
      )}

      {currentSection === "catalogo" ? (
        <EducationCatalog
          levels={data.levels}
          loading={data.status === "loading"}
          error={data.status === "error" ? data.error : ""}
          onRetry={() => void data.reload()}
        />
      ) : (
        <PlanningTable
          institutionId={id}
          items={data.items}
          onDelete={onDelete}
          onEdit={onEdit}
          section={currentSection}
          loading={data.status === "loading"}
          error={data.status === "error" ? data.error : ""}
          onRetry={() => void data.reload()}
        />
      )}

      {(currentSection === "planes" || currentSection === "grados") && (
        <nav aria-label="Paginación" className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-4 text-sm sm:flex-row">
          <span className="text-text-muted">Mostrando {data.items.length} de {data.pageData.count} registros</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.pageData.previous}
              onClick={() => data.setPage(data.page - 1)}
              className="rounded-lg border border-input-border px-3 py-2 font-bold disabled:cursor-not-allowed disabled:text-text-disabled"
            >
              Anterior
            </button>
            <span aria-current="page" className="grid size-9 place-items-center rounded-lg bg-primary font-bold text-text-inverse">{data.page}</span>
            <button
              type="button"
              disabled={!data.pageData.next}
              onClick={() => data.setPage(data.page + 1)}
              className="rounded-lg border border-input-border px-3 py-2 font-bold disabled:cursor-not-allowed disabled:text-text-disabled"
            >
              Siguiente
            </button>
          </div>
        </nav>
      )}

      <button type="button" onClick={retryAccess} className="sr-only">Reintentar acceso</button>
    </main>
  );
}
