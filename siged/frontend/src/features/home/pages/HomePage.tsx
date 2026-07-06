/**
 * Página de inicio (Home) del layout autenticado.
 *
 * Muestra el bloque de encabezado con bienvenida al usuario
 * y un mensaje introductorio del sistema, según el prototipo
 * stitch_dashboard.
 */

import { app_full_name, app_name } from "@/config/app";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HomePage() {
  const { user } = useAuth();

  const fullName =
    user?.first_name || user?.last_name
      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
      : user?.numero_identificacion ?? "Usuario";

  const identificacion = user?.numero_identificacion ?? "";

  return (
    <div className="space-y-8 px-8 py-8">
      {/* Heading Block */}
      <section className="relative bg-heading-block border border-heading-block-border border-t-4 rounded-sm p-6 w-full shadow-sm flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-1 tracking-tight text-text-heading">
            ¡Bienvenido/a, {fullName}!
          </h2>
          <p className="text-text-secondary text-base">
            Acceda a las funcionalidades del {app_name}
          </p>
        </div>
        {/* Decorative icon */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-8xl text-primary">
            school
          </span>
        </div>
      </section>

      {/* Profile Card */}
      <div className="w-[280px]">
        <div className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="pt-10 pb-8 flex flex-col items-center text-center">
            <div className="mb-4">
              <span
                className="material-symbols-outlined text-7xl text-text-heading"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_circle
              </span>
            </div>
            <h3 className="text-[17px] font-bold text-text-heading">
              {fullName}
            </h3>
            <p className="text-[11px] text-text-muted mt-1">
              {identificacion}
            </p>
          </div>
          {/* Status */}
          <div className="w-full bg-primary text-text-inverse py-3.5 flex items-center justify-center gap-2 font-bold text-[14px]">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'wght' 600" }}
            >
              check
            </span>
            Activo
          </div>
        </div>
      </div>
    </div>
  );
}
