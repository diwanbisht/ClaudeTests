import { Page , expect} from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {

  protected getPOMFilePath(): string {
    return 'src/pages/LoginPage.ts';
  }

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {

    const usernameInput = await this.getLocator( 'usernameInput','#usernameTest');
    const passwordInput = await this.getLocator('passwordInput','#passwordiudfdfuoiuodf');
    const submitButton = await this.getLocator('submitButton','button[type="submit"]');
    await usernameInput.fill(username);
    await passwordInput.fill(password);
    await submitButton.click();
  }

  async getFlashMessage(): Promise<string> {
    const flashMessage = await this.getLocator('flashMessage','#flash');
    return (await flashMessage.textContent())?.trim() ?? '';
  }
  
  async enterUsername(username: string, email: string): Promise<void> {
  await this.page.getByTestId('input-name').click();
  await this.page.getByTestId('input-name').fill(username);
  await this.page.getByTestId('input-name').press('Tab');
  await this.page.getByTestId('input-email').fill(email);
  await this.page.getByTestId('input-email').press('Tab');
  await this.page.getByTestId('textarea-message').fill('Testing');
  await this.page.getByTestId('btn-validate-inputs').click();
  await this.page.getByTestId('input-validation-message').click();
  await expect(this.page.getByTestId('input-validation-message')).toBeVisible();

}

}


