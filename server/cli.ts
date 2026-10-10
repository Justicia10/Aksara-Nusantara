import 'dotenv/config';
import { join } from 'node:path';
import { openDb } from './db';
import { ensureAdmin, seedContent } from './seed';

const [cmd, ...args] = process.argv.slice(2);
const db = openDb(process.env.DATABASE_PATH || join(process.cwd(), 'data', 'ngm.db'));

switch (cmd) {
  case 'seed':
    console.log(seedContent(db).seeded ? 'seeded' : 'already seeded (use "seed --reset" to wipe and re-seed)');
    break;
  case 'seed:reset':
    seedContent(db, { reset: true });
    console.log('database reset and re-seeded');
    break;
  case 'admin': {
    const email = args[0] || process.env.ADMIN_EMAIL;
    const password = args[1] || process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('Usage: npm run admin:create -- <email> <password>   (or set ADMIN_EMAIL / ADMIN_PASSWORD)');
      process.exit(1);
    }
    if (password.length < 10) {
      console.error('Password must be at least 10 characters.');
      process.exit(1);
    }
    const r = ensureAdmin(db, email, password, { resetPassword: true });
    console.log(r.created ? `admin created: ${email}` : `admin password reset: ${email}`);
    break;
  }
  default:
    console.error('Commands: seed | seed:reset | admin <email> <password>');
    process.exit(1);
}
