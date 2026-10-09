import { cookies } from 'next/headers';
import { cache } from 'react';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, findAdminSession, isSameOrigin } from './session';
export const getAdminSession = cache(async () => findAdminSession((await cookies()).get(ADMIN_COOKIE)?.value));
export async function adminApiGuard(request?: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Ingresa las credenciales del administrador.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  if (request && !isSameOrigin(request)) return NextResponse.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  return null;
}
