import { test, expect } from '../../fixtures/test-fixtures';
import { config } from '@utils/config';

const API_BASE = `${config.uiWebAppUrl}/api/users`;

test.describe('Users API @api @regression', () => {
  // The UI-Web-App server assumes `app_users` already exists — make sure it
  // does before hitting the API, so this suite doesn't depend on run order
  // against the UI specs that exercise the same table via the Web Table page.
  test.beforeAll(async ({ db }) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL DEFAULT 'Guest'
      )
    `);
  });

  test('GET /api/users returns the user list @smoke', async ({ request }) => {
    const response = await request.get(API_BASE);

    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    if (users.length > 0) {
      expect(users[0]).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
        }),
      );
    }
  });

  test('POST /api/users creates a new user @smoke', async ({ request }) => {
    const response = await request.post(API_BASE);

    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: `New User ${created.id}`,
        email: `newuser${created.id}@example.com`,
        role: 'Guest',
      }),
    );
  });

  test('PUT /api/users/:id updates name and email', async ({ request }) => {
    const created = await (await request.post(API_BASE)).json();
    const updatedEmail = `updated.${Date.now()}@example.com`;

    const response = await request.put(`${API_BASE}/${created.id}`, {
      data: { name: 'Updated Via API', email: updatedEmail },
    });

    expect(response.status()).toBe(200);
    const updated = await response.json();
    expect(updated.name).toBe('Updated Via API');
    expect(updated.email).toBe(updatedEmail);
    expect(updated.role).toBe(created.role);
  });

  test('PUT /api/users/:id with a missing name/email returns 400', async ({ request }) => {
    const created = await (await request.post(API_BASE)).json();

    const response = await request.put(`${API_BASE}/${created.id}`, {
      data: { name: '', email: '' },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBeTruthy();
  });

  test('PUT /api/users/:id for a non-existent id returns 404', async ({ request }) => {
    const response = await request.put(`${API_BASE}/999999999`, {
      data: { name: 'Nobody', email: 'nobody@example.com' },
    });

    expect(response.status()).toBe(404);
  });

  test('DELETE /api/users/:id removes the user', async ({ request }) => {
    const created = await (await request.post(API_BASE)).json();

    const response = await request.delete(`${API_BASE}/${created.id}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ id: created.id, deleted: true });

    const getAfterDelete = await request.get(API_BASE);
    const users: { id: number }[] = await getAfterDelete.json();
    expect(users.find((u) => u.id === created.id)).toBeUndefined();
  });

  test('DELETE /api/users/:id for a non-existent id returns 404', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/999999999`);

    expect(response.status()).toBe(404);
  });

  test('PUT /api/users/:id with a duplicate email returns 409', async ({ request }) => {
    const first = await (await request.post(API_BASE)).json();
    const second = await (await request.post(API_BASE)).json();

    const response = await request.put(`${API_BASE}/${second.id}`, {
      data: { name: second.name, email: first.email },
    });

    expect(response.status()).toBe(409);
  });
});
