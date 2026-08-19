//import { test, expect } from '@playwright/test';
//import { LoginPage } from '../../pages/loginPage';
import { LoginPage } from '@pages/LoginPage';
import { test, expect } from '../../fixtures/test-fixtures';

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
});
