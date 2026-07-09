# Design: 001-user-auth — As-Implemented Authentication Architecture

**Change**: `001-user-auth`  
**Project**: SIGED  
**Type**: As-Implemented Design / Review Artifact  
**Date**: 2026-07-09  
**Artifact Store**: OpenSpec  
**Scope**: Login, logout, DRF `TokenAuthentication`, active-user enforcement, protected routes, authenticated layout.

---

## Decision Summary

Feature 001 is implemented as a token-based authentication slice with clear backend layering and a frontend context boundary:

| Area | As-implemented decision |
|------|--------------------------|
| User identifier | `Usuario.numero_identificacion` replaces Django `username` as `USERNAME_FIELD`. |
| Token strategy | Django REST Framework authtoken via `TokenAuthentication`; one active token per user is renewed on successful login. |
| Backend layering | API views validate/translate HTTP concerns, service owns business rules, DAO owns user/token persistence. |
| Frontend state | `AuthProvider` stores token + user in React state and `localStorage`. |
| Route protection | `ProtectedRoute` redirects unauthenticated users to `/login`; `PublicRoute` redirects authenticated users from `/login` to `/`. |
| Logout UX | Frontend calls backend logout when a token exists, then always clears local auth state and navigates to `/login`. |

This artifact documents the current implementation. It does **not** authorize implementation changes; drift and cleanup findings are listed as task candidates.

---

## Evidence Read

### Backend

- `siged/backend/apps/core/models.py`
- `siged/backend/apps/core/excepciones.py`
- `siged/backend/apps/core/daos/usuario_dao.py`
- `siged/backend/apps/core/servicios/autenticacion_servicio.py`
- `siged/backend/apps/core/apis/serializers/autenticacion_serializer.py`
- `siged/backend/apps/core/apis/views.py`
- `siged/backend/apps/core/apis/urls.py`
- `siged/backend/config/settings.py`
- `siged/backend/config/urls.py`
- `siged/backend/apps/core/tests.py`

### Frontend

- `siged/frontend/src/config/endpoints.ts`
- `siged/frontend/vite.config.ts`
- `siged/frontend/src/features/auth/types/authTypes.ts`
- `siged/frontend/src/features/auth/utils/authStorage.ts`
- `siged/frontend/src/features/auth/services/authApi.ts`
- `siged/frontend/src/features/auth/context/AuthContext.tsx`
- `siged/frontend/src/features/auth/hooks/useAuth.ts`
- `siged/frontend/src/App.tsx`
- `siged/frontend/src/features/auth/pages/LoginPage.tsx`
- `siged/frontend/src/features/auth/components/LoginForm.tsx`
- `siged/frontend/src/features/layout/pages/AuthenticatedLayout.tsx`
- `siged/frontend/src/features/layout/components/TopBar.tsx`
- Auth/routing/layout test files under `siged/frontend/src/**/__tests__/`

---

## Backend Architecture

### Module Responsibilities

| Module | Responsibility | Notes |
|--------|----------------|-------|
| `apps/core/models.py` | Defines custom `Usuario` model and `UsuarioManager`. | `username = None`; `numero_identificacion` is unique and used as `USERNAME_FIELD`. |
| `apps/core/excepciones.py` | Defines domain exceptions. | `UsuarioNoEncontradoError`, `UsuarioInactivoError`, `CredencialesInvalidasError`. |
| `apps/core/daos/usuario_dao.py` | Encapsulates user lookup and token persistence. | Deletes existing token before creating a new one. |
| `apps/core/servicios/autenticacion_servicio.py` | Owns login/logout business rules. | Checks existence, active status, password, and token lifecycle. |
| `apps/core/apis/serializers/autenticacion_serializer.py` | Validates login DTO fields. | Requires non-blank `numero_identificacion` and `password`; Spanish field errors. |
| `apps/core/apis/views.py` | HTTP entry points for login/logout. | `login_view` is public; `logout_view` requires authentication. |
| `apps/core/apis/urls.py` | Registers `/api/login/` and `/api/logout/`. | Included by `config/urls.py` under `/api/`. |
| `config/settings.py` | DRF auth defaults. | `TokenAuthentication` and default `IsAuthenticated`. |

