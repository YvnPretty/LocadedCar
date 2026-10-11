import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('admin credentials, throttling, session expiration, forgery and logout', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'locaded-auth-'));
  writeFileSync(join(directory, 'test.db'), '');
  process.env.DATABASE_URL = `file:${join(directory, 'test.db')}`;
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], { env: process.env, stdio: 'pipe' });
  const { prisma } = await import('../src/lib/prisma.ts');
  const { hashPassword, verifyPassword } = await import('../src/lib/admin/password.ts');
  const { loginAdmin, findAdminSession, revokeAdminSession, isSameOrigin } = await import('../src/lib/admin/session.ts');
  try {
    const password = 'Only-a-test-password-902!';
    const hash = await hashPassword(password);
    assert.notEqual(hash, password);
    assert.equal(await verifyPassword(password, hash), true);
    assert.equal(await verifyPassword('wrong', hash), false);
    await prisma.adminAccount.create({ data: { username: 'test-admin', passwordHash: hash } });
    assert.equal((await loginAdmin('employee', password)).status, 401);
    assert.equal((await loginAdmin('test-admin', 'wrong')).status, 401);
    const login = await loginAdmin('test-admin', password);
    assert.equal(login.status, 200);
    assert.equal((await findAdminSession(login.token)).username, 'test-admin');
    assert.equal(await findAdminSession('admin'), null);
    assert.equal(await findAdminSession('a'.repeat(64)), null);
    assert.equal((await prisma.adminSession.findFirst()).tokenHash.includes(login.token), false);
    await revokeAdminSession(login.token);
    assert.equal(await findAdminSession(login.token), null);
    const second = await loginAdmin('test-admin', password);
    await prisma.adminSession.updateMany({ data: { expiresAt: new Date(0) } });
    assert.equal(await findAdminSession(second.token), null);
    for (let i = 0; i < 5; i++) assert.equal((await loginAdmin('test-admin', 'wrong')).status, 401);
    assert.equal((await loginAdmin('test-admin', password)).status, 429);
    assert.equal((await loginAdmin('different-user', password)).status, 429);
    await prisma.adminLoginLimit.updateMany({ data: { resetsAt: new Date(0) } });
    assert.equal((await loginAdmin('test-admin', password)).status, 200);
    assert.equal(isSameOrigin(new Request('https://cars.test/api/admin/session', { headers: { origin: 'https://evil.test' } })), false);
    assert.equal(isSameOrigin(new Request('https://cars.test/api/admin/session')), false);
    assert.equal(isSameOrigin(new Request('https://cars.test/api/admin/session', { headers: { origin: 'https://cars.test' } })), true);
    // Restore the private initial account on an empty Railway database.
    const oldUser = process.env.ADMIN_USERNAME;
    const oldHash = process.env.ADMIN_PASSWORD_HASH;
    try {
      process.env.ADMIN_USERNAME = 'bootstrap-admin';
      process.env.ADMIN_PASSWORD_HASH = hash;
      assert.equal((await loginAdmin('bootstrap-admin', password)).status, 200);
      // Configuration must never overwrite an existing account's password.
      process.env.ADMIN_PASSWORD_HASH = await hashPassword('different-password');
      assert.equal((await loginAdmin('bootstrap-admin', password)).status, 200);
    } finally {
      if (oldUser === undefined) delete process.env.ADMIN_USERNAME;
      else process.env.ADMIN_USERNAME = oldUser;
      if (oldHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
      else process.env.ADMIN_PASSWORD_HASH = oldHash;
    }

  } finally { await prisma.$disconnect(); rmSync(directory, { recursive: true, force: true }); }
});
