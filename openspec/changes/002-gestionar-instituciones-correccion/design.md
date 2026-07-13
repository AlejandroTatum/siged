# Design: Correct Institution Code Ownership and Authority Scope

## Technical Approach

Reverse the uncommitted auto-sequence implementation without migrating data. `Institucion.codigo` stays unique and becomes required, writable input on create/edit. RF012 is corrected at the `Mis instituciones` query boundary: only active `AUTORIDAD_ACADEMICA` assignments return institutions. The menu rule and Edit/Delete layout remain unchanged.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Remove sequence safely | Delete uncommitted model and terminal `0004`; if locally applied, migrate `organizacion` to `0003` first. | Reversal migration; retain unused model. | Reversal drops only the sequence table; existing `Institucion.codigo` values remain. |
| Code ownership | Serializer accepts required/writable `codigo`, with instance-aware uniqueness; service/DAO persist it. | Generate `INSTnnn`; client-only validation. | Database uniqueness is the integrity backstop; serializer yields field errors. |
| RF012 scope | `listar_por_usuario`: user + `es_activo=True` + `Rol.AUTORIDAD_ACADEMICA`. | All active assignments; broader permission changes. | Corrects `/usuario/`; administrator CRUD/detail stays intact. |
| UI preservation | Editable `codigo`, label `Código de institución`; no `InstitutionTable` action changes. | Modal/table redesign. | Corrects ownership without spacing/accessibility regression. |

## Data Flow

```text
Create/Edit modal (codigo, nombre, ruc)
  -> institutionApi POST/PATCH -> serializer validation
  -> InstitucionServicio -> InstitucionDAO -> Institucion (unique codigo)

Mis instituciones -> GET /api/instituciones/usuario/
  -> InstitucionServicio.listar_por_usuario
  -> DAO: user + active AUTORIDAD_ACADEMICA assignment -> matching institutions
```

## File Changes

| File | Action | Description |
|---|---|---|
| `siged/backend/apps/organizacion/models.py` | Modify | Remove sequence model; retain unique `codigo`. |
| `siged/backend/apps/organizacion/migrations/0004_institucion_codigo_secuencia.py` | Delete | Remove terminal uncommitted sequence migration. |
| `organizacion/daos/institucion_dao.py` | Modify | Remove reservation; authority-only user query. |
| `organizacion/servicios/institucion_servicio.py` | Modify | Create from client data; remove retry path. |
| `organizacion/apis/serializers/institucion_serializer.py` | Modify | Writable required code and uniqueness validation. |
| `organizacion/tests/test_institucion_api.py` | Modify | Manual-code, duplicate, preservation, and RF012 tests. |
| `organizacion/tests/test_models.py` | Modify | No sequence model; unique code remains. |
| `frontend/src/features/instituciones/types/institucionTypes.ts` | Modify | Add `codigo` to `InstitutionInput`. |
| `frontend/src/features/instituciones/components/InstitutionForm.tsx` | Modify | Editable required code with canonical label. |
| `frontend/src/features/instituciones/pages/MyInstitutionsPage.tsx` | Modify | Canonical displayed label. |
| `siged/frontend/src/features/instituciones/components/InstitutionTable.tsx` | Preserve | No behavior or class changes; action spacing/accessibility is regression-tested. |
| frontend institution component/page tests | Create/Modify | Cover input payload, label, server field errors, and preserved action controls. |

## Interfaces / Contracts

`POST /api/instituciones/` and `PATCH /api/instituciones/{id}/` accept:

```json
{ "codigo": "ABC-001", "nombre": "Central", "ruc": "123" }
```

`codigo` is required for creation and may be changed on update. A duplicate returns HTTP 400 with `{"codigo": ["..."]}`; the same institution may retain its current code. `GET /api/instituciones/usuario/` returns only institutions linked to the caller by an active `AUTORIDAD_ACADEMICA` assignment.

## Testing Strategy

| Layer | What to test | Approach |
|---|---|---|
| Backend API/unit | Manual code, update/duplicate, legacy `INST...`, no reservation | Deterministic pytest API/service tests. |
| Backend integration | `/usuario/` excludes admin-only, inactive, and other roles | APIClient role-state fixtures. |
| Migration guard | `0004` reverses locally; no remaining model changes | `showmigrations`, migrate `0003`, delete, `makemigrations --check`. |
| Frontend | Code payload/label/errors; preserved action controls | Focused Vitest tests; keep SideMenu coverage. |

Run organization tests, `pytest --cov=apps`, frontend tests with coverage, and `npm run build`. Start each behavior change RED. Expected diff is within 400 lines; split if measured diff exceeds it.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary is introduced. The local migration rollback is an operational Django command, not an application process-integration boundary.

## Migration / Rollout

Confirm the sequence model and `0004` are uncommitted with `git status`, then check `python manage.py showmigrations organizacion`. If applied locally, run `python manage.py migrate organizacion 0003`; it reverses only the sequence table and preserves `Institucion` rows/codes. Delete `0004` and the model, then run `makemigrations --check` and tests. Do not backfill, renumber, or rewrite codes.

Rollback: before sharing, revert this correction and, if necessary, restore the model/migration then migrate forward; codes remain untouched. After `0004` is shared, use a reviewed forward migration instead.

## Open Questions

None.