### Backend Contracts

#### Login

`POST /api/login/`

Request:

```json
{
  "numero_identificacion": "12345678",
  "password": "secret"
}
```

As-implemented responses:

| Case | Status | Body |
|------|--------|------|
| Valid active user | `200 OK` | `{ "token": "<token>", "usuario": { "id": 1, "numero_identificacion": "...", "first_name": "...", "last_name": "...", "is_active": true } }` |
| Missing/blank fields | `400 Bad Request` | DRF serializer errors keyed by `numero_identificacion` and/or `password`. |
| Wrong ID or password | `401 Unauthorized` | `{ "error": "Credenciales inválidas" }` |
| Inactive account | `403 Forbidden` | `{ "error": "Cuenta inactiva" }` |

#### Logout

`POST /api/logout/`

Headers:

```http
Authorization: Token <token>
```

As-implemented responses:

| Case | Status | Body |
|------|--------|------|
| Valid token | `200 OK` | `{ "mensaje": "Sesión cerrada correctamente" }` |
| Missing/invalid token | `401 Unauthorized` | DRF authentication error response. |

### Backend Login Flow

1. `login_view` receives the request at `/api/login/` with `AllowAny`.
2. `LoginSerializer` validates required non-blank fields.
3. `AutenticacionServicio.iniciar_sesion()` receives validated credentials.
4. `UsuarioDAO.obtener_por_identificacion()` loads the `Usuario` by `numero_identificacion`.
5. Missing users are translated to `CredencialesInvalidasError` so user enumeration is avoided.
6. Inactive users raise `UsuarioInactivoError` before password acceptance.
7. Password is validated with Django `check_password()`.
8. `UsuarioDAO.crear_token()` deletes any existing token and creates a fresh DRF token.
9. The API returns token + user metadata.

### Backend Logout Flow

1. `logout_view` requires `IsAuthenticated` and DRF `TokenAuthentication` resolves `request.user`.
2. `AutenticacionServicio.cerrar_sesion()` delegates token deletion to `UsuarioDAO.eliminar_token()`.
3. The token row is deleted and the API returns a Spanish success message.

---

## Frontend Architecture

### Module Responsibilities

| Module | Responsibility | Notes |
|--------|----------------|-------|
| `src/config/endpoints.ts` | Centralizes API endpoint constants. | Uses relative `/api`, proxied by Vite dev server to `http://localhost:8000`. |
| `src/features/auth/types/authTypes.ts` | Defines API and context TypeScript contracts. | Mirrors backend response shape. |
| `src/features/auth/utils/authStorage.ts` | Isolates `localStorage` read/write/clear. | Swallows storage exceptions for browser resilience. |
| `src/features/auth/services/authApi.ts` | Performs `fetch` requests for login/logout. | Throws `{ status, data }` object on non-OK responses. |
| `src/features/auth/context/AuthContext.tsx` | Owns auth state and exposes `login`, `logout`, `isLoading`. | Initializes from `localStorage`; persists successful login. |
| `src/features/auth/hooks/useAuth.ts` | Enforces context usage boundary. | Throws if used outside `AuthProvider`. |
| `src/App.tsx` | Owns route protection. | Defines `ProtectedRoute` and `PublicRoute`. |
| `src/features/auth/pages/LoginPage.tsx` | Page composition and post-login navigation. | Calls `navigate("/", { replace: true })` after successful login. |
| `src/features/auth/components/LoginForm.tsx` | Form state, client validation, API error mapping. | Spanish labels/errors and required-field indicators. |
| `src/features/layout/pages/AuthenticatedLayout.tsx` | Protected shell after login. | Renders `TopBar`, `SideMenu`, `Outlet`, footer. |
| `src/features/layout/components/TopBar.tsx` | User display and logout action. | Calls `logout()` then navigates to `/login`. |

### Frontend Auth State Flow

1. `main.tsx` wraps the application with `BrowserRouter` and `AuthProvider`.
2. `AuthProvider` initializes:
   - `token` from `localStorage["authToken"]`
   - `user` from `localStorage["authUser"]`
