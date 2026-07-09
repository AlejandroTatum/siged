# Specification: 001-user-auth — User Authentication

**Change**: `001-user-auth`  
**Project**: SIGED  
**Type**: Feature Specification (Canonical)  
**Date**: 2026-07-09  
**Artifact Store**: OpenSpec  
**Supersedes**: `specs/001-user-auth/spec.md` (legacy, informational only)

---

## Purpose

Define the canonical behavior for Feature 001-user-auth: login, logout, active-user enforcement, and protected navigation. This spec is the single source of truth for requirements, traceability, and acceptance criteria.

---

## Requirements

### Requirement: RF-001 — Mandatory Field Validation

The system MUST validate `numero_identificacion` and `password` as non-empty, non-blank fields before processing any login request.

#### Scenario: Both fields present

- GIVEN the user is on the login page
- WHEN the user submits the form with both `numero_identificacion` and `password` filled
- THEN the serializer passes validation and the request proceeds to the service layer

#### Scenario: numero_identificacion empty

- GIVEN the user is on the login page
- WHEN the user submits the form with an empty `numero_identificacion`
- THEN the API returns HTTP 400 with `numero_identificacion` in `serializer.errors`

#### Scenario: password empty

- GIVEN the user is on the login page
- WHEN the user submits the form with an empty `password`
- THEN the API returns HTTP 400 with `password` in `serializer.errors`

---

### Requirement: RF-002 — Valid Credentials + Active Account → Authenticated Session

The system MUST verify that submitted credentials correspond to a registered user with an active account (`is_active=True`), create a DRF auth token, and return user metadata on success.

#### Scenario: Valid credentials, active user

- GIVEN a registered user with `numero_identificacion="12345678"`, correct password, and `is_active=True`
- WHEN the user submits `POST /api/login/` with those credentials
- THEN the response is HTTP 200 with `{"token": "<token>", "usuario": {"numero_identificacion": "12345678", "is_active": True}}`
- AND the DRF token record is created in the database

---

### Requirement: RF-003 — Invalid Credentials → Error Message

The system MUST return a descriptive error when credentials do not match any registered user.

#### Scenario: Wrong numero_identificacion

- GIVEN no user exists with `numero_identificacion="00000000"`
- WHEN the user submits `POST /api/login/` with `numero_identificacion="00000000"` and a password
- THEN the response is HTTP 401 with body `{ "error": "Credenciales inválidas" }`

#### Scenario: Wrong password

- GIVEN a registered user with `numero_identificacion="12345678"` and password `"secret"`
- WHEN the user submits `POST /api/login/` with `numero_identificacion="12345678"` and password `"wrong"`
- THEN the response is HTTP 401 with body `{ "error": "Credenciales inválidas" }`

---

### Requirement: RF-004 — Inactive Account → Specific Error

The system MUST reject login attempts for users where `is_active=False` with a message distinct from invalid-credential errors.

#### Scenario: Inactive user attempts login

- GIVEN a registered user with `numero_identificacion="12345678"` and correct password, but `is_active=False`
- WHEN the user submits `POST /api/login/` with those credentials
- THEN the response is HTTP 403 with body `{ "error": "Cuenta inactiva" }`
- AND no token is created

---

### Requirement: RF-005 — Logout Destroys Token

The system MUST allow an authenticated user to end their session by destroying the DRF token, then redirecting to the login page on the frontend.

#### Scenario: Authenticated user logs out

- GIVEN an authenticated user with a valid DRF token
- WHEN the user submits `POST /api/logout/` with the `Authorization: Token <token>` header
- THEN the response is HTTP 200
- AND the token record is deleted from the database

#### Scenario: Unauthenticated logout attempt

- GIVEN no authentication token
- WHEN the user submits `POST /api/logout/` without a token
- THEN the response is HTTP 401 Unauthorized

---

### Requirement: RF-006 — Protected Routes Redirect Unauthenticated Users

The system MUST redirect unauthenticated users to `/login` when they attempt to access protected routes. Authenticated users who visit `/login` MUST be redirected to `/`.

#### Scenario: Unauthenticated user hits protected route

- GIVEN no authentication token in localStorage
- WHEN the user navigates directly to a protected route (e.g., `/`)
- THEN the frontend router redirects to `/login`

#### Scenario: Authenticated user hits `/login`

- GIVEN an authentication token in localStorage
- WHEN the user navigates to `/login`
- THEN the frontend router redirects to `/`

---

### Requirement: TR-001 — Spanish UI Messages

All user-facing error messages and labels MUST be in Spanish.

