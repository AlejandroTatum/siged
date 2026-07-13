import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { SideMenu } from "@/features/layout/components/SideMenu";
import { AuthContext } from "@/features/auth/context/AuthContext";

function renderSideMenu(isOpen: boolean, activeRoles: Array<{ id: number; nombre: string; nombre_display: string }> = [], onClose = vi.fn()) {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ token: "token", user: null, activeRoles, login: vi.fn(), logout: vi.fn(), isLoading: false }}>
        <SideMenu isOpen={isOpen} onClose={onClose} />
      </AuthContext.Provider>
    </BrowserRouter>,
  );
}

describe("SideMenu", () => {
  it("should not render when closed", () => {
    const { container } = renderSideMenu(false);
    expect(container.innerHTML).toBe("");
  });

  it("should render when open", () => {
    renderSideMenu(true);
    expect(screen.getByText("Menú principal")).toBeInTheDocument();
  });

  it("should call onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    renderSideMenu(true, [], onClose);

    const overlay = document.querySelector(".bg-overlay");
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();
    renderSideMenu(true, [], onClose);

    fireEvent.click(screen.getByLabelText("Cerrar menú"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows Instituciones only for an active administrator role", () => {
    renderSideMenu(true, [{ id: 1, nombre: "ADMINISTRADOR", nombre_display: "Administrador" }]);
    expect(screen.getByRole("link", { name: /Instituciones$/i })).toHaveAttribute("href", "/instituciones");
    expect(screen.queryByRole("link", { name: /Mis instituciones/i })).not.toBeInTheDocument();
  });

  it("shows Mis instituciones only when the active-role contract includes academic authority", () => {
    renderSideMenu(true, [{ id: 2, nombre: "AUTORIDAD_ACADEMICA", nombre_display: "Autoridad académica" }]);
    expect(screen.getByRole("link", { name: /Mis instituciones/i })).toHaveAttribute("href", "/mis-instituciones");
    expect(screen.queryByRole("link", { name: /^Instituciones$/i })).not.toBeInTheDocument();
  });

  it("does not show Mis instituciones when no active authority is returned", () => {
    renderSideMenu(true, [{ id: 3, nombre: "DOCENTE", nombre_display: "Docente" }]);
    expect(screen.queryByRole("link", { name: /Mis instituciones/i })).not.toBeInTheDocument();
  });

  it("shows every enabled option when both roles are active", () => {
    renderSideMenu(true, [
      { id: 1, nombre: "ADMINISTRADOR", nombre_display: "Administrador" },
      { id: 2, nombre: "AUTORIDAD_ACADEMICA", nombre_display: "Autoridad académica" },
    ]);
    expect(screen.getByRole("link", { name: /account_balance Instituciones/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mis instituciones/i })).toBeInTheDocument();
  });
});
