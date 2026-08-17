import { test, expect } from '../../fixtures/test-fixtures';

test.describe('login', () => {
  test('valid credentials show a success message', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('tomsmith', 'SuperSecretPassword!');

    await expect.poll(() => loginPage.getFlashMessage()).toContain('You logged into a secure area');
  });

  test('invalid credentials show an error message', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('tomsmith', 'wrong-password');

    await expect.poll(() => loginPage.getFlashMessage()).toContain('Your password is invalid');
  });
});
