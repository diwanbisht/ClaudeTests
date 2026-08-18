# Manual Test Cases — Text Inputs

**Module:** UI-Web-App → Elements tab → Text Inputs
**Scope:** Positive and negative scenarios

| Field | Value |
|---|---|
| Application | UI-Web-App (`http://localhost:5500`) |
| Precondition (common) | App server running (`node UI-Web-App/server.js`), Elements tab is active |

---

### TC_TI_01 — Validate with all fields empty shows required-field errors

| | |
|---|---|
| **Preconditions** | Name, Email and Message fields are all empty |
| **Steps** | 1. Click **Validate** |
| **Test Data** | — |
| **Expected Result** | Message area shows `Name is required. A valid email is required.`; no success message is shown |

### TC_TI_02 — Validate with a valid Name but an invalid Email format

| | |
|---|---|
| **Preconditions** | Text Inputs fields are empty |
| **Steps** | 1. Enter a value in the Name field 2. Enter a non-email value in the Email field 3. Click **Validate** |
| **Test Data** | Name: `John Doe`; Email: `not-an-email` |
| **Expected Result** | Message area shows only `A valid email is required.` (no Name-required error); "You typed:" reflects `John Doe` |

### TC_TI_03 — Validate with a valid Name and a valid Email succeeds

| | |
|---|---|
| **Preconditions** | Text Inputs fields are empty |
| **Steps** | 1. Enter a value in the Name field 2. Enter a valid email address in the Email field 3. Enter a value in the Message field 4. Click **Validate** |
| **Test Data** | Name: `John Doe`; Email: `john.doe@example.com`; Message: `Hello world` |
| **Expected Result** | Message area shows `All fields are valid!` |

### TC_TI_04 — Clear resets all Text Input fields and messages

| | |
|---|---|
| **Preconditions** | Name, Email and Message fields are populated and a validation message is currently displayed (e.g. after TC_TI_03) |
| **Steps** | 1. Click **Clear** |
| **Test Data** | — |
| **Expected Result** | Name, Email and Message fields are all emptied; "You typed:" reverts to `(nothing yet)`; the validation message line is cleared |
/p