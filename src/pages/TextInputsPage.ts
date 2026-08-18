import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../utils/config';

/**
 * Page Object for the "Text Inputs" card on UI-Web-App's Elements tab
 * (http://localhost:5500 by default): Name/Email/Message fields plus
 * Validate/Clear buttons.
 */
export class TextInputsPage extends BasePage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly messageInput: Locator;
  private readonly validateButton: Locator;
  private readonly clearButton: Locator;
  private readonly liveTypedText: Locator;
  private readonly validationMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByTestId('input-name');
    this.emailInput = page.getByTestId('input-email');
    this.messageInput = page.getByTestId('textarea-message');
    this.validateButton = page.getByTestId('btn-validate-inputs');
    this.clearButton = page.getByTestId('btn-clear-inputs');
    this.liveTypedText = page.getByTestId('input-name-live-output');
    this.validationMessage = page.getByTestId('input-validation-message');
  }

  async open(): Promise<void> {
    await this.goto(config.uiWebAppUrl);
    await this.waitForLoad();
  }

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
  }

  async clickValidate(): Promise<void> {
    await this.validateButton.click();
  }

  async clickClear(): Promise<void> {
    await this.clearButton.click();
  }

  async getLiveTypedText(): Promise<string> {
    return (await this.liveTypedText.textContent())?.trim() ?? '';
  }

  async getValidationMessage(): Promise<string> {
    return (await this.validationMessage.textContent())?.trim() ?? '';
  }
}
