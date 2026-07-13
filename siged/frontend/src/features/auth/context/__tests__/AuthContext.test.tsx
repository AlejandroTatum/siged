import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, AuthContext } from "@/features/auth/context/AuthContext";
import { useContext } from "react";
import { MemoryRouter } from "react-router-dom";
import App from "@/App";

// Mock the api module
vi.mock("@/features/auth/services/authApi", () => ({
  getActiveRoles: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

import { getActiveRoles, login as apiLogin, logout as apiLogout } from "@/features/auth/services/authApi";

function TestConsumer() {
  const context = useContext(AuthContext);
  if (!context) return <div>No context</div>;

  return (
    <div>
      <div data-testid="token">{context.token ?? "null"}</div>
      <div data-testid="user">
        {context.user ? JSON.stringify(context.user) : "null"}
      </div>
      <div data-testid="loading">{context.isLoading ? "true" : "false"}</div>
      <div data-testid="roles">{context.activeRoles.map((role) => role.nombre).join(",")}</div>
      <button
        data-testid="login-btn"
        onClick={() =>
          context.login({
            numero_identificacion: "123",
            password: "pass",
          })
        }
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => context.logout()}>
        Logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (getActiveRoles as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it("should provide initial null state", () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("token").textContent).toBe("null");
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("should store token and user on successful login", async () => {
    const mockResponse = {
      token: "test-token-123",
      usuario: {
        id: 1,
        numero_identificacion: "123",
        first_name: "Test",
        last_name: "User",
        is_active: true,
      },
    };
    (apiLogin as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    (getActiveRoles as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, nombre: "ADMINISTRADOR", nombre_display: "Administrador" },
    ]);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("token").textContent).toBe("test-token-123");
    });
    expect(localStorage.getItem("authToken")).toBe("test-token-123");
    await waitFor(() => expect(screen.getByTestId("roles")).toHaveTextContent("ADMINISTRADOR"));
    expect(getActiveRoles).toHaveBeenCalledWith("test-token-123");
  });

  it("hydrates distinct active roles when a stored session is reloaded", async () => {
    localStorage.setItem("authToken", "stored-token");
    (getActiveRoles as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, nombre: "ADMINISTRADOR", nombre_display: "Administrador" },
      { id: 2, nombre: "AUTORIDAD_ACADEMICA", nombre_display: "Autoridad académica" },
    ]);

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("roles")).toHaveTextContent("ADMINISTRADOR,AUTORIDAD_ACADEMICA"));
    expect(getActiveRoles).toHaveBeenCalledWith("stored-token");
  });

  it("clears a stored session only when bootstrap is definitively unauthorized", async () => {
    localStorage.setItem("authToken", "stale-token");
    localStorage.setItem("authUser", JSON.stringify({ id: 1 }));
    (getActiveRoles as ReturnType<typeof vi.fn>).mockRejectedValue({ status: 401 });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    await waitFor(() => expect(screen.getByTestId("token")).toHaveTextContent("null"));
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("authUser")).toBeNull();
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("redirects a protected route to login after stale-token bootstrap", async () => {
    localStorage.setItem("authToken", "stale-token");
    (getActiveRoles as ReturnType<typeof vi.fn>).mockRejectedValue({ status: 401 });

    render(<AuthProvider><MemoryRouter initialEntries={["/"]}><App /></MemoryRouter></AuthProvider>);

    expect(screen.getByRole("status")).toHaveTextContent("Validating session...");
    expect(await screen.findByText(/ingrese sus credenciales/i)).toBeInTheDocument();
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("keeps stored auth after a transient bootstrap failure", async () => {
    localStorage.setItem("authToken", "stored-token");
    (getActiveRoles as ReturnType<typeof vi.fn>).mockRejectedValue(new TypeError("Network error"));

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("token")).toHaveTextContent("stored-token");
    expect(localStorage.getItem("authToken")).toBe("stored-token");
  });

  it("should clear state on logout", async () => {
    (apiLogin as ReturnType<typeof vi.fn>).mockResolvedValue({
      token: "test-token",
      usuario: {
        id: 1,
        numero_identificacion: "123",
        first_name: "Test",
        last_name: "User",
        is_active: true,
      },
    });
    (apiLogout as ReturnType<typeof vi.fn>).mockResolvedValue({
      mensaje: "Sesión cerrada correctamente",
    });

    localStorage.setItem("authToken", "test-token");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("token").textContent).toBe("test-token");
    });

    fireEvent.click(screen.getByTestId("logout-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("token").textContent).toBe("null");
    });
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(screen.getByTestId("roles")).toHaveTextContent("");
  });

});
