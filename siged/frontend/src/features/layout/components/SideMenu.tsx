/**
 * Menú lateral desplegable del layout autenticado.
 *
 * Se muestra con overlay sobre el contenido principal.
 * Los colores se aplican desde el tema centralizado usando
 * las variables CSS definidas en el theme.
 */

import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ROLE_ACADEMIC_AUTHORITY, ROLE_ADMINISTRATOR } from "@/config/app";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { activeRoles } = useAuth();
  const roleNames = new Set(activeRoles.map((role) => role.nombre));
  const institutionId = location.pathname.match(/^\/instituciones\/(\d+)/)?.[1];
  const isInstitutionalContext = Boolean(institutionId) && roleNames.has(ROLE_ACADEMIC_AUTHORITY);

  // Close sidebar when route changes
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      ref={sidebarRef}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside className="absolute left-0 top-0 h-full w-[280px] shadow-2xl text-text-inverse flex flex-col bg-sidebar">
        {/* Sidebar Header */}
        <div className="p-6 flex justify-between items-start">
          <span
            className="material-symbols-outlined text-6xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            groups
          </span>
          <button
            onClick={onClose}
            className="hover:bg-text-inverse/10 rounded-full p-1 transition-colors"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined text-4xl font-light">
              cancel
            </span>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-4">
          {isInstitutionalContext ? <>
          <NavLink to="/" onClick={onClose} className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-sidebar-hover"><span className="material-symbols-outlined">arrow_back</span><span>Volver al menú principal</span></NavLink>
          <NavLink to={`/instituciones/${institutionId}`} onClick={onClose} className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-sidebar-hover"><span className="material-symbols-outlined">school</span><span>Mi institución</span></NavLink>
          <NavLink to={`/instituciones/${institutionId}/planificacion/planes`} onClick={onClose} className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-sidebar-hover"><span className="material-symbols-outlined">menu_book</span><span>Planes de estudio</span></NavLink>
          </> : <><NavLink
            to="/"
            className="flex items-center gap-4 px-6 py-5 transition-colors bg-sidebar-active hover:bg-sidebar-hover"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-3xl">home</span>
            <span className="text-[17px] font-bold">Menú principal</span>
          </NavLink>
          {roleNames.has(ROLE_ADMINISTRATOR) && (
            <NavLink to="/instituciones" onClick={onClose} className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-sidebar-hover">
              <span className="material-symbols-outlined text-3xl">account_balance</span>
              <span className="text-[17px] font-bold">Instituciones</span>
            </NavLink>
          )}
          {roleNames.has(ROLE_ACADEMIC_AUTHORITY) && (
            <NavLink to="/mis-instituciones" onClick={onClose} className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-sidebar-hover">
              <span className="material-symbols-outlined text-3xl">domain</span>
              <span className="text-[17px] font-bold">Mis instituciones</span>
            </NavLink>
          )}
          </>}
        </nav>
      </aside>
    </div>
  );
}
