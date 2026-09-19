//import { test, expect } from '@playwright/test';
//import { CheckboxPage } from '../../pages/CheckboxPage';
import { CheckboxPage } from '@pages/CheckboxPage';
import { test, expect } from '../../fixtures/test-fixtures';
import { allure } from 'allure-playwright';

test.describe('Checkboxes Test Validation', () => {
  test.beforeEach(async ({ checkboxPage }) => {
    await checkboxPage.open();
  });

  test('@smoke @regression Validate Checkbox functionality ', async ({ page }) => {
    const checkboxPage = new CheckboxPage(page);
    await checkboxPage.open();

    const isBananaChecked = await checkboxPage.isCheckboxChecked('banana');
    if (!isBananaChecked) {
      await checkboxPage.checkInterest('banana');
    }
    if (!(await checkboxPage.isCheckboxChecked('apple'))) {
      await checkboxPage.checkInterest('apple');
    }
    await expect(page.getByTestId('checkbox-selected-output')).toContainText(
      'Terms accepted: No | Newsletter: Yes | Interests: Apple, Banana',
    );
  });

  [
    { input: 'male', expected: 'Male' },
    { input: 'female', expected: 'Female' },
    { input: 'other', expected: 'Other' },
  ].forEach(({ input, expected }) => {
    test(`@regression Validate Radio button functionality for ${input}`, async ({ page }) => {
      const checkboxPage = new CheckboxPage(page);

      await checkboxPage.open();

      await checkboxPage.selectRadioButton(input);

      await expect(page.getByTestId('radio-selected-output')).toContainText(
        `Selected: ${expected}`,
      );
      await allure.step('Capture radio output', async () => {
        allure.attachment('Radio Output', input || 'Empty', 'text/plain');
      });
    });
  });
});
