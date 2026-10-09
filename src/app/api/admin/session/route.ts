import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, findAdminSession, isSameOrigin, loginAdmin, revokeAdminSession, SESSION_SECONDS } from '@/lib/admin/session';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };
export async function GET(request: NextRequest) {
  const session = await findAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  return NextResponse.json(session ? { authenticated: true, expiresAt: session.expiresAt } : { authenticated: false }, { status: session ? 200 : 401, headers });
}
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403, headers });
  try {
    const raw = await request.text();
    if (raw.length > 2048) return NextResponse.json({ error: 'Datos de acceso inválidos.' }, { status: 400, headers });
    const body = JSON.parse(raw);
    if (!body || typeof body.username !== 'string' || typeof body.password !== 'string' || !body.username.trim() || body.username.length > 100 || !body.password || body.password.length > 256) {
      return NextResponse.json({ error: 'Escribe tu usuario y contraseña.' }, { status: 400, headers });
    }
    const result = await loginAdmin(body.username, body.password, request.cookies.get(ADMIN_COOKIE)?.value);
    if (result.status !== 200) return NextResponse.json({ error: result.error }, { status: result.status, headers: { ...headers, ...(result.status === 429 ? { 'Retry-After': '900' } : {}) } });
    const response = NextResponse.json({ authenticated: true, expiresAt: result.expiresAt }, { headers });
    response.cookies.set(ADMIN_COOKIE, result.token, { ...cookieOptions, maxAge: SESSION_SECONDS });
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Datos de acceso inválidos.' }, { status: 400, headers });
    return NextResponse.json({ error: 'No se pudo iniciar sesión. Intenta de nuevo.' }, { status: 503, headers });
  }
}
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403, headers });
  await revokeAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  const response = NextResponse.json({ authenticated: false }, { headers });
  response.cookies.set(ADMIN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return response;
}
