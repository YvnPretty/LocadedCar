import { existsSync, appendFileSync, readdirSync, mkdirSync, openSync, closeSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true);
if (!process.env.DATABASE_URL) {
  const candidates = ['.', 'prisma', 'prisma/prisma'].flatMap(dir => existsSync(dir) ? readdirSync(dir).filter(file => /\.(db|sqlite|sqlite3)$/.test(file)).map(file => `${dir}/${file}`) : []);
  if (candidates.length > 1) {
    console.error('Hay varias bases SQLite. Defina DATABASE_URL en .env para elegir la correcta.');
    process.exit(1);
  }
  const database = candidates[0] ? `file:${resolve(candidates[0])}` : 'file:./dev.db';
  appendFileSync('.env', `\nDATABASE_URL="${database}"\n`);
  process.env.DATABASE_URL = database;
  console.log('Configuración local de base de datos preparada.');
}
// Create a missing SQLite file without overwriting an existing database.
if (process.env.DATABASE_URL.startsWith('file:')) {
  const databasePath = resolve('prisma', process.env.DATABASE_URL.slice(5).split('?')[0]);
  mkdirSync(dirname(databasePath), { recursive: true });
  if (!existsSync(databasePath)) closeSync(openSync(databasePath, 'ax'));
}
for (const args of [['generate'], ['db', 'push'], ['db', 'seed']]) {
  const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', ...args], { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status || 1);
}
