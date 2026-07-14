import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PlanningNavigation } from "../PlanningNavigation";

function renderNav(institutionId: number, parentId: number, section: string) {
  return render(
    <MemoryRouter>
      <PlanningNavigation institutionId={institutionId} parentId={parentId} section={section} />
    </MemoryRouter>,
  );
}

describe("PlanningNavigation", () => {
  it("renders the planes tab as clickable and disables Grados/Asignaturas when no parent is selected", () => {
    renderNav(1, 0, "planes");
    expect(screen.getByRole("link", { name: "Planes de estudio" })).toHaveAttribute("href", "/instituciones/1/planificacion/planes");
  });

  it("disables Grados and Asignaturas when there is no parent plan or grade", () => {
    renderNav(1, 0, "planes");
    const grados = screen.getByTestId("nav-disabled-grados");
    const asignaturas = screen.getByTestId("nav-disabled-asignaturas");
    expect(grados).toHaveAttribute("aria-disabled", "true");
    expect(grados).toHaveAttribute("title", expect.stringContaining("plan de estudio"));
    expect(asignaturas).toHaveAttribute("aria-disabled", "true");
    expect(asignaturas).toHaveAttribute("title", expect.stringContaining("grado escolar"));
  });

  it("enables Grados with the plan id when the user is in the grados section", () => {
    renderNav(1, 7, "grados");
    expect(screen.getByRole("link", { name: "Grados" })).toHaveAttribute("href", "/instituciones/1/planificacion/grados?plan=7");
  });

  it("enables Asignaturas with the grade id when the user is in the asignaturas section", () => {
    renderNav(1, 4, "asignaturas");
    expect(screen.getByRole("link", { name: "Asignaturas" })).toHaveAttribute("href", "/instituciones/1/planificacion/asignaturas?grado=4");
  });

  it("marks the active section with aria-current page", () => {
    renderNav(1, 7, "grados");
    expect(screen.getByRole("link", { name: "Grados" })).toHaveAttribute("aria-current", "page");
  });
});
