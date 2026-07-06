/**
 * Formulario de inicio de sesión.
 *
 * Captura las credenciales del usuario (número de identificación
 * y contraseña), valida campos obligatorios con asterisco rojo (*)
 * y envía la solicitud al backend.
 */

import { type FormEvent, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onSuccess?: () => void;
}

interface FieldErrors {
  numero_identificacion?: string;
  password?: string;
  general?: string;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FieldErrors {
    const fieldErrors: FieldErrors = {};
    if (!numeroIdentificacion.trim()) {
      fieldErrors.numero_identificacion =
        "El número de identificación es obligatorio.";
    }
    if (!password) {
      fieldErrors.password = "La contraseña es obligatoria.";
    }
    return fieldErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        numero_identificacion: numeroIdentificacion.trim(),
        password,
      });
      onSuccess?.();
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: Record<string, unknown> };
      if (apiError?.data) {
        const data = apiError.data;
        // Map DRF field errors
        const newErrors: FieldErrors = {};
        if (
          typeof data.numero_identificacion === "object" &&
          Array.isArray(data.numero_identificacion)
        ) {
          newErrors.numero_identificacion = (
            data.numero_identificacion as string[]
          ).join(" ");
        }
        if (
          typeof data.password === "object" &&
          Array.isArray(data.password)
        ) {
          newErrors.password = (data.password as string[]).join(" ");
        }
        if (typeof data.error === "string") {
          newErrors.general = data.error;
        }
        setErrors(newErrors);
      } else {
        setErrors({
          general: "Error al conectar con el servidor. Intente nuevamente.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Error general */}
      {errors.general && (
        <div
          role="alert"
          className="rounded-xl border border-error-border bg-error-bg px-4 py-3 text-sm text-error-text-strong"
        >
          {errors.general}
        </div>
      )}

      {/* Número de identificación */}
      <div className="space-y-2">
        <label
          htmlFor="numero_identificacion"
          className="block font-bold text-sm uppercase tracking-wider text-body"
        >
          Número de identificación{" "}
          <span className="text-danger">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            id="numero_identificacion"
            type="text"
            value={numeroIdentificacion}
            onChange={(e) => setNumeroIdentificacion(e.target.value)}
            placeholder="Ingrese su número de identificación"
            className={cn(
              "block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder-input-placeholder bg-input-bg text-body",
              errors.numero_identificacion
                ? "border-error-border-strong"
                : "border-input-border",
            )}
            disabled={isSubmitting}
            autoComplete="username"
          />
        </div>
        {errors.numero_identificacion && (
          <p className="text-sm text-error-text mt-1" role="alert">
            {errors.numero_identificacion}
          </p>
        )}
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block font-bold text-sm uppercase tracking-wider text-body"
        >
          Contraseña{" "}
          <span className="text-danger">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            className={cn(
              "block w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder-input-placeholder bg-input-bg text-body",
              errors.password
                ? "border-error-border-strong"
                : "border-input-border",
            )}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>
        {errors.password && (
          <p className="text-sm text-error-text mt-1" role="alert">
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-4 bg-primary hover:bg-primary/80 text-text-inverse font-bold text-lg rounded-full shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="inline-block w-6 h-6 border-2 border-text-inverse/30 border-t-text-inverse rounded-full animate-spin" />
          ) : (
            <>
              <svg
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Ingresar al sistema
            </>
          )}
        </button>
      </div>
    </form>
  );
}
