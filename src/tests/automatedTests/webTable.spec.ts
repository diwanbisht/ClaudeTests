import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Web Table', () => {
  test.beforeEach(async ({ webTablePage }) => {
    await webTablePage.open();
  });

  test('@smoke @sanity @regression TC_WT_01 - loads existing users on page load', async ({
    webTablePage,
  }) => {
    expect(await webTablePage.getRowCount()).toBeGreaterThan(0);
    expect(await webTablePage.isErrorVisible()).toBe(false);
  });

  test('@smoke @regression TC_WT_02 - add a new user via Add Row', async ({ webTablePage }) => {
    const newId = await webTablePage.addRow();
    const row = await webTablePage.getRow(newId);

    expect(row.name).toBe(`New User ${newId}`);
    expect(row.email).toBe(`newuser${newId}@example.com`);
    expect(row.role).toBe('Guest');
  });

  test("@regression TC_WT_03 - edit an existing user's Name and Email", async ({
    webTablePage,
  }) => {
    const id = await webTablePage.addRow();
    const original = await webTablePage.getRow(id);
    const updatedEmail = `updated.${Date.now()}@example.com`;

    await webTablePage.editRow(id, { name: 'Updated Name', email: updatedEmail });
    const updated = await webTablePage.getRow(id);

    expect(updated.name).toBe('Updated Name');
    expect(updated.email).toBe(updatedEmail);
    expect(updated.role).toBe(original.role);
  });

  test('@regression TC_WT_04 - edited user data persists after page reload', async ({
    webTablePage,
  }) => {
    const id = await webTablePage.addRow();
    const updatedEmail = `updated.${Date.now()}@example.com`;

    await webTablePage.editRow(id, { name: 'Updated Name', email: updatedEmail });
    await webTablePage.reload();
    const row = await webTablePage.getRow(id);

    expect(row.name).toBe('Updated Name');
    expect(row.email).toBe(updatedEmail);
  });

  test('@regression TC_WT_05 - newly added user persists and is independently editable', async ({
    webTablePage,
  }) => {
    const newId = await webTablePage.addRow();
    await webTablePage.reload();

    await webTablePage.editRow(newId, { name: 'Second Update' });
    const row = await webTablePage.getRow(newId);

    expect(row.name).toBe('Second Update');
  });
});
