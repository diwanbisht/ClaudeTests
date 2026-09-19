//import { test, expect } from '@playwright/test';
//import { LoginPage } from '../../pages/loginPage';
import { LoginPage } from '@pages/LoginPage';
import { test, expect } from '../../fixtures/test-fixtures';
import { config } from '@utils/config';
import { readLoginTestData } from '@utils/excelReader';

const excelLoginRows = readLoginTestData();

test.describe('User Information Test without self healling', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('@smoke @regression @login test-without SelfHealing', async ({ page }) => {
    const loginPage = new LoginPage(page);
    //await loginPage.open();
    await page.goto('http://localhost:5500/');
    await loginPage.enterUsername('John Doe', 'john.doe@gmail.com');
  });

  excelLoginRows.forEach((row, index) => {
    test(`@regression Login with excel Test Data - row ${index + 1} (${row.name})`, async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      await page.goto(config.uiWebAppUrl);
      await loginPage.enterUsername(row.name, row.email, row.message);
    });
  });
});
