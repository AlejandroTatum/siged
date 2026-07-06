import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, AuthContext } from "@/features/auth/context/AuthContext";
import { useContext } from "react";

// Mock the api module
vi.mock("@/features/auth/services/authApi", () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

import { login as apiLogin, logout as apiLogout } from "@/features/auth/services/authApi";

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
  });

});
