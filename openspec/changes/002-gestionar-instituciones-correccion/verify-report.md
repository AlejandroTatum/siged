schema: gentle-ai.verify-result/v1
evidence_revision: sha256:fc106a2f2cb98aa7dd6e72872ee110179539fd630ca55ed8aa50d55428e91e1a
verdict: pass-with-warnings
blockers: 0
critical_findings: 0
requirements: 5/5
scenarios: 13/13
test_command: cd siged/backend && .venv/bin/pytest --cov=apps --cov-report=term-missing
test_exit_code: 0
test_output_hash: sha256:9608d82bf72b6f679df77c544d6337336383b8019ec092c55c9cc9d4fe319854
build_command: cd siged/frontend && npm run build
build_exit_code: 0
build_output_hash: sha256:e67a6f513e2d44ece03a7080fc3a620b8a5413747a2f9efb860e6ffda08ca4fa

## Verification Report

**Change**: `002-gestionar-instituciones-correccion`  
**Mode**: Strict TDD  
**Artifact store**: OpenSpec  
**Scope**: Independent final requirements and runtime verification after the accepted scoped fixes.

### Completeness

| Metric | Value |
|---|---:|
| Delta requirements | 5/5 |
| Delta scenarios | 13/13 |
| Planned tasks | 11/11 |
| Focused remediation tasks | 2/2 |
| Incomplete tasks | 0 |

### Current Runtime Evidence

| Command | Result | Exit | Output hash |
|---|---|---:|---|
| `cd siged/backend && .venv/bin/pytest --cov=apps --cov-report=term-missing` | ✅ 69 passed; 97% total coverage; collected `apps/core` and `apps/organizacion/tests` | 0 | `sha256:9608d82bf72b6f679df77c544d6337336383b8019ec092c55c9cc9d4fe319854` |
| `cd siged/backend && .venv/bin/pytest apps/core/tests.py apps/organizacion/tests/test_institucion_api.py -q` | ✅ 59 passed | 0 | `sha256:40e3245d35bee5a7e6380bf2b1b947135cdbf6d670b6e91f277d7dc668c70f86` |
| `cd siged/backend && .venv/bin/pytest --collect-only -q` | ✅ 69 collected from core plus all three organization test modules | 0 | `sha256:4ad870db36c35a08ef5b6d30a3060f2a68091a535f3aa8441415caf8cecbbc55` |
| `cd siged/frontend && npm test -- --coverage` | ✅ 14 files, 53 tests; 93.09% statements, 84.72% branches, 93.58% functions, 93.09% lines | 0 | `sha256:9e1c4dd8ad93d8d2eb64bca755b408913b26fbe0d60846203ba704af359d8f39` |
| `cd siged/frontend && npm test -- [five scoped institution/menu files]` | ✅ 5 files, 22 tests | 0 | `sha256:e0768d029803f8c7e394b6a6f00d6041a420ea1f764d1074579ec077168fe783` |
| `cd siged/frontend && npm run build` | ✅ `tsc -b && vite build`; 62 modules transformed | 0 | `sha256:e67a6f513e2d44ece03a7080fc3a620b8a5413747a2f9efb860e6ffda08ca4fa` |
| `git diff --check` | ✅ no whitespace errors | 0 | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

`pytest.ini` sets `testpaths = apps/core apps/organizacion/tests`; the configured backend command therefore now gates both required domains.

### Django, Migration, and Seed Checks

| Check | Result | Exit | Output hash |
|---|---|---:|---|
| `manage.py check && makemigrations --check && showmigrations organizacion` | ✅ no system issues; no model changes; only `0001`–`0003` applied | 0 | `sha256:c8c6bf90c72a636cf0dc7e3ff582597cb543278690b9abc49a58f182920402de` |
| `manage.py seed_demo` against the current local database | ✅ expected fail-closed `CommandError` for a mismatched documented demo RUC identity | 1 expected | `sha256:7ba86ff6a2290639fe0ab5da5cd64b7682012e650cc9764af5de1a505f72787f` |
| `SeedDemoCommandTestCase` in configured backend suite | ✅ creates/reuses valid fixtures and rejects code/name RUC collisions before roles or assignments are committed | 0 | covered by configured backend hash |

The direct seed command's non-zero exit is the specified collision-safe outcome, not a verification failure. Its transactional command tests also prove no role assignment or role creation occurs after either collision variant.

### Spec Compliance Matrix

