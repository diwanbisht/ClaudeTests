import { expect, Locator, Page } from '@playwright/test';
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
  private readonly addRowButton: Locator;
  private readonly tableBody: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.addRowButton = page.getByTestId('btn-add-row');
    this.tableBody = page.getByTestId('data-table-body');
    this.errorMessage = page.getByTestId('table-error-message');
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
    const testIds = await this.tableBody.locator('tr').evaluateAll((rows) =>
      rows.map((row) => row.getAttribute('data-testid') ?? ''),
    );
    return testIds
      .filter((testId) => testId.startsWith('table-row-'))
      .map((testId) => Number(testId.replace('table-row-', '')));
  }

  async getRowCount(): Promise<number> {
    return this.tableBody.locator('tr').count();
  }

  async getRow(id: number): Promise<WebTableRow> {
    const name = await this.page.locator(`#table-row-${id}-name`).textContent();
    const email = await this.page.locator(`#table-row-${id}-email`).textContent();
    const role = await this.page.locator(`#table-row-${id}-role`).textContent();
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
    await this.addRowButton.click();
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
    await this.page.getByTestId(`btn-edit-${id}`).click();
    if (updates.name !== undefined) {
      await this.page.getByTestId(`table-row-${id}-name-input`).fill(updates.name);
    }
    if (updates.email !== undefined) {
      await this.page.getByTestId(`table-row-${id}-email-input`).fill(updates.email);
    }
    await this.page.getByTestId(`btn-save-${id}`).click();
    await this.page.getByTestId(`btn-edit-${id}`).waitFor();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }
}
