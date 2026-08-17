import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Example Page Object targeting the public "the-internet.herokuapp.com/login"
 * practice site. Replace with real application locators; keep the same
 * shape (goto/act/assert-ready getters) so generated tests stay consistent.
 */
export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly flashMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash');
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getFlashMessage(): Promise<string> {
    return (await this.flashMessage.textContent())?.trim() ?? '';
  }
}
