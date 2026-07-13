# Exploration: Correct Feature 002 institution-code and authority-scope drift

### Current State
- Feature 002 already implements institution CRUD, authority assignments, active-role menu data, and the `Mis instituciones` screen.
- The current backend still carries an auto-generated institution-code sequence model/migration (`InstitucionCodigoSecuencia`, `0004_institucion_codigo_secuencia.py`) and the institution create flow reserves `INSTnnn` codes automatically.
- The institution form hides code input on create/edit and shows read-only code on edit; `MyInstitutionsPage` displays `Código AMIE` for the institution code.
- RF012 is currently broader than the requested correction: object access allows active `ADMINISTRADOR` or active `AUTORIDAD_ACADEMICA`, while the user request asks to tighten `Mis instituciones` to only active `AUTORIDAD_ACADEMICA` assignments.

### Exact Scope
- Restore institution code as explicit user-entered data on create/edit with uniqueness validation.
- Remove the auto-code sequence model/migration from the corrective plan safely.
- Correct RF012 so only active `AUTORIDAD_ACADEMICA` assignments grant `Mis instituciones`.
- Replace the misleading `Código AMIE` label with the canonical institution-code label everywhere it appears.
- Preserve the already-improved Edit/Delete button spacing and accessibility from the existing UI work.

### Affected Areas
- `openspec/changes/002-gestionar-instituciones-correccion/specs/institution-management/spec.md` — institution code contract, RF012 tightening, UI label consistency.
- `openspec/changes/002-gestionar-instituciones-correccion/specs/auth/spec.md` — menu visibility remains role-driven, but the authority role should be the only role that unlocks `Mis instituciones`.
- `openspec/changes/002-gestionar-instituciones-correccion/design.md` — remove the backend sequence decision and document manual code ownership plus deletion of obsolete migration/model.
- `openspec/changes/002-gestionar-instituciones-correccion/tasks.md` — add remediation tasks for removing `InstitucionCodigoSecuencia` and updating impacted tests.
- `siged/backend/apps/organizacion/models.py` and `migrations/0004_institucion_codigo_secuencia.py` — obsolete sequence model/migration are the drift to retire in the corrective implementation.
- `siged/backend/apps/organizacion/apis/serializers/institucion_serializer.py`, `servicios/institucion_servicio.py`, `daos/institucion_dao.py`, `tests/` — manual code creation/update validation and uniqueness rules.
- `siged/backend/apps/organizacion/permisos.py`, `apis/views.py`, `tests/` — RF012 scoping to active authority assignment only.
- `siged/frontend/src/features/instituciones/components/InstitutionForm.tsx`, `pages/InstitutionListPage.tsx`, `pages/MyInstitutionsPage.tsx`, `types/institucionTypes.ts` — explicit code field, label cleanup, spacing preservation.
- `siged/frontend/src/features/layout/components/SideMenu.tsx`, `App.tsx`, auth menu tests — ensure `Mis instituciones` remains tied to the active authority role.

### Approaches
1. **Corrective spec-only update first** — publish a new OpenSpec delta that removes the sequence concept and restates manual institution-code ownership, then implement later.
   - Pros: safest for review; isolates contract repair from code changes.
   - Cons: current drift remains until apply phase.
   - Effort: Low

2. **Corrective spec + implementation slice** — publish the delta and plan a follow-up application slice that deletes the obsolete sequence model/migration and updates UI/API/tests.
   - Pros: keeps spec and implementation aligned; safer for legacy cleanup.
   - Cons: more work in the next phase.
   - Effort: Medium

### Recommendation
Use approach 2. The existing auto-sequence behavior is now the wrong product decision, so the corrective change should explicitly reverse it in the spec and schedule removal of the obsolete sequence model/migration with contract tests.

### Risks
- Backward compatibility: removing the auto-sequence path can break any data seeded under the generated-code assumption unless migration/backfill is handled carefully.
- Data integrity: if existing institutions have auto-generated codes, the corrective plan must preserve uniqueness and avoid silent code reassignment.
- Test drift: current tests likely assert generated-code behavior, so they must be rewritten to expect manual input and code uniqueness errors.
- UI regression: changing the code field from read-only/hidden to editable must not disturb the already-correct action-button spacing.

### Ready for Proposal
Yes — the next step is a proposal/spec delta for a corrective change named `002-gestionar-instituciones-correccion`.
