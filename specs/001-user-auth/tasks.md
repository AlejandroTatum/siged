# Tasks: Autenticación de Usuario (001-user-auth)

## Revisión de carga de trabajo

| Campo | Valor |
|-------|-------|
| Líneas estimadas cambiadas | ~900–1200 |
| Riesgo de presupuesto de 400 líneas | Alto |
| PR encadenados recomendados | Sí |
| División sugerida | PR 1 (Backend) → PR 2 (Login frontend) → PR 3 (Layout autenticado) |
| Estrategia de entrega | ask-on-risk |
| Estrategia de cadena | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Unidades de trabajo sugeridas

| Unidad | Objetivo | PR | Notas |
|--------|----------|----|-------|
| 1 | Backend: modelo Usuario + API login/logout + tests | PR 1 → main | Base funcional, verificable con curl/Browsable API |
| 2 | Frontend: login + AuthContext + AuthApi + tests | PR 2 → main | Depende del endpoint de PR 1 en main |
| 3 | Layout autenticado + navegación protegida + tests | PR 3 → main | Depende de PR 1 y PR 2 en main |

## Fase 1: Backend — Modelo y API de autenticación

- [x] 1.1 Crear `siged/backend/` con proyecto Django, app `core`, config CORS, admin
- [x] 1.2 Extender `AbstractUser` en `core/models.py` con `numero_identificacion` como campo único de autenticación
- [x] 1.3 Registrar modelo Usuario en admin con `UsuarioAdmin` personalizado
- [x] 1.4 Crear `core/apis/serializers/autenticacion_serializer.py` con `LoginSerializer` (valida numero_identificacion y password como obligatorios)
- [x] 1.5 Crear `core/daos/usuario_dao.py` con `UsuarioDAO.obtener_por_identificacion(numero_identificacion)`
- [x] 1.6 Crear `core/servicios/autenticacion_servicio.py` con métodos `iniciar_sesion` y `cerrar_sesion`
- [x] 1.7 Crear `core/apis/views.py` con `LoginView` (POST, pública) y `LogoutView` (POST, autenticada)
- [x] 1.8 Crear `core/apis/urls.py` registrando `/login/` y `/logout/`; vincular en `config/urls.py`
- [x] 1.9 Agregar `rest_framework.authentication.TokenAuthentication` como clase por defecto en settings
- [x] 1.10 Crear fixture/data de superusuario admin según convención del proyecto

## Fase 2: Frontend — Configuración, tema y pantalla de login

- [x] 2.1 Inicializar proyecto Vite+React+TS en `siged/frontend/` con puerto 3000 fijo
- [x] 2.2 Configurar Tailwind con paleta de colores del proyecto (background, primary, sidebar, etc.)
- [x] 2.3 Crear `frontend/src/config/app.ts` con constantes `app_name` y `app_full_name`
- [x] 2.4 Crear `frontend/src/config/endpoints.ts` con rutas `/login/` y `/logout/`
- [x] 2.5 Crear `features/auth/services/authApi.ts` con funciones `login()` y `logout()`
- [x] 2.6 Crear `features/auth/context/AuthContext.tsx` y `features/auth/hooks/useAuth.ts` (token en localStorage, clave `authToken`)
- [x] 2.7 Crear `features/auth/components/LoginForm.tsx` con campos numero_identificacion y password, asterisco rojo en obligatorios, Material Symbols
- [x] 2.8 Crear `features/auth/pages/LoginPage.tsx` según prototipo `stitch_login` (panel izquierdo decorativo, formulario derecho, footer)
- [x] 2.9 Configurar router con ruta pública `/login` y redirect a Home si ya autenticado

## Fase 3: Frontend — Layout autenticado y navegación protegida

- [x] 3.1 Crear `features/layout/components/TopBar.tsx` con hamburger menu, nombre usuario, cerrar sesión (Material Symbols)
- [x] 3.2 Crear `features/layout/components/SideMenu.tsx` desplegable con overlay, colores desde tema (`sidebar`, `sidebar-active`, `sidebar-hover`)
- [x] 3.3 Crear `features/layout/pages/AuthenticatedLayout.tsx` con TopBar + SideMenu + área principal + footer
- [x] 3.4 Implementar ruta protegida (`ProtectedRoute`) que redirige a `/login` sin token válido
- [x] 3.5 Crear `pages/HomePage.tsx` con bloque de encabezado (`heading-block`, `heading-block-border`) y mensaje de bienvenida
- [x] 3.6 Vincular layout autenticado con HomePage en el router

## Fase 4: Pruebas y verificación

- [x] 4.1 Escribir tests unitarios backend: validación serializer, servicio (credenciales inválidas, usuario inactivo), eliminación token en logout
- [x] 4.2 Escribir tests de integración backend: vista→servicio→DAO, login exitoso retorna token, logout requiere autenticación
- [x] 4.3 Escribir tests de autorización backend: login público (200), logout sin token (401), logout con token (200)
- [x] 4.4 Escribir tests funcionales frontend: render LoginPage, llamada a login() con credenciales, almacenamiento de token en contexto
- [x] 4.5 Escribir tests de UI frontend: visualización de errores, campos obligatorios con asterisco, redirect post-login
- [x] 4.6 Verificar integración frontend→backend: login exitoso, login fallido, logout, protección de ruta sin token
- [x] 4.7 Verificar SKILL.md: endpoints centralizados, constantes desde app.ts, colores desde tema, layout post-login con TopBar+SideMenu+footer
  - *Audit 2026-07-06*: Fixes applied — colores hardcodeados reemplazados por clases del tema, `var()` inline reemplazado por clases semánticas, año del footer dinámico, tipos movidos a `types/authTypes.ts`, `tokenValue` opcional eliminado de `login()`, contratos sincronizados con prefijo `/api/`. Pendiente: hover activo `--color-sidebar-hover` añadido en SideMenu.
