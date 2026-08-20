import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../utils/config';

export interface WebTableRow {
  id: number;
  name: string;
  email: string;
  role: string;
}

/**
 * Page Object for the "Web Table" card on UI-Web-App's Elements tab
 * (http://localhost:5500 by default). Rows are backed by the real
 * `app_users` MySQL table via /api/users, so ids are server-assigned.
 */
export class WebTablePage extends BasePage {
  protected getPOMFilePath(): string {
    return 'src/pages/WebTablePage.ts';
  }

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto(config.uiWebAppUrl);
    await this.waitForLoad();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoad();
  }

  async getRowIds(): Promise<number[]> {
    const tableBody = await this.getLocator('tableBody', '[data-testid="data-table-body"]');
    const testIds = await tableBody
      .locator('tr')
      .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-testid') ?? ''));
    return testIds
      .filter((testId) => testId.startsWith('table-row-'))
      .map((testId) => Number(testId.replace('table-row-', '')));
  }

  async getRowCount(): Promise<number> {
    const tableBody = await this.getLocator('tableBody', '[data-testid="data-table-body"]');
    return tableBody.locator('tr').count();
  }

  async getRow(id: number): Promise<WebTableRow> {
    const nameCell = await this.getLocator(`nameCell-${id}`, `#table-row-${id}-name`);
    const emailCell = await this.getLocator(`emailCell-${id}`, `#table-row-${id}-email`);
    const roleCell = await this.getLocator(`roleCell-${id}`, `#table-row-${id}-role`);
    const name = await nameCell.textContent();
    const email = await emailCell.textContent();
    const role = await roleCell.textContent();
    return {
      id,
      name: name?.trim() ?? '',
      email: email?.trim() ?? '',
      role: role?.trim() ?? '',
    };
  }

  /** Clicks "Add Row" and returns the server-assigned id of the newly created row. */
  async addRow(): Promise<number> {
    const before = await this.getRowIds();
    const addRowButton = await this.getLocator('addRowButton', '[data-testid="btn-add-row"]');
    await addRowButton.click();
    await expect.poll(() => this.getRowCount()).toBeGreaterThan(before.length);
    const after = await this.getRowIds();
    const newId = after.find((id) => !before.includes(id));
    if (newId === undefined) {
      throw new Error('Add Row did not produce a new row');
    }
    return newId;
  }

  /** Edits a row's Name/Email inline and saves. Role is read-only in the UI, so it's never touched. */
  async editRow(id: number, updates: { name?: string; email?: string }): Promise<void> {
    const editButton = await this.getLocator(`editButton-${id}`, `[data-testid="btn-edit-${id}"]`);
    await editButton.click();

    if (updates.name !== undefined) {
      const nameInput = await this.getLocator(
        `nameInput-${id}`,
        `[data-testid="table-row-${id}-name-input"]`,
      );
      await nameInput.fill(updates.name);
    }
    if (updates.email !== undefined) {
      const emailInput = await this.getLocator(
        `emailInput-${id}`,
        `[data-testid="table-row-${id}-email-input"]`,
      );
      await emailInput.fill(updates.email);
    }

    const saveButton = await this.getLocator(`saveButton-${id}`, `[data-testid="btn-save-${id}"]`);
    await saveButton.click();

    const editButtonAfterSave = await this.getLocator(
      `editButton-${id}`,
      `[data-testid="btn-edit-${id}"]`,
    );
    await editButtonAfterSave.waitFor();
  }

  async isErrorVisible(): Promise<boolean> {
    const errorMessage = await this.getLocator(
      'errorMessage',
      '[data-testid="table-error-message"]',
    );
    return errorMessage.isVisible();
  }
}
