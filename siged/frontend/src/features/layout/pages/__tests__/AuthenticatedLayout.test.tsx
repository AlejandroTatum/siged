import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthenticatedLayout } from "@/features/layout/pages/AuthenticatedLayout";
import { AuthContext } from "@/features/auth/context/AuthContext";

function renderLayout() {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();

  return render(
    <AuthContext.Provider
      value={{
        token: "token-123",
        user: {
          id: 1,
          numero_identificacion: "12345678",
          first_name: "Test",
          last_name: "User",
          is_active: true,
        },
        login: mockLogin,
        logout: mockLogout,
        isLoading: false,
      }}
    >
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AuthenticatedLayout />}>
            <Route index element={<div>Home content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("AuthenticatedLayout", () => {
  it("should render TopBar", () => {
    renderLayout();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should render footer with SIGED", () => {
    renderLayout();
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear} SIGED`))).toBeInTheDocument();
  });

  it("should render outlet content", () => {
    renderLayout();
    expect(screen.getByText("Home content")).toBeInTheDocument();
  });

  it("should render hamburger menu button", () => {
    renderLayout();
    expect(screen.getByLabelText("Abrir menú")).toBeInTheDocument();
  });
});
