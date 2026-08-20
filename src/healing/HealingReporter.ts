import fs   from 'fs/promises';
import path from 'path';

const FLAKY_FILE = path.resolve('flaky.json');

export interface HealingEntry {
  locatorName: string;
  pomFile:     string;
  oldSelector: string;
  newSelector: string | undefined;
  confidence:  number | undefined;
  healed:      boolean;
  pageUrl:     string;
  timestamp:   string;
}

export class HealingReporter {
  static async log(entry: HealingEntry): Promise<void> {
    let existing: HealingEntry[] = [];

    try {
      const raw = await fs.readFile(FLAKY_FILE, 'utf-8');
      existing  = JSON.parse(raw);
    } catch {
      // file doesn't exist yet — start fresh
    }

    // Update if same locator already logged, else append
    const idx = existing.findIndex(
      e => e.locatorName === entry.locatorName && e.pomFile === entry.pomFile
    );

    if (idx >= 0) existing[idx] = entry;
    else existing.push(entry);

    await fs.writeFile(FLAKY_FILE, JSON.stringify(existing, null, 2));
  }
}