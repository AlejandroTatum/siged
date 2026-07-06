/**
 * Pantalla de inicio de sesión.
 *
 * Muestra la página de login con panel decorativo izquierdo
 * y formulario de credenciales a la derecha, según el
 * prototipo stitch_login.
 */

import { useNavigate } from "react-router-dom";
import { app_full_name, app_name } from "@/config/app";
import { LoginForm } from "@/features/auth/components/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  function handleLoginSuccess() {
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left Panel: Atmosphere */}
      <section className="w-full md:w-1/2 min-h-[409px] md:min-h-screen bg-primary flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-secondary opacity-90 z-0" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-text-inverse/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-text-inverse/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          {/* Illustration */}
          <div className="w-full max-w-[320px] md:max-w-[420px] mb-8 drop-shadow-2xl">
            <img
              alt={app_full_name}
              className="w-full h-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYd5HcUYH2gi2PHSBd6DXciufS_e4-aPNwJYpYq_MRrWADHtUVeRM-V-h94MyQiarTsWYIqxfSJst_jUAgLK4VqKylQzapnpk9gYK8elu_hfmwN15FvmOqerhnw6CTQA9P3d1R8uUO1pkKk2CT0qgFDvbdIPunnTL8LQal-cbRIScaaj04CXH1efEem6PFxBfzjM0D0ovS24TR1hrpIe77HqRUJQAD-bXSohDjmndQYzCHKkJgpIq_S8mYTTWz97f5FXjNokA74KIo"
            />
          </div>
          {/* Product Identity */}
          <h1 className="text-text-inverse italic font-headline text-lg md:text-2xl leading-relaxed tracking-wide opacity-90">
            {app_full_name} ({app_name})
          </h1>
        </div>
      </section>

      {/* Right Panel: Login Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md space-y-10">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-1 bg-primary rounded-full" />
              <span className="text-primary font-headline font-extrabold text-3xl tracking-tight">
                {app_name}
              </span>
            </div>
            <p className="font-medium text-lg text-text-muted">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>

          {/* Form */}
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </section>

      {/* Global Footer */}
      <footer className="w-full py-6 px-8 bg-background text-center md:absolute md:bottom-0 md:right-0 md:w-1/2">
        <p className="text-xs font-label uppercase tracking-widest text-text-muted">
          &copy; {new Date().getFullYear()} {app_name}
        </p>
      </footer>
    </div>
  );
}
