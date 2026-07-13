# Delta for Authentication

## MODIFIED Requirements

### Requirement: RF-006 — Protected Routes

The existing token-based protected-route behavior remains unchanged. After successful login or reload with an authenticated session, the frontend MUST request `GET /usuarioroles/roles/` using the existing `Authorization: Token <token>` mechanism and use the distinct active roles returned to determine side-menu options.

(Previously: Protected routing and token restoration existed without Feature 002 role-aware menu data.)

#### Scenario: Administrator menu option

- GIVEN an authenticated user has an active `ADMINISTRADOR` assignment
- WHEN the side menu loads after login or page reload
- THEN `Instituciones` is shown

#### Scenario: Academic-authority menu option

- GIVEN an authenticated user has an active `AUTORIDAD_ACADEMICA` assignment
- WHEN the side menu loads after login or page reload
- THEN `Mis instituciones` is shown

#### Scenario: Multiple active roles

- GIVEN an authenticated user has both active roles
- WHEN the side menu loads
- THEN both options are shown
