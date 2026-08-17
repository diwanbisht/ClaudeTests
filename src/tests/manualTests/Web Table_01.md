# Manual Test Cases — Web Table (Add / Edit User)

**Module:** UI-Web-App → Elements tab → Web Table
**Scope:** Positive scenarios only

| Field | Value |
|---|---|
| Application | UI-Web-App (`http://localhost:5500`) |
| Precondition (common) | App server running (`node UI-Web-App/server.js`), MySQL `app_users` table reachable |

---

### TC_WT_01 — Web Table loads existing users on page load

| | |
|---|---|
| **Preconditions** | Navigate to `http://localhost:5500`, Elements tab is active |
| **Steps** | 1. Load the page 2. Observe the Web Table card |
| **Test Data** | — |
| **Expected Result** | Table displays existing user rows (ID, Name, Email, Role) sourced from the database; no error message is shown |

### TC_WT_02 — Add a new user via "Add Row"

| | |
|---|---|
| **Preconditions** | Web Table loaded with existing rows |
| **Steps** | 1. Click **Add Row** 2. Observe the table |
| **Test Data** | — (row is system-generated) |
| **Expected Result** | A new row appears with a unique auto-generated ID, Name `New User {id}`, Email `newuser{id}@example.com`, Role `Guest` |

### TC_WT_03 — Edit an existing user's Name and Email

| | |
|---|---|
| **Preconditions** | Web Table loaded with at least one existing row |
| **Steps** | 1. Click **Edit** on a row 2. Update the Name field 3. Update the Email field to a new, unused address 4. Click **Save** |
| **Test Data** | Name: `Updated Name`; Email: `updated.name@example.com` |
| **Expected Result** | Row exits edit mode and displays the updated Name and Email; Role remains unchanged |

### TC_WT_04 — Edited user data persists after page reload

| | |
|---|---|
| **Preconditions** | TC_WT_03 completed (a row was edited and saved) |
| **Steps** | 1. Reload the page (F5) 2. Locate the previously edited row |
| **Test Data** | — |
| **Expected Result** | The row still shows the updated Name and Email from TC_WT_03, confirming the change was persisted to the database |

### TC_WT_05 — Newly added user persists and is independently editable

| | |
|---|---|
| **Preconditions** | TC_WT_02 completed (a new row was added) |
| **Steps** | 1. Reload the page 2. Click **Edit** on the row added in TC_WT_02 3. Change its Name 4. Click **Save** |
| **Test Data** | Name: `Second Update` |
| **Expected Result** | The added row survives the reload, enters edit mode correctly, and saves the new Name successfully |
