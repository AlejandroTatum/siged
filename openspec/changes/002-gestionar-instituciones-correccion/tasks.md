# Tasks: Correct Institution Code Ownership and Authority Scope

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 320-520 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 backend contract/migration + tests → PR 2 frontend label/input/menu + tests → PR 3 cleanup/evidence |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Remove sequence path safely and keep stored codes | PR 1 | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests/test_models.py apps/organizacion/tests/test_institucion_api.py -q` | `python manage.py migrate organizacion 0003` then `python manage.py makemigrations --check` | `models.py`, delete `0004_institucion_codigo_secuencia.py`, related backend tests |
| 2 | Restore manual unique code + RF012 authority scope | PR 1 | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests/test_institucion_api.py apps/core/tests -q` | `python manage.py test apps.organizacion` with authority/inactive/non-authority fixtures | serializer/service/DAO/permisos and institution API tests |
| 3 | Wire frontend editable code, canonical label, menu scope, spacing regressions | PR 2 | `cd siged/frontend && npm test -- --coverage` | `npm run build` and manual render of institution forms/list + side menu | institution feature components/pages/types/tests only |
| 4 | Remove obsolete assertions, add focused regressions, finalize evidence | PR 3 | full backend + frontend coverage commands from config | `cd siged/backend && .venv/bin/pytest --cov=apps && cd ../frontend && npm test -- --coverage && npm run build` | test files and docs only |

## Phase 1: Backend reversal and contract first

- [x] 1.1 RED: add backend tests proving `Institucion.codigo` stays preserved, `0004` is gone, and no auto-sequence reservation remains.
- [x] 1.2 GREEN: update `siged/backend/apps/organizacion/models.py` and remove `siged/backend/apps/organizacion/migrations/0004_institucion_codigo_secuencia.py` without rewriting stored codes.
- [x] 1.3 RED: add backend tests for required manual code create/update, duplicate rejection, and same-record code reuse.

## Phase 2: Backend authority scope and API wiring

- [x] 2.1 RED: add RF012 tests for active `AUTORIDAD_ACADEMICA`, inactive authority, and active non-authority exclusion on `GET /api/instituciones/usuario/`.
- [x] 2.2 GREEN: update `siged/backend/apps/organizacion/apis/serializers/institucion_serializer.py`, `servicios/institucion_servicio.py`, and `daos/institucion_dao.py` for writable unique `codigo` and authority-only filtering.
- [x] 2.3 GREEN: align any permission/view wiring in `siged/backend/apps/organizacion/permisos.py` or `apis/views.py` so RF012 remains strict.

## Phase 3: Frontend correction and UX stability

- [x] 3.1 RED: add Vitest coverage for editable `Código de institución`, exact payload shape, duplicate/server field errors, and `Mis instituciones` visibility tied to active authority.
- [x] 3.2 GREEN: update `siged/frontend/src/features/instituciones/types/institucionTypes.ts`, `components/InstitutionForm.tsx`, and affected pages/menu wiring to use the canonical label and editable code.
- [x] 3.3 APPROVED CHARACTERIZATION EXCEPTION: regression coverage characterizes pre-existing-green edit/delete controls. Maintainer approved RED=N/A because no genuine RED preceded the already-implemented production behavior; this exception applies only to task 3.3 and must not be represented as a RED/GREEN cycle.

## Phase 4: Cleanup, obsolete tests, and evidence

- [x] 4.1 Remove obsolete tests/assertions for auto-generated codes and misleading `Código AMIE` wording.
- [x] 4.2 Run backend coverage, frontend coverage, and `npm run build`; record exact outputs for apply/verify evidence.

## Focused RF-005 Verification Remediation

- [x] R1 Add a failing canonical table-header assertion, change only the `InstitutionTable` code header to `Código de institución`, and confirm the focused component test passes.
- [x] R2 Extend rendered-component coverage for separate Edit/Delete controls, institution-specific accessible names, and the existing `flex min-w-48 flex-wrap gap-2` action-group contract; record it as characterization evidence because the spacing behavior was already green.
