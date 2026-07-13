# Apply Progress: 002-gestionar-instituciones

## Current Slice

- Delivery strategy: `auto-chain`
- Chain strategy: `stacked-to-main`
- Work unit: institution screens (slice 5)
- Status: complete — approved role-catalog extension implemented

## Completed Tasks

- [x] 1.1 Replaced drift-based tests with teacher-contract model and lifecycle tests.
- [x] 1.2 Aligned the schema, admin registration, and migration with the exact models; removed bootstrap, split role fields, snapshots, conditional constraints, and `SET_NULL` history.
- [x] 1.3 Added exact institution response, nested authority, scoped detail, validation, and 409 response tests.
- [x] 1.4 Aligned institution serialization, permissions, service, DAO, view, and deletion boundary.
- [x] 2.1 Added contract-first tests for assignment validation, active uniqueness, listing, state transitions, deletion, role scope, institution scope, and user selectors.
- [x] 2.2 Implemented entity-specific UsuarioRol serializer, service, DAO, viewset, routes, and lifecycle actions.
- [x] 2.3 Implemented active roles, active user institutions, administrator-only user listing with `activo`, and retained scoped institution detail permission.
- [x] 3.1 Added RF-001 tests for administrator, academic authority, multiple active roles, successful login, and stored-session reload.
- [x] 3.2 Hydrated active roles through the existing token mechanism, centralized the endpoint and role constants, and rendered the documented role-aware navigation links.
- [x] 4.1 Added institution UI contract tests for paginated authority rows, assigned-institution cards, centralized API queries, selector filtering, and backend errors.
- [x] 4.2 Implemented institution administration routes, table/search/order/pagination, forms, delete confirmation, cards, and API service.
- [x] 4.3 Assignment modal workflows use the administrator role catalog and refresh immediately.
- [x] 4.4 Corrective verification completed.

## TDD Cycle Evidence

| Task | RED | GREEN | TRIANGULATE | REFACTOR | SAFETY NET |
|---|---|---|---|---|---|
| 1.1 | ✅ Written — exact field, choice, lifecycle, uniqueness, and PK-policy tests failed against drifted models | ✅ Passed — aligned models satisfy the teacher contract and project PK override | ✅ Passed — all three models, three institution unique fields, and both lifecycle transitions covered | ✅ Passed — removed snapshot and constraint behavior | ✅ Passed — model and API suites run together |
| 1.2 | ✅ Written — schema assertions exposed split roles, snapshots, constraints, `SET_NULL`, and bootstrap | ✅ Passed — exact uncommitted initial migration regenerated | ✅ Passed — `makemigrations --check --dry-run` reports no changes | ✅ Passed — removed bootstrap module/migration and delete override | ✅ Passed — `manage.py check` reports no issues |
| 1.3 | ✅ Written — contract suite initially failed on role schema, exact localized bodies, filtering, and missing cases | ✅ Passed — documented 401/403/404, required/duplicate errors, payloads, pagination, search, six ordering values, and authority filtering pass | ✅ Passed — ascending/descending cases parameterized for `nombre`, `codigo`, and `ruc`; active authority contrasted with inactive and non-authority assignments | ✅ Passed — nested serializers and exact permission/not-found responses centralized | ✅ Passed — 20 focused tests pass with 97% organization coverage |
| 1.4 | ✅ Written — non-academic active-role deletion test failed with 409; DAO deletion seam required missing methods | ✅ Passed — only active `AUTORIDAD_ACADEMICA` blocks deletion and service delegates check/delete to DAO | ✅ Passed — active authority blocks, inactive authority permits, and active non-authority permits deletion | ✅ Passed — list flow routes view → service → DAO | ✅ Passed — focused suite, Django check, and migration drift check pass |
| 2.1 | ✅ Written first — assignment/supporting routes failed with 404; corrective RED proved activation incorrectly allowed a second active identical combination | ✅ Passed — exact required-institution and RI-005 duplicate bodies now apply on create, update, and activation | ✅ Passed — create, list/filter, duplicate, deactivate, conflict activation, successful activation, delete, and missing-object paths covered | ✅ Passed — active-combination lookup centralized in the DAO and enforced by serializer/service at both persistence paths | ✅ Passed — cumulative organization suite passes |
| 2.2 | ✅ Contract RED established missing assignment boundary | ✅ Passed — create/update/state now flow serializer/permission → service → DAO | ✅ Passed — state transitions verify both date fields, active flag, and conflict immutability | ✅ Passed — no ModelSerializer direct assignment persistence remains | ✅ Passed — focused suite and coverage pass |
| 2.3 | ✅ Written first — role, institution-scope, and user selector routes returned 404 | ✅ Passed — authenticated roles/scope and administrator-only user selectors return documented shapes | ✅ Passed — active-only selector contrasted with unfiltered selector including inactive user | ✅ Passed — institution scope now flows view → service → DAO; user query remains split into core serializer/service/DAO | ✅ Passed — Django and migration checks pass |
| 3.1 | ✅ Written first — role API, context role state, reload hydration, and role menu assertions failed against the prior frontend | ✅ Passed — 16 focused auth/layout/routing tests pass | ✅ Passed — administrator-only, authority-only, and combined-role paths all assert distinct visible navigation | ✅ Passed — role payload uses one shared `ActiveRole` contract | ✅ Passed — 10 existing auth/layout/App tests passed before changes |
| 3.2 | ✅ RF-001 tests established missing production behavior | ✅ Passed — login and reload call `/api/usuarioroles/roles/` with `Authorization: Token <token>` and menu visibility follows returned role names | ✅ Passed — service success/error, empty/single/multiple roles, and logout clearing paths covered | ✅ Passed — role identifiers and endpoint are centralized; SPA navigation uses `NavLink` and Material Symbols | ✅ Passed — full frontend suite and production build pass |

