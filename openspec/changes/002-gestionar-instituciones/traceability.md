# Feature 002 Legacy Traceability and Drift Audit

## Outcome

The OpenSpec plan is now constrained to the teacher-provided package. Unsupported decisions were removed. Slices 1–2 require remediation before Feature 002 continues.

## Requirement Traceability

| OpenSpec requirement | Exact legacy source |
|---|---|
| Auth delta: active-role menu after login/reload | `spec.md` HU1 scenarios 1–3; RF-001; `research.md` D8–D9; `plan.md` §5 “Pantalla inicial…” |
| List/search/order/page institutions and active authorities | `spec.md` HU2 scenarios 1,5; RF-002, RF-006; `contracts/institucion-contracts.md` “Listar Instituciones”; `research.md` D10; `plan.md` §5 |
| Create/edit/delete institutions | `spec.md` HU2 scenarios 2–4; RF-003–RF-005; contract sections “Crear”, “Actualizar”, “Eliminar Institución” |
| Institution validation and protected deletion | `data-model.md` RV-001–RV-003, RI-001; `research.md` D11–D12 |
| Assignment CRUD/state lifecycle | `spec.md` HU3 scenarios 1–6; RF-007–RF-011; contract sections “Listar/Crear/Actualizar/Cambiar Estado/Eliminar Asignación” |
| Assignment validation/uniqueness | `data-model.md` RV-004–RV-006, RI-002–RI-005; `research.md` D5–D6 |
| Active institution scope | `spec.md` HU4 scenarios 1–2; RF-012; contracts “Obtener Detalle” and “Listar Instituciones del Usuario”; `research.md` D7 |
| Active roles and user selector | contracts “Listar Roles…” and “Listar Usuarios”; `research.md` D4, D9, D13 |
| Form errors and immediate authority refresh | `research.md` D14; `plan.md` §5 lineamientos and §6 UI tests |
| Prototype-backed screens | `plan.md` §5; `docs/prototypes/stitch_management_institutions/{code.html,screen.png}`; `docs/prototypes/stitch_my_institutions/{code.html,screen.png}` |

## Design Traceability

| OpenSpec design item | Exact legacy source |
|---|---|
| Django admin registration | `research.md` D1 |
| Single `Rol.nombre` choices field and class constants | `data-model.md` §1 Rol; `research.md` D2 |
| Central frontend role constants | `research.md` D3; AGENTS.md frontend constants rule |
| Display `nombre_display` | `research.md` D4; contract role payloads |
| Nullable institution + serializer rule | `data-model.md` UsuarioRol/RV-006; `research.md` D5 |
| Serializer active-combination uniqueness | `data-model.md` RI-005; `research.md` D6 |
| Institution-context permission | `research.md` D7 |
| Existing token mechanism | `research.md` D8 |
| Login/reload role fetch | `research.md` D9 |
| `nombre__icontains`, edit uniqueness exclusion, service deletion check | `research.md` D10–D12 |
| User filter split and DRF error rendering | `research.md` D13–D14 |
| File/component map | `plan.md` §3 |
| Endpoint map | `plan.md` §4 and full contracts document |
| Tests | `plan.md` §6 |

## Task Traceability

| Tasks | Exact legacy source |
|---|---|
| 1.1–1.2 model/schema remediation | `data-model.md` §§1–4; `research.md` D1–D6 |
| 1.3–1.4 institution contract remediation | contract sections lines 9–484; `research.md` D10–D12 |
| 2.1–2.2 assignment API | contract sections lines 485–996; RF-007–RF-011 |
| 2.3 roles/users/scope APIs | contract sections lines 106–176, 438–484, 562–610, 997–1091; RF-012; D7, D9, D13 |
| 3.1–3.2 role navigation | HU1/RF-001; D3, D8, D9; `plan.md` §5 |
| 4.1–4.4 institution/assignment UI | HU2–HU4; D14; `plan.md` §§3,5,6; both prototype pairs |

## Unsupported Decisions Removed

