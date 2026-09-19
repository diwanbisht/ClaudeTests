import fs from 'fs';
import path from 'path';

export type AllureStatus = 'passed' | 'failed' | 'broken' | 'skipped' | 'unknown';

export interface AllureResultSummary {
  name: string;
  fullName?: string;
  status: AllureStatus;
  durationMs: number;
  message?: string;
}

export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  broken: number;
  skipped: number;
  passRatePct: number;
  totalDurationMs: number;
  failedTests: AllureResultSummary[];
}

const RESULTS_DIR = path.resolve('allure-results');

/** Reads every `*-result.json` written by allure-playwright for the last run. */
export function readAllureResults(resultsDir: string = RESULTS_DIR): AllureResultSummary[] {
  if (!fs.existsSync(resultsDir)) return [];

  return fs
    .readdirSync(resultsDir)
    .filter((f) => f.endsWith('-result.json'))
    .map((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf-8'));
      return {
        name: raw.name ?? file,
        fullName: raw.fullName,
        status: (raw.status ?? 'unknown') as AllureStatus,
        durationMs: (raw.stop ?? 0) - (raw.start ?? 0),
        message: raw.statusDetails?.message,
      };
    });
}

/** Aggregates a raw result list into pass/fail counts and duration totals. */
export function summarizeRun(results: AllureResultSummary[]): RunSummary {
  const total = results.length;
  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const broken = results.filter((r) => r.status === 'broken').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return {
    total,
    passed,
    failed,
    broken,
    skipped,
    passRatePct: total > 0 ? Math.round((passed / total) * 1000) / 10 : 0,
    totalDurationMs: results.reduce((sum, r) => sum + r.durationMs, 0),
    failedTests: results.filter((r) => r.status === 'failed' || r.status === 'broken'),
  };
}
