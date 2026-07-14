import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { institutionApi } from "@/features/instituciones/services/api";
import type { Institution } from "@/features/instituciones/types/institucionTypes";

const ACCESS = {
  CHECKING: "checking",
  ALLOWED: "allowed",
  DENIED: "denied",
} as const;

type AccessStatus = (typeof ACCESS)[keyof typeof ACCESS];

export function InstitutionDashboardPage() {
  const { institutionId } = useParams();
  const { token } = useAuth();
  const id = Number(institutionId);
  const [access, setAccess] = useState<AccessStatus>(ACCESS.CHECKING);
  const [institution, setInstitution] = useState<Institution | null | null>(null);

  useEffect(() => {
    if (!token || !Number.isInteger(id) || id < 1) {
      setAccess(ACCESS.DENIED);
      return;
    }
    let isCurrent = true;
    setAccess(ACCESS.CHECKING);
    institutionApi
      .mine(token)
      .then((xs) => {
        if (!isCurrent) return;
        setInstitution(xs.find((x) => x.id === id) ?? null);
        setAccess(xs.some((x) => x.id === id) ? ACCESS.ALLOWED : ACCESS.DENIED);
      })
      .catch(() => {
        if (isCurrent) {
          setInstitution(null);
          setAccess(ACCESS.DENIED);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [token, id]);

  if (!Number.isInteger(id) || id < 1) return <Navigate to="/mis-instituciones" replace />;
  if (access === ACCESS.DENIED) return <Navigate to="/mis-instituciones" replace />;
  if (access === ACCESS.CHECKING || !institution) {
    return (
      <div role="status" aria-live="polite" className="grid min-h-64 place-items-center">
        <span className="inline-flex items-center gap-2 text-text-muted">
          <span aria-hidden="true" className="material-symbols-outlined animate-spin">progress_activity</span>
          Cargando información de la institución…
        </span>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="relative overflow-hidden rounded-xl border border-border border-t-4 border-t-heading-block-border bg-heading-block p-6 shadow-sm sm:p-8">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary/10" aria-hidden="true" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/mis-instituciones" className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
              Mis instituciones
            </Link>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="material-symbols-outlined rounded-xl bg-primary p-3 text-3xl text-text-inverse">school</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Panel de la institución</p>
                <h1 className="font-headline text-2xl font-bold text-text-heading sm:text-3xl">{institution.nombre}</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-text-secondary">
              Código: <strong className="text-text-heading">{institution.codigo}</strong> · RUC: <strong className="text-text-heading">{institution.ruc}</strong>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-5 py-3 text-sm shadow-sm">
            <span className="block text-text-muted">Fecha de creación</span>
            <strong className="font-headline text-base text-text-heading">{institution.fecha_creacion}</strong>
          </div>
        </div>
      </header>

      <section aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="font-headline text-xl font-bold text-text-heading">Accesos rápidos</h2>
        <p className="mt-1 text-sm text-text-muted">Gestione la estructura académica de la institución.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Link
            to={`/instituciones/${id}/planificacion/planes`}
            className="group flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="material-symbols-outlined rounded-xl bg-primary/10 p-3 text-3xl text-primary">menu_book</span>
              <h3 className="font-headline text-lg font-bold text-text-heading">Planes de estudio</h3>
            </div>
            <p className="text-sm text-text-secondary">Administre los planes, grados y asignaturas que componen la malla curricular de la institución.</p>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:underline">
              Ingresar
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
