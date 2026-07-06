# Plan de Implementación Técnica: Autenticación de Usuario

**Rama**: `001-user-auth` | **Fecha**: 2026-05-11 | **Spec**: [spec.md](./spec.md)  

---

## 1. Propósito técnico del plan

Definir la estrategia técnica para implementar el inicio y cierre de sesión de usuarios mediante autenticación basada en token, garantizando consistencia con la constitución del proyecto y con la especificación funcional asociada.

---

## 2. Decisiones de diseño e implementación

**Ubicación**: `specs/001-user-auth/research.md`

---

## 3. Componentes técnicos impactados

### Backend (Django)

**Base de referencia**: `siged/backend/apps/`

| Componente | Acción | Propósito |
|---|---|---|
| `core/models.py` | Crear | Definir modelo de Usuario |
| `core/apis/views.py` | Crear | Exponer los endpoints de inicio y cierre de sesión |
| `core/apis/urls.py` | Crear | Registrar las rutas de inicio y cierre de sesión |
| `core/apis/serializers/autenticacion_serializer.py` | Crear | Validar las solicitudes y estructurar las respuestas de inicio y cierre de sesión |
| `core/servicios/autenticacion_servicio.py` | Crear | Centralizar la lógica de inicio y cierre de sesión |
| `core/daos/usuario_dao.py` | Crear | Encapsular la recuperación del usuario y el acceso al token utilizado en inicio y cierre de sesión |
| `core/tests.py` | Crear | Verificar los flujos de inicio y cierre de sesión |


### Frontend (React)

**Base de referencia**: `siged/frontend/src/`

| Componente | Acción | Propósito |
|---|---|---|
| `features/auth/pages/LoginPage.tsx` | Crear | Presentar la vista de inicio de sesión |
| `features/auth/components/LoginForm.tsx` | Crear | Gestionar la captura de credenciales |
| `features/auth/services/authApi.ts` | Crear | Consumir la API de inicio y cierre de sesión |
| `features/auth/hooks/useAuth.ts` | Crear | Gestionar el estado de sesión del usuario |
| `features/auth/context/AuthContext.tsx` | Crear | Proveer contexto de autenticación global |
| `features/layout/components/TopBar.tsx` | Crear | Mostrar barra superior con usuario y cierre de sesión |
| `features/layout/components/SideMenu.tsx` | Crear | Mostrar menú lateral desplegable según rol del usuario |
| `features/layout/pages/AuthenticatedLayout.tsx` | Crear | Presentar la estructura base de pantalla autenticada |

---

## 4. Contratos e interfaces a implementar o modificar

**Ubicación**: `specs/001-user-auth/contracts/auth-contracts.md`

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| POST | `/login/` | Inicio de sesión | Usuario no autenticado |
| POST | `/logout/` | Cierre de sesión | Usuario autenticado |

---

## 5. Interfaz de usuario y navegabilidad del frontend

Los prototipos de referencia son:

**Pantalla de inicio de sesión**
- Prototipo visual: `specs/001-user-auth/docs/prototypes/stitch_login/screen.png`
- Prototipo en html: `specs/001-user-auth/docs/prototypes/stitch_login/code.html`

**Pantalla inicial autenticada posterior al inicio de sesión (Home)**
- Maquetación visual: `specs/001-user-auth/docs/prototypes/stitch_dashboard/screen.png`
- Prototipo en html: `specs/001-user-auth/docs/prototypes/stitch_dashboard/code.html`

Lineamientos a cumplir:

- La pantalla dispone de una estructura base que incluye una **barra superior**, el **menú lateral** que es desplegable, el **área principal de contenido** y el **footer**. 
- La **barra superior** para mostrar el nombre completo del sistema junto con sus siglas debe utilizar las variables `app_full_name` y `app_name` definidas en `frontend/src/config/app.ts`.
- El **footer** debe mostrar las siglas del sistema mediante el uso de la variable `app_name`, definida en `frontend/src/config/app.ts`.

---
## 6. Estrategias de verificación

### Pruebas unitarias
- validación de campos obligatorios (número de identificación y contraseña) mediante serializer
- comportamiento del servicio de autenticación (verificación de contraseña y estado activo)
- eliminación del token al cerrar sesión.

### Pruebas funcionales
- inicio de sesión con credenciales válidas y redirección automática a Home
- rechazo de credenciales inválidas con visualización de mensaje de error
- rechazo de campos vacíos con mensajes de validación de obligatoriedad
- rechazo de usuario inactivo con visualización de mensaje específico
- cierre de sesión exitoso con invalidación de token y redirección automática a login
- denegación de acceso a recursos protegidos sin sesión válida y redirección automática a login

### Pruebas de interfaz (UI)
- renderizado correcto de la pantalla de inicio de sesión y formulario de credenciales
- visualización de mensajes de error en pantalla ante credenciales inválidas, campos vacíos o usuario inactivo
- redirección automática al Home tras inicio de sesión exitoso
- visualización de la barra superior con nombre de usuario y opción de cerrar sesión
- redirección automática a login tras cierre de sesión o intento de acceso sin sesión válida

### Pruebas de integración
- integración controladores (`views`) → servicio → DAO,
- integración frontend → API de autenticación.

### Pruebas de autorización
- Acceso permitido para usuario autenticado (cierre de sesión)
- Acceso denegado para usuario no autenticado (cierre de sesión)
- Acceso permitido para usuario no autenticado (inicio de sesión — endpoint público)