| Prior OpenSpec assertion | Audit result |
|---|---|
| Resolve `is_staff` vs active roles and migrate authorization source | No legacy section defines this conflict or migration. Removed. |
| Seed an active administrator assignment automatically | No Feature 002 legacy artifact requires it. Removed. |
| Conditional DB uniqueness, including null/global assignments and concurrency handling | D6 specifies serializer validation for `usuario + rol + institucion`; global uniqueness is not defined. Removed. |
| Preserve inactive history using `SET_NULL` and snapshot columns | No such fields or referential strategy exist in `data-model.md`. Removed. |
| Route guards, loading/error policy, clearing sessions on role refresh failure | RF-001 defines menu visibility only; D9 defines role fetching only. Removed. |
| Invalid query/page policy beyond documented contract | Not defined by the teacher. Removed. |
| Deployment failure checks, export-before-rollback, phased rollout | Not defined. Removed. |

## Slice 1–2 Implementation Mismatches Requiring Remediation

| Severity | Current implementation | Required legacy behavior | Evidence |
|---|---|---|---|
| Critical | `Rol` has `codigo` plus free-text `nombre` | One unique `nombre` choices field with class constants; `get_nombre_display()` | `models.py`; `data-model.md` Rol; D2/D4 |
| Critical | Bootstrap migration seeds roles and an admin assignment | Feature docs do not define automatic assignment bootstrap | `bootstrap.py`, `0002_seed_roles_and_admin.py`; absent from all legacy sections |
| Critical | `UsuarioRol` adds `institucion_codigo`/`institucion_nombre`, `SET_NULL`, and snapshot-on-delete | Exact model contains no snapshot fields; no preservation design is specified | `models.py`, `0001_initial.py`; `data-model.md` UsuarioRol |
| Critical | Two conditional DB constraints include global null-role uniqueness | RI-005 covers same user/role/institution active combination; D6 places validation in serializer | `models.py`; RI-005/D6 |
| High | Institution response exposes only `id,codigo,nombre,ruc,autoridades_activas` and flattens users | Contract requires timestamps and `autoridades_academicas` containing assignment `id`, nested `usuario`, nested `rol`, `es_activo`, `fecha_desde` | `institucion_serializer.py`; “Listar Instituciones” 200 payload |
| High | Detail endpoint is administrator-only through viewset permission | Detail permits ADMINISTRADOR or active AUTORIDAD_ACADEMICA for that institution | `views.py`, `permisos.py`; “Obtener Detalle” authentication |
| High | Delete error is `{"detail":"Institution has active assignments."}` | Exact contract is `{"error":"No se puede eliminar la institución porque tiene autoridades académicas activas."}` | `views.py`; “Eliminar Institución” 409 |
| High | Tests assert unsupported snapshots/global uniqueness/bootstrap and drifted payload | Tests must prove RV/RI and exact response contracts | three current test files; `plan.md` §6 |
| Medium | Permission queries `rol__codigo` | Must follow aligned `Rol.nombre` schema | `permisos.py`; D2 |
| Medium | `fecha_actualizacion` is non-null `auto_now=True` | Data model says nullable and autogestionado | `models.py`; `data-model.md` Institucion |
| Medium | API validates undocumented invalid ordering/page/page_size cases and English errors | Teacher only documents supported optional parameters; do not elevate invented error policy | `views.py`; list contract query table |
| Medium | `apply-progress.md` claims no deviations | This audit proves schema, payload, permission, and history deviations | `apply-progress.md` “Deviations” |

## Legacy Artifact Coverage

All legacy artifacts were reviewed: checklist, contracts, data model, research, plan, functional spec, both prototype HTML files, and both prototype PNGs. The prototypes are visual implementation references; they do not override RF-001–RF-012 or the written contracts.

| Approved addendum | Evidence |
|---|---|
| Administrator role catalog returns `{id,nombre}` | `test_administrator_role_catalog_is_minimal_and_restricted` |
| UI resolves `AUTORIDAD_ACADEMICA` by name and real ID | `assignmentApi.roles`, `AuthorityModal`; service endpoint test |
