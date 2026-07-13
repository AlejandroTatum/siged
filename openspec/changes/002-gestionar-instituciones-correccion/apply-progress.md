# Apply Progress: Correction Slices 1–3 — Complete

## Completion Summary

- All 11 tasks are complete.
- Final evidence: backend configured coverage passed (`37 passed`, `64%` total coverage); frontend coverage passed (`52 passed`, `93.09%` statements); and the frontend build passed.
- `seed_demo` is compatible with required manual institution codes.
- Django and migration checks passed; `organizacion` has only migrations `0001`–`0003`.

## Completed Tasks

- [x] 1.1 RED: add backend tests proving `Institucion.codigo` stays preserved, `0004` is gone, and no auto-sequence reservation remains.
- [x] 1.2 GREEN: remove the sequence model and uncommitted terminal migration without rewriting codes.
- [x] 1.3 RED: add manual-code create, update, duplicate, and same-record reuse coverage.
- [x] 2.1 RED: add active-authority, inactive-authority, and active-non-authority RF012 coverage.
- [x] 2.2 GREEN: wire writable, unique `codigo` through serializer, service, and DAO; filter RF012 at the DAO boundary.
- [x] 2.3 GREEN: retain the existing authenticated `/usuario/` action and prove its query boundary is authority-only.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | `apps/organizacion/tests/test_models.py` | Integration | 23 focused tests passed | `test_institution_code_remains_unique_without_sequence_model` failed: sequence model still existed | Passed after model/migration removal | Stored `INST042` and model-absence assertions | Removed only obsolete model |
| 1.2 | `apps/organizacion/tests/test_models.py` | Integration | 23 focused tests passed | Same 1.1 contract test | 1 passed; `makemigrations --check` passed | Database code preservation confirmed before and after rollback | None needed |
| 1.3 | `apps/organizacion/tests/test_institucion_api.py` | API integration | 23 focused tests passed | Manual-code tests were written before serializer/service/DAO changes; run failed while the removed model was still imported by DAO | 23 focused tests passed after wiring | Create, edit, same-record reuse, required field, and duplicate scenarios | Removed obsolete sequence retry tests/imports |
| 2.1 | `apps/organizacion/tests/test_institucion_api.py` | API integration | 23 focused tests passed | RF012 authority-state test written before DAO filter | 23 focused tests passed | Active authority returns one; inactive authority and active non-authority return none | None needed |
| 2.2 | `apps/organizacion/tests/test_institucion_api.py` | API integration | 23 focused tests passed | Manual-code and RF012 tests | 23 focused tests passed | Multiple code and assignment states exercised | Removed retry-only service complexity |
| 2.3 | `apps/organizacion/tests/test_institucion_api.py` | API integration | 23 focused tests passed | RF012 authority-state test | 23 focused tests passed without a view/permission edit; existing `IsAuthenticated` action delegates scope to DAO | Three caller role states | No view change needed; design requires query-boundary enforcement |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests/test_models.py apps/organizacion/tests/test_institucion_api.py -q` → `23 passed` |
| Coverage command | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests/test_models.py apps/organizacion/tests/test_institucion_api.py --cov=apps.organizacion --cov-report=term-missing -q` → `23 passed`, `81%` total organization coverage |
| Runtime harness | `cd siged/backend && .venv/bin/python manage.py migrate organizacion 0003` reversed `0004` successfully; `makemigrations --check` → `No changes detected`; `showmigrations` shows only `0001`–`0003` applied. APIClient RF012 test exercised `/api/instituciones/usuario/` with three role states. |
| Django test runner | `python manage.py test` is unavailable because `python` is not on PATH. Equivalent `.venv/bin/python manage.py test apps.organizacion` completed with `0 tests` because this app uses pytest-style tests. |
| Rollback boundary | Revert `models.py`, `institucion_dao.py`, `institucion_servicio.py`, `institucion_serializer.py`, deleted `0004`, and the two organization test files; restore `0004` only before it is shared, then migrate forward. No institution rows/codes were rewritten. |

## Migration Evidence

- Pre-rollback local migration state: `0004_institucion_codigo_secuencia` applied.
- Pre-rollback stored codes: `INST002`, `INST003`, `IST001`, `INST001`.
- `migrate organizacion 0003` un-applied only `0004_institucion_codigo_secuencia` successfully.
- Post-rollback and post-change stored codes: `INST001`, `INST002`, `INST003`, `IST001` (same values, sorted for display).
- Final migration state: `0001`, `0002`, and `0003` applied; no `0004` discovered.

## Backend Slice Handoff

- At the end of slice 1, tasks 4.1–4.2 were pending for the cleanup/evidence slice. Their current status is recorded in the Cleanup Slice 3 section below.

