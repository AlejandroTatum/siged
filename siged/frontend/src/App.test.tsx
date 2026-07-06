import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";
import { AuthContext } from "@/features/auth/context/AuthContext";

function renderApp(token: string | null = null) {
  return render(
    <AuthContext.Provider
      value={{
        token,
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
        isLoading: false,
      }}
    >
      <MemoryRouter initialEntries={["/"]}>
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
});
