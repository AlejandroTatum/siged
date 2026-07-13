# Delta for Authentication

## MODIFIED Requirements

### Requirement: RF-001 — Menu visibility stays role-driven

The system MUST continue deriving side-menu visibility from active roles, but `Mis instituciones` MUST remain available only when an active `AUTORIDAD_ACADEMICA` assignment exists.

(Previously: the menu contract allowed broader access paths for institution visibility.)

#### Scenario: Active authority sees the menu option

- GIVEN an authenticated user has an active `AUTORIDAD_ACADEMICA` assignment
- WHEN the side menu loads
- THEN `Mis instituciones` is visible

#### Scenario: Non-authority role does not unlock `Mis instituciones`

- GIVEN an authenticated user has only active non-authority roles
- WHEN the side menu loads
- THEN `Mis instituciones` is not visible

#### Scenario: Inactive authority assignment does not unlock `Mis instituciones`

- GIVEN an authenticated user has an inactive `AUTORIDAD_ACADEMICA` assignment
- WHEN the side menu loads
- THEN `Mis instituciones` is not visible
