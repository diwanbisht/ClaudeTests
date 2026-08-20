import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../utils/config';

/**
 * Page Object for the "Text Inputs" card on UI-Web-App's Elements tab
 * (http://localhost:5500 by default): Name/Email/Message fields plus
 * Validate/Clear buttons.
 */
export class TextInputsPage extends BasePage {
  protected getPOMFilePath(): string {
    return 'src/pages/TextInputsPage.ts';
  }

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto(config.uiWebAppUrl);
    await this.waitForLoad();
  }

  async fillName(name: string): Promise<void> {
    const nameInput = await this.getLocator('nameInput', '[data-testid="input-name"]');
    await nameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    const emailInput = await this.getLocator('emailInput', '[data-testid="input-email"]');
    await emailInput.fill(email);
  }

  async fillMessage(message: string): Promise<void> {
    const messageInput = await this.getLocator('messageInput', '[data-testid="textarea-message"]');
    await messageInput.fill(message);
  }

  async clickValidate(): Promise<void> {
    const validateButton = await this.getLocator(
      'validateButton',
      '[data-testid="btn-validate-inputs"]',
    );
    await validateButton.click();
  }

  async clickClear(): Promise<void> {
    const clearButton = await this.getLocator('clearButton', '[data-testid="btn-clear-inputs"]');
    await clearButton.click();
  }

  async getLiveTypedText(): Promise<string> {
    const liveTypedText = await this.getLocator(
      'liveTypedText',
      '[data-testid="input-name-live-output"]',
    );
    return (await liveTypedText.textContent())?.trim() ?? '';
  }

  async getValidationMessage(): Promise<string> {
    const validationMessage = await this.getLocator(
      'validationMessage',
      '[data-testid="input-validation-message"]',
    );
    return (await validationMessage.textContent())?.trim() ?? '';
  }
}