| 4.1–4.4 | ✅ UI/API contract tests established | ✅ Five focused tests pass | ✅ List/card, selector, and error variants covered | ✅ Shared request and refresh seams | ✅ Full 41-test suite and build pass |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests -q --cov=apps.organizacion --cov-report=term-missing` → 20 passed in 4.36s; 97% organization coverage |
| Runtime harness | `.venv/bin/python manage.py check` → no issues; `.venv/bin/python manage.py makemigrations --check --dry-run` → no changes; prior `.venv/bin/python manage.py migrate --noinput` → no pending migrations |
| Rollback boundary | Revert `apps/organizacion/` remediation plus Phase 1 checkboxes/apply progress; no Phase 2–4 behavior was implemented |
| Slice 3 focused test | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests -q --cov=apps.organizacion --cov=apps.core --cov-report=term-missing` → 23 passed in 6.79s; 75% combined coverage, 92–100% across organization views/permissions/services except DAO branch coverage at 82% |
| Slice 3 runtime harness | APIClient contract flows exercised token-authenticated create/list/filter/deactivate/activate/conflicting activation/delete, role scope, institution scope, and user selectors. Forward migration `0003_align_teacher_schema` applied successfully to the existing legacy `db.sqlite3`; `Rol.objects.get_or_create(nombre=Rol.DOCENTE)` returned `DOCENTE / Docente`; `manage.py check` → no issues; `makemigrations --check --dry-run` → no changes; final `migrate --noinput` → no migrations pending |
| Slice 3 rollback boundary | Revert the UsuarioRol serializer/service/DAO/tests and organization route/view additions plus core user-list serializer/service/DAO/route additions; Phase 1 remediation remains intact |
| Slice 4 focused test | `cd siged/frontend && npm test -- --run src/features/auth/services/__tests__/rolesApi.test.ts src/features/auth/context/__tests__/AuthContext.test.tsx src/features/layout/components/__tests__/SideMenu.test.tsx src/App.test.tsx` → 4 files, 16 tests passed |
| Slice 4 coverage | `cd siged/frontend && npm test -- --coverage` → 9 files, 36 tests passed; 92.49% statements/lines, 75.28% branches, 87.09% functions |
| Slice 4 type/build | `cd siged/frontend && npm run build` → TypeScript and Vite production build passed; 56 modules transformed |
| Slice 4 runtime harness | `npm run dev -- --host 127.0.0.1`; `curl http://127.0.0.1:3000/` → HTTP 200 and root mount present |
| Slice 4 rollback boundary | Revert frontend auth active-role state/service/types, centralized role constants/endpoint, SideMenu role links, and their tests; backend slices 1–3 remain intact |