| Requirement | Scenario | Passing runtime coverage | Result |
|---|---|---|---|
| RF-001 | Active authority sees `Mis instituciones` | `SideMenu.test.tsx` active-authority case | ✅ COMPLIANT |
| RF-001 | Non-authority does not unlock it | `SideMenu.test.tsx` non-authority case | ✅ COMPLIANT |
| RF-001 | Inactive authority does not unlock it | active-role contract plus `test_mis_instituciones_returns_only_active_academic_authority_assignments` | ✅ COMPLIANT |
| RF-003 | Create with a manual code | API create and frontend POST payload cases | ✅ COMPLIANT |
| RF-003 | Edit the code | API explicit-code PATCH and frontend PATCH payload cases | ✅ COMPLIANT |
| RF-003 | Reject duplicate code | API duplicate body and frontend field-error cases | ✅ COMPLIANT |
| RF-004 | Preserve stored code values | `test_institution_code_remains_unique` | ✅ COMPLIANT |
| RF-004 | No auto-generated code on create | required-code API case | ✅ COMPLIANT |
| RF-005 | Canonical code label appears | rendered table, form, and My Institutions cases | ✅ COMPLIANT |
| RF-005 | Action spacing and accessibility remain intact | rendered action-group, names, focus, and callbacks | ✅ COMPLIANT |
| RF-012 | Active authority is allowed | authority-only `/usuario/` API case | ✅ COMPLIANT |
| RF-012 | Active non-authority is excluded | same API role-state case | ✅ COMPLIANT |
| RF-012 | Inactive authority is excluded | same API role-state case | ✅ COMPLIANT |

**Compliance summary**: **13/13 scenarios compliant** with current passing runtime coverage.

### Frozen Scoped-Fix Verification

| Frozen ID | Current implementation and test evidence | Result |
|---|---|---|
| RISK-002 | `seed_demo` compares the documented code and name before reuse by RUC; both collision variants fail before role grants. | ✅ COMPLIANT |
| RESILIENCE-003 | Serializer converts known `codigo`, `nombre`, and `ruc` unique-index races on create/update to deterministic field errors and re-raises unrelated integrity failures. | ✅ COMPLIANT |
| REL-001 | Configured collection and coverage include `apps/core` and `apps/organizacion/tests`. | ✅ COMPLIANT |
| REL-003 | A partial PATCH without `codigo` returns exact code-field 400; explicit-code PATCH updates normally. | ✅ COMPLIANT |

### Correctness and Design Coherence

| Decision | Followed? | Evidence |
|---|---|---|
| Required writable unique code, including PATCH | ✅ Yes | Serializer field/partial validation, service calls, API and race tests. |
| Preserve existing codes and remove sequence path | ✅ Yes | unique model field, clean migrations through `0003`, preservation test. |
| RF-012 enforced at query boundary | ✅ Yes | DAO-backed API test covers active authority, inactive authority, and non-authority. |
| Canonical labels and preserved actions | ✅ Yes | form/table/page source plus rendered frontend tests. |

### TDD Compliance

| Check | Result | Details |
|---|---|---|
| TDD evidence reported | ✅ | `apply-progress.md` contains task and remediation tables. |
| All task test files exist and pass | ✅ | Current backend/frontend focused and full executions pass. |
| RED/GREEN provenance | ✅ | New behavior tasks and R1 have recorded RED→GREEN evidence; 3.3 and R2 remain explicitly approved characterization exceptions. |
| Triangulation | ✅ | create/edit/duplicate, both race paths, three authority states, and both seed collision variants vary inputs. |
| Assertion quality | ✅ | No tautologies, ghost loops, or tests without production execution found in change tests. |
| Test layer distribution | ⚠️ | Integration/component coverage is strong; no browser E2E layer is configured. |

### Changed-File Coverage

| File | Line coverage | Rating |
|---|---:|---|
| `apps/core/management/commands/seed_demo.py` | 100% | ✅ Excellent |
| `apps/organizacion/apis/serializers/institucion_serializer.py` | 99% | ✅ Excellent |
| `InstitutionForm.tsx` | 100% | ✅ Excellent |
| `InstitutionTable.tsx` | 100% | ✅ Excellent |
| `MyInstitutionsPage.tsx` | 100% | ✅ Excellent |
| `services/api.ts` | 100% | ✅ Excellent |
| `SideMenu.tsx` | 94.59% | ⚠️ Acceptable |

### Quality Metrics

**Linter**: ➖ no separate command configured.  
**Type checker**: ✅ passed through `npm run build`.

### Issues Found

**CRITICAL**: None.

**WARNING**:
1. The accepted correction transaction has no persisted review receipt/ledger/transaction metadata in the OpenSpec change; this report verifies implementation and runtime evidence, not review-lineage provenance.
2. RISK-002's historical pre-edit core-suite safety-net capture is incomplete in `apply-progress.md`, although its current command tests and configured suite pass.
3. `SideMenu.test.tsx` retains one unrelated CSS-class selector for its overlay test. The RF-005 action-group class assertion is retained because the specification explicitly requires spacing stability.

**SUGGESTION**:
1. Add browser-level E2E/visual regression when the project adopts that capability.

### Verdict

**PASS WITH WARNINGS** — all 5 requirements, 13 scenarios, 13 completed tasks, accepted scoped fixes, configured cross-app backend coverage, frontend coverage/build, focused checks, and Django/migration checks pass. No application code was modified during verification.
