import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { TopBar } from "@/features/layout/components/TopBar";
import { AuthContext } from "@/features/auth/context/AuthContext";

function renderTopBar(onToggleSidebar?: () => void) {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider
      value={{
        activeRoles: [],
        token: "token-123",
        user: {
          id: 1,
          numero_identificacion: "12345678",
          first_name: "Susana",
          last_name: "Moreno",
          is_active: true,
        },
        login: mockLogin,
        logout: mockLogout,
        isLoading: false,
      }}
    >
      <BrowserRouter>{children}</BrowserRouter>
    </AuthContext.Provider>
  );

  return {
    mockLogout,
    ...render(
      <TopBar onToggleSidebar={onToggleSidebar ?? vi.fn()} />,
      { wrapper },
    ),
  };
}

describe("TopBar", () => {
  it("should render user name", () => {
    renderTopBar();
    expect(screen.getByText("Susana Moreno")).toBeInTheDocument();
  });

  it("should have logout button", () => {
    renderTopBar();
    expect(
      screen.getByText("Cerrar sesión"),
    ).toBeInTheDocument();
  });

  it("should call logout and navigate on button click", async () => {
    const { mockLogout } = renderTopBar();
    fireEvent.click(screen.getByText("Cerrar sesión"));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
