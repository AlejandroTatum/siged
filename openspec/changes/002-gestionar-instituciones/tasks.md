# Tasks: Manage Educational Institutions and Academic Authorities

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | Above 400 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Remediation → assignment APIs → role UI → institution UI |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Focused test | Runtime | Rollback boundary |
|---|---|---|---|---|
| 1 | Align slices 1–2 | `cd siged/backend && .venv/bin/pytest apps/organizacion/tests -q` | `python manage.py check` | Schema/institution API remediation |
| 2 | Assignment/user APIs | focused organization/core API tests | APIClient contract flows | Assignment/core endpoint files |
| 3 | Role-aware menu | focused auth/layout tests | login + reload | Auth/layout/config changes |
| 4 | Institution screens | focused institution tests | both prototype flows | Institution feature/routes |

## Phase 1: Remediate Existing Slices (RED → GREEN → REFACTOR)

- [x] 1.1 RED: replace drift-based model tests with exact `data-model.md` fields, RV-001–RV-006, RI-001–RI-005, and D1–D6 expectations.
- [x] 1.2 GREEN: align `models.py`, admin, migrations, and serializers; remove unsupported bootstrap, split role schema, snapshot fields, and history semantics.
- [x] 1.3 RED: assert exact institution payloads/query/status/error contracts, including timestamps and `autoridades_academicas`.
- [x] 1.4 GREEN/REFACTOR: align institution DAO/service/serializer/view/routes to contracts and D10–D12.

## Phase 2: Assignment, Role, User, and Scope APIs

- [x] 2.1 RED: cover every `/usuarioroles/` lifecycle/validation contract and serializer-layer active uniqueness.
- [x] 2.2 GREEN: implement entity-specific assignment DAO/service/serializer/view and routes.
- [x] 2.3 RED/GREEN: implement `/roles/`, `/instituciones/usuario/`, scoped detail permission, and `/usuarios/?activo=` exactly as documented.

## Phase 3: Active-Role Navigation

- [x] 3.1 RED: cover RF-001 for administrator, authority, and multiple active roles after login/reload.
- [x] 3.2 GREEN/REFACTOR: reuse existing token auth, centralize role constants/endpoints, and render documented menu options.

## Phase 4: Institution UI

- [x] 4.1 RED: cover prototype-backed table/search/order/pagination, institution forms, confirmations, and backend errors.
- [x] 4.2 GREEN: implement specified pages, table/form/card, and institution service.
- [x] 4.3 RED/GREEN: implement assignment modal workflows and immediate main-table refresh.
- [x] 4.4 Verify all legacy functional, UI, integration, and authorization scenarios.
