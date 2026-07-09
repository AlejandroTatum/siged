# Proposal: SIGED Feature 001-user-auth — Review & Cleanup

**Change**: `001-user-auth`  
**Project**: SIGED  
**Type**: Review / Cleanup / Canonical Artifact Creation  
**Date**: 2026-07-09  
**Artifact Store**: OpenSpec  

---

## 1. Problem Statement

Feature 001-user-auth (User Authentication) was implemented with legacy planning artifacts under `specs/001-user-auth/` and working code in `siged/backend/` and `siged/frontend/`. However, the feature lacks canonical OpenSpec artifacts, making it difficult to:

- Trace requirements to implementation and tests.
- Review the feature holistically for consistency, completeness, and maintainability.
- Onboard new contributors who need a single source of truth.
- Verify that acceptance criteria from the original spec are fully met by the current code.

This proposal defines a review-and-cleanup effort to make Feature 001 clean, usable, and traceable.

---

## 2. Target Users & Situations

| Who | When | Why |
|-----|------|-----|
| Developers / Maintainers | Before extending auth or adding new features | Need a trustworthy reference for existing behavior and boundaries |
| QA / Testers | When validating auth flows or regression testing | Need traceability from acceptance criteria to test coverage |
| New Contributors | Onboarding to the SIGED codebase | Need a single, canonical artifact that explains what exists and why |
| Reviewers / Tech Leads | During PR review for auth-related changes | Need a clear baseline to judge whether a change is within scope |

---

## 3. Business Rules & Constraints

The review must respect the following existing decisions and invariants:

- **Authentication field**: `numero_identificacion` (not `username`) is the unique identifier.
- **Token strategy**: Django REST Framework `TokenAuthentication` (not JWT or session-based).
- **Language**: UI and API messages are in Spanish.
- **Backend stack**: Django 4.2 + DRF 3.14.
- **Frontend stack**: React 19 + Vite + Tailwind CSS 4 + React Router 7.
- **Test stack**: Backend uses `pytest-django` + `pytest-cov`; frontend uses `vitest` + `@testing-library/react`.
- **Active user enforcement**: Inactive users (`is_active=False`) must be rejected at login with a specific error message.
- **Route protection**: Unauthenticated users hitting protected routes are redirected to `/login`; authenticated users hitting `/login` are redirected to `/`.

---

## 4. Current-State Gaps

| Gap | Evidence | Impact |
|-----|----------|--------|
| No canonical OpenSpec proposal | `openspec/changes/001-user-auth/proposal.md` missing | No traceable planning artifact for this feature |
| Legacy spec exists but is disconnected from code | `specs/001-user-auth/spec.md` is a flat functional doc without links to tests or contracts | Hard to verify completeness |
| Legacy plan references research/contracts that may be stale | `specs/001-user-auth/plan.md` references `research.md` and `contracts/auth-contracts.md` | May contain outdated design decisions |
| No explicit cleanup criteria defined | No acceptance criteria for "clean, usable, and traceable" | Subjective review, inconsistent outcomes |
| State file shows `tasks-complete` but native dispatcher says artifacts missing | `state.yaml` says `next_recommended: apply` | Phase sequencing is out of sync with artifact reality |

---

## 5. Product Outcome

After this cleanup, Feature 001-user-auth should be:

1. **Traceable**: Every acceptance criterion in the original functional spec can be mapped to at least one test and one implementation unit.
2. **Clean**: Code follows project conventions (naming, structure, docstrings, type hints where applicable); no dead code, no commented-out experiments, no stale TODOs.
3. **Usable**: A new developer can read the canonical proposal, understand the scope, run the tests, and confirm the feature works without reading more than three files.
4. **Canonical**: The OpenSpec artifact under `openspec/changes/001-user-auth/` becomes the single source of truth; legacy `specs/001-user-auth/` is either superseded or explicitly referenced as historical context.

---

## 6. Scope & Boundaries

### In Scope (this proposal)
- Create the canonical OpenSpec `proposal.md` (this document).
- Create `spec.md` that consolidates the functional requirements from the legacy spec, adds traceability links, and removes ambiguity.
- Create `design.md` that documents the actual architecture as implemented (model, service, DAO, serializer, view, frontend context/hook/API).
- Create `tasks.md` that decomposes the review/cleanup work into actionable, verifiable units.
- Verify that every legacy acceptance criterion is covered by an existing test or explicitly flagged as a gap.
- Identify and list any code-quality issues (naming, structure, docstrings, dead code) without necessarily fixing them in this phase.
- Update `state.yaml` to reflect the correct phase sequence.

