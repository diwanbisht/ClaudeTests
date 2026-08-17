import { RowDataPacket } from 'mysql2';
import { getPool } from '../connection';

export interface TestUser extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: string;
}

/** Fetches a seeded test user by role (e.g. 'standard', 'admin'). */
export async function getTestUserByRole(role: string): Promise<TestUser> {
  const [rows] = await getPool().query<TestUser[]>(
    'SELECT id, username, password, role FROM test_users WHERE role = ? LIMIT 1',
    [role],
  );
  if (rows.length === 0) {
    throw new Error(`No seeded test user found for role: ${role}`);
  }
  return rows[0];
}

export async function insertTestUser(user: {
  username: string;
  password: string;
  role: string;
}): Promise<number> {
  const [result] = await getPool().query(
    'INSERT INTO test_users (username, password, role) VALUES (?, ?, ?)',
    [user.username, user.password, user.role],
  );
  return (result as { insertId: number }).insertId;
}
