## Exploration: 002-gestionar-instituciones

### Current State

The authoritative definition already exists under `specs/002-gestionar-instituciones/`. It contains the functional requirements, data model, API contracts, implementation decisions, technical plan, verification plan, checklist, and two UI prototypes. This OpenSpec change must translate those documents without resolving additional product or architecture questions.

Slices 1–2 have created the `organizacion` domain and institution API, but parts of that implementation follow decisions introduced by the previous OpenSpec artifacts rather than the legacy package.

### Authoritative Sources

- `spec.md` — four P1 stories and RF-001–RF-012.
- `data-model.md` — exact fields, relations, validations RV-001–RV-006, and integrity rules RI-001–RI-005.
- `contracts/institucion-contracts.md` — routes, permissions, query parameters, payloads, status codes, and assignment state transitions.
- `research.md` — binding decisions D1–D14.
- `plan.md` — required backend/frontend files, UI behavior, and verification coverage.
- `docs/prototypes/**/{code.html,screen.png}` — visual references for both institution screens.
- `checklists/requirements.md` — confirms the teacher considers the feature complete and clarification-free.

### Required Scope

1. Show `Instituciones` and/or `Mis instituciones` from distinct active roles.
2. Provide administrator institution CRUD, `nombre` search, pagination, and ordering by `nombre`, `codigo`, or `ruc`.
3. List/create/edit/delete/activate/deactivate academic-authority assignments.
4. Limit authorities to institutions connected through active assignments.
5. Implement the exact models, layered files, endpoints, payloads, frontend modules, and validation behavior defined by the sources.

### Drift to Remove

- No legacy source defines `is_staff` migration semantics, automatic administrator-role bootstrap, route-hydration failure policy, or a new authorization source-of-truth migration.
- No source defines historical institution snapshot columns, `SET_NULL` preservation, or deployment/export/rollback behavior.
- RI-005 and D6 require active-combination uniqueness, but D6 explicitly places validation in the serializer; the prior OpenSpec added concurrency and conditional-database-constraint decisions.
- The institution list contract uses query parameter `nombre`, not `search`, and returns `autoridades_academicas` with nested assignment/user/role data plus timestamps.
- The legacy `Rol` model has one `nombre` choices field; the implementation introduced separate `codigo` and display `nombre` fields.

### Recommendation

Use only the established legacy approach: Django `organizacion` layers and the specified React feature structure. Treat every unreferenced OpenSpec assertion as unsupported and remove it rather than choosing an alternative.

### Risks

- Existing slice code and migrations encode unsupported schema choices; remediation must be migration-safe.
- Current passing tests assert drifted payloads and persistence behavior, so they cannot be treated as proof of the teacher contract.
- Prototype details can be implemented visually, but must not be promoted into new business rules.

### Ready for Proposal

Yes. No clarification or new decision is required; the legacy package is complete and authoritative.