#### Scenario: Error message language

- GIVEN the user submits invalid credentials
- THEN the error message is displayed in Spanish (e.g., "Credenciales inválidas" or "Número de identificación o contraseña incorrectos")

---

## Traceability Matrix

| Requirement | Backend Implementation | Frontend Implementation | Tests |
|-------------|------------------------|-------------------------|-------|
| RF-001 | `core/apis/serializers/autenticacion_serializer.py` | `features/auth/components/LoginForm.tsx` | `core/tests.py::LoginSerializerRequiredFieldsTest` |
| RF-002 | `core/servicios/autenticacion_servicio.py`, `core/daos/usuario_dao.py`, `core/apis/views.py` | `features/auth/services/authApi.ts`, `features/auth/context/AuthContext.tsx` | `core/tests.py::LoginViewIntegrationTestCase::test_login_exitoso_retorna_token`, `features/auth/context/__tests__/AuthContext.test.tsx` |
| RF-003 | `core/servicios/autenticacion_servicio.py` | `features/auth/components/LoginForm.tsx` | `core/tests.py::LoginCredencialesInvalidasTest` |
| RF-004 | `core/servicios/autenticacion_servicio.py` | `features/auth/components/LoginForm.tsx` | `core/tests.py::LoginUsuarioInactivoTest` |
| RF-005 | `core/apis/views.py::logout_view`, `core/servicios/autenticacion_servicio.py` | `features/auth/services/authApi.ts`, `features/auth/context/AuthContext.tsx`, `features/layout/components/TopBar.tsx` | `core/tests.py::LogoutViewIntegrationTestCase::test_logout_con_autenticacion_retorna_200`, `features/auth/services/__tests__/authApi.test.ts` |
| RF-006 | N/A (frontend-only routing) | `features/auth/hooks/useAuth.ts`, `App.tsx` (ProtectedRoute) | `features/layout/pages/__tests__/AuthenticatedLayout.test.tsx` |
| TR-001 | `core/excepciones.py` | All component strings | Manual verification |

---

## Gap Policy

### Identified Gaps

| Gap ID | Description | Risk | Status |
|--------|-------------|------|--------|
| GAP-01 | Frontend end-to-end tests for logout redirect behavior are not confirmed present | MEDIUM | Requires verification |
| GAP-02 | Backend integration test for `view → service → DAO` full chain not confirmed | MEDIUM | Requires verification |
| GAP-03 | Legacy `specs/001-user-auth/` artifacts not archived/disconnected from current spec | LOW | Informational only; canonical is `openspec/` |

### Gap Resolution Rules

- **CRITICAL gaps** block `apply` phase. A CRITICAL gap means a requirement has zero test coverage.
- **MEDIUM gaps** are documented and addressed in the `tasks.md` phase.
- **LOW gaps** are informational; no blocking action required.
- Gaps are closed when: (a) test evidence confirms coverage, or (b) a task is created to add missing coverage.

---

## Verification Commands

### Backend Tests

```bash
cd siged/backend && pytest --cov=core --cov-report=term-missing
```

Expected: All tests pass. Coverage report shows `core/apis/`, `core/servicios/`, `core/daos/`, `core/excepciones.py`.

### Frontend Tests

```bash
cd siged/frontend && npm test -- --coverage
```

Expected: All tests pass. Coverage report shows `features/auth/`, `features/layout/`, `features/home/`.

### Smoke Test (Manual)

```bash
# 1. Start backend
cd siged/backend && python manage.py runserver 8000

# 2. Start frontend
cd siged/frontend && npm run dev

# 3. Login flow
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"numero_identificacion":"000000001","password":"admin"}'
# Expected: HTTP 200, {"token":"...","usuario":{...}}

# 4. Logout with token
TOKEN="<token_from_login>"
curl -X POST http://localhost:8000/api/logout/ \
  -H "Authorization: Token $TOKEN"
# Expected: HTTP 200

# 5. Logout without token
curl -X POST http://localhost:8000/api/logout/
# Expected: HTTP 401
```

---

## Quick Path

1. Read this `spec.md` for requirements and traceability.
2. Read `proposal.md` for scope and non-goals.
3. Run backend tests: `cd siged/backend && pytest --cov`
4. Run frontend tests: `cd siged/frontend && npm test`
5. Review coverage reports against the Traceability Matrix.
6. Proceed to `design.md` for as-implemented architecture, then `tasks.md` for action items.

---

## Next Step

Proceed to **`design`** phase: document the as-implemented architecture (models, serializers, services, DAOs, views, frontend context/hook/API).
