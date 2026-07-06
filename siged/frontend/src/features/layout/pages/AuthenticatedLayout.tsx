/**
 * Layout autenticado.
 *
 * Estructura base para todas las pantallas posteriores al inicio
 * de sesión. Incluye barra superior, menú lateral desplegable,
 * área principal de contenido y footer.
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { app_name } from "@/config/app";
import { SideMenu } from "@/features/layout/components/SideMenu";
import { TopBar } from "@/features/layout/components/TopBar";

export function AuthenticatedLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sidebar */}
      <SideMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Top Bar */}
      <TopBar onToggleSidebar={() => setSidebarOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-xs text-text-disabled">
        &copy; {new Date().getFullYear()} {app_name}
      </footer>
    </div>
  );
}