3. `LoginForm` validates fields client-side and calls `AuthContext.login()`.
4. `AuthContext.login()` calls `authApi.login()`, stores token/user in localStorage, then updates React state.
5. `LoginPage` receives `onSuccess` and navigates to `/`.
6. `ProtectedRoute` allows `/` only when `token` exists.
7. `TopBar` calls `AuthContext.logout()` and then navigates to `/login`.
8. `AuthContext.logout()` attempts backend token revocation when `token` exists, then clears local state even if the API call fails.

   > **Logout failure resilience**: The logout flow catches API errors silently. If the backend logout call fails (network error, server error), local state (React state + localStorage) is still cleared and the user is redirected to `/login`. This means a stale server-side token may remain valid after a failed logout, but the frontend recovers to a clean unauthenticated state. This is an intentional tradeoff (prioritizing user-facing recovery over server-side token consistency).

### Frontend Route Flow

| Route | Guard | Unauthenticated behavior | Authenticated behavior |
|-------|-------|--------------------------|------------------------|
| `/login` | `PublicRoute` | Shows `LoginPage`. | Redirects to `/`. |
| `/` | `ProtectedRoute` | Redirects to `/login`. | Shows `AuthenticatedLayout` with `HomePage` index. |
| `*` | catch-all | Redirects to `/`, then guard applies. | Redirects to `/`. |

---

## Test Boundaries

### Backend Tests

`siged/backend/apps/core/tests.py` covers:

| Boundary | Coverage |
|----------|----------|
| Serializer | Required fields, blank fields, valid DTO, Spanish messages. |
| DAO | User lookup, not-found exception, token create/renew/delete/read. |
| Service | Successful login, invalid password, missing user, inactive user, logout deletes token. |
| API integration | `/api/login/` success, invalid credentials, empty fields, inactive user. |
| Auth endpoint behavior | Public login, unauthorized logout, authenticated logout. |

Expected command from spec:

```bash
cd siged/backend && pytest --cov=core --cov-report=term-missing
```

### Frontend Tests

Frontend unit/component tests cover:

| Boundary | Test file |
|----------|-----------|
| API request shape | `features/auth/services/__tests__/authApi.test.ts` |
| Context login/logout state | `features/auth/context/__tests__/AuthContext.test.tsx` |
| Login form required fields and submit | `features/auth/components/__tests__/LoginForm.test.tsx` |
| Route guard smoke coverage | `App.test.tsx` |
| Authenticated shell rendering | `features/layout/pages/__tests__/AuthenticatedLayout.test.tsx` |
| TopBar logout interaction | `features/layout/components/__tests__/TopBar.test.tsx` |

Expected command from spec:

```bash
cd siged/frontend && npm test -- --coverage
```

No test execution was performed during this design phase.

---

## Requirement Traceability Hooks

| Requirement | Design evidence | Implementation hooks | Test hooks |
|-------------|-----------------|----------------------|------------|
| RF-001 mandatory fields | Login serializer + LoginForm validation | `LoginSerializer`, `LoginForm.validate()` | `LoginSerializerTestCase`, `LoginForm.test.tsx` |
| RF-002 valid active login | Backend login flow + frontend auth state flow | `AutenticacionServicio.iniciar_sesion()`, `UsuarioDAO.crear_token()`, `AuthContext.login()` | `AutenticacionServicioTestCase`, `LoginViewIntegrationTestCase`, `AuthContext.test.tsx` |
| RF-003 invalid credentials | Service translates missing user/wrong password to invalid credentials | `CredencialesInvalidasError`, `login_view` error mapping | Backend service/integration tests; `authApi.test.ts` failed-login path |
| RF-004 inactive account | Service rejects inactive users before token creation | `UsuarioInactivoError`, `login_view` 403 mapping | `test_iniciar_sesion_usuario_inactivo`, `test_login_usuario_inactivo_retorna_403` |
| RF-005 logout destroys token | Authenticated logout flow | `logout_view`, `AutenticacionServicio.cerrar_sesion()`, `UsuarioDAO.eliminar_token()`, `TopBar.handleLogout()` | `LogoutViewIntegrationTestCase`, `AuthContext.test.tsx`, `TopBar.test.tsx`, `authApi.test.ts` |
| RF-006 protected routes | Route guard flow | `ProtectedRoute`, `PublicRoute`, `useAuth()` | `App.test.tsx`, `AuthenticatedLayout.test.tsx` |
| TR-001 Spanish messages | Backend exceptions/serializer + UI labels/errors | `excepciones.py`, `LoginSerializer`, `LoginForm`, `TopBar` | Backend Spanish serializer test; component text assertions |

