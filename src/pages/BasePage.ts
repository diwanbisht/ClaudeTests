
import { Page, Locator } from '@playwright/test';
import { logger } from '../utils/logger';
import { healLocator } from '../healing/SelfHealingLocator';

/**
 * Base class for all Page Objects.
 * Provides navigation, wait utilities, and self-healing locator support.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  // -------------------------
  // 🌐 Navigation Helpers
  // -------------------------
  async goto(url: string): Promise<void> {
    logger.info(`🌐 Navigating to: ${url}`);
    await this.page.goto(url);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  // -------------------------
  // 🔥 SELF-HEALING LOCATOR
  // -------------------------
  async getLocator(name: string, selector: string): Promise<Locator> {
    const locator = this.page.locator(selector);

    try {
      // Try original locator
      await locator.first().waitFor({ state: 'attached', timeout: 2000 });
      return locator;
    } catch {
      logger.warn(`❌ Locator failed: ${name} | Selector: ${selector}`);

      // 🔥 Call AI self-healing
      const healedLocator = await healLocator(
        this.page,name,selector,this.getPOMFilePath());
     
      // ❌ If healing fails → throw error
      if (!healedLocator) {
        logger.error(`❌ Unable to heal locator: ${name}`);
        throw new Error(`Locator not found and healing failed: ${name}`);
      }

      logger.info(`✅ Locator healed successfully: ${name}`);

      return healedLocator;
    }
  }

  // -------------------------
  // 📂 POM File Path (Override in child class)
  // -------------------------
  protected getPOMFilePath(): string {
    /**
     * Each Page Object should override this method.
     * Example:
     * return 'src/pages/LoginPage.ts';
     */
    return 'src/pages/UnknownPage.ts';
  }
}