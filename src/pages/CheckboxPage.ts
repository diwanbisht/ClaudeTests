import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { config } from '../utils/config';

export class CheckboxPage extends BasePage {
  protected getPOMFilePath(): string {
    return 'src/pages/CheckboxPage.ts';
  }

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto(config.uiWebAppUrl);
    await this.waitForLoad();
  }

  async checkInterest(option: string): Promise<void> {
    const checkbox = await this.getLocator(
      `interestCheckbox-${option}`,
      `[data-testid="checkbox-interest-${option.toLowerCase()}"]`,
    );
    await checkbox.check();
  }

  async isCheckboxChecked(option: string): Promise<boolean> {
    const checkbox = await this.getLocator(
      `interestCheckbox-${option}`,
      `[data-testid="checkbox-interest-${option.toLowerCase()}"]`,
    );
    return checkbox.isChecked();
  }

  async selectRadioButton(option: string): Promise<void> {
    const radio = await this.getLocator(
      `radioButton-${option}`,
      `[data-testid="radio-${option.toLowerCase()}"]`,
    );
    await radio.check();
  }
}
