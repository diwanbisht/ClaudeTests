import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Text Inputs', () => {
  test.beforeEach(async ({ textInputsPage }) => {
    await textInputsPage.open();
  });

  test('@regression TC_TI_01 - Validate with all fields empty shows required-field errors', async ({
    textInputsPage,
  }) => {
    await textInputsPage.clickValidate();

    expect(await textInputsPage.getValidationMessage()).toBe(
      'Name is required. A valid email is required.',
    );
  });

  test('@regression TC_TI_02 - Validate with valid Name but invalid Email format', async ({
    textInputsPage,
  }) => {
    await textInputsPage.fillName('John Doe');
    await textInputsPage.fillEmail('not-an-email');
    await textInputsPage.clickValidate();

    expect(await textInputsPage.getValidationMessage()).toBe('A valid email is required.');
    expect(await textInputsPage.getLiveTypedText()).toBe('You typed: John Doe');
  });

  test('@smoke @regression TC_TI_03 - Validate with valid Name and valid Email succeeds', async ({
    textInputsPage,
  }) => {
    await textInputsPage.fillName('John Doe');
    await textInputsPage.fillEmail('john.doe@example.com');
    await textInputsPage.fillMessage('Hello world');
    await textInputsPage.clickValidate();

    expect(await textInputsPage.getValidationMessage()).toBe('All fields are valid!');
  });

  test('@regression TC_TI_04 - Clear resets all Text Input fields and messages', async ({
    textInputsPage,
  }) => {
    await textInputsPage.fillName('John Doe');
    await textInputsPage.fillEmail('john.doe@example.com');
    await textInputsPage.fillMessage('Hello world');
    await textInputsPage.clickValidate();

    await textInputsPage.clickClear();

    expect(await textInputsPage.getLiveTypedText()).toBe('You typed: (nothing yet)');
    expect(await textInputsPage.getValidationMessage()).toBe('');
  });
});
