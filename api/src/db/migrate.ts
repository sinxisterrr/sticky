import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { db } from './db';

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await db.query(sql);
  console.log('Migration complete');
  await db.end();
}

migrate().catch(err => { console.error(err); process.exit(1); });
