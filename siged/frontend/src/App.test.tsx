import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import { AuthContext } from "@/features/auth/context/AuthContext";

function renderApp(token: string | null = null, isLoading = false) {
  return render(
    <AuthContext.Provider
      value={{
        token,
        activeRoles: [],
        user: token
          ? {
              id: 1,
              numero_identificacion: "123",
              first_name: "Test",
              last_name: "User",
              is_active: true,
            }
          : null,
        login: vi.fn(),
        logout: vi.fn(),
        isLoading,
      }}
    >
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

function renderAppWithPath(
  path: string,
  token: string,
  activeRoles: { id: number; nombre: string; nombre_display: string }[] = [],
) {
  return render(
    <AuthContext.Provider
      value={{
        token,
        activeRoles,
        user: {
          id: 1,
          numero_identificacion: "123",
          first_name: "Test",
          last_name: "User",
          is_active: true,
        },
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      }}
    >
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("App routing", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        const isPaginatedList = url.includes("/api/instituciones/?");
        return {
          ok: true,
          status: 200,
          json: async () =>
            isPaginatedList
              ? { count: 0, next: null, previous: null, results: [] }
              : [],
        };
      }),
    );
  });

  it("should redirect to /login when no token", () => {
    renderApp(null);
    expect(
      screen.getByText(/ingrese sus credenciales/i),
    ).toBeInTheDocument();
  });

  it("should render authenticated layout when token exists", () => {
    renderApp("valid-token");
    expect(
      screen.getByText(/¡Bienvenido\/a, Test User!/i),
    ).toBeInTheDocument();
  });

  it("does not render protected routes before stored auth validation finishes", () => {
    renderApp("stored-token", true);
    expect(screen.getByRole("status")).toHaveTextContent("Validating session...");
    expect(screen.queryByText(/¡Bienvenido\/a/i)).not.toBeInTheDocument();
  });

  it("should redirect authenticated user from /login to /", () => {
    renderAppWithPath("/login", "valid-token");
    expect(
      screen.getByText(/¡Bienvenido\/a, Test User!/i),
    ).toBeInTheDocument();
  });

  it("redirects an authenticated user without ADMINISTRADOR away from /instituciones", () => {
    renderAppWithPath("/instituciones", "valid-token", []);
    expect(
      screen.getByText(/¡Bienvenido\/a, Test User!/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Gestión de instituciones educativas/i)).not.toBeInTheDocument();
  });

  it("allows a user with ADMINISTRADOR to access /instituciones", () => {
    renderAppWithPath("/instituciones", "valid-token", [
      { id: 1, nombre: "ADMINISTRADOR", nombre_display: "Administrador" },
    ]);
    expect(screen.getByText(/Gestión de instituciones educativas/i)).toBeInTheDocument();
  });

  it("redirects an authenticated user without AUTORIDAD_ACADEMICA away from /mis-instituciones", () => {
    renderAppWithPath("/mis-instituciones", "valid-token", []);
    expect(
      screen.getByText(/¡Bienvenido\/a, Test User!/i),
    ).toBeInTheDocument();
  });

  it("allows a user with AUTORIDAD_ACADEMICA to access /mis-instituciones", () => {
    renderAppWithPath("/mis-instituciones", "valid-token", [
      { id: 2, nombre: "AUTORIDAD_ACADEMICA", nombre_display: "Autoridad académica" },
    ]);
    expect(screen.queryByText(/¡Bienvenido\/a, Test User!/i)).not.toBeInTheDocument();
  });
});
