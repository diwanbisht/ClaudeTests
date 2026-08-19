import { test as base } from '@playwright/test';
import { allure } from 'allure-playwright';
import fs from 'fs';
import { Pool } from 'mysql2/promise';
import { LoginPage } from '../pages/LoginPage';
import { WebTablePage } from '../pages/WebTablePage';
import { TextInputsPage } from '../pages/TextInputsPage';
import { getPool } from '../db/connection';
import { logger } from '../utils/logger';
import { CheckboxPage } from '@pages/CheckboxPage';

type Fixtures = {
  loginPage: LoginPage;
  webTablePage: WebTablePage;
  textInputsPage: TextInputsPage;
  checkboxPage: CheckboxPage;
  db: Pool;
};

/**
 * Extend Playwright's base test with page objects and any other
 * per-test wiring (logging, DB helpers, etc.). Import `test`/`expect`
 * from this module in specs instead of '@playwright/test'. Fixtures are
 * created lazily, so a spec that never requests `db` never opens a
 * MySQL connection.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  webTablePage: async ({ page }, use) => {
    await use(new WebTablePage(page));
  },
  textInputsPage: async ({ page }, use) => {
    await use(new TextInputsPage(page));
  },
  checkboxPage: async ({ page }, use) => {
    await use(new CheckboxPage(page));
  },
  db: async ({}, use) => {
    await use(getPool());
  },
});

test.beforeEach(async ({}, testInfo) => {
  logger.info(`Starting test: ${testInfo.title}`);
});

test.afterEach(async ({ page }, testInfo) => {
  logger.info(`Finished test: ${testInfo.title} (${testInfo.status})`);

  // 👉 Attach video ONLY on failure
  if (testInfo.status !== testInfo.expectedStatus) {

    const video = testInfo.attachments.find(a => a.name === 'video');

    if (video?.path && fs.existsSync(video.path)) {
      const videoBuffer = fs.readFileSync(video.path);

      allure.attachment(
        'Failure Video',videoBuffer,'video/webm');
        
      // Optional (very useful 🔥)
      allure.attachment(
        'Video Path',
        video.path,
        'text/plain'
      );
    }
  }
});

export { expect } from '@playwright/test';
