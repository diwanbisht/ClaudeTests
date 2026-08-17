import { getPool, closePool } from './connection';
import { logger } from '../utils/logger';

/** Truncates test data tables. Run after suites that write their own rows. */
async function cleanup(): Promise<void> {
  const pool = getPool();
  await pool.query('DELETE FROM test_users');
  logger.info('Cleanup complete: test_users cleared');
}

cleanup()
  .then(() => closePool())
  .catch((error) => {
    logger.error('Cleanup failed', { error: String(error) });
    process.exitCode = 1;
    return closePool();
  });