### Out of Scope (non-goals)
- **No new auth features**: No password recovery, no 2FA, no RBAC beyond the existing `is_active` check.
- **No stack migration**: No switching from DRF Token to JWT, no Django upgrade, no React framework change.
- **No UI redesign**: The existing Tailwind components and prototypes remain as-is; only documentation and test coverage are reviewed.
- **No database migration**: The `Usuario` model stays unchanged.
- **No CI/CD changes**: Out of scope for this review.

---

## 7. Acceptance Criteria for Clean / Usable / Traceable

### Traceability
- [ ] Every functional requirement (RF-001 through RF-006) from the legacy spec is explicitly mapped to:
  - The backend implementation file(s) that fulfill it.
  - The frontend implementation file(s) that fulfill it.
  - The test case(s) that verify it.
- [ ] Every user story acceptance scenario is linked to at least one test.
- [ ] Any unmapped requirement is listed as a `GAP` with a risk level.

### Cleanliness
- [ ] All Python modules have consistent docstrings (purpose, args, returns, raises).
- [ ] All TypeScript/React modules have JSDoc/TSDoc on exported functions and components.
- [ ] No commented-out code, no `TODO` without an issue reference, no `console.log` in production code.
- [ ] Naming conventions are consistent with the project standard (e.g., Spanish domain terms in backend, English in frontend where established).
- [ ] `excepciones.py` uses a consistent pattern; error messages are user-facing appropriate.

### Usability
- [ ] A developer can run the full auth test suite with a single command per stack (`pytest` for backend, `npm test` for frontend) and get a clear PASS/FAIL report.
- [ ] The OpenSpec artifacts can be read in sequence (`proposal` → `spec` → `design` → `tasks`) without needing to open the legacy `specs/` folder.
- [ ] The `proposal.md` includes a "Quick path" section summarizing how to verify the feature in under 5 minutes.

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Legacy spec and implementation have drifted | High | Medium | Explicit drift audit in `spec.md`; flag every mismatch |
| Tests exist but do not cover all acceptance scenarios | Medium | High | Map every scenario to a test; if missing, create a task |
| Frontend test coverage is lower than backend | Medium | Medium | Report coverage numbers; add tasks for missing tests |
| Over-scoping cleanup into a rewrite | Medium | High | Strict non-goals list; any refactor beyond docs/tests requires a new change ID |
| State file phase mismatch causes confusion | Medium | Low | Update `state.yaml` to `phase: proposal` and `next_recommended: spec` |

---

## 9. Rollback / Reversion

This phase produces documentation and planning artifacts only. It does not modify application code. Therefore:

- **Rollback strategy**: Delete or revert the `openspec/changes/001-user-auth/*.md` files.
- **Safety**: No runtime or deployment risk.

---

## 10. Verification Expectations

After the `spec`, `design`, and `tasks` phases complete, the following verification must pass before `apply` is authorized:

1. **Artifact completeness**: `proposal.md`, `spec.md`, `design.md`, `tasks.md` all exist under `openspec/changes/001-user-auth/`.
2. **Traceability matrix**: A table in `spec.md` maps every RF and acceptance scenario to files + tests.
3. **Test run evidence**: Both backend and frontend test suites pass on the current codebase with no changes.
4. **Gap list**: Any missing coverage or drift is documented with risk level; no unaddressed `CRITICAL` gaps.
5. **State coherence**: `state.yaml` phase matches the actual highest-completed artifact phase.

---

## 11. Quick Path

1. Read this `proposal.md` for scope and non-goals.
2. Read `spec.md` (next artifact) for requirements and traceability.
3. Read `design.md` for the as-implemented architecture.
4. Run backend tests: `cd siged/backend && pytest --cov`
5. Run frontend tests: `cd siged/frontend && npm test`
6. Compare results against the gap list in `spec.md`.

---

## 12. Next Step

Proceed to **`spec`** phase: consolidate the legacy functional spec into a canonical OpenSpec `spec.md` with traceability links, drift audit, and gap list.
