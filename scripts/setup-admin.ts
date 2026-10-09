import { randomBytes } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/admin/password';
const prisma = new PrismaClient();
async function main() {
  const [username, destination] = process.argv.slice(2);
  if (!username || !destination || !/^[a-z0-9._-]{3,64}$/.test(username)) throw new Error('Uso: npm run admin:setup -- usuario /ruta/privada/acceso.txt');
  if (await prisma.adminAccount.findUnique({ where: { username } })) throw new Error('Ese administrador ya existe. No se modificó su contraseña.');
  const password = randomBytes(24).toString('base64url');
  const path = resolve(destination);
  await writeFile(path, `Acceso de administrador · LocadedCar\n\nUsuario: ${username}\nContraseña: ${password}\n\nEntra en Admin desde tu página. Sesión de 30 minutos.\nGuarda estos datos en tu gestor de contraseñas y elimina este archivo cuando ya no lo necesites.\nEsta cuenta pertenece a la base de datos donde se ejecutó la configuración.\n`, { mode: 0o600, flag: 'wx' });
  try { await prisma.adminAccount.create({ data: { username, passwordHash: await hashPassword(password) } }); }
  catch (error) { await unlink(path); throw error; }
  console.log('Cuenta creada. Credenciales guardadas únicamente en el archivo privado indicado.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
