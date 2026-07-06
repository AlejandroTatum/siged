/**
 * Barra superior del layout autenticado.
 *
 * Muestra el menú hamburguesa, el nombre completo del sistema
 * y la información del usuario con opción de cerrar sesión.
 * Los colores se aplican desde el tema centralizado.
 */

import { app_full_name } from "@/config/app";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const fullName =
    user?.first_name || user?.last_name
      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
      : user?.numero_identificacion ?? "Usuario";

  return (
    <header className="h-16 border-b border-border flex justify-between items-center px-4 sticky top-0 z-50 bg-header-top">
      {/* Left: Hamburger Menu */}
      <div className="flex-1 flex items-center">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 bg-dark text-text-inverse rounded-md flex items-center justify-center hover:bg-dark-hover transition-colors focus:outline-none"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </div>

      {/* Center: Title */}
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-medium text-text-heading">
          {app_full_name}
        </span>
        <span className="material-symbols-outlined text-text-heading text-2xl">
          school
        </span>
      </div>

      {/* Right: User Info */}
      <div className="flex-1 flex flex-col items-end justify-center leading-tight">
        <p className="text-[13px] font-bold text-text-heading">{fullName}</p>
        <button
          onClick={handleLogout}
          className="text-[13px] font-medium text-primary hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
