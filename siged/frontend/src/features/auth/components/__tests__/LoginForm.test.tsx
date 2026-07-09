import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthContext } from "@/features/auth/context/AuthContext";

function renderLoginForm(onSuccess?: () => void) {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider
      value={{
        token: null,
        user: null,
        login: mockLogin,
        logout: mockLogout,
        isLoading: false,
      }}
    >
      <BrowserRouter>{children}</BrowserRouter>
    </AuthContext.Provider>
  );

  return {
    mockLogin,
    mockLogout,
    ...render(<LoginForm onSuccess={onSuccess} />, { wrapper }),
  };
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with required fields", () => {
    renderLoginForm();

    expect(
      screen.getByLabelText(/número de identificación/i),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/contraseña/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /ingresar al sistema/i }),
    ).toBeInTheDocument();
  });

  it("should show asterisk for required fields", () => {
    renderLoginForm();

    const labels = document.querySelectorAll("label");
    const hasAsterisk = Array.from(labels).some((label) =>
      label.innerHTML.includes("*"),
    );
    expect(hasAsterisk).toBe(true);

    // Each required label should have a red asterisk via the danger class
    const asteriskSpans = document.querySelectorAll('label span.text-danger');
    expect(asteriskSpans.length).toBeGreaterThanOrEqual(2);
  });

  it("should show validation errors when fields are empty on submit", async () => {
    renderLoginForm();

    const submitButton = screen.getByRole("button", { name: /ingresar al sistema/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/el número de identificación es obligatorio/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/la contraseña es obligatoria/i),
      ).toBeInTheDocument();
    });
  });

  it("should call login on valid submission", async () => {
    const onSuccess = vi.fn();
    const { mockLogin } = renderLoginForm(onSuccess);

    mockLogin.mockResolvedValue({
      token: "abc123",
      usuario: {
        id: 1,
        numero_identificacion: "12345678",
        first_name: "Test",
        last_name: "User",
        is_active: true,
      },
    });

    fireEvent.change(
      screen.getByLabelText(/número de identificación/i),
      { target: { value: "12345678" } },
    );
    fireEvent.change(
      screen.getByLabelText(/contraseña/i),
      { target: { value: "mypassword" } },
    );

    const submitButton = screen.getByRole("button", { name: /ingresar al sistema/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        numero_identificacion: "12345678",
        password: "mypassword",
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("should show general error on invalid credentials (RF-003)", async () => {
    const { mockLogin } = renderLoginForm();
    mockLogin.mockRejectedValue({
      status: 401,
      data: { error: "Credenciales inválidas" },
    });

    fireEvent.change(screen.getByLabelText(/número de identificación/i), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar al sistema/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it("should show general error on inactive account (RF-004)", async () => {
    const { mockLogin } = renderLoginForm();
    mockLogin.mockRejectedValue({
      status: 403,
      data: { error: "Cuenta inactiva" },
    });

    fireEvent.change(screen.getByLabelText(/número de identificación/i), {
      target: { value: "12345678" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "mypassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar al sistema/i }));

    await waitFor(() => {
      expect(screen.getByText(/cuenta inactiva/i)).toBeInTheDocument();
    });
  });
});
