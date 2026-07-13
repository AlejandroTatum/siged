# Proposal: Manage Educational Institutions and Academic Authorities

## Intent

Translate and implement the teacher-defined Feature 002 without adding product or architecture decisions. Administrators manage institutions and academic-authority assignments; active roles control menu visibility and institution access.

## Scope

### In Scope
- Role-aware side-menu options from active assignments.
- Institution list/create/edit/delete, `nombre` search, pagination, and allowed ordering.
- Academic-authority list/create/edit/delete/activate/deactivate workflows.
- Active-assignment institution visibility for academic authorities.
- Exact legacy models, API contracts, layered backend, React modules, prototypes, and tests.

### Out of Scope
- Academic planning behavior.
- Role-definition management screens.
- Authentication replacement.
- Any migration, concurrency, history-snapshot, route-guard, or failure-state policy not stated in the legacy documents.

## Capabilities

### New Capabilities
- `institution-management`: RF-002–RF-012 and their exact data/API/UI contracts.

### Modified Capabilities
- `auth`: RF-001 only—after login or reload, obtain distinct active roles for side-menu visibility using the existing token mechanism.

## Approach

Follow `specs/002-gestionar-instituciones/plan.md`: add the `organizacion` Django app with views → serializers/permissions → services → DAOs, extend `core` with the user-list endpoint, and add the specified React institution feature. Apply decisions D1–D14 exactly.

## Affected Areas

| Area | Impact |
|---|---|
| `siged/backend/apps/organizacion/` | New domain and layered APIs |
| `siged/backend/apps/core/` | User-list endpoint |
| `siged/backend/config/` | App and route registration |
| `siged/frontend/src/features/instituciones/` | Two screens and workflows |
| `siged/frontend/src/features/auth/`, `layout/`, `config/` | Active roles, menu, endpoints/constants |

## Risks

| Risk | Mitigation |
|---|---|
| Existing slices encode unsupported decisions | Remediate schema/API/tests before continuing |
| Contract drift | Trace every requirement and task to a legacy section |

## Rollback Plan

Revert Feature 002 code and migrations as one feature boundary; preserve Feature 001 authentication.

## Dependencies

- Feature `001-user-auth`.
- Authoritative package `specs/002-gestionar-instituciones/`.

## Success Criteria

- [ ] RF-001–RF-012 pass against the exact documented contracts.
- [ ] RV-001–RV-006 and RI-001–RI-005 are enforced at their documented layers.
- [ ] Both prototype-backed screens and required refresh/error behaviors are implemented.

## Approved contract extension — role catalog

The user approved a minimal resolution to the discovered teacher-contract gap: administrators can query `GET /api/roles/`, which returns only `{id, nombre}` role objects. Assignment UI resolves `AUTORIDAD_ACADEMICA` by `nombre` and submits its real database `id`; IDs are never hardcoded or inferred. This is a new addendum, not behavior claimed by the original teacher source.
