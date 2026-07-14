import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { institutionApi } from "@/features/instituciones/services/api";
import { InstitutionDashboardPage } from "../InstitutionDashboardPage";

const assigned = { id: 1, nombre: "Escuela Central", codigo: "A", ruc: "1", fecha_creacion: "2026-01-01", fecha_actualizacion: null };

function renderDashboard() {
  return render(
    <AuthContext.Provider value={{ token: "token", user: null, activeRoles: [], login: vi.fn(), logout: vi.fn(), isLoading: false }}>
      <MemoryRouter initialEntries={["/instituciones/1"]}>
        <Routes>
          <Route path="/instituciones/:institutionId" element={<InstitutionDashboardPage />} />
          <Route path="/mis-instituciones" element={<p>Mis instituciones</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InstitutionDashboardPage", () => {
  it("renders the Spanish institution header and a SIGED palette quick action card", async () => {
    vi.spyOn(institutionApi, "mine").mockResolvedValue([assigned] as never);
    renderDashboard();
    await waitFor(() => expect(screen.getByText("Escuela Central")).toBeInTheDocument());
    expect(screen.getByText("Panel de la institución")).toBeInTheDocument();
    const card = screen.getByRole("link", { name: /planes de estudio/i });
    expect(card).toHaveAttribute("href", "/instituciones/1/planificacion/planes");
  });

  it("redirects to mis-instituciones when the institution is not in the user's assignments", async () => {
    vi.spyOn(institutionApi, "mine").mockResolvedValue([] as never);
    renderDashboard();
    expect(await screen.findByText("Mis instituciones")).toBeInTheDocument();
  });

  it("shows the loading state while the access check is pending", () => {
    vi.spyOn(institutionApi, "mine").mockImplementation(() => new Promise(() => undefined) as never);
    renderDashboard();
    expect(screen.getByRole("status")).toHaveTextContent("Cargando información");
  });
});
