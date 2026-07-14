import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PlanningTable } from "../PlanningTable";

const plan = { id: 7, nombre: "Plan 2026", es_activo: true };
const grade = {
  id: 8,
  nombre: "First",
  orden: 1,
  nivel: { id: 3, nombre: "General" },
  subnivel: { id: 4, nombre: "Básica" },
  carga_pedagogica_actual: 20,
  carga_pedagogica_minima: 35,
  alerta_carga_pedagogica: true,
};
const subject = { id: 9, nombre: "Math", pp_semana_minimo: 5 };

function renderTable(props: Partial<Parameters<typeof PlanningTable>[0]> = {}) {
  return render(
    <MemoryRouter>
      <PlanningTable institutionId={1} items={[]} onDelete={vi.fn()} onEdit={vi.fn()} section="planes" {...props} />
    </MemoryRouter>,
  );
}

describe("PlanningTable", () => {
  it("shows a loading state when loading is true", () => {
    renderTable({ loading: true });
    expect(screen.getByRole("status")).toHaveTextContent("Cargando registros");
  });

  it("shows an error alert with retry when the load failed", () => {
    const onRetry = vi.fn();
    renderTable({ error: "falló la carga", onRetry });
    expect(screen.getByRole("alert")).toHaveTextContent("falló la carga");
    const button = screen.getByRole("button", { name: /reintentar/i });
    button.click();
    expect(onRetry).toHaveBeenCalled();
  });

  it("shows the plans empty state when the items collection is empty", () => {
    renderTable({ section: "planes" });
    expect(screen.getByText("No hay planes de estudio registrados")).toBeInTheDocument();
  });

  it("shows the grades empty state for the grados section", () => {
    renderTable({ section: "grados" });
    expect(screen.getByText("No hay grados registrados")).toBeInTheDocument();
  });

  it("shows the asignaturas empty state for the asignaturas section", () => {
    renderTable({ section: "asignaturas" });
    expect(screen.getByText("No hay asignaturas registradas")).toBeInTheDocument();
  });

  it("renders an editable row for a plan and exposes Spanish actions", () => {
    renderTable({ section: "planes", items: [plan] });
    expect(screen.getByText("Plan 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gestionar grados de Plan 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar Plan 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar Plan 2026" })).toBeInTheDocument();
  });

  it("renders the carga pedagógica column for grades", () => {
    renderTable({ section: "grados", items: [grade] });
    expect(screen.getByText("20 / 35")).toBeInTheDocument();
  });

  it("renders the carga semanal mínima column for subjects", () => {
    renderTable({ section: "asignaturas", items: [subject] });
    expect(screen.getByText("5 períodos")).toBeInTheDocument();
  });

  it("renders distinct Nivel and Subnivel headers and cells for the grados section", () => {
    renderTable({ section: "grados", items: [grade] });
    const nivelHeader = screen.getByRole("columnheader", { name: "Nivel" });
    const subnivelHeader = screen.getByRole("columnheader", { name: "Subnivel" });
    expect(nivelHeader).toBeInTheDocument();
    expect(subnivelHeader).toBeInTheDocument();
    const row = screen.getByText("First").closest("tr");
    expect(row).not.toBeNull();
    const cells = row!.querySelectorAll("td");
    const cellTexts = Array.from(cells).map((cell) => cell.textContent);
    expect(cellTexts).toEqual(expect.arrayContaining(["General", "Básica"]));
  });

  it("renders an empty Subnivel cell when the grade has no subnivel", () => {
    const gradeWithoutSubnivel = { ...grade, subnivel: null };
    renderTable({ section: "grados", items: [gradeWithoutSubnivel] });
    const row = screen.getByText("First").closest("tr");
    expect(row).not.toBeNull();
    const cells = row!.querySelectorAll("td");
    const subnivelCell = cells[2];
    expect(subnivelCell).toBeDefined();
    expect(subnivelCell!.textContent).toBe("");
    expect(subnivelCell!.querySelector("span")).toBeNull();
    expect(screen.queryByText(/Sin subnivel/i)).not.toBeInTheDocument();
  });
});
