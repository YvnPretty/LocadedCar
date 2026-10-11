import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../prisma';
import { verifyPassword } from './password';
export const ADMIN_COOKIE = 'locaded_admin';
export const SESSION_SECONDS = 30 * 60;
const hashToken = (value: string) => createHash('sha256').update(value).digest('hex');
const dummyHash = `scrypt-v1$${'0'.repeat(32)}$${'0'.repeat(128)}`;
export async function findAdminSession(token?: string) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await prisma.adminSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { account: { select: { username: true } } } });
  return session && session.expiresAt.getTime() > Date.now() ? { username: session.account.username, expiresAt: session.expiresAt } : null;
}
export async function revokeAdminSession(token?: string) {
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}
/** One persistent limit for this single-admin entrance; cannot be bypassed with fake IP headers or usernames. */
export async function loginAdmin(username: string, password: string, previousToken?: string) {
  const now = new Date();
  const limit = await prisma.$transaction(async tx => {
    await tx.adminLoginLimit.deleteMany({ where: { key: 'admin-login', resetsAt: { lte: now } } });
    return tx.adminLoginLimit.upsert({ where: { key: 'admin-login' },
      create: { key: 'admin-login', attempts: 1, resetsAt: new Date(now.getTime() + 15 * 60_000) },
      update: { attempts: { increment: 1 } },
    });
  });
  if (limit.attempts > 5) return { status: 429 as const, error: 'Demasiados intentos. Intenta nuevamente en 15 minutos.' };
  // Railway can recreate its SQLite file on redeploy. Keep the initial admin hash
  // in private service variables, never in the repository or browser bundle.
  const bootstrapUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const bootstrapHash = process.env.ADMIN_PASSWORD_HASH;
  if (bootstrapUsername && /^[a-z0-9._-]{3,64}$/.test(bootstrapUsername) && bootstrapHash && /^scrypt-v1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(bootstrapHash)) {
    await prisma.adminAccount.upsert({ where: { username: bootstrapUsername }, update: {}, create: { username: bootstrapUsername, passwordHash: bootstrapHash } });
  }
  const account = await prisma.adminAccount.findUnique({ where: { username: username.trim().toLowerCase() } });
  const valid = await verifyPassword(password, account?.passwordHash ?? dummyHash);
  if (!valid || !account) return { status: 401 as const, error: 'Usuario o contraseña incorrectos.' };
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000);
  await prisma.$transaction(async tx => {
    await tx.adminLoginLimit.deleteMany({ where: { key: 'admin-login' } });
    await tx.adminSession.deleteMany({ where: { OR: [{ expiresAt: { lte: now } }, ...(previousToken ? [{ tokenHash: hashToken(previousToken) }] : [])] } });
    await tx.adminSession.create({ data: { tokenHash: hashToken(token), accountId: account.id, expiresAt } });
  });
  return { status: 200 as const, token, expiresAt };
}
export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  // Railway terminates HTTPS before forwarding to Next over HTTP. Use the
  // service's trusted public domain, never a caller-supplied forwarded host.
  const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (publicDomain) return origin === `https://${publicDomain}`;
  const expected = new URL(request.url);
  // Preserve local development via localhost or 127.0.0.1, including the port.
  const host = request.headers.get('host');
  if (host) expected.host = host;
  return origin === expected.origin;
}