| Slice 5 focused test | `cd siged/frontend && npm test -- --run src/features/instituciones/services/__tests__/api.test.ts src/features/instituciones/pages/__tests__/institutionPages.test.tsx` → 2 files, 5 tests passed |
| Slice 5 coverage | `cd siged/frontend && npm test -- --coverage` → 11 files, 41 tests passed; 91.45% statements/lines, 75.42% branches, 56.25% functions |
| Slice 5 type/build | `cd siged/frontend && npm run build` → TypeScript and Vite build passed; 62 modules transformed |
| Slice 5 runtime harness | Vite plus `curl http://127.0.0.1:3000/instituciones` → HTTP 200 and SPA root mount present |
| Slice 5 rollback boundary | Revert `frontend/src/features/instituciones/`, institution endpoints, and institution routes; slices 1–4 remain intact |

## Deviations and Implementation-State Notes

- No product or architecture deviation from the teacher-provided Feature 002 documents.
- `Usuario` intentionally has no Django `username` field from Feature 001; the legacy nested `username` response key is populated from its authentication identifier, `numero_identificacion`, without changing Feature 001.
- Corrective gatekeeper audit supersedes the prior migration note: legacy `0001_initial` and the already-recorded `0002_seed_roles_and_admin` migration identity are retained, while `0003_align_teacher_schema` performs the forward data/schema transformation. It copies legacy `Rol.codigo` values into authoritative `Rol.nombre`, removes `codigo` and assignment snapshot fields, and changes institution deletion to `CASCADE`.
- The teacher data model describes implicit IDs as `AutoField`, while the authoritative project configuration at `siged/backend/config/settings.py:98` explicitly sets `DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"`; Django therefore applies the project-wide `BigAutoField` override consistently, and tests document that resolved schema.

## Remaining

All Phase 4 tasks are complete. The approved role-catalog addendum resolves the discovered gap. Ready for independent SDD verification; no review, commit, push, PR, or archive was started.

## Corrective slice-5 TDD evidence (2026-07-11)

| Stage | Evidence |
|---|---|
| RED | Behavior-oriented interaction tests initially failed on bidirectional ordering and modal focus. |
| GREEN | Search, six ordering values, envelope pagination, CRUD confirmation/errors, loading, role catalog, and Escape/focus behavior pass. |
| TRIANGULATE | Empty-assignment catalog discovery proves IDs are resolved independently by role name. |
| REFACTOR | Loading/error state and modal focus remain inside page/modal boundaries. |
| SAFETY NET | Focused 6/6; full 48/48; 93.09% statements/lines, 83.33% branches, 80% functions; build passed. Backend 24/24; Django and migration checks passed. |

## Final slice-5 behavior proof (2026-07-11)

| Stage | Evidence |
|---|---|
| RED | New accessible interaction tests failed before the production fix: assignment mutation rejection produced an unhandled promise rejection and no visible `role="alert"`. |
| GREEN | `AuthorityModal` now catches state/delete mutation failures, presents the exact backend `non_field_errors` text, and keeps the dialog usable. |
| TRIANGULATE | One stateful workflow proves create/edit/deactivate/activate/delete, resolves role id `77` from the real catalog entry named `AUTORIDAD_ACADEMICA`, uses `/usuarios/?activo=true` only for creation and `/usuarios/` for editing, and observes one immediate institution-list reload after each of five successful mutations. |
| REFACTOR | Assignment error rendering is shared between form submissions and row mutations; no API IDs are inferred or hardcoded in production. |
| SAFETY NET | Focused institution suite: 14/14 passed. Full frontend: 50/50 passed; 93.09% statements/lines, 85.32% branches, 93.58% functions. Production build passed (62 modules). Backend organization suite: 24/24 passed; Django check clean; no migration drift. |

### Final slice-5 work-unit evidence

| Evidence | Result |
|---|---|
| Focused test | `cd siged/frontend && npm test -- --run src/features/instituciones/pages/__tests__/authorityWorkflows.test.tsx src/features/instituciones/pages/__tests__/institutionInteractions.test.tsx src/features/instituciones/pages/__tests__/institutionPages.test.tsx src/features/instituciones/services/__tests__/api.test.ts` → 4 files, 14 tests passed |
| Runtime/build | `npm test -- --coverage` → 13 files, 50 tests passed, no unhandled errors; `npm run build` → passed; backend `pytest apps/organizacion/tests -q`, `manage.py check`, and migration drift check all passed |
| Rollback boundary | Revert `AuthorityModal.tsx`, `authorityWorkflows.test.tsx`, and this evidence section; all earlier Feature 002 slices remain intact |