---

## As-Implemented Drift and Cleanup Findings

These are task candidates for the cleanup phase, not code changes made by this design phase.

| ID | Finding | Risk | Suggested task candidate |
|----|---------|------|--------------------------|
| DESIGN-GAP-01 | Canonical spec requirement prose says invalid credentials and inactive users return HTTP 400, but implementation/tests return `401` and `403`. | MEDIUM | Align spec text with as-implemented API contract or explicitly decide to change behavior later. |
| DESIGN-GAP-02 | ~~Spec traceability table references some non-existent/stale test names and class-style view names, e.g. `LoginExitoTest`, `LogoutExitoTest`, `LogoutView`; implementation uses `LoginViewIntegrationTestCase`, `LogoutViewIntegrationTestCase`, and function views.~~ | ~~LOW~~ **RESOLVED** | ~~Update traceability names to actual symbols before archive.~~ Resolved by apply task T1: traceability names updated in `spec.md` to match actual test classes and function views. |
| DESIGN-GAP-03 | ~~Frontend `authApi.request()` throws a plain `{ status, data }` object, while `authApi.test.ts` uses `rejects.toThrow()` for failed requests. That assertion may not match the actual error contract.~~ | ~~MEDIUM~~ **RESOLVED** | ~~Verify frontend test behavior and update tests to assert the plain-object contract or change `request()` to throw an `Error` subtype.~~ Resolved by apply task T3: `authApi.test.ts` assertions updated to `rejects.toMatchObject({ status: 401, data: expect.objectContaining({ error: expect.any(String) }) })` for both failed `login` and `logout` tests, validating the exact thrown-object contract. |
| DESIGN-GAP-04 | ~~`AuthContext.logout()` clears local state even when backend logout fails. This is good for UX recovery, but can leave a server token valid after network/backend failure.~~ | ~~MEDIUM~~ **RESOLVED** | ~~Document this as an intentional tradeoff or add a future retry/revocation strategy.~~ Resolved by apply task T2: explicit **"Logout failure resilience"** note added under "Frontend Auth State Flow" step 8 documenting the intentional tradeoff of prioritizing user-facing recovery over server-side token consistency. |
| DESIGN-GAP-05 | ~~Route guard tests cover unauthenticated `/` and authenticated `/`, but authenticated access to `/login` redirect is not directly covered in `App.test.tsx`.~~ | ~~LOW~~ **RESOLVED** | ~~Add a focused route test for `/login` with an existing token.~~ Resolved by apply task T5: added test `should redirect authenticated user from /login to /` in `App.test.tsx` using `renderAppWithPath("/login", "valid-token")`, which verifies the `PublicRoute` redirect behavior. |
| DESIGN-GAP-06 | Frontend logout redirect is covered indirectly through `TopBar` interaction but not as a full route-state integration scenario. | LOW | Add an integration-style test that validates logout clears state and lands on `/login`. |

No CRITICAL architecture blockers were found in the evidence read.

---

## Rollout, Rollback, and Review Notes

- **Runtime rollout**: No runtime rollout is part of this design phase; this artifact documents existing behavior only.
- **Rollback**: Revert `openspec/changes/001-user-auth/design.md` if the design artifact is not wanted.
- **Review path**:
  1. Confirm backend status-code contract: `400` vs `401/403` in spec prose.
  2. Confirm whether frontend failed-request errors should be plain objects or `Error` instances.
  3. Convert the cleanup findings above into `tasks.md` items.

---

## Next Step

Proceed to the **tasks** phase. The task artifact should keep implementation scope bounded to review/cleanup work and should treat the findings above as candidate tasks, not automatic code fixes.
