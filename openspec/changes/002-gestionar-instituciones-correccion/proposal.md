# Proposal: Correct Institution Code Ownership and Authority Scope

## Intent

Fix drift in Feature 002 so institution codes are user-owned, unique, and editable, while preserving existing data and UI polish. Also tighten `Mis instituciones` to active `AUTORIDAD_ACADEMICA` only.

## Scope

### In Scope
- Make institution code a user-entered field on create/edit with uniqueness validation.
- Remove the obsolete auto-code sequence concept without rewriting existing institution codes.
- Restrict RF012 access to active `AUTORIDAD_ACADEMICA` assignments only.
- Replace the misleading `Código AMIE` label with the canonical institution-code label.
- Preserve the current action-button spacing/accessibility behavior.

### Out of Scope
- Reassigning or renumbering existing institution codes.
- New institution workflows beyond the correction slice.
- Broader role-management or authentication changes.
- UX redesign unrelated to the label/field correction.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `institution-management`: institution code becomes manually owned/validated; obsolete auto-sequence behavior is removed; UI wording is corrected.
- `auth`: `Mis instituciones` visibility/access is limited to active `AUTORIDAD_ACADEMICA` assignments.

## Approach

Update the institution contract to require explicit code entry and uniqueness checks, then remove the sequence path as dead behavior rather than migrating codes. Keep frontend layout changes minimal so the action spacing stays intact.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `openspec/changes/002-gestionar-instituciones-correccion/` | New | Proposal, then delta specs/design/tasks |
| `openspec/specs/auth/spec.md` | Modified | Narrow authority-driven access rule |
| `openspec/specs/institution-management/spec.md` | Modified/created | Institution code ownership and label contract |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Existing auto-generated codes become confusing if rewritten | High | Preserve stored codes; only change future ownership rules |
| Access regression for `Mis instituciones` | Medium | Add contract coverage for active authority-only access |
| Review budget overrun from cleanup + contract edits | Medium | Keep this proposal narrow; defer unrelated cleanup to later slices |

## Rollback Plan

Revert the correction change only. Keep existing institution data and codes unchanged; restore the prior sequence-backed contract if needed.

## Dependencies

- Feature `002-gestionar-instituciones` baseline.
- Existing institution records must remain valid under the new uniqueness rule.

## Success Criteria

- [ ] Institution codes are editable, unique, and not auto-generated.
- [ ] Existing codes remain unchanged after the correction.
- [ ] `Mis instituciones` is available only through active `AUTORIDAD_ACADEMICA` assignments.
- [ ] UI shows the canonical code label and keeps action spacing unchanged.
