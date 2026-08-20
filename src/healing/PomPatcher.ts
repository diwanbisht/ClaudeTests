import fs from 'fs/promises';

interface PatchInput {
  pomFilePath:  string;
  locatorName:  string;
  oldSelector:  string;
  newSelector:  string;
}

export class PomPatcher {
  static async patch(input: PatchInput): Promise<void> {
    const { pomFilePath, oldSelector, newSelector } = input;

    const source = await fs.readFile(pomFilePath, 'utf-8');

    if (!source.includes(oldSelector)) {
      console.warn(`[SelfHealing] Could not find "${oldSelector}" in ${pomFilePath}`);
      return;
    }

    // Replace the old selector string with the new one
    const patched = source.replaceAll(
      JSON.stringify(oldSelector),   // handles both ' and " quotes
      JSON.stringify(newSelector)
    );

    await fs.writeFile(pomFilePath, patched, 'utf-8');
    console.log(`[SelfHealing] ✅ Patched ${pomFilePath}: "${oldSelector}" → "${newSelector}"`);
  }
}