import { Page, Locator } from '@playwright/test';
import { healWithClaude } from './claudeHealer';
import { HealingReporter } from './HealingReporter';
import { PomPatcher } from './PomPatcher';

export interface HealingResult {
  healed: boolean;
  newSelector?: string;
  confidence?: number;
}

export async function healLocator(
  page: Page,
  locatorName: string,
  originalSelector: string,
  pomFilePath: string
): Promise<Locator | null> {

  const pageUrl = page.url();
  const pageSource = await page.content();

  let result: HealingResult | null = null;

  // -------------------------------
  // 🔹 Step 1: Call Claude safely
  // -------------------------------
  try {
    result = await healWithClaude({
      locatorName,
      originalSelector,
      pageSource,
      pageUrl,
    });
  } catch (error) {
    console.error('❌ Claude healing failed:', error);
  }

  // -------------------------------
  // 🔹 Step 2: Always log result
  // -------------------------------
  await HealingReporter.log({
    locatorName,
    pomFile: pomFilePath,
    oldSelector: originalSelector,
    newSelector: result?.newSelector,
    confidence: result?.confidence,
    healed: result?.healed ?? false,
    pageUrl,
    timestamp: new Date().toISOString(),
  });

  // -------------------------------
  // 🔹 Step 3: Validate result
  // -------------------------------
  if (!result?.healed || !result.newSelector) {
    console.warn(`⚠️ Healing failed for: ${locatorName}`);

    // 🔥 Fallback strategy (optional but recommended)
    const fallbackSelector = `[data-testid*="${locatorName}"]`;
    console.warn(`🔁 Trying fallback selector: ${fallbackSelector}`);

    const fallbackLocator = page.locator(fallbackSelector);

    try {
      await fallbackLocator.first().waitFor({ state: 'attached', timeout: 2000 });
      return fallbackLocator;
    } catch {
      console.error(`❌ Fallback also failed for: ${locatorName}`);
      return null;
    }
  }

  // -------------------------------
  // 🔹 Step 4: Confidence check
  // -------------------------------
  if (result.confidence && result.confidence < 0.7) {
    console.warn(`⚠️ Low confidence (${result.confidence}) for ${locatorName}`);
    return null;
  }

  // -------------------------------
  // 🔹 Step 5: Patch POM file
  // -------------------------------
  try {
    await PomPatcher.patch({
      pomFilePath,
      locatorName,
      oldSelector: originalSelector,
      newSelector: result.newSelector,
    });
  } catch (error) {
    console.error('⚠️ Failed to patch POM:', error);
  }

  // -------------------------------
  // 🔹 Step 6: Validate healed locator
  // -------------------------------
  const healedLocator = page.locator(result.newSelector);

  try {
    await healedLocator.first().waitFor({ state: 'attached', timeout: 3000 });
    console.log(`✅ Locator healed successfully: ${locatorName}`);
    return healedLocator;
  } catch {
    console.error(`❌ Healed locator not found in DOM: ${locatorName}`);
    return null;
  }
}