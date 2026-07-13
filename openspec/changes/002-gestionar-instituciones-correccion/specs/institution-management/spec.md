# Delta for Institution Management

## MODIFIED Requirements

### Requirement: RF-003 — Institution code is required, manual, editable, and unique

The system MUST require an institution code on create and edit, allow users to enter and change it manually, and reject duplicate codes.

(Previously: institution codes were auto-generated and the form hid or locked the field.)

#### Scenario: Create with a manual code

- GIVEN an administrator opens the institution create form
- WHEN the administrator enters a code and saves valid data
- THEN the institution is created with that exact code

#### Scenario: Edit the code

- GIVEN an existing institution with code `INST001`
- WHEN the administrator changes the code and saves
- THEN the updated record keeps the new code

#### Scenario: Reject duplicate code

- GIVEN another institution already uses the submitted code
- WHEN the administrator saves the form
- THEN validation fails for the code field

### Requirement: RF-004 — Existing institution values are preserved and code auto-generation is removed

The system MUST preserve existing institution values during this correction and MUST NOT rewrite stored codes or generate a replacement code automatically.

(Previously: new records received an auto-generated sequence code.)

#### Scenario: Preserve stored code values

- GIVEN an institution already exists with a stored code
- WHEN the correction is applied
- THEN the stored code remains unchanged

#### Scenario: No auto-generated code on create

- GIVEN the create form is submitted without any client-generated code logic
- WHEN the administrator saves the record
- THEN the system rejects the request unless a code was entered manually

### Requirement: RF-005 — Canonical label and action controls remain stable

The system MUST use the canonical institution-code label everywhere the code is presented, and the edit/delete action spacing and accessibility behavior MUST remain unchanged.

(Previously: the UI exposed the misleading `Código AMIE` label.)

#### Scenario: Canonical code label appears

- GIVEN the institution list or form renders the code field
- WHEN the page is displayed
- THEN the label uses the canonical institution-code name

#### Scenario: Action spacing and accessibility remain intact

- GIVEN the institution list renders edit and delete actions
- WHEN the actions are displayed or focused with the keyboard
- THEN the spacing and accessible interaction behavior match the existing UI

### Requirement: RF-012 — Active authority-only institutional access

The system MUST allow `Mis instituciones` only for active `AUTORIDAD_ACADEMICA` assignments and MUST exclude active non-authority roles and inactive authority assignments.

(Previously: access was broader and could include other active roles.)

#### Scenario: Active authority assignment is allowed

- GIVEN a user has an active `AUTORIDAD_ACADEMICA` assignment
- WHEN the user opens `Mis instituciones`
- THEN the assigned institution is shown

#### Scenario: Active non-authority role is excluded

- GIVEN a user has only an active non-authority role
- WHEN the user opens `Mis instituciones`
- THEN the screen does not expose institutional access

#### Scenario: Inactive authority assignment is excluded

- GIVEN a user has an inactive `AUTORIDAD_ACADEMICA` assignment
- WHEN the user opens `Mis instituciones`
- THEN the assigned institution is not shown
