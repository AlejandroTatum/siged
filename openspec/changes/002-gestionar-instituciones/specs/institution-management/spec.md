# Institution Management Specification

## Purpose

Translate RF-002–RF-012 and the binding Feature 002 data/API decisions.

## Requirements

### Requirement: RF-002 and RF-006 — List and find institutions

An authenticated `ADMINISTRADOR` MUST receive a paginated institution list with basic data and only active academic-authority assignments. The list MUST support `nombre` partial case-insensitive search and ordering by `nombre`, `codigo`, or `ruc` in either direction.

#### Scenario: List institutions
- GIVEN an administrator requests `GET /instituciones/`
- WHEN optional `page`, `page_size`, `ordering`, or `nombre` parameters are supplied
- THEN the response follows the documented paginated payload and includes `autoridades_academicas`

### Requirement: RF-003–RF-005 — Manage institutions

An `ADMINISTRADOR` MUST create and partially update institutions with required unique `nombre`, `codigo`, and `ruc`; deletion MUST require frontend confirmation and MUST return 409 while active assignments exist.

#### Scenario: Validate institution data
- GIVEN creation or update data
- WHEN a required value is missing, duplicated against another record, or `nombre` is blank-only
- THEN field errors follow the contract; unchanged values on the edited record are accepted

#### Scenario: Delete institution
- GIVEN deletion is confirmed
- WHEN no active assignment exists
- THEN the institution is deleted with 204; otherwise deletion returns the documented 409 error

### Requirement: RF-007–RF-011 — Manage academic-authority assignments

An `ADMINISTRADOR` MUST list assignments, optionally by institution, and create, edit the user, delete, activate, or deactivate them. `usuario` and `rol` are required; `institucion` is required for `AUTORIDAD_ACADEMICA`; only one active identical `usuario`–`rol`–`institucion` assignment is allowed.

#### Scenario: Create or edit an assignment
- GIVEN valid assignment data
- WHEN it is saved
- THEN the response uses the documented nested `usuario`, `rol`, and `institucion` payload; creation defaults active and sets `fecha_desde`

#### Scenario: Change assignment state
- GIVEN an assignment
- WHEN `/usuarioroles/{id}/estado/` receives `es_activo`
- THEN activation sets today in `fecha_desde` and clears `fecha_hasta`, while deactivation sets today in `fecha_hasta`

### Requirement: RF-012 — Restrict institution access

An authenticated academic authority MUST see only distinct institutions connected to their active assignments through `GET /instituciones/usuario/`. Institution detail MUST allow an administrator or an academic authority with active access to that institution.

#### Scenario: Active scope only
- GIVEN active and inactive assignments
- WHEN the user requests their institutions or institution detail
- THEN only an actively assigned institution is listed and accessible

### Requirement: Supporting users and roles

`GET /usuarioroles/roles/` MUST return distinct roles from active assignments for any authenticated user. `GET /usuarios/?activo=` MUST be administrator-only; creation selectors use `activo=true`, while edit selectors omit the filter so the current inactive user remains visible.

#### Scenario: Assignment selectors
- GIVEN an administrator opens assignment creation or editing
- WHEN user options load
- THEN creation requests active users only and editing requests all users

### Requirement: Institution user experience

The frontend MUST follow both documented prototypes, centralize roles and endpoints, show backend field and `non_field_errors`, confirm institution/assignment deletion, and refresh the main institution table immediately after any assignment mutation.

#### Scenario: Assignment mutation refresh
- GIVEN an assignment is created, edited, activated, deactivated, or deleted
- WHEN the operation succeeds
- THEN the `AUTORIDADES ACADÉMICAS` column immediately reflects the backend result

## ADDED Requirements — approved role-catalog addendum

### Requirement: Administrator role catalog
The system MUST expose administrator-only `GET /api/roles/` and return role objects containing exactly `id` and `nombre`.

#### Scenario: Resolve the academic-authority role
- **WHEN** an active administrator opens the authority-assignment workflow
- **THEN** the frontend loads the role catalog
- **AND** selects the item whose `nombre` is `AUTORIDAD_ACADEMICA`
- **AND** submits that item's database `id` without hardcoding or inference

#### Scenario: Reject unauthorized catalog access
- **WHEN** an unauthenticated or non-administrator user requests the catalog
- **THEN** the API returns 401 or 403 respectively
