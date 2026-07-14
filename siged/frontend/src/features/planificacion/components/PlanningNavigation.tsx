import { Link } from "react-router-dom";

interface PlanningNavigationProps {
  institutionId: number;
  parentId: number;
  section: string;
  planId?: number | null;
}

interface NavLink {
  icon: string;
  label: string;
  to: string | null;
  active: boolean;
  disabled: boolean;
  disabledReason: string;
}

export function PlanningNavigation({ institutionId, parentId, section, planId = null }: PlanningNavigationProps) {
  const gradesPlanId = section === "grados" ? parentId : planId;
  const hasPlan = Boolean(gradesPlanId && gradesPlanId > 0);
  const hasGrade = section === "asignaturas" && parentId > 0;
  const gradoId = hasGrade ? parentId : null;

  const links: NavLink[] = [
    {
      icon: "menu_book",
      label: "Planes de estudio",
      to: `/instituciones/${institutionId}/planificacion/planes`,
      active: section === "planes",
      disabled: false,
      disabledReason: "",
    },
    {
      icon: "school",
      label: "Grados",
      to: hasPlan
        ? `/instituciones/${institutionId}/planificacion/grados?plan=${gradesPlanId ?? ""}`
        : null,
      active: section === "grados",
      disabled: !hasPlan,
      disabledReason: "Selecciona un plan de estudio para gestionar sus grados.",
    },
    {
      icon: "auto_stories",
      label: "Asignaturas",
      to: hasGrade
        ? `/instituciones/${institutionId}/planificacion/asignaturas?grado=${gradoId ?? ""}`
        : null,
      active: section === "asignaturas",
      disabled: !hasGrade,
      disabledReason: "Selecciona un grado escolar para gestionar sus asignaturas.",
    },
  ];

  return (
    <nav aria-label="Secciones de planificación" className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-4">
      {links.map((link) => {
        const baseClass = "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary";
        if (link.disabled) {
          return (
            <span
              key={link.label}
              role="link"
              aria-disabled="true"
              tabIndex={0}
              title={link.disabledReason}
              data-testid={`nav-disabled-${link.label.toLowerCase()}`}
              className={`${baseClass} cursor-not-allowed border-transparent text-text-disabled opacity-60`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{link.icon}</span>
              {link.label}
            </span>
          );
        }
        return (
          <Link
            key={link.label}
            to={link.to ?? "#"}
            aria-current={link.active ? "page" : undefined}
            className={`${baseClass} ${link.active ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-primary"}`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