## Delivery Boundary

- Strategy: chained PR, stacked-to-main.
- Slice: backend work-unit 1 only; no commit or PR created.
- Frontend code and task checkboxes were not changed.

## Frontend Slice 2

### Completed Tasks

- [x] 3.1 RED: added Vitest coverage for the required editable `Código de institución`, exact create/update payloads, duplicate/required backend field errors, canonical display wording, and active-authority menu visibility.
- [x] 3.2 GREEN: made `codigo` part of `InstitutionInput`, initialized and rendered it as a required editable field on create/edit, and replaced the `Código AMIE` display label.
- [x] 3.3 APPROVED CHARACTERIZATION EXCEPTION: added regression coverage for separately named Edit/Delete controls, keyboard focus, and callbacks. It characterizes pre-existing-green behavior; maintainer approved RED=N/A because no genuine RED preceded the production behavior. This exception applies only to task 3.3.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 3.1 | `pages/__tests__/institutionInteractions.test.tsx`, `services/__tests__/api.test.ts`, `pages/__tests__/institutionPages.test.tsx`, `layout/components/__tests__/SideMenu.test.tsx` | Integration | 19 focused tests passed | New expected form field and canonical-label tests failed: 3 failures (missing input/label) | 20 focused tests passed after the input/type/display changes | Create + edit payloads; duplicate + required backend errors; authority + non-authority menu states | Kept the existing API error handoff and authority-derived menu contract; no auth redesign |
| 3.2 | Same as 3.1 | Integration | 19 focused tests passed | 3.1 RED covered the absent writable `codigo` contract | 20 focused tests passed | New and existing records use different initial code values and POST/PATCH paths | Restored existing `nombre`/`ruc` labels while adding only the canonical code label |
| 3.3 | `components/__tests__/InstitutionTable.test.tsx` | Component | N/A (new test) | **N/A — explicit maintainer-approved characterization exception**: the test was added after the preserved controls already existed and passed, so no genuine RED preceded production behavior. Approval is limited to task 3.3 and does not represent a RED/GREEN cycle. | `21 focused tests passed`; full frontend coverage later passed `52/52` tests | Edit and Delete each receive keyboard focus and invoke their distinct callbacks | None needed; no `InstitutionTable` class or behavior changed |

### Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command | `cd siged/frontend && npm test -- src/features/instituciones/components/__tests__/InstitutionTable.test.tsx src/features/instituciones/pages/__tests__/institutionPages.test.tsx src/features/instituciones/pages/__tests__/institutionInteractions.test.tsx src/features/instituciones/services/__tests__/api.test.ts src/features/layout/components/__tests__/SideMenu.test.tsx` → `5 passed`, `21 passed` |
| Required frontend coverage command | `cd siged/frontend && npm test -- --coverage` → exit `0`; `14 passed` test files; `52 passed` tests; duration `3.79s`; total coverage: statements `93.09%`, branches `84.72%`, functions `93.58%`, lines `93.09%`. |
| Runtime harness | `cd siged/frontend && npm run build` → `tsc -b && vite build` completed successfully; 62 modules transformed. |
| Rollback boundary | Revert only the institution type/form/page files and the four scoped regression tests; `InstitutionTable` production layout and auth architecture remain untouched. |

### Maintainer Approval — 2026-07-12

- The maintainer explicitly approved task 3.3 as pre-existing-behavior characterization with `RED=N/A`.
- Rationale: the Edit/Delete spacing and accessibility behavior existed before this corrective change, so manufacturing a RED would falsify TDD provenance.
- Scope: this exception applies only to task 3.3; strict TDD remains required for every new behavior.

### Remaining Tasks

- [x] 4.1 Remove obsolete tests/assertions for auto-generated codes and misleading `Código AMIE` wording.
- [x] 4.2 Run backend coverage, frontend coverage, and `npm run build`; record exact outputs for apply/verify evidence.

## Cleanup Slice 3

### Completed Tasks

- [x] 4.1 Removed the obsolete sequence-model assertion/import from the model test while retaining positive unique-code coverage; source and migration scans confirm no sequence implementation or `Código AMIE` UI wording remains.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 4.1 | `apps/organizacion/tests/test_models.py` | Model integration | `6 passed` before cleanup | N/A — cleanup removes obsolete assertions and adds no behavior | `6 passed` after cleanup | N/A — no new behavior | Removed stale sequence-model import/assertion; retained positive code-uniqueness check |

### Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests/test_models.py -q` → `6 passed` before and after cleanup. |
| Runtime harness | N/A — this task only removes a test assertion/import and has no runtime boundary; final Django checks are recorded with task 4.2. |
| Static cleanup scan | Searches across `siged/**/*.py`, `siged/**/*.ts`, and `siged/**/*.tsx` found no `Código AMIE`, sequence, auto-code, reservation, or sequence-model implementation references; migration scan found no sequence artifacts. |
| Rollback boundary | Revert only `siged/backend/apps/organizacion/tests/test_models.py` and this cleanup-slice evidence; no production behavior changes. |

### Final Evidence — Task 4.2 Complete

| Check | Exact result |
|---|---|
| Full configured backend coverage | `cd siged/backend && .venv/bin/pytest --cov=apps` → `37 passed`; configured total coverage `64%`. |
| Frontend coverage | `cd siged/frontend && npm test -- --coverage` → `14 passed` test files, `52 passed` tests; statements `93.09%`, branches `84.72%`, functions `93.58%`, lines `93.09%`. |
| Frontend build | `cd siged/frontend && npm run build` → `tsc -b && vite build` passed; `62 modules transformed`. |
| Demo seed compatibility | `cd siged/backend && .venv/bin/python manage.py seed_demo` → completed successfully with explicit manual institution codes. |
| Django checks | `cd siged/backend && .venv/bin/python manage.py check` → `System check identified no issues (0 silenced).`; `makemigrations --check` → `No changes detected`. |
| Migration state | `showmigrations organizacion` → only `0001_initial`, `0002_seed_roles_and_admin`, and `0003_align_teacher_schema` applied. |
| Diff check | `git diff --check` → passed with no whitespace errors. Unrelated dirty worktree files remain preserved. |

Task 4.2 is complete: all configured backend/frontend coverage and frontend build evidence passed. The final backend run includes `seed_demo` compatibility with required manual institution codes.

### Delivery Boundary

- Strategy: chained PR, stacked-to-main.
- Slice: frontend work-unit 2 only; no commit or PR created.
- Estimated authored change: approximately 75 lines, under the 400-line review budget.

### Apply Gate Correction — 2026-07-12

- The required frontend work-unit coverage evidence is present with its exact result above.
- Task 3.3 is truthfully recorded as pre-existing-green regression characterization. Its added test proves the preserved controls' current behavior, but it is not a genuine strict-TDD RED → GREEN cycle.
- The maintainer approved `RED=N/A` for task 3.3 only. No production code or test behavior was changed to manufacture a RED result.
- Final cumulative evidence is green: all 11 tasks are complete, backend configured coverage passed (`37 passed`, `64%` total), frontend coverage passed (`52 passed`, `93.09%` statements), and the frontend build passed.

## Focused RF-005 Verification Remediation — 2026-07-12

### Completed Remediation Tasks

- [x] R1 Replaced the remaining institution-table header `Código` with the exact canonical `Código de institución`.
- [x] R2 Added deterministic rendered-component coverage for the canonical header, distinct institution-specific Edit/Delete names, both controls in the existing action group, and its `flex min-w-48 flex-wrap gap-2` spacing/container contract.

### TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| R1 | `siged/frontend/src/features/instituciones/components/__tests__/InstitutionTable.test.tsx` | Component integration | Existing focused file: `1 passed` | New canonical `columnheader` assertion failed because the rendered name was `Código unfold_more` | `2 passed` after changing only the table header to `Código de institución` | The same rendered row proves the exact visible label and header accessibility name | Test assertion was adjusted to account for the existing sort-icon text in the accessible name; focused suite remained green |
| R2 | Same | Component integration | Existing focused file: `1 passed` | **N/A — characterization evidence**: the action group and controls already rendered green before this remediation | `2 passed` with the new rendered-contract assertions | Verifies separate controls, two institution-specific accessible names, containment in one action group, and `flex min-w-48 flex-wrap gap-2` | None needed; no action behavior or layout classes changed |

### Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command | `cd siged/frontend && npm test -- src/features/instituciones/components/__tests__/InstitutionTable.test.tsx` → `1 passed` safety net; RED → `1 failed, 1 passed`; GREEN/refactor → `1 file, 2 passed`. |
| Runtime/component harness | Rendered `InstitutionTable` with `Escuela Uno`: canonical header is present, Edit and Delete resolve as separate named buttons (`Editar Escuela Uno`, `Eliminar Escuela Uno`), both belong to the action group, and that group retains `flex min-w-48 flex-wrap gap-2`. |
| Full frontend coverage | `cd siged/frontend && npm test -- --coverage` → `14 passed` files, `53 passed` tests; statements `93.09%`, branches `84.72%`, functions `93.58%`, lines `93.09%`. |
| Frontend build | `cd siged/frontend && npm run build` → `tsc -b && vite build` passed; `62 modules transformed`. |
| Rollback boundary | Revert only `siged/frontend/src/features/instituciones/components/InstitutionTable.tsx` and `siged/frontend/src/features/instituciones/components/__tests__/InstitutionTable.test.tsx`; no other behavior is involved. |

