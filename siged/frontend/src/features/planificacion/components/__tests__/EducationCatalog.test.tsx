import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EducationCatalog } from "../EducationCatalog";

const level = { id: 3, nombre: "General", pp_minutos: 40, pp_semana_minimo: 30, subniveles: [{ id: 4, nombre: "Básica", pp_semana_minimo: 35 }] };

describe("EducationCatalog", () => {
  it("shows a loading state while the catalog is being fetched", () => {
    render(<EducationCatalog levels={[]} loading={true} />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando catálogo educativo");
  });

  it("shows an error affordance with retry on failure", () => {
    const onRetry = vi.fn();
    render(<EducationCatalog levels={[]} error="no se pudo cargar" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("no se pudo cargar");
    screen.getByRole("button", { name: /reintentar/i }).click();
    expect(onRetry).toHaveBeenCalled();
  });

  it("shows the empty state when there are no levels and no loading or error", () => {
    render(<EducationCatalog levels={[]} />);
    expect(screen.getByText("No hay niveles educativos disponibles.")).toBeInTheDocument();
  });

  it("renders the level cards with their sublevels in Spanish", () => {
    render(<EducationCatalog levels={[level]} />);
    expect(screen.getByText("Estructura del sistema educativo")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Básica")).toBeInTheDocument();
  });
});
