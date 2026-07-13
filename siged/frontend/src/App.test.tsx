import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

function renderAppWithPath(path: string, token: string) {
  return render(
    <AuthContext.Provider
      value={{
        token,
        activeRoles: [],
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
});