### Provenance and Verify Readiness

- R1 has a genuine remediation RED → GREEN cycle. The production header did not meet the canonical-label requirement until this change.
- R2 is deliberately **not** represented as an original RED → GREEN cycle. The spacing/action controls existed before the remediation; its new assertions are truthful characterization/runtime coverage of preserved behavior.
- `verify-report.md` remains a historical FAIL until `sdd-verify` issues a new report. This apply slice is ready for that focused re-verification only; it does not self-certify a PASS verdict.

## Frozen Review Correction Transaction — 2026-07-12

### Scoped Remediation Map

| Frozen ID | Correction | Files | Result |
|---|---|---|---|
| RISK-002 | Demo RUC reuse now requires the documented code and name, and the atomic command fails before assignments for either identity mismatch. | `apps/core/management/commands/seed_demo.py`, `apps/core/tests.py` | ✅ |
| RESILIENCE-003 | Known institution unique-index races for `codigo`, `nombre`, or `ruc` become their existing deterministic field-level validation errors; unrelated `IntegrityError` values are re-raised. | `apps/organizacion/apis/serializers/institucion_serializer.py`, `apps/organizacion/tests/test_institucion_api.py` | ✅ |
| REL-001 | The configured pytest discovery gate now includes both `apps/core` and `apps/organizacion/tests`. | `pytest.ini`, `openspec/config.yaml` evidence | ✅ |
| REL-003 | Partial institution updates without `codigo` now return `400 {"codigo": ["Este campo es obligatorio."]}`; explicit-code PATCH remains valid. | `apps/organizacion/apis/serializers/institucion_serializer.py`, `apps/organizacion/tests/test_institucion_api.py` | ✅ |

### Strict TDD Evidence

| Frozen IDs | Safety net | RED | GREEN | Triangulation / refactor |
|---|---|---|---|---|
| RISK-002, RESILIENCE-003, REL-003 | Organization suite → `27 passed` before edits. A pre-edit core-suite baseline was not captured, so RISK-002 safety-net provenance is incomplete. | New tests → `5 failed, 1 passed`: two RUC-identity conflicts, omitted-code PATCH, and two simulated unique races failed; unrelated-error test already passed as the preserved boundary. | Same targeted command → `6 passed` after the minimal command/serializer changes. | RUC mismatch varies code/name; race handling varies create/code and update/RUC; the unrelated foreign-key error is re-raised. |
| REL-001 | Existing configured command previously collected only core. | The current `pytest.ini` excluded the organization suite. | `pytest --collect-only -q` → `69 tests collected`, enumerating `apps/core/tests.py` and all three `apps/organizacion/tests` modules. | Config-only correction; full configured coverage confirms both suites run. |

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Configured backend coverage | `cd siged/backend && .venv/bin/pytest --cov=apps` → `69 passed`, `97%` total; output declares `testpaths: apps/core, apps/organizacion/tests`. |
| Focused organization suite | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests -q` → `31 passed`. |
| Runtime harness | `.venv/bin/python manage.py check` → no issues; `makemigrations --check` → no changes; `showmigrations organizacion` → only `0001`–`0003` applied. Local `seed_demo` returned its new `CommandError` for a pre-existing RUC collision, proving the safe fail-closed path; isolated command behavior is covered by the two transactional command tests. |
| Frontend | N/A — no frontend file or frontend runtime contract changed. |
| Diff check | `git diff --check` → exit `0`, no whitespace errors. |
| Rollback boundary | Revert `apps/core/management/commands/seed_demo.py`, `apps/core/tests.py`, `apps/organizacion/apis/serializers/institucion_serializer.py`, `apps/organizacion/tests/test_institucion_api.py`, `pytest.ini`, and the matching OpenSpec config/evidence files. This restores prior RUC reuse, serializer PATCH/race behavior, and discovery without touching unrelated dirty work. |

### Remediation Receipt Limitation

No persisted review transaction metadata (`lineage_id`, `generation`, `fix_batch`, or receipt) was available in the permitted OpenSpec artifacts. Therefore this record intentionally does **not** emit a `gentle-ai.remediation-result/v1` success envelope or claim a new verification revision. The applied code and execution evidence above are complete, but RISK-002 lacks the required pre-edit core safety-net provenance; a receipt-bearing verification transaction must supply the identifiers and decide whether that evidence limitation is acceptable before formal closure.
