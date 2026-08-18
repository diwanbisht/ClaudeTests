import { test as base } from '@playwright/test';
import { Pool } from 'mysql2/promise';
import { LoginPage } from '../pages/LoginPage';
import { WebTablePage } from '../pages/WebTablePage';
import { TextInputsPage } from '../pages/TextInputsPage';
import { getPool } from '../db/connection';
import { logger } from '../utils/logger';

type Fixtures = {
  loginPage: LoginPage;
  webTablePage: WebTablePage;
  textInputsPage: TextInputsPage;
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
  db: async ({}, use) => {
    await use(getPool());
  },
});

test.beforeEach(async ({}, testInfo) => {
  logger.info(`Starting test: ${testInfo.title}`);
});

test.afterEach(async ({}, testInfo) => {
  logger.info(`Finished test: ${testInfo.title} (${testInfo.status})`);
});

export { expect } from '@playwright/test';
