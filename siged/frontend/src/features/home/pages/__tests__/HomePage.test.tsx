import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "@/features/home/pages/HomePage";
import { AuthContext } from "@/features/auth/context/AuthContext";

function renderHome() {
  return render(
    <AuthContext.Provider
      value={{
        token: "token-123",
        user: {
          id: 1,
          numero_identificacion: "12345678",
          first_name: "Susana",
          last_name: "Moreno",
          is_active: true,
        },
        login: vi.fn(),
        logout: vi.fn(),
        isLoading: false,
      }}
    >
      <HomePage />
    </AuthContext.Provider>,
  );
}

describe("HomePage", () => {
  it("should render welcome message with user name", () => {
    renderHome();
    expect(
      screen.getByText(/¡Bienvenido\/a, Susana Moreno!/i),
    ).toBeInTheDocument();
  });

  it("should render system description", () => {
    renderHome();
    expect(
      screen.getByText(/Acceda a las funcionalidades del SIGED/i),
    ).toBeInTheDocument();
  });

  it("should render profile card with status", () => {
    renderHome();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });
});
