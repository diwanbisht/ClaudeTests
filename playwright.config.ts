import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src/tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,

  forbidOnly: !!process.env.CI,
  retries: Number(process.env.TEST_RETRIES ?? (process.env.CI ? 2 : 1)),
  workers: process.env.CI ? 2 : '50%',

  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  outputDir: 'test-results',

  reporter: [
    ['list'],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      detail: true,
    }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['./src/utils/allureAutoOpenReporter.ts'],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://the-internet.herokuapp.com',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
  },

  webServer: {
    command: 'node UI-Web-App/server.js',
    url: 'http://localhost:5500',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
