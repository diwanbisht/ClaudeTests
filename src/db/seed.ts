import { getPool, closePool } from './connection';
import { logger } from '../utils/logger';

/** Creates the test_users table (if missing) and seeds baseline fixtures. */
async function seed(): Promise<void> {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS test_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      password VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL
    )
  `);

  await pool.query('DELETE FROM test_users');
  await pool.query(
    'INSERT INTO test_users (username, password, role) VALUES ?',
    [[
      ['tomsmith', 'SuperSecretPassword!', 'standard'],
      ['admin_user', 'AdminSecretPassword!', 'admin'],
    ]],
  );

  logger.info('Seed complete: test_users populated');
}

seed()
  .then(() => closePool())
  .catch((error) => {
    logger.error('Seed failed', { error: String(error) });
    process.exitCode = 1;
    return closePool();
  });
