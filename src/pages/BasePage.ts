import { Page } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Base class for all Page Objects. Holds the Playwright `page` handle and
 * common navigation/wait helpers shared across pages.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = '/'): Promise<void> {
    logger.info(`Navigating to ${path}`);
    await this.page.goto(path);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  get title(): Promise<string> {
    return this.page.title();
  }
}
