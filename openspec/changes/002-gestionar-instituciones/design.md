# Design: Manage Educational Institutions and Academic Authorities

## Technical Approach

Implement the structure already fixed by the legacy plan: Django `organizacion` models and entity-specific view/serializer/service/DAO files; a `core` user-list endpoint; React institution pages/components/services; existing token authentication reused unchanged.

## Architecture Decisions

| Decision | Binding source |
|---|---|
| Register `Institucion`, `Rol`, `UsuarioRol` in Django admin | `research.md` D1 |
| `Rol.nombre` is the unique choices field; values are class constants | `data-model.md` Rol; `research.md` D2 |
| `UsuarioRol.institucion` is nullable; serializer requires it for `AUTORIDAD_ACADEMICA` | `research.md` D5; RV-006 |
| Serializer validates one active `usuario`–`rol`–`institucion` combination | `research.md` D6; RI-005 |
| Institution-context permission checks active assignment | `research.md` D7 |
| Reuse localStorage token and `Authorization: Token <token>` unchanged | `research.md` D8 |
| Load active roles after login/reload | `research.md` D9 |
| Use `nombre__icontains`; exclude edited institution from uniqueness checks | `research.md` D10–D11 |
| Service rejects institution deletion with active assignments | `research.md` D12 |
| Creation lists active users; editing lists all users | `research.md` D13 |
| Render DRF field errors and `non_field_errors` | `research.md` D14 |

No extra decisions are made about bootstrap assignments, `is_staff`, database concurrency constraints, historical snapshots, role-refresh failure states, or deployment policy.

## Data Flow

```text
React UI → API service → DRF view → serializer/permission → service → DAO → ORM
```

## File Changes

| File/group | Action | Description |
|---|---|---|
| `siged/backend/apps/organizacion/models.py` | Create/remediate | Exact `Institucion`, `Rol`, `UsuarioRol` fields |
| `organizacion/apis/{views,urls}.py`, `apis/serializers/{institucion,usuariorol}_serializer.py` | Create/remediate | Exact contracts |
| `organizacion/servicios/{institucion,usuariorol}_servicio.py` | Create/remediate | Business rules |
| `organizacion/daos/{institucion,usuariorol}_dao.py` | Create/remediate | ORM access |
| `organizacion/{admin,permisos,excepciones,tests}.py` | Create/remediate | Registration, authorization, errors, verification |
| `siged/backend/apps/core/{apis,servicios,daos}/` | Modify | `/usuarios/?activo=` |
| `siged/frontend/src/features/instituciones/` | Create | Exact plan pages/components/services plus supporting modules |
| `siged/frontend/src/features/auth/`, `layout/components/SideMenu.tsx`, `App.tsx` | Modify | Active roles and navigation |
| `siged/frontend/src/config/{app,endpoints}.ts` | Modify | Role constants and endpoints |

## Interfaces / Contracts

Implement verbatim routes and response shapes from `contracts/institucion-contracts.md`: `/instituciones/`, `/{id}/`, `/usuario/`; `/usuarioroles/`, `/{id}/`, `/{id}/estado/`, `/roles/`; `/usuarios/?activo=`. In project routing these are mounted below the existing `/api/` prefix.

The institution list query is `nombre`, not `search`. List rows expose `fecha_creacion`, `fecha_actualizacion`, and `autoridades_academicas` with nested assignment, user, and role data. Role payloads use model field `nombre` plus serializer field `nombre_display`.

## Testing Strategy

| Layer | Required coverage |
|---|---|
| Unit | RV-001–RV-006, RI-001–RI-005, D10–D12 |
| Functional/API | Exact CRUD, assignment, user/role, filtering, status, and authorization contracts |
| UI | Role menus, prototype screens, pagination/order/search, modals, errors, refresh |
| Integration | view → service → DAO and frontend → API |

Strict TDD applies: add a failing contract test before each remediation or new behavior.

## Threat Matrix

N/A — no shell, subprocess, VCS, executable-classification, or process-integration boundary.

## Migration / Rollout

Create Django migrations required by the exact teacher data model. Because slices 1–2 already created a drifted schema, remediation requires a forward migration or a controlled reset appropriate to the project state; this document does not choose a new policy.

## Open Questions

None in product or architecture. The migration execution method is an implementation-state concern and must preserve the teacher schema rather than alter it.

## Approved extension: role identifier discovery

`GET /api/roles/` follows permission → view → service → DAO and serializes only `id`/`nombre`. The centralized frontend endpoint/service loads the catalog once per assignment-modal load, resolves `AUTORIDAD_ACADEMICA` by name, and retains the returned ID. This deliberately extends the teacher contract; it does not reinterpret the source documents.
